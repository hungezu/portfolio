"use client";

import { type CSSProperties, type MouseEvent as ReactMouseEvent, useEffect, useState } from "react";
import { publicAsset } from "../portfolio-data";
import "./national-science-platform.css";

const sections = [
  ["nsp-overview", "项目概览"],
  ["nsp-structure", "需求结构"],
  ["nsp-prototype", "原型验证"],
  ["nsp-products", "系统落地"],
  ["nsp-rules", "规范协作"],
  ["nsp-result", "角色变化"],
] as const;

const screens = [
  {
    label: "高端智库首页",
    title: "先建立科技情报的整体认知，再进入具体任务",
    description: "持续完善首页、我的素材库、案例广场、研究需求分析和技术体系分析，并补充关键交互状态。",
    src: "/assets/projects/gkx/think-tank-home.jpg",
  },
  {
    label: "科技专题服务",
    title: "把产业、技术、机构、人才和报告放进同一专题上下文",
    description: "通过专题全景和层级导航，将复杂关联信息组织成从全局到细节的连续浏览路径。",
    src: "/assets/projects/gkx/topic-service.jpg",
  },
  {
    label: "门户后台列表",
    title: "高密度页面首先解决扫描效率和操作顺序",
    description: "统一筛选、列表、状态和操作位置，使不同管理模块沿用相同的信息节奏。",
    src: "/assets/projects/gkx/portal-admin-list.jpg",
  },
  {
    label: "流程设计器",
    title: "把对象管理和流程建模拆成两种明确任务",
    description: "用户先管理流程对象，再进入专注的节点设计工作区，减少管理状态和编辑状态混淆。",
    src: "/assets/projects/gkx/workflow-builder.jpg",
  },
] as const;

const supportingScreens = [
  {
    title: "领域技术路线",
    description: "将指标、发展趋势、里程碑与关键技术清单组织在同一分析视图中。",
    src: "/assets/projects/gkx/technology-route.jpg",
  },
  {
    title: "关键技术详情",
    description: "通过技术清单与分支树并列展示，支持从趋势判断继续查看细分方向。",
    src: "/assets/projects/gkx/technology-detail.jpg",
  },
  {
    title: "战略咨询报告",
    description: "以领域分类、推荐内容和权限状态组织报告浏览与检索任务。",
    src: "/assets/projects/gkx/strategy-reports.jpg",
  },
  {
    title: "人才动态资讯",
    description: "统一筛选、订阅、重点资讯和内容列表，保持高信息量下的阅读层级。",
    src: "/assets/projects/gkx/talent-news.jpg",
  },
] as const;

const prototypeScreens = [
  {
    label: "管理入口",
    title: "先确认对象、状态和操作顺序",
    description: "通过列表建立流程对象的管理入口，集中呈现发布时间、发布状态和可执行操作。",
    src: "/assets/projects/gkx/portal-admin-detail.jpg",
  },
  {
    label: "流程设计器",
    title: "再进入专注的流程建模任务",
    description: "将节点画布与属性配置放在同一工作区，避免管理状态和流程编辑状态互相干扰。",
    src: "/assets/projects/gkx/workflow-builder-detail.jpg",
  },
] as const;

type ExperienceGroup = "all" | "framework" | "data" | "form";

type ExperienceNode = {
  id: string;
  label: string;
  group: ExperienceGroup;
  kind: "core" | "primary" | "secondary";
  x: number;
  y: number;
  size: number;
  description: string;
  role: string;
  scene: string;
  relation: string;
};

const experienceGroups: Array<{ id: ExperienceGroup; label: string }> = [
  { id: "all", label: "全部" },
  { id: "framework", label: "框架与导航" },
  { id: "data", label: "数据与反馈" },
  { id: "form", label: "表单与选择" },
];

const aiWorkflowSteps = [
  ["业务上下文", "标书、概设、评审意见与既有规则"],
  ["结构化 Spec", "系统、角色、任务、页面与待确认项"],
  ["Codex 探索", "页面结构、交互状态与实现方案"],
  ["可运行原型", "在浏览器里验证流程、字段和反馈"],
  ["设计收敛", "调整逻辑、视觉与组件使用规则"],
  ["规范沉淀", "Markdown 规范、检查项与复用页面"],
];

