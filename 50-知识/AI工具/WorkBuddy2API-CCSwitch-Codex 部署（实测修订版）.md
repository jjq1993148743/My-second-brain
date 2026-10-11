# WorkBuddy2API → CC Switch → Codex 部署（实测修订版）

> 2026-10-11 ｜ 目的：在**任意一台 Windows 机器**上复现"用 Codex 消耗 WorkBuddy 账号额度"这条链路
>
> 本文是《WorkBuddy2API-CCSwitch-Codex-完整部署指南》的**实测修订版**。原版链路讲得对，
> 但有 6 处错误/过时会让人卡住，已在 §8 逐条列出。本文所有步骤都在 2026-10-11 实机跑通过。

## 结论先行

链路只有一条，记住这个就不会迷路：

```
ChatGPT 桌面版 / Codex CLI
   ↓ 读 ~/.codex/config.toml，base_url = http://127.0.0.1:15721/v1
CC Switch 本地路由 :15721        ← 收到 Responses 协议
   ↓ 改写成 Chat 协议
WorkBuddy2API 网关 :7863         ← POST /v1/chat/completions
   ↓
WorkBuddy 账号池（auths/*.json）
   ↓
腾讯 copilot 上游
```

**三个必须理解的点**：

1. WorkBuddy2API 只提供 **Chat Completions**（`/v1/chat/completions`），**没有** Responses 接口。
2. Codex 只会说 **Responses**（`/v1/responses`）。直接把 Chat 地址填给 Codex = 404。
3. **CC Switch 负责翻译**。所以它必须开"本地路由"，不开链路不通。

---

## 一、前置要求

| 项目 | 要求 |
|---|---|
| 系统 | Windows 10 **build 19041+** / Windows 11（跑桌面版必须；CLI 无此限制） |
| WorkBuddy 账号 | 至少 1 个能正常登录、有额度的账号（建议 3 个以上做轮换） |
| 安装包 | `WorkBuddy2API.zip`（从微信文件里取） |
| CC Switch | v4.0.8（v4 起改用 SQLite 存配置，见 §4） |
| Codex | CLI 0.162.1 或桌面版 |

> ⚠️ **Windows 版本是最大的坑**。`Windows 10 Enterprise LTSC 2019`（build **17763**）
> 装不了桌面版 —— MSIX 清单写死 `MinVersion="10.0.19041.0"`。LTSC 不做功能更新，
> 永远停在 17763。绕法见 §5.3。

### 目录约定

本文所有路径都以**仓库根**为基准（本机是 `C:\Users\<用户名>\Desktop\github\My-second-brain`）：

```
<仓库根>/
├── WorkBuddy2API/          # 网关（含 auths/ 凭据，必须 gitignore）
└── tools/
    ├── CC-Switch/          # CC Switch 便携版
    ├── codex/              # Codex CLI
    └── Codex-Desktop/      # Codex 桌面版（解包的 MSIX）
```

**第一步永远是配 `.gitignore`**，否则凭据会被推到 GitHub：

```gitignore
# WorkBuddy2API 运行时（凭据 / 二进制，绝不入库）
WorkBuddy2API/
# 本机工具（二进制，不入库）
tools/
```

---

## 二、部署 WorkBuddy2API（网关）

### 2.1 解压

从微信文件目录取出 `WorkBuddy2API.zip`，解压到 `<仓库根>/WorkBuddy2API/`。

```
WorkBuddy2API/
├── wb2api.exe        # 网关本体
├── login.exe         # 登录工具（url / poll / realm 三个子命令）
├── credit.exe        # 额度查询
├── signin_bin.exe    # 签到保活
├── config.json       # 网关配置
├── auths/            # 账号凭据，登录后生成 workbuddy-<uid>.json
└── data/state.json   # 运行状态：每账号额度、健康度、调用统计
```

### 2.2 启动网关

```bash
cd <仓库根>/WorkBuddy2API
./wb2api.exe
```

看到 `workbuddy2api listening on :7863` 即成功。**保持窗口开着。**

