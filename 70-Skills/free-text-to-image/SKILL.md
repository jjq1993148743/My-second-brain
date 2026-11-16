---
name: free-text-to-image
description: DSH 免费文生图：按优先级链式调用多个平台，自动故障转移、负向词适配、水印抹除
whenToUse: 生成图片时、批量测试不同模型、需要快速原型图（不追求极致画质）
---

# 图像：免费文生图全链路

## 执行路由

用户要出图时，优先使用 `qwen_generate_image`（已集成）。它统一管理任务、故障转移、尺寸适配、水印处理；提示词类技能负责画面描述，执行仍走此工具。若本技能正文已经完整注入，不重复加载。

**重要提醒**：所有关键 API Key 均存在环境变量中，不会明文写入代码或配置。**每次刷新会话后自动生效**。

---

## 模型清单（2026-11-16 两轮实测后定稿）

> **重要更正**：第一轮横评用**中文 prompt 测了 flux 系**（Cloudflare / Pollinations），判它们"不可用"——
> 这是**测法错误**。flux 系本来就只吃英文。第二轮按"各模型用它原生支持的语种"重测，**flux 系在英文 prompt 下完全正常**，
> 而且**在插画 / 日系 / 胶片 / 黏土这几个风格上是第一名**。
>
> 结论从"淘汰 flux"改成：**按风格路由，中文 prompt 自动避开 flux**。
>
> 证据：`D:\GitHub\qwen-bridge\style_matrix\风格对照总图_全.png`（8 风格 × 5 模型 = 40 格全实拍）。

---

## ⭐ 风格 × 模型 路由表（这是本技能的核心，2026-11-16 实测）

同一题材（一只白猫 + 木地板），只换风格，逐格人工看图打分（0–3）。

| 风格 | 第一名 | 第二名 | 第三名 | 别用 |
|---|---|---|---|---|
| **真实风** | Qwen-Image-2.1 / Z-Image-Turbo / **flux-1-schnell**（并列 3） | 智谱 2 | Pollinations 2 | — |
| **插画风** | **flux-1-schnell**（3，最干净的矢量感） | Z-Image-Turbo（3，最可爱） | Qwen-2.1 / Pollinations（2） | 智谱 1（线条潦草、形体飘） |
| **科技风** | **flux-1-schnell**（3，光影最像电影） | Z-Image-Turbo（3） | Pollinations（3） | 智谱 2（发灰、像隔着玻璃） |
| **梵高风** | **Qwen-Image-2.1**（3，笔触最厚最像油画） | Z-Image-Turbo（3，星空构图最好） | flux（2） | Pollinations 1（只剩糊） |
| **水彩风** | **Qwen-Image-2.1**（3，晕染和纸纹最真） | Z-Image-Turbo / 智谱（2） | — | flux 系 1（做成数码绘） |
| **黏土 3D** | **flux-1-schnell / Pollinations**（3，玩具感最强） | Z-Image-Turbo（3，最精细） | Qwen-2.1（2） | 智谱 1（像磨砂石雕） |
| **日系清新** | **flux-1-schnell**（3，冷调漫射光最准） | Pollinations（3） | Z-Image-Turbo（2） | Qwen-2.1（1，出成普通居家照） |
| **复古胶片** | **flux-1-schnell**（3，颗粒和暖偏最像 Portra） | Z-Image-Turbo / 智谱 / Pollinations（2） | — | Qwen-2.1（1，太干净没有胶片味） |

**代码里就是 `bridge.py` 的 `STYLE_ROUTES`**，调用时给 `style` 参数即可自动换顺序。

### 三条从这张表里读出来的规律

1. **Qwen-Image-2.1 是「画」的冠军**：梵高、水彩这类需要真实颜料质感的，它明显强过其他所有模型。
2. **flux-1-schnell 是「风格化」的冠军**：插画、科技、日系、胶片四个第一，而且只要 3–5 秒（比魔搭快 3–20 倍）。
3. **Z-Image-Turbo 是「万能第二」**：八个风格里没有一次掉出前三，且中文英文都吃 —— 所以它是默认值，不是因为它最强，而是因为它最不挑。

