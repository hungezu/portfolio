"use client";
import { useI18n } from "../i18n";


import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Check from "lucide-react/dist/esm/icons/check.mjs";
import Code from "lucide-react/dist/esm/icons/code.mjs";
import Copy from "lucide-react/dist/esm/icons/copy.mjs";
import Database from "lucide-react/dist/esm/icons/database.mjs";
import Eye from "lucide-react/dist/esm/icons/eye.mjs";
import FileText from "lucide-react/dist/esm/icons/file-text.mjs";
import X from "lucide-react/dist/esm/icons/x.mjs";
import "./zhaocai-answer-workbench.css";

type RuleId = "structure" | "reasoning" | "numbers" | "table" | "missing" | "source";
type SceneId = "overview" | "comparison" | "unavailable";
type Block = {
  id: string;
  rules: RuleId[];
} & (
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "note"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; caption: string; headers: string[]; rows: string[][]; numericColumns: number[] }
  | { type: "source"; text: string }
);
type Scene = { id: SceneId; label: string; question: string; blocks: Block[]; rules: RuleId[] };

const quarterRows = [["第一季度", "1.32"], ["第二季度", "1.46"], ["第三季度", "1.59"], ["第四季度", "1.71"], ["全年合计", "6.08"]];

const rules: { id: RuleId; title: string; rule: string; applies: string; check: string }[] = [
  { id: "structure", title: "标题层级", rule: "主标题用 ##，主题用 ###；最多三级，层级连续、不跳级。", applies: "多个主题的回答；短回答可直接用段落。", check: "标题独立成行，简短且层级连续。" },
  { id: "reasoning", title: "结论、依据、建议", rule: "结论在前、依据居中、建议在后；事实与建议分别成段。", applies: "经营分析、结果比较及回答边界说明。", check: "结论有依据；建议不混入事实；原因不凭空推断。" },
  { id: "numbers", title: "数值与口径", rule: "金额保留两位小数；交代期间、组织、指标、单位和比较基准。", applies: "金额、占比和增幅等可复核的数值。", check: "双方口径一致，公式、舍入与合计可核对。" },
  { id: "table", title: "表格与对齐", rule: "文本左对齐、数值右对齐；单位写在表题或列头。", applies: "季度明细或三个及以上同口径数据项。", check: "数值列用 ---:；缺失有解释；窄屏列内容完整。" },
  { id: "missing", title: "缺失与边界", rule: "未取得就写“未取得”，不记为 0，不沿用其他组织的数据。", applies: "查询为空、维度缺失或依据不足。", check: "交代缺项、影响和下一步；不生成金额或排名。" },
  { id: "source", title: "来源定位", rule: "数据附近给出来源入口，详情含期间、口径、单位与明细。", applies: "包含数据、比较或边界判断的回答。", check: "入口可打开，正文口径一致，合计能核对到明细。" },
];

