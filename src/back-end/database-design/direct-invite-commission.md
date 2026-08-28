---
title: 用 GORM 把一级邀请分佣做清楚
description: 一级邀请分佣的完整设计，从邀请绑定写到订单结算和退款。
---

# 用 GORM 把一级邀请分佣做清楚

商城准备加一个邀请返佣，产品给出的规则很短：谁直接邀请了购买人，谁拿这笔订单的佣金，再往上的人不参与。

规则只有一句，真正写进系统却还要回答不少问题：邀请码能不能换，支付回调来了两次怎么办，比例改了会不会影响旧订单，商品退款以后已经发出去的佣金又从哪里扣回来。表如果只顾着把功能跑通，这些问题迟早会落到对账和售后头上。

先把最容易说混的地方摆明白。假设 A 邀请 B，B 又邀请 C：

```text
B 下单：A 得佣金
C 下单：B 得佣金
A 不会从 C 的订单里拿钱
```

这条邀请链可以很长，钱却只跨过一段关系。C 买东西时，系统找到 B 就停，不会继续找到 A。这就是一级分佣。

下面用 GORM v2 和 PostgreSQL 把整条链路走一遍。Model 可以放在 `internal/model/commission.go`，业务代码放在 `internal/service/commission.go`，Gin 只负责接参数和返回结果。

## 钱只往上走一层

这套设计认的是订单，不是人头。有人填写邀请码时不发奖励，等他真的买了商品，直接邀请人才会有一笔佣金。

| 事情 | 规则 |
| --- | --- |
| 邀请归属 | 一个人只能认一个直接邀请人，绑定后不能自己更换 |
| 佣金来源 | 只认真实支付的商品订单，邀请人数本身不产生收益 |
| 默认比例 | 10%，后台可以调整 |
| 计算基数 | 商品实付金额，不含运费、赠品和已退款部分 |
| 到账时间 | 支付后先待结算，确认收货并过售后期才可提现 |
| 订单退款 | 商品退多少，佣金就按原比例退多少 |
| 关系边界 | 不允许自己邀请自己，不允许形成环，也没有团队奖和多级奖励 |

比例用万分比保存，`1000` 就是 10%。上午支付的订单若按 10% 生成佣金，下午后台改成 8%，上午那笔仍然是 10%。为此，佣金明细要把支付时用到的规则版本和比例一并留下，不能事后回头查“当前配置”。

这里讨论的是技术上的记账方式。真实商品、一级返佣让业务关系清楚许多，但实际运营还会涉及宣传方式、推广资格、税务和提现，正式上线前仍要按具体业务做合规审核。

## 订单走完一程，佣金才算到账

佣金不会在付款的一刻直接变成可提现余额。它先跟着订单往前走：

```text
用户填写邀请码
      │
      ▼
绑定直接邀请人，只允许成功一次
      │
      ▼
用户支付真实商品订单
      │
      ├── 没有邀请人：不产生佣金
      │
      └── 有邀请人：按当前规则创建待结算佣金
                         │
                         ▼
                 确认收货并过售后期
                         │
                         ▼
                    转为可提现
```

大多数退款会发生在售后期内，此时钱还在待结算余额里，原路扣掉即可。偶尔也会遇到结算后的特殊退款，那就留下一笔负数流水；余额不够扣时先记成负数，后续佣金优先补上这笔差额。

## 表不用多，账要分清

最后落成六张表，各管一件事：

| 表 | 用来做什么 |
| --- | --- |
| `invite_codes` | 保存每个用户自己的邀请码 |
| `invite_relations` | 保存“这个用户是谁直接邀请的” |
| `commission_rules` | 保存后台发布过的分佣规则 |
| `commission_records` | 保存每一笔订单产生的佣金 |
| `commission_accounts` | 保存用户当前的待结算和可用余额 |
| `commission_ledgers` | 保存每次余额变化，方便对账 |

`commission_records` 说明某个订单应该产生多少佣金，`commission_ledgers` 说明余额在哪一天、因为什么变了多少。前者像账单，后者像银行流水，少了哪一份都不好对账。以后有人问“这十块为什么被扣了”，沿着退款流水就能找到原订单，而不是盯着一个余额猜来猜去。

