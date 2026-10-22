---
date: 2026-10-22
tags: [工作, 搞钱, DSH插件生态, 补充数据]
---

# DSH 插件生态 · 补充实测（GitHub 星数 + 变现验证）

> **上一份报告只统计了插件索引，这份补上 GitHub 仓库热度和变现路径的实证。**

## 一、⭐⭐ GitHub 仓库精确星数（实测）

| 仓库 | 星数 | 说明 |
|---|---|---|
| **dsh-market/dsh-market** | **★8,006** | **DSH 内置插件市场——绝对王者** |
| LivXue/dsh-plugin-shop | ★707 | 插件商店 |
| imsai-sh/awesome-deepseek-harness-plugins | ★309 | awesome 清单 |
| beancookie/awesome-dsh-plugin | ★170 | awesome 清单 |
| dshworks/awesome-dsh-plugins | ★23 | awesome 清单 |
| DshMarketPlace/dshmarketplace | ★3 | 几乎无人问津 |
| QT7-C23/DSH-Marketplace | ★0 | 空壳 |

### 关键结论：**一家独大 + 一堆小玩家**

| 观察 | 含义 |
|---|---|
| dsh-market 8,006★，第二名 707★ | **头部领先 11 倍** |
| 后面 4 个加起来不到 1,200★ | 长尾极弱 |
| **但网站（dshopen.org/dshplugin.store）和这些仓库是两回事** | 网站有自己的流量入口 |

## 二、⭐⭐ 插件作者分布（849 个插件）

| 指标 | 数据 |
|---|---|
| 唯一 GitHub 作者数 | **606 人** |
| 头部作者 | perrylink（30 个）、fan56（18）、zhu1090093659（14）、lemonhall（11） |
| **头部作者占比** | 最高才 30/849 = **3.5%** |

**606 个作者摊 849 个插件——极度碎片化，没有人形成垄断。**

### 中国开发者的证据

849 个插件里 **只有 3 个不在 GitHub**：

| 插件 | 托管在 |
|---|---|
| dsh-startup-animation | **gitee.com** |
| @zhangzhian/dsh-devtools | **codeup.aliyun.com** |
| dsh-dhe-lore | **gitee.com** |

**说明：中国开发者已进入这个生态（用国内代码托管）。**

## 三、⭐⭐ 变现路径实证（重要发现）

### 发现 1：dshplugin.store 靠「卖广告位给 API 服务商」赚钱

实测首页广告原文：

> **Sign up for 5,000 credits ($5 value) free — 1,400+ pro APIs for AI Agents — discover and execute via MCP & Skill**

**这是给「AI Agent 专用 API 服务」（1,400+ 专业 API，走 MCP/Skill）打的赞助广告。**

| 含义 | 说明 |
|---|---|
| **商业模式已验证** | 目录站把流量卖给「想触达 DSH 用户的工具厂商」 |
| **客户是谁** | API 服务商、翻墙工具（RoxyBrowser）、AI 工具 |
| **为什么值钱** | DSH 用户 = 开发者 = 高价值付费人群 |

### 发现 2：dshplugin.store 还挂了翻墙工具广告

> **Fingerprints flagging you as a China user? RoxyBrowser fakes a clean overseas environment**

**再次验证：中国 DSH 用户多，且有代理需求。**

### 发现 3：deepseek.stream 已在做平台化

| 功能 | 说明 |
|---|---|
| 需求广场 | 让用户提需求（可能是收费/抽佣的入口） |
| 发布插件/skill | 开发者入口 |
| 排行榜 | 内容/SEO 流量 |
| 登录注册 | 有账户体系 = 可做付费 |

## 四、⭐⭐ 修正后的机会判断

| 机会 | 可行性 | 依据 |
|---|---|---|
| **做全新插件市场** | ❌ **不推荐** | dsh-market 8,006★ 一家独大 |
| **做插件目录/评测站** | ✅ 可以，但要做差异化 | 已有站靠广告变现，但同质化 |
| **做插件精选/榜单** | ✅ **推荐** | 849 个太碎片（606 作者），**帮用户筛选有价值** |
| **做插件广告中介** | ✅ 推荐 | 已有多站卖广告位，可做投放代理 |
| **做插件数据服务** | ✅ 推荐 | 已有 JSON 索引（1.2MB），可做 API/统计 |
| **开发头部插件** | ⚠️ 难 | 中位 7★，要技术 |
| **插件开发服务（B端）** | ✅ 空白 | 生态里几乎没人做 |

## 五、新增 4 条路子（并入总库）

| # | 路子 | 做什么 | 门槛 | 收入模式 |
|---|---|---|---|---|
| 1 | **插件精选榜单** | 从 849 个里筛选推荐（周榜/分类榜） | 会评估+写作 | SEO流量→广告 |
| 2 | **插件广告投放代理** | 帮工具厂商投到各目录站 | 要商务 | 媒介费/返点 |
| 3 | **插件数据服务** | 提供索引 API/统计/趋势 | 要技术 | 订阅费 |
| 4 | **插件本土化（中文）** | 英文插件做中文版/文档 | 要双语 | 服务费 |

## 六、数据文件

| 文件 | 内容 |
|---|---|
| `_dsh_index.json` | 849 插件索引（含 606 作者） |
| `_dsh_content.json` | 11 站点抓取 |
| `_dsh_dshpluginstore.html` | dshplugin.store 完整页（含广告实证） |
