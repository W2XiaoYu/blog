---
title: 用 Gin 搭一个接口服务
description: Gin 服务的骨架与惯例：参数绑定与校验、统一响应、中间件、JWT 鉴权、优雅关闭，以及 handler、service、model 的分层配合。
---

# 用 Gin 搭一个接口服务

[分佣篇](./database-design/direct-invite-commission)「接到 Gin 里」那一节直接给了一个 handler：`ShouldBindJSON` 校验参数，`errors.Is` 把业务错误翻译成 400，`c.Error` 把真错误交给日志。那篇默认你已经会把一个 Gin 服务搭起来。这篇补齐剩下的部分：服务怎么启动关闭、参数怎么校验、中间件怎么排、登录态怎么传。

数据库侧的写法（`WithContext`、事务、错误惯例）在 [GORM 篇](./gorm)里，两篇拼起来，前面几篇设计文的业务代码就能原样跑在一个服务里。

## 先把服务跑起来，再谈优雅关闭

最小可跑的版本：

```go
func main() {
    r := gin.Default() // Logger + Recovery 两个中间件
    r.GET("/healthz", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"status": "ok"})
    })
    r.Run(":8080") // 图省事的写法，下面会换掉
}
```

`r.Run` 的问题是不管在途请求直接退。发版时 `kill` 一下，正在下单的用户收到连接重置，事务写到一半的请求也被掐断。正式写法把 `gin.Engine` 交给 `http.Server`，收到信号后给在途请求一段收尾时间：

```go
func main() {
    r := newRouter()

    srv := &http.Server{
        Addr:         ":8080",
        Handler:      r,
        ReadTimeout:  10 * time.Second,
        WriteTimeout: 15 * time.Second,
    }

    go func() {
        if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
            log.Fatalf("listen: %v", err)
        }
    }()

    quit := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
    defer quit.Stop()
    <-quit.Done() // 阻塞到 Ctrl+C 或 kill

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    if err := srv.Shutdown(ctx); err != nil {
        log.Printf("forced shutdown: %v", err)
    }
}
```

`Shutdown` 会等在途请求处理完（最多等 10 秒），不再接新请求。配合前面 GORM 篇说的 `c.Request.Context()`，客户端取消的查询也会被收回，两边一起把"发版丢请求"这件事消掉。

两个 `Timeout` 也带上。不设的话，慢客户端能把连接一直占着，连接数就被这种连接吃光了。

## 参数绑定：JSON、Query、Uri 三件套

同一个请求结构体，三种来源，三种 tag：

```go
// POST /orders 的 body：{"sku_id": 1, "quantity": 2}
type CreateOrderRequest struct {
    SkuID    int64 `json:"sku_id" binding:"required,gt=0"`
    Quantity int32 `json:"quantity" binding:"required,gt=0,lt=100"`
}

// GET /products?page=1&size=20 的查询串
type PageQuery struct {
    Page int `form:"page" binding:"required,gte=1"`
    Size int `form:"size" binding:"required,gte=1,lte=100"`
}

// GET /orders/:id 的路径参数
type OrderURI struct {
    ID int64 `uri:"id" binding:"required,gt=0"`
}
```

handler 里对应三个 `ShouldBind`：

```go
var req CreateOrderRequest
if err := c.ShouldBindJSON(&req); err != nil { // body
var q PageQuery
if err := c.ShouldBindQuery(&q); err != nil { // ?page=1&size=20
var u OrderURI
if err := c.ShouldBindUri(&u); err != nil { // /orders/123
```

校验规则写在 `binding` tag 里，常用的就这几个：`required`、`gt/gte/lt/lte`（数值比较）、`min/max`（字符串长度）、`oneof`（枚举，`oneof=draft listed`）、`email`。规则不够用再注册自定义校验器，别在 handler 里堆 `if`——tag 里的规则声明一次，绑定处自动生效。

为什么用 `ShouldBindJSON` 而不是 `BindJSON`：`Bind` 校验失败时会自己写一个 400 响应，响应格式不受你控制，后面统一响应结构时它会成为漏网之鱼。`ShouldBind` 系列只返回 error，怎么响应由你决定。

