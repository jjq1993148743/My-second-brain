---
date: 2026-10-23
tags: [skills, 索引]
---

# 70-Skills · 技能库

可复用技能集中存放处。每个技能一个目录，遵循 SKILL.md 规范。

## 索引

| 技能 | 用途 | 依赖 | 状态 |
|---|---|---|---|
| [backend-dataflow-diagram](backend-dataflow-diagram/SKILL.md) | 把任意项目的业务流程画成单文件 HTML 后端数据流向俯视图（八列分层 + 正交连线） | Node.js（render/verify）、Python + playwright（布局闸门） | ✅ 12 文件完整，冒烟通过 |
| [photo-poster](photo-poster/SKILL.md) | 真实照片 + 中文排版出小红书竖图（1242×1656） | Python + Pillow | ✅ 已实测 |

## 结构

```
70-Skills/
└── <skill-name>/
    ├── SKILL.md          # 必需：YAML frontmatter + 执行说明
    ├── scripts/          # 可选：可运行脚本
    ├── assets/           # 可选：样式/模板/运行时
    ├── examples/         # 可选：实例与参数
    └── references/       # 可选：参考手册
```

## 装到别的机器

把整个技能目录放进目标平台的技术目录，重启或刷新会话即可生效：

| 平台 | 技能目录 |
|---|---|
| 当前环境（DSH） | `C:\Users\<你>\.agents\skills\` |
| Claude Code | `~/.claude/skills/` |
| 其他 DSH 环境 | `$DSH_HOME/skills/` 或 `~/.agents/skills/` |

## 写作纪律

| 纪律 | 说明 |
|---|---|
| **触发词写口语** | 用户说「做个封面」要能触发，不是「图像合成编排」 |
| **记下失败路径** | 试过不行的方案写进 SKILL.md，避免下次重复浪费时间 |
| **scripts 必须能跑** | 写进技能的脚本要实测通过 |
| **examples 记真实参数** | 具体字号、渐变色标、偏移量 |
| **视觉规则写明原因** | 每条规则后面跟「为什么」，否则后人会改回去 |
