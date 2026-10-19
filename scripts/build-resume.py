"""Build the public, two-page A4 resume from its reviewed JSON content.

Run ``python scripts/build-resume.py --check`` to measure and validate the entire
layout without writing a PDF. Normal execution writes an optional draft to
output/pdf. The user-provided public download is never overwritten. Microsoft
YaHei is embedded; the original portrait and source resume are never modified.
"""

import argparse
import json
import re
from dataclasses import dataclass
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
SOURCE = ROOT / "docs/resume/content.zh-CN.json"
OUTPUT = ROOT / "output/pdf/li-jiahao-ux-ui-resume.pdf"
PORTRAIT = ROOT / "docs/resume/portrait.png"
W, H = A4
M = 40.0
CW = W - 2 * M
SAFE_TOP = 32.0
SAFE_BOTTOM = H - 56.0
INK = colors.HexColor("#181818")
BODY = colors.HexColor("#343434")
MUTED = colors.HexColor("#676767")
RULE = colors.HexColor("#d5d5d5")


@dataclass(frozen=True)
class Box:
    page: int
    label: str
    x: float
    top: float
    width: float
    height: float


class ResumeLayout:
    """Measure first, then draw; a long edit must fail rather than shrink type."""

    def __init__(self):
        self.page = 1
        self.operations = []
        self.boxes = []
        self.body_sizes = []
        self.body_leadings = []
        self.page_ends = {}

    def add_box(self, label, x, top, width, height):
        if (x < M - .1 or x + width > W - M + .1 or
                top < SAFE_TOP or top + height > SAFE_BOTTOM + .1):
            raise ValueError(
                f"Page {self.page}: {label} exceeds the safe content area "
                f"(x={x:.1f}, y={top:.1f}, w={width:.1f}, h={height:.1f}). "
                "Edit the content or layout; do not reduce the body font."
            )
        for other in self.boxes:
            if other.page != self.page:
                continue
            overlap_x = min(x + width, other.x + other.width) - max(x, other.x)
            overlap_y = min(top + height, other.top + other.height) - max(top, other.top)
            if overlap_x > .5 and overlap_y > .5:
                raise ValueError(
                    f"Page {self.page}: {label} overlaps {other.label} "
                    f"by {overlap_x:.1f} x {overlap_y:.1f} pt."
                )
        self.boxes.append(Box(self.page, label, x, top, width, height))

    def text(self, value, x, top, size=9.3, bold=False, color=INK,
             label="text", url=None, decorative=False):
        value = str(value)
        font = "ResumeBold" if bold else "Resume"
        width = pdfmetrics.stringWidth(value, font, size)
        if not decorative:
            self.add_box(label, x, top, width, size * 1.25)
            self.body_sizes.append(size)
        self.operations.append((self.page, "text", {
            "value": value, "x": x, "top": top, "size": size,
            "font": font, "color": color, "url": url, "width": width,
        }))
        return top + size * 1.25

    def right(self, value, top, size=9.2, color=MUTED, label="metadata",
              decorative=False):
        width = pdfmetrics.stringWidth(str(value), "Resume", size)
        return self.text(value, W - M - width, top, size=size, color=color,
                         label=label, decorative=decorative)

    def paragraph(self, markup, top, x=M, width=CW, size=9.3, leading=14.8,
                  color=BODY, label="paragraph"):
        if size < 9 or leading < 14:
            raise ValueError(f"{label}: body text must be at least 9 pt / 14 pt.")
        style = ParagraphStyle(
            label, fontName="Resume", fontSize=size, leading=leading,
            textColor=color, wordWrap="CJK", alignment=TA_LEFT,
            spaceBefore=0, spaceAfter=0, allowWidows=0, allowOrphans=0,
        )
        paragraph = Paragraph(markup, style)
        _, height = paragraph.wrap(width, H)
        self.add_box(label, x, top, width, height)
        self.body_sizes.append(size)
        self.body_leadings.append(leading)
        self.operations.append((self.page, "paragraph", {
            "paragraph": paragraph, "x": x, "top": top, "height": height,
        }))
        return top + height

    def line(self, top, x=M, width=CW, weight=.45, color=RULE):
        self.operations.append((self.page, "line", {
            "x": x, "top": top, "width": width, "weight": weight, "color": color,
        }))

    def section(self, title, top, subtitle=None):
        self.text(title, M, top, 12.4, True, label=title + " heading")
        if subtitle:
            self.right(subtitle, top + 3, 9, label=title + " subtitle")
        self.line(top + 24)
        return top + 37

    def footer(self, page, name):
        self.line(H - 37)
        self.text(f"{name} / UX & UI", M, H - 28, 7.5, color=MUTED,
                  decorative=True)
        self.right(f"{page} / 2", H - 28, 7.5, decorative=True)

    def finish_page(self, y):
        if y > SAFE_BOTTOM:
            raise ValueError(f"Page {self.page}: content ends at {y:.1f} pt; "
                             f"the limit is {SAFE_BOTTOM:.1f} pt.")
        self.page_ends[self.page] = round(y, 1)


