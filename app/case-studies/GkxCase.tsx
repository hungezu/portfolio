"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { publicAsset, type Project } from "../portfolio-data";
import { ProjectLocator } from "../project-locator";
import { GkxDesignSystemInteractive, ProjectSubnav } from "./NationalSciencePlatformCase";
import publicCopy from "./gkx-public-copy.json";
import "./gkx-case.css";

export type GkxCaseProps = { project: Project };

type OverviewSection = {
  id: string; title: string; lead: string;
  body: string[]; systems: string[];
  responsibilities: Array<{ title: string; text: string }>;
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
  steps: Array<{ number: string; title: string; text: string }>;
  examples: Array<{ title: string; text: string; figureId: string }>;
  reflection: string;
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
const assetRoot = "/assets/projects/gkx/case-study";

type ImageAsset = { src: string; alt: string; caption: string; width: number; height: number };

const assets = {
  portal: { src: `${assetRoot}/ui/portal-workspace.png`, alt: "智慧门户我的空间界面，包含资料目录与文档列表", caption: copy.captions["ui-portal"], width: 1400, height: 778 },
  reading: { src: `${assetRoot}/ui/portal-reading.png`, alt: "智慧门户智能阅读工作区，左侧目录、中间原文、右侧辅助信息", caption: copy.captions["ui-reading"], width: 1400, height: 778 },
  maas: { src: `${assetRoot}/ui/maas-model-gallery.png`, alt: "MaaS 模型广场界面，展示模型筛选与模型卡片", caption: copy.captions["ui-maas"], width: 1400, height: 778 },
  paperList: { src: `${assetRoot}/ui/paper-list.png`, alt: "情报管理论文管理界面，包含统一搜索、筛选与行操作", caption: copy.captions["ui-paper-list"], width: 1440, height: 800 },
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
};

function ProjectFigure({ asset, onOpen, className = "", priority = false }: {
  asset: ImageAsset;
  onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void;
  className?: string;
  priority?: boolean;
}) {
  return <figure className={`gkx-project-figure ${className}`.trim()}>
    <button type="button" className="gkx-image-button" aria-label={`放大查看：${asset.caption}`} onClick={event => onOpen(asset, event.currentTarget)}>
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

function SectionHeading({ section, titleId }: { section: { title: string; lead: string }; titleId: string }) {
  return <header className="gkx-section-heading"><h2 id={titleId}>{section.title}</h2><p className="gkx-section-lead">{section.lead}</p></header>;
}

const surfaceScreens = [assets.paperList, assets.paperDetail, assets.paperEdit, assets.reading] as const;

const trustRules = [
  { title: "对象可定位", text: "导航、检索与字段共同说明：我在哪、正在处理什么。", evidence: "论文列表与筛选" },
  { title: "操作有边界", text: "按任务时长选择容器，明确查看、编辑与持续阅读的范围。", evidence: "详情 / 编辑 / 阅读工作区" },
  { title: "过程有反馈", text: "异常定位到问题行，并把恢复入口放回当前任务。", evidence: "批量导入错误与重新上传" },
  { title: "交付有依据", text: "把需求、页面状态与规范条款对应起来，支持逐项核对。", evidence: "规范与交互原型" },
] as const;

function TrustMechanism() {
  return <figure className="gkx-trust-map" aria-labelledby="gkx-trust-title">
    <figcaption><h3 id="gkx-trust-title">可信机制的建立</h3><p>让业务操作可理解，让设计交付可核对。</p></figcaption>
    <div className="gkx-trust-map__path" aria-hidden="true"><span>业务对象</span><svg viewBox="0 0 80 16"><path d="M0 8H76M69 1l7 7-7 7" /></svg><span>操作与状态</span><svg viewBox="0 0 80 16"><path d="M0 8H76M69 1l7 7-7 7" /></svg><span>反馈与核对依据</span></div>
    <dl>{trustRules.map(rule => <div key={rule.title}><dt>{rule.title}</dt><dd>{rule.text}<strong>{rule.evidence}</strong></dd></div>)}</dl>
  </figure>;
}

const taskFlow = [
  { label: "检索记录", task: "先找到需要处理的业务对象", decision: "用统一搜索表达目标，用筛选进一步限定范围。列表同时提供字段、选择入口和行操作。", context: "对象与查询条件", feedback: "结果仍在当前列表中可见", asset: assets.paperList },
  { label: "核对详情", task: "查看单条记录，保留列表上下文", decision: "短时查看使用同页弹窗，核对结束后可以继续当前列表任务，不必重新定位记录。", context: "当前记录与来源列表", feedback: "详情关闭后回到原任务", asset: assets.paperDetail },
  { label: "编辑记录", task: "让修改范围与当前对象对应", decision: "在独立编辑状态中组织字段与提交入口，把查看和修改两种意图分开，同时保留背景中的列表。", context: "字段与本次修改范围", feedback: "提交与取消具有明确入口", asset: assets.paperEdit },
  { label: "异常恢复", task: "从失败反馈继续完成任务", decision: "批量导入属于异常分支：指出问题行，再提供修改后重新上传的入口，让错误反馈直接服务恢复。", context: "失败对象与错误行", feedback: "定位错误 → 修改内容 → 重新上传", asset: assets.importError },
] as const;

function BusinessTaskFlow({ onOpen }: { onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void }) {
  const [active, setActive] = useState(0);
  const current = taskFlow[active];
  return <div className="gkx-business-flow">
    <div className="gkx-business-flow__steps" role="group" aria-label="选择论文管理任务节点">
      {taskFlow.map((step, index) => <button type="button" aria-pressed={active === index} aria-controls="gkx-business-flow-detail" onClick={() => setActive(index)} className={`${active === index ? "active" : ""}${index === 3 ? " is-branch" : ""}`} key={step.label}><span>{index === 3 ? "异常分支" : `步骤 ${index + 1}`}</span><strong>{step.label}</strong></button>)}
    </div>
    <div id="gkx-business-flow-detail" className="gkx-business-flow__detail">
      <ProjectFigure asset={current.asset} onOpen={onOpen} />
      <div className="gkx-business-flow__copy" aria-live="polite"><h3>{current.task}</h3><p>{current.decision}</p><dl><div><dt>需要明确</dt><dd>{current.context}</dd></div><div><dt>反馈与继续</dt><dd>{current.feedback}</dd></div></dl></div>
    </div>
  </div>;
}

function TaskComparison({ onOpen }: { onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void }) {
  const [active, setActive] = useState(0);
  const current = strategyCopy.taskComparisons[active];
  return <div className="gkx-task-comparison">
    <div className="gkx-task-selector" role="group" aria-label="对照不同业务任务">{strategyCopy.taskComparisons.map((item, index) => <button type="button" aria-pressed={active === index} aria-controls="gkx-task-evidence" className={active === index ? "active" : ""} onClick={() => setActive(index)} key={item.title}><strong>{item.title}</strong><span>{item.task}</span></button>)}</div>
    <div id="gkx-task-evidence"><ProjectFigure asset={figureById[current.figureId]} onOpen={onOpen} /><ul aria-live="polite">{current.priorities.map(point => <li key={point}>{point}</li>)}</ul></div>
  </div>;
}

function RuleVerificationExample({ onOpen }: { onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void }) {
  const queryCrops = [
    { asset: assets.paperBefore, label: "调整前：编号与名称入口分开", viewBox: "228 128 900 56" },
    { asset: assets.paperList, label: "规则落点：合并搜索与条件筛选", viewBox: "228 128 900 56" },
  ];
  return <article id="gkx-validation" className="gkx-rule-verification" aria-labelledby="gkx-rule-verification-title">
    <header><h3 id="gkx-rule-verification-title">让一条规则，落到可检查的界面行为</h3><p>以已有论文管理设计资料为例，将查询与操作规则组织为一条核对方法，贯穿输入、原型检查、人工校准与界面落点。</p></header>
    <div className="gkx-rule-verification__body">
      <div className="gkx-rule-verification__input"><h4>规则输入 · MD 组织示例</h4><pre><code>{"# 论文管理：查询与操作\n\n- 搜索：合并常用模糊查询。\n- 提示：对应当前业务对象。\n- 筛选：补充明确条件限定。\n- 行操作：详情 → 编辑 → 删除。\n- 扩展操作：第 4 项起收纳到更多。"}</code></pre><p>把对象、入口分工与操作顺序写清楚，供原型生成与后续核对沿用。</p></div>
      <div className="gkx-rule-verification__evidence">
        {queryCrops.map(crop => <figure key={crop.label}><figcaption>{crop.label}</figcaption><button type="button" className="gkx-image-button" aria-label={`放大完整界面：${crop.label}`} onClick={event => onOpen(crop.asset, event.currentTarget)}><svg viewBox={crop.viewBox} width="900" height="56" role="img" aria-label={`${crop.label}的查询区域局部`}><image href={publicAsset(crop.asset.src)} width={crop.asset.width} height={crop.asset.height} /></svg><span aria-hidden="true">放大完整界面</span></button></figure>)}
        <figure className="gkx-rule-verification__operations"><figcaption>操作落点：详情、编辑、删除按固定顺序排列</figcaption><button type="button" className="gkx-image-button" aria-label="放大完整界面：论文管理行操作" onClick={event => onOpen(assets.paperList, event.currentTarget)}><svg viewBox="1242 228 150 128" width="150" height="128" role="img" aria-label="论文管理列表局部，展示操作列与详情、编辑、删除的排列顺序"><image href={publicAsset(assets.paperList.src)} width={assets.paperList.width} height={assets.paperList.height} /></svg><span aria-hidden="true">放大查看</span></button><p>直接显示基础操作；第 4 项起收纳的规则用于扩展场景。</p></figure>
      </div>
    </div>
    <dl className="gkx-rule-verification__checks"><div><dt>原型检查</dt><dd>是否仍有重复搜索入口？提示能否说明输入对象？行操作的顺序是否与规则对应？</dd></div><div><dt>人工校准</dt><dd>以设计稿确认搜索与筛选的分工，核对入口文案、操作顺序与显露边界，再检查查看、编辑和异常状态。</dd></div><div><dt>最终 UI 核对</dt><dd>将规则逐项对应到查询区域与操作列。界面承担行为，MD 保留适用条件与扩展规则。</dd></div></dl>
  </article>;
}

export function GkxCase({ project }: GkxCaseProps) {
  const [viewer, setViewer] = useState<ImageAsset | null>(null);
  const [originalSize, setOriginalSize] = useState(false);
  const [activeSurface, setActiveSurface] = useState(0);
  const viewerTrigger = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

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
  const selectSurface = (index: number, focus = false) => { setActiveSurface(index); if (focus) window.requestAnimationFrame(() => tabRefs.current[index]?.focus()); };
  const handleSurfaceKeys = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === "ArrowRight" ? (index + 1) % surfaceScreens.length
      : event.key === "ArrowLeft" ? (index - 1 + surfaceScreens.length) % surfaceScreens.length
        : event.key === "Home" ? 0 : event.key === "End" ? surfaceScreens.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    selectSurface(next, true);
  };

  const [searchModule, operationsModule, containersModule, recoveryModule] = rulesCopy.modules;
  const currentSurface = surfaceScreens[activeSurface];

  return <article className="gkx-case" aria-label="国科信门户与多系统体验设计项目">
    <ProjectLocator sections={sections} ariaLabel="国科信项目章节定位" />

    <header id="gkx-overview" className="gkx-hero">
      <ProjectSubnav active="story" />
      <div className="gkx-hero__copy">
        <h1>{copy.hero.title}</h1>
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

    <section className="gkx-chapter gkx-overview" aria-labelledby="gkx-overview-title">
      <SectionHeading section={overviewCopy} titleId="gkx-overview-title" />
      <div className="gkx-overview__body">
        <div>{overviewCopy.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
        <div className="gkx-responsibilities">{overviewCopy.responsibilities.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </div>
      <div className="gkx-system-list" aria-label="项目系统范围"><strong>一个门户，五个业务系统</strong><ul>{overviewCopy.systems.map(system => <li key={system}>{system}</li>)}</ul></div>
      <TrustMechanism />
    </section>

    <section id="gkx-business" className="gkx-chapter gkx-business" aria-labelledby="gkx-business-title">
      <header className="gkx-section-heading"><h2 id="gkx-business-title">把业务任务拆到每个确认与反馈点</h2><p className="gkx-section-lead">以论文管理为代表，先识别用户需要查找、核对和修改的对象，再决定页面承载与反馈。常规路径保留当前上下文，异常分支提供明确的恢复入口。</p></header>
      <BusinessTaskFlow onOpen={openImage} />
    </section>

    <section id="nsp-structure" className="gkx-chapter gkx-strategy" aria-labelledby="gkx-strategy-title">
      <SectionHeading section={strategyCopy} titleId="gkx-strategy-title" />
      <div id="gkx-decisions" className="gkx-principles">{strategyCopy.principles.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      <TaskComparison onOpen={openImage} />
      <p className="gkx-strategy__closing">{strategyCopy.closing}</p>
    </section>

    <section id="nsp-rules" className="gkx-chapter gkx-rules" aria-labelledby="gkx-rules-title">
      <SectionHeading section={rulesCopy} titleId="gkx-rules-title" />
      <article id="gkx-system" className="gkx-rule-intro">
        <h3>规则需要解释行为，也需要对应交付依据</h3>
        <dl><div><dt>页面中</dt><dd>对象、操作和反馈相互对应，用户知道当前状态与下一步。</dd></div><div><dt>交付中</dt><dd>需求条目、原型状态、修改对象和规范条款形成可继续核对的依据。</dd></div></dl>
      </article>

      <article className="gkx-rule-module gkx-rule-search">
        <header><h3>{searchModule.title}</h3><p>{searchModule.problem}</p><p>{searchModule.decision}</p></header>
        <div className="gkx-before-after">
          <ProjectFigure asset={{ ...assets.paperBefore, caption: searchModule.beforeLabel ?? assets.paperBefore.caption }} onOpen={openImage} className="is-search-crop" />
          <ProjectFigure asset={{ ...assets.paperList, caption: searchModule.afterLabel ?? assets.paperList.caption }} onOpen={openImage} className="is-search-crop" />
        </div>
        <div className="gkx-decision-strip"><strong>设计取舍</strong><p>{searchModule.reason} 进一步的条件限定仍交给筛选，避免把所有业务字段堆进一个输入框。</p></div>
      </article>

      <article className="gkx-rule-module gkx-rule-operations">
        <div className="gkx-rule-split-copy"><h3>{operationsModule.title}</h3><p>{operationsModule.problem}</p><strong>{operationsModule.decision}</strong></div>
        <div><ProjectFigure asset={assets.paperList} onOpen={openImage} className="gkx-wide-rule" /><ol className="gkx-ui-annotations">{operationsModule.details.map((detail, index) => <li key={detail}><span>{index + 1}</span>{detail}</li>)}</ol></div>
      </article>

      <article className="gkx-rule-module gkx-rule-containers">
        <header><h3>{containersModule.title}</h3><p>{containersModule.decision}</p></header>
        <div className="gkx-container-layout">
          <div className="gkx-surface-switcher">
            <div className="gkx-surface-tabs" role="tablist" aria-label="页面承载方式切换">
              {surfaceScreens.map((screen, index) => {
                const label = containersModule.tabs?.[index]?.label ?? screen.caption;
                return <button ref={node => { tabRefs.current[index] = node; }} id={`gkx-surface-tab-${index}`} type="button" role="tab" aria-selected={activeSurface === index} aria-controls="gkx-surface-panel" tabIndex={activeSurface === index ? 0 : -1} className={activeSurface === index ? "active" : ""} onClick={() => selectSurface(index)} onKeyDown={event => handleSurfaceKeys(event, index)} key={screen.caption}>{label}</button>;
              })}
            </div>
            <div id="gkx-surface-panel" role="tabpanel" aria-labelledby={`gkx-surface-tab-${activeSurface}`} tabIndex={0}><ProjectFigure asset={currentSurface} onOpen={openImage} className="gkx-surface-stage" /></div>
          </div>
          <aside className="gkx-container-reason">
            <h4>按任务时长选择承载方式</h4>
            <dl><div><dt>快速核对</dt><dd>详情弹窗</dd></div><div><dt>单条修改</dt><dd>编辑弹窗</dd></div><div><dt>持续阅读</dt><dd>独立工作区</dd></div></dl>
            <p>{containersModule.reason}</p>
            <p>统一页面骨架，保留任务的空间需求；不把所有业务强制装进同一种模板。</p>
          </aside>
        </div>
      </article>

      <article className="gkx-rule-module gkx-rule-recovery">
        <div className="gkx-rule-split-copy"><h3>{recoveryModule.title}</h3><p>{recoveryModule.problem}</p><strong>{recoveryModule.reason}</strong><ol>{recoveryModule.details.map((detail, index) => <li key={detail}><span>{index + 1}</span>{detail}</li>)}</ol></div>
        <ProjectFigure asset={assets.importError} onOpen={openImage} className="is-recovery-crop" />
      </article>

      <article id="gkx-collaboration" className="gkx-workbench-block">
        <header><h3>{rulesCopy.workbench.title}</h3><div>{rulesCopy.workbench.text}</div><small>{rulesCopy.workbench.interactionHint}</small></header>
        <GkxDesignSystemInteractive />
      </article>
    </section>

    <section id="nsp-prototype" className="gkx-chapter gkx-prototype" aria-labelledby="gkx-prototype-title">
      <SectionHeading section={prototypeCopy} titleId="gkx-prototype-title" />
      <ol id="gkx-workflow" className="gkx-prototype-steps">{prototypeCopy.steps.map(step => <li key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol>
      <div className="gkx-ai-boundary"><div><h3>Codex 负责转化</h3><p>整理已确定的规则，生成设计 MD 与可运行原型，把静态页面转为可核对的操作过程。</p></div><div><h3>我负责判断</h3><p>确定业务范围与页面结构，核对事实、组件状态和异常路径，再决定哪些修改进入交付版本。</p></div></div>
      <RuleVerificationExample onOpen={openImage} />
      <div className="gkx-prototype-evidence">
        <ProjectFigure asset={assets.reading} onOpen={openImage} className="is-reading" />
        <div className="gkx-prototype-notes">{prototypeCopy.examples.map(example => <article key={example.title}><h3>{example.title}</h3><p>{example.text}</p></article>)}<p className="gkx-prototype-reflection">{prototypeCopy.reflection}</p></div>
        <ProjectFigure asset={assets.portal} onOpen={openImage} className="is-portal-support" />
      </div>
    </section>

    <section id="gkx-supplier" className="gkx-chapter gkx-supplier" aria-labelledby="gkx-supplier-title">
      <SectionHeading section={supplierCopy} titleId="gkx-supplier-title" />
      <div className="gkx-traceability"><h3>把核对过程留在具体对象上</h3><ol><li><strong>需求条目</strong><span>本次需要覆盖什么</span></li><li><strong>页面与状态</strong><span>对应哪个入口或反馈</span></li><li><strong>问题与修改</strong><span>具体调整什么及原因</span></li><li><strong>规范与复核</strong><span>依据哪条规则继续核对</span></li></ol><p>这条对应关系用于组织交付核对，使共性问题能回到规范，业务差异能保留在具体页面。</p></div>
      <div className="gkx-audit-table"><table><caption>合作商交付核对维度</caption><thead><tr><th scope="col">核对维度</th><th scope="col">检查对象</th><th scope="col">判断依据</th></tr></thead><tbody>{supplierCopy.auditDimensions.map(dimension => <tr key={dimension.number}><th scope="row"><strong>{dimension.title}</strong><p>{dimension.summary}</p></th><td><ul><li>{dimension.points[0]}</li><li>{dimension.points[1]}</li></ul></td><td>{dimension.points[2]}</td></tr>)}</tbody></table></div>
      <p className="gkx-supplier__closing">{supplierCopy.closing}</p>
    </section>

    <section id="gkx-outcomes" className="gkx-chapter gkx-outcomes" aria-labelledby="gkx-outcomes-title">
      <SectionHeading section={outcomesCopy} titleId="gkx-outcomes-title" />
      <div className="gkx-outcome-ledger">{outcomesCopy.outcomes.map(outcome => <article key={outcome.title}><h3>{outcome.title}</h3><p>{outcome.text}</p></article>)}</div>
      <div className="gkx-reflection"><h3>项目复盘</h3><ol>{outcomesCopy.reflections.map(item => <li key={item.number}><strong>{item.title}</strong><p>{item.text}</p></li>)}</ol></div>
      <div className="gkx-evidence-boundary"><h3>下一轮如何验证</h3><p>围绕同类规范编写、原型评审和实际复用，分别记录投入时间、送审与通过范围、使用规范的系统和页面。当前公开材料展示已形成的设计资产与协作方式，量化成效需要对应的实际记录支持。</p></div>
    </section>

    {viewer ? <ImageViewer asset={viewer} originalSize={originalSize} setOriginalSize={setOriginalSize} onClose={() => setViewer(null)} dialogRef={dialogRef} closeButtonRef={closeButtonRef} /> : null}
  </article>;
}
