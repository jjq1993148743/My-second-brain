# UGC / 数字商品平台情报（实测）

采集时间 2026-10-18T07:51:16.069Z ｜ 工具：proxy-fetch.mjs (Clash 127.0.0.1:7897) + chrome-fetch.mjs

## Gumroad 核心证据

- discover 地址：`https://gumroad.com/discover?query=<q>`
- 解析方式：Inertia `<div data-page>` JSON 的 `search_results.products[]`（真实字段 name/seller/url/price_cents/ratings.count/native_type）
- **真实店铺域名：1000 个**；商品记录 1340 条（去重后），其中 1002 条带真实评价数
- 价格中位数 **$37**（p25 $17 / p75 $97）
- rating_count = 真实评价/购买数。strong=≥50 评价，mid(10-49) 共 573 个，weak(1-9) 共 828 个，0 评价共 484 个

### 评价数最高（=真有人买到）Top 30

| 店铺 | 价格 | 评价数 | 商品 | 类型 |
|---|---|---|---|---|
| pablostanley | 0 USD | 9143 | Pablo Stanley | digital |
| sealinemedia | 24.99 USD | 4509 | Sealine | digital |
| goodsnooze | 0 EUR | 3025 | Jordi Bruin | digital |
| juliawinterpaw | 0 USD | 1373 | Julia Winterpaw | digital |
| cgcool | 10 USD | 1016 | CGStore | digital |
| bartoszstyperek | 52 USD | 1004 | bartoszstyperek | digital |
| masterxeon1001 | 37 USD | 932 | masterXeon1001 | digital |
| draculatheme | 79.99 USD | 856 | Dracula | digital |
| maxulichney | 25 USD | 830 | MaxPacks - Brushes for Procreate | digital |
| ghostly | 40 USD | 643 | GHOSTLY | digital |
| andreaga | 1 USD | 643 | andreaga | digital |
| slowcozykelly | 18 USD | 629 | slow cozy kelly | digital |
| ftus | 25 USD | 608 | Free To Use Sounds | digital |
| gaellevel | 0 USD | 598 | Gael LEVEL | digital |
| juliawinterpaw | 0 USD | 561 | Julia Winterpaw | digital |
| maroc777772 | 0 USD | 532 | Blender addons | digital |
| lifemathmoney | 29.99 USD | 474 | STRONGLAND Publishing | digital |
| whereisweatherby | 49 USD | 460 | John Weatherby | digital |
| blender-addons | 0 USD | 456 | Wanderson M. Pimenta | digital |
| akittu | 0 USD | 416 | akittu | digital |
| philpl | 25 GBP | 396 | Phil Pluckthun | digital |
| promptgeek | 4.99 USD | 364 | PromptGeek | ebook |
| hirabiki | 10 USD | 351 | Hirabiki | digital |
| georgvw | 15 USD | 348 | GeorgBrush.club / 2000+ Procreate Brushes | digital |
| glukoz | 44 USD | 345 | glukoz (3Coords) | digital |
| alexruskman | 0 EUR | 322 | Alex Ruskman Presets for Adobe Lightroom \u0026 DaVinci Resolve | digital |
| cgcool | 15 USD | 321 | CGStore | digital |
| thiagoklafke | 39 USD | 316 | Thiago Klafke | digital |
| dwilliames | 10 USD | 299 | Dave Williames | digital |
| twostraws | 20 USD | 298 | Paul Hudson | membership |

## 费率实锤

- **Gumroad**（gumroad.com/pricing，chrome 200）：自有链接 10% + $0.50；discover 带客 **30%**；2025-01-01 起承担全球税务（MoR）
- **BMAC vs Gumroad**（buymeacoffee.com/gumroad-alternative，chrome 200）：原文 "Gumroad takes 10% of every sale. Buy Me a Coffee takes just 5%."，对比表 BMAC flat 5% vs Gumroad 10% flat

## Notion 模板市场（Prototion 实测）

- 页面在售模板 19 个，价格 $2–$97
- 页面直接暴露 5 个 Gumroad 联盟链接（真实卖家）
- 收益证明原文：Prototion /sell-notion-templates 页引用 @NotionHO："2 templates listed on @gumroad & @GetPrototion / 557 views - 55 sales"

## 新市场 35 个 + 大陆收款风险矩阵

见 JSON。Stripe 不可（大陆个人）：Substack / Ghost / beehiiv 付费 / Thinkific / Podia / Teachable / Payhip / Raycast。
MoR 可用：Gumroad / Creem / Lemon Squeezy / Paddle / BMAC(5%) / Ko-fi。
PayPal 或 Amazon 体系可用：Displate / CGTrader / Renderosity / Daz 3D / KDP / ACX / Draft2Digital / Lulu / Selar。
需企业主体：Fab / Unity Asset Store / Unreal Marketplace。

### 商品类型分布

digital 1025 ｜ ebook 98 ｜ membership 87 ｜ bundle 66 ｜ course 57 ｜ physical 5 ｜ call 1