### GORM Model

```go
package model

import "time"

type CommissionStatus string

const (
    CommissionStatusPending   CommissionStatus = "pending"
    CommissionStatusAvailable CommissionStatus = "available"
    CommissionStatusCanceled  CommissionStatus = "canceled"
    CommissionStatusReversed  CommissionStatus = "reversed"
)

// InviteCode 是用户对外分享的邀请码。
// Code 不要直接使用连续的用户 ID，避免被人批量猜出来。
type InviteCode struct {
    ID     int64  `gorm:"primaryKey;autoIncrement"`
    UserID int64  `gorm:"not null;uniqueIndex:uq_invite_codes_user"`
    Code   string `gorm:"size:32;not null;uniqueIndex:uq_invite_codes_code"`
    User   *User  `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

    Enabled   bool      `gorm:"not null;default:true"`
    CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}

// InviteRelation 只保存直接邀请关系。
// UserID 直接作为主键，数据库自然就能拦住重复绑定。
type InviteRelation struct {
    UserID       int64 `gorm:"primaryKey;autoIncrement:false"`
    InviterID    int64 `gorm:"not null;index:idx_invite_relations_inviter;check:ck_invite_relations_not_self,inviter_id <> user_id"`
    InviteCodeID int64 `gorm:"not null"`

    User       *User       `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`
    Inviter    *User       `gorm:"foreignKey:InviterID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`
    InviteCode *InviteCode `gorm:"foreignKey:InviteCodeID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

    BoundAt  time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
    CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}

// CommissionRule 每修改一次就新增一行，不覆盖老版本。
type CommissionRule struct {
    ID      int64 `gorm:"primaryKey;autoIncrement"`
    Version int64 `gorm:"not null;uniqueIndex:uq_commission_rules_version;check:ck_commission_rules_version,version > 0"`

    RateBps        int32 `gorm:"not null;default:1000;check:ck_commission_rules_rate,rate_bps BETWEEN 0 AND 10000"`
    SettlementDays int16 `gorm:"not null;default:7;check:ck_commission_rules_days,settlement_days BETWEEN 0 AND 365"`
    Enabled        bool  `gorm:"not null;default:true"`

    EffectiveAt    time.Time `gorm:"not null;index:idx_commission_rules_effective_at"`
    CreatedByUserID *int64
    CreatedAt       time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}

// CommissionRecord 保存支付那一刻的规则快照。
// CommissionAmount 是最初产生的佣金，退款部分累计放在 ReversedAmount。
type CommissionRecord struct {
    ID      int64 `gorm:"primaryKey;autoIncrement"`
    OrderID int64 `gorm:"not null;uniqueIndex:uq_commission_records_order"`

    BuyerUserID   int64 `gorm:"not null;index:idx_commission_records_buyer"`
    InviterUserID int64 `gorm:"not null;index:idx_commission_records_inviter"`
    RuleID         int64 `gorm:"not null"`
    RuleVersion    int64 `gorm:"not null"`

    Buyer   *User           `gorm:"foreignKey:BuyerUserID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`
    Inviter *User           `gorm:"foreignKey:InviterUserID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`
    Rule    *CommissionRule `gorm:"foreignKey:RuleID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

    BaseAmount          int64 `gorm:"not null;check:ck_commission_records_base,base_amount >= 0"`
    RemainingBaseAmount int64 `gorm:"not null;check:ck_commission_records_remaining_base,remaining_base_amount >= 0 AND remaining_base_amount <= base_amount"`
    RateBps             int32 `gorm:"not null;check:ck_commission_records_rate,rate_bps BETWEEN 0 AND 10000"`
    CommissionAmount    int64 `gorm:"not null;check:ck_commission_records_amount,commission_amount >= 0"`
    ReversedAmount      int64 `gorm:"not null;default:0;check:ck_commission_records_reversed,reversed_amount >= 0 AND reversed_amount <= commission_amount"`
    SettlementDays      int16 `gorm:"not null"`

    Status CommissionStatus `gorm:"type:varchar(16);not null;default:pending;index:idx_commission_records_due,priority:1;check:ck_commission_records_status,status IN ('pending','available','canceled','reversed')"`

    AvailableAt *time.Time `gorm:"index:idx_commission_records_due,priority:2"`
    SettledAt   *time.Time
    CreatedAt   time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
    UpdatedAt   time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}

// CommissionAccount 是余额汇总表。
// AvailableAmount 允许出现负数，用来承接结算后的特殊退款。
type CommissionAccount struct {
    UserID int64 `gorm:"primaryKey;autoIncrement:false"`
    User   *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

    PendingAmount   int64 `gorm:"not null;default:0;check:ck_commission_accounts_pending,pending_amount >= 0"`
    AvailableAmount int64 `gorm:"not null;default:0"`
    FrozenAmount    int64 `gorm:"not null;default:0;check:ck_commission_accounts_frozen,frozen_amount >= 0"`
    WithdrawnAmount int64 `gorm:"not null;default:0;check:ck_commission_accounts_withdrawn,withdrawn_amount >= 0"`

    CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}

// CommissionLedger 只追加、不修改，记录余额为什么发生变化。
type CommissionLedger struct {
    ID                 int64 `gorm:"primaryKey;autoIncrement"`
    UserID             int64 `gorm:"not null;index:idx_commission_ledgers_user_created,priority:1"`
    CommissionRecordID int64 `gorm:"not null;index"`

    User             *User             `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`
    CommissionRecord *CommissionRecord `gorm:"foreignKey:CommissionRecordID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

    BusinessType string `gorm:"size:32;not null;uniqueIndex:uq_commission_ledgers_business,priority:1"`
    BusinessID   string `gorm:"size:64;not null;uniqueIndex:uq_commission_ledgers_business,priority:2"`

    PendingChange   int64
    AvailableChange int64
    Remark          string    `gorm:"size:255;not null;default:''"`
    CreatedAt       time.Time `gorm:"not null;default:CURRENT_TIMESTAMP;index:idx_commission_ledgers_user_created,priority:2"`
}
```

所有金额都用 `int64`，单位是分。比例也不用浮点数，而是按万分比保存：

```text
1000 = 10%
800  = 8%
50   = 0.5%
```

计算时统一向下取整。商品实付 99.99 元，比例 10%，佣金是 999 分，也就是 9.99 元。每笔订单独立计算，账面规则会比四舍五入后再做补差简单得多。

## 先把表建起来

表建好后，如果系统里还没有任何规则，就放入第一版默认值：返佣 10%，确认收货七天后结算。

```go
package database

