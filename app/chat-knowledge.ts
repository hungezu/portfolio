export const OUT_OF_SCOPE_REPLY = "这部分超出了我掌握的作品集资料。可以继续聊我的项目、设计职责和工作方式，也可以带你找到联系方式。";

export type ChatReference = { label: string; href: string; kind: "section" | "project" };
export type ChatReplyContext = { projectSlug?: string; entryIds: string[] };
export type ChatKnowledgeEntry = {
  id: string;
  title: string;
  content: string;
  keywords: readonly string[];
  references?: readonly ChatReference[];
};

const section = (label: string, anchor: string): ChatReference => ({ label, href: `/portfolio/#${anchor}`, kind: "section" });
const project = (label: string, slug: string, anchor = ""): ChatReference => ({ label, href: `/portfolio/project/${slug}/${anchor ? `#${anchor}` : ""}`, kind: "project" });

/** 只索引作品集中已经公开的内容；示例、设计目标和验证计划不能表述为真实业务成效。 */
export const chatKnowledge: readonly ChatKnowledgeEntry[] = [
  {
    id: "profile", title: "认识我",
    content: "我是一名 AI 体验产品设计师，项目覆盖 AI 智能问数、复杂 B 端系统、设计系统与数据可视化。我关注的是：让用户理解产品正在做什么，能控制过程，也能核对结果。",
    keywords: ["李家豪", "Leo", "介绍", "是谁", "背景", "个人", "职业定位", "做什么"],
    references: [section("查看个人介绍", "top")],
  },
  {
    id: "capability-overview", title: "我擅长解决什么问题",
    content: "可以从三个方向了解我的能力：\n\n- **AI 体验**：澄清模糊问题，让等待、结果与异常有明确反馈。\n- **复杂系统**：梳理角色与业务任务，建立可复用的页面、组件和状态规则。\n- **跨端与数据表达**：组织高密度信息，并将方案交付到 Web、App 和大屏。",
    keywords: ["能力", "擅长", "优势", "技能", "长处", "强项", "会什么", "能解决"],
    references: [section("查看能力与项目证据", "ability")],
  },
  {
    id: "assistant-scope", title: "我能帮你了解什么",
    content: "我是李家豪的 AI 分身，可以结合这份作品集，聊聊我的项目、设计职责和工作经历，也能帮你找到对应的案例章节。你可以从「你擅长什么」或「先看哪个项目」开始。",
    keywords: ["你是谁", "你叫什么", "你能", "可以问什么", "能回答什么", "帮助", "范围"],
    references: [section("浏览精选作品", "work")],
  },
  {
    id: "contact", title: "联系我",
    content: "可以通过微信 **Hungezu**、邮箱 **2146953949@qq.com** 或手机 **13670115683** 联系我。联系区也提供了微信二维码。",
    keywords: ["联系", "邮箱", "邮件", "微信", "手机", "电话", "联络", "约聊"],
    references: [section("打开联系区", "contact")],
  },
  {
    id: "project-overview", title: "我做过哪些项目",
    content: "作品集中的项目覆盖几个方向：\n\n- **AI 与平台体验**：国科信、招财 Smart。\n- **财税系统与跨端设计**：税纪云、国家能源集团报税平台。\n- **数据表达**：可视化大屏项目合集。\n\n你可以按感兴趣的方向继续了解项目职责、设计难点和具体方案。",
    keywords: ["项目", "作品", "案例", "有哪些", "做过什么", "项目概览"],
    references: [section("浏览全部精选作品", "work"), project("查看国科信案例", "gkx"), project("查看招财 Smart 案例", "zhaocai-smart")],
  },
  {
    id: "project-recommendation", title: "如果只看一个项目",
    content: "建议先看 **国科信（深圳国际科技信息中心）**。这个案例把多系统体验、AI 辅助设计与规范交付串在一起，比较完整地展示了我如何做设计判断。\n\n可以先看**跨系统策略**，再看 **AI 原型与人工校正**，最后看**规范和交付评审**。如果想继续了解 AI 问数体验，可以看招财 Smart；跨端财税流程则可以看税纪云。",
    keywords: ["推荐项目", "推荐案例", "先看哪个", "代表项目", "只看一个"],
    references: [project("国科信 · 跨系统策略", "gkx", "gkx-systems"), project("国科信 · AI 原型实践", "gkx", "nsp-prototype"), project("国科信 · 规范与交付", "gkx", "gkx-design-system")],
  },
  {
    id: "experience-current", title: "近期工作",
    content: "作品集公开的近期经历是：自 2025 年 7 月起，在上海荣宇智能信息技术有限公司（外派至智谱 AI）担任 UED & UI 设计师，参与 AI 产品、金融智能与政企平台设计，负责业务梳理、交互、界面和规范交付。",
    keywords: ["现在", "目前", "最近", "智谱", "荣宇", "当前工作", "工作内容"],
    references: [section("查看工作经历", "experience")],
  },
  {
    id: "experience-overview", title: "公开工作经历",
    content: "- **2025.07 至今**：上海荣宇（外派至智谱 AI），UED & UI 设计师。\n- **2024.05—2025.02**：答税科技，UI & UX 设计师。\n- **2021.07—2024.05**：华盟财税科技，UI & UX 设计师。\n- **2020.07—2021.07**：深圳喆云科技，UI 设计师。\n\n经历覆盖 AI 产品、企业财税系统与多端界面设计。",
    keywords: ["经历", "经验", "公司", "职位", "任职", "履历", "职业", "年限", "时间线", "工作过"],
    references: [section("查看完整工作经历", "experience")],
  },
  {
    id: "experience-tax", title: "财税产品经历",
    content: "在答税科技，我独立推进智汇算企业版新功能的 UX/UI 设计；在华盟财税科技，我主导税纪云 2.0 Web / App 改版，并独立负责国家能源集团报税平台从 0 到 1 的 UI 与组件体系设计。",
    keywords: ["答税", "华盟", "智汇算", "财税经历", "以前", "过去"],
    references: [section("查看工作经历", "experience"), project("查看税纪云案例", "tax-cloud")],
  },
  {
    id: "ai-experience", title: "AI 体验设计",
    content: "我将 AI 的不确定性转成用户可以理解和处理的状态：提问含糊时确认条件，执行中说明阶段并允许停止，结果出现后提供口径与来源，失败时保留条件和恢复入口。招财 Smart 展示了这些设计如何串成完整任务。",
    keywords: ["AI 体验", "AI体验", "智能体验", "不确定性", "可信", "可控", "对话产品", "人机协作"],
    references: [project("招财 Smart · 完整任务演示", "zhaocai-smart", "zcs-core-interaction")],
  },
  {
    id: "ai-workflow", title: "我如何与 AI 协作",
    content: "我使用 Codex、Gemini 辅助需求拆解、可运行原型、界面探索与 Markdown 规范整理。范围判断、业务规则核对、体验评审和最终交付由我完成。\n\n国科信案例还展示了：把产品提供的 AI 原型按项目规范校正，再用交互复现检查查询、筛选和恢复规则。",
    keywords: ["AI 工作流", "AI工作流", "AI协作", "AI 协作", "Codex", "Gemini", "工具", "人工", "原型"],
    references: [project("国科信 · AI 实践与人工校正", "gkx", "nsp-prototype")],
  },
  {
    id: "collaboration", title: "如何与产品、研发协作",
    content: "我会把任务流、组件状态和异常反馈写进交付规范，让评审意见对应具体页面与预期行为。国科信案例保留了合作方 UI 评审记录；招财 Smart 则明确区分设计交付、业务口径确认与研发实现，便于逐项核对。",
    keywords: ["开发", "研发", "产品经理", "团队", "协作", "合作", "沟通", "评审", "走查", "交付"],
    references: [project("国科信 · 交付评审与核对", "gkx", "gkx-supplier"), project("招财 Smart · 协作边界", "zhaocai-smart", "zcs-ai-strategy")],
  },
  {
    id: "complex-systems", title: "复杂系统如何拆解",
    content: "先厘清系统、角色、任务与页面边界，再判断哪些操作可以共用、哪些结构应随任务变化。例如国科信统一查询、选择与反馈规则，同时为论文管理、持续阅读和模型选择保留不同的页面结构。",
    keywords: ["复杂系统", "B端", "B 端", "角色", "权限", "业务规则", "架构", "流程", "多系统"],
    references: [project("国科信 · 跨系统策略", "gkx", "gkx-systems")],
  },
  {
    id: "design-system", title: "设计规范如何落地",
    content: "从栅格、组件、页面类型到交互状态分层组织规范，再把规则对应到具体页面与交付核对项。国科信案例提供了可查阅的 Markdown 规范，也展示了如何按需求、交互、视觉和接口四个维度审核交付。",
    keywords: ["设计系统", "设计规范", "组件", "栅格", "一致性", "状态", "视觉规范", "MD", "Markdown"],
    references: [project("国科信 · 规范与交付", "gkx", "gkx-design-system")],
  },
  {
    id: "data-visualization", title: "如何组织数据表达",
    content: "根据阅读任务安排指标、地图、趋势与排行，建立从整体态势到关键细节的顺序。大屏合集展示了多行业的图表编排；招财 Smart 则用图表读趋势、用表格核对数值，并让结论关联口径与来源。",
    keywords: ["数据可视化", "可视化", "大屏", "地图", "趋势", "排行", "图表", "指标层级", "数据表达"],
    references: [project("查看可视化大屏合集", "data-visualisation"), project("招财 Smart · 结果复用", "zhaocai-smart", "zcs-markdown-system")],
  },
  {
    id: "design-approach", title: "我的设计方法",
    content: "先明确业务任务与边界，再比较页面结构、交互状态和异常路径的取舍，用原型检查关键规则，最后沉淀为组件与规范。案例里可以看到具体判断：何时先澄清问题、何时用弹窗或独立工作区，以及失败后如何继续任务。",
    keywords: ["设计方法", "设计思路", "设计决策", "取舍", "原则", "研究", "思考", "工作方式", "难点", "挑战"],
    references: [project("招财 Smart · 关键设计", "zhaocai-smart", "zcs-clarification"), project("国科信 · 交互决策", "gkx", "nsp-rules")],
  },
  {
    id: "project-gkx", title: "国科信是什么项目",
    content: "国科信（深圳国际科技信息中心）是多系统平台体验设计项目，范围包括智慧门户和四大主要业务系统。案例围绕跨系统操作规则、AI 原型校正、设计规范和合作方交付评审，展示我的设计与协作过程。",
    keywords: ["国科信", "深圳国际科技信息中心", "gkx", "平台项目", "背景"],
    references: [project("打开国科信案例", "gkx", "gkx-project-context")],
  },
  {
    id: "project-gkx-challenge", title: "国科信的设计难点",
    content: "主要难点是**多系统要容易学，各类任务又需要不同空间**。论文管理重在查找与维护，智能阅读需要稳定阅读区，模型广场重在发现与选择。我统一导航、查询、选择和反馈规则，再按任务选择列表、弹窗或独立工作区，并把这些规则用于多方交付核对。",
    keywords: ["国科信难点", "国科信挑战", "跨系统", "统一", "一致性", "取舍"],
    references: [project("国科信 · 跨系统策略", "gkx", "gkx-systems"), project("国科信 · 交互决策", "gkx", "nsp-rules")],
  },
  {
    id: "project-gkx-role", title: "我在国科信负责什么",
    content: "我负责交互与 UI 设计、门户样式规范、定制组件及协作审核。我借助 AI 编写和维护设计 MD，按项目规范校正原型，并参与合作方 UI 评审，将修改要求与处理状态记录下来。",
    keywords: ["国科信职责", "国科信负责", "门户规范", "协作审核"],
    references: [project("国科信 · 规范与交付", "gkx", "gkx-design-system"), project("国科信 · 署名评审记录", "gkx", "gkx-supplier")],
  },
  {
    id: "project-gkx-ai", title: "国科信中的 AI 协作",
    content: "**AI 辅助原型与规范整理，我负责设计判断与核对。**案例里有两项具体实践：\n\n- 按项目规范调整产品提供的 AI 原型，集中查询操作区，整理卡片信息层级。\n- 将论文查询要求写成 MD，用交互复现核对关键词匹配、机构筛选、空结果和重置，再切换专利记录检查规则复用。",
    keywords: ["国科信AI", "国科信原型", "AI工作流", "Codex", "Markdown"],
    references: [project("国科信 · AI 实践与核对", "gkx", "nsp-prototype")],
  },
  {
    id: "project-gkx-collaboration", title: "国科信如何推进协作交付",
    content: "我用共享规范对齐页面与操作规则，参与合作方 UI 评审，并在台账中保留模块、日期、修改要求和处理状态。案例提供了署名评审记录，可核对具体问题的处理；它也明确提出，后续应继续补齐修改前后页面与复核结论。",
    keywords: ["国科信交付", "合作方", "评审", "研发", "沟通"],
    references: [project("国科信 · 交付评审与核对", "gkx", "gkx-supplier")],
  },
  {
    id: "project-gkx-outcomes", title: "国科信有哪些可核对的成果",
    content: "可以核对的内容包括共用设计规范、查询交互复现、AI 原型人工调整对照，以及合作方评审记录。作品集没有提供完整的线上效率或通过率统计，因此不能给出提升百分比，也不能把本次页面核对当成项目验收。",
    keywords: ["国科信成果", "成效", "指标", "提升", "验证", "通过率", "验收"],
    references: [project("国科信 · 成果复盘", "gkx", "gkx-outcomes")],
  },
  {
    id: "project-zhaocai", title: "招财 Smart 是什么项目",
    content: "招财 Smart 面向财务人员、经营分析人员与业务负责人，让用户用自然语言查询经营数据。我的设计覆盖口径确认、查询反馈、结果依据与看板复用，重点是让用户在使用结论前核对条件和来源。",
    keywords: ["招财", "Smart", "智能问数", "经营分析", "背景"],
    references: [project("打开招财 Smart 案例", "zhaocai-smart", "zcs-project-overview")],
  },
  {
    id: "project-zhaocai-challenge", title: "招财 Smart 的设计难点",
    content: "难点是**让模糊提问变成可核对、可继续的分析任务**：\n\n- 「利润」可能有多种口径，需要确认指标，同时保留已识别的时间与组织。\n- 查询等待时，用户需要知道阶段，并能停止、重试或继续。\n- 结果要先读懂结论，再按需核对口径、来源与原始数据。\n\n这些判断分别落在候选确认、阶段反馈和结果依据侧栏中。",
    keywords: ["招财难点", "Smart难点", "挑战", "痛点", "取舍"],
    references: [project("招财 Smart · 三个关键设计判断", "zhaocai-smart", "zcs-clarification")],
  },
  {
    id: "project-zhaocai-role", title: "我在招财 Smart 负责什么",
    content: "我负责招财 Smart 的 UX/UI，覆盖提问与口径确认、查询过程反馈、结果解释与依据、看板交互和回答输出规范。公开交付包含任务流、状态策略、交互与回答规范；指标口径由产品和业务确认，查询服务及权限校验由研发实现。",
    keywords: ["招财职责", "Smart职责", "负责", "UX/UI", "交付"],
    references: [project("招财 Smart · 项目概况", "zhaocai-smart", "zcs-project-overview"), project("招财 Smart · 设计与工程分工", "zhaocai-smart", "zcs-ai-strategy")],
  },
  {
    id: "project-zhaocai-clarification", title: "为什么先澄清，而不直接查询",
    content: "「利润」可能指营业利润、利润总额或净利润。直接查询会把歧义带进结果。因此方案保留已经识别的时间与组织，只让用户补充指标口径；候选不合适时，也有「都不是」和开放说明入口。",
    keywords: ["语义澄清", "口径", "意图", "确认", "候选", "提问", "歧义"],
    references: [project("招财 Smart · 口径确认演示", "zhaocai-smart", "zcs-core-interaction")],
  },
  {
    id: "project-zhaocai-process", title: "等待与失败如何处理",
    content: "查询过程按「理解问题、查询数据、生成结果」反馈阶段，同时保留条件和停止入口。超时后可以沿用原条件重试，停止后可以继续或修改问题；无匹配时说明当前查询范围，提供修改条件的入口，不把未取得结果说成数据为零。",
    keywords: ["过程", "反馈", "等待", "停止", "异常", "失败", "重试", "恢复", "超时"],
    references: [project("招财 Smart · 过程反馈", "zhaocai-smart", "zcs-process-feedback"), project("招财 Smart · 异常恢复", "zhaocai-smart", "zcs-ai-governance")],
  },
  {
    id: "project-zhaocai-board", title: "为什么把回答保存到看板",
    content: "经营分析往往需要持续查看。方案让结果与查询条件、数据来源一起保存，避免只留下脱离上下文的一张图；看板支持卡片添加、排序、合并与撤销，合并前还会确认，并保留各卡片的依据。",
    keywords: ["看板", "沉淀", "复用", "卡片", "合并", "保存", "排序"],
    references: [project("招财 Smart · 看板与结果复用", "zhaocai-smart", "zcs-markdown-system")],
  },
  {
    id: "project-zhaocai-output", title: "回答规范解决什么问题",
    content: "规范让结论、图表、表格和引用在不同问数场景中保持清晰：先回答问题，再给依据；数值带上期间、范围与单位；图表和表格使用同一数据；缺失与零分别表达。代码和公式只在任务需要时出现，不能代替业务解释。",
    keywords: ["回答规范", "输出规范", "Markdown", "图表", "表格", "引用", "代码", "结果解释", "依据"],
    references: [project("招财 Smart · 回答规范", "zhaocai-smart", "zcs-markdown-system")],
  },
  {
    id: "project-zhaocai-ai", title: "招财 Smart 的 AI 与工程边界",
    content: "设计方案中，AI 理解问题并组织表达，用户确认业务含义，查询服务负责执行与权限校验。我交付任务流、状态策略、交互和回答规范。作品集当前是前端交互演示，未连接真实 AI 或数据库，不能用演示表现证明模型准确率或线上效果。",
    keywords: ["AI协作", "AI 协作", "AI工作流", "模型", "算法", "工程", "权限", "数据边界", "AI负责"],
    references: [project("招财 Smart · AI 与工程协作边界", "zhaocai-smart", "zcs-ai-strategy")],
  },
  {
    id: "project-zhaocai-outcomes", title: "招财 Smart 的成果与验证边界",
    content: "案例展示了口径确认、过程反馈、异常恢复、看板交互与回答规范等设计交付，并提供可操作的前端演示。经营数字是示例；任务完成率、澄清效果等仍属于后续验证计划，作品集没有给出可证实的线上提升数据。",
    keywords: ["成果", "成效", "效果", "提升", "指标", "验证", "准确率", "上线", "数据"],
    references: [project("招财 Smart · 交付复盘与验证计划", "zhaocai-smart", "zcs-delivery")],
  },
  {
    id: "project-tax-cloud", title: "税纪云：职责与设计重点",
    content: "我主导税纪云 2.0 Web / App 体验改版，重构申报、审批、表单、筛选与税表等核心流程，并建立跨端设计系统。设计重点是面向决策、管理和执行角色，组织高密度财税任务，同时保持多页面和跨端规则一致。",
    keywords: ["税纪云", "全税种", "申报", "审批", "财税 SaaS", "跨端"],
    references: [project("打开税纪云案例", "tax-cloud")],
  },
  {
    id: "project-energy-tax", title: "国能报税平台：职责与设计重点",
    content: "我独立负责国家能源集团报税平台从 0 到 1 的 UI 设计，覆盖首页、纳税申报与综合管理工作台，并建立栅格、组件和缺省状态规范。设计重点是将业务内容组织为明确的工作台和共用规则；公开材料已经脱敏。",
    keywords: ["国家能源", "国能", "能源报税", "报税平台", "定制项目"],
    references: [project("打开国能报税平台案例", "energy-tax")],
  },
  {
    id: "project-data-visualisation", title: "可视化大屏：职责与设计重点",
    content: "大屏合集覆盖汽车、轨道交通、新能源、电子与地产等行业的税务数智场景。我负责大屏视觉、信息层级和图表编排，以地图、指标、趋势与排行组织高密度信息，并沉淀布局与视觉规范。",
    keywords: ["可视化大屏", "大屏合集", "汽车", "轨道交通", "新能源", "电子", "地产"],
    references: [project("打开可视化大屏合集", "data-visualisation")],
  },
  {
    id: "public-evidence", title: "目前公开资料的边界",
    content: "作品集提供了项目背景、职责、设计方案和部分过程证据，但没有公开完整的线上成效统计、模型配置或用户研究原始记录。涉及这些细节时，可以通过联系区与我沟通；这里不会补造数值或经历。",
    keywords: ["成果", "成效", "指标", "提升", "验证", "准确率", "上线", "模型", "算法", "用户研究", "测试人数"],
    references: [section("联系我了解更多", "contact")],
  },
  {
    id: "undisclosed-profile", title: "这项个人信息尚未公开",
    content: "这项信息目前没有在作品集中公开，这里无法确认。可以通过联系区与我沟通具体安排。",
    keywords: ["学历", "毕业", "学校", "大学", "专业", "年龄", "几岁", "到岗", "求职", "离职", "薪资", "薪酬", "薪水", "工资", "期望", "工作地点"],
    references: [section("联系我", "contact")],
  },
  {
    id: "navigation", title: "如何浏览作品集",
    content: "快速浏览可以先看核心能力和精选作品，再看工作经历。深入项目时，可以沿页面章节查看问题、设计判断与交付证据；想约聊，直接前往联系区。",
    keywords: ["导航", "怎么看", "哪里", "入口", "链接", "跳转", "章节", "首页", "目录", "浏览"],
    references: [section("核心能力", "ability"), section("精选作品", "work"), section("工作经历", "experience"), section("联系方式", "contact")],
  },
];

type ProjectSlug = "gkx" | "zhaocai-smart" | "tax-cloud" | "energy-tax" | "data-visualisation";
type Topic = "challenge" | "role" | "ai" | "collaboration" | "outcomes" | "clarification" | "process" | "board" | "output" | "design-system" | "overview";
const PROJECT_ALIASES: Record<ProjectSlug, readonly string[]> = {
  gkx: ["国科信", "深圳国际科技信息中心", "gkx"],
  "zhaocai-smart": ["招财", "smart", "zhaocai"],
  "tax-cloud": ["税纪云", "全税种申报", "tax-cloud"],
  "energy-tax": ["国家能源", "国能", "能源报税", "energy-tax"],
  "data-visualisation": ["可视化大屏", "大屏合集", "data-visualisation"],
};
const PROJECT_ENTRY_IDS: Record<ProjectSlug, Partial<Record<Topic, string>> & { overview: string }> = {
  gkx: { overview: "project-gkx", challenge: "project-gkx-challenge", role: "project-gkx-role", ai: "project-gkx-ai", collaboration: "project-gkx-collaboration", outcomes: "project-gkx-outcomes", "design-system": "design-system" },
  "zhaocai-smart": { overview: "project-zhaocai", challenge: "project-zhaocai-challenge", role: "project-zhaocai-role", ai: "project-zhaocai-ai", collaboration: "project-zhaocai-role", outcomes: "project-zhaocai-outcomes", clarification: "project-zhaocai-clarification", process: "project-zhaocai-process", board: "project-zhaocai-board", output: "project-zhaocai-output", "design-system": "project-zhaocai-output" },
  "tax-cloud": { overview: "project-tax-cloud", outcomes: "public-evidence", ai: "public-evidence" },
  "energy-tax": { overview: "project-energy-tax", outcomes: "public-evidence", ai: "public-evidence" },
  "data-visualisation": { overview: "project-data-visualisation", outcomes: "public-evidence", ai: "public-evidence" },
};
const PRIVATE_PATTERNS = [
  /密码|密钥|api\s*key|access\s*token|身份证|住址|家庭|客户姓名|客户联系方式|客户信息|机密|保密资料/i,
  /(?:提供|告诉|透露|给我|查看|获取|列出|多少|明细).{0,12}(?:未公开|内部|真实客户|薪资明细)|(?:未公开|内部|真实客户).{0,12}(?:数据|金额|预算|营收|名单|联系方式|指标|文档)/i,
];
const UNRELATED_PATTERNS = [
  /天气|气温|新闻|热搜|股票|股市|彩票|汇率|航班|酒店|旅行|旅游|攻略|食谱|菜谱|做饭|电影|音乐|星座|笑话|写诗|作文|小说|数学|物理|化学|医学|症状|药物|法律咨询|考试|作业|购物|优惠|快递/i,
  /翻译|帮我(?:写|做|生成).{0,8}(?:诗|代码|程序|论文)|(?:修复|解决).{0,6}(?:报错|bug)/i,
];
const PORTFOLIO_SIGNAL = /李家豪|leo|作品|项目|案例|经历|经验|工作|职业|公司|职位|能力|优势|擅长|设计|体验|交互|系统|规范|原型|流程|看板|问数|招财|smart|税纪云|国能|国科信|可视化|数据|指标|背景|目标|职责|角色|权限|业务|需求|研究|洞察|意图|澄清|反馈|解释|依据|引用|异常|上线|复盘|AI|智能|Codex|Gemini|联系|邮箱|微信|手机|电话|导航|章节|负责|参与|主导|难点|挑战|痛点|决策|方法|思路|原则|取舍|协作|合作|开发|研发|沟通|评审|走查|交付|学历|毕业|学校|年龄|到岗|薪资|薪酬|薪水|工资/i;
const FOLLOW_UP = /^(?:那|它|这个|该项目|该案例|上面|刚才|前面|具体|还有|然后|除此之外|详细|能展开|展开|继续)|^(?:为什么|怎么做|如何做|难点|挑战|职责|负责什么|怎么协作|效果如何|有什么成果)/i;
const GREETING = /^(?:你好|您好|嗨|哈[喽啰罗]|hello|hi|在吗|早上好|下午好|晚上好)[!！。,.，?？\s]*$/i;
const THANKS = /^(?:谢谢(?:你|啦|了)?|多谢|感谢|好的|好哒|明白了|了解了|收到|ok|thanks|thank you)[!！。,.，\s]*$/i;
const TOPIC_CONTINUATION = /^(?:那)?(?:能不能|可不可以|能|可以|请|再)?(?:再)?(?:具体|详细)?(?:展开|继续|多讲|多说)(?:讲讲|说说|介绍|说明)?(?:一点|一些|一下)?(?:吗|呢|吧)?[!！。,.，?？\s]*$/;

function normalizeQuery(query: string) { return query.trim().replace(/\s+/g, " ").slice(0, 600); }
function previousContext(query: string, contextQuery: string) {
  const context = contextQuery.trim().replace(/\s+/g, " ").slice(-2400);
  // 调用方可能把最近的问题（包括本轮）拼成上下文，本轮不能重复计分。
  return context.endsWith(query) ? context.slice(0, -query.length).trim() : context;
}
function explicitProjects(query: string) {
  const normalized = query.toLowerCase();
  return (Object.keys(PROJECT_ALIASES) as ProjectSlug[]).filter(slug => PROJECT_ALIASES[slug].some(alias => normalized.includes(alias)));
}
function latestContextProject(context: string) {
  const normalized = context.toLowerCase();
  let latest: ProjectSlug | undefined;
  let position = -1;
  for (const slug of Object.keys(PROJECT_ALIASES) as ProjectSlug[]) {
    for (const alias of PROJECT_ALIASES[slug]) {
      const found = normalized.lastIndexOf(alias);
      if (found > position) { latest = slug; position = found; }
    }
  }
  return latest;
}
function requestedTopic(query: string): Topic {
  if (/成果|成效|效果|提升|指标|准确率|通过率|验收|验证结果|上线|落地情况|用户反馈|测试人数|成功率/i.test(query) && !/指标口径|指标确认|数据指标|指标层级/.test(query)) return "outcomes";
  if (/难点|最难|难处|挑战|痛点|取舍/.test(query)) return "challenge";
  if (/AI.{0,12}(?:协作|工作流|工具|负责|参与|辅助)|(?:怎么|如何).{0,6}(?:用|使用).{0,4}AI|Codex|Gemini|模型|算法|工程边界/i.test(query)) return "ai";
  if (/职责|负责|主导|分工|参与|做了什么|做过什么|贡献/.test(query)) return "role";
  if (/研发|开发|产品经理|合作方|协作|合作|沟通|评审|走查/.test(query)) return "collaboration";
  if (/澄清|口径|候选|歧义|确认条件|意图/.test(query)) return "clarification";
  if (/反馈|等待|过程|停止|异常|失败|重试|恢复|超时/.test(query)) return "process";
  if (/看板|沉淀|复用|卡片|合并|保存/.test(query)) return "board";
  if (/回答规范|输出规范|Markdown|引用|表格|图表|代码|结果解释|依据/.test(query)) return "output";
  if (/设计系统|设计规范|组件|栅格|一致性/.test(query)) return "design-system";
  return "overview";
}

function requestedTopics(query: string): Topic[] {
  const primary = requestedTopic(query);
  if (!/和|与|以及|还有|、|分别/.test(query)) return [primary];
  return [...new Set([primary, ...query.split(/和|与|以及|还有|、|分别/).map(requestedTopic)])]
    .filter(topic => topic !== "overview").slice(0, 2) as Topic[];
}

export function isChatQueryInScope(query: string, contextQuery = "") {
  const normalized = normalizeQuery(query);
  if (!normalized || PRIVATE_PATTERNS.some(pattern => pattern.test(normalized))) return false;
  if (GREETING.test(normalized) || THANKS.test(normalized)) return true;
  if (UNRELATED_PATTERNS.some(pattern => pattern.test(normalized))) return false;
  if (PORTFOLIO_SIGNAL.test(normalized) || explicitProjects(normalized).length) return true;
  if (/你是谁|你叫什么|你是(?:不是)?(?:本人|李家豪|Leo|AI|机器人|真人)|你能(?:做什么|帮我什么|回答什么|聊什么)|能问什么|可以问什么|能聊什么|可以聊什么|能帮我|怎么称呼|介绍一下自己|他是谁|他做什么|你是做什么的|你做什么/.test(normalized)) return true;
  const context = previousContext(normalized, contextQuery);
  return Boolean(FOLLOW_UP.test(normalized) && context && (PORTFOLIO_SIGNAL.test(context) || explicitProjects(context).length) && !PRIVATE_PATTERNS.some(pattern => pattern.test(context)));
}
function entriesFor(ids: readonly string[], limit: number) {
  return [...new Set(ids)].map(id => chatKnowledge.find(entry => entry.id === id)).filter((entry): entry is ChatKnowledgeEntry => Boolean(entry)).slice(0, Math.max(0, limit));
}

/** Context contains identifiers only. Client text never becomes a knowledge source. */
export function parseChatReplyContext(value: unknown): ChatReplyContext | undefined {
  if (!value || typeof value !== "object" || !Array.isArray((value as ChatReplyContext).entryIds)) return undefined;
  const incoming = value as ChatReplyContext;
  const entryIds = [...new Set(incoming.entryIds.filter(id => typeof id === "string" && chatKnowledge.some(entry => entry.id === id)))].slice(0, 8);
  const projectSlug = typeof incoming.projectSlug === "string" && Object.hasOwn(PROJECT_ALIASES, incoming.projectSlug)
    ? incoming.projectSlug : undefined;
  return { ...(projectSlug ? { projectSlug } : {}), entryIds };
}

/** Page navigation changes the default subject without rewriting the visible conversation. */
export function resolveChatPageContext(savedContext: ChatReplyContext | undefined, previousPageSlug: string | null | undefined, currentPageSlug?: string): ChatReplyContext {
  const saved = parseChatReplyContext(savedContext);
  const current = currentPageSlug && Object.hasOwn(PROJECT_ALIASES, currentPageSlug) ? currentPageSlug : undefined;
  const empty: ChatReplyContext = { ...(current ? { projectSlug: current } : {}), entryIds: [] };
  if (previousPageSlug === undefined) return saved ?? empty;
  const previous = previousPageSlug && Object.hasOwn(PROJECT_ALIASES, previousPageSlug) ? previousPageSlug : undefined;
  if (previous !== current) return empty;
  return saved ?? empty;
}

function queryProjects(query: string, contextQuery: string) {
  const projects = explicitProjects(query);
  // Complete general questions deliberately leave the previous project behind.
  const explicitlyRefersToProject = /这个项目|该项目|这个案例|该案例|它|上面的项目|刚才的项目/.test(query);
  if (projects.length || !FOLLOW_UP.test(query) || (!explicitlyRefersToProject && /擅长|能力|优势|经历|公司|个人|是谁|推荐|哪些项目/.test(query))) return projects;
  const contextualProject = latestContextProject(previousContext(query, contextQuery));
  return contextualProject ? [contextualProject] : [];
}

/** 本轮问题优先；只有指代型追问才借用最近项目，不对拼接历史累计关键词分数。 */
export function findChatKnowledge(query: string, limit = 5, contextQuery = "") {
  const normalized = normalizeQuery(query);
  if (!normalized || limit <= 0 || !isChatQueryInScope(normalized, contextQuery)) return [];
  if (GREETING.test(normalized) || THANKS.test(normalized)) return [];
  if (/学历|毕业|学校|大学|专业是什么|年龄|几岁|到岗|求职|离职|薪资|薪酬|薪水|工资|期望|工作地点/.test(normalized)) return entriesFor(["undisclosed-profile"], limit);
  if (/你是谁|你叫什么|你是(?:不是)?(?:本人|李家豪|Leo|AI|机器人|真人)|你能(?:做什么|帮我什么|回答什么|聊什么)|能问什么|可以问什么|能聊什么|可以聊什么|能帮我什么/.test(normalized)) return entriesFor(["assistant-scope"], limit);
  // A project named as the reason for contacting Leo must not override the contact request.
  if (/联系方式|怎么联系|如何联系|联系(?:一下)?\s*(?:Leo|李家豪|他|你)|邮箱|微信|手机号|电话|约聊/i.test(normalized)) return entriesFor(["contact"], limit);

  const topic = requestedTopic(normalized);
  const projects = queryProjects(normalized, contextQuery);
  if (projects.length) {
    const topics = requestedTopics(normalized);
    return entriesFor(projects.flatMap(slug => (topics.length ? topics : ["overview" as const]).map(item => PROJECT_ENTRY_IDS[slug][item] ?? PROJECT_ENTRY_IDS[slug].overview)), limit);
  }
  if (/和|与|以及|还有|、|分别/.test(normalized)) {
    const mixed: string[] = [];
    if (/擅长|能力|优势|技能|长处|强项/.test(normalized)) mixed.push("capability-overview");
    if (/经历|履历|公司|职位|任职|职业|工作过/.test(normalized)) mixed.push("experience-overview");
    if (/联系方式|怎么联系|如何联系|邮箱|微信|手机号|电话|约聊/.test(normalized)) mixed.push("contact");
    if (/协作|合作|沟通|评审|走查|交付/.test(normalized)) mixed.push("collaboration");
    if (mixed.length > 1) return entriesFor(mixed, limit);
  }
  if (/推荐|先看|哪个项目|代表项目|代表作|只看/.test(normalized)) {
    if (/问数|经营分析|口径|自然语言.{0,8}(?:查|数据)/.test(normalized)) return entriesFor(["project-zhaocai"], limit);
    if (/跨端|财税|移动端|Web.{0,8}App/i.test(normalized)) return entriesFor(["project-tax-cloud"], limit);
    if (/可视化|大屏|图表/.test(normalized)) return entriesFor(["project-data-visualisation"], limit);
  }
  if (/擅长|能力|优势|技能|长处|强项|会什么|能解决/.test(normalized)) return entriesFor(["capability-overview"], limit);
  if (/现在|目前|最近|当前工作|智谱|荣宇/.test(normalized)) return entriesFor(["experience-current"], limit);
  if (/答税|华盟|智汇算|财税经历|以前的工作|过去的工作/.test(normalized)) return entriesFor(["experience-tax"], limit);
  if (/经历|履历|公司|职位|任职|职业|年限|工作过|做过什么|负责过|参与过/.test(normalized)) return entriesFor(["experience-overview"], limit);
  if (/推荐|先看|哪个项目|代表项目|代表作|只看一个/.test(normalized) && topic === "overview") return entriesFor(["project-recommendation"], limit);
  if (/项目|作品|案例|做过哪些/.test(normalized) && topic === "overview") return entriesFor(["project-overview"], limit);
  if (topic === "outcomes") return entriesFor(["public-evidence"], limit);
  if (topic === "ai" || /AI工作流|AI 工作流|工具/.test(normalized)) return entriesFor(["ai-workflow"], limit);
  if (topic === "collaboration" || /交付/.test(normalized)) return entriesFor(["collaboration"], limit);
  if (topic === "design-system") return entriesFor(["design-system"], limit);
  if (/可视化|大屏|数据表达|图表|地图|趋势|排行/.test(normalized)) return entriesFor(["data-visualization"], limit);
  if (/AI|智能|意图|澄清|反馈|解释|异常|对话/.test(normalized)) return entriesFor(["ai-experience"], limit);
  if (/复杂系统|B端|B 端|多系统|权限|业务规则|架构|角色/.test(normalized)) return entriesFor(["complex-systems"], limit);
  if (/设计方法|设计思路|方法|决策|取舍|原则|工作方式|怎么做设计|研究|难点|挑战|怎么思考/.test(normalized)) return entriesFor(["design-approach"], limit);
  if (/导航|怎么看|哪里|入口|链接|跳转|章节|首页|目录|浏览/.test(normalized)) return entriesFor(["navigation"], limit);
  if (/介绍|李家豪|Leo|背景|个人|他是谁|他做什么|你是做什么的|你做什么|做什么/.test(normalized)) return entriesFor(["profile"], limit);
  const ranked = chatKnowledge.map((entry, index) => ({ entry, index, score: entry.keywords.reduce((score, keyword) => normalized.toLowerCase().includes(keyword.toLowerCase()) ? score + Math.min(8, keyword.length) : score, 0) }))
    .filter(item => item.score > 0).sort((left, right) => right.score - left.score || left.index - right.index);
  return ranked.length ? [ranked[0].entry] : entriesFor(["assistant-scope"], limit);
}

export function collectChatReferences(entries: readonly ChatKnowledgeEntry[], limit = 4) {
  const seen = new Set<string>();
  const references: ChatReference[] = [];
  if (limit <= 0) return references;
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
export function buildLocalChatReply(query: string, contextQuery = query, conversationContext?: ChatReplyContext) {
  const normalized = normalizeQuery(query);
  const previous = parseChatReplyContext(conversationContext);
  const inheritedEntries = TOPIC_CONTINUATION.test(normalized) && previous ? entriesFor(previous.entryIds, 2) : [];
  const emptyContext: ChatReplyContext = { entryIds: [] };
  if (!inheritedEntries.length && !isChatQueryInScope(normalized, contextQuery)) return { reply: OUT_OF_SCOPE_REPLY, entries: [] as ChatKnowledgeEntry[], context: emptyContext };
  if (GREETING.test(normalized)) return { reply: "你好，我是李家豪的 AI 分身。可以聊聊我的设计能力、工作经历、项目与协作方式，也可以帮你找到联系方式。你想先了解哪一部分？", entries: [] as ChatKnowledgeEntry[], context: emptyContext };
  if (THANKS.test(normalized)) return { reply: "不客气，按你的节奏浏览就好。想继续了解项目，或查找联系方式，随时问我。", entries: [] as ChatKnowledgeEntry[], context: emptyContext };
  const entries = inheritedEntries.length ? inheritedEntries : findChatKnowledge(normalized, 2, contextQuery);
  if (!entries.length) return { reply: OUT_OF_SCOPE_REPLY, entries: [] as ChatKnowledgeEntry[], context: emptyContext };
  const entryIds = entries.map(entry => entry.id);
  const mentionedProjects = queryProjects(normalized, contextQuery);
  const entryProjects = (Object.keys(PROJECT_ENTRY_IDS) as ProjectSlug[]).filter(slug => entries.some(entry => entry.id.startsWith("project-") && Object.values(PROJECT_ENTRY_IDS[slug]).includes(entry.id)));
  const projects = inheritedEntries.length && previous?.projectSlug ? [previous.projectSlug as ProjectSlug] : mentionedProjects.length ? mentionedProjects : entryProjects;
  const projectSlug = entryIds.includes("project-recommendation") ? "gkx"
    : projects.length === 1 && entries.some(entry => Object.values(PROJECT_ENTRY_IDS[projects[0]]).includes(entry.id)) ? projects[0] : undefined;
  const context: ChatReplyContext = { ...(projectSlug ? { projectSlug } : {}), entryIds };
  return { reply: entries.map(entry => `**${entry.title}**\n\n${entry.content}`).join("\n\n"), entries, context };
}
export const CHAT_QUICK_PROMPTS = [
  "你擅长解决什么设计问题？",
  "你有哪些工作经历？",
  "国科信项目里，你负责什么？",
  "你如何与产品、研发协作？",
] as const;
const PROJECT_QUICK_PROMPTS: Record<ProjectSlug, readonly string[]> = {
  gkx: ["国科信的设计难点是什么？", "你在国科信具体负责什么？", "国科信如何用 AI 辅助设计？", "国科信如何审核合作方交付？"],
  "zhaocai-smart": ["招财 Smart 的设计难点是什么？", "你在招财 Smart 负责什么？", "招财 Smart 为什么先澄清口径？", "招财 Smart 如何处理查询失败？"],
  "tax-cloud": ["税纪云主要解决什么问题？", "你在税纪云负责什么？", "税纪云如何处理跨端设计？", "如何联系你聊聊这个项目？"],
  "energy-tax": ["国能报税平台是什么项目？", "你在国能报税平台负责什么？", "国能报税平台有哪些设计规范？", "如何联系你聊聊这个项目？"],
  "data-visualisation": ["可视化大屏覆盖哪些行业？", "你在可视化大屏中负责什么？", "可视化大屏如何组织信息？", "如何联系你聊聊这个项目？"],
};
export function getChatQuickPrompts(projectSlug?: string): readonly string[] { return PROJECT_QUICK_PROMPTS[projectSlug as ProjectSlug] ?? CHAT_QUICK_PROMPTS; }

const GENERAL_FOLLOW_UP_PROMPTS = [
  "你擅长解决什么设计问题？", "你有哪些工作经历？", "你如何设计 AI 产品的交互体验？",
  "你如何梳理复杂系统？", "你如何与产品、研发协作？", "你使用哪些 AI 协作工具？",
  "你的设计方法是什么？", "你的设计规范如何落地？", "如何联系你？", "如何浏览这份作品集？",
];
const TOPIC_FOLLOW_UP_PROMPTS: Record<string, readonly string[]> = {
  "capability-overview": ["你如何设计 AI 产品的交互体验？", "你如何梳理复杂系统？"],
  "ai-experience": ["你的设计方法是什么？", "你如何与产品、研发协作？"],
  "ai-workflow": ["你的设计规范如何落地？", "你如何与产品、研发协作？"],
  "experience-overview": ["你目前的工作内容是什么？", "你以前的工作有哪些财税项目？"],
  "experience-current": ["你使用哪些 AI 协作工具？", "你如何与产品、研发协作？"],
  "experience-tax": ["你如何梳理复杂系统？", "你的设计规范如何落地？"],
  "collaboration": ["你的设计规范如何落地？", "你使用哪些 AI 协作工具？"],
  "complex-systems": ["你的设计规范如何落地？", "你的设计方法是什么？"],
  "design-system": ["你如何与产品、研发协作？", "你使用哪些 AI 协作工具？"],
  "project-overview": ["你如何设计 AI 产品的交互体验？", "你如何梳理复杂系统？"],
  "contact": ["你如何与产品、研发协作？", "你擅长解决什么设计问题？"],
};
const PROJECT_FOLLOW_UP_PROMPTS: Record<ProjectSlug, readonly string[]> = {
  gkx: [...PROJECT_QUICK_PROMPTS.gkx, "国科信有哪些可核对的成果？", "国科信的设计规范如何落地？"],
  "zhaocai-smart": [...PROJECT_QUICK_PROMPTS["zhaocai-smart"], "招财 Smart 为什么把回答保存到看板？", "招财 Smart 的回答规范解决什么问题？", "招财 Smart 中 AI 与研发如何分工？", "招财 Smart 有哪些可核对的成果？"],
  "tax-cloud": [...PROJECT_QUICK_PROMPTS["tax-cloud"], "税纪云有哪些公开成果？"],
  "energy-tax": [...PROJECT_QUICK_PROMPTS["energy-tax"], "国能报税平台有哪些公开成果？"],
  "data-visualisation": [...PROJECT_QUICK_PROMPTS["data-visualisation"], "可视化大屏有哪些公开成果？"],
};

/** Compare retrieved topics as well as wording, so paraphrases do not repeat an answered question. */
export function getChatFollowUpPrompts(context: ChatReplyContext, askedQuestions: readonly string[]): string[] {
  const safeContext = parseChatReplyContext(context) ?? { entryIds: [] };
  const answeredIds = new Set(safeContext.entryIds);
  let previousProject = safeContext.projectSlug;
  for (const question of askedQuestions) {
    const answer = buildLocalChatReply(question, [previousProject, question].filter(Boolean).join(" "));
    answer.context.entryIds.forEach(id => answeredIds.add(id));
    previousProject = answer.context.projectSlug;
  }
  const slug = safeContext.projectSlug as ProjectSlug | undefined;
  const candidates = slug
    ? [...PROJECT_FOLLOW_UP_PROMPTS[slug], "如何联系你聊聊这个项目？", "如何浏览这份作品集？"]
    : [...safeContext.entryIds.flatMap(id => TOPIC_FOLLOW_UP_PROMPTS[id] ?? []), ...GENERAL_FOLLOW_UP_PROMPTS];
  const prompts: string[] = [];
  for (const prompt of new Set(candidates)) {
    const candidate = buildLocalChatReply(prompt, [slug, prompt].filter(Boolean).join(" "));
    if (!candidate.entries.length || candidate.context.entryIds.every(id => answeredIds.has(id))) continue;
    prompts.push(prompt);
    candidate.context.entryIds.forEach(id => answeredIds.add(id));
    if (prompts.length === 2) break;
  }
  return prompts;
}
