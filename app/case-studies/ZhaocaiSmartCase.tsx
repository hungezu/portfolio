"use client";

import { useEffect, useRef, useState } from "react";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right.mjs";
import Bot from "lucide-react/dist/esm/icons/bot.mjs";
import CheckCircle2 from "lucide-react/dist/esm/icons/circle-check.mjs";
import { publicAsset } from "../portfolio-data";
import "./zhaocai-smart.css";

const journey = [
  { num: "01", title: "提问", text: "记录用户的原始问题和业务语境" },
  { num: "02", title: "澄清", text: "识别并补充缺失的查询条件" },
  { num: "03", title: "执行", text: "分阶段反馈数据处理进度" },
  { num: "04", title: "解释", text: "关联分析结论、数据依据和来源" },
  { num: "05", title: "沉淀", text: "将高频查询结果保存到看板" },
];

const clarification = [
  {
    label: "识别中",
    title: "已识别查询条件",
    desc: "正在从问题中识别时间范围、指标和组织范围。",
    outcome: "已识别：今年 / 利润 / 全集团",
  },
  {
    label: "需要澄清",
    title: "请确认利润口径",
    desc: "“利润”有两个常用口径，选择其中一个后继续查询。",
    outcome: "待确认：净利润 / 利润总额",
  },
  {
    label: "澄清完成",
    title: "查询条件已确认",
    desc: "已将选择补入原问题，下一步开始查询。",
    outcome: "已确认：今年 / 净利润 / 全集团",
  },
];

const process = [
  { title: "理解问题", text: "识别意图与查询条件", detail: "已识别年度利润趋势和集团范围。" },
  { title: "检索数据", text: "匹配指标与数据来源", detail: "正在匹配财务指标口径和对应数据。" },
  { title: "分析处理", text: "完成计算与结果校验", detail: "正在聚合数据，并检查异常值与缺失字段。" },
  { title: "组织结果", text: "编排图表、结论与依据", detail: "正在组织结论、趋势图和对应的数据依据。" },
  { title: "完成", text: "提供后续操作", detail: "结果已生成，可继续追问或保存至看板。" },
];

const markdownTabs = ["标题", "表格", "引用", "正文", "公式", "代码"] as const;
type MarkdownTab = (typeof markdownTabs)[number];
type BoardMode = "separate" | "merged";
type BoardCardId = "sales" | "balance" | "deposit";

const boardCardNames: Record<BoardCardId, string> = {
  sales: "销售规模变化",
  balance: "存款余额趋势",
  deposit: "存款指标摘要",
};

const markdownPurpose: Record<MarkdownTab, { title: string; text: string }> = {
  标题: { title: "建立清晰的标题层级", text: "区分结论、依据和补充说明，方便用户快速定位信息。" },
  表格: { title: "统一跨项比较格式", text: "固定表头和数值对齐方式，窄屏场景保留横向滚动。" },
  引用: { title: "标明结论来源", text: "引用内容与来源说明保持关联，便于核对数据依据。" },
  正文: { title: "控制正文阅读长度", text: "限制行宽和段落间距，避免长回答形成连续文字块。" },
  公式: { title: "说明计算口径", text: "分开展示变量和公式，便于用户检查计算方式。" },
  代码: { title: "保留技术内容结构", text: "独立呈现缩进与换行，避免代码在正文中失去格式。" },
};

const locatorSections = [
  ["overview", "项目概览"],
  ["strategy", "问题策略"],
  ["core", "核心交互"],
  ["markdown", "输出规范"],
  ["gallery", "页面总览"],
];

