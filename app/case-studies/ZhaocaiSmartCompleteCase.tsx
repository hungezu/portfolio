"use client";

import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right.mjs";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up.mjs";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down.mjs";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3.mjs";
import BriefcaseBusiness from "lucide-react/dist/esm/icons/briefcase-business.mjs";
import Check from "lucide-react/dist/esm/icons/check.mjs";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.mjs";
import CircleHelp from "lucide-react/dist/esm/icons/circle-help.mjs";
import Clock3 from "lucide-react/dist/esm/icons/clock-3.mjs";
import Database from "lucide-react/dist/esm/icons/database.mjs";
import ExternalLink from "lucide-react/dist/esm/icons/external-link.mjs";
import FileText from "lucide-react/dist/esm/icons/file-text.mjs";
import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard.mjs";
import LoaderCircle from "lucide-react/dist/esm/icons/loader-circle.mjs";
import Pencil from "lucide-react/dist/esm/icons/pencil.mjs";
import Play from "lucide-react/dist/esm/icons/play.mjs";
import Plus from "lucide-react/dist/esm/icons/plus.mjs";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw.mjs";
import Save from "lucide-react/dist/esm/icons/save.mjs";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.mjs";
import Square from "lucide-react/dist/esm/icons/square.mjs";
import Table2 from "lucide-react/dist/esm/icons/table-2.mjs";
import UserRound from "lucide-react/dist/esm/icons/user-round.mjs";
import X from "lucide-react/dist/esm/icons/x.mjs";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { publicAsset } from "../portfolio-data";
import { ProjectLocator } from "../project-locator";
import { ZhaocaiSmartTrustSection } from "./ZhaocaiSmartTrustSection";
import "./zhaocai-smart-complete.css";
import "./zhaocai-smart-editorial.css";

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

const problemRoles = [
  {
    number: "01",
    title: "财务人员",
    icon: UserRound,
    task: "核对指标、期间与范围",
    support: "口径准确，来源可追溯",
    focus: "先确认口径",
  },
  {
    number: "02",
    title: "经营分析人员",
    icon: BarChart3,
    task: "查看趋势、整理结果",
    support: "结果可比较，内容可复用",
    focus: "保留查询上下文",
  },
  {
    number: "03",
    title: "业务负责人",
    icon: BriefcaseBusiness,
    task: "理解结论、支持判断",
    support: "重点清晰，按需查看依据",
    focus: "结论与依据分层",
  },
] as const;

const locatorSections = [
  ["zcs-project-overview", "项目摘要"],
  ["zcs-business-needs", "业务任务"],
  ["zcs-experience-journey", "核心体验"],
  ["zcs-clarification", "关键设计"],
  ["zcs-markdown-system", "结果复用"],
  ["zcs-ai-governance", "异常恢复"],
  ["zcs-ai-strategy", "协作边界"],
  ["zcs-delivery", "交付复盘"],
] as const;

const legacyAnchors: Record<string, string> = {
  overview: "zcs-project-overview",
  strategy: "zcs-clarification",
  clarification: "zcs-clarification",
  process: "zcs-clarification",
  board: "zcs-markdown-system",
  markdown: "zcs-markdown-system",
  "zcs-trust-mechanism": "zcs-ai-strategy",
};

function scrollToId(id: string, smooth = true) {
  document.getElementById(id)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

function Heading({ number, title, intro }: { number?: string; title: ReactNode; intro?: string }) {
  const normalizedTitle = typeof title === "string" ? title.replace(/。$/, "") : title;
  return <header className="zc4-heading" data-chapter={number}><h2>{normalizedTitle}</h2>{intro ? <p>{intro}</p> : null}</header>;
}

function ProfitChart({ compact = false }: { compact?: boolean }) {
  return (
    <figure className={`zc4-chart${compact ? " is-compact" : ""}`}>
      <figcaption><strong>季度净利润</strong><span>单位：亿元</span></figcaption>
      <div className="zc4-bars" aria-hidden="true">
        {profitData.map(item => (
          <div key={item.quarter}><span>{item.value.toFixed(2)}</span><i style={{ height: `${(item.value / maxProfit) * 100}%` }} /><em>{item.quarter}</em></div>
        ))}
      </div>
      <table className="zc4-sr-only"><caption>演示数据：2024 年季度净利润，单位亿元</caption><thead><tr><th>季度</th><th>净利润</th></tr></thead><tbody>{profitData.map(item => <tr key={item.quarter}><td>{item.quarter}</td><td>{item.value.toFixed(2)}</td></tr>)}</tbody></table>
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
        <strong>招财 Smart <span>回答规范</span></strong>
        <div
          role="tablist"
          aria-label="回答规范视图"
          onKeyDown={event => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            const tablist = event.currentTarget;
            moveTab();
            requestAnimationFrame(() => (tablist.querySelector('[aria-selected="true"]') as HTMLButtonElement | null)?.focus());
          }}
        >
          <button id="zc4-spec-scenes-tab" type="button" role="tab" aria-controls="zc4-spec-panel" aria-selected={mode === "scenes"} tabIndex={mode === "scenes" ? 0 : -1} onClick={() => switchMode("scenes")}>场景示例</button>
          <button id="zc4-spec-rules-tab" type="button" role="tab" aria-controls="zc4-spec-panel" aria-selected={mode === "rules"} tabIndex={mode === "rules" ? 0 : -1} onClick={() => switchMode("rules")}>组件规则</button>
        </div>
      </header>
      <div className="zc4-spec" id="zc4-spec-panel" role="tabpanel" aria-labelledby={mode === "scenes" ? "zc4-spec-scenes-tab" : "zc4-spec-rules-tab"}>
        <aside aria-label={mode === "scenes" ? "业务场景" : "内容组件"}>
          <p>{mode === "scenes" ? "按业务任务选择" : "按内容组件选择"}</p>
          {items.map((option, index) => <button type="button" className={active === index ? "active" : ""} aria-pressed={active === index} onClick={() => setActive(index)} key={option[0]}>{option[0]}</button>)}
        </aside>
        <article>
          <span>{mode === "scenes" ? "场景" : `TYPE-${String(active + 1).padStart(2, "0")}`} / {item[0]}</span>
          <h3>{item[1]}</h3>
          <p><strong>{item[2]}</strong></p>
          {mode === "scenes" && active < 2 ? <>
            <nav className="zc4-answer-locator" aria-label="回答章节定位"><a href="#zc4-spec-quarter">季度表现</a><a href="#zc4-spec-source">来源与说明</a></nav>
            <h4 id="zc4-spec-quarter">季度表现</h4>
            <table><caption className="zc4-sr-only">演示数据：2024 年季度净利润</caption><thead><tr><th>季度</th><th>净利润（亿元）</th></tr></thead><tbody>{profitData.map(row => <tr key={row.quarter}><td>{row.quarter}</td><td>{row.value.toFixed(2)}</td></tr>)}</tbody></table>
            <p id="zc4-spec-source">来源：集团经营指标表（示例）。增长原因仍需结合业务明细核对。</p>
          </> : <div className="zc4-spec-note"><CircleHelp size={17}/><p>{mode === "rules" ? "规则、示例与验收要点保持在同一视图中，便于逐项核对。" : "结论、数据与建议分别表达；信息不足时保留条件和可执行的下一步。"}</p></div>}
          <footer><label><input type="checkbox" name="show-annotations" checked={annotated} onChange={event => setAnnotated(event.target.checked)}/>显示规范标注</label><a href="#zcs-original-output">查看原始设计依据</a></footer>
          {annotated ? <p className="zc4-annotation">规范标注：正文 14px / 24px · 标题不超过三级 · 数据与来源关联</p> : null}
        </article>
      </div>
    </div>
  );
}

