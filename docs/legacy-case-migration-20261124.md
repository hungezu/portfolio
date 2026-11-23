# 三个旧案例的正文与素材迁移

## 集成

从 `app/case-studies/LegacyProjectCase.tsx` 导入具名 `LegacyProjectCase`，调用 `<LegacyProjectCase project={project} />`。支持原 slug `tax-cloud`、`energy-tax`、`data-visualisation`；也导出 `isLegacyProjectSlug(slug)`。

组件只包含正文、章节定位和原尺寸查看器；H1 与 `#project-overview` 沿用共享 ProjectPage 顶部。双语正文在 `legacy-case-content.ts`，不追加共享 i18n。引用的图内仍是历史中文 UI，但所有解释、任务与边界均有可读英文，不以 alt 替代正文。

旧 `case-gallery-N` 保留为别名，覆盖税纪云 0–18、国能 0–6、大屏 0–4，包括能力与助手入口。三个旧案例的 `project.gallery` 已清空，页面只加载本表列出的裁片。

## 安全裁片（均物理裁切，不是SVG引用整张源图）

新公开目录：`assets/projects/legacy-evidence-20261124/`。

| 新文件 | 内部原稿 | ROI x,y,w,h | 保留内容 |
|---|---|---|---|
| tax-card-selection.webp | tax-cloud/07-redesign-custom-card.png | 108,600,713,386 | 选卡、取消、保存；排除原页眉、背景公司名与金额 |
| tax-card-layout.webp | 同上 | 944,657,800,341 | 拖动布局窗口；排除背景任务卡公司名 |
| tax-filter-states.webp | tax-cloud/12-form-page.png | 680,390,340,65 | 两个筛选状态；排除KANO表述、错误发票数字及账户 |
| tax-approval-actions.webp | tax-cloud/17-app-report-approval.png | 192,776,390,48 | 返回、批准；排除公司信息与日期 |
| tax-mobile-submit-boundary.webp | 同上 | 715,506,390,91 | 不可用提交按钮及PC提示；排除稿面错字与日期 |
| energy-task-summary.webp | energy-tax/04-tax-filing-workstation.png | 103,375,506,87 | 原稿示例1024=899+125；未改写数字，正文标为示例 |
| energy-grid.webp | energy-tax/06-grid-specification.png | 134,404,1660,650 | 尺寸与正确计算；排除原稿中“列宽随内容变化”的表述 |

生成脚本 `scripts/generate-legacy-safe-evidence.mjs` 读取私有归档的原稿，以无损 WebP 保存所选像素。七张图均经目检。常规构建直接使用已生成的裁片。

## 已退出站点的静态路径

移出了原先正文引用的 31 张 PNG、同名 WebP、早期版本和网页衍生文件。

- `assets/projects/tax-cloud/`：19张PNG + 19张WebP；特别是03全局样式/04组件、12表单、10新首页、09卡片场景、02精益画布、11走查、07自定义卡片。
- `assets/projects/energy-tax/`：包含新7张长图及旧版单页；首页/综合管理含未核对指标与比例，申报页含状态/日期疑点；基础组件页不宜作为“全套自研”的证明。
- `assets/projects/data-visualisation/`：5张PNG + 5张WebP；各业务屏存在数字/比例待核问题，规范页有旧客户名称与遮挡。
- `assets/optimized/projects/tax-cloud/`（本次枚举57个文件）、`energy-tax/`（48个）、`data-visualisation/`（15个），及manifest对应项。
- 旧合并板：`assets/projects/portfolio-images/06-energy-overview-system.png`、`07-energy-key-screens.png`、`08-data-visualisation.png`，以及它们的optimized衍生物。未逐像素复核，不应默认安全。
- GitHub Pages 发布目录同步重建。

首页使用 `assets/projects/covers/` 的独立封面。此前的 Git 历史和外部缓存需单独处理。

## 未核实，不新增为成果

- 未找到可完整公开的多级税表展开、汇总、错误校验原稿；本次不补画、不写已验证。
- 未核实访谈样本、上线增长、走查总数/P0全修复、原图各项业务数值的来源与统计口径。
- 没有根据旧图的箭头/按钮推断批量申报确认、部分失败、状态流转和后台实现已经完成。
- 旧图错误或可能未授权姓名一律通过不公开整板、仅复用已检查安全局部处理。真实数据不能为凑比例重写；大屏没有生成替代业务数据。
- 新大屏页明确降为次要布局与显示尺寸笔记；其中布局框架和3×2拼接是可读的结构示意，不冒充历史现场或原始数据图表。

## 验证

已检查裁切范围、原图尺寸、七张裁片像素一致性及双语正文。全站构建与类型检查通过。
