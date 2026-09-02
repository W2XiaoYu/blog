---
title: GORM 常用写法与踩坑
description: GORM v2 配 PostgreSQL 的日常用法：连接与日志、更新零值的坑、Preload 与 Joins 的取舍、事务、锁、Hook 和软删除。
---

# GORM 常用写法与踩坑

写[多账号](./database-design/multi-account-auth-merge)、[分佣](./database-design/direct-invite-commission)、[SPU 与 SKU](./database-design/product-spu-sku)这三篇的时候，模型 tag、事务、`Preload`、`RowsAffected` 这些东西每篇都在用，但都是顺着业务带出来的，没展开讲。这篇把它们单独拎出来：为什么这么写，不这么写会踩什么坑。

示例还是用商品那几张表，环境是 GORM v2 + PostgreSQL。读完再回头看那三篇，代码里每个选择都有出处。

## 先把连接建对

```go
package database

import (
    "log"
    "os"
    "time"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

func Open(dsn string) (*gorm.DB, error) {
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
        Logger: logger.New(
            log.New(os.Stdout, "\r\n", log.LstdFlags),
            logger.Config{
                SlowThreshold:             200 * time.Millisecond,
                LogLevel:                  logger.Warn,
                IgnoreRecordNotFoundError: true,
            },
        ),
    })
    if err != nil {
        return nil, err
    }

    sqlDB, err := db.DB()
    if err != nil {
        return nil, err
    }
    sqlDB.SetMaxOpenConns(50)
    sqlDB.SetMaxIdleConns(10)
    sqlDB.SetConnMaxLifetime(time.Hour)
    return db, nil
}
```

几个参数值得说。

`IgnoreRecordNotFoundError: true` 建议打开。查一条记录不存在是正常业务（用户输错 ID），不打开的话每次 `First` 找不到都会在日志里打一条 ERROR，真正的错误反而被淹没。找不到就找不到，代码里 `errors.Is` 判断就行，后面讲查询时说。

连接池三个参数必须有默认值，不能吃 `database/sql` 的零值——`MaxOpenConns` 不设就是无上限，流量一上来连接数先把你打挂。数值按数据库能承受的连接数反推：一个服务 50，十个服务就是 500，PostgreSQL 默认 `max_connections` 才 100。

`db` 建一个就全局复用，它是并发安全的，别每个请求 `Open` 一次。每个请求要做的只是把上下文挂上去：

```go
db.WithContext(ctx).Find(&products)
```

`ctx` 的取消和超时会一路传到 SQL 执行层。在 Gin 里这个 `ctx` 就是 `c.Request.Context()`，客户端断开连接时查询会被一起取消，不会白白烧数据库。

## Model 上的规矩

完整的建模思路（约束怎么下沉、外键怎么配、状态机怎么用 CHECK 兜底）在多账号篇和 SPU 篇里讲得很细，这里只列几条贯穿所有表的硬规矩：

```go
type Product struct {
    ID         int64          `gorm:"primaryKey;autoIncrement"`
    CategoryID int64          `gorm:"not null;index:idx_products_category"`
    Name       string         `gorm:"size:255;not null;check:ck_products_name,BTRIM(name) <> ''"`
    Status     ProductStatus  `gorm:"type:varchar(16);not null;default:draft;check:ck_products_status,status IN ('draft','listed','delisted')"`

    Category *Category `gorm:"foreignKey:CategoryID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

    CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}
