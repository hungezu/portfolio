"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import Bot from "lucide-react/dist/esm/icons/bot.mjs";
import CheckCircle2 from "lucide-react/dist/esm/icons/circle-check.mjs";
import Expand from "lucide-react/dist/esm/icons/expand.mjs";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw.mjs";
import X from "lucide-react/dist/esm/icons/x.mjs";
import { publicAsset } from "../portfolio-data";
import "./zhaocai-smart-v2.css";

const profitExample = {
  isExample: true,
  year: 2024,
  comparisonYear: 2023,
  metric: "净利润",
  scope: "全集团",
  unit: "万元",
  sourceLabel: "年度经营数据（示例）",
  periodStart: "2024-01-01",
  periodEnd: "2024-12-31",
  quarters: [
    { quarter: "Q1", current: 1200, previous: 1000 },
    { quarter: "Q2", current: 1500, previous: 1250 },
    { quarter: "Q3", current: 1800, previous: 1600 },
    { quarter: "Q4", current: 2100, previous: 1750 },
  ],
  organizations: [
    { name: "组织 A", value: 2700 },
    { name: "组织 B", value: 2200 },
    { name: "组织 C", value: 1700 },
  ],
} as const;

const currentTotal = profitExample.quarters.reduce((sum, item) => sum + item.current, 0);
const previousTotal = profitExample.quarters.reduce((sum, item) => sum + item.previous, 0);
const yearOnYear = (currentTotal / previousTotal - 1) * 100;
const q4OnYear = (profitExample.quarters[3].current / profitExample.quarters[3].previous - 1) * 100;
const numberFormat = new Intl.NumberFormat("zh-CN");
const formatAmount = (value: number) => `${numberFormat.format(value)} ${profitExample.unit}`;

const locatorSections = [
  ["overview", "项目概览"],
  ["strategy", "问题策略"],
  ["core", "核心交互"],
  ["markdown", "输出规范"],
  ["gallery", "页面总览"],
] as const;

const journey = ["提问", "澄清", "执行", "解释", "沉淀"];
const processSteps = [
  { title: "理解问题", text: "识别意图与已知条件" },
  { title: "检索数据", text: "匹配指标与数据来源" },
  { title: "分析处理", text: "聚合季度数据并校验" },
  { title: "组织结果", text: "编排结论、图表与依据" },
  { title: "完成", text: "查看结果或保存到看板" },
] as const;

const strategyItems = [
  { phase: "提问", title: "先确认利润口径", text: "“利润”指净利润，还是利润总额？", kind: "clarify" },
  { phase: "执行", title: "让等待有迹可循", text: "告诉用户当前步骤，以及接下来能做什么。", kind: "process" },
  { phase: "结果", title: "保存为后续分析入口", text: "常看的查询结果，可以再次找到并继续使用。", kind: "save" },
] as const;

const markdownTabs = ["标题", "正文", "表格", "引用", "公式", "代码"] as const;
type MarkdownTab = (typeof markdownTabs)[number];
type ClarifyStage = "recognizing" | "pending" | "confirmed";
type ProcessVariant = "running" | "complete" | "empty";
type BoardMode = "separate" | "merged";
type BoardCardId = "quarter" | "organization" | "summary";
type LightboxItem = { src: string; alt: string; title: string };

const boardCardNames: Record<BoardCardId, string> = {
  quarter: "2024 年集团净利润季度趋势",
  organization: "2024 年各组织净利润对比",
  summary: "2024 年集团净利润",
};

function SectionHeading({ number, name, title, description }: { number: string; name: string; title: ReactNode; description: string }) {
  return (
    <header className="zcv2-section-heading">
      <p><span>{number}</span> / {name}</p>
      <h2>{title}</h2>
      <div>{description}</div>
    </header>
  );
}

function Conditions({ compact = false }: { compact?: boolean }) {
  return (
    <dl className={`zcv2-conditions${compact ? " is-compact" : ""}`} aria-label="当前查询条件">
      <div><dt>年份</dt><dd>{profitExample.year} 年</dd></div>
      <div><dt>指标</dt><dd>{profitExample.metric}</dd></div>
      <div><dt>范围</dt><dd>{profitExample.scope}</dd></div>
      <div><dt>数据</dt><dd>示例数据</dd></div>
    </dl>
  );
}