### 中文 / 英文怎么选

| prompt 语种 | 会发生什么 |
|---|---|
| **中文** | flux 系（CF / Pollinations）分数自动归零，路由自动落到魔搭或智谱 |
| **英文** | 全部 5 个模型参与，按上表排序 |

想要某个风格的 flux 第一名？**把 prompt 写成英文**。这是唯一代价。

---

## 全模型清单与成本

| 平台 · 模型 | 配置段 | 耗时 | 免费额度 | 中文 | 角标 |
|---|---|---|---|---|---|
| **魔搭 · Z-Image-Turbo** | `modelscope_fast` | 8.8s（排队时 40–110s） | 2000 次/天 | ✅ | 无 |
| **魔搭 · Qwen-Image-2.1** | `modelscope` | 12.8s（偶发 150–280s） | 2000 次/天 | ✅ | 无 |
| **智谱 · cogview-3-flash** | `zhipu` | 8.9s | 不限量 | ✅ | 有，已自动抹 |
| **Cloudflare · flux-1-schnell** | `cloudflare` | **3.9s** | 10k neurons/天≈58 张 | ❌ | 无 |
| **Pollinations · flux** | `pollinations` | 6–46s | 45s/张限速 | ❌ | 有，已自动抹 |
| **DSH 远程网关** | 直接 `qwen_generate_image` | ~20s | 走插件 | ✅ | 无 |
| 硅基流动 Qwen / Kolors | — | — | **0.3 元/张** | ✅ | 已关闭 |
| DashScope | — | — | **0.25 元/张** | ✅ | 已禁用 |

### 一句话结论

> **默认 Z-Image-Turbo（最不挑、中文英文都吃）；要某种风格就查上表给 `style`；
> 要画意（梵高/水彩）用 Qwen-Image-2.1；要快和风格化（插画/科技/日系/胶片）用 flux + 英文 prompt。**

---

## 技术实现细节

### 架构设计

```
[用户 prompt] → bridge.py (故障转移逻辑)
                     ↓
          ┌────────────┴────────────┐
          ▼                         ▼
   [siliconflow]           [modelscope]
   [cloudflare]            [zhipu]
   [pollinations]          ...
```

**故障转移顺序**（2026-11-16 按小红书横评结果重排）：

1. modelscope_fast（Z-Image-Turbo，8.8s，细节遵循最好）
2. modelscope（Qwen-Image-2.1，质量天花板，会排队）
3. zhipu（cogview-3-flash，不限量降级）
4. cloudflare（**仅英文 prompt**，中文自动跳过）
5. pollinations（**仅英文 prompt**，中文自动跳过，兜底）

> 注意：这条 `order` 只是**没指定 style 时**的兜底顺序。**指定了 style 就走 `STYLE_ROUTES`**，那条链和 order 无关。

### 风格路由（`generate_style`）

```json
POST /v1/images/generations
{"prompt": "...", "size": "768x1024", "style": "梵高"}
```

| 入参 `style` | 认得的写法 |
|---|---|
| 真实 | `真实` `写实` `摄影` `真实风` `photo` `real` |
| 插画 | `插画` `插画风` `矢量` `flat` `illustration` |
| 科技 | `科技` `科技风` `科幻` `scifi` `tech` |
| 梵高 | `梵高` `梵高风` `油画` `vangogh` `oil` |
| 水彩 | `水彩` `水彩风` `watercolor` |
| 黏土 | `黏土` `黏土风` `3d` `clay` `claymation` |
| 日系 | `日系` `日系风` `清新` `airy` `japanese` |
| 胶片 | `胶片` `胶片风` `复古` `film` `vintage` `retro` |

返回体里带 `"style": "梵高"` 与 `"provider": "modelscope"`，可以核对实际走了谁。

**中文守卫（`has_cjk()`）**：prompt 里 CJK 字符 ≥4 个时，`gen_cloudflare` / `gen_pollinations` 直接抛异常跳过；
`generate_style` 里还会把这两个的分数归零，路由自动降级到中文模型。
根因：flux-1-schnell 与 Pollinations 的 flux 用 CLIP 类文本编码器，中文 token 几乎无效，会退化成「随机插画」。
实测证据：要"白猫趴在木地板" → CF 出古风雪山庙宇、Pollinations 出旗袍少女，3/3 全错；同 prompt 换英文立刻正确。

