---
title: 用 GORM 设计商品 SPU 与 SKU
description: 商城商品 SPU/SKU 的 PostgreSQL 表设计，从规格组合、SKU 自动生成写到库存扣减和订单快照。
---

# 用 GORM 设计商品 SPU 与 SKU

商城要上架商品，第一个坎不是建表，而是分清两件事：商品和规格。后台运营填了一个"连帽卫衣"，规格选了颜色（黑、白）和尺码（M、L），价格却填不出——黑色 M 卖 129，白色 M 打折卖 99。被买走的是"黑色 M 的卫衣"，不是"连帽卫衣"本身。

这两层在电商里就是 SPU 和 SKU：

```text
SPU  连帽卫衣（商品）
├── SKU  黑色 / M    129 元  库存 30
├── SKU  黑色 / L    129 元  库存 24
├── SKU  白色 / M     99 元  库存 10
└── SKU  白色 / L    129 元  库存 0（售罄）
```

商品详情页、搜索、分类走 SPU；购物车、订单、库存、退款全部落在 SKU 上。表设计跟着这条边界走就行。

规则说起来一句，写进系统要回答的问题不少：规格组合重复了怎么办，改价影不影响已下的订单，库存怎么扣才不会超卖，后台删掉一个规格组合、已经买过的人退款怎么办。下面用 GORM v2 和 PostgreSQL 把这些问题一个一个落掉。Model 放 `internal/model/product.go`，业务代码放 `internal/service/product.go`。

## 表就三张，各管一件事

| 表 | 用来做什么 |
| --- | --- |
| `categories` | 商品分类，两级够用 |
| `products` | SPU，商品名称、详情、规格模板这些展示信息 |
| `skus` | 可售卖的规格组合，价格、库存在这里 |

不需要更多了。价格、库存、规格图都长在 SKU 上，SPU 只管"这个东西是什么、长什么样"。以后有人问"这个 SKU 卖多少钱、还剩几件"，一张表查出来；问"这个商品有哪些规格"，看 `products.specs` 模板。

### GORM Model

```go
package model

import (
    "time"

    "gorm.io/datatypes"
)

type ProductStatus string

const (
    ProductStatusDraft    ProductStatus = "draft"    // 草稿，前台不可见
    ProductStatusListed   ProductStatus = "listed"   // 在售
    ProductStatusDelisted ProductStatus = "delisted" // 下架
)

// Category 只做两级，ParentID 为 0 是一级分类。
type Category struct {
    ID       int64  `gorm:"primaryKey;autoIncrement"`
    ParentID int64  `gorm:"not null;default:0;index:idx_categories_parent"`
    Name     string `gorm:"size:64;not null;check:ck_categories_name,BTRIM(name) <> ''"`
    Sort     int32  `gorm:"not null;default:0"`
    Enabled  bool   `gorm:"not null;default:true"`

    CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}

// Product 是 SPU，只放"展示"相关的信息。
// Specs 是规格模板，长这样：
// [{"name":"颜色","values":["黑色","白色"]},{"name":"尺码","values":["M","L"]}]
type Product struct {
    ID         int64  `gorm:"primaryKey;autoIncrement"`
    CategoryID int64  `gorm:"not null;index:idx_products_category"`
    Name       string `gorm:"size:255;not null;check:ck_products_name,BTRIM(name) <> ''"`
    Subtitle   string `gorm:"size:255;not null;default:''"`
    MainImage  string `gorm:"size:512;not null;default:''"`
    DetailHTML string `gorm:"type:text;not null;default:''"`

    Specs datatypes.JSON `gorm:"type:jsonb;not null;default:'[]';check:ck_products_specs,jsonb_typeof(specs) = 'array'"`

    // 列表页要展示"99 元起"，冗余一份最低价，SKU 变价时刷新。
    MinPrice int64 `gorm:"not null;default:0;check:ck_products_min_price,min_price >= 0"`

    Status ProductStatus `gorm:"type:varchar(16);not null;default:draft;index:idx_products_status;check:ck_products_status,status IN ('draft','listed','delisted')"`

    Category *Category `gorm:"foreignKey:CategoryID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`
    Skus     []Sku     `gorm:"foreignKey:ProductID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

    CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}

// Sku 是真正被购买的东西。价格单位是分，库存用 int32 足够。
type Sku struct {
    ID        int64 `gorm:"primaryKey;autoIncrement"`
    ProductID int64 `gorm:"not null;uniqueIndex:uq_skus_spec_combo,priority:1"`

    // Specs 记录这个 SKU 的规格取值：
    // {"颜色":"黑色","尺码":"M"}
    Specs datatypes.JSON `gorm:"type:jsonb;not null;uniqueIndex:uq_skus_spec_combo,priority:2;check:ck_skus_specs,jsonb_typeof(specs) = 'object'"`

    SkuCode     string `gorm:"size:64;not null;default:'';index:idx_skus_code"`
    Image       string `gorm:"size:512;not null;default:''"` // 规格图，黑色一件白色一件
    Price       int64  `gorm:"not null;check:ck_skus_price,price >= 0"`
    MarketPrice int64  `gorm:"not null;default:0;check:ck_skus_market_price,market_price >= 0"`
    Stock       int32  `gorm:"not null;default:0;check:ck_skus_stock,stock >= 0"`

    Enabled bool `gorm:"not null;default:true"`

    Product *Product `gorm:"foreignKey:ProductID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

    CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}
