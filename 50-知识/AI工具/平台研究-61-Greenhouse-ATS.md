---
date: 2026-10-20
tags: [工作, 平台研究, Greenhouse, ATS, 重大发现]
---

# 平台研究 #61 · Greenhouse ATS 公开 API【2,716 条】

> **重大发现：Greenhouse 的招聘 API 完全公开，无需登录。**
> **单次抓取 9 家公司得 2,716 条真实职位（含 Stripe、Databricks、GitLab 等）。**

## 一、API 方式

```
https://boards-api.greenhouse.io/v1/boards/{company}/jobs
```

| 项 | 内容 |
|---|---|
| 需要登录 | ❌ 不需要 |
| 需要渲染 | ❌ 不需要（纯 JSON） |
| 单公司上限 | Databricks 899 条 |
| 字段 | id/title/location/updated_at |

## 二、⭐ 采集结果

| 公司 | 职位数 |
|---|---|
| **databricks** | **899** |
| **stripe** | **724** |
| **gitlab** | **228** |
| **coinbase** | **227** |
| **airbnb** | **177** |
| **robinhood** | **151** |
| **figma** | **141** |
| **instacart** | **123** |
| **discord** | **46** |
| **合计** | **2,716** |

## 三、⭐ 数据质量（最好的之一）

| 指标 | 数值 |
|---|---|
| **7 天内更新** | **1,005 条（37%）** |
| 30 天内更新 | **2,569 条（95%）** |
| **中位已挂** | **12 天** |
| 远程职位 | 734 条（27%） |

**95% 的职位在 30 天内更新 → 数据极新。**

## 四、技术方向分布

| 方向 | 数量 | 占比 |
|---|---|---|
| Engineer | 970 | 36% |
| Sales | 382 | 14% |
| Infra/DevOps | 224 | 8% |
| AI/ML | 185 | 7% |
| Data | 170 | 6% |
| Design | 142 | 5% |
| Product | 114 | 4% |
| Security | 79 | 3% |

## 五、⭐⭐ 与其他招聘源对比

| 源 | 样本 | 7 天内 | 远程 | API |
|---|---|---|---|---|
| **Greenhouse** | **2,716** | **37%** | 27% | ✅ |
| Ashby | 1,330 | 8% | **67%** | ✅ |
| Arbeitnow+Jobicy | 2,676 | 未知 | 未知 | ✅ |
| HN Who is hiring | 742 | 当月 | 未知 | ✅ |
| Himalayas | 264 | 未知 | 未知 | ✅ |

**Greenhouse 的数据量和新鲜度都是最好的。**

## 六、⭐ 为什么这个发现重要

### 1. 数据量爆炸

| 项 | 数量 |
|---|---|
| 已采集 | **2,716** |
| 可扩展公司数 | 数千家（Greenhouse 客户） |
| **理论总量** | **数十万条** |

**这是唯一一个「数据量几乎无限」的源。**

### 2. 全是真实公司

| 公司 | 类型 |
|---|---|
| Stripe | 支付巨头 |
| Databricks | 数据平台独角兽 |
| GitLab | 全远程公司 |
| Coinbase | 加密货币 |
| Airbnb | 共享住宿 |
| Figma | 设计工具 |

**都是知名科技公司，不是虚假招聘。**

### 3. 新鲜度极高

**95% 在 30 天内更新，中位 12 天。**

## 七、⭐ 实用价值

### 可以直接做的事

| 动作 | 说明 |
|---|---|
| 找远程工作 | 734 条远程职位 |
| 按技术栈筛选 | Engineer 970 条、AI/ML 185 条 |
| 按公司筛选 | 9 家已采集，可加更多 |

### 扩展方法

```javascript
// 只需换公司名
const companies = ['stripe','airbnb','doordash','instacart',...];
for (const c of companies) {
  const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${c}/jobs`);
  const { jobs } = await res.json();
  // 处理 jobs
}
```

**如何找到公司名：**
1. 看招聘页面 URL 是否含 `boards.greenhouse.io/{company}`
2. 或用 Google 搜 `site:boards.greenhouse.io`

## 八、结论

| 维度 | 评分 |
|---|---|
| 数据量 | ⭐⭐⭐⭐⭐（2,716 且可无限扩） |
| 新鲜度 | ⭐⭐⭐⭐⭐（95% 在 30 天内） |
| 数据质量 | ⭐⭐⭐⭐⭐（100% 完整） |
| 获取难度 | ⭐⭐⭐⭐⭐（纯 API 无鉴权） |
| **综合** | **⭐⭐⭐⭐⭐** |

**这是本次研究中最有价值的发现。**

## 九、数据

| 文件 | 内容 |
|---|---|
| `_greenhouse_jobs.json` | **2,716 条**（company/id/title/loc/updated） |
| `_gh_scrape.mjs` | 抓取脚本 |
