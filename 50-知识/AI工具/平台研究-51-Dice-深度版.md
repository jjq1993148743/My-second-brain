---
date: 2026-10-20
tags: [工作, 平台研究, 美国, 技术招聘]
---

# 平台研究 #51 · Dice.com【321 条实测】

> **美国最大的技术岗位招聘板之一。**
> **优势：薪资公开。劣势：公司名和发布时间拿不到。**

## 一、平台特点

| 项 | 内容 |
|---|---|
| 定位 | 美国技术岗位专业招聘板 |
| 市场 | 美国 |
| 薪资 | 部分公开 |
| 分页 | `?page=N` 有效 |

## 二、数据完整性

| 字段 | 有值 | 占比 |
|---|---|---|
| **职位标题** | **321** | **100%** |
| 薪资 | 8 | 2.5% |
| 公司名 | 0 | 0% |
| 发布时间 | 0 | 0% |

**公司名和时间需 JS 渲染，curl 拿不到。**

## 三、真实薪资样本

| 薪资 |
|---|
| **$133,000 – $208,500 / year** |
| $50 – $55 / hour |
| $40 – $44 / hour |

## 四、技术方向分布

| 方向 | 数量 | 占比 |
|---|---|---|
| Engineer | 197 | 61% |
| Manager/Director | 30 | 9% |
| Security | 17 | 5% |
| Cloud/DevOps | 14 | 4% |
| Data | 12 | 4% |
| AI/ML | 11 | 3% |
| Architect | 7 | 2% |

## 五、真实职位样本

| 职位 |
|---|
| Machine Learning Ops Engineer |
| Security Data Engineer |
| CI-CD Pipeline Developer |
| AI/Data Engineer |
| Director of AI Engineering |
| AI Lead Engineer/Architect |
| Senior Identity and Access Management Architect |

**观察：AI 相关岗位占显著比例。**

## 六、与其他招聘板对比

| 平台 | 样本 | 薪资 | 公司名 | 时间 | 市场 |
|---|---|---|---|---|---|
| **Dice** | **321** | 2.5% | 无 | 无 | 美国 |
| Himalayas | 264 | 34% | 有 | 有 | 全球 |
| Larajobs | 23 | 65% | 有 | 无 | 全球 |
| EuroTechJobs | 184 | 无 | 有 | 有 | 欧洲 |

## 七、结论

| 维度 | 评分 |
|---|---|
| 数据量 | ⭐⭐⭐⭐ |
| 薪资透明度 | ⭐⭐ |
| 字段完整度 | ⭐ |
| **综合** | **⭐⭐** |

**用途：了解美国技术岗位类型和薪资水平。不适合找具体机会（无公司名）。**

## 八、数据

| 文件 | 内容 |
|---|---|
| `_dice_projects.json` | **321 条** |
| `_raw_dice/` | 10 页原始 HTML |
| `parse-dice.mjs` | 解析器 |

**技术要点：**
- 卡片锚点：`data-testid="job-card"`
- 标题格式：`View Details for {职位名}`
- 分页：`?page=N`
