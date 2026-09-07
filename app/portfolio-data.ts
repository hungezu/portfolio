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
      "针对 AI 产品的不确定性，设计意图澄清、过程反馈、结果解释与依据溯源，增强任务的可控性。",
    details: ["意图澄清", "处理过程反馈", "结果解释", "引用与异常提示"],
    evidence: [
      {
        projectSlug: "zhaocai-smart",
        projectTitle: "招财 Smart",
        section: "语义澄清",
        description: "设计识别、待确认和完成状态，把模糊问题转为可执行条件。",
        anchor: "clarification",
      },
      {
        projectSlug: "zhaocai-smart",
        projectTitle: "招财 Smart",
        section: "过程反馈",
        description: "将数据匹配、计算和结果组织拆成可理解、可恢复的执行过程。",
        anchor: "process",
      },
    ],
  },
  {
    id: "ai-workflow",
    name: "AI 工作流设计",
    axisLabel: "AI 工作流",
    description:
      "将 AI 融入从需求梳理到设计交付的完整流程，用于快速搭建交互原型、辅助界面设计，并通过 Markdown 持续沉淀和维护设计规范，提升方案验证与协作效率。",
    details: ["AI 原型快速验证", "界面方案辅助设计", "设计规范 Markdown 化", "设计资产持续维护"],
    evidence: [
      {
        projectSlug: "gkx",
        projectTitle: "深圳国际科技信息中心",
        section: "可运行原型验证",
        description: "用 Codex 生成可运行网页，再由我调整流程、字段与关键状态。",
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
      "梳理业务规则、角色权限、数据关系与审批链路，将高复杂度需求整理为可理解、可执行的产品结构。",
    details: ["业务规则与角色关系", "权限与数据边界", "复杂流程拆解", "系统模块规划"],
    evidence: [
      {
        projectSlug: "gkx",
        projectTitle: "深圳国际科技信息中心",
        section: "多系统需求结构",
        description: "从分散材料中界定系统、角色、任务与页面边界。",
        anchor: "nsp-structure",
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
      "以信息层级、栅格和组件规则建立稳定的 B 端视觉语言，支撑多页面、多角色与持续迭代。",
    details: ["信息层级与版式", "组件与状态规范", "多页面一致性", "品牌与业务适配"],
    evidence: [
      {
        projectSlug: "gkx",
        projectTitle: "深圳国际科技信息中心",
        section: "Markdown 设计规范",
        description: "将评审共识转化为多团队可执行、可维护的设计规则。",
        anchor: "nsp-rules",
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
      "围绕指标优先级、空间分布、趋势与异常组织数据视图，建立从整体态势到关键细节的阅读路径。",
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
      "围绕任务路径、信息结构与状态反馈组织复杂操作，并通过高保真原型验证关键交互与异常场景。",
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
    slug: "gkx",
    visible: true,
    title: "深圳国际科技信息中心",
    shortTitle: "深圳国际科技信息中心",
    period: "2025.11 - 至今",
    type: "平台级体验设计 / Web",
    summary:
      "负责门户内多业务系统的设计样式规范，借助 AI 编写整套设计 MD，统一页面与组件规则，并用于原型设计和评审优化。",
    role: "设计系统样式规范制定 · AI 协作编写设计 MD · 原型设计与评审优化",
    cover: "/assets/projects/covers/gkx-cover.webp",
    cardCover: "/assets/projects/covers/gkx-card-cover-20260906.webp",
    coverPosition: "center",
    abilityIds: ["ai-workflow", "complex-systems", "design-system"],
    gallery: [
      "/assets/projects/covers/gkx-cover.webp",
      "/assets/projects/gkx/think-tank-home.jpg",
      "/assets/projects/gkx/topic-service.jpg",
      "/assets/projects/gkx/portal-admin-list.jpg",
      "/assets/projects/gkx/workflow-builder.jpg",
    ],
    galleryAlt: [
      "深圳国际科技信息中心项目视觉封面",
      "高端智库首页",
      "科技专题服务页面",
      "门户后台列表页面",
      "流程设计器页面",
    ],
  },
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

export const experiences: Experience[] = [
  {
    company: "上海荣宇智能信息技术有限公司（外派至智谱 AI）",
    role: "UED & UI 设计师",
    period: "2025.07 - 至今",
    summary:
      "参与 AI 产品、金融智能与政企平台体验设计，负责业务梳理、交互策略、界面设计与规范交付，并将 AI 工具融入原型验证和设计协作。",
    details: [
      "AI 产品体验｜参与「问数」核心体验设计，负责招财 Smart UX/UI，覆盖提问、语义澄清、过程反馈、结果解释与看板沉淀。",
      "大型平台设计｜主导深圳国际科技信息中心门户、后台管理与高端智库体验设计，负责整体风格、页面规范审核与定制组件建设。",
      "多场景交付｜参与中行澳门 AI 系统、火火兔 AI 陪伴硬件及单证识别项目，覆盖业务流程、关键交互、界面落地与异常状态。",
      "AI 设计工作流｜使用 Codex、Gemini 辅助需求拆解、可运行原型、界面探索与 Markdown 规范维护，由我完成范围判断、体验评审与最终交付。",
    ],
  },
  {
    company: "答税科技（深圳）有限公司",
    role: "UI & UX 设计师",
    period: "2024.05 - 2025.02",
    summary:
      "负责企业报税产品与复杂业务流程设计，独立推进新功能从需求理解、交互方案到高保真界面和研发交付，并承担商业演示与运营视觉。",
    details: [
      "产品设计｜独立负责「智汇算（企业版）」新功能的端到端 UX/UI 设计，覆盖需求梳理、任务流程、原型与界面交付。",
      "流程重构｜将复杂申报操作拆分为引导式流程，明确关键步骤、系统状态与异常反馈。",
      "设计规范｜建立可复用组件与高保真页面规范，支持产品迭代与研发交付。",
      "业务表达｜将复杂业务内容整理为统一的商业演示与运营视觉。",
    ],
  },
  {
    company: "华盟财税科技（深圳）有限公司",
    role: "UI & UX 设计师",
    period: "2021.07 - 2024.05",
    summary:
      "负责财税 B 端系统、移动端产品与数据可视化设计，覆盖复杂业务梳理、核心流程重构、设计系统建设和研发交付。",
    details: [
      "核心产品改版｜主导税纪云 2.0 Web / App 体验改版，重构申报、审批、表单、筛选与税表等核心流程。",
      "从 0 到 1｜独立负责国家能源集团报税平台与专属组件体系设计，覆盖首页、纳税申报与综合管理工作台。",
      "设计系统｜建立栅格、组件与状态规范，并通过开发走查推进多页面一致性。",
      "多项目交付｜参与全电发票 2.0、多端法规库、税务大屏与 AI 税务问答等项目。",
    ],
  },
  {
    company: "深圳喆云科技有限公司",
    role: "UI 设计师",
    period: "2020.07 - 2021.07",
    summary:
      "负责小程序、工具型程序与企业官网的多端界面设计，覆盖关键流程、操作反馈和跨端视觉交付。",
    details: [
      "小程序设计｜独立完成 CRM 客户资源互换小程序的界面与关键流程设计。",
      "工具产品｜围绕盘点任务优化 RFID 扫码枪程序的操作路径与状态反馈。",
      "跨端交付｜完成企业官网 Web 与移动端设计，建立早期跨端交付经验。",
    ],
  },
];
