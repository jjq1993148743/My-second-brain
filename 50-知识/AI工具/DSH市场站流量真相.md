---
date: 2026-10-22
tags: [工作, 搞钱, DSH插件, 流量入口, SEO, 重要]
---

# DSH 市场站的流量真相：sitemap 暴露了一切

> **查了 7 个站的 sitemap，发现两个 SEO 怪兽——它们靠收录海量页面吃搜索流量。**
> **这直接决定你该往哪个站提交。**

## 一、⭐⭐⭐ 七个站的 sitemap 规模（实测）

| 站点 | sitemap 条目数 | 判断 |
|---|---|---|
| **dshplugin.store** | **32,449** | 🥇 **最大（SEO 怪兽）** |
| **awesome-dsh-plugin.com** | **12,806** | 🥈 **第二大** |
| deepseek.stream | 584 | 🥉 中等 |
| dshmarketplace.dev | 248 | 🟡 小 |
| dshmarket.com | 8 | 🔴 极小 |
| dsh-plugin.org | 3 | 🔴 极小 |
| dshopen.org | 2 | 🔴 极小 |

### ⭐⭐ 差距有多大

| 对比 | 倍数 |
|---|---|
| dshplugin.store vs dshopen | **16,224 倍** |
| dshplugin.store vs dsh-plugin.org | **10,816 倍** |
| awesome vs dshmarket | **1,600 倍** |

**→ 站点之间差了几个数量级。**

## 二、⭐⭐⭐ 两个 SEO 怪兽在做什么

### dshplugin.store（32,449 条）

| 项 | 数据 |
|---|---|
| sitemap 大小 | **5.7 MB** |
| 总条目 | **32,449** |
| **插件详情页** | **32,428 个** |
| 其他页面 | 21 个（首页/new/tutorials/category 等） |

**URL 结构：**
```
https://dshplugin.store
https://dshplugin.store/new
https://dshplugin.store/tutorials
https://dshplugin.store/category/web-ui
https://dshplugin.store/category/theme
... + 32,428 个插件页
```

**→ 每个插件一个独立页面，全部进 sitemap。**

### awesome-dsh-plugin.com（12,806 条）

| 项 | 数据 |
|---|---|
| sitemap 大小 | **6.9 MB** |
| 总条目 | **12,806** |
| **插件详情页** | **12,756 个** |
| 其他页面 | 50 个（含分类页、中文页） |

**URL 结构：**
```
https://awesome-dsh-plugin.com/
https://awesome-dsh-plugin.com/zh/       ← 中文版！
https://awesome-dsh-plugin.com/agi/      ← 分类页
https://awesome-dsh-plugin.com/ui/
https://awesome-dsh-plugin.com/usage/
... + 12,756 个插件页
```

**→ 有中文版（/zh/）+ 按分类做页面 + 每个插件一页。**

## 三、⭐⭐⭐ 这暴露了它们的商业逻辑

### 逻辑 1：靠 SEO 吃搜索流量

| 步骤 | 说明 |
|---|---|
| 1 | 把每个插件做成独立页面 |
| 2 | 全部放进 sitemap 让搜索引擎收录 |
| 3 | 用户搜「dsh 插件 xxx」时命中 |
| 4 | 页面有流量后卖广告位 |

### ⭐⭐ 逻辑 2：3 万个页面意味着什么

| 推算 | 说明 |
|---|---|
| **32,428 个插件页** | 如果每个页面每月 10 次访问 |
| | = **32 万次月访问** |
| 如果每个页面每月 100 次 | = **324 万次月访问** |

**⚠️ 这是推算，不是实测——但量级说明 SEO 是这个生态的主要流量来源。**

### 逻辑 3：为什么 dsh-plugin.org 只有 3 条却还在运营

| 原因 | 说明 |
|---|---|
| 它不靠 SEO | 可能靠社区/GitHub 导流 |
| 它的定位是「社区枢纽」 | 不是「目录站」 |
| 它可能不指望自然搜索 | |

**→ 不是所有站都靠 SEO，但最大的两个是。**

## 四、⭐⭐⭐ 对你提交策略的影响

### 提交优先级（按 sitemap 规模重排）