```

几个设计点单独说明。

规格模板放 `products.specs`（JSONB），不在数据库里再拆"规格名表 + 规格值表"。拆表的好处是能全局检索"所有红色的商品"，中小商城用不上这个，代价却是两张表加一堆 join。真到了需要的那天，再从 JSONB 迁出去也不迟，业务代码里读模板的地方只有一处。

`(product_id, specs)` 上的唯一索引挡住重复组合。PostgreSQL 的 jsonb 比较键序无关，`{"颜色":"黑","尺码":"M"}` 和 `{"尺码":"M","颜色":"黑"}` 算同一个值，Go 侧不用刻意排序。要注意的只有一点：写入前把规格值 BTRIM 干净，`"M"` 和 `"M "` 在 jsonb 里是两个不同的字符串。

`stock >= 0` 的 CHECK 是最后一道闸。业务代码写得再糙，数据库也不允许出现负库存。

金额照旧用 `int64` 存分，和前两篇的口径一致，不做浮点运算。

## 先把表建起来

```go
package database

import (
    "gorm.io/gorm"

    "your/module/internal/model"
)

func MigrateProduct(db *gorm.DB) error {
    return db.Transaction(func(tx *gorm.DB) error {
        return tx.AutoMigrate(
            &model.Category{},
            &model.Product{},
            &model.Sku{},
        )
    })
}
```

分类表不放默认数据，后台自己建。开发阶段 `AutoMigrate` 够用，上线后的结构变更还是写成带版本号的 migration，原因前面两篇都说过了。

## 从规格模板生成 SKU

后台保存商品时，拿到规格模板，把所有组合展开成 SKU。两个规格、各两个取值，就是四个 SKU：

```go
type SpecOption struct {
    Name   string
    Values []string
}

// BuildSkuSpecs 展开笛卡尔积：
// 颜色[黑,白] × 尺码[M,L] → [{黑,M},{黑,L},{白,M},{白,L}]
func BuildSkuSpecs(options []SpecOption) []map[string]string {
    combos := []map[string]string{{}}
    for _, opt := range options {
        var next []map[string]string
        for _, combo := range combos {
            for _, value := range opt.Values {
                item := make(map[string]string, len(combo)+1)
                for k, v := range combo {
                    item[k] = v
                }
                item[opt.Name] = value
                next = append(next, item)
            }
        }
        combos = next
    }
    return combos
}
```

创建商品时在一个事务里写 SPU 和全部 SKU：

```go
type CreateProductInput struct {
    CategoryID  int64
    Name        string
    Subtitle    string
    MainImage   string
    DetailHTML  string
    SpecOptions []SpecOption
    BasePrice   int64
}

