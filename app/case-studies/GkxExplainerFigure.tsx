"use client";

import type { MouseEvent } from "react";
import { useI18n } from "../i18n";
import { publicAsset } from "../portfolio-data";
import { GkxEvidenceSurface } from "./GkxEvidenceSurface";
import "./gkx-explainer-figure.css";

const figures = {
  "01-shared-structure": {
    mobileHeight: 1340,
    title: ["共用操作与业务骨架", "Shared operations and task-specific layouts"],
    alt: ["查询、选择反馈、返回与操作反馈作为共用层，分别支持资源卡片、领域分析、对象列表和节点画布。MaaS仅作规范应用对照。", "Shared query, selection feedback, return paths and operation feedback support resource cards, domain analysis, record lists and node canvases. MaaS is a standards application example."],
  },
  "02-task-space": {
    mobileHeight: 1336,
    title: ["单条维护与节点建模的空间取舍", "Workspace choices for record edits and node modelling"],
    alt: ["单条维护在来源列表上打开弹窗，关闭后继续列表任务；节点建模进入独立画布与属性面板。保存保留编辑，保存并发布使流程生效。未保存提示、发布反馈及列表恢复仍待实现核对。", "A record dialog retains the source list; node modelling uses a dedicated canvas and properties panel. Save retains edits; save and publish makes a flow effective. Unsaved-change prompts, publication feedback and list restoration still require implementation checks."],
  },
  "03-ai-card": {
    mobileHeight: 992,
    title: ["AI 卡片的信息层级调整", "Revising the AI prototype’s card hierarchy"],
    alt: ["产品AI原型的三列卡片调整为两列。标题、作者和标签形成主要阅读层，统计与下载收到底部，代价是同屏卡片减少。图中为结构示意。", "The product AI prototype’s three card columns become two. Title, author and tags form the reading layer; statistics and download move to the bottom. Fewer cards fit on screen. This is a structural illustration."],
  },
  "04-ai-toolbar": {
    mobileHeight: 1014,
    title: ["查询与视图入口的重组", "Reorganising query and view controls"],
    alt: ["原型将搜索、时间和排序放在行业面板，视图另占一行。修订将字段名与控件、查询、重置及视图切换集中到结果上方，沿用原型业务功能。", "The prototype places search, time and sort in an industry panel, with a separate view row. The revision groups labelled controls, query, reset and view selection above the results while retaining existing business capabilities."],
  },
  "05-recovery": {
    mobileHeight: 1092,
    title: ["导入失败后的继续处理路径", "Continuing after an import failure"],
    alt: ["失败提示、定位错误行、修正源文件与重新上传四步相连。图稿保留错误定位与重传入口，重传结果与完整恢复流程仍待实现核对。", "An import failure leads to locating error rows, correcting the source file and uploading again. The designs show error locations and a re-upload entry; upload results and the full recovery flow still need implementation checks."],
  },
  "06-review": {
    mobileHeight: 1224,
    title: ["设计规范与交付评审的证据关系", "Design standards and delivery review evidence"],
    alt: ["规范与设计MD用于页面任务和核对点。历史证据分别为本人2026年10月8日基础数据管理署名记录与团队2026年5月21日关系模块意见。个人原表最终通过并保留组件样式微调意见，具体组件、修改前后与二次复核材料仍缺失，不代表已完成整改闭环。", "Standards and design MD guide page tasks and checks. Separate historical evidence includes my signed data-management review dated 8 October 2026 and team feedback on relationship modules dated 21 May 2026. The signed ledger’s final status is passed with component-style feedback; named components, before/after screens and follow-up review evidence are absent."],
  },
} as const;

export type GkxExplainerId = keyof typeof figures;
type ExplainerAsset = { src: string; alt: string; caption: string; width: number; height: number; fit?: "width" };
const root = "/assets/projects/gkx/case-study/explainers-20261115";
const portraitMedia = "(max-width: 1000px)";

export function GkxExplainerFigure({ name, onOpen }: {
  name: GkxExplainerId;
  onOpen: (asset: ExplainerAsset, trigger: HTMLButtonElement) => void;
}) {
  const { locale } = useI18n();
  const figure = figures[name];
  const language = locale === "en" ? 1 : 0;
  const wide = `${root}/${name}.svg`;
  const mobile = `${root}/mobile/${name}.svg`;
  const title = figure.title[language];
  const label = locale === "en" ? `Enlarge diagram: ${title}` : `放大图解：${title}`;
  const open = (event: MouseEvent<HTMLButtonElement>) => {
    const compact = window.matchMedia(portraitMedia).matches;
    onOpen({ src: compact ? mobile : wide, alt: figure.alt[language], caption: title, width: compact ? 360 : 1200, height: compact ? figure.mobileHeight : 660, fit: compact ? "width" : undefined }, event.currentTarget);
  };
  return <figure className="gkx-explainer-figure gkx-explainer-figure--surfaced" data-explainer={name}>
    <GkxEvidenceSurface className="gkx-explainer-surface">
      <button type="button" className="gkx-explainer-open" aria-label={label} onClick={open}>
        <picture>
          <source media={portraitMedia} srcSet={publicAsset(mobile)} width={360} height={figure.mobileHeight} />
          <img src={publicAsset(wide)} alt={figure.alt[language]} width={1200} height={660} loading="lazy" decoding="async" />
        </picture>
      </button>
    </GkxEvidenceSurface>
  </figure>;
}
