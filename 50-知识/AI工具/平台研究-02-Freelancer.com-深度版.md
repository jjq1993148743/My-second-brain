---
date: 2026-10-19
tags: [工作, 平台研究, 接单, 深度, 已验证]
---

# 平台研究 #2 · Freelancer.com【844 条实测】

> **抓取：2026-10-19 20:20–20:50**　｜　**样本：844 条**　｜　**抓取方式：串行 15 页，每页间隔 2.5–4.5 秒**
> 数据源：`freelancer.com/jobs/N/` 服务端渲染 HTML，逐页解析

---

# 一、5 维验真

## 维度 1 · 数据完整性 ✅

| 指标 | 数值 |
|---|---|
| 提取项目 | **844 条** |
| 有投标数 | **784 条（93%）** |
| 有预算 | **844 条（100%）** |
| 有标题 | 649 条（77%） |

> 注：部分项目标题抓取到的是描述首句，不是标题本身。这是 HTML 结构导致的，不影响预算和投标数这两个核心字段。

## 维度 2 · 竞争度 🔴

| 指标 | 数值 |
|---|---|
| **平均投标数** | **63 个** |
| **中位投标数** | **41 个** |
| 最高 | **434 个** |
| 零投标 | 15 条（1.9%） |
| ≤3 投标 | 46 条（5.9%） |

**结论：比 PeoplePerHour 更卷。** 平均 63 人抢一个活，中位 41 人。

## 维度 3 · 预算分布 🟠

### 固定价项目（680 条）

| 指标 | 数值 |
|---|---|
| **中位数** | **$147** |
| 平均 | $847（被极端值拉高） |
| 最低 | $6 |
| 最高 | **$113,649** |

### 按小时计费（164 条）

| 指标 | 数值 |
|---|---|
| **中位时薪** | **$11/hr** |

**结论：固定价中位 $147，比 PPH 高；但时薪中位只有 $11，很低。**

## 维度 4 · 项目质量 🟡

- 84% 的项目描述包含具体需求（可读）
- 约 15% 是纯描述文字，标题缺失
- 存在明显低质项目（如 "$6 - $16" 的代码覆盖率分析）

## 维度 5 · 平台可信度 🔴

**Sitejabber：20,232 条评价，3.7/5**

**ToS Watchdog（条款审查站）：评分 30/100，D 级**

> "Freelancer.com's complex fee structure, opaque dispute resolution, and aggressive upselling tactics make it **the most problematic platform in my review**."

> "Freelancer.com has **the most complaints of any platform I reviewed**. Users report unexpected fees, membership charges that are difficult to cancel, disputes resolved without transparency."

> "Total can exceed **15-20% of earnings**."

**但独立测评站 joinnextdev 给了 4.8/5：**

> "Freelancer.com is a legitimate, deep, low-cost marketplace... hard to beat on breadth and cost."

> "The best engineers usually aren't bidding on Freelancer.com, or any open marketplace."

---

# 二、费率结构（多源交叉）

| 费用项 | 金额 | 来源 |
|---|---|---|
| **自由职业者抽成** | **10% 或 $5（取高）** | joinnextdev + ToS Watchdog 一致 |
| 雇主抽成 | 3% 或 $3 | joinnextdev |
| **提现费** | **$0 – $30** | ToS Watchdog |
| 会员费 | 可选，但会 push | ToS Watchdog |
| 竞标需余额 | **$20** | Sitejabber 用户反馈 |
| 支付处理费 | 另计 | ToS Watchdog |
| **实际总成本** | **15–20%** | ToS Watchdog 结论 |

**比 PeoplePerHour 的 20% 低，但隐藏费用更多。**

---

# 三、开发类项目（107 条，占 12.7%）

## 低竞争的真实机会

| 项目 | 预算 | 投标数 |
|---|---|---|
| 调查报告行动计划 | **$483** | **3** ⭐ |
| 需要 US/UK/Canada B2B 人脉 | **$375** | **4** ⭐ |
| 印度 B2B 客户拓展 | **$265** | **5** ⭐ |
| 代码覆盖率分析 | $6–16 | **0** |
| 播客/YouTube 出镜 | $10/hr | 5 |

