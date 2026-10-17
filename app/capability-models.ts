import type { AbilityId } from "./portfolio-data";
import type { CapabilitySceneSpec } from "./capability-scene";

export const capabilitySceneDescriptions: Record<AbilityId, string> = {
  "ai-experience": "问题和条件围绕澄清中枢错落展开，再形成有依据、可反馈的结果。",
  "ai-workflow": "需求、原型和规范形成逐级向上的台阶，设计师的评审贯穿其中。",
  "complex-systems": "数据、权限和规则逐层承载，角色与流程在两侧保持清晰边界。",
  "interaction-design": "从发起到完成经过高耸的确认关口，任务路径和状态保持连续。",
  "design-system": "文字、规则、组件、栅格与状态构成分层陈列的立体规范。",
  "data-visualization": "不同高度的柱体与上升的趋势板，建立从对比到走势的阅读层次。",
};

/** Compact, vertically staggered sculptures for the centre exhibition column. */
export const capabilitySceneSpecs: Record<AbilityId, CapabilitySceneSpec> = {
  "ai-experience": {
    ring: true,
    horizontalFocus: { x: -8, z: 10 },
    boxes: [
      { x: -8, y: 14, z: 10, width: 132, height: 28, depth: 108 },
      { x: -8, y: 139, z: 10, width: 110, height: 222, depth: 86, label: "澄清", graphic: "lens", dark: true },
      { x: -8, y: 252, z: 10, width: 110, height: 4, depth: 86, material: "metal" },
      { x: -128, y: 196, z: -24, width: 88, height: 76, depth: 22, label: "问题", graphic: "lines", hover: 2 },
      { x: -128, y: 82, z: 22, width: 88, height: 78, depth: 22, label: "条件", graphic: "lines", hover: 1 },
      { x: 128, y: 228, z: -16, width: 102, height: 76, depth: 24, label: "依据", graphic: "lines", hover: 1.5 },
      { x: 128, y: 110, z: 32, width: 102, height: 80, depth: 24, label: "反馈", graphic: "dots", hover: 2 },
    ],
  },
  "ai-workflow": {
    boxes: [
      { x: -20, y: 9, z: 6, width: 330, height: 18, depth: 132, material: "metal" },
      { x: -124, y: 68, z: 26, width: 94, height: 100, depth: 72, label: "需求", graphic: "lines" },
      { x: -14, y: 94, z: 0, width: 94, height: 152, depth: 84, label: "原型", graphic: "prototype", hover: 1.5 },
      { x: 98, y: 125, z: -22, width: 100, height: 214, depth: 88, label: "规范", graphic: "grid" },
      { x: -55, y: 200, z: 56, width: 110, height: 4, depth: 26, material: "metal" },
      { x: -55, y: 232, z: 56, width: 110, height: 58, depth: 22, label: "评审", dark: true, hover: 2 },
    ],
  },
  "complex-systems": {
    boxes: [
      { x: 0, y: 26, z: 0, width: 364, height: 52, depth: 140, label: "数据" },
      { x: 0, y: 55, z: 0, width: 212, height: 6, depth: 132, material: "metal" },
      { x: 0, y: 94, z: 0, width: 216, height: 72, depth: 116, label: "权限" },
      { x: 0, y: 133, z: 0, width: 170, height: 6, depth: 98, material: "metal" },
      { x: 0, y: 190, z: 0, width: 112, height: 108, depth: 82, label: "规则", dark: true, hover: 2 },
      { x: 0, y: 256, z: 0, width: 126, height: 8, depth: 94, material: "glass", hover: 1 },
      { x: -146, y: 67, z: 28, width: 72, height: 30, depth: 56, material: "metal" },
      { x: -146, y: 133, z: 28, width: 72, height: 102, depth: 44, label: "角色", graphic: "dots", hover: 1 },
      { x: 146, y: 133, z: -16, width: 72, height: 162, depth: 44, label: "流程", graphic: "lines", hover: 1 },
    ],
  },
  "interaction-design": {
    boxes: [
      { x: 0, y: 10, z: 16, width: 350, height: 20, depth: 114 },
      { x: -132, y: 76, z: 42, width: 72, height: 112, depth: 54, label: "发起", graphic: "dots" },
      { x: 132, y: 96, z: 12, width: 72, height: 152, depth: 54, label: "完成", graphic: "dots" },
      { x: -48, y: 138, z: 10, width: 24, height: 236, depth: 52, dark: true },
      { x: 48, y: 138, z: 10, width: 24, height: 236, depth: 52, dark: true },
      { x: 0, y: 267, z: 10, width: 120, height: 22, depth: 52, dark: true },
      { x: 0, y: 280, z: 10, width: 120, height: 4, depth: 52, material: "metal" },
      { x: 0, y: 154, z: 40, width: 66, height: 84, depth: 20, label: "确认", hover: 2 },
      { x: 0, y: 212, z: 34, width: 66, height: 8, depth: 34, material: "glass", hover: 1 },
      { x: -82, y: 25, z: 46, width: 24, height: 10, depth: 18, dark: true, hover: 1 },
      { x: 82, y: 25, z: 30, width: 24, height: 10, depth: 18, material: "metal" },
    ],
  },
  "design-system": {
    grid: true,
    boxes: [
      { x: 0, y: 6, z: 2, width: 326, height: 12, depth: 164, material: "metal" },
      { x: -91, y: 69, z: -28, width: 12, height: 114, depth: 18, material: "metal" },
      { x: 85, y: 73, z: -54, width: 12, height: 122, depth: 18, material: "metal" },
      { x: -91, y: 202, z: -28, width: 104, height: 152, depth: 22, label: "文字", graphic: "type" },
      { x: 85, y: 206, z: -54, width: 104, height: 144, depth: 22, label: "栅格", graphic: "grid" },
      { x: 0, y: 145, z: -8, width: 26, height: 266, depth: 32, label: "规则", dark: true },
      { x: -112, y: 80, z: 58, width: 100, height: 136, depth: 24, label: "状态", graphic: "states", hover: 3 },
      { x: 78, y: 88, z: 38, width: 116, height: 152, depth: 24, label: "组件", graphic: "components" },
    ],
  },
  "data-visualization": {
    boxes: [
      { x: 0, y: 9, z: 0, width: 350, height: 18, depth: 142 },
      { x: -141, y: 60, z: 38, width: 32, height: 84, depth: 44 },
      { x: -95, y: 86, z: 38, width: 32, height: 136, depth: 44 },
      { x: -49, y: 127, z: 38, width: 32, height: 218, depth: 44, dark: true, hover: 2 },
      { x: -3, y: 72, z: 38, width: 32, height: 108, depth: 44 },
      { x: 43, y: 100, z: 38, width: 32, height: 164, depth: 44 },
      { x: 100, y: 50, z: -48, width: 14, height: 64, depth: 22, material: "metal" },
      { x: 100, y: 88, z: -48, width: 158, height: 12, depth: 38, material: "metal" },
      { x: 104, y: 192, z: -61, width: 166, height: 196, depth: 4, material: "glass" },
      { x: 100, y: 189, z: -48, width: 156, height: 190, depth: 18, label: "趋势", graphic: "trend", hover: 1 },
    ],
  },
};