### 核心功能

- **多源切换**：任一上游成功即返回
- **中文守卫**：flux 系上游遇中文 prompt 直接跳过（见上）
- **尺寸适配**：各平台只认特定分辨率（1024×1024, 768×1344 等），自动吸附到最近档位
- **负向提示词**：不同平台接受方式不同（有的不支持 negative_prompt）
- **NSFW 规避**：对 Cloudflare 的审核关键词自动改写（如"呕吐→刚吐完"）
- **水印抹除**：两种角标两种算法 —— 智谱/硅基的「灰底胶囊 + AI生成」用 `strip_pill_watermark()` 取最大低饱和连通块的外接矩形整体 inpaint；Pollinations 的 `pollinations.ai` 用 `strip_watermark(box=...)`。**只抠白字会留灰块**，必须整体覆盖
- **排队超时**：`modelscope` / `modelscope_fast` 各带 `timeout_sec`（240 / 120），排队超时就放弃、交给下一个上游，不占死整条链
- **断点续传**：失败重试最多 5 次，间隔随机
- **进度日志**：实时记录每个请求的响应时间、文件大小、失败原因

---

## 环境配置

### 密钥保险箱（vault.enc）—— 换机后从这里取

**密钥不在仓库里明文存放**，全部加密进 `vault.enc`（AES-256-GCM + scrypt）。

换到新电脑后，第一步是把 vault 解开：

```bash
cd 70-Skills/free-text-to-image

# 交互输入口令
python vault.py decrypt

# 或从环境变量（适合脚本）
$env:QWEN_VAULT_PASS = "<口令>"
python vault.py decrypt
```

成功后会在同目录生成 `providers.json`（含全部 API Key），把它拷到桥接目录：

```powershell
Copy-Item providers.json D:\GitHub\qwen-bridge\providers.json -Force
```

其他命令：

| 命令 | 作用 |
|---|---|
| `python vault.py status` | 查看 vault 状态（不解密） |
| `python vault.py show` | 解密后只打印，不落盘 |
| `python vault.py encrypt` | 把 providers.json 加密回 vault.enc |

**依赖**：`pip install cryptography`

**安全说明**：
- 口令不写入任何文件，只在内存中用于派生密钥
- 口令错误时 GCM 校验失败，直接拒绝，不会输出半截数据
- scrypt(N=32768, r=8, p=1) 让暴力破解代价极高
- 解出的 `providers.json` 记得加进 `.gitignore`，不要提交

### 方法 B：直接配 providers.json（如果你不想用 vault）

```json
{
  "port": 19500,
  "api_key": "",
  "order": ["siliconflow", "modelscope", "zhipu", "cloudflare", "pollinations"],
  "siliconflow": {
    "enabled": true,
    "api_key": "<硅基流动 key>",
    "model": "Kwai-Kolors/Kolors",
    "base": "https://api.siliconflow.cn/v1",
    "steps": 20
  },
  "modelscope": {
    "enabled": true,
    "api_key": "<魔搭 token>",
    "model": "Qwen/Qwen-Image-2.1",
    "base": "https://api-inference.modelscope.cn/v1"
  },
  "zhipu": {
    "enabled": true,
    "api_key": "<智谱 key>",
    "model": "cogview-3-flash",
    "base": "https://open.bigmodel.cn/api/paas/v4"
  },
  "cloudflare": {
    "enabled": true,
    "account_id": "<Cloudflare Account ID>",
    "api_token": "<Cloudflare API Token>",
    "model": "@cf/black-forest-labs/flux-1-schnell"
  },
  "pollinations": {
    "enabled": true,
    "min_interval": 46
  }
}
```

**纯免费模式**（去掉硅基流动）：

```json
"order": ["modelscope_fast", "modelscope", "zhipu", "cloudflare", "pollinations"]
"siliconflow": { "enabled": false }
```

**小红书默认配置**（2026-11-16 起用这个）：