const scenes: Scene[] = [
  { id: "overview", label: "经营分析", question: "2024 年集团净利润表现如何？", rules: ["structure", "reasoning", "numbers", "table", "source"], blocks: [
    { id: "title", type: "heading", level: 2, text: "2024 年集团净利润概览", rules: ["structure"] },
    { id: "conclusion-title", type: "heading", level: 3, text: "结论", rules: ["structure", "reasoning"] },
    { id: "conclusion", type: "paragraph", text: "2024 年全集团净利润合计 **6.08 亿元**，四个季度的净利润逐季上升。", rules: ["numbers", "reasoning"] },
    { id: "evidence-title", type: "heading", level: 3, text: "依据", rules: ["structure", "reasoning"] },
    { id: "quarter-table", type: "table", caption: "全集团季度净利润 · 单位：亿元", headers: ["统计期间", "净利润"], rows: quarterRows, numericColumns: [1], rules: ["table", "numbers"] },
    { id: "source", type: "source", text: "2024 年全集团季度净利润明细", rules: ["source"] },
    { id: "suggestion-title", type: "heading", level: 3, text: "建议", rules: ["structure", "reasoning"] },
    { id: "suggestion", type: "paragraph", text: "进一步核对同口径的收入、成本、费用与一次性损益，再判断利润变化的原因。", rules: ["reasoning"] },
  ] },
  { id: "comparison", label: "明细比较", question: "四季度比一季度增长了多少？", rules: ["structure", "reasoning", "numbers", "table", "source"], blocks: [
    { id: "title", type: "heading", level: 2, text: "2024 年一季度与四季度比较", rules: ["structure"] },
    { id: "conclusion-title", type: "heading", level: 3, text: "结论", rules: ["structure", "reasoning"] },
    { id: "conclusion", type: "paragraph", text: "全集团四季度净利润较一季度增加 **0.39 亿元**，增幅为 **29.55%**。", rules: ["numbers", "reasoning"] },
    { id: "evidence-title", type: "heading", level: 3, text: "依据", rules: ["structure", "reasoning"] },
    { id: "comparison-table", type: "table", caption: "比较范围：2024 年全集团 · 单位：亿元", headers: ["比较项", "净利润"], rows: [["第一季度", "1.32"], ["第四季度", "1.71"], ["增加额", "0.39"]], numericColumns: [1], rules: ["table", "numbers"] },
    { id: "formula", type: "paragraph", text: "增幅 =（1.71 − 1.32）÷ 1.32 × 100% = **29.55%**。金额与增幅均保留两位小数。", rules: ["numbers"] },
    { id: "comparison-note", type: "note", text: "这是同年不同季度的比较；同比需要上年同期数据，环比需要相邻季度数据。", rules: ["numbers", "reasoning"] },
    { id: "source", type: "source", text: "2024 年全集团季度净利润明细", rules: ["source"] },
    { id: "suggestion-title", type: "heading", level: 3, text: "建议", rules: ["structure", "reasoning"] },
    { id: "suggestion", type: "paragraph", text: "若要观察最近一个季度的变化，可继续比较第三季度与第四季度，并保持组织和指标口径一致。", rules: ["reasoning"] },
  ] },
  { id: "unavailable", label: "未取得数据", question: "哪家子公司的净利润最高？", rules: ["structure", "reasoning", "numbers", "missing", "source"], blocks: [
    { id: "title", type: "heading", level: 2, text: "当前无法比较子公司净利润", rules: ["structure", "missing"] },
    { id: "conclusion-title", type: "heading", level: 3, text: "结论", rules: ["structure", "reasoning"] },
    { id: "conclusion", type: "paragraph", text: "当前**未取得子公司维度的净利润明细**，无法给出可靠排名。未取得数据不代表净利润为 0。", rules: ["missing", "reasoning"] },
    { id: "evidence-title", type: "heading", level: 3, text: "已有依据", rules: ["structure", "reasoning"] },
    { id: "evidence", type: "paragraph", text: "现有数据仅包含 2024 年全集团季度净利润，全年合计 **6.08 亿元**；集团合计不能直接用于子公司比较。", rules: ["numbers", "missing"] },
    { id: "source", type: "source", text: "2024 年全集团季度净利润明细", rules: ["source"] },
    { id: "suggestion-title", type: "heading", level: 3, text: "下一步", rules: ["structure", "reasoning"] },
    { id: "next-steps", type: "list", items: ["取得 2024 年各子公司的净利润明细。", "核对合并范围、统计期间与金额单位。", "确认数据完整后，再按相同口径排序。"], rules: ["missing", "reasoning"] },
  ] },
];

function toMarkdown(blocks: Block[], sourceAnchor: string, sourceLabel: string) {
  return blocks.map(block => {
    if (block.type === "heading") return `${"#".repeat(block.level)} ${block.text}`;
    if (block.type === "paragraph") return block.text;
    if (block.type === "note") return `> ${block.text}`;
    if (block.type === "list") return block.items.map(item => `- ${item}`).join("\n");
    if (block.type === "source") return `${sourceLabel}: [${block.text}](#${sourceAnchor})`;
    return `${block.caption}\n\n| ${block.headers.join(" | ")} |\n| ${block.headers.map((_, index) => block.numericColumns.includes(index) ? "---:" : "---").join(" | ")} |\n${block.rows.map(row => `| ${row.join(" | ")} |`).join("\n")}`;
  }).join("\n\n");
}

function inline(text: string): ReactNode {
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => part.startsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part);
}