def register_fonts():
    fonts = Path("C:/Windows/Fonts")
    pdfmetrics.registerFont(TTFont("Resume", str(fonts / "msyh.ttc"), subfontIndex=0))
    pdfmetrics.registerFont(TTFont("ResumeBold", str(fonts / "msyhbd.ttc"), subfontIndex=0))
    pdfmetrics.registerFontFamily("Resume", normal="Resume", bold="ResumeBold")


def tagged_bullet(value):
    """Bold the reviewed label without changing or shortening its wording."""
    if "｜" in value:
        label, content = value.split("｜", 1)
        return f"<b>{escape(label)}</b>　{escape(content)}"
    return escape(value)


def assert_inline_fit(left, right, width, left_size, right_size, label,
                      left_bold=False, gap=22):
    left_width = pdfmetrics.stringWidth(left, "ResumeBold" if left_bold else "Resume", left_size)
    right_width = pdfmetrics.stringWidth(right, "Resume", right_size)
    if left_width + gap + right_width > width:
        raise ValueError(f"{label}: left text and right metadata would collide. "
                         "Move metadata to another line; do not shrink the type.")


def add_job(layout, job, top, index):
    label = f"experience {index + 1}"
    # Dates occupy the second line, so even the longest company name is safe.
    y = layout.paragraph(f"<b>{escape(job['company'])}</b>", top,
                         size=10.8, leading=17, color=INK,
                         label=label + " company")
    meta = job["role"]
    if job.get("assignment"):
        meta += "  ·  " + job["assignment"]
    assert_inline_fit(meta, job["period"], CW, 9.2, 9.2,
                      label + " role/date")
    layout.text(meta, M, y + 3, 9.2, color=MUTED, label=label + " role")
    layout.right(job["period"], y + 3, 9.2, label=label + " period")
    y += 26
    for bullet_index, bullet in enumerate(job["bullets"]):
        layout.text("-", M, y + .1, 9.3, color=MUTED,
                    label=f"{label} bullet {bullet_index + 1} mark")
        y = layout.paragraph(tagged_bullet(bullet), y, x=M + 12, width=CW - 12,
                             size=9.3, leading=14.8,
                             label=f"{label} bullet {bullet_index + 1}") + 3
    return y


def project_title(layout, project, top, index, featured=True):
    size = 12.2 if featured else 10.8
    label = f"project {index + 1}"
    metadata = project["type"] if featured else project["role"]
    assert_inline_fit(project["title"], metadata, CW, size, 9,
                      label + " title/type", left_bold=True)
    layout.text(project["title"], M, top, size, True,
                label=label + " title", url=project["url"])
    layout.right(metadata, top + (3 if featured else 1.5), 9,
                 label=label + (" type" if featured else " role"))
    return top + (23 if featured else 21)