function MiniTrend({ variant = "line" }: { variant?: "line" | "bar" }) {
  if (variant === "bar") {
    return (
      <svg className="zc-mini-chart" viewBox="0 0 420 210" role="img" aria-label="不同组织销售规模对比示例">
        <defs>
          <linearGradient id="zc-bar-primary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a68ef" />
            <stop offset="100%" stopColor="#5948d2" />
          </linearGradient>
          <linearGradient id="zc-bar-secondary" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c2bbf6" />
            <stop offset="100%" stopColor="#9d93e5" />
          </linearGradient>
        </defs>
        {[36, 78, 120, 162].map((y, index) => (
          <g key={y}><text x="2" y={y + 3}>{[1200, 900, 600, 300][index]}</text><line x1="38" x2="410" y1={y} y2={y} /></g>
        ))}
        {[74, 112, 62, 128, 96].map((value, index) => (
          <g key={value + index}>
            <rect className="primary-bar" x={58 + index * 70} y={174 - value} width="16" height={value} rx="4" />
            <rect className="secondary-bar" x={77 + index * 70} y={174 - value * .68} width="16" height={value * .68} rx="4" />
            <text className="axis-label" x={75 + index * 70} y="198" textAnchor="middle">组织 {index + 1}</text>
          </g>
        ))}
      </svg>
    );
  }

  return (
    <svg className="zc-mini-chart" viewBox="0 0 420 210" role="img" aria-label="存款余额年度趋势示例">
      <defs>
        <linearGradient id="zc-line-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7663e8" stopOpacity=".22" />
          <stop offset="100%" stopColor="#7663e8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[36, 78, 120, 162].map((y, index) => (
        <g key={y}><text x="2" y={y + 3}>{[80, 60, 40, 20][index]}</text><line x1="38" x2="410" y1={y} y2={y} /></g>
      ))}
      <path className="zc-line-area" d="M38 160 L110 132 L182 82 L254 104 L326 62 L408 34 L408 174 L38 174 Z" />
      <polyline points="38,160 110,132 182,82 254,104 326,62 408,34" />
      <polyline className="secondary" points="38,174 110,152 182,138 254,100 326,118 408,86" />
      {[38, 110, 182, 254, 326, 408].map((x, index) => <circle key={x} cx={x} cy={[160, 132, 82, 104, 62, 34][index]} r="3" />)}
      {["2020", "2021", "2022", "2023", "2024", "2025"].map((year, index) => <text className="axis-label" x={38 + index * 74} y="198" textAnchor="middle" key={year}>{year}</text>)}
    </svg>
  );
}

function BoardChartCard({ title, meta, variant }: { title: string; meta: string; variant: "line" | "bar" }) {
  return (
    <article className="zc-board-card">
      <header>
        <div><small>{meta}</small><strong>{title}</strong></div>
      </header>
      <MiniTrend variant={variant} />
      <footer>
        <span><i />本期</span>
        <span><i />同期</span>
        <em>2020—2025</em>
      </footer>
    </article>
  );
}

function BoardKpiCard() {
  return (
    <article className="zc-board-card zc-kpi-card">
      <header><div><small>指标摘要</small><strong>今年存款趋势</strong></div></header>
      <div className="zc-kpi-primary"><strong>4.7%</strong><span>融资成本</span></div>
      <dl>
        <div><dt>预计年利率</dt><dd>2%</dd></div>
        <div><dt>平均余额</dt><dd>示例数据</dd></div>
        <div><dt>统计范围</dt><dd>集团</dd></div>
      </dl>
    </article>
  );
}

