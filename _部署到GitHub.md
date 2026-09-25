# 部署到 GitHub（公开仓库 + 免费网页）

> 仓库：`https://github.com/jjq1993148743/My-second-brain`
> 网址：`https://jjq1993148743.github.io/My-second-brain/`
> 全程免费。**公开仓库是前提。**

---

## 当前进度

| 步骤 | 状态 |
|---|---|
| ① 建公开仓库 | ✅ 已完成（`jjq1993148743/My-second-brain`，公开、空的、默认分支 main） |
| ② 本地 git 提交 | ✅ 已完成（5 次提交） |
| ③ 配置远程地址 | ✅ 已完成（`origin` 已指向你的仓库） |
| ④ 改 `index.html` 里的仓库名 | ✅ 已完成（已填 `jjq1993148743/My-second-brain`） |
| ⑤ **推送到 GitHub** | ⬜ **需要你来做**（见下方） |
| ⑥ 开启 GitHub Pages | ⬜ 需要你来做（见第三步） |

---

## 你要做的第一件事：推送

我这边网络访问 github.com 被限制了，推不上去，所以这一步得你在自己的终端跑。

**打开 Git Bash**，复制粘贴这三行：

```bash
cd "/c/Users/赵青月/IdeaVault"
git push -u origin main
```

**第一次会弹窗让你登录 GitHub**，浏览器点一下授权就行。

> 如果提示输入密码：GitHub 早就不支持密码了，要去
> https://github.com/settings/tokens 生成一个 token，勾 `repo` 权限，把那串字符当密码填。
> 或者更简单——用 https://github.com/settings/personal-access-tokens 建 Fine-grained token，
> Repository access 只勾 `My-second-brain`，Permissions 只给 `Contents: Read and write`。

推完之后，去 https://github.com/jjq1993148743/My-second-brain 刷新看看，文件应该都在了。

---

## 第二步：开启网页（GitHub Pages）

1. 进入仓库 → 点上方 **Settings**
2. 左侧菜单找到 **Pages**
3. **Source** 选 `Deploy from a branch`
4. **Branch** 选 `main`，文件夹选 `/ (root)`
5. 点 **Save**
6. 等 1–2 分钟，刷新页面，顶部会出现你的网址

你的网址是：
```
https://jjq1993148743.github.io/My-second-brain/
```

---

## 之后怎么用

### 平时（本地写）
在 Obsidian 里正常记东西。想同步到 GitHub 时：

```bash
cd "/c/Users/赵青月/IdeaVault"
git add -A
git commit -m "更新想法"
git push
```

### 网页会自动更新吗
**会。** `index.html` 是直接从 GitHub 实时读取的，你 push 完刷新网页就能看到新内容，**不需要重新生成任何东西**。

### 手机上想看
浏览器打开 `https://jjq1993148743.github.io/My-second-brain/`，加到主屏幕就行。
点任意一条会跳到 GitHub 上对应的笔记，GitHub 会把 Markdown 渲染成排版好的文档。

---

## 关于授权：需要给 AI 什么？

**永远不需要账号密码。** GitHub 从 2021 年起就废除了密码推送。

| 你给什么 | AI 能做什么 | 安全性 |
|---|---|---|
| 只给仓库地址 | 只能**读**（公开仓库不需要任何授权） | — |
| 你在终端登录一次 | 本机 git 记住了凭证 | 最高 |
| 给 Personal Access Token | 能通过 GitHub API 写入文件 | 中（可随时撤销） |

### 一个现实限制

我这边的网络只能访问 `api.github.com`，**访问不了 `github.com`**，所以：

- ❌ **`git push` 我做不了**——必须你在终端跑
- ✅ 如果给我一个 Fine-grained token，我可以走 **GitHub API** 往仓库里写文件

也就是说，如果你希望以后我能直接往你的库"投递"内容（比如每天自动整理完帮你提交），
**给我一个 token 就行**，不用你自己手动 push。

Token 建议这样建（https://github.com/settings/personal-access-tokens）：
- **Repository access**：只勾 `My-second-brain` 这一个仓库
- **Permissions**：只给 `Contents: Read and write`
- **有效期**：设短一点，比如 90 天

这样即使泄露，影响也只限于这一个仓库，随时能撤销。

---

## 常见问题

**Q：为什么必须公开仓库？**
GitHub 官方规定：免费版的 Pages 只支持**公开仓库**；私有仓库要用 Pages 得升级 GitHub Pro，约 $4/月。

**Q：公开了会不会被人乱改？**
不会。别人只能看，不能改。只有你能提交。

**Q：网页打不开，提示读不到仓库？**
按顺序检查：
1. 文件推上去了没有（去仓库页面刷新看看）
2. 仓库是不是 Public
3. Pages 开了没有
4. 是不是刷太频繁被限流了（公开接口每小时 60 次），等一小时

**Q：`.md` 文件在网页上显示正常吗？**
网页本身只显示清单。点进去会跳到 GitHub，GitHub 会把 Markdown 渲染得很好看。

**Q：`_templates` 和 `AGENTS.md` 会被网页忽略吗？**
不会。已经放了 `.nojekyll` 文件，专门防止 GitHub 因为下划线开头而跳过文件。

**Q：以后想改成私有怎么办？**
仓库改成 Private，网页就失效了。或者换 Cloudflare Pages（免费且支持私有仓库）。但那就不是"只用 GitHub"了。

---

## 本地 git 身份建议改一下

首次提交时我用的是占位信息：

```bash
cd "/c/Users/赵青月/IdeaVault"
git config user.name "你的名字"
git config user.email "你的GitHub邮箱"
```

（只对这个仓库生效，不影响电脑上其他项目。）
