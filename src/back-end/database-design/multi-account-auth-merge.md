---
title: 用 GORM 设计多账号登录与账号合并
description: 用 GORM 和 PostgreSQL 设计手机号、邮箱、微信等登录方式，并处理重复账号合并。
---

# 用 GORM 设计多账号登录与账号合并

刚开始做登录时，直接在 `users` 表里加 `phone`、`email`、`wechat_openid` 看起来最省事。等登录方式越来越多，这张表也会越拉越宽，到处都是可空字段。

更麻烦的是重复注册。比如一个人先用手机号注册，过几天又直接用微信登录，系统很可能给他建出两个账号。后面想把两个账号合起来，订单、会员、积分和登录状态都得跟着处理。

这篇文章就解决这两个问题：多种登录方式怎么共用一个账号，以及两个已经存在的账号怎么安全地合并。代码使用 GORM v2，数据库使用 PostgreSQL。

## 先把用户和登录方式拆开

假设一个人先用手机号注册，后来又绑定了邮箱和微信。他还是同一个用户，只是现在有三种登录方式：

```text
users: 10001
   ├── phone   +8613800138000
   ├── email   ming@example.com
   └── wechat  o6_bmjrPTlm6_2sgVt7hMZOPfL2M
```

表结构也跟着拆成两层：

- `users` 保存账号，订单、项目、会员等业务表都引用它；
- `user_identities` 保存手机号、邮箱、微信这些登录方式。

### 多种登录方式到底怎么关联

真正把这些登录方式串起来的，就是 `user_identities.user_id`：

```text
users
└── id = 10001
    │
    ├── user_identities：phone   / +8613800138000 / user_id = 10001
    ├── user_identities：email   / ming@example.com / user_id = 10001
    └── user_identities：wechat  / o6_bmjr... / user_id = 10001

orders       → user_id = 10001
projects     → user_id = 10001
memberships  → user_id = 10001
```

用户用手机号登录时，先查到手机号对应的 Identity，再拿到 `user_id = 10001`。换成微信登录，查到的还是 `user_id = 10001`。从这一步开始，订单、项目和会员代码就不用再关心用户刚才是怎么登录的。

数据库关系可以直接记成下面这样：

```text
users 1 ─── N user_identities   一个账号可以绑定多种登录方式
users 1 ─ 0..1 user_passwords   一个账号最多一份密码，也可以没有密码
users 1 ─── N user_sessions     一个账号可以在多台设备登录
users 1 ─── N orders/projects   所有业务数据都挂在 users.id 下
```

业务表不要关联 `user_identities.id`。Identity 会解绑、换绑，甚至在账号合并时搬到另一个用户；`users.id` 才是业务数据一直使用的 ID。

以后再接 QQ 或 Apple，只需要增加新的 `provider`，不用继续给 `users` 加字段。解绑微信也只是停用一条登录记录，不会动订单里的 `user_id`。

后面的设计一直按这四条规矩来：

1. 同一个手机号、邮箱或第三方账号，不能同时绑给两个用户；
2. 不管从哪里登录，后面的业务代码都只认 `user_id`；
3. 开始执行合并后，被合并的账号不能再登录、绑手机或改密码；
4. 同一个合并请求重复调用，也只能执行一次。

## 用 GORM 定义五张基础表

模型代码可以放在 `internal/model/auth.go`。先装依赖：

```bash
go get gorm.io/gorm gorm.io/driver/postgres gorm.io/datatypes github.com/google/uuid
```

文件开头先把后面要用的类型引进来：

```go
package model

import (
    "time"

    "github.com/google/uuid"
    "gorm.io/datatypes"
)
```

下面一共五张表，先把最容易出错的唯一约束、合并状态和 Session 撤销处理好。项目自己的昵称、头像、会员字段再按需要添加。

### users：账号主表

