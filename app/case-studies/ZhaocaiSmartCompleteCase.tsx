"use client";

import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle.mjs";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right.mjs";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3.mjs";
import Check from "lucide-react/dist/esm/icons/check.mjs";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down.mjs";
import CircleHelp from "lucide-react/dist/esm/icons/circle-help.mjs";
import Clock3 from "lucide-react/dist/esm/icons/clock-3.mjs";
import Database from "lucide-react/dist/esm/icons/database.mjs";
import ExternalLink from "lucide-react/dist/esm/icons/external-link.mjs";
import FileText from "lucide-react/dist/esm/icons/file-text.mjs";
import History from "lucide-react/dist/esm/icons/history.mjs";
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
import X from "lucide-react/dist/esm/icons/x.mjs";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { publicAsset } from "../portfolio-data";
import { ProjectLocator } from "../project-locator";
import { ZhaocaiSmartTrustSection } from "./ZhaocaiSmartTrustSection";
import "./zhaocai-smart-complete.css";

type DemoStage = "entry" | "clarify" | "running" | "result" | "timeout" | "empty" | "stopped" | "board";
type Metric = "" | "营业利润" | "利润总额" | "净利润";
type DemoScene = "clarify" | "running" | "result" | "exception";

const profitData = [
  { quarter: "一季度", value: 1.32 },
  { quarter: "二季度", value: 1.46 },
  { quarter: "三季度", value: 1.59 },
  { quarter: "四季度", value: 1.71 },
] as const;
const totalProfit = profitData.reduce((sum, item) => sum + item.value, 0);
const maxProfit = Math.max(...profitData.map(item => item.value));
const defaultQuery = "查看 2024 年全集团利润变化";

const locatorSections = [
  ["zcs-project-overview", "项目概览"],
  ["zcs-business-needs", "业务需求"],
  ["zcs-design-goals", "设计目标"],
  ["zcs-experience-journey", "任务链路"],
  ["zcs-clarification", "方案取舍"],
  ["zcs-process-feedback", "过程反馈"],
  ["zcs-original-output", "原始设计"],
  ["zcs-markdown-system", "回答规范"],
  ["zcs-board-design", "看板交互"],
  ["zcs-delivery", "交付复盘"],
] as const;

const legacyAnchors: Record<string, string> = {
  overview: "zcs-project-overview",
  strategy: "zcs-experience-journey",
  clarification: "zcs-clarification",
  process: "zcs-process-feedback",
  board: "zcs-board-design",
  markdown: "zcs-markdown-system",
  "zcs-trust-mechanism": "zcs-trust-mechanism",
};

function scrollToId(id: string, smooth = true) {
  document.getElementById(id)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
}

function Heading({ number, title, intro }: { number?: string; title: ReactNode; intro?: string }) {
  const normalizedTitle = typeof title === "string" ? title.replace(/。$/, "") : title;
  const titleLines = normalizedTitle === "从一次财务提问，建立可理解、可核对的智能问数链路"
    ? ["从一次财务提问，建立可理解、", "可核对的智能问数链路"]
    : null;
  return <header className="zc4-heading">{number ? <span className="zc4-kicker">{number}</span> : null}<h2 className={titleLines ? "is-two-line" : "is-single-line"}>{titleLines ? titleLines.map(line => <span className="zc4-title-line" key={line}>{line}</span>) : normalizedTitle}</h2>{intro ? <p>{intro}</p> : null}</header>;
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
      {!compact ? <table className="zc4-sr-only"><caption>2024 年季度净利润，单位亿元</caption><thead><tr><th>季度</th><th>净利润</th></tr></thead><tbody>{profitData.map(item => <tr key={item.quarter}><td>{item.quarter}</td><td>{item.value.toFixed(2)}</td></tr>)}</tbody></table> : null}
    </figure>
  );
}

