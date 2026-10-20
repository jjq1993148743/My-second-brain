---
date: 2026-10-20
tags: [工作, 平台研究, 远程工作, API, HackerNews, 重要]
---

# 平台研究 #23 · HackerNews「Who is hiring」【742 条 · API】

> **通过 Algolia API 直接抓取，742 条真实招聘信息，覆盖 2026 年 8-10 三个月。**
> **这是所有研究里唯一「每月固定、结构稳定、可预期」的招聘源。**

## 一、API 方式

| 步骤 | API |
|---|---|
| 1. 找最新帖 | `search_by_date?query="Who is hiring"&tags=story` |
| 2. 拉全部评论 | `items/{objectID}` |
| 登录 | ❌ 不需要 |
| 渲染 | ❌ 不需要 |

## 二、数据规模

| 月份 | 评论数 | 有效招聘 |
|---|---|---|
| **2026-10** | 393 | **266** |
| **2026-09** | 391 | **250** |
| **2026-08** | 375 | **226** |
| **合计** | **1,159** | **742** |

## 三、5 维验真

### 维度 1 · 新鲜度 ⭐⭐⭐⭐⭐

**10 月帖子 10 月 1 日发布，现在是 10 月 20 日 —— 19 天内的信息。**

**每月 1 日固定发布，可建立自动监控。**

### 维度 2 · 数据质量 ✅

| 指标 | 数值 |
|---|---|
| 有公司名 | **742（100%）** |
| 有薪资 | 215（29%） |

**典型格式：** `公司名 | 职位1, 职位2 | 地点 | 薪资 | 联系`

### 维度 3 · 技术需求分布

| 技术方向 | 提及 | 占比 |
|---|---|---|
| Engineer/SWE | 567 | 76% |
| ML/AI | 346 | 47% |
| DevOps/SRE | 251 | 34% |
| Full Stack | 89 | 12% |
| Backend | 78 | 11% |
| Sales/Marketing | 71 | 10% |
| Frontend | 64 | 9% |
| Product | 20 | 3% |
| Design | 16 | 2% |

### 维度 4 · 远程比例

| 指标 | 数值 |
|---|---|
| 提及 Remote | **388（52%）** |

## 四、真实样本

| 公司 | 招聘职位 |
|---|---|
| Sidekick Labs | Senior SWE, R&D Engineer, Intelligence Engineer |
| Open Education Applications | Senior/Lead Platform & DevOps Engineer |
| PAGNOS | Cloud Engineer, AWS Serverless (TypeScript/Node.js) |
| Snout | Multiple Engineering + Product Roles |
| OpenRent | London, UK |

## 五、为什么这个源最值得监控

| 优势 | 说明 |
|---|---|
| **量最大** | 742 条/3 个月 |
| **最新** | 当月发布 |
| **可预期** | 每月 1 日固定 |
| **纯 API** | 无需登录渲染 |
| **直接招聘** | 不是接单，是入职 |

## 六、建议用法

**每月 2 日跑一次，抓当月帖子。**

```javascript
// 完整脚本
const search = await fetch('https://hn.algolia.com/api/v1/search_by_date?query="Who is hiring"&tags=story&hitsPerPage=50');
const { hits } = await search.json();
const latest = hits.filter(h => /^Ask HN: Who is hiring\?/i.test(h.title))
                    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))[0];
console.log(latest.title, latest.objectID);

const thread = await fetch(`https://hn.algolia.com/api/v1/items/${latest.objectID}`);
const { children } = await thread.json();
const jobs = children.filter(c => c.text && c.text.length > 30);
```

## 七、结论

| 维度 | 评分 |
|---|---|
| 获取难度 | ⭐⭐⭐⭐⭐ |
| 数据量 | ⭐⭐⭐⭐⭐ |
| 新鲜度 | ⭐⭐⭐⭐⭐ |
| **综合** | **⭐⭐⭐⭐⭐** |

**这是目前最好的「远程工作情报源」：量大、最新、可自动化。**

## 八、数据

| 文件 | 内容 |
|---|---|
| `_hn_hiring.json` | **742 条**（月份/公司/职位/地点/文本/日期） |
| `_hn_hiring2.mjs` | 抓取脚本 |
