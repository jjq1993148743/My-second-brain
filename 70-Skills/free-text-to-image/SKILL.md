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

## 可用模型与成本（2026-11-09 实测）

| 平台 | 模型 | 是否免费 | 额度/价格 | 平均耗时 | 画质评分 |
|------|------|----------|-----------|----------|----------|
| **智谱 CogView-3-Flash** | cogview-3-flash | ✅ 真免费 | 不限量 | ~11s | ⭐⭐⭐ |
| **魔搭 ModelScope** | Qwen/Qwen-Image-2.1<br>Qwen/Qwen-Image<br>Tongyi-MAI/Z-Image-Turbo | ✅ 真免费 | 2000 次/天，单模型 500 次 | ~11–54s | ⭐⭐⭐⭐ |
| **Cloudflare Workers AI** | @cf/black-forest-labs/flux-1-schnell | ✅ 免费额度 | 10k neurons/天≈58 张/天 | ~4s | ⭐⭐⭐⭐ |
| **Pollinations** | flux | ✅ 真免费 | 无限制，45s/张限速 | ~33s | ⭐⭐⭐ |
| **硅基流动** | Kwai-Kolors/Kolors | ⚠️ 赠金体验 | 14 元新用户赠金 ≈ 46 张 | ~6s | ⭐⭐⭐⭐⭐ |

**禁用平台**：DashScope（阿里云百炼）—— 实际按 0.25 元/张计费，已欠费停服。

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

**故障转移顺序**（可按需调整）：

1. siliconflow（速度快，质量不错）
2. modelscope（真免费，额度够用）
3. zhipu（真免费，不限量）
4. cloudflare（速度快，额度有限）
5. pollinations（兜底，限速 45s/张）

### 核心功能

- **多源切换**：任一上游成功即返回
- **尺寸适配**：各平台只认特定分辨率（1024×1024, 768×1344 等），自动吸附到最近档位
- **负向提示词**：不同平台接受方式不同（有的不支持 negative_prompt）
- **NSFW 规避**：对 Cloudflare 的审核关键词自动改写（如"呕吐→刚吐完"）
- **水印抹除**：OpenCV inpaint 自动抹掉右下角"AI 生成"角标
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
"order": ["modelscope", "zhipu", "cloudflare", "pollinations"]
"siliconflow": { "enabled": false }
```

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

## 输出格式

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

- **2026-11-09**：整合全部 6 个平台，实测 8 个模型，补跑 3 张被拦图片
- **2026-11-08**：添加 Cloudflare NSFW 规避逻辑
- **2026-11-07**：集成 ModelScope 和 Zhipu 免费源
- **2026-11-06**：初始版本，仅支持 Pollinations

---

**维护者**：QG(你)  
**最后更新**：2026-11-09  
**状态**：✅ 生产就绪