import (
    "fmt"
    "time"

    "gorm.io/gorm"

    "your/module/internal/model" // 换成 go.mod 里的 module 路径
)

func MigrateCommission(db *gorm.DB) error {
    return db.Transaction(func(tx *gorm.DB) error {
        if err := tx.AutoMigrate(
            &model.InviteCode{},
            &model.InviteRelation{},
            &model.CommissionRule{},
            &model.CommissionAccount{},
            &model.CommissionRecord{},
            &model.CommissionLedger{},
        ); err != nil {
            return fmt.Errorf("migrate commission tables: %w", err)
        }

        var count int64
        if err := tx.Model(&model.CommissionRule{}).Count(&count).Error; err != nil {
            return fmt.Errorf("count commission rules: %w", err)
        }
        if count != 0 {
            return nil
        }

        defaultRule := model.CommissionRule{
            Version:        1,
            RateBps:        1000,
            SettlementDays: 7,
            Enabled:        true,
            EffectiveAt:    time.Now(),
        }
        if err := tx.Create(&defaultRule).Error; err != nil {
            return fmt.Errorf("create default commission rule: %w", err)
        }

        return nil
    })
}
```

这段 migration 要放在用户表和订单表之后。示例里的 `OrderID` 只保留了业务关联，没有替项目决定订单能不能物理删除；如果订单只会归档、不会删除，再补一条外键更稳妥。

开发阶段用 `AutoMigrate` 很省事。到了正式环境，表结构的变化还是写成带版本号的 migration，哪次上线加了什么、回滚时该撤什么，都会清楚很多。

## 邀请码只认第一次

邀请关系适合在注册后，或者第一次进入系统时绑定。相同请求可以重试，第一次成功以后再换另一个邀请码，则直接拒绝。

只拦“自己邀请自己”还不够。假如 A 已经邀请了 B，又允许 A 填上 B 的邀请码，两个人就围成了一个环，谁买东西都能给另一个人返钱。

邀请码绑定并不是高频操作，这里干脆用 PostgreSQL 的事务级 advisory lock，让绑定请求依次通过。写入前沿邀请链往上看一遍，既能挡住已有的环，也不会被两个同时到达的请求钻空子。

```go
package commission

