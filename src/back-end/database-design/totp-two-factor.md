---
title: 用 GORM 设计两步验证 TOTP
description: TOTP 动态验证码的原理与表设计：共享密钥、时间片和 HMAC 怎么变成 6 位数字，开启确认、防重放、备份码和登录流程怎么落库。
---

# 用 GORM 设计两步验证 TOTP

密码泄露的方式太多了：撞库、钓鱼、数据库被拖。给账号再加一道"你手里那个东西"的验证，就是两步验证（2FA）。Google Authenticator、Microsoft Authenticator 打开后每 30 秒换一个的 6 位数字，就是 TOTP——基于时间的一次性密码（RFC 6238）。

最让人好奇的点是：添加验证器之后，手机和服务器再也没有任何通信，两边却能在每个时间片算出同一个数字。把原理拆开看其实很短：**两边共享同一个密钥，各自用"当前时间"算一遍，结果自然一样**。验证器扫的那个二维码，传的就是密钥本身。

这篇先用手写代码把原理说透（核心不到三十行），再按系列惯例把表设计、开启确认、防重放、备份码和登录流程用 GORM 落进 PostgreSQL。用户体系沿用[多账号登录篇](./multi-account-auth-merge)的 `users` 表。

## 原理：时间片 + HMAC

协议里流动的只有三个角色：

```text
K  共享密钥：随机 20 字节，添加验证器时通过二维码交给用户，之后两边各自保存
C  计数器：  floor(unix时间 / 30)，每 30 秒 +1——"时间"就这样变成了"第几步"
OTP  输出：  HMAC-SHA1(K, C) 的摘要里截 4 字节，取 6 位数字
```

手机和服务器各拿一半谜面的说法不对，两边拿的是**同一份完整密钥**，靠的是密钥不出门。计算过程：

```go
// 一个时间片内的 6 位验证码。key 是原始字节，counter 是第几个 30 秒。
func hotp(key []byte, counter uint64, digits int) string {
    // 计数器转成 8 字节大端——HMAC 的输入必须是固定长度的字节串
    var buf [8]byte
    binary.BigEndian.PutUint64(buf[:], counter)

    mac := hmac.New(sha1.New, key)
    mac.Write(buf[:])
    sum := mac.Sum(nil) // 20 字节摘要

    // 动态截断：最后一字节的低 4 位指出取哪 4 字节，结果掩掉最高位
    offset := sum[len(sum)-1] & 0x0f
    num := binary.BigEndian.Uint32(sum[offset:offset+4]) & 0x7fffffff
    return fmt.Sprintf("%0*d", digits, num%uint32(math.Pow10(digits)))
}

func totp(key []byte, t time.Time) string {
    return hotp(key, uint64(t.Unix()/30), 6)
}
```

两处细节值得停一下。`offset` 从摘要里挑位置，让 20 字节的信息尽量均匀地落到结果上，这是 RFC 4226 的"动态截断"，不是随手写的；`%0*d` 补前导零——`004321` 和 `4321` 是两个不同的验证码，用户输的是六位字符串，不是数字。

服务器验证时不是只算当前这一个：

```go
func verify(key []byte, t time.Time, input string) (uint64, bool) {
    counter := uint64(t.Unix() / 30)
    for _, c := range []uint64{counter - 1, counter, counter + 1} {
        if hmac.Equal([]byte(hotp(key, c, 6)), []byte(input)) {
            return c, true // 返回命中的计数器，防重放要用
        }
    }
    return 0, false // ±1 个窗口都 miss，才算失败
}
```

允许前后各一个窗口，是给手机和服务器差那么几秒的时钟留余地。比对用 `hmac.Equal`（常数时间），不差这一点时间，但侧信道这种事从第一行就防是习惯。

原理说完了。剩下的全是工程问题：密钥怎么交给用户、怎么存、怎么防止同一个码被截获后再用一次、手机丢了怎么办。一个一个落。

## 表就两张：一个状态机，一叠一次性卡片

| 表 | 用来做什么 |
| --- | --- |
| `user_totp` | 每个用户至多一条：密钥、启用状态、防重放水位、失败计数 |
| `user_recovery_codes` | 备份码：手机丢了靠它进门，一张只能用一次 |