function StrategyMini({ kind }: { kind: (typeof strategyItems)[number]["kind"] }) {
  if (kind === "clarify") {
    return (
      <div className="zcv2-strategy-mini is-clarify" aria-label="利润口径候选项示意">
        <span>请确认利润口径</span>
        <div><b>净利润</b><b>利润总额</b></div>
        <small>只补充会影响结果的条件</small>
      </div>
    );
  }
  if (kind === "process") {
    return (
      <div className="zcv2-strategy-mini is-process" aria-label="执行步骤与状态示意">
        {processSteps.slice(0, 4).map((step, index) => <i className={index < 2 ? "done" : index === 2 ? "active" : ""} key={step.title}><span>{index + 1}</span><b>{step.title}</b></i>)}
      </div>
    );
  }
  return (
    <div className="zcv2-strategy-mini is-save" aria-label="保存到看板示意">
      <CheckCircle2 size={20} />
      <div><b>已保存到看板</b><span>2024 年 / 净利润 / 全集团</span></div>
      <small>查看看板</small>
    </div>
  );
}

function QuarterTrendChart({ compact = false }: { compact?: boolean }) {
  const chartHeight = 210;
  const top = 24;
  const bottom = 166;
  const min = 800;
  const max = 2200;
  const y = (value: number) => bottom - ((value - min) / (max - min)) * (bottom - top);
  const x = (index: number) => 76 + index * 142;
  const currentPoints = profitExample.quarters.map((item, index) => `${x(index)},${y(item.current)}`).join(" ");
  const previousPoints = profitExample.quarters.map((item, index) => `${x(index)},${y(item.previous)}`).join(" ");
  return (
    <svg className={`zcv2-chart${compact ? " is-compact" : ""}`} viewBox={`0 0 580 ${chartHeight}`} role="img" aria-label="2024 年与 2023 年集团净利润季度趋势示例">
      {[1000, 1400, 1800, 2200].map(value => <g key={value}><line x1="58" x2="550" y1={y(value)} y2={y(value)} /><text x="50" y={y(value) + 4} textAnchor="end">{numberFormat.format(value)}</text></g>)}
      <polyline className="previous" points={previousPoints} />
      <polyline className="current" points={currentPoints} />
      {profitExample.quarters.map((item, index) => <g key={item.quarter}><circle className="previous-dot" cx={x(index)} cy={y(item.previous)} r="4" /><circle className="current-dot" cx={x(index)} cy={y(item.current)} r="4" /><text className="axis" x={x(index)} y="194" textAnchor="middle">{item.quarter}</text></g>)}
    </svg>
  );
}

function OrganizationChart() {
  const max = Math.max(...profitExample.organizations.map(item => item.value));
  return (
    <svg className="zcv2-chart is-bars" viewBox="0 0 580 210" role="img" aria-label="2024 年各组织净利润对比示例">
      {[0, 1000, 2000, 3000].map(value => {
        const y = 172 - value / 3000 * 138;
        return <g key={value}><line x1="58" x2="550" y1={y} y2={y} /><text x="50" y={y + 4} textAnchor="end">{value}</text></g>;
      })}
      {profitExample.organizations.map((item, index) => {
        const height = item.value / max * 124;
        const x = 100 + index * 160;
        return <g key={item.name}><rect x={x} y={172 - height} width="70" height={height} rx="8" /><text className="value" x={x + 35} y={164 - height} textAnchor="middle">{numberFormat.format(item.value)}</text><text className="axis" x={x + 35} y="198" textAnchor="middle">{item.name}</text></g>;
      })}
    </svg>
  );
}

function ProcessContent({ step }: { step: number }) {
  if (step === 0) return <div className="zcv2-process-content"><h4>查询条件已确认</h4><Conditions compact /><p>原问题与已确认条件一起进入执行流程。</p></div>;
  if (step === 1) return <div className="zcv2-process-content"><h4>正在匹配数据来源</h4><ul><li><span>财务指标库</span><b>已匹配净利润口径</b></li><li><span>年度经营数据</span><b>已匹配 2024 年</b></li><li><span>组织维度</span><b>已匹配全集团</b></li></ul></div>;
  if (step === 2) return <div className="zcv2-process-content"><h4>正在计算并校验</h4><ul><li><span>季度汇总</span><b>{formatAmount(currentTotal)}</b></li><li><span>组织合计</span><b>{formatAmount(profitExample.organizations.reduce((sum, item) => sum + item.value, 0))}</b></li><li><span>同比校验</span><b>+{yearOnYear.toFixed(1)}%</b></li></ul></div>;
  if (step === 3) return <div className="zcv2-process-content is-chart"><QuarterTrendChart compact /><p>结论、季度趋势和数据依据正在组织。</p></div>;
  return <div className="zcv2-process-content is-complete"><CheckCircle2 size={28} /><h4>分析完成</h4><strong>{formatAmount(currentTotal)} · 同比 +{yearOnYear.toFixed(1)}%</strong><p>结果已按结论、数据和来源完成组织。</p></div>;
}

