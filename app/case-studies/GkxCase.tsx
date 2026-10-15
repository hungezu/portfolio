"use client";

import { useEffect, useRef, useState, type RefObject, type MouseEvent as ReactMouseEvent } from "react";
import { Steps } from "@arco-design/web-react";
import { IconArrowDown, IconArrowRight } from "@arco-design/web-react/icon";
import { publicAsset, type Project } from "../portfolio-data";
import { ProjectLocator } from "../project-locator";
import { GkxPaperQueryDemo } from "./GkxPaperQueryDemo";
import { GkxSupplementalMaterials } from "./GkxSupplementalMaterials";
import publicCopy from "./gkx-public-copy.json";
import "./gkx-case.css";

export type GkxCaseProps = { project: Project; legacyView?: "story" | "systems" | "design-system" };

type OverviewSection = {
  id: string; title: string; lead: string;
  projectScale: { amount: string; unit: string; label: string; sourceLabel: string; sourceUrl: string };
  goals: Array<{ label: string; title: string; text: string }>;
  scope: { portal: string; systems: Array<{ name: string }> };
};

type StrategySection = {
  id: string; title: string; lead: string;
  principles: Array<{ title: string; text: string }>;
  taskComparisons: Array<{ title: string; task: string; priorities: string[]; figureId: string }>;
  closing: string;
};

type RulesSection = {
  id: string; title: string; lead: string;
  modules: Array<{
    key: string; title: string; problem: string; decision: string; reason: string;
    details: string[]; beforeLabel?: string; afterLabel?: string;
    tabs?: Array<{ label: string; figureId: string }>;
  }>;
  workbench: { title: string; text: string; interactionHint: string };
};

type PrototypeSection = {
  id: string; title: string; lead: string;
  examples: Array<{ title: string; text: string; figureId: string }>;
};

type SupplierSection = {
  id: string; title: string; lead: string;
  auditDimensions: Array<{ number: string; title: string; summary: string; points: string[] }>;
  closing: string;
};

type OutcomesSection = {
  id: string; title: string; lead: string;
  outcomes: Array<{ title: string; text: string }>;
  reflections: Array<{ number: string; title: string; text: string }>;
};

type PublicCopy = {
  hero: {
    title: string; subtitle: string; roleLabel: string; role: string;
    scopeLabel: string; scope: string; methodLabel: string; method: string;
  };
  navigation: Array<{ id: string; label: string }>;
  sections: [OverviewSection, StrategySection, RulesSection, PrototypeSection, SupplierSection, OutcomesSection];
  captions: Record<string, string>;
};

const copy = publicCopy as unknown as PublicCopy;
const [overviewCopy, strategyCopy, rulesCopy, prototypeCopy, supplierCopy, outcomesCopy] = copy.sections;
const sections = copy.navigation.map(({ id, label }) => [id, label] as const);
const legacyAnchors: Record<string, string> = {
  "gkx-business": "nsp-rules",
  "gkx-system": "nsp-rules",
  "gkx-validation": "nsp-prototype",
  "nsp-overview": "gkx-overview",
  "nsp-structure": "gkx-systems",
  "nsp-products": "gkx-systems",
  "nsp-systems-overview": "gkx-systems",
  "nsp-system-screens": "gkx-systems",
  "nsp-supporting-screens": "gkx-materials",
  "nsp-design-overview": "gkx-design-system",
  "nsp-design-method": "gkx-design-system",
  "nsp-design-preview": "gkx-collaboration",
  "nsp-result": "gkx-outcomes",
};
const assetRoot = "/assets/projects/gkx/case-study";

type ImageAsset = { src: string; alt: string; caption: string; width: number; height: number };

