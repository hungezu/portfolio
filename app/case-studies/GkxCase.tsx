"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { publicAsset, type Project } from "../portfolio-data";
import { ProjectLocator } from "../project-locator";
import { GkxDesignSystemInteractive } from "./NationalSciencePlatformCase";
import publicCopy from "./gkx-public-copy.json";
import "./gkx-case.css";

export type GkxCaseProps = { project: Project };

type OverviewSection = {
  id: string; number: string; eyebrow: string; title: string; lead: string;
  body: string[]; systems: string[];
  responsibilities: Array<{ title: string; text: string }>;
};

type StrategySection = {
  id: string; number: string; eyebrow: string; title: string; lead: string;
  principles: Array<{ title: string; text: string }>;
  taskComparisons: Array<{ title: string; task: string; priorities: string[]; figureId: string }>;
  closing: string;
};

type RulesSection = {
  id: string; number: string; eyebrow: string; title: string; lead: string;
  modules: Array<{
    key: string; number: string; title: string; problem: string; decision: string; reason: string;
    details: string[]; beforeLabel?: string; afterLabel?: string;
    tabs?: Array<{ label: string; figureId: string }>;
  }>;
  workbench: { eyebrow: string; title: string; text: string; interactionHint: string };
};

type PrototypeSection = {
  id: string; number: string; eyebrow: string; title: string; lead: string;
  steps: Array<{ number: string; title: string; text: string }>;
  checks: Array<{ title: string; text: string }>;
  examples: Array<{ title: string; text: string; figureId: string }>;
  reflection: string;
};

type SupplierSection = {
  id: string; number: string; eyebrow: string; title: string; lead: string;
  auditDimensions: Array<{ number: string; title: string; summary: string; points: string[] }>;
  closing: string;
};

type OutcomesSection = {
  id: string; number: string; eyebrow: string; title: string; lead: string;
  outcomes: Array<{ title: string; text: string }>;
  reflections: Array<{ number: string; title: string; text: string }>;
};

type PublicCopy = {
  hero: {
    eyebrow: string; title: string; subtitle: string; roleLabel: string; role: string;
    scopeLabel: string; scope: string; methodLabel: string; method: string; coverCaption: string;
  };
  navigation: Array<{ id: string; label: string }>;
  sections: [OverviewSection, StrategySection, RulesSection, PrototypeSection, SupplierSection, OutcomesSection];
  captions: Record<string, string>;
};

const copy = publicCopy as unknown as PublicCopy;
const [overviewCopy, strategyCopy, rulesCopy, prototypeCopy, supplierCopy, outcomesCopy] = copy.sections;
const sections = copy.navigation.map(({ id, label }) => [id, label] as const);
const assetRoot = "/assets/projects/gkx/case-study";

type CropRegion = { x: number; y: number; width: number; height: number };
type ImageAsset = { src: string; alt: string; caption: string; width: number; height: number; crop?: CropRegion };

