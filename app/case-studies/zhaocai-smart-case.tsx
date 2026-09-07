"use client";

import { useEffect, useState } from "react";
import { publicAsset } from "../portfolio-data";

function MiniBarChart({ label = "各业务单元指标" }: { label?: string }) {
  const values = [54, 88, 42, 72, 34, 64];
  return (
    <svg className="zsc-chart" viewBox="0 0 360 190" role="img" aria-label={label}>
      <title>{label}</title>
      {[36, 72, 108, 144].map((y) => (
        <line x1="34" x2="344" y1={y} y2={y} key={y} />
      ))}
      {values.map((value, index) => (
        <g key={value + index}>
          <rect className="zsc-bar-primary" x={52 + index * 48} y={156 - value} width="13" height={value} rx="3" />
          <rect className="zsc-bar-secondary" x={67 + index * 48} y={156 - value * 0.7} width="13" height={value * 0.7} rx="3" />
        </g>
      ))}
    </svg>
  );
}

function MiniLineChart({ label = "年度趋势" }: { label?: string }) {
  return (
    <svg className="zsc-chart" viewBox="0 0 360 190" role="img" aria-label={label}>
      <title>{label}</title>
      {[36, 72, 108, 144].map((y) => (
        <line x1="28" x2="344" y1={y} y2={y} key={y} />
      ))}
      <polyline className="zsc-line-primary" points="28,138 82,116 136,74 190,88 244,62 298,70 344,38" />
      <polyline className="zsc-line-secondary" points="28,150 82,132 136,122 190,94 244,108 298,78 344,86" />
      <polyline className="zsc-line-tertiary" points="28,158 82,148 136,132 190,126 244,94 298,112 344,70" />
    </svg>
  );
}

function SmartWorkspace() {
  return (
    <figure className="zsc-original-product">
      <picture>
        <source
          srcSet={publicAsset("/assets/projects/zhaocai-smart/11-product-interface.webp")}
          type="image/webp"
        />
        <img
          src={publicAsset("/assets/projects/zhaocai-smart/11-product-interface.png")}
          alt="招财 Smart 原始产品界面，包含功能导航、智能问数输入区与快捷入口"
          width="1180"
          height="980"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </picture>
      <figcaption>原始产品界面，已做脱敏处理</figcaption>
    </figure>
  );
}

function FlowDiagram() {
  const stages = [
    ["提问", "自然语言输入", "业务问题", "原始语境"],
    ["澄清", "补齐关键条件", "确认范围", "保留原问题"],
    ["执行", "意图解析", "数据检索", "字段校验"],
    ["解释", "图表结果", "数据表格", "异常说明"],
    ["沉淀", "保存看板", "合并合集", "持续追踪"],
  ];

  return (
    <ol className="zsc-flow" aria-label="司数通智能体概念流程">
      {stages.map(([title, ...items], index) => (
        <li key={title}>
          <span className="zsc-flow-index">{String(index + 1).padStart(2, "0")}</span>
          <h3>{title}</h3>
          <div>
            {items.map((item) => <span key={item}>{item}</span>)}
          </div>
        </li>
      ))}
    </ol>
  );
}

function ChallengeGrid() {
  const challenges = [
    ["提问门槛", "业务问题难以一次描述完整，用户既不知道怎样组织问题，也担心问错。"],
    ["过程不透明", "执行阶段和处理状态不可见时，用户难以判断系统是否仍在工作。"],
    ["结果难沉淀", "一次问答解决当下问题，高频问题还需要保存为可持续追踪的看板。"],
  ];

  return (
    <div className="zsc-challenge-grid">
      {challenges.map(([title, description]) => (
        <article key={title}>
          <span aria-hidden="true" />
          <h3>{title}</h3>
          <p>{description}</p>
        </article>
      ))}
    </div>
  );
}

type ClarifyStep = "recognize" | "clarify" | "complete";

