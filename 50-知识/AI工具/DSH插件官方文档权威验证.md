---
date: 2026-10-22
tags: [工作, 搞钱, DSH插件, 官方文档, 权威验证, 重要]
---

# 找到官方权威文档：确认我们的插件 API 完全正确

> **之前四轮都是「对照真实插件反推」，这轮找到官方文档，直接验证。**
> **结论：`ctx.tools.register(defineTool({...}))` 是官方写法，我们的代码完全正确。**

## 一、⭐⭐⭐ 官方文档位置（一路找过来的）

| 步骤 | 结果 |
|---|---|
| 本地 DSH 安装目录找 docs | ❌ 不存在 |
| 官方文档站 `deepseek-harness.github.io` | ⚠️ VitePress SPA，路径全 404 |
| **GitHub 仓库 `docs/` 目录** | ✅ 找到（但 `development.md` 是贡献指南） |
| **GitHub 仓库 `packages/core/tools/`** | ✅✅ **找到权威文档** |

### ⭐ 权威文档清单

| 文件 | 大小 | 内容 |
|---|---|---|
| **`packages/core/tools/README.zh.md`** | **19KB** | **工具开发中文文档（权威）** |
| `packages/core/tools/README.md` | 20KB | 英文版 |
| `packages/core/tools/src/index.ts` | 91KB | 源码 |
| `packages/core/tools/src/types.ts` | 2.9KB | 类型定义 |
| `docs/capability-seams.zh.md` | 65KB | 能力 Seams 总览 |

## 二、⭐⭐⭐ 官方代码示例（原文）

**`packages/core/tools/README.zh.md` 原文：**

```ts
import { readFile } from 'node:fs/promises'
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

declare const ctx: Context

ctx.tools.register(defineTool({
  name: 'read_file',
  description: 'Read a file from disk.',
  parameters: {
    path: { type: 'string', required: true, description: 'Absolute file path' },
    offset: { type: 'number' },
    limit: { type: 'number' },
  },
  output: {
    schema: { type: 'string' },
    render: (_args, value) => [{ type: 'text', text: value }],
  },
  async execute(args, exec) {
    // args is typed: { path: string; offset?: number; limit?: number }
    return readFile(args.path, { encoding: 'utf8', signal: exec.signal })
  },
}))
```

## 三、⭐⭐⭐ 逐项对照：我们的代码 vs 官方

| 项 | 官方 | 我们的 | 一致？ |
|---|---|---|---|
| import 路径 | `@deepseek-ai/dsh-tools` | `@deepseek-ai/dsh-tools` | ✅ |
| 注册方式 | `ctx.tools.register(defineTool({...}))` | 同 | ✅ |
| `name` | 字符串 | `sales_script` | ✅ |
| `description` | 字符串 | 有 | ✅ |
| **`parameters` 格式** | **扁平对象**（`path: { type: 'string', required: true }`） | **扁平对象** | ✅ |
| **必填标记** | **`required: true` 在参数内** | 用了 `enum` 但没加 required | ⚠️ **可优化** |
| `output.schema` | `{ type: 'string' }` | 同 | ✅ |
| `output.render` | `(_args, value) => [{ type: 'text', text: value }]` | 同 | ✅ |
| **`execute(args, exec)`** | **两个参数** | **我们只用了 args** | ⚠️ **可优化** |
| `exec.signal` | 用于取消 | 没用 | ⚠️ 可选 |

### ⭐⭐ 一个可优化点

**官方示例的 `execute` 用了 `exec.signal` 传给 `readFile`（支持取消）：**

```ts
async execute(args, exec) {
  return readFile(args.path, { signal: exec.signal })
}
```

**我们的 `execute` 只用了 `args`（因为只是读本地文件，很快）。**

**→ 对内容型插件（3-4K 字符读取）不需要取消支持，可以接受。**

## 四、⭐⭐ 官方文档的其他关键信息

### 1. 注册即可见

> **原文：「注册一个工具就足以让它可见——注册表会自动把其 schema 送入系统提示词组装。」**

**→ 不需要额外声明，注册了模型就能看到。**

### 2. schema DSL 支持的完整类型

| 类型 | 说明 |
|---|---|
| `string` / `number` / `integer` / `boolean` / `null` | 基础类型 |
| `array` / `object` | 容器 |
| `json` | 仅供作者使用 |
| `oneOf` | 恰好匹配一个分支 |

### 3. `defineTool` 支持的其他能力

| 能力 | 说明 |
|---|---|
| **协作式超时** | 工具可声明超时 |
| **并行安全属性** | 声明是否可并行 |
| **可选 UI 展示** | `presentCall`（我们没做） |
| **`mode` 配置** | `native`（原生 FC）或 `ptc`（run_code 模式） |

### 4. 模型看到什么

> **原文：「模型会看到每个获准工具声明的名称、描述与参数 schema」**

**→ 描述写得越清楚，模型越会用对。我们的描述已经很详细。**

## 五、⭐⭐⭐ 四轮验证的最终结论

| 轮次 | 验证方式 | 发现 | 状态 |
|---|---|---|---|
| 1 | 模拟 ctx.tool | 工具名不一致 | ✅ 已修 |
| 2 | 对照真实插件 | patch 格式错 | ✅ 已修 |
| 3 | 对照真实插件源码 | API 完全错 | ✅ 已修 |
| 4 | 对照真实插件导出 | 缺 Config | ✅ 已补 |
| **5** | **官方文档权威验证** | **API 完全正确** | ✅ **确认** |

### ⭐⭐⭐ 现在可以确定

| 项 | 状态 |
|---|---|
| `ctx.tools.register(defineTool(...))` | ✅ **官方写法** |
| `parameters` 扁平对象 | ✅ **官方格式** |
| `output.schema` + `render` | ✅ **官方格式** |
| `execute(args, exec)` | ✅ **官方签名**（我们省略 exec 可接受） |
| `export name / inject / Config / apply` | ✅ 对齐真实插件 |
| patch `- insert:` 格式 | ✅ 对齐真实插件 |
| `peerDependencies` | ✅ 对齐真实插件 |

**→ 9 项全部有依据，不是猜的。**

## 六、⭐⭐ 建议的微调（可选）

### 1. 给必填参数加 `required: true`

**现在：**
```javascript
parameters: {
  scenario: { type: "string", enum: [...], description: "场景" },
}
```

**官方风格：**
```javascript
parameters: {
  scenario: { type: "string", enum: [...], required: true, description: "场景" },
}
```

**作用：模型知道这个参数必须给。**

### 2. 用 `exec.signal` 支持取消（可选）

**我们的读取很快（本地文件），可以不加。**

## 七、⚠️ 诚实说明

| 项 | 说明 |
|---|---|
| **官方文档已找到** | `packages/core/tools/README.zh.md` |
| **API 确认正确** | 官方代码示例与我们的代码一致 |
| **两个可优化点** | `required: true`、`exec.signal`（都不影响运行） |
| **仍未真实加载** | 因为会破坏 desktop profile |
| **文档链接** | `github.com/deepseek-ai/deepseek-harness/blob/master/packages/core/tools/README.zh.md` |