function MarkdownFormatExample({ active }: { active: MarkdownTab }) {
  if (active === "表格") return <table className="zcv2-format-table"><thead><tr><th>项目</th><th>金额</th><th>变化</th></tr></thead><tbody><tr><td>示例 A</td><td>1,200.00</td><td>+12.5%</td></tr><tr><td>示例 B</td><td>-320.00</td><td>-3.0%</td></tr><tr><td>示例 C</td><td>—</td><td>无可比</td></tr></tbody></table>;
  if (active === "引用") return <blockquote>结论与数据来源保持关联。<cite>来源说明示例</cite></blockquote>;
  if (active === "公式") return <div className="zcv2-formula"><span>同比增长率</span><b>(本期 ÷ 同期 − 1) × 100%</b></div>;
  if (active === "代码") return <pre><code>{`SELECT quarter, SUM(net_profit)\nFROM annual_data\nGROUP BY quarter;`}</code></pre>;
  if (active === "标题") return <div><h3>年度经营分析</h3><h4>核心结论</h4><p>标题层级帮助用户快速定位内容。</p></div>;
  return <div><p>正文保持适当行宽，并将结论、依据和补充说明分段呈现。</p><p>长回答仍可通过标题快速浏览。</p></div>;
}

function GalleryImage({ item, onOpen }: { item: LightboxItem; onOpen: (item: LightboxItem, trigger: HTMLButtonElement) => void }) {
  return (
    <figure className="zcv2-gallery-item">
      <button type="button" onClick={event => onOpen(item, event.currentTarget)} aria-label={`放大查看：${item.title}`}>
        <img src={publicAsset(item.src)} alt={item.alt} loading="lazy" decoding="async" />
        <span><Expand size={17} />放大查看</span>
      </button>
      <figcaption>{item.title}</figcaption>
    </figure>
  );
}

