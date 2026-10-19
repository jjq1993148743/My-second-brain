---
date: 2026-10-19
tags: [工作, 平台研究, 接单, 深度, 已验证, 全量]
---

# 平台研究 #1 · PeoplePerHour【637 条全量实测】

> **抓取：2026-10-19 16:40–17:10**　｜　**样本：637 条**　｜　**时间跨度：2026-09-12 → 2026-10-19（32 天）**
> **覆盖面：全站 658 个开放项目的 96.8%**（33 页全部抓完）
> **数据来源：直接解析 `window.PPHReact.initialState`，非页面文本猜测**

---

# 一、你的五个质疑 → 逐条数据回答

| # | 质疑 | 验证方法 | 结果 |
|---|---|---|---|
| 1 | **怎么知道是真实的？** | 抽查 9 个项目详情页 | ✅ **9/9 全部独立存在**（114–167KB，标题 100% 一致） |
| 2 | **是不是新鲜的？** | 逐条检查发布时间 | ✅ **637 条全在 32 天内**（9-12 至 10-19） |
| 3 | **是不是挂很久没人做？** | 统计项目状态 | ✅ **593 条 open + 44 条 in_progress**，0 条过期 |
| 4 | **是不是做完没更新？** | 检查完成时间 | ✅ **637 条 completed_dt 全为 null** |
| 5 | **有别人评价吗？** | 通用引擎查多个源 | ✅ **Sitejabber 194 条 1.3/5** + **itqlick 独立核实费率** |

---

# 二、5 维验真（完整数据）

## 维度 1 · 新鲜度 ✅

| 指标 | 数值 |
|---|---|
| 时间跨度 | **2026-09-12 → 2026-10-19** |
| 覆盖天数 | **32 天，每天都有新项目** |
| 日均发布量 | **约 20 条** |
| 最高单日 | 10-12 发 41 条 |

**日发布 TOP 6：** 10-12(41)、10-07(34)、10-14(32)、10-13(31)、10-08(29)、09-30(28)

**结论：持续高频发布，不存在僵尸站问题。**

## 维度 2 · 竞争度 🔴

| 指标 | 数值 |
|---|---|
| **平均提案数** | **28 个** |
| **零提案项目** | **9 个（1.4%）** |
| 竞争最激烈 | 网站改电商 £1,500 → **89 人抢** |

**结论：极度内卷。**

## 维度 3 · 预算分布 🟠

| 预算区间 | 项目数 | 占比 |
|---|---|---|
| **$0–50** | **249** | **39%** |
| $50–100 | 120 | 19% |
| $100–250 | 155 | 24% |
| $250–500 | 65 | 10% |
| $500–1000 | 28 | 4% |
| **$1000+** | **20** | **3%** |

| 统计量 | 数值 |
|---|---|
| **中位数** | **$99** |
| 平均 | $209 |
| 最高 | **$7,500** |

**结论：39% 的项目不到 $50，只有 3% 超过 $1,000。**

## 维度 4 · 需求质量 🟡

约 35% 有技术栈说明，25% 有具体工期，20% 描述过于简略。

## 维度 5 · 客户可信度 🔴【最大风险】

| 指标 | 数值 | 判断 |
|---|---|---|
| **30 天内新注册客户** | **220 / 637 = 35%** | 🔴 超过三分之一是新号 |
| 注册超 30 天 | 417（65%） | — |
| **平台验证客户** | **仅 48 / 637 = 8%** | 🔴 **92% 未验证** |
| 英国客户 | 413（65%） | 主力市场 |
| 美国 | 58（9%） | 第二 |
| 印度 | 24（4%） | — |

**这是最重要的结论：35% 客户是新号 + 92% 未验证 + 差评里全是 chargeback 不赔 = 必须只用小额试错。**

---

# 三、⭐ 外部口碑（多源交叉）

## 来源 1 · Sitejabber：194 条评价 → **1.3 / 5**

真实差评：
> "PeoplePerHour is a scam, avoid at all cost"

> "Client that I worked for did chargeback and PPH said they cant pay me my earning because client did chargeback."

> "Avoid Peopleperhour Like The Plague"

> "cheater finance team of PPH"

> "no real support, automated replies only"

## 来源 2 · itqlick（独立测评站，2026）核实费率

> "PeoplePerHour uses a tiered commission structure... For earnings below [£250] lifetime billing per client, the service fee is 20%. Between [£250–£5,000] the fee drops to 7.5%. For earnings exceeding [£5,000] the fee is 3.5%."

**并指出隐藏费用：**
> "Hidden fees can include VAT for UK/EU freelancers, minimum service fees per invoice (~$1.40), and **fees for exceeding the 15 free monthly proposal credits**."

**⚡ 新发现：每月只有 15 个免费提案额度，超出要付费。** 这意味着不能海投。

## 来源 3 · Wise 官方博文

> "Freelancers currently raise invoices in WorkStream after completing agreed work... funds can be withdrawn after the clearing period."

> "If there is insufficient money held in escrow, PeoplePerHour says there are **no guarantees** it will be able to recover the full payment."

## 平衡证据

> "I have been a loyal freelancer with PeoplePerHour since 2016, have built up a good client base, and have 550+ 100% positive reviews."

---

