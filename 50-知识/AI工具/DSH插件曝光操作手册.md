---
date: 2026-10-22
tags: [工作, 搞钱, DSH插件, 曝光手册, 实操, 重要]
---

# DSH 插件曝光操作手册（细到每个字段）

> **实测了 4 个提交页，发现重大简化：不用逐个提交，打标签就能被自动收录。**

## 一、⭐⭐⭐ 最重要的发现：打标签就能自动收录

### dshmarketplace.dev 原文（实测）

> **「The faster route: tag your repository. Adding that topic to your repository gets you listed on the next sync, with no submission needed.」**

**→ 打上 `dsh-plugin` 标签，下次同步自动收录，不需要提交表单。**

### 命令（实测原文）

```bash
gh repo edit --add-topic dsh-plugin
```

**或手动：GitHub 仓库 → 点 About 旁的齿轮 → Topics 填 `dsh-plugin`**

### ⭐⭐ 这意味着什么

| 之前以为 | 实际 |
|---|---|
| 要逐个提交 7 个站 | **打标签后多个站自动收录** |
| 要填很多表单 | **只需准备好仓库元数据** |

## 二、⭐⭐⭐ 三个「自动收录」的站

| 站点 | 收录方式 | 需要什么 |
|---|---|---|
| **dshmarketplace.dev** | **打 topic 自动同步** | 仓库公开 + topic + package.json |
| **awesome-dsh-plugin.com** | 从 GitHub 抓（有 RSS） | 同上 |
| **dshopen.org** | 从索引仓库抓 | 可能需 PR（见下） |

## 三、⭐⭐⭐ 收录的硬性要求（实测原文）

### dsh-plugin.org 的明确要求

| # | 要求 | 原文 |
|---|---|---|
| 1 | **仓库必须公开** | 「The repo must be public so this hub can scan it」 |
| 2 | **必须打 dsh-plugin 标签** | 「The repo must add the GitHub topic dsh-plugin」 |
| 3 | **README 必须有安装命令** | 「such as `dsh plugin --profile web add <package>`」 |
| 4 | **根目录必须有 package.json** | 「with the plugin's package name and version」 |
| 5 | **发到 npm** | 「the Plugin Hub only lists plugins published to NPM」 |
| 6 | **有 license** | 「MIT / Apache-2.0」 |
| 7 | **准确的分类** | 「11 categories」 |
| 8 | **说明权限** | 「Declare permissions, external services, and compatibility」 |

### ⚠️ 对照我们的三个插件

| 要求 | 销售 | HR | 律师 |
|---|---|---|---|
| 仓库公开 | ⬜ 待做 | ⬜ | ⬜ |
| 打 dsh-plugin 标签 | ⬜ 待做 | ⬜ | ⬜ |
| README 有安装命令 | ✅ 有 | ✅ 有 | ✅ 有 |
| 根目录 package.json | ✅ 有 | ✅ 有 | ✅ 有 |
| 发到 npm | ⬜ 待做 | ⬜ | ⬜ |
| license | ✅ MIT | ✅ MIT | ✅ MIT |
| 分类 | ⬜ 需加 | ⬜ | ⬜ |
| 说明权限 | ⬜ 需加 | ⬜ | ⬜ |

**→ 还差 4 项，见下方「发布前必做的 4 件事」。**

## 四、⭐⭐⭐ 发布前必做的 4 件事

### ① 加 GitHub topic

```bash
gh repo edit --add-topic dsh-plugin
```

**或网页操作：仓库首页 → About 右侧齿轮 → Topics → 输入 `dsh-plugin` → Save**

**建议同时加：** `dsh` `deepseek-harness` `sales`（或 `hr`/`legal`）`plugin`

### ② package.json 补字段

**现在缺的：**

```json
{
  // 已有：name, version, description, main, keywords, license, homepage, repository, dsh
  // 需要加：
  "author": "你的名字 <邮箱>",
  "files": ["index.js", "cordis.patch.yml", "kb", "README.md"],
  "engines": { "node": ">=18" }
}
```

### ③ README 加分类和权限说明

**在 README 顶部加：**

```markdown
## 分类

Development / Productivity

## 权限声明

- 文件读取：`kb/` 目录下的知识库文件
- 不联网
- 不执行命令
- 不访问凭据

## 兼容性

DSH >= 0.2.0
```

### ④ 按 dsh-plugin.org 的模板准备提交内容

**它给了固定格式（实测原文）：**

