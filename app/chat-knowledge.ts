export const OUT_OF_SCOPE_REPLY = "我只能回答关于李家豪及其设计作品的问题。";

export type ChatReference = {
  label: string;
  href: string;
  kind: "section" | "project";
};

export type ChatKnowledgeEntry = {
  id: string;
  title: string;
  content: string;
  keywords: readonly string[];
  references?: readonly ChatReference[];
};

/**
 * 这是对话助手唯一使用的公开内容索引。
 * 不把整份项目材料或任何未公开数据交给模型，新增内容前先确认它已经出现在作品集中。
 */
export const chatKnowledge: readonly ChatKnowledgeEntry[] = [
  {
    id: "profile",
    title: "基本信息",
    content:
      "我是李家豪（Leo.li），做 AI 体验产品设计，也处理复杂 B 端系统、数据表达和跨端交付。我的关注点是让智能产品更容易理解、控制和信任。",
    keywords: ["李家豪", "Leo", "是谁", "介绍", "基本信息", "个人介绍", "自我介绍", "职业定位", "身份", "职业", "背景", "履历", "设计师", "做什么", "优势", "专业", "成长", "观点", "看法"],
    references: [{ label: "查看首页介绍", href: "/portfolio/#top", kind: "section" }],
  },
  {
    id: "capability-overview",
    title: "能力概览",
    content:
      "我的主要能力包括：\n\n- **AI 体验与工作流**：意图澄清、过程反馈、原型验证与规范整理\n- **复杂系统与设计系统**：业务结构、组件状态与多页面一致性\n- **数据表达与跨端交付**：可视化、Web / App 体验与研发协作\n\n能力页里有每项能力对应的项目证据。",
    keywords: ["能力概览", "能力有哪些", "有哪些能力", "擅长什么", "优势", "技能", "专业能力", "会什么", "能做什么", "能解决什么", "能力方向"],
    references: [{ label: "查看核心能力", href: "/portfolio/#ability", kind: "section" }],
  },
  {
    id: "assistant-scope",
    title: "可讨论范围",
    content:
      "你可以问我的公开经历、项目背景、职责、设计取舍、AI 体验、复杂系统、设计规范，也可以让我带你去看相关案例。",
    keywords: ["可以问什么", "我可以问什么", "能回答什么", "你能回答什么", "能聊什么", "聊天范围", "回答范围", "帮助", "助手能做什么", "公开内容", "内容范围", "能提供什么", "推荐相关内容", "相关内容", "相关项目", "相关案例"],
    references: [
      { label: "精选作品", href: "/portfolio/#work", kind: "section" },
      { label: "工作经历", href: "/portfolio/#experience", kind: "section" },
      { label: "联系方式", href: "/portfolio/#contact", kind: "section" },
    ],
  },
  {
    id: "contact",
    title: "联系方式",
    content:
      "可以通过手机 13670115683、微信号 Hungezu 或邮箱 2146953949@qq.com 联系李家豪。联系方式也可以在作品集底部查看。",
    keywords: ["联系", "联系方式", "邮箱", "邮件", "微信", "手机", "手机号", "电话", "怎么找", "找我", "联络", "约聊", "沟通", "沟通方式"],
    references: [{ label: "跳到联系区", href: "/portfolio/#contact", kind: "section" }],
  },
  {
    id: "ai-experience",
    title: "AI 体验设计",
    content:
      "AI 体验设计重点处理不确定性：通过意图澄清、处理过程反馈、结果解释、引用与异常提示，把模糊问题转成可执行、可恢复的任务。",
    keywords: ["AI体验", "AI 体验", "智能体验", "智能产品", "对话产品", "问答体验", "不确定性", "可控", "可信", "用户意图", "意图", "澄清", "追问", "过程反馈", "结果解释", "解释", "依据", "引用", "异常", "失败"],
    references: [
      { label: "查看核心能力", href: "/portfolio/#ability", kind: "section" },
      { label: "招财 Smart · 语义澄清", href: "/portfolio/project/zhaocai-smart/#clarification", kind: "project" },
      { label: "招财 Smart · 过程反馈", href: "/portfolio/project/zhaocai-smart/#process", kind: "project" },
    ],
  },
  {
    id: "ai-workflow",
    title: "AI 工作流",
    content:
      "AI 工作流覆盖需求材料拆解、结构草案、可运行原型、界面探索与 Markdown 规范整理；设计师负责事实核对、业务边界、体验判断和最终质量。",
    keywords: ["AI工作流", "AI 工作流", "设计流程", "工作方式", "工作流", "Codex", "Gemini", "原型", "规范", "协作", "合作", "开发", "研发", "沟通", "评审", "工具", "产出", "交付", "探索", "复盘", "需求梳理", "需求分析", "研究", "洞察", "设计判断"],
    references: [
      { label: "国科信 · 可运行原型", href: "/portfolio/project/gkx/#nsp-prototype", kind: "project" },
      { label: "国科信 · Markdown 规范", href: "/portfolio/project/gkx/#nsp-rules", kind: "project" },
      { label: "招财 Smart · 设计策略", href: "/portfolio/project/zhaocai-smart/#strategy", kind: "project" },
    ],
  },
  {
    id: "complex-systems",
    title: "复杂系统处理",
    content:
      "复杂系统设计会先梳理业务规则、角色权限、数据关系与审批链路，再把高复杂度需求拆成可理解、可执行的产品结构和页面任务。",
    keywords: ["复杂系统", "大系统", "业务复杂", "业务规则", "角色", "权限", "数据关系", "审批", "流程", "系统结构", "架构", "模块", "难点", "挑战", "痛点", "拆解", "B端", "B 端"],
    references: [
      { label: "国科信 · 多系统需求结构", href: "/portfolio/project/gkx/#nsp-structure", kind: "project" },
      { label: "税纪云项目", href: "/portfolio/project/tax-cloud/", kind: "project" },
      { label: "国能报税平台", href: "/portfolio/project/energy-tax/", kind: "project" },
    ],
  },
  {
    id: "design-system",
    title: "设计系统",
    content:
      "设计系统以信息层级、栅格、组件和状态规则建立稳定的 B 端视觉语言，支撑多页面、多角色和持续迭代，并通过规范、评审与走查推进协作。",
    keywords: ["设计系统", "设计规范", "设计语言", "组件", "栅格", "状态", "视觉语言", "页面一致", "一致性", "多页面", "协同", "交付", "规范", "规则", "风格", "审美", "交互设计", "UX/UI", "走查", "评审", "品牌适配"],
    references: [
      { label: "国科信 · 设计规范", href: "/portfolio/project/gkx/#nsp-rules", kind: "project" },
      { label: "税纪云项目", href: "/portfolio/project/tax-cloud/", kind: "project" },
    ],
  },
  {
    id: "data-visualization",
    title: "数据可视化",
    content:
      "数据可视化围绕指标优先级、空间分布、趋势与异常组织视图，以地图、指标、趋势和排行建立从整体态势到关键细节的阅读路径。",
    keywords: ["数据可视化", "可视化", "大屏", "地图", "趋势", "排行", "图表", "指标体系", "指标层级", "信息层级", "数据表达", "看板"],
    references: [{ label: "查看可视化大屏项目", href: "/portfolio/project/data-visualisation/", kind: "project" }],
  },
  {
    id: "experience-current",
    title: "近期工作经历",
    content:
      "我目前在上海荣宇智能信息技术有限公司（外派-智谱 AI）做 UED & UI 设计，参与 AI 问答、金融智能产品、AI 陪伴硬件、单证识别和政企门户体系的 UX/UI 设计。",
    keywords: ["工作经历", "职业经历", "经历", "经验", "工作内容", "公司", "职位", "任职", "工作过", "荣宇", "智谱", "问数", "陪伴硬件", "单证识别", "政企门户", "现在", "目前", "最近"],
    references: [{ label: "查看工作经历", href: "/portfolio/#experience", kind: "section" }],
  },
  {
    id: "experience-overview",
    title: "经历概览",
    content:
      "我的公开工作经历是：上海荣宇智能信息技术有限公司（外派-智谱 AI）UED & UI 设计师（2025.07 - 至今）；答税科技（深圳）有限公司 UI & UX 设计师（2024.05 - 2025.02）；华盟财税科技（深圳）有限公司 UI & UX 设计师（2021.07 - 2024.05）；深圳喆云科技有限公司 UI 设计师（2020.07 - 2021.07）。",
    keywords: ["经历概览", "全部经历", "工作过哪些公司", "在哪些公司", "公司经历", "职位经历", "从业经历", "职业发展", "工作时间", "工作年限", "时间线", "负责过什么", "参与过什么"],
    references: [{ label: "查看工作经历", href: "/portfolio/#experience", kind: "section" }],
  },
  {
    id: "experience-tax",
    title: "财税产品经历",
    content:
      "在答税科技，我做企业报税产品、业务流程、商业演示和运营物料；在华盟财税科技，我主导税纪云 2.0 Web / App 体验改版，也参与税务大屏、法规库和 AI 税务问答项目。",
    keywords: ["答税", "华盟", "财税", "报税", "税务", "税纪云经历", "职业路径", "以前", "过去", "2.0", "法规库"],
    references: [
      { label: "税纪云项目", href: "/portfolio/project/tax-cloud/", kind: "project" },
      { label: "查看工作经历", href: "/portfolio/#experience", kind: "section" },
    ],
  },
  {
    id: "project-overview",
    title: "项目概览",
    content:
      "我公开展示的项目分为三类：\n\n- **AI 与平台体验**：深圳国际科技信息中心、招财 Smart\n- **财税 SaaS 与企业系统**：税纪云全税种申报平台、国家能源集团报税平台\n- **数据可视化**：可视化大屏项目合集\n\n这些案例覆盖复杂企业系统、跨端交付与设计规范。你可以从精选作品进入案例，再按章节看背景、过程和设计判断。",
    keywords: ["项目概览", "项目背景", "项目职责", "项目经验", "有哪些项目", "做过哪些项目", "做过什么项目", "你做过什么", "项目有哪些", "作品有哪些", "案例有哪些", "案例列表", "作品清单", "公开项目", "项目选择", "哪个项目", "项目难点", "项目详情", "推荐", "推荐项目", "推荐相关内容", "相关内容", "相关项目", "相关案例"],
    references: [
      { label: "精选作品", href: "/portfolio/#work", kind: "section" },
      { label: "国科信案例", href: "/portfolio/project/gkx/", kind: "project" },
      { label: "招财 Smart 案例", href: "/portfolio/project/zhaocai-smart/", kind: "project" },
      { label: "税纪云案例", href: "/portfolio/project/tax-cloud/", kind: "project" },
    ],
  },
  {
    id: "project-gkx",
    title: "深圳国际科技信息中心",
    content:
      "深圳国际科技信息中心是平台级体验设计项目，面对多系统并行与多方协作，使用 Codex 辅助需求梳理、原型验证、界面设计与 Markdown 规范维护，并通过统一设计体系控制平台体验与交付质量。公开章节包括多系统需求结构、可运行原型验证、系统实景和设计规范。",
    keywords: ["国科信", "深圳国际科技信息中心", "平台", "多系统", "多方协作", "系统实景", "项目背景", "职责", "负责", "负责什么", "难点", "挑战", "设计决策", "案例细节", "nsp"],
    references: [
      { label: "打开国科信案例", href: "/portfolio/project/gkx/", kind: "project" },
      { label: "需求结构", href: "/portfolio/project/gkx/#nsp-structure", kind: "project" },
      { label: "可运行原型", href: "/portfolio/project/gkx/#nsp-prototype", kind: "project" },
      { label: "设计规范", href: "/portfolio/project/gkx/#nsp-rules", kind: "project" },
    ],
  },
  {
    id: "project-zhaocai",
    title: "招财 Smart",
    content:
      "招财 Smart 面向企业经营分析场景，构建“提问—澄清—执行—解释—沉淀”的智能问数链路，并统一图表、表格、引用与代码等输出规范。公开章节包含设计策略、语义澄清、过程反馈和看板沉淀。",
    keywords: ["招财", "Smart", "智能问数", "经营分析", "项目背景", "职责", "负责", "负责什么", "为什么", "怎么做", "设计决策", "提问", "执行", "解释", "看板", "沉淀"],
    references: [
      { label: "打开招财 Smart 案例", href: "/portfolio/project/zhaocai-smart/", kind: "project" },
      { label: "语义澄清", href: "/portfolio/project/zhaocai-smart/#clarification", kind: "project" },
      { label: "过程反馈", href: "/portfolio/project/zhaocai-smart/#process", kind: "project" },
      { label: "看板沉淀", href: "/portfolio/project/zhaocai-smart/#board", kind: "project" },
    ],
  },
  {
    id: "project-tax-cloud",
    title: "税纪云全税种申报平台",
    content:
      "税纪云是企业财税 SaaS Web + App 项目，面向企业财税决策、管理和执行角色，重构申报、审批、风险预警与法规查询等高频任务，并建立跨端设计系统。",
    keywords: ["税纪云", "全税种", "申报", "审批", "风险预警", "法规查询", "项目背景", "职责", "负责", "SaaS", "跨端"],
    references: [{ label: "打开税纪云案例", href: "/portfolio/project/tax-cloud/", kind: "project" }],
  },
  {
    id: "project-energy-tax",
    title: "国家能源集团报税平台",
    content:
      "国家能源集团报税平台是企业定制项目，公开内容已脱敏；设计覆盖首页、纳税申报与综合管理工作台，并建立栅格、组件及空缺省规范。",
    keywords: ["国家能源", "国能报税", "报税平台", "定制项目", "项目背景", "职责", "负责", "脱敏", "空缺省", "工作台"],
    references: [{ label: "打开国能报税平台案例", href: "/portfolio/project/energy-tax/", kind: "project" }],
  },
  {
    id: "project-data-visualisation",
    title: "可视化大屏项目合集",
    content:
      "可视化大屏项目合集覆盖汽车、轨道交通、新能源、电子及地产等行业的税务数智大屏，以地图、指标、趋势与排行组织高密度业务信息，并沉淀布局与视觉规范。",
    keywords: ["可视化大屏项目", "项目合集", "公开项目", "项目背景", "职责", "负责", "轨道交通", "新能源", "地产", "汽车", "电子"],
    references: [{ label: "打开可视化大屏案例", href: "/portfolio/project/data-visualisation/", kind: "project" }],
  },
  {
    id: "design-approach",
    title: "设计思路",
    content:
      "我的设计思路通常从背景和业务边界出发，先做信息与任务结构判断，再用可运行原型验证关键状态，最后把共识沉淀为组件和规范。面对 AI 产品，我会先处理意图澄清、过程反馈、结果解释与依据；面对复杂系统，则先梳理角色、规则、权限和数据关系。",
    keywords: ["设计方法", "设计思路", "设计决策", "为什么这样设计", "为什么", "如何设计", "好的设计", "用户研究", "需求分析", "项目怎么做", "项目难点", "难点", "挑战", "取舍", "考虑", "工作方式", "原则", "方法", "判断", "思考"],
    references: [
      { label: "查看核心能力", href: "/portfolio/#ability", kind: "section" },
      { label: "招财 Smart · 设计策略", href: "/portfolio/project/zhaocai-smart/#strategy", kind: "project" },
      { label: "国科信 · 需求结构", href: "/portfolio/project/gkx/#nsp-structure", kind: "project" },
    ],
  },
  {
    id: "navigation",
    title: "作品集导航",
    content:
      "你可以先看首页的核心能力，再看精选作品、工作经历和联系方式。想深入了解某个项目时，点进案例页就能继续看章节。",
    keywords: ["导航", "怎么看", "查看项目", "项目列表", "所有项目", "全部项目", "作品在哪里", "哪里", "去哪", "入口", "链接", "跳转", "章节", "首页", "案例页", "目录", "更多", "浏览", "推荐相关内容", "相关内容"],
    references: [
      { label: "核心能力", href: "/portfolio/#ability", kind: "section" },
      { label: "精选作品", href: "/portfolio/#work", kind: "section" },
      { label: "工作经历", href: "/portfolio/#experience", kind: "section" },
      { label: "联系方式", href: "/portfolio/#contact", kind: "section" },
    ],
  },
];

