---
date: 2026-10-22
tags: [工作, 搞钱, DSH插件, 流量, 曝光打法, 关键报告]
---

# DSH 插件：流量与曝光完整打法

> **你的思路「通过插件获得流量」——对。但必须补两个认知，否则流量跟你没关系。**

## 一、⭐⭐ 你的思路对，但缺两个关键环节

### 缺失 1：流量归属（装了 ≠ 你的流量）

| 问题 | 事实 |
|---|---|
| 用户装了你的插件 | ✅ 你获得了「使用量」 |
| 但他不知道你是谁 | ❌ **不是你的流量** |
| 除非你「截流」 | 插件里引导他关注你的号/进你的群 |

**数据证据：849 个插件里有 44 个（5.2%）挂了外部网站**——都是用插件给自己的站导流：

| 插件 | 导流到 |
|---|---|
| dsh-brewreel | brewreel.com |
| misakanet | misakanet.org |
| dsh-vision-toolkit | agent-vision.anionex.me |
| dsh-fnos | fndsh-doc.tnnevol.cn/plugins/dsh-fnos |
| cc-safety-net | ccsafetynet.com |

**→ 老手都在做「插件 → 自己的站」的导流。你不能只发插件不做截流。**

### 缺失 2：曝光靠「杠杆」，不靠「勤奋宣传」

## 二、⭐⭐ 星数真相（我上一轮报错了，这里修正）

### 关键：**星数是「仓库」的，不是「插件」的**

| 类型 | 例子 | 真实情况 |
|---|---|---|
| **A. 蹭母项目** | archify-dsh 87,067★ | 是母项目 `tt-a1i/archify` 的星，插件只占一小块 |
| | openviking-dsh-memory 40,530★ | 母项目 `volcengine/OpenViking` |
| | browser-skill-dsh 9,349★ | 母项目 `Tencent/BrowserSkill` |
| **B. 一仓多插件** | @linxin666/dsh-*（**11个插件**） | 全部共享 `zhu1090093659/dsh-web` 的 9,250★ |
| **C. 真独立插件** | dshmarket 8,000★ | 真正自己的仓库 |
| | dsh-TUI 5,114★ / dsh-better-sidebar 4,402★ | 独立 |

**修正后的分布：1,000★+ 有 43 个**（我上一轮因正则 bug 漏了千位逗号，误报为 20 个）。

### ⭐⭐ 这揭示了三种曝光杠杆

| 杠杆 | 怎么做 | 效果 |
|---|---|---|
| **① 蹭母项目** | 把插件做成大项目的适配层（如给 OpenViking、Tencent BrowserSkill 做 DSH 接入） | 直接继承几万★的曝光 |
| **② 一仓多插件** | 一个仓库发多个插件（zhu1090093659 用1个仓库带11个插件） | 星数聚合，一次曝光多产品 |
| **③ 独立爆款** | 单插件做透（dshmarket 8,000★） | 难但最值钱 |

## 三、⭐⭐ 曝光的完整机制（实测）

### 机制 1：所有市场站按「安装量」排序

| 站点 | 排序 | 显示安装量 |
|---|---|---|
| dshmarket.com | Install/downloads/top | ✅ |
| dshmarketplace.dev | Top/installs/精选 | ✅ |
| awesome-dsh-plugin.com | Downloads/Newest/top | ✅ |
| dshopen.org | installs/downloads/top/featured | ✅ |

### 机制 2：四种榜单

| 榜单 | 进入方式 | 对新插件 |
|---|---|---|
| **Newest/最新** | ✅ **发布即自动进入** | ⭐⭐⭐⭐⭐ **唯一免费入口** |
| Top/热门 | 靠安装量积累 | ⭐ |
| Featured/精选 | 人工挑选 | ⭐⭐ |
| Trending/飙升 | 短期增速 | ⭐⭐⭐ |

### 机制 3：⭐ RSS 自动流（最被忽视）

**实测：`https://awesome-dsh-plugin.com/feed` 是活的 RSS**（200，17KB，每日新插件）

**这很可能就是「插件日报」公众号的内容来源**——他们订阅，每天整理发布。

**→ 你提交到索引后，自动进 RSS，自动被日报作者看到。**

