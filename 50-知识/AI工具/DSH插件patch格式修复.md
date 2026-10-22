---
date: 2026-10-22
tags: [工作, 搞钱, DSH插件, 格式修复, patch, 重要]
---

# 又发现一个致命 bug：cordis.patch.yml 格式全错

> **对照真实插件（dsh-plugin-mall 等 28 个）后发现：我们的 patch 格式完全不对。**
> **如果没发现，6 个插件装上去全部加载失败。**

## 一、⭐⭐⭐ 真实格式 vs 我们的格式

### 我们之前写的（错误）

```yaml
plugins:                    # ❌ 根本没有这个 key
  - id: dsh-sales-script
    name: 销售话术库
    description: ...
    entry: ./index.js        # ❌ 不存在这个字段
    tools:                   # ❌ 工具不是在这里声明的
      - name: sales_script
        description: ...
        parameters: ...
```

### 真实格式（从 28 个真实插件提取）

```yaml
# 真实的 cordis.patch.yml 是一个 YAML 数组
- insert:                          # ✅ 顶层是 insert
    - id: dsh-plugin-mall          # ✅ 插件 id
      name: '@1e0zj/dsh-plugin-mall'  # ✅ npm 包名（不是中文名）
      config: {}                   # ✅ 配置对象
```

### ⭐⭐ 关键差异

| 项 | 我们（错） | 真实（对） |
|---|---|---|
| 顶层 key | `plugins:` | **`- insert:`**（数组） |
| 插件标识 | `id` + `name`（中文） | `id` + **`name`（npm 包名）** |
| 入口 | `entry: ./index.js` | **不需要**（package.json 的 exports 决定） |
| 工具声明 | `tools:` 列表 | **不在这里声明**（代码里 `ctx.tool()` 注册） |
| 配置 | 无 | **`config: {}`** |

**→ 工具是靠代码注册的，patch 只负责「把这个插件挂上去」。**

## 二、⭐⭐⭐ 修复内容

### 修复后的 patch（6 个都一样结构）

```yaml
# dsh-sales-script bundle patch: registers the plugin row.
# Mounted at the host plane (profile bundle layer), so its tools land in the
# tools registry's global layer and every session sees them.
#
# The row is a bare plugin by package name: the node half (exports ".") runs
# in the host process and registers its tools via ctx.tool().
- insert:
    - id: dsh-sales-script
      name: 'dsh-sales-script'
      config: {}
```

### 同时补的 package.json 字段

**对照真实插件，还缺两个字段：**

```json
{
  "exports": {
    ".": "./index.js",
    "./package.json": "./package.json"
  },
  "engines": {
    "node": ">=18",
    "dsh": ">=0.2.0"
  }
}

| 字段 | 作用 |
|---|---|
| **`exports`** | 告诉 DSH 入口在哪（**patch 里不用写 entry**） |
| **`engines.dsh`** | 声明兼容的 DSH 版本 |

## 三、⭐⭐ 验证结果（修复后 6/6 通过）

```
销售   工具=sales_script     一致=true 调用=true  ✅
HR     工具=hr_toolkit       一致=true 调用=true  ✅
律师   工具=legal_toolkit    一致=true 调用=true  ✅
教师   工具=teacher_toolkit  一致=true 调用=true  ✅
财务   工具=finance_toolkit  一致=true 调用=true  ✅
运营   工具=ops_toolkit      一致=true 调用=true  ✅

6/6 通过
```

## 四、⭐⭐⭐ 这两轮发现的两个致命 bug

| # | bug | 后果 | 状态 |
|---|---|---|---|
| 1 | 5 个插件工具名 camelCase vs snake_case 不一致 | 工具找不到 | ✅ 已修 |
| **2** | **cordis.patch.yml 格式完全错误** | **插件根本挂不上** | ✅ **已修** |

### ⭐ 如果没有这两轮验证

| 会怎样 |
|---|
| 你发布 6 个插件 |
| 用户装上去 |
| **DSH 读 patch 失败 → 插件不出现** |
| **用户以为你的插件是坏的** |
| **还可能被市场站标记为「不可用」** |

**→ 这两个 bug 是「发了等于白发」级别的。**

## 五、⭐⭐ 现在对照真实插件的完整度

| 项 | 真实插件 | 我们的 |
|---|---|---|
| `package.json` 有 `dsh.bundle.patch` | ✅ | ✅ |
| `package.json` 有 `exports` | ✅ | ✅ **新补** |
| `package.json` 有 `engines.dsh` | ✅ | ✅ **新补** |
| `cordis.patch.yml` 是 `- insert:` 数组 | ✅ | ✅ **新修** |
| patch 里 `name` 是 npm 包名 | ✅ | ✅ **新修** |
| patch 里有 `config` | ✅ | ✅ **新修** |
| 代码里用 `ctx.tool()` 注册 | ✅ | ✅ |
| 零依赖 | 有的有 | ✅ 全部零依赖 |

**→ 现在结构上和真实插件一致了。**

## 六、⭐⭐ 还差什么

| 项 | 状态 |
|---|---|
| 结构正确 | ✅ **这轮修复** |
| 能打包 | ✅ 15 文件 10.9 kB |
| 包名可用 | ✅ 6 个全部 404 |
| **真实 DSH 加载测试** | ⚠️ **仍未做**（不敢动 desktop profile） |

### ⭐ 为什么还是没做真实加载测试

| 原因 |
|---|
| 改 desktop profile 会触发 pnpm 全量重装（上轮已验证） |
| 会破坏你现有的 DSH 环境（8 个插件 + 15 个 bundle） |
| **风险大于收益** |

**→ 建议：你发布后用 npm 装一个试试（npm 装是增量，不会重装全部）。**

## 七、⭐⭐ 完整验证链条（9 项）

| # | 验证项 | 状态 |
|---|---|---|
| 1 | 代码语法 | ✅ |
| 2 | 工具名一致 | ✅ **上轮修复** |
| 3 | execute 是函数 | ✅ |
| 4 | 参数 schema | ✅ |
| 5 | 能返回内容 | ✅ |
| 6 | **patch 格式正确** | ✅ **这轮修复** |
| 7 | **package.json 字段完整** | ✅ **这轮补** |
| 8 | npm 打包 | ✅ |
| 9 | 包名可用 | ✅ |

**→ 9 项全绿，只剩「真实环境加载」没测。**

## 八、⚠️ 诚实说明

| 项 | 说明 |
|---|---|
| **格式错误是真的** | 对照 28 个真实插件确认 |
| **已修复** | 6 个 patch + 6 个 package.json |
| **验证方式是模拟** | 不是真实 DSH 加载 |
| **未真实测试** | 因为会破坏 desktop profile |
| **建议** | 发布后自己 npm 装一个验证 |
