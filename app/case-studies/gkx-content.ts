/** 国科信案例内容。保留真实职责；未提供的数量和统计值不补造。 */
export type DiagramNode = {
  id: string;
  title: string;
  role: string;
  description: string;
  detail: string;
  column: number;
  row: number;
  span?: number;
};
export type DiagramEdge = { from: string; to: string; feedback?: boolean };
export type DiagramData = { id: string; label: string; nodes: DiagramNode[]; edges: DiagramEdge[] };

export const sections = [
  { id: "overview", label: "项目概览" },
  { id: "scope", label: "门户与范围" },
  { id: "decisions", label: "问题与决策" },
  { id: "system", label: "设计体系" },
  { id: "workflow", label: "AI 工作流程" },
  { id: "validation", label: "原型与评审" },
  { id: "collaboration", label: "应用与协作" },
  { id: "outcomes", label: "成效与复用" },
] as const;
export type SectionId = (typeof sections)[number]["id"];

export const questions = [
  {
    id: "consistency", question: "多系统如何保持一致？",
    insight: "页面具有共性，业务流程又各有差异。",
    decision: "共享设计规范，保留业务补充。",
    validation: "同类组件与页面对照", target: "system",
    options: [
      { title: "各系统独立定义", note: "适配灵活，共性规则容易分散。" },
      { title: "全部采用固定模板", note: "统一程度高，业务差异的表达受限。" },
      { title: "共用规范 + 业务补充", note: "统一视觉与组件，明确差异的适用范围。", selected: true },
    ],
  },
  {
    id: "documentation", question: "规范如何更高效地产出？",
    insight: "既定标准需要被完整、清晰地转化为文档。",
    decision: "结构化输入，AI 编写，人工校准。",
    validation: "材料、初稿与修订对照", target: "workflow",
    options: [
      { title: "逐页手工整理", note: "控制直接，重复编写投入较多。" },
      { title: "直接采用生成结果", note: "初稿产出快，正确性与边界仍需核对。" },
      { title: "结构化输入 + 校准", note: "复用文档结构，将精力集中到设计判断。", selected: true },
    ],
  },
  {
    id: "review", question: "原型如何更充分地进入评审？",
    insight: "样式、交互状态和反馈都需要有明确检查依据。",
    decision: "将规范条款对应到原型行为。",
    validation: "原型版本、意见与结果", target: "validation",
    options: [
      { title: "评审时集中发现", note: "意见集中，部分问题出现得较晚。" },
      { title: "主要核对视觉", note: "样式有依据，流程与异常状态仍需补充。" },
      { title: "按规则验证行为", note: "将视觉、状态与任务流程一起检查。", selected: true },
    ],
  },
] as const;

export const layers = [
  { name: "视觉基础", items: "颜色 / 字体 / 间距 / 信息层级", purpose: "建立共同的视觉语言" },
  { name: "通用组件", items: "样式 / 状态 / 尺寸 / 使用边界", purpose: "形成稳定的页面元素" },
  { name: "页面模式", items: "列表 / 表单 / 详情 / 操作反馈", purpose: "复用常见任务的组织方式" },
  { name: "业务补充", items: "字段 / 流程 / 差异 / 例外说明", purpose: "适配各系统的业务需要" },
];

export const workflow: DiagramData = {
  id: "workflow", label: "设计标准、AI 文档编写与评审反馈的关系",
  nodes: [
    { id: "input", title: "定义输入", role: "设计师", description: "业务场景 · 样式标准", detail: "筛选业务材料，明确需要编写的规范范围、既定样式与适用条件。", column: 1, row: 1 },
    { id: "draft", title: "编写设计 MD", role: "AI 辅助", description: "组织结构 · 形成初稿", detail: "依据已确定的标准组织文档，完成重复性的整理和编写。", column: 2, row: 1 },
    { id: "calibrate", title: "校准与补充", role: "设计师", description: "核对规则 · 补充状态", detail: "检查条款是否准确，补充适用边界、组件状态和容易遗漏的情况。", column: 3, row: 1 },
    { id: "apply", title: "原型应用", role: "设计工作", description: "页面 · 状态 · 操作", detail: "将规则关联到页面与操作行为，检查原型是否落实已确定的标准。", column: 3, row: 2 },
    { id: "review", title: "评审与验证", role: "质量检查", description: "意见 · 修订 · 结果", detail: "结合评审意见定位问题，记录原型调整及后续通过情况。", column: 2, row: 2 },
    { id: "update", title: "规则更新", role: "规范维护", description: "反馈回写 · 持续复用", detail: "将共性问题回写规范，区分通用规则更新与单个业务的补充。", column: 1, row: 2 },
  ],
  edges: [
    { from: "input", to: "draft" }, { from: "draft", to: "calibrate" },
    { from: "calibrate", to: "apply" }, { from: "apply", to: "review" },
    { from: "review", to: "update", feedback: true }, { from: "update", to: "input", feedback: true },
    { from: "calibrate", to: "draft", feedback: true },
  ],
};