```json
{
  "order": ["modelscope_fast", "modelscope", "zhipu", "cloudflare", "pollinations", "siliconflow"],
  "modelscope_fast": {
    "enabled": true,
    "api_key": "<与 modelscope 同一个魔搭 token>",
    "model": "Tongyi-MAI/Z-Image-Turbo",
    "base": "https://api-inference.modelscope.cn/v1",
    "timeout_sec": 120
  },
  "modelscope": {
    "enabled": true,
    "api_key": "<魔搭 token>",
    "model": "Qwen/Qwen-Image-2.1",
    "base": "https://api-inference.modelscope.cn/v1",
    "timeout_sec": 240
  }
}
```

> `modelscope_fast` 与 `modelscope` **共用同一个 token**，只是换模型名。
> `timeout_sec` 必须写 —— Qwen-Image-2.1 高峰期会卡 200 秒以上，不设上限会把整条链拖死。

---

## 常见踩坑记录

### 1. Cloudflare NSFW 拦截

原本用 `"white cat vomiting on wooden floor"` 直接返回 400 Bad Request。

错误日志：
```json
{"errors":[{"message":"AiError: Input prompt contains NSFW content.","code":8007}]}
```

**解决方案**：把"正在呕吐"改成"刚吐完 / 已经完成呕吐"，避开实时动作描述：

```text
Photorealistic photo, white long-haired cat on light wooden floor, 
side view, full body, uncomfortable expression, 
greenish-yellow puddle with small wet hairballs in front of it, 
indoor natural light, clean home environment, sharp details, no text
```

桥里实现了自动检测 + 改写。

### 2. DashScope 不是免费的！

之前误导说"DashScope 新用户 token 包"，其实是按张计费：

| 模型 | 价格 |
|------|------|
| qwen-image-2.1-pro | **0.25 元/张** |
| qwen-image-2.1-turbo | 0.10 元/张 |
| wanx2.1-t2i-turbo | 0.14 元/张 |

**结论：完全收费，已禁用。**

### 3. 魔搭必须绑定阿里云账号

官方文档："免费推理 API 由阿里云提供算力支持"。

如果阿里云欠费，魔搭的免费额度也可能被暂停。**建议结清欠费**，否则影响整个流程。

### 4. Pollinations 有硬限速

- 无 key：**每 IP 每 45 秒 1 张**
- 换算：**~1900 张/天**
- pollen key 才能解除

适合兜底用。

### 5. 角标抹除：固定区域 inpaint，不要做自动检测（踩了 4 版）

智谱与 Pollinations 的角标位置**完全固定**，实测在 `(0.686, 0.913) – (0.988, 0.994)` 相对坐标，
且**不随画幅比例变**（768×1024 与 768×1344 一致）。四版试错过程：

| 版本 | 做法 | 结果 |
|---|---|---|
| v1 | 检测低饱和 + 比中位数亮的像素 | 亮底只剩灰胶囊壳，字没了壳还在 |
| v2 | 取最大低饱和连通块的外接矩形 | 暗底（科技风）误检整片地面，把地板抹花 |
| v3 | 锁定右下角窄条 + 低饱和 | 窄条里有白墙/浅色地板就整条命中 |
| **v4（定稿）** | **固定矩形整块 inpaint（约 232×83 px，半径 14）** | 六种风格全部干净，痕迹不可见 |

**教训**：位置固定就别猜。自动检测只会把"猜错"的风险引入到用户成品里。

### 6. 智谱的 `watermark_enabled: false` 无效

请求体带 `"watermark_enabled": false` 后返回 200 且带图片，**角标照样在**。
不要在参数上找解法，直接走 v4 的后处理。

### 7. 别用中文 prompt 判 flux 系死刑（第一轮横评的错）

第一轮我用中文 prompt 测 Cloudflare / Pollinations，它们出了古风建筑和旗袍少女，我判它们"不可用"。
**这是测法错误**：flux-1-schnell 的文本编码器不吃中文，这不是模型缺陷，是语言不匹配。
第二轮换成英文 prompt，flux 在**插画 / 科技 / 日系 / 胶片四个风格上拿了第一**，而且只要 3–5 秒。

