"use client";
import { useI18n } from "../i18n";
import { normalizeFinanceQuestion } from "./zhaocai-query";


import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right.mjs";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up.mjs";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down.mjs";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3.mjs";
import Check from "lucide-react/dist/esm/icons/check.mjs";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.mjs";
import CircleHelp from "lucide-react/dist/esm/icons/circle-help.mjs";
import Clock3 from "lucide-react/dist/esm/icons/clock-3.mjs";
import Database from "lucide-react/dist/esm/icons/database.mjs";
import FileText from "lucide-react/dist/esm/icons/file-text.mjs";
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard.mjs";
import LoaderCircle from "lucide-react/dist/esm/icons/loader-circle.mjs";
import Pencil from "lucide-react/dist/esm/icons/pencil.mjs";
import Search from "lucide-react/dist/esm/icons/search.mjs";
import Plus from "lucide-react/dist/esm/icons/plus.mjs";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw.mjs";
import Save from "lucide-react/dist/esm/icons/save.mjs";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.mjs";
import Square from "lucide-react/dist/esm/icons/square.mjs";
import Table2 from "lucide-react/dist/esm/icons/table-2.mjs";
import X from "lucide-react/dist/esm/icons/x.mjs";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { publicAsset } from "../portfolio-data";
import { PortfolioImage } from "../portfolio-image";
import { ProjectLocator } from "../project-locator";
import { ZhaocaiBoardEvidence, ZhaocaiAnswerEvidence, ZhaocaiAlternativeComparison, ZhaocaiRuleChecks } from "./ZhaocaiDesignEvidence";
import { ZhaocaiAnswerWorkbench } from "./ZhaocaiAnswerWorkbench";
import { ZhaocaiConversationContinuation } from "./ZhaocaiConversationContinuation";
import { useZhaocaiReference } from "./use-zhaocai-reference";
import "./zhaocai-smart.css";

type DemoStage = "entry" | "clarify" | "running" | "result" | "timeout" | "empty" | "stopped" | "board";
type Metric = "" | "营业利润" | "利润总额" | "净利润" | "其他指标";
type DemoScene = "clarify" | "running" | "result" | "exception";
type ExecutionMode = "normal" | "slow-demo";
type RecoveryStage = "timeout" | "empty" | "stopped";

const profitData = [
  { quarter: "一季度", value: 1.32 },
  { quarter: "二季度", value: 1.46 },
  { quarter: "三季度", value: 1.59 },
  { quarter: "四季度", value: 1.71 },
] as const;
const totalProfit = profitData.reduce((sum, item) => sum + item.value, 0);
const maxProfit = Math.max(...profitData.map(item => item.value));
const defaultQuery = "查看 2024 年全集团利润变化";

const walkthroughRecords = [
  { task: "执行前确认", observed: "缺少时间和组织时禁止执行；选择净利润后，2024 年与全集团继续保留。", evidence: [["01-missing-conditions.jpg", "缺失条件"], ["02-metric-confirmation.jpg", "口径确认"]] },
  { task: "停止后继续", observed: "停止时不展示结果，保留原问题、已确认条件和停止阶段；继续执行后返回同口径结果。", evidence: [["03-stopped-context.jpg", "停止时的上下文"]] },
  { task: "回答的判断边界", observed: "季度比较给出 0.39 亿元与 29.55%，说明不属于同比；缺少原因和子公司明细时，不归因、不排名、不填零。", evidence: [["04-quarter-comparison.jpg", "季度比较"], ["05-cause-boundary.jpg", "归因边界"], ["07-missing-dimension.jpg", "维度缺失与复制"]] },
  { task: "来源与窄屏阅读", observed: "来源明细与 6.08 亿元合计一致；Esc 关闭后焦点返回来源按钮。390px 下页面无横向溢出，完整表格可局部滚动。", evidence: [["06-source-table.jpg", "本次原始表"], ["08-mobile-table.jpg", "手机完整表格"]] },
] as const;

const problemRoles = [
  {
    number: "01",
    title: "财务人员",
    task: "核对指标、期间与范围",
    support: "口径准确，来源可追溯",
    focus: "先确认口径",
  },
  {
    number: "02",
    title: "经营分析人员",
    task: "查看趋势、整理结果",
    support: "结果可比较，内容可复用",
    focus: "保留查询上下文",
  },
  {
    number: "03",
    title: "业务负责人",
    task: "理解结论、支持判断",
    support: "重点清晰，按需查看依据",
    focus: "结论与依据分层",
  },
] as const;

const locatorSections = [
  ["zcs-project-overview", "问题与范围"],
  ["zcs-clarification", "口径取舍"],
  ["zcs-experience-journey", "完整对话"],
  ["zcs-markdown-system", "Markdown 规范"],
  ["zcs-delivery", "交付与验证"],
  ["zcs-reflection", "设计复盘"],
] as const;

const legacyAnchors: Record<string, string> = {
  overview: "zcs-project-overview",
  strategy: "zcs-clarification",
  clarification: "zcs-clarification",
  process: "zcs-process-feedback",
  board: "zcs-board-design",
  markdown: "zcs-markdown-system",
  "zcs-trust-mechanism": "zcs-ai-strategy",
  "zcs-ai-governance": "zcs-process-feedback",
};

function scrollToId(id: string, smooth = true) {
  const target = document.getElementById(id);
  if (!target) return;
  let disclosure = target.closest("details");
  while (disclosure) {
    disclosure.open = true;
    disclosure = disclosure.parentElement?.closest("details") ?? null;
  }
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: smooth && !reduceMotion ? "smooth" : "auto", block: "start" });
}

function Heading({ number, title, intro }: { number?: string; title: ReactNode; intro?: string }) {
  const { t } = useI18n();
  const normalizedTitle = typeof title === "string" ? title.replace(/。$/, "") : title;
  return <header className="zc4-heading" data-chapter={number}>{t(number ? <p className="zc4-chapter-label">{t(number)}</p> : null)}<h2>{t(normalizedTitle)}</h2>{t(intro ? <p>{t(intro)}</p> : null)}</header>;
}

function ProfitChart({ compact = false }: { compact?: boolean }) {
  const { t, localize, locale } = useI18n();
  return (
    <figure className={`zc4-chart${compact ? " is-compact" : ""}`}>
      <figcaption><strong>{t("季度净利润")}</strong><span>{t("单位：亿元")}</span></figcaption>
      <div className="zc4-bars" aria-hidden="true">
        {profitData.map(item => (
          <div className="zc4-chart-column" key={item.quarter}><div className="zc4-chart-plot"><div className="zc4-chart-bar" style={{ height: `${(item.value / maxProfit) * 100}%` }}><span className="zc4-chart-value">{t(item.value.toFixed(2))}</span></div></div><em>{t(item.quarter)}</em></div>
        ))}
      </div>
      <table className="zc4-sr-only"><caption>{t("演示数据：2024 年季度净利润，单位亿元")}</caption><thead><tr><th>{t("季度")}</th><th>{t("净利润")}</th></tr></thead><tbody>{profitData.map(item => <tr key={item.quarter}><td>{t(item.quarter)}</td><td>{t(item.value.toFixed(2))}</td></tr>)}</tbody></table>
    </figure>
  );
}

const specScenes = [
  ["经营分析", "请分析 2024 年全集团经营表现，并列出需要进一步核对的事项。", "2024 年全集团净利润合计 6.08 亿元，四个季度逐季上升。"],
  ["明细查询", "列出 2024 年各季度净利润及全年合计。", "季度明细与全年合计使用同一份返回数据，单位统一为亿元。"],
  ["空值与异常", "查询 2025 年集团净利润。", "当前未取得 2025 年数据，不将缺失值解释为 0。"],
  ["多维对比", "比较四个业务板块的盈利表现。", "同时保留规模、增速、利润率和占比，避免用单一指标下结论。"],
  ["指标与口径", "同比、环比和完成率应该怎么读？", "先说明比较对象与统计口径，再展示计算结果。"],
  ["多来源核对", "两份报告的利润数据不同，应如何解释？", "将结论与来源逐项对应，标明指标名称与统计范围。"],
  ["长篇经营报告", "整理一份 2024 年经营复盘。", "长回答先给摘要，再按季度、业务与待核对项展开。"],
  ["中英混排", "生成双语经营摘要。", "中英文共用同一统计期间、指标定义和数值来源。"],
] as const;

const specRules = [
  ["标题层级", "让读者先看到结论，再找到对应的依据。", "最多使用三级标题；20 / 18 / 16px，行高 32 / 28 / 24px，字重 600。"],
  ["结论与正文", "先给可以独立阅读的结论，再展开解释。", "正文 14px / 24px；结论、依据、建议与数据缺口分别表达。"],
  ["列表与步骤", "并列信息使用列表，有先后关系时使用步骤。", "同一层级保持语法一致，不用视觉缩进代替真实结构。"],
  ["数值与口径", "数值与单位、期间和统计范围一起出现。", "金额统一精度；同比、环比、完成率不能互相替换。"],
  ["表格与明细", "表头直接说明单位，合计遵循业务计算规则。", "金额可求和，完成率按汇总值重算，累计列取期末值。"],
  ["引用与来源", "让结论旁的引用能定位到具体来源。", "来源名称、统计期间和范围保持可追溯，不用样式暗示真实性。"],
  ["图表与数据", "图表和表格使用同一数据源。", "定量图表从零起轴；数据展开后能核对每个季度值。"],
  ["引文与提示", "引文保留原意，提示说明边界和下一步。", "不要用提示框代替正文层级，也不把推测写成事实。"],
  ["空值与异常", "区分未取得、无匹配、真实为零和计算不适用。", "缺失时保留查询范围，并提供可以继续执行的动作。"],
  ["公式与代码", "公式说明变量与计算顺序。", "先按原始值计算再统一展示精度，避免中间舍入。"],
  ["长文与摘要", "长回答先给摘要，再按主题展开。", "章节标题可定位，表格与引用放在对应结论附近。"],
  ["中英混排", "中英文共用同一口径与数值。", "英文缩写、数字与中文之间保持一致空格和标点规则。"],
] as const;