const PRIVATE_PATTERNS = [
  /私密|私人|保密|未公开|内部|机密|客户姓名|客户联系方式|客户信息|身份证|住址|家庭|薪资|密码|密钥|api\s*key|token/i,
  /(?:未公开|内部|真实|具体|客户).{0,8}(?:指标|数据|数字|金额|预算|营收|转化率|kpi)|(?:指标|数据|数字|金额|预算|营收|转化率|kpi).{0,8}(?:是多少|明细|具体数值)/i,
];

const PORTFOLIO_SIGNAL_PATTERNS = [
  /李家豪|leo\.?li/i,
  /推荐相关|相关项目|相关案例|相关内容|推荐项目|推荐案例/i,
  /作品集|作品|项目|案例|经历|经验|工作|职业|公司|职位|任职|能力|优势|擅长|方向|设计|体验|交互|系统|规范|原型|流程|看板|问数|招财|税纪云|国能|国科信|可视化|数据|指标|信息层级|层级|背景|目标|职责|角色|权限|业务|产品设计|用户体验|风格|审美|UX\/UI|需求|研究|洞察|意图|澄清|反馈|解释|依据|引用|异常|上线|复盘|\bAI\b|智能|Codex|Gemini|联系|邮箱|微信|手机|电话|导航|章节|负责|参与|主导|难点|挑战|痛点|决策|方法|思路|原则|取舍|协作|合作|开发|研发|沟通|评审|走查|交付|价值|作用|意义|评价|建议/i,
];