import (
    "context"
    "errors"
    "fmt"
    "strings"

    "gorm.io/gorm"
    "gorm.io/gorm/clause"

    "your/module/internal/model"
)

var (
    ErrInviteCodeInvalid  = errors.New("邀请码不存在或已停用")
    ErrInviteAlreadyBound = errors.New("已经绑定过邀请人")
    ErrInviteSelf         = errors.New("不能填写自己的邀请码")
    ErrInviteCycle        = errors.New("邀请关系不能形成循环")
)

func BindInviteCode(
    ctx context.Context,
    db *gorm.DB,
    userID int64,
    rawCode string,
) error {
    code := strings.ToUpper(strings.TrimSpace(rawCode))
    if code == "" {
        return ErrInviteCodeInvalid
    }

    return db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        // 所有邀请码绑定共用一把很短的事务锁，数字在本项目内固定即可。
        if err := tx.Exec("SELECT pg_advisory_xact_lock(?)", int64(88421001)).Error; err != nil {
            return fmt.Errorf("lock invite binding: %w", err)
        }

        var inviteCode model.InviteCode
        err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
            Where("code = ? AND enabled = TRUE", code).
            Take(&inviteCode).Error
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return ErrInviteCodeInvalid
        }
        if err != nil {
            return err
        }
        if inviteCode.UserID == userID {
            return ErrInviteSelf
        }

        var old model.InviteRelation
        err = tx.Where("user_id = ?", userID).Take(&old).Error
        if err == nil {
            // 同一个邀请码重复提交，按成功处理；换邀请码则拒绝。
            if old.InviterID == inviteCode.UserID {
                return nil
            }
            return ErrInviteAlreadyBound
        }
        if !errors.Is(err, gorm.ErrRecordNotFound) {
            return err
        }

        // 从邀请人一路往上找，途中碰到自己就说明会形成环。
        currentID := inviteCode.UserID
        for depth := 0; depth < 100; depth++ {
            if currentID == userID {
                return ErrInviteCycle
            }

            var parent model.InviteRelation
            err = tx.Select("inviter_id").
                Where("user_id = ?", currentID).
                Take(&parent).Error
            if errors.Is(err, gorm.ErrRecordNotFound) {
                break
            }
            if err != nil {
                return err
            }
            currentID = parent.InviterID

            if depth == 99 {
                return fmt.Errorf("invite chain is too deep")
            }
        }

        relation := model.InviteRelation{
            UserID:       userID,
            InviterID:    inviteCode.UserID,
            InviteCodeID: inviteCode.ID,
        }
        if err := tx.Create(&relation).Error; err != nil {
            return fmt.Errorf("create invite relation: %w", err)
        }

        return nil
    })
}
```

`invite_relations.user_id` 直接做主键。业务代码即使哪次漏判，数据库也不会让同一个用户认下两个邀请人。

前端只传邀请码，不传 `inviter_user_id`。邀请人到底是谁，由后端拿邀请码去查，免得客户端随手改一个用户 ID 就换了归属。

## 支付成功，只先记一笔待结算

订单确认收款后，把订单号、购买人、商品实付和支付时间交给佣金服务：

```go
type PaidOrderSnapshot struct {
    OrderID           int64
    BuyerUserID       int64
    ProductPaidAmount int64     // 商品实付，单位：分，已经排除运费
    PaidAt            time.Time
}
```

接下来只查购买人的直接邀请人，找到以后便停下：

```go
func calculateCommission(baseAmount int64, rateBps int32) int64 {
    return baseAmount * int64(rateBps) / 10000
}

