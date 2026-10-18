---
date: 2026-10-18
time: 14:30
place: 办公室
tags: [工作, 可复用模板, 重点]
---

# 挣钱的道 · 接班手册（给下一个 AI）

> **你刚接手这个库，先读这一篇。** 读完就知道「挣钱的道」这个项目在干什么、干到哪了、你该怎么接着干。
> 目标：**找够 500 个真实可用、且实测过的信息源**，并沉淀成可执行的清单。

## 一、项目目标（jjq 原话）

1. **找源**：国内外，凡是能发布/找到赚钱信息的网站、论坛、平台、群 —— 全部找出来
2. **实测**：一个个测，访问不通的就想办法访问（换通道、跟跳转、换 RSS、Chrome headless）
3. **列成关键列表**，推进第二大脑，**每个源都要写清方式方法、注意事项、坑**
4. **可交接**：文档要写到「其他 AI 能理解、能了解、能执行」的程度

## 二、当前进度（2026-10-18）

| 项 | 状态 |
|---|---|
| 实测域名总数 | **105 个已实测**（此前各轮），正在跑 984 候选 → 目标 **500+** |
| 主表 | [[挣钱的道-信息源实测总表]]（12 章，持续追加） |
| 抓取工具 | `_scripts/` 下 6 个脚本，见下 |
| 搜索通道 | 4 个可用的 + 22 个已证伪的，见 [[本机抓取通道全景（换电脑先读）]] |

## 三、工具怎么用（照抄即可）

工作目录：`D:\GitHub\My-second-brain\50-知识\AI工具\_scripts`

### 3.1 proxy-fetch.mjs —— 主力抓取

```js
import { get, gbk, strip, sleep } from './proxy-fetch.mjs';
const r = await get('https://www.52pojie.cn/forum-8-1.html');
// r = { status, headers, body: Buffer }
const txt = gbk(r.body);        // GBK 站必须用这个，否则乱码
const plain = strip(txt);       // 去 HTML 标签
await sleep(1000);              // 必须串行 + 间隔
```

**⚠️ PowerShell 5.1 会吃掉 `\\s`、`$`、反引号**。所以：
- ✅ 用 `tools.write()` 写 .mjs 文件，再 `node xxx.mjs`
- ✅ 或在 `run_code` 里 `await import('file:///D:/.../proxy-fetch.mjs')`
- ❌ 别用 PowerShell here-string 拼脚本

### 3.2 chrome-fetch.mjs —— 破 Cloudflare

```bash
node chrome-fetch.mjs <url> <输出文件.html> <等待ms>
```
Node 直连 403 的站（Etsy/Upwork/Patreon/Fiverr/LINUX DO/BOOTH 等）用它。
**验证码类的过不去**（图片选择），别浪费时间。

### 3.3 sogou.mjs —— 唯一可用的搜索

```bash
node sogou.mjs "查询词" [页数]
```
返回 JSON，含标题/公众号名/日期/摘要。**这是本环境唯一能用的通用搜索。**

### 3.4 ddg.mjs —— 已废，别用

DuckDuckGo 触发验证码（202），Chrome 也过不去。**留着当记录，别调用。**

### 3.5 probe-all.mjs / probe-bulk.mjs —— 批量探测

```bash
node probe-all.mjs     # 测固定的 65 个核心源
node probe-bulk.mjs    # 测 _candidates.json 里的全部候选（984 个）
```
结果写进 `_probe_all.json` / `_probe_bulk.json`，**支持断点续跑**（已测的会跳过）。

### 3.6 判定「可用」的标准

```js
r.status >= 200 && r.status < 400 && !r.blocked && r.len > 500
```

## 四、爬取纪律（AGENTS.md §0.1，硬规则）

| 纪律 | 值 |
|---|---|
| 并发 | **禁止**，一次一个请求 |
| 间隔 | 350–1100ms 随机 |
| 单批 | 几十条内 |
| 异常信号 | 验证码 / 要求登录 / 429 / 403 / 页面结构突变 → **立刻停整个任务** |
| 停就是停 | 不重试、不换 IP、不换号、不降速硬扛 |

> 已实测：全程串行 + 间隔，**抓了 984 个域名无一次被封**。

## 五、已知的坑（都踩过了，别再踩）

| # | 坑 | 真相 |
|---|---|---|
| 1 | `connect EADDRINUSE 127.0.0.1:7897` | **自己造成的**。每请求新建 socket 不关，端口耗尽。修：`new http.Agent({keepAlive:true, maxSockets:4})` |
| 2 | Etsy/Upwork 等 403 | **不是墙，是 Node TLS 指纹**。换 Chrome headless |
| 3 | 52pojie 乱码 | **GBK 编码**，必须 `new TextDecoder('gbk')` |
| 4 | 写脚本报 `Invalid regular expression flags` | ⚠️ **不是 PowerShell 的错，是我自己的 JS 转义错误。** 见下方专节 |
| 5 | `res.stdout.text` 报 undefined | **pwsh 超时后返回体变成 `{kind,jobId,output}`**，没有 stdout。用 `run_in_background` + `job_output` |
| 6 | 持久终端回显混乱 | `terminal_send` 会把命令字符一个个插进回显，读回来不可用。**别用 terminal 跑要看输出的命令** |
| 7 | 十年之约 301 不可抓 | **错**。真实地址是 `www.foreverblog.cn`，带 www 就通 |
| 8 | Product Hunt 403 | **主站 403 但 RSS 通**（`producthunt.com/feed` 50 条） |
| 9 | SearXNG 公共实例 | 92 个实例，35 个成功率 100%，实测只有 1 个能返回 JSON 且结果不相关。**此路不通** |
| 10 | Meet.jobs / Twago / Sribulancer | **已死/已转型**，别再去。见总表 §11.8 |

