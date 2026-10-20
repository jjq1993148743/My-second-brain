---
date: 2026-10-21
time: 00:15
place: 家
tags: [学习, 可复用模板]
---

DSH（DeepSeek Harness Desktop 0.2.1-rc.2，profile = desktop）的插件市场配置与已装插件备份。换电脑 / 重装时按本文恢复。涉及外部版本号的内容截至 2026-10。

## 插件市场索引源（已配置在 profile patch）

「发现」标签页的数据来自这些 format-1 索引，写在 `C:\Users\<user>\.dsh\profiles\desktop\cordis.patch.yml` 的 `plugin-market` 条目下：

| # | 索引 URL | 条目数 | 说明 |
|---|---|---|---|
| 1 | https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json | 3112 | awesome-dsh-plugin 官方目录（npm CDN 分发，快） |
| 2 | https://awesome-dsh-plugin.com/index.json | 3112 | 同上，源站直连 |
| 3 | https://dshmarket.com/index.json | 3112 | 同上，dsh-market 项目分发点 |
| 4 | https://cdn.jsdelivr.net/gh/REALOIYO/dsh-plugin-market@main/index.json | 7348 | npm 全量扫描索引，覆盖面最大 |
| 5 | https://cdn.jsdelivr.net/gh/CatGuard35/dsh-plugin-indexes@main/dsh.so.format1.json | 13445 | dsh.so 目录转换，收录最多（含大量未验证包） |
| 6 | https://cdn.jsdelivr.net/gh/CatGuard35/dsh-plugin-indexes@main/dsh-plugin.org.format1.json | 2223 | dsh-plugin.org 目录转换 |
| 7 | https://cdn.jsdelivr.net/gh/CatGuard35/dsh-plugin-indexes@main/lanshuagent.format1.json | 594 | lanshuagent 目录转换 |
| 8 | https://gist.githubusercontent.com/a1554154492-dev/e14e1450daca3c35bdb35babf0b16705/raw | 2975 | awesome 精选子集（gist 镜像） |

1–3 内容完全相同（SHA256 一致），只是分发点不同；4、5 与前三者重叠度低（7%/7%），是真正的增量来源。

## 新电脑恢复索引源

把下面这段追加到新机器的 `~/.dsh/profiles/desktop/cordis.patch.yml`（YAML 顶层数组的一个元素；注意 patch 按 id 整块替换，`disabled` 行必须原样保留）：

```yaml
- id: plugin-market
  name: "@deepseek-ai/dsh-plugin-market"
  disabled: !!js '!ctx.get(''profileContext'')'
  config:
    indexes:
      - "https://cdn.jsdelivr.net/npm/dsh-plugin-catalog/index.json"
      - "https://awesome-dsh-plugin.com/index.json"
      - "https://dshmarket.com/index.json"
      - "https://cdn.jsdelivr.net/gh/REALOIYO/dsh-plugin-market@main/index.json"
      - "https://cdn.jsdelivr.net/gh/CatGuard35/dsh-plugin-indexes@main/dsh.so.format1.json"
      - "https://cdn.jsdelivr.net/gh/CatGuard35/dsh-plugin-indexes@main/dsh-plugin.org.format1.json"
      - "https://cdn.jsdelivr.net/gh/CatGuard35/dsh-plugin-indexes@main/lanshuagent.format1.json"
      - "https://gist.githubusercontent.com/a1554154492-dev/e14e1450daca3c35bdb35babf0b16705/raw"
```

## 已安装插件清单（2026-10-21）

profile `desktop` 的 `package.json` 依赖与 `dsh.profile.bundles`：

| 插件 | 版本 | 来源 | 安装方式 |
|---|---|---|---|
| dsh-free-search | 0.9.11 | npm | `dsh plugin add dsh-free-search` |
| dsh-github-router | 0.4.1 | npm | `dsh plugin add dsh-github-router` |
| dsh-providers-hub | 1.9.261020 | npm | `dsh plugin add dsh-providers-hub` |
| dsh-our-free-model | 2.5.7 | 本地 vendor 目录（私有，不在 npm 公共源） | 见下 |

官方/实验性 bundle（随 DSH 提供，勾选即用，无需安装）：dsh-base、dsh-web-app、voice-input、auto-review、agent-team-profile、tool-worktree、terminal-bundle、session-search、session-titles-bundle、ralph-bundle、plugin-market-bundle。

## dsh-our-free-model 的特殊处理

npm 上的 dsh-our-free-model 最新是 2.1.0，本机是 **2.5.7 私有版**，装在 `profile\vendor\dsh-our-free-model`（8.7 MB，247 个文件，无凭据、已扫过密钥）。它没有 git 仓库、没有 repository 字段，是别人直接拷过来的目录。

恢复选项（按优先级）：
1. **先问当初给我这个目录的人要 2.5.7**——它是私有分发，源头在别人手里
2. 装回 npm 版 2.1.0：把 `package.json` 里的 `"dsh-our-free-model": "file:vendor/dsh-our-free-model"` 改成 `"^2.1.0"`，删掉 vendor 目录，跑 pnpm install
3. 直接把整个 `vendor\dsh-our-free-model` 目录拷到新机器同位置（U 盘 / 局域网），配置不用改

## 相关

- [[Git 凭证弹窗反复出现（helper-selector）]]
- 索引内容是第三方声明、无签名；实际安装以包 manifest 为准。装前看清楚来源。