func CreateOrderCommission(
    ctx context.Context,
    db *gorm.DB,
    order PaidOrderSnapshot,
) error {
    if order.ProductPaidAmount <= 0 {
        return nil
    }

    return db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        var relation model.InviteRelation
        err := tx.Where("user_id = ? AND bound_at <= ?", order.BuyerUserID, order.PaidAt).
            Take(&relation).Error
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil // 没有直接邀请人，不产生佣金
        }
        if err != nil {
            return err
        }

        // 取支付时间已经生效的最新规则。不要过滤 Enabled，最新版本关闭时
        // 就表示这个时间点不再产生佣金，不能退回去误用上一个开启版本。
        var rule model.CommissionRule
        err = tx.Where("effective_at <= ?", order.PaidAt).
            Order("effective_at DESC, version DESC").
            Take(&rule).Error
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil
        }
        if err != nil {
            return err
        }
        if !rule.Enabled || rule.RateBps == 0 {
            return nil
        }

        amount := calculateCommission(order.ProductPaidAmount, rule.RateBps)
        if amount <= 0 {
            return nil
        }

        record := model.CommissionRecord{
            OrderID:             order.OrderID,
            BuyerUserID:         order.BuyerUserID,
            InviterUserID:       relation.InviterID,
            RuleID:              rule.ID,
            RuleVersion:         rule.Version,
            BaseAmount:          order.ProductPaidAmount,
            RemainingBaseAmount: order.ProductPaidAmount,
            RateBps:             rule.RateBps,
            CommissionAmount:    amount,
            SettlementDays:      rule.SettlementDays,
            Status:              model.CommissionStatusPending,
        }

        result := tx.Clauses(clause.OnConflict{
            Columns:   []clause.Column{{Name: "order_id"}},
            DoNothing: true,
        }).Create(&record)
        if result.Error != nil {
            return result.Error
        }
        if result.RowsAffected == 0 {
            return nil // 支付回调重复到达，上一笔已经处理过
        }

        account := model.CommissionAccount{UserID: relation.InviterID}
        if err := tx.Clauses(clause.OnConflict{DoNothing: true}).
            Create(&account).Error; err != nil {
            return err
        }

        now := time.Now()
        result = tx.Model(&model.CommissionAccount{}).
            Where("user_id = ?", relation.InviterID).
            Updates(map[string]any{
                "pending_amount": gorm.Expr("pending_amount + ?", amount),
                "updated_at":     now,
            })
        if result.Error != nil {
            return result.Error
        }
        if result.RowsAffected != 1 {
            return fmt.Errorf("commission account not found")
        }

        ledger := model.CommissionLedger{
            UserID:             relation.InviterID,
            CommissionRecordID: record.ID,
            BusinessType:       "commission_created",
            BusinessID:         fmt.Sprintf("%d", order.OrderID),
            PendingChange:      amount,
            Remark:             "订单支付，佣金进入待结算余额",
        }
        return tx.Create(&ledger).Error
    })
}
```

支付平台重试回调很平常，所以 `order_id` 上必须有唯一索引。同一个订单来多少次通知，都只能落下一条佣金。

代码拿到 `relation.InviterID` 后没有再往上查。一级分佣的边界，不靠一段产品说明保证，而是到这里就真的停了。

## 确认收货，才开始等售后期

付款时还不知道货什么时候送到，`available_at` 自然也不能简单写成“支付时间加七天”。等订单确认收货，再从这个时间往后算售后期：

```go
func MarkOrderCompleted(
    ctx context.Context,
    db *gorm.DB,
    orderID int64,
    completedAt time.Time,
) error {
    return db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        var record model.CommissionRecord
        err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
            Where("order_id = ?", orderID).
            Take(&record).Error
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil
        }
        if err != nil {
            return err
        }
        if record.Status != model.CommissionStatusPending || record.AvailableAt != nil {
            return nil
        }

        availableAt := completedAt.AddDate(0, 0, int(record.SettlementDays))
        return tx.Model(&record).Updates(map[string]any{
            "available_at": availableAt,
            "updated_at":   time.Now(),
        }).Error
    })
}
```

订单若在途中取消，不必再算 `available_at`，直接按退款处理。

## 过了售后期，再放进可用余额

后台任务每隔几分钟捞一批到期记录，逐条结算。处理时锁住当前佣金行，即便两个任务碰巧拿到同一个 ID，也只有一个能把钱转进可用余额。

```go
func SettleCommission(
    ctx context.Context,
    db *gorm.DB,
    recordID int64,
    now time.Time,
) error {
    return db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        var record model.CommissionRecord
        err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
            Where("id = ?", recordID).
            Take(&record).Error
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil
        }
        if err != nil {
            return err
        }
        if record.Status != model.CommissionStatusPending ||
            record.AvailableAt == nil || record.AvailableAt.After(now) {
            return nil
        }

        netAmount := record.CommissionAmount - record.ReversedAmount
        if netAmount <= 0 {
            return tx.Model(&record).Updates(map[string]any{
                "status":     model.CommissionStatusCanceled,
                "updated_at": now,
            }).Error
        }

        result := tx.Model(&model.CommissionAccount{}).
            Where("user_id = ? AND pending_amount >= ?", record.InviterUserID, netAmount).
            Updates(map[string]any{
                "pending_amount":   gorm.Expr("pending_amount - ?", netAmount),
                "available_amount": gorm.Expr("available_amount + ?", netAmount),
                "updated_at":       now,
            })
        if result.Error != nil {
            return result.Error
        }
        if result.RowsAffected != 1 {
            return fmt.Errorf("pending commission balance is inconsistent")
        }

        if err := tx.Model(&record).Updates(map[string]any{
            "status":     model.CommissionStatusAvailable,
            "settled_at": now,
            "updated_at": now,
        }).Error; err != nil {
            return err
        }

        ledger := model.CommissionLedger{
            UserID:             record.InviterUserID,
            CommissionRecordID: record.ID,
            BusinessType:       "commission_settled",
            BusinessID:         fmt.Sprintf("%d", record.ID),
            PendingChange:      -netAmount,
            AvailableChange:    netAmount,
            Remark:             "售后期结束，佣金转为可用余额",
        }
        return tx.Create(&ledger).Error
    })
}
```

批量查询时先取一小批 ID，不把整批记录塞进一个长事务：

```go
var ids []int64