const DESIGN_CONTEXT_PATTERNS = [
  /(?:产品|用户|界面|页面|功能|方案|体验|行业|价值|作用|意义|评价|建议).{0,10}(?:设计|项目|案例|AI|系统|规范|流程|体验)/i,
  /(?:设计|项目|案例|AI|系统|规范|流程|体验).{0,10}(?:产品|用户|界面|页面|功能|方案|行业|价值|作用|意义|评价|建议)/i,
  /(?:产品|用户|界面|页面|功能|方案|体验).{0,8}(?:怎么|如何|为什么|问题|评价|建议|设计)/i,
  /(?:产品经理|开发|研发|团队).{0,8}(?:沟通|协作|合作|评审|走查)/i,
  /(?:评价|建议|怎么评价).{0,8}(?:界面|页面|方案|设计)/i,
];

const HARD_UNRELATED_PATTERNS = [
  /天气|气温|天气预报|新闻|热搜|股票|股市|彩票|汇率|航班|酒店|旅行|旅游|攻略|食谱|菜谱|做饭|电影|音乐|游戏|星座|笑话|诗|作文|小说|代码|编程|报错|数学|物理|化学|医学|症状|药物|法律|考试|作业|购物|优惠|快递|实时/i,
];

const SOFT_UNRELATED_PATTERNS = [
  /翻译|帮我(?:写|做|生成)(?:一首诗|代码|程序|论文|作业)/i,
  /推荐(?:电影|音乐|书|餐厅|酒店|路线|股票)/i,
  /怎么(?:做饭|写代码|学英语|减肥)/i,
];