function SpecWorkbench() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  return <div className="zc4-full-spec">{!ready && !failed ? <p className="zc4-spec-load" role="status">正在加载回答规范与八类场景…</p> : null}{failed ? <SummarySpecWorkbench/> : <iframe className="zc4-spec-frame" title="招财 Smart 回答规范：八类场景与组件规则" src={publicAsset("/assets/projects/zhaocai-smart/long-image/spec-workbench.html")} loading="lazy" onLoad={event => { const loaded = Boolean(event.currentTarget.contentDocument?.querySelector("[data-zmd]")); setReady(loaded); setFailed(!loaded); }} onError={() => setFailed(true)} />}</div>;
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
  if (card.kind === "metric") return <div className="zc4-board-metric"><p className="zc4-board-total"><strong>{totalProfit.toFixed(2)}</strong> 亿元</p><p>2024 年 · 全集团 · 净利润</p><span>来源：集团经营指标表（示例）</span></div>;
  if (card.kind === "chart") return <ProfitChart compact/>;
  return <DataTable compact/>;
}

function BoardDesignDemo() {
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
  return <div className="zc4-board-demo"><header><div><strong>招财 Smart</strong><span>集团经营看板</span></div><div className="zc4-chips"><span>2024 年</span><span>全集团</span><span>净利润 · 脱敏示例</span></div><button type="button" aria-expanded={addOpen} onClick={()=>setAddOpen(!addOpen)}><Plus size={15}/>添加卡片</button></header>{addOpen ? <div className="zc4-board-add"><p>从本次查询添加视图</p>{initialBoardCards.map(template => <button type="button" onClick={() => addCard(template)} key={template.id}><Plus size={15}/>{template.title}</button>)}</div> : null}<div className="zc4-board-cards">{cards.map((card,index)=><article className={`${selected===card.id?"selected":""}${card.merged?" is-merged":""}`} key={card.id}><div className="zc4-card-toolbar"><span>{card.title}</span><div><button type="button" disabled={index===0} onClick={()=>move(index,-1)} aria-label={`上移${card.title}`}><ArrowUp size={15}/></button><button type="button" disabled={index===cards.length-1} onClick={()=>move(index,1)} aria-label={`下移${card.title}`}><ArrowDown size={15}/></button>{card.merged?<span className="zc4-merged-status">已合并</span>:<button type="button" aria-pressed={selected===card.id} onClick={()=>askMerge(card.id)}>{selected===card.id?"取消":selected?"合并到这里":"合并"}</button>}</div></div>{card.merged?<div className="zc4-merged">{card.merged.map(item=><section key={item.id}><h4>{item.title}</h4><BoardCardContent card={item}/></section>)}</div>:<BoardCardContent card={card}/>}</article>)}</div><footer><p aria-live="polite">{notice || "查询条件与来源随结果保留；添加、排序与合并都可以撤销。"}</p><div><button ref={undoButton} type="button" disabled={!undo} onClick={()=>{if(undo){setCards(undo);setUndo(null);setSelected(null);setNotice("已撤销上一步操作。");}}}><RotateCcw size={14}/>撤销</button><button type="button" onClick={reset}>重置</button></div></footer>{mergePair?<div className="zc4-board-confirm"><section ref={mergeDialogRef} role="dialog" aria-modal="true" aria-labelledby="merge-title"><h3 id="merge-title">合并这两张卡片？</h3><p>将“{cards.find(card=>card.id===mergePair[0])?.title}”和“{cards.find(card=>card.id===mergePair[1])?.title}”整理到同一合集，保留各自的查询条件与数据依据。</p><footer><button type="button" onClick={closeMerge}>取消</button><button type="button" className="zc4-primary" onClick={confirmMerge}>确认合并</button></footer></section></div>:null}</div>;
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
  return <dl className="zc4-condition-fields"><div><dt>统计时间</dt><dd>{year ? `${year} 年` : "待确认"}</dd></div><div><dt>组织范围</dt><dd>{scope || "待确认"}</dd></div><div><dt>指标口径</dt><dd><i className={metric ? "ready" : ""}/>{metric === "其他指标" ? `${supplement || "其他指标"} · 待确认` : metric ? `${metric} · 待确认` : "待确认"}</dd></div></dl>;
}

function ExecutionStages({ phase, animated = false }: { phase: number; animated?: boolean }) {
  return <ol className="zc4-execution-stages">{["理解问题", "查询数据", "生成结果"].map((label, index) => <li className={index < phase ? "done" : index === phase ? "current" : ""} key={label}><span>{index < phase ? <Check size={16}/> : index === phase ? <LoaderCircle className={animated ? "spin" : undefined} size={16}/> : index + 1}</span><div><strong>{label}</strong><p>{index === 0 ? "整理时间、组织与指标条件" : index === 1 ? "正在查询集团经营指标表" : "组织图表、解释与查询快照"}</p></div></li>)}</ol>;
}

function QuerySourceFields() {
  return <dl className="zc4-query-source-fields"><div><dt>统计范围</dt><dd>2024.01.01—2024.12.31<br/>全集团 · 按季度汇总</dd></div><div><dt>指标确认</dt><dd>利润 → 净利润<br/>由用户确认</dd></div><div><dt>数据来源</dt><dd>集团经营指标表（示例）</dd></div><div><dt>返回数据</dt><dd>4 条季度汇总数据</dd></div></dl>;
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
  const metricLabel = metric === "其他指标" ? supplement || "其他指标" : metric || "待确认指标";
  const title = stage === "timeout" ? "查询暂未完成" : stage === "empty" ? (metric && metric !== "净利润" ? "该指标暂无演示数据" : "该条件暂无演示数据") : "查询已停止";
  const message = stage === "timeout" ? "本次条件已保留，你可以从当前条件重新查询。" : stage === "empty" ? `当前前端样例不支持 ${year || "待确认时间"} / ${scope || "待确认组织"} / ${metricLabel}；这不代表企业没有相应数据。` : "问题、条件与已完成阶段均已保留。";
  const primaryLabel = preview ? (stage === "timeout" ? "体验超时重试" : stage === "empty" ? "体验无匹配与恢复" : "体验停止与继续") : (stage === "timeout" ? "重新查询" : stage === "empty" ? "使用 2024 年全集团净利润示例" : "继续执行");
  return <div className="zc4-exception-state">
    <div className="zc4-exception-context"><div className="zc4-exception-question"><span>你的问题</span><p>{query}</p></div><div className="zc4-exception-conditions"><span>本次查询条件</span><div className="zc4-condition-chips"><span>{year ? `${year} 年` : "待确认时间"}</span><span>{scope || "待确认组织"}</span><span>{metricLabel}</span></div></div>{stage !== "empty" ? <p className="zc4-exception-phase">{stage === "stopped" ? "停止位置" : "未完成阶段"}：{["理解问题", "查询数据", "生成结果"][Math.min(2, Math.max(0, phase))]}</p> : null}</div>
    <section className="zc4-exception"><span>{stage === "timeout" ? <Clock3 size={24}/> : stage === "empty" ? <Database size={24}/> : <Square size={22}/>}</span><div><h3>{title}</h3><p>{message}</p><div><button className="zc4-primary" type="button" onClick={onPrimary}>{!preview && stage === "timeout" ? <RotateCcw size={15}/> : null}{primaryLabel}{preview ? <ArrowUpRight size={15}/> : null}</button><button type="button" onClick={onEdit}>{preview ? "体验" : ""}{stage === "stopped" ? "修改问题" : "修改条件"}</button></div></div></section>
  </div>;
}