def project_row(layout, title, value, top, label):
    column = 62
    if pdfmetrics.stringWidth(title, "ResumeBold", 9.3) > column - 12:
        raise ValueError(f"{label}: row label exceeds its column.")
    layout.text(title, M, top + .3, 9.3, True, label=label + " label")
    return layout.paragraph(escape(value), top, x=M + column, width=CW - column,
                            size=9.3, leading=14.8, label=label + " body") + 3.7


def build_layout(data):
    if len(data["experiences"]) != 4 or len(data["projects"]) != 5:
        raise ValueError("This two-page template requires the four reviewed employers and five projects.")
    layout = ResumeLayout()

    # Page 1: an open, readable career page rather than a repeated skill matrix.
    layout.text(data["name"], M, 34, 30, True, label="name")
    name_width = pdfmetrics.stringWidth(data["name"], "ResumeBold", 30)
    layout.text(data["alias"], M + name_width + 15, 51, 10.5, color=MUTED,
                label="alias")
    layout.text(data["title"], M, 79, 12, True, label="professional title")
    phone_url = "tel:" + re.sub(r"\D", "", data["phone"])
    layout.text(data["phone"], M, 105, 9.3, color=BODY,
                label="phone", url=phone_url)
    phone_width = pdfmetrics.stringWidth(data["phone"], "Resume", 9.3)
    layout.text(data["email"], M + phone_width + 24, 105, 9.3, color=BODY,
                label="email", url="mailto:" + data["email"])
    website_label = re.sub(r"^https?://", "", data["website"]).rstrip("/") + "/"
    layout.text("作品集  " + website_label, M, 123, 9.3, color=BODY,
                label="portfolio contact", url=data["website"])
    if not PORTRAIT.is_file():
        raise FileNotFoundError(f"The reviewed portrait is missing: {PORTRAIT}")
    layout.add_box("portrait", W - M - 68, 36, 68, 78)
    layout.operations.append((1, "portrait", {
        "path": str(PORTRAIT), "x": W - M - 68, "top": 36,
        "width": 68, "height": 78,
    }))
    y = layout.paragraph(escape(data["summary"]), 154, size=9.5, leading=15.6,
                         label="professional summary")
    strengths = "  /  ".join(item[0] for item in data.get("strengths", []))
    if strengths:
        y = layout.paragraph(f"<b>{escape(strengths)}</b>", y + 12,
                             size=9.2, leading=14.5, label="strength labels")
    y = layout.section("工作经历", y + 25)
    for index, job in enumerate(data["experiences"]):
        y = add_job(layout, job, y, index)
        if index < len(data["experiences"]) - 1:
            layout.line(y + 7)
            y += 21
    layout.finish_page(y)
    layout.footer(1, data["name"])

    # Page 2: three primary cases, then a deliberately quieter supporting pair.
    layout.page = 2
    layout.text("代表项目", M, 35, 23, True, label="projects page heading")
    layout.text("设计判断、职责与交付", M, 75, 9.5, color=MUTED,
                label="projects page subtitle")
    label = "完整作品集 ↗"
    link_width = pdfmetrics.stringWidth(label, "Resume", 9.3)
    layout.text(label, W - M - link_width, 75, 9.3, color=BODY,
                label="portfolio page link", url=data["website"])
    layout.line(100)
    y = 115
    for index, project in enumerate(data["projects"][:3]):
        y = project_title(layout, project, y, index)
        period = project.get("period")
        if period:
            assert_inline_fit(project["role"], period, CW, 9.2, 9.2,
                              f"project {index + 1} role/date")
            layout.right(period, y, 9.2, label=f"project {index + 1} period")
            role_width = CW - pdfmetrics.stringWidth(period, "Resume", 9.2) - 24
        else:
            role_width = CW
        y = layout.paragraph(escape(project["role"]), y, width=role_width,
                             size=9.2, leading=14.5, color=MUTED,
                             label=f"project {index + 1} role") + 8
        for row_title, key in (("设计问题", "challenge"),
                               ("关键动作", "actions"), ("设计交付", "delivery")):
            y = project_row(layout, row_title, project[key], y,
                            f"project {index + 1} {key}")
        if index < 2:
            layout.line(y + 5)
            y += 19
    y = layout.section("补充项目", y + 14)
    for index, project in enumerate(data["projects"][3:], start=3):
        y = project_title(layout, project, y, index, featured=False)
        y = project_row(layout, "关键动作", project["actions"], y,
                        f"project {index + 1} actions")
        y = project_row(layout, "设计交付", project["delivery"], y,
                        f"project {index + 1} delivery")
        if index == 3:
            y += 11
    education_top = H - 113
    if y > education_top - 20:
        raise ValueError(f"Page 2: projects end at {y:.1f} pt and collide with "
                         f"the education zone at {education_top:.1f} pt. "
                         "Shorten the reviewed supporting-project copy; type is not auto-shrunk.")
    layout.line(education_top - 13)
    assert_inline_fit(data["education"], data["educationPeriod"], CW, 9.2, 9.2,
                      "education/date")
    layout.text(data["education"], M, education_top, 9.2,
                label="education")
    layout.right(data["educationPeriod"], education_top, 9.2,
                 label="education period")
    y = layout.paragraph("<b>设计工具</b>　" + escape(data["tools"]), education_top + 24,
                         size=9.2, leading=14.8, label="tools")
    layout.finish_page(y)
    layout.footer(2, data["name"])
    if min(layout.body_sizes) < 9 or min(layout.body_leadings) < 14:
        raise ValueError("Body font or leading fell below the readable minimum.")
    return layout


