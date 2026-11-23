import { gkxScienceExchange, gkxThinkTankDetail } from "./case-studies/gkx-image-assets";
import resumeContent from "../docs/resume/content.zh-CN.json";

export type AbilityId =
  | "ai-experience"
  | "ai-workflow"
  | "complex-systems"
  | "design-system"
  | "data-visualization"
  | "interaction-design";

export type AbilityEvidence = {
  projectSlug: string;
  projectTitle: string;
  section: string;
  description: string;
  anchor?: string;
};

export type Ability = {
  id: AbilityId;
  name: string;
  axisLabel: string;
  description: string;
  details: string[];
  evidence: AbilityEvidence[];
};

export type Project = {
  slug: string;
  visible?: boolean;
  title: string;
  shortTitle: string;
  period: string;
  type: string;
  summary: string;
  role: string;
  cover: string;
  cardCover?: string;
  coverPosition?: string;
  abilityIds: AbilityId[];
  gallery: string[];
  galleryAlt?: string[];
  galleryLabels?: string[];
  gallerySections?: { startIndex: number; label: string }[];
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  summary: string;
  details: string[];
};

declare global {
  interface Window {
    __PORTFOLIO_BASE__?: string;
  }
}

export function publicAsset(path: string) {
  const base =
    typeof window === "undefined" ? "" : window.__PORTFOLIO_BASE__ ?? "";

  return base && path.startsWith("/") ? `${base}${path}` : path;
}

export const abilities: Ability[] = [
  {
    id: "ai-experience",
    name: "AI 体验设计",
    axisLabel: "AI 体验",
    description:
      "在招财 Smart 中保留已识别的时间和组织，只让用户确认会改变查询结果的指标口径，并为执行、停止和结果核对设计状态反馈。",
    details: ["意图澄清", "处理过程反馈", "结果解释", "引用与异常提示"],
    evidence: [
      {
        projectSlug: "zhaocai-smart",
        projectTitle: "招财 Smart",
        section: "语义澄清",
        description: "保留时间和组织，仅确认有歧义的利润口径，避免重新填写已知条件。",
        anchor: "clarification",
      },
      {
        projectSlug: "zhaocai-smart",
        projectTitle: "招财 Smart",
        section: "过程反馈",
        description: "区分执行中、停止、失败与完成状态，保留条件并提供继续或重试入口。",
        anchor: "process",
      },
    ],
  },
  {
    id: "ai-workflow",
    name: "AI 工作流设计",
    axisLabel: "AI 工作流",
    description:
      "将 GKX 查询任务写成 Markdown 约束，用 Codex 生成可运行原型，再核对匹配范围、异常状态和恢复路径；案例广场则对照规范修订 AI 初稿。",
    details: ["AI 原型快速验证", "界面方案辅助设计", "设计规范 Markdown 化", "设计资产持续维护"],
    evidence: [
      {
        projectSlug: "gkx",
        projectTitle: "GKX 智慧门户",
        section: "可运行原型验证",
        description: "将查询任务写进 Markdown，用 Codex 搭建原型，再检查匹配范围、异常状态和恢复路径。",
        anchor: "nsp-prototype",
      },
      {
        projectSlug: "zhaocai-smart",
        projectTitle: "招财 Smart",
        section: "Gemini 辅助设计",
        description: "用 Gemini 辅助整理问题与方案方向，设计判断和最终界面由我完成。",
        anchor: "strategy",
      },
    ],
  },
  {
    id: "complex-systems",
    name: "复杂系统处理",
    axisLabel: "复杂系统",
    description:
      "在 GKX 中共用查询、选择和反馈规则，为资源发现、对象维护与流程建模保留各自的页面结构；在财税产品中梳理申报与审批任务。",
    details: ["业务规则与角色关系", "权限与数据边界", "复杂流程拆解", "系统模块规划"],
    evidence: [
      {
        projectSlug: "gkx",
        projectTitle: "GKX 智慧门户",
        section: "多系统需求结构",
        description: "资源发现用候选卡片，持续维护用对象列表，节点建模使用独立画布与属性面板。",
        anchor: "gkx-systems",
      },
      {
        projectSlug: "tax-cloud",
        projectTitle: "税纪云",
        section: "全税种申报流程",
        description: "重构申报、审批、风险预警和法规查询等复杂业务任务。",
      },
      {
        projectSlug: "energy-tax",
        projectTitle: "国能报税平台",
        section: "从 0 到 1 平台设计",
        description: "覆盖首页、纳税申报与综合管理工作台的系统化设计。",
      },
    ],
  },
  {
    id: "design-system",
    name: "视觉与设计系统",
    axisLabel: "设计系统",
    description:
      "将 GKX 页面、组件与状态规则写进 Markdown 规范；在税纪云与国能报税平台中交付栅格、表单、组件和缺省状态。",
    details: ["信息层级与版式", "组件与状态规范", "多页面一致性", "品牌与业务适配"],
    evidence: [
      {
        projectSlug: "gkx",
        projectTitle: "GKX 智慧门户",
        section: "Markdown 设计规范",
        description: "将页面、组件和交互状态写成 Markdown 规范，并以业务页面对照核对应用方式。",
        anchor: "gkx-design-system",
      },
      {
        projectSlug: "tax-cloud",
        projectTitle: "税纪云",
        section: "Web / App 设计系统",
        description: "建立全局样式、组件与多页面一致性规则。",
      },
      {
        projectSlug: "energy-tax",
        projectTitle: "国能报税平台",
        section: "栅格与组件规范",
        description: "建立页面栅格、基础组件与空缺省规范。",
      },
    ],
  },
  {
    id: "data-visualization",
    name: "数据可视化",
    axisLabel: "数据可视化",
    description:
      "按财税指标的查看顺序组织总览、趋势、排行与明细，并在招财 Smart 中设计查询结果卡片的排序、合并与看板留存。",
    details: ["指标层级", "地图与趋势", "多维对比", "大屏场景适配"],
    evidence: [
      {
        projectSlug: "data-visualisation",
        projectTitle: "可视化大屏",
        section: "多行业数据表达",
        description: "以地图、指标、趋势与排行组织高密度业务信息。",
      },
      {
        projectSlug: "zhaocai-smart",
        projectTitle: "招财 Smart",
        section: "经营看板沉淀",
        description: "将查询结果组织为可排序、可组合、可持续追踪的数据卡片。",
        anchor: "board",
      },
    ],
  },
  {
    id: "interaction-design",
    name: "交互策略与原型",
    axisLabel: "交互设计",
    description:
      "对比口径澄清方案，区分输入、确认、执行与恢复状态；通过 GKX 查询复现和招财 Smart 前端演示核对当前原型的反馈。",
    details: ["任务流程与信息架构", "状态与反馈", "复杂交互", "高保真原型验证"],
    evidence: [
      {
        projectSlug: "zhaocai-smart",
        projectTitle: "招财 Smart",
        section: "语义澄清与过程反馈",
        description: "把模糊提问、执行等待和异常恢复组织为连续的人机协作流程。",
        anchor: "clarification",
      },
      {
        projectSlug: "tax-cloud",
        projectTitle: "税纪云",
        section: "申报与审批流程",
        description: "围绕高密度表单、审批和风险预警重构复杂任务路径。",
      },
    ],
  },
];