const assets = {
  portal: { src: `${assetRoot}/ui/portal-workspace.png`, alt: "智慧门户我的空间界面，包含资料目录与文档列表", caption: copy.captions["ui-portal"], width: 1400, height: 778 },
  reading: { src: `${assetRoot}/ui/portal-reading.png`, alt: "智慧门户智能阅读工作区，左侧目录、中间原文、右侧辅助信息", caption: copy.captions["ui-reading"], width: 1400, height: 778 },
  maas: { src: `${assetRoot}/ui/maas-model-gallery.png`, alt: "MaaS 模型广场界面，展示模型筛选与模型卡片", caption: copy.captions["ui-maas"], width: 1400, height: 778 },
  paperList: { src: `${assetRoot}/ui/paper-list.png`, alt: "情报管理论文管理界面，包含统一搜索、筛选与行操作", caption: copy.captions["ui-paper-list"], width: 1440, height: 800 },
  paperBefore: { src: `${assetRoot}/ui/paper-list-before.png`, alt: "情报管理论文管理调整前界面，编号与名称查询入口分开", caption: copy.captions["ui-paper-before"], width: 1440, height: 800 },
  paperDetail: { src: `${assetRoot}/ui/paper-detail-modal.png`, alt: "情报管理论文详情弹窗，背景保留当前列表上下文", caption: copy.captions["ui-paper-detail"], width: 1440, height: 800 },
  paperEdit: { src: `${assetRoot}/ui/paper-edit-modal.png`, alt: "情报管理论文编辑弹窗，背景保留当前列表上下文", caption: copy.captions["ui-paper-edit"], width: 1440, height: 800 },
  importError: { src: `${assetRoot}/ui/paper-import-error.png`, alt: "情报管理批量导入错误反馈，列出错误行并提供重新上传", caption: copy.captions["ui-import-error"], width: 1440, height: 800 },
  uxRules: { src: `${assetRoot}/ui/ux-rule-annotations.png`, alt: "门户 UX 规范修订标注，说明搜索、全选和行操作规则", caption: copy.captions["ui-ux-rules"], width: 2200, height: 470 },
  layers: { src: `${assetRoot}/reference/wang-p23-layers.jpg`, alt: "字段、容器、页面与应用的分层关系图", caption: copy.captions["generic-layers"], width: 4000, height: 2160, crop: { x: 220, y: 300, width: 1390, height: 1770 } },
  pageTypes: { src: `${assetRoot}/reference/wang-p30-page-types.jpg`, alt: "列表、详情、表单与模态页等页面承载方式图", caption: copy.captions["generic-page-types"], width: 4000, height: 2160, crop: { x: 2330, y: 335, width: 1560, height: 1660 } },
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

function ReferenceFigure({ asset, onOpen, className = "" }: {
  asset: ImageAsset;
  onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void;
  className?: string;
}) {
  const crop = asset.crop;
  if (!crop) return null;
  return <figure className={`gkx-reference-figure ${className}`.trim()}>
    <button type="button" className="gkx-image-button" aria-label={`放大查看：${asset.caption}`} onClick={event => onOpen(asset, event.currentTarget)}>
      <svg viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`} role="img" aria-label={asset.alt} style={{ aspectRatio: `${crop.width} / ${crop.height}` }}>
        <image href={publicAsset(asset.src)} width={asset.width} height={asset.height} />
      </svg>
      <span aria-hidden="true">放大查看</span>
    </button>
    <figcaption>{asset.caption}</figcaption>
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
  const crop = asset.crop;
  return <div className="gkx-lightbox" role="dialog" aria-modal="true" aria-labelledby="gkx-viewer-title" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={`gkx-lightbox__panel${originalSize ? " is-original" : ""}`} ref={dialogRef}>
      <header>
        <div><strong id="gkx-viewer-title">{asset.caption}</strong><span>{crop ? "公开图解局部" : originalSize ? "原始尺寸" : "适合窗口"}</span></div>
        <div className="gkx-lightbox__actions">
          {!crop ? <button type="button" aria-pressed={originalSize} onClick={() => setOriginalSize(!originalSize)}>{originalSize ? "适合窗口" : "原始尺寸"}</button> : null}
          <button ref={closeButtonRef} type="button" onClick={onClose}>关闭</button>
        </div>
      </header>
      <div className="gkx-lightbox__canvas">
        {crop ? <svg viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`} role="img" aria-label={asset.alt}><image href={publicAsset(asset.src)} width={asset.width} height={asset.height} /></svg> : <img src={publicAsset(asset.src)} alt={asset.alt} width={asset.width} height={asset.height} />}
      </div>
    </div>
  </div>;
}

function SectionHeading({ section, titleId }: { section: { number: string; eyebrow: string; title: string; lead: string }; titleId: string }) {
  return <header className="gkx-section-heading"><span>{section.number}</span><div><p>{section.eyebrow}</p><h2 id={titleId}>{section.title}</h2><div className="gkx-section-lead">{section.lead}</div></div></header>;
}

const surfaceScreens = [assets.paperList, assets.paperDetail, assets.paperEdit, assets.reading] as const;

