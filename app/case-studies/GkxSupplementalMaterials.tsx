"use client";

import { publicAsset } from "../portfolio-data";
import "./gkx-supplemental-materials.css";

export type GkxSupplementalImageAsset = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

type SupplementalMaterial = GkxSupplementalImageAsset & { title: string; purpose: string; featured?: boolean };

type OpenMaterial = (asset: GkxSupplementalImageAsset, trigger: HTMLButtonElement) => void;

const materials: SupplementalMaterial[] = [
  {
    title: "高端智库首页",
    featured: true,
    purpose: "从首页概览进入技术路线、报告与人才信息。",
    src: "/assets/projects/gkx/think-tank-home.jpg",
    alt: "高端智库首页图稿，包含科技情报概览和技术、报告、人才入口",
    caption: "高端智库首页 · 脱敏与重构图稿",
    width: 1800,
    height: 786,
  },
  {
    title: "科技专题服务",
    purpose: "在同一专题中组织产业、技术、机构、人才和报告的关联。",
    src: "/assets/projects/gkx/topic-service.jpg",
    alt: "科技专题服务图稿，展示专题全景、层级导航与关联信息",
    caption: "科技专题服务 · 脱敏与重构图稿",
    width: 1800,
    height: 1250,
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
    purpose: "将发展趋势、里程碑与关键技术入口放在同一分析视图。",
    src: "/assets/projects/gkx/technology-route.jpg",
    alt: "领域技术路线图稿，展示趋势图、指标和技术发展里程碑",
    caption: "领域技术路线 · 脱敏与重构图稿",
    width: 1800,
    height: 786,
  },
  {
    title: "关键技术详情",
    purpose: "通过技术清单与分支树继续查看具体技术方向。",
    src: "/assets/projects/gkx/technology-detail.jpg",
    alt: "关键技术详情图稿，展示技术清单和细分方向分支树",
    caption: "关键技术详情 · 脱敏与重构图稿",
    width: 1800,
    height: 786,
  },
  {
    title: "战略咨询报告",
    purpose: "以领域分类、推荐内容和权限状态组织报告检索。",
    src: "/assets/projects/gkx/strategy-reports.jpg",
    alt: "战略咨询报告图稿，展示报告分类、推荐内容及权限状态",
    caption: "战略咨询报告 · 脱敏与重构图稿",
    width: 1800,
    height: 786,
  },
  {
    title: "人才动态资讯",
    purpose: "展示人才资讯的筛选、订阅与重点内容层级。",
    src: "/assets/projects/gkx/talent-news.jpg",
    alt: "人才动态资讯图稿，展示筛选、订阅、热点资讯和内容列表",
    caption: "人才动态资讯 · 脱敏与重构图稿",
    width: 1800,
    height: 786,
  },
];

function MaterialGrid({ items, onOpen }: { items: SupplementalMaterial[]; onOpen: OpenMaterial }) {
  return (
      <div className="gkx-supplemental-materials__grid">
        {items.map(material => (
          <article className="gkx-supplemental-material" key={material.src}>
            <h4>{material.title}</h4>
            <p>{material.purpose}</p>
            <button
              type="button"
              className="gkx-supplemental-material__image"
              aria-label={`查看原图：${material.title}`}
              onClick={event => onOpen(material, event.currentTarget)}
            >
              <img
                src={publicAsset(material.src)}
                alt={material.alt}
                width={material.width}
                height={material.height}
                loading="lazy"
                decoding="async"
              />
              <span>
                查看原图
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
    <summary>更多业务图稿：流程建模、专题服务与内容管理</summary>
    <MaterialGrid items={materials.filter(material => material.title !== "高端智库首页")} onOpen={onOpen} />
  </details>;
  return (
    <section className="gkx-supplemental-materials" aria-labelledby="gkx-supplemental-title">
      <header className="gkx-supplemental-materials__intro">
        <h3 id="gkx-supplemental-title">更多业务任务，沿用共同规则</h3>
        <p>高端智库首页承接情报内容浏览，流程设计器承接流程建模。以下图稿均已脱敏与重构，可打开原图查看各自的界面细节。</p>
      </header>
      <MaterialGrid items={materials.filter(material => material.featured)} onOpen={onOpen} />
      <details id="gkx-materials" className="gkx-supplemental-materials__disclosure">
        <summary>查看补充交付图稿：专题、技术路线与内容管理</summary>
        <MaterialGrid items={materials.filter(material => !material.featured)} onOpen={onOpen} />
      </details>
    </section>
  );
}