```go
type UserStatus string

const (
    UserStatusActive   UserStatus = "active"
    UserStatusDisabled UserStatus = "disabled"
    UserStatusMerging  UserStatus = "merging"
    UserStatusMerged   UserStatus = "merged"
    UserStatusDeleted  UserStatus = "deleted"
)

type User struct {
    ID        int64   `gorm:"primaryKey;autoIncrement"`
    Username  *string `gorm:"size:64"`
    Nickname  *string `gorm:"size:128"`
    AvatarURL *string `gorm:"type:text"`

    Status UserStatus `gorm:"type:varchar(16);not null;default:active;check:ck_users_status,status IN ('active','disabled','merging','merged','deleted')"`

    MergedIntoUserID *int64 `gorm:"index:idx_users_merged_into,where:merged_into_user_id IS NOT NULL;check:ck_users_merge_target,(status = 'merged' AND merged_into_user_id IS NOT NULL AND merged_into_user_id <> id) OR (status <> 'merged' AND merged_into_user_id IS NULL)"`
    MergedIntoUser   *User  `gorm:"foreignKey:MergedIntoUserID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

    AuthVersion int64 `gorm:"not null;default:1;check:ck_users_auth_version,auth_version > 0"`

    Identities []UserIdentity `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`
    Password   *UserPassword  `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`
    Sessions   []UserSession  `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

    CreatedAt time.Time  `gorm:"not null;default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time  `gorm:"not null;default:CURRENT_TIMESTAMP"`
    DeletedAt *time.Time `gorm:"check:ck_users_deleted_state,(status = 'deleted') = (deleted_at IS NOT NULL)"`
}
```

`Identities`、`Password` 和 `Sessions` 不是 `users` 表里的三个字段，它们告诉 GORM 这几张表怎么通过 `user_id` 关联。需要查看用户绑定了哪些登录方式时，可以这样查：

```go
var user model.User

err := db.WithContext(ctx).
    Preload("Identities", "revoked_at IS NULL").
    First(&user, "id = ?", userID).Error
```

订单、项目这些业务表也用同样的方式关联 `users.id`。例如订单只需要保存 `UserID`：

```go
type Order struct {
    ID     int64 `gorm:"primaryKey;autoIncrement"`
    UserID int64 `gorm:"not null;index"`
    User   *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

    Amount    int64
    CreatedAt time.Time
}
```

`Order` 属于业务模块，不用放进下面的账号表迁移列表；在订单模块自己的 migration 里建表即可。

`users` 里不再放手机号和微信 `openid`，这里只保存账号本身。

账号合并后也别急着删旧记录。把旧账号的 `status` 改成 `merged`，再用 `merged_into_user_id` 指向新账号。以后发现某张旧订单还在引用老 ID，也能顺着这条记录查到它合并去了哪里。

`auth_version` 用来让旧 Access Token 提前失效。签发 Token 时把当前版本写进去；改密码、封号或合并账号后，把数据库里的版本加一。请求进来时两个版本对不上，这个 Token 就不能再用。

这里没有直接嵌入 `gorm.Model`。它自带 `uint` 主键和 `gorm.DeletedAt`，跟这里的 `int64` 主键、账号状态不太合适。只要字段还叫 `CreatedAt` 和 `UpdatedAt`，平时用 GORM 更新数据时，这两个时间照样会自动维护。使用 `UpdateColumn` 或原生 SQL 时，记得自己更新 `updated_at`。

`DeletedAt *time.Time` 只是普通字段，不会自动启用软删除。注销账号时要在事务里更新 `status`、`deleted_at` 和 `auth_version`，不要调用 `db.Delete(&user)`。`db.Delete` 会真的发 DELETE：有外键引用时会报错，没有引用时数据就直接没了。

### user_identities：用户绑定了哪些登录方式

```go
type UserIdentity struct {
    ID     int64 `gorm:"primaryKey;autoIncrement"`
    UserID int64 `gorm:"not null;index:idx_user_identities_active_user,where:revoked_at IS NULL"`

    Provider       string `gorm:"size:32;not null;index:uq_user_identities_active_subject,unique,where:revoked_at IS NULL,priority:1;check:ck_user_identities_provider,provider = LOWER(BTRIM(provider)) AND provider <> ''"`
    IdentityScope  string `gorm:"size:255;not null;default:global;index:uq_user_identities_active_subject,unique,priority:2;check:ck_user_identities_scope,identity_scope = BTRIM(identity_scope) AND identity_scope <> ''"`
    ProviderUserID string `gorm:"size:512;not null;index:uq_user_identities_active_subject,unique,priority:3;check:ck_user_identities_subject,provider_user_id = BTRIM(provider_user_id) AND provider_user_id <> ''"`

    VerifiedAt *time.Time     `gorm:"not null"`
    RevokedAt  *time.Time     `gorm:"check:ck_user_identities_revoked_at,revoked_at IS NULL OR revoked_at >= created_at"`
    Metadata   datatypes.JSON `gorm:"type:jsonb;not null;default:'{}';check:ck_user_identities_metadata,jsonb_typeof(metadata) = 'object'"`

    CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}
