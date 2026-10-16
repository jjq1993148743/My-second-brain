---
date: 2026-10-16
time: 16:45
tags: [工作, 可复用模板]
---

# 多源赚钱情报脚本（intel.mjs）

> 2026-10-16 ｜ 位置：`50-知识/AI工具/_scripts/intel.mjs`
> **这是"情报流水线"的可用实现**——一条命令跑完国内 + 海外 + 赏金三个源。

## 用法

```bash
node intel.mjs              # 全部源（Reddit 部分较慢，见下）
node intel.mjs v2ex         # 只跑 V2EX 副业节点
node intel.mjs bounty       # 只跑 GitHub 赏金
node intel.mjs ph           # 只跑 Product Hunt（含赛道拥挤度统计）
node intel.mjs sidehustle   # 只跑某个 subreddit
node intel.mjs reddit       # 跑全部 6 个 subreddit
```

输出会同时**打印到终端**并**存档到** `40-产出/情报/YYYY-MM-DD.md`。

## 三个源的能力

| 源 | 状态 | 特点 |
|---|---|---|
| **V2EX 副业节点** | ✅ 已验证 | JSON Feed 一次拿 **50 条带正文**，秒回，无需等待 |
| **GitHub 赏金** | ✅ 已验证 | `💎 Bounty` 标签，当前 **561 个 open**，按仓库聚合 |
| **Product Hunt** | ✅ 已验证 | Atom feed 拿 **50 条当日产品**，自动统计赛道拥挤度 |
| **Reddit** | ✅ 已验证 | 6 个 sub（sidehustle / beermoney / microsaas / juststart / indiehackers / EntrepreneurRideAlong），**每个间隔 100 秒** |

## 自动提取

脚本用正则从正文里提取：
- **金额**：`$` `¥` `€` `£` + 数字 + `k/K/万/千/w/元/块/刀/MRR/ARR`
- **周期**：小时 / 天 / 周 / 月 / 年（含英文 hours/days/weeks/months/years）
- **过滤**：Reddit 源只输出命中 `$`、MRR、revenue、earn、side hustle、automate、hours per week、bounty 等关键词的条目

## 实测输出样例（2026-10-16）

**V2EX 源**：
```
[2026-08-28] 经验分享：做自媒体半年全网百万粉丝...
    金额: 20w / 30w / 8w / 7w / 50w / 100w / 4000块 / 2k
    周期: 7天
    https://www.v2ex.com/t/1237785
```

**Bounty 源**：
```
open 总数: 561
[30 个] SecureBananaLabs/bug-bounty
    #11398 (25评) Automate Bug Detection and Reviews
[6 个] oll4com/spaceapp
    #65 (3评) [$450] One command to run the full SpaceApp stack...
```

**Reddit 源**：
```
• My side hustle makes ~$4,000/month and I still can't tell you how to repeat it
    金额: $1 / 10k / $4k / 100k / $0
• Hit $1K/month building mobile apps on the side!
    金额: $10 / $5 / 2w
```

## 关键实现细节

| 问题 | 解法 |
|---|---|
| Reddit JSON API 403 | **改用 RSS**：`/r/<sub>/top/.rss?t=year` |
| Reddit 429 限流 | **间隔 ≥100 秒**（脚本里硬编码 `sleep(100000)`） |
| 中文站 GBK 编码 | Node 22 内置 `TextDecoder('gbk')`（iconv-lite 未装） |
| 本机无直连 | 走系统代理 `127.0.0.1:7897`（Clash），脚本里 `PROXY` 常量可改 |
| 正则含 `/mo` 会崩 | 正则字面量里的斜杠会提前闭合，**别在正则里写 `/month` 这种** |

## 建议的用法

**每天早 9 点跑一次**（Windows 计划任务）：
```powershell
schtasks /create /tn "赚钱情报" /tr "node C:\...\intel.mjs v2ex" /sc daily /st 09:00
```

**每周跑一次全量**（含 Reddit，约 10 分钟）。

> AI 推测：这个脚本的价值在于**把"刷信息"变成"收简报"**。V2EX 源最快（秒回 50 条），建议每天跑；Reddit 慢但信息密度高，建议每周跑一次。
>
> **没做闭环层的话，情报系统就是高级收藏夹**（引自《程序员副业小生意全景手册》）。所以：**每周从简报里挑一条，用"无聊工具五步法"处理掉。**