const projectData: Project[] = [
  {
    slug: "zhaocai-smart",
    title: "招财 Smart",
    shortTitle: "招财 Smart",
    period: "2025.07 - 2025.11",
    type: "AI 财务智能问数 / Web",
    summary:
      "面向企业经营分析场景，构建“提问—澄清—执行—解释—沉淀”的智能问数链路，并统一图表、表格、引用与代码等输出规范。",
    role: "UX/UI 设计 · 语义澄清 · 过程反馈 · 看板交互 · 输出规范",
    cover: "/assets/projects/covers/zhaocai-smart-cover-20260828.jpg",
    abilityIds: ["ai-experience", "interaction-design", "ai-workflow"],
    gallery: [
      "/assets/projects/zhaocai-smart/11-project-background.png",
      "/assets/projects/zhaocai-smart/12-smart-query-introduction.png",
      "/assets/projects/zhaocai-smart/13-semantic-clarification.png",
      "/assets/projects/zhaocai-smart/14-process-visualization.png",
      "/assets/projects/zhaocai-smart/15-board-interaction.png",
      "/assets/projects/zhaocai-smart/16-markdown-specification.png",
      "/assets/projects/zhaocai-smart/17-page-overview.png",
    ],
    galleryAlt: [
      "招财 Smart 项目背景与设计范围",
      "招财 Smart 智能问数方案与概念流程",
      "招财 Smart 语义澄清交互",
      "招财 Smart 处理过程可视化交互",
      "招财 Smart 看板合并与卡片交互",
      "招财 Smart Markdown 内容呈现规范",
      "招财 Smart 关键页面总览",
    ],
  },
  {
    slug: "gkx",
    visible: true,
    title: "GKX 智慧门户",
    shortTitle: "GKX 智慧门户",
    period: "2025.11 - 2027.03",
    type: "平台级体验设计 / Web",
    summary:
      "我主导智慧门户与多系统任务空间，覆盖对象维护、流程建模、异常恢复、智能科研与智能阅读，并将案例广场从 AI 初稿修订为可核对的界面。",
    role: "主导方案与界面 · 独立完成设计规范与设计 MD · 参与交付评审",
    cover: "/assets/projects/covers/gkx-cover.webp",
    cardCover: "/assets/projects/covers/gkx-card-cover-20260906.webp",
    coverPosition: "center",
    abilityIds: ["ai-workflow", "complex-systems", "design-system"],
    gallery: [
      "/assets/projects/covers/gkx-cover.webp",
      gkxThinkTankDetail.src,
      gkxScienceExchange.src,
      "/assets/projects/gkx/portal-admin-list.jpg",
      "/assets/projects/gkx/workflow-builder.jpg",
    ],
    galleryAlt: [
      "GKX项目视觉封面",
      "集群服务 · 高端智库详情页",
      gkxScienceExchange.alt,
      "门户后台列表页面",
      "流程设计器页面",
    ],
  },
  {
    slug: "tax-cloud",
    title: "税纪云全税种申报平台",
    shortTitle: "税纪云",
    period: "2021 - 2024",
    type: "企业财税 SaaS / Web + App",
    summary:
      "面向企业财税决策、管理和执行角色，主导税纪云 2.0 Web / App 体验改版，重构申报、审批、风险预警与法规查询等高频任务。",
    role: "主导 2.0 体验改版 · 复杂流程 · 设计系统 · 跨端协同",
    cover: "/assets/projects/covers/tax-cloud-cover-20260828.jpg",
    abilityIds: ["interaction-design", "complex-systems", "design-system"],
    gallery: [
      "/assets/projects/tax-cloud/13-project-background.png",
      "/assets/projects/tax-cloud/02-lean-canvas.png",
      "/assets/projects/tax-cloud/01-user-core-path.png",
      "/assets/projects/tax-cloud/14-basic-info-config.png",
      "/assets/projects/tax-cloud/12-form-page.png",
      "/assets/projects/tax-cloud/03-global-style.png",
      "/assets/projects/tax-cloud/04-design-components.png",
      "/assets/projects/tax-cloud/08-redesign-old-home.png",
      "/assets/projects/tax-cloud/10-redesign-new-home.png",
      "/assets/projects/tax-cloud/09-redesign-card-scenes.png",
      "/assets/projects/tax-cloud/07-redesign-custom-card.png",
      "/assets/projects/tax-cloud/06-page-showcase-rules.png",
      "/assets/projects/tax-cloud/05-page-showcase-archives.png",
      "/assets/projects/tax-cloud/11-experience-walkthrough.png",
      "/assets/projects/tax-cloud/15-app-overview.png",
      "/assets/projects/tax-cloud/16-app-home.png",
      "/assets/projects/tax-cloud/17-app-report-approval.png",
      "/assets/projects/tax-cloud/18-app-regulations.png",
      "/assets/projects/tax-cloud/19-app-showcase.png",
    ],
    galleryAlt: [
      "税纪云项目概览与业务背景",
      "税纪云产品精益画布",
      "税纪云用户核心行为路径",
      "税种申报基础信息配置",
      "高密度表单与筛选方案",
      "税纪云全局样式规范",
      "税纪云组件规范",
      "税纪云改版前首页问题",
      "税纪云改版后首页",
      "集团与单企业卡片场景",
      "可配置卡片交互方案",
      "涉税规则与权限页面",
      "电子档案与风险预警页面",
      "税纪云上线后体验走查",
      "税纪云移动端项目概览",
      "税纪云移动端首页",
      "税纪云移动端报表审批",
      "税纪云移动端法规库",
      "税纪云移动端多页面展示",
    ],
    galleryLabels: [
      "项目概览",
      "精益画布",
      "核心路径",
      "基础信息",
      "表单筛选",
      "全局样式",
      "组件规范",
      "改版前首页",
      "改版后首页",
      "卡片场景",
      "卡片配置",
      "规则权限",
      "档案预警",
      "体验走查",
      "移动端概览",
      "移动端首页",
      "报表审批",
      "法规查询",
      "移动端总览",
    ],
    gallerySections: [
      { startIndex: 2, label: "核心流程" },
      { startIndex: 5, label: "设计规范" },
      { startIndex: 7, label: "首页改版" },
      { startIndex: 11, label: "业务页面" },
      { startIndex: 13, label: "体验走查" },
      { startIndex: 14, label: "移动体验" },
    ],
  },
  {
    slug: "energy-tax",
    title: "国家能源集团报税平台",
    shortTitle: "国能报税平台",
    period: "企业定制项目 · 内容已脱敏",
    type: "企业税务系统 / Web",
    summary:
      "面向国家能源集团报税业务，独立负责平台从 0 到 1 的 UI 设计，覆盖首页、纳税申报与综合管理工作台，并建立栅格、组件及空缺省规范。",
    role: "UI 设计师（独立负责） · 从 0 到 1 · 页面与规范设计",
    cover: "/assets/projects/covers/energy-tax-cover-20260828.jpg",
    abilityIds: ["complex-systems", "design-system"],
    gallery: [
      "/assets/projects/energy-tax/00-cover.png",
      "/assets/projects/energy-tax/01-context.png",
      "/assets/projects/energy-tax/02-system.png",
      "/assets/projects/energy-tax/03-home.png",
      "/assets/projects/energy-tax/04-tax-workbench.png",
      "/assets/projects/energy-tax/05-management.png",
      "/assets/projects/energy-tax/06-reflection.png",
    ],
    galleryAlt: [
      "国家能源集团报税平台从 0 到 1 项目封面",
      "国家能源集团报税平台项目背景、设计职责与设计策略",
      "国家能源集团报税平台栅格与组件设计规范",
      "国家能源集团报税平台首页数据展示与信息层级",
      "国家能源集团报税平台纳税申报工作台与任务执行",
      "国家能源集团报税平台综合管理工作台与信息重组",
      "国家能源集团报税平台缺省状态规范与项目复盘",
    ],
    galleryLabels: [
      "项目封面",
      "项目背景",
      "设计规范",
      "平台首页",
      "申报工作台",
      "管理工作台",
      "缺省与复盘",
    ],
  },
  {
    slug: "data-visualisation",
    title: "可视化大屏项目合集",
    shortTitle: "可视化大屏",
    period: "多项目合集",
    type: "数据可视化 / 多行业",
    summary:
      "汇集汽车、轨道交通、新能源、电子及地产等行业的税务数智大屏，以地图、指标、趋势与排行组织高密度信息，并沉淀适用于大屏项目的布局与视觉规范。",
    role: "大屏视觉设计 · 信息层级 · 图表编排 · 规范沉淀",
    cover: "/assets/projects/covers/data-visualisation-cover-20260828.jpg",
    abilityIds: ["data-visualization"],
    gallery: [
      "/assets/projects/data-visualisation/01-project-overview.png",
      "/assets/projects/data-visualisation/02-multi-industry-dashboard.png",
      "/assets/projects/data-visualisation/03-transportation-dashboard.png",
      "/assets/projects/data-visualisation/04-real-estate-dashboard.png",
      "/assets/projects/data-visualisation/05-design-guidelines.png",
    ],
    galleryAlt: [
      "可视化大屏项目概览",
      "多行业税务数智大屏总览",
      "运输行业税务数智大屏",
      "地产行业税务数智大屏",
      "可视化大屏设计流程与布局规范",
    ],
    galleryLabels: [
      "项目概览",
      "多行业总览",
      "运输大屏",
      "地产大屏",
      "设计规范",
    ],
  },
];

export const projects: Project[] = projectData
  .filter((project) => project.visible !== false)
  .map((project) => ({
    ...project,
    cover: publicAsset(project.cover),
    cardCover: project.cardCover ? publicAsset(project.cardCover) : undefined,
    gallery: project.gallery.map(publicAsset),
  }));

export const experienceIntro = resumeContent.experienceIntro;
export const experienceYears = resumeContent.experienceYears;
export const experienceTimelineNote = resumeContent.experienceTimelineNote;

// Career dates and responsibilities share one source with the downloadable resume.
export const experiences: Experience[] = resumeContent.experiences.map((experience) => ({
  company: experience.assignment
    ? `${experience.company}（${experience.assignment}）`
    : experience.company,
  role: experience.role,
  period: experience.period,
  summary: experience.summary,
  details: experience.details,
}));
