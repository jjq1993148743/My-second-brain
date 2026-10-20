---
date: 2026-10-20
tags: [工作, 平台研究, 拉美, 小样本]
---

# 平台研究 #15 · Workana【45 条 · 小样本】

> **诚实说明：只抓到 45 条，远低于 200 条目标。**
> 原因：Workana 是 SPA，分页和分类页都需要 JS 深度渲染。

## 一、平台特点

| 项 | 内容 |
|---|---|
| 定位 | 拉美最大自由职业平台 |
| 市场 | 阿根廷、墨西哥、哥伦比亚、智利、西班牙 |
| 语言 | 西班牙语 / 葡萄牙语 |
| 币种 | USD / ARS / MXN |

## 二、抓到什么（45 条）

| 指标 | 数值 |
|---|---|
| 项目数 | **45** |
| 有相对时间 | **45（100%）** |
| 有预算 | 1（2%） |
| 有投标数 | 0 |

## 三、新鲜度 ✅

| 指标 | 数值 |
|---|---|
| 1 小时内 | 6 |
| 12 小时内 | 25 |
| 24 小时内 | 45 |
| 中位 | 12 小时 |

**结论：项目都是当天/近两天发布的，是活平台。**

## 四、开发类项目

共 22 条（49%）：

| 项目 | 发布时间 |
|---|---|
| Desarrollador Full Stack para Plataforma de Gestión de Mante | Hace 13 horas |
| Desarrollo de Sitio Web con Chatbot Ia y Aplicación Móvil Pe | Hace 19 horas |
| Desarrollo de Agente de Ia Conversacional para Atención Tele | Hace 5 horas |
| Desarrollo de Página Web con Inteligencia Artificial para Im | Hace 9 horas |
| Editor de Video para E-commerce con Experiencia en Ia y Estr | Hace 9 horas |
| Desarrollo de Asistente Conversacional con Ia para Whatsapp  | Hace 9 horas |
| Especialista en Gestión de Mensajes y Ventas por Whatsapp | Hace 10 horas |
| Implementación de Chatbot para Optimizar Atención al Cliente | Hace 10 horas |

## 五、为什么样本不足

| 尝试 | 结果 |
|---|---|
| curl 首页 | 156KB 但只有 10 行（SPA 骨架） |
| Chrome 首页 | 136KB，9 个项目链接 |
| Chrome 分类页 | 80KB，0 个链接（分类页更空） |
| 分页 `?page=N` | 内容相同 |

**Workana 的项目列表是深度 JS 渲染，Chrome 也只能拿到首屏 9 个。**

## 六、已知信息（来自公开资料）

| 项 | 内容 |
|---|---|
| 佣金 | 对自由职业者收取约 10-15%（按等级） |
| 用户规模 | 拉美最大，500 万+ 注册用户 |
| 特点 | 西班牙语为主，也有葡萄牙语 |

> ⚠️ 以上佣金数据来自公开资料，**未在本轮实测验证**。

## 七、结论

| 维度 | 评价 |
|---|---|
| 数据可得性 | ⭐（只能抓 45 条） |
| 新鲜度 | ⭐⭐⭐⭐（全是当天的） |
| 开发类占比 | 🟡 待验证 |
| **综合** | **⭐⭐（数据不足，无法评估）** |

**建议：如果你会西班牙语，可以注册后自己看；否则不值得投入。**

## 八、数据

| 文件 | 内容 |
|---|---|
| `_workana_projects.json` | 45 条（URL/标题/时间） |
| `_workana2.html` | Chrome 渲染后的首页 |
| `parse-workana.mjs` | 解析器 |
