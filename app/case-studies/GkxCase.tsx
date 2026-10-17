"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject, type MouseEvent as ReactMouseEvent } from "react";
import { Button, Steps, Table, Tag } from "@arco-design/web-react";
import { IconArrowDown, IconArrowRight, IconImage } from "@arco-design/web-react/icon";
import { publicAsset, type Project } from "../portfolio-data";
import { PortfolioImage } from "../portfolio-image";
import { ProjectLocator } from "../project-locator";
import { GkxPaperQueryDemo } from "./GkxPaperQueryDemo";
import { GkxSupplementalMaterials } from "./GkxSupplementalMaterials";
import { GkxStandardsApplications } from "./GkxStandardsApplications";
import { GkxSegmentedControl } from "./GkxSegmentedControl";
import { useGkxReferenceNavigation } from "./use-gkx-reference-navigation";
import publicCopy from "./gkx-public-copy.json";
import "./gkx-case.css";

export type GkxCaseProps = { project: Project; legacyView?: "story" | "systems" | "design-system" };

type OverviewSection = {
  id: string; title: string; lead: string;
  projectScale: { amount: string; label: string };
  goals: Array<{ label: string; title: string; text: string }>;
  scope: { portal: string; systems: Array<{ name: string }> };
};

type StrategySection = {
  id: string; title: string; lead: string;
  principles: Array<{ title: string; text: string }>;
  taskComparisons: Array<{ title: string; task: string; priorities: string[]; figureId: string }>;
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

type EvidenceHighlight = { x: number; y: number; width: number; height: number; sourceRow: number };
type ImageAsset = { src: string; alt: string; caption: string; width: number; height: number; highlights?: EvidenceHighlight[] };

const assets = {
  designSystemArchitecture: { src: `${assetRoot}/ui/design-system-gkx-mapping.webp`, alt: "国科信规范组织示意图，从基础样式、组件与交互规则到页面任务与交付核对，对应新型高端智库、科技情报挖掘平台、情报管理系统和超大规模智算引擎", caption: "规范体系 · 从共用规则到国科信业务页面", width: 1862, height: 845 },
  designSystemPageTypes: { src: `${assetRoot}/ui/design-system-page-types.webp`, alt: "页面信息架构与页面类型图，展示标题栏、内容区、底部栏的组成，以及列表、详情、表单、仪表盘、模态和状态提示页", caption: "页面类型 · 从信息结构到页面骨架", width: 1796, height: 876 },
  outcomeWorkflow: { src: `${assetRoot}/ui/design-workflow-gkx.webp`, alt: "项目方法复盘示意，归纳查询复现与模块评审中的业务约束、MD、方案对照、原型核对、规范对齐、意见记录与后续复核", caption: "方法复盘示意 · 汇总查询复现与模块评审中的核对方法", width: 1840, height: 855 },
  projectScope: { src: `${assetRoot}/ui/project-scope-map.webp`, alt: "智慧门户系统作为统一业务入口，连接新型高端智库、科技情报挖掘平台、情报管理系统、超大规模智算引擎及其他业务系统；四大主要业务系统与其他业务系统均由门户连接", caption: "项目范围 · 门户与主要业务系统的关系", width: 1817, height: 866 },
  aiWorkflow: { src: `${assetRoot}/ui/ai-human-workflow-codex.png`, alt: "AI 生成与探索、人工判断与决策通过持续验证形成双环协作，连接业务上下文、结构化设计输入、设计约束与资产沉淀", caption: "AI 与人工协作工作流", width: 1862, height: 845 },
  aiCasesOriginal: { src: `${assetRoot}/evidence/ai-cases-product-panel-20261017.webp`, alt: "产品 AI 原型的主体面板，保留行业筛选、搜索、视图切换和完整报告卡片，外围菜单与导航已裁去", caption: "产品提供的 AI 原型 · 主体面板", width: 1658, height: 949 },
  aiCasesDesigner: { src: `${assetRoot}/evidence/ai-cases-designer-panel-20261017.webp`, alt: "本人优化版本的玻璃面板，保留统一查询工具区、报告卡片与分页，外围菜单、顶栏及导航标识已裁去", caption: "本人优化版本 · 主体面板", width: 1662, height: 946 },
  reviewRecordsEvidence: { src: `${assetRoot}/evidence/ui-review-records-redacted.png`, alt: "真实 UI 评审台账截图，展示评审日期、模块、评审人及原表状态字段，厂商与相关敏感信息已模糊", caption: "真实评审台账 · 敏感信息已模糊", width: 1651, height: 871 },
  teamReviewEvidence: { src: `${assetRoot}/evidence/team-review-finding-redacted.png`, alt: "真实团队审核意见截图，记录关系模块 UI 风格与规范不一致的评审意见，厂商与相关敏感信息已模糊", caption: "团队审核意见 · 敏感信息已模糊", width: 1651, height: 871 },
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

const reviewRowHighlights: Record<number, EvidenceHighlight> = {
  8: { x: 2, y: 401, width: 1378, height: 27, sourceRow: 8 },
  11: { x: 2, y: 482, width: 1378, height: 28, sourceRow: 11 },
  15: { x: 2, y: 590, width: 1378, height: 28, sourceRow: 15 },
};

function reviewRecordImage(record?: SupplierSection["reviewRecords"][number]): ImageAsset {
  return {
    ...assets.reviewRecordsEvidence,
    caption: record ? `${record.module} · 原表第 ${record.sourceRow} 行（脱敏截图）` : "真实评审台账 · 蓝框对应本页三条节选",
    highlights: record ? [reviewRowHighlights[record.sourceRow]] : supplierCopy.reviewRecords.map(item => reviewRowHighlights[item.sourceRow]),
  };
}

function ProjectFigure({ asset, onOpen, className = "", priority = false, description }: {
  asset: ImageAsset;
  onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void;
  className?: string;
  priority?: boolean;
  description?: string;
}) {
  return <figure className={`gkx-project-figure ${className}`.trim()}>
    <button type="button" className="gkx-image-button" aria-label={`放大查看：${asset.caption}`} aria-description={description} onClick={event => onOpen(asset, event.currentTarget)}>
      <PortfolioImage src={publicAsset(asset.src)} alt={asset.alt} width={asset.width} height={asset.height} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" />
      <span aria-hidden="true">放大查看</span>
    </button>
    <figcaption><strong>{asset.caption}</strong></figcaption>
  </figure>;
}

function AiCollaborationEvidence({ onOpen }: { onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void }) {
  const [version, setVersion] = useState<"original" | "designer">("designer");
  const evidence = prototypeCopy.collaborationEvidence;
  const versions = {
    original: { asset: assets.aiCasesOriginal, label: "产品 AI 原型" },
    designer: { asset: assets.aiCasesDesigner, label: "人工优化" },
  };
  const selected = versions[version];

  return <article id="gkx-ai-collaboration-evidence" className="gkx-ai-case gkx-ai-collaboration-evidence" aria-labelledby="gkx-ai-evidence-title">
    <header><h3 id="gkx-ai-evidence-title">{evidence.title}</h3><p>{evidence.lead}</p></header>
    <p className="gkx-ai-evidence-requirement"><strong>本轮要求</strong><span>{evidence.requirement}</span></p>
    <div className="gkx-ai-evidence-layout">
      <div className="gkx-ai-evidence-toolbar">
        <GkxSegmentedControl<keyof typeof versions> label="切换真实协作证据版本" value={version} onChange={setVersion} options={[{ value: "original", label: versions.original.label }, { value: "designer", label: versions.designer.label }]} />
        <span className="gkx-ai-evidence-zoom-hint">点击图片放大查看细节</span>
      </div>
      <ProjectFigure asset={selected.asset} onOpen={onOpen} className="gkx-ai-version-figure" />
      <h4 id="gkx-ai-adjustments-title" className="gkx-ai-evidence-heading">从具体问题到人工调整</h4>
      <section className="gkx-ai-evidence-comparisons" aria-labelledby="gkx-ai-adjustments-title">
        <dl>{evidence.comparisons.map(item => <div key={item.title}><dt>{item.title}</dt><dd className="is-before"><span>AI 原型</span><p>{item.before}</p></dd><dd className="is-after"><span>人工调整</span><p>{item.after}</p></dd></div>)}</dl>
      </section>
    </div>
    <section className="gkx-ai-evidence-check" aria-labelledby="gkx-ai-current-check-title"><h4 id="gkx-ai-current-check-title">当前核对结果</h4><p>{evidence.check}</p><p className="gkx-ai-evidence-status">{evidence.status}</p><p className="gkx-ai-evidence-source">仅保留主体面板，外围菜单与导航已裁去。</p></section>
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
  return <div className="gkx-lightbox" role="dialog" aria-modal="true" aria-labelledby="gkx-viewer-title" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={`gkx-lightbox__panel${originalSize ? " is-original" : ""}`} ref={dialogRef}>
      <header>
        <div><strong id="gkx-viewer-title">{asset.caption}</strong><span>{asset.highlights ? "蓝框为本页添加的定位标记；截图敏感信息已模糊" : originalSize ? "原始尺寸" : "适合窗口"}</span></div>
        <div className="gkx-lightbox__actions">
          <button type="button" aria-pressed={originalSize} onClick={() => setOriginalSize(!originalSize)}>{originalSize ? "适合窗口" : "原始尺寸"}</button>
          <button ref={closeButtonRef} type="button" onClick={onClose}>关闭</button>
        </div>
      </header>
      <div className="gkx-lightbox__canvas">
        {asset.highlights ? <svg className="gkx-lightbox__evidence" viewBox={`0 0 ${asset.width} ${asset.height}`} width={asset.width} height={asset.height} role="img" aria-label={`${asset.alt}，蓝框定位原表第${asset.highlights.map(item => item.sourceRow).join("、")}行`}>
          <image href={publicAsset(asset.src)} width={asset.width} height={asset.height} />
          {asset.highlights.map(highlight => <rect key={highlight.sourceRow} data-source-row={highlight.sourceRow} x={highlight.x} y={highlight.y} width={highlight.width} height={highlight.height} fill="#165dff" fillOpacity=".09" stroke="#165dff" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />)}
        </svg> : <PortfolioImage src={publicAsset(asset.src)} alt={asset.alt} width={asset.width} height={asset.height} original={originalSize} loading="eager" />}
      </div>
    </div>
  </div>;
}

function SectionHeading({ section, titleId, number, label, leadSegments, aside }: {
  section: { title: string; lead: string }; titleId: string; number: string; label: string; leadSegments?: string[]; aside?: ReactNode;
}) {
  return <header className="gkx-section-heading"><div className={`gkx-section-heading__top${aside ? " has-aside" : ""}`}><div><p className="gkx-chapter-index">{number}<span>{label}</span></p><h2 id={titleId}>{section.title}</h2></div>{aside}</div><p className={`gkx-section-lead${leadSegments ? " gkx-workflow-subtitle" : ""}`}>{leadSegments ? leadSegments.flatMap((segment, index) => [index > 0 ? <IconArrowRight key={`separator-${index}`} aria-hidden="true" /> : null, <span key={segment}>{segment}</span>]) : section.lead}</p></header>;
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
      <header className="gkx-content-heading" aria-live="polite"><h3>{current.task}</h3><p>{current.decision}</p></header>
      <div className="gkx-business-flow__evidence"><ProjectFigure asset={current.asset} onOpen={onOpen} /><div className="gkx-business-flow__copy"><dl><div><dt>需要明确</dt><dd>{current.context}</dd></div><div><dt>反馈与继续</dt><dd>{current.feedback}</dd></div></dl></div></div>
    </div>
  </div>;
}

function TaskComparison({ onOpen }: { onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void }) {
  const comparisons = [...strategyCopy.taskComparisons.filter(item => item.figureId !== "ui-paper-list"), {
    title: "高端智库", task: "从情报概览进入专题内容", figureId: "ui-think-tank",
    priorities: ["首页提供整体概览与内容入口", "按技术、报告、人才等内容组织后续浏览"],
  }];
  return <div className="gkx-task-studies">{comparisons.map(item => <article id={item.figureId === "ui-reading" ? "gkx-reading-workspace" : undefined} className="gkx-task-study" key={item.figureId}>
    <div className="gkx-task-study__copy"><p className="gkx-evidence-label">{figureById[item.figureId].caption}</p><h3>{item.task}</h3><ul>{item.priorities.map(point => <li key={point}>{point}</li>)}</ul></div>
    <ProjectFigure asset={figureById[item.figureId]} onOpen={onOpen} />
  </article>)}</div>;
}

function DecisionComparison({ comparison, reason, titleId }: {
  comparison?: DecisionComparisonCopy;
  reason: string;
  titleId: string;
}) {
  const [scenarioKey, setScenarioKey] = useState(comparison?.scenarios?.[0]?.key ?? "");
  const scenario = comparison?.scenarios?.find(item => item.key === scenarioKey) ?? comparison?.scenarios?.[0];
  const options = [...(scenario?.options ?? comparison?.options ?? [])].sort((a, b) => Number(b.selected) - Number(a.selected));
  if (!comparison || !options.length) return null;
  return <section className="gkx-decision-comparison" aria-labelledby={titleId}>
    <h4 id={titleId}>方案比较</h4>
    {comparison.scenarios && scenario && <div className="gkx-decision-scenarios"><GkxSegmentedControl label="切换方案比较的任务场景" value={scenario.key} onChange={setScenarioKey} options={comparison.scenarios.map(item => ({ value: item.key, label: item.label }))} /></div>}
    <div className="gkx-decision-table">
      <table aria-labelledby={titleId}>
        <colgroup><col className="gkx-decision-table__option" /><col /><col /></colgroup>
        <thead><tr><th scope="col">方案</th><th scope="col">适用条件</th><th scope="col">代价与边界</th></tr></thead>
        <tbody>{options.map(option => <tr key={option.name} className={option.selected ? "is-selected" : "is-alternative"}>
          <th scope="row"><span className="gkx-decision-status">{option.selected ? scenario ? "本场景采用" : "本案采用" : scenario ? "该场景备选" : "备选方案"}</span><strong>{option.name}</strong>{option.usage && <span className="gkx-decision-usage">{option.usage}</span>}</th>
          <td>{option.condition}</td><td>{option.cost}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <div className="gkx-decision-notes">
      <p><strong>选择依据</strong>{scenario?.reason ?? reason}</p>
      <p><strong>后续核对</strong>{comparison.pendingCheck}</p>
    </div>
  </section>;
}

function PaperWorkflowExample({ onOpen, onReferenceClick }: {
  onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void;
  onReferenceClick: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}) {
  const [compactSteps, setCompactSteps] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 820px)");
    const sync = () => setCompactSteps(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

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
      <header className="gkx-ai-block-heading"><h4 id="gkx-ai-validation-title">把查询方案放进原型，检查规则是否成立</h4><p>现有图稿中的查询，从“编号与名称分别输入”调整为“统一搜索与筛选”。下面复现两种布局，具体核对匹配范围、组合条件与恢复行为。</p></header>
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
      <p className="gkx-ai-reuse-reference"><span>本次沉淀：查询规则 MD、可操作复现与两类对象的复用验证。</span><a id="gkx-ai-rules-reference" className="gkx-section-reference" href="#gkx-standards-applications" onClick={onReferenceClick}><span>对照管理列表的规范与交付</span><IconArrowDown aria-hidden="true" /></a></p>
    </section>
  </article>;
}

function DeliveryReview({ onOpen }: { onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void }) {
  const statusTag = (value: string) => <Tag color={value === "需修改" ? "gold" : "blue"} size="medium">{value}</Tag>;
  return <section id="gkx-supplier" className="gkx-delivery-review" aria-labelledby="gkx-supplier-title">
    <header className="gkx-delivery-part-heading"><h3 id="gkx-supplier-title">{supplierCopy.title}</h3><p>{supplierCopy.lead}</p></header>
    <article className="gkx-review-records" aria-labelledby="gkx-review-records-title">
      <header><div><h4 id="gkx-review-records-title">署名评审记录节选</h4><p>右侧行号对应真实台账中的位置，点击即可核对。</p></div><aside className="gkx-review-records-example"><p>举例说明</p><span>选取科技专题服务系统的 {supplierCopy.reviewRecords.length} 条评审记录。</span></aside></header>
      <p className="gkx-review-scroll-hint">左右滑动查看完整评审记录</p>
      <Table aria-label="本人署名的UI评审记录脱敏摘录" rowKey="module" data={supplierCopy.reviewRecords} pagination={false} hover={false} size="default" tableLayoutFixed border={{ wrapper: false, headerCell: false, bodyCell: false }} scroll={{ x: 960 }} columns={[
        { title: "评审日期", dataIndex: "date", width: 140 },
        { title: "模块", dataIndex: "module", width: 260 },
        { title: "评审结论", dataIndex: "conclusion", width: 150, render: statusTag },
        { title: "原表最终状态", dataIndex: "finalStatus", width: 180, render: statusTag },
        { title: "原表对应", dataIndex: "sourceRow", width: 220, render: (sourceRow: number, record: SupplierSection["reviewRecords"][number]) => <Button type="text" className="gkx-review-row-source" aria-label={`查看${record.module}对应的台账第${sourceRow}行`} onClick={event => { if (event.currentTarget instanceof HTMLButtonElement) onOpen(reviewRecordImage(record), event.currentTarget); }}><span>原表第 {sourceRow} 行</span><IconArrowRight aria-hidden="true" /></Button> },
      ]} />
      <footer className="gkx-review-source-footer"><div><p>{supplierCopy.recordNote}</p><p>完整状态字段见原表截图；原表未填写二次评审日期。</p></div><Button type="outline" className="gkx-review-evidence-button" icon={<IconImage aria-hidden="true" />} aria-label="查看整张评审台账截图，蓝框标出三条节选记录" onClick={event => { if (event.currentTarget instanceof HTMLButtonElement) onOpen(reviewRecordImage(), event.currentTarget); }}>查看整张截图</Button></footer>
    </article>
    <article className="gkx-review-finding" aria-labelledby="gkx-review-finding-title">
      <header><h4 id="gkx-review-finding-title">{supplierCopy.teamFinding.title}</h4><p>团队评审意见<span>{supplierCopy.teamFinding.date}</span></p></header>
      <dl><div><dt>审核对象</dt><dd>{supplierCopy.teamFinding.object}</dd></div><div><dt>发现的问题</dt><dd>{supplierCopy.teamFinding.issue}</dd></div><div><dt>评审要求</dt><dd>{supplierCopy.teamFinding.decision}</dd></div></dl>
      <footer className="gkx-review-source-footer"><p>对应《评审记录与待办清单》原表第 5 行</p><Button type="outline" className="gkx-review-evidence-button" icon={<IconImage aria-hidden="true" />} aria-label="查看团队审核意见对应的原表第5行" onClick={event => { if (event.currentTarget instanceof HTMLButtonElement) onOpen({ ...assets.teamReviewEvidence, caption: "团队审核意见 · 原表第 5 行（脱敏截图）", highlights: [{ x: 2, y: 270, width: 1513, height: 194, sourceRow: 5 }] }, event.currentTarget); }}>查看对应截图</Button></footer>
      <section className="gkx-review-method" aria-labelledby="gkx-review-method-title">
        <header><h4 id="gkx-review-method-title" className="gkx-review-method-title">通用审核维度</h4><p>需求、交互、视觉与接口</p></header>
        <dl>{supplierCopy.auditDimensions.map(dimension => <div key={dimension.number}><dt>{dimension.title}</dt><dd>{dimension.points.join(" ")}</dd></div>)}</dl>
      </section>
    </article>
  </section>;
}

export function GkxCase({ project, legacyView }: GkxCaseProps) {
  const [businessStep, setBusinessStep] = useState(0);
  const { openReference, returnToSource, clearReference, returnAvailable } = useGkxReferenceNavigation("gkx-ai-rules-reference", "gkx-standards-applications");
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
    <ProjectLocator sections={sections} legacyAnchors={legacyAnchors} ariaLabel="国科信项目章节定位" onNavigate={clearReference} />

    <header id="gkx-overview" className="gkx-hero">
      <div className="gkx-hero__copy">
        <h1>{heroTitleBeforeWorkflow}<span className="gkx-hero__accent">AI 工作流</span>{heroTitleAfterWorkflow}</h1>
        <p className="gkx-hero__subtitle">{copy.hero.subtitle}</p>
        <p className="gkx-project-period">项目时间：{project.period}</p>
        <dl id="gkx-scope" className="gkx-hero__meta">
          <div><dt>{copy.hero.roleLabel}</dt><dd>{copy.hero.role}</dd></div>
          <div><dt>{copy.hero.scopeLabel}</dt><dd>{copy.hero.scope}</dd></div>
        </dl>
      </div>
      <div className="gkx-hero__visuals" aria-label="国科信主要界面">
        <ProjectFigure asset={assets.portal} onOpen={openImage} className="is-primary" priority />
      </div>
      <p className="gkx-disclosure">页面中的业务内容与数据已脱敏或重构，仅用于展示设计方法和交互方式。</p>
    </header>

    <section id="gkx-project-context" className="gkx-chapter gkx-overview" aria-labelledby="gkx-overview-title">
      <SectionHeading section={overviewCopy} titleId="gkx-overview-title" number="01" label="范围与目标" aside={<aside className="gkx-project-scale" aria-label="整体项目建设规模">
          <p className="gkx-project-scale__label">{overviewCopy.projectScale.label}</p>
          <p className="gkx-project-scale__value"><strong>{overviewCopy.projectScale.amount}</strong></p>
        </aside>} />
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
      <SectionHeading section={prototypeCopy} titleId="gkx-prototype-title" number="03" label="AI 实践" />
      <ProjectFigure asset={assets.aiWorkflow} onOpen={openImage} className="gkx-ai-workflow-figure" />
      <AiCollaborationEvidence onOpen={openImage} />
      <PaperWorkflowExample onOpen={openImage} onReferenceClick={openReference} />
    </section>

    <section id="nsp-rules" className="gkx-chapter gkx-rules" aria-labelledby="gkx-rules-title">
      <SectionHeading section={rulesCopy} titleId="gkx-rules-title" number="04" label="交互决策" />
      <div id="gkx-business"><BusinessTaskFlow onOpen={openImage} active={businessStep} onSelect={setBusinessStep} /></div>

      <article id="gkx-rule-search" className="gkx-rule-module gkx-rule-search">
        <header><h3>{searchModule.title}</h3><p>{searchModule.decision}</p></header>
        <div className="gkx-query-comparison">
          <FigureDetail asset={assets.paperList} viewBox="224 123 875 52" label={searchModule.afterLabel ?? assets.paperList.caption} onOpen={openImage} className="is-adopted" />
          <FigureDetail asset={assets.paperBefore} viewBox="224 123 875 52" label={searchModule.beforeLabel ?? assets.paperBefore.caption} onOpen={openImage} className="is-prior" />
        </div>
        <DecisionComparison comparison={searchModule.comparison} reason={searchModule.reason} titleId="gkx-search-comparison-title" />
      </article>

      <article className="gkx-rule-module gkx-rule-operations">
        <header className="gkx-rule-split-copy"><h3>{operationsModule.title}</h3><p>{operationsModule.problem}</p><strong>{operationsModule.decision}</strong></header>
        <FigureDetail asset={assets.paperList} viewBox="224 228 1176 82" label="列表局部 · 行操作位于记录右侧，保持详情、编辑、删除顺序" onOpen={openImage} className="is-operations" />
      </article>

      <article id="gkx-rule-containers" className="gkx-rule-module gkx-rule-containers">
        <header><h3>{containersModule.title}</h3><p>{containersModule.decision}</p></header>
        <DecisionComparison comparison={containersModule.comparison} reason={containersModule.reason} titleId="gkx-containers-comparison-title" />
        <div className="gkx-section-references"><a href="#gkx-business-flow-detail" onClick={() => setBusinessStep(1)}>查看详情弹窗<IconArrowRight aria-hidden="true" /></a><a href="#gkx-business-flow-detail" onClick={() => setBusinessStep(2)}>查看编辑弹窗<IconArrowRight aria-hidden="true" /></a><a href="#gkx-reading-workspace">查看阅读工作区<IconArrowRight aria-hidden="true" /></a></div>
      </article>

      <article className="gkx-rule-module gkx-rule-recovery-summary">
        <header className="gkx-rule-split-copy"><h3>{recoveryModule.title}</h3><p>{recoveryModule.problem}</p><strong>{recoveryModule.decision}</strong><a className="gkx-section-reference" href="#gkx-business" onClick={() => setBusinessStep(3)}>在任务路径中查看异常分支</a></header>
        <ProjectFigure asset={assets.importError} onOpen={openImage} />
      </article>


    </section>

    <section id="gkx-design-system" className="gkx-chapter gkx-design-system" aria-labelledby="gkx-design-system-title" tabIndex={-1}>
      <SectionHeading section={{ title: "让共用规则进入页面，也进入交付", lead: "将页面类型、组件和状态说明整理为设计规范，供合作方与研发查阅；审核时再对应到具体需求、页面和操作。" }} titleId="gkx-design-system-title" number="05" label="规范与交付" />
      <section className="gkx-delivery-standards" aria-label="设计规范">
        <div className="gkx-delivery-visuals">
          <article className="gkx-standard-mapping" aria-labelledby="gkx-standard-mapping-title">
            <header className="gkx-figure-heading"><h4 id="gkx-standard-mapping-title">从基础规则到业务页面，组织可复用的设计规范</h4><p>将样式、组件、页面与交付核对分层组织，为不同业务系统提供共同的设计与核对依据。</p></header>
            <ProjectFigure asset={assets.designSystemArchitecture} onOpen={openImage} />
          </article>
          <article className="gkx-standard-page-types" aria-labelledby="gkx-standard-page-types-title">
            <header className="gkx-figure-heading"><h4 id="gkx-standard-page-types-title">从页面结构归纳可复用的页面类型</h4><p>在统一规则与组件的基础上，按业务任务组织页面结构，形成可复用的页面类型。</p></header>
            <ProjectFigure asset={assets.designSystemPageTypes} onOpen={openImage} />
          </article>
        </div>
        <GkxStandardsApplications assets={assets} onOpen={openImage} onReturn={returnAvailable ? returnToSource : undefined} />
        <article id="gkx-collaboration" className="gkx-workbench-block"><header><h4>{rulesCopy.workbench.title}</h4><div>{rulesCopy.workbench.text}</div></header><div className="gkx-md-interactive"><iframe src={publicAsset("/assets/projects/gkx/design-preview/index.html?id=page-index&embed=1")} title="深圳国际科技信息中心可交互设计规范" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms"/></div></article>
      </section>
      <DeliveryReview onOpen={openImage} />
    </section>

    <section id="gkx-outcomes" className="gkx-chapter gkx-outcomes" aria-labelledby="gkx-outcomes-title">
      <SectionHeading section={outcomesCopy} titleId="gkx-outcomes-title" number="06" label="成果复盘" />
      <ProjectFigure asset={assets.outcomeWorkflow} onOpen={openImage} className="gkx-outcome-workflow" />
      <section className="gkx-reflection" aria-labelledby="gkx-reflection-title"><h3 id="gkx-reflection-title">项目复盘</h3><ol>{outcomesCopy.reflections.map(item => <li key={item.number}><strong>{item.title}</strong><p>{item.text}</p></li>)}</ol></section>
    </section>

    {viewer ? <ImageViewer asset={viewer} originalSize={originalSize} setOriginalSize={setOriginalSize} onClose={() => setViewer(null)} dialogRef={dialogRef} closeButtonRef={closeButtonRef} /> : null}
  </article>;
}
