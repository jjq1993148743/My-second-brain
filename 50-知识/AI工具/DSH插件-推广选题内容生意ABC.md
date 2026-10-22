---
date: 2026-10-22
tags: [工作, 搞钱, DSH插件, 推广渠道, 选题规律, 内容生意, 重要]
---

# DSH 插件：推广渠道 + 选题规律 + 内容生意（A/B/C 全数据）

> **你的思路链：写插件 → 推广 → 挂广告 → 赚钱。这份报告给每一环填数据。**

## ⭐ 先说一个关键发现：生态每天新增 280 个插件

> 实测公众号原文：「DSH插件日报·2026-10-19：**昨晚到今晚，DSH插件库又蹿出 280 个新仓库**」

**这意味着：素材极多 + 竞争在加速 + 曝光越来越难。**

---

# A. 投稿渠道清单（13 个，带具体入口）

## A1. 插件市场/目录站（直接提交）

| # | 站点 | 提交入口（实测） |
|---|---|---|
| 1 | **dshopen.org** | 索引仓库：`github.com/polang233/dsh-plugin-index`（提 PR） |
| 2 | **dsh-plugin.org** | `/submit` 页面 + 仓库 `github.com/dshplugin/dsh-plugin-hub` |
| 3 | **dshmarketplace.dev** | `/submit` + **`/api-docs`（有安装检查 API）** |
| 4 | **dshplugin.store** | `/tutorials` + 站长 GitHub `github.com/LinXiaoTao` |
| 5 | **deepseek.stream** | 站内「发布插件/skill」（部署标记含 browser-plugin-publishing） |
| 6 | **dshmarket.com** | 内置市场 `/browse/#docs` |
| 7 | **awesome-dsh-plugin.com** | ⭐ **新发现**：插件详情页 `/p/{owner}/{repo}/` |
| 8 | **dsh-plugin-market.vercel.app** | 站内提交 |
| 9 | **deepseek1024.com** | Plugin Store & Rankings（有筛选审核） |

## A2. GitHub 渠道（免费且长效）

| # | 渠道 | 怎么做 |
|---|---|---|
| 10 | **topic 标签** | 给仓库打 `dsh-plugin` 标签 → 进入 `github.com/topics/dsh-plugin`（21,513 仓库） |
| 11 | **awesome 清单 PR** | `awesome-dsh-plugin/awesome-dsh-plugin`、`imsai-sh`（★309）、`beancookie`（★170）、`dshworks`（★23） |
| 12 | **官方仓库联动** | DeepSeek Harness 官方 `docs/architecture.md`、Discussions |

## A3. 中文内容渠道（需要投稿/自建）

| # | 渠道 | 状态 |
|---|---|---|
| 13 | **插件日报类公众号** | 已有 **3+ 家在日更**（见 C 部分），可投稿 |
| 14 | V2EX | 已有开发者发长文（Cordis 踩坑） |
| 15 | 知乎 | 有专门问题（已 34 个回答） |
| 16 | 小红书/B站 | 录安装教程视频 |

---

# B. 20 个 500★+ 插件拆解：凭什么火

## B1. 完整名单（按星数）

| 星数 | 插件 | 类别 | 做什么 |
|---|---|---|---|
| 983★ | **clearai-dsh** | workflow | 研究整理为领域本体 |
| 901★ | **dsh-vision-toolkit** | tools | 图片问答/OCR/目标定位/界面还原 |
| 858★ | **dsh-openwrite** | workflow | 小说大纲/人物/批注/审稿 |
| 790★ | **modsearch** | tools | 搜索网页和 X 内容 |
| 722★ | **dsh-genui** | interface | 交互图表/表单/流程图 |
| 682★ | **dsh-ads** | appearance | 恶搞门户网站（广告位推荐真实插件） |
| 673★ | **dsh-thoughtdag** | interface | 会话转思维图 |
| 666★ | **dsh-image-gen** | workflow | 图片生成接 ComfyUI |
| 664★ | **dsh-working-activity** | interface | Agent 实时工作状态 |
| 644★ | **anysearch-dsh** | tools | 网页搜索+正文抓取 |
| 621★ | **dsh-mnemon** | memory | 可组合记忆系统 |
| 621★ | **dsh-mnemon(轻上下文)** | memory | 同仓库扩展 |
| 621★ | **dsh-mnemon(范围)** | memory | 同仓库扩展 |
| 579★ | **dsh-univer-office** | tools | Office 表格/文档/演示 |
| 557★ | **dsh-mobile** | integrations | 手机浏览器/App 访问 DSH |
| 556★ | **dsh-synapse** | interface | 会话/分支拖拽地图 |
| 547★ | **dsh-free-search** | tools | 多引擎搜索+失败切换 |
| 544★ | **misakanet** | memory | 失败案例检索 MCP |
| 536★ | **dsh-postiz** | integrations | 社媒发布（MCP） |
| 512★ | **dsh-invoice-downloader** | tools | 邮箱发票下载+OCR+Excel |

## B2. ⭐ 五条选题规律（这是最有价值的部分）

### 规律 1：补 DSH 本身的短板（最主流）

