---
date: 2026-10-20
tags: [工作, 平台研究, Lever, ATS, Palantir]
---

# 平台研究 #69 · Lever ATS 公开 API【Palantir 309 条】

> **与 Greenhouse/Ashby 同类的 ATS，第三个可用的公开 API。**
> **测试 3 家公司只有 Palantir 可用（309 条）。**

## 一、API 方式

```
https://api.lever.co/v0/postings/{company}?mode=json
```

| 项 | 内容 |
|---|---|
| 登录 | 不需要 |
| 字段 | text（职位）/categories.team / categories.location / createdAt |

## 二、测试结果

| 公司 | 结果 |
|---|---|
| **palantir** | **✅ 309 条** |
| vercel | ❌ 0 条（可能用 Greenhouse） |
| attentive | ❌ 0 条 |

## 三、Palantir 数据

| 指标 | 数值 |
|---|---|
| 职位数 | **309** |
| 有部门分类 | 309 |
| 有地点 | 309 |
| 有创建时间 | 309 |

### 新鲜度

| 指标 | 数值 |
|---|---|
| 7 天内 | 9 |
| 30 天内 | 20 |
| **中位** | **480 天** |

### 地点分布

| 地点 | 数量 |
|---|---|
| New York, NY | 97 |
| Washington, D.C. | 69 |
| London, United Kingdom | 44 |
| Palo Alto, CA | 30 |
| Seattle, WA | 12 |
| Denver, CO | 7 |
| Honolulu, HI | 7 |
| Singapore, Singapore | 5 |

### 部门分布

| 部门 | 数量 |
|---|---|
| Dev | 89 |
| Delta | 60 |
| Echo | 33 |
| Information Security | 21 |
| Legal | 15 |
| Finance | 14 |
| Design | 13 |
| Business Development | 12 |

## 四、真实职位样本

| 职位 | 部门 | 地点 |
|---|---|---|
| Administrative Business Partner | Administrative | Singapore, Singapo |
| Administrative Business Partner | Administrative | London, United Kin |
| Administrative Business Partner - ShipOS | Administrative | Washington, D.C. |
| Administrative Business Partner - ShipOS | Administrative | New York, NY |
| Backend Software Engineer - Application De | Dev | London, United Kin |
| Backend Software Engineer - Application De | Dev | New York, NY |
| Backend Software Engineer - Defense | Dev | Washington, D.C. |
| Backend Software Engineer - Defense | Dev | Palo Alto, CA |
| Backend Software Engineer - Defense | Dev | New York, NY |
| Backend Software Engineer - Infrastructure | Dev | New York, NY |

## 五、三个 ATS 对比

| ATS | 可用公司 | 已采集 | 字段 |
|---|---|---|---|
| **Greenhouse** | 24+ | **5,974** | id/title/loc/updated |
| **Ashby** | 6 | **1,452** | +dept/team/isRemote/published |
| **Lever** | 1（Palantir） | **309** | text/categories/createdAt |
| **合计** | **31 家** | **7,735 条** | |

**三个 ATS 合计 7,735 条真实职位。**

## 六、结论

| 维度 | 评分 |
|---|---|
| 数据量 | ⭐⭐⭐（309 条，单一公司） |
| 新鲜度 | ⭐⭐⭐⭐ |
| 字段丰富度 | ⭐⭐⭐⭐（有部门/地点/时间） |
| **综合** | **⭐⭐⭐⭐** |

### 用途

| 用途 | 说明 |
|---|---|
| 找 Palantir 的工作 | 309 条全部 |
| **了解「一家大公司有多少岗位」** | Palantir 309 条 |
| 测试 Lever 可用性 | 只有这家可用 |

## 七、数据

| 文件 | 内容 |
|---|---|
| `_lever_jobs.json` | **309 条** |
| `_ashby_jobs.json` | 1,452 条（含 Notion 122 新增） |
| `_greenhouse_jobs.json` | 5,974 条（含 Vercel 93 新增） |
| `_ats_merge.mjs` | 合并脚本 |
