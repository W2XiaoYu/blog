# Electron 打包自动代码签名（electron-builder）

Electron 应用用 `electron-builder` 打包后，默认产出的 exe 是**未签名**的。用户首次运行会触发 Windows SmartScreen 红色警告，体验很差。本文记录如何让 `npm run build:win` 每次**自动签名所有产物**（主 exe + 所有 dll + .node 原生模块 + NSIS 安装包），零手动干预。

## 背景：electron-builder 默认签了什么

> 这是最容易踩的坑：很多人以为配了证书就万事大吉，结果只签了主 exe。

electron-builder 默认只会签名：

- 主程序 `xxx.exe`
- NSIS 安装包 `xxx-setup.exe`
- 卸载程序 `elevate.exe`

**而打包进 `resources/app.asar.unpacked` 里的 `.dll`、`.node` 原生模块不会被签名**。杀毒软件扫描安装目录时，这些未签名的 dll 仍可能被标记为可疑。

要签名内部 dll，最可靠的方式是用 **afterPack 钩子** 手动调 signtool 批量签名（本文先讲主流程，钩子方案见末尾）。

## 前置：证书从哪来

签名需要一个**代码签名证书**（Code Signing Certificate）。常见来源：

| 方案 | 成本 | 特点 |
|---|---|---|
| 标准 OV 证书（DigiCert/Sectigo） | ~$200/年 | 签名后仍有 SmartScreen 警告，需积累信誉 |
| EV 代码签名证书 | ~$400/年 | 立即消除 SmartScreen 警告（需硬件 token） |
| Azure Trusted Signing | ~$10/月 | 云端签名，性价比高 |

证书买到后，需要**安装到 Windows 证书存储区**（双击 `.pfx` → 导入到"个人"存储），signtool 才能通过指纹找到它。

## 第一步：查询证书指纹（SHA1）

签名要用证书的**指纹（Thumbprint）**，一个 40 位的 hex 字符串。证书装好后，用 PowerShell 查：

```powershell
# 列出当前用户存储区所有代码签名证书
Get-ChildItem -Path Cert:\CurrentUser\My |
  Where-Object { $_.EnhancedKeyUsageList.FriendlyName -match '代码签名|Code Signing' } |
  Select-Object Subject, Thumbprint
```

输出类似：

```
Subject    : CN="你的公司名", O="...", C=CN
Thumbprint : DD722D25CAEE464C9F560F39A2CB008C6DFDE521
```

把 `Thumbprint` 记下来，后面要用。

> 🔒 **安全提示**：证书指纹（SHA1 thumbprint）是**公开标识，不是机密**。别人拿到指纹无法签名，因为签名需要证书的私钥（在你机器的证书存储区里）。所以指纹写进配置文件是安全的。

## 第二步：配置 electron-builder.yml

electron-builder **26.x** 的签名参数要嵌在 `win.signtoolOptions` 下（注意：24/25 版本是直接放 `win:` 顶层，26 改了结构）：

```yaml
win:
  executableName: 3A Render
  # 代码签名（electron-builder 26：签名参数嵌在 signtoolOptions 下）
  signtoolOptions:
    certificateSha1: dd722d25caee464c9f560f39a2cb008c6dfde521   # 你的证书指纹
    rfc3161TimeStampServer: http://timestamp.digicert.com      # 时间戳服务器
    signingHashAlgorithms:
      - sha256
```

三个字段的含义：

- **`certificateSha1`**：证书指纹，signtool 的 `/sha1` 参数，从系统证书存储区按指纹找证书
- **`rfc3161TimeStampServer`**：RFC3161 时间戳服务器。签名时会附带时间戳，**这样即使证书过期，已经签名的产物仍然有效**（强烈建议配置）
- **`signingHashAlgorithms: [sha256]**：只用 sha256 哈希算法（现代推荐，兼容 Win10+）

> ⚠️ **版本坑**：electron-builder 26 的 `signtoolOptions` **不支持 `${env.XXX}` 插值语法**（写成 `certificateSha1: ${env.CSC_SHA1}` 会被当成字面字符串，报 `Cannot find certificate ${ENV.CSC_SHA1}`）。指纹必须直接写值。

## 第三步：每次打包自动签名

直接 `npm run build:win` 就会自动签名所有产物了。但为了不把指纹硬编码进配置文件（换证书时要改 yaml），我用一个**本地 env 文件 + 打包包装器**的方案。

### 1. 创建指纹配置文件（不提交）

`scripts/sign.env`：

```bash
# 代码签名证书指纹（SHA1，40位 hex）
CSC_SHA1=dd722d25caee464c9f560f39a2cb008c6dfde521
```

加进 `.gitignore`：

```gitignore
# 代码签名指纹（本地配置，不提交）
scripts/sign.env
```

### 2. 创建模板文件（提交，供团队参考）

`scripts/sign.env.example`：

```bash
# 代码签名配置模板 —— 复制为 sign.env 并填入你的证书指纹
# cp scripts/sign.env.example scripts/sign.env
#
# 指纹查询（PowerShell，证书需已安装到系统证书存储区）：
#   Get-ChildItem Cert:\CurrentUser\My | Where-Object {$_.EnhancedKeyUsageList.FriendlyName -match '代码签名|Code Signing'} | Select Thumbprint
CSC_SHA1=
```

### 3. 打包包装器（读指纹 → 动态写入配置）

`scripts/with-sign.mjs`：

```js
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, 'sign.env')