```

这里多加了一个 `identity_scope`。它解决的是第三方账号的 ID 在哪里有效。

比如微信 `openid` 只在某个 AppID 下唯一，所以微信的 scope 就填 AppID；手机号和邮箱没有这个问题，统一填 `global`。

不要用可空的 `app_id` 做联合唯一键。PostgreSQL 会把不同记录里的 `NULL` 当成不同值，两个相同手机号都带着 `app_id = NULL` 时，普通唯一约束不一定拦得住。把 scope 设成非空以后，这个坑就没了：

| 身份 | `provider` | `identity_scope` | `provider_user_id` |
| --- | --- | --- | --- |
| 手机号 | `phone` | `global` | 规范化后的 E.164 号码 |
| 邮箱 | `email` | `global` | 规范化后的邮箱地址 |
| 微信 | `wechat` | 微信 AppID | 该 AppID 下的 `openid` |
| Google / OIDC | `google` 或发行方名称 | 规范化后的 issuer | `sub` |

如果系统还有租户隔离，再单独增加 `tenant_id`，并把它放进唯一约束。别把租户 ID 塞进 `metadata`，后面查重和排错都会很难受。

`provider_user_id` 存的是整理过、可以直接拿来查重的值。手机号统一转成 E.164；邮箱先去掉首尾空格，域名转成小写。邮箱 @ 前面的部分要不要转小写，项目里定一条规则一直用下去。原始值如果还要展示，可以放进 `metadata`。

微信的 `openid` 要和 AppID 一起使用。`unionid` 也不是任何情况下都能跨应用通用，只有满足微信开放平台的条件才行。如果项目真的要靠 `unionid` 查用户，最好把它也当成一条正式登录身份来存，不要随手塞进一个辅助字段。

身份验证通过后，才往这张表里插数据，所以 `verified_at` 不能为空。这里用 `*time.Time` 是故意的：如果代码忘了赋值，数据库会因为 `NULL` 直接报错，不会存进去一个 Go 的零值时间。

还没验证完的邮箱、验证码和绑定请求放临时表或 Redis，不要先占一条正式身份。解绑时也不用删记录，填上 `revoked_at` 就行。登录查询记得加 `revoked_at IS NULL`。

`metadata` 只能放普通扩展信息，别往里面塞 OAuth Token、验证码。必须长期保存的 OAuth Token 要单独加密；验证码只存短期摘要；OAuth `state` 用一次就删。

如果产品规定一个用户只能绑一个手机号，建表完成后再调用下面的 `AddSinglePhoneRule`。这条限制不是所有项目都需要，确认产品规则以后再加。

### user_passwords：单独保存密码

```go
type UserPassword struct {
    UserID int64 `gorm:"primaryKey;autoIncrement:false"`

    PasswordHash    string `gorm:"type:text;not null;check:ck_user_passwords_hash,BTRIM(password_hash) <> ''" json:"-"`
    PasswordAlgo    string `gorm:"size:32;not null;default:argon2id"`
    PasswordVersion int16  `gorm:"not null;default:1;check:ck_user_passwords_version,password_version > 0"`

    PasswordChangedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP;autoCreateTime"`
}
```

这里按“一个用户一份密码”来设计。也就是说，同一个用户用手机号或邮箱登录，验证的都是这份密码。如果项目要求每种登录身份都有独立密码，那主键就要改成 `identity_id`。

密码用 Argon2id 或 bcrypt 处理。不要用 MD5、SHA-1，也不要直接保存 `SHA256(password)`。

`autoCreateTime` 只会在第一次插入时填写 `PasswordChangedAt`。用户改密码时，要在同一次 `Updates` 里把 `password_version` 加一，同时更新 `password_changed_at`。

### user_sessions：记录登录设备和 Refresh Token

```go
type UserSession struct {
    ID     uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
    UserID int64     `gorm:"not null;index:idx_user_sessions_active,where:revoked_at IS NULL,priority:1"`

    RefreshTokenHash    []byte `gorm:"type:bytea;not null;uniqueIndex:uq_user_sessions_refresh_token;check:ck_user_sessions_hash,OCTET_LENGTH(refresh_token_hash) = 32" json:"-"`
    RefreshTokenVersion int64  `gorm:"not null;default:1;check:ck_user_sessions_version,refresh_token_version > 0"`

    DeviceID   *string `gorm:"size:255"`
    DeviceName *string `gorm:"size:255"`
    Platform   *string `gorm:"size:32"`
    IP         *string `gorm:"type:inet"`
    UserAgent  *string `gorm:"type:text"`

    ExpiresAt time.Time `gorm:"not null;index:idx_user_sessions_active,where:revoked_at IS NULL,priority:2;index:idx_user_sessions_active_expiry,where:revoked_at IS NULL;check:ck_user_sessions_expiry,expires_at > created_at"`

    RevokedAt     *time.Time `gorm:"check:ck_user_sessions_revoke_state,(revoked_at IS NULL) = (revoked_reason IS NULL)"`
    RevokedReason *string    `gorm:"size:64"`
    CreatedAt     time.Time  `gorm:"not null;default:CURRENT_TIMESTAMP"`
    LastActiveAt  time.Time  `gorm:"not null;default:CURRENT_TIMESTAMP;autoCreateTime"`
}
```

Session ID 默认交给 PostgreSQL 的 `gen_random_uuid()` 生成。如果数据库没有这个函数，就删掉 `default` tag，在 `Create` 前用 `uuid.New()` 生成。

Access Token 一般有效期很短，可以不落库。Refresh Token 要支持撤销，所以放进 Session 表，但只保存 32 字节摘要或 HMAC，明文只在签发时交给客户端。

Refresh Token 本身是高强度随机值，可以用快速摘要；用户密码不行，密码还是得用 Argon2id 或 bcrypt。

刷新 Token 时，UPDATE 条件里要带上旧摘要，并把 `refresh_token_version` 加一。这样两个刷新请求同时进来，也只有一个能更新成功。

如果还想判断“旧 Token 被人偷走后又拿来用”，就得额外保存轮换记录，或者再做一张 token family 表。只保存当前 Token 摘要，判断不了旧 Token 是不是被重放。

### user_merge_records：记录每次账号合并

```go
type MergeStatus string