`user_totp` 的生命周期是个小状态机：`enabled = false` 是绑定中（密钥已生成、用户还没验证过），验证成功翻成 `true`。**没有"直接启用"这个动作**——先生成密钥、展示二维码、等用户拿验证器算出正确的码回来，才确认绑定。跳过确认的后果是用户可能绑定一个进不去的验证器，把自己锁在门外。

### GORM Model

```go
package model

import "time"

type UserTotp struct {
    ID     int64 `gorm:"primaryKey;autoIncrement"`
    UserID int64 `gorm:"not null;uniqueIndex:uq_user_totp_user"`

    // 密钥原文 20 字节随机，这里存的是 AES-GCM 加密后的密文。
    // 拖库拿到的只是密文，没有 KMS 里的主密钥解不开。
    SecretCiphertext []byte `gorm:"type:bytea;not null"`

    // false = 绑定中，true = 已启用。翻 true 时写 confirmed_at。
    Enabled         bool       `gorm:"not null;default:false"`
    ConfirmedAt     *time.Time
    LastUsedCounter int64      `gorm:"not null;default:0;check:ck_user_totp_counter,last_used_counter >= 0"`
    FailCount       int32      `gorm:"not null;default:0;check:ck_user_totp_fail,fail_count >= 0"`
    LockedUntil     *time.Time // 连续失败后冷却，期间拒绝验证

    CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
    UpdatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}

// 备份码只存哈希。10 张一批，used_at 为空表示还没用。
type UserRecoveryCode struct {
    ID     int64 `gorm:"primaryKey;autoIncrement"`
    UserID int64 `gorm:"not null;index:idx_recovery_codes_user"`

    CodeHash string `gorm:"size:64;not null;uniqueIndex:uq_recovery_codes_hash"`
    UsedAt   *time.Time

    CreatedAt time.Time `gorm:"not null;default:CURRENT_TIMESTAMP"`
}
```

几个设计点：

- `UserID` 上唯一索引，数据库层面保证一个用户至多一条 TOTP 记录，想绑第二个先解绑第一个；
- 备份码的哈希上也是唯一索引，`SHA-256` 输出 64 个十六进制字符，正好 `size:64`；
- 密钥**不存明文**。验证码本身 30 秒一换，真正的秘密是密钥，它一旦从库里泄露，攻击者就等于拿到了验证器。用 AES-256-GCM 加密后落库，主密钥放在环境变量或 KMS，和数据库分开保管。

## 密钥的加密与解密

```go
package secretbox

// 主密钥 32 字节，来自环境变量 TOTP_MASTER_KEY（hex 编码）。
// 换主密钥前先用旧钥解出全部密文，用新钥重加密，别在线上裸换。
func Encrypt(master, plaintext []byte) ([]byte, error) {
    block, err := aes.NewCipher(master)
    if err != nil {
        return nil, err
    }
    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }
    nonce := make([]byte, gcm.NonceSize())
    if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
        return nil, err
    }
    // 密文布局：nonce || 加密数据，解密时先切前 12 字节
    return gcm.Seal(nonce, nonce, plaintext, nil), nil
}

func Decrypt(master, data []byte) ([]byte, error) {
    block, err := aes.NewCipher(master)
    if err != nil {
        return nil, err
    }
    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }
    n := gcm.NonceSize()
    if len(data) < n {
        return nil, fmt.Errorf("ciphertext too short")
    }
    return gcm.Open(nil, data[:n], data[n:], nil)
}
```

GCM 自带完整性校验，密文被改动过解密直接报错，不用担心解出一份错的密钥去慢慢比对。

## 开启：生成密钥，确认后才算数

第一步，生成密钥并拼出验证器能识别的二维码内容：