function ClarificationDemo() {
  const [step, setStep] = useState<ClarifyStep>("clarify");
  const [choice, setChoice] = useState("差旅报销");
  const steps: Array<{ id: ClarifyStep; label: string }> = [
    { id: "recognize", label: "识别中" },
    { id: "clarify", label: "需要澄清" },
    { id: "complete", label: "澄清完成" },
  ];

  return (
    <div className="zsc-demo-shell">
      <div className="zsc-demo-tabs" role="group" aria-label="语义澄清状态">
        {steps.map((item) => (
          <button
            type="button"
            aria-pressed={step === item.id}
            className={step === item.id ? "is-active" : ""}
            onClick={() => setStep(item.id)}
            key={item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="zsc-chat-panel" aria-live="polite">
        <p className="zsc-user-query">请帮我分析今年报销费用变化</p>
        <div className="zsc-state-content" key={step}>
          {step === "recognize" ? (
            <div className="zsc-thinking-state">
              <span aria-hidden="true" />
              正在识别文本意图与数据范围…
            </div>
          ) : null}
          {step === "clarify" ? (
            <div className="zsc-clarify-card">
              <strong>为了准确分析，请确认报销类型</strong>
              <div>
                {["差旅报销", "业务招待及报销"].map((item) => (
                  <button
                    type="button"
                    aria-pressed={choice === item}
                    className={choice === item ? "is-selected" : ""}
                    onClick={() => setChoice(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <small>当前选择：{choice}</small>
            </div>
          ) : null}
          {step === "complete" ? (
            <div className="zsc-result-card">
              <span>查询范围已确认</span>
              <strong>已确认“{choice}”与年度同比分析范围</strong>
              <p>系统将继续查询相关数据，并生成趋势图与异常说明。</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ProcessDemo() {
  const [active, setActive] = useState(1);
  const stages = [
    ["意图解析", "已识别年度报销趋势与同比分析范围。"],
    ["数据检索", "正在连接业务数据并校验字段完整性。"],
    ["图表渲染", "将查询结果组织为趋势、表格与结论。"],
  ];

  return (
    <div className="zsc-process-demo">
      <div className="zsc-process-steps" aria-label="处理过程演示">
        {stages.map(([title], index) => (
          <button
            type="button"
            aria-pressed={active === index}
            className={active === index ? "is-active" : ""}
            onClick={() => setActive(index)}
            key={title}
          >
            <span>{index < active ? "完成" : index === active ? "进行中" : "等待"}</span>
            {title}
          </button>
        ))}
      </div>
      <div className="zsc-process-output">
        <div className="zsc-process-content" key={active}>
          <div className="zsc-process-message">
            <span aria-hidden="true" />
            <div>
              <strong>{stages[active][0]}</strong>
              <p>{stages[active][1]}</p>
            </div>
          </div>
          {active === 0 ? (
            <dl className="zsc-query-conditions">
              <div><dt>分析指标</dt><dd>报销费用</dd></div>
              <div><dt>时间范围</dt><dd>2025 年</dd></div>
              <div><dt>对比方式</dt><dd>同比分析</dd></div>
            </dl>
          ) : null}
          {active === 1 ? (
            <div className="zsc-skeleton-table" aria-label="数据检索加载状态">
              <span /><span /><span /><span />
            </div>
          ) : null}
          {active === 2 ? (
            <div className="zsc-rendered-result">
              <MiniLineChart label="报销费用年度趋势示例" />
              <div>
                <strong>结果已生成</strong>
                <span>趋势图、数据表与异常说明已完成组织。</span>
              </div>
            </div>
          ) : null}
          <small>{active === 1 ? "数据量较大，正在校验并聚合结果。" : "示例内容，仅用于演示处理状态。"}</small>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ type, title }: { type: "bar" | "line"; title: string }) {
  return (
    <article className="zsc-board-card">
      <header>
        <strong>{title}</strong>
        <span className="zsc-card-menu" aria-hidden="true"><i /><i /><i /></span>
      </header>
      {type === "bar" ? <MiniBarChart label={title} /> : <MiniLineChart label={title} />}
    </article>
  );
}

type BoardMode = "separate" | "merged" | "reordered";

function BoardDemo() {
  const [mode, setMode] = useState<BoardMode>("separate");
  const status = {
    separate: "三张分析卡片独立排列，可继续组合或调整顺序。",
    merged: "经营指标合集 · 已合并 3 张卡片。",
    reordered: "卡片顺序已调整，重点趋势被提升到首位。",
  }[mode];
  return (
    <div className="zsc-board-demo">
      <header>
        <div>
          <small>看板集合 1</small>
          <strong>经营指标持续追踪</strong>
        </div>
        <div className="zsc-board-actions" role="group" aria-label="看板卡片交互演示">
          <button type="button" aria-pressed={mode === "separate"} onClick={() => setMode("separate")}>原始看板</button>
          <button type="button" aria-pressed={mode === "merged"} onClick={() => setMode("merged")}>合并为合集</button>
          <button type="button" aria-pressed={mode === "reordered"} onClick={() => setMode("reordered")}>调整顺序</button>
        </div>
      </header>
      <div className={`zsc-collection-label is-${mode}`} aria-live="polite">
        {status}
      </div>
      <div className={`zsc-board-grid is-${mode}`}>
        <ChartCard type="bar" title="近五年销售规模变化" />
        <ChartCard type="line" title="存款余额趋势" />
        <article className="zsc-board-card zsc-kpi-card">
          <header><strong>今年存款趋势</strong></header>
          <div><strong>4.7%</strong><span>融资成本</span></div>
          <div><strong>2%</strong><span>预计年利率</span></div>
          <div><strong>78,610,484</strong><span>平均余额</span></div>
          <small>示例数据</small>
        </article>
      </div>
    </div>
  );
}

const markdownModes = ["标题", "表格", "引用", "正文", "公式", "代码"] as const;
type MarkdownMode = (typeof markdownModes)[number];

function MarkdownPreview() {
  const [mode, setMode] = useState<MarkdownMode>("表格");

  return (
    <div className="zsc-markdown-demo">
      <div className="zsc-markdown-tabs" role="group" aria-label="Markdown 规范类型">
        <strong>Markdown</strong>
        {markdownModes.map((item) => (
          <button
            type="button"
            aria-pressed={mode === item}
            className={mode === item ? "is-active" : ""}
            onClick={() => setMode(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="zsc-markdown-preview" aria-live="polite">
        <header>
          <span>规范预览</span>
          <strong>{mode}</strong>
        </header>
        <div className="zsc-preview-query"><span>用户问题</span><p>请总结 2025 年经营趋势，并列出关键数据。</p></div>
        <div className="zsc-markdown-content" key={mode}>
          {mode === "标题" ? (
            <div className="zsc-doc-copy"><h3>经营趋势洞察</h3><p>通过明确标题层级、段落间距与强调方式，提升长内容的浏览效率。</p><h4>核心结论</h4><p>重点信息保持前置，辅助说明维持舒适的阅读密度。</p></div>
          ) : null}
          {mode === "表格" ? (
            <div className="zsc-table-scroll"><table><thead><tr><th>趋势类别</th><th>核心要点</th><th>关键数据</th></tr></thead><tbody><tr><td>低利率环境</td><td>融资成本持续下降</td><td>4.7%</td></tr><tr><td>数字化转型</td><td>经营分析效率提升</td><td>同比 +12%</td></tr><tr><td>绿色金融</td><td>ESG 资产增长</td><td>示例数据</td></tr></tbody></table></div>
          ) : null}
          {mode === "引用" ? <blockquote>“所有结论需保留可追溯的数据来源与引用关系。”<cite>企业数据输出规范</cite></blockquote> : null}
          {mode === "正文" ? <div className="zsc-doc-copy"><p>正文采用稳定行高与段落节奏，避免模型输出形成连续文字墙。</p><p>关键结论、依据与下一步建议分层呈现，让信息更容易扫描。</p></div> : null}
          {mode === "公式" ? <div className="zsc-formula"><span>同比增长率</span><strong>(本期值 − 同期值) ÷ 同期值 × 100%</strong></div> : null}
          {mode === "代码" ? <pre><code>{`SELECT business_unit, SUM(amount)\nFROM finance_data\nGROUP BY business_unit;`}</code></pre> : null}
        </div>
        <footer className="zsc-preview-footer"><span>内容已按规范渲染</span><span>来源可追溯</span></footer>
      </div>
    </div>
  );
}

function OverviewResult() {
  return (
    <div className="zsc-overview-result">
      <figure className="zsc-overview-figure">
        <picture>
          <source
            srcSet={publicAsset("/assets/projects/zhaocai-smart/17-page-overview.webp")}
            type="image/webp"
          />
          <img
            src={publicAsset("/assets/projects/zhaocai-smart/17-page-overview.png")}
            alt="招财 Smart 部分设计页面总览"
            width="1920"
            height="1080"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </figure>
    </div>
  );
}

const caseSections = [
  ["zsc-overview", "项目概览"],
  ["zsc-background", "业务背景"],
  ["zsc-flow", "体验链路"],
  ["zsc-clarification", "语义澄清"],
  ["zsc-process", "过程反馈"],
  ["zsc-board", "看板沉淀"],
  ["zsc-output", "输出规范"],
  ["zsc-result", "页面总览"],
];

function CaseSectionNav() {
  const [activeSection, setActiveSection] = useState(caseSections[0][0]);

  useEffect(() => {
    const sections = caseSections
      .map(([id]) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-20% 0px -62% 0px", threshold: [0.05, 0.2, 0.5] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="zsc-case-nav" aria-label="招财 Smart 案例章节">
      {caseSections.map(([id, label]) => (
        <a
          className={activeSection === id ? "is-active" : ""}
          href={`#${id}`}
          aria-current={activeSection === id ? "location" : undefined}
          onClick={() => setActiveSection(id)}
          key={id}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

export function ZhaocaiSmartCase() {
  return (
    <section className="zhaocai-case" aria-label="招财 Smart 代码化案例内容">
      <CaseSectionNav />
      <div className="zsc-case-content">
        <article className="zsc-section zsc-section-overview" id="zsc-overview">
          <div className="zsc-overview-grid">
            <div className="zsc-narrative">
              <div className="zsc-heading-row"><h2>项目概览</h2><span>PC 端</span></div>
              <p>面向某国企财务经营分析场景，招财 Smart 让业务人员通过自然语言查询数据，并在同一链路中完成意图澄清、执行反馈、结果解释与看板沉淀。</p>
              <h3>我的工作</h3>
              <ul>
                <li><strong>交互模型：</strong>梳理从提问、澄清、执行到结果沉淀的人机协作链路，并完成高保真原型。</li>
                <li><strong>关键体验：</strong>针对模糊意图，通过主动追问和结构化选项补齐查询条件。</li>
                <li><strong>状态设计：</strong>覆盖断网、生成超时、敏感词过滤等异常情况。</li>
                <li><strong>设计目标：</strong>降低“不知道怎么问”和“担心问错”带来的使用门槛。</li>
              </ul>
            </div>
            <SmartWorkspace />
          </div>
        </article>

        <article className="zsc-section" id="zsc-background">
        <header className="zsc-section-header"><h2>业务背景与核心挑战</h2><p>把原本依赖数据分析师完成的复杂查询，转化为业务人员可直接发起、可理解过程、可持续追踪的自然语言问数体验。</p></header>
        <ChallengeGrid />
        </article>

        <article className="zsc-section" id="zsc-flow">
        <header className="zsc-section-header"><h2>提问、澄清、执行、解释、沉淀体验链路</h2><p>用统一的人机协作流程连接自然语言输入、条件确认、数据执行、结果解释与看板追踪。</p></header>
        <div className="zsc-solution-grid">
          <div className="zsc-narrative">
            <h3>核心方案</h3>
            <ol>
              <li><strong>自然语言问数：</strong>通过多轮澄清明确查询范围，并以结构化数据和图表呈现结果。</li>
              <li><strong>数据与语义配置：</strong>支持数据接入、业务语义和查询规则配置。</li>
              <li><strong>看板沉淀：</strong>将高频问题和结果保存为持续追踪的业务视图。</li>
            </ol>
          </div>
          <FlowDiagram />
        </div>
        </article>

        <article className="zsc-section zsc-section-interaction" id="zsc-clarification">
        <header className="zsc-section-header"><h2>对话式语义澄清</h2><p>聚焦问题不完整的时刻，只追问当前缺失的关键条件，并在执行前确认查询范围。</p></header>
        <div className="zsc-interaction-block zsc-interaction-block-clarify">
          <header><h3>将模糊提问变成可执行条件</h3><p>当问题缺少报销类型等关键信息时，系统保留用户原始提问，只补问缺失条件，并在执行前确认查询范围。</p></header>
          <div className="zsc-two-column">
            <ClarificationDemo />
            <div className="zsc-strategy-copy"><h4>设计判断</h4><ul><li>显示当前识别状态</li><li>仅补问缺失条件</li><li>执行前确认查询范围</li></ul></div>
          </div>
        </div>
        </article>

        <article className="zsc-section zsc-section-interaction" id="zsc-process">
        <header className="zsc-section-header"><h2>AI 执行过程反馈</h2><p>将意图解析、数据检索和图表渲染拆成可见阶段，让用户知道系统正在做什么。</p></header>
        <div className="zsc-interaction-block zsc-interaction-block-process">
          <header><h3>让 AI 处理过程可见</h3><p>将意图解析、数据检索和图表渲染拆成可见阶段，让用户知道系统正在做什么，以及遇到异常后如何继续。</p></header>
          <div className="zsc-two-column zsc-process-layout">
            <div className="zsc-strategy-copy"><h4>状态策略</h4><ul><li>3 秒内使用流式反馈</li><li>超过阈值时说明当前处理环节</li><li>无结果时提供下一次查询入口</li></ul></div>
            <ProcessDemo />
          </div>
        </div>
        </article>

        <article className="zsc-section" id="zsc-board">
        <header className="zsc-section-header"><h2>看板卡片的组合与重排</h2><p>通过合并反馈、空间占位与顺序调整，让一次查询结果逐步沉淀为可持续追踪的业务合集。</p></header>
        <BoardDemo />
        </article>

        <article className="zsc-section zsc-section-markdown" id="zsc-output">
        <header className="zsc-section-header"><h2>模型输出样式与组件规范</h2><p>重点展示标题、正文、表格、引用、公式和代码在界面中的视觉层级、阅读样式与状态反馈。</p></header>
        <MarkdownPreview />
        </article>

        <article className="zsc-section zsc-section-overview-result" id="zsc-result">
        <OverviewResult />
        </article>
      </div>
    </section>
  );
}