function SummarySpecWorkbench() {
  const { t, localize, locale } = useI18n();
  const [mode, setMode] = useState<"scenes" | "rules">("scenes");
  const [active, setActive] = useState(0);
  const [annotated, setAnnotated] = useState(true);
  const items = mode === "scenes" ? specScenes : specRules;
  const item = items[active];
  const switchMode = (next: "scenes" | "rules") => { setMode(next); setActive(0); };
  const moveTab = () => switchMode(mode === "scenes" ? "rules" : "scenes");
  return (
    <div className="zc4-spec-shell">
      <header>
        <strong>{t("招财 Smart ")}<span>{t("回答规范")}</span></strong>
        <div
          role="tablist"
          aria-label={t("回答规范视图")}
          onKeyDown={event => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            const tablist = event.currentTarget;
            moveTab();
            requestAnimationFrame(() => (tablist.querySelector('[aria-selected="true"]') as HTMLButtonElement | null)?.focus());
          }}
        >
          <button id="zc4-spec-scenes-tab" type="button" role="tab" aria-controls="zc4-spec-panel" aria-selected={mode === "scenes"} tabIndex={mode === "scenes" ? 0 : -1} onClick={() => switchMode("scenes")}>{t("场景示例")}</button>
          <button id="zc4-spec-rules-tab" type="button" role="tab" aria-controls="zc4-spec-panel" aria-selected={mode === "rules"} tabIndex={mode === "rules" ? 0 : -1} onClick={() => switchMode("rules")}>{t("组件规则")}</button>
        </div>
      </header>
      <div className="zc4-spec" id="zc4-spec-panel" role="tabpanel" aria-labelledby={mode === "scenes" ? "zc4-spec-scenes-tab" : "zc4-spec-rules-tab"}>
        <aside aria-label={t(mode === "scenes" ? "业务场景" : "内容组件")}>
          <p>{t(mode === "scenes" ? "按业务任务选择" : "按内容组件选择")}</p>
          {items.map((option, index) => <button type="button" className={active === index ? "active" : ""} aria-pressed={active === index} onClick={() => setActive(index)} key={option[0]}>{t(option[0])}</button>)}
        </aside>
        <article>
          <span>{t(mode === "scenes" ? "场景" : `TYPE-${String(active + 1).padStart(2, "0")}`)} / {t(item[0])}</span>
          <h3>{t(item[1])}</h3>
          <p><strong>{t(item[2])}</strong></p>
          {t(mode === "scenes" && active < 2 ? <>
            <nav className="zc4-answer-locator" aria-label={t("回答章节定位")}><a href="#zc4-spec-quarter">{t("季度表现")}</a><a href="#zc4-spec-source">{t("来源与说明")}</a></nav>
            <h4 id="zc4-spec-quarter">{t("季度表现")}</h4>
            <table><caption className="zc4-sr-only">{t("演示数据：2024 年季度净利润")}</caption><thead><tr><th>{t("季度")}</th><th>{t("净利润（亿元）")}</th></tr></thead><tbody>{profitData.map(row => <tr key={row.quarter}><td>{t(row.quarter)}</td><td>{t(row.value.toFixed(2))}</td></tr>)}</tbody></table>
            <p id="zc4-spec-source">{t("来源：集团经营指标表（示例）。增长原因仍需结合业务明细核对。")}</p>
          </> : <div className="zc4-spec-note"><CircleHelp size={17}/><p>{t(mode === "rules" ? "规则、示例与验收要点保持在同一视图中，便于逐项核对。" : "结论、数据与建议分别表达；信息不足时保留条件和可执行的下一步。")}</p></div>)}
          <footer><label><input type="checkbox" name="show-annotations" checked={annotated} onChange={event => setAnnotated(event.target.checked)}/>{t("显示规范标注")}</label><a href="#zcs-original-output">{t("查看原始设计依据")}</a></footer>
          {t(annotated ? <p className="zc4-annotation">{t("规范标注：正文 14px / 24px · 标题不超过三级 · 数据与来源关联")}</p> : null)}
        </article>
      </div>
    </div>
  );
}

function SpecWorkbench() {
  const { t, locale } = useI18n();
  const frame = useRef<HTMLIFrameElement>(null);
  const syncLanguage = () => frame.current?.contentWindow?.postMessage({ type: "portfolio-language", locale }, window.location.origin);
  useEffect(syncLanguage, [locale]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  return <div className="zc4-full-spec">{t(!ready && !failed ? <p className="zc4-spec-load" role="status">{t("正在加载回答规范与八类场景…")}</p> : null)}{t(failed ? <SummarySpecWorkbench/> : <iframe ref={frame} className="zc4-spec-frame" title={t("招财 Smart 回答规范：八类场景与组件规则")} src={publicAsset("/assets/projects/zhaocai-smart/long-image/spec-workbench.html")} loading="lazy" onLoad={event => { syncLanguage(); const loaded = Boolean(event.currentTarget.contentDocument?.querySelector("[data-zmd]")); setReady(loaded); setFailed(!loaded); }} onError={() => setFailed(true)} />)}</div>;
}

type BoardCard = { id: string; title: string; kind: "metric" | "chart" | "table"; merged?: BoardCard[] };
const initialBoardCards: BoardCard[] = [
  { id: "total", title: "全年净利润", kind: "metric" },
  { id: "trend", title: "季度净利润趋势", kind: "chart" },
  { id: "detail", title: "季度明细", kind: "table" },
];

function useDialogFocus<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const dialogRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const selector = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = () => Array.from(dialog.querySelectorAll<HTMLElement>(selector));
    requestAnimationFrame(() => focusables()[0]?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = focusables();
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      requestAnimationFrame(() => { if (previousFocus?.isConnected) previousFocus.focus(); });
    };
  }, [open]);

  return dialogRef;
}

function BoardCardContent({ card }: { card: BoardCard }) {
  const { t, localize, locale } = useI18n();
  if (card.kind === "metric") return <div className="zc4-board-metric"><p className="zc4-board-total"><strong>{t(totalProfit.toFixed(2))}</strong> {t(" 亿元")}</p><p>{t("2024 年 · 全集团 · 净利润")}</p><span>{t("来源：集团经营指标表（示例）")}</span></div>;
  if (card.kind === "chart") return <ProfitChart compact/>;
  return <DataTable compact/>;
}

function BoardDesignDemo() {
  const { t, localize, locale } = useI18n();
  const [cards, setCards] = useState<BoardCard[]>(initialBoardCards);
  const [selected, setSelected] = useState<string | null>(null);
  const [mergePair, setMergePair] = useState<[string,string] | null>(null);
  const [undo, setUndo] = useState<BoardCard[] | null>(null);
  const [notice, setNotice] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const addedCount = useRef(0);
  const undoButton = useRef<HTMLButtonElement>(null);
  const addCard = (template: BoardCard) => { addedCount.current += 1; setUndo(cards); setCards([...cards, { ...template, id: `${template.id}-added-${addedCount.current}` }]); setAddOpen(false); setNotice(`已添加“${template.title}”，可排序、合并或撤销。`); };
  const closeMerge = () => { setMergePair(null); setSelected(null); setNotice("已取消合并。"); };
  const mergeDialogRef = useDialogFocus<HTMLElement>(Boolean(mergePair), closeMerge);
  const move = (index: number, direction: -1 | 1) => { const target=index+direction; if(target<0||target>=cards.length)return; const next=[...cards]; [next[index],next[target]]=[next[target],next[index]]; setUndo(cards); setCards(next); setNotice("已调整卡片顺序。"); };
  const askMerge = (id: string) => { if(!selected){setSelected(id);setNotice("已选择卡片，请选择另一张卡片合并。");return;} if(selected===id){setSelected(null);setNotice("已取消选择。");return;} setMergePair([selected,id]); };
  const confirmMerge = () => { if(!mergePair)return; const [first,second]=mergePair; const before=cards; const chosen=cards.filter(card=>card.id===first||card.id===second); const merged:BoardCard={id:`merged-${first}-${second}`,title:"经营分析合集",kind:"chart",merged:chosen}; setCards([merged,...cards.filter(card=>card.id!==first&&card.id!==second)]); setUndo(before); setSelected(null); setMergePair(null); setNotice("已合并 2 张卡片，内容已保留在同一合集内。"); requestAnimationFrame(() => undoButton.current?.focus()); };
  const reset = () => { setCards(initialBoardCards); setSelected(null); setMergePair(null); setAddOpen(false); setUndo(null); setNotice("已重置为初始示例。"); };
  return <div className="zc4-board-demo"><header><div><strong>{t("招财 Smart")}</strong><span>{t("集团经营看板")}</span></div><div className="zc4-chips"><span>{t("2024 年")}</span><span>{t("全集团")}</span><span>{t("净利润 · 脱敏示例")}</span></div><button type="button" aria-expanded={addOpen} onClick={()=>setAddOpen(!addOpen)}><Plus size={15}/>{t("添加卡片")}</button></header>{t(addOpen ? <div className="zc4-board-add"><p>{t("从本次查询添加视图")}</p>{initialBoardCards.map(template => <button type="button" onClick={() => addCard(template)} key={template.id}><Plus size={15}/>{t(template.title)}</button>)}</div> : null)}<div className="zc4-board-cards">{cards.map((card,index)=><article className={`${selected===card.id?"selected":""}${card.merged?" is-merged":""}`} key={card.id}><div className="zc4-card-toolbar"><span>{t(card.title)}</span><div><button type="button" disabled={index===0} onClick={()=>move(index,-1)} aria-label={t(`上移${card.title}`)}><ArrowUp size={15}/></button><button type="button" disabled={index===cards.length-1} onClick={()=>move(index,1)} aria-label={t(`下移${card.title}`)}><ArrowDown size={15}/></button>{t(card.merged?<span className="zc4-merged-status">{t("已合并")}</span>:<button type="button" aria-pressed={selected===card.id} onClick={()=>askMerge(card.id)}>{t(selected===card.id?"取消":selected?"合并到这里":"合并")}</button>)}</div></div>{t(card.merged?<div className="zc4-merged">{card.merged.map(item=><section key={item.id}><h4>{t(item.title)}</h4><BoardCardContent card={item}/></section>)}</div>:<BoardCardContent card={card}/>)}</article>)}</div><footer><p aria-live="polite">{t(notice || "查询条件与来源随结果保留；添加、排序与合并都可以撤销。")}</p><div><button ref={undoButton} type="button" disabled={!undo} onClick={()=>{if(undo){setCards(undo);setUndo(null);setSelected(null);setNotice("已撤销上一步操作。");}}}><RotateCcw size={14}/>{t("撤销")}</button><button type="button" onClick={reset}>{t("重置")}</button></div></footer>{t(mergePair?<div className="zc4-board-confirm"><section ref={mergeDialogRef} role="dialog" aria-modal="true" aria-labelledby="merge-title"><h3 id="merge-title">{t("合并这两张卡片？")}</h3><p>{t("将“")}{t(cards.find(card=>card.id===mergePair[0])?.title)}{t("”和“")}{t(cards.find(card=>card.id===mergePair[1])?.title)}{t("”整理到同一合集，保留各自的查询条件与数据依据。")}</p><footer><button type="button" onClick={closeMerge}>{t("取消")}</button><button type="button" className="zc4-primary" onClick={confirmMerge}>{t("确认合并")}</button></footer></section></div>:null)}</div>;
}