校验错误的默认信息是一串 `Key: 'CreateOrderRequest.Quantity' Error:Field validation for 'Quantity' failed on the 'lt' tag`，直接给前端没法看。翻译成字段级提示：

```go
func BindError(c *gin.Context, err error) {
    var ve validator.ValidationErrors
    if errors.As(err, &ve) {
        msgs := make([]string, 0, len(ve))
        for _, fe := range ve {
            msgs = append(msgs, translateField(fe))
        }
        c.JSON(http.StatusBadRequest, gin.H{"message": strings.Join(msgs, "；")})
        return
    }
    c.JSON(http.StatusBadRequest, gin.H{"message": "参数格式不正确"})
}

// sku_id gt=0 → "sku_id 必须大于 0"；quantity lt=100 → "quantity 必须小于 100"
func translateField(fe validator.FieldError) string {
    field := toSnakeCase(fe.Field())
    switch fe.Tag() {
    case "required":
        return field + " 不能为空"
    case "gt", "gte", "lt", "lte":
        return fmt.Sprintf("%s 必须%s %s", field, cmpText(fe.Tag()), fe.Param())
    case "oneof":
        return field + " 只能是 " + fe.Param() + " 之一"
    default:
        return field + " 不合法"
    }
}
```

`translateField` 按自己项目的字段命名习惯写，中心思想就一个：**校验错误的提示落到具体字段**，"参数错误"四个字帮不了前端定位是哪个参数。

## 统一响应和错误映射

先把响应结构定下来，全服务一个口径：

```go
// 成功：{"code": 0, "message": "ok", "data": {...}}
// 失败：{"code": 40401, "message": "商品不存在"}
func OK(c *gin.Context, data any) {
    c.JSON(http.StatusOK, gin.H{"code": 0, "message": "ok", "data": data})
}

func Fail(c *gin.Context, status int, code int, msg string) {
    c.JSON(status, gin.H{"code": code, "message": msg})
}
```

比裸 `gin.H{"data": ...}` 强的地方在失败侧：前端拿 `code` 做分支，`message` 直接展示，不用从 HTTP 状态码里猜语义。

错误怎么从 service 流到这个结构，分佣篇的 handler 已经是完整样板，展开讲讲里面的分工：

```go
err := order.CreateOrder(c.Request.Context(), db, userID, req.SkuID, req.Quantity)
switch {
case err == nil:
    OK(c, gin.H{"order_id": orderID})
case errors.Is(err, order.ErrProductNotFound):
    Fail(c, http.StatusNotFound, 40401, "商品不存在")
case errors.Is(err, order.ErrInsufficientStock):
    Fail(c, http.StatusConflict, 40901, "库存不足")
default:
    c.Error(err) // 挂到上下文，访问日志里会带出来
    Fail(c, http.StatusInternalServerError, 50000, "服务开小差了，请稍后再试")
}
```

service 层返回的是**语义错误**——`ErrProductNotFound`、`ErrInsufficientStock` 这些 sentinel，用 `fmt.Errorf("...: %w", err)` 包装也不丢。handler 的全部工作是把语义翻译成 HTTP： NotFound 对 404，状态冲突对 409，参数问题对 400。这个 `switch` 就是 service 和 HTTP 的唯一交界处。

`default` 分支两个细节。`c.Error(err)` 不写响应，只把错误挂到 `gin.Context` 上，访问日志中间件统一收集，省得每个 handler 自己 `log.Printf`。给用户的话术是固定的"稍后再试"——数据库连接断了、磁盘满了这类内部错误，细节写进日志就好，响应里带出去既是废话也可能泄露部署信息。

GORM 的 `gorm.ErrRecordNotFound` 不应该出现在这个 `switch` 里。它在 service 层就该被消化掉，换成自己的 `ErrProductNotFound`（GORM 篇「查询」一节的处理惯例）。handler 认识的错误清单 = service 导出的 sentinel 清单，多一层都算越界。

## 中间件：顺序就是语义

`gin.Default()` 已经带了 `Logger` 和 `Recovery`。前者打访问日志，后者把 panic 转成 500，不让一个 handler 的崩溃带走整个进程——生产上这是底线，必须确认在。

自己写中间件的样板，一个带耗时和错误收集的访问日志：