> 🔴 **命令行启动必须清掉代理环境变量**，否则网关自己的出站请求会走错代理：
> ```bash
> env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY ./wb2api.exe
> ```
> 双击启动不受影响。

### 2.3 登录账号（"取 API"的核心）

```bash
./login.exe url                    # 国内版（默认）
./login.exe --realm=global url     # 国际版
```

输出一条 `https://copilot.tencent.com/login?platform=CLI&state=<uuid>` 的链接。
**浏览器打开 → 用 WorkBuddy 账号登录 → 回来执行 poll。**

> 🔴 **`login.exe poll` 在非交互模式下只把凭据 JSON 打印到 stdout，不写入 `auths/`。**
> 原版指南说的"按 y 就会写入"不成立，而且 state 文件会被消耗掉、无法重放。
> 正确做法是**接住输出自己落盘**：

```bash
cd <仓库根>/WorkBuddy2API
./login.exe poll > cred.txt
```

然后跑这个脚本（存成 `save_auth.py`）：

```python
# -*- coding: utf-8 -*-
"""把 login.exe poll 打印出的凭据转成 auths/workbuddy-<uid>.json"""
import json, io, os, sys, base64

AUTHS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'auths')
raw = sys.stdin.read()
d = json.loads(raw[raw.find('{'):raw.rfind('}') + 1])

def jwt_exp(tok):
    p = tok.split('.')[1]
    p += '=' * (-len(p) % 4)
    return json.loads(base64.urlsafe_b64decode(p))['exp']

out = {
    "account": {
        "enterpriseId": d.get('enterprise_id', ''),
        "nickname": d.get('nickname', ''),
        "uid": d['uid'],
    },
    "auth": {
        "accessToken": d['access_token'],
        "domain": d.get('domain', 'www.codebuddy.cn'),
        "expiresAt": jwt_exp(d['access_token']),
        "realm": d.get('realm', 'cn'),
        "refreshToken": d['refresh_token'],
    },
}
os.makedirs(AUTHS, exist_ok=True)
path = os.path.join(AUTHS, 'workbuddy-%s.json' % d['uid'])
io.open(path, 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, indent=2))
print('已写入:', path, '|', out['account']['nickname'])
```

```bash
python save_auth.py < cred.txt && rm cred.txt
```

**多账号**：重复 2.3，每个账号生成一个独立 json，网关自动轮换。

### 2.4 验证

```bash
curl http://127.0.0.1:7863/v1/models -H "Authorization: Bearer test_key"
```

> ⚠️ **网关只认 `/v1/...` 前缀**。`/chat/completions`（无 v1）返回 404。

---

## 三、部署 CC Switch

### 3.1 下载

```
https://github.com/farion1231/cc-switch/releases/latest
```

下 `CC-Switch-v<版本>-Windows-Portable.zip`（便携版，免管理员），解压到
`<仓库根>/tools/CC-Switch/`。

> `msi` 安装版在某些环境下会被安全策略拦（`msiexec` 退出码 103 且不生成日志），
> **便携版更稳**。

### 3.2 首次启动

直接跑 `cc-switch.exe`。它会生成：

```
~/.cc-switch/
├── cc-switch.db          # 🔴 v4 起配置全在 SQLite 里，不是 JSON
├── settings.json         # 界面开关
├── live-state.json       # 每个 app 的模式（direct / proxy）
└── logs/cc-switch.log
```

**先完整启动一次，让它把默认表结构建好，再动手改配置。**

### 3.3 开始接管前先记两个位置

| 位置 | 作用 |
|---|---|
| `providers` 表 | 供应商（`settings_config` 存 JSON，`meta` 存 `apiFormat`） |
| `proxy_config` 表 | 路由开关（`proxy_enabled`=总开关，`enabled`=该 app 的接管开关） |

---

## 四、部署 Codex

### 4.1 Codex CLI（必装，桌面版也依赖它的配置目录）

```bash
# 取最新 tag
curl -s -o /dev/null -w "%{redirect_url}\n" https://github.com/openai/codex/releases/latest
# → https://github.com/openai/codex/releases/tag/rust-v0.162.1

# 下 x64 Windows 包
curl -sL -o codex.zip \
  https://github.com/openai/codex/releases/download/rust-v0.162.1/codex-x86_64-pc-windows-msvc.exe.zip
unzip -q codex.zip -d <仓库根>/tools/codex
```

