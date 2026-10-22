---
name: designer-perspective
description: >-
  动手前判断「该不该做」的元技能。用户说「我有个想法」「这样做行不行」「值不值得」「先想清楚再做」「帮我理一下逻辑」「这事靠谱吗」「我该不该投入」「评估一下」「可行性」时使用。
  做法：声明条件空间 → 白箱三问（依据什么/什么条件成立/错了怎么办）→ 四态裁决（ACCEPT/REJECT/DEFER/BLINDSPOT）→ 失败按条件层归因。
  English triggers: should I do this, is it worth it, feasibility, decision, think before act, blindspot.
  【不适用】不执行具体操作、不替代验证单元裁决、不写认知图事实层。
license: MIT
compatibility: >-
  只读运行；可选依赖 dsh-memory/md_cg（不可用时降级为纯本地规则，见「依赖与降级」）；写操作须由 agent 经 MCP 显式发起
allowed-tools: Read Bash
metadata:
  version: "1.1-draft"
  skill-author: 灵枢（AEIS）
  last-reviewed: "2026-10-22"
  layer: meta
  kccs:
    trigger_words: ["设计者视角", "全局观测", "条件空间声明", "资格裁决", "四态判定", "条件层归因", "方向判断", "白箱三问", "该不该做", "条件够不够", "我有个想法", "这样做行不行", "要不要做", "值不值得", "先想清楚", "帮我理一下逻辑", "这事靠谱吗", "我该不该", "评估一下", "可行性", "风险在哪", "该不该投", "理清思路", "拆解一下", "盘一下"]
    trigger_words_en: ["designer perspective", "meta-skill", "should I do this", "is it worth it", "feasibility", "decision", "think before act", "condition space", "qualification", "white-box", "blindspot", "attribution", "discipline"]
    when: "任务开始前需要判断执行资格与方向；或失败后需要定位遗漏条件；或需要从整体查看认知图"
    sub: ["① 声明条件空间", "② 白箱三问自检", "③ 四态资格裁决", "④ 方向判断与关注信号", "⑤ 归因与蒸馏"]
    execute: "快速三问 → 需要深入时走五步 → 输出判定单 → 失败则归因蒸馏"
    not_applicable: ["负路由：观测位置与操作层执行互斥；不执行具体操作、不替代验证单元裁决、不写入认知图事实层"]
  calibration: "对照：白箱三问 + 四态资格判定（条件路由图）；资格由条件证据裁决，不由相似度裁决"
---

# 设计者视角（designer-perspective）

## 30 秒快速开始

用户说「我有个想法：XXX」→ 你只需回答三行：

1. **依据什么**——引用了哪条知识/经验/数据？
2. **什么条件下成立**——这个判断的适用条件是什么？
3. **错了怎么办**——怎么验证、怎么回滚？

三行都能答 → **ACCEPT**；有一行答不上 → **DEFER**；全都答不上 → **BLINDSPOT**（停止猜测）。

深入分析才走下面的五步。多数时候，三问就够了。

## 和另外 6 个 skill 的关系

| 你的问题 | 用哪个 |
|---|---|
| **该不该做 / 值不值得 / 先想清楚** | **designer-perspective（本技能）** |
| 浏览器 / DOM / 渲染怎么搞 | lingshu-browser |
| 编译器 / 词法 / 字节码 | lingshu-compiler |
| 图算法 / 最短路 | lingshu-graph |
| 网络 / TCP / TLS | lingshu-net |
| 进程 / 内存 / 文件系统 | lingshu-os |
| Python 机制 | lingshu-pylang |

## 依赖与降级

| 依赖 | 有 | 没有时 |
|---|---|---|
| Python 3 | 跑 scripts/designer.py | **纯手工填判定单**（模板见「输出：判定单」） |
| mdcg MCP | 可查认知图 | 只用本地规则，不查库 |
| 真源库 | 可校准 | 按 SKILL.md 原则自行判断 |

降级不阻塞：三问、四态、判定单全部可以纯手工完成。

## When to use

- **任务开始前**：判断执行资格与方向，而非直接执行。
- **候选歧义时**：多个候选「看起来都像」，判断谁有资格（负路由优先）。
- **失败之后**：从条件层定位遗漏条件，而不是只改答案。
- **长期运行中**：从整体看认知图，识别盲区并决定方向。
- **自我校准时**：核对「依据什么、什么条件成立、错了怎么办」。