export const collaboration: DiagramData = {
  id: "collaboration", label: "业务输入、共享设计规范和交付应用的关系",
  nodes: [
    { id: "business", title: "业务输入", role: "需求上下文", description: "页面 · 场景 · 约束", detail: "业务范围决定本次设计需要覆盖的页面、状态与特殊规则。", column: 1, row: 1 },
    { id: "designer", title: "规则制定", role: "设计师", description: "样式 · 组件 · 边界", detail: "明确视觉标准、组件使用规则和页面规范，维护设计质量。", column: 1, row: 2 },
    { id: "shared", title: "共享设计 MD", role: "共同依据", description: "规则 · 示例 · 版本", detail: "用同一套文档连接设计标准、具体页面和使用说明。", column: 2, row: 1, span: 2 },
    { id: "prototype", title: "原型应用", role: "设计执行", description: "复用 · 适配 · 检查", detail: "复用共性规则，单独说明不同业务场景中的适配方式。", column: 3, row: 1 },
    { id: "handoff", title: "交付参照", role: "协作对齐", description: "界面 · 条款 · 检查项", detail: "让界面表现和规则说明相互对应，为沟通与交付提供共同参照。", column: 3, row: 2 },
    { id: "feedback", title: "评审反馈", role: "持续修订", description: "原因 · 改动 · 范围", detail: "将反馈定位到具体页面与条款，明确本次修改影响哪些系统和组件。", column: 2, row: 3 },
  ],
  edges: [
    { from: "business", to: "shared" }, { from: "designer", to: "shared" },
    { from: "shared", to: "prototype" }, { from: "shared", to: "handoff" },
    { from: "prototype", to: "feedback" }, { from: "handoff", to: "feedback" },
    { from: "feedback", to: "shared", feedback: true },
  ],
};

export const value: DiagramData = {
  id: "value", label: "设计资产、复用机制和项目成效的对应关系",
  nodes: [
    { id: "spec", title: "设计规范与 MD", role: "设计资产", description: "规则 · 状态 · 使用说明", detail: "文档将设计判断保存为明确规则，支持后续查阅与更新。", column: 1, row: 1 },
    { id: "patterns", title: "组件与页面模式", role: "设计资产", description: "共性结构 · 业务补充", detail: "提取跨系统的共性表达，减少相似场景中的重复定义。", column: 1, row: 2 },
    { id: "reviews", title: "原型与评审记录", role: "过程资产", description: "版本 · 意见 · 结果", detail: "把问题、修改与后续结果连起来，支持复盘设计决策。", column: 1, row: 3 },
    { id: "mechanism", title: "复用与校准", role: "作用机制", description: "统一输入 · 按规则检查", detail: "通过复用既定规则与文档结构，减少重复整理，并将问题提前到设计检查环节。", column: 2, row: 2 },
    { id: "efficiency", title: "设计效率", role: "项目成效", description: "减少重复编写与整理", detail: "AI 辅助规范编写，把更多精力留给规则制定、设计判断和质量校准。", column: 3, row: 1 },
    { id: "approval", title: "原型通过率", role: "项目成效", description: "更充分的评审准备", detail: "将规范与原型检查结合，支撑原型通过率改善；具体幅度由实际评审记录补充。", column: 3, row: 2 },
    { id: "reuse", title: "可复用设计资产", role: "持续价值", description: "服务门户内多系统", detail: "形成可继续维护的样式规范与设计 MD，为不同系统的设计提供共同依据。", column: 3, row: 3 },
  ],
  edges: [
    { from: "spec", to: "mechanism" }, { from: "patterns", to: "mechanism" }, { from: "reviews", to: "mechanism" },
    { from: "mechanism", to: "efficiency" }, { from: "mechanism", to: "approval" }, { from: "mechanism", to: "reuse" },
  ],
};

/** 可操作的规范表达样例；拿到真实设计 MD 后替换下列正文。 */
export const mdExamples = {
  input: { label: "输入材料", text: "# 设计输入\n\n## 页面场景\n业务表单：填写、校验、提交。\n\n## 既定标准\n- 主操作样式与位置\n- 字段标签、布局与间距\n- 错误与成功反馈的文字层级\n\n## 编写范围\n整理提交规则，明确适用条件与状态。" },
  draft: { label: "AI 初稿", text: "# 表单提交规范\n\n1. 使用统一的主操作样式。\n2. 用户填写信息后点击提交。\n3. 提交成功后展示反馈。" },
  calibrate: { label: "人工修订", text: "# 表单提交规范\n\n1. 使用统一的主操作样式。\n2. 提交前校验必填字段。\n3. 错误信息定位到对应字段。\n4. 请求中展示加载状态，阻止重复提交。\n5. 失败时保留输入并允许重试。\n6. 提交成功后显示明确反馈。\n\n## 检查项\n空值 / 提交中 / 失败重试 / 成功反馈" },
} as const;

export const measurementMethods = [
  { title: "设计效率", detail: "对比同类规范编写、校对与修订的总投入时间，注明任务范围。" },
  { title: "原型通过率", detail: "明确按原型方案、页面还是评审批次统计，保留送审、通过数量与时间范围。" },
  { title: "规范复用", detail: "记录实际使用规范的系统、页面与组件，区分可复用资产和已发生的复用。" },
];
