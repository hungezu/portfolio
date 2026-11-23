export type LegacyDesignDecision = {
  beforeBoard: number;
  title: string;
  choice: string;
  reason: string;
  evidence: string;
};

export type LegacyCaseNarrative = {
  title: string;
  context: string;
  task: string;
  decisions: LegacyDesignDecision[];
  closingTitle: string;
  delivery: string;
  scope: string;
};

type BilingualNarrative = { "zh-CN": LegacyCaseNarrative; en: LegacyCaseNarrative };

const narratives: Record<string, BilingualNarrative> = {
  "tax-cloud": {
    "zh-CN": {
      title: "从申报任务出发，组织跨端工作路径",
      context: "税纪云面向企业财税决策、管理与执行角色。不同角色需要查看的信息、处理的任务和使用的设备不同，改版需要同时回应复杂表单与日常工作的入口组织。",
      task: "我主导 2.0 Web / App 体验改版，从业务与角色路径梳理开始，完成核心页面、交互与组件规范。以下按原展板顺序，展开表单、工作台与移动端三条设计主线。",
      decisions: [
        {
          beforeBoard: 3,
          title: "将复杂填写拆成信息分组与按需配置",
          choice: "基础信息按相关性分组；列表将筛选收合和自定义表头作为按需入口，分别处理填写、查找和列信息调整。",
          reason: "填写时需要理解字段关系，查找时则需要快速限定范围。分组与收合让默认页面优先承载当前任务；代价是部分条件和列设置需要再次展开，因此入口与已设置状态要清楚可见。",
          evidence: "基础信息配置、表单筛选与自定义表头。",
        },
        {
          beforeBoard: 5,
          title: "先建立共用规则，再按角色组织工作台",
          choice: "以全局样式和组件规范统一页面表现，再通过首页前后稿、集团与单企业场景、卡片配置，组织不同角色需要的任务与信息。",
          reason: "工作台需要兼顾共同的操作习惯与不同的阅读重点。可配置卡片提供调整空间，也增加了配置成本；因此常用内容要有默认组织方式，后续通过业务页面和体验走查继续核对。",
          evidence: "全局样式、组件、首页前后稿、卡片场景与配置、业务页面、体验走查。",
        },
        {
          beforeBoard: 14,
          title: "移动端聚焦审批、查询与阅读",
          choice: "移动首页突出审批入口，报表列表通过任务状态组织信息；法规查询与阅读延续跨端的内容层级，复杂处理由桌面端承载。",
          reason: "移动场景的屏幕空间有限，应先让用户看清当前任务和可执行操作。把状态与操作放在同一条信息路径中，同时保持集团与企业切换的上下文，是这组页面的设计重点。",
          evidence: "移动端首页、报表审批、法规查询与多页面总览。",
        },
      ],
      closingTitle: "交付与证据范围",
      delivery: "本次留下了业务路径、Web / App 页面、样式与组件规范、首页对照稿和体验走查记录。它们共同说明我如何把角色任务连接到页面结构与跨端操作。",
      scope: "展板用于呈现设计判断与交付内容；界面数据为演示，数值勘误和色彩对比复核在对应位置说明。首页评分条不作为用户研究或业务成效数据。",
    },
    en: {
      title: "Connect filing tasks across web and mobile",
      context: "Tax Cloud serves enterprise tax decision-makers, managers and staff who carry out filings. Their information needs, tasks and devices differ, so the redesign had to address both complex forms and everyday work entry points.",
      task: "I led the 2.0 web and mobile redesign, from mapping roles and task paths to designing key screens, interactions and component guidelines. The original boards below follow three threads: forms, workspaces and mobile tasks.",
      decisions: [
        {
          beforeBoard: 3,
          title: "Group related fields and reveal settings when needed",
          choice: "I grouped related information in setup forms and provided collapsible filters and column settings for lists. These controls address data entry, finding records and adjusting visible information.",
          reason: "Data entry depends on understanding field relationships; search depends on narrowing the scope. Grouping and disclosure give the current task priority, at the cost of an extra step for some settings. Their entry points and active states therefore need to remain clear.",
          evidence: "Basic information setup, table filters and custom columns.",
        },
        {
          beforeBoard: 5,
          title: "Establish shared patterns, then adapt the workspace by role",
          choice: "Global styles and components provide a common foundation. The homepage comparison, group and company views, and configurable cards show how tasks and information can be organized for different roles.",
          reason: "A workspace needs familiar controls while supporting different priorities. Configurable cards offer flexibility but require setup, so a useful default structure matters. Business screens and the recorded walkthrough provide further material for checking the design.",
          evidence: "Styles, components, homepage comparison, card scenarios and settings, business screens, and walkthrough records.",
        },
        {
          beforeBoard: 14,
          title: "Focus mobile use on approvals, queries and reading",
          choice: "The mobile homepage emphasizes approval entry points, while report lists make task states visible. Regulations and reading use a consistent content hierarchy, with more complex processing handled on desktop.",
          reason: "Limited screen space makes the current task and available action a priority. The design keeps status and action close together while retaining the context of the selected group or company.",
          evidence: "Mobile homepage, report approvals, regulation queries and the complete mobile screen set.",
        },
      ],
      closingTitle: "Deliverables and evidence scope",
      delivery: "The work includes task paths, web and mobile screens, style and component guidelines, homepage comparisons, and walkthrough records. Together, they show how role-based tasks informed screen structure and cross-device interactions.",
      scope: "The boards document design decisions and deliverables. Interface figures are sample data; numerical corrections and color-contrast checks appear alongside the relevant boards. Homepage rating bars are not user-research findings or outcome metrics.",
    },
  },
  "energy-tax": {
    "zh-CN": {
      title: "围绕集团报税，延续熟悉的工作方式",
      context: "集团报税同时涉及整体进度、税种筛选与逐项执行。企业定制场景已有使用习惯，设计需要在统一页面表现与延续原有操作方式之间作出取舍。",
      task: "我独立负责平台从 0 到 1 的 UI 设计，覆盖首页、纳税申报与综合管理工作台，并整理栅格、组件和缺省状态规范。",
      decisions: [
        {
          beforeBoard: 2,
          title: "以已有操作习惯约束规范的应用",
          choice: "项目经历中的关键取舍，是先延续客户熟悉的操作方式，再用栅格、字级与控件规则统一页面的基础表现。",
          reason: "企业定制需要让规范适应具体流程。这样保留了熟悉的工作顺序，也意味着页面与组件需要容纳业务差异；下方规范展板呈现的是可共用的基础层。",
          evidence: "栅格、文字、基础控件与页面规范。",
        },
        {
          beforeBoard: 3,
          title: "从整体判断衔接到具体申报",
          choice: "首页组织总览指标与趋势；申报工作台将任务进度、税种和状态筛选、任务列表放在连续的工作区域中。",
          reason: "整体进度回答“还有多少需要处理”，任务行回答“这一项现在到哪一步”。让筛选与执行相邻，目的是在保留全局判断的同时，给具体任务明确的操作位置。",
          evidence: "平台首页、申报工作台、任务进度与筛选列表。",
        },
        {
          beforeBoard: 5,
          title: "让管理信息和缺省状态都有清楚层次",
          choice: "综合管理工作台按信息主题组织概览；缺省状态沿用共用的样式与内容层级，为页面暂时没有内容时保留一致的呈现方式。",
          reason: "管理页面需要在信息密度与扫描清晰度之间分配空间。规范还要覆盖正常内容之外的状态，使页面在数据较少或内容缺失时仍有可理解的结构。",
          evidence: "综合管理工作台、缺省状态与项目复盘。",
        },
      ],
      closingTitle: "交付与证据范围",
      delivery: "公开展板覆盖首页、申报与管理工作台，以及栅格、组件和缺省状态规范，串起从基础规则到页面应用的交付过程。",
      scope: "延续使用习惯与多级税表的职责描述来自项目经历记录；现有展板支持页面与规范设计，多级税表的具体交互仍需对应图稿支撑。界面数字用于设计演示，不作为业务成效。",
    },
    en: {
      title: "Support group tax filing through familiar workflows",
      context: "Group tax filing combines overall progress, tax-type filters and individual tasks. This enterprise project also had established working habits, requiring a balance between consistent presentation and familiar operations.",
      task: "I independently designed the platform UI from the ground up, covering the homepage, filing and management workspaces, plus grid, component and empty-state guidelines.",
      decisions: [
        {
          beforeBoard: 2,
          title: "Apply standards around established working habits",
          choice: "A key trade-off recorded in my project experience was to retain familiar operations, then use grid, typography and control guidelines to create a consistent visual foundation.",
          reason: "Enterprise standards need to accommodate the actual workflow. This preserves a familiar sequence but also requires room for business-specific differences. The boards below document the shared foundation.",
          evidence: "Grid, typography, basic controls and page guidelines.",
        },
        {
          beforeBoard: 3,
          title: "Connect the overall picture to individual filing tasks",
          choice: "The homepage organizes overview figures and trends. The filing workspace brings progress, tax-type and status filters, and the task list into a continuous working area.",
          reason: "Overall progress answers how much work remains; each task row shows its current stage. Keeping filtering and execution close together gives individual tasks a clear place to act while retaining the wider context.",
          evidence: "Platform homepage, filing workspace, progress overview and filtered task list.",
        },
        {
          beforeBoard: 5,
          title: "Give management content and empty states a clear hierarchy",
          choice: "The management workspace groups overview information by topic. Empty states follow shared visual and content patterns so that a page also has a consistent structure when content is absent.",
          reason: "Management screens need to balance information density with scanning. The guidelines also cover states beyond populated screens, keeping the structure understandable when data is sparse or missing.",
          evidence: "Management workspace, empty-state guidelines and project reflection.",
        },
      ],
      closingTitle: "Deliverables and evidence scope",
      delivery: "The public boards cover the homepage, filing and management workspaces, alongside grid, component and empty-state guidelines. They connect the visual foundation to its use in complete screens.",
      scope: "The approach to familiar workflows and my role in multi-level tax tables come from the project experience record. The available boards establish screen and guideline design; detailed table interactions require their own source designs. Interface figures are samples, not outcome metrics.",
    },
  },
  "data-visualisation": {
    "zh-CN": {
      title: "以行业任务决定大屏的阅读顺序",
      context: "这组项目覆盖多行业、运输与地产场景。大屏需要在同一视野内组织概览、分布和比较；不同业务对象决定了哪些信息应先被看到。",
      task: "我负责大屏视觉设计、信息层级与图表编排，并整理布局和视觉规范。以下通过三类方案说明差异，比较重点是阅读结构与图表关系。",
      decisions: [
        {
          beforeBoard: 1,
          title: "多行业总览：用地图建立空间视角",
          choice: "中心地图承载区域分布，两侧组织税费趋势、排名和分项信息；明暗主题对照延续相近的信息框架。",
          reason: "地图帮助建立区域概览，数值比较则交给趋势、排名与分项图表。将两类任务分配到不同区域，是为了让空间判断与数值阅读各有清楚的位置。",
          evidence: "多行业税务数智大屏与明暗主题对照。",
        },
        {
          beforeBoard: 2,
          title: "运输场景：把经营概览接到业务线比较",
          choice: "顶部集中 GTV、营收与税金概览；地图保留区域视角，周边图表承载业务线税金、业态趋势和行业税负。",
          reason: "阅读顺序从总体规模进入比率和分项。不同维度分别使用概览、趋势和比较图，避免把全部判断都压在中心地图上。",
          evidence: "运输大屏的指标、地图、业务线与行业税负面板。",
        },
        {
          beforeBoard: 3,
          title: "地产场景：将中心空间留给业态比较",
          choice: "地产方案用中心业态卡片组织不同业务对象，两侧保留税费统计、税金占比与行业税负；浅色背景维持各区域的阅读层次。",
          reason: "这一场景优先比较业态与税种信息，因此中心不再承担地图概览。不同方案的共同部分沉淀为布局、分辨率与视觉规则，供后续大屏项目复用。",
          evidence: "地产大屏，以及随后展示的设计流程与布局规范。",
        },
      ],
      closingTitle: "交付与证据范围",
      delivery: "交付包括行业大屏方案与布局、视觉规范。这组案例展示我如何按业务对象分配空间，并用地图、趋势、排行与分项图表组织不同的阅读任务。",
      scope: "图内数字为界面示例，勘误和演示重算用于校正可核对的关系。它们不表示客户的真实经营变化；各行业的设计差异以布局和图表阅读为依据。",
    },
    en: {
      title: "Let industry tasks shape the reading order",
      context: "These dashboards cover multiple industries, transportation and real estate. Each screen brings overview, distribution and comparison into one field of view, with business-specific priorities determining what comes first.",
      task: "My work covered visual design, information hierarchy, chart arrangement, and layout guidelines. The three examples below explain differences in reading structure and the relationships between charts.",
      decisions: [
        {
          beforeBoard: 1,
          title: "Multi-industry overview: establish a geographic frame",
          choice: "A central map shows regional distribution, with tax and fee trends, rankings and breakdowns on either side. The light and dark themes retain a similar information framework.",
          reason: "The map establishes a regional overview, while trends, rankings and breakdowns support numerical comparison. Giving these tasks distinct areas helps separate geographic orientation from detailed reading.",
          evidence: "The multi-industry tax dashboard and its light/dark theme comparison.",
        },
        {
          beforeBoard: 2,
          title: "Transportation: connect the overview to business-line comparisons",
          choice: "GTV, revenue and tax figures sit together at the top. The map retains the regional view, with surrounding charts for business-line taxes, business trends and industry tax burden.",
          reason: "The reading order moves from overall scale to ratios and breakdowns. Overview, trend and comparison charts give different dimensions their own space instead of asking the map to carry every decision.",
          evidence: "Transportation overview figures, map, business-line charts and industry tax-burden panels.",
        },
        {
          beforeBoard: 3,
          title: "Real estate: use the center for business-category comparisons",
          choice: "Central cards organize business categories, with tax and fee statistics, tax composition and industry tax burden on either side. A light background supports the hierarchy of these areas.",
          reason: "This screen prioritizes comparisons between business categories and tax types, so the center serves that task. Shared experience from the projects informs the layout, resolution and visual guidelines shown next.",
          evidence: "The real-estate dashboard, followed by the design process and layout guidelines.",
        },
      ],
      closingTitle: "Deliverables and evidence scope",
      delivery: "The deliverables include industry dashboard concepts and layout and visual guidelines. They show how I allocate space around business objects and combine maps, trends, rankings and breakdowns for different reading tasks.",
      scope: "Figures are interface samples. Corrections and explicitly recalculated examples address relationships that can be checked; they do not represent real changes in client performance. The industry comparisons concern layout and chart reading.",
    },
  },
};

export function getLegacyCaseNarrative(slug: string, english: boolean): LegacyCaseNarrative | undefined {
  return narratives[slug]?.[english ? "en" : "zh-CN"];
}
