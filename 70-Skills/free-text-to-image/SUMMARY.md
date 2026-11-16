# free-text-to-image Skill 总结

## 核心功能

**一句话**：用户说"画一张猫"，系统自动按优先级试遍所有可用平台（硅基流动→魔搭→智谱→Cloudflare→Pollinations），哪个能出图就返回哪个，不用管后台怎么切换。

支持：故障转移、负向词适配、NSFW 规避、水印抹除、批量横评。

---

## 平台对照表（2026-11-16 小红书配图横评后）

| 平台 | 是否免费 | 额度/价格 | 平均耗时 | 判定 |
|------|----------|-----------|----------|------|
| **魔搭 Z-Image-Turbo** | ✅ 真免费 | 2000 次/天 | **8.8s** | ✅ **主力**，细节遵循最好 |
| **魔搭 Qwen-Image-2.1** | ✅ 真免费 | 2000 次/天 | 12.8s（偶发 150–280s 排队） | ✅ 质量天花板，带 240s 超时 |
| **智谱 CogView-3-Flash** | ✅ 真免费 | 不限量 | 8.9s | ⚠️ 降级用，多主体并列会跑偏 |
| **Cloudflare flux-1-schnell** | ✅ 免费额度 | 10k neurons≈58 张/天 | 3.9s | ❌ **中文 prompt 出无关图**，已加中文守卫 |
| **Pollinations flux** | ✅ 真免费 | 45s/张限速 | 32.9s | ❌ 同上，且带角标 |
| **硅基流动 Qwen-Image / Kolors** | ❌ 0.3 元/张 | — | — | ❌ 收费，已关闭 |
| **魔搭 Qwen-Image（老版）** | ✅ 免费 | — | 224s | ❌ 慢 20 倍且更差 |
| **DashScope** | ❌ 付费 | 0.25 元/张 | — | ❌ 已禁用 |

**核心结论**：flux 系（Cloudflare / Pollinations）在小红书场景等于不可用 —— 中文 prompt 会出古风建筑、旗袍少女之类完全无关的图。只有英文 prompt 才正常，所以现在只在英文时兜底。

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

1. **Cloudflare / Pollinations 吃不了中文** → 中文 prompt 出完全无关的图（要白猫出古风建筑），已加 `has_cjk()` 守卫直接跳过
2. **DashScope 不是免费的！** → 完全收费，已禁用
3. **魔搭必须绑定阿里云 + 实名** → 欠费可能导致失效
4. **Pollinations 有硬限速** → 45 秒/张，适合兜底
5. **智谱的多主体并列会跑偏** → 要"四滩呕吐物并排"会画成一地乱泼，对照表底图别用它
6. **Qwen-Image-2.1 会排队 200s+** → 必须设 `timeout_sec`，否则拖死整条链
7. **角标是「灰底胶囊 + 白字」** → 只抠白字会剩灰块，要取最大低饱和连通块的外接矩形整体 inpaint

---

## 相关文件

- `SKILL.md` —— 完整使用手册（含「小红书配图专用」整节）
- `README.md` —— 快速上手指南
- `bridge.py` —— 核心桥接逻辑（`D:\GitHub\qwen-bridge\`）
- `D:\GitHub\qwen-bridge\bakeoff_xhs\` —— **2026-11-16 横评全部证据**（56 张实测图 + `对照总图.png` + `report.json`）
- `D:\GitHub\My-second-brain\50-知识\AI 工具\免费文生图接入方案 - 全汇总.md` —— 深度分析

---

**状态**：✅ 生产就绪（小红书配图已定稿）  
**维护者**：QG(你)  
**更新时间**：2026-11-16
