#!/usr/bin/env python3
"""Build a curated 1920px-wide portfolio image set from Leo's source PDF pages."""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tmp" / "pdfs"
ASSETS = ROOT / "assets"
OUTPUT = ROOT / "output" / "portfolio-images"

W = 1920
M = 150
CONTENT_W = W - M * 2

BG = "#05080D"
PANEL = "#0B111A"
PANEL_2 = "#101925"
LINE = "#25364A"
WHITE = "#F5FAFF"
TEXT = "#DCE9F5"
MUTED = "#8EA4B8"
BLUE = "#2B7CFF"
CYAN = "#3FE6FF"
GREEN = "#5FF0C1"
ORANGE = "#FFB45F"

FONT_CN = "/System/Library/Fonts/Hiragino Sans GB.ttc"
FONT_LATIN = "/System/Library/Fonts/HelveticaNeue.ttc"


def font(size: int, bold: bool = False, latin: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_LATIN if latin else FONT_CN
    # Hiragino's collection exposes a heavier face at index 1 in this runtime.
    index = 1 if bold and not latin else 0
    try:
        return ImageFont.truetype(path, size=size, index=index)
    except OSError:
        return ImageFont.truetype(FONT_CN, size=size)


F = {
    "micro": font(20),
    "small": font(26),
    "body": font(31),
    "body_b": font(31, True),
    "meta": font(34),
    "h3": font(42, True),
    "h2": font(60, True),
    "h1": font(104, True),
    "display": font(132, True),
    "num": font(180, True, latin=True),
    "latin": font(29, latin=True),
    "latin_b": font(29, True, latin=True),
}


def page_path(n: int) -> Path:
    return SOURCE / f"portfolio-page-{n:02d}.png"


def asset(rel: str) -> Path:
    return ASSETS / rel


def hex_rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def base_canvas(height: int, seed: int = 0, accent: str = BLUE) -> Image.Image:
    img = Image.new("RGBA", (W, height), hex_rgba(BG))
    px = img.load()
    top = hex_rgba("#0A1421")
    bottom = hex_rgba(BG)
    for y in range(height):
        t = min(1.0, y / max(1, height * 0.72))
        t = t * t * (3 - 2 * t)
        row = tuple(round(top[i] * (1 - t) + bottom[i] * t) for i in range(3)) + (255,)
        for x in range(W):
            px[x, y] = row

    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    ac = hex_rgba(accent)
    gd.ellipse((-450, -350, 880, 980), fill=ac[:3] + (34,))
    gd.ellipse((W - 720, height * 0.30, W + 450, height * 0.62), fill=ac[:3] + (18,))
    glow = glow.filter(ImageFilter.GaussianBlur(140))
    img = Image.alpha_composite(img, glow)

    d = ImageDraw.Draw(img)
    for x in range(M, W - M + 1, 96):
        d.line((x, 0, x, height), fill=(90, 145, 190, 11), width=1)
    for y in range(120, height, 96):
        d.line((0, y, W, y), fill=(90, 145, 190, 9), width=1)

    rnd = random.Random(seed)
    for _ in range(max(60, height // 25)):
        x = rnd.randrange(W)
        y = rnd.randrange(height)
        a = rnd.randrange(9, 25)
        d.point((x, y), fill=(160, 220, 255, a))
    return img


def text_width(draw: ImageDraw.ImageDraw, value: str, fnt: ImageFont.FreeTypeFont) -> float:
    return draw.textlength(value, font=fnt)


def wrap_text(draw: ImageDraw.ImageDraw, value: str, fnt: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines: list[str] = []
    for paragraph in value.split("\n"):
        if not paragraph:
            lines.append("")
            continue
        current = ""
        for ch in paragraph:
            test = current + ch
            if current and text_width(draw, test, fnt) > width:
                lines.append(current.rstrip())
                current = ch.lstrip()
            else:
                current = test
        if current:
            lines.append(current.rstrip())
    return lines


def draw_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    value: str,
    fnt: ImageFont.FreeTypeFont,
    fill: str | tuple[int, int, int, int] = TEXT,
    width: int | None = None,
    line_gap: int = 14,
) -> int:
    x, y = xy
    lines = value.split("\n") if width is None else wrap_text(draw, value, fnt, width)
    bbox = draw.textbbox((0, 0), "永Ag", font=fnt)
    line_h = bbox[3] - bbox[1] + line_gap
    for line in lines:
        draw.text((x, y), line, font=fnt, fill=fill)
        y += line_h
    return y


def round_rect(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    radius: int = 28,
    fill: str = PANEL,
    outline: str = LINE,
    width: int = 1,
) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def pill(draw: ImageDraw.ImageDraw, x: int, y: int, label: str, accent: str = BLUE) -> int:
    fnt = F["small"]
    tw = math.ceil(text_width(draw, label, fnt))
    w = tw + 42
    round_rect(draw, (x, y, x + w, y + 54), radius=27, fill="#101C2B", outline=accent)
    draw.text((x + 21, y + 11), label, font=fnt, fill=WHITE)
    return x + w + 14


def topbar(draw: ImageDraw.ImageDraw, page_no: str, section: str) -> None:
    draw.text((M, 72), "LEO / UI·UX DESIGN PORTFOLIO", font=F["latin_b"], fill=WHITE)
    draw.text((M, 112), section.upper(), font=F["latin"], fill=MUTED)
    right = f"{page_no}  /  10"
    tw = text_width(draw, right, F["latin"])
    draw.text((W - M - tw, 76), right, font=F["latin"], fill=MUTED)
    draw.line((M, 162, W - M, 162), fill=hex_rgba(LINE), width=1)


def footer(draw: ImageDraw.ImageDraw, height: int, note: str = "COMPLEX SYSTEMS, MADE CLEAR.") -> None:
    y = height - 90
    draw.line((M, y - 28, W - M, y - 28), fill=hex_rgba(LINE), width=1)
    draw.text((M, y), note, font=F["latin"], fill=MUTED)
    right = "LI JIAHAO  ·  SHENZHEN"
    tw = text_width(draw, right, F["latin"])
    draw.text((W - M - tw, y), right, font=F["latin"], fill=MUTED)


def section_title(draw: ImageDraw.ImageDraw, y: int, number: str, title: str, subtitle: str = "") -> int:
    draw.text((M, y), number, font=F["meta"], fill=CYAN)
    draw.text((M + 94, y - 14), title, font=F["h2"], fill=WHITE)
    if subtitle:
        draw_text(draw, (M + 94, y + 70), subtitle, F["body"], MUTED, CONTENT_W - 94, 16)
    return y + 146


def label(draw: ImageDraw.ImageDraw, x: int, y: int, value: str, accent: str = CYAN) -> None:
    draw.rounded_rectangle((x, y, x + 10, y + 46), radius=5, fill=accent)
    draw.text((x + 30, y + 4), value, font=F["body_b"], fill=WHITE)


def card_text(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    title: str,
    body: str,
    index: str | None = None,
    accent: str = BLUE,
) -> None:
    x1, y1, x2, y2 = box
    round_rect(draw, box, radius=30, fill=PANEL, outline=LINE)
    if index:
        draw.text((x1 + 34, y1 + 28), index, font=F["latin_b"], fill=accent)
        title_y = y1 + 77
    else:
        title_y = y1 + 34
    draw.text((x1 + 34, title_y), title, font=F["h3"], fill=WHITE)
    draw_text(draw, (x1 + 34, title_y + 68), body, F["body"], MUTED, x2 - x1 - 68, 13)


def image_frame(
    canvas: Image.Image,
    source: Path,
    box: tuple[int, int, int, int],
    caption: str = "",
    crop: bool = False,
    dim: float = 1.0,
) -> None:
    x1, y1, x2, y2 = box
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((x1 + 10, y1 + 18, x2 + 10, y2 + 18), radius=30, fill=(0, 0, 0, 125))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    canvas.alpha_composite(shadow)

    border = 12
    inner_w = x2 - x1 - border * 2
    inner_h = y2 - y1 - border * 2
    with Image.open(source) as src_im:
        src = src_im.convert("RGB")
    if dim != 1.0:
        src = ImageEnhance.Brightness(src).enhance(dim)
    if crop:
        ratio = max(inner_w / src.width, inner_h / src.height)
    else:
        ratio = min(inner_w / src.width, inner_h / src.height)
    size = (max(1, round(src.width * ratio)), max(1, round(src.height * ratio)))
    src = src.resize(size, Image.Resampling.LANCZOS)
    bg = Image.new("RGBA", (x2 - x1, y2 - y1), hex_rgba("#EAF2FA"))
    ox = ((x2 - x1) - src.width) // 2
    oy = ((y2 - y1) - src.height) // 2
    bg.alpha_composite(src.convert("RGBA"), (ox, oy))
    mask = Image.new("L", bg.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, bg.width, bg.height), radius=28, fill=255)
    canvas.paste(bg, (x1, y1), mask)
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle(box, radius=28, outline=hex_rgba("#40566F"), width=2)
    if caption:
        cap_w = min(620, math.ceil(text_width(d, caption, F["small"])) + 44)
        d.rounded_rectangle((x1 + 26, y2 - 82, x1 + 26 + cap_w, y2 - 28), radius=27, fill=(4, 12, 22, 218))
        d.text((x1 + 48, y2 - 72), caption, font=F["small"], fill=WHITE)


def save(canvas: Image.Image, name: str) -> Path:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    path = OUTPUT / name
    canvas.convert("RGB").save(path, format="PNG", compress_level=8)
    print(f"saved {path.name}: {canvas.width}x{canvas.height}")
    return path


def build_cover() -> Path:
    h = 1500
    img = base_canvas(h, 1, CYAN)
    d = ImageDraw.Draw(img)
    topbar(d, "01", "Portfolio cover")

    d.text((M, 270), "2026 SELECTED WORKS", font=F["latin_b"], fill=CYAN)
    y = draw_text(d, (M, 350), "把复杂业务，", F["display"], WHITE)
    y = draw_text(d, (M, y - 6), "做成清晰可落地的体验。", F["h1"], WHITE)
    d.text((M, y + 32), "COMPLEX SYSTEMS, MADE CLEAR.", font=F["latin_b"], fill=MUTED)

    x = M
    for item in ["B 端产品", "AI 体验", "智能工作流", "设计系统"]:
        x = pill(d, x, y + 105, item)

    d.text((M, 1140), "LI JIAHAO", font=F["h2"], fill=WHITE)
    d.text((M, 1218), "UI/UX & INTERACTION DESIGNER  ·  SHENZHEN", font=F["latin"], fill=MUTED)
    footer(ImageDraw.Draw(img), h)
    return save(img, "01-cover.png")


def build_profile() -> Path:
    h = 3400
    img = base_canvas(h, 2, BLUE)
    d = ImageDraw.Draw(img)
    topbar(d, "02", "Profile & selected work")

    d.text((M, 255), "李家豪", font=F["h1"], fill=WHITE)
    d.text((M, 385), "UI/UX & INTERACTION DESIGNER", font=F["latin_b"], fill=CYAN)
    draw_text(
        d,
        (M, 465),
        "专注 B 端复杂系统、多端产品体验与设计系统。\n从业务梳理、信息架构到高保真交付，让高密度业务界面更清晰、高效、可持续迭代。",
        F["body"],
        TEXT,
        920,
        18,
    )
    d.text((1265, 245), "5+", font=F["num"], fill=(63, 230, 255, 142))
    d.text((1268, 450), "YEARS OF PRODUCT DESIGN", font=F["latin_b"], fill=MUTED)

    y = 780
    section_title(d, y, "01", "能力模型", "把策略、交互、视觉和交付放在一套工作方法里。")
    gap = 24
    cw = (CONTENT_W - gap * 2) // 3
    cards = [
        ("复杂系统", "信息架构、表单表格、状态和权限场景的体验梳理。", "01"),
        ("多端体验", "PC、App 与小程序在同一业务体系中的任务连续性。", "02"),
        ("设计系统", "组件、栅格、颜色、表格和弹窗规则的系统化沉淀。", "03"),
        ("数据可视化", "指标、地图、趋势和异常的层级组织与深色叙事。", "04"),
        ("AI 体验", "对话式意图澄清、执行过程反馈与结果可信度设计。", "05"),
        ("交付落地", "和产品、业务及开发协作，从方案评审走到上线。", "06"),
    ]
    for i, (title, body, idx) in enumerate(cards):
        row, col = divmod(i, 3)
        x1 = M + col * (cw + gap)
        y1 = 965 + row * 265
        card_text(d, (x1, y1, x1 + cw, y1 + 235), title, body, idx)

    y = 1525
    section_title(d, y, "02", "精选项目", "以 2 个完整案例证明决策和落地，再用专题展示扩展能力。")
    projects = [
        ("01", "税纪云 2.0 产品生态", "WEB · APP · MINI PROGRAM", "高密度财税业务的架构重组与多端延展。"),
        ("02", "国家能源集团报税平台", "WEB · DASHBOARD · SYSTEM", "从 0 到 1 搭建行业定制平台与专属组件体系。"),
        ("03", "数据可视化大屏", "VISUALISATION", "把实时状态、趋势和异常整理为可汇报的视觉系统。"),
        ("04", "AIGC · C4D · 方法", "EXPERIMENTS & PRINCIPLES", "用视觉实验与交互原则补全产品表达能力。"),
    ]
    pw = (CONTENT_W - gap) // 2
    for i, (idx, title, meta, body) in enumerate(projects):
        row, col = divmod(i, 2)
        x1 = M + col * (pw + gap)
        y1 = 1715 + row * 275
        round_rect(d, (x1, y1, x1 + pw, y1 + 245), 28, PANEL_2, LINE)
        d.text((x1 + 34, y1 + 28), idx, font=F["h3"], fill=CYAN)
        d.text((x1 + 112, y1 + 34), title, font=F["h3"], fill=WHITE)
        d.text((x1 + 112, y1 + 92), meta, font=F["latin"], fill=BLUE)
        draw_text(d, (x1 + 112, y1 + 139), body, F["body"], MUTED, pw - 146, 12)

    section_title(d, 2305, "03", "工作经历", "从多端工具产品、财税平台到 AI 问答与金融定制系统。")
    experiences = [
        ("2025.07 — NOW", "上海荣宇智能信息技术（外派·智谱 AI）", "UED & UI 设计师", "AI 问答、智能体、单证识别与金融系统定制体验。"),
        ("2024.05 — 2025.02", "答税科技（深圳）有限公司", "UI & UX 设计师", "企业报税产品、业务流程、商业演示与运营物料。"),
        ("2021.07 — 2024.05", "华盟财税科技（深圳）有限公司", "UI & UX 设计师", "财税 B 端系统、移动端产品、数据大屏与组件规范。"),
        ("2020.07 — 2021.07", "深圳喆云科技有限公司", "UI 设计师", "小程序、工具型产品与官网的多端界面设计。"),
    ]
    for i, (date, company, role, body) in enumerate(experiences):
        row, col = divmod(i, 2)
        x1 = M + col * (pw + gap)
        y1 = 2500 + row * 315
        round_rect(d, (x1, y1, x1 + pw, y1 + 285), 28, PANEL, LINE)
        d.text((x1 + 34, y1 + 28), date, font=F["latin_b"], fill=CYAN)
        draw_text(d, (x1 + 34, y1 + 76), company, F["h3"], WHITE, pw - 68, 10)
        d.text((x1 + 34, y1 + 183), role, font=F["body_b"], fill=BLUE)
        draw_text(d, (x1 + 34, y1 + 227), body, F["small"], MUTED, pw - 68, 10)

    footer(d, h)
    return save(img, "02-profile-and-index.png")


def build_tax_overview() -> Path:
    h = 2550
    img = base_canvas(h, 3, BLUE)
    d = ImageDraw.Draw(img)
    topbar(d, "03", "Case study 01 / Tax Cloud")

    d.text((M, 248), "01", font=F["num"], fill=(63, 230, 255, 78))
    d.text((M + 315, 285), "税纪云 2.0", font=F["h1"], fill=WHITE)
    d.text((M + 315, 405), "企业财税平台的多端体验升级", font=F["h2"], fill=TEXT)
    draw_text(
        d,
        (M + 315, 500),
        "将高密度的查询、查验、审核和状态反馈重组为清晰任务，\n并让 Web、App 和小程序共享一套业务语言。",
        F["body"],
        MUTED,
        1170,
        17,
    )

    meta_y = 690
    meta = [
        ("PROJECT", "税纪云 2.0"),
        ("PERIOD", "2021—2024"),
        ("ROLE", "UI/UX 设计"),
        ("SCOPE", "Web / App / 小程序"),
    ]
    mw = CONTENT_W // 4
    for i, (k, v) in enumerate(meta):
        x = M + i * mw
        d.text((x, meta_y), k, font=F["latin_b"], fill=BLUE)
        d.text((x, meta_y + 44), v, font=F["body_b"], fill=WHITE)
        if i < 3:
            d.line((x + mw - 24, meta_y, x + mw - 24, meta_y + 105), fill=hex_rgba(LINE), width=1)

    image_frame(img, page_path(4), (M, 865, W - M, 1742), "PROJECT OVERVIEW")

    section_title(d, 1850, "01", "为什么要重做", "问题不只是“界面不统一”，而是用户无法快速理解当前任务和下一步。")
    gap = 24
    cw = (CONTENT_W - gap * 2) // 3
    challenges = [
        ("信息密度高", "筛选、表格、表单与税表同时出现，关键状态容易被淹没。", "01"),
        ("模块规则不一", "同类任务在不同页面中反馈不一致，增加学习成本。", "02"),
        ("跨端任务断裂", "移动端需要承接待办、审批和提醒，而不是缩小版 PC。", "03"),
    ]
    for i, (title, body, idx) in enumerate(challenges):
        x = M + i * (cw + gap)
        card_text(d, (x, 2070, x + cw, 2360), title, body, idx)
    footer(d, h)
    return save(img, "03-tax-cloud-overview.png")


def build_tax_web() -> Path:
    h = 3650
    img = base_canvas(h, 4, BLUE)
    d = ImageDraw.Draw(img)
    topbar(d, "04", "Case study 01 / Web system")
    d.text((M, 260), "从业务层级到组件规则", font=F["h1"], fill=WHITE)
    draw_text(d, (M, 390), "先确定用户的任务路径，再对栅格、表格、筛选、弹窗和状态做系统化收敛。", F["body"], MUTED, 1380)

    section_title(d, 540, "01", "信息架构与改版方向", "把业务拆成总览、任务、列表、详情和状态反馈五类核心模块。")
    gap = 28
    half = (CONTENT_W - gap) // 2
    image_frame(img, page_path(7), (M, 725, M + half, 1147), "USER PATH")
    image_frame(img, page_path(8), (M + half + gap, 725, W - M, 1147), "BEFORE / AFTER")

    section_title(d, 1260, "02", "让高频任务更直接", "数据总览与业务列表分层承载，重点动作和异常状态保持可见。")
    image_frame(img, page_path(12), (M, 1450, W - M, 2327), "HIGH-DENSITY TABLE")

    section_title(d, 2460, "03", "建立可扩展的系统规则", "把多项目中重复出现的控件和状态沉淀为一套可复用语言。")
    image_frame(img, page_path(17), (M, 2645, M + half, 3067), "COMPONENTS")
    image_frame(img, page_path(18), (M + half + gap, 2645, W - M, 3067), "FOUNDATION")

    card_text(d, (M, 3160, W - M, 3355), "关键决策", "不用视觉包装遮盖业务复杂度，而是通过稳定的层级、一致的状态和可预期的反馈，让专业用户更快做决策。", "DECISION")
    footer(d, h)
    return save(img, "04-tax-cloud-web-system.png")


def build_tax_cross_platform() -> Path:
    h = 4250
    img = base_canvas(h, 5, CYAN)
    d = ImageDraw.Draw(img)
    topbar(d, "05", "Case study 01 / Cross-platform")
    d.text((M, 250), "一个产品，多种办公时刻", font=F["h1"], fill=WHITE)
    draw_text(
        d,
        (M, 390),
        "PC 处理高密度数据，App 承接待办与审批，小程序完成发票和查询等轻任务。\n保持业务语言一致，但按场景重新组织界面。",
        F["body"],
        MUTED,
        1420,
        18,
    )

    image_frame(img, page_path(31), (M, 690, W - M, 1567), "MOBILE PRODUCT OVERVIEW")

    section_title(d, 1690, "01", "移动审批与任务入口", "优先呈现待办、提醒、审批状态和处理结果，减少移动场景下的视线跳转。")
    gap = 28
    half = (CONTENT_W - gap) // 2
    image_frame(img, page_path(33), (M, 1875, M + half, 2297), "HOME")
    image_frame(img, page_path(34), (M + half + gap, 1875, W - M, 2297), "APPROVAL")

    section_title(d, 2420, "02", "法规、发票与快速查询", "把低频但重要的业务资源转译为更轻、更快的移动端入口。")
    image_frame(img, page_path(36), (M, 2605, W - M, 3482), "REGULATION LIBRARY")

    image_frame(img, page_path(37), (M, 3590, M + half, 4012), "E-INVOICE MINI PROGRAM")
    image_frame(img, page_path(39), (M + half + gap, 3590, W - M, 4012), "CHATAXERA MINI PROGRAM")
    footer(d, h)
    return save(img, "05-tax-cloud-cross-platform.png")


def build_energy_overview() -> Path:
    h = 3250
    img = base_canvas(h, 6, "#4E88FF")
    d = ImageDraw.Draw(img)
    topbar(d, "06", "Case study 02 / China Energy")
    d.text((M, 245), "02", font=F["num"], fill=(63, 230, 255, 70))
    d.text((M + 315, 285), "国家能源集团", font=F["h1"], fill=WHITE)
    d.text((M + 315, 405), "行业报税平台从 0 到 1", font=F["h2"], fill=TEXT)
    draw_text(d, (M + 315, 500), "在保留客户既有操作习惯的前提下，统一基础布局、数据地图、业务看板和组件规范。", F["body"], MUTED, 1150, 18)

    image_frame(img, page_path(21), (M, 760, W - M, 1637), "PROJECT OVERVIEW")

    section_title(d, 1760, "01", "设计策略", "在“专业、稳定、可扩展”的基础上，建立能够支撑多层级组织的产品骨架。")
    gap = 24
    cw = (CONTENT_W - gap * 2) // 3
    strategy = [
        ("尊重习惯", "识别客户原有高频路径，重点优化层级而不强迫改变心智模型。", "01"),
        ("统一骨架", "用栅格、页头、侧边导航和组件规则承载多业务扩展。", "02"),
        ("聚焦决策", "首页与工作台优先展示核心数据、辖区差异和任务异常。", "03"),
    ]
    for i, (title, body, idx) in enumerate(strategy):
        x = M + i * (cw + gap)
        card_text(d, (x, 1985, x + cw, 2275), title, body, idx, "#4E88FF")

    section_title(d, 2410, "02", "规范先行", "先建立组件数量、栅格密度与默认页面原则，再扩展到业务场景。")
    half = (CONTENT_W - 28) // 2
    image_frame(img, page_path(23), (M, 2595, M + half, 3017), "COMPONENT SPECIFICATION")
    image_frame(img, page_path(24), (M + half + 28, 2595, W - M, 3017), "GRID STRATEGY")
    footer(d, h)
    return save(img, "06-energy-overview-system.png")


def build_energy_screens() -> Path:
    h = 3100
    img = base_canvas(h, 7, "#4E88FF")
    d = ImageDraw.Draw(img)
    topbar(d, "07", "Case study 02 / Key screens")
    d.text((M, 260), "从地图总览到日常工作台", font=F["h1"], fill=WHITE)
    draw_text(d, (M, 398), "不同页面共享统一骨架，但根据“全局判断”与“当前任务”切换信息密度。", F["body"], MUTED, 1420)

    image_frame(img, page_path(26), (M, 590, W - M, 1467), "HOME / MAP OVERVIEW")

    section_title(d, 1585, "01", "根据任务切换界面密度", "税种工作台强调业务辖区和列表，综合管理工作台强调整体结构与趋势。")
    gap = 28
    half = (CONTENT_W - gap) // 2
    image_frame(img, page_path(27), (M, 1770, M + half, 2192), "TAX WORKSTATION")
    image_frame(img, page_path(28), (M + half + gap, 1770, W - M, 2192), "MANAGEMENT WORKSTATION")

    section_title(d, 2320, "02", "交付结果", "形成从组件、栅格到首页、工作台和默认状态的完整界面体系。")
    outcomes = [
        ("一致性", "页面骨架、图标、系统色和高保真交付统一。", "01"),
        ("业务层级", "报税流程、数据入口和业务看板形成清晰关系。", "02"),
        ("可扩展性", "行业定制视觉与平台级系统规则保持平衡。", "03"),
    ]
    cw = (CONTENT_W - 48) // 3
    for i, (title, body, idx) in enumerate(outcomes):
        x = M + i * (cw + 24)
        card_text(d, (x, 2525, x + cw, 2815), title, body, idx, "#4E88FF")
    footer(d, h)
    return save(img, "07-energy-key-screens.png")


def build_visualisation() -> Path:
    h = 3600
    img = base_canvas(h, 8, "#13BBD8")
    d = ImageDraw.Draw(img)
    topbar(d, "08", "Selected skill / Visualisation")
    d.text((M, 255), "数据可视化大屏", font=F["h1"], fill=WHITE)
    draw_text(d, (M, 395), "把业务汇报、实时状态、地理分布和异常提醒组织为一套可快速阅读的数据叙事。", F["body"], MUTED, 1350)

    image_frame(img, page_path(42), (M, 660, W - M, 1537), "VISUALISATION OVERVIEW")

    section_title(d, 1660, "01", "信息层级而不是图表堆叠", "用核心 KPI 、地图、趋势、占比和异常模块建立从全局到细节的阅读路径。")
    image_frame(img, page_path(43), (M, 1845, W - M, 2722), "LIGHT / DARK EXPLORATION")

    section_title(d, 2845, "02", "对比与场景适配", "浅色适合日常查看，深色更适合驾驶舱与汇报环境；两者共享同一指标系统。")
    gap = 28
    half = (CONTENT_W - gap) // 2
    image_frame(img, page_path(44), (M, 3030, M + half, 3392), "LIGHT MODE")
    image_frame(img, page_path(45), (M + half + gap, 3030, W - M, 3392), "DARK MODE")
    footer(d, h)
    return save(img, "08-data-visualisation.png")


def build_experiments() -> Path:
    h = 3150
    img = base_canvas(h, 9, "#A768FF")
    d = ImageDraw.Draw(img)
    topbar(d, "09", "Selected skill / Experiments")
    d.text((M, 255), "AIGC · C4D · 方法", font=F["h1"], fill=WHITE)
    draw_text(d, (M, 395), "用新工具开拓视觉表达，用交互原则约束产品决策。实验不是孤立作品，而是为了提高叙事、原型和交付效率。", F["body"], MUTED, 1320)

    image_frame(img, page_path(47), (M, 650, W - M, 1527), "AIGC WORKFLOW & OUTPUT")

    section_title(d, 1645, "01", "三维视觉练习", "用形体、材质、灯光与色彩补充品牌和产品呈现能力。")
    gap = 28
    half = (CONTENT_W - gap) // 2
    image_frame(img, page_path(48), (M, 1830, M + half, 2252), "C4D FORM")
    image_frame(img, page_path(49), (M + half + gap, 1830, W - M, 2252), "C4D SCENE")

    section_title(d, 2380, "02", "让决策有原则可循", "从可见性、一致性、反馈到防错，使用一套明确的交互检查清单约束产品体验。")
    image_frame(img, page_path(50), (M, 2565, M + half, 2942), "PRINCIPLES")
    image_frame(img, page_path(51), (M + half + gap, 2565, W - M, 2942), "METHOD")
    footer(d, h)
    return save(img, "09-ai-visual-experiments.png")


def build_contact() -> Path:
    h = 1500
    img = base_canvas(h, 10, CYAN)
    d = ImageDraw.Draw(img)
    topbar(d, "10", "Contact")

    d.text((M, 285), "THANKS", font=F["display"], fill=WHITE)
    d.text((M, 435), "FOR WATCHING.", font=F["display"], fill=(63, 230, 255, 205))
    draw_text(d, (M, 625), "如果你正在做一个复杂的 B 端产品、AI 工作流或设计系统，\n很乐意和你聊聊。", F["h3"], TEXT, 1040, 18)

    round_rect(d, (M, 845, 1085, 1235), 34, PANEL_2, LINE)
    d.text((M + 48, 895), "LI JIAHAO", font=F["h2"], fill=WHITE)
    d.text((M + 48, 980), "UI/UX & INTERACTION DESIGNER", font=F["latin_b"], fill=CYAN)
    d.text((M + 48, 1060), "E  2146953949@qq.com", font=F["meta"], fill=TEXT)
    d.text((M + 48, 1122), "T  136 7011 5683", font=F["meta"], fill=TEXT)
    d.text((M + 48, 1184), "W  Hungezu", font=F["meta"], fill=TEXT)

    qr = asset("visual/wechat-qr.png")
    if qr.exists():
        with Image.open(qr) as qr_im:
            q = qr_im.convert("RGB").resize((190, 190), Image.Resampling.LANCZOS)
        qbg = Image.new("RGB", (222, 222), "white")
        qbg.paste(q, (16, 16))
        img.paste(qbg, (1265, 1095))
        d.text((1508, 1134), "WECHAT", font=F["latin_b"], fill=WHITE)
        d.text((1508, 1184), "SCAN TO CONNECT", font=F["latin"], fill=MUTED)

    footer(d, h, "LET'S MAKE COMPLEX THINGS CLEAR.")
    return save(img, "10-contact.png")


def build_preview(paths: list[Path]) -> Path:
    thumb_w = 608
    gutter = 24
    cols = 3
    thumbs: list[Image.Image] = []
    labels: list[str] = []
    for p in paths:
        with Image.open(p) as src_im:
            im = src_im.convert("RGB")
        ratio = thumb_w / im.width
        im = im.resize((thumb_w, round(im.height * ratio)), Image.Resampling.LANCZOS)
        thumbs.append(im)
        labels.append(p.stem)
    row_heights = []
    for i in range(0, len(thumbs), cols):
        row_heights.append(max(im.height for im in thumbs[i : i + cols]) + 60)
    sheet_h = 72 + sum(row_heights) + gutter * (len(row_heights) + 1)
    sheet_w = gutter * (cols + 1) + thumb_w * cols
    sheet = Image.new("RGB", (sheet_w, sheet_h), "#090E15")
    sd = ImageDraw.Draw(sheet)
    sd.text((gutter, 24), "LEO PORTFOLIO / GENERATED IMAGE SET", font=font(30, True, latin=True), fill="white")
    y = 72 + gutter
    for row, row_h in enumerate(row_heights):
        for col in range(cols):
            idx = row * cols + col
            if idx >= len(thumbs):
                break
            x = gutter + col * (thumb_w + gutter)
            sheet.paste(thumbs[idx], (x, y + 44))
            sd.text((x, y), labels[idx], font=font(23, latin=True), fill="#9DB0C2")
        y += row_h + gutter
    out = OUTPUT / "00-preview-contact-sheet.jpg"
    sheet.save(out, quality=88, optimize=True)
    print(f"saved {out.name}: {sheet.width}x{sheet.height}")
    return out


def main() -> None:
    required = [page_path(n) for n in [4, 7, 8, 12, 17, 18, 21, 23, 24, 26, 27, 28, 31, 33, 34, 36, 37, 39, 42, 43, 44, 45, 47, 48, 49, 50, 51]]
    missing = [str(p) for p in required if not p.exists()]
    if missing:
        raise SystemExit("Missing source pages:\n" + "\n".join(missing))

    paths = [
        build_cover(),
        build_profile(),
        build_tax_overview(),
        build_tax_web(),
        build_tax_cross_platform(),
        build_energy_overview(),
        build_energy_screens(),
        build_visualisation(),
        build_experiments(),
        build_contact(),
    ]
    build_preview(paths)


if __name__ == "__main__":
    main()
