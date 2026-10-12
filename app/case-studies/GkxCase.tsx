"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { publicAsset, type Project } from "../portfolio-data";
import { ProjectLocator } from "../project-locator";
import { GkxDesignSystemInteractive } from "./NationalSciencePlatformCase";
import "./gkx-case.css";

export type GkxCaseProps = { project: Project };

const sections = [
  ["gkx-overview", "01 项目概览"],
  ["nsp-structure", "02 统一挑战"],
  ["nsp-rules", "03 门户规范"],
  ["nsp-prototype", "04 AI 流程"],
  ["gkx-supplier", "05 交付审核"],
  ["gkx-outcomes", "06 成果复盘"],
] as const;

const systems = [
  "智慧门户系统",
  "新型高端智库",
  "科技情报挖掘平台",
  "情报管理系统",
  "超大规模智算引擎",
  "MaaS 平台",
];

const assetRoot = "/assets/projects/gkx/case-study";

const assets = {
  portal: { src: `${assetRoot}/ui/portal-workspace.png`, alt: "智慧门户我的空间设计稿", caption: "智慧门户 · 我的空间（设计稿）" },
  reading: { src: `${assetRoot}/ui/portal-reading.png`, alt: "智慧门户智能阅读设计稿", caption: "智慧门户 · 智能阅读（设计稿）" },
  maas: { src: `${assetRoot}/ui/maas-model-gallery.png`, alt: "MaaS 模型广场设计稿", caption: "MaaS · 模型广场（设计稿）" },
  paperList: { src: `${assetRoot}/ui/paper-list.png`, alt: "情报管理论文列表设计稿", caption: "情报管理 · 论文管理（设计稿）" },
  paperBefore: { src: `${assetRoot}/ui/paper-list-before.png`, alt: "情报管理论文列表原稿", caption: "情报管理 · 论文管理原稿（设计稿）" },
  paperDetail: { src: `${assetRoot}/ui/paper-detail-modal.png`, alt: "情报管理论文详情弹窗设计稿", caption: "情报管理 · 论文详情弹窗（设计稿）" },
  paperEdit: { src: `${assetRoot}/ui/paper-edit-modal.png`, alt: "情报管理论文编辑弹窗设计稿", caption: "情报管理 · 论文编辑弹窗（设计稿）" },
  importError: { src: `${assetRoot}/ui/paper-import-error.png`, alt: "情报管理批量导入验证失败设计稿", caption: "情报管理 · 批量导入验证失败（设计稿）" },
  uxRules: { src: `${assetRoot}/ui/ux-rule-annotations.png`, alt: "国科信 UX 规范修订标注", caption: "国科信 UX 规范 · 修订标注（设计稿）" },
} as const;

const references = {
  layers: { src: `${assetRoot}/reference/wang-p23-layers.jpg`, alt: "字段、容器、页面与应用的分层方法图", caption: "方法参考：王浩洁作品集，第 23 页（原图引用）", width: 4000, height: 2160, region: { x: 220, y: 300, width: 1390, height: 1770 } },
  container: { src: `${assetRoot}/reference/wang-p28-container.jpg`, alt: "外壳与内容分层解耦方法图", caption: "方法参考：王浩洁作品集，第 28 页（原图引用）", width: 4000, height: 2160, region: { x: 120, y: 620, width: 1610, height: 1410 } },
  pageTypes: { src: `${assetRoot}/reference/wang-p30-page-types.jpg`, alt: "列表、详情、表单、仪表盘、模态页与状态页类型图", caption: "方法参考：王浩洁作品集，第 30 页（原图引用）", width: 4000, height: 2160, region: { x: 2330, y: 335, width: 1560, height: 1660 } },
  context: { src: `${assetRoot}/reference/wang-p47-context.jpg`, alt: "从业务材料到结构化设计上下文的整理过程", caption: "方法参考：王浩洁作品集，第 47 页（原图引用）", width: 4000, height: 2160, region: { x: 1460, y: 300, width: 1090, height: 1780 } },
  validation: { src: `${assetRoot}/reference/wang-p50-validation-loop.jpg`, alt: "AI 生成、人工判断和持续核验工作流", caption: "方法参考：王浩洁作品集，第 50 页（原图引用）", width: 4000, height: 2160 },
} as const;

type ImageAsset = { src: string; alt: string; caption: string };
type ReferenceAsset = ImageAsset & { width: number; height: number; region?: { x: number; y: number; width: number; height: number } };

function ProjectFigure({ asset, onOpen, className = "", note = "界面内日期、名称与数量均为设计示例，不作为项目业绩。" }: {
  asset: ImageAsset;
  onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void;
  className?: string;
  note?: string;
}) {
  return <figure className={`gkx-project-figure ${className}`}>
    <button type="button" className="gkx-image-button" aria-label={`放大查看：${asset.caption}`} onClick={(event) => onOpen(asset, event.currentTarget)}>
      <img src={publicAsset(asset.src)} alt={asset.alt} loading="lazy" decoding="async" />
      <span aria-hidden="true">放大查看</span>
    </button>
    <figcaption><strong>{asset.caption}</strong><small>{note}</small></figcaption>
  </figure>;
}

