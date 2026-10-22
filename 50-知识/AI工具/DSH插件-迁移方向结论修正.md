---
date: 2026-10-22
tags: [工作, 搞钱, DSH插件, 结论修正, 迁移工具, 重要]
---

# 修正：迁移工具方向我上一轮判断错了

> **上轮我说「国产 AI 工具迁移全空白」——这轮查 npm 实际数据，发现 `dsh-chat-import` 已覆盖 25+ 平台。**
> **包括 Trae、Qoder、Kimi。我必须修正。**

## 一、⭐⭐⭐ 先看证据

### `dsh-chat-import` 的 npm 实际数据（实测 registry.npmjs.org）

| 项 | 数据 |
|---|---|
| 最新版本 | **0.26.2**（2026-10-20 发布） |
| 首次发布 | 2026-08-13 |
| **版本数** | **59 个**（高频迭代） |
| 下载 | 15,933 |
| star | 242 |
| 仓库 | `github.com/Nwflower/dsh-chat-import` |
| 依赖 | `fzstd`（1 个） |
| 体积 | 2.88 MB |

### ⭐⭐⭐ 关键：它的 keywords 列了 20 个平台

```
deepseek-harness, dsh-plugin, dsh, claude-code, codex, chatgpt,
cursor, gemini, antigravity, reasonix, pi-coding-agent, opencode,
zcode, grokbuild, openclaw, hermes, kimi, kimi-cli,
qoder, qoder-cli, workbuddy, trae, trae-work,
sqlite, import, jsonl, migration, transcript
```

### ⭐⭐ npm 描述已从「13 家」升级到「25+」

| 来源 | 说法 |
|---|---|
| **插件索引描述（旧）** | 「把 **13 家** coding agent…导入」 |
| **npm 最新描述** | 「Import conversation history from **25+** AI coding agents…with reverse export」 |

**→ 它一直在扩展，索引里的描述已经过时。**

## 二、⭐⭐ 我上轮的判断，哪些对哪些错

| 平台 | 我上轮说 | **实际** | 判断 |
|---|---|---|---|
| **Trae** | 空白 | **已被 chat-import 覆盖** | ❌ **我错了** |
| **Qoder** | 空白 | **已被 chat-import 覆盖** | ❌ **我错了** |
| **Kimi** | 没提 | 已覆盖（kimi, kimi-cli） | 我漏了 |
| CodeBuddy | 空白 | 未覆盖 | ✅ 对 |
| 通义灵码 | 空白 | 未覆盖 | ✅ 对 |
| Comate | 空白 | 未覆盖 | ✅ 对 |
| MarsCode | 空白 | 未覆盖 | ✅ 对 |
| Windsurf | 空白 | 未覆盖 | ✅ 对 |
| Cline | 空白 | 未覆盖 | ✅ 对 |
| Aider | 空白 | 未覆盖 | ✅ 对 |
| JetBrains | 空白 | 未覆盖 | ✅ 对 |

### ⭐ 结论：我错了 2 个，对了 7 个

| 真空白（仍有机会） | CodeBuddy、通义灵码、Comate、MarsCode、Windsurf、Cline、Aider、JetBrains |
|---|---|
| **已不空白（别做）** | **Trae、Qoder、Kimi** |

## 三、⭐⭐ 我为什么会错（方法论反思）

| 错误原因 | 说明 |
|---|---|
| **① 只看了插件索引的描述** | 索引说「13 家」，我就以为只覆盖 13 家 |
| **② 没查 npm 的 keywords** | keywords 才是完整平台清单 |
| **③ 没查最新版本** | 索引描述是旧的，npm 最新是 25+ |
| **④ 只看名字和描述搜平台名** | 平台名在 keywords 里，不在描述里 |

### ⭐ 教训

> **判断「某个方向是否空白」，必须查 npm 包的 keywords 和最新描述，不能只看插件索引。**
> **索引可能滞后，npm 才是最新真相。**

## 四、⭐⭐ 修正后的迁移方向结论

### 真正还空白的平台（8 个）

