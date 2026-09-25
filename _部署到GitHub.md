# 部署到 GitHub（公开仓库 + 免费网页）

> 目标：想法库存在 GitHub 上，同时拥有一个自己的网址，打开就能看全部内容。
> 全程免费。**公开仓库是前提。**

---

## 你会得到什么

| 项目 | 结果 |
|---|---|
| 网址 | `https://你的用户名.github.io/ideavault/` |
| 费用 | **0 元** |
| 手机能看吗 | 能，浏览器打开那个网址就行 |
| 能看几条 | 无限制。单仓库上限 1GB，流量每月 100GB，个人用完全够 |
| 谁能看到 | **所有人**（公开仓库）。你已经确认不在乎。 |

---

## 第一步：在 GitHub 建仓库

1. 打开 https://github.com/new
2. **Repository name** 填：`ideavault`
3. 可见性选 **Public**（公开）—— ⚠️ **必须公开，否则网页要付费**
4. **不要**勾选 "Add a README file"（我们本地已经有了）
5. 点 **Create repository**

建完后页面上会显示一个地址，形如：
```
https://github.com/你的用户名/ideavault.git
```
把它记下来，下一步要用。

---

## 第二步：把本地内容推上去

打开 Git Bash（或者 PowerShell），依次执行下面四行。
**把 `你的用户名` 换成你的 GitHub 用户名。**

```bash
cd "/c/Users/赵青月/IdeaVault"

git remote add origin https://github.com/你的用户名/ideavault.git

git push -u origin main
```

> **第一次推送会弹窗让你登录 GitHub。** 用浏览器登录一次即可。
> 如果提示要密码，密码位置要填 **Personal Access Token**（不是账号密码）：
> 去 https://github.com/settings/tokens 生成一个，勾选 `repo` 权限，复制那串字符当密码用。

---

## 第三步：开启网页（GitHub Pages）

1. 进入你的仓库 → 点上方 **Settings**
2. 左侧菜单找到 **Pages**
3. **Source** 选 `Deploy from a branch`
4. **Branch** 选 `main`，文件夹选 `/ (root)`
5. 点 **Save**
6. 等 1–2 分钟，刷新页面，顶部会出现你的网址

网址格式：
```
https://你的用户名.github.io/ideavault/
```

---

## 第四步：改一行代码，让网页能读到内容

打开 `index.html`，找到最上面这段（大约在第 100 行附近）：

```js
const REPO = "YOURNAME/ideavault";
```

把它改成你自己的：

```js
const REPO = "你的用户名/ideavault";
```

保存后推送：

```bash
cd "/c/Users/赵青月/IdeaVault"
git add -A
git commit -m "配置仓库地址"
git push
```

再刷新你的网址，就能看到内容了。

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
直接浏览器打开 `https://你的用户名.github.io/ideavault/`，加到主屏幕就行。
点任意一条会跳到 GitHub 上对应的笔记，GitHub 会把 Markdown 渲染成排版好的文档。

---

## 常见问题

**Q：为什么必须公开仓库？**
GitHub 官方规定：免费版（GitHub Free）的 Pages 只支持**公开仓库**；私有仓库要用 Pages 得升级 GitHub Pro，约 $4/月。

**Q：公开了会不会被人乱改？**
不会。别人只能看，不能改。只有你能提交。

**Q：网页打不开，提示读不到仓库？**
按顺序检查：
1. `index.html` 里的 `REPO` 改了没有
2. 仓库是不是 Public
3. 文件推上去了没有（在仓库页面刷新看看）
4. 是不是刷太频繁被限流了（公开接口每小时 60 次），等一小时

**Q：`.md` 文件在网页上显示正常吗？**
网页本身只显示清单。点进去会跳到 GitHub，GitHub 会把 Markdown 渲染得很好看。

**Q：`_templates` 和 `_CLAUDE.md` 会不会被网页忽略？**
不会。已经放了 `.nojekyll` 文件，专门防止 GitHub 因为下划线开头而跳过这些文件。

**Q：以后想改成私有怎么办？**
仓库改成 Private，网页就失效了。或者用 Cloudflare Pages（免费且支持私有仓库）。但那就不是"只用 GitHub"了。

---

## 本地 git 身份要改一下

首次提交时我用的是占位信息，你应该改成自己的：

```bash
cd "/c/Users/赵青月/IdeaVault"
git config user.name "你的名字"
git config user.email "你的GitHub邮箱"
```

（这是只对这个仓库生效的设置，不会影响你电脑上其他项目。）