function AIWorkflowMap() {
  return (
    <section className="nsp-ai-workflow" aria-labelledby="nsp-ai-workflow-title">
      <header>
        <h3 id="nsp-ai-workflow-title">把 AI 产出放进可校验的设计循环</h3>
        <p>Codex 负责加速材料整理、方案探索和原型生成；我负责确认事实、业务边界、交互逻辑与最终交付质量。</p>
      </header>

      <div className="nsp-ai-boundary">
        <article className="is-ai">
          <strong>AI Loop · 生成与探索</strong>
          <ul><li>拆解长文档</li><li>生成结构初稿</li><li>搭建网页原型</li><li>整理规范版本</li></ul>
        </article>
        <article>
          <strong>Human Loop · 判断与决策</strong>
          <ul><li>核对事实范围</li><li>选择页面结构</li><li>校验流程状态</li><li>确定评审版本</li></ul>
        </article>
      </div>

      <ol className="nsp-ai-steps">
        {aiWorkflowSteps.map(([title, text], index) => (
          <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><strong>{title}</strong><p>{text}</p></li>
        ))}
      </ol>

      <div className="nsp-ai-validation">
        <span>预览</span><i aria-hidden="true" /><span>评审</span><i aria-hidden="true" /><span>修正</span><i aria-hidden="true" /><span>再次验证</span>
      </div>
    </section>
  );
}

const experienceNodes: ExperienceNode[] = [
  { id: "core", label: "统一体验骨架", group: "all", kind: "core", x: 50, y: 42, size: 176, description: "把跨系统反复出现的导航、数据反馈和输入规则沉淀为共同语言。", role: "统一体验基线", scene: "覆盖多个核心系统与合作方页面", relation: "向三个任务簇提供一致的层级、状态和交互边界。" },
  { id: "framework", label: "框架与导航", group: "framework", kind: "primary", x: 18, y: 38, size: 132, description: "保持不同系统入口、页面骨架和层级路径的一致认知。", role: "稳定跨系统定位", scene: "智库、专题服务、门户后台、流程设计器", relation: "连接全局导航、页面骨架和层级定位。" },
  { id: "global-nav", label: "全局导航", group: "framework", kind: "secondary", x: 8, y: 15, size: 108, description: "统一一级入口、返回路径和当前页面状态。", role: "建立全局方向感", scene: "多系统切换与跨模块访问", relation: "由框架规则约束入口名称、选中态和返回逻辑。" },
  { id: "page-shell", label: "页面骨架", group: "framework", kind: "secondary", x: 29, y: 13, size: 108, description: "依据任务选择列表、表单、详情、流程或分析骨架。", role: "先确定主任务结构", scene: "管理、录入、阅读、分析与流程任务", relation: "承接导航层级，并决定内容主滚动区。" },
  { id: "hierarchy", label: "层级定位", group: "framework", kind: "secondary", x: 8, y: 66, size: 108, description: "通过标题、面包屑和局部导航保持上下文连续。", role: "减少跨层级迷失", scene: "详情、专题与深层工作区", relation: "补充全局导航无法表达的局部位置。" },
  { id: "layout-rhythm", label: "布局节奏", group: "framework", kind: "secondary", x: 29, y: 69, size: 108, description: "统一信息密度、留白和关键操作的出现顺序。", role: "控制阅读优先级", scene: "高密度管理页与内容型页面", relation: "让不同页面骨架仍保持同一种平台节奏。" },
  { id: "data", label: "数据与反馈", group: "data", kind: "primary", x: 82, y: 38, size: 132, description: "统一数据展示、过程可见和异常反馈的表达方式。", role: "让状态可以被理解", scene: "指标、图表、任务进度与系统反馈", relation: "连接指标展示、分析图表、过程状态和异常反馈。" },
  { id: "metrics", label: "指标展示", group: "data", kind: "secondary", x: 71, y: 13, size: 108, description: "让指标名称、口径、数值和趋势保持稳定层级。", role: "支持快速扫描", scene: "首页概览、指标看板与专题分析", relation: "为分析图表提供统一的数据入口。" },
  { id: "analysis", label: "分析图表", group: "data", kind: "secondary", x: 92, y: 15, size: 108, description: "根据比较、趋势或结构关系选择对应图表。", role: "匹配分析任务", scene: "趋势、对比、分布和技术路线", relation: "承接指标口径，并提供继续下钻的路径。" },
  { id: "process-state", label: "过程状态", group: "data", kind: "secondary", x: 92, y: 66, size: 108, description: "展示加载、处理中、成功和失败的连续过程。", role: "降低等待不确定性", scene: "AI 生成、流程执行与异步任务", relation: "与异常反馈共同构成可恢复的状态链。" },
  { id: "error-feedback", label: "异常反馈", group: "data", kind: "secondary", x: 71, y: 69, size: 108, description: "说明问题、保留上下文，并提供明确恢复动作。", role: "支持错误恢复", scene: "数据失败、权限不足与内容为空", relation: "补充过程状态的失败与回退路径。" },
  { id: "form", label: "表单与选择", group: "form", kind: "primary", x: 50, y: 70, size: 132, description: "统一输入、选择、确认和校验的完整交互链路。", role: "降低操作成本", scene: "录入、筛选、配置与审批任务", relation: "连接字段输入、选择确认和校验回退。" },
  { id: "field-input", label: "字段输入", group: "form", kind: "secondary", x: 33, y: 89, size: 108, description: "通过分组、标签和帮助信息明确需要填写的内容。", role: "建立清晰输入预期", scene: "单页表单、批量录入与配置页面", relation: "向校验回退提供原始输入上下文。" },
  { id: "selection", label: "选择确认", group: "form", kind: "secondary", x: 67, y: 89, size: 108, description: "在关键选择后明确结果、影响范围和下一步。", role: "控制决策风险", scene: "筛选、状态变更与流程配置", relation: "在提交前与字段输入共同形成确认点。" },
  { id: "validation", label: "校验回退", group: "form", kind: "secondary", x: 50, y: 91, size: 108, description: "保留已填内容，指出错误位置并给出恢复方式。", role: "避免重复操作", scene: "表单错误、规则冲突与权限限制", relation: "承接输入与确认后的异常处理。" },
];