err := db.Model(&model.CommissionRecord{}).
    Where("status = ? AND available_at IS NOT NULL AND available_at <= ?",
        model.CommissionStatusPending, time.Now()).
    Order("id ASC").
    Limit(200).
    Pluck("id", &ids).Error
```

这样某一条失败时，另外 199 条不必陪着回滚。失败记录写进日志，下次任务仍会捞到它。

## 商品退款，佣金也跟着退

退款可能不止一次。与其告诉佣金模块“这次退了多少”，不如直接告诉它“这张订单现在还剩多少商品实付”。订单模块负责汇总多次退款，佣金模块只按剩余有效金额重算，回调重复时也不容易多扣。

```go
func ApplyOrderRefund(
    ctx context.Context,
    db *gorm.DB,
    orderID int64,
    refundNo string,
    remainingProductAmount int64,
) error {
    if remainingProductAmount < 0 || refundNo == "" {
        return fmt.Errorf("invalid refund input")
    }

    return db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        var record model.CommissionRecord
        err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
            Where("order_id = ?", orderID).
            Take(&record).Error
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil
        }
        if err != nil {
            return err
        }
        if remainingProductAmount > record.RemainingBaseAmount {
            return fmt.Errorf("remaining product amount cannot increase")
        }
        if record.Status == model.CommissionStatusCanceled ||
            record.Status == model.CommissionStatusReversed {
            return nil
        }

        // 先占住退款流水号。同一个退款回调并发到达时，只有一个事务能继续。
        ledger := model.CommissionLedger{
            UserID:             record.InviterUserID,
            CommissionRecordID: record.ID,
            BusinessType:       "commission_refund",
            BusinessID:         refundNo,
            Remark:             "订单退款，扣回对应佣金",
        }
        claimed := tx.Clauses(clause.OnConflict{
            Columns: []clause.Column{
                {Name: "business_type"},
                {Name: "business_id"},
            },
            DoNothing: true,
        }).Create(&ledger)
        if claimed.Error != nil {
            return claimed.Error
        }
        if claimed.RowsAffected == 0 {
            return nil
        }

        newNetAmount := calculateCommission(remainingProductAmount, record.RateBps)
        oldNetAmount := record.CommissionAmount - record.ReversedAmount
        reverseAmount := oldNetAmount - newNetAmount
        if reverseAmount < 0 {
            return fmt.Errorf("commission amount cannot increase after refund")
        }

        pendingChange := int64(0)
        availableChange := int64(0)

        if reverseAmount > 0 {
            switch record.Status {
            case model.CommissionStatusPending:
                result := tx.Model(&model.CommissionAccount{}).
                    Where("user_id = ? AND pending_amount >= ?", record.InviterUserID, reverseAmount).
                    Updates(map[string]any{
                        "pending_amount": gorm.Expr("pending_amount - ?", reverseAmount),
                        "updated_at":     time.Now(),
                    })
                if result.Error != nil {
                    return result.Error
                }
                if result.RowsAffected != 1 {
                    return fmt.Errorf("pending commission balance is inconsistent")
                }
                pendingChange = -reverseAmount

            case model.CommissionStatusAvailable:
                // 已结算后的特殊退款允许把可用余额扣成负数，后续佣金先补这笔欠款。
                result := tx.Model(&model.CommissionAccount{}).
                    Where("user_id = ?", record.InviterUserID).
                    Updates(map[string]any{
                        "available_amount": gorm.Expr("available_amount - ?", reverseAmount),
                        "updated_at":       time.Now(),
                    })
                if result.Error != nil {
                    return result.Error
                }
                if result.RowsAffected != 1 {
                    return fmt.Errorf("commission account not found")
                }
                availableChange = -reverseAmount
            }
        }

        nextStatus := record.Status
        if newNetAmount == 0 {
            if record.Status == model.CommissionStatusPending {
                nextStatus = model.CommissionStatusCanceled
            } else {
                nextStatus = model.CommissionStatusReversed
            }
        }

        if err := tx.Model(&record).Updates(map[string]any{
            "remaining_base_amount": remainingProductAmount,
            "reversed_amount":       record.ReversedAmount + reverseAmount,
            "status":                nextStatus,
            "updated_at":            time.Now(),
        }).Error; err != nil {
            return err
        }

        return tx.Model(&ledger).Updates(map[string]any{
            "pending_change":   pendingChange,
            "available_change": availableChange,
        }).Error
    })
}
```

比如商品原本实付 100 元，按 10% 记下 10 元佣金。后来退掉 30 元商品，分佣基数只剩 70 元，应得佣金随之变成 7 元，系统扣回差额 3 元即可。

如果提现功能不允许负余额提现，那么查询可提现金额时使用：

```go
withdrawable := max(account.AvailableAmount-account.FrozenAmount, 0)
```

发起提现时，在事务里锁住账户，把钱从 `available_amount` 挪到 `frozen_amount`。打款成功后再计入累计提现，失败则退回可用余额。这样一笔钱在任何时候都有明确去处，不会因为接口超时变成一笔说不清的差额。

## 改比例时，旧账不跟着变

后台每保存一次配置，就新增一个版本，不去覆盖旧行。否则几个月后再查老订单，只能看到同一个规则 ID，却说不清支付当天究竟是 10% 还是 8%。

```go
type CreateRuleInput struct {
    RateBps        int32
    SettlementDays int16
    Enabled        bool
    EffectiveAt    time.Time
    OperatorUserID int64
}

