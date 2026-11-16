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

## 模型清单（2026-11-16 小红书配图专项横评后定稿）

> 横评口径：**小红书真实配图题材**（白猫封面 / 猫砂盆 / 猫爬架 / 四滩呕吐物并列 / 四种便便对照 / 药品静物 / 猫喝水），
> 3:4 画布，每个模型 7 个 prompt，全部人工看图复核。证据在 `D:\GitHub\qwen-bridge\bakeoff_xhs\`（含 `对照总图.png`）。

### ✅ 留用（按优先级，就是 providers.json 里的 order）

| 顺位 | 平台 · 模型 | 配置段 | 平均耗时 | 免费额度 | 判定 |
|---|---|---|---|---|---|
| 1 | **魔搭 · Tongyi-MAI/Z-Image-Turbo** | `modelscope_fast` | **8.8s** | 2000 次/天 | **主力**。细节遵循最好的一档，复杂并列指令（四种便便、四滩呕吐物）都能摆对位置；无角标；中文 prompt 直接吃 |
| 2 | **魔搭 · Qwen/Qwen-Image-2.1** | `modelscope` | 12.8s（**偶发排队 150–280s**） | 2000 次/天 | **质量天花板**。毛发/材质最真，复杂场景最稳；缺点是高峰期会卡 200 秒以上，所以排第二、并加了 240s 硬超时 |
| 3 | **智谱 · cogview-3-flash** | `zhipu` | 8.9s | 不限量 | **降级用**。单体物件（一只猫、一个猫砂盆）很好；**多目标并列指令会跑偏**（要四滩呕吐物 → 出一地乱泼）。带「AI生成」灰底胶囊角标，已能抹掉 |
| — | **DSH 远程网关** | 直接 `qwen_generate_image` | ~20s | 走插件 | **最省事的一条**。3:4 画布可用（1248×1664），不占魔搭额度，适合单张快速出图 |

### ❌ 淘汰（不进 order，或只在英文 prompt 下才可救）

| 平台 · 模型 | 实测问题 | 处理 |
|---|---|---|
| **Cloudflare · flux-1-schnell** | **中文 prompt 完全失效**：3 个 prompt × 3 次，要白猫 → 出古风建筑/雪山庙宇/灯笼夜景，与描述毫无关系。换英文 prompt 立刻正常（白猫正确） | 已加 `has_cjk()` 守卫：**中文 prompt 直接跳过**，只在英文时兜底 |
| **Pollinations · flux** | 同样问题：中文 → 出人像少女（3/3 全错），英文才出猫。另有 45s/张硬限速 + 右下角 `pollinations.ai` 角标 | 已加同样的中文守卫；仅英文兜底 |
| **硅基流动 · Qwen/Qwen-Image** | 质量与魔搭 Qwen 相当，但 **0.3 元/张**（`siliconflow.enabled=false`） | 关闭 |
| **硅基流动 · Kolors** | 0.3 元/张；抽象概念（"毛球"）会画成一堆橙色绒球乱飞 | 关闭 |
| **魔搭 · Qwen/Qwen-Image（老版）** | 192–276 秒，3 次里 1 次超时，比 2.1 慢 20 倍还更差 | 不进 order |
| **DashScope（阿里云百炼）** | 0.25 元/张计费，已欠费停服 | 禁用 |

### 一句话结论

> **默认走 Z-Image-Turbo（快且准）→ Qwen-Image-2.1（要极致画质时手选）→ 智谱（额度用尽时降级）。**
> **flux 系（Cloudflare / Pollinations）在小红书场景等于不可用**——中文 prompt 会出完全无关的图，别让它接管。

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

**中文守卫（`has_cjk()`）**：prompt 里 CJK 字符 ≥4 个时，`gen_cloudflare` / `gen_pollinations` 直接抛异常跳过。
根因：flux-1-schnell 与 Pollinations 的 flux 用的是 CLIP 类文本编码器，中文 token 几乎无效，会退化成「随机插画」。
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
| **要极致画质 / 复杂多主体** | Qwen-Image-2.1 | 走 bridge：`modelscope`，`size="1242x1656"` |
| **要快的批量底图** | Z-Image-Turbo | 走 bridge：`modelscope_fast`，8.8s/张 |
| **额度全空** | cogview-3-flash | 走 bridge：`zhipu`，但**只下简单单体指令** |

### prompt 写法（这套模型吃这套，实测有效）

**结构：写实摄影 + 主体 + 动作 + 环境 + 光线 + 镜头 + 画质 + 禁止项**

```
写实摄影，一只白色长毛猫趴在浅色木地板上，侧面全身，放松表情，
室内自然光，居家客厅背景轻微虚化，毛发细节清晰，50mm 镜头，浅景深，
高清，画面无文字无水印。
```

四条硬规则：

1. **开头固定「写实摄影」** —— 不加这句会偏插画/3D 渲染。要真实感就用「写实摄影 / 真实宠物摄影」。
2. **禁止项要显式写**：「画面无文字无水印」能显著减少模型自己往上加字（实测智谱不加这句会加标语）。
3. **多目标并列必须写清顺序和数量**：「四团便便按从左到右排列：第一团…第二团…」Z-Image-Turbo 能摆对；**智谱做不到，别用它做对照表底图**。
4. **中文直接写，不要翻英文** —— 魔搭两家都吃中文；只有 flux 系需要英文，而 flux 系在小红书场景已淘汰。

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
| 让 **Cloudflare / Pollinations** 吃中文 prompt | 出完全无关的图（见上文横评） |
| 让 **智谱** 画多目标对照表 | 会把"四滩并列"画成一地乱泼 |
| 要 **2484×3312** 直接出图 | 超出所有上游上限，只会被放大糊掉 |

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

- **2026-11-16**：**小红书配图专项横评**，7 个模型 × 7 个真实题材全部实测看图。淘汰 flux 系（中文 prompt 出无关图），
  新增 `modelscope_fast`（Z-Image-Turbo）为主力、重排 order、加中文守卫 `has_cjk()`、加排队超时、
  加「灰底胶囊」角标抹除 `strip_pill_watermark()`、新增「小红书配图专用」整节
- **2026-11-09**：整合全部 6 个平台，实测 8 个模型，补跑 3 张被拦图片
- **2026-11-08**：添加 Cloudflare NSFW 规避逻辑
- **2026-11-07**：集成 ModelScope 和 Zhipu 免费源
- **2026-11-06**：初始版本，仅支持 Pollinations

---

**维护者**：QG(你)  
**最后更新**：2026-11-16  
**状态**：✅ 生产就绪（小红书配图已定稿）
