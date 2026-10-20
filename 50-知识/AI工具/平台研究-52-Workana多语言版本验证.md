---
date: 2026-10-20
tags: [工作, 平台研究, Workana, 同源验证, 拉美]
---

# 平台研究 #52 · Workana 多语言版本验证

> **发现：Workana 的 es / en / pt 三个语言版本项目完全不重叠（0%）。**
> **这意味着它是「按语言分区」的独立池结构。**

## 一、⭐ 验证结果

| 对比 | 样本 | 重叠 |
|---|---|---|
| **es vs en** | 9 vs 7 | **0%** |
| **es vs pt** | 9 vs 9 | **0%** |
| **en vs pt** | 7 vs 9 | **0%** |

**三个语言版本完全没有重叠项目。**

### 项目样本对比

| 版本 | 项目 slug |
|---|---|
| **es** | `desarrollador-full-stack-para-plataforma-de-gestion-de-mantenimiento-web` |
| **en** | `custom-high-density-circular-mcpcb-design-for-underwater-led-light-fixture` |
| **pt** | `vetorizacao-e-design-de-identidade-visual-infantil-para-kit-festa-personalizado` |

**完全不同的项目类型：**

| 版本 | 市场 | 项目特点 |
|---|---|---|
| es | 西班牙语区 | 软件开发、QA |
| en | 英语区 | 硬件设计、翻译、预约专员 |
| pt | 葡萄牙语区 | 视觉设计、会计、数据录入 |

## 二、⭐⭐ 这是第四种池结构

**之前已知三种：**

| 结构 | 例子 | 重叠 |
|---|---|---|
| 全同源 | Freelancer 10 个域名 | 48-96% |
| 共用子池 | Freelancer .mx/.cl | 彼此 93% |
| 完全独立 | Freelancermap .de/.at/.ch | 1-3% |

**现在加上第四种：**

| 结构 | 例子 | 重叠 |
|---|---|---|
| **按语言分区** | **Workana es/en/pt** | **0%** |

### 与 Freelancermap 的区别

| 平台 | 分区依据 | 重叠 |
|---|---|---|
| Freelancermap | **国家**（德/奥/瑞士） | 1-3% |
| **Workana** | **语言**（西/英/葡） | **0%** |

**Workana 是按语言而非国家分区，所以重叠更低（0% vs 1-3%）。**

## 三、⭐ 但数据量仍然很少

| 版本 | 首页可见项目 |
|---|---|
| es | 9 |
| en | 7 |
| pt | 9 |
| **合计** | **25** |

**即使三个版本加起来，首页也只有 25 个项目。**

### 为什么这么少

| 原因 | 说明 |
|---|---|
| SPA 深度渲染 | Chrome 只能拿到首屏 |
| 无限滚动 | 后续内容需 JS 交互加载 |
| 无分页 URL | `?page=N` 无效 |

**这是 Workana 的硬限制，无法绕过。**

## 四、⭐ 之前报告的修正

### 原报告（#15）

| 项 | 内容 |
|---|---|
| 样本 | 45 条 |
| 结论 | 「数据不足，无法评估」 |

### 现在的补充

| 项 | 内容 |
|---|---|
| **池结构** | **按语言分区，3 个独立池** |
| 每池可得数据 | 7-9 条（首页上限） |
| 结论 | 「数据不足」仍然成立，但**结构已搞清楚** |

## 五、⭐ 一个有用的发现

**用相同的抓取代码，能确认多语言版本的池结构。**

```javascript
// 方法
const es = await chrome('https://www.workana.com/jobs');
const en = await chrome('https://www.workana.com/en/jobs');
const pt = await chrome('https://www.workana.com/pt/jobs');
// 提取 /job/ slug 并对比
// 结果：三者 0% 重叠
```

**这个检查只花了 3 次请求、约 15 秒。**

## 六、结论

| 维度 | 评价 |
|---|---|
| 池结构 | ✅ 已确认（3 个按语言分区） |
| 数据量 | ❌ 每池仅 7-9 条 |
| **实用价值** | **⭐**（无法评估） |
| **结构价值** | **⭐⭐⭐**（补充了第四种池结构） |

### 与其他拉美平台对比

| 平台 | 样本 | 池结构 |
|---|---|---|
| **Freelancer 拉美池** | **725** | 国家分区（.mx/.cl 共用） |
| **Workana** | 25（首页） | **语言分区（es/en/pt 独立）** |

**要研究拉美市场，Freelancer 拉美池（725 条）比 Workana（25 条）有用得多。**

## 七、数据

| 文件 | 内容 |
|---|---|
| `_wk_es-all.html` | 西语版首页 |
| `_wk_en-all.html` | 英语版首页 |
| `_wk_pt-all.html` | 葡语版首页 |
| `_workana_projects.json` | 之前采集的 45 条 |

**技术要点：**
- 需 Chrome headless 渲染
- 项目锚点：`project-item js-project`
- 三个语言版本用同一套 DOM
- 无分页参数，内容靠无限滚动加载
