export type LegacyProjectSlug = "tax-cloud" | "energy-tax" | "data-visualisation";
export type LegacyText = readonly [string, string];
export type LegacyEvidence = { id: string; width: number; height: number; title: LegacyText; alt: LegacyText };
export type LegacySection = {
  id: string; aliases: number[]; label: LegacyText; title: LegacyText; paragraphs: LegacyText[];
  points?: Array<{ title: LegacyText; text: LegacyText }>;
  evidence?: LegacyEvidence[];
  diagram?: "workspace" | "grid" | "dashboard" | "panels";
};
export type LegacyCase = { sections: LegacySection[]; materialNote: LegacyText };

export const legacyCases: Record<LegacyProjectSlug, LegacyCase> = {
  "tax-cloud": {
    sections: [
      { id: "legacy-tax-scope", aliases: [0, 1, 2], label: ["任务与范围", "Tasks and scope"], title: ["围绕工作台、表单与移动审批展开改版", "A redesign across workspaces, forms and mobile approvals"], paragraphs: [
        ["税纪云 2.0 的 Web 与 App 承载不同深度的财税任务。我主导界面与交互改版，将工作台配置、复杂表单和移动端审批分开处理；规范为这些任务提供共同的操作语言。", "Tax Cloud 2.0 supports tax tasks of different complexity across web and mobile. I led the interface and interaction redesign, treating workspace configuration, dense forms and mobile approvals as distinct tasks with shared interaction conventions."],
        ["以下按工作台配置、检索条件和移动端能力边界，依次说明具体设计。原稿局部可以放大，便于核对操作与状态。", "The case follows workspace configuration, query conditions and mobile capability boundaries. Original design details can be enlarged to inspect their actions and states."],
      ] },
      { id: "legacy-tax-workspace", aliases: [7, 8, 9, 10], label: ["工作台配置", "Workspace configuration"], title: ["按集团与单企业组织卡片，让工作台可以配置", "Configure the workspace for group and individual-company tasks"], paragraphs: [
        ["原稿提供集团与单企业两类卡片库。集团场景包含跨企业概览，单企业场景更贴近当前公司的任务、税种和办税日历；组织范围与用户角色是两条不同的配置维度。", "The designs provide separate card libraries for group and individual-company contexts. Group views include cross-company overviews; company views focus on current tasks, tax types and calendars. Organizational scope and user role are separate dimensions."],
        ["用户先选择需要的卡片，再调整卡片位置。原稿为一屏布局设置了范围限制：配置能力提供灵活性，同时需要控制首页的信息密度。", "Users select the cards they need and then arrange them. The design limits the configuration to one screen: flexibility must be balanced against workspace density."],
      ], diagram: "workspace", evidence: [
        { id: "tax-card-selection", width: 713, height: 386, title: ["选择卡片", "Select cards"], alt: ["原设计稿的选择卡片局部，显示模块名称、勾选状态以及取消和保存操作；没有业务金额或客户名称。", "Original card-selection detail with module names, selection states, cancel and save actions; business amounts and client identities are excluded."] },
        { id: "tax-card-layout", width: 800, height: 341, title: ["调整布局", "Arrange the layout"], alt: ["原设计稿的卡片布局窗口，包含模块拖动把手、选中模块及保存操作。", "Original card-layout dialog with drag handles, a selected module and save actions."] },
      ] },
      { id: "legacy-tax-forms", aliases: [3, 4, 5, 6, 11, 12, 13], label: ["表单与筛选", "Forms and filters"], title: ["收起筛选条件时，仍然保留条件已生效的线索", "Keep active filters visible even when their controls are collapsed"], paragraphs: [
        ["高密度表单既要容纳检索条件，也要留出核对记录的空间。我将筛选收进可展开入口，并用标记区分“没有条件”和“条件已生效”，避免收起面板后失去当前筛选的线索。", "Dense forms need space for both query conditions and record checking. I placed filters behind an expandable entry and used an indicator to distinguish an unfiltered view from an active filter after the panel is collapsed."],
        ["表头配置处理另一类需要：显示哪些字段、怎样排序和固定。它与筛选分开，分别调整“看哪些记录”和“用哪些字段核对记录”。", "Column configuration addresses a separate need: which fields appear, in what order and which stay fixed. Filters choose records; column settings choose the fields used to inspect them."],
      ], evidence: [
        { id: "tax-filter-states", width: 340, height: 65, title: ["无条件与条件生效状态", "Unfiltered and active-filter states"], alt: ["两个原稿筛选入口，右侧入口带有条件生效标记。", "Two original filter controls; the right-hand control includes an active-filter indicator."] },
      ] },
      { id: "legacy-tax-mobile", aliases: [14, 15, 16, 17, 18], label: ["移动端边界", "Mobile scope"], title: ["移动端承接审批与查阅，复杂提交留在 PC", "Support approvals and reading on mobile; retain complex submission on desktop"], paragraphs: [
        ["移动端原稿把税种、审批状态和相应动作组织在任务卡中。当前稿保留返回、批准等操作，同时对提交入口说明需要登录 PC；跨端设计包含能力边界，而非把所有桌面操作搬到手机。", "The mobile design groups tax type, approval status and actions in task cards. It retains actions such as return and approve while explicitly requiring a desktop session for submission. Cross-device design includes capability boundaries."],
        ["法规查阅则区分三类检索线索：有明确目标时按标题或文号搜索，有大致方向时结合分类，无明确目标时浏览最新法规与热门问答。这是任务路径的划分，不等于已经测得搜索效率提升。", "Regulation lookup supports three kinds of intent: search by title or reference when the target is known, combine categories with a broad query, or browse recent regulations and popular questions. These paths are not a measured claim of improved search performance."],
      ], evidence: [
        { id: "tax-approval-actions", width: 390, height: 48, title: ["审批动作", "Approval actions"], alt: ["移动端设计稿中的返回与批准按钮局部。", "Original mobile return and approve controls."] },
        { id: "tax-mobile-submit-boundary", width: 390, height: 91, title: ["PC 提交边界", "Desktop submission boundary"], alt: ["原稿提交按钮处于不可用状态，下方提示需要登录PC端进行提交操作。", "The original submit control is unavailable and explicitly instructs the user to submit from a desktop session."] },
      ] },
    ],
    materialNote: ["材料范围：保留可追溯的原稿局部，正文为双语重述；未将旧稿中的演示金额、走查分级或未核实的修复状态改写成项目成效。", "Material scope: traceable design details with a bilingual narrative. Sample amounts, inspection priorities and unverified repair status are not presented as project outcomes."],
  },
  "energy-tax": {
    sections: [
      { id: "legacy-energy-scope", aliases: [0, 1], label: ["范围与取舍", "Scope and trade-off"], title: ["延续既有业务习惯，再重整工作台的信息层级", "Preserve familiar business operations while clarifying the workspace"], paragraphs: [
        ["这个定制报税平台由我独立负责从 0 到 1 的 UI 设计，覆盖首页、纳税申报与综合管理工作台。既有税种、组织与任务关系构成业务基础，视觉规范需要服务于这些操作，而不是替换用户已经熟悉的业务逻辑。", "I independently designed the UI for this custom tax platform from the ground up, covering its home, filing and management workspaces. Existing tax categories, organizations and tasks form the business structure; visual standards must support familiar operations."],
        ["取舍在于：统一页面层级和视觉秩序，同时保留税务人员识别对象、定位任务和继续处理的入口。公开案例只展示能够核对的界面与尺寸依据。", "The trade-off is to establish a consistent visual hierarchy while retaining the entry points tax staff use to identify objects, locate work and continue a task. This case shows the interface and sizing evidence available for inspection."],
      ] },
      { id: "legacy-energy-workspace", aliases: [3, 4], label: ["任务与概览", "Tasks and overview"], title: ["概览说明任务量，操作区承接具体申报", "Use the overview for workload and the task area for filing"], paragraphs: [
        ["纳税申报工作台将概览与操作区分开。任务总量、已完成和待完成用于快速了解工作量；筛选、任务列表和后续操作留在业务区域，避免将概览指标误当成操作本身。", "The filing workspace separates its overview from the task area. Total, completed and remaining work summarize the workload; filters, task rows and next actions remain in the business area. An overview should not replace the operational workflow."],
        ["下图保留原稿中关系一致的任务概览局部。数字是历史设计稿的示例值，说明三个指标的分组方式，不代表真实申报量或设计带来的增长。", "The detail below retains a consistent group of workload indicators from the original design. Its numbers are sample values used to show grouping, not real filing volume or a design outcome."],
      ], evidence: [
        { id: "energy-task-summary", width: 506, height: 87, title: ["任务概览原稿局部", "Original workload overview"], alt: ["历史设计稿中任务总数1024、已完成899、待完成125的三张概览卡，数字为原图示例值。", "Three original sample workload cards: total 1024, completed 899 and remaining 125; these are demonstration values from the design."] },
      ] },
      { id: "legacy-energy-grid", aliases: [2], label: ["栅格与尺寸", "Grid and sizing"], title: ["固定导航与侧栏，把内容空间作为明确约束", "Make content space an explicit layout constraint"], paragraphs: [
        ["原稿以 1920px 为设计基准，顶部导航高 56px，侧栏默认宽 252px，内容两侧各留 16px；可用内容宽度为 1636px。采用 24 栅格组织页面，列宽随容器宽度调整。", "The design uses a 1920 px baseline, a 56 px top navigation, a 252 px default sidebar and 16 px content margins on both sides, leaving 1636 px of content width. A 24-column grid organizes the page, with columns responding to the container."],
        ["这些尺寸明确了界面之间的共同关系。它们不是所有设备都应照搬的固定像素值；需要结合客户显示器、浏览器缩放和实际可视区域继续检查。", "These dimensions establish relationships shared across screens. They are not fixed pixel values to impose on every device; the actual display, browser zoom and available viewport still matter."],
      ], diagram: "grid", evidence: [
        { id: "energy-grid", width: 1660, height: 650, title: ["原稿的栅格尺寸", "Grid dimensions in the original design"], alt: ["原稿栅格局部，包含56像素顶部、252像素侧栏、16像素间距和1636像素可用内容宽度的计算。", "Original grid detail showing the 56 px top area, 252 px sidebar, 16 px spacing and the calculation for 1636 px of available content."] },
      ] },
      { id: "legacy-energy-reflection", aliases: [5, 6], label: ["设备与交付", "Devices and handoff"], title: ["把实际设备条件纳入交付检查", "Include real device conditions in handoff checks"], paragraphs: [
        ["这次独立项目让我把两个检查前移：设计前确认业务对象和操作习惯，交付前检查不同设备条件下的显示。展示稿的比例正确，并不自动说明真实工作台可读、操作可达。", "This independent project reinforced two checks: understand business objects and familiar operations before designing, and inspect the interface under real device conditions before handoff. A correctly proportioned presentation does not prove that the working UI is readable and operable."],
        ["复用的重点是页面之间稳定的空间关系、组件使用方式与状态表达。面对新的业务页面，我会先检查这些共同约束，再处理具体字段与任务的差异。", "Reuse depends on stable spatial relationships, component use and state communication across pages. For a new business screen, I first check these shared constraints and then address its specific fields and tasks."],
      ] },
    ],
    materialNote: ["材料范围：以上说明 UI 设计与版式依据。申报确认、部分失败、状态流转及多级税表的完整过程，需要对应原始材料后才能展开；未声明上线效果或项目验收。", "Material scope: UI and layout evidence. Filing confirmations, partial failures, state transitions and the complete multilevel tax-table flow require their original material before they can be documented. No production outcome or acceptance claim is made."],
  },
  "data-visualisation": {
    sections: [
      { id: "legacy-visual-layout", aliases: [0, 1, 2, 3], label: ["布局与阅读顺序", "Layout and reading order"], title: ["布局与视觉设计补充：先确定阅读顺序", "Supplementary visual work: establish the reading order"], paragraphs: [
        ["这组工作作为布局与视觉设计的补充材料。原稿组合了概览指标、地图、趋势与排行；这里保留信息分区的思考，不用未经核对的业务金额和比例证明图表质量。", "This collection supports the portfolio as supplementary layout and visual work. The designs combine headline indicators, maps, trends and rankings. This page discusses their organization rather than using unchecked business amounts or ratios as evidence of chart quality."],
        ["空间信息参与判断时，可以让地图承担主区域；如果任务是比较变化或识别异常，应优先给趋势、排序与明细足够的空间。布局选择应能说明读者先看什么，再看什么。", "A map can occupy the main area when spatial information is part of the decision. When the task is comparison or anomaly detection, trends, rankings and detail need sufficient space. A layout should explain what the reader sees first and next."],
      ], diagram: "dashboard" },
      { id: "legacy-visual-display", aliases: [4], label: ["显示条件", "Display conditions"], title: ["先确认拼接方式，再确定画布与文字密度", "Confirm the display configuration before setting canvas size and density"], paragraphs: [
        ["大屏设计需要先确认使用位置、阅读距离、单屏分辨率与拼接方式。例如 3 列 × 2 行的 1920 × 1080 显示器，组合画布为 5760 × 2160。这里是尺寸计算示意，并非现场部署照片。", "Large-screen design starts with placement, reading distance, individual-panel resolution and the panel arrangement. For example, a 3-by-2 array of 1920-by-1080 panels produces a 5760-by-2160 canvas. The illustration is a sizing calculation, not a deployment photograph."],
        ["画布变大并不意味着可以增加同样比例的信息。需要在目标设备上检查标题、图例、关键数值、边缘安全区与拼缝，保持主次关系。", "A larger canvas does not justify a proportional increase in information. Titles, legends, key values, edge safety and panel seams should be checked on the intended display while preserving the information hierarchy."],
      ], diagram: "panels" },
      { id: "legacy-visual-data", aliases: [], label: ["数据边界", "Data scope"], title: ["数据先核对口径，视觉再解释差异", "Verify the data definitions before explaining differences visually"], paragraphs: [
        ["金额、单位、统计周期、分类范围与比例必须能相互对应。遇到数字与比例不一致时，应回到原始数据和指标定义核查；真实数据不能为了凑比例而重写。", "Amounts, units, periods, category scope and ratios must agree. A mismatch should be checked against the source data and metric definitions. Real values must never be rewritten merely to make a ratio fit."],
        ["当前版本不再展示存在一致性疑问的旧业务图表，也没有新造一套替代数据。布局示意不包含业务数值；完整图表案例需要补齐来源、口径和目标场景后再展开。", "This version omits the historical business charts with unresolved consistency questions and does not invent replacement data. The layout illustration contains no business values; a detailed chart case needs its sources, definitions and intended viewing scenario."],
      ] },
    ],
    materialNote: ["本页定位：次要作品与设计笔记。展示布局判断和显示尺寸，不将示意结构视为真实数据分析、现场使用或成效验证。", "Page scope: supplementary work and design notes. It explains layout choices and display sizing, without treating the illustrations as real-data analysis, field use or validated outcomes."],
  },
};