export function ZhaocaiAnswerWorkbench() {
  const { t, localize, locale } = useI18n();
  const instanceId = useId().replace(/:/g, "");
  const prefix = `zaw-${instanceId}`;
  const [sceneId, setSceneId] = useState<SceneId>("overview");
  const [view, setView] = useState("rendered");
  const [activeRule, setActiveRule] = useState<RuleId>("structure");
  const [annotations, setAnnotations] = useState(true);
  const [copyStatus, setCopyStatus] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const sourceOpener = useRef<HTMLButtonElement | null>(null);
  const scene = localize(scenes.find(item => item.id === sceneId)!);
  const rule = localize(rules.find(item => item.id === activeRule)!);
  const markdown = toMarkdown(scene.blocks, `${prefix}-source-detail`, t("来源"));
  const highlightedCount = scene.blocks.filter(block => block.rules.includes(activeRule)).length;

  const changeScene = (id: SceneId) => {
    setSceneId(id);
    setCopyStatus("");
    if (!scenes.find(item => item.id === id)!.rules.includes(activeRule)) setActiveRule(id === "unavailable" ? "missing" : "structure");
  };

  const tabKey = (event: KeyboardEvent<HTMLButtonElement>, values: string[], current: string, onChange: (value: string) => void, group: string) => {
    const currentIndex = values.indexOf(current);
    let next = currentIndex;
    if (event.key === "ArrowRight") next = (currentIndex + 1) % values.length;
    else if (event.key === "ArrowLeft") next = (currentIndex - 1 + values.length) % values.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = values.length - 1;
    else return;
    event.preventDefault();
    onChange(values[next]);
    document.getElementById(`${prefix}-${group}-${values[next]}`)?.focus();
  };

  const openSource = (button: HTMLButtonElement) => {
    sourceOpener.current = button;
    dialog.current?.showModal();
  };

  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(markdown);
      setCopyStatus("Markdown 已复制");
    } catch {
      setView("source");
      setCopyStatus("复制未完成，可在源文中选择文字后复制。");
    }
  };

  const renderBlock = (block: Block) => {
    const isHighlighted = annotations && block.rules.includes(activeRule);
    const className = `zaw-answer-block zaw-answer-block-${block.type}${isHighlighted ? " zaw-answer-block-highlighted" : ""}`;
    let content: ReactNode;
    if (block.type === "heading") content = block.level === 2 ? <h2>{t(block.text)}</h2> : <h3>{t(block.text)}</h3>;
    else if (block.type === "paragraph") content = <p>{t(inline(block.text))}</p>;
    else if (block.type === "note") content = <blockquote>{t(inline(block.text))}</blockquote>;
    else if (block.type === "list") content = <ul>{block.items.map(item => <li key={item}>{t(inline(item))}</li>)}</ul>;
    else if (block.type === "source") content = <p className="zaw-source-line"><span>{t("来源：")}</span><button type="button" onClick={event => openSource(event.currentTarget)} aria-haspopup="dialog" aria-controls={`${prefix}-source-detail`}><Database size={14} aria-hidden="true"/>{t(block.text)}</button></p>;
    else content = <div className="zaw-table-wrap"><table><caption>{t(block.caption)}</caption><thead><tr>{block.headers.map((header, index) => <th key={header} scope="col" className={block.numericColumns.includes(index) ? "zaw-numeric" : undefined}>{t(header)}</th>)}</tr></thead><tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((value, index) => index === 0 ? <th key={index} scope="row">{t(value)}</th> : <td key={index} className={block.numericColumns.includes(index) ? "zaw-numeric" : undefined}>{t(value)}</td>)}</tr>)}</tbody></table></div>;
    return <div className={className} key={block.id}>{t(content)}{t(isHighlighted ? <span className="zaw-rule-marker" aria-label={t(`当前规范：${rule.title}`)}>{t(rule.title)}</span> : null)}</div>;
  };

  return <div className="zaw-workbench" aria-label={t("Markdown 回答规范工作台")}>
    <header className="zaw-topbar"><div className="zaw-brand"><span className="zaw-brand-icon"><FileText size={18} aria-hidden="true"/></span><strong>{t("招财 Smart")}</strong><span className="zaw-topbar-divider"/><span>{t("回答规范")}</span></div><span className="zaw-sample-label">{t("示例数据")}</span><div className="zaw-scenarios" role="tablist" aria-label={t("回答场景")}>{scenes.map(item => <button type="button" role="tab" id={`${prefix}-scene-${item.id}`} aria-selected={item.id === sceneId} aria-controls={`${prefix}-scene-panel`} tabIndex={item.id === sceneId ? 0 : -1} key={item.id} onClick={() => changeScene(item.id)} onKeyDown={event => tabKey(event, scenes.map(current => current.id), sceneId, value => changeScene(value as SceneId), "scene")}>{t(item.label)}</button>)}</div></header>
    <div className="zaw-scene-panel" id={`${prefix}-scene-panel`} role="tabpanel" aria-labelledby={`${prefix}-scene-${sceneId}`}>
      <aside className="zaw-rules"><p className="zaw-nav-label">{t("查看规则")}</p><nav aria-label={t("回答规范规则")}>{rules.map(item => <button type="button" key={item.id} aria-pressed={item.id === activeRule} disabled={!scene.rules.includes(item.id)} onClick={() => { setActiveRule(item.id); setAnnotations(true); }} aria-controls={`${prefix}-rule-detail`}><span>{t(item.id === "reasoning" ? "结论与依据" : item.title)}</span></button>)}</nav><p className="zaw-nav-note">{t("选择规则，对照说明与回答中的标注。")}</p></aside>
      <div className="zaw-main">
        <div className="zaw-question"><span>{t("用户提问")}</span><p>{t(scene.question)}</p></div>
        <div className="zaw-toolbar"><div className="zaw-view-tabs" role="tablist" aria-label={t("回答查看方式")}>{[{ id: "rendered", label: "渲染结果", icon: Eye }, { id: "source", label: "Markdown 源文", icon: Code }].map(item => <button type="button" role="tab" id={`${prefix}-view-${item.id}`} aria-selected={view === item.id} aria-controls={`${prefix}-answer`} tabIndex={view === item.id ? 0 : -1} key={item.id} onClick={() => setView(item.id)} onKeyDown={event => tabKey(event, ["rendered", "source"], view, setView, "view")}><item.icon size={15} aria-hidden="true"/>{t(item.label)}</button>)}</div><label className="zaw-annotation-toggle"><input type="checkbox" role="switch" checked={annotations} onChange={event => setAnnotations(event.target.checked)}/><span>{t("规则标注")}</span></label></div>
        <section className="zaw-rule-detail" id={`${prefix}-rule-detail`} aria-labelledby={`${prefix}-rule-title`}><div className="zaw-rule-detail-title"><h4 id={`${prefix}-rule-title`}>{t(rule.title)}</h4><span className="zaw-rule-state" aria-live="polite">{t(view === "source" ? "切回渲染结果查看标注" : annotations ? `已标注 ${highlightedCount} 处` : "标注已隐藏")}</span></div><dl><div><dt>{t("规则")}</dt><dd>{t(rule.rule)}</dd></div><div><dt>{t("适用")}</dt><dd>{t(rule.applies)}</dd></div><div><dt>{t("检查")}</dt><dd>{t(rule.check)}</dd></div></dl></section>
        <div className="zaw-answer-panel" role="tabpanel" id={`${prefix}-answer`} aria-labelledby={`${prefix}-view-${view}`} tabIndex={0}>{t(view === "rendered" ? <div className="zaw-answer">{scene.blocks.map(renderBlock)}</div> : <pre className="zaw-markdown" aria-label={t("可选择复制的 Markdown 源文")}><code>{t(markdown)}</code></pre>)}</div>
        <div className="zaw-answer-footer"><span>{t("正文 14 px / 行高 24 px")}</span><button type="button" onClick={copy}>{t(copyStatus === "Markdown 已复制" ? <Check size={15} aria-hidden="true"/> : <Copy size={15} aria-hidden="true"/>)}{t(copyStatus === "Markdown 已复制" ? "已复制" : "复制 Markdown")}</button></div>
        <p className="zaw-copy-status" role="status" aria-live="polite">{t(copyStatus)}</p>
      </div>
    </div>
    <dialog ref={dialog} className="zaw-source-dialog" id={`${prefix}-source-detail`} aria-labelledby={`${prefix}-source-title`} onClose={() => sourceOpener.current?.focus({ preventScroll: true })} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <header><div><p>{t("来源详情 · 示例数据")}</p><h3 id={`${prefix}-source-title`}>{t("2024 年全集团季度净利润明细")}</h3></div><button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label={t("关闭来源详情")}><X size={20} aria-hidden="true"/></button></header>
      <div className="zaw-source-body"><p>{t("这份示例用于查看回答结构、数值口径与引用方式。")}</p><dl className="zaw-source-meta"><div><dt>{t("查询期间")}</dt><dd>{t("2024 年 1 月 1 日—12 月 31 日")}</dd></div><div><dt>{t("组织范围")}</dt><dd>{t("全集团")}</dd></div><div><dt>{t("指标口径")}</dt><dd>{t("净利润，按季度列示")}</dd></div><div><dt>{t("金额单位")}</dt><dd>{t("亿元，保留两位小数")}</dd></div><div><dt>{t("可用维度")}</dt><dd>{t("季度；未提供子公司明细")}</dd></div></dl><div className="zaw-table-wrap"><table><caption>{t("季度样例数据")}</caption><thead><tr><th scope="col">{t("统计期间")}</th><th scope="col" className="zaw-numeric">{t("净利润（亿元）")}</th></tr></thead><tbody>{quarterRows.map(row => <tr key={row[0]}><th scope="row">{t(row[0])}</th><td className="zaw-numeric">{t(row[1])}</td></tr>)}</tbody></table></div><p className="zaw-source-calculation">{t("合计：1.32 + 1.46 + 1.59 + 1.71 = 6.08 亿元")}</p></div>
      <footer><button type="button" onClick={() => dialog.current?.close()}>{t("返回回答")}</button></footer>
    </dialog>
  </div>;
}
