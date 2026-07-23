#!/usr/bin/env python3
"""Build the selected editorial direction for the ZhaoCai Smart case study."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "output" / "zhaocai-smart-audit" / "source"
OUTPUT = ROOT / "output" / "zhaocai-smart-case-editorial"

W, H = 1920, 1080
M = 90
BLACK = "#090A0E"
INK = "#0F1015"
BODY = "#31323A"
MUTED = "#777984"
LIGHT = "#F1F1F4"
WHITE = "#FDFDFD"
PURPLE = "#5B2CFF"
PALE = "#EAE5FF"

FONT_CN = "/System/Library/Fonts/Hiragino Sans GB.ttc"
FONT_LATIN = "/System/Library/Fonts/HelveticaNeue.ttc"


def font(size: int, weight: str = "regular", latin: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_LATIN if latin else FONT_CN
    index = 0 if latin else {"regular": 0, "medium": 1, "bold": 1}.get(weight, 0)
    return ImageFont.truetype(path, size=size, index=index)


F = {
    "micro": font(17, latin=True),
    "micro_cn": font(18),
    "small": font(22),
    "small_m": font(22, "medium"),
    "body": font(27),
    "body_m": font(27, "medium"),
    "lead": font(34),
    "lead_m": font(34, "medium"),
    "h3": font(40, "medium"),
    "h2": font(56, "medium"),
    "h1": font(76, "medium"),
    "display": font(104, "bold"),
    "display_latin": font(112, "bold", latin=True),
    "num": font(86, "medium", latin=True),
}


def src(name: str) -> Path:
    return SOURCE / name


def text_width(draw: ImageDraw.ImageDraw, value: str, fnt: ImageFont.FreeTypeFont) -> int:
    return math.ceil(draw.textlength(value, font=fnt))


def wrap(draw: ImageDraw.ImageDraw, value: str, fnt: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in value.split("\n"):
        if paragraph == "":
            lines.append("")
            continue
        current = ""
        for ch in paragraph:
            if current and draw.textlength(current + ch, font=fnt) > width:
                lines.append(current.rstrip())
                current = ch.lstrip()
            else:
                current += ch
        if current:
            lines.append(current.rstrip())
    return lines


def multiline(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    value: str,
    fnt: ImageFont.FreeTypeFont,
    fill: str,
    width: int,
    gap: int = 10,
) -> int:
    lines = wrap(draw, value, fnt, width)
    bbox = draw.textbbox((0, 0), "永Ag", font=fnt)
    line_h = bbox[3] - bbox[1] + gap
    for line in lines:
        draw.text((x, y), line, font=fnt, fill=fill)
        y += line_h
    return y


def canvas(page: int, dark: bool = False) -> Image.Image:
    bg = BLACK if dark else WHITE
    im = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(im)
    color = "#A9AAB2" if dark else MUTED
    page_text = f"ZHAOCAI SMART  /  0{page}"
    d.text((M, 39), page_text, font=F["micro"], fill=color)
    d.text((W - M - text_width(d, "CASE STUDY", F["micro"]), 39), "CASE STUDY", font=F["micro"], fill=color)
    d.line((M, 76, W - M, 76), fill="#2C2D34" if dark else "#D9D9DF", width=1)
    return im


def accent_rule(draw: ImageDraw.ImageDraw, x: int, y: int, width: int = 108) -> None:
    draw.rectangle((x, y, x + width, y + 7), fill=PURPLE)


def footer(draw: ImageDraw.ImageDraw, label: str, dark: bool = False) -> None:
    color = "#A9AAB2" if dark else MUTED
    draw.text((M, H - 48), label, font=F["micro"], fill=color)
    note = "CONFIDENTIAL · DE-IDENTIFIED"
    draw.text((W - M - text_width(draw, note, F["micro"]), H - 48), note, font=F["micro"], fill=color)


def open_crop(path: Path, crop: tuple[int, int, int, int] | None = None) -> Image.Image:
    with Image.open(path) as raw:
        im = raw.convert("RGB")
    return im.crop(crop) if crop else im


def treatment(im: Image.Image, grayscale: bool = False, fade: float = 0.0, contrast: float = 1.0) -> Image.Image:
    if grayscale:
        im = ImageOps.grayscale(im).convert("RGB")
    if contrast != 1.0:
        im = ImageEnhance.Contrast(im).enhance(contrast)
    if fade > 0:
        veil = Image.new("RGB", im.size, WHITE)
        im = Image.blend(im, veil, fade)
    return im


def place(
    base: Image.Image,
    path: Path,
    box: tuple[int, int, int, int],
    crop: tuple[int, int, int, int] | None = None,
    mode: str = "cover",
    grayscale: bool = False,
    fade: float = 0.0,
    contrast: float = 1.0,
    border: bool = False,
) -> None:
    x1, y1, x2, y2 = box
    tw, th = x2 - x1, y2 - y1
    im = treatment(open_crop(path, crop), grayscale=grayscale, fade=fade, contrast=contrast)
    ratio = max(tw / im.width, th / im.height) if mode == "cover" else min(tw / im.width, th / im.height)
    im = im.resize((max(1, round(im.width * ratio)), max(1, round(im.height * ratio))), Image.Resampling.LANCZOS)
    frame = Image.new("RGB", (tw, th), WHITE)
    frame.paste(im, ((tw - im.width) // 2, (th - im.height) // 2))
    base.paste(frame, (x1, y1))
    if border:
        ImageDraw.Draw(base).rectangle(box, outline="#D1D2D8", width=1)


def rotated_place(
    base: Image.Image,
    path: Path,
    position: tuple[int, int],
    size: tuple[int, int],
    crop: tuple[int, int, int, int],
    angle: float,
    grayscale: bool = False,
) -> None:
    im = treatment(open_crop(path, crop), grayscale=grayscale)
    ratio = max(size[0] / im.width, size[1] / im.height)
    im = im.resize((round(im.width * ratio), round(im.height * ratio)), Image.Resampling.LANCZOS)
    left, top = (im.width - size[0]) // 2, (im.height - size[1]) // 2
    im = im.crop((left, top, left + size[0], top + size[1]))
    im = im.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True, fillcolor=WHITE)
    base.paste(im, position)


def page_01() -> Path:
    im = canvas(1)
    d = ImageDraw.Draw(im)

    d.text((M, 173), "招财 Smart", font=F["display"], fill=INK)
    accent_rule(d, M, 334)
    multiline(d, M, 405, "让复杂企业数据，\n变成可追问、可解释、\n可复盘的答案", F["h2"], INK, 670, 10)
    d.line((M, 732, 710, 732), fill=INK, width=1)
    d.text((M, 765), "企业级 AI 智能问数", font=F["body_m"], fill=INK)
    d.text((M, 808), "交互策略 / UI 设计 / 设计规范", font=F["body"], fill=PURPLE)

    # Real product interface, treated like editorial photography.
    rotated_place(im, src("07-project-background.png"), (790, -24), (1165, 1130), (735, 95, 1918, 1077), -1.4)
    d = ImageDraw.Draw(im)
    d.line((816, 76, 816, 1032), fill="#B5A3FF", width=2)
    d.rectangle((802, 910, 818, 930), fill=PURPLE)
    footer(d, "PROJECT OVERVIEW")
    return save(im, "01-cover.png")


def page_02() -> Path:
    im = canvas(2)
    d = ImageDraw.Draw(im)
    d.text((M, 128), "业务人员不是缺数据，", font=F["h1"], fill=INK)
    d.text((M, 220), "而是离答案太远", font=F["h1"], fill=PURPLE)
    accent_rule(d, M, 322)

    items = [
        ("01", "查询门槛", "依赖分析师、IT、SQL 与固定报表，\n业务人员难以自主探索。"),
        ("02", "过程黑箱", "识别、检索、计算与渲染不可见，\n等待过程缺少信任。"),
        ("03", "洞察断点", "一次回答解决即时问题，\n却很难继续追踪与复盘。"),
    ]
    y = 405
    for idx, heading, body in items:
        d.text((M, y), idx, font=F["small_m"], fill=PURPLE)
        d.text((156, y - 15), heading, font=F["h3"], fill=INK)
        multiline(d, 430, y - 5, body, F["body"], BODY, 560, 8)
        d.line((M, y + 112, 1015, y + 112), fill="#D5D5DB", width=1)
        y += 172

    # Keep the original conceptual flow as quiet evidence, not a framed diagram.
    place(im, src("04-introduction.png"), (1085, 122, 1840, 930), crop=(875, 65, 1788, 948), mode="cover", grayscale=True, fade=0.2, contrast=1.05)
    d = ImageDraw.Draw(im)
    d.line((1050, 122, 1050, 930), fill=INK, width=1)
    d.text((1085, 952), "设计目标：提问 → 理解 → 决策 → 复盘", font=F["body_m"], fill=INK)
    footer(d, "CONTEXT & DESIGN TARGET")
    return save(im, "02-context.png")


def page_03() -> Path:
    im = canvas(3)
    d = ImageDraw.Draw(im)
    d.text((M, 126), "把一次问数，设计成完整旅程", font=F["h1"], fill=INK)
    accent_rule(d, M, 228)
    d.text((M, 266), "四个节点分别解决：不会问、问不准、等不住、留不下。", font=F["lead"], fill=BODY)

    steps = [
        ("01", "提出问题", "自然语言输入"),
        ("02", "补全意图", "主动澄清机制"),
        ("03", "理解过程", "阶段状态反馈"),
        ("04", "沉淀结果", "卡片与看板"),
    ]
    y1, y2 = 360, 596
    col_w = (W - 2 * M) // 4
    for i, (idx, heading, detail) in enumerate(steps):
        x = M + i * col_w
        if i > 0:
            d.line((x, y1, x, y2), fill="#CECFD5", width=1)
        d.text((x + 24, y1 + 18), idx, font=F["num"], fill=PURPLE)
        d.text((x + 24, y1 + 126), heading, font=F["h3"], fill=INK)
        d.text((x + 24, y1 + 180), detail, font=F["body"], fill=MUTED)
    d.line((M, y1, W - M, y1), fill=INK, width=1)
    d.line((M, y2, W - M, y2), fill=INK, width=1)

    # Three contiguous proof strips, deliberately not placed in cards.
    place(im, src("06-semantic-clarification.png"), (M, 634, 674, 950), crop=(55, 218, 1130, 1010), mode="cover")
    place(im, src("02-process-visualization.png"), (696, 634, 1264, 950), crop=(1350, 290, 1850, 1002), mode="cover")
    place(im, src("05-board-interaction.png"), (1286, 634, W - M, 950), crop=(85, 346, 1745, 866), mode="cover")
    d = ImageDraw.Draw(im)
    d.rectangle((M, 634, 674, 674), fill=BLACK)
    d.rectangle((696, 634, 1264, 674), fill=BLACK)
    d.rectangle((1286, 634, W - M, 674), fill=BLACK)
    d.text((M + 16, 644), "语义澄清", font=F["small_m"], fill=WHITE)
    d.text((712, 644), "过程反馈", font=F["small_m"], fill=WHITE)
    d.text((1302, 644), "看板沉淀", font=F["small_m"], fill=WHITE)
    footer(d, "EXPERIENCE STRATEGY")
    return save(im, "03-strategy.png")


def page_04() -> Path:
    im = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 520, H), fill=BLACK)
    d.text((M, 42), "ZHAOCAI SMART  /  04", font=F["micro"], fill="#A9AAB2")
    d.text((M, 168), "不猜", font=F["display"], fill=WHITE)
    d.text((M, 300), "先澄清", font=F["h1"], fill=WHITE)
    d.rectangle((M, 412, M + 108, 420), fill=PURPLE)
    multiline(d, M, 468, "当关键信息缺失时，\n系统提供轻量选项补全语义，\n确认后再进入查询。", F["body"], "#C4C5CC", 350, 12)

    decisions = [
        ("01", "主动触发"),
        ("02", "有限选择"),
        ("03", "保留控制权"),
    ]
    y = 720
    for idx, label in decisions:
        d.text((M, y), idx, font=F["micro"], fill=PURPLE)
        d.text((138, y - 7), label, font=F["small_m"], fill=WHITE)
        d.line((M, y + 42, 430, y + 42), fill="#383940", width=1)
        y += 82
    d.text((M, H - 48), "KEY MECHANISM · CLARIFICATION", font=F["micro"], fill="#A9AAB2")

    # Large real interaction flow.
    d.text((610, 126), "模糊意图 → 可确认选项", font=F["h2"], fill=INK)
    d.text((610, 208), "把纠错前置为一次轻量选择，而不是一次失败回答。", font=F["body"], fill=MUTED)
    place(im, src("06-semantic-clarification.png"), (610, 290, 1840, 934), crop=(55, 225, 1140, 1000), mode="cover")
    d = ImageDraw.Draw(im)
    d.line((520, 0, 520, H), fill=PURPLE, width=3)
    d.line((610, 952, 1840, 952), fill=INK, width=1)
    d.text((610, 970), "原则：不把不确定性包装成确定答案。", font=F["body_m"], fill=PURPLE)
    return save(im, "04-clarification.png")


def page_05() -> Path:
    im = canvas(5)
    d = ImageDraw.Draw(im)
    d.text((M, 148), "等待", font=F["display"], fill=INK)
    d.text((M, 278), "不是空白", font=F["display"], fill=INK)
    accent_rule(d, M, 424)
    multiline(d, M, 480, "把不可见的 AI 处理过程，\n拆成用户能理解的阶段。", F["lead"], BODY, 520, 12)

    process = [
        ("01", "理解问题"),
        ("02", "检索数据"),
        ("03", "分析计算"),
        ("04", "组织答案"),
    ]
    y = 650
    for idx, label in process:
        d.text((M, y), idx, font=F["micro"], fill=PURPLE)
        d.text((138, y - 9), label, font=F["body_m"], fill=INK)
        d.line((M, y + 38, 520, y + 38), fill="#D4D5DA", width=1)
        y += 64

    # Original workflow and completed state shown as two contrasting documents.
    place(im, src("02-process-visualization.png"), (590, 126, 970, 942), crop=(105, 300, 515, 1000), mode="cover", contrast=1.12)
    place(im, src("02-process-visualization.png"), (1020, 100, 1818, 942), crop=(1348, 295, 1850, 1005), mode="contain")
    d = ImageDraw.Draw(im)
    d.line((560, 126, 560, 942), fill=INK, width=1)
    d.line((995, 126, 995, 942), fill="#D0D1D6", width=1)
    d.text((590, 958), "过程状态矩阵", font=F["small_m"], fill=INK)
    d.text((1020, 958), "完成态：步骤记录 + 表格 + 解释", font=F["small_m"], fill=INK)
    footer(d, "KEY MECHANISM · PROCESS VISIBILITY")
    return save(im, "05-process.png")


def page_06() -> Path:
    im = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, 600, H), fill=BLACK)
    d.text((M, 42), "ZHAOCAI SMART  /  06", font=F["micro"], fill="#A9AAB2")
    d.text((M, 160), "一次问答", font=F["h1"], fill=WHITE)
    d.text((M, 260), "长期复盘", font=F["h1"], fill=WHITE)
    d.rectangle((M, 372, M + 108, 380), fill=PURPLE)
    multiline(d, M, 432, "对话解决即时探索，\n看板负责持续追踪。", F["lead"], "#CACBD1", 390, 12)
    d.text((M, 610), "卡片", font=F["h3"], fill=WHITE)
    d.text((M, 664), "单次洞察", font=F["body"], fill="#9EA0AA")
    d.text((M, 750), "合辑", font=F["h3"], fill=WHITE)
    d.text((M, 804), "长期业务主题", font=F["body"], fill="#9EA0AA")
    d.line((M, 900, 500, 900), fill="#383940", width=1)
    d.text((M, 925), "拖拽预览 · 悬停阈值 · 二次确认", font=F["small"], fill=PURPLE)
    d.text((M, H - 48), "KEY MECHANISM · BOARD", font=F["micro"], fill="#A9AAB2")

    # Two real interaction states, stretched across the white exhibition wall.
    place(im, src("05-board-interaction.png"), (650, 122, 1172, 944), crop=(92, 345, 866, 870), mode="cover")
    place(im, src("05-board-interaction.png"), (1215, 122, 1840, 944), crop=(970, 345, 1745, 870), mode="cover")
    d = ImageDraw.Draw(im)
    d.text((650, 968), "合辑生成", font=F["small_m"], fill=INK)
    d.text((1215, 968), "拖拽预览", font=F["small_m"], fill=INK)
    d.line((600, 0, 600, H), fill=PURPLE, width=3)
    d.line((1194, 122, 1194, 944), fill="#D0D1D6", width=1)
    return save(im, "06-board.png")


def page_07() -> Path:
    im = canvas(7)
    d = ImageDraw.Draw(im)
    d.text((M, 126), "四个机制，构成一套可信体验", font=F["h1"], fill=INK)
    accent_rule(d, M, 228)
    d.text((M, 266), "规范不是最后的包装，而是 AI 输出稳定、可读、可复用的基础。", font=F["lead"], fill=BODY)

    place(im, src("01-design-system.png"), (M, 356, 1060, 868), crop=(65, 175, 1008, 977), mode="cover", contrast=1.08)
    d = ImageDraw.Draw(im)
    d.line((1095, 356, 1095, 868), fill=INK, width=1)
    items = [
        ("01", "语义澄清", "模糊问题 → 可确认意图"),
        ("02", "过程状态", "长等待 → 可理解阶段"),
        ("03", "看板合辑", "一次结果 → 长期资产"),
        ("04", "Markdown 规范", "复杂输出 → 一致呈现"),
    ]
    y = 368
    for idx, heading, body in items:
        d.text((1140, y), idx, font=F["small_m"], fill=PURPLE)
        d.text((1215, y - 13), heading, font=F["h3"], fill=INK)
        d.text((1215, y + 40), body, font=F["body"], fill=MUTED)
        d.line((1140, y + 88, 1840, y + 88), fill="#D3D4D9", width=1)
        y += 120

    d.rectangle((M, 910, W - M, 982), fill=BLACK)
    d.text((M + 28, 928), "交付", font=F["small_m"], fill=PURPLE)
    d.text((M + 118, 928), "交互机制  ·  视觉规范  ·  组件资产  ·  关键场景方案", font=F["small_m"], fill=WHITE)
    d.text((W - 620, 928), "真实效果数据上线后补充", font=F["small"], fill="#A9AAB2")
    footer(d, "SYSTEM & OUTCOME")
    return save(im, "07-system-and-outcome.png")


def save(im: Image.Image, name: str) -> Path:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    path = OUTPUT / name
    im.save(path, "PNG", compress_level=7)
    print(f"saved {path.name}")
    return path


def contact_sheet(paths: list[Path]) -> Path:
    tw, th = 720, 405
    gap = 32
    rows = math.ceil(len(paths) / 2)
    sheet = Image.new("RGB", (tw * 2 + gap * 3, 118 + rows * (th + 70 + gap)), "#E9E9ED")
    d = ImageDraw.Draw(sheet)
    d.text((gap, 30), "ZHAOCAI SMART · EDITORIAL DIRECTION", font=font(31, "medium", latin=True), fill=INK)
    for i, path in enumerate(paths):
        row, col = divmod(i, 2)
        x = gap + col * (tw + gap)
        y = 112 + row * (th + 70 + gap)
        with Image.open(path) as raw:
            thumb = raw.convert("RGB").resize((tw, th), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (x, y))
        d.text((x, y + th + 14), path.stem, font=font(19, latin=True), fill="#666872")
    out = OUTPUT / "00-contact-sheet.jpg"
    sheet.save(out, quality=91, optimize=True)
    print(f"saved {out.name}")
    return out


def main() -> None:
    required = [
        src("01-design-system.png"),
        src("02-process-visualization.png"),
        src("04-introduction.png"),
        src("05-board-interaction.png"),
        src("06-semantic-clarification.png"),
        src("07-project-background.png"),
    ]
    missing = [str(path) for path in required if not path.exists()]
    if missing:
        raise SystemExit("Missing source files:\n" + "\n".join(missing))
    paths = [page_01(), page_02(), page_03(), page_04(), page_05(), page_06(), page_07()]
    contact_sheet(paths)


if __name__ == "__main__":
    main()