```markdown
[Plugin submission] <owner>/<repo> — <one-line value>

### Repository
<https://github.com/your-username/your-repo>

### What changes
<What changes for a user after installing this DSH Plugin? One sentence.>

### Category
<11 个分类之一>
```

**我们的填写示例（销售插件）：**

```markdown
[Plugin submission] 你的用户名/dsh-sales-script — 销售话术库，20+ 异议场景一键查

### Repository
<https://github.com/你的用户名/dsh-sales-script>

### What changes
装上后可以直接问 DSH「客户说太贵了怎么回」，它会给出带公式的完整话术，不用再翻笔记。

### Category
Productivity
```

## 五、⭐⭐ 各站实际操作（实测状态）

| 站点 | 提交页 | 状态 | 怎么做 |
|---|---|---|---|
| **dsh-plugin.org** | `/submit` | ✅ **有效（200）** | 按上面的模板格式提交 |
| **dshmarketplace.dev** | `/submit` | ✅ **有效（200）** | 粘贴仓库 URL → 点 Inspect |
| **awesome-dsh-plugin** | `/submit` | ❌ 404 | **打标签自动收录** |
| **dshopen.org** | `/submit` | ❌ 404 | **提 PR 到 `polang233/dsh-plugin-index`** |

### dshmarketplace.dev 的实际操作（实测原文）

> **「Paste the repository URL and we will read its public metadata before you commit to anything」**

**步骤：**
1. 粘贴仓库 URL（如 `https://github.com/你的用户名/dsh-sales-script`）
2. 点「Inspect repository」
3. 它会读取公开元数据
4. 确认后提交

**⚠️ 限制（实测原文）：「Private, archived and disabled projects cannot be listed.」**

## 六、⭐⭐⭐ 完整操作顺序（优化后，比原来快）

```
第1步：准备（30 分钟）
  ├─ package.json 补 author/files/engines
  ├─ README 加分类 + 权限 + 兼容性
  └─ 三个插件都改好

第2步：建仓库 + 打标签（30 分钟）
  ├─ 建 3 个 GitHub 仓库（公开）
  ├─ git push
  └─ gh repo edit --add-topic dsh-plugin（三个都打）

第3步：发 npm（15 分钟）
  └─ 三个都 npm publish --access public

第4步：等自动收录（1-7 天）
  ├─ dshmarketplace.dev 下次同步自动收录
  └─ awesome-dsh-plugin 抓取后进 RSS

第5步：主动提交 2 个（20 分钟）
  ├─ dsh-plugin.org/submit（按模板格式）
  └─ dshmarketplace.dev/submit（粘 URL）

第6步：提 PR 到 dshopen（15 分钟）
  └─ github.com/polang233/dsh-plugin-index

第7步：投稿日报（20 分钟）
  └─ 3 家公众号
```

**总计：约 2 小时（比原来的逐个提交省一半时间）。**

## 七、⭐ 各站额外发现

### dsh-plugin.org 有 11 个分类

实测提到「which of the 11 categories」。分类列表需在站内看，我们的插件应选：

| 插件 | 建议分类 |
|---|---|
| 销售 | Productivity / Business |
| HR | Productivity / Business |
| 律师 | Productivity / Legal |

### dshmarketplace.dev 提到「Featured」

> **「Want to be featured? Submit a pull request」**

**→ 想要精选位，提 PR 到 `awesome-dsh-plugin/awesome-dsh-plugin`。**

## 八、⭐⭐ 一个必须注意的点

### dsh-plugin.org 强调「Say exactly what changes」

> **原文：「Say exactly what changes after installing your DeepSeek Harness Plugin.」**

**→ 不要写「提升效率」这种空话，要写具体的：**

| ❌ 空话 | ✅ 具体 |
|---|---|
| 提升销售效率 | 客户说「太贵了」时，直接给 5 步应对话术 |
| 帮助 HR 工作 | 30 秒判断简历是否值得面试 |
| 法律助手 | 合同审查 7 大类 42 项清单，逐条打勾 |

## 九、数据说明

| 项 | 说明 |
|---|---|
| 实测站点 | 4 个提交页 |
| **有效的** | dsh-plugin.org、dshmarketplace.dev（200） |
| **404 的** | awesome-dsh-plugin、dshopen（/submit 不存在） |
| **自动收录** | dshmarketplace.dev 明确说打 topic 就够 |
| 未验证 | 自动收录实际需要多久、dshopen 的 PR 流程细节 |
