"""Build the two-page public resume. Requires ReportLab and Microsoft YaHei.

Run with the bundled Python or any Python with ReportLab installed.
The original supplied resume is never modified.
"""
import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "docs/resume/content.zh-CN.json").read_text(encoding="utf-8"))
OUTPUT = ROOT / "output/pdf/li-jiahao-ux-ui-resume.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont("Resume", "C:/Windows/Fonts/msyh.ttc", subfontIndex=0))
pdfmetrics.registerFont(TTFont("ResumeBold", "C:/Windows/Fonts/msyhbd.ttc", subfontIndex=0))
pdfmetrics.registerFontFamily("Resume", normal="Resume", bold="ResumeBold")

W, H = A4
M = 39
CW = W - M * 2
INK = colors.HexColor("#181818")
BODY = colors.HexColor("#3b3b3b")
MUTED = colors.HexColor("#656565")
RULE = colors.HexColor("#dddddd")
c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
c.setTitle("李家豪 | AI 体验产品设计师 · UX & UI")
c.setAuthor("李家豪")
c.setSubject("7年+设计经验 | AI产品、财税SaaS与政企平台")
c.setCreator("Li Jiahao Portfolio")


def text(value, x, top, size=9.2, bold=False, color=INK):
    c.setFont("ResumeBold" if bold else "Resume", size)
    c.setFillColor(color)
    c.drawString(x, H - top - size, value)


def right(value, top, size=9, color=MUTED):
    c.setFont("Resume", size)
    c.setFillColor(color)
    c.drawRightString(W - M, H - top - size, value)


def paragraph(value, top, x=M, width=CW, size=9.2, leading=15, color=BODY):
    style = ParagraphStyle("p", fontName="Resume", fontSize=size, leading=leading,
                           textColor=color, wordWrap="CJK", alignment=TA_LEFT)
    p = Paragraph(value, style)
    _, height = p.wrap(width, H)
    p.drawOn(c, x, H - top - height)
    return top + height


def rule(top):
    c.setStrokeColor(RULE)
    c.setLineWidth(.45)
    c.line(M, H - top, W - M, H - top)


def section(label, top):
    text(label, M, top, 12.5, True)
    rule(top + 23)
    return top + 33


def footer(page):
    rule(H - 37)
    text("李家豪 / UX & UI", M, H - 28, 7.5, color=MUTED)
    right(f"{page} / 2", H - 28, 7.5)


def link(label, url, x, top, size=9):
    text(label, x, top, size, color=BODY)
    width = pdfmetrics.stringWidth(label, "Resume", size)
    c.linkURL(url, (x, H - top - size - 2, x + width, H - top + 1), relative=0, thickness=0)


# Page 1: the complete career timeline stays together.
text(DATA["name"], M, 35, 29, True)
text(DATA["alias"], M + 103, 48, 10, color=MUTED)
text(DATA["title"], M, 79, 13, True)
link(DATA["phone"], "tel:13670115683", M, 108, 9)
link(DATA["email"], "mailto:" + DATA["email"], M + 112, 108, 9)
link("作品集  hungezu.github.io/portfolio/", DATA["website"], M, 126, 9)
portrait = ROOT / "docs/resume/portrait.png"
if portrait.exists():
    c.drawImage(str(portrait), W - M - 76, H - 35 - 91, 76, 76.6, preserveAspectRatio=True, mask="auto")

y = paragraph(escape(DATA["summary"]), 159, size=10, leading=17)
y += 16
for label, value in DATA["strengths"]:
    text(label, M, y, 9, True)
    y = paragraph(escape(value), y - 1, M + 86, CW - 86, 9, 15)
y = section("工作经历", y + 20)
for job in DATA["experiences"]:
    text(job["company"], M, y, 11, True)
    right(job["period"], y + 1, 9)
    y += 19
    text(job["role"], M, y, 8.8, color=MUTED)
    y += 21
    for bullet in job["bullets"]:
        c.setFillColor(MUTED)
        c.circle(M + 2, H - y - 7, 1.3, stroke=0, fill=1)
        y = paragraph(escape(bullet), y, M + 12, CW - 12, 9, 14.6) + 4
    y += 10

y = section("教育与工具", y + 1)
text(DATA["education"], M, y, 9)
right(DATA["educationPeriod"], y, 8.7)
y += 23
y = paragraph("<b>设计工具</b>　" + escape(DATA["tools"]), y, size=9, leading=15)
if y > H - 54:
    raise RuntimeError(f"Page 1 content exceeds safe area: {y:.1f}")
footer(1)
c.showPage()

# Page 2: compact project evidence; every title links to the live case.
text("代表项目", M, 37, 22, True)
text("设计判断、职责与交付", M, 72, 9.5, color=MUTED)
link("查看完整作品集", DATA["website"], W - M - 79, 76, 8.8)
text("点击项目标题查看完整案例", M, 90, 7.5, color=MUTED)
rule(100)
y = 116
for index, project in enumerate(DATA["projects"]):
    title_top = y
    text(project["title"], M, y, 12, True)
    title_width = pdfmetrics.stringWidth(project["title"], "ResumeBold", 12)
    c.linkURL(project["url"], (M, H - title_top - 16, M + title_width, H - title_top + 2), relative=0, thickness=0)
    right(project["type"], y + 2, 8.4)
    y += 22
    y = paragraph(escape(project["role"]), y, size=8.6, leading=13, color=MUTED) + 9
    for label, key in [("设计问题", "challenge"), ("关键设计", "actions"), ("交付内容", "delivery")]:
        text(label, M, y + 1, 8.6, True)
        y = paragraph(escape(project[key]), y, M + 62, CW - 62, 9, 14.3) + 3
    if index < len(DATA["projects"]) - 1:
        rule(y + 8)
        y += 23
if y > H - 54:
    raise RuntimeError(f"Page 2 content exceeds safe area: {y:.1f}")
footer(2)
c.save()
asset = ROOT / "assets/portfolio/li-jiahao-ux-ui-resume.pdf"
asset.write_bytes(OUTPUT.read_bytes())
print(f"Created {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")