const assets = {
  projectScope: { src: `${assetRoot}/ui/project-scope-map.webp`, alt: "智慧门户系统作为统一业务入口，连接新型高端智库、科技情报挖掘平台、情报管理系统、超大规模智算引擎及其他业务系统；四大主要业务系统与其他业务系统均由门户连接", caption: "项目范围 · 门户与主要业务系统的关系", width: 1817, height: 866 },
  aiWorkflow: { src: `${assetRoot}/ui/ai-human-workflow-codex.png`, alt: "AI 生成与探索、人工判断与决策通过持续验证形成双环协作，连接业务上下文、结构化设计输入、设计约束与资产沉淀", caption: "AI 与人工协作工作流", width: 1862, height: 845 },
  portal: { src: `${assetRoot}/ui/portal-workspace.png`, alt: "智慧门户我的空间界面，包含资料目录与文档列表", caption: copy.captions["ui-portal"], width: 1400, height: 778 },
  reading: { src: `${assetRoot}/ui/portal-reading.png`, alt: "智慧门户智能阅读工作区，左侧目录、中间原文、右侧辅助信息", caption: copy.captions["ui-reading"], width: 1400, height: 778 },
  maas: { src: `${assetRoot}/ui/maas-model-gallery.png`, alt: "超大规模智算引擎内的 MaaS 模型广场界面，展示模型筛选与模型卡片", caption: copy.captions["ui-maas"], width: 1400, height: 778 },
  thinkTank: { src: "/assets/projects/gkx/think-tank-home.jpg", alt: "新型高端智库首页，集中呈现科技情报概览与内容入口", caption: "新型高端智库 · 首页概览", width: 1800, height: 786 },
  paperList: { src: `${assetRoot}/ui/paper-list-no-select-all.png?v=1`, alt: "情报管理论文管理界面，包含统一搜索、筛选与行操作", caption: copy.captions["ui-paper-list"], width: 1440, height: 800 },
  paperBefore: { src: `${assetRoot}/ui/paper-list-before.png`, alt: "情报管理论文管理调整前界面，编号与名称查询入口分开", caption: copy.captions["ui-paper-before"], width: 1440, height: 800 },
  paperDetail: { src: `${assetRoot}/ui/paper-detail-modal.png`, alt: "情报管理论文详情弹窗，背景保留当前列表上下文", caption: copy.captions["ui-paper-detail"], width: 1440, height: 800 },
  paperEdit: { src: `${assetRoot}/ui/paper-edit-modal.png`, alt: "情报管理论文编辑弹窗，背景保留当前列表上下文", caption: copy.captions["ui-paper-edit"], width: 1440, height: 800 },
  importError: { src: `${assetRoot}/ui/paper-import-error.png`, alt: "情报管理批量导入错误反馈，列出错误行并提供重新上传", caption: copy.captions["ui-import-error"], width: 1440, height: 800 },
} satisfies Record<string, ImageAsset>;

const figureById: Record<string, ImageAsset> = {
  "ui-paper-list": assets.paperList,
  "ui-reading": assets.reading,
  "ui-maas": assets.maas,
  "ui-portal": assets.portal,
  "ui-think-tank": assets.thinkTank,
};

function ProjectFigure({ asset, onOpen, className = "", priority = false, description }: {
  asset: ImageAsset;
  onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void;
  className?: string;
  priority?: boolean;
  description?: string;
}) {
  return <figure className={`gkx-project-figure ${className}`.trim()}>
    <button type="button" className="gkx-image-button" aria-label={`放大查看：${asset.caption}`} aria-description={description} onClick={event => onOpen(asset, event.currentTarget)}>
      <img src={publicAsset(asset.src)} alt={asset.alt} width={asset.width} height={asset.height} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" />
      <span aria-hidden="true">放大查看</span>
    </button>
    <figcaption><strong>{asset.caption}</strong></figcaption>
  </figure>;
}