const CONTEXTUAL_FOLLOW_UP = /^(那|它|这个|这个项目|这个案例|上面|刚才|前面|为什么|怎么|如何|具体|还有|能否|可以|然后|除此之外|详细|能展开|继续)/i;
const GENERIC_PERSON_REQUEST = /^(?:你|您)(?:(?:是|的|本人|目前|现在|平时|一般|主要|在工作中|在项目中|在设计上)[\s的]*)?(?:谁|叫什么|做什么|主要做什么|做过什么|做了什么|负责什么|负责过什么|负责过哪些事情|参与过什么|擅长|有哪些能力|有什么优势|做过哪些|做过哪些事情|有哪些项目|工作经历|职业经历|设计经验|设计方法|设计思路|工作方式|怎么看|如何看|怎么工作|如何工作|怎么做设计|如何做设计|觉得|认为|成长|观点|看法)/i;
const GENERIC_SCOPE_REQUEST = /^(?:能|能否|请|想|我想|我可以|我能|能不能|可以|告诉我|介绍一下|说说|聊聊|你能|你可以|你能不能|请问)(?:(?:简单|详细|具体|展开)?)?(?:介绍|说说|了解|看看|聊聊|告诉我|回答|问|了解什么|做什么|提供|展开|详细)/i;
const GENERIC_CAPABILITY_REQUEST = /^(?:你能|你可以|能不能|能否)(?:帮我)?(?:做什么|回答什么|回答哪些|聊什么|提供什么|介绍什么)/i;
const GENERIC_OVERVIEW_PATTERN = /整体|概览|总的来说|有哪些|做过|负责什么|负责过|工作过|覆盖哪些|包括哪些|列出|名单|清单/i;
const SPECIFIC_PROJECT_PATTERN = /国科信|深圳国际科技信息中心|招财|Smart|税纪云|国家能源|国能|可视化大屏/i;