**教训**：横评必须让每个模型用它原生支持的语种，否则测的是"语言匹配"不是"模型能力"。

---

## 小红书配图专用（2026-11-16 新增）

> 服务 `40-产出/主题/猫病症自查百科/`。**这一节是给小红书配图用的，别再按通用文生图走。**

### 画布

| 项 | 值 | 依据 |
|---|---|---|
| 主推 | **1242×1656（3:4）** | `xhs-cat-symptom-SKILL` v2.0 与 `xhs-viral-note-SKILL` 一致 |
| @2x | 2484×3312 | 只用于 HTML 渲染截图，**AI 生图别直接要这个尺寸** |
| 实测 | 魔搭 / 智谱 / 本插件都能直接出 1242×1656，不会被裁 | 2026-11-16 实测 |

### 一句话决策

| 你要什么 | 用哪个 | 怎么调 |
|---|---|---|
| **默认**（绝大多数配图） | Z-Image-Turbo | `qwen_generate_image`，`width=1248 height=1664`（16 的倍数），走远程网关 |
| **要某种风格** | 查 §风格×模型路由表 | 走 bridge，body 加 `"style": "插画"` 等，自动选模型 |
| **要画意（梵高 / 水彩）** | Qwen-Image-2.1 | 走 bridge：`"style": "梵高"` → 自动路由到 `modelscope` |
| **要快 + 风格化（插画/科技/日系/胶片）** | flux-1-schnell | 走 bridge：**prompt 写英文** + `"style": "插画"` → 自动路由到 `cloudflare`，3–5 秒 |
| **要极致画质 / 复杂多主体** | Qwen-Image-2.1 | 走 bridge：`modelscope`，`size="1242x1656"` |
| **额度全空** | cogview-3-flash | 走 bridge：`zhipu`，但**只下简单单体指令** |

### prompt 写法（这套模型吃这套，实测有效）

**结构：风格锚点 + 主体 + 动作 + 环境 + 光线 + 镜头 + 画质 + 禁止项**

```
写实摄影，一只白色长毛猫趴在浅色木地板上，侧面全身，放松表情，
室内自然光，居家客厅背景轻微虚化，毛发细节清晰，50mm 镜头，浅景深，
高清，画面里没有任何文字、字母、数字、水印、logo、签名、边框。
```

#### 七条硬规则（每条都有实测依据）

| # | 规则 | 为什么 |
|---|---|---|
| 1 | **第一个词必须是风格锚点** | `写实摄影` / `扁平矢量插画` / `梵高后印象派油画` / `日系清新风格摄影` / `3D 黏土定格动画`。不放锚点，模型会默认走「摄影」，风格再怎么说都拉不回来 |
| 2 | **风格锚点要带「谁+什么体裁」** | 只写「油画」会出数码绘；写「梵高后印象派油画，厚涂颜料肌理，笔触可见」才对。只写「插画」会出半写实；写「扁平矢量插画，大块纯色，干净轮廓线，无渐变无阴影」才对 |
| 3 | **禁止项写全，尤其禁止文字** | 结尾固定加：`画面里没有任何文字、字母、数字、水印、logo、签名、边框。`（英文：`No text, no letters, no numbers, no words, no watermark, no logo, no signature, no border.`）实测不加这句，智谱和 flux 会自己往上加标语 |
| 4 | **多目标并列必须写「数量 + 顺序 + 每个的差异」** | 例：「四团便便按从左到右排列：第一团成形坚硬表面干燥，第二团成形但表面略湿，第三团软塌堆叠，第四团完全液态摊平」。Z-Image-Turbo 能全摆对；智谱会乱 |
| 5 | **中文模型直接写中文，flux 写英文** | 不要给魔搭/智谱翻英文（会掉细节）；也不要给 flux 写中文（会出无关图） |
| 6 | **不要堆砌形容词** | 「超高清、极致细节、8K、杰作、最佳质量」这类对这三个模型基本无效，反而挤掉真实描述的位置。把预算花在**具体名词**上（材质、光线方向、镜头焦段） |
| 7 | **一个 prompt 只讲一个画面** | 想要「对照表」就分四张图各出一格再拼，不要指望一张图里放四种状态还都对 |