function ProcessStageContent({ step }: { step: number }) {
  if (step === 0) {
    return (
      <section className="zc-stage-content zc-condition-sheet">
        <header><strong>条件识别结果</strong><span>3 项已确认，1 项待确认</span></header>
        <dl className="zc-condition-grid">
          <div><dt>分析主题</dt><dd>集团利润变化</dd></div>
          <div><dt>时间范围</dt><dd>本年度</dd></div>
          <div><dt>组织范围</dt><dd>集团</dd></div>
          <div><dt>指标口径</dt><dd>待确认利润类型</dd></div>
        </dl>
        <footer>保留已识别条件，只补充影响查询结果的必要信息。</footer>
      </section>
    );
  }

  if (step === 1) {
    return (
      <section className="zc-stage-content zc-source-list">
        <header><span>数据来源</span><span>匹配依据</span><span>状态</span></header>
        {[
          ["财务指标库", "匹配利润相关指标"],
          ["年度经营数据", "定位对应时间范围"],
          ["组织维度", "匹配集团统计范围"],
          ["指标口径", "关联已确认的利润类型"],
        ].map(([title, text]) => (
          <div key={title}><strong>{title}</strong><span>{text}</span><em>已匹配</em></div>
        ))}
      </section>
    );
  }

  if (step === 2) {
    return (
      <ol className="zc-stage-content zc-analysis-flow">
        <li data-state="done"><span>01</span><div><strong>口径校验</strong><p>核对时间、组织与指标口径</p></div><em>已完成</em></li>
        <li data-state="active"><span>02</span><div><strong>数据聚合</strong><p>按年度和组织范围汇总结果</p></div><em>处理中</em></li>
        <li data-state="waiting"><span>03</span><div><strong>异常检查</strong><p>识别缺失值与异常波动</p></div><em>等待</em></li>
      </ol>
    );
  }

  if (step === 3) {
    return (
      <div className="zc-stage-content zc-compose-grid">
        <div className="zc-compose-chart"><span>趋势预览</span><MiniTrend /></div>
        <div className="zc-answer-outline"><strong>回答结构</strong><ol><li><b>结论</b><span>先给出核心判断</span></li><li><b>趋势</b><span>呈现年度变化</span></li><li><b>依据</b><span>关联数据来源</span></li><li><b>说明</b><span>补充异常情况</span></li></ol></div>
      </div>
    );
  }

  return (
    <div className="zc-stage-content zc-result-preview">
      <div className="zc-compose-chart"><span>结果预览</span><MiniTrend /></div>
      <div className="zc-result-summary"><strong>结果已生成</strong><p>结论、趋势和数据依据已完成组织。</p><ul><li><b>继续追问</b><span>沿用当前查询条件</span></li><li><b>保存看板</b><span>沉淀为长期追踪卡片</span></li><li><b>调整条件</b><span>返回修改时间或范围</span></li></ul></div>
    </div>
  );
}

