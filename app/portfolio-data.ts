export type Ability = {
  name: string;
  description: string;
  details: string[];
};

export type Project = {
  slug: string;
  title: string;
  shortTitle: string;
  period: string;
  type: string;
  summary: string;
  role: string;
  cover: string;
  coverPosition?: string;
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
    name: "复杂系统处理",
    description:
      "梳理业务规则、角色权限、数据关系与审批链路，将高复杂度需求整理为可理解、可执行的产品结构。",
    details: ["业务规则与角色关系", "权限与数据边界", "复杂流程拆解", "系统模块规划"],
  },
  {
    name: "信息架构与交互",
    description:
      "围绕用户任务组织导航、表单、筛选与状态反馈，让专业用户在高密度界面中快速定位并完成操作。",
    details: ["信息架构", "任务流程", "表单与筛选", "异常与状态反馈"],
  },
  {
    name: "视觉与设计系统",
    description:
      "以信息层级、栅格和组件规则建立稳定的 B 端视觉语言，支撑多页面、多角色与持续迭代。",
    details: ["信息层级与版式", "组件与状态规范", "多页面一致性", "品牌与业务适配"],
  },
  {
    name: "AI 体验设计",
    description:
      "针对 AI 产品的不确定性，设计意图澄清、过程反馈、结果解释与依据溯源，增强任务的可控性。",
    details: ["意图澄清", "处理过程反馈", "结果解释", "引用与异常提示"],
  },
  {
    name: "数据可视化",
    description:
      "围绕指标优先级、空间分布、趋势与异常组织数据视图，建立从整体态势到关键细节的阅读路径。",
    details: ["指标层级", "地图与趋势", "多维对比", "大屏场景适配"],
  },
  {
    name: "跨端交付与协作",
    description:
      "根据 Web 与 App 的使用场景组织任务，并通过规范、标注、评审与走查推动方案进入研发交付。",
    details: ["Web / App 场景", "高保真与原型", "设计评审", "开发走查"],
  },
];

const projectData: Project[] = [
  {
    slug: "gkx",
    title: "国科信门户体系",
    shortTitle: "国科信",
    period: "2025.11 - 至今",
    type: "政企系统 / Web",
    summary:
      "主导国科信门户体系 UX/UI 设计，覆盖门户、后台管理、高端智库三套系统及其子系统，以统一风格、页面规范和定制组件控制整体设计质量。",
    role: "主导 UX/UI 设计 · 风格定制 · 规范审核 · 组件体系",
    cover: "/assets/projects/covers/gkx-cover.jpg",
    coverPosition: "center",
    gallery: ["/assets/visual/digital-mountain-hero.png"],
    galleryAlt: ["国科信门户体系项目视觉封面"],
  },
  {
    slug: "zhaocai-smart",
    title: "招财 Smart",
    shortTitle: "招财 Smart",
    period: "2025.07 - 2025.11",
    type: "财务智能问数 / Web",
    summary:
      "面向企业经营分析场景，构建“提问—澄清—执行—解释—沉淀”的智能问数链路，并统一图表、表格、引用与代码等输出规范。",
    role: "UX/UI 设计 · 语义澄清 · 过程反馈 · 看板交互 · 输出规范",
    cover: "/assets/projects/covers/zhaocai-smart-cover.jpg",
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
    cover: "/assets/projects/covers/tax-cloud-cover.jpg",
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
    cover: "/assets/projects/covers/energy-tax-cover.jpg",
    gallery: [
      "/assets/projects/energy-tax/01-project-background.png",
      "/assets/projects/energy-tax/02-design-goals.png",
      "/assets/projects/energy-tax/03-home-overview.png",
      "/assets/projects/energy-tax/04-tax-filing-workstation.png",
      "/assets/projects/energy-tax/05-general-management-workstation.png",
      "/assets/projects/energy-tax/06-grid-specification.png",
      "/assets/projects/energy-tax/07-component-specification.png",
      "/assets/projects/energy-tax/08-empty-state-specification.png",
      "/assets/projects/energy-tax/09-project-retrospective.png",
    ],
    galleryAlt: [
      "国家能源集团报税平台项目背景与设计范围",
      "国家能源集团报税平台设计目标",
      "国家能源集团报税平台首页总览",
      "国家能源集团报税平台纳税申报工作台",
      "国家能源集团报税平台综合管理工作台",
      "国家能源集团报税平台栅格布局规范",
      "国家能源集团报税平台组件规范",
      "国家能源集团报税平台空缺省页面规范",
      "国家能源集团报税平台项目复盘与个人成长",
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
    cover: "/assets/projects/covers/data-visualisation-cover.jpg",
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

export const projects: Project[] = projectData.map((project) => ({
  ...project,
  cover: publicAsset(project.cover),
  gallery: project.gallery.map(publicAsset),
}));

export const experiences: Experience[] = [
  {
    company: "上海荣宇智能信息技术有限公司（外派-智谱 AI）",
    role: "UED & UI 设计师",
    period: "2025.07 - 至今",
    summary:
      "负责 AI 问答、金融智能产品、单证识别与政企门户体系的 UX/UI 设计。",
    details: [
      "参与「问数」AI 问答平台的核心体验设计，覆盖提问、意图澄清、处理过程反馈与结果呈现。",
      "负责招财 Smart UX/UI 设计，建立从问题输入、主动澄清到结果解释与看板沉淀的任务链路。",
      "主导国科信门户体系 UX/UI 设计，覆盖门户、后台管理、高端智库三套系统及其子系统。",
      "负责国科信整体风格定制、页面规范审核与定制组件建设，控制协作设计质量。",
      "参与单证识别及金融定制项目的界面与体验设计。",
    ],
  },
  {
    company: "答税科技（深圳）有限公司",
    role: "UI & UX 设计师",
    period: "2024.05 - 2025.02",
    summary:
      "负责企业报税产品、业务流程、商业演示及运营物料设计。",
    details: [
      "独立负责「智汇算（企业版）」新功能的端到端 UX/UI 设计。",
      "将复杂申报操作拆分为引导式流程，明确步骤、状态与异常反馈。",
      "建立可复用组件和高保真页面规范，支持产品迭代与研发交付。",
      "将复杂业务信息整理为统一的商业演示与运营视觉。",
    ],
  },
  {
    company: "华盟财税科技（深圳）有限公司",
    role: "UI & UX 设计师",
    period: "2021.07 - 2024.05",
    summary:
      "负责财税 B 端系统、移动端产品、数据可视化与设计系统建设。",
    details: [
      "主导税纪云 2.0 Web / App 体验改版，重构申报、审批、表单、筛选与税表等核心流程。",
      "建立栅格、组件和状态规范，并通过开发走查推进多页面一致性。",
      "从 0 到 1 负责国家能源集团报税平台与专属组件体系设计。",
      "参与全电发票 2.0、多端法规库、税务大屏和 AI 税务问答等项目。",
      "覆盖从复杂业务梳理、UX/UI 方案到研发交付的完整设计过程。",
    ],
  },
  {
    company: "深圳喆云科技有限公司",
    role: "UI 设计师",
    period: "2020.07 - 2021.07",
    summary:
      "负责小程序、工具型程序与企业官网的多端界面设计。",
    details: [
      "独立完成 CRM 客户资源互换小程序的界面与关键流程设计。",
      "围绕盘点任务优化 RFID 扫码枪程序的操作路径与状态反馈。",
      "完成企业官网 Web 与移动端设计，建立早期跨端交付经验。",
    ],
  },
];