```

- 索引和约束都要显式命名。以后要删要改，`DROP INDEX idx_products_category` 一句话的事；GORM 自动生成的名字是 `idx_products_category_id` 这种拼接串，长得像又不一样，排查时折磨人。
- `CreatedAt`、`UpdatedAt` 是 GORM 约定的字段名，创建和更新时自动维护，不需要手填。
- 关联字段加 `json:"-"`。API 返回什么由 handler 决定，不能因为 Model 上挂了关联就一股脑序列化出去，既慢又容易把不该给前端的数据带出去。

还有一条容易忽略的：零值。`Status` 这类字段用 `string` 底层的自定义类型而不是 `*string`，配合 `default:draft`，`Create` 时不填就是草稿。什么时候该用指针，下一节更新零值时一起说。

## 查询：First、Take 和 ErrRecordNotFound

单条查询三个方法，行为不一样：

```go
db.First(&product, 100) // 按主键升序取第一条，WHERE id ORDER BY id LIMIT 1
db.Take(&product, 100)  // 不排序，WHERE id LIMIT 1
db.Last(&product, 100)  // 按主键降序，WHERE id ORDER BY id DESC LIMIT 1
```

都只该用来查"最多一条"的记录，找不到时返回 `gorm.ErrRecordNotFound`。想按你自己的条件排序时用 `Take`，`First` 会自作主张给你加一个 `ORDER BY id`，和后面 `Order()` 叠在一起，排序条件是冲突的。

处理 NotFound 的惯例在几篇设计文里反复出现：

```go
err := db.WithContext(ctx).Take(&product, "id = ?", productID).Error
if errors.Is(err, gorm.ErrRecordNotFound) {
    return nil, ErrProductNotFound // 换成语义明确的业务错误，往上翻译成 404
}
if err != nil {
    return nil, fmt.Errorf("take product: %w", err) // 真正的数据库错误，带着上下文往上抛
}
```

一个要留神的坑：`Find` 不返回 `ErrRecordNotFound`。下面这段代码查不到任何行时 `err` 是 `nil`：

```go
var product Product
err := db.Find(&product, "id = ?", productID).Error // 查不到，err == nil，product 是零值
```

零值 `Product` 的 `ID` 是 0，往下走可能安静地查出别的数据，也可能把 0 写进别的表。单条查询老老实实用 `Take` 或 `First`，让"没有这条记录"变成一个显式的错误分支。

列表查询的标准姿势是 `Count` 加 `Find`，分页时两条一起：

```go
var (
    total   int64
    products []model.Product
)
err := db.WithContext(ctx).Model(&model.Product{}).
    Where("status = ?", model.ProductStatusListed).
    Count(&total).Error
if err != nil {
    return nil, 0, err
}
err = db.WithContext(ctx).
    Where("status = ?", model.ProductStatusListed).
    Order("id DESC").
    Offset((page - 1) * size).Limit(size).
    Find(&products).Error
```

`Model(&Product{})` 加 `Count` 的组合里不需要 `Find`；去掉 `Model` 直接 `Count` 会不知道数哪张表。`Offset` 前记得把 `page` 校验成大于 0，`(page-1)*size` 算出负数时 `Offset(-10)` 会被当成没有 OFFSET，第一页的数据又回来了。

## 更新的零值坑

GORM 更新最大的坑就一个：**用结构体更新时，零值字段会被跳过**。

```go
// 想把商品下架，enabled 设为 false —— 没生效
db.Model(&sku).Updates(model.Sku{Enabled: false, Image: "new.jpg"})
// UPDATE skus SET image = 'new.jpg', updated_at = ... WHERE id = 1
```

`false`、`0`、`""` 都算零值，GORM 认为你是"没填这个字段"，不是"想把它清掉"。这个设计对表单提交是合理的，对后台管理接口就是暗雷。三个解法，按场景挑：

```go
// 解法一：用 map，写什么更新什么，最直白
db.Model(&sku).Updates(map[string]any{
    "enabled": false,
    "image":   "new.jpg",
})

// 解法二：Select 圈定字段，结构体里的零值也会更新
db.Model(&sku).Select("Enabled").Updates(model.Sku{Enabled: false})

// 解法三：字段本身定义成指针，nil 是"没填"，*bool(false) 是"明确填了 false"
type Sku struct {
    Enabled *bool `gorm:"not null;default:true"`
}
```

后台管理这种"字段多、改哪个说不好"的接口用解法三最省心；业务代码里目标明确的更新用解法一。SPU 篇扣库存那两行就是 map 加 `gorm.Expr`：

```go
result := tx.Model(&model.Sku{}).
    Where("id = ? AND enabled = TRUE AND stock >= ?", skuID, qty).
    Updates(map[string]any{
        "stock":      gorm.Expr("stock - ?", qty),
        "updated_at": time.Now(),
    })
```

`gorm.Expr` 让值原样进 SQL 表达式，`stock = stock - 1` 在数据库里算，不经过"读出来、减完、写回去"的来回。

再区分一对容易混的方法：`Updates` 会自动维护 `updated_at`、触发 Hook；`UpdateColumn` 两样都跳过。SPU 篇刷新 `min_price` 用的就是 `UpdateColumn`——那是一个纯粹的冗余字段同步，改它不算"商品被编辑过"，没必要推着 `updated_at` 往前走。记不清时先用 `Updates`，确有"不想动 updated_at"的理由再换。

## Preload 与 Joins：两条 SQL 还是一条

关联数据怎么查，是 GORM 里最值得单独讲的一块。两种方式，机制完全不同。

`Preload` 是两条 SQL：先查主表，收集主键，再用 `WHERE product_id IN (...)` 把关联行一次捞回来，在内存里拼好：

```go
// 第一条：SELECT * FROM products WHERE id = 1
// 第二条：SELECT * FROM skus WHERE product_id = 1 AND enabled = TRUE
db.Preload("Skus", "enabled = TRUE").
    Take(&product, "id = ?", productID)
