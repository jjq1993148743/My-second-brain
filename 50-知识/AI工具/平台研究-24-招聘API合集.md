---
date: 2026-10-20
tags: [工作, 平台研究, API, 远程工作, 汇总]
---

# 平台研究 #24 · 招聘 API 合集【561 条 · 4 个源】

> **找到 4 个可用公开招聘 API，全部无需登录、直接返回 JSON。**
> **效率是网页抓取的 10-100 倍。**

## 一、四个可用 API

| 源 | API 地址 | 单次返回 | 特点 |
|---|---|---|---|
| **Arbeitnow** | `arbeitnow.com/api/job-board-api` | **300 条** | 德国/欧洲 |
| **Jobicy** | `jobicy.com/api/v2/remote-jobs` | **200 条** | 全球远程，含薪资 |
| **WorkingNomads** | `workingnomads.com/api/exposed_jobs/` | 41 条 | 远程 |
| **Himalayas** | `himalayas.app/jobs/api` | 20 条 | 远程，含薪资 |
| **合计** | | **561 条** | |

## 二、数据统计

| 指标 | 数值 |
|---|---|
| 总条数 | **561** |
| 有薪资 | 11（2%） |
| 提及远程 | 48（9%） |
| 7 天内 | 505 |
| **中位已挂** | **0 天** |

## 三、API 调用代码

```javascript
// Arbeitnow - 300 条，德国/欧洲
const a = await fetch('https://www.arbeitnow.com/api/job-board-api');
const { data } = await a.json();
// data[].company_name / .title / .location / .created_at / .tags

// Jobicy - 200 条，全球远程含薪资
const b = await fetch('https://jobicy.com/api/v2/remote-jobs');
const { jobs } = await b.json();
// jobs[].companyName / .jobTitle / .jobGeo / .annualSalaryMin / .annualSalaryMax

// WorkingNomads - 41 条
const c = await fetch('https://www.workingnomads.com/api/exposed_jobs/');
const wjobs = await c.json();

// Himalayas - 20 条，含薪资
const d = await fetch('https://himalayas.app/jobs/api');
const { jobs: hjobs } = await d.json();
```

## 四、效率对比

| 方式 | 单次量 | 耗时 |
|---|---|---|
| **API（4 个源）** | **561** | **约 8 秒** |
| HN API | 742 | 约 10 秒 |
| Chrome 抓 FL.ru | 630 | 约 15 分钟 |
| curl 抓 Freelancermap | 511 | 约 10 分钟 |

## 五、建议：建立 API 监控流水线

```
每周跑一次：
  Arbeitnow(300) + Jobicy(200) + RemoteOK(100) + WorkingNomads(41) + Himalayas(20)
  = 约 660 条
每月初加跑：
  HN Who is hiring（约 250 条/月）
然后：
  去重 → 按技术栈筛 → 按薪资排序 → 输出「本周新岗位」
```

**完全免费、无需登录、可自动化。**

## 六、结论

| 维度 | 评分 |
|---|---|
| 效率 | ⭐⭐⭐⭐⭐ |
| 数据量 | ⭐⭐⭐⭐ |
| 结构清晰度 | ⭐⭐⭐⭐⭐ |
| **综合** | **⭐⭐⭐⭐⭐** |

## 七、数据

| 文件 | 内容 |
|---|---|
| `_multi_api_jobs.json` | **561 条**（4 源合并） |
| `_remoteok_jobs.json` | 99 条 |
| `_hn_hiring.json` | 742 条 |
| `_multi_api.mjs` | 抓取脚本 |
