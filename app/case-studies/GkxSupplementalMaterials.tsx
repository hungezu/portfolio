"use client";

import { publicAsset } from "../portfolio-data";
import { PortfolioImage } from "../portfolio-image";
import { gkxReportTasks, gkxReportTemplateLibrary, gkxScienceExchange, gkxTechnologyHotspotQuery, gkxTechnologyRoute, gkxThinkTankDetail } from "./gkx-image-assets";
import "./gkx-supplemental-materials.css";

export type GkxSupplementalImageAsset = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

type SupplementalMaterial = GkxSupplementalImageAsset & {
  title: string;
  purpose: string;
  featured?: boolean;
  actionLabel?: string;
  preview?: Omit<GkxSupplementalImageAsset, "caption">;
};

type OpenMaterial = (asset: GkxSupplementalImageAsset, trigger: HTMLButtonElement) => void;

const materials: SupplementalMaterial[] = [
  {
    title: "高端智库详情页",
    featured: true,
    purpose: "按领域组织技术路线、战略报告与人才分析，截图展示当前技术发展概览。",
    ...gkxThinkTankDetail,
    caption: "集群服务 · 高端智库详情页 · 当前页面截图",
  },
  {
    title: "科技信息交流",
    purpose: "汇总交流活动概况，通过卡片呈现赛事、讲座与沙龙的状态和参与入口。",
    actionLabel: "查看页面截图",
    ...gkxScienceExchange,
  },
  {
    title: "门户后台列表",
    purpose: "展示后台管理的筛选、对象状态与行操作位置。",
    src: "/assets/projects/gkx/portal-admin-list.jpg",
    alt: "门户后台列表交付图稿，展示列表管理界面和操作说明",
    caption: "门户后台列表 · 脱敏与重构图稿",
    width: 1800,
    height: 1012,
  },
  {
    title: "流程设计器",
    featured: true,
    purpose: "说明从流程对象管理进入节点建模工作区的路径。",
    src: "/assets/projects/gkx/workflow-builder.jpg",
    alt: "流程设计器交付图稿，并列展示管理列表和节点建模工作区",
    caption: "流程设计器 · 脱敏与重构图稿",
    width: 1800,
    height: 1012,
  },
  {
    title: "领域技术路线",
    purpose: "按领域查看技术趋势，结合关键技术、里程碑与分枝树继续分析。图中数值为原型演示数据。",
    ...gkxTechnologyRoute,
  },
  {
    title: "报告模板库",
    purpose: "按报告类型、行业与场景筛选模板，区分官方模板与个人模板。",
    actionLabel: "查看设计稿",
    ...gkxReportTemplateLibrary,
  },
  {
    title: "报告任务",
    purpose: "用列表集中呈现报告类型、生成状态与发布审核状态，支持按条件查询。",
    actionLabel: "查看设计稿",
    ...gkxReportTasks,
  },
  {
    title: "技术热点问数",
    purpose: "从热点与推荐问题进入技术分析，集中组织历史对话和提问入口。",
    actionLabel: "查看设计稿",
    ...gkxTechnologyHotspotQuery,
  },
];

function MaterialGrid({ items, onOpen }: { items: SupplementalMaterial[]; onOpen: OpenMaterial }) {
  return (
      <div className="gkx-supplemental-materials__grid">
        {items.map(material => (
          <article className="gkx-supplemental-material" key={material.src}>
            <div className="gkx-supplemental-material__copy">
              <h4>{material.title}</h4>
              <p>{material.purpose}</p>
            </div>
            <button
              type="button"
              className="gkx-supplemental-material__image"
              aria-label={`${material.actionLabel ?? (material.preview ? "查看完整模块" : "查看原图")}：${material.title}`}
              onClick={event => onOpen(material, event.currentTarget)}
            >
              <span className="gkx-supplemental-material__preview">
                <PortfolioImage
                  src={publicAsset(material.preview?.src ?? material.src)}
                  alt={material.preview?.alt ?? material.alt}
                  width={material.preview?.width ?? material.width}
                  height={material.preview?.height ?? material.height}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="gkx-supplemental-material__action">
                {material.actionLabel ?? (material.preview ? "查看完整模块" : "查看原图")}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5" />
                </svg>
              </span>
            </button>
          </article>
        ))}
      </div>
  );
}

export function GkxSupplementalMaterials({ onOpen, compact = false }: { onOpen: OpenMaterial; compact?: boolean }) {
  if (compact) return <details id="gkx-materials" className="gkx-supplemental-materials gkx-supplemental-materials__disclosure is-compact">
    <summary>更多业务图稿：流程建模、科技交流与内容管理</summary>
    <MaterialGrid items={materials.filter(material => material.src !== gkxThinkTankDetail.src)} onOpen={onOpen} />
  </details>;
  return (
    <section className="gkx-supplemental-materials" aria-labelledby="gkx-supplemental-title">
      <header className="gkx-supplemental-materials__intro">
        <h3 id="gkx-supplemental-title">更多业务任务，沿用共同规则</h3>
        <p>高端智库详情页承接集群服务浏览，流程设计器承接流程建模。以下内容包含页面截图与脱敏图稿，可打开查看各自的界面细节。</p>
      </header>
      <MaterialGrid items={materials.filter(material => material.featured)} onOpen={onOpen} />
      <details id="gkx-materials" className="gkx-supplemental-materials__disclosure">
        <summary>查看补充图稿：科技交流、技术路线与内容管理</summary>
        <MaterialGrid items={materials.filter(material => !material.featured)} onOpen={onOpen} />
      </details>
    </section>
  );
}
