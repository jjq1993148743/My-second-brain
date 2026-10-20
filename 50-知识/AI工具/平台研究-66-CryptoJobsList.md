---
date: 2026-10-20
tags: [工作, 平台研究, CryptoJobsList, Web3, sitemap]
---

# 平台研究 #66 · CryptoJobsList【679 条 sitemap + 100 条 feed】

> **突破方法：列表页只有 25 条，但 sitemap 有 679 条，RSS feed 有 100 条。**
> **这是「列表页受限时如何找全量数据」的典型案例。**

## 一、⭐ 三种数据获取方式对比

| 方式 | 数量 | 薪资 | 说明 |
|---|---|---|---|
| 列表页 | **25** | 无 | 只有首屏 |
| **sitemap-jobs.xml** | **679** | 无 | 全量 URL |
| **RSS feed** | **100** | **15 条** | 最新 100 条 |

**sitemap 是获取全量的关键。**

## 二、sitemap 数据（679 条）

### URL 结构

```
https://cryptojobslist.com/jobs/{职位}-{地点}-at-{公司}
```

**例：** `/jobs/quantitative-developer-options-pricing-singapore-at-paradex`

### 公司分布（Top 10）

| 公司 | 职位数 |
|---|---|
| **tether-operations-limited** | 39 |
| **blockstream** | 39 |
| **coinbase** | 34 |
| **kraken** | 29 |
| **crypto-com** | 29 |
| **openfx** | 26 |
| **bitgo** | 21 |
| **chainalysis** | 19 |
| **ondo-finance** | 18 |
| **rain** | 17 |

## 三、RSS feed 数据（100 条）

| 字段 | 有值 | 占比 |
|---|---|---|
| 标题 | 100 | 100% |
| 链接 | 100 | 100% |
| 发布日期 | 100 | 100% |
| **薪资** | **15** | **15%** |

### 薪资样本

| 职位 | 薪资 |
|---|---|
| Principal Product Designer | **$158,400** |
| Software Engineer, Trading Product | **$150k** |
| Frontend Engineer (React, Web3) | **$155,000** |
| Solidity Compiler Frontend Engineer | **$140,000** |
| Staff Software Engineer, C++/Rust | **$190,000** |
| Senior People Operations Partner | **$130,000** |
| Engineering Lead, Wallets (NYC) | **$225,000** |
| Blockchain Security Expert - Anti Defect Trac | **$90,000** |

## 四、⭐⭐ 方法论价值：三种获取方式

| 方式 | 何时用 | 优点 | 缺点 |
|---|---|---|---|
| **列表页** | 常规 | 有结构化字段 | 只有首屏 |
| **sitemap** | 列表受限时 | **全量 URL** | 只有 URL，无字段 |
| **RSS feed** | 需要最新 | 有标题/日期/描述 | 只有最近 N 条 |

**组合使用：sitemap 拿全量 → feed 拿字段 → 详情页拿薪资。**

## 五、与其他 Web3 平台对比

| 平台 | 样本 | 薪资 | 时间 | 获取方式 |
|---|---|---|---|---|
| **CryptoJobsList** | **679**（sitemap） | 15% | ✅ | sitemap+feed |
| Web3.career | 121 | **88%** | ✅ | 表格 |
| remote3 | 22,000+（宣称） | — | — | SPA 无法抓 |
| cryptojobs（前） | 311KB | 38 信号 | — | 列表 |

## 六、结论

| 维度 | 评分 |
|---|---|
| 数据量 | ⭐⭐⭐⭐⭐（679 条） |
| 薪资透明度 | ⭐⭐（15%） |
| **获取方法价值** | **⭐⭐⭐⭐⭐（sitemap 突破）** |
| **综合** | **⭐⭐⭐⭐** |

### 关键收获

**当列表页只有 25 条时，我通过 sitemap 拿到了 679 条（27 倍）。**

**这个方法可以复用到任何 WordPress/标准 CMS 站点：**

```
试这些路径：
  /sitemap.xml
  /sitemap_index.xml
  /sitemap-jobs.xml
  /sitemap-posts.xml
  /feed
  /rss
```

## 七、数据

| 文件 | 内容 |
|---|---|
| `_cjl_sitemap.xml` | **679 个职位 URL** |
| `_cjl_feed.json` | **100 条**（含 15 条薪资） |
| `_cjl_jobs.json` | 25 条（列表页解析） |
