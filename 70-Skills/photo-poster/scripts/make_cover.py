# -*- coding: utf-8 -*-
"""
photo-poster - 真实照片排版出图
输出：1242x1656 (小红书 3:4)

用法:
  python make_cover.py --photo 主体.jpg --out 输出.jpg --style A \
      --title "主标题/第二行" --sub "副标题" --points "要点1|要点2"

  --style A  全幅照片 + 底部渐变压字（封面首选）
  --style B  照片 + 奶油色信息板（内页/清单）
  --inset    可选，参考图路径（白框嵌入，不做融合）
依赖：Pillow + 中文字体
"""
import argparse, os
from PIL import Image, ImageDraw, ImageEnhance, ImageFont

W, H = 1242, 1656

FONTS = [
    r"C:\Windows\Fonts\msyh.ttc",
    r"C:\Windows\Fonts\msyhbd.ttc",
    r"C:\Windows\Fonts\simhei.ttf",
    "/System/Library/Fonts/PingFang.ttc",
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
]

FONT = None

def find_font():
    for p in FONTS:
        if os.path.exists(p):
            return p
    raise SystemExit("找不到中文字体，请修改 FONTS 列表")

def f(sz):
    return ImageFont.truetype(FONT, sz)

def fit_3x4(img):
    sw, sh = img.size
    target = W / H
    if sw / sh > target:
        nw, nh = int(sh * target), sh
        left, top = int((sw - nw) * 0.5), 0
    else:
        nw, nh = sw, int(sw / target)
        left, top = 0, int((sh - nh) * 0.35)
    return img.crop((left, top, left + nw, top + nh)).resize((W, H), Image.LANCZOS)

def style_a(photo, title, sub, points, label, source, inset, inset_caption):
    img = fit_3x4(photo)
    img = ImageEnhance.Contrast(img).enhance(1.04)
    img = ImageEnhance.Color(img).enhance(1.04)

    grad = Image.new("L", (1, H))
    for y in range(H):
        t = y / H
        a = 0 if t < 0.42 else int(255 * min(1.0, (t - 0.42) / 0.34) ** 1.25)
        grad.putpixel((0, y), a)
    grad = grad.resize((W, H))
    img = Image.composite(Image.new("RGB", (W, H), (18, 12, 8)), img, grad)
    img = Image.blend(img, Image.new("RGB", (W, H), (0, 0, 0)), 0.10)

    d = ImageDraw.Draw(img)
    if label:
        box_w = 56 + len(label) * 36 + 24
        d.rounded_rectangle((56, 56, box_w, 128), radius=36, fill=(255, 138, 92))
        d.text((88, 72), label, font=f(35), fill=(255, 255, 255))

    y = H - 560
    for line in [x for x in title.split("/") if x]:
        d.text((64, y), line, font=f(104), fill=(255, 255, 255))
        y += 122
    if sub:
        d.text((68, y + 10), sub, font=f(46), fill=(255, 196, 107))
        y += 86
    for p in points:
        d.text((68, y), p, font=f(33), fill=(232, 226, 218))
        y += 50
    if source:
        d.text((64, H - 84), source, font=f(22), fill=(190, 180, 168))

    if inset:
        iw, ih = 250, 188
        r_img = inset
        sw, sh = r_img.size
        r = iw / ih
        if sw / sh > r:
            box = (int((sw - sh * r) / 2), 0, int((sw + sh * r) / 2), sh)
        else:
            box = (0, int((sh - sw / r) / 2), sw, int((sh + sw / r) / 2))
        ins = r_img.crop(box).resize((iw, ih), Image.LANCZOS)
        ix, iy = W - iw - 62, H - ih - 210
        d.rounded_rectangle((ix - 10, iy - 10, ix + iw + 10, iy + ih + 10), radius=16, fill=(255, 255, 255))
        img.paste(ins, (ix, iy))
        d.text((ix, iy + ih + 18), inset_caption, font=f(24), fill=(235, 228, 220))
    return img

def style_b(photo, title, points, label, source):
    img = fit_3x4(photo)
    img = ImageEnhance.Contrast(img).enhance(1.05)
    panel_h = 560
    d = ImageDraw.Draw(img)
    d.rectangle((0, H - panel_h, W, H), fill=(255, 244, 229))
    d.rectangle((0, H - panel_h, W, H - panel_h + 8), fill=(229, 107, 60))
    if label:
        box_w = 56 + len(label) * 36 + 24
        d.rounded_rectangle((56, 56, box_w, 128), radius=36, fill=(255, 255, 255))
        d.text((86, 72), label, font=f(35), fill=(229, 107, 60))
    y = H - panel_h + 56
    d.text((64, y), title, font=f(66), fill=(61, 43, 31))
    y += 96
    nums = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"]
    for i, p in enumerate(points):
        d.text((64, y), nums[i] if i < len(nums) else "·", font=f(34), fill=(229, 107, 60))
        d.text((112, y), p, font=f(33), fill=(84, 66, 50))
        y += 62
    if source:
        d.text((64, H - 96), source, font=f(23), fill=(176, 154, 130))
    return img

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--photo", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--style", default="A", choices=["A", "B"])
    ap.add_argument("--title", default="")
    ap.add_argument("--sub", default="")
    ap.add_argument("--points", default="")
    ap.add_argument("--label", default="")
    ap.add_argument("--source", default="")
    ap.add_argument("--inset", default="")
    ap.add_argument("--inset-caption", default="实拍参考")
    ap.add_argument("--quality", type=int, default=94)
    a = ap.parse_args()

    global FONT
    FONT = find_font()

    photo = Image.open(a.photo).convert("RGB")
    pts = [x.strip() for x in a.points.split("|") if x.strip()]
    inset = Image.open(a.inset).convert("RGB") if a.inset else None

    if a.style == "A":
        out = style_a(photo, a.title, a.sub, pts, a.label, a.source, inset, a.inset_caption)
    else:
        out = style_b(photo, a.title, pts, a.label, a.source)

    out.save(a.out, quality=a.quality)
    print("OK", a.out, out.size)

if __name__ == "__main__":
    main()