const KNOWLEDGE_ALIASES: Record<string, readonly string[]> = {
  profile: ["本人", "个人", "自我", "职业背景", "身份信息", "个人背景", "怎么称呼"],
  "capability-overview": ["能力方向", "技能方向", "专业方向", "长处", "强项", "能提供什么", "能解决什么"],
  "assistant-scope": ["可以聊", "能聊", "能问", "可以了解", "助手范围", "公开资料", "可以问什么", "能回答哪些", "可以聊什么"],
  contact: ["找我", "联络", "邮件", "手机号", "联系方式", "沟通方式", "约聊"],
  "ai-experience": ["人工智能体验", "智能交互", "对话式体验", "用户问题", "不确定性处理", "可解释", "可恢复"],
  "ai-workflow": ["设计工作流", "协作流程", "设计产出", "研发协作", "从需求到交付", "工具怎么用"],
  "complex-systems": ["业务分析", "系统规划", "信息架构", "复杂业务", "角色关系", "权限边界", "流程拆分"],
  "design-system": ["组件库", "设计语言", "视觉规范", "状态设计", "统一规则", "页面规范"],
  "data-visualization": ["数据图表", "指标体系", "信息可视化", "大屏设计", "数据呈现", "看板设计"],
  "experience-current": ["当前工作", "现在的工作", "最近的经历", "目前任职", "最近在做什么", "工作内容"],
  "experience-overview": ["经历时间线", "公司列表", "工作过哪些地方", "职业路径", "从业背景", "负责什么", "负责过什么", "参与过什么", "做过什么", "设计经验"],
  "experience-tax": ["财税工作", "税务产品经历", "以前的工作", "过去的项目"],
  "project-overview": ["案例总览", "项目总览", "作品清单", "项目列表", "项目有哪些", "项目经验", "负责什么项目", "项目方向", "项目详情", "项目难点"],
  "project-gkx": ["国科信案例", "科技信息中心案例", "平台项目", "门户项目", "系统项目"],
  "project-zhaocai": ["招财案例", "问数产品", "经营分析产品", "智能问数项目"],
  "project-tax-cloud": ["税务 SaaS", "财税 SaaS", "申报系统案例"],
  "project-energy-tax": ["能源报税", "定制税务项目"],
  "project-data-visualisation": ["大屏合集", "行业大屏", "数据大屏案例"],
  "design-approach": ["怎么思考", "设计判断", "设计取舍", "设计挑战", "项目挑战", "方案原因", "为什么这么做", "设计经验", "设计上有什么经验", "设计能力", "界面评价", "页面评价", "怎么评价", "设计原则", "设计价值", "设计作用"],
  navigation: ["去哪里", "在哪看", "怎么打开", "怎么浏览", "怎么逛", "查看作品", "浏览作品", "页面入口", "跳到", "查看链接", "目录在哪里"],
};

