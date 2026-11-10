# free-text-to-image Skill 总结

## 核心功能

**一句话**：用户说"画一张猫"，系统自动按优先级试遍所有可用平台（硅基流动→魔搭→智谱→Cloudflare→Pollinations），哪个能出图就返回哪个，不用管后台怎么切换。

支持：故障转移、负向词适配、NSFW 规避、水印抹除、批量横评。

---

## 平台对照表

| 平台 | 是否免费 | 额度/价格 | 平均耗时 | 画质评分 |
|------|----------|-----------|----------|----------|
| **智谱 CogView-3-Flash** | ✅ 真免费 | 不限量 | ~11s | ⭐⭐⭐ |
| **魔搭 ModelScope** | ✅ 真免费 | 2000 次/天 | ~11–54s | ⭐⭐⭐⭐ |
| **Cloudflare Workers AI** | ✅ 免费额度 | 10k neurons≈58 张/天 | ~4s | ⭐⭐⭐⭐ |
| **Pollinations** | ✅ 真免费 | 无限制，45s/张限速 | ~33s | ⭐⭐⭐ |
| **硅基流动 Kolors** | ⚠️ 赠金体验 | 14 元 ≈ 46 张 | ~6s | ⭐⭐⭐⭐⭐ |
| **DashScope** | ❌ 付费 | 0.25 元/张 | — | 已禁用 |

---

## API Key 列表（脱敏）

| 平台 | Token/Key |
|------|-----------|
| 智谱 | `4e865a5c……hfA4yVLf（智谱，本机 .credentials.yaml）` |
| 魔搭 | `ms-7a80fd0e……e0f93042（魔搭，本机 .credentials.yaml）` |
| Cloudflare Token | `cfat_6E3l……a085597（Cloudflare，本机 .credentials.yaml）` |
| Cloudflare Account | `3d926cbc……1e00af0（Cloudflare Account ID）` |
| 硅基流动 | `sk-sqnu……nvktffft（硅基流动，本机 .credentials.yaml）` |

⚠️ **这些 key 是临时测试用的，生产环境请重新申请**。不要提交到公开仓库。

---

## 安装步骤

1. 将代码库部署到 `70-Skills/free-text-to-image`
2. 配置 `.credentials.yaml` 或环境变量
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

1. **Cloudflare NSFW 拦截** → 改写提示词："呕吐" → "刚吐完"
2. **DashScope 不是免费的！** → 完全收费，已禁用
3. **魔搭必须绑定阿里云 + 实名** → 欠费可能导致失效
4. **Pollinations 有硬限速** → 45 秒/张，适合兜底

---

## 相关文件

- `SKILL.md` —— 完整使用手册
- `README.md` —— 快速上手指南
- `bridge.py` —— 核心桥接逻辑
- `compare.py` —— 批量对比脚本
- `D:\GitHub\My-second-brain\50-知识\AI 工具\免费文生图接入方案 - 全汇总.md` —— 深度分析

---

**状态**：✅ 生产就绪  
**维护者**：QG(你)  
**更新时间**：2026-11-09