type DemoProps = {
  resetToken: number;
  stage: DemoStage;
  setStage: (stage: DemoStage) => void;
  query: string;
  setQuery: (query: string) => void;
  metric: Metric;
  setMetric: (metric: Metric) => void;
  year: string;
  setYear: (year: string) => void;
  scope: string;
  setScope: (scope: string) => void;
  phase: number;
  executionId: number;
  executionMode: ExecutionMode;
  setExecutionMode: (mode: ExecutionMode) => void;
  beginExecution: (retry?: boolean) => void;
  runFromEntry: () => void;
};

function ConditionFields({ year, scope, metric = "", supplement = "" }: { year: string; scope: string; metric?: Metric; supplement?: string }) {
  const { t, localize, locale } = useI18n();
  return <dl className="zc4-condition-fields"><div><dt>{t("统计时间")}</dt><dd>{t(year ? `${year} 年` : "待确认")}</dd></div><div><dt>{t("组织范围")}</dt><dd>{t(scope || "待确认")}</dd></div><div><dt>{t("指标口径")}</dt><dd><i className={metric ? "ready" : ""}/>{t(metric === "其他指标" ? `${supplement || "其他指标"} · 待确认` : metric ? `${metric} · 待确认` : "待确认")}</dd></div></dl>;
}

function ExecutionStages({ phase, animated = false }: { phase: number; animated?: boolean }) {
  const { t, localize, locale } = useI18n();
  return <ol className="zc4-execution-stages">{["理解问题", "查询数据", "生成结果"].map((label, index) => <li className={index < phase ? "done" : index === phase ? "current" : ""} key={label}><span>{t(index < phase ? <Check size={16}/> : index === phase ? <LoaderCircle className={animated ? "spin" : undefined} size={16}/> : index + 1)}</span><div><strong>{t(label)}</strong><p>{t(index === 0 ? "整理时间、组织与指标条件" : index === 1 ? "正在查询集团经营指标表" : "组织图表、解释与查询快照")}</p></div></li>)}</ol>;
}

function QuerySourceFields() {
  const { t, localize, locale } = useI18n();
  return <dl className="zc4-query-source-fields"><div><dt>{t("统计范围")}</dt><dd>2024.01.01—2024.12.31<br/>{t("全集团 · 按季度汇总")}</dd></div><div><dt>{t("指标确认")}</dt><dd>{t("利润 → 净利润")}<br/>{t("由用户确认")}</dd></div><div><dt>{t("数据来源")}</dt><dd>{t("集团经营指标表（示例）")}</dd></div><div><dt>{t("返回数据")}</dt><dd>{t("4 条季度汇总数据")}</dd></div></dl>;
}

function ExceptionState({ stage, query, year, scope, metric, phase = 1, supplement = "", onPrimary, onEdit, preview = false }: {
  stage: RecoveryStage;
  query: string;
  year: string;
  scope: string;
  metric: Metric;
  phase?: number;
  supplement?: string;
  onPrimary: () => void;
  onEdit: () => void;
  preview?: boolean;
}) {
  const { t, localize, locale } = useI18n();
  const metricLabel = metric === "其他指标" ? supplement || "其他指标" : metric || "待确认指标";
  const title = stage === "timeout" ? "查询暂未完成" : stage === "empty" ? (metric && metric !== "净利润" ? "该指标暂无演示数据" : "该条件暂无演示数据") : "查询已停止";
  const message = stage === "timeout" ? "本次条件已保留，你可以从当前条件重新查询。" : stage === "empty" ? `当前示例未提供 ${year || "待确认时间"} / ${scope || "待确认组织"} / ${metricLabel} 的数据。可以修改条件，或查看已有的集团示例。` : "问题、条件与已完成阶段均已保留。";
  const primaryLabel = preview ? (stage === "timeout" ? "体验超时重试" : stage === "empty" ? "体验无匹配与恢复" : "体验停止与继续") : (stage === "timeout" ? "重新查询" : stage === "empty" ? "使用 2024 年全集团净利润示例" : "继续执行");
  return <div className="zc4-exception-state">
    <div className="zc4-exception-context"><div className="zc4-exception-question"><span>{t("你的问题")}</span><p>{t(query)}</p></div><div className="zc4-exception-conditions"><span>{t("本次查询条件")}</span><div className="zc4-condition-chips"><span>{t(year ? `${year} 年` : "待确认时间")}</span><span>{t(scope || "待确认组织")}</span><span>{t(metricLabel)}</span></div></div>{t(stage !== "empty" ? <p className="zc4-exception-phase">{t(stage === "stopped" ? "停止位置" : "未完成阶段")}{t("：")}{t(["理解问题", "查询数据", "生成结果"][Math.min(2, Math.max(0, phase))])}</p> : null)}</div>
    <section className="zc4-exception"><span>{t(stage === "timeout" ? <Clock3 size={24}/> : stage === "empty" ? <Database size={24}/> : <Square size={22}/>)}</span><div><h3>{t(title)}</h3><p>{t(message)}</p><div><button className="zc4-primary" type="button" onClick={onPrimary}>{t(!preview && stage === "timeout" ? <RotateCcw size={15}/> : null)}{t(primaryLabel)}{t(preview ? <ArrowUpRight size={15}/> : null)}</button><button type="button" onClick={onEdit}>{t(preview ? "体验" : "")}{t(stage === "stopped" ? "修改问题" : "修改条件")}</button></div></div></section>
  </div>;
}