#### 风格 prompt 模板（直接抄）

| 风格 | 中文模板（魔搭/智谱） | 英文模板（flux 系） |
|---|---|---|
| **真实** | 写实摄影，{主体}，{动作}，室内自然光从左侧照入，50mm 镜头，浅景深，毛发/材质细节清晰，真实摄影质感，高清。+禁止项 | Photorealistic photograph, {subject}, {action}, natural window light from the left, 50mm lens, shallow depth of field, sharp material detail, high resolution. +no-text |
| **插画** | 扁平矢量插画，{主体}，大块纯色、干净利落的轮廓线、无渐变无阴影渲染，柔和米色与奶油色调，构图简洁留白。+禁止项 | Flat vector illustration, {subject}, large solid color blocks, clean crisp outlines, no gradients, no shading, soft cream palette, simple composition with negative space. +no-text |
| **科技** | 科幻科技风格，{主体}，身体轮廓有青色和蓝色发光边缘光，深空色背景配细线网格与漂浮光点，全息投影质感，冷色调高对比。+禁止项 | Futuristic sci-fi tech style, {subject}, glowing cyan and electric blue rim light, dark background with thin wireframe grid and floating particles, holographic texture, cold palette, high contrast. +no-text |
| **梵高** | 梵高后印象派油画风格，{主体}，厚重旋转的笔触、厚涂颜料肌理、漩涡状流动感，明黄与深蓝强烈对比，油画布纹理。+禁止项 | Van Gogh post-impressionist oil painting, {subject}, thick swirling brushstrokes, heavy impasto texture, rhythmic movement, vivid yellow against ultramarine blue, visible canvas grain. +no-text |
| **水彩** | 水彩画风格，{主体}，透明水色晕染、边缘柔和渗化、留白处透出纸白，淡雅灰蓝与米色，粗糙水彩纸纹理。+禁止项 | Watercolor painting, {subject}, translucent washes, soft bleeding edges, unpainted white paper showing, muted grey-blue and cream, rough cold-press paper grain. +no-text |
| **黏土** | 3D 黏土定格动画风格，{主体}，柔软黏土质感、可见的捏塑痕迹、圆润造型，柔和棚拍布光，微距浅景深。+禁止项 | 3D claymation stop-motion style, {subject}, soft modelling clay with visible fingerprint marks, rounded proportions, soft studio lighting, macro shallow depth of field. +no-text |
| **日系** | 日系清新风格摄影，{主体}，柔和漫射光、低对比、高明度、青绿色调偏冷，浅景深，干净留白。+禁止项 | Japanese airy photography, {subject}, soft diffused light, low contrast, high key, cool cyan-green cast, shallow depth of field, clean negative space. +no-text |
| **胶片** | 复古胶片摄影风格，{主体}，柯达 Portra 400 质感、明显颗粒、暖黄色偏、轻微漏光、褪色阴影。+禁止项 | Vintage analog film photography, {subject}, Kodak Portra 400 look, visible grain, warm yellow cast, slight light leak, faded shadows. +no-text |

> 用 `qwen_generate_image`（远程网关）时它不吃 `style` 参数，把风格锚点写进 prompt 开头即可，效果一样。

### 分工：AI 生图 vs 真猫素材

| 用途 | 用什么 | 原因 |
|---|---|---|
| **封面主角** | **必须用 `素材库/啤酒/` 的真猫照片** | 爆款封面要真实照片（`xhs-viral-note` L157 硬规则），AI 猫会被老用户看出来 |
| **症状特写**（呕吐物、便便） | **真素材优先**：beer-03/04/05（呕吐）、beer-14/16/17/18/20（便便） | 真实感决定可信度，这类图 AI 生成反而不如实拍 |
| **环境/道具**（猫砂盆、猫爬架、药品、水碗） | **AI 生成** | 实拍里没有，AI 出图干净可控 |
| **对照表底图**（5 种便便、4 滩呕吐物颜色） | **AI 生成 + 后期加标注** | Z-Image-Turbo 能按顺序摆对；比实拍拼图快得多 |
| **信息图/表格** | **不用 AI** | 走 HTML + headless 截图（`render.py`），AI 出不了准确文字 |

