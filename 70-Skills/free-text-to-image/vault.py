#!/usr/bin/env python3
"""
API Key 加密保险箱。

用法：
  python vault.py encrypt              # 把 providers.json 加密成 vault.enc
  python vault.py decrypt              # 用口令解密 vault.enc -> providers.json
  python vault.py show                 # 解密后只打印，不落盘
  python vault.py status               # 查看 vault.enc 状态

加密方案：scrypt(N=2^15, r=8, p=1) 派生 256-bit 密钥 + AES-256-GCM
口令不写入任何文件，每次运行时从环境变量或交互输入获取。
"""
import base64
import getpass
import json
import os
import sys
from pathlib import Path

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
except ImportError:
    print("需要 cryptography: pip install cryptography", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parent
VAULT = ROOT / "vault.enc"
PLAIN = ROOT / "providers.json"

# scrypt 参数（约 100ms/次，抗暴力）
SCRYPT_N = 1 << 15
SCRYPT_R = 8
SCRYPT_P = 1
SALT_LEN = 16
NONCE_LEN = 12


def get_passphrase() -> str:
    p = os.environ.get("QWEN_VAULT_PASS")
    if p:
        return p
    if not sys.stdin.isatty():
        print("非交互环境请设置 QWEN_VAULT_PASS", file=sys.stderr)
        sys.exit(1)
    return getpass.getpass("口令: ")


def derive(passphrase: str, salt: bytes) -> bytes:
    kdf = Scrypt(salt=salt, length=32, n=SCRYPT_N, r=SCRYPT_R, p=SCRYPT_P)
    return kdf.derive(passphrase.encode("utf-8"))


def encrypt():
    if not PLAIN.is_file():
        print(f"找不到 {PLAIN.name}", file=sys.stderr)
        sys.exit(1)
    data = PLAIN.read_bytes()
    # 先校验是合法 JSON
    json.loads(data)

    passphrase = get_passphrase()
    salt = os.urandom(SALT_LEN)
    nonce = os.urandom(NONCE_LEN)
    key = derive(passphrase, salt)
    ct = AESGCM(key).encrypt(nonce, data, b"qwen-vault-v1")

    blob = {
        "v": 1,
        "alg": "AES-256-GCM",
        "kdf": f"scrypt(n={SCRYPT_N},r={SCRYPT_R},p={SCRYPT_P})",
        "salt": base64.b64encode(salt).decode(),
        "nonce": base64.b64encode(nonce).decode(),
        "ct": base64.b64encode(ct).decode(),
    }
    VAULT.write_text(json.dumps(blob, indent=2), encoding="utf-8")
    print(f"[ok] 已加密 -> {VAULT.name}  ({len(ct)} 字节密文)")
    print(f"     明文 {len(data)} 字节，密钥 scrypt+AES-256-GCM")


def decrypt(write_file=True):
    if not VAULT.is_file():
        print(f"找不到 {VAULT.name}", file=sys.stderr)
        sys.exit(1)
    blob = json.loads(VAULT.read_text(encoding="utf-8"))
    if blob.get("v") != 1:
        print(f"不支持的版本: {blob.get('v')}", file=sys.stderr)
        sys.exit(1)

    passphrase = get_passphrase()
    salt = base64.b64decode(blob["salt"])
    nonce = base64.b64decode(blob["nonce"])
    ct = base64.b64decode(blob["ct"])
    key = derive(passphrase, salt)

    try:
        data = AESGCM(key).decrypt(nonce, ct, b"qwen-vault-v1")
    except Exception:
        print("[FAIL] 口令错误或文件损坏", file=sys.stderr)
        sys.exit(2)

    obj = json.loads(data)
    if write_file:
        PLAIN.write_bytes(data)
        # 收紧权限（Windows 上无实际效果，Linux/mac 有效）
        try:
            os.chmod(PLAIN, 0o600)
        except Exception:
            pass
        print(f"[ok] 已解密 -> {PLAIN.name}  ({len(data)} 字节)")
        print(f"     含 {len(obj)} 个配置节")
    else:
        print(json.dumps(obj, indent=2, ensure_ascii=False))


def status():
    if not VAULT.is_file():
        print("vault.enc 不存在")
        return
    blob = json.loads(VAULT.read_text(encoding="utf-8"))
    ct_len = len(base64.b64decode(blob["ct"]))
    print(f"vault.enc  存在")
    print(f"  版本    : {blob['v']}")
    print(f"  算法    : {blob['alg']}")
    print(f"  KDF     : {blob['kdf']}")
    print(f"  密文大小: {ct_len} 字节")
    print(f"  明文大小: {PLAIN.stat().st_size} 字节" if PLAIN.is_file() else "  明文    : 未解密")
    print(f"  明文存在: {'是' if PLAIN.is_file() else '否'}")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    if cmd == "encrypt":
        encrypt()
    elif cmd == "decrypt":
        decrypt(True)
    elif cmd == "show":
        decrypt(False)
    elif cmd == "status":
        status()
    else:
        print(__doc__)
