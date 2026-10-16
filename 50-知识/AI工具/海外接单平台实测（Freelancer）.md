---
date: 2026-10-16
time: 18:30
tags: [工作, 创业, 可复用模板]
---

# 海外接单平台实测（Freelancer / We Work Remotely）

> 2026-10-16 ｜ 实测：Freelancer.com 和 We Work Remotely 的 **RSS 可抓**；Upwork 403。
> 与 [[赏金接单机制（GitHub Algora + 52pojie）]] 互补——一个是"解题拿赏金"，这个是"接项目做交付"。

## 一、可抓性实测

| 平台 | 状态 | 说明 |
|---|---|---|
| **Freelancer.com** | ✅ **RSS 可抓** | `freelancer.com/rss.xml`，20 条新项目，**每条带预算和技能标签** |
| **We Work Remotely** | ✅ RSS 可抓 | `weworkremotely.com/categories/remote-programming-jobs.rss`，25 条远程职位 |
| Upwork | ❌ 403 | 两个 RSS 端点都被拦（Challenge 页） |
| RemoteOK | ❌ 410 | `remoteok.com/remote-dev-jobs.rss` 已下线 |
| Fiverr | ❌ 403 | 需过 captcha |

## 二、Freelancer.com 实测样本（2026-10-16）

**关键优势：RSS 里直接带预算区间和技能标签**，不用点进去就能筛。

| 项目 | 预算 | 技能标签 |
|---|---|---|
| Build PLYR Sports Network App | **₹10,000–25,000 INR** | Android, Backend, Booking |
| Spiritual Guidance App Development | **₹1,500–12,500 INR** | Android, App Design, Backend, iOS |
| Ultra-Thin Mechanical Image Switching | **$250–750 USD** | 3D Printing, CAD/SolidWorks |
| Meta Ads Lead Generation Specialist | **₹1,500–12,500 INR** | Advertising, **AI Automation**, FB Marketing |
| Configure USA VPN Router | **$30–250 USD** | Linux, Network Admin |
| Resolve GitHub Build Errors | **$30–55 USD** | C++, Debugging, Git, PowerShell, Python |
| WordPress Site Build & Design | **$30–250 AUD** | Web Design |
| Deep-Dive UCIe Verification Session | **₹600–1,500 INR** | Debugging, Simulation, Zoom |
| Manual Data Entry Typist | **₹750–1,250 INR** | Data Entry |
| Android Usability Testers (8 apps) | **₹600–1,500 INR** | Android, Mobile App Audit |

### 值得注意的三点

1. **印度项目占多数，预算偏低**——₹1,000 约合人民币 85 元。**低价竞争严重**
2. **但也有高价值的技术活**：$250–750 的机械设计、₹10,000–25,000 的 App 开发
3. **有个项目直接点名"AI Automation"技能**——说明这个能力在接单市场已被识别

> AI 推测：Freelancer.com 的**公开 RSS 是免费的需求情报源**——即使你不接单，也能从"客户在为什么付钱"反推需求。比如看到"Configure USA VPN Router $30–250"，说明**网络配置类需求持续存在**。

## 三、We Work Remotely（远程职位，非接单）

抓到的 25 条是**远程全职/兼职职位**，不是项目制。适合：
- 想找远程工作的人
- 想了解"哪些技能在远程市场值钱"

**RSS**：`weworkremotely.com/categories/remote-programming-jobs.rss`

## 四、和已有信息的对照

| 维度 | 国内（猪八戒/程序员客栈） | 海外（Freelancer） |
|---|---|---|
| 抽成 | 平台抽佣 | 平台抽佣（约 10%） |
| 竞争 | 极卷 | 卷，但**货币差**让低价项目对国内开发者仍有吸引力 |
| 信息获取 | 需注册登录 | **RSS 公开可抓**，不用注册 |
| 项目质量 | 参差 | 参差（印度低价单多） |

> **和 V2EX 社区共识一致**：*"不建议在有抽佣的平台做，一是做的很累收益不高，二是不方便积累自己的客户。建议自己去找客户，尽量接近客户，远离二手单子。"*

## 五、结论

**Freelancer.com 不适合作为主要收入来源**（抽佣 + 低价竞争），但**适合当需求情报源**：

- 免费、不用注册、RSS 可抓
- 每条带**真实预算**，是"市场愿意为什么付钱"的直接证据
- 可以反推：哪些技能被反复需要？哪些预算高？

**已加入情报脚本**：`node intel.mjs fl`
