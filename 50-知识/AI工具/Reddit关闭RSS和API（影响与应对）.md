---
date: 2026-10-16
time: 17:40
tags: [工作, 重点, 可复用模板]
---

# ⚠️ Reddit 即将关闭 RSS 和公开 API（含替代方案）

> 2026-10-16 ｜ 来源：Reddit 官方 2026-09-30 在 r/modnews 和 r/redditdev 的公告，经 MediaNama（2026-10-01）、TechRepublic、Mashable、heise 等多家媒体报道。
> **这条直接影响 [[多源情报脚本（intel.mjs）]] 的 Reddit 源——只剩 28 天。**

## 一、关键日期（必须记住）

| 日期 | 事件 | 距今 |
|---|---|---|
| 2026-10-31 | Reddit **停止接受新的公开 API 访问申请** | 15 天 |
| **2026-11-13** | **RSS feeds 关闭** | **28 天** |
| 2026-11-30 | 迁移资助（migration funding）注册关闭 | 45 天 |
| 2027-01-12 | 开始切断"未注册或未与我们互动的 app 和用户" | 88 天 |
| 2027-03 | 公开 API 访问对所有剩余 app 和用户终止 | ~5 个月 |

## 二、官方理由

Reddit 原话（引自 MediaNama）：
> RSS 已成为 *"大规模抓取和自动化滥用的常见入口"*（a common surface for large-scale scraping and automated abuse）。

## 三、对现有工具的影响

| 受影响 | 说明 |
|---|---|
| **我的 intel.mjs Reddit 源** | 2026-11-13 后失效 |
| 通过 RSS 读 Reddit 的 feed 应用 | 无替代方案 |
| 研究者、社交聆听工具、AI 助手 | 需与 Reddit 签商业协议 |
| **版主**（moderator） | 可用 **Discord Relay**（Reddit 开发者平台上的 app）替代 |

**Reddit 明确说**：对"在版主自己管理的社区之外使用 RSS 的人"**不提供替代方案**。

## 四、官方给的出路：Devvit

> *"Reddit 希望第三方 app 和 bot 迁移到 **Devvit**，它的开发者平台，由平台托管这些 app。"*

## 五、我的应对（三个方案）

### 方案 A：迁移到 Devvit（官方路径）
- 优点：官方支持，长期可用
- 缺点：**app 被平台托管**，自由度低；需要重新开发
- 适合：要长期做 Reddit 相关产品的人

### 方案 B：改用其他海外源（推荐）
RSS 关闭后，**这些源仍可用**（本轮实测）：

| 源 | 状态 | 命令 |
|---|---|---|
| **V2EX 副业节点** | ✅ JSON Feed，50 条带正文 | `intel.mjs v2ex` |
| **Product Hunt** | ✅ Atom feed，50 条当日产品 | `intel.mjs ph` |
| **Hacker News** | ✅ `hnrss.org/show?points=100`（20 条） | 待加入 |
| GitHub 赏金 | ✅ API（有速率限制） | `intel.mjs bounty` |
| **r/selfhosted 等 Reddit** | ⚠️ **2026-11-13 前可用** | `intel.mjs reddit` |

### 方案 C：趁 28 天窗口期把数据抓下来
在 11-13 之前，把需要的 Reddit 内容批量抓取存档。**这是唯一能拿到历史数据的机会。**

> AI 推测：**方案 B + C 组合最实际**。V2EX + Product Hunt + HN 三个源已经能覆盖大部分"独立开发者赚钱"信息，Reddit 关闭损失可控。但如果你想留 Reddit 的语料，**现在就要抓**。

## 六、可抓性更新（本轮实测补充）

| 站点 | 状态 | 方式 |
|---|---|---|
| **Product Hunt** | ✅ **可抓**（上轮误判） | `producthunt.com/feed`（Atom，50 条） |
| **Hacker News RSS** | ✅ 可抓 | `hnrss.org/show?points=100`（20 条，标题在 CDATA 里） |
| r/selfhosted | ✅ 可抓 | Reddit RSS（11-13 前） |
| GitHub 网页 | ✅ 可抓 | README 在 `<article class="markdown-body">` |
| GitHub API | ⚠️ **限流 60 次/小时** | 用完后 403，需等或换 IP |
| Gumroad RSS | ❌ 404 | 无 RSS |
| Indie Hackers RSS | ❌ 404 | 无 RSS |
| hn rss `q=` 参数 | ⚠️ 502 | 该端点不稳定 |

> **解析坑记录**：HN RSS 的 `<title>` 内容是 `<![CDATA[...]]>`，普通正则匹配不到，必须先剥掉 CDATA 标记。同理 description 里的 Points 也要先 strip。

## 七、给情报脚本的 TODO

- [ ] 加入 Hacker News 源（`hnrss.org/show?points=100`）
- [ ] Reddit 源加**过期警告**（2026-11-13 后自动提示失效）
- [ ] 考虑在 11-13 前抓一批 Reddit 存档