export function ZhaocaiSmartCase() {
  const [activeSection, setActiveSection] = useState("overview");
  const [clarifyStage, setClarifyStage] = useState<ClarifyStage>("pending");
  const [metricNotice, setMetricNotice] = useState("");
  const [processStep, setProcessStep] = useState(1);
  const [processVariant, setProcessVariant] = useState<ProcessVariant>("running");
  const [boardSaved, setBoardSaved] = useState(false);
  const [boardMode, setBoardMode] = useState<BoardMode>("separate");
  const [boardOrder, setBoardOrder] = useState<BoardCardId[]>(["quarter", "organization", "summary"]);
  const [draggedCard, setDraggedCard] = useState<BoardCardId | null>(null);
  const [markdown, setMarkdown] = useState<MarkdownTab>("表格");
  const [sourceOpen, setSourceOpen] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);
  const lightboxTrigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>("[data-zcv2-section]")];
    const observer = new IntersectionObserver(entries => {
      const current = entries.filter(entry => entry.isIntersecting).sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
      if (current?.target.id) setActiveSection(current.target.id);
    }, { rootMargin: "-8% 0px -78%", threshold: [0.05, .2, .45] });
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox]);

  useEffect(() => {
    if (lightbox) return;
    window.requestAnimationFrame(() => lightboxTrigger.current?.focus());
  }, [lightbox]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const openImage = (item: LightboxItem, trigger: HTMLButtonElement) => { lightboxTrigger.current = trigger; setLightbox(item); };
  const moveBoardCard = (cardId: BoardCardId, direction: -1 | 1) => {
    setBoardOrder(current => {
      const from = current.indexOf(cardId);
      const to = from + direction;
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };
  const dropBoardCard = (targetId: BoardCardId) => {
    if (!draggedCard || draggedCard === targetId) return setDraggedCard(null);
    setBoardOrder(current => {
      const next = current.filter(id => id !== draggedCard);
      next.splice(next.indexOf(targetId), 0, draggedCard);
      return next;
    });
    setDraggedCard(null);
  };

  const galleryItems: LightboxItem[] = [
    { src: "/assets/projects/zhaocai-smart/web/hero-interface-collage-v2.png", alt: "招财 Smart 问答入口真实界面", title: "问答与分析" },
    { src: "/assets/projects/zhaocai-smart/web/process-dashboard-v2.png", alt: "招财 Smart 执行结果真实界面", title: "结果整理" },
    { src: "/assets/projects/zhaocai-smart/web/board-selection-v3.png", alt: "招财 Smart 经营看板真实界面", title: "经营看板" },
  ];

  return (
    <section className="zhaocai-page zcv2-page" aria-label="招财 Smart 项目案例">
      <nav className="zhaocai-locator" aria-label="案例章节定位">
        <span aria-hidden="true" />
        {locatorSections.map(([id, label], index) => <a href={`#${id}`} className={activeSection === id ? "active" : ""} aria-current={activeSection === id ? "location" : undefined} onClick={() => setActiveSection(id)} key={id}><b>{String(index + 1).padStart(2, "0")}</b><em>{label}</em></a>)}
      </nav>

      <div className="zcv2-layout">
        <main className="zcv2-content">
          <section id="overview" data-zcv2-section className="zcv2-section zcv2-hero">
            <div className="zcv2-hero-intro">
              <div>
                <p className="zcv2-chapter"><span>01</span> / 项目概览</p>
                <h1>招财 <em>Smart</em></h1>
              </div>
              <div className="zcv2-hero-copy">
                <h2>让财务问数更清晰</h2>
                <p>面向企业财务经营分析，围绕语义澄清、执行反馈与结果管理优化问数体验。</p>
                <dl>
                  <div><dt>项目时间</dt><dd>2025.07 — 2025.11</dd></div>
                  <div><dt>我的角色</dt><dd>UX / UI 设计师</dd></div>
                </dl>
              </div>
            </div>
            <figure className="zcv2-hero-visual">
              <button type="button" onClick={event => openImage(galleryItems[0], event.currentTarget)} aria-label="放大查看招财 Smart 产品界面">
                <img src={publicAsset(galleryItems[0].src)} alt={galleryItems[0].alt} width="1180" height="980" loading="eager" decoding="async" />
                <span><Expand size={18} />查看完整界面</span>
              </button>
              <figcaption><span>真实产品界面 · 已脱敏</span><b>问答入口与历史任务</b></figcaption>
            </figure>
            <dl className="zcv2-project-meta">
              <div><dt>产品类型</dt><dd>企业级 AI 问数平台</dd></div>
              <div><dt>设计范围</dt><dd>体验链路 · 核心交互 · 界面规范</dd></div>
              <div><dt>主要交付</dt><dd>高保真原型 · 状态设计 · 输出规范</dd></div>
            </dl>
          </section>

          <section id="strategy" data-zcv2-section className="zcv2-section zcv2-strategy">
            <span id="problem" className="zcv2-anchor-alias" aria-hidden="true" />
            <SectionHeading number="02" name="问题策略" title="从一句业务问题，走到可复用的结果" description="把任务中断的三个节点，转化为明确的交互策略。" />
            <div className="zcv2-context-line"><span>任务情境示意</span><strong>查看 2024 年集团利润变化</strong><em>示例数据</em></div>
            <div className="zcv2-strategy-grid">
              {strategyItems.map((item, index) => <article key={item.phase}><header><span>0{index + 1}</span><b>{item.phase}</b></header><h3>{item.title}</h3><p>{item.text}</p><StrategyMini kind={item.kind} /></article>)}
            </div>
            <ol className="zcv2-journey" aria-label="问数任务主流程">
              {journey.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><b>{item}</b></li>)}
            </ol>
          </section>

          <section id="core" data-zcv2-section className="zcv2-section zcv2-core">
            <SectionHeading number="03" name="核心交互" title={<><span className="zcv2-title-line">让提问、等待与</span><br /><span className="zcv2-title-line">结果，始终连得上</span></>} description="围绕同一条业务查询，处理三个容易中断任务的节点。" />

            <article id="clarification" className="zcv2-chapter-block">
              <header className="zcv2-chapter-heading"><p>语义澄清</p><h3>只确认有歧义的条件</h3><div>保留已经识别的时间与范围，让用户只补充利润口径。</div></header>
              <div className="zcv2-clarify-demo">
                <section className="zcv2-chat-window" aria-label="语义澄清交互示意">
                  <header><span>交互示意</span><b>招财 Smart</b></header>
                  <div className="zcv2-user-query">查看 2024 年集团利润变化</div>
                  <div className="zcv2-ai-message" aria-live="polite">
                    <header><Bot size={18} /><b>招财 Smart</b><span>{clarifyStage === "recognizing" ? "识别中" : clarifyStage === "pending" ? "待确认" : "澄清完成"}</span></header>
                    {clarifyStage === "recognizing" && <><h4>正在识别查询条件</h4><p>保留原问题，并从中提取时间、指标与组织范围。</p><div className="zcv2-thinking"><i /><i /><i />正在识别关键条件</div></>}
                    {clarifyStage === "pending" && <><h4>请确认利润口径</h4><p>已识别 2024 年和全集团，只需补充会影响结果的指标口径。</p><div className="zcv2-choice-row"><button type="button" onClick={() => { setClarifyStage("confirmed"); setMetricNotice(""); }}>净利润</button><button type="button" onClick={() => setMetricNotice("利润总额暂无对应演示数据，请选择净利润继续体验。")}>利润总额</button></div>{metricNotice && <small className="zcv2-inline-notice">{metricNotice}</small>}</>}
                    {clarifyStage === "confirmed" && <><div className="zcv2-success"><CheckCircle2 size={19} /><b>查询条件已确认</b></div><Conditions compact /><button className="zcv2-text-action" type="button" onClick={() => setClarifyStage("pending")}>修改条件</button></>}
                  </div>
                </section>
                <aside className="zcv2-condition-detail">
                  <span>条件摘要</span>
                  <Conditions />
                  <div><b>只补充缺失项</b><p>不要求用户重写已经明确的时间与组织范围。</p></div>
                  <div><b>确认后回显条件</b><p>选择结果与阶段状态保持一致，再进入任务执行。</p></div>
                  <nav aria-label="澄清状态切换"><button type="button" aria-pressed={clarifyStage === "recognizing"} onClick={() => setClarifyStage("recognizing")}>识别</button><button type="button" aria-pressed={clarifyStage === "pending"} onClick={() => setClarifyStage("pending")}>待确认</button><button type="button" aria-pressed={clarifyStage === "confirmed"} onClick={() => setClarifyStage("confirmed")}>已确认</button></nav>
                </aside>
              </div>
            </article>

            <article id="process" className="zcv2-chapter-block">
              <header className="zcv2-chapter-heading"><p>执行反馈</p><h3>等待时知道进度，异常时有路可走</h3><div>展示当前执行阶段，保留查询条件并提供恢复入口。</div></header>
              <div className="zcv2-process-shell">
                <header><div><span>当前查询</span><b>查看 2024 年集团净利润变化</b></div><Conditions compact /></header>
                <div className="zcv2-process-layout">
                  <nav aria-label="AI 执行步骤">
                    {processSteps.map((step, index) => <button type="button" key={step.title} aria-pressed={processVariant !== "empty" && processStep === index} onClick={() => { setProcessStep(index); setProcessVariant(index === 4 ? "complete" : "running"); }}><span>{index < processStep && processVariant !== "empty" ? <CheckCircle2 size={15} /> : String(index + 1).padStart(2, "0")}</span><div><b>{step.title}</b><small>{step.text}</small></div></button>)}
                  </nav>
                  <div className="zcv2-process-stage" aria-live="polite">
                    {processVariant !== "empty" ? <><header><span>{processVariant === "complete" ? "分析完成" : "执行中"}</span><b>{String(processStep + 1).padStart(2, "0")} / 05</b></header><div className="zcv2-progress"><i style={{ transform: `scaleX(${(processStep + 1) / processSteps.length})` }} /></div><ProcessContent step={processStep} />{processVariant === "complete" && <div className="zcv2-process-actions"><button type="button" onClick={() => scrollTo("markdown")}>查看结果</button><button type="button" onClick={() => { setBoardSaved(true); scrollTo("board"); }}>保存到看板</button></div>}</> : <div className="zcv2-empty-state"><span>补充状态 · 交互示意</span><h4>当前范围暂无数据</h4><p>已保留原查询条件，可以调整范围或重新执行。</p><Conditions compact /><div><button type="button" onClick={() => { setClarifyStage("pending"); scrollTo("clarification"); }}>调整范围</button><button type="button" onClick={() => { setProcessVariant("running"); setProcessStep(0); }}><RefreshCw size={16} />重试</button></div></div>}
                  </div>
                </div>
                <footer className="zcv2-process-states"><button type="button" onClick={() => { setProcessStep(4); setProcessVariant("complete"); }}><CheckCircle2 size={19} /><span><b>完成</b><small>分析完成，可查看结果或保存</small></span></button><button type="button" onClick={() => setProcessVariant("empty")}><span className="zcv2-empty-mark">—</span><span><b>暂无数据</b><small>保留条件，支持调整范围与重试</small></span></button></footer>
              </div>
            </article>

            <article id="board" className="zcv2-chapter-block">
              <header className="zcv2-chapter-heading"><p>看板沉淀</p><h3>把一次查询，保存成持续可用的看板</h3><div>保存时保留指标、时间与范围，支持整理和再次查看。</div></header>
              <div className={`zcv2-save-feedback${boardSaved ? " is-saved" : ""}`}><div>{boardSaved ? <CheckCircle2 size={22} /> : <span>+</span>}<p><b>{boardSaved ? "已保存到看板" : "保存当前查询结果"}</b><small>2024 年 / 净利润 / 全集团 · 示例数据</small></p></div>{boardSaved ? <button type="button" onClick={() => document.getElementById("zcv2-board-canvas")?.focus()}>查看看板</button> : <button type="button" onClick={() => setBoardSaved(true)}>保存到看板</button>}</div>
              <section id="zcv2-board-canvas" tabIndex={-1} className={`zcv2-board is-${boardMode}`} aria-label="经营指标看板交互示意">
                <header><div><span>交互示意</span><b>2024 年集团净利润看板</b></div><div role="group" aria-label="看板排列方式"><button type="button" aria-pressed={boardMode === "separate"} onClick={() => setBoardMode("separate")}>独立排列</button><button type="button" aria-pressed={boardMode === "merged"} onClick={() => setBoardMode("merged")}>合并为合集</button></div></header>
                <div className="zcv2-board-summary"><Conditions compact /><span>{boardMode === "separate" ? "拖动卡片或使用上移、下移调整顺序" : "三张卡片已合并为同一查询合集"}</span></div>
                <div className="zcv2-board-grid">
                  {boardOrder.map((cardId, index) => <article className="zcv2-board-card" draggable onDragStart={() => setDraggedCard(cardId)} onDragOver={event => event.preventDefault()} onDrop={() => dropBoardCard(cardId)} key={cardId}><header><div><small>{cardId === "quarter" ? "季度趋势" : cardId === "organization" ? "组织对比" : "年度摘要"}</small><b>{boardCardNames[cardId]}</b></div><div><button type="button" disabled={index === 0} onClick={() => moveBoardCard(cardId, -1)} aria-label={`上移${boardCardNames[cardId]}`}>上移</button><button type="button" disabled={index === boardOrder.length - 1} onClick={() => moveBoardCard(cardId, 1)} aria-label={`下移${boardCardNames[cardId]}`}>下移</button></div></header>{cardId === "quarter" && <QuarterTrendChart />}{cardId === "organization" && <OrganizationChart />}{cardId === "summary" && <div className="zcv2-profit-summary"><strong>{numberFormat.format(currentTotal)}</strong><span>{profitExample.unit}</span><em>同比 +{yearOnYear.toFixed(1)}%</em><dl><div><dt>Q4</dt><dd>{formatAmount(profitExample.quarters[3].current)}</dd></div><div><dt>Q4 同比</dt><dd>+{q4OnYear.toFixed(1)}%</dd></div><div><dt>范围</dt><dd>{profitExample.scope}</dd></div></dl></div>}<footer><span>示例数据</span><b>{profitExample.metric} · {profitExample.year}</b></footer></article>)}
                </div>
              </section>
            </article>
          </section>

          <section id="markdown" data-zcv2-section className="zcv2-section zcv2-output">
            <SectionHeading number="04" name="输出规范" title="让每一份回答，都清晰且有据可查" description="把结论、数据表与来源说明组织成稳定的阅读结构。" />
            <div className="zcv2-answer-layout">
              <article className="zcv2-answer">
                <header><span>完整回答 · 示例数据</span><h3>2024 年集团净利润分析</h3><Conditions compact /></header>
                <section><small>先看结论</small><p>全年净利润合计 <strong>{numberFormat.format(currentTotal)} 万元</strong>，同比增长 <strong>{yearOnYear.toFixed(1)}%</strong>。</p></section>
                <section><small>按列核对数据</small><div className="zcv2-table-scroll"><table><thead><tr><th>季度</th><th>2024 年</th><th>2023 年</th><th>同比</th></tr></thead><tbody>{profitExample.quarters.map(item => <tr key={item.quarter}><td>{item.quarter}</td><td>{numberFormat.format(item.current)}</td><td>{numberFormat.format(item.previous)}</td><td>+{((item.current / item.previous - 1) * 100).toFixed(1)}%</td></tr>)}</tbody><tfoot><tr><th>合计</th><td>{numberFormat.format(currentTotal)}</td><td>{numberFormat.format(previousTotal)}</td><td>+{yearOnYear.toFixed(1)}%</td></tr></tfoot></table></div><p className="zcv2-unit">单位：万元</p></section>
                <footer><button type="button" aria-expanded={sourceOpen} onClick={() => setSourceOpen(open => !open)}><span>数据来源：{profitExample.sourceLabel}</span><b>{sourceOpen ? "收起依据" : "查看依据"}</b></button>{sourceOpen && <dl><div><dt>指标</dt><dd>{profitExample.metric}</dd></div><div><dt>范围</dt><dd>{profitExample.scope}</dd></div><div><dt>期间</dt><dd>2024.01.01—2024.12.31</dd></div><div><dt>对比</dt><dd>2023 年</dd></div><div><dt>来源</dt><dd>{profitExample.sourceLabel}</dd></div></dl>}</footer>
              </article>
              <aside className="zcv2-answer-notes"><div><span>01</span><b>先看结论</b><p>首屏直接回答用户最关心的结果。</p></div><div><span>02</span><b>按列核对数据</b><p>年份、季度和同比关系保持一致。</p></div><div><span>03</span><b>展开来源与口径</b><p>结论始终能够回到数据依据。</p></div></aside>
            </div>
            <section className="zcv2-markdown-spec">
              <header><div><h3>六类输出规范</h3><p>紧凑展示格式规则，不与本案例年度数据混用。</p></div><nav aria-label="Markdown 输出类型">{markdownTabs.map(tab => <button type="button" aria-pressed={markdown === tab} onClick={() => setMarkdown(tab)} key={tab}>{tab}</button>)}</nav></header>
              <div className="zcv2-format-preview" aria-live="polite"><span>格式示例 · {markdown}</span><MarkdownFormatExample active={markdown} /></div>
            </section>
          </section>

          <section id="gallery" data-zcv2-section className="zcv2-section zcv2-gallery-section">
            <SectionHeading number="05" name="页面总览" title="从核心流程，到完整界面交付" description="问答、分析、看板与状态设计，形成统一的界面体验。" />
            <div className="zcv2-gallery-grid">
              <GalleryImage item={galleryItems[0]} onOpen={openImage} />
              <GalleryImage item={galleryItems[1]} onOpen={openImage} />
              <GalleryImage item={galleryItems[2]} onOpen={openImage} />
              <figure className="zcv2-gallery-item is-demo"><div><span>补充状态 · 交互示意</span><h3>当前范围暂无数据</h3><p>保留 2024 年、净利润和全集团条件，支持调整范围或重新执行。</p><Conditions compact /><button type="button" onClick={() => { setProcessVariant("empty"); scrollTo("process"); }}>查看恢复交互</button></div><figcaption>异常与恢复</figcaption></figure>
            </div>
            <footer className="zcv2-delivery"><div><span>设计交付</span><b>核心流程 / 高保真原型 / 状态设计 / 输出规范</b></div><div><span>后续验证方向</span><b>澄清是否有效 / 异常能否恢复 / 看板能否复用</b></div></footer>
          </section>
        </main>

      </div>

      {lightbox && <div className="zcv2-lightbox" role="dialog" aria-modal="true" aria-label={lightbox.title} onMouseDown={event => { if (event.target === event.currentTarget) setLightbox(null); }}><button type="button" onClick={() => setLightbox(null)} aria-label="关闭图片预览"><X size={22} /></button><figure><img src={publicAsset(lightbox.src)} alt={lightbox.alt} /><figcaption>{lightbox.title}</figcaption></figure></div>}
    </section>
  );
}
