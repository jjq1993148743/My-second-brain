---
date: 2026-10-18
time: 18:00
place: 办公室
tags: [工作, 重点, 待办]
---

# 挣钱的道 · 待办清单（GitHub 那几千个域名必须跑完）

> **jjq 明确要求：GitHub 上找到的那几千个域名，一定要去找完。**
> 这一篇是**待办任务书**，下次开工直接照做。

## 一、GitHub 域名存量盘点（实测数字，2026-10-18）

| 项 | 数量 |
|---|---|
| **GitHub 提取域名总数** | **2,610** |
| 已实测 | 402 |
| └ `_probe_gh2.json`（15个新awesome） | 326 条 → **151 可用** |
| └ `_gh_result.json`（旧45个README） | 173 条 → **83 可用** |
| **★ 还没测的** | **2,208** |

## 二、这 2,610 个域名从哪来（15 个新挖的高价值 awesome 列表）

| 仓库 | 提取域名数 | 专挖什么 |
|---|---|---|
| **kevinchwong/awesome-money-platforms** | **1,105** | **「赚钱平台」日更清单**，433KB |
| **xpaysh/awesome-x402** | **772** | HTTP 402 支付协议 |
| **trinhminhtriet/awesome-job-boards** | 312 | 招聘板合集 |
| **jakeolschewski/awesome-solopreneur-ai** | 309 | 一人公司 AI 工具 |
| **chen103226/awesome-one-person-company** | 103 | 一人公司高信号清单 |
| devanasolver/awesome-passive-income | 65 | 被动收入 |
| Anil-matcha/awesome-generative-ai-apps | 45 | 可克隆变现的 AI 应用 |
| bmpi-dev/awesome-seo | 41 | SEO + 流量变现 |
| Lxcardoza993/awesome-oss-sponsorship | 26 | 开源怎么拿到钱 |
| PayDevs/awesome-oss-monetization | 21 | 开源变现方式 |
| harmenx/awesome-passive-income | 21 | 被动收入 |
| thomasbnt/awesome-web-monetization | — | Web 变现专题 |
| jimfilippou/awesome-sells | 4 | 会卖东西的落地页 |
| travelmapworld/awesome-micro-saas-builder | 1 | 微 SaaS |
| sophiamaybea/awesome-passive-income | 1 | 被动收入 |

## 三、怎么跑（脚本已就绪，支持断点续跑）

```bash
cd "D:\GitHub\My-second-brain\50-知识\AI工具\_scripts"

# 当前 _candidates3.json 只有 326 个（已跑完），需要重新从 2610 里筛
# 1. 先建完整候选池（排除已测的 402 个）
node -e "const fs=require('fs');const gh2=JSON.parse(fs.readFileSync('_gh2_domains.json','utf8'));const p1=JSON.parse(fs.readFileSync('_probe_gh2.json','utf8'));const p2=JSON.parse(fs.readFileSync('_gh_result.json','utf8')).results;const tested=new Set([...p1.map(x=>x.host),...p2.map(x=>x.host)]);const rest=gh2.filter(x=>!tested.has(x.host));fs.writeFileSync('_candidates3.json',JSON.stringify(rest.map(x=>x.host)));console.log('剩余待测:',rest.length)"

# 2. 跑探测（自动跳过已测，断点续跑）
node probe-gh2.mjs

# 3. 跑完看结果
cat _probe_gh2.json
```

> ⚠️ 2,208 个域名，按 300ms/个算约需 **11 分钟纯跑**，加上失败重试约 **20-30 分钟**。

## 四、筛选建议（2,208 个全测太杂，可先筛）

当前筛选口径（已验证有效）：
- 排除已测过的
- 命中赚钱/变现/交易/创作/素材/接单/悬赏关键词
- 排除 docs./api./cdn./blog. 等文档子域
- 排除大站（github/youtube/twitter/wikipedia）

**如果要全测**（jjq 说要全跑），直接跳过筛选，把 2,208 个全塞进 `_candidates3.json` 跑。

## 五、其他还没跑完的池子（一并记下）

| 池子 | 剩余 | 脚本 |
|---|---|---|
| `_fb_domains.json`（十年之约博客域名） | ~666 | `probe-fbdom.mjs` |
| `_nav_domains.json`（页面外链域名） | ~2,034 | `probe-nav.mjs` |
| **`_gh2_domains.json`（GitHub 域名）** | **~2,208** | `probe-gh2.mjs` |
| **合计** | **~4,908** | |

## 六、跑完之后做什么

1. 把新可用源合并进 `_merged.json` 和 `_usables.json`
2. 更新 [[挣钱的道-信息源实测总表]] 的源总数
3. 从新源里挑出「明确挂钱的」（bounty/reward/payout 关键词）单独列一张表
4. 更新本篇的进度数字

## 七、GitHub 还能继续挖的方向（不只这 15 个列表）

已验证的搜索词（GitHub API，每小时限额 60 次未鉴权）：
```
awesome side hustle
awesome passive income
awesome make money online
awesome freelance
awesome indie hacker
awesome solopreneur
awesome digital products
awesome micro saas
awesome one person business
awesome monetization
awesome creator economy
awesome job boards
```

**还没搜的词**（下次补）：
```
awesome bounty hunting
awesome bug bounty
awesome remote jobs
awesome web monetization
awesome digital nomad
awesome affiliate marketing
awesome print on demand
awesome UGC creator
awesome stock photography
awesome font design
awesome notion templates
awesome figma plugins
awesome vscode extensions
awesome obsidian plugins
awesome raycast extensions
awesome browser extensions
```

> ⚠️ **GitHub API 有每小时限额**（实测连续 16 个查询后 403）。要分批、加间隔、或换时段。