```go
func AccessLog() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next() // 先放行，等后面的 handler 跑完

        errs := c.Errors.ByType(gin.ErrorTypePrivate)
        errStr := ""
        if len(errs) > 0 {
            errStr = errs[0].Err.Error() // 上一节 c.Error(err) 挂进来的
        }
        log.Printf("%s %s %d %s %s",
            c.ClientIP(),
            c.Request.URL.Path,
            c.Writer.Status(),
            time.Since(start),
            errStr,
        )
    }
}
```

`c.Next()` 是分界线：之前的代码在请求进入时执行，之后的代码在 handler 结束后执行。要拦截请求（鉴权失败、限流触发），在 `c.Next()` 之前调 `c.AbortWithStatusJSON` 并 `return`，后面的中间件和 handler 都不会再跑。

CORS 用 `gin-contrib/cors`：

```go
import "github.com/gin-contrib/cors"

r.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"https://shop.example.com"}, // 带凭证时绝不能写 *
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
    AllowHeaders:     []string{"Authorization", "Content-Type"},
    AllowCredentials: true,
}))
```

排中间件时把自己当请求走一遍：`Recovery` 最外层兜底；`AccessLog` 紧随其后，能记到所有请求包括被中间件拦下的；`CORS` 在鉴权之前，不然预检请求先被 401 打回去，浏览器控制台一片红；`AuthRequired` 只挂在需要登录的路由组上。顺序错了症状都很怪，排查时先画一遍这条链。

## 登录态：JWT 签发与校验

用 `golang-jwt/jwt/v5`。登录成功后签发：

```go
type TokenIssuer struct {
    secret []byte // 从环境变量读，别进代码仓库
    ttl    time.Duration
}

func (t *TokenIssuer) Issue(userID, authVersion int64) (string, error) {
    claims := jwt.MapClaims{
        "user_id":      userID,
        "auth_version": authVersion, // 多账号篇的字段：密码改动、账号合并时 +1
        "exp":          time.Now().Add(t.ttl).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(t.secret)
}
```

`exp` 是 JWT 的标准声明，解析时库自动校验，过期即失效，不用自己比对时间。

校验放在中间件里，挂在需要登录的路由组上：

```go
func AuthRequired(t *TokenIssuer) gin.HandlerFunc {
    return func(c *gin.Context) {
        auth := c.GetHeader("Authorization")
        prefix := "Bearer "
        if !strings.HasPrefix(auth, prefix) {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "请先登录"})
            return
        }

        var claims jwt.MapClaims
        _, err := jwt.ParseWithClaims(strings.TrimPrefix(auth, prefix), &claims, func(tk *jwt.Token) (any, error) {
            // 白名单签名算法，防拿 none/RS256 算法构造的 token 骗过校验
            if _, ok := tk.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("unexpected signing method: %v", tk.Header["alg"])
            }
            return t.secret, nil
        })
        if err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "登录已过期，请重新登录"})
            return
        }

        userID := int64(claims["user_id"].(float64)) // JSON 数字解析后是 float64
        authVersion := int64(claims["auth_version"].(float64))

        var user model.User
        err = db.WithContext(c.Request.Context()).
            Select("id", "status", "auth_version").
            Take(&user, "id = ?", userID).Error
        if err != nil || user.Status != model.UserStatusActive || user.AuthVersion != authVersion {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "登录状态已失效"})
            return
        }

        c.Set("user_id", userID)
        c.Next()
    }
}
```

三处值得停一下。

**keyfunc 里校验签名算法。**`ParseWithClaims` 的第三个参数看起来只是给你返回密钥的钩子，但它同时是校验算法的地方。不白名单 `SigningMethodHMAC`，攻击者拿 `alg: none` 或换 RS256 的 token 来试，密钥校验的逻辑就可能被绕过。JWT 的老坑，一行代码的事，写上。

**`auth_version` 的比对。**token 里的版本和数据库里的不一致就拒绝。这样改密码、账号合并（多账号篇里都会 `auth_version + 1`）之后，所有旧 token 立刻作废，不用等七天过期。代价是每个带 token 的请求多一次用户表查询——按主键取三列，够便宜；要省的话给校验结果加个短缓存，别省掉这次核对。