const (
    MergeStatusPending    MergeStatus = "pending"
    MergeStatusProcessing MergeStatus = "processing"
    MergeStatusCompleted  MergeStatus = "completed"
    MergeStatusFailed     MergeStatus = "failed"
)

type UserMergeRecord struct {
    ID        int64     `gorm:"primaryKey;autoIncrement"`
    RequestID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex:uq_user_merge_records_request;check:ck_user_merge_request_id,request_id <> '00000000-0000-0000-0000-000000000000'::uuid"`

    SourceUserID int64 `gorm:"not null;check:ck_user_merge_different_users,source_user_id <> target_user_id"`
    SourceUser   *User `gorm:"foreignKey:SourceUserID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

    TargetUserID int64 `gorm:"not null;index:idx_user_merge_records_target"`
    TargetUser   *User `gorm:"foreignKey:TargetUserID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

    InitiatedByUserID *int64
    InitiatedByUser   *User `gorm:"foreignKey:InitiatedByUserID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

    Status MergeStatus `gorm:"type:varchar(16);not null;default:pending;check:ck_user_merge_status,status IN ('pending','processing','completed','failed')"`

    PolicySnapshot datatypes.JSON `gorm:"type:jsonb;not null;default:'{}';check:ck_user_merge_policy,jsonb_typeof(policy_snapshot) = 'object'"`
    ErrorCode      *string        `gorm:"size:64"`

    CreatedAt  time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
    StartedAt  *time.Time
    FinishedAt *time.Time `gorm:"check:ck_user_merge_timestamps,(status = 'pending' AND started_at IS NULL AND finished_at IS NULL) OR (status = 'processing' AND started_at IS NOT NULL AND finished_at IS NULL) OR (status IN ('completed','failed') AND started_at IS NOT NULL AND finished_at IS NOT NULL)"`
}
```

关联字段和密码摘要都加了 `json:"-"`，但还是不建议直接把这些 Model 当成 Gin 返回值。接口层单独写 DTO，只放前端真正需要的字段，后面新增敏感字段时不容易误返回出去。

`source_user_id` 是准备停用的账号，`target_user_id` 是最后保留的账号。

`request_id` 由业务代码生成，同一次重试必须继续用原来的值，这样接口重复调用也不会合并两遍。`policy_snapshot` 记录这次积分怎么加、会员保留哪一份。以后出问题，能直接查到当时到底按什么规则处理的。

## 用 GORM 创建表

GORM 默认会把 `UserIdentity` 映射成 `user_identities`，所以不用再写 `TableName()`。

`AutoMigrate` 负责创建表、字段、外键、CHECK 和大部分索引。两个条件比较长的 PostgreSQL 索引直接用 `db.Exec` 创建，代码反而更容易看懂。建表时先放 `User`，再放另外四张引用 `users` 的表：

```go
package database

import (
    "fmt"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"

    "your/module/internal/model" // 替换为 go.mod 中的 module 路径
)

func OpenAndMigrate(dsn string) (*gorm.DB, error) {
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        return nil, fmt.Errorf("open postgres: %w", err)
    }

    if err := Migrate(db); err != nil {
        return nil, err
    }
    return db, nil
}

func Migrate(db *gorm.DB) error {
    return db.Transaction(func(tx *gorm.DB) error {
        if err := tx.AutoMigrate(
            &model.User{},
            &model.UserIdentity{},
            &model.UserPassword{},
            &model.UserSession{},
            &model.UserMergeRecord{},
        ); err != nil {
            return fmt.Errorf("auto migrate auth tables: %w", err)
        }

        // 同一个 source 只能有一条未失败的合并记录。
        // 这段 WHERE 放在 struct tag 里需要转义逗号，直接写 SQL 更清楚。
        if err := tx.Exec(`
            CREATE UNIQUE INDEX IF NOT EXISTS uq_user_merge_source_open_or_done
            ON user_merge_records (source_user_id)
            WHERE status IN ('pending', 'processing', 'completed')
        `).Error; err != nil {
            return fmt.Errorf("create merge source index: %w", err)
        }

        return nil
    })
}

func AddSinglePhoneRule(db *gorm.DB) error {
    return db.Exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_user_identities_one_phone_per_user
        ON user_identities (user_id)
        WHERE provider = 'phone' AND revoked_at IS NULL
    `).Error
}
```

Gin 启动时调用一次：

```go
func mustOpenDB() *gorm.DB {
    db, err := database.OpenAndMigrate(os.Getenv("DATABASE_DSN"))
    if err != nil {
        log.Fatal(err)
    }
    return db
}
```

在 `main` 里先调用 `mustOpenDB()`，再把返回的 `*gorm.DB` 传给 repository 和 handler。不要在某个 HTTP 请求里临时跑迁移。

本地开发的 DSN 可以这样写：

```dotenv
DATABASE_DSN=host=127.0.0.1 user=app password=change-me dbname=app port=5432 sslmode=disable TimeZone=Asia/Shanghai
```

这段代码只负责建表，不会帮你创建 PostgreSQL 数据库。`dbname=app` 对应的数据库和账号要提前建好。

`AutoMigrate` 默认会创建外键，不要在 GORM 配置里打开 `DisableForeignKeyConstraintWhenMigrating`，否则 Model 里写了关联，数据库里却没有真正的外键。

开发阶段用 `AutoMigrate` 很方便，正式上线后不要只靠它。它能补表、补列、补索引，但不会删除旧列；一个同名 CHECK 或索引已经存在时，即使 tag 改了，它也不会自动重建。项目稳定后，还是把数据库修改写成带版本号的 migration，这样上线和回滚都更清楚。

## 登录时怎么查

不管用户是用验证码、密码还是 OAuth 登录，验证通过后都整理成这三个值：

```text
(provider, identity_scope, provider_user_id)
                     │
                     ▼
             user_identities
                     │
                     ▼
                  users.id