func CreateProduct(
    ctx context.Context,
    db *gorm.DB,
    input CreateProductInput,
) (*model.Product, error) {
    if len(input.SpecOptions) == 0 {
        return nil, fmt.Errorf("at least one spec option is required")
    }
    for _, opt := range input.SpecOptions {
        if len(opt.Values) == 0 {
            return nil, fmt.Errorf("spec %s has no values", opt.Name)
        }
    }

    specsTemplate, err := json.Marshal(input.SpecOptions)
    if err != nil {
        return nil, fmt.Errorf("marshal specs template: %w", err)
    }

    product := model.Product{
        CategoryID: input.CategoryID,
        Name:       strings.TrimSpace(input.Name),
        Subtitle:   input.Subtitle,
        MainImage:  input.MainImage,
        DetailHTML: input.DetailHTML,
        Specs:      datatypes.JSON(specsTemplate),
        Status:     model.ProductStatusDraft,
    }

    err = db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        // 分类要先存在，外键拦不住随手填的分类 ID。
        var category model.Category
        err := tx.Take(&category, "id = ? AND enabled = TRUE", input.CategoryID).Error
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return fmt.Errorf("category not found")
        }
        if err != nil {
            return err
        }

        if err := tx.Create(&product).Error; err != nil {
            return fmt.Errorf("create product: %w", err)
        }

        minPrice := int64(-1)
        for _, combo := range BuildSkuSpecs(input.SpecOptions) {
            specsJSON, err := json.Marshal(combo)
            if err != nil {
                return fmt.Errorf("marshal sku specs: %w", err)
            }

            sku := model.Sku{
                ProductID: product.ID,
                Specs:     datatypes.JSON(specsJSON),
                Price:     input.BasePrice, // 后台可以再逐个改价
                Enabled:   true,
            }
            if err := tx.Create(&sku).Error; err != nil {
                return fmt.Errorf("create sku: %w", err)
            }
            if minPrice < 0 || sku.Price < minPrice {
                minPrice = sku.Price
            }
        }

        product.MinPrice = minPrice
        return tx.Model(&product).UpdateColumn("min_price", minPrice).Error
    })
    if err != nil {
        return nil, err
    }

    return &product, nil
}
```

新商品先进 `draft`，运营补完图和详情、逐个核完价，再切 `listed` 上架。别省这个状态，直接上架一个没有图的商品，前台就是空白页。

## 修改规格时，只做增量

商品上架后难免改规格：白色不卖了，加一个加大码。规则只有一条——**不动老 SKU，只增改状态**：

- 新出现的组合：插入新 SKU；
- 还存在的组合：什么都不动，价格库存原样保留；
- 模板里删掉的组合：把对应 SKU 的 `Enabled` 设为 `false`，不要 `DELETE`。

第三个是重点。那个"白色 M"可能已经在别人的购物车里、在历史订单的快照里。物理删除之后，订单详情要展示规格时就得靠快照硬撑，购物车则直接丢了引用。停用就能两全：买不到了，但查得到。

改完规格后刷新一次 `products.min_price`，取该商品下 `enabled = TRUE` 的 SKU 最低价：

```go
func RefreshMinPrice(ctx context.Context, tx *gorm.DB, productID int64) error {
    var minPrice int64
    err := tx.Model(&model.Sku{}).
        Where("product_id = ? AND enabled = TRUE", productID).
        Select("COALESCE(MIN(price), 0)").
        Scan(&minPrice).Error
    if err != nil {
        return err
    }
    return tx.Model(&model.Product{}).
        Where("id = ?", productID).
        UpdateColumn("min_price", minPrice).Error
}
```

所有改 SKU 价格、增删组合的入口最后都调它一次，列表页的"99 元起"就不会说谎。

## 下单扣库存，一条 UPDATE 就够

扣库存不需要"先查库存、再判断、后更新"三步。一条带条件的 UPDATE，数据库行锁保证原子：

```go
var ErrInsufficientStock = errors.New("库存不足")

func DeductStock(
    ctx context.Context,
    db *gorm.DB,
    skuID int64,
    qty int32,
) error {
    if qty <= 0 {
        return fmt.Errorf("invalid quantity")
    }

    result := db.WithContext(ctx).Model(&model.Sku{}).
        Where("id = ? AND enabled = TRUE AND stock >= ?", skuID, qty).
        Updates(map[string]any{
            "stock":      gorm.Expr("stock - ?", qty),
            "updated_at": time.Now(),
        })
    if result.Error != nil {
        return result.Error
    }
    if result.RowsAffected == 0 {
        return ErrInsufficientStock // SKU 不存在、已停用或库存不够
    }
    return nil
}
```

`WHERE stock >= ?` 不满足时这行根本不会被锁住更新，`RowsAffected` 为 0，直接告诉用户"库存不足"。两个请求同时抢最后一件，数据库天然只放一个过去，不需要在 Go 里加锁。

取消订单回补库存同样一条 UPDATE，方向反过来：

```go
result := tx.Model(&model.Sku{}).
    Where("id = ?", skuID).
    Updates(map[string]any{
        "stock":      gorm.Expr("stock + ?", qty),
        "updated_at": time.Now(),
    })