```go
var ErrTotpAlreadyEnabled = errors.New("两步验证已开启")

type EnrollStart struct {
    Secret   string // Base32，给"手动输入密钥"的用户看
    OTPAuthURI string
}

func StartEnroll(ctx context.Context, db *gorm.DB, master []byte, userID int64) (*EnrollStart, error) {
    // 已经启用的不允许重复开启，先关闭再重开
    var count int64
    if err := db.WithContext(ctx).Model(&model.UserTotp{}).
        Where("user_id = ? AND enabled = TRUE", userID).
        Count(&count).Error; err != nil {
        return nil, err
    }
    if count > 0 {
        return nil, ErrTotpAlreadyEnabled
    }

    // 20 字节随机密钥，Base32 编码后 32 个字符，正是验证器手输的格式
    key := make([]byte, 20)
    if _, err := io.ReadFull(rand.Reader, key); err != nil {
        return nil, err
    }
    ciphertext, err := secretbox.Encrypt(master, key)
    if err != nil {
        return nil, fmt.Errorf("encrypt secret: %w", err)
    }

    // enabled 保持 false。上次绑定到一半放弃的旧记录直接覆盖。
    record := model.UserTotp{
        UserID:           userID,
        SecretCiphertext: ciphertext,
        Enabled:          false,
    }
    err = db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        if err := tx.Where("user_id = ? AND enabled = FALSE", userID).
            Delete(&model.UserTotp{}).Error; err != nil {
            return err
        }
        return tx.Create(&record).Error
    })
    if err != nil {
        return nil, err
    }

    secret := base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(key)
    uri := fmt.Sprintf(
        "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
        url.PathEscape("3A Render"), url.QueryEscape(account), secret, url.QueryEscape("3A Render"),
    )
    return &EnrollStart{Secret: secret, OTPAuthURI: uri}, nil
}
```

二维码里是这个 `otpauth://` URI——验证器扫完，密钥、发行方、账号、步长全都有了。前端拿 URI 生成二维码图片，同时把 `Secret` 明文展示出来，照顾没法扫码的用户。**这一面展示完就翻篇**：确认成功后不再有任何接口返回密钥，Base32 字符串也不进日志。

绑定到一半放弃的用户会留下 `enabled = FALSE` 的孤儿记录，定时任务清掉即可（`created_at` 超过 24 小时的）。它拦不住任何人，留着只是脏数据。

第二步，用户把验证器上当前的码输回来，对了才算绑定成功：

```go
var ErrTotpCodeInvalid = errors.New("验证码错误")

// 确认绑定：验证通过 → enabled = TRUE、发备份码、踢其他会话。
func ConfirmEnroll(ctx context.Context, db *gorm.DB, master []byte, userID int64, code string) ([]string, error) {
    var rec model.UserTotp
    err := db.WithContext(ctx).
        Where("user_id = ? AND enabled = FALSE", userID).
        Take(&rec).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, fmt.Errorf("没有进行中的绑定")
    }
    if err != nil {
        return nil, err
    }

    key, err := secretbox.Decrypt(master, rec.SecretCiphertext)
    if err != nil {
        return nil, fmt.Errorf("decrypt secret: %w", err)
    }

    counter, ok := verify(key, time.Now(), code)
    if !ok || counter <= rec.LastUsedCounter {
        return nil, ErrTotpCodeInvalid
    }

    codes := generateRecoveryCodes(10)
    err = db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
        // bool 从 false 翻 true 不踩零值坑，但 fail_count 归零是零值更新，用 map
        if err := tx.Model(&model.UserTotp{}).Where("id = ?", rec.ID).
            Updates(map[string]any{
                "enabled":           true,
                "confirmed_at":      time.Now(),
                "last_used_counter": counter,
                "fail_count":        0,
            }).Error; err != nil {
            return err
        }
        for i := range codes {
            hash := sha256.Sum256([]byte(codes[i]))
            if err := tx.Create(&model.UserRecoveryCode{
                UserID:   userID,
                CodeHash: hex.EncodeToString(hash[:]),
            }).Error; err != nil {
                return err
            }
        }
        // 安全等级变了，旧会话全部失效，其他设备重新登录——口径和多账号篇改密码一致
        return tx.Model(&model.User{}).Where("id = ?", userID).
            UpdateColumn("auth_version", gorm.Expr("auth_version + 1")).Error
    })
    if err != nil {
        return nil, err
    }
    return codes, nil // 明文备份码只在这一次返回
}
```

确认成功时把 `LastUsedCounter` 一起写成刚才命中的 `counter`——确认用的这个码不能再拿来登录。备份码明文只在响应里出现这一次，前端提示用户抄下来；库里只有哈希。

## 验证：防重放、防暴力猜

登录第二步（或修改敏感设置的校验）都走同一个函数：