function HeroPreview() {
  return (
    <div className="zc4-original-hero" aria-label="招财 Smart 原始首页">
      <figure><a href={publicAsset("/assets/projects/zhaocai-smart/long-image/assets/homepage-original.png")} target="_blank" rel="noreferrer"><img src={publicAsset("/assets/projects/zhaocai-smart/long-image/assets/homepage-original.png")} alt="招财 Smart 原始首页" /></a></figure>
    </div>
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
  return <div className="zc4-spec-shell">
    <header><strong>招财 Smart <span>回答规范</span></strong><div role="tablist" aria-label="回答规范视图"><button type="button" role="tab" aria-selected={mode==="scenes"} onClick={()=>switchMode("scenes")}>场景示例</button><button type="button" role="tab" aria-selected={mode==="rules"} onClick={()=>switchMode("rules")}>组件规则</button></div></header>
    <div className="zc4-spec"><aside><p>{mode === "scenes" ? "按业务任务选择" : "按内容组件选择"}</p>{items.map((option,index)=><button type="button" className={active===index?"active":""} onClick={()=>setActive(index)} key={option[0]}>{option[0]}</button>)}</aside><article><span>{mode === "scenes" ? "场景" : `TYPE-${String(active+1).padStart(2,"0")}`} / {item[0]}</span><h3>{item[1]}</h3><p><strong>{item[2]}</strong></p>{mode === "scenes" && active < 2 ? <><nav className="zc4-answer-locator" aria-label="回答章节定位"><button type="button">季度表现</button><button type="button">哪些业务贡献了增长</button><button type="button">还需要核对什么</button><button type="button">来源与说明</button></nav><table><thead><tr><th>季度</th><th>净利润（亿元）</th></tr></thead><tbody>{profitData.map(row=><tr key={row.quarter}><td>{row.quarter}</td><td>{row.value.toFixed(2)}</td></tr>)}</tbody></table></>:<div className="zc4-spec-note"><CircleHelp size={17}/><p>{mode === "rules" ? "规则、示例与验收要点保持在同一视图中，便于逐项核对。" : "结论、数据与建议分别表达；信息不足时保留条件和可执行的下一步。"}</p></div>}<footer><label><input type="checkbox" checked={annotated} onChange={event=>setAnnotated(event.target.checked)}/>显示规范标注</label><a href="#zcs-original-output">查看原始设计依据</a></footer>{annotated?<p className="zc4-annotation">规范标注：正文 14px / 24px · 标题不超过三级 · 数据与来源关联</p>:null}</article></div>
  </div>;
}

const legacySpecStyles = [
  "zhaocai-smart-04.css",
  "zhaocai-smart-tokens.css",
  "zhaocai-smart-case.css",
  "zhaocai-smart-ui-evidence.css",
  "zhaocai-smart-demo-viewport.css",
] as const;

async function runLocalScript(src: string, force = false) {
  let current = document.querySelector<HTMLScriptElement>(`script[data-zc4-runtime="${src}"]`);
  if (force && current) { current.remove(); current = null; }
  if (current?.dataset.loaded === "true") return;
  await new Promise<void>((resolve, reject) => {
    const script = current ?? document.createElement("script");
    const onLoad = () => { script.dataset.loaded = "true"; resolve(); };
    const onError = () => reject(new Error("交互资源加载失败"));
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
    if (!current) {
      script.src = src;
      script.dataset.zc4Runtime = src;
      document.head.appendChild(script);
    }
  });
}

function LegacyAnswerWorkbench() {
  const [markup, setMarkup] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const bundle = publicAsset("/assets/projects/zhaocai-smart/long-image");
  useEffect(() => {
    let cancelled = false;
    void fetch(`${bundle}/index.html`, { cache: "no-store" }).then(response => {
      if (!response.ok) throw new Error(`完整规范加载失败（${response.status}）`);
      return response.text();
    }).then(source => {
      const parsed = new DOMParser().parseFromString(source, "text/html");
      const section = parsed.querySelector<HTMLElement>("#zcs-markdown-system");
      if (!section) throw new Error("未找到完整回答规范组件");
      section.id = "zcs-markdown-workbench";
      section.querySelector(".zmd-heading")?.remove();
      section.querySelector(".zmd-benefits")?.remove();
      section.querySelector(".zmd-contract")?.remove();
      section.querySelector("noscript")?.remove();
      if (!cancelled) setMarkup(section.outerHTML);
    }).catch(reason => { if (!cancelled) setError(reason instanceof Error ? reason.message : "完整规范加载失败"); });
    return () => { cancelled = true; };
  }, [bundle]);
  useEffect(() => {
    if (!markup) return;
    setReady(false);
    void (async () => {
      try {
        await runLocalScript(`${bundle}/vendor/marked.umd.js`);
        await runLocalScript(`${bundle}/zhaocai-smart-04-data.js`);
        await runLocalScript(`${bundle}/zhaocai-smart-04.js`, true);
        setReady(true);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "完整规范交互加载失败");
      }
    })();
  }, [bundle, markup]);
  return <div className={`zc4-legacy-spec${error ? " is-fallback" : ready ? " is-ready" : " is-loading"}`}>
    {legacySpecStyles.map(file=><link rel="stylesheet" href={`${bundle}/${file}?v=20261005-approved`} key={file}/>)}
    {error ? <><p className="zc4-spec-load" role="alert">完整规范暂未加载，已显示可用摘要。</p><SummarySpecWorkbench/></> : null}
    {!ready && !error ? <p className="zc4-spec-load" role="status">正在加载完整回答规范…</p> : null}
    {markup && !error ? <div dangerouslySetInnerHTML={{ __html: markup }}/> : null}
  </div>;
}

function SpecWorkbench() {
  return <iframe className="zc4-spec-frame" src={publicAsset("/assets/projects/zhaocai-smart/long-image/spec-workbench.html")} title="招财 Smart 完整回答规范与场景演示" loading="lazy"/>;
}

type BoardCard = { id: string; title: string; kind: "metric" | "chart" | "table"; merged?: BoardCard[] };
const initialBoardCards: BoardCard[] = [
  { id: "total", title: "全年净利润", kind: "metric" },
  { id: "trend", title: "季度净利润趋势", kind: "chart" },
  { id: "detail", title: "季度明细", kind: "table" },
];