function ReferenceFigure({ asset, onOpen, className = "" }: {
  asset: ReferenceAsset;
  onOpen: (asset: ImageAsset, trigger: HTMLButtonElement) => void;
  className?: string;
}) {
  const region = asset.region;
  return <figure className={`gkx-reference-figure ${className}`}>
    <button type="button" className="gkx-image-button" aria-label={`放大查看完整原图：${asset.caption}`} onClick={(event) => onOpen(asset, event.currentTarget)}>
      {region ? <svg viewBox={`${region.x} ${region.y} ${region.width} ${region.height}`} role="img" aria-label={asset.alt} style={{ aspectRatio: `${region.width} / ${region.height}` }}>
        <image href={publicAsset(asset.src)} width={asset.width} height={asset.height} />
      </svg> : <img src={publicAsset(asset.src)} alt={asset.alt} width={asset.width} height={asset.height} loading="lazy" decoding="async" />}
      <span aria-hidden="true">查看完整原图</span>
    </button>
    <figcaption>{asset.caption}</figcaption>
  </figure>;
}

function ImageViewer({ asset, onClose, closeButtonRef }: { asset: ImageAsset; onClose: () => void; closeButtonRef: RefObject<HTMLButtonElement | null> }) {
  return <div className="gkx-lightbox" role="dialog" aria-modal="true" aria-label={`图片查看：${asset.caption}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="gkx-lightbox__panel">
      <header><div><strong>{asset.caption}</strong><span>完整原图 · 保持原始比例</span></div><button ref={closeButtonRef} type="button" onClick={onClose} aria-label="关闭图片查看">关闭</button></header>
      <div className="gkx-lightbox__canvas"><img src={publicAsset(asset.src)} alt={asset.alt} /></div>
    </div>
  </div>;
}

const surfaceScreens = [assets.paperList, assets.paperDetail, assets.paperEdit, assets.reading] as const;

export function GkxCase({ project }: GkxCaseProps) {
  const [viewer, setViewer] = useState<ImageAsset | null>(null);
  const [activeSurface, setActiveSurface] = useState(0);
  const viewerTrigger = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!viewer) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setViewer(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      viewerTrigger.current?.focus();
    };
  }, [viewer]);

  const openImage = (asset: ImageAsset, trigger: HTMLButtonElement) => { viewerTrigger.current = trigger; setViewer(asset); };
  const currentSurface = surfaceScreens[activeSurface];

  return <article className="gkx-case" aria-label="国科信门户与多系统体验设计项目">
    <ProjectLocator sections={sections} ariaLabel="国科信项目章节定位" />

    <header id="gkx-overview" className="gkx-hero">
      <div className="gkx-hero__copy">
        <p className="gkx-eyebrow">国科信 · 门户与多系统体验设计</p>
        <h1>国科信｜门户与多系统的体验设计</h1>
        <p className="gkx-hero__subtitle">从零搭建统一规范，贯通设计、AI 原型与交付审核。</p>
        <dl id="gkx-scope" className="gkx-hero__meta">
          <div><dt>我的角色</dt><dd>主要系统交互与 UI · 门户规范 · 协作审核</dd></div>
          <div><dt>工作方式</dt><dd>设计判断 · Codex 原型 · Markdown 规范</dd></div>
        </dl>
      </div>
      <div className="gkx-hero__visuals" aria-label="国科信真实界面展示">
        <ProjectFigure asset={assets.portal} onOpen={openImage} className="is-primary" />
        <ProjectFigure asset={assets.maas} onOpen={openImage} />
      </div>
    </header>

    <section className="gkx-chapter gkx-overview" aria-labelledby="gkx-overview-title">
      <header className="gkx-section-heading"><span>01</span><div><p>项目概览与职责</p><h2 id="gkx-overview-title">从零开始，建立多个系统共同遵循的体验依据</h2></div></header>
      <div className="gkx-overview__statement"><p>这是面向某国企的整体门户改造。我的工作覆盖主要系统的交互与 UI、门户级规范建设，并依据需规制作原型、参与项目协调与合作商交付审核。</p><p>六个业务系统共同使用国科信设计规范；作品集只呈现已确认的设计职责与界面证据，不据此推断后台技术集成关系。</p></div>
      <div className="gkx-system-list" aria-label="项目系统范围">{systems.map((system, index) => <div key={system}><span>{String(index + 1).padStart(2, "0")}</span><strong>{system}</strong></div>)}</div>
    </section>

    <section id="nsp-structure" className="gkx-chapter gkx-challenges" aria-labelledby="gkx-challenges-title">
      <header className="gkx-section-heading"><span>02</span><div><p>多系统统一挑战</p><h2 id="gkx-challenges-title">统一基础规则，同时让不同任务保留自己的信息结构</h2></div></header>
      <div id="gkx-decisions" className="gkx-challenge-copy">
        <article><span>共同体验</span><h3>导航、搜索、选择和反馈需要一致</h3><p>多团队并行交付时，基础操作必须有同一套判断依据，减少同类任务在不同系统里反复学习。</p></article>
        <article><span>业务差异</span><h3>科研、情报与模型管理不能套同一模板</h3><p>科研资料、论文维护、智能阅读与模型管理具有不同的对象、密度和操作时长，需要按任务选择页面承载方式。</p></article>
        <article><span>交付依据</span><h3>需规、设计稿、原型与规则要能互相核对</h3><p>页面不仅要看起来统一，还要能回到需求条目、交互状态与可运行原型进行复核。</p></article>
      </div>
      <div className="gkx-ui-triptych"><ProjectFigure asset={assets.portal} onOpen={openImage} /><ProjectFigure asset={assets.paperList} onOpen={openImage} /><ProjectFigure asset={assets.maas} onOpen={openImage} /></div>
    </section>

    <section id="nsp-rules" className="gkx-chapter gkx-rules" aria-labelledby="gkx-rules-title">
      <header id="gkx-system" className="gkx-section-heading"><span>03</span><div><p>门户规范与跨系统应用</p><h2 id="gkx-rules-title">从字段、容器到页面，把通用方法落进真实业务</h2></div></header>
      <article className="gkx-method-module"><header><span>A</span><div><h3>从字段到页面</h3><p>论文标题、关键词、作者等字段先组成查询与列表，再构成论文管理页面。参考图只用于解释通用分层，原作者 ESG 内容不属于国科信项目成果。</p></div></header><div className="gkx-method-grid is-reference-tall"><ReferenceFigure asset={references.layers} onOpen={openImage} /><ProjectFigure asset={assets.paperList} onOpen={openImage} /></div></article>
      <article className="gkx-method-module"><header><span>B</span><div><h3>统一外壳，适配内容</h3><p>导航、标题和内容区域保持基本框架；科研空间与模型广场在同一视觉语言中，仍保留各自的筛选、数据与任务组织。</p></div></header><div className="gkx-method-grid is-reference-tall"><ReferenceFigure asset={references.container} onOpen={openImage} /><div className="gkx-stacked-projects"><ProjectFigure asset={assets.portal} onOpen={openImage} /><ProjectFigure asset={assets.maas} onOpen={openImage} /></div></div></article>
      <article className="gkx-method-module"><header><span>C</span><div><h3>按任务选择承载方式</h3><p>列表承担多条记录浏览；当前论文查看与编辑使用同页弹窗；长期阅读采用独立工作区。这里保留原设计稿中的弹窗事实，不因参考图改成抽屉。</p></div></header><div className="gkx-method-grid is-reference-tall"><ReferenceFigure asset={references.pageTypes} onOpen={openImage} /><div className="gkx-surface-switcher"><div className="gkx-surface-tabs" role="tablist" aria-label="页面承载方式切换">{surfaceScreens.map((screen, index) => <button type="button" role="tab" aria-selected={activeSurface === index} className={activeSurface === index ? "active" : ""} onClick={() => setActiveSurface(index)} key={screen.caption}>{["列表", "详情弹窗", "编辑弹窗", "阅读工作区"][index]}</button>)}</div><ProjectFigure asset={currentSurface} onOpen={openImage} className="gkx-surface-stage" /></div></div></article>
      <article id="gkx-collaboration" className="gkx-method-module gkx-rule-application">
        <header><span>D</span><div><h3>把规则落实到操作</h3><p>规范修订明确了模糊搜索合并、全选入口以及详情、编辑、删除的顺序。跨页选择在翻页和筛选变化后的保留范围尚未确认，因此页面不把建议写成已上线结论。</p></div></header>
        <ProjectFigure asset={assets.uxRules} onOpen={openImage} className="gkx-wide-rule" note="真实国科信设计稿；绿色标注为规范修订说明。" />
        <div className="gkx-interactive-head"><div><span>可点击规范工作台</span><h3>保留原网站的 MD 规则、场景、示例与看板演示</h3></div><p>可在嵌入区域中切换页面和组件，检查实际状态与反馈。演示数据仅用于说明交互规则。</p></div>
        <GkxDesignSystemInteractive />
      </article>
    </section>

    <section id="nsp-prototype" className="gkx-chapter gkx-ai" aria-labelledby="gkx-ai-title">
      <header id="gkx-workflow" className="gkx-section-heading"><span>04</span><div><p>智慧门户 AI 设计与开发流程</p><h2 id="gkx-ai-title">让 Codex 生成可核对的原型，再由设计判断完成收敛</h2></div></header>
      <div className="gkx-ai-context"><ReferenceFigure asset={references.context} onOpen={openImage} /><div className="gkx-ai-context__copy"><p className="gkx-eyebrow">输入说明</p><h3>设计稿、规范、需求与交互说明共同形成上下文</h3><ol><li><span>01</span><div><strong>组织输入</strong><p>把页面结构、业务对象、状态与约束写清楚。</p></div></li><li><span>02</span><div><strong>生成 MD 与高保真原型</strong><p>由 Codex 整理规则并搭建可运行界面。</p></div></li><li><span>03</span><div><strong>人工检查与修正</strong><p>核对业务流程、页面状态和视觉一致性。</p></div></li></ol></div></div>
      <div id="gkx-validation" className="gkx-validation-block"><div className="gkx-validation-copy"><p className="gkx-eyebrow">生成后的判断</p><h3>AI 提高产出速度，最终判断与核验仍由设计师负责</h3><p>智慧门户已经跑通 AI 原型、高保真修改与前端按原型复现的流程。当前没有可公开的真实 Codex 日志或设计稿—开发稿对照，因此不在网页中伪造过程截图。</p></div><ReferenceFigure asset={references.validation} onOpen={openImage} className="is-full-reference" /></div>
      <div className="gkx-application-heading"><span>实际任务</span><h3>科研空间与智能阅读</h3><p>在真实界面中核对资料归属、入口层级、原文阅读与辅助信息的关系。</p></div>
      <div className="gkx-application-grid"><ProjectFigure asset={assets.portal} onOpen={openImage} /><ProjectFigure asset={assets.reading} onOpen={openImage} /></div>
    </section>

    <section id="gkx-supplier" className="gkx-chapter gkx-supplier" aria-labelledby="gkx-supplier-title">
      <header className="gkx-section-heading"><span>05</span><div><p>基于需规的合作商交付审核</p><h2 id="gkx-supplier-title">用需求与规范对齐页面、交互和接口，而不是只做视觉点评</h2></div></header>
      <div className="gkx-review-dimensions" aria-label="合作商交付核对维度">{["需求覆盖", "交互完整", "视觉一致", "接口符合性"].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>)}</div>
      <div className="gkx-review-flow" aria-label="交付审核记录结构"><span>需规条目</span><i aria-hidden="true" /><span>发现问题</span><i aria-hidden="true" /><span>修改意见</span><i aria-hidden="true" /><span>复核结果</span></div>
      <div className="gkx-review-evidence"><div><p className="gkx-eyebrow">可公开的规范修订示例</p><h3>搜索合并、选择入口与操作顺序</h3><p>下方是国科信设计稿的修订前后，用来说明我如何把规则落到界面。它不是智谱合作商问题，也不代表某次审核已经通过。</p></div><div className="gkx-before-after"><ProjectFigure asset={assets.paperBefore} onOpen={openImage} /><ProjectFigure asset={assets.paperList} onOpen={openImage} /></div></div>
      <ProjectFigure asset={assets.importError} onOpen={openImage} note="真实国科信设计稿；展示错误定位、修改后重新上传的恢复入口。" />
    </section>

    <section id="gkx-outcomes" className="gkx-chapter gkx-outcomes" aria-labelledby="gkx-outcomes-title">
      <header className="gkx-section-heading"><span>06</span><div><p>落地成果与复盘</p><h2 id="gkx-outcomes-title">让设计稿、规范、原型与交付依据形成连续过程</h2></div></header>
      <div className="gkx-outcome-ledger"><article><span>已具备</span><h3>主要系统设计稿</h3><p>六个业务系统与一份国科信设计规范已有独立 Figma 文件，形成可核对的界面基础。</p></article><article><span>已具备</span><h3>门户级规范资产</h3><p>基础规则、页面类型、组件状态与操作说明可通过同一工作台查看和维护。</p></article><article><span>已跑通</span><h3>智慧门户 AI 流程</h3><p>已完成 AI 原型、高保真修改与前端按原型复现的流程实践。</p></article></div>
      <div className="gkx-reflection"><h3>三点复盘</h3><ol><li><span>01</span><p>规范需要同时说明共同规则和业务例外，统一并不等于所有页面使用同一模板。</p></li><li><span>02</span><p>生成结果必须经过人工核验，设计师负责事实边界、流程状态与最终质量。</p></li><li><span>03</span><p>交付应回到共同依据复核；没有来源的效率、通过率和反馈数据不写成成果。</p></li></ol></div>
    </section>

    {viewer ? <ImageViewer asset={viewer} onClose={() => setViewer(null)} closeButtonRef={closeButtonRef} /> : null}
  </article>;
}
