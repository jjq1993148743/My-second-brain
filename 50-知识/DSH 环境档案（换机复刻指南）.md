---
date: 2026-10-21
place: 办公室
tags: [学习, 可复用模板]
---

> **换机复刻 DSH 环境的完整档案**：这台电脑（办公室机）上 DeepSeek Harness 的插件、市场索引、模型/权限配置、记忆与性格数据的位置。家里的新电脑照着这份文件走一遍，就能得到近乎同一个“第二大脑 AI”。截至 2026-10，插件版本以当日实装为准。

## 1 · 是什么

DSH（DeepSeek Harness）的“性格 + 记忆”由两个插件分担，**数据都是纯本地文件夹，拷走即迁移**：

| 插件 | 管什么 | 数据在哪 |
|---|---|---|
| **灵枢** `@furongjun1999/dsh-memory` | 长期记忆 + 性格形成。五层认知图（anchor/structural/knowledge/contextual/**self**），self 层存身份与性格 traits；带遗忘、巩固、演化、睡眠整理机制 | `~/.dsh/.dsh-memory/` |
| **OpenViking** `@openviking/dsh-memory-plugin` | 跨项目持久上下文：历史会话检索、经验记忆、技能库（viking:// skills） | `~/.openviking/` |

> AI 推测：截至 2026-10-21，灵枢只积累了 contextual 层 15 条记忆，self/性格层尚为空——性格迁移目前主要是“机制就位”，实质内容还在早期。

## 2 · 已装插件（8 个，2026-10-21 实装）

| 包名 | 版本 | 来源 | 作用 |
|---|---|---|---|
| `@furongjun1999/dsh-memory` | 0.9.8 | npm | 灵枢：记忆+性格 |
| `@openviking/dsh-memory-plugin` | 0.5.27 | npm | OpenViking 持久上下文 |
| `dsh-grill-first` | 0.1.1 | **GitHub** `github:InoriMutsumi/dsh-grill-first` | 开工前需求确认门禁 |
| `dsh-our-free-model` | 2.5.4 | **GitHub** `github:Ebony-Vinyl/dsh-our-free-model` | 免费模型接入 |
| `dsh-providers-hub` | 1.10.261021 | npm | 模型提供商聚合 |
| `@1e0zj/dsh-plugin-mall` | 0.4.17 | npm | 插件市场 UI |
| `@linxin666/dsh-client-ui-skill-explorer` | 0.4.8 | npm | 技能浏览器 |
| `@tt-a1i/archify-dsh` | 0.1.0 | npm | 架构图生成 |

> 后两个 GitHub 源插件在市场里可能搜不到，装的时候必须用 `github:` 前缀指定。

## 3 · 插件市场索引（5 个，写进 cordis.patch.yml 的 plugin-market.config）

```yaml
- id: plugin-market
  name: "@deepseek-ai/dsh-plugin-market"
  config:
    indexes:
      - "https://dshmarketplace.dev/market/index.json"
      - "https://dshmarket.com/index.json"
      - "https://realoiyo.github.io/dsh-plugin-market/index.json"
      - "https://dshopen.org/index.json"
      - "https://dsh.store/plugin-market.json"
```

## 4 · 关键配置（cordis.patch.yml 摘要）

| 配置项 | 值 |
|---|---|
| 默认模型 | provider=`aggregate`，model=`glm-5-3`，reasoningEffort=`high` |
| 权限预设 | `danger-full-access`（默认），approval=never |
| agent preset | default=`standard`，selectedDefault=`ptc` |
| ui-chat | transcriptView=`standard`，performanceUsage=`detailed`，linkOpening=`new-tab` |
| grill-first | strict 模式，3 问 × 3 轮，standard 强度，memoryEnabled |

## 5 · 记忆与性格数据位置（已进 git，见 AGENTS.md §11）

数据在仓库 `60-DSH数据/` 下，每次会话结束随库镜像推送：

| 数据 | 库内位置 | 恢复到（新机） | 当前规模（2026-10-21） |
|---|---|---|---|
| 灵枢认知图（含性格 self 层） | `60-DSH数据/灵枢mdcg/` | `~/.dsh/.dsh-memory/` | 55 文件 |
| OpenViking 持久上下文 | `60-DSH数据/OpenViking/` | `~/.openviking/` | 1456 文件 |
| grill-first 偏好 | `60-DSH数据/grill-first偏好/` | `~/.dsh/grill-first/` | 1 文件 |
| DSH 会话记录 | `60-DSH数据/会话sessions/` | `~/.dsh/sessions/` | 37 文件 |
| 工作区与会话缓存 | `60-DSH数据/会话storages/` | `~/.dsh/storages/` | 38 文件 |

> 凭证 `~/.dsh/.credentials.yaml` **不在库里**（密钥永不进库），新机需重新登录。
> 库是公开仓库：对话内容已确认可公开（jjq 2026-10-21 拍板）。
## 6 · 家里新电脑复刻步骤（6 步）

1. **装 DSH**：安装 DeepSeek Harness，首次启动生成 `~/.dsh`。
2. **修 git 凭证**：按 [[Git 凭证弹窗反复出现（helper-selector）]] 在 `~/.gitconfig` 写入 credential 三行（helper 空值 + manager），否则 push 卡弹窗。
3. **拉第二大脑**：`git clone https://github.com/jjq1993148743/My-second-brain.git`，读 AGENTS.md（重点 §11 记忆同步规则）。
4. **装 8 个插件**（`dsh plugin --profile desktop add <spec>`）：npm 源的 6 个按第 2 节表装；grill-first 和 our-free-model 用 `github:InoriMutsumi/dsh-grill-first`、`github:Ebony-Vinyl/dsh-our-free-model`。装完把第 3、4 节配置贴进 `cordis.patch.yml`。
5. **恢复记忆**（DSH 关闭状态）：把 `60-DSH数据/` 下五个子目录按第 5 节对照表拷回本机对应位置。
6. **重启 DSH 验证**：开新会话问「你还记得我吗」，灵枢记忆能召回即成功；登录各提供商账号补凭证。

> 之后这台新机也按 AGENTS.md §11 长期同步记忆——两台机器谁有新记忆，push 后另一台 pull 即合并。注意：两台**同时**离线使用再各自 push 会冲突，尽量单机使用、另一台只 pull。
## 7 · 维护

- 每次装/卸插件或改默认模型后，更新第 2、4 节并随库推送。
- 版本号写在表里就是为了换机时“锁版本对照”，不要删。