function MarkdownExample({ mode }: { mode: MarkdownTab }) {
  if (mode === "表格") {
    return (
      <div className="zc-table-scroll">
        <table>
          <thead><tr><th>趋势类别</th><th>核心判断</th><th>指标</th></tr></thead>
          <tbody>
            <tr><td>收入变化</td><td>重点业务保持增长</td><td>示例数据</td></tr>
            <tr><td>成本变化</td><td>费用结构需要关注</td><td>示例数据</td></tr>
            <tr><td>区域差异</td><td>不同组织变化分化</td><td>示例数据</td></tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (mode === "引用") {
    return <blockquote>“所有结论均应保留对应的数据依据与来源。”<cite>企业数据输出规范</cite></blockquote>;
  }

  if (mode === "公式") {
    return <div className="zc-formula"><span>同比增长率</span><strong>(本期值 − 同期值) ÷ 同期值 × 100%</strong></div>;
  }

  if (mode === "代码") {
    return <pre><code>{`SELECT business_unit, SUM(amount)\nFROM finance_data\nGROUP BY business_unit;`}</code></pre>;
  }

  if (mode === "标题") {
    return <div className="zc-doc-copy"><h3>年度经营趋势</h3><p>一级标题用于概括回答主题，正文直接承接分析结果。</p><h4>核心结论</h4><p>二级标题区分结论与补充说明，避免内容连续堆叠。</p></div>;
  }

  return <div className="zc-doc-copy"><p>正文限制单行长度，并在结论、数据依据和建议之间保留段落间距。</p><p>超过一屏的回答仍可按标题快速定位。</p></div>;
}

export function ZhaocaiSmartCase() {
  const [clarify, setClarify] = useState(1);
  const [processStep, setProcessStep] = useState(1);
  const [boardMode, setBoardMode] = useState<BoardMode>("separate");
  const [boardOrder, setBoardOrder] = useState<BoardCardId[]>(["sales", "balance", "deposit"]);
  const [draggedBoardCard, setDraggedBoardCard] = useState<BoardCardId | null>(null);
  const [settlingBoardCard, setSettlingBoardCard] = useState<BoardCardId | null>(null);
  const [boardDragOffset, setBoardDragOffset] = useState({ x: 0, y: 0 });
  const draggedBoardCardRef = useRef<BoardCardId | null>(null);
  const boardDragOriginRef = useRef<{ cardId: BoardCardId; x: number; y: number } | null>(null);
  const boardDragOffsetRef = useRef({ x: 0, y: 0 });
  const [markdown, setMarkdown] = useState<MarkdownTab>("表格");
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>("[data-zhaocai-section]")];
    let frame = 0;

    const updateActiveSection = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const marker = window.innerHeight * 0.34;
        const current = nodes.reduce((active, node) => (
          node.getBoundingClientRect().top <= marker ? node : active
        ), nodes[0]);

        if (current?.id) setActiveSection(current.id);
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  const moveBoardCard = (cardId: BoardCardId, direction: -1 | 1) => {
    setBoardOrder(current => {
      const from = current.indexOf(cardId);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const finishBoardDrag = () => {
    draggedBoardCardRef.current = null;
    boardDragOriginRef.current = null;
    boardDragOffsetRef.current = { x: 0, y: 0 };
    setBoardDragOffset({ x: 0, y: 0 });
    setDraggedBoardCard(null);
  };

  const updateBoardDrag = (clientX: number, clientY: number) => {
    const origin = boardDragOriginRef.current;
    if (!origin) return;
    const offset = { x: clientX - origin.x, y: clientY - origin.y };
    boardDragOffsetRef.current = offset;
    setBoardDragOffset(offset);
  };

  const commitBoardDrag = () => {
    const origin = boardDragOriginRef.current;
    const offset = boardDragOffsetRef.current;
    if (origin) {
      const delta = offset.x;
      if (Math.abs(delta) >= 72) {
        moveBoardCard(origin.cardId, delta > 0 ? 1 : -1);
        setSettlingBoardCard(origin.cardId);
        window.setTimeout(() => setSettlingBoardCard(null), 320);
      }
    }
    finishBoardDrag();
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      updateBoardDrag(event.clientX, event.clientY);
    };
    const handleMouseUp = () => commitBoardDrag();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <section className="zhaocai-page" aria-label="招财 Smart 项目案例">
      <aside className="zhaocai-locator" aria-label="案例章节定位">
        <span aria-hidden="true" />
        {locatorSections.map(([id, label], index) => (
          <a
            key={id}
            href={`#${id}`}
            className={activeSection === id ? "active" : ""}
            aria-current={activeSection === id ? "location" : undefined}
            onClick={() => setActiveSection(id)}
          >
            <b>{String(index + 1).padStart(2, "0")}</b>
            <em>{label}</em>
          </a>
        ))}
      </aside>

      <section id="overview" data-zhaocai-section className="zc-hero">
        <div className="zc-shell zc-hero-grid">
          <div className="zc-hero-copy">
            <h1>招财 <span>Smart</span></h1>
            <p className="zc-lead">
              招财 Smart 服务于企业财务经营分析。我的工作覆盖问数主流程、语义澄清、执行反馈、看板和模型输出规范。
            </p>
            <dl className="zc-hero-facts">
              <div><dt>项目时间</dt><dd>2025.07 — 2025.11</dd></div>
              <div><dt>我的角色</dt><dd>UX / UI 设计师</dd></div>
            </dl>
          </div>

          <figure className="zc-hero-image">
            <img
              src={publicAsset("/assets/projects/zhaocai-smart/web/hero-interface-collage-v2.png")}
              alt="招财 Smart 产品界面组合"
              width="1180"
              height="980"
              loading="eager"
              decoding="async"
            />
          </figure>

          <dl className="zc-meta">
            <div><dt>产品类型</dt><dd>企业级 AI 问数平台</dd></div>
            <div><dt>设计范围</dt><dd>体验链路 / 核心交互 / 界面规范</dd></div>
            <div><dt>主要交付</dt><dd>高保真原型 / 状态设计 / 输出规范</dd></div>
          </dl>
        </div>
      </section>

      <section id="strategy" data-zhaocai-section className="zc-section zc-shell">
        <header className="zc-section-heading">
          <h2>用户会描述业务问题，但不会一次说全查询条件</h2>
          <p>例如“看一下今年利润”，仍缺少利润口径、组织范围和比较方式。直接执行会把歧义带进结果。</p>
        </header>

        <div className="zc-problem-map">
          <article>
            <div className="zc-problem-copy"><span>问题 01 · 提问</span><h3>查询条件不完整</h3><p>“看一下今年利润”没有说明利润口径和组织范围。</p></div>
            <ArrowRight aria-hidden="true" />
            <div className="zc-response-copy"><h3>仅补充缺失条件</h3><p>先回显已识别的“今年”，再让用户选择净利润或利润总额。</p></div>
          </article>
          <article>
            <div className="zc-problem-copy"><span>问题 02 · 执行</span><h3>处理状态不明确</h3><p>查询需要经过数据匹配、计算和渲染，只显示加载动画无法判断任务状态。</p></div>
            <ArrowRight aria-hidden="true" />
            <div className="zc-response-copy"><h3>按业务步骤反馈进度</h3><p>显示当前执行环节；耗时或失败时，补充原因和下一步操作。</p></div>
          </article>
          <article>
            <div className="zc-problem-copy"><span>问题 03 · 结果</span><h3>历史结果不便查找</h3><p>同类经营指标会被反复查看，只留在历史对话中很难再次找到。</p></div>
            <ArrowRight aria-hidden="true" />
            <div className="zc-response-copy"><h3>保存为可编辑看板</h3><p>把结果卡片保存到看板，支持合并同类指标和调整顺序。</p></div>
          </article>
        </div>

        <div className="zc-journey-block">
          <header className="zc-subsection-heading">
            <h3>我把问数主流程拆成五步</h3>
            <p>每一步沿用上一阶段的查询条件，用户不需要回到起点重新输入。</p>
          </header>

          <ol className="zc-journey-list">
            {journey.map(({ num, title, text }) => (
              <li className="zc-journey-item" key={title}>
                <span>{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="core" data-zhaocai-section className="zc-section zc-shell zc-core-section">
        <header className="zc-section-heading">
          <h2>我重点处理了三个最容易中断任务的节点</h2>
          <p>问题有歧义时先确认，查询等待时报告进度，结果需要反复查看时保存到看板。</p>
        </header>

        <article id="clarification" className="zc-design-chapter">
          <header className="zc-design-heading">
            <div><span>01 · 语义澄清</span><h3>只确认有歧义的条件，不让用户重写问题</h3></div>
          </header>

        <div className="zc-story-grid">
          <aside className="zc-story-copy">
            <dl>
              <div><dt>用户问题</dt><dd>一句话里容易漏掉条件，也无法确认系统采用了哪个指标口径。</dd></div>
              <div><dt>设计决策</dt><dd>保留原问题，只把存在歧义的指标做成候选项。</dd></div>
              <div><dt>状态范围</dt><dd>识别中、待确认、已确认；确认结果始终回显在当前对话中。</dd></div>
            </dl>
          </aside>

          <div className="zc-clarification-demo">
            <div className="zc-clarification-board" aria-live="polite">
              <div className="zc-state-switcher" role="group" aria-label="语义澄清状态">
                {clarification.map((item, index) => (
                  <button
                    type="button"
                    key={item.label}
                    aria-pressed={clarify === index}
                    className={clarify === index ? "active" : ""}
                    onClick={() => setClarify(index)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>{item.label}
                  </button>
                ))}
              </div>
              <div className="zc-query-bubble">查看今年集团利润变化</div>
              <div className="zc-ai-response" key={clarify}>
                <header><Bot size={18} /><span>招财 Smart</span><small>{clarification[clarify].label}</small></header>
                <h3>{clarification[clarify].title}</h3>
                <p>{clarification[clarify].desc}</p>
                {clarify === 0 && <div className="zc-thinking"><i /><i /><i /><span>正在识别关键条件</span></div>}
                {clarify === 1 && (
                  <div className="zc-choice-row">
                    <button type="button" onClick={() => setClarify(2)}>净利润</button>
                    <button type="button" onClick={() => setClarify(2)}>利润总额</button>
                  </div>
                )}
                {clarify === 2 && <div className="zc-confirmed"><CheckCircle2 size={17} />查询范围已确认，可以开始执行</div>}
                <footer>{clarification[clarify].outcome}</footer>
              </div>
              <p className="zc-demo-note">此为交互思路演示，不代表真实页面。</p>
            </div>
          </div>
        </div>
        </article>

        <article id="process" className="zc-design-chapter">
          <header className="zc-design-heading">
            <div><span>02 · 过程反馈</span><h3>查询等待时，直接说明当前执行步骤</h3></div>
          </header>

        <div className="zc-process-workbench">
          <header className="zc-process-summary">
            <div><span>当前查询</span><strong>查看今年集团利润变化</strong></div>
            <div><span>任务进度</span><strong><em>{String(processStep + 1).padStart(2, "0")}</em> / 05 · {processStep === 4 ? "已完成" : "执行中"}</strong></div>
          </header>

          <div className="zc-process-demo">
            <div className="zc-process-list" role="group" aria-label="AI 执行步骤">
              {process.map((item, index) => (
                <button
                  type="button"
                  key={item.title}
                  className={processStep === index ? "active" : ""}
                  aria-pressed={processStep === index}
                  onClick={() => setProcessStep(index)}
                >
                  <span>{index < processStep ? <CheckCircle2 size={15} /> : String(index + 1).padStart(2, "0")}</span>
                  <div><b>{item.title}</b><small>{item.text}</small></div>
                </button>
              ))}
            </div>

            <div className="zc-process-canvas" aria-live="polite">
              <header>
                <span>AI 执行过程</span>
                <div className="zc-process-progress" aria-hidden="true"><i style={{ width: `${((processStep + 1) / process.length) * 100}%` }} /></div>
              </header>
              <div className="zc-process-stage" key={processStep}>
                <div className="zc-process-current">
                  <small>当前步骤</small><h3>{process[processStep].title}</h3><p>{process[processStep].detail}</p>
                </div>
                <ProcessStageContent step={processStep} />
              </div>
            </div>
          </div>

          <div className="zc-exception-panel">
            <header><b>异常与空状态</b><span>保留当前查询，并给出可以继续操作的入口。</span></header>
            <div className="zc-exceptions" aria-label="异常与边界状态">
              <div><b>数据量较大</b><span>说明当前处理环节与等待原因</span></div>
              <div><b>暂无数据</b><span>支持调整时间或组织范围</span></div>
              <div><b>条件缺失</b><span>指出缺失项并提供问法</span></div>
              <div><b>无匹配结果</b><span>检查指标名称或放宽范围</span></div>
            </div>
          </div>
        </div>
        </article>

        <article id="board" className="zc-design-chapter">
          <header className="zc-design-heading">
            <div><span>03 · 看板沉淀</span><h3>常看的查询结果，可以直接存入看板</h3></div>
          </header>

        <div className="zc-board-demo">
          <header>
            <div><strong>经营指标持续追踪</strong></div>
            <div className="zc-board-actions" role="group" aria-label="看板卡片交互状态">
              <button type="button" aria-pressed={boardMode === "separate"} onClick={() => setBoardMode("separate")}>独立排列</button>
              <button type="button" aria-pressed={boardMode === "merged"} onClick={() => setBoardMode("merged")}>合并为合集</button>
            </div>
          </header>

          <div className={`zc-board-canvas is-${boardMode}`} aria-live="polite">
            <div className="zc-board-toolbar">
              <div><strong>经营指标合集 1</strong></div>
              <small>3 个分析组件 · 示例数据</small>
            </div>
            <div className="zc-collection-status">
              <i aria-hidden="true" />
              <span>
                {boardMode === "separate" && "拖动任一卡片可调整顺序。"}
                {boardMode === "merged" && "3 张卡片已合并至“经营指标合集”。"}
              </span>
            </div>
            <div className="zc-board-grid">
              {boardOrder.map(cardId => (
                <div
                  className={`zc-board-slot ${draggedBoardCard === cardId ? "is-dragging" : ""} ${settlingBoardCard === cardId ? "is-settling" : ""}`}
                  data-board-card={cardId}
                  style={draggedBoardCard === cardId ? { transform: `translate3d(${boardDragOffset.x}px, ${boardDragOffset.y}px, 0)` } : undefined}
                  onMouseDown={event => {
                    event.preventDefault();
                    draggedBoardCardRef.current = cardId;
                    boardDragOriginRef.current = { cardId, x: event.clientX, y: event.clientY };
                    setDraggedBoardCard(cardId);
                  }}
                  onTouchStart={event => {
                    const touch = event.touches[0];
                    draggedBoardCardRef.current = cardId;
                    boardDragOriginRef.current = { cardId, x: touch.clientX, y: touch.clientY };
                    setDraggedBoardCard(cardId);
                  }}
                  onTouchMove={event => {
                    const touch = event.touches[0];
                    updateBoardDrag(touch.clientX, touch.clientY);
                  }}
                  onTouchEnd={commitBoardDrag}
                  onTouchCancel={finishBoardDrag}
                  aria-label={`${boardCardNames[cardId]}，按住卡片拖拽可调整顺序`}
                  key={cardId}
                >
                  {cardId === "sales" && <BoardChartCard title="近五年销售规模变化" meta="多组织对比" variant="bar" />}
                  {cardId === "balance" && <BoardChartCard title="存款余额趋势" meta="年度趋势" variant="line" />}
                  {cardId === "deposit" && <BoardKpiCard />}
                </div>
              ))}
            </div>
          </div>
        </div>
        </article>
      </section>

      <section id="markdown" data-zhaocai-section className="zc-section zc-shell">
        <header className="zc-section-heading">
          <h2>把模型回答约束成固定的网页组件</h2>
          <p>我分别定义标题、正文、表格、引用、公式和代码的字号、间距与窄屏处理方式。</p>
        </header>

        <div className="zc-markdown-layout">
          <div className="zc-markdown-tabs" role="group" aria-label="Markdown 输出类型">
            {markdownTabs.map(tab => (
              <button type="button" key={tab} className={markdown === tab ? "active" : ""} aria-pressed={markdown === tab} onClick={() => setMarkdown(tab)}>{tab}</button>
            ))}
          </div>

          <div className="zc-markdown-copy">
            <h3>{markdownPurpose[markdown].title}</h3>
            <p>{markdownPurpose[markdown].text}</p>
            <dl><div><dt>字号</dt><dd>16px</dd></div><div><dt>行高</dt><dd>1.7</dd></div><div><dt>间距基准</dt><dd>8px</dd></div></dl>
          </div>

          <div className="zc-markdown-preview" aria-live="polite">
            <header><span>用户问题</span><p>请总结年度经营趋势，并列出关键数据。</p></header>
            <div className="zc-markdown-content" key={markdown}><MarkdownExample mode={markdown} /></div>
          </div>
        </div>
      </section>

      <section id="gallery" data-zhaocai-section className="zc-gallery-section">
        <div className="zc-shell">
          <header className="zc-section-heading">
            <h2>交付范围与关键页面</h2>
            <p>以下为脱敏后的部分设计页面，包括问答、分析、看板和异常处理。</p>
          </header>

          <figure className="zc-gallery">
            <picture>
              <source srcSet={publicAsset("/assets/projects/zhaocai-smart/17-page-overview.webp")} type="image/webp" />
              <img src={publicAsset("/assets/projects/zhaocai-smart/17-page-overview.png")} alt="招财 Smart 关键页面总览" width="1920" height="1080" loading="lazy" decoding="async" />
            </picture>
          </figure>
        </div>
      </section>
    </section>
  );
}