```

回补不会失败，`CHECK stock >= 0` 拦不到加法。要防的是重复回补，这个靠订单状态机保证：只有 `canceled` 状态第一次流转时回补，重复调用直接返回，和分佣篇里退款回调用退款单号做幂等是同一个思路。

要不要单独一张库存流水表？现在不用。`skus.stock` 加上订单表，每一笔增减都能从订单倒查。哪天出现"仓库手工出入库"这类订单之外的变化，再照分佣篇 `commission_ledgers` 的样子加一张流水，把每次 `stock` 变化记下来。

## 改价不改老账，靠订单快照

`skus.price` 永远是"现在卖多少"。已经成交的订单，价格、名称、规格都写在订单明细自己的字段里：

```go
type OrderItem struct {
    ID      int64 `gorm:"primaryKey;autoIncrement"`
    OrderID int64 `gorm:"not null;index:idx_order_items_order"`
    SkuID   int64 `gorm:"not null;index:idx_order_items_sku"`

    // 下单那一刻的快照，SKU 后续变化不影响这里。
    ProductName string `gorm:"size:255;not null"`
    SpecsText   string `gorm:"size:255;not null"` // "黑色 / M"
    Image       string `gorm:"size:512;not null;default:''"`
    Price       int64  `gorm:"not null;check:ck_order_items_price,price >= 0"`
    Quantity    int32  `gorm:"not null;check:ck_order_items_qty,quantity > 0"`

    CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}
```

下单流程里，先读 SKU 校验状态，把快照字段抄进 `OrderItem`，再在同一个事务里扣库存：

```go
func CreateOrderItem(
    ctx context.Context,
    tx *gorm.DB,
    orderID int64,
    skuID int64,
    qty int32,
) error {    var sku model.Sku
    err := tx.
        Select("skus.*", "products.name AS product_name", "products.status").
        Joins("JOIN products ON products.id = skus.product_id").
        Take(&sku, "skus.id = ?", skuID).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return fmt.Errorf("sku not found")
    }
    if err != nil {
        return err
    }
    if !sku.Enabled || sku.Product.Status != model.ProductStatusListed {
        return fmt.Errorf("sku is not available")
    }

    specsText := specsToText(sku.Specs) // {"颜色":"黑色"} → "黑色"，多规格用" / "拼
    item := OrderItem{
        OrderID:     orderID,
        SkuID:       sku.ID,
        ProductName: sku.Product.Name,
        SpecsText:   specsText,
        Image:       sku.Image,
        Price:       sku.Price,
        Quantity:    qty,
    }
    if err := tx.Create(&item).Error; err != nil {
        return fmt.Errorf("create order item: %w", err)
    }

    // 事务里复用同一个扣库存函数，DeductStock 内部的 db.WithContext 传 tx 进来即可。
    return DeductStock(ctx, tx, sku.ID, qty)
}
```

商品后来改名、改图、改价、甚至整个规格组合被停用，老订单打开还是下单那一刻的样子。退款金额也按快照价算，和分佣篇"改比例时旧账不跟着变"是同一条原则。

`specsToText` 存一份人读的文本，不是把 JSONB 原样塞进去。客服看订单时需要的是"黑色 / M"，不是一串 JSON。

## 前台怎么查

商品详情页只要在售信息：

```go
func GetProductDetail(
    ctx context.Context,
    db *gorm.DB,
    productID int64,
) (*model.Product, error) {
    var product model.Product
    err := db.WithContext(ctx).
        Preload("Skus", "enabled = TRUE").
        Where("id = ? AND status = ?", productID, model.ProductStatusListed).
        Take(&product).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, fmt.Errorf("product not found")
    }
    return &product, err
}
```

购物车页展示的商品可能已经下架，读的时候别过滤，把状态一并带给前端置灰：SKU `enabled = false` 或商品不是 `listed` 的，标"已失效"，点结算时服务端再拦一次。前端隐藏只是体验，服务端校验才是边界，下单入口 `DeductStock` 前的那次状态检查不能省。

分类页查列表时用冗余的 `min_price` 排序、展示，不要对 SKU 做 join 聚合。数据量上去之后，join 聚合是列表页最先慢下来的地方。

## 最后把这些场景跑一遍

- 同一个商品下两个相同规格组合的 SKU，第二个被唯一索引拦住；
- 库存 1 件时两个请求同时下单，只有一个成功，库存不会变负；
- 下单后立刻改价，订单明细还是下单时的价格；
- 停用"白色 M"后，购物车里的这条标失效，无法结算；
- 历史订单里的"白色 M"仍然显示名称、规格、图片；
- 取消订单，库存加回去，重复调用不会多加；
- 商品 `draft` 状态下，详情页查不到；
- 全部 SKU 停用后，商品详情页打不开购买入口。

## 收尾

SPU 管"是什么"，SKU 管"卖什么"。价格、库存、规格图都挂在 SKU 上，商品表只承担展示，这张边界守住了，后面加东西都不用回头改表：会员价是在价格上的扩展，秒杀是给 SKU 挂活动规则，多仓库存是把 `stock` 拆到仓库维度再汇总。

把规格组合唯一、扣库存条件更新、订单快照这三件事做对，商城的商品部分就有了能一直往上盖的地基。