function ImageViewer({ asset, originalSize, setOriginalSize, onClose, dialogRef, closeButtonRef }: {
  asset: ImageAsset;
  originalSize: boolean;
  setOriginalSize: (value: boolean) => void;
  onClose: () => void;
  dialogRef: RefObject<HTMLDivElement | null>;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  return <div className="gkx-lightbox" role="dialog" aria-modal="true" aria-labelledby="gkx-viewer-title" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={`gkx-lightbox__panel${originalSize ? " is-original" : ""}`} ref={dialogRef}>
      <header>
        <div><strong id="gkx-viewer-title">{asset.caption}</strong><span>{originalSize ? "原始尺寸" : "适合窗口"}</span></div>
        <div className="gkx-lightbox__actions">
          <button type="button" aria-pressed={originalSize} onClick={() => setOriginalSize(!originalSize)}>{originalSize ? "适合窗口" : "原始尺寸"}</button>
          <button ref={closeButtonRef} type="button" onClick={onClose}>关闭</button>
        </div>
      </header>
      <div className="gkx-lightbox__canvas">
        <img src={publicAsset(asset.src)} alt={asset.alt} width={asset.width} height={asset.height} />
      </div>
    </div>
  </div>;
}

function SectionHeading({ section, titleId, number, label, leadSegments }: {
  section: { title: string; lead: string }; titleId: string; number: string; label: string; leadSegments?: string[];
}) {
  return <header className="gkx-section-heading"><p className="gkx-chapter-index">{number}<span>{label}</span></p><h2 id={titleId}>{section.title}</h2><p className={`gkx-section-lead${leadSegments ? " gkx-workflow-subtitle" : ""}`}>{leadSegments ? leadSegments.flatMap((segment, index) => [index > 0 ? <IconArrowRight key={`separator-${index}`} aria-hidden="true" /> : null, <span key={segment}>{segment}</span>]) : section.lead}</p></header>;
}

function FigureDetail({ asset, viewBox, label, onOpen, className = "" }: {
  asset: ImageAsset; viewBox: string; label: string;
  onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void; className?: string;
}) {
  return <figure className={`gkx-figure-detail ${className}`.trim()}>
    <figcaption>{label}</figcaption>
    <button type="button" className="gkx-image-button" aria-label={`查看完整界面：${label}`} onClick={event => onOpen(asset, event.currentTarget)}>
      <svg viewBox={viewBox} role="img" aria-label={label}><image href={publicAsset(asset.src)} width={asset.width} height={asset.height} /></svg><span aria-hidden="true">查看完整界面</span>
    </button>
  </figure>;
}

const taskFlow = [
  { label: "检索记录", task: "先找到需要处理的业务对象", decision: "用统一搜索表达目标，用筛选进一步限定范围。列表同时提供字段、选择入口和行操作。", context: "对象与查询条件", feedback: "结果仍在当前列表中可见", asset: assets.paperList },
  { label: "核对详情", task: "查看单条记录，保留列表上下文", decision: "短时查看使用同页弹窗，核对结束后可以继续当前列表任务，不必重新定位记录。", context: "当前记录与来源列表", feedback: "详情关闭后回到原任务", asset: assets.paperDetail },
  { label: "编辑记录", task: "让修改范围与当前对象对应", decision: "在独立编辑状态中组织字段与提交入口，把查看和修改两种意图分开，同时保留背景中的列表。", context: "字段与本次修改范围", feedback: "提交与取消具有明确入口", asset: assets.paperEdit },
  { label: "异常恢复", task: "从失败反馈继续完成任务", decision: "批量导入属于异常分支：指出问题行，再提供修改后重新上传的入口，让错误反馈直接服务恢复。", context: "失败对象与错误行", feedback: "定位错误 → 修改内容 → 重新上传", asset: assets.importError },
] as const;

function BusinessTaskFlow({ onOpen, active, onSelect }: {
  onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void;
  active: number;
  onSelect: (index: number) => void;
}) {
  const current = taskFlow[active];
  return <div className="gkx-business-flow">
    <div className="gkx-business-flow__steps" role="group" aria-label="选择论文管理任务节点">
      {taskFlow.map((step, index) => <button type="button" aria-pressed={active === index} aria-controls="gkx-business-flow-detail" onClick={() => onSelect(index)} className={`${active === index ? "active" : ""}${index === 3 ? " is-branch" : ""}`} key={step.label}><span>{index === 3 ? "异常分支" : `步骤 ${index + 1}`}</span><strong>{step.label}</strong></button>)}
    </div>
    <div id="gkx-business-flow-detail" className="gkx-business-flow__detail">
      <ProjectFigure asset={current.asset} onOpen={onOpen} />
      <div className="gkx-business-flow__copy" aria-live="polite"><h3>{current.task}</h3><p>{current.decision}</p><dl><div><dt>需要明确</dt><dd>{current.context}</dd></div><div><dt>反馈与继续</dt><dd>{current.feedback}</dd></div></dl></div>
    </div>
  </div>;
}

function TaskComparison({ onOpen }: { onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void }) {
  const comparisons = [...strategyCopy.taskComparisons.filter(item => item.figureId !== "ui-paper-list"), {
    title: "高端智库", task: "从情报概览进入专题内容", figureId: "ui-think-tank",
    priorities: ["首页提供整体概览与内容入口", "按技术、报告、人才等内容组织后续浏览"],
  }];
  return <div className="gkx-task-studies">{comparisons.map(item => <article className="gkx-task-study" key={item.figureId}>
    <div className="gkx-task-study__copy"><p className="gkx-evidence-label">{figureById[item.figureId].caption}</p><h3>{item.task}</h3><ul>{item.priorities.map(point => <li key={point}>{point}</li>)}</ul></div>
    <ProjectFigure asset={figureById[item.figureId]} onOpen={onOpen} />
  </article>)}</div>;
}

function PaperWorkflowExample({ onOpen }: { onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void }) {
  const cancelScrollRef = useRef<(() => void) | null>(null);
  const [compactSteps, setCompactSteps] = useState(false);
  useEffect(() => () => cancelScrollRef.current?.(), []);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 820px)");
    const sync = () => setCompactSteps(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  function scrollToDesignSystem(event: ReactMouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById("gkx-design-system");
    if (!target) return;
    event.preventDefault();
    if (window.location.hash !== event.currentTarget.hash) {
      window.history.pushState(window.history.state, "", event.currentTarget.hash);
    }
    cancelScrollRef.current?.();
    const start = window.scrollY;
    const offset = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
    const end = Math.max(0, Math.min(start + target.getBoundingClientRect().top - offset, document.documentElement.scrollHeight - window.innerHeight));
    const distance = end - start;
    target.focus({ preventScroll: true });
    const duration = Math.min(1000, Math.max(500, Math.abs(distance) * 0.2));
    const startedAt = performance.now();
    let frame = 0;
    const cancel = () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("popstate", cancel);
      window.removeEventListener("keydown", cancelOnKey);
      cancelScrollRef.current = null;
    };
    const cancelOnKey = (keyEvent: KeyboardEvent) => {
      if (["Escape", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Tab"].includes(keyEvent.key)) cancel();
    };
    const animate = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      window.scrollTo({ top: start + distance * eased, behavior: "instant" });
      if (progress < 1) frame = window.requestAnimationFrame(animate);
      else cancel();
    };
    cancelScrollRef.current = cancel;
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("pointerdown", cancel, { passive: true });
    window.addEventListener("popstate", cancel);
    window.addEventListener("keydown", cancelOnKey);
    frame = window.requestAnimationFrame(animate);
  }

  return <article id="gkx-workflow" className="gkx-ai-case" aria-labelledby="gkx-ai-case-title">
    <header><h3 id="gkx-ai-case-title">以论文管理为例，把设计判断写成可复用规范</h3><p>从情报管理系统中“找到并核对一条论文记录”的任务出发，将查询要求写进 MD，再用可操作原型核对规则。下方为依据现有图稿完成的本次复现。</p></header>
    <section className="gkx-ai-input" aria-labelledby="gkx-ai-input-title">
      <header className="gkx-ai-block-heading"><h4 id="gkx-ai-input-title">将业务任务写成可执行的 MD</h4></header>
      <div className="gkx-ai-materials">
        <div className="gkx-ai-spec"><h5>查询规则节选</h5><pre><code>{"# 论文管理 / 查询\n任务：查找论文，核对记录\n\n## 查询约束\n搜索匹配标题、关键词\n机构筛选限定结果范围\n查询与筛选共同生效\n\n## 反馈与恢复\n显示匹配数量\n无结果可清除条件\n重置后恢复全部记录"}</code></pre></div>
        <div className="gkx-ai-interface"><FigureDetail asset={assets.paperList} viewBox="224 117 1176 110" label="界面依据 · 统一搜索与筛选" onOpen={onOpen} /><FigureDetail asset={assets.paperList} viewBox="232 228 1160 284" label="对象对应 · 论文标题、关键词与作者机构" onOpen={onOpen} /></div>
      </div>
    </section>
    <section id="gkx-ai-query-validation" className="gkx-ai-practice-block" aria-labelledby="gkx-ai-validation-title">
      <header className="gkx-ai-block-heading"><h4 id="gkx-ai-validation-title">把查询方案放进原型，检查规则是否成立</h4><p>现有图稿中的查询，从“编号与名称分别输入”调整为“统一搜索与筛选”。<br />下面复现两种布局，具体核对匹配范围、组合条件与恢复行为。</p></header>
      <GkxPaperQueryDemo />
      <div className="gkx-ai-checks" role="group" aria-label="查询规则验证流程"><Steps current={0} size="default" direction={compactSteps ? "vertical" : "horizontal"} labelPlacement="horizontal">{[
        { title: "输入“深度学习”", text: "核对标题与关键词匹配" },
        { title: "再限定“清华大学”", text: "验证组合筛选与输入保留" },
        { title: "查询未命中内容，再重置", text: "检查空结果与重置恢复" },
      ].map(step => <Steps.Step key={step.title} title={step.title} description={step.text} />)}</Steps></div>
    </section>
    <section className="gkx-ai-practice-block gkx-ai-reuse" aria-labelledby="gkx-ai-reuse-title">
      <header className="gkx-ai-block-heading"><h4 id="gkx-ai-reuse-title">将校正结果沉淀为<span className="gkx-ai-reuse-accent">复用规则</span></h4><p>将查询规则与业务数据分开。切换上方的专利记录，沿用同一套查询与恢复逻辑，验证规则能否用于另一种对象。</p></header>
      <dl className="gkx-ai-rule-ledger"><div><dt>查询规则 MD</dt><dd>明确搜索字段、条件组合、结果反馈与恢复方式，供生成和核对共同使用。</dd></div><div><dt>共用查询逻辑</dt><dd>论文与专利记录调用同一套匹配逻辑，查询行为的调整集中维护。</dd></div><div><dt>业务对象配置</dt><dd>分开组织对象名称、标题、关键词与机构数据，更换业务对象时保留查询体验。</dd></div></dl>
      <p className="gkx-ai-reuse-reference"><span>本次沉淀：查询规则 MD、可操作复现与两类对象的复用验证。</span><a className="gkx-section-reference" href="#gkx-design-system" onClick={scrollToDesignSystem}><span>对照管理列表的规范与交付</span><IconArrowDown aria-hidden="true" /></a></p>
    </section>
  </article>;
}

export function GkxCase({ project, legacyView }: GkxCaseProps) {
  const [businessStep, setBusinessStep] = useState(0);
  const [viewer, setViewer] = useState<ImageAsset | null>(null);
  const [originalSize, setOriginalSize] = useState(false);
  const viewerTrigger = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const requested = window.location.hash.slice(1);
    const defaultTarget = legacyView === "systems" ? "gkx-systems" : legacyView === "design-system" ? "gkx-design-system" : "";
    const target = legacyAnchors[requested] ?? (requested || defaultTarget);
    if (legacyView && legacyView !== "story") {
      const base = window.__PORTFOLIO_BASE__ ?? "/portfolio";
      window.history.replaceState(window.history.state, "", `${base}/project/gkx/${window.location.search}${target ? `#${target}` : ""}`);
    }
    if (!target) return;
    const details = document.getElementById(target);
    if (details instanceof HTMLDetailsElement) details.open = true;
    const frame = window.requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ behavior: "auto", block: "start" }));
    return () => window.cancelAnimationFrame(frame);
  }, [legacyView]);

  useEffect(() => {
    if (!viewer) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setViewer(null); return; }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])") ?? []);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      viewerTrigger.current?.focus();
    };
  }, [viewer]);

  const openImage = (asset: ImageAsset, trigger: HTMLButtonElement) => { viewerTrigger.current = trigger; setOriginalSize(false); setViewer(asset); };
  const [searchModule, operationsModule, containersModule, recoveryModule] = rulesCopy.modules;
  const [heroTitleBeforeWorkflow, heroTitleAfterWorkflow] = copy.hero.title.split("AI 工作流");

  return <article className="gkx-case" aria-label="国科信门户与多系统体验设计项目">
    <ProjectLocator sections={sections} legacyAnchors={legacyAnchors} ariaLabel="国科信项目章节定位" />

    <header id="gkx-overview" className="gkx-hero">
      <div className="gkx-hero__copy">
        <h1>{heroTitleBeforeWorkflow}<span className="gkx-hero__accent">AI 工作流</span>{heroTitleAfterWorkflow}</h1>
        <p className="gkx-hero__subtitle">{copy.hero.subtitle}</p>
        <p className="gkx-project-period">项目时间：{project.period}</p>
        <dl id="gkx-scope" className="gkx-hero__meta">
          <div><dt>{copy.hero.roleLabel}</dt><dd>{copy.hero.role}</dd></div>
          <div><dt>{copy.hero.scopeLabel}</dt><dd>{copy.hero.scope}</dd></div>
          <div className="is-wide"><dt>{copy.hero.methodLabel}</dt><dd>{copy.hero.method}</dd></div>
        </dl>
      </div>
      <div className="gkx-hero__visuals" aria-label="国科信主要界面">
        <ProjectFigure asset={assets.portal} onOpen={openImage} className="is-primary" priority />
      </div>
      <p className="gkx-disclosure">页面中的业务内容与数据已脱敏或重构，仅用于展示设计方法和交互方式。</p>
    </header>

    <section id="gkx-project-context" className="gkx-chapter gkx-overview" aria-labelledby="gkx-overview-title">
      <div className="gkx-context-intro">
        <SectionHeading section={overviewCopy} titleId="gkx-overview-title" number="01" label="范围与目标" />
        <aside className="gkx-project-scale" aria-label="整体项目建设规模">
          <p className="gkx-project-scale__label">{overviewCopy.projectScale.label}</p>
          <p className="gkx-project-scale__value"><strong>{overviewCopy.projectScale.amount}</strong><span>{overviewCopy.projectScale.unit}</span></p>
          <a href={overviewCopy.projectScale.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`${overviewCopy.projectScale.sourceLabel}，查看整体项目合同，新窗口打开`}>{overviewCopy.projectScale.sourceLabel}<IconArrowRight aria-hidden="true" /></a>
        </aside>
      </div>
      <ProjectFigure asset={assets.projectScope} onOpen={openImage} className="gkx-scope-figure" description={assets.projectScope.alt} />
      <div className="gkx-scope-mobile" aria-label="图示文字说明">
        <p>{overviewCopy.scope.portal}连接的四大主要业务系统</p>
        <ul>{overviewCopy.scope.systems.map(system => <li key={system.name}>{system.name}</li>)}</ul>
        <p>同时连接其他业务系统。</p>
      </div>
      <div className="gkx-context-goals" aria-label="两项设计目标">{overviewCopy.goals.map(goal => <article key={goal.title}>
        <p className="gkx-context-goal-label">{goal.label}</p><h3>{goal.title}</h3><p>{goal.text}</p>
      </article>)}</div>
    </section>

    <section id="gkx-systems" className="gkx-chapter gkx-strategy" aria-labelledby="gkx-strategy-title">
      <SectionHeading section={strategyCopy} titleId="gkx-strategy-title" number="02" label="跨系统策略" />
      <div id="gkx-decisions" className="gkx-principles">{strategyCopy.principles.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      <TaskComparison onOpen={openImage} />
      <GkxSupplementalMaterials onOpen={openImage} compact />
    </section>

    <section id="nsp-prototype" className="gkx-chapter gkx-prototype" aria-labelledby="gkx-prototype-title">
      <SectionHeading section={prototypeCopy} titleId="gkx-prototype-title" number="03" label="AI 实践" leadSegments={prototypeCopy.lead.split("—")} />
      <ProjectFigure asset={assets.aiWorkflow} onOpen={openImage} className="gkx-ai-workflow-figure" />
      <PaperWorkflowExample onOpen={openImage} />
    </section>

    <section id="nsp-rules" className="gkx-chapter gkx-rules" aria-labelledby="gkx-rules-title">
      <SectionHeading section={rulesCopy} titleId="gkx-rules-title" number="04" label="交互决策" />
      <div id="gkx-business"><BusinessTaskFlow onOpen={openImage} active={businessStep} onSelect={setBusinessStep} /></div>

      <article id="gkx-rule-search" className="gkx-rule-module gkx-rule-search">
        <header><h3>{searchModule.title}</h3><p>{searchModule.problem}</p><p>{searchModule.decision}</p></header>
        <div className="gkx-query-comparison">
          <FigureDetail asset={assets.paperBefore} viewBox="224 123 875 52" label={searchModule.beforeLabel ?? assets.paperBefore.caption} onOpen={openImage} />
          <FigureDetail asset={assets.paperList} viewBox="224 123 875 52" label={searchModule.afterLabel ?? assets.paperList.caption} onOpen={openImage} />
        </div>
        <div className="gkx-decision-strip"><strong>设计取舍</strong><p>{searchModule.reason} 进一步的条件限定仍交给筛选，避免把所有业务字段堆进一个输入框。</p></div>
      </article>

      <article className="gkx-rule-module gkx-rule-operations">
        <div className="gkx-rule-split-copy"><h3>{operationsModule.title}</h3><p>{operationsModule.problem}</p><strong>{operationsModule.decision}</strong></div>
        <FigureDetail asset={assets.paperList} viewBox="1244 228 148 82" label="列表局部 · 详情、编辑、删除保持固定顺序" onOpen={openImage} className="is-operations" />
      </article>

      <article className="gkx-rule-module gkx-rule-containers">
        <header><h3>{containersModule.title}</h3><p>{containersModule.decision}</p></header>
        <dl className="gkx-container-decisions"><div><dt>快速核对</dt><dd>详情弹窗，关闭后继续当前列表任务。</dd></div><div><dt>单条修改</dt><dd>编辑弹窗，明确当前对象、字段与提交范围。</dd></div><div><dt>持续阅读</dt><dd>独立工作区，为原文和辅助信息提供稳定空间。</dd></div></dl>
        <div className="gkx-section-references"><a href="#gkx-business" onClick={() => setBusinessStep(1)}>查看详情弹窗</a><a href="#gkx-business" onClick={() => setBusinessStep(2)}>查看编辑弹窗</a><a href="#gkx-systems">查看阅读工作区</a></div>
      </article>

      <article className="gkx-rule-module gkx-rule-recovery-summary">
        <div className="gkx-rule-split-copy"><h3>{recoveryModule.title}</h3><p>{recoveryModule.problem}</p><strong>{recoveryModule.decision}</strong><a className="gkx-section-reference" href="#gkx-business" onClick={() => setBusinessStep(3)}>在任务路径中查看异常分支</a></div>
        <ProjectFigure asset={assets.importError} onOpen={openImage} />
      </article>


    </section>

    <section id="gkx-design-system" className="gkx-chapter gkx-design-system" aria-labelledby="gkx-design-system-title" tabIndex={-1}>
      <SectionHeading section={{ title: "让共用规则进入页面，也进入交付", lead: "将页面类型、组件和状态说明整理为设计规范，供合作方与研发查阅；审核时再对应到具体需求、页面和操作。" }} titleId="gkx-design-system-title" number="05" label="规范与交付" />
      <article id="gkx-collaboration" className="gkx-workbench-block"><header><h3>{rulesCopy.workbench.title}</h3><div>{rulesCopy.workbench.text}</div><small>{rulesCopy.workbench.interactionHint}</small></header><div className="gkx-md-interactive"><iframe src={publicAsset("/assets/projects/gkx/design-preview/index.html?id=page-index&embed=1")} title="深圳国际科技信息中心可交互设计规范" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms"/></div></article>
      <article id="gkx-supplier" className="gkx-delivery-review" aria-labelledby="gkx-supplier-title">
        <header><h3 id="gkx-supplier-title">{supplierCopy.title}</h3><p>{supplierCopy.lead}</p></header>
        <div className="gkx-audit-table"><table><caption>交付审核：从具体对象检查实现</caption><thead><tr><th scope="col">核对维度</th><th scope="col">检查内容</th></tr></thead><tbody>{supplierCopy.auditDimensions.map(dimension => <tr key={dimension.number}><th scope="row">{dimension.title}</th><td>{dimension.points.join(" ")}</td></tr>)}</tbody></table></div>
        <p className="gkx-delivery-example">例如前文的查询区域调整，可将“入口分散”的问题对应到搜索与筛选规则，再检查调整后的页面。<a href="#gkx-rule-search">查看这项设计调整</a></p>
      </article>
    </section>

    <section id="gkx-outcomes" className="gkx-chapter gkx-outcomes" aria-labelledby="gkx-outcomes-title">
      <SectionHeading section={outcomesCopy} titleId="gkx-outcomes-title" number="06" label="成果复盘" />
      <div className="gkx-outcome-ledger">{outcomesCopy.outcomes.map((outcome, index) => <article key={outcome.title}><h3>{outcome.title}</h3><div><p>{outcome.text}</p><a className="gkx-section-reference" href={["#gkx-systems", "#gkx-collaboration", "#nsp-prototype"][index]}>{["查看界面成果", "查看规范预览", "查看门户实践"][index]}</a></div></article>)}</div>
      <div className="gkx-reflection"><h3>项目复盘</h3><ol>{outcomesCopy.reflections.map(item => <li key={item.number}><strong>{item.title}</strong><p>{item.text}</p></li>)}</ol></div>
    </section>

    {viewer ? <ImageViewer asset={viewer} originalSize={originalSize} setOriginalSize={setOriginalSize} onClose={() => setViewer(null)} dialogRef={dialogRef} closeButtonRef={closeButtonRef} /> : null}
  </article>;
}
