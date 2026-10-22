---
date: 2026-10-22
tags: [工作, 搞钱, DSH插件, Config, 完整规范, 重要]
---

# 第四个缺失：Config 导出（DSH 插件规范要求）

> **对照两个真实插件发现：它们都导出 `Config`。我们之前没有。**
> **已补上，并用 mock 完整验证 6/6 通过（8 项检查全绿）。**

## 一、⭐⭐⭐ 真实插件的完整导出

### dsh-plugin-mall 的导出

```javascript
export const name = "dsh-plugin-mall";
export const inject = ["tools", "jobs", "systemPrompt", "loader"];
export const Config = z.object({
  defaultProfile: z.string(),
  apiBase: z.string().default("https://api.github.com"),
  perPageMax: z.natural().min(1).max(30).default(30),
  allowRestart: z.boolean().default(true),
});
export function apply(ctx, config = {}) { ... }
```

### git-graph 的导出

```javascript
export { Config, apply, inject }
```

### ⭐⭐ 关键点

| 导出 | 作用 | 必需？ |
|---|---|---|
| **`name`** | 插件名 | 真实插件都有 |
| **`inject`** | 声明依赖的服务（如 `tools`） | **必需** |
| **`Config`** | 配置 schema（schemastery） | 真实插件都有 |
| **`apply(ctx, config)`** | 插件入口 | **必需** |

**→ 我们之前缺了 `Config`。**

## 二、✅ 补充内容

### 1. 加 import

```javascript
import z from "@deepseek-ai/schemastery";
```

### 2. 加 Config 导出

```javascript
/** 插件配置（可选，DSH 会校验 cordis.patch.yml 里的 config） */
export const Config = z.object({});
```

### 3. 更新 default export

```javascript
export default { name, inject, Config, apply };
```

### 4. package.json 补 peerDependency

```json
{
  "peerDependencies": {
    "@deepseek-ai/dsh-tools": "*",
    "@deepseek-ai/schemastery": "*"
  },
  "peerDependenciesMeta": {
    "@deepseek-ai/dsh-tools": { "optional": true },
    "@deepseek-ai/schemastery": { "optional": true }
  }
}
```

## 三、⭐⭐⭐ 完整验证（8 项检查，6/6 全绿）

```
销售   name=✓ inject=✓ config=✓ apply=✓ toolName=✓ exec=✓ render=✓ call=✓  ✅
HR     name=✓ inject=✓ config=✓ apply=✓ toolName=✓ exec=✓ render=✓ call=✓  ✅
律师   name=✓ inject=✓ config=✓ apply=✓ toolName=✓ exec=✓ render=✓ call=✓  ✅
教师   name=✓ inject=✓ config=✓ apply=✓ toolName=✓ exec=✓ render=✓ call=✓  ✅
财务   name=✓ inject=✓ config=✓ apply=✓ toolName=✓ exec=✓ render=✓ call=✓  ✅
运营   name=✓ inject=✓ config=✓ apply=✓ toolName=✓ exec=✓ render=✓ call=✓  ✅

6/6 通过  === 全部通过（含 Config） ===
```

### ⭐ 8 项检查的含义

| 检查 | 含义 |
|---|---|
| `name` | `export name` 等于包名 |
| `inject` | 是数组且含 `tools` |
| `config` | `export Config` 存在 |
| `apply` | 是函数 |
| `toolName` | 注册的工具名正确 |
| `exec` | execute 是函数 |
| `render` | output.render 是函数 |
| `call` | 实际调用返回 3-4K 字符 |

## 四、⭐⭐⭐ 四轮发现的问题汇总

| # | 问题 | 后果 | 状态 |
|---|---|---|---|
| 1 | 5 个插件工具名 camelCase vs snake_case | 工具找不到 | ✅ 已修 |
| 2 | cordis.patch.yml 格式完全错误 | 插件挂不上 | ✅ 已修 |
| 3 | 工具注册 API 错误（`ctx.tool`） | 代码不执行 | ✅ 已修 |
| **4** | **缺 `Config` 导出** | **可能加载警告或失败** | ✅ **已补** |

### ⭐⭐⭐ 如果没做这四轮验证

| 问题 | 影响 |
|---|---|
| 工具名不一致 | 用户调不到工具 |
| patch 格式错 | 插件不出现 |
| API 错 | 代码报错 |
| 缺 Config | 配置校验可能失败 |

**→ 四个问题叠加 = 100% 不可用。**

## 五、⭐⭐ 现在对照真实插件的完整度（14 项）

| 项 | 真实 | 我们 |
|---|---|---|
| `dsh.bundle.patch` | ✅ | ✅ |
| `exports` | ✅ | ✅ |
| `engines.dsh` | ✅ | ✅ |
| `peerDependencies` dsh-tools | ✅ | ✅ |
| `peerDependencies` schemastery | ✅ | ✅ **新补** |
| patch `- insert:` 数组 | ✅ | ✅ |
| patch `name` npm 包名 | ✅ | ✅ |
| patch `config` | ✅ | ✅ |
| `export name` | ✅ | ✅ |
| `export inject` | ✅ | ✅ |
| **`export Config`** | ✅ | ✅ **新补** |
| `export apply(ctx)` | ✅ | ✅ |
| `ctx.tools.register(defineTool(...))` | ✅ | ✅ |
| `output.schema` + `render` | ✅ | ✅ |

**→ 14 项全部对齐。**

## 六、⭐⭐ 还差什么（诚实说）

| 项 | 状态 |
|---|---|
| 结构完整 | ✅ 14 项对齐 |
| 语法正确 | ✅ 6 个 node --check 通过 |
| mock 验证 | ✅ 6/6 通过 8 项检查 |
| **真实 DSH 加载** | ⚠️ **仍未做** |
| **`presentCall`（可选）** | ⚠️ 没做（用于 UI 卡片展示） |

### ⭐ 为什么还是不做真实加载

| 原因 |
|---|
| 改 desktop profile 会触发 pnpm 全量重装 |
| 会破坏你现有的 8 个插件 + 15 个 bundle |
| **风险大于收益** |

**→ 建议：发布后用 npm 装一个试试。**

## 七、⚠️ 诚实说明

| 项 | 说明 |
|---|---|
| **Config 缺失是真的** | 对照两个真实插件确认 |
| **已补并验证** | 6/6 通过（含 config 检查） |
| **mock 不是真实包** | schemastery 的 mock 只实现基本方法 |
| **`presentCall` 没做** | 真实插件有，但可能是可选的 |
| **未真实测试** | 建议你发布后验证 |
