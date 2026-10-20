---
date: 2026-10-20
tags: [工作, 平台研究, 社会影响, 招聘板, 薪资透明]
---

# 平台研究 #64 · TechJobsForGood【101 条 · 97% 有薪资】

> **社会影响科技岗位招聘板。**
> **数据质量：101 条职位全部有公司名，98 条（97%）有明确薪资。**

## 一、平台特点

| 项 | 内容 |
|---|---|
| 定位 | 社会影响/公益科技岗位 |
| 市场 | 美国为主 |
| **薪资** | **✅ 97%** |
| **公司名** | **✅ 100%** |
| 分页 | ✅ 4 页有效 |

## 二、数据完整性（最好的之一）

| 字段 | 有值 | 占比 |
|---|---|---|
| **职位标题** | **101** | **100%** |
| **公司名** | **101** | **100%** ⭐ |
| **薪资** | **98** | **97%** ⭐ |

## 三、薪资分布

| 薪资上限区间 | 数量 | 占比 |
|---|---|---|
| $0K-80K | 6 | 6% |
| $80K-100K | 18 | 18% |
| $100K-130K | 12 | 12% |
| $130K-170K | 17 | 17% |
| $170K-999K | 45 | 46% |

### 关键统计

| 指标 | 数值 |
|---|---|
| 薪资样本 | 98 条 |
| **中位下限** | **$120K** |
| **中位上限** | **$160K** |
| 最高上限 | $324K |
| 最低下限 | $58K |

## 四、真实职位样本（含公司名和薪资）

| 公司 | 职位 | 薪资 |
|---|---|---|
| Intertribal Software | Director, Business Development | **$80K - $90K** |
| TrueMark | Senior Software Engineer | **$140K - $190K** |
| Art of Problem Solving | Senior Product Design Team Lead | **$139K - $171K** |
| Constructive Dialogue  | Software Engineer (Early Career) | **$72K - $82K** |
| Recidiviz | Data Analyst (Entry-Level) | **$85K** |
| Swiftly | Senior Software Engineer (Full-stack) | **$130K - $210K** |
| Schoolhouse.world | Software Engineer | **$167K - $207K** |
| Grounded Solutions Net | Data &amp; Customer Success, Senior Specia | **$75K - $85K** |
| Swiftly | Senior Software Engineer (IoT) | **$124K - $205K** |
| Local Public | Product Manager | **$100K - $110K** |
| Constructive Dialogue  | Senior Manager, Qualitative Evaluation and | **$101K - $113K** |
| FreeWill | Lead Software Engineer, AI-Native | **$190K - $210K** |

## 五、与其他薪资透明平台对比

| 平台 | 样本 | 薪资 | 公司名 | 特点 |
|---|---|---|---|---|
| **TechJobsForGood** | 101 | **97%** ⭐ | **100%** ⭐ | 社会影响 |
| Wellfound | 244 | **100%** | ❌ | +股权 |
| Greenhouse | 5,881 | 0% | ✅ | 量最大 |
| Himalayas | 264 | 34% | ✅ | API |
| Larajobs | 23 | 65% | ✅ | Laravel |

**TechJobsForGood 是唯一「薪资 97% + 公司名 100%」双高的平台。**

## 六、社会影响岗位的特点

| 特点 | 说明 |
|---|---|
| 公司类型 | 非营利、教育科技、公益 |
| 薪资水平 | $72K-$207K（低于商业公司） |
| 稳定性 | 可能依赖捐赠资金 |
| 意义感 | 社会价值高 |

**适合想「做有意义的工作」同时需要收入的人。**

## 七、结论

| 维度 | 评分 |
|---|---|
| 数据量 | ⭐⭐⭐（101 条） |
| **薪资透明度** | **⭐⭐⭐⭐⭐（97%）** |
| **公司名完整度** | **⭐⭐⭐⭐⭐（100%）** |
| 获取难度 | ⭐⭐⭐⭐⭐（纯 HTML） |
| **综合** | **⭐⭐⭐⭐** |

### 用途

| 用途 | 说明 |
|---|---|
| 找社会影响岗位 | 101 条真实职位 + 公司名 |
| 了解公益科技薪资 | 中位 $160K |
| **可直接投递** | **有公司名** ⭐ |

## 八、数据

| 文件 | 内容 |
|---|---|
| `_tjfg_jobs.json` | **101 条**（id/title/company/salary） |
| `_raw_tjfg/` | 4 页原始 HTML |
| `parse-tjfg.mjs` | 解析器 |

**技术要点：**
- 卡片锚点：`job-card`（108 个）
- 标题：`job-title` 的 `title` 属性
- 公司：`company-name` 的 `title` 属性
- 薪资格式：`$140K - $190K`
- 分页：`?page=N`（4 页有效）