| 优先级 | 站点 | 理由 |
|---|---|---|
| **🥇 1** | **dshplugin.store** | **32,428 个插件页，SEO 最大** |
| **🥈 2** | **awesome-dsh-plugin.com** | **12,756 个插件页 + 有中文版** |
| **🥉 3** | deepseek.stream | 584 条，中等 |
| 4 | dshmarketplace.dev | 248 条，小 |
| 5 | dshmarket.com | 8 条（但它有内置市场，用户直接在 DSH 里用） |
| 6 | dsh-plugin.org | 3 条（社区枢纽，不是 SEO） |
| 7 | dshopen.org | 2 条（开放索引，靠 JSON API） |

### ⭐⭐ 一个重要修正

**之前我说「打标签就自动收录」——这是对的，但更重要的是「被哪个站收录」。**

| 站 | 收录方式 | 收录后能带来什么 |
|---|---|---|
| dshplugin.store | 需要提交/被抓 | **SEO 页面（可能带来搜索流量）** |
| awesome | 从 GitHub 抓 | **SEO 页面 + RSS（被日报抓）** |
| dshopen | JSON 索引 | 被其他站当数据源（**间接曝光**） |

**→ dshopen 虽然只有 2 条 sitemap，但它的 JSON 索引被其他站消费——这是「数据层」的曝光。**

## 五、⭐⭐ 一个新发现：awesome 有中文版

| 发现 | 说明 |
|---|---|
| `awesome-dsh-plugin.com/zh/` | **有独立中文页面** |
| 意义 | 它认真做中文市场 |
| 对你的价值 | **你的中文插件更容易被它收录/展示** |

## 六、⭐⭐⭐ 更重要的推论：SEO 是插件曝光的核心

### 如果 SEO 是主战场

| 结论 | 说明 |
|---|---|
| **插件名要有搜索价值** | 用户会搜「dsh 省钱插件」而不是「dsh-cost-advisor」 |
| **description 要含关键词** | 搜索引擎读 description |
| **README 要写好** | 被这些站抓取时，README 是内容来源 |

### ⭐ 我们的 7 个插件，description 含关键词吗

| 插件 | description | 含关键词？ |
|---|---|---|
| cost-advisor | 「省钱建议器 · 不只告诉你花了多少，告诉你这样能省多少 · 峰谷价提醒+模型建议+缓存优化+上下文精简」 | ✅ 含「省钱」「峰谷价」「缓存」 |
| sales-script | 「客户说「太贵了」时给出 5 步应对话术 · 20+ 异议场景 · 5 个行业定制」 | ✅ 含「话术」「异议」 |
| hr-toolkit | 「30 秒判断简历值不值得面试 · STAR 面试题库 · 5 个行业定制」 | ✅ 含「简历」「面试」 |

**→ 7 个插件的 description 都已经优化过（前面轮次做的）。**

## 七、⭐⭐ 还有一个可能被忽略的流量源

### npm 本身也是搜索引擎

| 事实 | 说明 |
|---|---|
| npmjs.com 被 Google 索引 | 搜「dsh 省钱」可能命中 npm 页面 |
| npm 页面的 description 就是 package.json 的 | **所以 description 很重要** |
| npm 有 downloads 数据 | 下载量高会提升排名 |

**→ 发 npm 不只是「让市场站能装」，也是「让 Google 能搜到」。**

## 八、⭐⭐ 修正后的曝光优先级

| 优先级 | 动作 | 依据 |
|---|---|---|
| **🥇 1** | **发 npm + 优化 description** | npm 被 Google 索引 |
| **🥈 2** | **提交 dshplugin.store** | 32,428 个插件页，SEO 最大 |
| **🥉 3** | **提交 awesome** | 12,756 页 + 中文版 + RSS |
| 4 | 打 GitHub topic | 让 awesome/dshmarketplace 自动抓 |
| 5 | 提交 deepseek.stream | 584 条 |
| 6 | 投稿日报 | 内容渠道 |

## 九、⚠️ 诚实说明

| 项 | 说明 |
|---|---|
| **sitemap 数据是实测** | 7 个站都查了 |
| **「SEO 是主要流量」是推断** | 基于 sitemap 规模，**没有实际流量数据** |
| **访问量推算是假设** | 「每页 10 次/月」是假设值 |
| **dsh-plugin.org 只有 3 条** | 可能它不靠 SEO，但没证据 |
| **未验证** | 提交后实际能带来多少流量 |
