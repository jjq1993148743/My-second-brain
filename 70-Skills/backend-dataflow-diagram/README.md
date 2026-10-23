# backend-dataflow-diagram

把**任意项目、任意业务流程**画成单文件 HTML 后端数据流向俯视图：从左到右八列，每行一个服务段，步骤 1→N 用带箭头的正交连线串起来。

## 适用性

不绑定任何项目或语言。技能第一步会探测技术栈（pom.xml / package.json / pyproject.toml / go.mod / *.csproj / composer.json / Gemfile），再按对应配方检索。
支持：Java/Spring、Node/TS、Python、Go、.NET、PHP、Ruby、纯前端项目。

## 一句话用法

对 AI 说：「画一下 XX 功能的数据流向」/「把这段业务画成俯视图」/「这个功能经过哪些服务和表」——技能自动触发。

## 目录

```
backend-dataflow-diagram/
├── SKILL.md                        技能正文：第0步判栈 + 八列版式 + 视觉/连线规则 + 五步工作流
├── assets/
│   ├── diagram.css                 色带、卡片四行栅格、sticky 表头、连线层
│   ├── wires.js                    正交路由 + 走缝中线 + 圆角 + arrowhead
│   └── spec-template.json          8 列通用骨架
├── scripts/
│   ├── render.mjs                  规格 JSON → HTML
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
cd C:/Users/jjq21/.agents/skills/backend-dataflow-diagram

node scripts/verify.mjs examples/member-bindcard.json <你的仓库根目录>   # 必须 100%
node scripts/render.mjs examples/member-bindcard.json <输出>.html assets/diagram.css
python scripts/check_layout.py <输出>.html                              # 必须 problems=[]
```

## 用在新项目上

1. 复制 `assets/spec-template.json` → `examples/<域>.json`
2. 按 SKILL.md 第 0~2 步取证（先判栈，再检索，再逐层确认行号）
3. 填 `chain.rows[]`，跑三道闸门，全过再交付

CSS 和渲染器永不需要改 —— 风格自动一致。

## 硬约束

- 只读仓库，不改源文件；不跑 git；产物写仓库外；不输出凭据
- 每条事实都要能回答「在哪个文件哪一行看到的」
- 查不到就标缺口（红虚线），不许编造