### 出图后必做

1. **看图复核**（`read_image`）：主体对不对、有没有多余肢体、有没有自带文字、有没有角标残留
2. **角标检查**：智谱/Pollinations 的角标已自动抹；魔搭与远程网关本来就没有
3. **裁剪到 3:4**：如果模型给的构图偏了，宁可裁也别拉变形（`xhs-viral-note` L185 规则）
4. **存档**：成品进 `成果物/<期号>/图/`，底图进 `素材库/`

### 已知不可用（别浪费时间）

| 场景 | 为什么不行 |
|---|---|
| 让 AI 画**文字/数字**（标题字、24/48/72 小时卡片） | 会出乱码字形。文字一律走 HTML 渲染 |
| 给 **Cloudflare / Pollinations** 写中文 prompt | 出完全无关的图。要它们的风格就把 prompt 翻成英文 |
| 让 **智谱** 画多目标对照表 | 会把"四滩并列"画成一地乱泼 |
| 要 **2484×3312** 直接出图 | 超出所有上游上限，只会被放大糊掉 |
| 靠 `watermark_enabled: false` 去角标 | 智谱不认这个参数，走 v4 后处理 |

### 小红书风格选择建议

| 内容类型 | 推荐风格 | 理由 |
|---|---|---|
| 症状特写、封面 | **真实风**（但优先用真猫照片） | 可信度第一 |
| 科普图解、清单页 | **插画风**（flux + 英文） | 干净、不抢文字，后期加标注好看 |
| 数据/前沿话题（如肾病指标） | **科技风** | 冷色调有专业感 |
| 情绪向 / 治愈向（猫的日常） | **日系清新** | 小红书最主流的审美底色 |
| 怀旧 / 故事向（"我养猫这些年"） | **复古胶片** | 有人情味，适合叙事型笔记 |
| 儿童向 / 轻松科普 | **黏土 3D** | 最讨喜，转发率高 |
| 艺术化栏目（少见，慎用） | **梵高 / 水彩** | 好看但会削弱"实用"信号，别用在正文页 |

---

生成的图片统一存到：

```
C:\Users\jjq21\.dsh\qwen-studio\images\<task_id>\image.png
```

同时会在图库中自动入库，并附加到当前对话中。

---

## 扩展玩法

### 批量对比同一 prompt

脚本位置：`D:\GitHub\qwen-bridge\compare.py`

可一次跑 8 个模型 × 3 个机位 = 24 张图，并生成对照 HTML：

```python
import bridge
cfg = bridge.load_config()
png = bridge.gen_siliconflow(cfg, "a cozy bookstore cafe", 1024, 1024, seed=123)
```

### 自动抹水印

内置 OpenCV inpaint 功能，针对智谱和硅基流动的右下角角标自动修复：

```python
img = strip_silicon_watermark(img, box=(0.845, 0.922, 1.0, 1.0))
```

---

## 更新历史

- **2026-11-16（第二轮·风格矩阵）**：**纠正第一轮的测法错误** —— flux 系不是不能用，是只吃英文。
  8 风格 × 5 模型 = 40 格全实测（`style_matrix/风格对照总图_全.png`），
  新增 `STYLE_ROUTES` 风格路由（`generate_style` + HTTP `style` 参数）、
  角标抹除定稿为 v4 固定区域 inpaint、prompt 规则从 4 条扩到 7 条 + 8 个风格模板
- **2026-11-16（第一轮）**：小红书配图专项横评，7 模型 × 7 题材。新增 `modelscope_fast`、中文守卫、排队超时
- **2026-11-09**：整合全部 6 个平台，实测 8 个模型，补跑 3 张被拦图片
- **2026-11-08**：添加 Cloudflare NSFW 规避逻辑
- **2026-11-07**：集成 ModelScope 和 Zhipu 免费源
- **2026-11-06**：初始版本，仅支持 Pollinations

---

**维护者**：QG(你)  
**最后更新**：2026-11-16  
**状态**：✅ 生产就绪（8 风格路由 + 小红书配图已定稿）