function BoardCardContent({ card }: { card: BoardCard }) {
  if (card.kind === "metric") return <p className="zc4-board-total"><strong>6.08</strong> 亿元</p>;
  if (card.kind === "chart") return <ProfitChart compact/>;
  return <DataTable/>;
}

function BoardDesignDemo() {
  const [cards, setCards] = useState<BoardCard[]>(initialBoardCards);
  const [selected, setSelected] = useState<string | null>(null);
  const [mergePair, setMergePair] = useState<[string,string] | null>(null);
  const [undo, setUndo] = useState<BoardCard[] | null>(null);
  const [notice, setNotice] = useState("");
  const move = (index: number, direction: -1 | 1) => { const target=index+direction; if(target<0||target>=cards.length)return; const next=[...cards]; [next[index],next[target]]=[next[target],next[index]]; setUndo(cards); setCards(next); setNotice("已调整卡片顺序。"); };
  const askMerge = (id: string) => { if(!selected){setSelected(id);setNotice("已选择卡片，请选择另一张卡片合并。");return;} if(selected===id){setSelected(null);setNotice("已取消选择。");return;} setMergePair([selected,id]); };
  const confirmMerge = () => { if(!mergePair)return; const [first,second]=mergePair; const before=cards; const chosen=cards.filter(card=>card.id===first||card.id===second); const merged:BoardCard={id:`merged-${first}-${second}`,title:"经营分析合集",kind:"chart",merged:chosen}; setCards([merged,...cards.filter(card=>card.id!==first&&card.id!==second)]); setUndo(before); setSelected(null); setMergePair(null); setNotice("已合并 2 张卡片，内容已保留在同一合集内。"); };
  const reset = () => { setCards(initialBoardCards); setSelected(null); setMergePair(null); setUndo(null); setNotice("已重置为初始示例。"); };
  return <div className="zc4-board-demo"><header><div><strong>招财 Smart</strong><span>集团经营看板</span></div><div className="zc4-chips"><span>2024 年</span><span>全集团</span><span>净利润</span></div><button type="button" onClick={()=>setNotice("当前示例没有其他可添加项。")}><Plus size={15}/>添加卡片</button></header><div className="zc4-board-cards">{cards.map((card,index)=><article className={`${selected===card.id?"selected":""}${card.merged?" is-merged":""}`} key={card.id}><div className="zc4-card-toolbar"><span>{card.title}</span><div><button type="button" disabled={index===0} onClick={()=>move(index,-1)} aria-label={`上移${card.title}`}>↑</button><button type="button" disabled={index===cards.length-1} onClick={()=>move(index,1)} aria-label={`下移${card.title}`}>↓</button>{card.merged?<span className="zc4-merged-status">已合并</span>:<button type="button" aria-pressed={selected===card.id} onClick={()=>askMerge(card.id)}>{selected===card.id?"取消":selected?"合并到这里":"合并"}</button>}</div></div>{card.merged?<div className="zc4-merged">{card.merged.map(item=><section key={item.id}><h4>{item.title}</h4><BoardCardContent card={item}/></section>)}</div>:<BoardCardContent card={card}/>}</article>)}</div><footer><p aria-live="polite">{notice || "选择一张卡片后，再选择目标卡片；确认后可撤销。"}</p><div>{undo?<button type="button" onClick={()=>{setCards(undo);setUndo(null);setNotice("已撤销上一步操作。");}}><RotateCcw size={14}/>撤销</button>:null}<button type="button" onClick={reset}>重置</button></div></footer>{mergePair?<div className="zc4-board-confirm" role="dialog" aria-modal="true" aria-labelledby="merge-title"><section><h3 id="merge-title">合并这两张卡片？</h3><p>将“{cards.find(card=>card.id===mergePair[0])?.title}”和“{cards.find(card=>card.id===mergePair[1])?.title}”整理到同一合集，保留各自的查询条件与数据依据。</p><footer><button type="button" onClick={()=>{setMergePair(null);setSelected(null);setNotice("已取消合并。");}}>取消</button><button type="button" className="zc4-primary" onClick={confirmMerge}>确认合并</button></footer></section></div>:null}</div>;
}

type DemoProps = {
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
  beginExecution: (retry?: boolean) => void;
  runFromEntry: () => void;
};

