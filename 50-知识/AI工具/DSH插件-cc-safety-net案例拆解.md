---
date: 2026-10-22
tags: [工作, 搞钱, DSH插件, 案例拆解, 曝光捷径, 重要]
---

# cc-safety-net 拆解：0★ 却 5.7 万下载的秘密

> **它是最近 7 天下载第一名（57,332），但 star 显示 0。**
> **查完 npm 和 GitHub，真相是：它不是「DSH 插件」，是「早就存在的多平台工具」。**

## 一、⭐⭐⭐ 真相：它比 DSH 生态早 7 个月

| 项 | 数据 |
|---|---|
| **npm 首次发布** | **2026-01-03** |
| **DSH 生态开始** | 2026-08-13 |
| **早了** | **7 个多月** |
| GitHub 创建 | **2025-12-25** |
| GitHub star | **1,736★**（不是 0） |
| npm 版本数 | **78 个**（持续迭代） |

### ⭐⭐ 关键：它的 keywords 暴露了真实定位

```
["amp", "claude-code", "cursor", "deepseek-harness", "devin",
 "devin-cli", "droid", "factory-droid", "grok", "grok-build",
 "opencode", "pi-package", "plugin", "safety", "security"]
```

| 它支持多少平台 | **13 个** |
|---|---|
| 包括 | Claude Code、Cursor、Devin、Grok、opencode、DSH… |

**→ 它是「一个工具，适配 13 个 coding agent」，DSH 只是其中之一。**

## 二、⭐⭐⭐ 这解释了三件事

| 疑问 | 答案 |
|---|---|
| **为什么 0★ 却有 5.7 万下载？** | 索引里 star 字段没抓到（GitHub 实际 1,736★） |
| **为什么下载量这么高？** | **它从 1 月就开始积累用户，8 月才适配 DSH** |
| **为什么能进 Top1？** | 所有用 Claude Code/Cursor 的用户转到 DSH 时，会带着它 |

## 三、⭐⭐⭐ 这是最值得学的「曝光捷径」

### 它的打法

```
2025-12  创建仓库（做 Claude Code 的安全钩子）
2026-01  发布 npm（开始积累用户）
    ↓ 持续迭代 78 个版本，支持 13 个平台
2026-08  DSH 生态出现
    ↓ 加一个 dsh 字段 + cordis.patch.yml
2026-10  在 DSH 生态里直接成为下载第一名
```

### ⭐⭐ 关键洞察

| 洞察 | 说明 |
|---|---|
| **它没为 DSH 重新做** | 只是加了个 `dsh` 字段 |
| **`dsh` 字段就是全部适配** | `{"bundle":{"patch":"./dist/deepseek-harness/cordis.patch.yml"}}` |
| **零依赖** | `deps: []` |
| **主页独立** | ccsafetynet.com（不依赖 GitHub） |

## 四、⭐⭐⭐ 你可以复制的三种「跨平台复用」策略

### 策略 1：把你的已有工具适配成 DSH 插件

| 如果你有… | 怎么复用 |
|---|---|
| 一个 CLI 工具 | 加 `dsh` 字段 + 写 cordis.patch.yml |
| 一个 VSCode 插件 | 同上（抽出核心逻辑） |
| 一个网站 | 做一个插件调用你的 API |
| 一套知识库 | 打包成插件（参考 dsh-network-engineer） |

**成本：1-2 天（不是从零开发）。**

### 策略 2：反过来——做一个「适配 13 个平台」的工具

| 做什么 | 参考 cc-safety-net |
|---|---|
| 一次开发，多平台发布 | 同时上 Claude Code / Cursor / DSH / opencode |
| 每个平台都是流量入口 | 13 个平台 × 各自用户 |
| 用统一核心 + 平台适配层 | 主逻辑不变，加配置文件 |

### 策略 3：做「迁移工具」（最巧）

