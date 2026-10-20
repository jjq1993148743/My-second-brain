---
date: 2026-10-20
tags: [工作, 平台研究, Ashby, ATS]
---

# 平台研究 #62 · Ashby ATS 公开 API【1,330 条】

> **与 Greenhouse 同类的 ATS，但远程比例高达 67%。**
> **OpenAI 一家的职位就有 808 条。**

## 一、API 方式

```
https://api.ashbyhq.com/posting-api/job-board/{company}
```

| 项 | 内容 |
|---|---|
| 需要登录 | ❌ |
| 字段 | title/location/department/team/employmentType/**publishedAt**/**isRemote** |

**字段比 Greenhouse 更丰富（有部门、团队、雇佣类型、是否远程）。**

## 二、采集结果

| 公司 | 职位数 |
|---|---|
| **openai** | **808** |
| ramp | **167** |
| cursor | **135** |
| perplexity | **133** |
| replit | **59** |
| linear | **28** |
| **合计** | **1,330** |

## 三、⭐ 核心差异：远程比例

| 平台 | 远程比例 |
|---|---|
| **Ashby** | **67%** |
| Greenhouse | 27% |

**Ashby 的客户（AI 创业公司）更倾向远程。**

## 四、新鲜度

| 指标 | 数值 |
|---|---|
| 7 天内发布 | 108 条（8%） |
| 30 天内 | 372 条（28%） |
| **中位已挂** | **56 天** |

**⚠️ 比 Greenhouse（12 天）老很多。**

**原因：AI 公司招聘周期长，职位挂得久。**

## 五、技术方向

| 方向 | 数量 | 占比 |
|---|---|---|
| Engineer | 575 | 43% |
| AI/ML | 157 | 12% |
| Infra/DevOps | 107 | 8% |
| Design | 74 | 6% |
| Data | 72 | 5% |
| Sales | 69 | 5% |
| Security | 46 | 3% |
| Product | 23 | 2% |

**AI/ML 占 12%，比 Greenhouse（7%）更高。**

## 六、结论

| 维度 | 评分 |
|---|---|
| 数据量 | ⭐⭐⭐⭐（1,330） |
| **远程比例** | **⭐⭐⭐⭐⭐（67%）** |
| 新鲜度 | ⭐⭐⭐（中位 56 天） |
| 字段丰富度 | ⭐⭐⭐⭐⭐ |
| **综合** | **⭐⭐⭐⭐** |

**最适合：找 AI 公司的远程职位。**

## 七、数据

| 文件 | 内容 |
|---|---|
| `_ashby_jobs.json` | **1,330 条**（含 dept/team/isRemote/publishedAt） |
| `_ashby_scrape.mjs` | 抓取脚本 |
