---
name: backend-dataflow-diagram
description: >-
  把任意项目的某个业务流程，从「读代码取证」一路做到「交付可视化成品」的端到端技能。
  先用 grep/read 在仓库里逐层取证（文件、方法、行号、表名），再用内置的 verify.mjs
  把每条事实拿回仓库核对到 100% 命中，然后用 archify 渲染成交互式 HTML（时序图/架构图/
  数据流图/生命周期图），最后组装成一个可切换视图的单文件成品。
  适用于任何语言和框架（Java/Spring、Node、Python、Go、.NET、PHP、前端项目均可）。
  当用户说「画一下 XX 功能的数据流向/链路/调用链」「后端俯视图」「这个功能经过哪些服务和表」
  「数据流图」「谁调用了谁」「落哪张表」「把这段业务画成图」「交接给新人看实现」，
  或要求把任意业务域（会员、订单、支付、退款、对账、审批…）的实现现状可视化时，一律使用本技能。
  产物必须基于仓库真实代码，缺口显式标红，不允许编造。
---

# 后端数据链路 · 端到端出图（backend-dataflow-diagram）

## 解决什么问题

手写代码时代的工程师脑子里有一张后端俯视图：一个请求进来，先过哪层、落哪个类、走哪条分发链、
最后写哪张表。代码由 AI 代写后，这张图在人脑里消失了——文件还在，但没人保证「知道它们怎么连起来」。

本技能把这张图重新画出来，**只画代码里真的存在的东西**，并且分两道工序：

| 工序 | 谁负责 | 产出 | 为什么不可省 |
|---|---|---|---|
| **取证 + 验真** | 本技能的 `verify.mjs` | 每条 文件/方法/行号/表名 都回仓库核对，命中率必须 100% | 图好看不难，**难的是图上每句话都有出处** |
| **渲染 + 交付** | **archify**（独立插件） | 交互式单文件 HTML，5 种图型，明暗主题、导出 | 界面精致、可点击探索，比静态图强得多 |

**关键纪律：先验真，后出图。** 顺序反了，就会得到一张漂亮但查无实据的图。

## 依赖（第一次用先读这一节）

| 依赖 | 用途 | 检查方式 |
|---|---|---|
| **Node.js ≥ 18** | 跑 `verify.mjs` / `render.mjs` | `node --version` |
| **Python 3 + playwright + Chrome** | `check_layout.py` 布局闸门（无头浏览器实测） | `python -c "from playwright.sync_api import sync_playwright"` |
| **archify 插件** | 渲染交互式 HTML | `node <archify>/bin/archify.mjs doctor` |

> ⚠️ **playwright 是硬依赖**，不是可选项。`check_layout.py` 第 2 行就 `from playwright.sync_api import sync_playwright`，
> 没装会直接卡在第 4 步。装法：`pip install playwright && playwright install chromium`（或已有 Chrome 也行）。

**找 archify 的路径**（三种环境任选其一，找不到就跑 `dsh plugin` 或看 profile 的 node_modules）：

```
<DSH_HOME>/profiles/<profile>/node_modules/@tt-a1i/archify-dsh/skills/archify/bin/archify.mjs
```

装 archify：`dsh plugin --profile desktop add '@tt-a1i/archify-dsh'`（装完要重启 dsh）。
**注意**：用 DSH 自带的 pnpm，不要用系统 PATH 上那个——store 版本不一致会报 `ERR_PNPM_UNEXPECTED_STORE`。

## 工作流（五步）

### 第 0 步 · 判断技术栈（跨项目必做）

看仓库根目录的清单文件决定后续检索方式：

| 特征文件 | 栈 | 文件/方法长什么样 |
|---|---|---|
| pom.xml / build.gradle | Java / Spring | XxxController.java、`方法:行号` |
| package.json | Node / TS | xxx.controller.ts、路由注册 |
| pyproject.toml / requirements.txt | Python | views.py / routers/、函数 |
| go.mod | Go | handler/、`func XxxHandler` |
| *.csproj / *.sln | .NET | XxxController.cs |
| composer.json | PHP / Laravel | Controller.php |
| Gemfile | Ruby / Rails | app/controllers |

完整检索配方见 `references/stack-recipes.md`。**先读它，能省一半时间。**

### 第 1 步 · 锁定范围

把业务名翻译成仓库检索词，用证据说话：

1. 中文业务词（业务注释、枚举、常量里命中率高）
2. 英文驼峰/下划线变体（Member / member_ / MEMBER_）
3. 文件名 glob
4. 前端反查：API 封装目录里的 url 暴露后端**应该**有哪些接口