const experienceEdges = [
  ["core", "framework", "framework"], ["framework", "global-nav", "framework"], ["framework", "page-shell", "framework"], ["framework", "hierarchy", "framework"], ["framework", "layout-rhythm", "framework"],
  ["core", "data", "data"], ["data", "metrics", "data"], ["data", "analysis", "data"], ["data", "process-state", "data"], ["data", "error-feedback", "data"],
  ["core", "form", "form"], ["form", "field-input", "form"], ["form", "selection", "form"], ["form", "validation", "form"],
] as const;

const experienceNodeMap = new Map(experienceNodes.map(node => [node.id, node]));

export type NationalPlatformView = "story" | "systems" | "design-system";

function openWithPortfolioContext(event: ReactMouseEvent<HTMLAnchorElement>, href: string) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const current = new URLSearchParams(window.location.search);
  const returnProject = current.get("returnProject");
  const returnY = current.get("returnY");
  if (!returnProject || !returnY) return;
  event.preventDefault();
  const next = new URL(href, window.location.origin);
  next.searchParams.set("from", "portfolio");
  next.searchParams.set("returnProject", returnProject);
  next.searchParams.set("returnY", returnY);
  window.location.assign(`${next.pathname}${next.search}`);
}

export function ProjectSubnav({ active }: { active: NationalPlatformView }) {
  const items: Array<[NationalPlatformView, string, string]> = [
    ["story", "项目故事", "/portfolio/project/gkx/"],
    ["systems", "系统实景", "/portfolio/project/gkx/systems/"],
    ["design-system", "设计规范", "/portfolio/project/gkx/design-system/"],
  ];
  return (
    <nav className="nsp-subnav" aria-label="深圳国际科技信息中心内容导航">
      {items.map(([id, label, href]) => <a href={href} onClick={event => openWithPortfolioContext(event, href)} className={active === id ? "active" : ""} aria-current={active === id ? "page" : undefined} key={id}>{label}</a>)}
    </nav>
  );
}

