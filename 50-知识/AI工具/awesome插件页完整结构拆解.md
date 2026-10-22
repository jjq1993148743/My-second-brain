---
date: 2026-10-22
tags: [工作, 搞钱, DSH插件, 页面结构, README抓取, 实操]
---

# awesome 插件页完整结构拆解（它抓你的 README）

> **抓了 awesome 的插件详情页（39KB HTML / 261 行文本），看清了它到底展示什么。**
> **关键发现：它完整抓取 README 内容，还识别了「简体中文」链接。**

## 一、⭐⭐⭐ 页面的完整结构（实测 261 行）

| 位置 | 内容 |
|---|---|
| 1 | **title**：`MichengAI/dsh-code-review — dsh plugin · Git & Code Review` |
| 2 | 面包屑：`awesome-dsh-plugin` / `GitHub ↗` / `All plugins` / `Git & Code Review` |
| 3 | 插件名：`dsh-code-review` |
| 4 | 标签：`DeepSeek Harness Plugin` |
| 5 | **作者**：`MichengAI/` |
| 6 | **Stars：`★ 11`** |
| 7 | **Downloads (30d)：`58,982`** |
| 8 | **Category** |
| 9 | **Added：`2026-09-18`** |
| 10 | **npm：`@michengai/dsh-code-review`** |
| 11 | **英文描述**（就是 description） |
| 12 | **Install 区块**（两条命令：npm / GitHub） |
| 13 | **安全警告**（长段说明） |
| 14 | **README 区块**（完整内容！） |

## 二、⭐⭐⭐ 三个最有价值的发现

### 发现 1：它完整抓取 README

**README 区块从第 33 行开始，内容包含：**

```
README
DSH Code Review
Start a review in your conversation. Let an independent agent inspect the code and bring back findings.
简体中文          ← 它识别了语言切换链接！
Developer docs
Changelog
Apache-2.0
DSH Code Review is a community code review plugin for DeepSeek Harness, packaged as...
Host compatibility
The current version supports these exact DSH release candidates: 0.2.0-rc.1, 0.2.0-rc.2, 0.2.1-rc.1...
```

**→ README 的前几段全部被展示在页面上。**

### ⭐⭐ 发现 2：它自动识别「简体中文」链接

| 现象 | 说明 |
|---|---|
| README 里有「简体中文」 | 被单独提取出来展示 |
| 说明 | **它支持多语言 README** |

**→ 如果你的 README 有中文版链接，它可能会展示。**

### 发现 3：它显示 Downloads (30d)

| 数据 | 值 |
|---|---|
| **Downloads (30d)** | **58,982** |
| Stars | 11 |

**→ 它按「30 天下载」展示，不是总下载。这比 star 更有说服力。**

## 三、⭐⭐ Install 区块的写法（学它）

### 它展示两条命令

```bash
# from npm (prebuilt)
dsh plugin --profile web add @michengai/dsh-code-review

# from GitHub (first run asks for allowBuilds approval — follow the hint, retry)
dsh plugin --profile web add github:MichengAI/dsh-code-review
```

### ⭐⭐ 关键细节

| 细节 | 说明 |
|---|---|
| **两条命令** | npm 版（预构建）+ GitHub 版 |
| **注释说明差异** | 「from npm (prebuilt)」vs「from GitHub (first run asks for allowBuilds approval)」 |
| **有「copy install」按钮** | 方便复制 |

### ⭐ 我们的 README 有没有这两条

| 现状 | 只有 npm 命令 |
|---|---|
| 建议 | **加 GitHub 安装命令**（`dsh plugin --profile desktop add github:用户名/仓库`） |

## 四、⭐⭐⭐ 它还放了长段安全警告

### 原文（摘录）

> **「Any plugin you install runs third-party code with your own permissions — it can read your files, use your credentials, and reach the network, and tool approvals don't sandbox it.」**

> **「GitHub-sourced plugins also run build scripts at install time — pnpm blocks those until you allow them」**

### 这说明什么

| 说明 |
|---|
| **站点很重视安全** | 它在提醒用户风险 |
| **你的插件如果声明了权限，会更容易被信任** | 我们已经在 README 里写了「权限声明」 |
| **GitHub 安装会触发构建脚本** | npm 安装更安全（预构建） |

**→ 我们的 README 有「权限声明」区块（不联网/不执行命令/不访问凭据），这正好对上。**

## 五、⭐⭐ 对我们 7 个插件的优化建议

| # | 优化 | 依据 | 优先级 |
|---|---|---|---|
| **1** | **加英文 description** | 页面直接展示英文描述 | ✅ **已做** |
| **2** | **README 前几段写清楚价值** | 页面展示 README 开头 | 🟡 中 |
| **3** | **加 GitHub 安装命令** | 它展示两条命令 | 🟡 中 |
| **4** | **保留「权限声明」区块** | 站点重视安全 | ✅ 已有 |
| **5** | **加「简体中文」链接**（如果有英文版） | 它识别语言切换 | 🟢 低 |
| 6 | README 里写 Apache-2.0 / MIT | 它展示 License | ✅ 已有 |

## 六、⭐⭐ 一个反直觉的发现

### 它展示的是「30 天下载」不是总下载

| 数据 | 含义 |
|---|---|
| Downloads (30d): 58,982 | **近 30 天下载** |
| Stars: 11 | star 很少 |

### ⭐⭐ 这说明

> **这个站用「近 30 天下载」作为核心指标，而不是 star。**
> **所以「新插件只要下载涨得快，就能排在前面」——这对新插件友好。**

**→ 我们的插件如果能快速起量，在 awesome 上的排名会很好看。**

## 七、⭐⭐ 完整页面结构图

```
┌────────────────────────────────────────┐
│ title: owner/repo — dsh plugin · 分类   │  ← SEO 关键
├────────────────────────────────────────┤
│ 面包屑 / 插件名 / DeepSeek Harness Plugin│
│ 作者 / ★Stars / Downloads(30d)          │  ← 数据展示
│ Category / Added / npm 包名             │
├────────────────────────────────────────┤
│ 英文描述（description）                  │  ← 你写的 description
├────────────────────────────────────────┤
│ Install                                 │
│   # from npm (prebuilt)                 │  ← 两条命令
│   # from GitHub (需 allowBuilds 批准)   │
├────────────────────────────────────────┤
│ ⚠️ 安全警告（长段）                      │
├────────────────────────────────────────┤
│ README                                  │
│   标题 / 一句话 / 简体中文链接            │  ← 你的 README 开头
│   Developer docs / Changelog / License   │
│   正文前几段                            │
│   Host compatibility                    │
└────────────────────────────────────────┘
```

## 八、⚠️ 诚实说明

| 项 | 说明 |
|---|---|
| **页面结构是实测** | 抓了 39KB HTML，261 行文本 |
| **README 被抓取是实测** | 页面第 33 行开始有 README 区块 |
| **「识别简体中文」是观察** | README 里的「简体中文」被单独展示 |
| **未验证** | 我们的插件被抓取后长什么样 |
| **Downloads (30d) 是实测** | 页面上明确写 `Downloads (30d)` |
