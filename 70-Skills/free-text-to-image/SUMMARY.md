# free-text-to-image Skill 总结

## 核心功能

**一句话**：用户说"画一张猫"，系统自动按优先级试遍所有可用平台（硅基流动→魔搭→智谱→Cloudflare→Pollinations），哪个能出图就返回哪个，不用管后台怎么切换。

支持：故障转移、负向词适配、NSFW 规避、水印抹除、批量横评。

---

## 平台对照表（2026-11-16 两轮实测后）

> **第一轮判错过**：用中文 prompt 测 flux 系，它们出了无关图，我判"不可用"。
> 第二轮换成英文重测，flux 在插画/科技/日系/胶片四个风格上**拿第一**。详见 SKILL.md 的「风格 × 模型路由表」。

| 平台 | 免费 | 耗时 | 中文 | 最擅长的风格 |
|---|---|---|---|---|
| **魔搭 Z-Image-Turbo** | ✅ 2000/天 | 8.8s | ✅ | 万能第二，八风格全在前三 |
| **魔搭 Qwen-Image-2.1** | ✅ 2000/天 | 12.8s（会排队） | ✅ | **梵高、水彩**（颜料质感最强） |
| **智谱 CogView-3-Flash** | ✅ 不限量 | 8.9s | ✅ | 单体真实风；多主体会跑偏 |
| **Cloudflare flux-1-schnell** | ✅ 58 张/天 | **3.9s** | ❌ | **插画、科技、日系、胶片**（四个第一） |
| **Pollinations flux** | ✅ 45s/张 | 6–46s | ❌ | 黏土 3D、科技 |
| **硅基流动 / DashScope** | ❌ 0.3 / 0.25 元每张 | — | ✅ | 已关闭 |

**核心结论**：没有"不行"的模型，只有"用错语言/用错风格"的组合。
要风格化 + 快 → flux（英文）；要画意 → Qwen-2.1；不挑 → Z-Image-Turbo。

---

## 风格路由（`STYLE_ROUTES`）

```bash
POST http://127.0.0.1:19500/v1/images/generations
{"prompt": "...", "size": "768x1024", "style": "梵高"}
```

八种风格：`真实` `插画` `科技` `梵高` `水彩` `黏土` `日系` `胶片`（也认英文别名）。
中文 prompt 时 flux 系自动退出路由，不会出无关图。

---

## API Key 存放方式

**全部加密在 `vault.enc`**（AES-256-GCM + scrypt），仓库里没有明文。

| 平台 | 状态 |
|------|------|
| 智谱 | 🔐 已加密 |
| 魔搭 | 🔐 已加密 |
| Cloudflare Token + Account | 🔐 已加密 |
| 硅基流动 | 🔐 已加密 |
| DashScope | 🔐 已加密（已欠费，禁用） |

换机后解封：

```bash
cd 70-Skills/free-text-to-image
python vault.py decrypt      # 输入口令
Copy-Item providers.json D:\GitHub\qwen-bridge\providers.json -Force
```

口令由 jjq 单独保管，不写进任何文件。

---

## 安装步骤

1. 将代码库部署到 `70-Skills/free-text-to-image`
2. `pip install cryptography` 然后 `python vault.py decrypt` 解开密钥
3. 启动桥接服务：`python bridge.py`
4. 注册为 DSH Skill（见 README.md）

---

## 快速调用

### 对话模式
直接对 DSH 说："画一只白色的猫在木地板上吐毛球，写实摄影风格"

### 程序化调用
```python
import bridge
cfg = bridge.load_config()
png = bridge.gen_siliconflow(cfg, "a cozy bookstore cafe", 1024, 1024, seed=123)
```

---

## 踩坑记录

1. **别用中文判 flux 死刑** → 第一轮的错。flux 只吃英文，换英文后它四个风格第一
2. **DashScope 不是免费的！** → 完全收费，已禁用
3. **魔搭必须绑定阿里云 + 实名** → 欠费可能导致失效
4. **Pollinations 有硬限速** → 45 秒/张，适合兜底
5. **智谱的多主体并列会跑偏** → 要"四滩呕吐物并排"会画成一地乱泼，对照表底图别用它
6. **Qwen-Image-2.1 会排队 200s+** → 必须设 `timeout_sec`
7. **角标位置固定，别做自动检测** → 试了 4 版，只有固定矩形 inpaint 在六种风格下都干净
8. **智谱 `watermark_enabled:false` 无效** → 参数不认，只能后处理

---

## 相关文件

- `SKILL.md` —— 完整使用手册（风格路由表 + 8 个 prompt 模板 + 小红书配图专用）
- `README.md` —— 快速上手指南
- `bridge.py` —— 核心桥接逻辑（`D:\GitHub\qwen-bridge\`），含 `STYLE_ROUTES` 与 `generate_style()`
- `D:\GitHub\qwen-bridge\style_matrix\风格对照总图_全.png` —— **8 风格 × 5 模型 = 40 格全实拍对照**
- `D:\GitHub\qwen-bridge\bakeoff_xhs\对照总图.png` —— 第一轮小红书题材横评
- `D:\GitHub\My-second-brain\50-知识\AI 工具\免费文生图接入方案 - 全汇总.md` —— 深度分析

---

**状态**：✅ 生产就绪（8 风格路由 + 小红书配图定稿）  
**维护者**：QG(你)  
**更新时间**：2026-11-16
