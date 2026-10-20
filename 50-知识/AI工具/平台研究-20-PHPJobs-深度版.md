---
date: 2026-10-20
tags: [工作, 平台研究, PHP, 远程工作]
---

# 平台研究 #20 · PHPJobs.io【167 条实测】

> **抓取：2026-10-20 10:35–10:55**　｜　**样本：167 条**　｜　**方式：curl 串行 12 个分类页**
> **PHP 生态垂直招聘板，覆盖 Laravel / WordPress / Symfony / Drupal / Magento 等。**

## 一、数据完整性

| 字段 | 有值 | 占比 |
|---|---|---|
| 职位标题 | **167** | **100%** |
| 薪资 | 0 | 0% ❌ |
| 发布时间 | 0 | 0% ❌ |

**⚠️ 薪资和时间字段需要 JS 渲染，curl 拿不到。**

## 二、技术栈分布

| 技术/级别 | 数量 | 占比 |
|---|---|---|
| Senior | 48 | 29% |
| PHP | 41 | 25% |
| Full Stack | 36 | 22% |
| Laravel | 22 | 13% |
| WordPress | 17 | 10% |
| Drupal | 16 | 10% |
| Magento | 13 | 8% |
| Symfony | 10 | 6% |
| Backend | 9 | 5% |
| DevOps | 5 | 3% |
| React | 3 | 2% |
| API | 3 | 2% |
| JavaScript | 3 | 2% |
| Vue | 1 | 1% |
| MySQL | 1 | 1% |

**PHP 占最多（自然），Senior/Lead 级别占 29%。**

## 三、分类页覆盖

| 分类 | 岗位数 |
|---|---|
| api | 20 |
| backend | 18 |
| drupal | 18 |
| laravel | 14 |
| magento | 14 |
| symfony | 14 |
| wordpress | 14 |
| full-stack | 13 |
| mysql | 13 |
| devops | 11 |
| javascript | 10 |
| vue | 8 |

## 四、远程比例

| 指标 | 数值 |
|---|---|
| 标题含「Remote」 | 63 条（38%） |

**超过三分之一的 PHP 岗位是远程。**

## 五、与其他 PHP 平台对比

| 平台 | 样本 | 薪资 | 特点 |
|---|---|---|---|
| **PHPJobs.io** | **167** | ❌ 需 JS | 覆盖最广 |
| Larajobs | 23 | ✅ | Laravel 专精 |
| Larajobs 延伸 | — | ✅ | 中位 $90k |

**PHPJobs 的优势是覆盖面（12 个分类），劣势是没有薪资。**

## 六、结论

| 维度 | 评分 |
|---|---|
| 数据量 | ⭐⭐⭐⭐（167 条） |
| 覆盖面 | ⭐⭐⭐⭐⭐（12 分类） |
| 薪资透明度 | ⭐ |
| **综合** | **⭐⭐⭐** |

**定位：PHP 岗位分布参考。要薪资数据用 Larajobs。**

## 七、数据与复现

| 文件 | 内容 |
|---|---|
| `_phpjobs_projects.json` | 167 条（id/URL/标题/分类） |
| `_raw_phpjobs/*.html` | 12 个分类页 |
| `parse-phpjobs.mjs` | 解析器 |

**技术要点**：
- 卡片 class：`job-list-item`
- 职位 ID 在 `data-job-id`（ULID 格式）
- 标题从 URL slug 还原
- 薪资/时间是 Alpine.js 动态渲染，curl 拿不到