产出：候选链路清单，每条一句话（谁发起 → 经过什么 → 落到哪）。一般 3~7 条。

### 第 2 步 · 逐条取证

每层都要打开文件确认，**行号当场读到**：

| 层 | 确认什么 | 常见坑 |
|---|---|---|
| 请求侧 | 真实请求路径、baseURL | 以为调了后端，其实是本地 mock |
| 接入层 | 端口、具体过滤器/中间件 + 行号 | 只写「网关」不写过滤器，等于没画 |
| 服务 | 请求真的跨进程了吗 | 接口定义在某处，实现在另一处 |
| 文件 | 文件名、路径 | 同名文件跨模块 |
| 方法 | 方法名 + 当前行号 | 注释里出现方法名 != 方法存在 |
| 存储/表 | 表名 + 谁写它 + 落哪个库 | 实体存在 != 有 Dao；mapper 指向的接口可能不存在 |

**查不到就标 gap**，并在 gaps[] 里写否定证据，例如：
`XxxMapper.xml` 声明 namespace `...XxxDao`，但 glob 返回 0 个文件 => 写路径缺。

### 第 3 步 · 写规格 JSON

复制 `assets/spec-template.json`。八列骨架：

| # | 列 | 写什么 | 可省略 |
|---|---|---|---|
| 1 | req | 请求侧：Web / App / 第三方 | 否 |
| 2 | gw | 接入层：网关 / Nginx / 路由入口 | 单体可省 |
| 3 | svc | 服务：哪个进程 | 否 |
| 4 | mod | 模块：子模块 / 包 / 目录 | 小项目可省 |
| 5 | file | 文件：类名.java / mapper xml | 否 |
| 6 | method | 方法：方法名:行号 | 否 |
| 7 | ds | 存储：库名 / 数据源 / 缓存 | 无存储可省 |
| 8 | table | 数据表：表名 / topic / key 前缀 | 无存储可省 |

- `chain.rows[]` 是主体：每行按列键 `req|gw|svc|mod|file|method|ds|table` 放芯片或芯片数组
- 芯片字段：`cn`（中文业务动作）、`code`（代码符号）、`sub`（为什么有这步）
- 供校验的字段：`file` / `method` / `line` / `table` / `ds`
- `glossary[]` ≥ 10 条；`gaps[]` 三级：`blocker` / `warn` / `info`

### 第 4 步 · 三道闸门，全过才出图

```bash
node scripts/verify.mjs <spec.json> <仓库根目录>      # 事实命中率必须 100%，退出码 0
python scripts/check_layout.py <out.html>            # 布局闸门，必须 problems=[]
```

- `verify.mjs`：把每条 文件/方法/表名 拿回仓库核对，未命中逐条列原因，退出码非 0。
  支持 .java/.ts/.js/.py/.go/.cs/.php/.rb/.kt/.xml/.sql。会报「行号漂移」（>8 行偏移只警告不失败）。
- `check_layout.py`：无头浏览器实测四类问题——**卡片溢出**、**连线穿卡**、**连线贴卡边**（<6px）、
  **色带与列头错位**（>1px）。**不是可选步骤**，文字挤、线贴边，它一次就能抓出来。

> **多链路必读**：芯片 id 是 `c<链路序号>-s<步骤号>`，`wires.js` 按 `data-step` 在本 section 内查找。
> 曾经这里是 `id="s<步骤号>"` + `document.getElementById`，导致**画 ≥2 条链路时第 2 条起所有连线串台**
> （实测两条链路必报 20 处穿卡）。已修复，**别改回去**。

### 第 5 步 · 交付（两段式）

**5a. 数据俯视图**（可选，但强烈建议留一份）

```bash
node scripts/render.mjs <spec.json> <out>.html assets/diagram.css
```

**5b. 渲染成好看的图**——交给 archify

按图的性质选类型：

| 想问什么 | archify 类型 |
|---|---|
| 一次请求的先后顺序、谁调谁 | `sequence` |
| 系统由哪些组件构成 | `architecture` |
| 审批/CI 这类流程 | `workflow` |
| 数据从哪来到哪去、ETL | `dataflow` |
| 订单/申请的状态流转 | `lifecycle` |

```bash
node <archify>/bin/archify.mjs finalize sequence <candidate.json> <out.html> --quality showcase --json
```

`finalize` 内含 `validate` → `deliver` → `check` → `browser-check` 四道闸门，**exit 0 才算过**。
失败时读 `diagnostics[].supportedFixes` 逐条改，不要整份重写。