验证：`<仓库根>/tools/codex/codex-x86_64-pc-windows-msvc.exe --version`

> GitHub API 常被限流（HTTP 403），但 `github.com` 本体能通。用
> `releases/latest` 的**重定向**拿版本号，别用 API。

### 4.2 先"活跃"一次

```bash
codex login status
```

跑完 `~/.codex/` 目录就存在了。**CC Switch 接管时要往这里写配置，目录必须先存在。**

### 4.3 Codex 桌面版（可选）

**先试官方渠道**：`https://developers.openai.com/codex/app` → 走 Microsoft Store
（产品 ID `9PLM9XGG6VKS`）。

**装不上就走 §5.3 的 MSIX 绕过方案。**

---

## 五、打通链路

### 5.1 在 CC Switch 里添加供应商（GUI 方式）

1. 顶部切到 **Codex** 标签 → 右上角 **`+`** → **自定义配置**
2. 填：

| 字段 | 值 |
|---|---|
| 供应商名称 | `WorkBuddy2API` |
| API Key | `test_key`（= 网关 `config.json` 里的 `api_key`） |
| API 请求地址 | `http://127.0.0.1:7863` ← **根地址，不要带 `/v1`** |

3. 展开 **高级选项** → **上游格式** 选 **`Chat Completions（需开启路由）`**
   —— **这一步是全篇最关键的操作**，选错成 "Responses（原生）" 路由就不做转换，Codex 必 404。
4. 添加模型（或点"获取模型列表"）。**常用的放第一位**，桌面版默认用第一个。
5. 保存。卡片上出现 **`需要路由`** 徽章 = 格式设置正确。

> 关于 base_url 要不要带 `/v1`：**填根地址**。CC Switch 的 Codex adapter 对
> origin-only 地址会自动补 `/v1`（`src-tauri/src/proxy/providers/codex.rs` 的 `build_url`）。

### 5.2 开启本地路由并接管

**设置 → 路由 → 本地路由**，两个开关都要开：

| 开关 | 作用 |
|---|---|
| **路由总开关** | 启动本地代理服务（`127.0.0.1:15721`） |
| **路由启用 → Codex** | 让 Codex 请求经路由转发 |

Claude / Gemini 保持关闭即可。

接管后 CC Switch 会自动改写 `~/.codex/config.toml`：

```toml
model_provider = "custom"
model = "cn:deepseek-v4-pro"
model_reasoning_effort = "high"
model_catalog_json = "cc-switch-model-catalog.json"

[model_providers.custom]
name = "custom"
base_url = "http://127.0.0.1:15721/v1"
wire_api = "responses"
experimental_bearer_token = "PROXY_MANAGED"
requires_openai_auth = false
```

> v4 用的是 `experimental_bearer_token = "PROXY_MANAGED"`，**没有 `auth.json` 占位符**
> （原版指南 §8 的描述已过时）。

#### 备选：直接改 SQLite（GUI 不方便时）

停掉 CC Switch，跑这个脚本：

