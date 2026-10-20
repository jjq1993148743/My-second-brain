---
date: 2026-10-20
tags: [工作, 平台研究, Greenhouse, ATS, 重大发现]
---

# 平台研究 #61 · Greenhouse ATS 公开 API【5,881 条 · 扩充版】

> **从 2,716 条扩充到 5,881 条（24 家公司）。**
> **这是整个研究中数据量最大的单一来源。**

## 一、API 方式

```
https://boards-api.greenhouse.io/v1/boards/{company}/jobs
```

| 项 | 内容 |
|---|---|
| 登录 | 不需要 |
| 渲染 | 不需要（纯 JSON） |
| 字段 | id/title/location/updated_at |
| 已采集公司 | **24 家** |

## 二、采集结果：24 家公司 5,881 条

| 排名 | 公司 | 职位数 |
|---|---|---|
| 1 | **databricks** | **899** |
| 2 | **stripe** | **724** |
| 3 | **cloudflare** | **436** |
| 4 | **datadog** | **431** |
| 5 | **mongodb** | **394** |
| 6 | **elastic** | **377** |
| 7 | **samsara** | **265** |
| 8 | **brex** | **261** |
| 9 | **gitlab** | **228** |
| 10 | **coinbase** | **227** |
| 11 | **affirm** | **215** |
| 12 | **lyft** | **184** |
| 13 | **airbnb** | **177** |
| 14 | **pinterest** | **155** |
| 15 | **reddit** | **153** |
| 16 | **robinhood** | **151** |
| 17 | **figma** | **141** |
| 18 | **instacart** | **123** |
| 19 | **gusto** | **101** |
| 20 | **chime** | **71** |
| 21 | **twitch** | **54** |
| 22 | **sofi** | **50** |
| 23 | **discord** | **46** |
| 24 | **dropbox** | **18** |
| | **合计** | **5,881** |

## 三、数据质量（最好）

| 指标 | 数值 |
|---|---|
| **7 天内更新** | **2,727 条（46%）** |
| **30 天内更新** | **5,523 条（94%）** |
| **中位已挂** | **10 天** |
| 远程职位 | **1,446 条（25%）** |

**46% 的职位在 7 天内更新，这是所有数据源里最新鲜的。**

## 四、技术方向分布

| 方向 | 数量 | 占比 |
|---|---|---|
| Engineer | 2240 | 38% |
| Sales | 964 | 16% |
| Infra/DevOps | 444 | 8% |
| AI/ML | 412 | 7% |
| Data | 347 | 6% |
| Design | 280 | 5% |
| Product | 266 | 5% |
| Security | 227 | 4% |

**Engineer 占 38%，Sales 占 16%。**

## 五、与所有其他数据源对比

| 源 | 样本 | 7 天内 | 数据质量 |
|---|---|---|---|
| **Greenhouse** | **5,881** | **46%** | ⭐⭐⭐⭐⭐ |
| Arbeitnow+Jobicy | 2,676 | 未知 | ⭐⭐⭐ |
| Ashby | 1,330 | 8% | ⭐⭐⭐⭐ |
| HN Who is hiring | 742 | 当月 | ⭐⭐⭐ |
| Himalayas | 264 | 未知 | ⭐⭐⭐⭐⭐ |
| 所有接单平台合计 | 6,091 | — | — |

**Greenhouse 单一来源 5,881 条，接近所有接单平台的总和 6,091 条。**

## 六、无限扩展性

### 失败的公司

`hashicorp` `confluent` `benchling` `plaid`，可能不用 Greenhouse 或公司名不对。

### 如何找到更多公司

```
方法 1：Google 搜 site:boards.greenhouse.io
方法 2：看目标公司招聘页 URL 是否含 boards.greenhouse.io
方法 3：GitHub 上有公开的 Greenhouse 公司列表仓库
```

**Greenhouse 官方客户数千家，理论总量数十万条。**

## 七、实用价值

| 动作 | 数据支撑 |
|---|---|
| **找远程工作** | 1,446 条远程职位 |
| 按技术栈筛 | Engineer 2,240 条、AI/ML 412 条 |
| 按公司筛 | 24 家已采集 |
| 按新鲜度筛 | 46% 是 7 天内的 |

### 代码模板

```javascript
const companies = ['stripe','databricks','cloudflare'];
const all = [];
for (const c of companies) {
  const res = await fetch(url(c));
  const { jobs } = await res.json();
  all.push(...jobs);
  await new Promise(r => setTimeout(r, 1100));
}
```

## 八、结论

| 维度 | 评分 |
|---|---|
| 数据量 | ⭐⭐⭐⭐⭐（5,881 且可无限扩） |
| 新鲜度 | ⭐⭐⭐⭐⭐（46% 在 7 天内） |
| 数据质量 | ⭐⭐⭐⭐⭐（100% 完整） |
| 获取难度 | ⭐⭐⭐⭐⭐（纯 API 无鉴权） |
| **综合** | **⭐⭐⭐⭐⭐** |

**这是本次研究最重大的发现：可无限扩展、完全免费、无鉴权、数据极新的真实职位源。**

## 九、数据

| 文件 | 内容 |
|---|---|
| `_greenhouse_jobs.json` | **5,881 条**（24 家公司） |
| `_gh_scrape.mjs` | 首次抓取 |
| `_gh_expand.mjs` | 扩充脚本 |