**archify 规格的四个硬约束**（都被卡过，写之前先自查）：

| 约束 | 数值 | 违反后果 |
|---|---|---|
| viewBox 宽度 | **≤ 1085px**（6 参与方内）；7 参与方要更窄 | `composition/desktop-readability`：子标签投影字体 < 6px |
| 画布宽高比 | **≥ 1.55** | `composition/viewport-height` 失败 |
| 消息 y 间距 | **≥ 28px** | `layout/constraint`：共享水平空间 |
| 分组边界 | **不得等于任何消息 y** | `composition/container-border-run` |
| 参与方子标签 | 约 ≤ 107px 宽 | `layout/constraint`：超出 86px 盒子 |

加中文：`meta.locale: "zh-CN"`（archify 内置 437 条中文词条，界面 chrome 自动全中文）。
**别自己写壳**。

**5c. 合并成一个成品**

把 5a 与 5b 的 HTML 用 base64 内嵌进一个壳页面，做标签页切换。
这样双击即可离线查看，不依赖任何外部文件。

产物写到**项目仓库外**，文件名 `<域>-数据链路.html`。**只交 HTML，不导 PNG**。

## 硬约束

- **只读仓库**，不修改任何源文件
- **不执行任何 git 命令**（除非用户明确要求）
- 产物一律写在**仓库外**
- 图上每条事实都能回答「你在哪个文件哪一行看到的」
- **查不到就标缺口**，不许编造。否定证据也要写（查了什么、返回什么、为什么判定缺失）
- 不输出凭据、密钥、连接串内容

## 视觉规则（改版式前先读完）

| 规则 | 原因 |
|---|---|
| **不画泳道线**，用淡色背景色带区分列 | 泳道线把图切得太碎 |
| **色带在卡片之下**（z-index 0 → 连线 1 → 卡片 2） | 线不能压卡片 |
| 色带宽度基准必须与内容表格一致 | 否则 1fr 列宽不同步，**越往右越错位** |
| 表头 **sticky 冻结** | 容器 overflow-x 会让 sticky 失效 |
| 卡片 **等宽等高 100px**，四行栅格 | 尺寸是算过的，改字号必须同步改高度 |
| 每行单行省略号，悬停 data-tip 出全文 | 换行会挤压 |
| 状态角标**只标例外**：外部（紫）/ 缺口（红虚线）/ 原型（黄虚线） | 满屏「真实」是噪音 |

## 连线规则（最容易返工，按顺序照做）

1. **只走正交**：任何线段要么全水平、要么全垂直
2. **同列直上直下**，同行直左直右。不许为「进出不同点」把同轴连线掰弯
3. **只有跨行且跨列**才 4 点折弯，走**行间空隙中线**
4. 走列缝/行缝中线，留 ≥ 6px 净空；线段**不得与卡片边线平行且贴近**
5. 出线用卡片底/右缘中心，入线用顶/左缘中心
6. 箭头：SVG `marker id="arrowhead"` + CSS `marker-end:url(#arrowhead)`，**两个 id 必须一字不差**
7. 进出「请求侧」的线用**虚线**（出网语义）

## 参考文件

- `references/stack-recipes.md` —— 各语言/框架的检索配方（**先读这个**）
- `references/project-profile.example.md` —— 「项目画像」范例
- `assets/spec-template.json` —— 8 列通用骨架
- `examples/member-bindcard.json` —— 会员绑卡范例（8 列 7 行，端到端全真实）

## 记下失败路径（这条纪律来自本技能自己的教训）

1. **多链路 id 串台**：原实现 `id="s<n>"` + `document.getElementById`，≥2 链路必炸。已改为带链路前缀 + `data-step` 作用域查找。
2. **check_layout.py 无 section 标识**：报错只有 `WIRE_THROUGH 8->9 s5`，无法区分哪条链路，排查绕远路。已加 `chain[n]` 前缀。
3. **playwright 未写进文档**：三份文档一度一个 "playwright" 都没有，脚本却在 import。已补进依赖表。
4. **archify sources 要 git 哈希**：给 participant 加 `sources` 会要求 `meta.repository.revision`（40 位哈希）。
   仓库没提交时**只能删掉 sources**，源码证据就丢了——所以证据清单要另用 `cards` 承载，写进卡片正文。
5. **archify --out-dir 有所有权**：旧 browser-check 回执会占住文件名，重跑报 `viewer/evidence-path-conflict`，需换目录或先挪开。