```

一对多用它。列表页查 20 个商品带出各自的 SKU，也就两条 SQL，第二条的 `IN` 里有 20 个 ID，比循环查 20 次好得多。条件除了字符串还能传函数，要排序、要再限制列时用函数形式：

```go
db.Preload("Skus", func(db *gorm.DB) *gorm.DB {
    return db.Where("enabled = TRUE").Order("id")
}).Find(&products)
```

嵌套关联写点分路径：`Preload("Category.Parent")` 一路带出来。

`Joins` 预加载是一条 SQL，但只支持 `belongs to` 和 `has one` 这种"多对一/一对一"：

```go
db.Joins("Category").Find(&products)
// SELECT products.*, "Category".* FROM products LEFT JOIN categories AS "Category" ...
```

一条 SQL 出所有字段，省一次往返。代价是**列名会撞**。两张表都有 `id`、`name`、`status`，直接 `Joins` 出来的结果里谁覆盖谁说不清。SPU 篇下单时取 SKU 连带商品名的写法，就是处理这个歧义的样板：

```go
err := tx.
    Select("skus.*", "products.name AS product_name", "products.status").
    Joins("JOIN products ON products.id = skus.product_id").
    Take(&sku, "skus.id = ?", skuID).Error
```

显式 `Select`，主表用 `skus.*`，关联表要用的列起别名；`Take` 的条件也要带上表名前缀，`"skus.id = ?"`，不然 PostgreSQL 直接报 `column reference "id" is ambiguous`。

什么时候用哪个，一句话：**多对一且只要单条关联，Joins 省一次查询；一对多，Preload**。`Joins` 出来的 `sku.Product.Name` 是 SQL 里 JOIN 的副产品，改不了过滤条件也带不动排序，别硬掰；真要复杂条件，回到 `Preload` 的函数形式，或者拆成两次查询——两次简单查询比一条看不懂的 JOIN 好维护。

## 事务：闭包够用，嵌套是 SavePoint

日常写法就一种，闭包：

```go
err := db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
    if err := tx.Create(&product).Error; err != nil {
        return fmt.Errorf("create product: %w", err) // 返回 error，整个事务回滚
    }
    if err := createSkus(tx, product.ID, combos); err != nil {
        return err
    }
    return nil // 返回 nil，提交
})
```

返回 `nil` 提交，返回 `error` 回滚，panic 也会被 recover 后回滚。不用记 `Commit`、`Rollback` 的配对，不会漏。

闭包里最容易犯的错是**用了外层的 `db`**：

```go
err := db.Transaction(func(tx *gorm.DB) error {
    if err := tx.Create(&order).Error; err != nil {
        return err
    }
    return db.Create(&item).Error // 错：这条不在事务里！
})
```

`db.Create` 自己开连接执行，事务回滚时它不跟着回，库存扣了订单却没了。闭包参数 `tx` 才是事务本身，里面所有查询都得用它。这也是 SPU 篇的 `DeductStock` 把 `tx *gorm.DB` 作为参数的原因——同一个函数，事务外传 `db`，事务里传 `tx`，两种场景都不破坏。

嵌套的 `Transaction` 不会开新事务，而是在当前事务里建 SavePoint，内层失败回滚到 SavePoint，外层还能决定整体是提交还是回滚。service 层各自包事务、上层再包一个大事务时，靠这个语义自然组合，不用刻意拆。

两个偏配置的点。其一，GORM 默认把单条 `Create`/`Update` 也包在事务里（写多张表时保证原子），大批量插入嫌慢可以 `gorm.Config{ SkipDefaultTransaction: true }` 关掉，日常业务感觉不到差别。其二，手工 `Begin()`/`Commit()` 几乎用不上——跨好几次请求的长事务更是想都别想，HTTP 是无状态的，连接攥在手里既占连接池又容易锁表，跨请求的一致性用状态机加幂等去做，分佣篇的结算流程就是例子。

## 锁：能合并成一条 UPDATE，就别 SELECT FOR UPDATE

扣库存这件事，SPU 篇的做法是一条带条件的 UPDATE：

```go
result := tx.Model(&model.Sku{}).
    Where("id = ? AND enabled = TRUE AND stock >= ?", skuID, qty).
    Updates(map[string]any{"stock": gorm.Expr("stock - ?", qty)})