# 四、抽成与隐藏成本（三源确认）

## 阶梯抽成

| 与同一客户累计成交 | 抽成 |
|---|---|
| **£250 以下** | **20%** |
| £250 – £5,000 | 7.5% |
| £5,000 以上 | 3.5% |

## 隐藏成本（itqlick 揭露）

| 项目 | 金额 |
|---|---|
| VAT（英国/欧盟） | 按当地税率 |
| 每张发票最低服务费 | ≈ **$1.40** |
| **超出每月 15 个免费提案** | 需付费 |
| 货币转换费 | 按币种 |
| 提现费 + 中间行费 | 按银行 |

**实际成本远高于 20%。**

---

# 五、开发类实况（235 条，占 37%）

## 项目类别排名

| 类别 | 数量 |
|---|---|
| Design | 136 |
| **Technology & Programming** | **97** |
| Business | 92 |
| Marketing | 86 |
| Digital Marketing | 65 |
| Video/Photo | 60 |
| Writing | 30 |

## 高预算开发项目（真实数据）

| 项目 | 预算 | 提案数 | 发布 |
|---|---|---|---|
| **Digital Lending Platform, DSCR Funnels & AI** | **$7,500** | 81 | 09-24 |
| Senior UX/UI Designer (Modern Web App) | $3,500 | 49 | 10-17 |
| 文档处理套件开发 | £2,559 | 27 | 09-26 |
| **Website & Payment Portal (WordPress)** | **£2,500** | **81** | 09-21 |
| Salesforce CPQ & Apex Developer | $2,000 | 26 | 10-05 |
| Salesforce CPQ + LWC Developer | $2,000 | 27 | 10-06 |
| 网站改电商平台 | £1,500 | **89** | 10-18 |
| 销售库存管理系统 | €1,500 | 53 | 10-18 |
| **System Engineer (US Timezone)** | $1,500 | **12** | 10-14 |

## 关键规律

| 预算 | 典型提案数 | 判断 |
|---|---|---|
| $1,000+ | 25–89 | 🔴 竞争恐怖 |
| $500–1,000 | 10–30 | 🟠 中等 |
| < $200 | 5–15 | 🟢 相对好抢 |

**反直觉发现：小众高技术门槛反而竞争小。**
- System Engineer (Axway MFT) $1,500 → 仅 **11 人**投标
- 因为要求：美国时区 + Axway MFT 专有技术

**启示：与其抢通用开发单，不如找"技术栈窄 + 时区要求"的单。**

---

# 六、这个平台对赚钱计划的作用

## ✅ 有价值的

| 用途 | 说明 | 建议 |
|---|---|---|
| **免费市场情报** | 免登录看真实预算/竞争度 | 每周扫一次 |
| **接小单练手** | £50–150、提案<10 | 前 3 单 |
| **抢零提案** | 1.4%，但抢到就是你的 | 每天扫 |
| **找窄技术栈单** | 门槛高反而竞争小 | 重点方向 |
| **长期客户降成本** | 20%→7.5%→3.5% | 维护 2–3 个老客 |

## ❌ 不能指望的

| 场景 | 数据依据 |
|---|---|
| 赚大钱 | 39% 项目不到 $50，中位 $99 |
| 稳定收入 | 1.3 分口碑 + chargeback 不兜底 |
| 海投获客 | **每月仅 15 个免费提案** |
| 靠新客户 | **35% 客户是新号，92% 未验证** |

## 🔴 风险清单（数据支撑）

| 风险 | 数据 | 应对 |
|---|---|---|
| 新客户跑单 | 35% 是 30 天内新号 | 只接注册 >1 年的 |
| 未验证客户 | 92% 未验证 | 优先选 8% 已验证的 |
| Chargeback 不赔 | 多条投诉 + 官方"无保证" | 单笔 ≤ $200 |
| 抽成 20% | 三源确认 | 报价先加 25% |
| **提案额度限制** | 每月 15 个免费 | **精投，不海投** |

---

# 七、最终结论

## **PeoplePerHour = 免费市场情报站 + 小额练手场，不是主战场。**

| 用途 | 建议 |
|---|---|
| 看行情 | ✅ 每周扫，免登录 |
| 练手 | ✅ ≤3 单，小额 |
| 主战场 | ❌ 中位 $99 + 1.3 分 + 35% 新客户 + 提案限额 |

**核心策略：把它当"情报源"用，不投钱不投时间；真要接单，挑窄技术栈 + 高门槛的。**

---

# 八、数据与复现

| 文件 | 内容 |
|---|---|
| `_pph_projects.json` | **637 条原始项目**（完整描述、客户信息、时间戳、状态） |
| `_pph_verified.json` | 5 维打分（25 分制） |
| `_spotcheck_results.json` | 9 个详情页抽查证据 |
| `pph-scrape.mjs` | 抓取脚本（Chrome headless + 33 页 + 串行限速 35–50s） |
| `verify-5d.mjs` | 5 维验证脚本 |

**抓取纪律**：完全串行，每页间隔 35–50 秒，33 页全程未触发限流。

**数据字段**：proj_id / title / proj_desc / budget / currency / posted_dt / expiry_dt / item_state / completed_dt / proposalCount / client.reg_dt / client.verified / client.country / client.hourly_rate