function ProductDemo({ stage, setStage, query, setQuery, metric, setMetric, year, setYear, scope, setScope, phase, executionId, beginExecution, runFromEntry }: DemoProps) {
  const [editing, setEditing] = useState(false);
  const [metricNote, setMetricNote] = useState<Metric>("");
  const [view, setView] = useState<"chart"|"table">("chart");
  const [evidence, setEvidence] = useState(false);
  const [showProcess, setShowProcess] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveName, setSaveName] = useState("2024 年集团净利润分析");
  const evidenceButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!saveOpen && !tableOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSaveOpen(false);
      setTableOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [saveOpen, tableOpen]);

  const confirmMetric = () => {
    if (!metric) return;
    if (metric !== "净利润" || year !== "2024" || scope !== "全集团") { setStage("empty"); return; }
    beginExecution();
  };
  const closeEvidence = () => { setEvidence(false); requestAnimationFrame(() => evidenceButton.current?.focus()); };

  return (
    <div className="zc4-product">
      <div className="zc4-product-main">
        <header className="zc4-topbar"><div><span>智能问数</span><i>/</i><strong>集团年度利润分析</strong></div></header>
        {stage==="entry" ? <section className="zc4-entry"><div className="brand"><Sparkles size={20}/>招财 Smart</div><h3>想了解哪些经营数据？</h3><p>请尽量包含时间、组织范围和分析指标。</p><label>输入问题<textarea value={query} onChange={event=>setQuery(event.target.value)} placeholder="例如：查看 2024 年全集团利润变化。"/></label><button className="zc4-primary" type="button" onClick={runFromEntry}><Play size={16}/>发起查询</button></section>:null}
        {stage==="clarify" ? <section className="zc4-clarify"><div className="main"><div className="question"><span>你的问题</span><p>{query}</p></div><div className="brand"><Sparkles size={19}/>招财 Smart</div><h3>你想查看哪一种利润？</h3><p>「利润」可能对应多个指标，请选择本次统计口径。</p><fieldset><legend className="zc4-sr-only">选择利润口径</legend>{(["营业利润","利润总额","净利润"] as Metric[]).map(option=><label className={metric===option?"active":""} key={option}><input type="radio" name="metric" value={option} checked={metric===option} onChange={()=>setMetric(option)}/><span>{option}</span><button type="button" onClick={event=>{event.preventDefault();setMetricNote(metricNote===option?"":option)}}>口径说明<ArrowUpRight size={13}/></button>{metricNote===option?<small>演示说明：具体定义以企业指标字典为准。</small>:null}</label>)}</fieldset><p className="footnote">选择后将按该指标查询，不会更改其他条件。</p><div className="actions"><button className="zc4-primary" type="button" disabled={!metric} onClick={confirmMetric}>{metric?`按${metric}查询`:"选择口径后继续"}</button></div></div><aside className="conditions"><h4>已识别条件</h4><dl><div><dt>统计时间</dt><dd>{year} 年</dd></div><div><dt>组织范围</dt><dd>{scope}</dd></div><div><dt>指标口径</dt><dd><i className={metric?"ready":""}/>{metric?`${metric} · 待确认`:"待确认"}</dd></div></dl><button type="button" onClick={()=>setEditing(!editing)}><Pencil size={15}/>修改已识别条件</button>{editing?<div className="editor"><label>统计年份<select value={year} onChange={e=>{setYear(e.target.value);setMetric("")}}><option>2024</option><option>2023</option></select></label><label>组织范围<select value={scope} onChange={e=>{setScope(e.target.value);setMetric("")}}><option>全集团</option><option>集团本部</option></select></label><button type="button" onClick={()=>setEditing(false)}>完成修改</button></div>:null}<div className="source"><Database size={15}/><span>查询数据<strong>集团经营指标表（示例）</strong></span></div></aside></section>:null}
        {stage==="running" ? <section className="zc4-running" aria-live="polite"><header><div><span>正在查询数据</span><h3>2024 年集团净利润分析</h3><p>已保留本次查询条件。</p></div><LoaderCircle className="spin" size={28}/></header><div className="zc4-condition-chips"><span>{year} 年</span><span>{scope}</span><span>净利润 · 用户已确认</span></div><ol>{["理解问题","查询数据","生成结果"].map((label,index)=><li className={index<phase?"done":index===phase?"current":""} key={label}><span>{index<phase?<Check size={16}/>:index===phase?<LoaderCircle className="spin" size={16}/>:index+1}</span><div><strong>{label}</strong><p>{index===0?"整理时间、组织与指标条件":index===1?"正在查询集团经营指标表":"组织图表、解释与查询快照"}</p></div></li>)}</ol><footer><p>查询仍在进行，你可以继续等待或停止本次查询。</p><button type="button" onClick={()=>setStage("stopped")}><Square size={14}/>停止查询</button></footer></section>:null}
        {stage==="result" ? <div className={`zc4-result-layout${evidence?" with-evidence":""}`}><section className="zc4-result"><header><div><h3>2024 年集团净利润分析</h3><div className="zc4-condition-chips"><span>{year} 年</span><span>{scope}</span><span>净利润 · 用户已确认</span><button type="button" onClick={()=>{setMetric("");setStage("clarify")}}><Pencil size={14}/>修改条件</button></div></div><button className="zc4-primary" type="button" onClick={()=>setSaveOpen(true)}><Save size={16}/>保存到看板</button></header><div className="zc4-complete"><span><Check size={14}/>理解问题</span><span><Check size={14}/>查询数据</span><span><Check size={14}/>生成结果</span><button type="button" aria-expanded={showProcess} onClick={()=>setShowProcess(!showProcess)}>查看过程<ChevronDown size={14}/></button></div>{showProcess?<div className="zc4-process"><span><Check size={14}/>理解问题：时间、组织与指标已对齐</span><span><Check size={14}/>查询数据：返回 4 条季度汇总数据</span><span><Check size={14}/>生成结果：已关联查询快照</span></div>:null}<article className="zc4-result-card"><p className="total">全年净利润 <strong>{totalProfit.toFixed(2)}</strong> 亿元</p><p>四个季度净利润逐季上升，四季度为 1.71 亿元。</p><small>增长原因仍需结合业务明细核对。</small><div className="view-tabs" role="tablist"><button type="button" role="tab" aria-selected={view==="chart"} onClick={()=>setView("chart")}><BarChart3 size={14}/>图表</button><button type="button" role="tab" aria-selected={view==="table"} onClick={()=>setView("table")}><Table2 size={14}/>表格</button></div>{view==="chart"?<ProfitChart/>:<DataTable/>}<footer><span><FileText size={15}/>集团经营指标表（示例）</span><button ref={evidenceButton} type="button" onClick={()=>setEvidence(true)}>查看口径与数据依据<ArrowUpRight size={14}/></button></footer></article>{saved?<div className="zc4-saved-note"><Check size={16}/>已保存到「集团经营分析」<button type="button" onClick={()=>setStage("board")}>查看看板</button></div>:null}</section>{evidence?<aside className="zc4-evidence" aria-label="本次查询依据"><header><h3>本次查询依据</h3><button type="button" aria-label="关闭查询依据" onClick={closeEvidence}><X size={18}/></button></header><label>执行版本<select defaultValue={Math.max(1,executionId)}>{executionId>1?<option value="1">第 1 次执行 · 查询超时</option>:null}<option value={Math.max(1,executionId)}>第 {Math.max(1,executionId)} 次执行 · 已完成</option></select></label><dl><div><dt>统计范围</dt><dd>2024.01.01—2024.12.31<br/>全集团 · 按季度汇总</dd></div><div><dt>指标确认</dt><dd>利润 → 净利润<br/>由用户确认</dd></div><div><dt>数据来源</dt><dd>集团经营指标表（示例）</dd></div><div><dt>返回数据</dt><dd>4 条季度汇总数据</dd></div></dl><button type="button" onClick={()=>setTableOpen(true)}><Table2 size={15}/>查看本次原始表格<ExternalLink size={13}/></button><p>快照保留本次条件，修改条件将发起新查询。</p></aside>:null}</div>:null}
        {(["timeout","empty","stopped"] as DemoStage[]).includes(stage)?<section className="zc4-exception"><span>{stage==="timeout"?<Clock3 size={24}/>:stage==="empty"?<Database size={24}/>:<Square size={22}/>}</span><div><h3>{stage==="timeout"?"查询暂未完成":stage==="empty"?(metric&&metric!=="净利润"?"该条件暂无演示数据":"当前条件下没有找到匹配数据"):"查询已停止"}</h3><p>{stage==="timeout"?"本次条件已保留，你可以重新查询。":stage==="empty"?"请检查统计时间、组织范围或指标口径后重试。":"已保留本次查询条件。"}</p><div>{stage!=="empty"?<button className="zc4-primary" type="button" onClick={()=>beginExecution(true)}><RotateCcw size={15}/>重新查询</button>:null}<button type="button" onClick={()=>{setMetric("");setStage(stage==="stopped"?"entry":"clarify")}}>{stage==="empty"?"修改范围":stage==="stopped"?"修改问题":"修改条件"}</button></div></div></section>:null}
        {stage==="board"?<section className="zc4-board"><header><div><LayoutDashboard size={20}/><h3>我的看板</h3></div><button type="button" onClick={()=>setStage("result")}>返回原任务</button></header>{saved?<><div className="success"><Check size={16}/>已保存到「集团经营分析」</div><article><div><h4>{saveName}</h4><p>2024 年 / 全集团 / 净利润</p><span><Database size={14}/>集团经营指标表（示例）</span></div><button type="button" onClick={()=>{setStage("result");setEvidence(true)}}>打开分析<ArrowUpRight size={14}/></button></article></>:<div className="empty"><LayoutDashboard size={28}/><h4>还没有保存的分析</h4><p>在结果页保存后，结果与查询上下文会一起保留。</p></div>}</section>:null}
      </div>
      {saveOpen?<div className="zc4-dialog-backdrop"><section className="zc4-dialog" role="dialog" aria-modal="true" aria-labelledby="save-title"><header><h3 id="save-title">保存到看板</h3><button type="button" aria-label="关闭保存对话框" onClick={()=>setSaveOpen(false)}><X size={18}/></button></header><label>结果名称<input value={saveName} onChange={e=>setSaveName(e.target.value)}/></label><label>选择看板<select><option>集团经营分析（示例）</option></select></label><p>同时保存本次结果、查询条件与数据来源。</p><footer><button type="button" onClick={()=>setSaveOpen(false)}>取消</button><button className="zc4-primary" type="button" onClick={()=>{setSaved(true);setSaveOpen(false)}}>保存</button></footer></section></div>:null}
      {tableOpen?<div className="zc4-dialog-backdrop"><section className="zc4-dialog table" role="dialog" aria-modal="true" aria-labelledby="table-title"><header><div><span>第 {Math.max(1,executionId)} 次执行 · 示例数据</span><h3 id="table-title">集团经营指标表</h3></div><button type="button" aria-label="关闭原始表格" onClick={()=>setTableOpen(false)}><X size={18}/></button></header><DataTable/><p>图表、合计与查询快照使用同一份返回数据。</p></section></div>:null}
    </div>
  );
}