function SystemScreenShowcase({ activeScreen, setActiveScreen }: { activeScreen: number; setActiveScreen: (index: number) => void }) {
  const currentScreen = screens[activeScreen];
  return (
    <div className="nsp-screen-showcase">
      <div className="nsp-screen-tabs" role="tablist" aria-label="系统运行页面切换">{screens.map((screen, index) => <button type="button" role="tab" aria-selected={activeScreen === index} className={activeScreen === index ? "active" : ""} onClick={() => setActiveScreen(index)} key={screen.label}>{screen.label}</button>)}</div>
      <figure className="nsp-screen-stage" key={currentScreen.label}><img src={publicAsset(currentScreen.src)} alt={`${currentScreen.label}代码运行页面`} loading="lazy" decoding="async" /><figcaption><div><strong>{currentScreen.title}</strong></div><p>{currentScreen.description}</p></figcaption></figure>
    </div>
  );
}

function ExperienceLanguageMap() {
  const [activeGroup, setActiveGroup] = useState<ExperienceGroup>("all");
  const [selectedNodeId, setSelectedNodeId] = useState("core");
  const selectedNode = experienceNodeMap.get(selectedNodeId) ?? experienceNodes[0];

  const selectGroup = (group: ExperienceGroup) => {
    setActiveGroup(group);
    setSelectedNodeId(group === "all" ? "core" : group);
  };

  return (
    <section className="nsp-language-map" aria-labelledby="nsp-language-map-title">
      <header className="nsp-language-map-head">
        <div><h3 id="nsp-language-map-title">视觉设计语言地图</h3><p>从统一体验骨架出发，向不同产品任务复用同一套导航、数据反馈与输入规则。</p></div>
        <div className="nsp-language-filters" role="group" aria-label="筛选设计语言类别">
          {experienceGroups.map(group => <button type="button" className={activeGroup === group.id ? "active" : ""} aria-pressed={activeGroup === group.id} onClick={() => selectGroup(group.id)} key={group.id}>{group.label}</button>)}
        </div>
      </header>
      <div className="nsp-language-viewport" tabIndex={0} aria-label="可横向查看视觉设计语言关系网络">
        <div className="nsp-language-canvas">
          <svg className="nsp-language-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {experienceEdges.map(([fromId, toId, group]) => {
              const from = experienceNodeMap.get(fromId);
              const to = experienceNodeMap.get(toId);
              if (!from || !to) return null;
              const muted = activeGroup !== "all" && activeGroup !== group;
              const selected = selectedNodeId === fromId || selectedNodeId === toId;
              return <line className={`${muted ? "muted" : ""}${selected ? " selected" : ""}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} vectorEffect="non-scaling-stroke" key={`${fromId}-${toId}`} />;
            })}
          </svg>
          {experienceNodes.map(node => {
            const visible = activeGroup === "all" || node.group === "all" || node.group === activeGroup;
            const selected = selectedNodeId === node.id;
            const style = { "--node-x": `${node.x}%`, "--node-y": `${node.y}%`, "--node-size": `${node.size}px` } as CSSProperties;
            return <button type="button" className={`nsp-language-node is-${node.kind}${visible ? "" : " muted"}${selected ? " selected" : ""}`} style={style} aria-pressed={selected} disabled={!visible} onClick={() => setSelectedNodeId(node.id)} key={node.id}><span>{node.label}</span></button>;
          })}
        </div>
      </div>
      <div className="nsp-language-detail" aria-live="polite">
        <div><strong>{selectedNode.label}</strong><p>{selectedNode.description}</p></div>
        <dl><div><dt>作用</dt><dd>{selectedNode.role}</dd></div><div><dt>使用场景</dt><dd>{selectedNode.scene}</dd></div><div><dt>关系</dt><dd>{selectedNode.relation}</dd></div></dl>
      </div>
    </section>
  );
}

function SystemsDetailPage({ activeScreen, setActiveScreen }: { activeScreen: number; setActiveScreen: (index: number) => void }) {
  return (
    <div className="national-platform-page nsp-subpage">
      <header className="nsp-subpage-hero"><div className="nsp-shell"><ProjectSubnav active="systems" /><h1>八个代码运行页面，<br />展示不同产品任务</h1><p>这里集中保存主故事中的页面证据。所有业务数据均为示例内容，页面用于展示信息架构、交互模式和视觉一致性。</p></div></header>
      <section className="nsp-section"><div className="nsp-shell"><SystemScreenShowcase activeScreen={activeScreen} setActiveScreen={setActiveScreen} /><div className="nsp-evidence-wall"><header><h2>补充页面</h2><p>进一步展示技术分析、报告浏览和人才信息等不同信息密度。</p></header><div>{supportingScreens.map(screen => <figure key={screen.title}><img src={publicAsset(screen.src)} alt={`${screen.title}代码运行页面`} loading="lazy" decoding="async" /><figcaption><strong>{screen.title}</strong><p>{screen.description}</p></figcaption></figure>)}</div></div></div></section>
    </div>
  );
}

export function GkxDesignSystemInteractive() {
  const previewUrl = publicAsset("/assets/projects/gkx/design-preview/index.html?id=page-index&embed=1");
  return <div className="nsp-design-embed gkx-md-interactive"><iframe src={previewUrl} title="深圳国际科技信息中心可交互设计规范" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms" /></div>;
}

function DesignSystemDetailPage() {
  return (
    <div className="national-platform-page nsp-subpage">
      <header className="nsp-subpage-hero"><div className="nsp-shell"><ProjectSubnav active="design-system" /><h1>让多支团队，<br />做出同一个平台</h1><p>深圳国际科技信息中心包含多个子系统，参与方和交付节奏并不一致。我的工作不只是一套界面，而是让总集成方、合作方和研发沿用同一套设计判断。</p></div></header>
      <section className="nsp-section nsp-spec-story-section"><div className="nsp-shell"><div className="nsp-spec-narrative"><h2>我把反复出现在评审里的问题，写进一套可执行规范</h2><div className="nsp-spec-narrative-copy"><p>前期，我与总集成方对齐整体风格和页面布局；随着更多系统并行推进，再把页面类型、组件状态、响应式和交付检查整理为 Markdown，提供给合作方和研发使用。</p><p>Codex 负责把规则持续转成可浏览、可操作的网页工作台。我保留对业务内容、交互边界和最终质量的判断，并在评审中继续修正规范。</p><dl><div><dt>我的工作</dt><dd>设计方向、UX/UI、规范维护与还原度审核</dd></div><div><dt>AI 参与</dt><dd>规则整理、页面生成、状态补全与版本维护</dd></div></dl></div></div></div></section>
      <section className="nsp-section nsp-spec-visual-section"><div className="nsp-shell"><header className="nsp-story-heading nsp-spec-heading"><h2>这不是规范截图，<br />而是它的实际工作方式</h2><p>左侧目录展示规范覆盖的页面与组件，选择后可以看到对应内容的开头。受保密协议约束，具体规则、交互说明和实现细节不对外公开。</p></header><GkxDesignSystemInteractive /></div></section>
    </div>
  );
}

export function NationalSciencePlatformCase({ view = "story" }: { view?: NationalPlatformView }) {
  const [activeSection, setActiveSection] = useState("nsp-overview");
  const [activeScreen, setActiveScreen] = useState(0);
  const [activePrototype, setActivePrototype] = useState(0);

  useEffect(() => {
    const targets = sections.map(([id]) => document.getElementById(id)).filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver(entries => {
      const current = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current?.target.id) setActiveSection(current.target.id);
    }, { rootMargin: "-18% 0px -58%", threshold: [0.08, 0.24, 0.5] });
    targets.forEach(target => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  if (view === "systems") return <SystemsDetailPage activeScreen={activeScreen} setActiveScreen={setActiveScreen} />;
  if (view === "design-system") return <DesignSystemDetailPage />;

  const currentPrototype = prototypeScreens[activePrototype];

  return (
    <div className="national-platform-page" aria-label="深圳国际科技信息中心项目案例">
      <nav className="zhaocai-locator" aria-label="案例章节定位">
        {sections.map(([id, label], index) => (
          <a className={activeSection === id ? "active" : ""} href={`#${id}`} key={id}><b>{String(index + 1).padStart(2, "0")}</b><em>{label}</em></a>
        ))}
      </nav>

      <section className="nsp-hero" id="nsp-overview" data-nsp-section>
        <div className="nsp-shell">
          <ProjectSubnav active="story" />
          <div className="nsp-hero-main">
            <header className="nsp-hero-heading">
              <div><h1><span>深圳国际</span><span>科技信息中心</span></h1></div>
              <p>从整体风格和核心系统，到在线原型、Markdown 规范与多方评审，我同时负责产品体验和设计交付方式。</p>
            </header>
            <figure className="nsp-hero-proof">
              <img src={publicAsset("/assets/projects/gkx/think-tank-home.jpg")} alt="高端新型智库代码运行首页" />
              <figcaption><strong>新型高端智库首页</strong><p>页面中的业务信息、数据和流程均已脱敏或重构，仅展示设计方法和工作方式。</p></figcaption>
            </figure>
          </div>
          <div className="nsp-hero-meta">
            <dl><div><dt>项目周期</dt><dd>2025.11 — 至今</dd></div><div><dt>我的角色</dt><dd>平台 UX/UI 设计</dd></div><div><dt>工作范围</dt><dd>产品设计 / 规范 / 协作审核</dd></div><div><dt>AI 工具</dt><dd>Codex</dd></div></dl>
          </div>
        </div>
      </section>

      <section className="nsp-section nsp-structure" id="nsp-structure" data-nsp-section>
        <div className="nsp-shell nsp-section-stack nsp-structure-layout">
          <header className="nsp-story-heading"><h2>从分散材料里，<br />先界定产品范围</h2><p>面对六类服务方向、评审意见和不断追加的反馈，我先用 Codex 形成结构化初稿，再判断哪些是事实、哪些需要确认，以及哪些只是设计假设。</p></header>
          <div className="nsp-story-body"><div className="nsp-structure-stage">
              <div className="nsp-responsibility-notes"><article><strong>产品工作：确定系统、角色、任务和页面边界</strong><p>避免直接从标书标题推导页面，先确认用户要完成什么。</p></article><article className="is-codex"><strong>Codex：从长文档中提取模块与待确认项</strong><p>把材料转成可核对的结构，减少遗漏与重复理解。</p></article><article><strong>设计判断：重新组织优先级和系统关系</strong><p>删除不成立的默认内容，将争议问题带回评审。</p></article></div>
              <div className="nsp-requirement-board"><header><strong>需求结构化结果</strong><span>脱敏示意</span></header><div className="nsp-direction-grid"><span>科技资源</span><span>新型智库</span><span>决策支持</span><span>专题服务</span><span>信息交流</span><span>科学数据</span></div><dl><div><dt>已确认</dt><dd>系统范围、页面目标、核心任务</dd></div><div><dt>待确认</dt><dd>角色权限、字段内容、业务边界</dd></div></dl><footer>阶段产出：页面范围、需求清单与评审问题</footer></div>
            </div>
          </div>
        </div>
      </section>

      <section className="nsp-section nsp-prototype" id="nsp-prototype" data-nsp-section>
        <div className="nsp-shell nsp-editorial-grid">
          <header className="nsp-story-heading"><h2>用可运行原型，<br />把描述变成操作</h2><p>门户后台和官网集群需要尽快进入产品讨论。我使用 Codex 生成可运行网页，再重新调整导航、任务流程、字段与关键状态，而不是直接把生成结果当成最终方案。</p></header>
          <div className="nsp-story-body"><AIWorkflowMap />
            <div className="nsp-prototype-showcase">
              <div className="nsp-prototype-tabs" role="tablist" aria-label="原型页面切换">{prototypeScreens.map((screen, index) => <button type="button" role="tab" aria-selected={activePrototype === index} className={activePrototype === index ? "active" : ""} onClick={() => setActivePrototype(index)} key={screen.label}>{String(index + 1).padStart(2, "0")} · {screen.label}</button>)}</div>
              <figure key={currentPrototype.label}><img src={publicAsset(currentPrototype.src)} alt={`${currentPrototype.label}代码运行页面`} loading="lazy" decoding="async" /><figcaption><div><strong>{currentPrototype.title}</strong></div><p>{currentPrototype.description}</p></figcaption></figure>
            </div>
          </div>
        </div>
      </section>

      <section className="nsp-section nsp-products" id="nsp-products" data-nsp-section>
        <div className="nsp-shell nsp-section-stack nsp-products-layout">
          <header className="nsp-story-heading"><h2>让不同系统，<br />共享同一套体验骨架</h2><p>高端智库、科技专题服务、门户后台和流程设计器承担不同任务，但共用导航、状态、组件与信息层级规则。主页面只保留一项代表性成果，完整页面统一放在系统实景中。</p></header>
          <div className="nsp-story-body"><ExperienceLanguageMap /><figure className="nsp-system-teaser"><img src={publicAsset("/assets/projects/gkx/technology-route.jpg")} alt="领域技术路线代码运行页面" loading="lazy" decoding="async" /><figcaption><strong>领域技术路线</strong><p>将指标、趋势、里程碑和关键技术清单组织在同一分析视图中。</p></figcaption></figure>
            <a className="nsp-deep-link" href="/portfolio/project/gkx/systems/" onClick={event => openWithPortfolioContext(event, "/portfolio/project/gkx/systems/")}><strong>浏览全部8个代码运行页面</strong></a>
          </div>
        </div>
      </section>

      <section className="nsp-section nsp-rules" id="nsp-rules" data-nsp-section>
        <div className="nsp-shell nsp-section-stack nsp-rules-layout">
          <header className="nsp-story-heading"><h2>把评审中的共识，<br />沉淀为协作规范</h2><p>我持续修改概设和 Markdown 规则，补充遗漏的页面类型、组件及交互状态；同时审核合作方页面的还原度、视觉一致性与交互规范。</p></header>
          <div className="nsp-story-body"><dl className="nsp-rule-flow"><div><dt>对齐</dt><dd>与总集成方确认整体风格和页面布局</dd></div><div><dt>交付</dt><dd>向合作方和研发提供可执行的 Markdown 规范</dd></div><div><dt>评审</dt><dd>核对页面还原度、组件状态与交互边界</dd></div></dl>
            <div className="nsp-ai-assets" aria-label="AI 设计工作流沉淀资产"><article><strong>结构化 Spec</strong><p>把业务目标、角色、数据与页面边界转成可核对输入。</p></article><article><strong>状态检查清单</strong><p>覆盖加载、空、错误、权限和关键交互边界。</p></article><article><strong>Markdown 设计规则</strong><p>让合作方、研发和 AI 共用同一套页面与组件判断。</p></article><article><strong>可运行原型</strong><p>用浏览器版本进入产品评审，再持续修正方案。</p></article></div>
            <a className="nsp-deep-link" href="/portfolio/project/gkx/design-system/" onClick={event => openWithPortfolioContext(event, "/portfolio/project/gkx/design-system/")}><strong>查看设计规范的结构与工作方式</strong></a>
          </div>
        </div>
      </section>

      <section className="nsp-result" id="nsp-result" data-nsp-section>
        <div className="nsp-shell nsp-result-grid"><div><h2>AI 扩大了我的产出范围，<br />设计判断仍由我负责</h2><p>Codex 承担材料整理、原型生产和规范维护中的重复工作，我把精力放在系统架构、体验判断、设计标准与多方协作。</p></div><dl><div><dt>从页面执行</dt><dd>到平台设计方向</dd></div><div><dt>从单次交付</dt><dd>到可复用设计规范</dd></div><div><dt>从个人产出</dt><dd>到多团队质量控制</dd></div></dl></div>
      </section>
    </div>
  );
}