### 机制 4：真实使用量比 star 大 30-97 倍（实测 npm）

| 插件 | star | npm 月下载 |
|---|---|---|
| dsh-free-search | 547★ | **52,819** |
| dsh-mnemon | 621★ | **51,615** |
| dsh-univer-office | 579★ | **48,113** |
| modsearch | 790★ | **45,722** |
| dsh-ads（恶搞） | 682★ | **仅 2,014** |

**→ 追下载不追 star。实用插件下载高，恶搞插件星高下载低。**

## 四、⭐⭐⭐ 曝光执行清单（按顺序做）

| 步 | 动作 | 具体 | 成本 | 自动? |
|---|---|---|---|---|
| **1** | **发到 npm** | 包名 `@你的名/dsh-xxx`，因为市场站按 npm 下载排序 | 免费 | — |
| **2** | 打 `dsh-plugin` GitHub 标签 | 自动进 topic（21,513 仓库） | 免费 | ✅ |
| **3** | 提交到 9 个市场站 | dshopen（PR `polang233/dsh-plugin-index`）、dsh-plugin.org（`/submit`）、dshmarketplace（`/submit`）、dshplugin.store、deepseek.stream、dshmarket、awesome-dsh-plugin、dsh-plugin-market、deepseek1024 | 免费 | ✅ 进 Newest |
| **4** | 提交 awesome-dsh-plugin | 进它的 RSS | 免费 | ✅ **被日报自动抓** |
| **5** | 投稿插件日报 | 黒鲸鱼插件小雷达 / Rubbish Science / 数据码农 | 免费 | — |
| **6** | awesome 清单 PR | `awesome-dsh-plugin/awesome-dsh-plugin`、`imsai-sh`(309★)、`beancookie`(170★) | 免费 | 长效 |
| **7** | 写开发实录 | 学孟斯特/创见AI实验室：做插件+写过程 | 时间 | — |
| **8** | 知乎/V2EX | 有专门问题（34个回答） | 免费 | — |
| **9** | 买广告位 | dshplugin.store 卖 Sponsor 位 | 花钱 | 快 |

## 五、⭐⭐ 截流设计（把「使用者」变「你的流量」）

| 位置 | 怎么放 | 效果 |
|---|---|---|
| 插件设置页 | 放你的公众号二维码/群二维码 | 主动关注 |
| 插件首次运行提示 | 「遇到问题？加群：[二维码]」 | 高转化 |
| 插件 README | 放你的站/公众号 | 长效 |
| 插件 homepage 字段 | 填你的站（44个插件这么做） | 从市场站直接导流 |
| 插件右下角水印 | 「Made by XXX」 | 被动曝光 |

## 六、⭐⭐ 给你的完整打法（数据支撑）

```
第1步：选题 —— 做一个「DSH真实缺的功能」
        优先：搜索/记忆/Office/状态可见（下载量最高的四类）
        避免：恶搞/话题类（dsh-ads 星高但仅2,014下载）

第2步：借势 —— 如果能蹭大项目就蹭
        例：给 OpenViking(4万★)/Tencent BrowserSkill(9千★) 做适配层
        → 直接继承它们的曝光

第3步：发npm + 打标签 + 提交9个站（全自动进Newest+RSS）

第4步：截流 —— 插件里放二维码，把用户导到你的私域

第5步：投稿日报 + 写实录（放大曝光）

第6步：下载量上升 → 上Top榜 → 更多曝光 → 正向循环

第7步：有几千用户后 → 谈广告/赞助（那时你是流量主）
```

## 七、⭐ 一句话回答你的问题

> **思路对。但曝光不是「宣传」，是三件事：①蹭杠杆（母项目/聚合）②走自动机制（npm+标签+索引+RSS）③截流（插件导私域）。**
> **不做截流，你只有「使用量」，没有「流量」。**

## 八、数据文件

| 文件 | 内容 |
|---|---|
| `_dsh_index.json` | 849 插件（真实星数需处理千位逗号） |
| `_npm.log` | npm 下载量实测 |
| `_rss.log` | RSS 实测 |
| `_rank*.log` | 榜单机制实测 |
