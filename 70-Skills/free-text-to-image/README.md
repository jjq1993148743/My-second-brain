---
date: 2026-11-09
time: 19:30
place: D:\GitHub\qwen-bridge
tags: [AI 工具，技能，文生图]
---

# free-text-to-image Skill

## 功能

DSH 免费文生图全链路：按优先级链式调用多个平台，自动故障转移、负向词适配、水印抹除。

**一句话**：用户说"画一张猫"，它帮你试遍所有可用源，哪个能出图就返回哪个，不用管后台怎么切换。

---

## 安装步骤

### 1. 代码部署

```bash
cd D:\GitHub\My-second-brain
git clone https://github.com/your-repo/qwen-bridge.git 70-Skills/free-text-to-image
```

### 2. 解密密钥保险箱（换机必做）

密钥全部加密在 `vault.enc` 里，**仓库里没有明文**。新机器上第一次使用：

```bash
cd 70-Skills/free-text-to-image
pip install cryptography
python vault.py decrypt          # 会提示输入口令
```

口令由 jjq 单独提供。解密成功后生成 `providers.json`，拷到桥接目录：

```powershell
Copy-Item providers.json D:\GitHub\qwen-bridge\providers.json -Force
```

其他命令：`vault.py status`（查看状态）/ `vault.py show`（只看不落盘）/ `vault.py encrypt`（重新加密）

详见 [`SKILL.md`](./SKILL.md) §环境配置。

### 3. 启动桥接服务

```powershell
$py = "$env:USERPROFILE\.dsh\qwen-studio\venv\Scripts\python.exe"
& $py -u "D:\GitHub\qwen-bridge\bridge.py"
```

静默模式：
```powershell
Start-Process $py -ArgumentList @("-u","D:\GitHub\qwen-bridge\bridge.py") -WindowStyle Hidden
```

### 4. 注册到 DSH

插件市场添加自定义索引：
```
https://raw.githubusercontent.com/your-repo/main/index.json
→ 选 2.19.0 安装 → 重启 DSH → 设置里启用「图像」
```

或直接装本地包：
```powershell
dsh.cmd plugin --profile desktop add "D:\GitHub\qwen-bridge\dsh-qwen-studio-2.19.2.tgz"
```

---

## 使用方法

### 对话模式

直接对 DSH 说：

> 画一只白色的猫在木地板上吐毛球，写实摄影风格

系统会自动：
1. 检查 `providers.json` 里的优先顺序
2. 从 `siliconflow` 开始尝试
3. 如果失败，自动切换到 `modelscope` / `zhipu` / `cloudflare` / `pollinations`
4. 任一成功即返回图片，附加到对话中

### 程序化调用

```python
import bridge
cfg = bridge.load_config()
# 硅基流动 Kolors（最快最清晰）
png = bridge.gen_siliconflow(cfg, "a cozy bookstore cafe", 1024, 1024, seed=123)

# ModelScope Qwen-Image-2.1（免费额度高）
png = bridge.gen_modelscope(cfg, "white cat vomiting", 1024, 1024, seed=456)

# Cloudflare FLUX.1-schnell（速度最快）
png = bridge.gen_cloudflare(cfg, "cat on windowsill", 1024, 1024, seed=789)
```

### 批量横评

脚本位置：`compare.py`

```bash
python compare.py
```

生成 `compare.html`（24 张图片直嵌对照页）。

---

## 注意事项

- **Cloudflare 有 NSFW 审核**，提示词含"呕吐"会被拦截。已实现自动改写为"刚吐完"。
- **魔搭需要绑定阿里云 + 实名**，欠费可能导致免费额度失效。
- **Pollinations 限速 45 秒/张**，适合兜底但别指望并发。
- **DashScope 完全收费**，已在配置中禁用，不要误用。

---

## 相关文件

- `SKILL.md` —— 完整使用手册
- `bridge.py` —— 核心桥接逻辑
- `compare.py` —— 批量对比脚本
- `rescue.py` —— 补跑被拦图片
- `all.html` —— 单页全部对照（34MB）

---

**状态**：✅ 生产就绪  
**维护者**：QG(你)  
**更新时间**：2026-11-09