// 解析简单 KEY=VALUE 的 env 文件（不引入 dotenv 依赖）
function loadEnv(path) {
  if (!existsSync(path)) return null
  const map = {}
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    map[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return map
}

const env = loadEnv(envPath)
const sha1 = env?.CSC_SHA1 || process.env.CSC_SHA1

if (sha1) {
  process.env.CSC_SHA1 = sha1
  console.log('\x1b[36m[sign]\x1b[0m 已加载证书指纹 ' + sha1.slice(0, 8) + '...' + sha1.slice(-4) + '，将自动签名所有产物')
} else {
  console.log('\x1b[33m[sign]\x1b[0m 未配置 CSC_SHA1，本次打包不签名')
  console.log('\x1b[33m[sign]\x1b[0m 如需签名：cp scripts/sign.env.example scripts/sign.env 并填入证书指纹')
}

// "--" 之后的参数透传给 electron-builder
const rawArgs = process.argv.slice(2)
const dashIndex = rawArgs.indexOf('--')
const builderArgs = dashIndex >= 0 ? rawArgs.slice(dashIndex + 1) : rawArgs

const result = spawnSync('electron-builder', builderArgs, {
  stdio: 'inherit',
  shell: true,
  env: process.env
})

process.exit(result.status ?? 1)
```

### 4. 修改 package.json 的打包脚本

```json
{
  "scripts": {
    "build:win": "npm run build && node scripts/with-sign.mjs -- --win"
  }
}
```

现在 `npm run build:win` 会：

1. 读 `scripts/sign.env` 里的指纹
2. 打印加载提示
3. 调 electron-builder 自动签名所有产物

## 验证签名

打包后，确认产物真的签名了：

```bash
# 命令行验证主程序
signtool verify /pa /v "dist/win-unpacked/3A Render.exe"

# 或右键 exe → 属性 → 数字签名 标签页
```

成功会显示签名链和你的证书 CN。

## 进阶：用 afterPack 钩子签名内部 DLL

如开头所说，electron-builder 默认不签名 `app.asar.unpacked` 里的 `.dll` / `.node`。要全部签名，加一个 afterPack 钩子：

`scripts/sign-after-pack.mjs`：

```js
import { spawnSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

// 递归收集目录下所有可签名文件
function collectSignable(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      collectSignable(full, files)
    } else if (/\.(exe|dll|node)$/i.test(entry)) {
      files.push(full)
    }
  }
  return files
}

export default async function (context) {
  if (context.electronPlatformName !== 'win32') return
  const sha1 = process.env.CSC_SHA1
  if (!sha1) {
    console.log('[afterPack] 未配置 CSC_SHA1，跳过内部文件签名')
    return
  }

  const appDir = context.appOutDir
  const files = collectSignable(appDir)
  console.log(`[afterPack] 签名 ${files.length} 个文件...`)

  // signtool 一次最多签 ~50 个文件，分批处理
  const BATCH = 40
  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH)
    const args = [
      'sign', '/v',
      '/fd', 'sha256',
      '/sha1', sha1,
      '/tr', 'http://timestamp.digicert.com',
      '/td', 'sha256',
      ...batch
    ]
    const result = spawnSync('signtool', args, { stdio: 'inherit', shell: true })
    if (result.status !== 0) {
      throw new Error(`signtool 签名失败，批次 ${i / BATCH + 1}`)
    }
  }
}
```

然后在 `electron-builder.yml` 注册钩子：

```yaml
afterPack: scripts/sign-after-pack.mjs
```

这样 electron-builder 打包完文件后、生成 NSIS 安装包前，会先用 signtool 把所有 dll/node 签一遍，**安装包里嵌入的就是已签名的文件**。

## 常见问题

**Q：报 `Cannot find certificate ${ENV.CSC_SHA1}`？**
A：electron-builder 26 的 `signtoolOptions` 不解析 `${env.XXX}`，指纹要直接写值。

**Q：报 `configuration.win has an unknown property 'certificateSha1'`？**
A：签名参数放错位置了。26 版本要嵌在 `win.signtoolOptions` 下，不能放 `win` 顶层。

**Q：没装证书 / 没设指纹，打包会失败吗？**
A：不会。electron-builder 检测不到证书会跳过签名，产出未签名包（不报错）。

**Q：换证书怎么办？**
A：改 `scripts/sign.env` 里的指纹即可，配置文件和代码都不用动。

**Q：指纹泄露有风险吗？**
A：没有。指纹是证书的公开标识，签名需要私钥（在你机器上），别人拿指纹无法冒用。

## 总结

最终方案的核心是三件事：

1. **`electron-builder.yml` 的 `win.signtoolOptions`** 配置指纹 + 时间戳 + sha256（electron-builder 自动签主 exe + 安装包）
2. **`scripts/with-sign.mjs` + `sign.env`** 实现每次打包自动加载指纹（指纹不进 git）
3. **可选的 `afterPack` 钩子** 签名内部所有 dll/node（默认不签）

配好后，`npm run build:win` 一条命令完成「打包 → 签名主 exe → 签名 dll → 生成安装包 → 签名安装包」全流程。