const TOPIC_HINTS: Array<{ pattern: RegExp; ids: readonly string[]; weight: number }> = [
  { pattern: /联系方式|怎么联系|找我|邮箱|微信|手机|电话/i, ids: ["contact"], weight: 10 },
  { pattern: /能力|擅长|技能|专业能力|专业方向|长处|强项|会什么/i, ids: ["capability-overview"], weight: 14 },
  { pattern: /优势|成长|个人特点/i, ids: ["profile", "capability-overview"], weight: 6 },
  { pattern: /经历|公司|职位|任职|职业|工作过|时间线/i, ids: ["experience-overview", "experience-current", "experience-tax"], weight: 8 },
  { pattern: /项目|作品|案例|做过什么|推荐相关|相关项目|相关案例|相关内容/i, ids: ["project-overview", "project-gkx", "project-zhaocai", "project-tax-cloud", "project-energy-tax", "project-data-visualisation"], weight: 6 },
  { pattern: /能回答|可以问|能聊|帮助|范围|公开内容/i, ids: ["assistant-scope", "navigation"], weight: 10 },
  { pattern: /能帮我做什么|你能做什么|你可以做什么|能否告诉我|能展开说说/i, ids: ["assistant-scope"], weight: 20 },
  { pattern: /经验|成长|观点|看法|价值|作用|意义/i, ids: ["design-approach", "profile", "capability-overview", "experience-overview"], weight: 7 },
  { pattern: /产品经理|开发|研发|团队|沟通|协作|合作|评审|走查/i, ids: ["ai-workflow", "design-system"], weight: 11 },
  { pattern: /设计.{0,6}经验|设计能力|怎么评价|界面评价|页面评价/i, ids: ["design-approach"], weight: 14 },
  { pattern: /用户体验|产品设计|体验怎么|体验设计/i, ids: ["design-approach", "ai-experience"], weight: 12 },
  { pattern: /负责过|参与过|主导过|职责|责任/i, ids: ["experience-overview", "project-overview"], weight: 12 },
  { pattern: /做过什么|做过哪些事情|做了什么|负责过哪些事情|参与过什么|主导过什么/i, ids: ["experience-overview", "project-overview"], weight: 14 },
  { pattern: /设计经验|设计方法|设计思路|怎么做设计|如何做设计|设计决策|工作方式|工作流程|怎么思考/i, ids: ["design-approach"], weight: 14 },
  { pattern: /评价|建议|界面|页面|方案/i, ids: ["design-approach"], weight: 14 },
  { pattern: /最难|难处|项目难点|难点|挑战|痛点/i, ids: ["design-approach", "complex-systems"], weight: 12 },
  { pattern: /为什么|怎么做|如何|方法|思路|决策|取舍|原则|考虑/i, ids: ["design-approach", "ai-experience", "complex-systems", "design-system"], weight: 7 },
  { pattern: /\bAI\b|智能|问答|意图|澄清|结果解释|对话/i, ids: ["ai-experience", "ai-workflow", "project-zhaocai"], weight: 7 },
  { pattern: /系统|权限|流程|审批|业务|角色|架构/i, ids: ["complex-systems", "project-gkx", "project-tax-cloud"], weight: 6 },
  { pattern: /规范|组件|栅格|状态|一致性|协作|规则/i, ids: ["design-system", "ai-workflow", "project-gkx"], weight: 6 },
  { pattern: /可视化|大屏|图表|地图|趋势|排行|指标层级|数据表达/i, ids: ["data-visualization", "project-data-visualisation"], weight: 14 },
  { pattern: /数据|指标|大屏|图表|地图|趋势|排行|看板/i, ids: ["data-visualization", "project-data-visualisation", "project-zhaocai"], weight: 6 },
  { pattern: /导航|哪里|查看|浏览|怎么逛|链接|章节|目录|入口|跳到/i, ids: ["navigation"], weight: 12 },
];