export function GkxCase(_props: GkxCaseProps) {
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
      <div className="gkx-hero__copy">
        <p className="gkx-hero__eyebrow">{copy.hero.eyebrow}</p>
        <h1>{copy.hero.title}</h1>
        <p className="gkx-hero__subtitle">{copy.hero.subtitle}</p>
        <dl id="gkx-scope" className="gkx-hero__meta">
          <div><dt>{copy.hero.roleLabel}</dt><dd>{copy.hero.role}</dd></div>
          <div><dt>{copy.hero.scopeLabel}</dt><dd>{copy.hero.scope}</dd></div>
          <div className="is-wide"><dt>{copy.hero.methodLabel}</dt><dd>{copy.hero.method}</dd></div>
        </dl>
      </div>
      <div className="gkx-hero__visuals" aria-label="国科信主要界面">
        <ProjectFigure asset={assets.portal} onOpen={openImage} className="is-primary" priority />
        <ProjectFigure asset={assets.maas} onOpen={openImage} className="is-secondary" />
      </div>
    </header>

    <section className="gkx-chapter gkx-overview" aria-labelledby="gkx-overview-title">
      <SectionHeading section={overviewCopy} titleId="gkx-overview-title" />
      <div className="gkx-overview__body">
        <div>{overviewCopy.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
        <div className="gkx-responsibilities">{overviewCopy.responsibilities.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </div>
      <div className="gkx-system-list" aria-label="项目系统范围">{overviewCopy.systems.map((system, index) => <div key={system}><span>{String(index + 1).padStart(2, "0")}</span><strong>{system}</strong></div>)}</div>
    </section>

    <section id="nsp-structure" className="gkx-chapter gkx-strategy" aria-labelledby="gkx-strategy-title">
      <SectionHeading section={strategyCopy} titleId="gkx-strategy-title" />
      <div id="gkx-decisions" className="gkx-principles">{strategyCopy.principles.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      <div className="gkx-task-comparison">{strategyCopy.taskComparisons.map(item => <article key={item.title}>
        <div className="gkx-task-copy"><h3>{item.title}</h3><strong>{item.task}</strong><ul>{item.priorities.map(point => <li key={point}>{point}</li>)}</ul></div>
        <ProjectFigure asset={figureById[item.figureId]} onOpen={openImage} />
      </article>)}</div>
      <p className="gkx-strategy__closing">{strategyCopy.closing}</p>
    </section>

    <section id="nsp-rules" className="gkx-chapter gkx-rules" aria-labelledby="gkx-rules-title">
      <SectionHeading section={rulesCopy} titleId="gkx-rules-title" />
      <article id="gkx-system" className="gkx-rule-intro">
        <ReferenceFigure asset={assets.layers} onOpen={openImage} />
        <div><h3>字段组织、操作容器与页面承载，共同构成跨系统的规范基础</h3><p>从字段、容器到页面，按层级梳理通用元素与行为规则，再把规则放回论文管理、阅读工作区和模型广场等真实任务中核对。</p></div>
      </article>

      <article className="gkx-rule-module gkx-rule-search">
        <header><span>{searchModule.number}</span><div><h3>{searchModule.title}</h3><p>{searchModule.decision}</p></div></header>
        <div className="gkx-before-after">
          <ProjectFigure asset={{ ...assets.paperBefore, caption: searchModule.beforeLabel ?? assets.paperBefore.caption }} onOpen={openImage} className="is-search-crop" />
          <ProjectFigure asset={{ ...assets.paperList, caption: searchModule.afterLabel ?? assets.paperList.caption }} onOpen={openImage} className="is-search-crop" />
        </div>
        <div className="gkx-decision-strip">{searchModule.details.map((detail, index) => <div key={detail}><span>{String(index + 1).padStart(2, "0")}</span><p>{detail}</p></div>)}</div>
      </article>

      <article className="gkx-rule-module gkx-rule-operations">
        <div className="gkx-rule-split-copy"><span>{operationsModule.number}</span><div><h3>{operationsModule.title}</h3><p>{operationsModule.problem}</p><strong>{operationsModule.decision}</strong><ul>{operationsModule.details.map(detail => <li key={detail}>{detail}</li>)}</ul></div></div>
        <ProjectFigure asset={assets.uxRules} onOpen={openImage} className="gkx-wide-rule" />
      </article>

      <article className="gkx-rule-module gkx-rule-containers">
        <header><span>{containersModule.number}</span><div><h3>{containersModule.title}</h3><p>{containersModule.decision}</p></div></header>
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
            <ReferenceFigure asset={assets.pageTypes} onOpen={openImage} />
            <p>{containersModule.reason}</p>
            <ul>{containersModule.details.map(detail => <li key={detail}>{detail}</li>)}</ul>
          </aside>
        </div>
      </article>

      <article className="gkx-rule-module gkx-rule-recovery">
        <div className="gkx-rule-split-copy"><span>{recoveryModule.number}</span><div><h3>{recoveryModule.title}</h3><p>{recoveryModule.reason}</p><ol>{recoveryModule.details.map((detail, index) => <li key={detail}><span>{index + 1}</span>{detail}</li>)}</ol></div></div>
        <ProjectFigure asset={assets.importError} onOpen={openImage} className="is-recovery-crop" />
      </article>

      <article id="gkx-collaboration" className="gkx-workbench-block">
        <header><p>{rulesCopy.workbench.eyebrow}</p><h3>{rulesCopy.workbench.title}</h3><div>{rulesCopy.workbench.text}</div><small>{rulesCopy.workbench.interactionHint}</small></header>
        <GkxDesignSystemInteractive />
      </article>
    </section>

    <section id="nsp-prototype" className="gkx-chapter gkx-prototype" aria-labelledby="gkx-prototype-title">
      <SectionHeading section={prototypeCopy} titleId="gkx-prototype-title" />
      <ol id="gkx-workflow" className="gkx-prototype-steps">{prototypeCopy.steps.map(step => <li key={step.number}><span>{step.number}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol>
      <div id="gkx-validation" className="gkx-prototype-checks"><strong>我的判断</strong>{prototypeCopy.checks.map(check => <article key={check.title}><h3>{check.title}</h3><p>{check.text}</p></article>)}</div>
      <div className="gkx-prototype-evidence">
        <ProjectFigure asset={assets.reading} onOpen={openImage} className="is-reading" />
        <div className="gkx-prototype-notes">{prototypeCopy.examples.map(example => <article key={example.title}><h3>{example.title}</h3><p>{example.text}</p></article>)}<p className="gkx-prototype-reflection">{prototypeCopy.reflection}</p></div>
        <ProjectFigure asset={assets.portal} onOpen={openImage} className="is-portal-support" />
      </div>
    </section>

    <section id="gkx-supplier" className="gkx-chapter gkx-supplier" aria-labelledby="gkx-supplier-title">
      <SectionHeading section={supplierCopy} titleId="gkx-supplier-title" />
      <div className="gkx-audit-table" role="table" aria-label="合作商交付核对维度">
        <div className="gkx-audit-table__head" role="row"><span role="columnheader">核对维度</span><span role="columnheader">检查对象</span><span role="columnheader">判断依据</span></div>
        {supplierCopy.auditDimensions.map(dimension => <div className="gkx-audit-table__row" role="row" key={dimension.number}>
          <div role="cell"><span>{dimension.number}</span><strong>{dimension.title}</strong><p>{dimension.summary}</p></div>
          <ul role="cell"><li>{dimension.points[0]}</li><li>{dimension.points[1]}</li></ul>
          <p role="cell">{dimension.points[2]}</p>
        </div>)}
      </div>
      <p className="gkx-supplier__closing">{supplierCopy.closing}</p>
    </section>

    <section id="gkx-outcomes" className="gkx-chapter gkx-outcomes" aria-labelledby="gkx-outcomes-title">
      <SectionHeading section={outcomesCopy} titleId="gkx-outcomes-title" />
      <div className="gkx-outcome-ledger">{outcomesCopy.outcomes.map((outcome, index) => <article key={outcome.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{outcome.title}</h3><p>{outcome.text}</p></article>)}</div>
      <div className="gkx-reflection"><h3>项目复盘</h3><ol>{outcomesCopy.reflections.map(item => <li key={item.number}><span>{item.number}</span><div><strong>{item.title}</strong><p>{item.text}</p></div></li>)}</ol></div>
    </section>

    {viewer ? <ImageViewer asset={viewer} originalSize={originalSize} setOriginalSize={setOriginalSize} onClose={() => setViewer(null)} dialogRef={dialogRef} closeButtonRef={closeButtonRef} /> : null}
  </article>;
}