```

代码里先通过 Identity 找 `user_id`：

```go
func findUserIDByIdentity(
    ctx context.Context,
    db *gorm.DB,
    provider string,
    scope string,
    providerUserID string,
) (int64, error) {
    var identity model.UserIdentity

    err := db.WithContext(ctx).
        Select("user_id").
        Where(
            "provider = ? AND identity_scope = ? AND provider_user_id = ? AND revoked_at IS NULL",
            provider,
            scope,
            providerUserID,
        ).
        Take(&identity).Error
    if err != nil {
        return 0, err
    }

    return identity.UserID, nil
}
```

拿到这个 `user_id` 以后，订单、会员、项目都用它查询。后面的 handler 不需要再判断用户是手机号登录还是微信登录。

手机号验证码登录可以按下面的顺序处理：

1. 校验验证码，把手机号转成统一格式；
2. 查询对应的 `user_identities`；
3. 找到身份后读取用户状态，只允许 `active` 用户继续；
4. 为这个用户创建 Session。

微信登录只是前面的验证方式不同：先校验 `state`，再用授权码换 `openid`，最后把 `openid` 和服务端配置的 AppID 组成身份键。

第一次登录时，要在同一个事务里创建 `users` 和 `user_identities`。如果两个请求同时进来，身份唯一索引会让其中一个失败。失败的事务先回滚，再重新查询已经创建好的身份，不会留下一个没有登录方式的空账号。

登录时如果查到的是 `merged` 账号，不要直接跳到 target 然后继续发 Token。正常情况下，登录身份早就应该搬到 target；现在还能查到 source，说明合并没做完或者数据有问题，直接拒绝登录更安全。

绑定新方式时有三种结果：

- 身份不存在：验证完成后绑定到当前用户；
- 身份已经属于当前用户：直接返回成功，不要重复插入；
- 身份属于另一个用户：先不要绑定，提示用户走账号合并。

第三种情况不能直接把 `user_id` 改成当前用户。用户必须分别验证两个账号，证明两边都是自己的。只知道另一个账号的手机号、微信 ID 或邮箱，不代表有权把它合并过来。

绑定、解绑、改密码时也要先锁住 `users` 这一行，拿到锁后再确认账号还是 `active`。不这样做的话，合并事务刚把 source 停用，另一个等待中的绑定请求又可能往 source 里塞进一条新身份。

## PostgreSQL 与 Redis 各自保存什么

简单分法是：需要长期保留、丢了没法恢复的数据放 PostgreSQL；只在几分钟内有效的临时数据放 Redis。

| PostgreSQL | Redis |
| --- | --- |
| 用户主体与登录身份 | 手机、邮箱验证码 |
| 密码摘要与 Session 记录 | OAuth `state`、PKCE 临时数据 |
| 账号合并记录 | 登录限流与失败次数 |
| 订单、项目、会员等业务数据 | 短期黑名单或会话缓存 |

Redis 里的验证码或 OAuth `state` 丢了，最多让用户重新验证一次，不能影响账号归属。登录限流这类安全数据要不要持久化、要不要做高可用，再看项目的风险要求。

用户绑定了哪个手机号、两个账号是否已经合并，这些不能只放 Redis。即使把 Session 缓存在 Redis，数据库里也要能查到它有没有被撤销。

## 账号合并不能只改一个 user_id

最常见的情况是：用户先用手机号注册了 `10001`，后来忘了这件事，又用微信创建了 `20001`。等他回到手机号账号绑定微信时，系统才发现这个微信已经属于另一个账号。

```text
合并前                                合并后