function normalizeQuery(query: string) {
  return query.trim().replace(/\s+/g, " ").slice(0, 600);
}

export function isChatQueryInScope(query: string, contextQuery = "") {
  const normalized = normalizeQuery(query);
  const context = normalizeQuery(contextQuery);
  if (!normalized || PRIVATE_PATTERNS.some(pattern => pattern.test(normalized))) return false;
  if (context && PRIVATE_PATTERNS.some(pattern => pattern.test(context))) return false;
  if (HARD_UNRELATED_PATTERNS.some(pattern => pattern.test(normalized))) return false;
  const hasPortfolioSignal = PORTFOLIO_SIGNAL_PATTERNS.some(pattern => pattern.test(normalized));
  const hasDesignContext = DESIGN_CONTEXT_PATTERNS.some(pattern => pattern.test(normalized));
  if (SOFT_UNRELATED_PATTERNS.some(pattern => pattern.test(normalized)) && !hasPortfolioSignal && !hasDesignContext) return false;
  if (hasPortfolioSignal || hasDesignContext) return true;
  if (GENERIC_PERSON_REQUEST.test(normalized) || GENERIC_SCOPE_REQUEST.test(normalized) || GENERIC_CAPABILITY_REQUEST.test(normalized)) return true;
  return Boolean(
    context &&
    CONTEXTUAL_FOLLOW_UP.test(normalized) &&
    !HARD_UNRELATED_PATTERNS.some(pattern => pattern.test(normalized)) &&
    !SOFT_UNRELATED_PATTERNS.some(pattern => pattern.test(normalized)) &&
    (PORTFOLIO_SIGNAL_PATTERNS.some(pattern => pattern.test(context)) || DESIGN_CONTEXT_PATTERNS.some(pattern => pattern.test(context))),
  );
}