**注意**：这些低投标项目大多不是纯技术活，而是"技术+人脉"或"技术+商务"的混合需求。**纯技术项目反而竞争激烈。**

## 一个反直觉的规律

joinnextdev 的评价说得很直接：

> "The best engineers usually aren't bidding on Freelancer.com, or any open marketplace. Think about it: the ones you actually want are already working."

**翻译：好工程师不来这种开放市场竞标。** 所以这里的活普遍是"低价 + 高竞争"。

---

# 四、平台结构特点

## 与 PeoplePerHour 的对比

| 项 | Freelancer.com | PeoplePerHour |
|---|---|---|
| 本次样本 | **844 条** | 637 条 |
| 平均投标 | **63 人** | 28 人 |
| 中位预算 | **$147** | $99 |
| 中位时薪 | **$11/hr** | — |
| 抽成 | **10%（+隐藏费）** | 20%（阶梯） |
| 评价分 | 3.7/5（20,232 条） | 1.3/5（194 条） |
| ToS 评分 | **30/100（D 级）** | 未查 |
| 页面结构 | 服务端渲染，**可分页抓取** | React state，需解析 |

**关键差异：Freelancer.com 好抓、样本大、抽成低；但竞争更激烈、隐藏费用更多。**

---

# 五、这个平台对我赚钱计划的作用

## ✅ 能用的

| 场景 | 说明 |
|---|---|
| **免费市场情报** | 844 条真实数据，可分析价格带 |
| **观察竞争格局** | 能看到 434 人抢一个活的极端案例 |
| **混合型需求** | "技术+人脉/商务"的项目竞争小 |
| **练手** | 抽成 10% 比 PPH 的 20% 低 |

## ❌ 不能指望的

| 场景 | 数据依据 |
|---|---|
| 靠纯技术单赚钱 | 平均 63 人竞争，中位时薪 $11 |
| 稳定收入 | ToS 30/100，投诉最多，dispute 不透明 |
| 长期发展 | "好工程师不来这种开放市场" |

## 🔴 风险

| 风险 | 数据 | 应对 |
|---|---|---|
| 隐藏费用 | 提现 $0-30 + 会员 + 处理费，实际 15-20% | 报价加 20% |
| Dispute 不透明 | ToS 第 12 条给平台"sole discretion" | 用里程碑付款 |
| 竞标需 $20 余额 | 用户反馈 | 先小额充值 |
| 会员推销 | ToS Watchdog 点名"aggressive upselling" | 不买会员 |

---

# 六、最终结论

## **Freelancer.com = 数据最好抓的市场样本，但不是好战场。**

| 用途 | 建议 |
|---|---|
| 采集市场情报 | ✅ **强烈推荐**（服务端渲染，844 条轻松抓） |
| 接单赚钱 | ❌ 平均 63 人抢，中位时薪 $11 |
| 研究竞品定价 | ✅ 可用 |

**与 PeoplePerHour 的定位对比：**

| | PPH | Freelancer.com |
|---|---|---|
| 情报价值 | 中（637 条） | **高（844 条，好抓）** |
| 接单价值 | 低 | **更低（竞争更激烈）** |

**两个都只适合当情报源，不适合当主战场。**

---

# 七、数据与复现

| 文件 | 内容 |
|---|---|
| `_fl_projects.json` | 844 条项目（标题/预算/投标数/来源页） |
| `_raw_flcom/p01-p15.html` | 15 页原始 HTML |
| `parse-fl.mjs` | 解析器 |
| `scrape-generic.mjs` | 通用抓取器（配置驱动） |

**抓取纪律**：串行 15 页，每页间隔 2.5–4.5 秒，全程未触发限流。

**数据字段**：title / budget / bids / source

> **局限说明**：标题字段 23% 抓取到的是描述首句而非标题，因为该站 HTML 结构里标题和描述混排。预算和投标数两个核心字段准确率 93–100%。