func CreateCommissionRule(
    ctx context.Context,
    db *gorm.DB,
    input CreateRuleInput,
) (*model.CommissionRule, error) {
    if input.RateBps < 0 || input.RateBps > 10000 {
        return nil, fmt.Errorf("rate must be between 0 and 10000 bps")
    }
    if input.SettlementDays < 0 || input.SettlementDays > 365 {
        return nil, fmt.Errorf("invalid settlement days")
    }
    if input.EffectiveAt.IsZero() {
        input.EffectiveAt = time.Now()
    }

    var created model.CommissionRule
    err := db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        if err := tx.Exec("SELECT pg_advisory_xact_lock(?)", int64(88421002)).Error; err != nil {
            return fmt.Errorf("lock commission rule creation: %w", err)
        }

        var last model.CommissionRule
        err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
            Order("version DESC").
            Take(&last).Error
        if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
            return err
        }

        nextVersion := int64(1)
        if err == nil {
            nextVersion = last.Version + 1
        }

        created = model.CommissionRule{
            Version:         nextVersion,
            RateBps:         input.RateBps,
            SettlementDays:  input.SettlementDays,
            Enabled:         input.Enabled,
            EffectiveAt:     input.EffectiveAt,
            CreatedByUserID: &input.OperatorUserID,
        }
        return tx.Create(&created).Error
    })

    return &created, err
}
```

后台页面照常显示百分比，接口和数据库仍用万分比。管理员填入 `10`，后端保存为 `1000`。接口传整数或字符串即可，没必要让浏览器和 Go 各算一次浮点数。

停用分佣也发布一个新版本，只是把 `Enabled` 设为 `false`。支付时读取那个时间点最新的规则，看到关闭便结束，不会退回去误用上一版。

## 接到 Gin 里

绑定接口只收邀请码。当前用户是谁，由登录中间件放进 Context：

```go
type BindInviteRequest struct {
    Code string `json:"code" binding:"required,max=32"`
}