function RecoveryPreview({ onOpen }: { onOpen: (stage: RecoveryStage, edit?: boolean) => void }) {
  const renderState = (stage: RecoveryStage) => <ExceptionState stage={stage} query={`查看 ${stage === "empty" ? "2025" : "2024"} 年全集团净利润变化`} year={stage === "empty" ? "2025" : "2024"} scope="全集团" metric="净利润" preview onPrimary={() => onOpen(stage)} onEdit={() => onOpen(stage, true)}/>;
  return <div className="zc4-recovery-states">
    <div className="zc4-recovery-main"><div className="zc4-recovery-window"><header><div><span>智能问数</span><i>/</i><strong>集团年度利润分析</strong></div><span>交互演示界面</span></header>{renderState("timeout")}</div><aside className="zc4-recovery-strategy"><h3>超时后，从原条件继续。</h3><p>保留原问题、已确认口径和执行上下文，让重试沿用本次条件。</p><p>反馈说明尚未取得结果，恢复入口直接回到完整任务。</p></aside></div>
    <div className="zc4-recovery-secondary"><div><div className="zc4-recovery-window is-compact"><header><strong>无匹配数据</strong><span>交互演示局部</span></header>{renderState("empty")}</div><p className="zc4-recovery-note">未取得数据时说明查询范围，提供修改条件和恢复支持示例的入口，不将缺失解释为 0。</p></div><div><div className="zc4-recovery-window is-compact"><header><strong>用户停止</strong><span>交互演示局部</span></header>{renderState("stopped")}</div><p className="zc4-recovery-note">停止是任务中的暂停点。保留问题与条件，允许继续执行，也允许修改问题。</p></div></div>
  </div>;
}

