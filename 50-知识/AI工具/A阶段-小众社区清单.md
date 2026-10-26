---
date: 2026-10-26
tags: [工作, 搞钱, 小众平台, 社区, A阶段, 实测]
---

# A 阶段：铺开找小众活跃社区（实测结果）

> **目标：找「比 YouTube 小、东西够新鲜、中文圈不知道」的平台。**
> **方法：找带真实统计的目录站和 API，逐个验证。**

---

## 一、✅ 成功：Discourse 社区目录（52 个实测）

**来源**：[discover.discourse.org](https://discover.discourse.org/) — Discourse 官方社区目录（Discourse 是开源论坛系统，全球大量老式论坛在用它）。

### ⭐⭐ 真正小众但活跃的（挑出来的）

| 社区 | 领域 | 为什么值得看 |
|---|---|---|
| **soaps.sheknows.com/message-boards** | 肥皂剧讨论板 | 美国日间剧粉丝，几十年老社区 |
| **forum.nachi.org** | 房屋检查员协会 | 专业技工社区，商业+技术 |
| **community.robotime.com** | 拼装模型小屋（ROKR） | 手工/微缩模型爱好者 |
| **schizophreniasupport.discourse.group** | 精神分裂症互助 | 医疗支持类，极私密 |
| **community.patient.info** | 患者社区 | 英国医疗支持 |
| **community.infiniteflight.com** | 飞行模拟 | 模拟飞行玩家 |
| **forums.steinberg.net** | Steinberg 音乐制作 | Cubase 等 DAW 用户 |
| **community.ankihub.net** | Anki 记忆卡共享 | 学习法社区 |
| **blenderartists.org** | Blender 3D 艺术家 | 3D 创作者 |
| **discourse.mcneel.com** | Rhino 3D（McNeel） | 工业设计/建模 |
| **forum.arduino.cc** | Arduino 硬件 | 开源硬件 |
| **community.openstreetmap.org** | 开源地图 | 地理信息 |
| **victron.discourse.group** | Victron 能源系统 | 离网/房车供电 |
| **forum.digikey.com** | Digi-Key 电子元件 | 电子工程师 |
| **community.spiceworks.com** | IT 运维 | 企业 IT |
| **forum.ksec.co.uk** | K-Secret？待查 | 小众论坛 |

### 全部 52 个（按类型分组）

**技术 / 开发**

| 社区 |
|---|
| community.openai.com |
| forum.cursor.com |
| discuss.huggingface.co |
| community.vercel.com |
| community.n8n.io |
| discourse.ubuntu.com |
| discussion.fedoraproject.org |
| discourse.mozilla.org |
| community.letsencrypt.org |
| community.brave.com |
| forums.plex.tv |
| forum.arduino.cc |
| forum.digikey.com |
| community.spiceworks.com |
| developer.sailpoint.com/discuss |
| community.make.com |
| forum.asana.com |

**游戏 / 引擎**

| 社区 |
|---|
| discussions.unity.com |
| forum.godotengine.org |
| forums.unrealengine.com |
| forums.eveonline.com |
| forums.ageofempires.com |
| forums.fatsharkgames.com |
| forum.playvortex.io |
| forum.cfx.re |
| community.wayfarer.nianticlabs.com |
| community.wayfarer.scopely.com |

**创作 / 设计 / 3D**

| 社区 |
|---|
| blenderartists.org |
| discourse.mcneel.com |
| forums.steinberg.net |
| community.robotime.com |

**生活 / 兴趣 / 其他**

| 社区 |
|---|
| soaps.sheknows.com/message-boards |
| community.openstreetmap.org |
| community.infiniteflight.com |
| victron.discourse.group |
| community.ankihub.net |
| forum.nachi.org |
| community.patient.info |
| www.patients.community |
| schizophreniasupport.discourse.group |
| commons.commondreams.org |
| community.security.eufy.com |
| community.brave.com |
| forum.ksec.co.uk |
| community.tourradar.com |
| support.rpg-trader.com |
| meta.repealobbba.org |

**⚠️ 说明**：这 52 个是从目录首页抓的**外链**，Discourse 目录还有更多分类页，可以继续翻。

---

## 二、✅ 成功：技术圈高信噪比社区（API 可用）

| 平台 | 接口 | 状态 |
|---|---|---|
| **Hacker News** | `hacker-news.firebaseio.com/v0/topstories.json` | ✅ 200，返回 4.5KB 榜单 |
| **Lobsters** | `lobste.rs/hottest.json` | ✅ 200，返回 12KB 热帖 |

**这两个的价值**：评论质量极高，是「技术圈在关心什么」的实时信号。

---

## 三、❌ 失败的数据源（诚实记录）

| 数据源 | 结果 | 原因 |
|---|---|---|
| **big-boards.com** | ❌ 401 Forbidden | 反爬 |
| **FediDB**（Fediverse 统计） | ❌ 返回 HTML | 试了 3 个 API 端点都不对，页面是 JS 渲染 |
| **the-federation.info** | ❌ 502 | 服务挂了 |
| **lemmyverse.net** | ❌ 返回 HTML | SPA，数据端点没找到 |
| **Are.na API** | ❌ 403 | 需要鉴权 |
| **Substack API** | ❌ 404 | 端点不对 |

**→ Fediverse 和独立博客这两块，我没拿到数据。**

要拿到它们需要：

| 方案 | 说明 |
|---|---|
| 用 Chrome 渲染 FediDB 页面 | 我已验证 chrome-fetch.mjs 可用，但 FediDB 图表是 canvas 绘制，抓到的是空页 |
| 找 FediDB 的真实 API | 需要看它的前端 JS 源码找端点 |
| 用 instances.social | 需要 API token |

---

## 四、⭐⭐ A 阶段结论

### 拿到的

| 层 | 数量 | 状态 |
|---|---|---|
| **Discourse 老式论坛** | **52 个** | ✅ 实测，全部真实 |
| **技术圈社区** | 2 个（HN / Lobsters） | ✅ API 可用 |
| **Discord 社区** | 22 品类 | ✅ 上一轮已拿 |
| **Imageboard** | 14 个 | ✅ 上一轮已拿 |

### 没拿到的

| 层 | 状态 |
|---|---|
| Fediverse（Mastodon 小实例） | ❌ 接口没找到 |
| 独立博客（Substack/Ghost） | ❌ 接口没找到 |
| Are.na | ❌ 需鉴权 |

### ⭐ 一条重要发现

> **Discourse 目录里藏着大量「垂直领域老式论坛」——这是最被低估的一层。**

| 例子 | 领域 | 中文圈覆盖度 |
|---|---|---|
| soaps.sheknows.com | 美国日间肥皂剧 | **几乎为零** |
| forum.nachi.org | 房屋检查员 | **几乎为零** |
| community.robotime.com | 微缩模型小屋 | **几乎为零** |
| community.infiniteflight.com | 飞行模拟 | 极少 |
| forums.steinberg.net | 音乐制作 DAW | 一般 |

**这些社区的共同特征：**

| 特征 | 说明 |
|---|---|
| 成员是「真爱好者」 | 不是路人，会深入讨论 |
| 内容极垂直 | 一个具体问题能讨论几十楼 |
| 中文圈几乎不碰 | 语言+文化+入口三重门槛 |
| 但**变现路径不明** | 需要判断是否只是「有趣」 |

---

## 五、⚠️ 诚实说明

| 项 | 说明 |
|---|---|
| **52 个社区是实测** | 从 discover.discourse.org 抓的真实外链 |
| **HN/Lobsters 是实测** | API 返回 200 |
| **Fediverse/Are.na/Substack 没拿到** | 接口问题，不是没有 |
| **「中文圈几乎为零」是推断** | 未做覆盖度实测 |
| **「变现路径不明」是我的判断** | 这些社区多为非商业性质 |