| 平台 | 类型 | 用户规模 | 判断 |
|---|---|---|---|
| **CodeBuddy** | 腾讯 AI 编程 | 中 | ✅ 可做 |
| **通义灵码** | 阿里编程助手 | **大（中文最多）** | ✅✅ **最值得** |
| **Comate** | 百度文心快码 | 中 | ✅ 可做 |
| **MarsCode** | 字节 | 中 | ✅ 可做 |
| **Windsurf** | 海外 AI IDE | 中 | ✅ 可做 |
| **Cline** | 开源 VSCode 插件 | 中 | ✅ 可做 |
| **Aider** | 开源 CLI | 小 | 🟡 |
| **JetBrains** | IDE 生态 | 大 | ✅ 可做 |

### ⚠️ 但要注意：dsh-chat-import 还在扩展

| 事实 | 说明 |
|---|---|
| **59 个版本，高频迭代** | 它可能随时补上你选的平台 |
| **它的策略是「全平台通吃」** | 你做一个单平台很容易被它吸收 |
| **它有 15,933 下载的先发优势** | 用户会选覆盖面最广的 |

**→ 做「单平台迁移」可能被它吃掉。要做就做「它做不了的」。**

## 五、⭐⭐⭐ 那什么才是它做不了的？

| 方向 | 为什么它做不了 | 机会 |
|---|---|---|
| **配置/规则迁移**（不是对话） | 它只做对话历史，不做 .cursorrules/AGENTS.md 等 | ✅✅ **真空白** |
| **技能/提示词迁移** | 它只做对话 | ✅✅ |
| **MCP 配置迁移** | 它不做 MCP | ✅✅ |
| **工作区/项目结构迁移** | 它只导对话 | ✅✅ |
| **反向导出到更多平台** | 它只支持反向导出到 Claude Code | ✅ |

### ⭐⭐⭐ 最有价值的空白：配置迁移

| 现在有什么 | 做什么 |
|---|---|
| dsh-config-manager（15,221 下载） | **只做 DSH 自己的配置备份/导入** |
| dsh-chat-import（15,933 下载） | **只做对话历史** |
| **空白** | **把其他工具的「规则/配置/技能」迁到 DSH** |

**具体来说：**

| 迁什么 | 从哪来 | 到哪去 |
|---|---|---|
| `.cursorrules` | Cursor | DSH 的 AGENTS.md |
| `CLAUDE.md` | Claude Code | DSH 的 AGENTS.md |
| `.windsurfrules` | Windsurf | 同上 |
| **自定义 Skills** | Claude Code / Cursor | DSH 的 skills 目录 |
| **MCP 配置** | 各家 | DSH 的 mcpServers |
| **提示词模板** | 各家 | DSH 的 prompt |

## 六、⭐⭐ 修正后的推荐

| 排名 | 做什么 | 理由 | 难度 |
|---|---|---|---|
| **🥇 1** | **规则/配置迁移器** | chat-import 只做对话，配置是真空 | ⭐⭐⭐ 中 |
| **🥈 2** | **Skills 迁移器** | 把各家 skills 收编（skills-management 10,164 下载验证） | ⭐⭐⭐ 中 |
| **🥉 3** | **通义灵码对话迁移** | chat-import 没覆盖，中文用户最多 | ⭐⭐⭐ 中 |
| **4** | CodeBuddy/Comate/MarsCode 迁移 | 都没覆盖，但受众小 | ⭐⭐⭐ 中 |
| ❌ | Trae/Qoder/Kimi 迁移 | **已被覆盖，别做** | — |

## 七、⭐⭐ 一个额外的发现：它的技术门槛

| 项 | 数据 | 含义 |
|---|---|---|
| 依赖 | `fzstd`（1 个） | 用于解压（很多 agent 的日志是压缩的） |
| 体积 | **2.88 MB** | 不大，说明核心逻辑不复杂 |
| 版本数 | 59 | 迭代很勤 |
| 首次发布 | 2026-08-13 | **生态第一天就在** |

**→ 技术门槛中等：主要是「摸清各家数据格式」+「解压」+「转换」。**

**难的不是代码，是「研究每家工具的文件格式」。**

## 八、⭐⭐ 我的诚实说明

| 项 | 说明 |
|---|---|
| **上轮错误** | 我用插件索引的描述判断，没查 npm keywords |
| **已修正** | Trae/Qoder/Kimi 已被覆盖，不是空白 |
| **仍不确定** | chat-import 的 25+ 到底包含哪些（keywords 列了 20 个，描述说 25+） |
| **没验证** | 它对 Trae 的导入是否真的好用 |
| **风险** | 它高频迭代（59 版本），随时可能补上新平台 |
