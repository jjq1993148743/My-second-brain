---
date: 2026-10-20
tags: [工作, 平台研究, API, 薪资, 重要]
---

# 平台研究 #25 · 带薪资字段的招聘 API【Himalayas + Remotive】

> **重要发现：在测试的 6 个 API 里，只有 2 个返回结构化薪资字段。**
> **其余 4 个（Arbeitnow/Jobicy/RemoteOK/WorkingNomads）都不提供薪资。**

## 一、API 薪资字段对比

| API | 返回条数 | 薪资字段 | 有薪资条数 | 比例 |
|---|---|---|---|---|
| **Himalayas** | 40 | ✅ minSalary/maxSalary/currency/salaryPeriod | **17** | **43%** |
| **Remotive** | 12 | ✅ salary（文本） | **7** | **58%** |
| Arbeitnow | 2,212 | ❌ 无 | 0 | 0% |
| Jobicy | 464 | ❌ 无 | 0 | 0% |
| RemoteOK | 99 | ❌ salary_min 但多为 0 | 20 | 20% |
| WorkingNomads | 41 | ❌ 无 | 0 | 0% |

**结论：有量没薪资 vs 有薪资没量。**

## 二、Himalayas 真实薪资数据（17 条）

| 公司 | 职位 | 薪资 | 币种 | 级别 |
|---|---|---|---|---|
| Yogini Tradex | Senior Manager / Manager – Coal Road T | **2200000–2200000** | INR | Manager |
| Vicharanashala | Operations Support Specialist | **500000–600000** | INR | Mid-level |
| Lifelancer | Senior Software Engineer - Ostro | **130000–225000** | CAD | Senior |
| Frontline Wildfire Defense | In-House Counsel | **175000–200000** | USD | Senior |
| Exceptionly | Senior SRE&#x2f;DevOps Engineer &#x28; | **165000–165000** | AUD | Senior |
| Lifelancer | Product Marketing Manager / Senior Man | **75000–150000** | USD | Manager,Senior |
| Allara Health | *Telehealth Registered Dietitian | FT  | **65000–105000** | USD | Mid-level |
| Taxtalente.de | Steuerfachkraft (m/w/d) in Brunsbüttel | **52000–85000** | EUR | Mid-level |
| Get My Course | Appointment Setter (Indian Nationals)  | **80000–80000** | INR | Mid-level |
| Jupiter Texas Real Estate Gr | Commercial Real Estate Oper | **60000–80000** | INR | Mid-level |
| Exceptionly | .NET Integration Architect &#x28;Remot | **60000–75000** | EUR | Senior |
| Exceptionly | Senior SRE&#x2f;DevOps Engineer &#x28; | **65000–65000** | USD | Senior |
| Exceptionly | Market Researcher &#x28;Remote&#x2f;So | **30000–36000** | USD | Mid-level |
| Tower Trophies | Kent Customer Support Agent | Work fro | **5000–20000** | GBP | Entry-level |
| Exceptionly | DevOps Engineer-  ElasticSearch &#x28; | **2700–2700** | USD | Senior |

### Himalayas 的完整字段（最丰富）

```
title, excerpt, companyName, companySlug, companyLogo,
employmentType, minSalary, maxSalary, salaryPeriod, seniority,
currency, locationRestrictions, timezoneRestrictions,
categories, parentCategories, description, pubDate, expiryDate,
applicationLink, guid
```

**这是所有 API 里字段最全的——含薪资、币种、周期、级别、时区限制。**

## 三、Remotive 薪资数据（7 条）

| 薪资（原文） |
|---|
| **$1000 per task** |
| **$170k - $200k** |
| **$35,3k- $52k** |
| **OTE $25k - $35k** |
| **$50-$75 /hour** |
| **$20k -$35k** |
| **$80k - $150k** |

## 四、为什么这个发现重要

### 之前的问题

**API 采集了 2,676 条，但 0 条有薪资。**

**这 2,676 条只能用来判断「哪些公司在招人」，不能判断「值多少钱」。**

### 现在的组合

| 需求 | 用哪个 API |
|---|---|
| **想知道有多少岗位** | Arbeitnow（2,212）+ Jobicy（464） |
| **想知道薪资水平** | **Himalayas（17 条）+ Remotive（7 条）** |
| **想看技术栈** | 全部 API 都能看职位名 |

**两个需求必须用不同 API。**

## 五、Himalayas 的局限性

| 限制 | 说明 |
|---|---|
| 分页有限 | `?page=1` 和 `?page=2` 有效，p3 开始重复 |
| 总量少 | 只能拿到 40 条（去重后） |
| 更新慢 | 20 条/页，可能是精选而非全量 |

## 六、结论

### 两大类 API 的分工

```
┌─────────────────────────────────────────┐
│ 有量无薪（判断招聘活跃度）              │
│  Arbeitnow 2,212 + Jobicy 464           │
│  → 用途：知道市场有多少岗位在招          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 有薪无量（判断薪酬水平）                │
│  Himalayas 17 + Remotive 7              │
│  → 用途：知道某个职位值多少钱            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 有量有薪（最理想，但极少）              │
│  垂直技术招聘板（React Jobs / Larajobs）│
│  → 用途：既知道有多少机会又知道值多少    │
└─────────────────────────────────────────┘
```

### 最终建议

| 目的 | 最佳来源 |
|---|---|
| **薪资基准** | **垂直技术招聘板**（第 18 份报告）> Himalayas > Remotive |
| **岗位数量** | Arbeitnow + Jobicy + HN |
| **两者都要** | 垂直技术招聘板 |

**这就是为什么第 18 份报告（技术栈垂直招聘板）是最有价值的一份——它同时提供量和薪资。**

## 七、数据

| 文件 | 内容 |
|---|---|
| `_himalayas_jobs.json` | 40 条（含薪资/币种/级别/时区） |
| `_remotive_all.json` | 12 条（含 salary 文本） |
| `_api_jobs_v2.json` | 2,676 条（无薪资） |
| `_himalayas2.mjs` | Himalayas 抓取脚本 |
| `_remotive_all.mjs` | Remotive 抓取脚本 |