| 补什么短板 | 插件 | 说明 |
|---|---|---|
| **搜索** | modsearch、anysearch、free-search（**3个！**） | DSH 缺搜索 → 三个都火 |
| **图片** | vision-toolkit、image-gen | DSH 不能看图/生图 |
| **Office** | univer-office、office-tools | DSH 不能编辑文档 |
| **记忆** | mnemon、misakanet | DSH 没有长期记忆 |
| **移动端** | dsh-mobile | 只能在电脑用 |

**结论：DSH 缺什么，做什么，就有机会火。搜索是最缺的（3个都进 500★）。**

### 规律 2：让 AI 的工作「看得见」

| 插件 | 做什么 |
|---|---|
| dsh-genui | 交互图表/表单/流程图 |
| dsh-thoughtdag | 会话转思维图 |
| dsh-working-activity | 实时状态（阶段/工具/耗时） |
| dsh-synapse | 会话拖拽地图 |

**规律：把不可见的过程可视化，就能拿到星。**

### 规律 3：垂直工作流（解决特定职业痛点）

| 插件 | 垂直领域 |
|---|---|
| dsh-openwrite | 小说创作 |
| dsh-invoice-downloader | 财务报销 |
| clearai-dsh | 研究/知识管理 |

### 规律 4：好玩/话题性也能火

| 插件 | 为什么火 |
|---|---|
| **dsh-ads（682★）** | 恶搞 2005 年门户网站，塞满假广告；**广告位推荐真实插件** |

**⚠️ 这条对你特别重要：dsh-ads 证明「广告位」在生态里已经是玩法，而且它能火说明至少有流量。**

### 规律 5：公司/团队出品更容易起量

| 插件 | 出品方 |
|---|---|
| dsh-univer-office | **DreamNum Co., Ltd.**（公司） |
| dsh-postiz | **Nevo David**（Postiz 创始人） |
| anysearch | AnySearch Team |

## B3. 类别分布（20个的）

| 类别 | 数量 |
|---|---|
| tools | 6 |
| interface | 4 |
| workflow | 3 |
| memory | 3 |
| integrations | 2 |
| appearance | 1 |

---

# C. 「插件日报」内容生意：做法和收入

## C1. ⭐ 已经有人在日更（至少3家）

| 公众号 | 内容 |
|---|---|
| **黒鲸鱼插件小雷达** | DSH 插件日报（10-17、10-18、10-19、10-20 连续日更） |
| **Rubbish Science** | DSH 插件日报（10-20） |
| **数据码农** | DSH 插件日报 |

## C2. 日报的内容格式（可直接抄）

实测格式：

```
DSH 插件日报 · 2026-10-19（附详细名单）

昨晚到今晚，DSH 插件库又蹿出 280 个新仓库。
我顺着名单翻了一圈，生态明显在往两个方向长……

zangoose335/dsh-todo-assistant ★0 — 会话中记录待办，并自动沉淀相关上下文
Nicolas-One/dsh-dsml-reasoning-guard ★0 — 从推理内容里捡回被藏起来的工具调用
hx95270000-lang/dsh-mc-bridge ★0 — Minecraft 控制桥
```

**模式：列新增插件（owner/repo + 星数 + 一句话说明）+ 一句趋势观察。**

## C3. ⭐ 素材量：每天 280 个新插件

| 指标 | 数据 |
|---|---|
| 每日新增仓库 | **280 个** |
| 素材来源 | GitHub topic:dsh-plugin（21,513 仓库）+ 各站索引 |
| 结论 | **素材永远不缺，缺的是筛选和表达** |

## C4. 收入模式（实测线索）

| 模式 | 实测证据 |
|---|---|
| **公众号流量主（广告分成）** | 「公众号收益日报 #流量主 收入波动」多篇在做 |
| **量级参考** | 「百粉流量主经营日报：**昨日广告收入 1.51 元**，环比暴涨455%」 |
| **垂直号议价更强** | 「垂直领域实则具有更强的议价和变现能力」 |
| **可能接插件推广** | 日报本身在推荐插件 → 可收推广费（未验证） |

## C5. 诚实评估

| 维度 | 判断 |
|---|---|
| 素材充足度 | ✅ 每天 280 个新插件 |
| 模式可行性 | ✅ 已有 3+ 家在日更（说明能持续做） |
| **起步收入** | ⚠️ **很低**（100粉≈1.5元/天） |
| 天花板 | 🟡 取决于粉丝量和是否能接插件推广 |
| 竞争 | ⚠️ 已有 3 家，且日更很累 |

---

# 总评：你的链条各环验证度

| 环节 | 验证度 | 数据支持 |
|---|---|---|
| **① 写插件** | ✅ 门槛清楚 | Cordis/TypeScript/SDK 文档齐全；头部插件代码量小（18-28 commits） |
| **② 推广** | ✅ **渠道充足** | 16 个渠道（9个市场站+GitHub+内容号） |
| **③ 挂广告** | ⚠️ **最弱一环** | 已验证目录站卖广告位；**插件内挂广告只有 dsh-ads（恶搞）做参考** |
| **④ 赚钱** | ⚠️ 未见闭环 | 849 插件里 24 个提付费，真正付费插件 0 个 |

**最关键待验证：插件里的广告，谁买单？多少钱？**

## 数据文件

| 文件 | 内容 |
|---|---|
| `_dsh_index.json` | 849 插件索引（含20个500★+完整描述） |
| `_dev_*.html` | 教程页抓取 |
| `_submit.log` / `_daily.log` | 渠道和日报实测日志 |