function ProductDemo({ resetToken, stage, setStage, query, setQuery, metric, setMetric, year, setYear, scope, setScope, phase, executionId, executionMode, setExecutionMode, beginExecution, runFromEntry }: DemoProps) {
  const [metricNote, setMetricNote] = useState<Metric>("");
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
  const [versions, setVersions] = useState<{ id: number; year: string; scope: string }[]>([]);
  const [viewedVersion, setViewedVersion] = useState(0);
  const pendingVersion = useRef<number | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<{ name: string; year: string; scope: string; metric: string; executionId: number } | null>(null);
  const evidenceButton = useRef<HTMLButtonElement>(null);
  const supplementInput = useRef<HTMLTextAreaElement>(null);
  const saveDialogRef = useDialogFocus<HTMLElement>(saveOpen, () => setSaveOpen(false));
  const tableDialogRef = useDialogFocus<HTMLElement>(tableOpen, () => setTableOpen(false));
  useEffect(() => {
    setMetricNote("");
    setSupplementOpen(false);
    setSupplement("");
    setSupplementReview(false);
    setConditionEdit(false);
    setEvidence(false);
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
    if (!metric) return;
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
  const closeEvidence = () => { setEvidence(false); requestAnimationFrame(() => evidenceButton.current?.focus()); };

  return (
    <div className="zc4-product">
      <div className="zc4-product-main">
        <header className="zc4-topbar"><div><span>智能问数</span><i>/</i><strong>集团年度利润分析</strong></div></header>
        {stage==="entry" ? <section className="zc4-entry"><div className="brand"><Sparkles size={20}/>招财 Smart</div><h3>想了解哪些经营数据？</h3><p>请尽量包含时间、组织范围和分析指标。</p><label>输入问题<textarea aria-label="输入问题" name="finance-question" autoComplete="off" value={query} onChange={event=>setQuery(event.target.value)} placeholder="例如：查看 2024 年全集团利润变化…"/></label><button className="zc4-primary" type="button" onClick={runFromEntry}><Play size={16}/>发起查询</button></section>:null}
        {stage === "clarify" ? (
          <section className="zc4-clarify">
            <div className="main">
              <div className="question"><span>你的问题</span><p>{query}</p></div>
              <div className="brand"><Sparkles size={19}/>招财 Smart</div>
              <h3>你想查看哪一种利润？</h3>
              <p>“利润”可能对应多个指标，请选择本次统计口径。</p>
              {!supplementOpen ? <fieldset>
                <legend className="zc4-sr-only">选择利润口径</legend>
                {(["营业利润", "利润总额", "净利润"] as Metric[]).map((option, index) => {
                  const inputId = `zc4-metric-${index}`;
                  const noteId = `zc4-metric-note-${index}`;
                  return (
                    <div className={`zc4-metric-option${metric === option ? " active" : ""}`} key={option}>
                      <label htmlFor={inputId}><input id={inputId} type="radio" name="metric" value={option} checked={metric === option} aria-describedby={metricNote === option ? noteId : undefined} onChange={() => setMetric(option)}/><span>{option}</span></label>
                      <button type="button" aria-expanded={metricNote === option} aria-controls={metricNote === option ? noteId : undefined} onClick={() => setMetricNote(metricNote === option ? "" : option)}>口径说明<ArrowUpRight size={13}/></button>
                      {metricNote === option ? <small id={noteId}>演示说明：具体定义以企业指标字典为准。</small> : null}
                    </div>
                  );
                })}
                <button className="zc4-supplement-trigger" type="button" onClick={openSupplement}>都不是，补充说明</button>
              </fieldset> : <div className="zc4-supplement">
                <label htmlFor="zc4-supplement-input">补充指标或业务含义</label>
                <textarea ref={supplementInput} id="zc4-supplement-input" value={supplement} onChange={event => { setSupplement(event.target.value); setSupplementReview(false); }} placeholder="例如：扣除非经常性损益后的利润" />
                {supplementReview ? <div className="zc4-supplement-review" role="status"><strong>拟采用的条件</strong><span>{year || "时间待确认"} / {scope || "组织待确认"} / {supplement || "指标待补充"}</span><p>当前前端样例没有该指标数据，提交后将展示演示范围说明。</p></div> : null}
                <button type="button" onClick={returnToCandidates}>返回候选</button>
              </div>}
              <p className="footnote">原问题、时间和组织会持续保留，只补充本次指标口径。</p>
              <div className="actions"><button className="zc4-primary" type="button" disabled={!metric || (metric === "其他指标" && !supplement.trim())} onClick={confirmMetric}>{metric === "其他指标" ? (supplementReview ? "提交补充说明" : "确认补充条件") : metric ? `按${metric}查询` : "选择口径后继续"}</button></div>
            </div>
            <aside className="conditions"><h4>已识别条件</h4><ConditionFields year={year} scope={scope} metric={metric} supplement={supplement}/><button type="button" aria-expanded={conditionEdit} onClick={() => setConditionEdit(!conditionEdit)}><Pencil size={15}/>{conditionEdit ? "收起条件编辑" : "修改已识别条件"}</button>{conditionEdit ? <div className="editor"><label>统计时间<select aria-label="统计时间" value={year} onChange={event => setYear(event.target.value)}><option value="">选择统计时间</option>{["2023", "2024", "2025"].map(value => <option key={value} value={value}>{value} 年</option>)}</select></label><label>组织范围<select aria-label="组织范围" value={scope} onChange={event => setScope(event.target.value)}><option value="">选择组织范围</option>{["全集团", "华南分公司", "华东分公司", "华北分公司"].map(value => <option key={value}>{value}</option>)}</select></label><button type="button" onClick={() => { setConditionEdit(false); setQuery(`查看 ${year ? `${year} 年` : "待确认时间"} ${scope || "待确认组织"}利润变化`); }}>应用条件</button></div> : null}<div className="source"><Database size={15}/><span>查询数据<strong>集团经营指标表（示例）</strong></span></div></aside>
          </section>
        ) : null}
        {stage==="running" ? <section className="zc4-running" aria-live="polite"><header><div><span>{executionMode === "slow-demo" ? "模拟已等待超过 10 秒" : "正在查询数据"}</span><h3>{year} 年{scope}净利润分析</h3><p>已保留本次查询条件。</p></div><LoaderCircle className="spin" size={28}/></header><div className="zc4-condition-chips"><span>{year} 年</span><span>{scope}</span><span>净利润 · 用户已确认</span></div><ExecutionStages phase={phase} animated/><footer><p>{executionMode === "slow-demo" ? "点击继续查看结果，或停止本次查询。" : "查询仍在进行，你可以继续等待或停止本次查询。"}</p><div>{executionMode === "slow-demo" ? <button className="zc4-primary" type="button" onClick={()=>{setExecutionMode("normal");setStage("result")}}>继续查看结果</button> : null}<button type="button" onClick={()=>setStage("stopped")}><Square size={14}/>停止查询</button></div></footer></section>:null}
        {stage === "result" ? (
          <div className={`zc4-result-layout${evidence ? " with-evidence" : ""}`}>
            <section className="zc4-result">
              <header><div><h3>2024 年集团净利润分析</h3><div className="zc4-condition-chips"><span>{year} 年</span><span>{scope}</span><span>净利润 · 用户已确认</span><button type="button" onClick={()=>{setMetric("");setStage("clarify")}}><Pencil size={14}/>修改条件</button></div></div><button className="zc4-primary" type="button" onClick={()=>setSaveOpen(true)}><Save size={16}/>保存到看板</button></header>
              <div className="zc4-complete"><span><Check size={14}/>理解问题</span><span><Check size={14}/>查询数据</span><span><Check size={14}/>生成结果</span><button type="button" aria-expanded={showProcess} aria-controls={showProcess ? "zc4-demo-process" : undefined} onClick={()=>setShowProcess(!showProcess)}>查看过程<ChevronDown size={14}/></button></div>
              {showProcess?<div className="zc4-process" id="zc4-demo-process"><span><Check size={14}/>理解问题：时间、组织与指标已对齐</span><span><Check size={14}/>查询数据：返回 4 条季度汇总数据</span><span><Check size={14}/>生成结果：已关联查询快照</span></div>:null}
              <article className="zc4-result-card">
                <span className="zc4-result-demo-label">演示数据</span>
                <p className="total">全年净利润 <strong>{totalProfit.toFixed(2)}</strong> 亿元</p>
                <p>四个季度净利润逐季上升，四季度为 1.71 亿元。</p>
                <small>增长原因仍需结合业务明细核对。</small>
                <div className="view-tabs" role="group" aria-label="结果显示方式"><button type="button" aria-pressed={view === "chart"} onClick={()=>setView("chart")}><BarChart3 size={14}/>图表</button><button type="button" aria-pressed={view === "table"} onClick={()=>setView("table")}><Table2 size={14}/>表格</button></div>
                <div>{view === "chart" ? <ProfitChart/> : <DataTable/>}</div>
                <footer><span><FileText size={15}/>集团经营指标表（示例）</span><button ref={evidenceButton} type="button" onClick={()=>setEvidence(true)}>查看口径与数据依据<ArrowUpRight size={14}/></button></footer>
              </article>
              {savedSnapshot?<div className="zc4-saved-note"><Check size={16}/>已保存到“集团经营分析”<button type="button" onClick={()=>setStage("board")}>查看看板</button></div>:null}
            </section>
            {evidence?<aside className="zc4-evidence" aria-label="本次查询依据"><header><h3>本次查询依据</h3><button type="button" aria-label="关闭查询依据" onClick={closeEvidence}><X size={18}/></button></header><label>执行版本<select aria-label="执行版本" value={displayedVersion} onChange={event => setViewedVersion(Number(event.target.value))}>{versions.length ? versions.map(version => <option key={version.id} value={version.id}>第 {version.id} 次执行 · 已完成</option>) : <option value={displayedVersion}>第 {displayedVersion} 次执行 · 已完成</option>}</select></label><QuerySourceFields/><button type="button" onClick={()=>setTableOpen(true)}><Table2 size={15}/>查看本次原始表格<ExternalLink size={13}/></button><p>完成版本保留查询快照；修改条件后重新执行。本例的可查询范围为 2024 年全集团净利润。</p></aside>:null}
          </div>
        ) : null}
        {(["timeout", "empty", "stopped"] as DemoStage[]).includes(stage) ? <ExceptionState stage={stage as RecoveryStage} query={query} year={year} scope={scope} metric={metric} phase={phase} supplement={supplement} onPrimary={stage === "empty" ? useSupportedExample : () => beginExecution(true)} onEdit={() => setStage("entry")}/> : null}
        {stage==="board"?<section className="zc4-board"><header><div><LayoutDashboard size={20}/><h3>我的看板</h3></div><button type="button" onClick={()=>setStage("result")}>返回原任务</button></header>{savedSnapshot?<><div className="success"><Check size={16}/>已保存到「集团经营分析」</div><article><div><h4>{savedSnapshot.name}</h4><p>{savedSnapshot.year} 年 / {savedSnapshot.scope} / {savedSnapshot.metric}</p><span><Database size={14}/>集团经营指标表（示例）</span></div><button type="button" onClick={openSavedAnalysis}>打开分析<ArrowUpRight size={14}/></button></article></>:<div className="empty"><LayoutDashboard size={28}/><h4>还没有保存的分析</h4><p>在结果页保存后，结果与查询上下文会一起保留。</p></div>}</section>:null}
      </div>
      {saveOpen?<div className="zc4-dialog-backdrop"><section ref={saveDialogRef} className="zc4-dialog" role="dialog" aria-modal="true" aria-labelledby="save-title" aria-describedby="save-description"><header><h3 id="save-title">保存到看板</h3><button type="button" aria-label="关闭保存对话框" onClick={()=>setSaveOpen(false)}><X size={18}/></button></header><label>结果名称<input name="result-name" autoComplete="off" value={saveName} onChange={e=>setSaveName(e.target.value)}/></label><label>选择看板<select aria-label="选择看板" name="target-board" autoComplete="off"><option>集团经营分析（示例）</option></select></label><p id="save-description">同时保存本次结果、查询条件与数据来源。</p><footer><button type="button" onClick={()=>setSaveOpen(false)}>取消</button><button className="zc4-primary" type="button" disabled={!saveName.trim()} onClick={()=>{setSavedSnapshot({ name: saveName.trim(), year, scope, metric: "净利润", executionId: displayedVersion });setSaveOpen(false)}}>保存</button></footer></section></div>:null}
      {tableOpen?<div className="zc4-dialog-backdrop"><section ref={tableDialogRef} className="zc4-dialog table" role="dialog" aria-modal="true" aria-labelledby="table-title"><header><div><span>第 {displayedVersion} 次执行 · 示例数据</span><h3 id="table-title">集团经营指标表</h3></div><button type="button" aria-label="关闭原始表格" onClick={()=>setTableOpen(false)}><X size={18}/></button></header><DataTable/><p>图表、合计与查询快照使用同一份返回数据。</p></section></div>:null}
    </div>
  );
}

function DataTable({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`zc4-table-wrap${compact ? " is-compact" : ""}`} role="region" aria-label="演示数据：2024 年季度净利润数据表，可横向滚动" tabIndex={0}>
      <table className="zc4-table">
        <caption>演示数据：2024 年季度净利润</caption>
        <thead><tr><th scope="col">季度</th><th scope="col">组织范围</th><th scope="col">净利润（亿元）</th></tr></thead>
        <tbody>{profitData.map(item => <tr key={item.quarter}><th scope="row">{item.quarter}</th><td>全集团</td><td>{item.value.toFixed(2)}</td></tr>)}</tbody>
        <tfoot><tr><th scope="row" colSpan={2}>全年合计</th><td>{totalProfit.toFixed(2)}</td></tr></tfoot>
      </table>
    </div>
  );
}

function DecisionEvidence({ kind }: { kind: "clarify" | "running" | "result" }) {
  return <div className={`zc4-decision-evidence-ui is-${kind}`}>
    <div className="zc4-evidence-window">
      <header><div><span>智能问数</span><i>/</i><strong>集团年度利润分析</strong></div><span>交互演示界面</span></header>
      <div className="zc4-evidence-content">
        {kind === "clarify" ? <>
          <p className="zc4-evidence-question">{defaultQuery}</p>
          <div className="zc4-evidence-clarify"><section>
            <div className="zc4-evidence-brand"><Sparkles size={19}/>招财 Smart</div>
            <h4>你想查看哪一种利润？</h4><p>“利润”可能对应多个指标，请选择本次统计口径。</p>
            <ul>{["营业利润", "利润总额", "净利润"].map(label => <li key={label}><i/><span>{label}</span><em>口径说明</em></li>)}</ul>
            <p className="zc4-evidence-supplement">都不是，补充说明</p>
            <p>原问题、时间和组织会持续保留，只补充本次指标口径。</p>
            <span className="zc4-evidence-action">选择口径后继续</span>
          </section><aside><h4>已识别条件</h4><ConditionFields year="2024" scope="全集团"/><p className="zc4-evidence-source"><Database size={15}/>集团经营指标表（示例）</p></aside></div>
        </> : kind === "running" ? <section className="zc4-evidence-progress">
          <span>模拟已等待超过 10 秒</span><h4>2024 年全集团净利润分析</h4><p>已保留本次查询条件。</p>
          <div className="zc4-condition-chips"><span>2024 年</span><span>全集团</span><span>净利润 · 用户已确认</span></div>
          <ExecutionStages phase={1}/>
          <footer><p>点击继续查看结果，或停止本次查询。</p><div><span className="zc4-evidence-action">继续查看结果</span><span><Square size={14}/>停止查询</span></div></footer>
        </section> : <div className="zc4-evidence-result"><section>
          <h4>2024 年集团净利润分析</h4><div className="zc4-condition-chips"><span>2024 年</span><span>全集团</span><span>净利润 · 用户已确认</span></div>
          <p>全年净利润 <strong>{totalProfit.toFixed(2)}</strong> 亿元</p><p>四个季度净利润逐季上升，四季度为 1.71 亿元。</p><ProfitChart compact/>
          <p className="zc4-evidence-source"><FileText size={15}/>集团经营指标表（示例）</p>
        </section><aside><h4>本次查询依据</h4><span className="zc4-evidence-version">第 1 次执行 · 已完成</span><QuerySourceFields/><span className="zc4-evidence-table-label"><Table2 size={15}/>查看本次原始表格</span></aside></div>}
      </div>
    </div>
    <div className="zc4-evidence-detail">
      <p className="zc4-detail-caption">{kind === "clarify" ? "条件侧栏 · 局部放大" : kind === "running" ? "执行阶段 · 局部放大" : "查询依据 · 局部放大"}</p>
      <div className="zc4-detail-panel">
        {kind === "clarify" ? <><h4>已识别条件</h4><ConditionFields year="2024" scope="全集团"/></> : kind === "running" ? <><h4>当前阶段：查询数据</h4><ExecutionStages phase={1}/></> : <><h4>本次查询依据</h4><span className="zc4-evidence-version">第 1 次执行 · 已完成</span><QuerySourceFields/><span className="zc4-evidence-table-label"><Table2 size={16}/>查看本次原始表格</span></>}
      </div>
    </div>
  </div>;
}

function AnswerExample() {
  return <div className="zc4-answer-example"><article><h4>2024 年全集团净利润分析</h4><p className="zc4-answer-conclusion">全年净利润合计 <strong>{totalProfit.toFixed(2)} 亿元</strong>，四个季度逐季上升。</p><ProfitChart compact/><p className="zc4-answer-source">指标口径：净利润 · 统计范围：2024 年 / 全集团<br/>来源：集团经营指标表（脱敏示例）</p><p className="zc4-answer-next">增长原因仍需结合业务明细核对。</p></article><aside><div><strong>结论</strong><p>先回答用户的核心问题。</p></div><div><strong>图表与明细</strong><p>趋势用于阅读，表格用于核数，数据同源。</p></div><div><strong>口径与来源</strong><p>期间、组织、指标和来源一起出现。</p></div><div><strong>缺口与下一步</strong><p>有数据支持的描述与待验证原因分别表达。</p></div></aside></div>;
}

function OwnershipFlow() {
  const steps = [["AI", "识别条件"], ["用户", "确认口径"], ["确定性服务", "权限校验"], ["确定性服务", "执行查询"], ["确定性服务", "结果校验"], ["AI", "解释呈现"], ["用户", "核对结果"]];
  return <ol className="zc4-ownership-flow" aria-label="人机协作与执行顺序">{steps.map((step, index) => <li key={step[1]} className={step[0] === "AI" ? "is-ai" : step[0] === "用户" ? "is-human" : "is-service"}><span>{step[0]}</span><strong>{step[1]}</strong>{index < steps.length - 1 ? <ArrowUpRight aria-hidden="true" size={18}/> : null}</li>)}</ol>;
}

function DeliveryEvidence({ kind }: { kind: "task" | "content" | "collaboration" }) {
  if (kind === "task") return <div className="zc4-delivery-artifact is-task" aria-label="任务流与恢复路径交付示例"><div><span>提问</span><span>确认</span><span>查询</span><span>核对</span></div><div><span>保留条件</span><span>停止 / 继续</span><span>结果复用</span></div></div>;
  if (kind === "content") return <div className="zc4-delivery-artifact is-content" aria-label="回答内容组件交付示例"><strong>全年净利润 {totalProfit.toFixed(2)} 亿元</strong><div>{profitData.map(row => <span key={row.quarter}><i style={{ height: `${row.value / maxProfit * 44}px` }}/>{row.value.toFixed(2)}</span>)}</div><p>2024 年 · 全集团 · 净利润</p></div>;
  return <div className="zc4-delivery-artifact is-collaboration" aria-label="设计验收条目交付示例">{["口径与条件一致", "数值、单位和来源可核对", "异常状态提供恢复动作"].map(item => <p key={item}><Check size={16}/>{item}</p>)}</div>;
}

const aiMetricPlans = [
  ["意图结构化完全正确率", "时间、组织、指标、维度、聚合与比较关系全部匹配金标的问题数", "有效评测问题数", "每个模型 / 语义层版本；线上滚动 28 天", "保存结构化查询计划，与金标自动比对"],
  ["应澄清召回率", "正确触发确认的歧义问题数", "金标中的全部歧义问题数", "每版本离线评测", "金标标注“应确认 / 可直查”"],
  ["无效澄清率", "被错误要求确认的明确问题数", "全部明确问题数", "每版本 + 滚动 28 天", "离线金标与线上澄清事件"],
  ["数值与来源通过率", "数值、计算和引用全部通过核对的回答数", "抽检回答数", "每版本 + 每周分层抽样，滚动 28 天", "自动数值校验 + 财务 / 数据人工审查"],
  ["一次可用率", "首次结果后 10 分钟内未改条件或重查，且被保存、导出或明确采纳的会话数", "成功展示结果的会话数", "滚动 28 天", "会话事件；显式采纳与行为代理分开统计"],
  ["人工接管率", "转固定筛选、人工报表或人工支持的会话数", "发起 AI 查询的会话数", "滚动 28 天", "入口切换、重新查询与工单事件"],
  ["降级完成率", "模型不可用时通过结构化入口完成任务的会话数", "可降级会话数", "按事故统计，季度汇总", "故障标记与后续任务完成事件"],
  ["安全逃逸率", "返回越权数据或执行禁用动作的攻击请求数", "全部越权与红队请求数", "每版本；生产持续监控", "红队集、权限日志与事故记录"],
] as const;

const recoveryCases = [
  ["查询超时", "显示当前步骤、已保留条件和未返回结果", "从失败步骤重试", "page"],
  ["无匹配数据", "显示查询范围和“无匹配记录”，不显示伪零值", "修改时间、组织或指标", "page"],
  ["用户停止", "保留已完成步骤和确认条件", "继续执行或修改问题", "page"],
  ["结果校验异常", "暂不生成确定性结论，显示异常项和原始表格", "核对来源后重新生成", "spec"],
  ["模型不可用", "说明智能解析暂不可用", "切换指标树、模板或固定筛选器", "spec"],
  ["数据服务不可用", "说明数据暂未返回，不推测为无记录", "保留查询并稍后重试", "spec"],
  ["权限不足", "明确说明无权访问，不伪装成空数据", "申请权限或缩小范围", "spec"],
  ["预算或限流耗尽", "复杂自然语言任务暂不可用", "结构化任务继续走确定性查询", "spec"],
] as const;

const evaluationChecks = [
  "用户有权访问对应数据",
  "时间、组织、指标、维度、聚合和比较关系与问题一致",
  "查询计划只使用已批准的指标与数据范围",
  "返回数据与基准查询一致",
  "所有数值、计算和引用都能回到原始数据",
  "单位、期间、分母、精度和缺失值处理正确",
  "没有把推测写成事实，也没有把相关性写成因果",
] as const;

export function ZhaocaiSmartCompleteCase() {
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
    const parsedYear = query.match(/20\d{2}/)?.[0] ?? "";
    const parsedScope = query.match(/全集团|华南分公司|华东分公司|华北分公司/)?.[0] ?? "";
    const parsedMetric: Metric = query.includes("净利润") ? "净利润" : query.includes("利润总额") ? "利润总额" : query.includes("营业利润") ? "营业利润" : "";
    setYear(parsedYear);
    setScope(parsedScope);
    setMetric(parsedMetric);
    if (!parsedYear || !parsedScope || (!parsedMetric && !query.includes("利润"))) { setStage("clarify"); return; }
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
    requestAnimationFrame(()=>demoRef.current?.scrollIntoView({behavior:"smooth",block:"start"}));
  };

  const openRecovery = (next: RecoveryStage, edit = false) => {
    setDemo("exception");
    if (next === "empty") {
      setQuery("查看 2025 年全集团净利润变化");
      setYear("2025");
    }
    setPhase(1);
    setStage(edit ? "entry" : next);
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
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const previousDescription = description?.content;
    const previousOgTitle = ogTitle?.content;
    const previousOgDescription = ogDescription?.content;
    document.title = "招财 Smart｜AI 财务智能问数项目｜李家豪";
    if (description) description.content = "招财 Smart 是面向企业财务、经营分析人员与业务负责人的 AI 智能问数产品，支持用自然语言查询并核对经营数据。";
    if (ogTitle) ogTitle.content = "招财 Smart｜AI 财务智能问数项目";
    if (ogDescription) ogDescription.content = "面向企业财务与经营分析场景的 AI 智能问数产品，让查询条件可确认、结果依据可追溯。";
    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
      if (ogTitle && previousOgTitle) ogTitle.content = previousOgTitle;
      if (ogDescription && previousOgDescription) ogDescription.content = previousOgDescription;
    };
  }, []);

  const demoProps: DemoProps = { resetToken, stage, setStage, query, setQuery, metric, setMetric, year, setYear, scope, setScope, phase, executionId, executionMode, setExecutionMode, beginExecution, runFromEntry };
  return (
    <article className="zc4" id="zcs-case-top" aria-label="招财 Smart 完整项目案例">
      <a className="zc4-skip-link" href="#zcs-project-overview">跳到项目正文</a>
      <ProjectLocator sections={locatorSections} legacyAnchors={legacyAnchors} ariaLabel="招财 Smart 项目章节定位" />

      <header className="zc4-hero" id="zcs-project-overview" tabIndex={-1}>
        <div className="zc4-opening">
          <div className="zc4-opening-copy"><h1>招财 <span>Smart</span></h1><h2>把业务提问，转成<br/>可核对的分析任务。</h2><p>面向企业财务、经营分析人员与业务负责人的 AI 智能问数产品，让自然语言问题带着明确的口径、过程与依据进入分析。</p><a className="zc4-opening-link" href="#zcs-core-interaction">体验完整任务<ArrowUpRight size={18}/></a></div>
          <figure className="zc4-opening-ui"><a href={publicAsset("/assets/projects/zhaocai-smart/long-image/assets/homepage-original.png")} target="_blank" rel="noreferrer" aria-label="在新标签页查看招财 Smart 产品首页原图"><img src={publicAsset("/assets/projects/zhaocai-smart/long-image/assets/homepage-original.png")} width="1445" height="800" fetchPriority="high" decoding="async" alt="招财 Smart 产品首页：财务智能体导航、自然语言提问框与财务问数入口。"/></a><figcaption>产品首页 · 原始脱敏界面 · 可查看原图</figcaption></figure>
        </div>
        <dl className="zc4-opening-meta"><div><dt>我的角色</dt><dd>UX/UI 设计</dd></div><div><dt>项目时间</dt><dd>2025.07—2025.11</dd></div><div><dt>项目类型</dt><dd>AI 财务智能问数 / Web</dd></div><div><dt>设计范围</dt><dd>核心交互、结果呈现与回答规范</dd></div></dl>
        <p className="zc4-opening-scope">口径确认 · 过程反馈 · 结果追溯 · 看板复用</p>
        <p className="zc4-opening-note">本页为前端交互演示，经营数字为脱敏示例。</p>
      </header>

      <div className="zc4-content">
        <section className="zc4-section" id="zcs-business-needs">
          <article className="zc4-problem-evidence" aria-labelledby="zc4-problem-evidence-title">
            <header className="zc4-problem-evidence-header">
              <div>
                <h2 id="zc4-problem-evidence-title">同一句“利润”，<br />可能对应不同口径</h2>
              </div>
              <p>三类角色分别核数、分析和使用结论。关键歧义需要确认，已经识别的时间和组织继续保留。</p>
            </header>

            <section className="zc4-problem-roles" aria-labelledby="zc4-problem-roles-title">
              <h3 id="zc4-problem-roles-title">三类角色，三种阅读重点</h3>
              <div className="zc4-problem-role-grid">
                {problemRoles.map(role => {
                  const Icon = role.icon;
                  return (
                    <article className="zc4-problem-role" key={role.number}>
                      <div className="zc4-problem-role-heading">
                        <div><h4>{role.title}</h4></div>
                        <Icon aria-hidden="true" strokeWidth={1.8} />
                      </div>
                      <dl>
                        <div><dt>主要任务</dt><dd>{role.task}</dd></div>
                        <div><dt>需要的信息与支持</dt><dd>{role.support}</dd></div>
                      </dl>
                      <div className="zc4-problem-role-focus"><span>设计重点</span><strong>{role.focus}</strong></div>
                    </article>
                  );
                })}
              </div>
            </section>

            <div className="zc4-task-analysis"><div className="zc4-task-input"><span>业务提问</span><p>查看 <strong>2024 年</strong><strong>全集团</strong>利润变化</p></div><div className="zc4-task-conditions"><div><span>已识别 · 时间</span><strong>2024 年<Check size={16}/></strong></div><div><span>已识别 · 组织</span><strong>全集团<Check size={16}/></strong></div><div className="needs-confirmation"><span>待确认 · 指标</span><strong>哪一种利润？<CircleHelp size={16}/></strong></div></div><p className="zc4-design-question">如何只确认影响结果的歧义，同时保留查询上下文？</p></div>
            <p className="zc4-material-note">依据现有任务与界面材料梳理。</p>
          </article>
          <span className="zc4-anchor" id="zcs-design-goals"/>
          <details className="zc4-disclosure"><summary>设计目标与成功口径</summary><div className="zc4-disclosure-body"><div className="zc4-goal-grid"><article><h3>业务目标</h3><p>把一次性“问到一个数字”转成可确认、可核对、可复用的经营分析任务，减少口径误解带来的往返。</p></article>{[["对齐业务含义","只确认有歧义的条件，保留已识别信息。"],["建立过程反馈","说明正在处理什么，并提供停止和恢复入口。"],["支持结果复用","将结果、条件与依据组织为可持续使用的内容。"]].map(item=><article key={item[0]}><h3>{item[0]}</h3><p>{item[1]}</p></article>)}</div></div></details>
        </section>

        <section className="zc4-section" id="zcs-experience-journey">
          <Heading number="03 / 核心体验" title="从业务提问，到可复用结果。" intro="在同一次任务中，保留问题、条件、过程与结果依据。"/>
          <ol className="zc4-flow zc4-flow-five">{[["提问","自然语言描述需求"],["对齐","识别条件，只确认歧义项"],["执行","数据服务查询，界面展示阶段"],["核对","查看结论、条件、来源与原始表"],["复用","保存结果和查询上下文"]].map((item,index)=><li key={item[0]}><span>{String(index+1).padStart(2,"0")}</span><strong>{item[0]}</strong><p>{item[1]}</p></li>)}</ol>
          <div className="zc4-demo" id="zcs-core-interaction" ref={demoRef}><span className="zc4-anchor" id="clarification"/><header><div><span>交互演示 · 示例数据</span><strong>完整任务</strong></div><div role="group" aria-label="切换演示场景">{([['clarify','口径确认'],['running','慢查询演示'],['result','顺利完成查询'],['exception','异常恢复']] as [DemoScene,string][]).map(([id,label])=><button type="button" className={scene===id?"active":""} aria-pressed={scene===id} onClick={()=>setDemo(id)} key={id}>{label}</button>)}</div></header>{scene==="exception"?<div className="zc4-exception-tabs"><button type="button" onClick={()=>openRecovery("timeout")}>查询超时与重试</button><button type="button" onClick={()=>openRecovery("empty")}>模拟无匹配记录</button><button type="button" onClick={()=>openRecovery("stopped")}>停止并保留条件</button></div>:null}<ProductDemo {...demoProps}/></div>
        </section>

        <section className="zc4-section" id="zcs-clarification">
          <span className="zc4-anchor" id="strategy"/>
          <Heading number="04 / 关键设计" title="让口径、过程与依据都可核对。" intro="先对齐业务含义，再保留执行上下文，最后把结论与来源关联起来。"/>
          <div className="zc4-decision-stories">
            <article className="zc4-decision-story"><DecisionEvidence kind="clarify"/><div className="zc4-story-note"><h3>把确认成本，留给真正有歧义的地方。</h3><dl><div><dt>问题</dt><dd>同一句“利润”有多个合法口径。</dd></div><div><dt>取舍</dt><dd>优先提供候选，避免重新填写已识别的时间与组织。</dd></div><div><dt>界面落点</dt><dd>只确认指标；候选不匹配时，通过“都不是”补充说明。</dd></div></dl><button type="button" onClick={()=>setDemo("clarify", true)}>体验候选确认<ArrowUpRight size={16}/></button></div></article>
            <article className="zc4-decision-story is-reversed" id="zcs-process-feedback"><span className="zc4-anchor" id="process"/><DecisionEvidence kind="running"/><div className="zc4-story-note"><h3>让等待过程可理解、可停止。</h3><dl><div><dt>问题</dt><dd>等待时不知道系统正在做什么。</dd></div><div><dt>取舍</dt><dd>展示业务阶段，细节按需查看，不暴露内部推理。</dd></div><div><dt>界面落点</dt><dd>阶段与已确认条件同时可见；停止后保留上下文，允许继续或修改。</dd></div></dl><button type="button" onClick={()=>setDemo("running")}>体验慢查询演示<ArrowUpRight size={16}/></button></div></article>
            <article className="zc4-decision-story"><DecisionEvidence kind="result"/><div className="zc4-story-note"><h3>结论清楚，依据随时可核对。</h3><dl><div><dt>问题</dt><dd>一个数字难以还原统计范围与来源。</dd></div><div><dt>取舍</dt><dd>先呈现结论、图表和必要条件，依据在侧栏按需查看。</dd></div><div><dt>界面落点</dt><dd>口径、时间、组织、来源与原始表关联；修改条件后重新执行。</dd></div></dl><button type="button" onClick={()=>setDemo("result")}>查看结果与依据<ArrowUpRight size={16}/></button></div></article>
          </div>
          <details className="zc4-disclosure"><summary>口径确认的三条互补路径</summary><div className="zc4-disclosure-body">
          <div className="zc4-option-compare is-three"><article><span>方案 A · 开放追问</span><h3>让用户重新描述</h3><div className="zc4-static-input">请输入补充说明。</div><p>适合系统无法形成可靠候选时继续收集信息。</p><strong>代价：候选已经明确时，增加一次表达成本。</strong></article><article className="adopted"><span>方案 B · 候选确认（采用）</span><h3>只确认歧义口径</h3><div className="zc4-choice-preview"><div className="zc4-choice-options"><span>2024 年</span><span>集团</span><label className="selected"><i/>净利润</label><label><i/>利润总额</label></div><button type="button" onClick={()=>setDemo("clarify", true)}>体验候选确认</button></div><p>保留已识别的时间和范围，让用户决定业务含义。</p><strong>代价：候选集错误或不完整时可能误导，必须保留“都不是”。</strong></article><article><span>方案 C · 固定筛选器 / 指标树</span><h3>用确定性 GUI 完成</h3><div className="zc4-filter-preview"><span>时间</span><span>组织</span><span>指标</span></div><p>适合高频、标准且范围明确的任务，也作为模型不可用时的降级入口。</p><strong>结论：不作为复杂问数的主入口，但必须保留。</strong></article></div>
          <p className="zc4-comparison-conclusion">方案 B 为主路径；方案 A 承接候选不足，方案 C 承接标准任务与故障降级。</p></div></details>
          <details className="zc4-disclosure"><summary>过程反馈节奏与等待规格</summary><div className="zc4-disclosure-body"><p className="zc4-material-note">以下时间段为交互设计规格，并非项目性能测量。</p><div className="zc4-waits">{[["0—3 秒","及时响应","立即显示当前阶段，已返回的内容先呈现。"],["3—10 秒","保留进行状态","突出当前执行步骤，用骨架屏预留数据位置。"],["10 秒以上","说明等待情况","允许停止，保留已确认条件。"]].map(item=><article key={item[0]}><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p></article>)}</div></div></details>
        </section>

        <section className="zc4-section" id="zcs-markdown-system">
          <Heading number="05 / 结果复用" title="把一次回答，沉淀为可复用的分析。" intro="结果、条件与依据一起保留；修改条件后重新执行。"/>
          <div className="zc4-reuse-steps" aria-label="结果复用步骤"><span>查看结果</span><i/> <span>确认条件</span><i/> <span>保存到看板</span></div>
          <span className="zc4-anchor" id="board"/>
          <div className="zc4-board-feature" id="zcs-board-design"><div><strong>复用内容</strong><p>查询条件与来源随结果保留。</p></div><div><strong>操作控制</strong><p>排序与合并后可以撤销。</p></div></div>
          <BoardDesignDemo/>
          <div className="zc4-substory"><h3>统一回答结构，让信息更容易读取。</h3><p>结论、图表、口径、来源与待核对项各自承担明确的阅读任务。</p><AnswerExample/><details className="zc4-disclosure"><summary>体验完整回答规范与八类场景</summary><div className="zc4-disclosure-body"><SpecWorkbench/><p className="zc4-spec-open"><a href={publicAsset("/assets/projects/zhaocai-smart/long-image/spec-workbench.html")} target="_blank" rel="noreferrer">在独立页面打开完整回答规范<ArrowUpRight aria-hidden="true" size={15}/><span className="zc4-sr-only">（新标签页）</span></a></p></div></details></div>
          <div className="zc4-history-evidence" id="zcs-original-output"><figure className="zc4-history-viewport"><img src={publicAsset("/assets/projects/zhaocai-smart/long-image/assets/completed-output-original-cropped.png")} width="1164" height="1944" alt="历史脱敏设计稿局部：业务明细表和查看原始表格入口，完整稿可通过旁边链接打开。" loading="lazy"/></figure><aside><h3>原始表，保留在结论之后。</h3><p>历史稿中的明细表与原始表入口，为结果核对提供进一步查看的路径。</p><p className="zc4-material-note">历史脱敏设计稿</p><a href={publicAsset("/assets/projects/zhaocai-smart/long-image/assets/completed-output-original.png")} target="_blank" rel="noreferrer">查看完整设计稿<ArrowUpRight size={16}/><span className="zc4-sr-only">（新标签页）</span></a></aside></div>
        </section>

        <section className="zc4-section" id="zcs-ai-governance">
          <Heading number="06 / 异常恢复" title="失败之后，任务仍然可以继续。" intro="保留问题、条件与已完成阶段，为不同失败原因提供对应的恢复动作。"/>
          <RecoveryPreview onOpen={openRecovery}/>
          <details className="zc4-disclosure"><summary>查看完整 8 类异常、7 项正确性检查与评测方案</summary><div className="zc4-disclosure-body"><div className="zc4-matrix-wrap" role="region" aria-label="失败与降级方案表，可横向滚动" tabIndex={0}><table className="zc4-matrix"><caption>失败与降级方案</caption><thead><tr><th scope="col">状态</th><th scope="col">用户看到什么</th><th scope="col">恢复方式</th><th scope="col">承载方式</th></tr></thead><tbody>{recoveryCases.map(item=><tr key={item[0]}><th scope="row">{item[0]}</th><td>{item[1]}</td><td>{item[2]}</td><td>{item[3] === "page" ? "交互原型" : "降级规范"}</td></tr>)}</tbody></table></div><div className="zc4-evaluation"><div><span>一次回答怎样算正确</span><h3>七项检查全部通过，才算一次通过。</h3><p>文案流畅不能替代财务正确性；LLM-as-judge 只能辅助检查表达。</p></div><ol>{evaluationChecks.map(item=><li key={item}>{item}</li>)}</ol></div><div className="zc4-responsibility-grid">{[["产品 / 设计","整理典型任务与用户表达，覆盖场景和任务层级"],["财务指标负责人","定义问题金标，终审业务口径"],["BI / 数据工程师","提供基准查询与结果，终审数值"],["算法工程师","维护解析、候选排序与生成评测"],["安全 / 权限负责人","建立越权与攻击样本，终审安全问题"]].map(item=><article key={item[0]}><strong>{item[0]}</strong><p>{item[1]}</p></article>)}</div><div className="zc4-matrix-wrap" role="region" aria-label="AI 指标定义表，可横向滚动" tabIndex={0}><table className="zc4-matrix is-wide"><caption>AI 指标定义与采集方式</caption><thead><tr><th scope="col">指标</th><th scope="col">分子</th><th scope="col">分母</th><th scope="col">时间窗</th><th scope="col">采集方式</th></tr></thead><tbody>{aiMetricPlans.map(item=><tr key={item[0]}><th scope="row">{item[0]}</th><td>{item[1]}</td><td>{item[2]}</td><td>{item[3]}</td><td>{item[4]}</td></tr>)}</tbody></table></div></div></details>
          <details className="zc4-disclosure"><summary>查看越权、提示注入与风险治理方案</summary><div className="zc4-disclosure-body"><div className="zc4-governance-grid">{[["权限层","模型调用前和数据返回后都校验权限，模型不拥有独立数据权限。"],["工具层","只允许白名单查询工具或查询 DSL，不执行任意 SQL。"],["数据层","使用只读账号，限制组织、字段、行数、耗时和成本。"],["输入层","把用户输入和检索内容当作数据，不能覆盖系统与工具规则。"],["输出层","校验数值、来源与敏感字段；未知来源不伪装成引用。"],["运营与评测","记录条件、工具调用、权限、版本与输出，覆盖注入、越狱、跨组织访问和数据外泄。"]].map(item=><article key={item[0]}><strong>{item[0]}</strong><p>{item[1]}</p></article>)}</div></div></details>
        </section>

        <section className="zc4-section" id="zcs-ai-strategy">
          <Heading number="07 / 协作边界" title="让 AI 理解表达，让系统守住执行边界。" intro="标准查询不依赖 AI；语言理解、业务确认与确定性执行各自承担清晰职责。"/>
          <div className="zc4-boundary-grid"><article><h3>用户</h3><p>确认业务含义与高影响操作，决定最终采用的口径。</p></article><article><h3>AI</h3><p>识别时间、组织与指标，提供候选，并组织结果解释。</p></article><article><h3>确定性服务</h3><p>校验权限、执行查询，并核对数值、单位与来源。</p></article></div>
          <OwnershipFlow/>
          <p className="zc4-boundary-summary">指标、时间和组织都明确时，固定筛选器、指标树或常用模板应继续可用，并承接模型不可用状态。</p>
          <div className="zc4-matrix-wrap zc4-ownership-table" role="region" aria-label="设计、产品与工程职责表，可横向滚动" tabIndex={0}><table className="zc4-matrix"><thead><tr><th scope="col">设计交付</th><th scope="col">产品与业务确认</th><th scope="col">研发实现</th></tr></thead><tbody><tr><td>任务流、状态策略、交互与回答规范</td><td>指标口径、组织范围与权限规则</td><td>查询服务、权限校验与结果校验能力</td></tr></tbody></table></div>
          <details className="zc4-disclosure"><summary>查看完整能力链、确认规则与职责边界</summary><div className="zc4-disclosure-body"><div className="zc4-confirmation-rules"><h3>什么时候必须让用户确认</h3>{[["唯一映射且权限通过","展示条件摘要后直接查询，保留修改入口","默认路径"],["关键指标有多个合法候选","暂停查询，请用户选择业务口径","确认路径"],["无法形成有效候选","提供“都不是，补充说明”或切换筛选器","兜底路径"],["导出、分享、发布或写回","二次确认，不自动执行","高风险路径"]].map(item=><article key={item[0]}><strong>{item[0]}</strong><p>{item[1]}</p><span>{item[2]}</span></article>)}</div><div className="zc4-animated-flow" id="zcs-trust-mechanism"><ZhaocaiSmartTrustSection flowOnly/></div><div className="zc4-architecture"><div><span>能力链设计</span><strong>模型提出查询计划，确定性服务负责权限与执行。</strong></div><ol><li>自然语言解析</li><li>指标字典匹配</li><li>权限校验</li><li>受限查询 DSL</li><li>数据服务执行</li><li>数值与来源校验</li><li>回答渲染</li></ol><p>权限、执行与数值校验由确定性服务完成；校验未通过时，任务回到口径确认、固定筛选或人工核对。</p></div></div></details>
          <div className="zc4-proof-callout"><p><strong>事实边界：</strong>页面展示的是设计规范、协作约束与脱敏前端演示，不把未公开的算法、权限或工程实现扩写为个人成果。</p></div>
        </section>

        <section className="zc4-section zc4-delivery" id="zcs-delivery">
          <Heading number="08 / 交付复盘" title="把设计判断，落实为可检查的交付。" intro="从完整任务到内容规范，以可操作原型与验收规则对接产品和研发。"/>
          <div className="zc4-outcome-grid is-three">{[["任务与状态","提问、确认、执行、核对与复用，以及异常恢复策略。"],["组件与内容","回答结构、标题、数值、单位、来源和异常表达规范。"],["协作与迭代","以任务流、组件状态和验收规则对接产品及研发。"]].map((item,index)=><article key={item[0]}><DeliveryEvidence kind={index === 0 ? "task" : index === 1 ? "content" : "collaboration"}/><h3>{item[0]}</h3><p>{item[1]}</p></article>)}</div>
          <p className="zc4-delivery-coverage">交付覆盖：5 个任务阶段 · 3 条互补路径 · 8 类状态策略 · 1 套回答规范</p>
          <div className="zc4-result-boundary"><strong>结果衡量框架</strong><p>一次可用率衡量首轮答案能否被采纳，人工接管率观察 AI 边界，数值与来源通过率守住财务正确性，降级完成率验证故障状态下的任务连续性。</p></div>
          <div className="zc4-reflection"><span>下一轮计划</span><p>下一轮将同步定义评测集、埋点和降级门槛，验证任务是否真正完成、结果是否可用。当前公开材料未提供实测改善指标，因此可检查的设计交付与后续测量计划保持分开。</p></div>
          <blockquote><strong>设计原则：</strong>AI 产品的可信感，来自用户能否理解系统识别了什么、正在处理什么，以及结果依据来自哪里。</blockquote>
          <footer className="zc4-page-footer"><a href="#zcs-project-overview" onClick={event=>{event.preventDefault();scrollToId("zcs-project-overview")}}>返回项目摘要</a><a href="/portfolio/#work">返回作品</a></footer>
        </section>
      </div>
    </article>
  );
}