func BindInviteHandler(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        userID := c.GetInt64("user_id")

        var req BindInviteRequest
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"message": "请填写正确的邀请码"})
            return
        }

        err := commission.BindInviteCode(c.Request.Context(), db, userID, req.Code)
        switch {
        case err == nil:
            c.JSON(http.StatusOK, gin.H{"message": "邀请码绑定成功"})
        case errors.Is(err, commission.ErrInviteCodeInvalid),
            errors.Is(err, commission.ErrInviteSelf),
            errors.Is(err, commission.ErrInviteAlreadyBound),
            errors.Is(err, commission.ErrInviteCycle):
            c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
        default:
            c.Error(err)
            c.JSON(http.StatusInternalServerError, gin.H{"message": "绑定失败，请稍后再试"})
        }
    }
}
```

如果支付、收货和退款都在同一个后端里，订单模块直接调用 service，并和订单状态更新放在同一个数据库事务里，没必要通过 HTTP 绕回自己。只有拆成不同服务以后，才需要用 outbox 把这些事件可靠地送出去。

## 遇上账号合并

分佣模块最终认的也是 `users.id`，正好能接上前面的多账号设计。两个账号合并时，邀请归属和余额不能顺手一改了事：

- 历史 `commission_records` 和 `commission_ledgers` 不改用户 ID，保留当时真实的买家和受益人；
- source 的余额通过一进一出两条流水转给 target，不能只改余额数字；
- target 已经绑定邀请人时，保留 target 的关系，不能偷偷换成 source 的邀请人；
- target 没有邀请人、source 有邀请人时，可以重新走一次防环检查后迁移；
- 两边都有邀请码时保留 target 的邀请码，source 的邀请码停用或做旧码跳转；
- 已经合并的 source 不能再产生新订单佣金。

邀请关系只有一行，却决定了钱归谁。两边关系发生冲突时，宁可留给人工处理，也别临时挑一个“注册更早”的账号覆盖过去。

## 最后把这些场景跑一遍

- 没有邀请人的用户下单，不产生佣金；
- A 邀请 B，B 下单只给 A 佣金；
- A 邀请 B、B 邀请 C，C 下单只给 B，A 没有记录；
- 重复支付回调不会重复加待结算余额；
- 后台从 10% 改成 8% 后，老订单仍然按 10%；
- 订单未确认收货时不能结算；
- 部分退款只扣回对应比例的佣金；
- 全额退款后佣金变成 canceled 或 reversed；
- 两个结算任务同时处理一条记录，只能成功一次；
- 邀请码不能重复绑定，A 和 B 也不能互相邀请；
- 可用余额为负时不能发起提现；
- 账号合并后，旧账号不会继续产生佣金。

## 收尾

整套设计没有团队、等级和多层比例。无论邀请链拉得多长，每张订单都只回头看一眼：买家是谁直接邀请来的。

把关系绑定、支付幂等、规则快照、延迟结算和退款冲正守住，日常运营的账就有了根。以后再加提现审核、税务信息或商家分摊，也只是沿着流水往外扩，不必回头推翻邀请关系。