10001（手机号、订单 A）               10001（手机号、微信、订单 A、订单 B）
20001（微信、订单 B）       ──►       20001（merged → 10001）
```

换成表里的数据，就是下面这几处关联发生变化：

```text
合并前
user_identities：phone   → user_id 10001
user_identities：wechat  → user_id 20001
orders：订单 B           → user_id 20001

合并后
user_identities：phone   → user_id 10001
user_identities：wechat  → user_id 10001
orders：订单 B           → user_id 10001（如果订单规则允许改归属）
users：20001             → merged_into_user_id 10001
```

所以账号合并的本质，就是把登录身份和允许迁移的业务数据，从 source 的 `user_id` 改到 target。不能改归属的订单或流水，就保留原来的 `user_id`，查询时再通过 `merged_into_user_id` 找到当前账号。

开始合并前，先让用户分别验证两个账号。当前账号重新输密码或验证码，另一个账号再走一次验证码或 OAuth。两边都验证成功后，展示积分、会员等处理结果，让用户确认。

后端不要相信客户端传来的另一个 `user_id`。客户端只负责完成验证，真正的账号 ID 要由服务端根据验证结果查出来。

### 先说清楚每类数据怎么处理

不是所有表都能直接执行 `UPDATE ... SET user_id = target`。下面这些数据要一项一项定规则：

| 数据 | 可以怎么处理 | 容易出的问题 |
| --- | --- | --- |
| 登录身份 | 搬到 target，冲突的让用户二选一 | 两边可能各绑了一个手机号 |
| 密码 | 保留 target 的密码，或者让用户重设 | source 的旧密码不能继续登录 |
| 积分、余额 | 通过流水把金额转过去 | 不能只改最终数字，不然账对不上 |
| 会员 | 取较晚的到期时间，或叠加剩余天数 | 规则要先和产品确认，并记录本次用了哪条 |
| 优惠券 | 一张一张检查后再搬 | 可能绕过“每人限领一次” |
| 订单、发票 | 保留原账号，再做账号映射 | 售后、财务通常要查原始记录 |
| 团队、工作空间 | 转移所有者，合并重复成员 | 可能遇到同名、配额和角色冲突 |

最后通常会分成三类：可以直接改 `user_id` 的、要把两边数据算在一起的、必须保留原始归属的。处理规则要写进代码和测试，实际采用的规则再存一份到 `policy_snapshot`，以后才查得清楚。

### 合并时要防重复请求

数据量不大时，可以把迁移放进一个数据库事务。先用一个很短的事务创建 `pending` 合并记录，然后执行下面的步骤：

1. 用 `request_id` 查询合并记录，重复提交直接返回同一任务；
2. 先找到最终的 target，再按 ID 排序，用 `SELECT ... FOR UPDATE` 锁住 source 和 target；
3. 拿到锁后再检查一次两个账号的状态。如果 target 又发生了合并，就回滚，用新的 target 重试；
4. 把任务改成 `processing`，写入 `started_at`，然后重新检查手机号、会员、积分等冲突；
5. 按用户确认过的规则处理密码和业务数据，再迁移登录身份。不管最后保留哪份密码，source 的 `user_passwords` 记录都要删掉；
6. 将 source 标记为 `merged` 并指向 target，同时递增它的 `auth_version`；
7. 撤销 source 的全部 Session；
8. 把任务改为 `completed`、写入 `finished_at`，随迁移一起提交；
9. 提交后为当前设备签发 target 的新 Token。

GORM 里这样写行锁：

```go
func lockMergeUsers(
    ctx context.Context,
    tx *gorm.DB,
    sourceID int64,
    targetID int64,
) ([]model.User, error) {
    var users []model.User

    err := tx.WithContext(ctx).
        Clauses(clause.Locking{Strength: "UPDATE"}).
        Where("id IN ?", []int64{sourceID, targetID}).
        Order("id ASC").
        Find(&users).Error
    if err != nil {
        return nil, err
    }
    if len(users) != 2 {
        return nil, fmt.Errorf("merge users not found")
    }

    return users, nil
}
```

`clause` 来自 `gorm.io/gorm/clause`。这个函数只负责锁住两条用户记录，后面的状态检查和数据迁移还得放在外层 `db.Transaction` 里。

为什么锁住以后还要再查一次？因为用户停留在确认页面时，另一个请求可能又绑定了新手机号，也可能有人同时发起了另一场合并。页面上看到的检查结果，到真正执行时不一定还有效。

迁移事务如果失败并回滚，再单独开一个短事务，把合并记录改成 `failed`，补上时间和 `error_code`。不要把失败记录和迁移放在同一个事务里，否则一回滚，失败记录也没了。

如果一个账号有几十万条订单或素材，就别用一个长事务硬搬。先把 source 改成 `merging`，禁止它继续登录、绑定和改密码，再用后台任务分批迁移，并记录每批处理到哪里。

数据跨数据库时，一个 PostgreSQL 事务也管不了全部操作。这时再考虑 outbox 或 saga，并让每一步都能安全重试。

## 合并后的会话和旧 ID

合并完成后，source 的密码和所有 Session 都要失效。当前设备重新签发 target 的 Access Token 和 Refresh Token。

Access Token 的有效期尽量短一些，并带上 `session_id` 或 `auth_version`。每次认证时，还要拿这个值和数据库或缓存里的当前值比较。只把字段写进 JWT、不做比较，没有任何撤销效果。

检查旧 Token 时要使用 Token 里原始的 source ID，不能先把它跳转到 target。否则 source 的旧 Token 还没过期，就直接获得了 target 的全部权限。

订单、项目这些老数据里可能还留着 source ID，查询业务数据时可以做有限次跳转：

```go
type UserRepository struct {
    db *gorm.DB
}