```python
# -*- coding: utf-8 -*-
import json, sqlite3, time, os, io

DB  = os.path.expanduser(r'~\.cc-switch\cc-switch.db')
CCS = os.path.expanduser(r'~\.cc-switch')

TOML = '''model_provider = "custom"
model = "cn:deepseek-v4-pro"
model_reasoning_effort = "high"

[model_providers.custom]
name = "WorkBuddy2API"
base_url = "http://127.0.0.1:7863"
wire_api = "responses"
requires_openai_auth = true'''

conn = sqlite3.connect(DB); cur = conn.cursor()
cur.execute("DELETE FROM providers WHERE id=? AND app_type='codex'", ("workbuddy2api",))
cur.execute("UPDATE providers SET is_current=0 WHERE app_type='codex'")
cur.execute("""INSERT INTO providers
 (id,app_type,name,settings_config,website_url,category,created_at,sort_index,
  notes,icon,icon_color,meta,is_current,in_failover_queue,cost_multiplier,
  limit_daily_usd,limit_monthly_usd,provider_type)
 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", (
  "workbuddy2api", "codex", "WorkBuddy2API",
  json.dumps({"auth": {"OPENAI_API_KEY": "test_key"}, "config": TOML}, ensure_ascii=False),
  "http://127.0.0.1:7863/panel/", "custom", int(time.time() * 1000), 1,
  None, None, None, json.dumps({"apiFormat": "openai_chat"}),
  1, 0, "1.0", None, None, None))
cur.execute("UPDATE proxy_config SET proxy_enabled=1, listen_address='127.0.0.1', "
            "listen_port=15721, enable_logging=1, updated_at=datetime('now')")
cur.execute("UPDATE proxy_config SET enabled=0, auto_failover_enabled=0")
cur.execute("UPDATE proxy_config SET enabled=1 WHERE app_type='codex'")
conn.commit(); conn.close()

p = os.path.join(CCS, "live-state.json")
st = json.load(io.open(p, encoding="utf-8"))
st.setdefault("apps", {}).setdefault("codex", {})["mode"] = "proxy"
io.open(p, "w", encoding="utf-8").write(json.dumps(st, ensure_ascii=False, indent=2))

p = os.path.join(CCS, "settings.json")
s = json.load(io.open(p, encoding="utf-8")); s["enableLocalProxy"] = True
io.open(p, "w", encoding="utf-8").write(json.dumps(s, ensure_ascii=False, indent=2))
print("done")
```

**关键三处**（缺一不可）：

1. `providers.meta` = `{"apiFormat":"openai_chat"}` —— 告诉路由上游是 Chat 格式
2. `proxy_config.proxy_enabled=1`（三行镜像）+ `enabled=1`（codex 行）
3. `live-state.json` 里 `codex.mode = "proxy"`

**重启 CC Switch**，日志里出现下面这行就是接管成功：

```
[MODE] codex attach：路由 → 路由，路由 workbuddy2api，客户端配置已重写
```

### 5.3 桌面版：绕过 Store 的系统版本限制

**适用场景**：Windows 版本低于 build 19041（如 LTSC 2019 = 17763），Store 报
"你的电脑上的 Windows 版本不符合此应用的最低要求"。

**原理**：MSIX 本质是 ZIP。清单里的 `MinVersion` 只是 **Store 安装器的闸门**，
不是运行时要求。主程序 `EntryPoint="Windows.FullTrustApplication"` 是 Chromium/Win32 应用，
解包后照样跑。

**取官方 MSIX 直链**（四步）：

```bash
PID=9PLM9XGG6VKS   # = OpenAI.Codex（ChatGPT 桌面版）

# 1) 确认版本要求
curl -s "https://displaycatalog.mp.microsoft.com/v7.0/products/$PID?languages=en-US&market=US" \
  | python -c "import sys,json,re; s=sys.stdin.read(); print(re.search(r'MinVersion=\"[^\"]+\"',s).group(0))"

# 2) 取 WuCategoryId（本例 fdf7dba1-a7bc-4592-ad8e-04aa3b974675）
curl -s "https://storeedgefd.dsx.mp.microsoft.com/v9.0/products/$PID?market=US&locale=en-US&deviceFamily=Windows.Desktop" \
  | python -c "import sys,json; d=json.load(sys.stdin); print(d['Payload']['Skus'][0]['FulfillmentData'])"

# 3) 取直链（必须带浏览器 UA + Referer，否则 Cloudflare 拦）
curl -s -X POST "https://store.rg-adguard.net/api/GetFiles" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36" \
  -H "Referer: https://store.rg-adguard.net/" \
  -d "type=ProductId&url=$PID&ring=Retail&lang=en-US" \
  | grep -oE 'https://[^"]+x64[^"]*\.msix[^"]*'
```

> ❌ **别走 FE3 / Windows Update SOAP 接口**（`fe3.delivery.mp.microsoft.com/ClientWebService/client.asmx`），
> 返回 `a:InvalidSecurity`，需要 WS-Security 签名，纯浪费时间。

**解包运行**：

