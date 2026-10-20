---
date: 2026-10-20
tags: [工作, 平台研究, 远程工作, API, 薪资]
---

# 平台研究 #22 · RemoteOK【99 条 · 公开 API】

> **重要发现：RemoteOK 有公开 JSON API，无需登录、无需渲染。**
> 这是本次研究中唯一一个「API 直接返回结构化数据」的平台。

## 一、API 信息

| 项 | 内容 |
|---|---|
| API 地址 | **`https://remoteok.com/api`** |
| 返回格式 | JSON 数组 |
| 单次返回 | 99 个有效职位 |
| 需要登录 | ❌ 不需要 |
| 需要渲染 | ❌ 不需要（纯 JSON） |
| 关键字段 | slug/id/epoch/date/company/position/tags/location/**salary_min**/salary_max |

## 二、数据统计

| 指标 | 数值 |
|---|---|
| 职位数 | **99** |
| **有薪资字段** | **20 条（20%）** |
| 日期范围 | 2026-08-11 → 10-18 |
| **1 天内** | **2 条** |
| 7 天内 | **30 条（30%）** |
| **中位已挂** | **26 天** |

**⚠️ 新鲜度一般——中位挂了 26 天。**

## 三、⭐ 真实薪资数据（20 条）

| 公司 | 职位 | 年薪区间 |
|---|---|---|
| Sanctuary Computer | Head of Technology | **$140,000 – $250,000** |
| SimSpace Corporation | Senior Sales Executive | **$145,000 – $220,000** |
| Self Bill Pro | Director of Product Management | **$130,000 – $160,000** |
| iMerit Technology | AI Trainer | **$50,000 – $70,000** |
| Ultimate Marketing | Customer Support Specialist | **$50,000 – $90,000** |
| QuickMail | Technical Customer Support | **$30,000 – $50,000** |
| Askable | Software Engineer AI Coding Tasks | **$10,000** |

**薪资跨度巨大：从 $10,000 到 $250,000。**

## 四、标签分布（判断市场需求）

| 标签 | 数量 |
|---|---|
| exec | 62 |
| digital nomad | 47 |
| customer support | 45 |
| engineer | 42 |
| marketing | 41 |
| ops | 37 |
| dev | 34 |
| technical | 33 |
| medical | 32 |
| design | 32 |

**观察：客服（45）和营销（41）需求接近工程师（42）。**

**这说明远程工作市场中，非技术岗位的机会和技术岗一样多。**

## 五、与其他远程平台对比

| 平台 | 获取方式 | 样本 | 薪资 | 新鲜度 |
|---|---|---|---|---|
| **RemoteOK** | ✅ **公开 API** | 99 | ✅ 20 条 | 26 天中位 |
| Remotive | ✅ 公开 API | 12/类 | ✅ 部分 | 未知 |
| WWR | ❌ 需抓 HTML | 24 | ✅ 部分 | 未知 |
| Himalayas | ❌ API 返回空 | — | — | — |

**RemoteOK 是唯一「API 直接可用」的平台。**

## 六、结论

| 维度 | 评分 | 说明 |
|---|---|---|
| 获取难度 | ⭐⭐⭐⭐⭐ | API 直接返回 JSON |
| 数据量 | ⭐⭐⭐ | 99 条 |
| 薪资透明度 | ⭐⭐⭐ | 20% 有薪资 |
| 新鲜度 | ⭐⭐ | 中位 26 天 |
| **综合** | **⭐⭐⭐** | 方便但不新鲜 |

### 用途

**适合：** 快速跑一次拿到 99 个远程职位的结构化数据（含公司、职位、标签、薪资）。

**不适合：** 找最新机会（中位 26 天太老）。

## 七、技术要点（可复用）

```javascript
// RemoteOK API 标准调用
const res = await fetch('https://remoteok.com/api');
const jobs = await res.json();
// 第一条是 legal 声明，需要过滤
const real = jobs.filter(j => j.id && j.position);
```

**注意：**

1. 返回数组的第一项是法律声明，不是职位
2. `salary_min/salary_max` 为 0 表示未公开
3. 无需代理即可访问（但走代理更稳）

## 八、数据

| 文件 | 内容 |
|---|---|
| `_remoteok_jobs.json` | 99 条（slug/id/date/company/position/tags/location/salary） |
| `_remoteok.mjs` | 抓取脚本 |