if result.RowsAffected == 0 {
    return ErrInsufficientStock
}
```

判断条件（`stock >= qty`）写进 `WHERE`，判断和修改在数据库里一步完成，行锁只活在这一条 SQL 里。`RowsAffected` 为 0 就是条件没满足，不存在"读到旧值、判断完库存被别人抢走"的窗口。

但有的逻辑合并不成一条 SQL。账号合并要先读两个账号的状态、各自算一遍迁移清单，再决定写什么——"读、判断、写"是三步，中间不能让别人插手，这时候才用悲观锁：

```go
import "gorm.io/gorm/clause"

var users []model.User
err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
    Where("id IN ?", []int64{sourceID, targetID}).
    Order("id"). // 固定加锁顺序，防死锁
    Find(&users).Error
// SELECT * FROM users WHERE id IN (...) ORDER BY id FOR UPDATE
```

锁住的行，别的事务的 `FOR UPDATE` 也得等。两个要点跟着这段代码：

- **加锁前想清楚锁哪些行、锁多久**。锁的范围越小越好，`WHERE` 条件带上主键或唯一索引，别让数据库顺索引扫一大片；锁住之后尽快提交，别在锁里调外部接口。
- **多行加锁按固定顺序**（比如按 ID 升序）。A 先锁 1 再锁 2，B 先锁 2 再锁 1，就是教科书死锁。上面 `Order("id")` 不是为了好看。

抢锁怕等太久，加 `Options`：`clause.Locking{Strength: "UPDATE", Options: "NOWAIT"}` 拿不到锁立刻报错，`"SKIP LOCKED"` 拿不到就跳过——后台任务扫队列时好用，同一批数据两个实例同时扫，`SKIP LOCKED` 让它们天然不撞车。

一句话收拢：**判断能进 `WHERE`，用条件 UPDATE；判断是一段 Go 代码，用 `FOR UPDATE` 把读和写之间的门关上**。先想第一种，实在写不进去再用第二种。

## Hook：能用默认值和显式调用解决的，别用 Hook

Hook 是 Model 上挂的回调，事务执行到相应时机被调用：

```go
func (p *Product) BeforeCreate(tx *gorm.DB) error {
    if p.Status == "" {
        p.Status = ProductStatusDraft
    }
    return nil
}

func (o *Order) AfterCreate(tx *gorm.DB) error {
    // 走到这里 o.ID 已经填好，可以拿去写关联表或打日志
    return nil
}
```

`BeforeCreate` 改的还是即将写入的字段；`AfterCreate` 时自增 ID 已经回填。`BeforeSave` 同时覆盖创建和更新。

我的态度写在标题里：少用。理由有三。

**它是隐式的。**代码里 `tx.Create(&product)` 一行，背后还藏着一段逻辑。三个月后排查"这个字段怎么被改了"，grep 遍所有 `Create` 调用也找不到，因为它在 Model 文件里。默认值有 `default:draft` tag，字段填充有显式的 `normalize()` 函数，都比 Hook 好找。

**它在事务里执行。**`BeforeCreate` 里发一个 HTTP 请求、等一个慢 IO，锁和连接都被拖着，事务超时、连接池被占满都是这么来的。要做事后动作，用事务外的显式代码，失败了还有补偿的机会。

**它和更新方法有交互。**`UpdateColumn` 不触发 Hook，`Updates(map)` 触发的是 `BeforeUpdate`（注意 map 形式下 Hook 里拿不到完整的旧结构体）。同一个 Model，不同入口行为不一样，心智负担不小。

真适合 Hook 的场景不多，日志审计类（每张表都要记 `created_by` 这种）算一个，比在每个 `Create` 前手写一行强。

## 软删除：方便，但和唯一索引打架

GORM 的软删除只要一个字段类型：

```go
import "gorm.io/gorm"