```go
var ErrTotpLocked = errors.New("尝试次数过多，请稍后再试")

func Verify(ctx context.Context, db *gorm.DB, master []byte, userID int64, code string) error {
    var rec model.UserTotp
    err := db.WithContext(ctx).
        Where("user_id = ? AND enabled = TRUE", userID).
        Take(&rec).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return fmt.Errorf("两步验证未开启")
    }
    if err != nil {
        return err
    }

    if rec.LockedUntil != nil && rec.LockedUntil.After(time.Now()) {
        return ErrTotpLocked
    }

    key, err := secretbox.Decrypt(master, rec.SecretCiphertext)
    if err != nil {
        return fmt.Errorf("decrypt secret: %w", err)
    }

    counter, ok := verify(key, time.Now(), code)
    // 命中了但没超过水位：这个码（或更早的码）已经用过，按失败处理
    if !ok || counter <= rec.LastUsedCounter {
        return failOnce(ctx, db, &rec)
    }

    // 成功：抬水位、清失败计数。fail_count 归零是零值，用 map
    return db.WithContext(ctx).Model(&model.UserTotp{}).Where("id = ?", rec.ID).
        Updates(map[string]any{
            "last_used_counter": counter,
            "fail_count":        0,
            "locked_until":      nil,
        }).Error
}

// 连续 5 次失败，锁 15 分钟。6 位码一百万种组合，不限流等于送
func failOnce(ctx context.Context, db *gorm.DB, rec *model.UserTotp) error {
    failCount := rec.FailCount + 1
    updates := map[string]any{"fail_count": failCount}
    if failCount >= 5 {
        lockedUntil := time.Now().Add(15 * time.Minute)
        updates["locked_until"] = lockedUntil
    }
    if err := db.WithContext(ctx).Model(&model.UserTotp{}).
        Where("id = ?", rec.ID).Updates(updates).Error; err != nil {
        return err
    }
    return ErrTotpCodeInvalid
}
```

两个攻击面都是在这一段堵的。**重放**：验证码走的是明文输入，可能被肩膀偷看、被键盘记录，`counter <= LastUsedCounter` 把每个码的有效次数压到一次，攻击者就算抄到也过期。**暴力**：一百万种组合，每 30 秒换一次，听起来难猜，但攻击脚本可以连续试几万次，`fail_count + locked_until` 把尝试频率摁住。

注意水位是"大于"才通过而不是"不等"——时钟回拨会重新算出老计数器，`>` 让它天然过期。

## 备份码：手机丢了的那扇窗

```go
var ErrRecoveryCodeInvalid = errors.New("备份码无效或已使用")

// 生成 10 张：字符表去掉 0O1I 这种容易看混的，格式 3A9K-P2QW-7XCM
const recoveryAlphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"

func generateRecoveryCodes(n int) []string {
    codes := make([]string, 0, n)
    for i := 0; i < n; i++ {
        b := make([]byte, 12)
        if _, err := io.ReadFull(rand.Reader, b); err != nil {
            panic(err)
        }
        for j := range b {
            b[j] = recoveryAlphabet[int(b[j])%len(recoveryAlphabet)]
        }
        s := string(b)
        codes = append(codes, s[0:4]+"-"+s[4:8]+"-"+s[8:12])
    }
    return codes
}

func UseRecoveryCode(ctx context.Context, db *gorm.DB, master []byte, userID int64, code string) error {
    hash := sha256.Sum256([]byte(strings.ToUpper(strings.TrimSpace(code))))
    // UPDATE ... WHERE code_hash = ? AND used_at IS NULL，原子标记使用
    result := db.WithContext(ctx).Model(&model.UserRecoveryCode{}).
        Where("user_id = ? AND code_hash = ? AND used_at IS NULL",
            userID, hex.EncodeToString(hash[:])).
        UpdateColumn("used_at", time.Now())
    if result.Error != nil {
        return result.Error
    }
    if result.RowsAffected == 0 {
        return ErrRecoveryCodeInvalid // 不存在、不是这个用户的、或已经用过
    }
    return nil
}
```

条件更新一次搞定"查 + 占坑"，两个请求同时用同一张码，只有一个能改到行——和 SPU 篇扣库存是同一个手法。备份码用一张少一张，前端把剩余张数告诉用户，剩两三张时提醒重新生成（重新生成就是删旧建新，同样只在响应里明文出现一次）。

