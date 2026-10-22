---
date: 2026-10-22
tags: [工作, 搞钱, DSH插件, SEO拆解, 标题写法, 实操]
---

# SEO 站点怎么给插件写标题（实测拆解）

> **抓了 awesome-dsh-plugin.com 的插件详情页，看它的 title/description 怎么生成。**
> **这直接决定了「你的插件被抓取后长什么样」。**

## 一、⭐⭐⭐ 实测样本

**页面：** `awesome-dsh-plugin.com/p/MichengAI/dsh-code-review/`

| 元素 | 实际内容 |
|---|---|
| **`<title>`** | **`MichengAI/dsh-code-review — dsh plugin · Git & Code Review`** |
| **`<meta description>`** | `Adds /review, /review-status, and /review-cancel to spawn an independent native subagent that inspects a chosen Git scope (base branch, uncommitted…` |
| **`canonical`** | `https://awesome-dsh-plugin.com/p/MichengAI/dsh-code-review/` |
| **`og:title`** | 与 title 相同 |
| **`<h1>`** | 未找到（可能用 div 渲染） |
| **JSON-LD** | ❌ 没有 |

## 二、⭐⭐⭐ 拆解它的标题公式

### 格式

```
{owner}/{repo} — dsh plugin · {分类名}
```

### 逐部分解析

| 部分 | 作用 | 例子 |
|---|---|---|
| **`{owner}/{repo}`** | 唯一标识（也含关键词） | `MichengAI/dsh-code-review` |
| **`— dsh plugin`** | **固定后缀（SEO 关键词）** | 每页都有 |
| **`· {分类名}`** | 分类（也是关键词） | `Git & Code Review` |

### ⭐⭐ 关键洞察

| 洞察 | 说明 |
|---|---|
| **「dsh plugin」是固定后缀** | **它靠这个吃「dsh plugin」这个搜索词** |
| **分类名放在最后** | `Git & Code Review` 也是搜索词 |
| **repo 名里带关键词** | `dsh-code-review` 本身就含「code review」 |

## 三、⭐⭐ description 的来源

### 实测：它用的是插件的英文描述

| 来源 | 内容 |
|---|---|
| **插件的 `description.en`** | `Adds /review, /review-status, and /review-cancel to spawn an independent native subagent...` |
| **截断长度** | 约 160 字符（后面用 `…`） |

### ⭐⭐ 这意味着

> **你在 package.json 里写的 description，直接变成它的 meta description。**
> **而且会截断到 160 字符左右。**

## 四、⭐⭐⭐ 对我们 7 个插件的直接影响

### 我们的 description 长度检查

| 插件 | description 长度 | 截断后能保留什么 |
|---|---|---|
| cost-advisor | 「省钱建议器 · 不只告诉你花了多少，告诉你这样能省多少 · 峰谷价提醒+模型建议+缓存优化+上下文精简」 | ⚠️ **前 160 字符只到「峰谷价提醒+模型建议」** |
| sales-script | 「客户说「太贵了」时给出 5 步应对话术 · 20+ 异议场景 · 5 个行业定制」 | ✅ 完整保留 |
| hr-toolkit | 「30 秒判断简历值不值得面试 · STAR 面试题库 · 5 个行业定制」 | ✅ 完整保留 |

### ⭐ 优化建议

**把最重要的关键词放前面（前 160 字符内）：**

| 插件 | 现在的开头 | 建议改成 |
|---|---|---|
| cost-advisor | 「省钱建议器 · 不只告诉你花了多少…」 | **「DSH 省钱建议器：峰谷价提醒+缓存优化+上下文精简+模型选择，告诉你这样能省多少」** |
| sales-script | 「客户说「太贵了」时给出 5 步应对话术…」 | ✅ 已经很好 |
| hr-toolkit | 「30 秒判断简历值不值得面试…」 | ✅ 已经很好 |

## 五、⭐⭐⭐ 从标题公式学到的 3 个动作

### 动作 1：repo 名要含关键词

| 好 | 差 |
|---|---|
| `dsh-code-review` | `dsh-cr` |
| `dsh-cost-advisor` | `dsh-ca` |
| `dsh-sales-script` | `dsh-ss` |

**→ 我们的 7 个 repo 名都含关键词（省钱/销售/HR/法律/教师/财务/运营）。**

### 动作 2：分类名很重要

**title 里会带分类名（如 `Git & Code Review`）。**

| 我们的插件 | 建议分类 |
|---|---|
| cost-advisor | **Usage & Cost**（如果站点有这类） |
| sales-script | **Productivity** |
| hr-toolkit | **Productivity** |

**⚠️ 注意：awesome 的分类是它自己定的（agi/ui/usage/memory/skill 等），我们只能尽量对齐。**

### 动作 3：英文描述也要写

**awesome 用的是 `description.en`，如果只有中文，它可能抓不到。**

| 现状 | 风险 |
|---|---|
| 我们的 package.json 只有中文 description | ⚠️ **awesome 可能抓不到或抓成空** |

**→ 建议：在 package.json 里加一个英文 description（或让 description 中英双语）。**

## 六、⭐⭐ dshplugin.store 的插件页是 404

### 实测

| URL | 结果 |
|---|---|
| `dshplugin.store/plugin/dsh-cost-meter` | **404** |

**原因：它的 URL 用的是插件名（如 `/plugin/0-v-0`），不是包名。**

**→ 要找到我们插件的页面，得等它抓取后才知道 URL。**

## 七、⭐⭐⭐ 完整优化清单（对我们的 7 个插件）

| # | 动作 | 优先级 |
|---|---|---|
| **1** | **加英文 description（或中英双语）** | 🔴 **高（awesome 抓英文）** |
| **2** | **把关键词放 description 前 160 字符** | 🟡 中 |
| **3** | repo 名含关键词 | ✅ 已做 |
| 4 | 分类尽量对齐站点分类 | 🟡 中 |
| 5 | 加 JSON-LD（如果自己做站） | 🟢 低 |

## 八、⚠️ 诚实说明

| 项 | 说明 |
|---|---|
| **awesome 的 SEO 结构是实测** | 抓了真实页面 |
| **description 截断约 160 字符** | 从实测样本推断 |
| **「awesome 抓 description.en」是推断** | 从它显示英文推断 |
| **dshplugin.store 插件页 404** | 用包名找不到，需用它的内部 ID |
| **未验证** | 加了英文 description 后是否真被收录 |
