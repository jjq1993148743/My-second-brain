---
date: 2026-10-20
tags: [工作, 平台研究, API, 薪资, 深度, 重要]
---

# 平台研究 #26 · Himalayas【264 条 · 91 条带薪资】

> **这是所有 API 源里薪资数据最丰富的一个：264 条中 91 条有完整薪资（34%）。**
> **并且包含币种、计薪周期、资历级别这三个其他 API 都没有的维度。**

## 一、API 分页突破

**关键发现：用 `?offset=N` 而不是 `?page=N`**

| 参数 | 效果 |
|---|---|
| `?page=2` | 只有前 2 页有效 |
| **`?offset=20`** | **✅ 有效，每 20 条一页** |
| `?limit=50` | ❌ 仍返回 20 条 |
| `?cursor=20` | ❌ 返回空 |

**实测：offset 0→260 共 14 页，抓到 264 条。**

## 二、数据规模

| 指标 | 数值 |
|---|---|
| 总条数 | **264** |
| **有薪资** | **91（34%）** |
| 开发类 | 50（19%） |

## 三、⭐ 真实薪资数据（Top 10）

| 公司 | 职位 | 薪资 | 币种 |
|---|---|---|---|
| micro1 | Strategic Project Lead, Coding/SWE | **$300,000–$500,000** | USD |
| NVIDIA | Senior Software Engineer, Graphics | **$184,000–$356,500** | USD |
| Moderna | Sr. Director, Regional Sales | **$196,700–$353,400** | USD |
| Lifelancer | In-Home Physician (Full Time) | **$174,070–$374,920** | USD |
| Rezolute | VP, Global Manufacturing | **$290,000–$340,000** | USD |
| Dotmatics | Director, Market Growth Strategy | **$185,000–$256,000** | USD |
| iTech AG | ServiceNow FSM Practice Lead | **$200,000–$250,000** | USD |
| Lifelancer | Senior Project Manager - Oncology | **$128,500–$254,500** | USD |
| Lifelancer | Senior Software Engineer | **$130,000–$225,000** | CAD |
| Stryker | Customer Excellence Assoc Manager | **$102,600–$222,300** | USD |

**最高薪资：micro1 的 Strategic Project Lead，$300k–$500k。**

## 四、⭐ 三个独有维度

### 维度 1 · 币种分布

| 币种 | 数量 |
|---|---|
| USD | 67 |
| EUR | 11 |
| GBP | 7 |
| AUD | 1 |
| CAD | 1 |
| PHP | 1 |
| ZAR | 1 |
| PLN | 1 |
| BRL | 1 |

**USD 占 74%，但还有 EUR/GBP/CAD 等其他币种——这是其他 API 都没有的。**

### 维度 2 · 计薪周期

| 周期 | 数量 |
|---|---|
| annual | 54 |
| hourly | 25 |
| monthly | 11 |
| weekly | 1 |

**25 条是时薪制，11 条是月薪制——这些在其他 API 里都没有。**

### 维度 3 · 资历级别

| 级别 | 数量 |
|---|---|
| mid-level | 41 |
| senior | 21 |
| manager | 9 |
| entry-level | 8 |
| director | 3 |
| executive | 3 |

**mid-level 最多（41），senior 次之（21）。**

## 五、与其他 API 对比

| API | 总量 | 有薪资 | 币种 | 周期 | 级别 |
|---|---|---|---|---|---|
| **Himalayas** | **264** | **91（34%）** | **✅ 9 种** | **✅ 4 种** | **✅ 6 种** |
| Remotive | 12 | 7（58%） | ❌ | ❌ | ❌ |
| RemoteOK | 99 | 20（20%） | ❌ | ❌ | ❌ |
| Arbeitnow | 2,212 | 0 | ❌ | ❌ | ❌ |
| Jobicy | 464 | 0 | ❌ | ❌ | ❌ |

**Himalayas 是唯一同时提供「薪资+币种+周期+级别」的 API。**

## 六、完整调用代码

```javascript
// Himalayas offset 分页采集
const all = [];
const seen = new Set();

for (let offset = 0; offset <= 300; offset += 20) {
  const url = offset === 0 
    ? 'https://himalayas.app/jobs/api'
    : `https://himalayas.app/jobs/api?offset=${offset}`;
  
  const res = await fetch(url);
  const { jobs } = await res.json();
  
  let added = 0;
  for (const j of jobs) {
    const key = j.companyName + '|' + j.title;
    if (seen.has(key)) continue;
    seen.add(key);
    all.push(j);
    added++;
  }
  
  if (added === 0 && offset > 60) break;  // 无新数据则停止
  await new Promise(r => setTimeout(r, 1400));  // 限速
}

// 筛选有薪资的
const withSalary = all.filter(j => j.minSalary || j.maxSalary);
```

## 七、结论

| 维度 | 评分 |
|---|---|
| 数据量 | ⭐⭐⭐⭐（264） |
| **薪资数据** | **⭐⭐⭐⭐⭐（91 条，34%）** |
| **维度丰富度** | **⭐⭐⭐⭐⭐（币种+周期+级别）** |
| 获取难度 | ⭐⭐⭐⭐⭐（纯 API） |
| **综合** | **⭐⭐⭐⭐⭐** |

### 定位

**这是所有数据源里「薪资信息最完整」的一个。**

| 用途 | 说明 |
|---|---|
| 判断薪资水平 | 91 条真实薪资，含币种和周期 |
| 看资历对应薪酬 | 从 entry-level 到 executive 都有 |
| 看全球差异 | USD/EUR/GBP/CAD 等 9 种币种 |

**配合第 18 份报告（垂直技术招聘板）使用，能覆盖「数量+质量」两个维度。**

## 八、数据

| 文件 | 内容 |
|---|---|
| `_himalayas_jobs.json` | **264 条**（完整字段，含薪资/币种/周期/级别/时区） |
| `_himalayas3.mjs` | 抓取脚本 |

**完整字段列表：**

```
title, excerpt, companyName, companySlug, companyLogo,
employmentType, minSalary, maxSalary, salaryPeriod, seniority,
currency, locationRestrictions, timezoneRestrictions,
categories, parentCategories, description, pubDate, expiryDate,
applicationLink, guid
```