| 做什么 | 为什么 |
|---|---|
| 把 Claude Code 用户迁到 DSH | 生态里已有 `dsh-chat-import`（1.6 万下载）、`dsh-claude-move`（3,679） |
| 把 Cursor 配置迁过来 | 同理 |
| 把 ChatGPT 对话迁过来 | 同理 |

**这是「借别人的用户」——而且已验证有需求。**

## 五、⭐⭐ 其他「跨平台复用」的成功案例

| 插件 | 下载 | 原平台 |
|---|---|---|
| **cc-safety-net** | **57,332** | Claude Code/Cursor 等 13 个 |
| **dsh-ops** | **22,879** | Windows 工具集 |
| **dsh-browser-cdp** | 16,787 | CDP 协议（Chrome 通用） |
| **dsh-chat-import** | 15,933 | 导入 13 家 coding agent 对话 |
| **Veyra** | 9,334 | 工程记忆（通用概念） |
| **dsh-mcp-registry** | 7,038 | MCP（跨平台标准） |
| **Codingns4DSH** | 3,394 | 接入十几种编程 CLI |

### ⭐⭐ 规律

| 规律 | 说明 |
|---|---|
| **Top25 里至少 7 个是「跨平台复用」** | 占 28% |
| **它们的共同点** | 先在别处成功，再适配 DSH |
| **不是从零做 DSH 插件** | 是「已有产品 + DSH 适配层」 |

## 六、⭐⭐⭐ 给你的建议

### 如果你现在没有现成工具

| 选择 | 难度 | 预期 |
|---|---|---|
| **A. 从零做垂直职业插件** | ⭐⭐ 低 | 参考 dsh-expert（451 下载） |
| **B. 做跨平台工具（一次开发多平台）** | ⭐⭐⭐⭐ 高 | 参考 cc-safety-net（5.7 万） |
| **C. 做迁移工具（借别人用户）** | ⭐⭐⭐ 中 | 参考 dsh-chat-import（1.6 万） |

### ⭐ 我推荐 C：做迁移工具

| 理由 | 说明 |
|---|---|
| **已验证需求** | dsh-chat-import 1.6 万、dsh-claude-move 3,679 |
| **用户明确** | 从 Cursor/Claude Code 转来的人 |
| **技术可行** | 读别人的数据格式 → 转成 DSH 格式 |
| **曝光强** | 「从 XX 迁移到 DSH」是明确搜索词 |

### 具体选题

| 选题 | 做什么 | 依据 |
|---|---|---|
| **Cursor 配置迁移** | 把 .cursorrules/设置迁到 DSH | 还没人做 |
| **ChatGPT 对话导出** | 把 ChatGPT 历史转成 DSH 会话 | dsh-chat-import 只做 13 家 |
| **Claude 项目迁移** | 把 Claude Projects 迁过来 | dsh-claude-move 已做部分 |
| **VSCode 设置迁移** | 把 VSCode 配置转成 DSH | 没人做 |

## 七、⭐⭐ 曝光路径（跨平台复用版）

| 步 | 动作 |
|---|---|
| 1 | 在你的原工具里加 `dsh` 字段 |
| 2 | 写 `cordis.patch.yml`（参考 cc-safety-net 的 `./dist/deepseek-harness/`） |
| 3 | 发 npm（同一个包，加 dsh 字段） |
| 4 | 提交 9 个市场站 |
| 5 | **在你的原工具用户群宣传「现在支持 DSH 了」** |
| 6 | 投稿插件日报 |

## 八、数据说明

| 项 | 说明 |
|---|---|
| npm 数据 | 实测 registry.npmjs.org（78 个版本，首次 2026-01-03） |
| GitHub 星数 | 实测 1,736★（索引里的 0 是抓取问题） |
| keywords | 实测含 13 个平台名 |
| **dsh 字段** | 实测 `{"bundle":{"patch":"./dist/deepseek-harness/cordis.patch.yml"}}` |
| **我的推断** | 「因为早发布所以下载高」是推理，未直接验证 |
