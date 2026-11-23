import type { CSSProperties } from "react";

const white = "#FFFFFF";
const ink = "#1F2329";
const buttonBlue = "#2B59C5";
const pressedBlue = "#173B9D";

function luminance(hex: string) {
  const [red, green, blue] = hex.slice(1).match(/../g)!.map(channel => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrast(foreground: string, background: string) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const combinations = [
  { role: "主操作按钮", english: "Primary action", example: "确认", exampleEn: "Confirm", old: "#457EED", bg: buttonBlue, fg: white },
  { role: "错误提示", english: "Error", example: "错误 · 格式不符", exampleEn: "Error · Invalid format", old: "#F02823", bg: "#C91417", fg: white },
  { role: "告警标签", english: "Warning", example: "告警 · 待核验", exampleEn: "Warning · Review needed", old: "#FFA612", bg: "#FFA612", fg: ink },
  { role: "成功标签", english: "Success", example: "成功 · 已通过", exampleEn: "Success · Verified", old: "#15D391", bg: "#15D391", fg: ink },
] as const;

const ratioLabel = (fg: string, bg: string) => contrast(fg, bg).toFixed(2) + ":1";

export const contrastBoardEdits = {
  "tax-cloud/03-global-style": {
    w: 1920, h: 1080,
    patches: [
      { box: [1057, 465, 849, 247], background: buttonBlue, radius: 7 },
      { box: [1088, 484, 746, 48], text: ["主操作按钮 · 蓝7"], size: 27, color: white, weight: 500 },
      { box: [1088, 540, 746, 30], text: ["白字对比度 " + ratioLabel(white, buttonBlue)], size: 20, color: white },
      { box: [1088, 623, 750, 45], text: ["rgb(43, 89, 197) · #2B59C5", "品牌蓝 #457EED 保留在原有色阶中"], size: 16, lineHeight: 24, color: white },
      ...combinations.flatMap((item, index) => {
        const left = [1057, 1276, 1496, 1715][index];
        return [
          { box: [left, 773, 192, 68], background: item.bg },
          { box: [left + 9, 779, 173, 25], text: [item.role + " · " + ratioLabel(item.fg, item.bg)], size: 14, weight: 600, color: item.fg },
          { box: [left + 9, 808, 173, 24], text: [item.fg + " / " + item.bg], size: 12, color: item.fg },
        ];
      }),
    ],
  },
  "tax-cloud/04-design-components": {
    w: 1920, h: 1080,
    patches: [
      { box: [214, 553, 53, 22], radius: 2, background: buttonBlue, text: ["主按钮"], size: 9, color: white, align: "center" },
      { box: [214, 593, 53, 22], radius: 2, background: "#214AAE", text: ["主按钮"], size: 9, color: white, align: "center" },
      { box: [214, 633, 53, 22], radius: 2, background: pressedBlue, text: ["主按钮"], size: 9, color: white, align: "center" },
    ],
  },
};

export function TaxCloudContrastSpec({ english }: { english: boolean }) {
  return <section className="legacy-contrast" id="tax-cloud-color-contrast" aria-labelledby="tax-cloud-color-contrast-title">
    <h2 id="tax-cloud-color-contrast-title">{english ? "Text and control contrast" : "文字与控件对比度"}</h2>
    <p>{english
      ? "Choose colors by their role. Keep the brand palette, and verify the text, background and essential state indicators that people actually see."
      : "按用途选色。保留品牌色阶，同时为按钮文字与状态标签规定具体的前景色和背景色。"}
    </p>
    <ul className="legacy-contrast-list">
      {combinations.map(item => <li key={item.role}>
        <h3>{english ? item.english : item.role}</h3>
        <span className="legacy-contrast-sample" style={{ color: item.fg, backgroundColor: item.bg } as CSSProperties}>
          {english ? item.exampleEn : item.example}
        </span>
        <dl>
          <div><dt>{english ? "Original white text" : "原稿白字"}</dt><dd>{ratioLabel(white, item.old)}</dd></div>
          <div><dt>{english ? "Revised" : "修订后"}</dt><dd>{ratioLabel(item.fg, item.bg)}</dd></div>
        </dl>
        <code>{item.fg} / {item.bg}</code>
      </li>)}
    </ul>
    <p>{english
      ? "This example checks the four text pairs above against the 4.5:1 threshold for normal text. Large text uses 3:1. Essential controls and state indicators are checked separately against their adjacent colors at 3:1. Statuses also use words so that their meaning does not rely on hue."
      : "上面四组按普通文字的 4.5:1 门槛核对。大字为 3:1；识别控件或状态所必需的非文字视觉信息，另按与相邻颜色 3:1 核对。状态同时用文字说明。"}
    </p>
    <p className="legacy-contrast-references">
      {english ? "Scope: contrast of the shown color pairs and primary button states." : "核对范围为本节展示的配色和主按钮状态。"}
      {" "}<a href="https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html">{english ? "Text contrast" : "文字对比度规则"}</a>
      {" · "}<a href="https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html">{english ? "Non-text contrast" : "非文字对比度规则"}</a>
    </p>
  </section>;
}