type Tag struct {
    ID   int64 `gorm:"primaryKey;autoIncrement"`
    Name string `gorm:"size:64;not null;uniqueIndex:uq_tags_name"`
    // 查询和更新自动加 WHERE deleted_at IS NULL
    // Delete 变成 UPDATE tags SET deleted_at = now()
    DeletedAt gorm.DeletedAt `gorm:"index:idx_tags_deleted_at"`
}
```

`Delete` 不再发 `DELETE`，而是填 `deleted_at`；所有查询自动过滤掉已删行。对"后台删错了想找回"很友好。

但两个问题要想清楚再上。

**唯一索引不认识软删。**`Name` 上挂着全表唯一，把"春季新款"删了（软删），再建一个同名标签，`uq_tags_name` 拦住你——软删那行还躺在表里。解法是把唯一约束改成部分索引：

```go
Name string `gorm:"size:64;not null;uniqueIndex:uq_tags_name,where:deleted_at IS NULL"`
```

只对未删行生效，删掉的不管。每个带唯一约束的软删字段都要记得这一笔。

**数据是真想删，还是只是不该再被用到？**这是业务问题。三篇设计文里全都没用软删除，而是用状态：SKU 停用是 `Enabled = false`，账号合并是 `Status = merged`，邀请码作废是 `disabled`。状态的好处是语义明确（"停用"和"删除"是两件事，购物车里的停用 SKU 还要展示呢），能参与 CHECK 约束和状态机，也不会让唯一索引难做。软删除更像一把全局开关，适合"删了就是删了、偶尔要救回来"的 CMS 类数据。两者别混着用——一张表既软删又有状态字段，"删了"和"停用"的边界没人说得清。

## SQL 不对时怎么查

写 GORM 最常见的调试场景：结果不对，不知道它发了什么 SQL。

平时靠 Logger，`logger.Config` 里 `LogLevel` 开到 `logger.Info`，每条 SQL 带参数带耗时打出来，本地开发全程开着没坏处。

只想要 SQL 不想执行（拼好了拿去 EXPLAIN，或确认生成逻辑）用 DryRun：

```go
stmt := db.Session(&gorm.Session{DryRun: true}).
    Where("status = ?", model.ProductStatusListed).
    Find(&[]model.Product{}).Statement

fmt.Println(stmt.SQL.String()) // SELECT * FROM "products" WHERE status = $1
fmt.Println(stmt.Vars)          // [listed]
```

慢查询定位靠 `SlowThreshold`，生产上 `LogLevel: logger.Warn` 只打慢的和报错的，日志量刚好。

## AutoMigrate 的边界

```go
err := db.AutoMigrate(&model.Category{}, &model.Product{}, &model.Sku{})
```

建表、加列、加索引、加约束，开发期一把梭，三篇设计文的表都是这么起的。但要知道它**只加不减不改**：删字段不删列，改类型不动手，缩列宽更是不理。开发到一半把 `size:255` 改成 `size:64`，AutoMigrate 静默成功，线上还是 255，哪天超长数据进来了才炸。

所以边界是：开发期随便用；上线后的结构变更写成带版本号的 migration（golang-migrate、goose 都行），每一步可审查、可回滚。SPU 篇和分佣篇建表那两节说的都是这条。

## 把这些场景跑一遍

- 单条查询查不到时，`Take` 返回 `ErrRecordNotFound`，`Find` 返回 `nil`——两种行为都符合预期；
- 把 `Enabled` 更新为 `false`，结构体方式没生效，map 和 `Select` 方式生效；
- `UpdateColumn` 之后 `updated_at` 没动，`Updates` 之后动了；
- 列表页 20 个商品带 SKU，日志里只有两条 SQL；
- 事务闭包里误用外层 `db` 的那条写入，回滚后依然存在——然后修掉它；
- 两个并发请求抢库存 1 件的 SKU，只有一个成功；
- 软删同名字段后重建，普通唯一索引报重复，部分索引通过；
- `SlowThreshold` 之上的查询在 `Warn` 级别日志里能看到完整 SQL。

## 收尾

几条原则收拢一下：

- 找不到是业务分支，`errors.Is` 判出来往上翻译；单条查询用 `Take`/`First`，别用 `Find`；
- 更新写 `map` 或 `Select`，零值才不会丢；`gorm.Expr` 让计算回数据库；
- 一对多 `Preload`，多对一 `Joins` 带别名；
- 事务闭包里只用 `tx`，嵌套是 SavePoint；
- 判断能进 `WHERE` 就用条件 UPDATE，进不去才 `FOR UPDATE`，多行加锁按固定顺序；
- Hook 少用，软删慎用，AutoMigrate 不出开发环境。

这些不是背下来的规矩，是每一条都对应一次排查。GORM 的心智模型对了，三篇设计文里的代码可以照抄着往前写。