function ProductDemo({ resetToken, stage, setStage, query, setQuery, metric, setMetric, year, setYear, scope, setScope, phase, executionId, executionMode, setExecutionMode, beginExecution, runFromEntry }: DemoProps) {
  const { t, localize, locale } = useI18n();
  const [supplementOpen, setSupplementOpen] = useState(false);
  const [supplement, setSupplement] = useState("");
  const [supplementReview, setSupplementReview] = useState(false);
  const [view, setView] = useState<"chart"|"table">("chart");
  const [evidence, setEvidence] = useState(false);
  const [showProcess, setShowProcess] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("2024 年集团净利润分析");
  const [conditionEdit, setConditionEdit] = useState(false);
  const [missingRangeOpen, setMissingRangeOpen] = useState(false);
  const [versions, setVersions] = useState<{ id: number; year: string; scope: string }[]>([]);
  const [viewedVersion, setViewedVersion] = useState(0);
  const pendingVersion = useRef<number | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<{ name: string; year: string; scope: string; metric: string; executionId: number } | null>(null);
  const previousTaskStage = useRef<DemoStage>("clarify");
  const evidenceButton = useRef<HTMLButtonElement>(null);
  const supplementInput = useRef<HTMLTextAreaElement>(null);
  const saveDialogRef = useDialogFocus<HTMLElement>(saveOpen, () => setSaveOpen(false));
  const tableDialogRef = useDialogFocus<HTMLElement>(tableOpen, () => setTableOpen(false));
  useEffect(() => {
    if (stage === "clarify" && (!year || !scope)) setMissingRangeOpen(true);
    if (stage !== "clarify") setMissingRangeOpen(false);
  }, [stage, year, scope]);
  useEffect(() => {
    setSupplementOpen(false);
    setSupplement("");
    setSupplementReview(false);
    setConditionEdit(false);
    setEvidence(stage === "result");
    setShowProcess(false);
    setTableOpen(false);
    setSaveOpen(false);
  }, [resetToken]);
  useEffect(() => {
    if (stage !== "result" || executionId < 1) return;
    setVersions(current => current.some(version => version.id === executionId) ? current : [...current, { id: executionId, year, scope }]);
    setViewedVersion(pendingVersion.current ?? executionId);
    pendingVersion.current = null;
  }, [stage, executionId, year, scope]);
  const displayedVersion = viewedVersion || Math.max(1, executionId);

  const confirmMetric = () => {
    if (!metric || !year || !scope) return;
    if (metric === "其他指标" && !supplementReview) { setSupplementReview(true); return; }
    if (metric !== "净利润" || year !== "2024" || scope !== "全集团") { setStage("empty"); return; }
    beginExecution();
  };
  const openSupplement = () => {
    setMetric("其他指标");
    setSupplementOpen(true);
    setSupplementReview(false);
    requestAnimationFrame(() => supplementInput.current?.focus());
  };
  const returnToCandidates = () => {
    setSupplementOpen(false);
    setSupplementReview(false);
    setMetric("");
  };
  const useSupportedExample = () => {
    setQuery("查看 2024 年全集团净利润变化");
    setYear("2024");
    setScope("全集团");
    setMetric("净利润");
    setSupplementOpen(false);
    setSupplementReview(false);
    beginExecution();
  };
  const openSavedAnalysis = () => {
    if (!savedSnapshot) return;
    pendingVersion.current = savedSnapshot.executionId;
    setQuery(`查看 ${savedSnapshot.year} 年${savedSnapshot.scope}净利润变化`);
    setYear(savedSnapshot.year);
    setScope(savedSnapshot.scope);
    setMetric("净利润");
    setStage("result");
    setEvidence(true);
  };
  const openBoard = () => { if (stage !== "board") previousTaskStage.current = stage; setStage("board"); };
  const closeEvidence = () => { setEvidence(false); requestAnimationFrame(() => evidenceButton.current?.focus()); };
  const newQuery = () => { setEvidence(false); setShowProcess(false); setSupplementOpen(false); setSupplement(""); setSupplementReview(false); setConditionEdit(false); setView("chart"); setQuery(""); setMetric(""); setYear(""); setScope(""); setStage("entry"); };

  return (
    <div className="zc4-product">
      <div className="zc4-product-main">
        <header className="zc4-topbar"><div><span>{t("智能问数")}</span><i>/</i><strong>{t(stage === "board" ? "我的看板" : stage === "entry" ? "新建查询" : "集团年度利润分析")}</strong></div><div className="zc4-topbar-actions"><span className={`zc4-topbar-status is-${stage}`}>{t(stage === "running" ? "查询中" : stage === "result" ? "已完成" : stage === "clarify" ? "待确认" : stage === "stopped" ? "已停止" : stage === "timeout" ? "待重试" : stage === "empty" ? "无匹配数据" : stage === "board" ? "结果复用" : "新建任务")}</span><button className="zc4-new-query" type="button" onClick={newQuery}><Plus aria-hidden="true" size={15}/>{t("新建查询")}</button></div></header>
        {t(stage==="entry" ? <section className="zc4-entry"><div className="brand"><Sparkles size={20}/>{t("招财 Smart")}</div><h3>{t("想了解哪些经营数据？")}</h3><p>{t("说出想看的指标，时间与组织也可以在下一步补齐。")}</p><label>{t("输入问题")}<textarea aria-label={t("输入问题")} name="finance-question" autoComplete="off" value={t(query)} onChange={event=>setQuery(event.target.value)} placeholder={t("例如：查看 2024 年全集团利润变化…")}/></label><button className="zc4-primary" type="button" disabled={!query.trim()} onClick={runFromEntry}><Search aria-hidden="true" size={16}/>{t("发起查询")}</button><div className="zc4-entry-examples" role="group" aria-label={t("示例问题")}>{["查看 2024 年全集团利润变化", "查看全集团净利润", "查看 2025 年全集团净利润"].map(text => <button type="button" key={text} onClick={() => setQuery(text)}>{t(text)}</button>)}</div></section>:null)}
        {t(stage === "clarify" ? (
          <section className="zc4-clarify">
            <div className="main">
              <div className="question"><span>{t("你的问题")}</span><p>{t(query)}</p></div>
              <div className="brand"><Sparkles size={19}/>{t("招财 Smart")}</div>
              <h3>{t(!year || !scope ? "补齐统计范围，再继续查询" : metric ? "确认本次查询条件" : "你想查看哪一种利润？")}</h3>
              <p>{t(!year || !scope ? "时间和组织会影响结果，请先补充缺少的条件。" : "“利润”可能对应多个指标，请选择本次统计口径。")}</p>
              {t(missingRangeOpen ? <div className="zc4-missing-conditions"><label>{t("统计时间")}<select aria-label={t("补充统计时间")} value={year} onChange={event => setYear(event.target.value)}><option value="">{t("选择统计时间")}</option>{["2023", "2024", "2025"].map(value => <option key={value} value={value}>{t(value)} {t(" 年")}</option>)}</select></label><label>{t("组织范围")}<select aria-label={t("补充组织范围")} value={scope} onChange={event => setScope(event.target.value)}><option value="">{t("选择组织范围")}</option>{["全集团", "华南分公司", "华东分公司", "华北分公司"].map(value => <option key={value} value={value}>{t(value)}</option>)}</select></label></div> : null)}
              {t(!supplementOpen ? <fieldset>
                <legend className="zc4-sr-only">{t("选择利润口径")}</legend>
                {(["营业利润", "利润总额", "净利润"] as Metric[]).map((option, index) => {
                  const inputId = `zc4-metric-${index}`;
                  return (
                    <div className={`zc4-metric-option${metric === option ? " active" : ""}`} key={option}>
                      <label htmlFor={inputId}><input id={inputId} type="radio" name="metric" value={option} checked={metric === option} onChange={() => setMetric(option)}/><span>{t(option)}</span>{t(metric === option ? <Check aria-hidden="true" size={16}/> : null)}</label>
                    </div>
                  );
                })}
                <button className="zc4-supplement-trigger" type="button" onClick={openSupplement}>{t("都不是，补充说明")}</button>
              </fieldset> : <div className="zc4-supplement">
                <label htmlFor="zc4-supplement-input">{t("补充指标或业务含义")}</label>
                <textarea ref={supplementInput} id="zc4-supplement-input" value={supplement} onChange={event => { setSupplement(event.target.value); setSupplementReview(false); }} placeholder={t("例如：扣除非经常性损益后的利润")} />
                {t(supplementReview ? <div className="zc4-supplement-review" role="status"><strong>{t("拟采用的条件")}</strong><span>{t(year || "时间待确认")} / {t(scope || "组织待确认")} / {t(supplement || "指标待补充")}</span><p>{t("本示例尚未提供该指标数据，提交后保留条件，并提供其他查询入口。")}</p></div> : null)}
                <button type="button" onClick={returnToCandidates}>{t("返回候选")}</button>
              </div>)}
              <p className="footnote">{t("原问题、时间和组织会持续保留，只补充本次指标口径。")}</p>
              <div className="actions"><button className="zc4-primary" type="button" disabled={!year || !scope || !metric || (metric === "其他指标" && !supplement.trim())} onClick={confirmMetric}>{t(!year || !scope ? "补齐条件后继续" : metric === "其他指标" ? (supplementReview ? "提交补充说明" : "确认补充条件") : metric ? `按${metric}查询` : "选择口径后继续")}</button></div>
            </div>
            <aside className="conditions"><h4>{t("已识别条件")}</h4><ConditionFields year={year} scope={scope} metric={metric} supplement={supplement}/><button type="button" aria-expanded={conditionEdit} onClick={() => setConditionEdit(!conditionEdit)}><Pencil size={15}/>{t(conditionEdit ? "收起条件编辑" : "修改已识别条件")}</button>{t(conditionEdit ? <div className="editor"><label>{t("统计时间")}<select aria-label={t("统计时间")} value={year} onChange={event => setYear(event.target.value)}><option value="">{t("选择统计时间")}</option>{["2023", "2024", "2025"].map(value => <option key={value} value={value}>{t(value)} {t(" 年")}</option>)}</select></label><label>{t("组织范围")}<select aria-label={t("组织范围")} value={scope} onChange={event => setScope(event.target.value)}><option value="">{t("选择组织范围")}</option>{["全集团", "华南分公司", "华东分公司", "华北分公司"].map(value => <option key={value} value={value}>{t(value)}</option>)}</select></label><button type="button" onClick={() => { setConditionEdit(false); setQuery(`查看 ${year ? `${year} 年` : "待确认时间"} ${scope || "待确认组织"}利润变化`); }}>{t("应用条件")}</button></div> : null)}<div className="source"><Database size={15}/><span>{t("查询数据")}<strong>{t("集团经营指标表（示例）")}</strong></span></div></aside>
          </section>
        ) : null)}
        {t(stage==="running" ? <section className="zc4-running" aria-live="polite"><div className="zc4-task-question"><span>{t("你的问题")}</span><p>{t(query)}</p></div><header><div className="zc4-running-identity"><span className="zc4-assistant-avatar"><Sparkles aria-hidden="true" size={18}/></span><div><span className="zc4-running-status">{t(executionMode === "slow-demo" ? "慢查询演示 · 模拟等待" : "正在查询数据")}</span><h3>{t(year)} {t(" 年")}{t(scope)}{t("净利润分析")}</h3><p>{t("已确认统计条件，正在处理第 ")}{t(phase + 1)} {t(" / 3 个阶段。")}</p></div></div></header><div className="zc4-condition-chips"><span>{t(year)} {t(" 年")}</span><span>{t(scope)}</span><span>{t("净利润 · 用户已确认")}</span></div><ExecutionStages phase={phase} animated/><footer><p>{t(executionMode === "slow-demo" ? "点击继续查看结果，或停止本次查询。" : "查询仍在进行，你可以继续等待或停止本次查询。")}</p><div>{t(executionMode === "slow-demo" ? <button className="zc4-primary" type="button" onClick={()=>{setExecutionMode("normal");setStage("result")}}>{t("继续查看结果")}</button> : null)}<button type="button" onClick={()=>setStage("stopped")}><Square size={14}/>{t("停止查询")}</button></div></footer></section>:null)}
        {t(stage === "result" ? (
          <div className={`zc4-result-layout${evidence ? " with-evidence" : ""}`}>
            <section className="zc4-result">
              <header><div><h3>{t("2024 年集团净利润分析")}</h3><div className="zc4-condition-chips"><span>{t(year)} {t(" 年")}</span><span>{t(scope)}</span><span>{t("净利润 · 用户已确认")}</span><button type="button" onClick={()=>{setMetric("");setStage("clarify")}}><Pencil size={14}/>{t("修改条件")}</button></div></div><button className="zc4-primary" type="button" onClick={()=>setSaveOpen(true)}><Save size={16}/>{t("保存到看板")}</button></header>
              <div className="zc4-complete"><span><Check size={14}/>{t("理解问题")}</span><span><Check size={14}/>{t("查询数据")}</span><span><Check size={14}/>{t("生成结果")}</span><button type="button" aria-expanded={showProcess} aria-controls={showProcess ? "zc4-demo-process" : undefined} onClick={()=>setShowProcess(!showProcess)}>{t("查看过程")}<ChevronDown size={14}/></button></div>
              {t(showProcess?<div className="zc4-process" id="zc4-demo-process"><span><Check size={14}/>{t("理解问题：时间、组织与指标已对齐")}</span><span><Check size={14}/>{t("查询数据：返回 4 条季度汇总数据")}</span><span><Check size={14}/>{t("生成结果：已关联查询快照")}</span></div>:null)}
              <article className="zc4-result-card">
                <span className="zc4-result-demo-label">{t("演示数据")}</span>
                <p className="total">{t("全年净利润 ")}<strong>{t(totalProfit.toFixed(2))}</strong> {t(" 亿元")}</p>
                <p>{t("四个季度净利润逐季上升，四季度为 1.71 亿元。")}</p>
                <small>{t("增长原因仍需结合业务明细核对。")}</small>
                <div className="view-tabs" role="group" aria-label={t("结果显示方式")}><button type="button" aria-pressed={view === "chart"} onClick={()=>setView("chart")}><BarChart3 size={14}/>{t("图表")}</button><button type="button" aria-pressed={view === "table"} onClick={()=>setView("table")}><Table2 size={14}/>{t("表格")}</button></div>
                <div>{t(view === "chart" ? <ProfitChart/> : <DataTable/>)}</div>
                <footer><span><FileText size={15}/>{t("集团经营指标表（示例）")}</span><button ref={evidenceButton} type="button" onClick={()=>setEvidence(true)}>{t("查看口径与数据依据")}<ArrowUpRight size={14}/></button></footer>
              </article>
              <ZhaocaiConversationContinuation key={executionId} onSource={() => setEvidence(true)}/>
              {t(savedSnapshot?<div className="zc4-saved-note"><Check size={16}/>{t("已保存到“集团经营分析”")}<button type="button" onClick={openBoard}>{t("查看看板")}</button></div>:null)}
            </section>
            {t(evidence?<aside className="zc4-evidence" aria-label={t("本次查询依据")}><header><h3>{t("本次查询依据")}</h3><button type="button" aria-label={t("关闭查询依据")} onClick={closeEvidence}><X size={18}/></button></header><label>{t("执行版本")}<select aria-label={t("执行版本")} value={displayedVersion} onChange={event => setViewedVersion(Number(event.target.value))}>{t(versions.length ? versions.map(version => <option key={version.id} value={version.id}>{t("第 ")}{t(version.id)} {t(" 次执行 · 已完成")}</option>) : <option value={displayedVersion}>{t("第 ")}{t(displayedVersion)} {t(" 次执行 · 已完成")}</option>)}</select></label><QuerySourceFields/><button type="button" onClick={()=>setTableOpen(true)}><Table2 aria-hidden="true" size={16}/>{t("查看本次原始表格")}</button><p>{t("完成版本保留查询快照；修改条件后重新执行。本例的可查询范围为 2024 年全集团净利润。")}</p></aside>:null)}
          </div>
        ) : null)}
        {t((["timeout", "empty", "stopped"] as DemoStage[]).includes(stage) ? <ExceptionState stage={stage as RecoveryStage} query={query} year={year} scope={scope} metric={metric} phase={phase} supplement={supplement} onPrimary={stage === "empty" ? useSupportedExample : () => beginExecution(true)} onEdit={() => setStage("entry")}/> : null)}
        {t(stage==="board"?<section className="zc4-board"><header><div><LayoutDashboard size={20}/><h3>{t("我的看板")}</h3></div><button type="button" onClick={()=>setStage(previousTaskStage.current === "running" ? "stopped" : previousTaskStage.current)}>{t("返回原任务")}</button></header>{t(savedSnapshot?<><div className="success"><Check size={16}/>{t("已保存到「集团经营分析」")}</div><article><div><h4>{t(savedSnapshot.name)}</h4><p>{t(savedSnapshot.year)} {t(" 年 / ")}{t(savedSnapshot.scope)} / {t(savedSnapshot.metric)}</p><span><Database size={14}/>{t("集团经营指标表（示例）")}</span></div><button type="button" onClick={openSavedAnalysis}>{t("打开分析")}<ArrowUpRight size={14}/></button></article></>:<div className="empty"><LayoutDashboard size={28}/><h4>{t("还没有保存的分析")}</h4><p>{t("在结果页保存后，结果与查询上下文会一起保留。")}</p></div>)}</section>:null)}
      </div>
      {t(saveOpen?<div className="zc4-dialog-backdrop"><section ref={saveDialogRef} className="zc4-dialog" role="dialog" aria-modal="true" aria-labelledby="save-title" aria-describedby="save-description"><header><h3 id="save-title">{t("保存到看板")}</h3><button type="button" aria-label={t("关闭保存对话框")} onClick={()=>setSaveOpen(false)}><X size={18}/></button></header><label>{t("结果名称")}<input name="result-name" autoComplete="off" value={t(saveName)} onChange={e=>setSaveName(e.target.value)}/></label><label>{t("选择看板")}<select aria-label={t("选择看板")} name="target-board" autoComplete="off"><option>{t("集团经营分析（示例）")}</option></select></label><p id="save-description">{t("同时保存本次结果、查询条件与数据来源。")}</p><footer><button type="button" onClick={()=>setSaveOpen(false)}>{t("取消")}</button><button className="zc4-primary" type="button" disabled={!saveName.trim()} onClick={()=>{setSavedSnapshot({ name: saveName.trim(), year, scope, metric: "净利润", executionId: displayedVersion });setSaveOpen(false)}}>{t("保存")}</button></footer></section></div>:null)}
      {t(tableOpen?<div className="zc4-dialog-backdrop"><section ref={tableDialogRef} className="zc4-dialog table" role="dialog" aria-modal="true" aria-labelledby="table-title"><header><div><span>{t("第 ")}{t(displayedVersion)} {t(" 次执行 · 示例数据")}</span><h3 id="table-title">{t("集团经营指标表")}</h3></div><button type="button" aria-label={t("关闭原始表格")} onClick={()=>setTableOpen(false)}><X size={18}/></button></header><DataTable/><p>{t("图表、合计与查询快照使用同一份返回数据。")}</p></section></div>:null)}
    </div>
  );
}