export function findChatKnowledge(query: string, limit = 5) {
  const normalized = normalizeQuery(query).toLowerCase();
  if (!normalized) return [];

  const ranked = chatKnowledge
    .map((entry, index) => {
      const signals = new Set([
        ...entry.keywords,
        ...(KNOWLEDGE_ALIASES[entry.id] ?? []),
      ]);
      let score = [...signals].reduce((total, keyword) => {
        const normalizedKeyword = keyword.toLowerCase();
        if (!normalizedKeyword || !normalized.includes(normalizedKeyword)) return total;
        return total + (normalizedKeyword.length >= 5 ? 6 : normalizedKeyword.length >= 3 ? 4 : 2);
      }, 0);
      if (normalized.includes(entry.title.toLowerCase())) score += 8;
      for (const hint of TOPIC_HINTS) {
        if (hint.pattern.test(normalized) && hint.ids.includes(entry.id)) score += hint.weight;
      }
      if (
        GENERIC_OVERVIEW_PATTERN.test(normalized) &&
        !SPECIFIC_PROJECT_PATTERN.test(normalized) &&
        ["project-overview", "experience-overview", "capability-overview"].includes(entry.id)
      ) score += 9;
      if (entry.id === "assistant-scope" && !/能回答|可以问|能聊|范围|帮助|公开内容/i.test(normalized)) score *= 0.55;
      return { entry, score, index };
    })
    .filter(item => item.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map(item => item.entry);
  if (ranked.length) return ranked;

  const fallbackIds: string[] = [];
  for (const hint of TOPIC_HINTS) {
    if (!hint.pattern.test(normalized)) continue;
    for (const id of hint.ids) {
      if (!fallbackIds.includes(id)) fallbackIds.push(id);
    }
  }
  if (GENERIC_PERSON_REQUEST.test(normalized) || GENERIC_SCOPE_REQUEST.test(normalized) || GENERIC_CAPABILITY_REQUEST.test(normalized)) {
    const scopeFirst = /能回答|可以问|能聊|范围|帮助|做什么|提供什么/i.test(normalized);
    const ids = scopeFirst
      ? ["assistant-scope", "capability-overview", "profile", "experience-overview"]
      : ["profile", "capability-overview", "experience-overview", "assistant-scope"];
    for (const id of ids) {
      if (!fallbackIds.includes(id)) fallbackIds.push(id);
    }
  }
  if (!fallbackIds.length) fallbackIds.push("assistant-scope", "profile", "capability-overview");
  return fallbackIds
    .map(id => chatKnowledge.find(entry => entry.id === id))
    .filter((entry): entry is ChatKnowledgeEntry => Boolean(entry))
    .slice(0, limit);
}

export function collectChatReferences(entries: readonly ChatKnowledgeEntry[], limit = 4) {
  const seen = new Set<string>();
  const references: ChatReference[] = [];
  for (const entry of entries) {
    for (const reference of entry.references ?? []) {
      if (seen.has(reference.href)) continue;
      seen.add(reference.href);
      references.push(reference);
      if (references.length >= limit) return references;
    }
  }
  return references;
}

export function buildLocalChatReply(query: string, contextQuery = query) {
  if (!isChatQueryInScope(query, contextQuery)) return { reply: OUT_OF_SCOPE_REPLY, entries: [] as ChatKnowledgeEntry[] };
  const entries = findChatKnowledge(`${query} ${contextQuery}`);
  if (!entries.length) return { reply: OUT_OF_SCOPE_REPLY, entries: [] as ChatKnowledgeEntry[] };

  const selected = entries.slice(0, 2);
  return {
    reply: selected.map(entry => `**${entry.title}**\n\n${entry.content}`).join("\n\n"),
    entries,
  };
}

export const CHAT_QUICK_PROMPTS = [
  "你最擅长解决什么设计问题？",
  "你做过哪些项目？",
  "招财 Smart 的难点是什么？",
  "你怎么和开发协作？",
] as const;