def render(layout, data):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle(f"{data['name']} | AI 体验产品设计师 · UX & UI")
    c.setAuthor(data["name"])
    c.setSubject("7年+设计经验 | AI产品、财税SaaS与政企平台")
    c.setCreator("Li Jiahao Portfolio")
    for page in (1, 2):
        for op_page, kind, op in layout.operations:
            if op_page != page:
                continue
            if kind == "text":
                c.setFont(op["font"], op["size"])
                c.setFillColor(op["color"])
                c.drawString(op["x"], H - op["top"] - op["size"], op["value"])
                if op["url"]:
                    c.linkURL(op["url"], (
                        op["x"], H - op["top"] - op["size"] * 1.25,
                        op["x"] + op["width"], H - op["top"] + 1,
                    ), relative=0, thickness=0)
            elif kind == "paragraph":
                op["paragraph"].drawOn(c, op["x"], H - op["top"] - op["height"])
            elif kind == "line":
                c.setStrokeColor(op["color"])
                c.setLineWidth(op["weight"])
                c.line(op["x"], H - op["top"], op["x"] + op["width"], H - op["top"])
            elif kind == "portrait":
                c.drawImage(op["path"], op["x"], H - op["top"] - op["height"],
                            op["width"], op["height"], preserveAspectRatio=True,
                            anchor="c", mask="auto")
        c.showPage()
    c.save()
    print(f"Created {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true",
                        help="Measure and validate both pages without writing PDF files.")
    args = parser.parse_args()
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    register_fonts()
    layout = build_layout(data)
    print(json.dumps({
        "pages": 2, "content_end_pt": layout.page_ends,
        "minimum_text_pt": min(layout.body_sizes),
        "minimum_paragraph_leading_pt": min(layout.body_leadings),
        "employers": len(data["experiences"]),
        "linked_projects": len(data["projects"]),
        "checked_content_boxes": len(layout.boxes),
        "mode": "measure-only" if args.check else "render",
    }, ensure_ascii=True))
    if not args.check:
        render(layout, data)


if __name__ == "__main__":
    main()
