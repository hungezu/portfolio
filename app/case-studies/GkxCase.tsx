"use client";
import { useI18n, OriginalLanguage } from "../i18n";


import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject, type MouseEvent as ReactMouseEvent } from "react";
import { Button, Table, Tag } from "@arco-design/web-react";
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconImage } from "@arco-design/web-react/icon";
import { publicAsset, type Project } from "../portfolio-data";
import { PortfolioImage } from "../portfolio-image";
import { ProjectLocator } from "../project-locator";
import { GkxPaperQueryDemo } from "./GkxPaperQueryDemo";
import { GkxSupplementalMaterials } from "./GkxSupplementalMaterials";
import { GkxStandardsApplications } from "./GkxStandardsApplications";
import { GkxSegmentedControl } from "./GkxSegmentedControl";
import { GkxProjectScope, type GkxProjectScopeData } from "./GkxProjectScope";
import { useGkxReferenceNavigation } from "./use-gkx-reference-navigation";
import { gkxThinkTankDetail } from "./gkx-image-assets";
import publicCopy from "./gkx-public-copy.json";
import depth from "./gkx-depth-copy.json";
import "./gkx-case.css";
import "./gkx-narrative.css";

export type GkxCaseProps = { project: Project; legacyView?: "story" | "systems" | "design-system" };

type OverviewSection = {
  id: string; title: string; lead: string;
  goals: Array<{ label: string; title: string; text: string }>;
  scope: GkxProjectScopeData;
  responsibilities: {
    title: string; lead: string;
    items: Array<{ kind: "lead" | "independent" | "review"; role: string; stage: string; text: string }>;
  };
};

type StrategySection = {
  id: string; title: string; lead: string;
  sharedRule: {
    title: string; lead: string; reason: string;
    examples: Array<{ figureId: string; system: string; title: string; viewBox: string; compactViewBox: string; displayScale?: number; adaptation: string; roleLabel: string; role: string }>;
  };
  taskComparisons: Array<{ title: string; task: string; decision: string; figureId: string }>;
  closing: string;
};

type DecisionOption = { name: string; usage?: string; selected: boolean; condition: string; cost: string };
type DecisionComparisonCopy = {
  options?: DecisionOption[];
  scenarios?: Array<{ key: string; label: string; reason: string; options: DecisionOption[] }>;
  pendingCheck: string;
};

type RulesSection = {
  id: string; title: string; lead: string;
  modules: Array<{
    key: string; title: string; problem: string; decision: string; reason: string;
    details: string[]; beforeLabel?: string; afterLabel?: string;
    comparison?: DecisionComparisonCopy;
    tabs?: Array<{ label: string; figureId: string }>;
  }>;
  workbench: { title: string; text: string };
};

type PrototypeSection = {
  id: string; title: string; lead: string;
  examples: Array<{ title: string; text: string; figureId: string }>;
  collaborationEvidence: {
    title: string; lead: string; requirement: string;
    comparisons: Array<{ title: string; before: string; after: string }>;
    check: string; status: string;
  };
};

type SupplierSection = {
  id: string; title: string; lead: string;
  reviewer: string;
  reviewRecords: Array<{ date: string; module: string; conclusion: string; currentStatus: string; finalStatus: string; sourceRow: number }>;
  recordNote: string;
  teamFinding: { title: string; date: string; object: string; issue: string; decision: string };
  auditDimensions: Array<{ number: string; title: string; summary: string; points: string[] }>;
  closing: string;
};

type OutcomesSection = {
  id: string; title: string; lead: string;
  reflections: Array<{ number: string; title: string; text: string }>;
};

type PublicCopy = {
  hero: {
    title: string; titleAccent: string; subtitle: string; roleLabel: string; role: string;
    scopeLabel: string; scope: string; periodLabel: string;
  };
  navigation: Array<{ id: string; label: string }>;
  sections: [OverviewSection, StrategySection, RulesSection, PrototypeSection, SupplierSection, OutcomesSection];
  captions: Record<string, string>;
};