func (r *UserRepository) ResolveUserID(ctx context.Context, userID int64) (int64, error) {
    const maxHops = 5
    seen := make(map[int64]struct{}, maxHops+1)

    for hops := 0; ; hops++ {
        if _, exists := seen[userID]; exists {
            return 0, errors.New("user merge cycle detected")
        }
        seen[userID] = struct{}{}

        var user model.User
        err := r.db.WithContext(ctx).
            Select("id", "status", "merged_into_user_id").
            First(&user, "id = ?", userID).Error
        if err != nil {
            return 0, err
        }
        if user.Status != model.UserStatusMerged || user.MergedIntoUserID == nil {
            return user.ID, nil
        }
        if hops == maxHops {
            return 0, errors.New("user merge chain is too deep")
        }

        userID = *user.MergedIntoUserID
    }
}
```

这段代码只给历史业务数据用，不能拿来放行旧 JWT。

执行新合并时，尽量让 source 直接指向最后的 target，不要故意留下很长的 `A → B → C → D`。最大跳转次数和循环检查也要保留，避免脏数据把请求卡进死循环。

## 第一版先做这些

不用一开始就做成很重的账号平台，先把下面这些做好：

- `users` 与 `user_identities` 分离，业务表只引用 `users.id`；
- 手机号、邮箱先按统一格式处理，再写进身份表并做唯一限制；
- 密码放 PostgreSQL，验证码和 OAuth `state` 放 Redis，Session 单独记录；
- 新绑定的身份已经属于别人时，先验证两个账号，不能直接抢过来；
- 合并接口要防重复调用，执行时要加行锁，失败后还能重试和排查；
- source 不删除，但它的密码和旧 Session 必须失效；老业务数据查询时再把旧 ID 跳到 target。

这样以后再接 QQ、微博、Apple 或企业登录，主要工作就是增加 provider 适配。订单、项目和会员表继续只认 `users.id`，不用跟着登录方式一起改。

账号合并也有固定流程可走：先验证两个账号，再处理冲突和搬数据，最后停用 source、撤销旧 Session，并留下合并记录。
