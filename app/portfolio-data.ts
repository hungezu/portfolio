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
  outcomes: string[];
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

export const projects: Project[] = [
  {
    slug: "gkx",
    title: "国科信门户体系",
    shortTitle: "国科信",
    period: "2025.11 - 至今",
    type: "政企系统 / Web",
    summary:
      "主导国科信门户体系 UX/UI 设计，覆盖门户、后台管理、高端智库三套系统及其子系统，以统一风格、页面规范和定制组件控制整体设计质量。",
    role: "主导 UX/UI 设计 · 风格定制 · 规范审核 · 组件体系",
    cover: "/assets/projects/covers/gkx-cover.png",
    coverPosition: "center",
    outcomes: ["建立三套系统的统一视觉方向", "制定页面规范并审核协作设计稿", "沉淀支持子系统扩展的定制组件"],
    gallery: ["/assets/visual/digital-mountain-hero.png"],
    galleryAlt: ["国科信门户体系项目视觉封面"],
  },
  {
    slug: "zhaocai-smart",
    title: "招财 Smart",
    shortTitle: "招财 Smart",
    period: "2025.07 - 2025.11",
    type: "金融 AI / Web",
    summary:
      "围绕金融场景的智能问数，设计从问题输入、意图澄清、处理过程反馈到结果解释与看板沉淀的完整任务链路。",
    role: "UX/UI 设计 · 意图澄清 · 过程反馈 · 结果解释",
    cover: "/assets/projects/covers/zhaocai-smart-cover.png",
    outcomes: ["设计模糊问题的主动澄清机制", "将 AI 处理过程拆解为可理解的阶段", "规范结果解释、依据引用与异常提示"],
    gallery: [
      "/assets/projects/zhaocai-smart/01-cover-and-overview.png",
      "/assets/projects/zhaocai-smart/02-context-and-goals.png",
      "/assets/projects/zhaocai-smart/03-experience-strategy.png",
      "/assets/projects/zhaocai-smart/04-semantic-clarification.png",
      "/assets/projects/zhaocai-smart/05-process-visualization.png",
      "/assets/projects/zhaocai-smart/06-board-and-insight-retention.png",
      "/assets/projects/zhaocai-smart/07-design-system-and-outcomes.png",
    ],
    galleryAlt: [
      "招财 Smart 项目概览",
      "招财 Smart 业务背景与设计目标",
      "招财 Smart AI 体验策略",
      "招财 Smart 语义澄清方案",
      "招财 Smart 处理过程可视化",
      "招财 Smart 看板与洞察沉淀",
      "招财 Smart 设计规范与关键交付",
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
    cover: "/assets/projects/covers/tax-cloud-cover.png",
    outcomes: ["重构高密度表单、筛选与税表流程", "统一 Web / App 的任务与状态语言", "完成组件规范与上线后体验走查"],
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
    shortTitle: "国家能源",
    period: "企业定制项目",
    type: "能源税务 / Web",
    summary:
      "面向能源集团多层级组织，从 0 到 1 设计报税平台，统一数据地图、业务看板、页面骨架与专属组件体系。",
    role: "从 0 到 1 UX/UI 设计 · 业务看板 · 数据地图 · 组件体系",
    cover: "/assets/projects/covers/energy-tax-cover.png",
    outcomes: ["建立支持多层级组织的页面骨架", "统一数据地图与业务看板的阅读层级", "形成平台栅格、组件与默认页面规范"],
    gallery: [
      "/assets/projects/portfolio-images/06-energy-overview-system.png",
      "/assets/projects/portfolio-images/07-energy-key-screens.png",
    ],
    galleryAlt: ["国家能源集团报税平台概览与设计系统", "国家能源集团报税平台关键页面"],
  },
  {
    slug: "data-visualisation",
    title: "数据可视化项目合集",
    shortTitle: "数据可视化",
    period: "多项目合集",
    type: "数据可视化 / 多项目",
    summary:
      "汇集企业财税与能源等项目中的大屏和数据视图，围绕指标、地图、趋势与异常建立从全局态势到关键细节的阅读路径。",
    role: "信息层级 · 指标叙事 · 多场景适配",
    cover: "/assets/projects/covers/data-visualisation-cover.png",
    outcomes: ["梳理 KPI、地图、趋势与异常的优先级", "适配日常看板与汇报大屏的信息密度", "统一多图表协同与状态呈现"],
    gallery: ["/assets/projects/portfolio-images/08-data-visualisation.png"],
    galleryAlt: ["数据可视化多项目合集"],
  },
];

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