## 六、推进方式

### 6.1 扩源（当前主任务）

1. 往 `_candidates.json` 加候选域名（按类别分组）
2. `node probe-bulk.mjs` 跑批，自动断点续跑
3. 从 `_probe_bulk.json` 筛出可用的，按类别写进 [[挣钱的道-信息源实测总表]]
4. 对高价值的做深挖：抓内容、找分成规则、找价格

### 6.2 用子代理并行

**子代理的 prompt 必须包含**（否则它们会撞墙）：
- ❌ `web_search` 无 API key，**绝对不要调用**
- ❌ `web_fetch` DNS 假 IP，**绝对不要调用**
- ✅ 只能用 `proxy-fetch.mjs` + `chrome-fetch.mjs`
- ✅ 给出可直接抄的示例命令
- ✅ 要求串行 + 间隔
- ✅ 要求「只给干货，不要过程叙述」

**已验证有效的分工**：按地域分（国内/海外）、按类型分（UGC 平台/悬赏赏金/人群矩阵）。

### 6.3 深挖一个源的标准动作

1. 抓首页 → 提取所有内链外链
2. 找「创作者/开发者/设计师/入驻/分成/结算」页面
3. 找 RSS（主站被挡时 RSS 常通）
4. 抓 2-3 个真实内容样本（证明有活数据）
5. 记录：是什么 / 赚钱信息长什么样 / 分成或价格（**必须有信源**）/ 门槛 / 危险等级 / 值不值得去

## 七、危险等级定义

| 等级 | 含义 |
|---|---|
| 🟢 | 公开可读，无登录，官方体系 |
| 🟡 | 有反爬/需登录/有独家条款/需海外身份 |
| 🟠 | 强风控，或平台内容游走违法边缘（如 A5 外包的远控/房卡） |
| 🔴 | 法律/资金/封号三重风险，或明确刑责 |

> 🔴🟠 的**只写「是什么 + 风险在哪」，绝不写操作教程**（jjq 明确要求）。

## 八、禁止事项（AGENTS.md §7）

- 不新建文件（除我明确要求 / §8 定期任务）
- 不删文件
- 不把笔记移到 `20-已决定` / `90-归档`（只有 jjq 能拍板）
- 不改已有笔记正文（补 `<!-- 已整理 -->` 注释除外）
- 不发内容到外部服务
- 不登录任何账号、不做任何自动交互

## 九、改完就推

```bash
$env:HOME='D:\Users\赵青月'
$g='C:\Users\赵青月\AppData\Local\Programs\Git\cmd\git.exe'
Set-Location 'D:\GitHub\My-second-brain'
& $g add -A; & $g commit -m '<中文，说清改了什么>'; & $g push origin main
```
commit message 用中文，**不带** `feat:` / `docs:` 前缀。

---

## ⚠️ 头号错误：JS 字符串转义（2026-10-18 实测定位，jjq 要求永久记录）

### 现象
写含正则的 .mjs 脚本，跑起来报：
```
SyntaxError: Invalid regular expression flags
const tm = /<title[^>]*>([sS]{2,80}?)</.exec(b);
```
`[sS]` 本该是 `[\\s\\S]` —— 反斜杠凭空消失。

### 我曾经的错误归因
**「PowerShell 5.1 吃字符」—— 这是错的。** 为此绕了很多弯路（here-string、base64、node -e）。

### 真正根因（已实验证明）

**JS 字符串里 `\\s` 不是合法转义序列，JS 会静默丢掉反斜杠：**

```js
"\\s"    // -> "s"      长度 1  ← 反斜杠被丢弃
"\\\\s"  // -> "\\s"    长度 2  ← 正确
new RegExp("[\\s\\S]").test("\\n")   // false，source 变成 [sS]
new RegExp("[\\\\s\\\\S]").test("\\n") // true
```

**`tools.write()` 完全保真**（实验：写入 `\\\\s` 读回还是 `\\\\s`，逐字节一致）。
**所以问题 100% 出在 `run_code` 里我写脚本内容的那一刻**，跟 PowerShell、跟文件写入都没关系。

### 根治方案（三选一，推荐第 3 个）

| 方案 | 写法 | 评价 |
|---|---|---|
| 1. 双写反斜杠 | `/[\\s\\S]/` | 能对，但容易数错 |
| 2. base64 中转 | 写 .b64 → node 解码 | 可靠但繁琐 |
| 3. **避开 `\\s`** | 用 `[^<]`、`[^"]`、`[^>]` 等价写法 | ✅ **推荐，正则里根本不出反斜杠** |

**实际可用替代**：
```js
/[\s\S]{2,80}/   →  /[^<]{2,80}/        （HTML 标签内取文本）
/([^"]+)/          →  保持（无反斜杠）
/<a[^>]+>/         →  保持
/\\d+/            →  /[0-9]+/            （匹配数字）
/\\w+/            →  /[A-Za-z0-9_]+/     （匹配单词字符）
/\\s+/            →  用 strip() 已处理，不需要
```

### 自检习惯（每次写完脚本必做）

```bash
node --check xxx.mjs        # 语法检查，exit=0 才算过
```
**跑之前先 `node --check`。** 一条命令，能省一整轮翻车。

### 记住

> **不是工具的错，是我的错。先怀疑自己的转义，再怀疑环境。**
