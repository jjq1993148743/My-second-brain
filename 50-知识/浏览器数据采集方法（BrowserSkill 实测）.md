---
date: 2026-09-28
time: 17:24
place: 家里
tags: [创业, 小点子, 待验证, 重点]
---

**可复用的浏览器数据采集方法**：用 BrowserSkill 读列表页/评论区的完整数据。核心是三个动作——先 `observe` 摸清容器结构，再用 `evaluate` 跑 JS 一把抠出全部数据，遇到滚动懒加载就循环 `scrollTop = scrollHeight` 直到计数不再增长。

这解决了"页面看着有内容但读不全"的问题。下面记录已验证的实操细节和踩坑点。

---

## 一、这套方法解决什么问题

把网页上**可见但读不全**的结构化数据完整提取出来。

典型场景：列表页、评论区、商品评价、导航站目录——这些页面往往有两大障碍：
1. **懒加载**：不滚动就不渲染，DOM 里根本没有
2. **可见区域陷阱**：直接读文本（`innerText`）只返回当前视口内的内容，看不到的读不出来

## 二、标准流程（四步）

### 第 1 步：`observe` 摸结构

```bash
bsk navigate "<URL>" --session <id>
bsk observe --session <id>
```

`observe` 返回语义化树，用来**判断页面上有什么**、目标数据在哪个区域。

### 第 2 步：`evaluate` 探容器

不要猜 class 名，直接列出来：

```js
// 枚举所有含关键词的 class，看哪个是数据容器
[...document.querySelectorAll('*')]
  .filter(e => /comment|item|card|list/i.test((e.className||'').toString()))
```

⚠️ **同名容器可能有多个**，必须用索引区分。实测天猫评论页有两个 `div.comments--xxx`：
- `[0]` 是页面底部的预览区（只有 2 条）
- `[1]` 才是真正的弹窗容器（246 条）

**判断方法**：对比 `scrollHeight` 和 `clientHeight`，大的那个才是真货。

### 第 3 步：`evaluate` 一把抠数据

```js
(() => {
  const out = [];
  document.querySelectorAll('div.nav-list').forEach(box => {
    const cat = box.querySelector('h2')?.textContent.trim();
    box.querySelectorAll('li.nav-box').forEach(li => {
      out.push({
        cat,
        name: li.querySelector('h3')?.textContent.trim(),
        desc: li.querySelector('p')?.textContent.trim(),
        url: li.querySelector('a[data-url]')?.dataset.url,
      });
    });
  });
  return JSON.stringify({ count: out.length, data: out });
})()
```

**一条 JS 抠完，比 `observe` 逐条读快几十倍。**

⚠️ **JS 写成一整行更稳** —— 多行断句曾导致 `SyntaxError: Unexpected token 'if'`。

### 第 4 步：处理懒加载（关键）

如果 `scrollHeight > clientHeight`，说明容器内还有内容没渲染。

**三种滚动方式，只有一种通用有效**：

| 方式 | 结果 |
|---|---|
| `bsk wheel --selector` | ❌ 对 React 容器无效，计数不变 |
| `c.scrollTop = c.scrollHeight` 直接赋值 | ❌ 被 React 接管，读回仍是 0 |
| **`c.style.overflowY='auto'; c.scrollTop=c.scrollHeight`** | ✅ **有效** |

**循环模板**：

```js
// 每轮：读当前计数 → 滚到底 → 等加载
const c = [...document.querySelectorAll('[class*=comments--xxx]')][1];
const n = c.querySelectorAll('[class*=Comment--xxx]').length;
c.style.overflowY = 'auto';
c.scrollTop = c.scrollHeight;
return n;
```

配 `bsk wait-ms 1300` 等加载，然后重复。

**到底判据（双重确认）**：
1. `scrollTop + clientHeight >= scrollHeight - 20`（滚到底了）
2. 连续多轮计数不再增长（实测连续 15 轮无新增）

## 三、实测战果

### 案例 A：imyshare.com 导航站（公开站，无登录）

| 项 | 结果 |
|---|---|
| 规模 | **43 个分类 / 2601 个站点** |
| 耗时 | 约 90 秒（含人工判断），机器实际执行 ~30 秒 |
| 踩坑 | **页面防爬：真实链接 base64 存在 `data-url` 属性，`href` 是空的** |
| 解法 | `atob(a.dataset.url)` 还原 |

**这个坑值得记**：如果只抓 `href`，会拿到一堆空值。真实链接藏在 `data-url` 里。

### 案例 B：天猫商品页评论（登录态）

| 项 | 结果 |
|---|---|
| 商品 | vivo X500 Pro Max（¥6999 起） |
| 规模 | **246 条完整评论** |
| 数据维度 | 用户ID / 日期 / 购买规格 / 点赞数 / 回复数 / 正文 / 追评 / 商家回复 |
| 滚动加载 | 每轮 +20 条，6 轮从 20 → 246 |
| 派生洞察 | 配色：晴天 108 / 大地回声 74 / 览霞 45 / 摄夜 19；商家回复率 47%；追评 16 条 |

**插曲**：抓到的评论里有一条明显是 AI 生成的——正文末尾留着"需要我帮你微调字数精准卡330字，更适合发评价平台吗？"，提词器没删干净就粘上来了。

顺带发现：**直接读 `innerText` 只会返回可见区域的 20 条**，必须滚动才能拿到全部 246 条。这是最容易踩的坑——**别把"我没读到"当成"页面没有"**。

## 四、踩坑清单

| 坑 | 现象 | 解法 |
|---|---|---|
| **可见区域陷阱** | 只读到 20 条，实际有 246 条 | 先对比 `scrollHeight` / `clientHeight`，可滚动就必须滚 |
| **同名容器** | 拿到 2 条而不是 246 条 | 用索引 `[1]` 挑 `scrollHeight` 大的那个 |
| **滚动无效** | `scrollTop` 读回 0 | 先设 `style.overflowY='auto'` 再赋值 |
| **base64 链接** | 抓到的 URL 全是空 | 检查 `data-url` 属性，用 `atob()` 解码 |
| **中文乱码** | 终端显示乱码 | 是终端编码问题，**写入文件是正确的 UTF-8** |
| **路径问题** | node 报 ENOENT | 输出重定向必须用工作区内路径，`/tmp` 在 Git Bash 下会解析成 `c:\tmp` |
| **JS 语法错误** | `SyntaxError: Unexpected token 'if'` | `evaluate` 的 JS 写成一整行 |

## 五、命令速查

```bash
bsk session start --no-focus --json        # 开会话（不抢焦点）
bsk navigate "<URL>" --session <id>         # 打开页面
bsk observe --session <id>                  # 语义化看页面（结构侦察）
bsk evaluate "<JS>" --session <id>          # 执行 JS（提取数据的主力）
bsk scroll-to --selector "<sel>" --session <id>   # 滚元素进视口
bsk wheel --delta-y 500 --session <id>      # 原生滚轮事件
bsk wait-ms 1300                            # ⚠️ 不接受 --session 参数
bsk session stop <id>                       # 收工归还标签页
```

**注意事项**：
- 同一 session 内命令**必须串行**，并行会报 `previous session command is still running`
- `--session` 几乎每条都要显式带
- daemon 被 WorkBuddy 沙箱的 Job Object 拦截时，用后台任务跑 `bsk daemon start --foreground`

---

## 相关

- [[浏览器自动化方案候选，待试验]]
- [[AGENTS]] §0.1 采集纪律