## 接进登录流程

按[多账号篇](./multi-account-auth-merge)的结构，密码验证成功后加一个岔口：

```go
// 第一步：密码正确后先看有没有 TOTP
func LoginStep1(ctx context.Context, db *gorm.DB, identity, password string) (loginResult, error) {
    user, err := authenticate(ctx, db, identity, password) // 多账号篇的密码校验
    if err != nil {
        return loginResult{}, err
    }

    var rec model.UserTotp
    err = db.WithContext(ctx).
        Select("user_id", "enabled").
        Where("user_id = ? AND enabled = TRUE", user.ID).
        Take(&rec).Error

    if errors.Is(err, gorm.ErrRecordNotFound) {
        // 没开 2FA：直接发 session/token，老流程
        return issueSession(ctx, db, user)
    }
    if err != nil {
        return loginResult{}, err
    }
    // 开了 2FA：不发 session，返回中间态，让前端收验证码
    return loginResult{NeedsTotp: true, TotpTicket: issueShortLivedTicket(user.ID)}, nil
}

// 第二步：验证码或备份码通过，才算真正登录
func LoginStep2(ctx context.Context, db *gorm.DB, master []byte, ticket, code string) (loginResult, error) {
    userID := consumeTicket(ticket) // 一次性短票据，5 分钟过期，只代表"密码已对"
    if userID == 0 {
        return loginResult{}, fmt.Errorf("登录凭据已过期，请重新登录")
    }

    var err error
    if len(code) == 14 && strings.Contains(code, "-") { // 备份码是 14 位带连字符
        err = UseRecoveryCode(ctx, db, master, userID, code)
    } else {
        err = Verify(ctx, db, master, userID, code)
    }
    if err != nil {
        return loginResult{}, err
    }
    return issueSession(ctx, db, mustUser(userID))
}
```

关键规矩：**中间态不发任何登录凭证**。`TotpTicket` 只是"这个人密码已经对了，等他的验证码"的回执，短命、一次性；真正的 session 永远在第二步之后才发。Handler 层把 `NeedsTotp` 翻译成一个专门的状态码（比如 `401` 加 `code: 40101`），前端见到它就切到验证码输入界面——[Gin 篇](../gin)统一响应那套正好用上。

关闭两步验证的入口要同时要求密码和验证码（或备份码），删 `user_totp` 记录、作废全部备份码，再 `auth_version + 1`——和开启时对称，安全等级一变，旧会话全部重登。

## 最后把这些场景跑一遍

- 绑定页扫码后不输验证码直接关页面：`enabled` 还是 `false`，不影响登录，24 小时后清理；
- 确认绑定时输入的验证码，紧接着再拿来登录：被 `last_used_counter` 拦住；
- 手机和服务器时钟差 25 秒：验证仍通过（落在 ±1 窗口内）；
- 同一个验证码连输两次：第二次按失败计；
- 连续输错 5 次：锁定 15 分钟，正确码也进不来；
- 锁定期间换备份码登录：备份码不受 TOTP 锁影响（它有独立的爆破面，限流策略单独配）；
- 备份码同一张两个请求同时用：只有一个成功；
- 开启成功后，其他已登录设备：全部被踢回登录页（`auth_version` 变了）；
- 密码对、验证码错：拿不到 session，`TotpTicket` 五分钟作废；
- 数据库被拖：拿到的是密文和哈希，主密钥不在库里；
- 手机丢失：备份码登录 → 关闭 2FA → 新手机重新绑定。

## 收尾

TOTP 的原理一层窗户纸：共享密钥加当前时间各自算一遍 HMAC，动态截断取六位。工程上的分量全在密钥和边角上——密钥加密落库、二维码只在绑定时出现一次、确认成功才启用、验证码一次作废、失败要限流、备份码只存哈希、安全等级变化踢掉旧会话。

表还是那两张小表，但每列都有它的对手：`SecretCiphertext` 对拖库，`LastUsedCounter` 对重放，`FailCount` 和 `LockedUntil` 对暴力，`UserRecoveryCode` 对手机丢失。把这些对手一个个想过去，两步验证就不再是"接个第三方 SDK"的黑盒，而是自己系统里说得清每一行的那部分。
