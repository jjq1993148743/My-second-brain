# backend-dataflow-diagram

把**任意项目、任意业务流程**，从「读代码取证」一路做到「交付可视化成品」的端到端技能。

**两段工序，顺序不能反：**

```
取证（grep/read 逐层确认行号）
   ↓
验真（verify.mjs 把每条事实拿回仓库核对，必须 100% 命中）
   ↓
出图（archify 渲染成交互式 HTML：时序 / 架构 / 数据流 / 生命周期）
   ↓
合并（多个视图装进一个单文件，标签页切换）
```

**核心主张：图好看不难，难的是图上每句话都有出处。**

## 为什么是两段

| 工序 | 谁负责 | 不可替代性 |
|---|---|---|
| 取证 + 验真 | 本技能的 `verify.mjs` | 把 文件/方法/行号/表名 拿回仓库核对，查不到就标红 |
| 渲染 + 交互 | **archify**（独立插件） | 5 种图型、明暗主题、导出 PNG/SVG/WebM、可点击探索 |

archify 不会去核对"TokenController 到底存不存在"；本技能的 `verify.mjs` 会。
两者**不合并代码**，只做编排——archify 升级时自动跟着变。

## 依赖

| 依赖 | 用途 | 检查 |
|---|---|---|
| Node.js ≥ 18 | verify / render | `node --version` |
| Python 3 + playwright + Chrome | `check_layout.py` 布局闸门 | `python -c "from playwright.sync_api import sync_playwright"` |
| archify 插件 | 渲染交互式 HTML | `node <archify>/bin/archify.mjs doctor` |

装 archify：`dsh plugin --profile desktop add '@tt-a1i/archify-dsh'`（**装完要重启**）。
⚠️ 用 DSH 自带的 pnpm，系统 PATH 上那个 store 版本不一致会报 `ERR_PNPM_UNEXPECTED_STORE`。

⚠️ **playwright 是硬依赖**，不是可选。没装会直接卡在布局闸门。

## 一句话用法

对 AI 说：「画一下 XX 功能的数据流向」/「把这段业务画成俯视图」/「这个功能经过哪些服务和表」

## 目录

```
backend-dataflow-diagram/
├── SKILL.md                        技能正文：判栈 + 五步工作流 + 两段式交付 + 失败路径
├── assets/
│   ├── diagram.css                 色带、卡片四行栅格、sticky 表头、连线层
│   ├── wires.js                    正交路由 + 走缝中线 + 圆角 + arrowhead
│   └── spec-template.json          8 列通用骨架
├── scripts/
│   ├── render.mjs                  规格 JSON → 八列俯视图 HTML
│   ├── verify.mjs                  事实校验（多语言：.java/.ts/.py/.go/.cs/.php/.rb…）
│   └── check_layout.py             布局闸门：溢出/穿卡/贴边/泳道错位
├── examples/
│   ├── member-bindcard.json        会员绑卡范例（8 列 7 行，端到端全真实）
│   └── member-v1-legacy.json       旧版纵向格式存档（勿抄）
└── references/
    ├── stack-recipes.md            各语言/框架检索配方（先读这个）
    └── project-profile.example.md  「项目画像」写法范例
```

## 手动跑一遍

```bash
# 1) 事实校验（必须 100%）
node scripts/verify.mjs examples/member-bindcard.json <你的仓库根目录>

# 2) 八列俯视图
node scripts/render.mjs examples/member-bindcard.json out.html assets/diagram.css

# 3) 布局闸门（必须 problems=[]）
python scripts/check_layout.py out.html

# 4) 交给 archify 出好看的图
node <archify>/bin/archify.mjs finalize sequence candidate.json out2.html --quality showcase --json
```

## 踩过的坑（都修了，别改回去）

| # | 坑 | 后果 | 现状 |
|---|---|---|---|
| 1 | 芯片 id 曾是 `s<n>` + `document.getElementById` | **≥2 条链路时第 2 条起连线全部串台**，实测报 20 处穿卡 | 已改为 `c<链路>-s<步骤>` + `data-step` 作用域查找 |
| 2 | `check_layout.py` 报错不带链路标识 | 只报 `WIRE_THROUGH 8->9 s5`，无法区分哪条链路，排查绕远路 | 已加 `chain[n]` 前缀 |
| 3 | playwright 没写进文档 | 三份文档一个 "playwright" 都没有，脚本却在 import | 已补进依赖表 |
| 4 | archify `sources` 要 40 位 git 哈希 | 仓库没提交时只能删掉 sources，源码证据丢失 | 证据清单改用 `cards` 承载 |
| 5 | archify `--out-dir` 有路径所有权 | 旧回执占住文件名，重跑报 `evidence-path-conflict` | 换目录或先挪开 |

## archify 规格的硬约束（写之前自查）

| 约束 | 数值 | 违反后果 |
|---|---|---|
| viewBox 宽度 | ≤ 1085px（6 参与方） | 子标签投影字体 < 6px，可读性闸门失败 |
| 画布宽高比 | ≥ 1.55 | `composition/viewport-height` |
| 消息 y 间距 | ≥ 28px | `layout/constraint` |
| 分组边界 | 不得等于任何消息 y | `container-border-run` |
| 参与方子标签 | ≲ 107px | 超出 86px 盒子 |

中文：`meta.locale: "zh-CN"`，archify 内置 437 条中文词条，**别自己写壳**。

## 硬约束

- **只读仓库**，不改源文件；**不跑 git**；产物写仓库外；不输出凭据
- 每条事实都要能回答「在哪个文件哪一行看到的」
- **查不到就标缺口**（红虚线），否定证据也要写
