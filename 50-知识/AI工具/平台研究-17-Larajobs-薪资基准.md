---
date: 2026-10-20
tags: [工作, 平台研究, 薪资参考, 远程工作]
---

# 平台研究 #17 · Larajobs【23 条 · 薪资数据极佳】

> **样本只有 23 条，但薪资数据是本次所有研究中最清晰、最真实的。**
> Larajobs 是 Laravel 生态的垂直招聘板，每个职位都公开年薪。

## 一、平台特点

| 项 | 内容 |
|---|---|
| 定位 | Laravel（PHP 框架）垂直招聘板 |
| 市场 | 全球远程 |
| 薪资 | **✅ 公开真实年薪** |
| 语言 | 英语 |
| 规模 | 每页 25 条，分页有效 |

## 二、⭐ 核心价值：真实薪资数据

### 薪资统计（15 条有薪资）

| 指标 | 数值 |
|---|---|
| 样本 | 15 条 |
| **中位年薪** | **$90,000** |
| **最高年薪** | **$220,000** |
| 最低 | 约 $48,000 |

### 高薪职位详情（真实数据）

| 公司 | 职位 | 年薪 |
|---|---|---|
| Prompt Health | Senior Full Stack Engineer (B2B) | **$170,000–$220,000** |
| Givebutter | Senior Software Engineer | **$170,000–185,000** |
| Evolution Collect | Senior Full Stack (PHP/Laravel) | **$160,000–$180,000** |
| Hospitable | Senior Product Engineer (Laravel Remote) | **$134,450–$167,258** |
| Lumion | Lead Engineer — Payments | **$110,000–$145,000** |
| Resource Innovations | Senior Software Engineer | **$120,000–$144,000** |
| Supporting Cast | Software Engineer | **$115,000–$135,000** |
| Gradient Financial | Lead AI Software Engineer | **$100,000–$140,000** |
| LabelWorx (UK) | Principal Software Engineer | **£80,000–£100,000** |
| Trybe | Senior Laravel Developer | **£70,000–£90,000** |

## 三、与其他渠道的薪资对比

| 渠道 | 年薪/时薪 |
|---|---|
| **Larajobs（Laravel 远程）** | **$90,000 中位，$220,000 最高** |
| WWR 远程全职（中位） | $60,000 |
| WWR 远程全职（高端） | $170,000 |
| Collective（法国咨询日薪） | €409-909/天 ≈ €100k-227k/年 |
| **接单平台（一品威客）** | **¥3,200/项目** |
| **接单平台（Freelancer）** | **$11/hr ≈ $22,000/年** |

### 换算成时薪（按 2000 小时/年）

| 渠道 | 时薪 |
|---|---|
| Larajobs 最高 | **$110/hr** |
| Larajobs 中位 | **$45/hr** |
| Freelancer.com | $11/hr |

**Larajobs 中位时薪是 Freelancer 的 4 倍。**

## 四、为什么这个数据有价值

**1. 垂直领域薪资透明**

Laravel 开发者能明确知道：
- 中级：$48,000–$80,000
- 高级：$100,000–$150,000
- 资深/Lead：$160,000–$220,000

**2. 远程是标配**

所有职位都是远程或远程优先。

**3. 英语环境**

全部英语职位，无需学新语言。

## 五、局限

| 局限 | 说明 |
|---|---|
| 样本小 | 只有 23 条（分页有效但总量少） |
| 技术栈单一 | 只有 Laravel/PHP 生态 |
| 需面试 | 不是接单，是入职 |

## 六、结论

| 维度 | 评分 |
|---|---|
| 薪资数据质量 | ⭐⭐⭐⭐⭐ |
| 薪资水平 | ⭐⭐⭐⭐⭐ |
| 样本量 | ⭐⭐ |
| 技术栈覆盖 | ⭐⭐（仅 Laravel） |
| **综合** | **⭐⭐⭐⭐（作为薪资基准）** |

**用途：这是「PHP/Laravel 开发者市场价」的权威参考。**

**类似思路可以找其他技术栈的垂直招聘板**（React Jobs、Vue Jobs、Python Jobs、Go Jobs 等），它们的薪资数据同样透明。

## 七、数据与复现

| 文件 | 内容 |
|---|---|
| `_larajobs_projects.json` | 23 条（URL/公司/职位/类型/薪资） |
| `_raw_larajobs/p01-p10.html` | 10 页 |
| `parse-larajobs.mjs` | 解析器 |

**技术要点**：
- 职位卡片：`class="job-link"`
- 薪资格式：`- $120,000 - $144,000`
- 分页：`?page=N`（每页 25 条）