function DataTable() {
  return <table className="zc4-table"><caption>2024 年季度净利润</caption><thead><tr><th>季度</th><th>组织范围</th><th>净利润（亿元）</th></tr></thead><tbody>{profitData.map(item=><tr key={item.quarter}><td>{item.quarter}</td><td>全集团</td><td>{item.value.toFixed(2)}</td></tr>)}</tbody><tfoot><tr><th colSpan={2}>全年合计</th><td>{totalProfit.toFixed(2)}</td></tr></tfoot></table>;
}

export function ZhaocaiSmartCompleteCase() {
  const [stage, setStage] = useState<DemoStage>("clarify");
  const [query, setQuery] = useState(defaultQuery);
  const [metric, setMetric] = useState<Metric>("");
  const [year, setYear] = useState("2024");
  const [scope, setScope] = useState("全集团");
  const [phase, setPhase] = useState(0);
  const [executionId, setExecutionId] = useState(0);
  const [scene, setScene] = useState<DemoScene>("clarify");
  const demoRef = useRef<HTMLDivElement>(null);

  const beginExecution = (retry = false) => { setMetric("净利润"); setExecutionId(current => retry ? Math.max(2,current+1) : Math.max(1,current)); setPhase(0); setStage("running"); };
  const runFromEntry = () => { if(query.includes("净利润")) { setYear("2024"); setScope("全集团"); beginExecution(); } else if(query.includes("利润")){setYear("2024");setScope("全集团");setMetric("");setStage("clarify")} else setStage("empty"); };
  const setDemo = (next: DemoScene) => { setScene(next); if(next==="clarify"){setQuery(defaultQuery);setYear("2024");setScope("全集团");setMetric("");setStage("clarify")} else if(next==="running"){setYear("2024");setScope("全集团");beginExecution()} else if(next==="result"){setYear("2024");setScope("全集团");setMetric("净利润");setExecutionId(current=>Math.max(1,current));setStage("result")} else {setYear("2024");setScope("全集团");setExecutionId(current=>Math.max(1,current));setStage("timeout")} requestAnimationFrame(()=>demoRef.current?.scrollIntoView({behavior:"smooth",block:"start"})); };

  useEffect(()=>{ if(stage!=="running") return; const timers=[setTimeout(()=>setPhase(1),420),setTimeout(()=>setPhase(2),820),setTimeout(()=>setStage("result"),1260)]; return()=>timers.forEach(clearTimeout); },[stage,executionId]);

  useEffect(() => {
    const backLink = document.querySelector<HTMLAnchorElement>(".zc4-page-footer a:last-child");
    if (backLink) backLink.href = `${window.__PORTFOLIO_BASE__ ?? "/portfolio"}/#work`;
  }, []);

  const demoProps: DemoProps={stage,setStage,query,setQuery,metric,setMetric,year,setYear,scope,setScope,phase,executionId,beginExecution,runFromEntry};
  return (
    <article className="zc4" aria-label="招财 Smart 完整项目案例">
      <ProjectLocator sections={locatorSections} legacyAnchors={legacyAnchors} ariaLabel="招财 Smart 项目章节定位" />
      <header className="zc4-hero"><div><p className="zc4-eyebrow">01 / 项目概览</p><h1>招财 Smart</h1><p className="zc4-subtitle">财务智能化平台</p></div><HeroPreview/></header>
      <main>
        <section className="zc4-section" id="zcs-project-overview"><Heading title="从一次财务提问，建立可理解、可核对的智能问数链路。" intro="面向集团内部的经营分析任务，让业务人员在同一任务中完成提问、口径确认、查询执行、结果核对与内容复用。"/><dl className="zc4-project-meta"><div><dt>项目周期</dt><dd>2025.07—2025.11</dd></div><div><dt>产品形态</dt><dd>AI 财务智能问数 / Web</dd></div><div><dt>我的角色</dt><dd>UX/UI 设计</dd></div><div><dt>项目状态</dt><dd>已上线</dd></div></dl><div className="zc4-contribution"><h3>我的贡献</h3><p>我负责智能问数核心体验的 UX/UI 设计，把提问、确认、执行、解释和沉淀组织为一条连续、可核对的任务链路。</p><div className="zc4-thirds">{[["语义澄清","确认歧义口径，减少不必要的澄清往返。"],["过程反馈","说明执行状态，帮助用户理解当前进展。"],["看板交互","整理查询结果，便于浏览、对比与核对。"],["输出规范","统一内容表达，支持后续复用与分享。"]].map(item=><article key={item[0]}><h3>{item[0]}</h3><p>{item[1]}</p></article>)}</div></div></section>
        <section className="zc4-section" id="zcs-business-needs"><Heading number="02 / 集团内部用户与业务需求" title="同在集团内部，不同任务需要不同的信息。" intro="围绕查数、核数与用数，拆解角色与任务。"/><div className="zc4-role-table" role="table" aria-label="集团内部角色与任务"><div role="row"><strong role="columnheader">角色</strong><strong role="columnheader">主要任务</strong><strong role="columnheader">需要的信息与支持</strong></div>{[["财务人员","核对指标、期间与范围","口径准确，来源可追溯"],["经营分析人员","查看趋势、整理结果","结果可比较，内容可复用"],["业务负责人","理解结论、支持判断","重点清晰，按需查看依据"]].map(row=><div role="row" key={row[0]}>{row.map(cell=><span role="cell" key={cell}>{cell}</span>)}</div>)}</div><div className="zc4-task-example"><strong>查看 2024 年集团利润变化</strong><span>2024 年</span><span>集团</span><span>利润口径待确认</span><p>问题需要对齐口径，等待需要反馈，结果需要核对与整理。</p></div></section>
        <section className="zc4-section" id="zcs-design-goals"><Heading number="03 / 设计目标" title="让问题可确认，过程可理解，结果可复用。"/><div className="zc4-thirds">{[["对齐业务含义","仅确认有歧义的条件，保留已识别的信息。","条件摘要 / 歧义选项 / 修改入口"],["建立过程反馈","说明系统正在处理什么，并提供恢复入口。","当前阶段 / 等待说明 / 恢复操作"],["支持结果复用","将结果、条件与依据组织成可持续使用的内容。","查询快照 / 原始表格 / 看板复用"]].map(item=><article key={item[0]}><h3>{item[0]}</h3><p>{item[1]}</p><span>{item[2]}</span></article>)}</div></section>
        <section className="zc4-section" id="zcs-experience-journey">
          <Heading number="04 / 任务链路与可信机制" title="用一个问题，贯穿完整的问数任务。" intro="以“查看 2024 年全集团利润变化”为例，连接提问、确认、执行、解释与结果复用。"/>
          <ol className="zc4-flow zc4-flow-seven">{[["提出问题","自然语言描述需求"],["识别条件","整理时间、范围与指标"],["确认口径","确认“净利润”"],["执行查询","呈现阶段与恢复操作"],["解释结果","先结论，再图表与依据"],["核对依据","还原条件与快照"],["沉淀复用","保存到看板持续使用"]].map((item,index)=><li key={item[0]}><span>{String(index+1).padStart(2,"0")}</span><strong>{item[0]}</strong><p>{item[1]}</p></li>)}</ol>
          <div className="zc4-trust" id="zcs-trust-mechanism"><header><h3>可信机制的建立</h3></header><a href={publicAsset("/assets/projects/zhaocai-smart/long-image/zhaocai-smart-framework-restored.png")} target="_blank" rel="noreferrer"><img src={publicAsset("/assets/projects/zhaocai-smart/long-image/zhaocai-smart-framework-restored.png")} width="3360" height="1680" loading="lazy" decoding="async" alt="可信机制框架：问题背景、设计决策与价值目标的完整对应关系"/></a></div>
          <div className="zc4-animated-flow"><ZhaocaiSmartTrustSection flowOnly/></div>
        </section>
        <section className="zc4-section" id="zcs-clarification"><span className="zc4-anchor" id="strategy"/><Heading number="05 / 关键方案与取舍" title="先确认口径，再开始查询。"/><div className="zc4-option-compare"><article><span>方案 A · 开放追问</span><h3>你想查看哪种利润？</h3><div className="zc4-static-input">请输入补充说明。</div><p>还无法形成明确候选时，允许用户继续描述需求。</p><strong>取舍：需要用户重新组织语言，明确候选已存在时会增加一次表达成本。</strong></article><article className="adopted"><span>方案 B · 候选确认（采用）</span><h3>选择利润口径</h3><div className="zc4-choice-preview"><span>2024 年</span><span>集团</span><label><i/>净利润</label><label><i/>利润总额</label><button type="button" onClick={()=>setDemo("clarify")}>确认并查询</button></div><p>候选明确时用选择，无法匹配时保留“都不是，补充说明”。</p><strong>只确认影响查询的歧义项，不要求重复填写已识别的时间与范围。</strong></article></div></section>
        <section className="zc4-section zc4-subsection" id="zcs-core-interaction"><span className="zc4-anchor" id="clarification"/><Heading title="从口径确认，进入完整问数任务"/><div className="zc4-demo" ref={demoRef}><header><div><span>前端交互演示 · 示例数据</span><strong>完整任务</strong></div><div role="group">{([['clarify','口径确认'],['running','等待超过 10 秒'],['result','顺利完成查询'],['exception','异常恢复']] as [DemoScene,string][]).map(([id,label])=><button type="button" className={scene===id?"active":""} aria-pressed={scene===id} onClick={()=>setDemo(id)} key={id}>{label}</button>)}</div></header>{scene==="exception"?<div className="zc4-exception-tabs"><button type="button" onClick={()=>setStage("timeout")}>查询超时与重试</button><button type="button" onClick={()=>setStage("empty")}>未查到匹配数据</button><button type="button" onClick={()=>setStage("stopped")}>停止并保留条件</button></div>:null}<ProductDemo {...demoProps}/></div></section>
        <section className="zc4-section" id="zcs-process-feedback"><span className="zc4-anchor" id="process"/><Heading number="06 / 过程反馈与流程留痕" title="执行时看见进展，结束后查得到记录。" intro="将处理过程收拢为三个可读阶段，保留条件确认、数据来源与每次执行记录。"/><div className="zc4-waits">{[["0—3 秒","及时响应","立即显示当前阶段，已返回的内容先呈现。"],["3—10 秒","保留进行状态","突出当前执行步骤，用骨架屏预留数据位置。"],["10 秒以上","说明等待情况","说明查询仍在进行，提供停止操作，保留已确认条件。"]].map(item=><article key={item[0]}><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p></article>)}</div><div className="zc4-exception-list">{[["查询超时","保留条件，从失败步骤重新查询。","timeout"],["没有匹配数据","调整统计范围，不显示伪零值。","empty"],["流程留痕","条件、操作、数据与结果关联到每次执行。","result"]].map((item,index)=><article key={item[0]}>{index===0?<AlertTriangle size={20}/>:index===1?<Database size={20}/>:<History size={20}/>}<div><h3>{item[0]}</h3><p>{item[1]}</p></div><button type="button" onClick={()=>{setDemo(index===2?"result":"exception");setStage(item[2] as DemoStage)}}>查看状态</button></article>)}</div></section>
        <section className="zc4-section" id="zcs-original-output"><Heading number="07 / 原始设计稿" title="完成输出后的记录与数据入口。" intro="过程节点、业务数据与原始表格入口在同一条任务记录中保留。"/><figure className="zc4-original-output"><a href={publicAsset("/assets/projects/zhaocai-smart/long-image/assets/completed-output-original.png")} target="_blank" rel="noreferrer"><img src={publicAsset("/assets/projects/zhaocai-smart/long-image/assets/completed-output-original-cropped.png")} width="1164" height="1944" alt="招财 Smart 完成输出后的完整原始设计稿，包含全过程、业务数据表和原始表格入口" loading="lazy"/></a><figcaption>完整原图 · 点击放大查看。原图属于另一条历史业务示例，保留原有脱敏内容。</figcaption></figure></section>
        <section className="zc4-section" id="zcs-markdown-system"><Heading number="08 / 回答规范与场景演示" title="为不同业务场景，建立统一的回答规范。"/><div className="zc4-thirds">{[["把内容与样式分开","同一份内容遵循同一套排版，减少逐页调整。"],["让输出规则可复用","把标题、口径和来源约定写进模板，适配不同任务。"],["让交付有共同依据","以可读文本保留结构，便于内容复核与持续维护。"]].map(item=><article key={item[0]}><h3>{item[0]}</h3><p>{item[1]}</p></article>)}</div><SpecWorkbench/><div className="zc4-contracts"><article><FileText size={20}/><h3>内容约定</h3><p>结论、依据、建议与数据缺口。</p></article><article><LayoutDashboard size={20}/><h3>呈现约定</h3><p>统一字号、间距、表格与引用。</p></article><article><Database size={20}/><h3>交付约定</h3><p>规范、完整示例与数据一起维护。</p></article></div></section>
        <section className="zc4-section" id="zcs-board-design"><span className="zc4-anchor" id="board"/><Heading number="09 / 看板交互设计" title="整理进看板，让操作意图清晰可见。" intro="排序用插入线，合并用目标容器；确认后仍可撤销。"/><BoardDesignDemo/></section>
        <section className="zc4-section zc4-delivery" id="zcs-delivery"><Heading number="10 / 交付与复盘" title="从单次回答，到可持续核对的智能问数体验。"/><div className="zc4-delivery-scope">{[["查询前","识别歧义，确认影响结果的业务口径。"],["执行中","呈现处理阶段，覆盖等待、超时和无数据状态。"],["结果后","关联条件、数据来源、查询快照与看板复用。"],["跨场景","统一回答内容层级、数据表达和引用规则。"]].map(item=><article key={item[0]}><strong>{item[0]}</strong><p>{item[1]}</p></article>)}</div><div className="zc4-validation"><h3>沿着同一项任务，检查方案是否成立。</h3><ol><li><strong>能否选对口径？</strong>理解指标、期间与范围，避免查询条件误选。</li><li><strong>能否找到依据？</strong>从结果回到条件与来源，支持再次核对。</li><li><strong>能否恢复误操作？</strong>区分排序与合并，保留撤销入口。</li></ol></div><blockquote>AI 产品的可信感，来自用户能否理解系统识别了什么、正在处理什么，以及结果依据来自哪里。</blockquote><footer className="zc4-page-footer"><a href="#zcs-original-output" onClick={event=>{event.preventDefault();scrollToId("zcs-original-output")}}>原始设计稿</a><a href={publicAsset("/portfolio/#work")}>返回作品</a></footer></section>
      </main>
    </article>
  );
}