**`c.Set("user_id", ...)` 是登录态的终点站。**分佣篇 handler 里那句 `c.GetInt64("user_id")` 取的就是这里放进去的值。handler 从不自己解析 token，也不信请求体里的用户 ID——"我是谁"只来自这一个入口，接口就不会有"改包 userID 就能看别人订单"这种洞。

浮点数那两行强转难看但是必须：claims 从 JSON 解出来，数字统一是 `float64`，直接 `.(int64)` 会 panic。

## 分层：handler 只做搬运

把前面的东西拼成目录，服务长这样：

```text
internal/
├── handler/     # HTTP 层：绑定参数、调 service、写响应
│   ├── order.go
│   └── auth.go
├── service/     # 业务层：事务、业务规则、sentinel error
│   ├── order.go
│   └── commission/
├── model/       # GORM Model
│   └── product.go
└── database/    # 连接与迁移
    └── open.go
main.go          # 组装：开连接、建路由、挂中间件、启动
```

依赖方向是单向的：handler 依赖 service，service 依赖 model，谁都不反过来 import handler。`db` 在 `main.go` 里建好，通过参数一路传进去——分佣篇的 `BindInviteHandler(db)` 就是这个写法，handler 是个返回 `gin.HandlerFunc` 的闭包，把依赖包在里面：

```go
func RegisterRoutes(r *gin.Engine, db *gorm.DB, issuer *TokenIssuer) {
    orders := r.Group("/orders")
    orders.Use(AuthRequired(issuer))
    {
        orders.POST("", CreateOrderHandler(db))
        orders.GET("/:id", GetOrderHandler(db))
    }
}

func CreateOrderHandler(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID := c.GetInt64("user_id")

        var req CreateOrderRequest
        if err := c.ShouldBindJSON(&req); err != nil {
            BindError(c, err)
            return
        }

        orderID, err := order.CreateOrder(c.Request.Context(), db, userID, req.SkuID, req.Quantity)
        switch {
        case err == nil:
            OK(c, gin.H{"order_id": orderID})
        case errors.Is(err, order.ErrProductNotFound):
            Fail(c, http.StatusNotFound, 40401, "商品不存在")
        case errors.Is(err, order.ErrInsufficientStock):
            Fail(c, http.StatusConflict, 40901, "库存不足")
        default:
            c.Error(err)
            Fail(c, http.StatusInternalServerError, 50000, "下单失败，请稍后再试")
        }
    }
}
```

`c.Request.Context()` 一路传进 service 再传给 `db.WithContext`，客户端断开时查询跟着取消——这条链路 GORM 篇讲过，这里是它的起点。

判分层是否干净的土办法：把 `handler/` 目录整个删掉，service 层应该照样能编译。service 里出现 `gin.Context`、`http.StatusOK` 任何一个，都说明 HTTP 的东西漏进了业务层，回不去改掉。业务代码是资产，HTTP 是外壳，外壳要能随时换（加 gRPC、给内部服务复用）而不动资产。

## 把这些场景跑一遍

- 少一个必填字段，返回 400，提示里带具体字段名；
- `page=0`、`size=999` 被拦截；
- 不带 token 访问 `/orders`，401，且不会进 handler；
- 过期 token、伪造签名的 token、`alg` 被改过的 token，全部 401；
- 用户改密码后，手里的旧 token 立刻 401；
- handler 里主动 panic，进程不死，客户端收到 500，日志里有堆栈；
- 并发下单库存 1 件的 SKU，一个 200 一个 409；
- 数据库断开时下单，响应是 500 和固定话术，访问日志里有 `c.Error` 挂进去的真实错误；
- `kill` 发版时，在途请求正常返回后才退出。

## 收尾

骨架就这些。参数绑定让校验声明在 tag 里、错误翻译落在字段上；响应结构全局一套，service 的 sentinel 错误到 handler 才变成 HTTP；中间件按「兜底、日志、CORS、鉴权」排序；登录态从 JWT 中间件进 context，handler 只取不猜。

这套惯例的价值在接口多起来之后：每个新 handler 都是同一个模子——绑定、调用、翻译——写第十个接口的速度和第一个差不多，review 时眼睛也只盯业务分支。Gin 本身没多少东西，把这几处交界（校验、错误、登录态）的口径定死，服务就立住了。