```bash
unzip -q OpenAI.Codex_x64.msix -d <仓库根>/tools/Codex-Desktop
cd <仓库根>/tools/Codex-Desktop/app
./ChatGPT.exe --disable-gpu --disable-gpu-sandbox
```

> 🔴 **`--disable-gpu` 是必需的**，否则 `GPU process isn't usable. Goodbye.` 直接崩。

**桌面版可用性边界**（实测日志结论）：

| 项 | 状态 |
|---|---|
| 窗口、UI、本地 Codex 会话 | ✅ 正常，读的就是 `~/.codex/config.toml` |
| 自定义模型选择器 | ✅ 能看见（实测它自己选了 `cn:deepseek-v4.1-flash`） |
| 云端会话（durable thread） | ❌ `Sign in to ChatGPT to start a durable thread` |
| 用量面板 / 账号设置 | ❌ `/wham/usage`、`/settings/user` 返回 HTTP 432 |
| 命令沙箱服务 / 开机自启 / 文件关联 / Store 自动更新 | ❌ MSIX 包身份缺失，全都没有 |

**替代路线**：LTSC 2019 → LTSC 2021（19044）支持**原地升级** —— 下载 ISO，在系统内跑
`setup.exe` 选"保留个人文件和应用"，不用重装。但需要 LTSC 2021 的新激活密钥，
且企业机可能不合规。

---

## 六、验证

### 6.1 网关直连

```bash
curl http://127.0.0.1:7863/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_key" \
  -d '{"model":"cn:deepseek-v4.1-flash","messages":[{"role":"user","content":"只回复两个字：通了"}]}'
```

### 6.2 经路由（Responses 协议）

```bash
curl http://127.0.0.1:15721/v1/responses \
  -H "Content-Type: application/json" \
  -d '{"model":"cn:deepseek-v4-pro","input":"只回复两个字：通了","stream":false}'
```

应返回 `"output_text": "通了"`。

### 6.3 Codex CLI 端到端

```bash
cd <仓库根>
./tools/codex/codex-x86_64-pc-windows-msvc.exe exec --skip-git-repo-check "写个快排，只给代码" < /dev/null
```

### 6.4 看日志确认走向

```bash
grep "请求目标" ~/.cc-switch/logs/cc-switch.log | tail -5
```

正常输出：

```
[Codex] >>> 请求目标: http://127.0.0.1:7863/v1/chat/completions (model=cn:deepseek-v4-pro)
```

### 6.5 查额度

```bash
cd <仓库根>/WorkBuddy2API && ./credit.exe
```

> ⚠️ `credit.exe` **只查腾讯的额度接口，不知道账号被封**。真实可用性看
> `data/state.json` 里的 `disabled` 字段。

---

## 七、日常启停

**启动顺序**（记住这个就不会出错）：

```
1) WorkBuddy2API/wb2api.exe        → 网关就绪（127.0.0.1:7863）
2) tools/CC-Switch/cc-switch.exe   → 确认路由运行中 + Codex 开关已开
3) tools/codex/... 或 桌面版        → 直接对话
```

**关闭顺序任意，但网关或路由任一停掉，Codex 就报错。**

存成 `<仓库根>/启动链路.cmd` 可以一键拉起前两步：

```bat
@echo off
cd /d "%~dp0WorkBuddy2API"
start "wb2api" /min wb2api.exe
timeout /t 4 /nobreak >nul
cd /d "%~dp0tools\CC-Switch"
start "" cc-switch.exe
```

**桌面版关闭**：任务管理器里结束所有 `ChatGPT.exe`。它空闲时也会持续发请求，
不用就关掉。

---

## 八、原版指南的错误清单