function DataTable({ compact = false }: { compact?: boolean }) {
  const { t, localize, locale } = useI18n();
  return (
    <div className={`zc4-table-wrap${compact ? " is-compact" : ""}`} role="region" aria-label={t("演示数据：2024 年季度净利润数据表，可横向滚动")} tabIndex={0}>
      <table className="zc4-table">
        <caption>{t("演示数据：2024 年季度净利润")}</caption>
        <thead><tr><th scope="col">{t("季度")}</th><th scope="col">{t("组织范围")}</th><th scope="col">{t("净利润（亿元）")}</th></tr></thead>
        <tbody>{profitData.map(item => <tr key={item.quarter}><th scope="row">{t(item.quarter)}</th><td>{t("全集团")}</td><td>{t(item.value.toFixed(2))}</td></tr>)}</tbody>
        <tfoot><tr><th scope="row" colSpan={2}>{t("全年合计")}</th><td>{t(totalProfit.toFixed(2))}</td></tr></tfoot>
      </table>
    </div>
  );
}

export function ZhaocaiSmartCompleteCase() {
  const { t, locale } = useI18n();
  const reference = useZhaocaiReference();
  const [stage, setStage] = useState<DemoStage>("clarify");
  const [query, setQuery] = useState(defaultQuery);
  const [metric, setMetric] = useState<Metric>("");
  const [year, setYear] = useState("2024");
  const [scope, setScope] = useState("全集团");
  const [phase, setPhase] = useState(0);
  const [executionId, setExecutionId] = useState(0);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>("normal");
  const [scene, setScene] = useState<DemoScene>("clarify");
  const [resetToken, setResetToken] = useState(0);
  const demoRef = useRef<HTMLDivElement>(null);

  const beginExecution = (retry = false) => { setExecutionMode("normal"); setExecutionId(current => retry ? Math.max(2,current+1) : Math.max(1,current+1)); setPhase(current => retry ? current : 0); setStage("running"); };
  const runFromEntry = () => {
    const parsedQuery = normalizeFinanceQuestion(query);
    const parsedYear = parsedQuery.match(/20\d{2}/)?.[0] ?? "";
    const parsedScope = parsedQuery.match(/全集团|华南分公司|华东分公司|华北分公司/)?.[0] ?? "";
    const parsedMetric: Metric = parsedQuery.includes("净利润") ? "净利润" : parsedQuery.includes("利润总额") ? "利润总额" : parsedQuery.includes("营业利润") ? "营业利润" : "";
    setYear(parsedYear);
    setScope(parsedScope);
    setMetric(parsedMetric);
    if (!parsedQuery.includes("利润")) { setMetric("其他指标"); setStage("empty"); return; }
    if (!parsedYear || !parsedScope || (!parsedMetric && !parsedQuery.includes("利润"))) { setStage("clarify"); return; }
    if (parsedMetric) {
      if (parsedYear === "2024" && parsedScope === "全集团" && parsedMetric === "净利润") beginExecution();
      else setStage("empty");
      return;
    }
    setStage("clarify");
  };
  const setDemo = (next: DemoScene, preserveContext = false) => {
    setScene(next);
    setResetToken(current => current + 1);
    if (next !== "clarify") setQuery("查看 2024 年全集团净利润变化");
    if (next === "clarify") {
      if (!preserveContext) { setQuery(defaultQuery); setYear("2024"); setScope("全集团"); setMetric(""); }
      setMetric("");
      setStage("clarify");
    } else if (next === "running") {
      setYear("2024"); setScope("全集团"); setMetric("净利润"); setExecutionMode("slow-demo"); setExecutionId(current => Math.max(1,current+1)); setPhase(1); setStage("running");
    } else if (next === "result") {
      setYear("2024"); setScope("全集团"); setMetric("净利润"); setExecutionMode("normal"); setExecutionId(current=>Math.max(1,current)); setStage("result");
    } else {
      setYear("2024"); setScope("全集团"); setMetric("净利润"); setExecutionMode("normal"); setExecutionId(current=>Math.max(1,current)); setStage("timeout");
    }
  };

  const openDemo = (next: DemoScene, source: HTMLElement, preserveContext = false) => {
    setDemo(next, preserveContext);
    reference.openReference(source, "zcs-core-interaction");
  };

  const openRecovery = (next: RecoveryStage, edit = false) => {
    const source = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDemo("exception");
    if (next === "empty") {
      setQuery("查看 2025 年全集团净利润变化");
      setYear("2025");
    }
    setPhase(1);
    setStage(edit ? "entry" : next);
    if (source && !demoRef.current?.contains(source)) reference.openReference(source, "zcs-core-interaction");
  };

  useEffect(()=>{
    if(stage!=="running" || executionMode!=="normal") return;
    const elapsed = phase >= 2 ? 2400 : phase === 1 ? 1000 : 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (phase < 1) timers.push(setTimeout(()=>setPhase(1),1000 - elapsed));
    if (phase < 2) timers.push(setTimeout(()=>setPhase(2),2400 - elapsed));
    timers.push(setTimeout(()=>setStage("result"),3800 - elapsed));
    return()=>timers.forEach(clearTimeout);
  },[stage,executionId,executionMode]);

  useEffect(() => {
    const backLink = document.querySelector<HTMLAnchorElement>(".zc4-page-footer a:last-child");
    if (backLink) backLink.href = `${window.__PORTFOLIO_BASE__ ?? "/portfolio"}/#work`;
  }, []);

  useEffect(() => {
    const revealAnchor = () => {
      let requested: string;
      try { requested = decodeURIComponent(window.location.hash.slice(1)); }
      catch { return; }
      const target = document.getElementById(legacyAnchors[requested] ?? requested);
      if (target?.closest("details")) scrollToId(target.id, false);
    };
    revealAnchor();
    window.addEventListener("hashchange", revealAnchor);
    return () => window.removeEventListener("hashchange", revealAnchor);
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const previousDescription = description?.content;
    const previousOgTitle = ogTitle?.content;
    const previousOgDescription = ogDescription?.content;
    document.title = "招财 Smart｜对话体验与回答规范｜李家豪";
    if (description) description.content = "招财 Smart 设计案例，聚焦财务问数中的口径确认、任务控制与 Markdown 回答规范，以原始设计稿和示例交互说明设计取舍。";
    if (ogTitle) ogTitle.content = "招财 Smart｜对话体验与回答规范";
    if (ogDescription) ogDescription.content = "从口径确认到来源核对，展示财务问数的对话流程、关键取舍与 Markdown 回答规则。";
    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
      if (ogTitle && previousOgTitle) ogTitle.content = previousOgTitle;
      if (ogDescription && previousOgDescription) ogDescription.content = previousOgDescription;
    };
  }, []);

  const demoProps: DemoProps = { resetToken, stage, setStage, query, setQuery, metric, setMetric, year, setYear, scope, setScope, phase, executionId, executionMode, setExecutionMode, beginExecution, runFromEntry };
  return (
    <article className="zc4" id="zcs-case-top" data-case-ready="text" aria-label={t("招财 Smart 对话体验与回答规范案例")}>
      <a className="zc4-skip-link" href="#zcs-project-overview">{t("跳到项目正文")}</a>
      <ProjectLocator sections={locatorSections} legacyAnchors={legacyAnchors} onNavigate={reference.clearReference} ariaLabel={t("招财 Smart 项目章节定位")} />

      <header className="zc4-hero zc4-opening-editorial" id="zcs-project-overview" tabIndex={-1}>
        <div className="zc4-opening-masthead">
          <div className="zc4-opening-identity"><h1>{t("招财 ")}<span className="zc4-project-accent">Smart</span></h1><p>{t("企业财务智能问数")}</p></div>
          <dl className="zc4-opening-facts"><div><dt>{t("我的角色")}</dt><dd>{t("UX/UI 设计")}</dd></div><div><dt>{t("项目时间")}</dt><dd>2025.07—2025.11</dd></div><div><dt>{t("产品平台")}</dt><dd>{t("企业级 Web")}</dd></div></dl>
        </div>
        <div className="zc4-opening-thesis"><h2>{t("让财务问数有来有回，")}<span className="zc4-keep-phrase zc4-text-accent">{t("有据可查")}</span></h2><p>{t("我负责对话体验与 Markdown 回答规范，重点解决两件事：执行前确认业务口径，回答后能核对结论与依据。")}</p></div>
        <div className="zc4-task-analysis zc4-opening-task" aria-label={t("从业务提问到查询条件的设计拆解")}>
          <header><span>{t("从一句业务提问开始")}</span></header>
          <div className="zc4-opening-question"><p>{t("查看 ")}<strong>{t("2024 年")}</strong><strong>{t("全集团")}</strong><em>{t("利润")}</em>{t("变化")}</p></div>
          <div className="zc4-opening-condition-flow">
            <div className="zc4-opening-known"><span>{t("已识别，继续沿用")}</span><dl><div><dt>{t("统计时间")}</dt><dd>{t("2024 年")}<Check aria-hidden="true" size={16}/></dd></div><div><dt>{t("组织范围")}</dt><dd>{t("全集团")}<Check aria-hidden="true" size={16}/></dd></div></dl></div>
            <div className="zc4-opening-unknown"><span>{t("只确认影响结果的歧义")}</span><h3>{t("“利润”指的是哪一种口径？")}</h3><ul aria-label={t("可确认的指标口径")}><li>{t("营业利润")}</li><li>{t("利润总额")}</li><li>{t("净利润")}</li></ul></div>
          </div>
          <footer><p>{t("已知条件不重填，业务口径由用户确认。")}</p><div className="zc4-opening-actions"><a className="zc4-opening-secondary" href="#zcs-markdown-system" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); reference.openReference(event.currentTarget, "zcs-markdown-system"); }}>{t("查看回答规范")}<ArrowUpRight aria-hidden="true" size={17}/></a><a className="zc4-opening-primary" href="#zcs-core-interaction" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); openDemo("clarify", event.currentTarget); }}>{t("体验完整对话")}<ArrowUpRight aria-hidden="true" size={17}/></a></div></footer>
        </div>
        <section className="zc4-context" id="zcs-business-needs">
          <div className="zc4-business-content">
            <span className="zc4-anchor" id="zcs-design-goals"/>
            <header className="zc4-business-heading"><h2>{t("一句“查利润”，还不能确定查什么")}</h2><p>{t("原始语义澄清稿指出，用户难以准确表达问题会影响回答准确性。本案用利润查询说明这一风险：时间和组织已经明确，但“利润”仍可能对应不同指标。")}</p></header>
            <dl className="zc4-problem-summary"><div><dt>{t("问题在哪里")}</dt><dd>{t("直接按某一种“利润”执行，可能得到形式完整、口径却不符合用户本意的回答。")}</dd></div><div><dt>{t("设计切入点")}</dt><dd>{t("保留已知条件，只确认影响结果的歧义；把确认后的口径继续带入答案和来源。")}</dd></div><div><dt>{t("自然语言的适用范围")}</dt><dd>{t("承接临时组合的查询需求；高频、标准任务仍适合筛选器或模板，指标定义与权限由业务规则确定。")}</dd></div></dl>
            <p className="zc4-material-note zc4-evidence-link">{t("问题依据：")}<a href={publicAsset("/assets/projects/zhaocai-smart/13-semantic-clarification.webp")} target="_blank" rel="noreferrer">{t("查阅语义澄清原稿")}<ArrowUpRight aria-hidden="true" size={15}/><span className="zc4-sr-only">{t("（新标签页）")}</span></a>{t("。原稿记录表达不完整的风险；本页以利润查询具体说明，角色任务为设计整理。")}</p>
            <details className="zc4-disclosure"><summary>{t("补充查阅：三类用户的阅读任务")}</summary><div className="zc4-disclosure-body"><section className="zc4-task-matrix" aria-labelledby="zc4-problem-roles-title">
              <h3 id="zc4-problem-roles-title">{t("围绕任务，确定信息的先后")}</h3>
              <table><caption className="zc4-sr-only">{t("三类用户的任务、信息需求与设计重点")}</caption><thead><tr><th scope="col">{t("使用角色")}</th><th scope="col">{t("主要任务")}</th><th scope="col">{t("需要看清")}</th><th scope="col">{t("设计重点")}</th></tr></thead><tbody>{problemRoles.map(role => <tr key={role.number}><th scope="row">{t(role.title)}</th><td data-label="主要任务">{t(role.task)}</td><td data-label="需要看清">{t(role.support)}</td><td data-label="设计重点"><strong>{t(role.focus)}</strong></td></tr>)}</tbody></table>
            </section></div></details>
            <details className="zc4-original-homepage"><summary><span><strong>{t("查看原始产品首页")}</strong><small>{t("财务问数入口与工作区")}</small></span><ChevronDown aria-hidden="true" size={20}/></summary><figure><a href={publicAsset("/assets/projects/zhaocai-smart/long-image/assets/homepage-original.png")} target="_blank" rel="noreferrer" aria-label={t("在新标签页查看招财 Smart 原始脱敏产品首页")}><PortfolioImage src={publicAsset("/assets/projects/zhaocai-smart/long-image/assets/homepage-original.png")} width="1445" height="800" loading="lazy" decoding="async" alt={t("招财 Smart 原始脱敏产品首页，包含财务智能体导航、自然语言提问框与问数入口。")}/></a><figcaption>{t("原始脱敏界面 · 点击查看完整图")}</figcaption></figure></details>
          </div>
        </section>
      </header>

      <div className="zc4-content">
        <section className="zc4-section" id="zcs-clarification">
          <span className="zc4-anchor" id="strategy"/>
          <Heading title={t("先确认口径，还是让用户重新描述？")} intro={t("这次查询只差一个会改变结果的条件。选择交互方式时，要同时考虑表达自由、填写负担和误选风险。")}/>
          <div className="zc4-decision-list" id="zc4-decision-panel">
            <article className="zc4-decision" id="zcs-condition-decision">
              <ZhaocaiAlternativeComparison/>
              <details className="zc4-disclosure zc4-tradeoff-disclosure" id="zcs-alternative-tradeoffs"><summary>{t("查阅三种路径的适用条件与代价")}</summary><div className="zc4-disclosure-body">
              <div className="zc4-table-wrap zc4-case-table" role="region" aria-label={t("口径确认方案比较，可横向滚动")} tabIndex={0}><table><caption>{t("三种路径的适用条件与代价")}</caption><thead><tr><th scope="col">{t("交互路径")}</th><th scope="col">{t("适用条件")}</th><th scope="col">{t("代价")}</th></tr></thead><tbody><tr><th scope="row">{t("开放追问")}</th><td>{t("无法形成明确候选，需要用户补充业务含义。")}</td><td>{t("用户需要重新组织语言，仍可能留下新的歧义。")}</td></tr><tr><th scope="row">{t("固定筛选器或模板")}</th><td>{t("高频、标准任务，字段与指标已经确定。")}</td><td>{t("临时组合需求需要逐项填写，原问题与表单之间需要转换。")}</td></tr><tr className="is-adopted"><th scope="row">{t("保留条件，候选确认")}<span>{t("本次查询采用")}</span></th><td>{t("系统能给出有限、明确的合法指标，只需补齐口径。")}</td><td>{t("增加一次确认；候选不完整时可能诱导误选，必须保留开放补充。")}</td></tr></tbody></table></div>
              </div></details>
              <header className="zc4-decision-heading zc4-decision-conclusion"><h3>{t("有合法候选时，")}<span className="zc4-text-accent">{t("只确认缺少的口径")}</span></h3><p>{t("已识别的时间和组织继续沿用；用户选择指标后再执行，避免把“少填一次”变成“默认替用户决定”。")}</p></header>
              <div className="zc4-decision-layout"><div className="zc4-decision-copy"><p>{t("这里的歧义可以限定在合法指标内，重新填写全部条件并不能帮助确认这个差异。候选确认让用户直接处理缺少的一项，同时用“都不是，补充说明”保留自主表达的出口。")}</p><button className="zc4-decision-action" type="button" onClick={event=>openDemo("clarify",event.currentTarget,true)}>{t("体验候选确认")}<ArrowUpRight aria-hidden="true" size={16}/></button></div>
                <aside className="zc4-decision-support"><h4>{t("确认也是控制权的分界")}</h4><p>{t("系统负责识别条件、提出候选；业务含义由用户确认。不能形成合法候选时转开放补充，条件不足时不执行。")}</p><details className="zc4-disclosure"><summary>{t("查阅语义澄清原稿")}</summary><div className="zc4-disclosure-body"><figure className="zc4-original-material"><a href={publicAsset("/assets/projects/zhaocai-smart/13-semantic-clarification.webp")} target="_blank" rel="noreferrer" aria-label={t("在新标签页查看语义澄清原稿")}><PortfolioImage src={publicAsset("/assets/projects/zhaocai-smart/13-semantic-clarification.webp")} width="1920" height="1080" alt={t("语义澄清原稿：自然语言提问、歧义确认与条件补充的设计说明。")} loading="lazy"/></a><figcaption>{t("原始设计稿 · 点击查看完整图")}</figcaption></figure></div></details></aside>
              </div>
            </article>
          </div>
          <details className="zc4-disclosure"><summary>{t("补充查阅：等待控制与结果核对")}</summary><div className="zc4-disclosure-body zc4-decision-list">
            <article className="zc4-decision" id="zcs-process-feedback">
              <span className="zc4-anchor" id="process"/><span className="zc4-anchor" id="zcs-ai-governance"/>
              <header className="zc4-decision-heading"><h3>{t("等待有阶段，中断有下一步")}</h3><p>{t("持续加载无法说明任务停在哪里。反馈需要同时回答“正在做什么”和“接下来能做什么”。")}</p></header>
              <div className="zc4-decision-layout"><div className="zc4-decision-copy"><dl><div><dt>{t("采用方案")}</dt><dd>{t("展示理解问题、查询数据、生成结果三个业务阶段，保留当前条件与停止入口。")}</dd></div><div><dt>{t("适用条件")}</dt><dd>{t("查询需要等待，或用户希望在结果返回前调整任务。")}</dd></div><div><dt>{t("代价与边界")}</dt><dd>{t("阶段提示不等于耗时进度；停止不代表取得部分结果，重试仍需服务重新执行。")}</dd></div></dl><button className="zc4-decision-action" type="button" onClick={event=>openDemo("running",event.currentTarget)}>{t("体验等待与停止")}<ArrowUpRight aria-hidden="true" size={16}/></button></div>
                <aside className="zc4-decision-support"><h4>{t("恢复沿用本次上下文")}</h4><dl className="zc4-recovery-options"><div><dt>{t("查询超时")}</dt><dd>{t("说明尚未取得结果，保留条件后重试。")}<button type="button" onClick={()=>openRecovery("timeout")}>{t("体验超时重试")}<ArrowUpRight aria-hidden="true" size={15}/></button></dd></div><div><dt>{t("无匹配数据")}</dt><dd>{t("显示查询范围，允许修改条件；缺失不写成零。")}<button type="button" onClick={()=>openRecovery("empty")}>{t("体验无匹配与恢复")}<ArrowUpRight aria-hidden="true" size={15}/></button></dd></div><div><dt>{t("用户停止")}</dt><dd>{t("保留问题、条件和阶段，可继续，也可修改问题。")}<button type="button" onClick={()=>openRecovery("stopped")}>{t("体验停止与继续")}<ArrowUpRight aria-hidden="true" size={15}/></button></dd></div></dl><details className="zc4-disclosure"><summary>{t("查阅过程可视化原稿")}</summary><div className="zc4-disclosure-body"><figure className="zc4-original-material"><a href={publicAsset("/assets/projects/zhaocai-smart/14-process-visualization.webp")} target="_blank" rel="noreferrer" aria-label={t("在新标签页查看过程可视化原稿")}><PortfolioImage src={publicAsset("/assets/projects/zhaocai-smart/14-process-visualization.webp")} width="1920" height="1080" alt={t("过程可视化原稿：查询处理阶段、等待反馈、空数据与完成状态的设计说明。")} loading="lazy"/></a><figcaption>{t("原始设计稿 · 点击查看完整图")}</figcaption></figure></div></details></aside>
              </div>
            </article>
            <article className="zc4-decision" id="zcs-result-decision">
              <header className="zc4-decision-heading"><h3>{t("结论先读，依据按需核对")}</h3><p>{t("完整明细不必一次铺开，但统计条件和来源不能离开结论。")}</p></header>
              <div className="zc4-decision-layout"><div className="zc4-decision-copy"><dl><div><dt>{t("采用方案")}</dt><dd>{t("先展示结论与趋势，再按需展开口径、期间、组织、来源及本次原始表。")}</dd></div><div><dt>{t("适用条件")}</dt><dd>{t("同一结果需要兼顾快速阅读与进一步核对，明细较多且有明确的数据来源。")}</dd></div><div><dt>{t("代价与边界")}</dt><dd>{t("展开依据增加一次操作，因此入口紧邻结果；不同执行版本分别保留查询快照。")}</dd></div></dl><button className="zc4-decision-action" type="button" onClick={event=>openDemo("result",event.currentTarget)}>{t("体验结果与依据")}<ArrowUpRight aria-hidden="true" size={16}/></button></div><aside className="zc4-decision-support"><h4>{t("解释也要有边界")}</h4><p>{t("当前数据能说明季度变化，不能据此推断增长原因。继续追问时，先沿用已确认条件，再明确新增或改变的范围。")}</p><a className="zc4-decision-action" href="#zcs-markdown-system" onClick={event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();reference.openReference(event.currentTarget,"zcs-markdown-system");}}>{t("对照回答规范")}<ArrowUpRight aria-hidden="true" size={16}/></a></aside></div>
            </article>
          </div></details>
        </section>

        <section className="zc4-section" id="zcs-experience-journey">
          <Heading title={t("把确认后的条件，带到结果与追问里")} intro={t("确认口径之后，用户仍可停止、重试、核对来源或继续追问。任务上下文随对话保留，改变组织时重新查询。")}/>
          <ol className="zc4-flow zc4-flow-five">{[["提问","自然语言描述需求"],["对齐","识别条件，只确认歧义项"],["执行","数据服务查询，界面展示阶段"],["核对","查看结论、条件、来源与原始表"],["复用","保存结果和查询上下文"]].map((item,index)=><li key={item[0]}><span>{t(String(index+1).padStart(2,"0"))}</span><strong>{t(item[0])}</strong><p>{t(item[1])}</p></li>)}</ol>
          <div className="zc4-demo" id="zcs-core-interaction" ref={demoRef}><span className="zc4-anchor" id="clarification"/>{t(reference.returnAvailable && reference.targetId === "zcs-core-interaction" ? <div className="zc4-reference-return"><span>{t("对话体验")}</span><button type="button" onClick={reference.returnToSource}>{t("返回刚才位置")}<RotateCcw size={15}/></button></div> : null)}<header><div><span>{t("交互演示 · 示例数据")}</span><strong>{t("完整任务")}</strong></div><div role="group" aria-label={t("切换演示场景")}>{([['clarify','口径确认'],['running','慢查询演示'],['result','顺利完成查询'],['exception','异常恢复']] as [DemoScene,string][]).map(([id,label])=><button type="button" className={scene===id?"active":""} aria-pressed={scene===id} onClick={()=>setDemo(id)} key={id}>{t(label)}</button>)}</div></header>{t(scene==="exception"?<div className="zc4-exception-tabs"><button type="button" onClick={()=>openRecovery("timeout")}>{t("查询超时与重试")}</button><button type="button" onClick={()=>openRecovery("empty")}>{t("模拟无匹配记录")}</button><button type="button" onClick={()=>openRecovery("stopped")}>{t("停止并保留条件")}</button></div>:null)}<ProductDemo {...demoProps}/></div>
        <details className="zc4-disclosure" id="zcs-board-design">
          <summary>{t("补充体验：结果保存与看板复用")}</summary><div className="zc4-disclosure-body">
          <span className="zc4-anchor" id="board"/>
          <p className="zc4-material-note">{t("保存结果时保留查询条件与数据来源，再按同一业务主题整理。看板是问数结果的后续使用路径。")}</p>
          <ZhaocaiBoardEvidence/>
          <details className="zc4-disclosure"><summary>{t("体验看板：添加、排序、合并与撤销")}</summary><div className="zc4-disclosure-body"><BoardDesignDemo/></div></details>
          </div></details>
        </section>

        <section className="zc4-section" id="zcs-markdown-system">
          {t(reference.returnAvailable && reference.targetId === "zcs-markdown-system" ? <div className="zc4-reference-return is-section"><span>{t("回答规范")}</span><button type="button" onClick={reference.returnToSource}>{t("返回刚才位置")}<RotateCcw size={15}/></button></div> : null)}
          <Heading title={t(<>{t("回答规范，从统一格式到")}<span className="zc4-text-accent">{t("支持核对")}</span></>)} intro={t("把阅读任务对应到具体规则、适用条件和检查点，优先处理结论、数值与来源三个容易影响理解的位置。")}/>
          <dl className="zc4-rule-priorities"><div><dt>{t("结论与建议分开")}</dt><dd>{t("先说数据支持的事实，再给下一步建议；依据不足时不推断原因。")}</dd></div><div><dt>{t("数值带着口径出现")}</dt><dd>{t("保留单位、期间、组织和比较基准；未取得、真实为零与不适用分别说明。")}</dd></div><div><dt>{t("来源紧邻对应结论")}</dt><dd>{t("从数据处打开来源，继续核对查询条件与原始明细。")}</dd></div></dl>
          <ZhaocaiAnswerWorkbench/>
          <ZhaocaiRuleChecks/>
          <details className="zc4-disclosure" id="zcs-original-output"><summary>{t("查阅原始 Markdown 与回答设计稿")}</summary><div className="zc4-disclosure-body"><ZhaocaiAnswerEvidence/><div className="zc4-history-evidence"><figure className="zc4-history-viewport"><PortfolioImage src={publicAsset("/assets/projects/zhaocai-smart/long-image/assets/completed-output-original-cropped.png")} width="1164" height="1944" alt={t("历史脱敏回答稿局部：业务明细与查看原始表格入口。")} loading="lazy"/></figure><aside><h3>{t("原始表入口，留在结论之后")}</h3><p>{t("历史稿中的业务明细与原始表入口，提供进一步核对结果的路径。")}</p><a href={publicAsset("/assets/projects/zhaocai-smart/long-image/assets/completed-output-original.png")} target="_blank" rel="noreferrer">{t("查看完整回答稿")}<ArrowUpRight aria-hidden="true" size={16}/><span className="zc4-sr-only">{t("（新标签页）")}</span></a></aside></div></div></details>
          <details className="zc4-disclosure"><summary>{t("继续查阅八类场景与完整组件规则")}</summary><div className="zc4-disclosure-body"><SpecWorkbench/><p className="zc4-spec-open"><a href={`${publicAsset("/assets/projects/zhaocai-smart/long-image/spec-workbench.html")}?lang=${locale}`} target="_blank" rel="noreferrer">{t("独立打开回答规范")}<ArrowUpRight aria-hidden="true" size={15}/><span className="zc4-sr-only">{t("（新标签页）")}</span></a></p></div></details>
        </section>

        <section className="zc4-section zc4-delivery" id="zcs-delivery">
          <Heading title={t("方案交付了什么，验证覆盖到哪里")} intro={t("原始设计稿对应交互与排版方案，同题推演解释取舍，规则样例核对回答。再用本页原型的任务走查，检查这些规则是否能被执行。")}/>
          <div className="zc4-delivery-boundary" id="zcs-ai-strategy"><span className="zc4-anchor" id="zcs-trust-mechanism"/><h3>{t("协作中的责任边界")}</h3><dl className="zc4-ownership-summary"><div><dt>{t("设计交付")}</dt><dd>{t("任务流程、条件确认、等待与恢复、结果阅读及 Markdown 规则。")}</dd></div><div><dt>{t("产品与业务确认")}</dt><dd>{t("指标定义、统计范围与权限规则，明确哪些条件需要用户决定。")}</dd></div><div><dt>{t("研发实现")}</dt><dd>{t("权限校验、查询服务、结果校验与版本记录；界面提示不能代替服务能力。")}</dd></div></dl></div>
          <section className="zc4-walkthrough" id="zcs-prototype-review" aria-labelledby="zcs-prototype-review-title"><h3 id="zcs-prototype-review-title">{t("当前原型的任务走查")}</h3><p>{t("2026.10.19 · 本页交互示例。按预设任务逐项操作，记录界面反馈与实际状态，覆盖桌面与 390px 手机。")}</p>
            <div className="zc4-table-wrap zc4-case-table zc4-walkthrough-table" role="region" aria-label={t("原型任务走查记录，可横向滚动")} tabIndex={0}><table><caption>{t("任务、观察结果与界面实录")}</caption><thead><tr><th scope="col">{t("检查任务")}</th><th scope="col">{t("实际观察")}</th><th scope="col">{t("查看实录")}</th></tr></thead><tbody>{walkthroughRecords.map(record=><tr key={record.task}><th scope="row">{t(record.task)}</th><td>{t(record.observed)}</td><td><ul>{record.evidence.map(([file,label])=><li key={file}><a href={publicAsset(`/assets/projects/zhaocai-smart/verification/20261019/${file}`)} target="_blank" rel="noreferrer">{t(label)}<ArrowUpRight aria-hidden="true" size={14}/><span className="zc4-sr-only">{t("（新标签页）")}</span></a></li>)}</ul></td></tr>)}</tbody></table></div>
            <p className="zc4-material-note">{t("这份记录验证预设示例的行为与呈现；真人任务理解、模型表现和业务服务仍需单独验证。")}</p>
            <p className="zc4-walkthrough-log"><a href={publicAsset("/assets/projects/zhaocai-smart/verification/20261019/review-record.html")} target="_blank" rel="noreferrer">{t("查看完整任务记录")}<ArrowUpRight aria-hidden="true" size={16}/><span className="zc4-sr-only">{t("（新标签页）")}</span></a></p>
          </section>
          <details className="zc4-disclosure"><summary>{t("查阅验证范围与后续观察")}</summary><div className="zc4-disclosure-body"><dl className="zc4-problem-summary"><div><dt>{t("已经核对")}</dt><dd>{t("条件保护、停止后继续、回答边界、来源返回、复制反馈与手机表格。原始日志和界面截图保留在本次走查记录中。")}</dd></div><div><dt>{t("下一轮用户任务")}</dt><dd>{t("观察业务用户能否选对口径、找到依据，并解释“未取得”与零的区别；记录具体误解，再调整文案和入口。")}</dd></div><div><dt>{t("业务产品状态")}</dt><dd>{t("原项目上线阶段、真实数据正确性、权限校验与效率收益，需要对应业务记录；本页材料覆盖设计方案与交互示例。")}</dd></div></dl></div></details>
          <p className="zc4-evidence-boundary">{t("6.08 亿元与 29.55% 是示例计算，用于核对回答规则；本次走查记录的是当前原型，不作为 2025 年业务产品的验收或收益。")}</p>
        </section>

        <section className="zc4-section" id="zcs-reflection">
          <Heading title={t("格式完整，不等于解释成立")} intro={t("“为什么会增长？”是这套方案里最值得保留的边界：季度利润能说明变化，却不能单独解释原因。")}/>
          <div className="zc4-reflection-copy"><p>{t("面对这一追问，回答需要指出缺少收入、成本、费用等明细，再给出下一步核对路径。排版规范因此也要覆盖内容判断：事实与建议分开，缺失与零分开，比较结果与原因归因分开。")}</p><p>{t("下一步验证会聚焦这个具体问题：用户读完回答后，能否说清哪些结论已有依据、还需要补什么数据。用任务观察记录理解偏差，再决定是否调整来源入口和边界文案。")}</p></div>
          <footer className="zc4-page-footer"><a href="#zcs-project-overview" onClick={event=>{event.preventDefault();scrollToId("zcs-project-overview")}}>{t("返回项目摘要")}</a><a href="/portfolio/#work">{t("返回作品")}</a></footer>
        </section>
      </div>
    </article>
  );
}
