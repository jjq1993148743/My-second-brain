---
date: 2026-10-10
time: 22:00
tags: [学习, 可复用模板]
---

Windows 上 git 走 HTTPS 时反复弹「Select a credential helper」选择框，勾了「Always use this from now on」也没用。根因：`helper-selector` 被写在**系统级**配置里且排在凭证助手链第一位，而勾选框只写**用户级**配置、删不掉它。修法：在 `~/.gitconfig` 用**空值**重置助手链，再指定 `manager`。截至 2026-10。

## 症状

每次 `git push` / `git pull`（HTTPS）都弹窗：

- 单选：`<no helper>` / `manager` / `wincred`
- 勾选框：`Always use this from now on`
- 按钮：`Select` / `Cancel`

勾了「Always use this from now on」→ 下次照样弹。

## 根因

`credential.helper` 是**多值叠加**的：git 按配置层级（system → global → local）依次追加，链上每个 helper 都会被调用。

```
system : .../PortableGit/versions/<版本>/etc/gitconfig   →  credential.helper = helper-selector
user   : ~/.gitconfig                                    →  credential.helper = !"...git-credential-manager.exe"
```

`helper-selector` 来自系统级配置、排在链首 → 每次凭证请求都先跑 `git-credential-helper-selector.exe`。

弹窗里的「Always use this from now on」只做两件事：往**用户级** `~/.gitconfig` 写 `credential.helper` 和 `credential.helperselector.selected`。**它删不掉系统级那条**，所以 `helper-selector` 永远留在链里。

> AI 推测：selector 自身有「读到保存过的选择就静默委派」的逻辑（实测在能读到用户级配置时确实不弹），但在读不到该配置的环境下会重新弹。

## 修法

在 `~/.gitconfig` 里用**空值**清空已累积的助手链，再指定要用的：

```ini
[credential "helperselector"]
	selected = manager
[credential]
	helper =
	helper = manager
```

`helper =` 空值是 git 官方语义：**清空此前累积的全部 helper**（含系统级那条）。等价命令：

```bash
git config --global credential.helper ""
git config --global --add credential.helper manager
```

用 `manager`（按名解析）而非绝对路径 —— PortableGit 升级换版本目录后不会失效。

## 验证

```bash
git config --show-origin --get-all credential.helper
# 应看到：system 的 helper-selector → 空值 → manager

printf 'protocol=https\nhost=x.invalid\n\n' | git credential fill
# 应只看到 GCM 在跑，不弹窗
```

## 复发处理

PortableGit 升级后若又弹，说明系统级配置被重建 —— 删掉那行：

```bash
# 编辑 .../PortableGit/versions/<版本>/etc/gitconfig
# 删除 [credential] 下的 helper = helper-selector
```

## 备查

- 2026-10-10 首次定位并修复；备份 `C:/Users/赵青月/.gitconfig.bak-20261010215720`
- selector 二进制内可提取到的配置键：`credential.helperselector.selected`、`credential.helper`（`strings` 提取）
- 机器上只有一个 git：`C:/Users/赵青月/.workbuddy-ai/binaries/PortableGit/`（无 `C:/Program Files/Git`，无 `GIT_CONFIG_*` 环境变量干扰）

## 相关

[[想法库用 GitHub 存，手机端还没验证]]