| # | 位置 | 问题 |
|---|---|---|
| 1 | §2.3 | **`login.exe poll` 非交互下只打印不落盘**，state 会被消耗无法重放。"按 y 就写入"不成立。见 §2.3 |
| 2 | §2.5 | curl 示例标 PowerShell 却用 CMD 的 `^` 换行；且 PowerShell 里 `curl` 是 `Invoke-WebRequest` 别名，`-H`/`-d` 直接报错 |
| 3 | §2.6 / 五 | 说 base_url 填根地址是对的，但没解释**网关只认 `/v1/...`**，`/chat/completions` 是 404 |
| 4 | §三 | CC Switch **v4 起配置全在 SQLite**（`~/.cc-switch/cc-switch.db`），不是 JSON |
| 5 | §8 | 接管后写的是 `experimental_bearer_token = "PROXY_MANAGED"`，**没有 `auth.json` 占位符** |
| 6 | 全篇 | 没提 **http_proxy / HTTP_PROXY 环境变量污染**：从带代理变量的 shell 启动 CC Switch，它会把上游请求也丢进那个代理，报 `upstream connect failed` / 502 |

**另外两条原版没写的**：

- 自定义 provider 默认**不生成** `cc-switch-model-catalog.json`，Codex 会告警
  `Model metadata for X not found`。解决：在 provider 的 `settings_config` 顶层加
  `modelCatalog.models[]`（camelCase：`model` / `displayName` / `contextWindow` /
  `inputModalities` / `reasoningLevels` / `defaultReasoningLevel`），重启即生成。
  可写脚本从 `/v1/models` 自动拉取生成。
- `disable_response_storage` 已被 Codex 废弃（会告警），从 provider config 里删掉。

---

## 九、排查表

| 现象 | 原因 | 解决 |
|---|---|---|
| Codex 报 404 / 找不到 `/responses` | 没开接管，或把上游 Chat 地址直接给了 Codex | 查 `~/.codex/config.toml` 的 `base_url` 是否为 `http://127.0.0.1:15721/v1` |
| 网关 `/v1/responses` 返回 404 | **正常现象** | 网关只有 Chat 接口，这正是要开路由的原因 |
| 供应商卡片没有"需要路由"徽章 | 上游格式选错 | 编辑 → 上游格式改为 `Chat Completions（需开启路由）` |
| `upstream connect failed` / 502 | CC Switch 继承了 `http_proxy` 环境变量 | 清掉代理变量重启 CC Switch |
| 网关返回 `no_healthy_account` | 账号被封或额度耗尽 | `credit.exe` 查额度，`state.json` 查 `disabled` |
| 账号报 `账号存在异常行为，已被限制使用`（403 / code 11140） | 被腾讯风控封禁 | 无法恢复，换账号 |
| 网关启动报 `bind: Only one usage of each socket address` | 7863 被占用 | 关掉旧进程，或改 `config.json` 的 `listen` |
| Codex `/model` 看不到自建模型 | 进程未重启，目录未加载 | 完全退出 Codex 再开 |
| 桌面版启动即 `GPU process isn't usable` | 未加参数 | 加 `--disable-gpu` |
| 桌面版 Store 报"Windows 版本不符合最低要求" | 系统 build < 19041 | 走 §5.3 MSIX 绕过 |
| 桌面版模型选择器里没有自定义模型 | 桌面版上游门控 | 桌面版默认只用配置里的第一个模型，把它放列表第一位 |
| `login.exe poll` 后 `auths/` 没生成文件 | 非交互模式只打印 | 见 §2.3，接住 stdout 自己落盘 |
| 额度烧得飞快 | Codex 单次请求约 1.6 万 token | 换低倍率模型（`cn:hy3` x0.00 / `cn:glm-5.3-flash` x0.06） |

---

## 十、模型倍率速查

| 模型 ID | 计费倍数 | 备注 |
|---|---|---|
| `cn:hy3` | **x0.00** | 最省，192k 上下文 |
| `cn:glm-5.3-flash` | x0.06 | 便宜快 |
| `cn:space-bunny` | x0.08 | 1M 上下文 |
| `cn:deepseek-v4.1-flash` | x0.11 | 日常首选 |
| `cn:minimax-m3` | x0.25 | 512k |
| `cn:deepseek-v4-pro` | x0.51 | 写代码 |
| `cn:kimi-k3-1` | x1.62 | 高质量 |

> 前缀由账号所属版本决定：国内版 `cn:`，国际版 `global:`。
> **以 `/v1/models` 实际返回的 `id` 为准**，别照抄。
