#!/usr/bin/env python3
"""Generate a refined 7-slide portfolio case study for ZhaoCai Smart."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "output" / "zhaocai-smart-audit" / "source"
OUTPUT = ROOT / "output" / "zhaocai-smart-case-refined"

W, H = 1920, 1080
M = 92

INK = "#171A2B"
TEXT = "#41465E"
MUTED = "#777E96"
LINE = "#E1E3ED"
PANEL = "#FFFFFF"
PURPLE = "#5B44F2"
PURPLE_2 = "#7B68FF"
LILAC = "#EEEAFE"
BLUE = "#356DFF"
CYAN = "#11B4D7"
GREEN = "#20A77A"
ORANGE = "#F1844E"

FONT_CN = "/System/Library/Fonts/PingFang.ttc"
FONT_FALLBACK = "/System/Library/Fonts/Hiragino Sans GB.ttc"
FONT_LATIN = "/System/Library/Fonts/HelveticaNeue.ttc"


def font(size: int, weight: str = "regular", latin: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_LATIN if latin else FONT_CN
    index = 0
    if not latin:
        # PingFang collection: regular and semibold faces are available in this environment.
        index = {"regular": 0, "medium": 1, "semibold": 2, "bold": 2}.get(weight, 0)
    try:
        return ImageFont.truetype(path, size=size, index=index)
    except OSError:
        return ImageFont.truetype(FONT_FALLBACK, size=size)


F = {
    "micro": font(18),
    "caption": font(20),
    "small": font(23),
    "small_m": font(23, "medium"),
    "body": font(27),
    "body_m": font(27, "medium"),
    "lead": font(31),
    "lead_m": font(31, "medium"),
    "h3": font(34, "semibold"),
    "h2": font(50, "semibold"),
    "h1": font(72, "semibold"),
    "display": font(92, "semibold"),
    "num": font(88, "bold", latin=True),
    "latin": font(18, latin=True),
    "latin_m": font(18, "medium", latin=True),
}


def rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def source(name: str) -> Path:
    return SOURCE / name


def tw(draw: ImageDraw.ImageDraw, value: str, fnt: ImageFont.FreeTypeFont) -> int:
    return math.ceil(draw.textlength(value, font=fnt))


def wrap(draw: ImageDraw.ImageDraw, value: str, fnt: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in value.split("\n"):
        if not paragraph:
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


def text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    value: str,
    fnt: ImageFont.FreeTypeFont,
    fill: str = TEXT,
    width: int | None = None,
    gap: int = 10,
) -> int:
    x, y = xy
    lines = value.split("\n") if width is None else wrap(draw, value, fnt, width)
    box = draw.textbbox((0, 0), "永Ag", font=fnt)
    line_h = box[3] - box[1] + gap
    for line in lines:
        draw.text((x, y), line, font=fnt, fill=fill)
        y += line_h
    return y


def base(slide_no: int, label: str, accent: str = PURPLE) -> Image.Image:
    img = Image.new("RGBA", (W, H), rgba("#F7F7FB"))
    px = img.load()
    start, end = rgba("#FBFAFF"), rgba("#F3F4F9")
    for y in range(H):
        t = y / (H - 1)
        row = tuple(round(start[i] * (1 - t) + end[i] * t) for i in range(3)) + (255,)
        for x in range(W):
            px[x, y] = row

    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((1260, -430, 2200, 470), fill=rgba(accent, 40))
    gd.ellipse((-360, 730, 620, 1320), fill=rgba("#A99BFF", 19))
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    img = Image.alpha_composite(img, glow)

    d = ImageDraw.Draw(img)
    d.text((M, 45), "ZHAOCAI SMART · CASE STUDY", font=F["latin_m"], fill=MUTED)
    page = f"0{slide_no} / 07"
    d.text((W - M - tw(d, page, F["latin_m"]), 45), page, font=F["latin_m"], fill=MUTED)
    d.line((M, 83, W - M, 83), fill=rgba(LINE), width=1)
    d.text((M, H - 54), label, font=F["latin_m"], fill=MUTED)
    d.text((W - M - tw(d, "CONFIDENTIAL · DE-IDENTIFIED", F["latin"]), H - 54), "CONFIDENTIAL · DE-IDENTIFIED", font=F["latin"], fill=MUTED)
    return img


def panel(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    fill: str = PANEL,
    outline: str = LINE,
    radius: int = 28,
    shadow: bool = False,
    canvas: Image.Image | None = None,
) -> None:
    if shadow and canvas is not None:
        x1, y1, x2, y2 = box
        layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        ld.rounded_rectangle((x1 + 6, y1 + 14, x2 + 6, y2 + 14), radius=radius, fill=(38, 31, 85, 30))
        layer = layer.filter(ImageFilter.GaussianBlur(18))
        canvas.alpha_composite(layer)
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=1)


def pill(draw: ImageDraw.ImageDraw, x: int, y: int, label: str, accent: str = PURPLE) -> int:
    w = tw(draw, label, F["small_m"]) + 34
    draw.rounded_rectangle((x, y, x + w, y + 46), radius=23, fill=rgba(accent, 18), outline=rgba(accent, 55))
    draw.text((x + 17, y + 8), label, font=F["small_m"], fill=accent)
    return x + w + 12


def eyebrow(
    draw: ImageDraw.ImageDraw,
    y: int,
    value: str,
    accent: str = PURPLE,
    x: int = M,
) -> None:
    draw.rounded_rectangle((x, y + 6, x + 9, y + 35), radius=5, fill=accent)
    draw.text((x + 25, y), value, font=F["small_m"], fill=accent)


def title(draw: ImageDraw.ImageDraw, value: str, subtitle: str = "", y: int = 118, accent: str = PURPLE) -> int:
    draw.text((M, y), value, font=F["h1"], fill=INK)
    draw.rounded_rectangle((M, y + 91, M + 102, y + 99), radius=4, fill=accent)
    if subtitle:
        text(draw, (M, y + 120), subtitle, F["lead"], MUTED, 1500, 12)
        return y + 195
    return y + 125


def crop_image(path: Path, crop: tuple[int, int, int, int] | None = None) -> Image.Image:
    with Image.open(path) as raw:
        im = raw.convert("RGBA")
    if crop:
        im = im.crop(crop)
    return im


def place_image(
    canvas: Image.Image,
    path: Path,
    box: tuple[int, int, int, int],
    crop: tuple[int, int, int, int] | None = None,
    mode: str = "cover",
    radius: int = 24,
    brightness: float = 1.0,
    border: bool = True,
) -> None:
    x1, y1, x2, y2 = box
    target_w, target_h = x2 - x1, y2 - y1
    im = crop_image(path, crop)
    if brightness != 1.0:
        im = ImageEnhance.Brightness(im).enhance(brightness)
    ratio = max(target_w / im.width, target_h / im.height) if mode == "cover" else min(target_w / im.width, target_h / im.height)
    size = (max(1, round(im.width * ratio)), max(1, round(im.height * ratio)))
    im = im.resize(size, Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", (target_w, target_h), rgba("#FFFFFF"))
    ox, oy = (target_w - im.width) // 2, (target_h - im.height) // 2
    frame.alpha_composite(im, (ox, oy))
    mask = Image.new("L", (target_w, target_h), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, target_w, target_h), radius=radius, fill=255)
    canvas.paste(frame, (x1, y1), mask)
    if border:
        ImageDraw.Draw(canvas).rounded_rectangle(box, radius=radius, outline=rgba("#D7D9E5"), width=1)


def metric(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], number: str, label: str, accent: str = PURPLE) -> None:
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=22, fill=rgba("#FFFFFF"), outline=rgba(LINE), width=1)
    draw.text((x1 + 24, y1 + 20), number, font=F["num"], fill=accent)
    text(draw, (x1 + 27, y1 + 108), label, F["small_m"], TEXT, x2 - x1 - 54, 8)


def numbered_card(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    index: str,
    heading: str,
    body: str,
    accent: str = PURPLE,
    fill: str = PANEL,
) -> None:
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=24, fill=fill, outline=rgba(LINE), width=1)
    draw.rounded_rectangle((x1 + 22, y1 + 22, x1 + 68, y1 + 68), radius=14, fill=rgba(accent, 24))
    draw.text((x1 + 33, y1 + 31), index, font=F["latin_m"], fill=accent)
    draw.text((x1 + 86, y1 + 25), heading, font=F["h3"], fill=INK)
    text(draw, (x1 + 26, y1 + 88), body, F["small"], MUTED, x2 - x1 - 52, 9)


def save(img: Image.Image, name: str) -> Path:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    path = OUTPUT / name
    # Pillow stores translucent drawing primitives as straight-alpha pixels.
    # Flattening here preserves the intended pale tints instead of discarding alpha.
    flattened = Image.new("RGBA", img.size, "#FFFFFF")
    flattened.alpha_composite(img)
    flattened.convert("RGB").save(path, format="PNG", compress_level=7)
    print(f"saved {path.name}")
    return path


def slide_01() -> Path:
    img = base(1, "PROJECT OVERVIEW")
    d = ImageDraw.Draw(img)

    d.text((M, 150), "招财 Smart", font=F["display"], fill=INK)
    d.text((M, 262), "让复杂企业数据，", font=F["h2"], fill=TEXT)
    text(d, (M, 330), "变成可追问、可解释、\n可复盘的答案", F["h2"], PURPLE, 680, 10)
    text(
        d,
        (M, 474),
        "面向企业财务与经营场景的智能问数产品。我的工作不是只画一个聊天框，\n而是把自然语言、数据查询、AI 处理过程与看板沉淀连成完整体验。",
        F["body"],
        MUTED,
        660,
        10,
    )

    x = M
    for label in ["企业级 AI", "智能问数", "B 端产品", "端到端体验"]:
        x = pill(d, x, 624, label)

    panel(d, (M, 696, 720, 942), fill="#FFFFFF", shadow=True, canvas=img)
    meta = [
        ("职责", "交互策略 · UI 设计 · 设计规范"),
        ("核心场景", "问数对话 · 澄清 · 执行反馈 · 看板"),
        ("交付", "PC 端核心链路与可复用组件规则"),
    ]
    for i, (k, v) in enumerate(meta):
        y = 726 + i * 64
        d.text((M + 28, y), k, font=F["small_m"], fill=PURPLE)
        d.text((M + 132, y), v, font=F["small"], fill=TEXT)

    place_image(img, source("07-project-background.png"), (820, 132, 1838, 942), crop=(720, 100, 1918, 1078), mode="cover", radius=34)
    d.rounded_rectangle((1270, 842, 1792, 914), radius=22, fill=rgba("#19152E", 228))
    d.text((1302, 861), "从“能回答”走向“值得信任”", font=F["body_m"], fill="#FFFFFF")
    return save(img, "01-cover-and-overview.png")


def slide_02() -> Path:
    img = base(2, "CONTEXT & DESIGN TARGET")
    d = ImageDraw.Draw(img)
    title(d, "业务人员不是缺数据，而是离答案太远", "先把真实阻力讲清楚，再定义产品应该承担的角色。")

    cards = [
        ("01", "查询门槛高", "依赖分析师或 IT，通过 SQL 与固定报表获取信息，业务人员难以自主探索。"),
        ("02", "链路不透明", "AI 能给结果，但识别、检索、计算与渲染不可见，等待过程缺少信任。"),
        ("03", "洞察难沉淀", "一次问答解决即时问题，却很难继续追踪、组合与复盘高价值图表。"),
    ]
    y0 = 354
    for i, (idx, heading, body) in enumerate(cards):
        numbered_card(d, (M, y0 + i * 182, 760, y0 + 156 + i * 182), idx, heading, body)

    panel(d, (822, 354, 1828, 890), fill="#FFFFFF", shadow=True, canvas=img)
    eyebrow(d, 388, "DESIGN TARGET", x=866)
    d.text((866, 448), "让业务人员用自然语言完成", font=F["h3"], fill=INK)
    d.text((866, 501), "“提问 → 理解 → 决策 → 复盘”", font=F["h2"], fill=PURPLE)
    d.line((866, 585, 1780, 585), fill=rgba(LINE), width=1)

    goals = [
        ("降低门槛", "把专业查询转译成日常表达"),
        ("建立信任", "让不确定性、等待与异常可被理解"),
        ("沉淀资产", "把高价值结果组织成可复用看板"),
    ]
    for i, (heading, body) in enumerate(goals):
        x = 866 + i * 300
        d.rounded_rectangle((x, 634, x + 270, 816), radius=22, fill=rgba(LILAC), outline=rgba("#DDD7FF"), width=1)
        d.text((x + 22, 657), f"0{i + 1}", font=F["latin_m"], fill=PURPLE)
        d.text((x + 22, 694), heading, font=F["body_m"], fill=INK)
        text(d, (x + 22, 741), body, F["small"], MUTED, 224, 7)

    d.rounded_rectangle((822, 916, 1828, 975), radius=20, fill=rgba("#171A2B"))
    d.text((856, 930), "设计判断：AI 产品的体验上限，不只取决于回答质量，也取决于用户是否理解它正在做什么。", font=F["small_m"], fill="#FFFFFF")
    return save(img, "02-context-and-goals.png")


def slide_03() -> Path:
    img = base(3, "EXPERIENCE STRATEGY")
    d = ImageDraw.Draw(img)
    title(d, "把一次问数，设计成可理解的完整旅程", "四个关键节点分别解决“不会问、看不懂、等不住、留不下”。")

    steps = [
        ("01", "提出问题", "自然语言输入", "降低专业门槛"),
        ("02", "补全意图", "主动澄清机制", "避免错误执行"),
        ("03", "理解过程", "阶段状态反馈", "建立等待信任"),
        ("04", "沉淀结果", "卡片与看板", "支持长期复盘"),
    ]
    x0, y = M, 340
    gap = 22
    cw = (W - 2 * M - gap * 3) // 4
    for i, (idx, heading, feature, outcome) in enumerate(steps):
        x = x0 + i * (cw + gap)
        d.rounded_rectangle((x, y, x + cw, y + 220), radius=26, fill="#FFFFFF", outline=rgba(LINE), width=1)
        d.text((x + 25, y + 22), idx, font=F["num"], fill=rgba(PURPLE, 115))
        d.text((x + 25, y + 108), heading, font=F["h3"], fill=INK)
        d.text((x + 25, y + 154), feature, font=F["small_m"], fill=PURPLE)
        d.text((x + 25, y + 188), outcome, font=F["caption"], fill=MUTED)
        if i < 3:
            ax = x + cw + 5
            d.line((ax, y + 109, ax + 12, y + 109), fill=rgba(PURPLE), width=3)
            d.polygon([(ax + 12, y + 103), (ax + 22, y + 109), (ax + 12, y + 115)], fill=rgba(PURPLE))

    panels = [
        (source("06-semantic-clarification.png"), (54, 222, 1122, 1020), "语义澄清", "将模糊指令转成可确认选项"),
        (source("02-process-visualization.png"), (1300, 278, 1878, 1005), "过程反馈", "把空白等待拆成阶段状态"),
        (source("05-board-interaction.png"), (82, 345, 1745, 870), "看板沉淀", "把图表组合成长期业务视图"),
    ]
    boxes = [(M, 608, 635, 938), (657, 608, 1199, 938), (1221, 608, 1828, 938)]
    for (path, crop, heading, desc), box in zip(panels, boxes):
        x1, y1, x2, y2 = box
        place_image(img, path, (x1, y1, x2, y2 - 76), crop=crop, mode="cover", radius=22)
        d.rounded_rectangle((x1, y2 - 91, x2, y2), radius=22, fill="#FFFFFF", outline=rgba(LINE), width=1)
        d.text((x1 + 22, y2 - 77), heading, font=F["small_m"], fill=INK)
        d.text((x1 + 22, y2 - 43), desc, font=F["caption"], fill=MUTED)
    return save(img, "03-experience-strategy.png")


def slide_04() -> Path:
    img = base(4, "KEY MECHANISM 01 · CLARIFICATION")
    d = ImageDraw.Draw(img)
    title(d, "不猜用户想要什么：先把模糊意图变准确", "当系统识别到关键信息缺失时，用轻量选项补全语义，再进入查询。")

    # State sequence uses the original interaction evidence, enlarged and reframed.
    source_path = source("06-semantic-clarification.png")
    states = [
        ((73, 257, 550, 421), "01  识别输入", "提取文本与业务条件"),
        ((82, 493, 470, 691), "02A  信息充分", "直接进入任务执行"),
        ((509, 487, 753, 775), "02B  信息不足", "提供有限选项，而非报错"),
        ((848, 487, 1125, 700), "03  完成澄清", "让用户确认后继续"),
    ]
    boxes = [(M, 354, 505, 610), (531, 354, 946, 610), (972, 354, 1387, 610), (1413, 354, 1828, 610)]
    for (crop, heading, desc), box in zip(states, boxes):
        x1, y1, x2, y2 = box
        place_image(img, source_path, (x1, y1, x2, y2 - 70), crop=crop, mode="cover", radius=20)
        d.rounded_rectangle((x1, y2 - 83, x2, y2), radius=20, fill="#FFFFFF", outline=rgba(LINE), width=1)
        d.text((x1 + 18, y2 - 70), heading, font=F["small_m"], fill=INK)
        d.text((x1 + 18, y2 - 36), desc, font=F["caption"], fill=MUTED)

    panel(d, (M, 666, 1135, 932), fill="#FFFFFF", shadow=True, canvas=img)
    eyebrow(d, 698, "CORE DECISIONS", x=M + 24)
    decisions = [
        ("主动触发，而非事后纠错", "在执行前识别缺失条件，避免一次错误查询消耗更长等待。"),
        ("有限选择，而非开放追问", "提供业务相关候选项，降低用户再次组织专业语言的负担。"),
        ("保留控制权", "明确当前理解并允许确认，让 AI 的不确定性对用户可见。"),
    ]
    for i, (heading, body) in enumerate(decisions):
        y = 753 + i * 57
        d.ellipse((M + 36, y + 7, M + 48, y + 19), fill=rgba(PURPLE))
        d.text((M + 66, y), heading, font=F["small_m"], fill=INK)
        d.text((M + 315, y), body, font=F["small"], fill=MUTED)

    panel(d, (1167, 666, 1828, 932), fill=INK, outline=INK)
    d.text((1201, 705), "体验原则", font=F["small_m"], fill=rgba("#CFC7FF"))
    text(d, (1201, 756), "不把不确定性\n包装成确定答案。", F["h2"], "#FFFFFF", 560, 12)
    d.line((1201, 876, 1784, 876), fill=(255, 255, 255, 45), width=1)
    d.text((1201, 890), "CLARITY BEFORE EXECUTION", font=F["latin_m"], fill=rgba("#CFC7FF"))
    return save(img, "04-semantic-clarification.png")


def slide_05() -> Path:
    img = base(5, "KEY MECHANISM 02 · PROCESS FEEDBACK")
    d = ImageDraw.Draw(img)
    title(d, "等待不是空白：把 AI 过程变成信任线索", "用结构化阶段、异常解释与渐进输出，让用户知道系统仍在推进。")

    # Left: readable state model.
    panel(d, (M, 350, 810, 938), fill="#FFFFFF", shadow=True, canvas=img)
    eyebrow(d, 382, "VISIBLE PROCESS", x=M + 24)
    process = [
        ("01", "理解问题", "识别问题类型与关键条件", PURPLE),
        ("02", "检索数据", "调用业务知识与数据源", BLUE),
        ("03", "分析计算", "执行查询、校验与归因", CYAN),
        ("04", "组织答案", "图表与结论渐进呈现", GREEN),
    ]
    for i, (idx, heading, body, accent) in enumerate(process):
        y = 444 + i * 95
        d.rounded_rectangle((M + 34, y, M + 98, y + 64), radius=18, fill=rgba(accent, 24))
        d.text((M + 51, y + 21), idx, font=F["latin_m"], fill=accent)
        d.text((M + 122, y + 2), heading, font=F["body_m"], fill=INK)
        d.text((M + 122, y + 39), body, font=F["small"], fill=MUTED)
        if i < 3:
            d.line((M + 66, y + 66, M + 66, y + 91), fill=rgba("#C8CBD8"), width=2)

    d.line((M + 34, 842, 768, 842), fill=rgba(LINE), width=1)
    d.text((M + 34, 864), "异常也要被解释", font=F["small_m"], fill=INK)
    d.text((M + 230, 864), "超时给预计反馈 · 空数据给下一步建议", font=F["small"], fill=ORANGE)

    # Right: output proof from the source material.
    panel(d, (846, 350, 1828, 938), fill="#FFFFFF", shadow=True, canvas=img)
    place_image(img, source("02-process-visualization.png"), (882, 382, 1262, 818), crop=(1392, 318, 1792, 755), mode="cover", radius=20)
    place_image(img, source("02-process-visualization.png"), (1290, 382, 1792, 648), crop=(1400, 733, 1815, 936), mode="cover", radius=20)
    d.text((1290, 674), "结果表格与数据出处", font=F["body_m"], fill=INK)
    text(d, (1290, 714), "完成后保留步骤、表格与解释，\n支持回看和异常定位。", F["small"], MUTED, 480, 8)
    d.text((882, 850), "完成态：步骤记录 + 结果表格 + 解释文本", font=F["body_m"], fill=INK)
    d.text((882, 891), "用户即使经历较长查询，也能回看系统做过什么。", font=F["small"], fill=MUTED)
    d.rounded_rectangle((1544, 848, 1792, 908), radius=20, fill=rgba(LILAC))
    d.text((1572, 864), "可追溯 · 可恢复", font=F["small_m"], fill=PURPLE)
    return save(img, "05-process-visualization.png")


def slide_06() -> Path:
    img = base(6, "KEY MECHANISM 03 · BOARD")
    d = ImageDraw.Draw(img)
    title(d, "从一次问答到长期复盘：让洞察可沉淀", "对话解决即时探索；看板负责持续追踪。通过“卡片 + 合辑”连接两种节奏。")

    place_image(img, source("05-board-interaction.png"), (M, 345, 1160, 875), crop=(90, 345, 1740, 865), mode="cover", radius=28)

    panel(d, (1200, 345, 1828, 875), fill="#FFFFFF", shadow=True, canvas=img)
    eyebrow(d, 382, "INTERACTION MODEL", x=1244)
    text(d, (1244, 438), "卡片是单次洞察，\n合辑是长期业务主题。", F["h3"], INK, 530, 12)

    decisions = [
        ("拖拽预览", "接近合并区域时，用高亮与占位提前显示结果。"),
        ("悬停阈值", "0.5 秒触发空间反馈，避免移动途中误判。"),
        ("二次确认", "松手后确认合并，保留用户对信息结构的控制。"),
    ]
    for i, (heading, body) in enumerate(decisions):
        y = 565 + i * 88
        d.text((1244, y), f"0{i + 1}", font=F["latin_m"], fill=PURPLE)
        d.text((1290, y - 3), heading, font=F["body_m"], fill=INK)
        text(d, (1290, y + 35), body, F["small"], MUTED, 480, 7)

    d.rounded_rectangle((M, 905, 1828, 971), radius=22, fill=INK)
    d.text((M + 30, 921), "价值链", font=F["small_m"], fill=rgba("#CFC7FF"))
    d.text((M + 132, 921), "减少重复检索", font=F["small_m"], fill="#FFFFFF")
    d.text((M + 345, 921), "→", font=F["small_m"], fill=PURPLE_2)
    d.text((M + 397, 921), "保留高价值洞察", font=F["small_m"], fill="#FFFFFF")
    d.text((M + 642, 921), "→", font=F["small_m"], fill=PURPLE_2)
    d.text((M + 694, 921), "支持跨时间复盘", font=F["small_m"], fill="#FFFFFF")
    d.text((M + 939, 921), "→", font=F["small_m"], fill=PURPLE_2)
    d.text((M + 991, 921), "形成可共享的业务视图", font=F["small_m"], fill="#FFFFFF")
    return save(img, "06-board-and-insight-retention.png")


def slide_07() -> Path:
    img = base(7, "SYSTEM & OUTCOME")
    d = ImageDraw.Draw(img)
    title(d, "用统一渲染规则，让答案稳定、可读、可复用", "规范不是最后的包装，而是让 AI 输出在复杂业务里保持一致的基础设施。")

    place_image(img, source("01-design-system.png"), (M, 344, 1030, 875), crop=(70, 175, 1010, 975), mode="cover", radius=28)

    panel(d, (1070, 344, 1828, 875), fill="#FFFFFF", shadow=True, canvas=img)
    eyebrow(d, 382, "DELIVERED CAPABILITIES", x=1114)
    items = [
        ("01", "语义澄清", "把模糊问题转成可确认意图"),
        ("02", "过程状态", "把长等待变成可理解阶段"),
        ("03", "看板合辑", "把一次结果沉淀为长期资产"),
        ("04", "Markdown 规范", "统一标题、表格、引用、公式与代码"),
    ]
    for i, (idx, heading, body) in enumerate(items):
        y = 438 + i * 88
        d.rounded_rectangle((1114, y, 1170, y + 56), radius=17, fill=rgba(LILAC))
        d.text((1130, y + 17), idx, font=F["latin_m"], fill=PURPLE)
        d.text((1192, y), heading, font=F["body_m"], fill=INK)
        d.text((1192, y + 37), body, font=F["small"], fill=MUTED)

    d.line((1114, 806, 1784, 806), fill=rgba(LINE), width=1)
    d.text((1114, 826), "最终形成：交互机制 + 视觉规则 + 组件资产 + 关键场景方案", font=F["small_m"], fill=PURPLE)

    d.rounded_rectangle((M, 907, 1828, 975), radius=22, fill=rgba("#FFF6EC"), outline=rgba("#F4D8B9"), width=1)
    d.text((M + 28, 923), "作品集仍建议补充", font=F["small_m"], fill=ORANGE)
    d.text((M + 235, 923), "任务成功率 · 澄清完成率 · 等待退出率 · 看板复访率", font=F["small_m"], fill=INK)
    d.text((M + 1014, 923), "— 有真实数据再写，不用虚构指标。", font=F["small"], fill=MUTED)
    return save(img, "07-design-system-and-outcomes.png")


def contact_sheet(paths: list[Path]) -> Path:
    thumb_w, thumb_h = 768, 432
    gap = 34
    cols = 2
    rows = math.ceil(len(paths) / cols)
    sheet_w = gap * 3 + thumb_w * 2
    sheet_h = 112 + rows * (thumb_h + 70) + gap * (rows + 1)
    sheet = Image.new("RGB", (sheet_w, sheet_h), "#ECECF3")
    d = ImageDraw.Draw(sheet)
    d.text((gap, 30), "ZHAOCAI SMART · REFINED CASE STUDY", font=font(32, "semibold", latin=True), fill=INK)
    for i, path in enumerate(paths):
        row, col = divmod(i, cols)
        x = gap + col * (thumb_w + gap)
        y = 112 + gap + row * (thumb_h + 70 + gap)
        with Image.open(path) as src:
            im = src.convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        sheet.paste(im, (x, y))
        d.text((x, y + thumb_h + 15), path.stem, font=font(20, latin=True), fill=MUTED)
    out = OUTPUT / "00-contact-sheet.jpg"
    sheet.save(out, quality=90, optimize=True)
    print(f"saved {out.name}")
    return out


def main() -> None:
    required = [
        source("01-design-system.png"),
        source("02-process-visualization.png"),
        source("05-board-interaction.png"),
        source("06-semantic-clarification.png"),
        source("07-project-background.png"),
    ]
    missing = [str(path) for path in required if not path.exists()]
    if missing:
        raise SystemExit("Missing source images:\n" + "\n".join(missing))

    paths = [slide_01(), slide_02(), slide_03(), slide_04(), slide_05(), slide_06(), slide_07()]
    contact_sheet(paths)


if __name__ == "__main__":
    main()