const copy = publicCopy as unknown as PublicCopy;
const [overviewCopy, strategyCopy, rulesCopy, prototypeCopy, supplierCopy, outcomesCopy] = copy.sections;
const sections = copy.navigation.map(({ id, label }) => [id, label] as const);
const legacyAnchors: Record<string, string> = {
  "gkx-business-flow-detail": "gkx-rule-containers",
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

type EvidenceHighlight = { x: number; y: number; width: number; height: number; sourceRow: number };
type ImageAsset = { src: string; alt: string; caption: string; width: number; height: number; highlights?: EvidenceHighlight[] };

const assets = {
  workflowBuilder: { src: "/assets/projects/gkx/workflow-builder.jpg", alt: "流程设计器脱敏与重构图稿，展示对象管理列表与节点建模工作区", caption: "流程设计器 · 脱敏与重构图稿", width: 1800, height: 1012 },
  portalEntry: { src: `${assetRoot}/ui/portal-entry-prototype-20261114.webp`, alt: "最新门户原型的科研知识智能搜索入口，包含关键词搜索、AI 搜索与论文、专家等任务入口，机构标识已裁去", caption: "智慧门户 · 最新检索入口原型", width: 1232, height: 576 },
  portalResults: { src: `${assetRoot}/ui/portal-results-prototype-20261114.webp`, alt: "最新门户原型的关键词结果局部，展示资源类型切换与一条结果的标题、来源、摘要和标签；数量与内容为演示数据", caption: "智慧门户 · 多类型结果局部（原型）", width: 952, height: 225 },
  designSystemArchitecture: { src: `${assetRoot}/ui/design-system-gkx-mapping.webp`, alt: "GKX规范组织示意图，从基础样式、组件与交互规则到页面任务与交付核对，对应新型高端智库、科技情报挖掘平台、情报管理系统和超大规模智算引擎", caption: "规范体系 · 从共用规则到GKX业务页面", width: 1862, height: 845 },
  designSystemPageTypes: { src: `${assetRoot}/ui/design-system-page-types.webp`, alt: "页面信息架构与页面类型图，展示标题栏、内容区、底部栏的组成，以及列表、详情、表单、仪表盘、模态和状态提示页", caption: "页面类型 · 从信息结构到页面骨架", width: 1796, height: 876 },
  outcomeWorkflow: { src: `${assetRoot}/ui/design-workflow-gkx.webp`, alt: "项目方法复盘示意，归纳查询复现与模块评审中的业务约束、MD、方案对照、原型核对、规范对齐、意见记录与后续复核", caption: "方法复盘示意 · 汇总查询复现与模块评审中的核对方法", width: 1840, height: 855 },
  aiWorkflow: { src: `${assetRoot}/ui/ai-human-workflow-codex.png`, alt: "AI 生成与探索、人工判断与决策通过持续验证形成双环协作，连接业务上下文、结构化设计输入、设计约束与资产沉淀", caption: "AI 与人工协作工作流", width: 1862, height: 845 },
  aiCasesOriginal: { src: `${assetRoot}/evidence/ai-cases-product-panel-20261017.webp`, alt: "产品 AI 原型的主体面板，保留行业筛选、搜索、视图切换和完整报告卡片，外围菜单与导航已裁去", caption: "产品提供的 AI 原型 · 主体面板", width: 1658, height: 949 },
  aiCasesDesigner: { src: `${assetRoot}/evidence/ai-cases-designer-panel-filters-20261018.webp`, alt: "本人优化版本的主体面板，本轮补齐搜索、时间、排序的前置字段标签并统一控件顺序，保留报告卡片与分页，外围菜单、顶栏及导航标识已裁去", caption: "本人优化版本 · 查询样式统一修订", width: 1662, height: 946 },
  reviewRecordsEvidence: { src: `${assetRoot}/evidence/ui-review-records-redacted.png`, alt: "真实 UI 评审台账截图，展示评审日期、模块、评审人及原表状态字段，厂商与相关敏感信息已模糊", caption: "真实评审台账 · 敏感信息已模糊", width: 1651, height: 871 },
  teamReviewEvidence: { src: `${assetRoot}/evidence/team-review-finding-redacted.png`, alt: "真实团队审核意见截图，记录关系模块 UI 风格与规范不一致的评审意见，厂商与相关敏感信息已模糊", caption: "团队审核意见 · 敏感信息已模糊", width: 1651, height: 871 },
  portal: { src: `${assetRoot}/ui/portal-workspace.png`, alt: "智慧门户我的空间界面，包含资料目录与文档列表", caption: copy.captions["ui-portal"], width: 1400, height: 778 },
  reading: { src: `${assetRoot}/ui/portal-reading.png`, alt: "智慧门户智能阅读工作区，左侧目录、中间原文、右侧辅助信息", caption: copy.captions["ui-reading"], width: 1400, height: 778 },
  maas: { src: `${assetRoot}/ui/maas-model-gallery.png`, alt: "超大规模智算引擎内的 MaaS 模型广场界面，展示模型筛选与模型卡片", caption: copy.captions["ui-maas"], width: 1400, height: 778 },
  thinkTank: gkxThinkTankDetail,
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
  "ui-cases-designer": assets.aiCasesDesigner,
};

const reviewRowHighlights: Record<number, EvidenceHighlight> = {
  8: { x: 2, y: 401, width: 1378, height: 27, sourceRow: 8 },
  11: { x: 2, y: 482, width: 1378, height: 28, sourceRow: 11 },
  15: { x: 2, y: 590, width: 1634, height: 28, sourceRow: 15 },
};

function reviewRecordImage(record?: SupplierSection["reviewRecords"][number]): ImageAsset {
  return {
    ...assets.reviewRecordsEvidence,
    caption: record ? `${record.module} · 原表第 ${record.sourceRow} 行（脱敏截图）` : "真实评审台账 · 蓝框对应本页三条节选",
    highlights: record ? [reviewRowHighlights[record.sourceRow]] : supplierCopy.reviewRecords.map(item => reviewRowHighlights[item.sourceRow]),
  };
}

function ProjectFigure({ asset, onOpen, className = "", priority = false, description, viewBox, compactViewBox, stageSize, caption }: {
  asset: ImageAsset;
  onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void;
  className?: string;
  priority?: boolean;
  description?: string;
  viewBox?: string;
  compactViewBox?: string;
  stageSize?: { width: number; height: number };
  caption?: string;
}) {
  const { t } = useI18n();
  const wideWidth = stageSize?.width ?? (viewBox ? Number(viewBox.split(/\s+/)[2]) : asset.width);
  const compactWidth = compactViewBox ? Number(compactViewBox.split(/\s+/)[2]) : wideWidth;
  const sourceSize = { "--gkx-source-width": `${wideWidth}px`, "--gkx-compact-source-width": `${compactWidth}px` } as CSSProperties;
  const renderCrop = (box: string, variant: string) => {
    const [, , width, height] = box.split(/\s+/).map(Number);
    const stage = variant === "is-compact" ? { width, height } : stageSize ?? { width, height };
    return <svg className={`gkx-project-figure__detail ${variant}`} viewBox={`0 0 ${stage.width} ${stage.height}`} preserveAspectRatio="xMidYMin meet" role="img" aria-label={t(asset.alt)}><svg x={(stage.width - width) / 2} y="0" width={width} height={height} viewBox={box} overflow="hidden"><image href={publicAsset(asset.src)} width={asset.width} height={asset.height} /></svg></svg>;
  };
  const openLabel = t(`查看原图：${caption ?? asset.caption}`);
  return <figure className={`gkx-project-figure has-source-size ${className}`.trim()} style={sourceSize}>
    <button type="button" className="gkx-image-button" aria-label={openLabel} aria-description={t(description)} onClick={event => onOpen(asset, event.currentTarget)}>
      {viewBox || compactViewBox ? <>{renderCrop(viewBox ?? `0 0 ${asset.width} ${asset.height}`, compactViewBox ? "is-wide" : "")}{compactViewBox && renderCrop(compactViewBox, "is-compact")}</> : <PortfolioImage src={publicAsset(asset.src)} alt={t(asset.alt)} width={asset.width} height={asset.height} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" />}
    </button>
    <figcaption><strong>{t(caption ?? asset.caption)}</strong><button type="button" className="gkx-figure-open" aria-label={openLabel} onClick={event => onOpen(asset, event.currentTarget)}>{t("原图")}</button></figcaption>
  </figure>;
}

function DecisionArgument({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  const { t } = useI18n();
  return <aside className="gkx-decision-argument"><h4>{t(title)}</h4><div>{paragraphs.map(text => <p key={text}>{t(text)}</p>)}</div></aside>;
}

function AiCollaborationEvidence({ onOpen }: { onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void }) {
  const { t, localize } = useI18n();
  const [version, setVersion] = useState<"original" | "designer">("designer");
  const selected = version === "original" ? assets.aiCasesOriginal : assets.aiCasesDesigner;
  return <article id="gkx-ai-collaboration-evidence" className="gkx-ai-collaboration-evidence" aria-labelledby="gkx-ai-evidence-title">
    <header className="gkx-content-heading"><h3 id="gkx-ai-evidence-title">{t(depth.ai.cardTitle)}</h3></header>
    <p className="gkx-story-intro">{t(depth.ai.intro)}</p>
    <div className="gkx-ai-card-comparison">
      <ProjectFigure asset={assets.aiCasesOriginal} onOpen={onOpen} viewBox="48 514 503 399" stageSize={{ width: 740, height: 399 }} caption={depth.ai.before} />
      <ProjectFigure asset={assets.aiCasesDesigner} onOpen={onOpen} viewBox="70 419 740 285" stageSize={{ width: 740, height: 399 }} caption={depth.ai.after} />
    </div>
    <p className="gkx-analysis-paragraph">{t(depth.ai.cardWhy)}</p>
    <article id="gkx-ai-toolbar-evidence" className="gkx-rule-module">
      <header className="gkx-content-heading"><h3>{t(depth.ai.toolsTitle)}</h3></header>
      <div className="gkx-ai-toolbar-comparison">
        <ProjectFigure asset={assets.aiCasesOriginal} onOpen={onOpen} viewBox="48 278 1565 201" compactViewBox="80 283 610 82" stageSize={{ width: 1565, height: 201 }} caption={depth.ai.toolsBefore} />
        <ProjectFigure asset={assets.aiCasesDesigner} onOpen={onOpen} viewBox="64 330 1550 74" compactViewBox="64 330 610 82" stageSize={{ width: 1565, height: 201 }} caption={depth.ai.toolsAfter} />
      </div>
      <p className="gkx-analysis-paragraph">{t(depth.ai.toolsWhy)}</p>
    </article>
    <details className="gkx-supporting-material"><summary>{t(depth.ai.fullVersions)}</summary>
      <GkxSegmentedControl label={t("切换真实协作证据版本")} value={version} onChange={setVersion} options={localize([{ value: "original", label: "产品 AI 原型" }, { value: "designer", label: "人工优化" }])} />
      <ProjectFigure asset={selected} onOpen={onOpen} className="gkx-ai-full-version" />
    </details>
    <p className="gkx-source-note">{t(depth.ai.check)}</p>
  </article>;
}

function ImageViewer({ asset, originalSize, setOriginalSize, onClose, dialogRef, closeButtonRef }: {
  asset: ImageAsset;
  originalSize: boolean;
  setOriginalSize: (value: boolean) => void;
  onClose: () => void;
  dialogRef: RefObject<HTMLDivElement | null>;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
}) {
  const { t, localize } = useI18n();
  return <div className="gkx-lightbox" role="dialog" aria-modal="true" aria-labelledby="gkx-viewer-title" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={`gkx-lightbox__panel${originalSize ? " is-original" : ""}`} ref={dialogRef}>
      <header>
        <div><strong id="gkx-viewer-title">{t(asset.caption)}</strong><span>{t(asset.highlights ? "蓝框为本页添加的定位标记；截图敏感信息已模糊" : originalSize ? "原始尺寸" : "适合窗口")}</span></div>
        <div className="gkx-lightbox__actions">
          <button type="button" aria-pressed={originalSize} onClick={() => setOriginalSize(!originalSize)}>{t(originalSize ? "适合窗口" : "原始尺寸")}</button>
          <button ref={closeButtonRef} type="button" onClick={onClose}>{t("关闭")}</button>
        </div>
      </header>
      <div className="gkx-lightbox__canvas">
        {t(asset.highlights ? <svg className="gkx-lightbox__evidence" viewBox={`0 0 ${asset.width} ${asset.height}`} width={asset.width} height={asset.height} role="img" aria-label={t(`${asset.alt}，蓝框定位原表第${asset.highlights.map(item => item.sourceRow).join("、")}行`)}>
          <image href={publicAsset(asset.src)} width={asset.width} height={asset.height} />
          {asset.highlights.map(highlight => <rect key={highlight.sourceRow} data-source-row={highlight.sourceRow} x={highlight.x} y={highlight.y} width={highlight.width} height={highlight.height} fill="#165dff" fillOpacity=".09" stroke="#165dff" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />)}
        </svg> : <PortfolioImage src={publicAsset(asset.src)} alt={t(asset.alt)} width={asset.width} height={asset.height} original loading="eager" />)}
      </div>
    </div>
  </div>;
}

function SectionHeading({ section, titleId }: {
  section: { title: string; lead: string }; titleId: string; number?: string; label?: string; leadSegments?: string[];
}) {
  const { t } = useI18n();
  return <header className="gkx-section-heading"><h2 id={titleId}>{t(section.title)}</h2>{section.lead && <p className="gkx-section-lead">{t(section.lead)}</p>}</header>;
}

function FigureDetail({ asset, viewBox, compactViewBox, compactLabel, label, status, onOpen, className = "" }: {
  asset: ImageAsset; viewBox: string; compactViewBox?: string; compactLabel?: string; label: string; status?: string;
  onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void; className?: string;
}) {
  const { t, localize } = useI18n();
  return <figure className={`gkx-figure-detail ${className}`.trim()}>
    <figcaption>{t(status && <span className="gkx-figure-detail__status">{t(status)}</span>)}<span>{t(label)}</span></figcaption>
    <button type="button" className="gkx-image-button" aria-label={t(`查看完整界面：${label}`)} onClick={event => onOpen(asset, event.currentTarget)}>
      <svg className={compactViewBox ? "gkx-figure-detail__wide" : undefined} viewBox={viewBox} role="img" aria-label={t(label)}><image href={publicAsset(asset.src)} width={asset.width} height={asset.height} /></svg>
      {t(compactViewBox && <svg className="gkx-figure-detail__compact" viewBox={compactViewBox} role="img" aria-label={t(compactLabel ?? `${label}，聚焦查询与重置`)}><image href={publicAsset(asset.src)} width={asset.width} height={asset.height} /></svg>)}
      <span aria-hidden="true">{t("查看完整界面")}</span>
    </button>
  </figure>;
}

function BusinessTaskNavigation() {
  const { t } = useI18n();
  return <nav className="gkx-space-navigation" aria-label={t("主要任务空间")}>
    {[
      ["gkx-flow-decision", "流程建模"],
      ["gkx-rule-containers", "对象维护"],
      ["gkx-rule-recovery", "异常恢复"],
    ].map(([id, label]) => <a href={`#${id}`} key={id}>{t(label)}<IconArrowDown aria-hidden="true" /></a>)}
  </nav>;
}

function SharedQueryEvidence({ onOpen }: { onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void }) {
  const { t, localize } = useI18n();
  const rule = strategyCopy.sharedRule;
  return <section id="gkx-decisions" className="gkx-shared-query" aria-labelledby="gkx-shared-query-title">
    <header className="gkx-content-heading"><h3 id="gkx-shared-query-title">{t(rule.title)}</h3><p>{t(rule.lead)}</p></header>
    <div className="gkx-shared-query__examples">{rule.examples.map(example => {
      const asset = figureById[example.figureId];
      const [, , cropWidth, cropHeight] = example.viewBox.split(" ").map(Number);
      // Normalize different screenshot export densities without changing the source evidence.
      const scale = example.displayScale ?? 1;
      return <article key={example.figureId}>
      <header><h4>{t(example.title)}</h4><p>{t(example.system)}</p></header>
      <figure className="gkx-shared-query__figure">
        <button type="button" className="gkx-image-button" aria-label={t(`查看完整界面：${example.title} · 查询工具区局部`)} onClick={event => onOpen(asset, event.currentTarget)}>
          <svg className="gkx-shared-query__canvas" viewBox="0 0 1000 80" role="img" aria-label={t(`${example.title} · 查询工具区局部`)}>
            <svg x="0" y={(80 - cropHeight * scale) / 2} width={cropWidth * scale} height={cropHeight * scale} viewBox={example.viewBox} overflow="hidden"><image href={publicAsset(asset.src)} width={asset.width} height={asset.height} /></svg>
          </svg>
          <svg className="gkx-shared-query__compact" viewBox={example.compactViewBox} role="img" aria-label={t(`${example.title} · 搜索标签与关键词输入框局部`)}><image href={publicAsset(asset.src)} width={asset.width} height={asset.height} /></svg>
          <span aria-hidden="true">{t("查看完整界面")}</span>
        </button>
      </figure>
      <dl><div><dt>{t("业务适配")}</dt><dd>{t(example.adaptation)}</dd></div><div className={`gkx-shared-query__role${example.roleLabel === "本人调整" || example.roleLabel === "本人主导" ? " is-contribution" : ""}`}><dt>{t(example.roleLabel)}</dt><dd>{t(example.role)}</dd></div></dl>
    </article>;})}</div>
    <p className="gkx-shared-query__reason"><strong>{t("选择依据")}</strong><span>{t(rule.reason)}</span></p>
  </section>;
}

function PortalTaskEvidence({ onOpen }: { onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void }) {
  const { t } = useI18n();
  return <section id="gkx-portal-task" className="gkx-portal-task" aria-labelledby="gkx-portal-task-title">
    <header className="gkx-content-heading"><h3 id="gkx-portal-task-title">{t("入口统一，结果按资源组织")}</h3></header>
    <ProjectFigure asset={assets.portalResults} onOpen={onOpen} />
    <p className="gkx-source-note">{t("关键词结果以类型、来源与摘要区分内容；当前截图为原型，数量与内容为演示数据。")}</p>
  </section>;
}

function TaskComparison({ onOpen }: { onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void }) {
  const { t } = useI18n();
  return <div className="gkx-domain-studies">{depth.strategy.examples.map(item => <article key={item.figureId}>
    <header><h3>{t(item.title)}</h3><p>{t(item.argument)}</p></header>
    <ProjectFigure asset={figureById[item.figureId]} onOpen={onOpen} viewBox={item.figureId === "ui-maas" ? "226 168 1130 382" : "299 601 1384 559"} compactViewBox={item.figureId === "ui-maas" ? "244 284 386 242" : "299 601 692 350"} caption={item.figureId === "ui-maas" ? "MaaS 模型广场 · 规范应用对照" : "高端智库 · 领域与技术概览"} />
  </article>)}</div>;
}

function DecisionComparison({ comparison, reason, titleId, children, activeScenario }: {
  comparison?: DecisionComparisonCopy; reason?: string; titleId: string; children: ReactNode; activeScenario?: string;
}) {
  const { t } = useI18n();
  const scenario = comparison?.scenarios?.find(item => item.key === activeScenario) ?? comparison?.scenarios?.[0];
  const options = scenario?.options ?? comparison?.options ?? [];
  const selected = options.find(option => option.selected);
  if (!selected || !comparison) return null;
  return <section className="gkx-decision-comparison" aria-labelledby={titleId}>
    <div className="gkx-decision-layout">
      <div className="gkx-decision-evidence">{children}</div>
      <div className="gkx-decision-choices">
        <h4 id={titleId}>{t(selected.name)}</h4>
        <p>{t(reason ?? selected.condition)}</p><p className="gkx-decision-cost">{t(selected.cost)}</p>
        {options.filter(option => !option.selected).map(option => <details className="gkx-other-choice" key={option.name}><summary>{t(option.name)}</summary><p>{t(option.condition)}</p><p>{t(option.cost)}</p></details>)}
      </div>
    </div>
    <p className="gkx-source-note">{t(comparison.pendingCheck)}</p>
  </section>;
}

function PaperWorkflowExample({ onReferenceClick }: {
  onOpen?: (asset: ImageAsset, trigger: HTMLButtonElement) => void;
  onReferenceClick: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}) {
  const { t } = useI18n();
  return <article id="gkx-workflow" className="gkx-validation-evidence">
    <div className="gkx-query-validation-intro"><h3>{t("将设计要求写成可检查的规则")}</h3><p>{t("组合筛选、无结果与重置已在作品集交互复现中核对，使用论文与专利示例数据。")}</p></div>
    <div className="gkx-query-contract"><pre><code>{t("搜索匹配标题、关键词\n机构条件与搜索共同生效\n无结果时可以清除条件\n重置恢复全部记录")}</code></pre><a id="gkx-ai-rules-reference" href="#gkx-standards-applications" onClick={onReferenceClick}>{t("查看对应规范")}<IconArrowRight aria-hidden="true" /></a></div>
    <details className="gkx-supporting-material"><summary>{t("展开查询演示")}</summary><div id="gkx-ai-query-validation"><OriginalLanguage><GkxPaperQueryDemo /></OriginalLanguage></div></details>
  </article>;
}

function DeliveryReview({ onOpen, onReferenceClick }: { onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void; onReferenceClick: (event: ReactMouseEvent<HTMLAnchorElement>) => void }) {
  const { t, localize } = useI18n();
  const featured = supplierCopy.reviewRecords.find(record => record.sourceRow === 15);
  const statusTag = (value: string) => <Tag color={value === "需修改" ? "gold" : "blue"} size="medium">{t(value)}</Tag>;
  return <section id="gkx-supplier" className="gkx-delivery-review" aria-labelledby="gkx-supplier-title">
    <header className="gkx-content-heading"><h3 id="gkx-supplier-title">{t(depth.delivery.reviewTitle)}</h3><p>{t(depth.delivery.reviewArgument)}</p></header><p className="gkx-source-note">{t(depth.delivery.sourceNote)}</p>
    {featured && <article id="gkx-component-review" className="gkx-featured-review" aria-labelledby="gkx-component-review-title">
      <header className="gkx-content-heading"><h4 id="gkx-component-review-title">{t(depth.delivery.example.title)}</h4></header>
      <dl className="gkx-review-facts"><div><dt>{t("评审日期")}</dt><dd>{featured.date}</dd></div><div><dt>{t("模块")}</dt><dd>{t(featured.module)}</dd></div><div><dt>{t("原表最终状态")}</dt><dd>{t(featured.finalStatus)}</dd></div></dl>
      <blockquote className="gkx-review-quote"><p>{t(depth.delivery.example.quote)}</p><footer><span>{t(depth.delivery.example.caption)}</span><button type="button" onClick={event => onOpen(reviewRecordImage(featured), event.currentTarget)}>{t("查看原表第 15 行")}</button></footer></blockquote>
      <p className="gkx-analysis-paragraph">{t(depth.delivery.example.argument)}</p>
      <a id="gkx-review-rules-reference" className="gkx-section-reference" href="#gkx-collaboration" onClick={onReferenceClick}>{t(depth.delivery.example.link)}<IconArrowRight aria-hidden="true" /></a>
      <p className="gkx-source-note">{t(depth.delivery.example.boundary)}</p>
    </article>}
    <details className="gkx-supporting-material gkx-signed-records-disclosure"><summary>{t("查看三条署名评审记录")}</summary>
    <article className="gkx-review-records" aria-labelledby="gkx-review-records-title">
      <header><h4 id="gkx-review-records-title">{t("本人署名的评审记录")}</h4><p>{t("科技专题服务系统 · 脱敏节选")}</p></header>
      <p className="gkx-review-scroll-hint">{t("左右滑动查看完整评审记录")}</p>
      <Table aria-label={t("本人署名的UI评审记录脱敏摘录")} rowKey="module" data={localize(supplierCopy.reviewRecords)} pagination={false} hover={false} size="default" tableLayoutFixed border={{ wrapper: false, headerCell: false, bodyCell: false }} scroll={{ x: 960 }} columns={localize([
        { title: "评审日期", dataIndex: "date", width: 140 },
        { title: "模块", dataIndex: "module", width: 260 },
        { title: "评审结论", dataIndex: "conclusion", width: 150, render: statusTag },
        { title: "原表最终状态", dataIndex: "finalStatus", width: 180, render: statusTag },
        { title: "原表对应", dataIndex: "sourceRow", width: 220, render: (sourceRow: number, record: SupplierSection["reviewRecords"][number]) => <Button type="text" className="gkx-review-row-source" aria-label={t(`查看${record.module}对应的台账第${sourceRow}行`)} onClick={event => { if (event.currentTarget instanceof HTMLButtonElement) onOpen(reviewRecordImage(record), event.currentTarget); }}><span>{t("原表第 ")}{t(sourceRow)} {t(" 行")}</span><IconArrowRight aria-hidden="true" /></Button> },
      ])} />
      <footer className="gkx-review-source-footer"><div><p>{t(supplierCopy.recordNote)}</p><p>{t("完整状态字段见原表截图；原表未填写二次评审日期。")}</p></div><Button type="outline" className="gkx-review-evidence-button" icon={<IconImage aria-hidden="true" />} aria-label={t("查看整张评审台账截图，蓝框标出三条节选记录")} onClick={event => { if (event.currentTarget instanceof HTMLButtonElement) onOpen(reviewRecordImage(), event.currentTarget); }}>{t("查看整张截图")}</Button></footer>
    </article>
    </details>
    <article className="gkx-review-finding" aria-labelledby="gkx-review-finding-title">
      <header><h4 id="gkx-review-finding-title">{t(supplierCopy.teamFinding.title)}</h4><p>{t("团队评审意见")}<span>{t(supplierCopy.teamFinding.date)}</span></p></header>
      <dl><div><dt>{t("审核对象")}</dt><dd>{t(supplierCopy.teamFinding.object)}</dd></div><div><dt>{t("发现的问题")}</dt><dd>{t(supplierCopy.teamFinding.issue)}</dd></div><div><dt>{t("评审要求")}</dt><dd>{t(supplierCopy.teamFinding.decision)}</dd></div></dl>
      <footer className="gkx-review-source-footer"><p>{t("对应《评审记录与待办清单》原表第 5 行")}</p><Button type="outline" className="gkx-review-evidence-button" icon={<IconImage aria-hidden="true" />} aria-label={t("查看团队审核意见对应的原表第5行")} onClick={event => { if (event.currentTarget instanceof HTMLButtonElement) onOpen({ ...assets.teamReviewEvidence, caption: "团队审核意见 · 原表第 5 行（脱敏截图）", highlights: [{ x: 2, y: 270, width: 1513, height: 194, sourceRow: 5 }] }, event.currentTarget); }}>{t("查看对应截图")}</Button></footer>
    </article>
    <details className="gkx-review-method gkx-supporting-material"><summary>{t("通用审核维度")}</summary><section aria-labelledby="gkx-review-method-title">
        <header><h4 id="gkx-review-method-title" className="gkx-review-method-title">{t("通用审核维度")}</h4><p>{t("需求、交互、视觉与接口")}</p></header>
        <dl>{supplierCopy.auditDimensions.map(dimension => <div key={dimension.number}><dt>{t(dimension.title)}</dt><dd>{t(dimension.points.join(" "))}</dd></div>)}</dl>
    </section></details>
  </section>;
}

export function GkxCase({ project, legacyView }: GkxCaseProps) {
  const { t, localize } = useI18n();
  const [reader, setReader] = useState<"overview" | "full">("full");
  const [containerView, setContainerView] = useState<"detail" | "edit">("detail");
  useEffect(() => {
    document.querySelectorAll<HTMLElement>(".gkx-narrative > .gkx-chapter").forEach(chapter => {
      const disclosure = chapter.querySelector<HTMLDetailsElement>(":scope > .gkx-chapter-disclosure");
      if (disclosure) disclosure.open = reader === "full" || ["gkx-project-context", "gkx-outcomes"].includes(chapter.id);
    });
  }, [reader]);
  const { openReference, returnToSource, clearReference, returnAvailable } = useGkxReferenceNavigation("gkx-ai-rules-reference", "gkx-standards-applications");
  const reviewReference = useGkxReferenceNavigation("gkx-review-rules-reference", "gkx-collaboration");
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
    let details: HTMLElement | null = document.getElementById(target);
    const nested = details?.querySelector(":scope > .gkx-chapter-disclosure");
    if (nested instanceof HTMLDetailsElement) nested.open = true;
    while (details) {
      if (details instanceof HTMLDetailsElement) details.open = true;
      details = details.parentElement;
    }
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
  const revealEvidence = (event: ReactMouseEvent<HTMLElement>) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    const destination = link ? document.getElementById(link.hash.slice(1)) : null;
    if (destination instanceof HTMLDetailsElement) destination.open = true;
    const chapter = destination?.querySelector(":scope > .gkx-chapter-disclosure");
    if (chapter instanceof HTMLDetailsElement) chapter.open = true;
    let parent = destination?.parentElement;
    while (parent) { if (parent instanceof HTMLDetailsElement) parent.open = true; parent = parent.parentElement; }
  };

  return <article className="gkx-case gkx-narrative" data-reader={reader} aria-label={t("GKX门户与多系统体验设计项目")} onClickCapture={revealEvidence}>
    <ProjectLocator sections={sections} legacyAnchors={legacyAnchors} compactMenu ariaLabel={t("GKX项目章节定位")} onNavigate={() => { clearReference(); reviewReference.clearReference(); }} />
    <header id="gkx-overview" className="gkx-hero">
      <h1><span className="gkx-hero__name" data-project-motion-title>{t("GKX 智慧门户")}</span><span className="gkx-hero__thesis">{t("多系统体验设计与 ")}<span className="gkx-hero__accent">{t("AI 协作方法")}</span></span></h1>
      <p className="gkx-hero__subtitle">{t("主导主要业务页面的 UI 与交互，独立完成规范与设计 MD，并参与交付评审。")}</p>
      <div className="gkx-reader-controls"><GkxSegmentedControl<"overview" | "full"> label={t("阅读模式")} value={reader} onChange={setReader} options={localize([{ value: "overview", label: "项目概览" }, { value: "full", label: "完整案例" }])} /></div>
      <dl id="gkx-scope" className="gkx-hero__facts"><div><dt>{t("项目范围")}</dt><dd>{t(copy.hero.scope)}</dd></div><div><dt>{t("合同周期")}</dt><dd>{t(project.period)}</dd></div></dl>
      <ProjectFigure asset={assets.portalEntry} onOpen={openImage} viewBox="0 0 1232 345" className="gkx-hero__frame" priority />
    </header>

    <section id="gkx-project-context" className="gkx-chapter" aria-labelledby="gkx-overview-title">
      <details className="gkx-chapter-disclosure" open={true}><summary aria-labelledby="gkx-overview-title"><SectionHeading section={reader === "overview" ? { title: depth.overview.title, lead: "" } : depth.sections.challenge} titleId="gkx-overview-title" /><IconArrowDown aria-hidden="true" /></summary>
      <div className="gkx-chapter-content">
      <GkxProjectScope scope={overviewCopy.scope} />
      <div className="gkx-project-priorities">{depth.challenges.map(item => <article key={item.title}><h3>{t(item.title)}</h3><p>{t(item.text)}</p></article>)}</div>
      <section id="gkx-role-scope" className="gkx-contributions" aria-label={t("我的职责与协作")}>
        {overviewCopy.responsibilities.items.map(item => <article key={item.kind}><h3>{t(item.stage)}</h3><p>{t(item.text)}</p></article>)}
      </section>
      {reader === "overview" && <section className="gkx-quick-judgments" aria-label={t("两项关键设计判断")}>
        {depth.overview.decisions.map(item => <article key={item.target}><h3>{t(item.title)}</h3><div><p>{t(item.text)}</p><a href={`#${item.target}`}>{t(item.link)}<IconArrowRight aria-hidden="true" /></a></div></article>)}
        <a className="gkx-quick-proof" href="#gkx-component-review">{t(depth.overview.reviewLink)}<IconArrowRight aria-hidden="true" /></a>
      </section>}
      </div></details>
    </section>

    <section id="gkx-systems" className="gkx-chapter" aria-labelledby="gkx-strategy-title">
      <details className="gkx-chapter-disclosure" open={reader === "full"}><summary aria-labelledby="gkx-strategy-title"><SectionHeading section={depth.sections.strategy} titleId="gkx-strategy-title" /><IconArrowDown aria-hidden="true" /></summary>
      <div className="gkx-chapter-content">
      <DecisionArgument title={depth.strategy.argumentTitle} paragraphs={[depth.strategy.argument]} />
      <div className="gkx-task-matrix" role="table" aria-label={t("跨系统任务与共用规则")}>
        <div className="gkx-task-matrix__header" role="row"><span role="columnheader">{t("任务")}</span><span role="columnheader">{t("共用规则")}</span><span role="columnheader">{t("保留的差异")}</span></div>
        {depth.strategy.matrix.map(item => <div role="row" key={item.task}><strong role="cell">{t(item.task)}</strong><p role="cell">{t(item.shared)}</p><p role="cell">{t(item.difference)}</p></div>)}
      </div>
      <PortalTaskEvidence onOpen={openImage} />
      <TaskComparison onOpen={openImage} />
      <details className="gkx-supporting-material"><summary>{t("共用查询控件的两个应用")}</summary><SharedQueryEvidence onOpen={openImage} /></details>
      <GkxSupplementalMaterials onOpen={openImage} compact omitWorkflow />
      </div></details>
    </section>

    <section id="nsp-rules" className="gkx-chapter" aria-labelledby="gkx-rules-title">
      <details className="gkx-chapter-disclosure" open={reader === "full"}><summary aria-labelledby="gkx-rules-title"><SectionHeading section={depth.sections.spaces} titleId="gkx-rules-title" /><IconArrowDown aria-hidden="true" /></summary>
      <div className="gkx-chapter-content">
      <div id="gkx-business"><BusinessTaskNavigation /></div>
      <article id="gkx-flow-decision" className="gkx-primary-task">
        <header className="gkx-content-heading"><h3>{t(depth.flow.title)}</h3><p>{t(depth.flow.summary)}</p></header>
        <div className="gkx-workflow-pair"><ProjectFigure asset={assets.workflowBuilder} onOpen={openImage} viewBox="970 328 718 400" compactViewBox="1443 363 233 338" className="gkx-workflow-canvas" caption={depth.flow.editorCaption} /><ProjectFigure asset={assets.workflowBuilder} onOpen={openImage} viewBox="1017 491 411 77" className="gkx-mobile-evidence" caption="节点关系 · 发起、处理与结束" /></div>
        <dl className="gkx-flow-context">{depth.flow.contexts.map(item => <div key={item.task}><dt>{t(item.task)}</dt><dd>{t(item.content)}</dd></div>)}</dl>
        <details className="gkx-supporting-material gkx-flow-list-reference"><summary>{t("对照流程对象管理列表")}</summary><ProjectFigure asset={assets.workflowBuilder} onOpen={openImage} viewBox="164 329 525 137" compactViewBox="548 373 137 62" className="gkx-workflow-list" caption={depth.flow.listCaption} /></details>
        <DecisionArgument title={depth.flow.argumentTitle} paragraphs={[depth.flow.paragraphs[0]]} />
        <div id="gkx-flow-publication" className="gkx-flow-publication"><h4>{t(depth.flow.publicationTitle)}</h4><p>{t(depth.flow.paragraphs[1])}</p><dl>{depth.flow.actions.map(item => <div key={item.action}><dt>{t(item.action)}</dt><dd>{t(item.meaning)}</dd></div>)}</dl></div>
      </article>
      <article id="gkx-rule-containers" className="gkx-rule-module gkx-secondary-task">
        <header className="gkx-content-heading"><h3>{t(depth.record.title)}</h3></header>
        <DecisionComparison comparison={containersModule.comparison} reason={depth.record.argument} titleId="gkx-containers-comparison-title" activeScenario="record">
          <GkxSegmentedControl<"detail" | "edit"> label={t("切换承载方式的界面证据")} value={containerView === "edit" ? "edit" : "detail"} onChange={setContainerView} options={localize([{ value: "detail", label: "论文详情" }, { value: "edit", label: "单条编辑" }])} />
          <div id="gkx-business-flow-detail"><ProjectFigure asset={containerView === "edit" ? assets.paperEdit : assets.paperDetail} onOpen={openImage} compactViewBox={containerView === "edit" ? "418 116 380 188" : "420 110 380 190"} caption={containerView === "edit" ? "单条编辑 · 标题与 DOI 字段" : "单条详情 · 对象身份与基础信息"} /></div>
        </DecisionComparison>
      </article>
      <article id="gkx-rule-recovery" className="gkx-rule-module gkx-secondary-task">
        <header className="gkx-content-heading"><h3>{t(depth.recovery.title)}</h3><p>{t(depth.recovery.argument)}</p></header>
        <div className="gkx-decision-layout"><div className="gkx-recovery-evidence"><ProjectFigure asset={assets.importError} onOpen={openImage} viewBox="508 350 428 194" caption="导入失败 · 错误行定位" /><ProjectFigure asset={assets.importError} onOpen={openImage} viewBox="764 618 196 51" className="gkx-mobile-evidence" caption="继续处理 · 重新上传入口" /></div><div className="gkx-recovery-reading"><h4>{t("定位到问题行，再重新上传")}</h4><ol>{recoveryModule.details.map(text => <li key={text}>{t(text)}</li>)}</ol><p className="gkx-source-note">{t("图稿展示错误定位与重传入口；完整恢复流程仍待实现核对。")}</p></div></div>
      </article>
      <details className="gkx-supporting-material"><summary>{t("管理列表的查询与行操作")}</summary>
        <article id="gkx-rule-search"><header className="gkx-content-heading"><h3>{t(searchModule.title)}</h3></header><DecisionComparison comparison={searchModule.comparison} titleId="gkx-search-comparison-title"><div className="gkx-query-comparison"><FigureDetail asset={assets.paperList} viewBox="224 123 875 52" label={t(searchModule.afterLabel ?? assets.paperList.caption)} onOpen={openImage} /><FigureDetail asset={assets.paperBefore} viewBox="224 123 875 52" label={t(searchModule.beforeLabel ?? assets.paperBefore.caption)} onOpen={openImage} /></div></DecisionComparison></article>
        <article id="gkx-rule-operations"><header className="gkx-content-heading"><h3>{t(operationsModule.title)}</h3><p>{t(operationsModule.decision)}</p></header><FigureDetail asset={assets.paperList} viewBox="232 228 1160 282" label={t("记录与右侧行操作")} onOpen={openImage} /><p className="gkx-source-note">{t("超过三项的扩展操作尚未在当前图稿中展示。")}</p></article>
      </details>
      <details id="gkx-reading-workspace" className="gkx-supporting-material"><summary>{t("团队界面对照：智能阅读")}</summary><p className="gkx-story-intro">{t("智能科研与智能阅读不属于本人设计范围。此处仅保留团队界面，用于对照不同任务的信息组织，不作为个人设计决策或成果。")}</p><ProjectFigure asset={assets.reading} onOpen={openImage} caption="智能阅读 · 团队界面对照" /></details>
      </div></details>
    </section>

    <section id="nsp-prototype" className="gkx-chapter" aria-labelledby="gkx-prototype-title">
      <details className="gkx-chapter-disclosure" open={reader === "full"}><summary aria-labelledby="gkx-prototype-title"><SectionHeading section={depth.sections.ai} titleId="gkx-prototype-title" /><IconArrowDown aria-hidden="true" /></summary>
      <div className="gkx-chapter-content">
      <AiCollaborationEvidence onOpen={openImage} />
      <PaperWorkflowExample onReferenceClick={openReference} />
      <details className="gkx-supporting-material"><summary>{t("AI 与人工协作工作流")}</summary><ProjectFigure asset={assets.aiWorkflow} onOpen={openImage} /></details>
      </div></details>
    </section>

    <section id="gkx-design-system" className="gkx-chapter" aria-labelledby="gkx-design-system-title" tabIndex={-1}>
      <details className="gkx-chapter-disclosure" open={reader === "full"}><summary aria-labelledby="gkx-design-system-title"><SectionHeading section={depth.sections.delivery} titleId="gkx-design-system-title" /><IconArrowDown aria-hidden="true" /></summary>
      <div className="gkx-chapter-content">
      <header className="gkx-content-heading"><h3>{t(depth.delivery.title)}</h3><p>{t(depth.delivery.argument)}</p></header>
      <GkxStandardsApplications assets={assets} onOpen={openImage} onReturn={returnAvailable ? returnToSource : undefined} />
      <article id="gkx-collaboration" className="gkx-standard-preview">{reviewReference.returnAvailable && <Button type="outline" onClick={reviewReference.returnToSource}>{t("返回评审记录")}</Button>}<header className="gkx-content-heading"><h3>{t("设计规范与页面目录")}</h3></header><div className="gkx-md-interactive"><iframe src={publicAsset("/assets/projects/gkx/design-preview/index.html?id=page-index&embed=1&v=20261115-layout")} title={t("GKX可交互设计规范")} loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms" /></div></article>
      <details className="gkx-supporting-material"><summary>{t("规范体系与页面类型")}</summary><div className="gkx-standard-diagrams"><ProjectFigure asset={assets.designSystemArchitecture} onOpen={openImage} /><ProjectFigure asset={assets.designSystemPageTypes} onOpen={openImage} /></div></details>
      <DeliveryReview onOpen={openImage} onReferenceClick={reviewReference.openReference} />
      </div></details>
    </section>

    <section id="gkx-outcomes" className="gkx-chapter" aria-labelledby="gkx-outcomes-title">
      <details className="gkx-chapter-disclosure" open={true}><summary aria-labelledby="gkx-outcomes-title"><SectionHeading section={depth.sections.reflection} titleId="gkx-outcomes-title" /><IconArrowDown aria-hidden="true" /></summary>
      <div className="gkx-chapter-content">
      <div className="gkx-growth-records">{depth.reflections.map(item => <article key={item.title}><h3>{t(item.title)}</h3><div><p>{t(reader === "overview" ? item.summary : item.text)}</p><a href={`#${item.target}`}>{t(item.link)}<IconArrowRight aria-hidden="true" /></a></div></article>)}</div>
      <details className="gkx-supporting-material"><summary>{t("查看工作方法梳理图")}</summary><ProjectFigure asset={assets.outcomeWorkflow} onOpen={openImage} /></details>
      <p className="gkx-case-boundary">{t("业务内容已脱敏或重构。图稿、交互复现与评审台账分别呈现其证据范围，不代表项目验收或业务收益。")}</p>
      </div></details>
    </section>
    {viewer && <ImageViewer asset={viewer} originalSize={originalSize} setOriginalSize={setOriginalSize} onClose={() => setViewer(null)} dialogRef={dialogRef} closeButtonRef={closeButtonRef} />}
  </article>;
}