不适用：已明确路径的纯执行任务、时间紧迫的琐碎操作、需写认知图事实层的动作。

## 克制条款

1. **不执行**：产出判定单与建议调用清单，不产出操作结果。
2. **不裁决事实**：事实裁决归验证单元与 MCP 基底；不代替 mdcg_verify。
3. **不写库**：脚本只读；写操作只输出建议参数，由 agent 显式发起。
4. **不硬答盲区**：无法建立判断路径时判 BLINDSPOT 并停止猜测，指出缺失维度。

## How to execute（五步，深入时用）

### 步骤 1：声明条件空间

| 维度 | 回答的问题 | 协议映射 |
|------|-----------|---------|
| 观测位置 | 谁在观测？从哪个尺度？ | 实例角色、结构倾向 |
| 观测工具 | 用什么方法测量信息差？ | 验证方法、反思方法 |
| 时间窗口 | 什么时间范围内观测？ | 观察窗口 N、迭代周期 |
| 存在约束 | 物理-信息层允许什么？ | 锚点层公理、通用价值观 |

运行：`python scripts/designer.py declare --position designer --space "观测位置=全局;观测工具=条件证据;时间窗口=当前任务;存在约束=锚点层公理"`

### 步骤 2：白箱三问自检

对每个候选逐问：**依据什么**（锚定）/**在什么条件下成立**（条件空间）/**错了怎么办**（验证闭环）。任一问无法回答，不得 ACCEPT。

### 步骤 3：四态资格裁决

```
候选 C
 ├─ 存在足以证明「不适用」的条件冲突？ → REJECT
 ├─ 候选存在但区分条件未定？           → DEFER（递归补条件）
 ├─ 无法建立判断路径？                 → BLINDSPOT（停止猜测）
 └─ 条件充分，获得执行资格             → ACCEPT
```

核心纪律：**资格由条件证据裁决，不由相似度裁决**。

运行：`python scripts/designer.py judge --query "..." --conditions "{...}" --emit-mcp`

### 步骤 4：方向判断

- 值不值得做：`Value = ΔD_task · σ(Gain_task)`；Gain 是筛选器，ΔD 是定价器。
- 成本：`K_π` 含导航税、验证成本、计算开销。
- 权限边界：π* 仅为 L1/L2 策略搜索层目标函数，L3 不适用。
- 观测不干预：可发关注信号（signal），不干预内部决策。

### 步骤 5：失败归因与蒸馏

- **三方条件空间**：任务真实条件 / 模型感知条件 / 机制声明条件——失败 = 三方失配。
- **五失配维度**：观测位置 / 观测工具 / 时间窗口 / 存在约束 / 条件边界。
- **蒸馏**：失败 → 根因（条件层）→ 可复用纪律（带适用条件）→ 注入 → 不再犯。

运行：`python scripts/designer.py attribute --error "{...}"` / `distill --failures f.jsonl --out d.md`

### 输出：判定单（固定格式）

```
[判定单]
条件空间：观测位置=… | 观测工具=… | 时间窗口=… | 存在约束=…
白箱三问：依据=… | 条件=… | 错后=…
裁决：ACCEPT | REJECT | DEFER | BLINDSPOT
依据：<条件证据，非相似度>
缺失维度：<五维之一>（BLINDSPOT/DEFER 时必填）
验证路径：<可裁决的下一步>
关注信号：<可选，不干预>
```

## Verification

- **自检集**：`python tests/selftest.py --cases tests/cases.jsonl`，通过率是自证不是声称。
- **判定可核查**：每条裁决必须给出条件证据，给不出即降级 DEFER/BLINDSPOT。
- **实例**：见 examples/ 下 5 个真实形态案例（accept / reject / defer / blindspot / attribution）。
- **回归边界**：不修改既有条件单元与真源库。

## References

- references/01 ~ 05（观测位置 / 结构识别 / 方向判断 / 资格裁决 / 条件归因）
- scripts/designer.py、tests/cases.jsonl + selftest.py
- **examples/（v1.1 新增）**：5 个判定单实例

## Changelog

- **v1.1-draft（2026-10-22）**：新增 30 秒快速开始；description 改为口语触发词 + 英文触发；新增 examples/ 5 实例；新增「依赖与降级」表；新增与另外 6 个 skill 的路由表；更新 last-reviewed。
- v1.0（2026-09-10）：初版。
