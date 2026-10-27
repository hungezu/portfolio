import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right.mjs";
import { useI18n } from "../i18n";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { publicAsset } from "../portfolio-data";
import "./zhaocai-design-evidence.css";

type EvidenceFigureProps = {
  source: string;
  alt: string;
};

function EvidenceFigure({ source, alt }: EvidenceFigureProps) {
  const { t } = useI18n();
  return (
    <figure className="zc4-design-evidence-figure">
      <a className="zc4-design-evidence-window" href={publicAsset(source)} target="_blank" rel="noopener noreferrer" aria-label={t("在新标签页放大查看完整原始设计稿")}>
        <img
          src={publicAsset(source)}
          width="1920"
          height="1080"
          loading="lazy"
          decoding="async"
          alt={t(alt)}
        />
      </a>
      <figcaption>
        <span>{t("原始设计稿 · 完整展示")}</span>
        <a href={publicAsset(source)} target="_blank" rel="noopener noreferrer">
          {t("放大查看原稿")}<ArrowUpRight aria-hidden="true" size={15} />
          <span className="zc4-design-evidence-sr-only">{t("（新标签页）")}</span>
        </a>
        <p className="zc4-design-evidence-data-note">{t("原稿与交互演示使用不同业务任务与示例数据。")}</p>
      </figcaption>
    </figure>
  );
}

export function ZhaocaiBoardEvidence() {
  const { t } = useI18n();
  return (
    <article className="zc4-design-evidence">
      <EvidenceFigure
        source="/assets/projects/zhaocai-smart/15-board-interaction.png"
        alt={t("招财看板交互原始设计稿：合集归组、拖放重排、卡片位置反馈与合并确认规则。")}
      />
      <div className="zc4-design-evidence-copy">
        <h3>{t("从单次结果，转向持续看板")}</h3>
        <p>{t("一次分析形成卡片，相关卡片组成合集，让同一业务主题可以持续查看与整理。")}</p>
        <dl>
          <div><dt>{t("长期保留")}</dt><dd>{t("将有用的分析保存到看板，继续查看同一主题。")}</dd></div>
          <div><dt>{t("拖放重排")}</dt><dd>{t("移动时展示位置预览，让落点和排列变化可见。")}</dd></div>
          <div><dt>{t("合并确认")}</dt><dd>{t("松手后确认目标合集，再完成信息归组。")}</dd></div>
        </dl>
        <p className="zc4-design-evidence-material-note">{t("拖放细节见历史原稿；页面演示通过排序与合并操作呈现状态。")}</p>
      </div>
    </article>
  );
}

export function ZhaocaiAnswerEvidence() {
  const { t } = useI18n();
  return (
    <article className="zc4-design-evidence is-reversed">
      <EvidenceFigure
        source="/assets/projects/zhaocai-smart/16-markdown-specification.png"
        alt={t("招财 Markdown 规范原始设计稿：标题、列表、引用、段落、公式和代码的分类总览，以及完整表格与排版标注。")}
      />
      <div className="zc4-design-evidence-copy">
        <h3>{t("把输出类型，变成阅读规则")}</h3>
        <p>{t("标题帮助定位结论，表格支持逐项比较，引用保留核对路径。规范把这些阅读任务对应到字号、层级、间距与组件表达。")}</p>
        <ul className="zc4-design-evidence-categories" aria-label={t("历史回答规范覆盖的内容类型")}>
          {["标题与正文", "列表与表格", "参考引用", "段落", "公式", "代码"].map((category) => <li key={category}>{t(category)}</li>)}
        </ul>
        <p className="zc4-design-evidence-material-note">{t("完整原稿保留分类总览、界面示例和排版标注，供设计与研发核对。")}</p>
      </div>
    </article>
  );
}

const alternativePaths = [
  {
    id: "open",
    label: "开放追问",
    retained: "原问题、2024 年与全集团继续保留。",
    supplement: "用户用自己的语言说明“利润”的业务含义。",
    gate: "补充内容能对应到明确的业务指标后，再执行查询。",
    cost: "表达自由，但用户需要组织语言，补充后仍可能留下歧义。",
  },
  {
    id: "filters",
    label: "固定筛选器",
    retained: "原问题保留在上方，期间与组织转换为可核对的字段。",
    supplement: "在固定字段中选择指标，并确认期间和组织。",
    gate: "必填字段齐全，指标与统计范围相容后，再执行查询。",
    cost: "标准任务结构明确，临时需求需要在问题与字段之间转换。",
  },
  {
    id: "candidates",
    label: "候选确认",
    retained: "2024 年与全集团沿用，只确认有歧义的指标。",
    supplement: "选择一种合法口径；都不符合时继续补充说明。",
    gate: "用户确认口径且条件齐全后，再执行查询。",
    cost: "增加一次选择；候选不足时可能诱导误选，需要保留开放补充。",
  },
] as const;

type AlternativeId = typeof alternativePaths[number]["id"];

/** Present-day design comparisons; the previews intentionally have no controls. */
export function ZhaocaiAlternativeComparison() {
  const { t } = useI18n();
  const panelId = `zcs-alternatives-${useId().replace(/:/g, "")}`;
  const [activeId, setActiveId] = useState<AlternativeId>("candidates");
  const choicesRef = useRef<HTMLDivElement>(null);
  const active = alternativePaths.find(path => path.id === activeId)!;

  const moveChoice = (event: KeyboardEvent<HTMLButtonElement>, focusedId: AlternativeId) => {
    const current = alternativePaths.findIndex(path => path.id === focusedId);
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % alternativePaths.length;
    else if (event.key === "ArrowLeft") next = (current + alternativePaths.length - 1) % alternativePaths.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = alternativePaths.length - 1;
    else return;
    event.preventDefault();
    setActiveId(alternativePaths[next].id);
    choicesRef.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
  };

  return <div className="zc4-alternative-comparison">
    <div className="zc4-alternative-choices" ref={choicesRef} role="group" aria-label={t("切换同题方案对照")}>
      {alternativePaths.map(path => <button type="button" key={path.id} aria-pressed={activeId === path.id} aria-controls={panelId} onClick={() => setActiveId(path.id)} onKeyDown={event => moveChoice(event, path.id)}>{t(path.label)}</button>)}
    </div>
    <figure className="zc4-alternative-figure" id={panelId} aria-label={t(`${active.label}方案示意与采用条件`)}>
      <div className="zc4-alternative-preview">
        <p className="zc4-alternative-question">{t("查看 2024 年全集团利润变化")}</p>
        <div className="zc4-alternative-response">
          {t(activeId === "open" ? <>
            <h4>{t("“利润”具体指什么？")}</h4>
            <p>{t("请补充这次查询的业务口径，时间与组织继续沿用。")}</p>
            <dl className="zc4-alternative-known"><div><dt>{t("期间")}</dt><dd>{t("2024 年")}</dd></div><div><dt>{t("组织")}</dt><dd>{t("全集团")}</dd></div></dl>
            <div className="zc4-alternative-writing"><span>{t("待补充的业务说明")}</span><p>{t("例如：查看归属于本次统计范围的净利润。")}</p></div>
          </> : activeId === "filters" ? <>
            <h4>{t("核对查询条件")}</h4>
            <dl className="zc4-alternative-fields"><div><dt>{t("统计期间")}</dt><dd>{t("2024 年")}</dd></div><div><dt>{t("组织范围")}</dt><dd>{t("全集团")}</dd></div><div><dt>{t("指标口径")}</dt><dd className="is-pending">{t("待选择")}</dd></div></dl>
            <p className="zc4-alternative-preview-note">{t("指标、期间与组织齐全后执行查询。")}</p>
          </> : <>
            <h4>{t("你想查看哪一种利润？")}</h4>
            <p>{t("已保留 2024 年与全集团，只需确认指标。")}</p>
            <ul className="zc4-alternative-candidates" aria-label={t("候选口径示意")}><li>{t("营业利润")}</li><li>{t("利润总额")}</li><li className="is-selected"><strong>{t("净利润")}</strong><span>{t("当前示例选择")}</span></li></ul>
            <p className="zc4-alternative-preview-note">{t("都不符合时，继续补充说明。")}</p>
          </>)}
        </div>
      </div>
      <dl className="zc4-alternative-facts"><div><dt>{t("保留条件")}</dt><dd>{t(active.retained)}</dd></div><div><dt>{t("需要补充")}</dt><dd>{t(active.supplement)}</dd></div><div><dt>{t("执行门槛")}</dt><dd>{t(active.gate)}</dd></div><div><dt>{t("代价")}</dt><dd>{t(active.cost)}</dd></div></dl>
      <figcaption>{t("当前方案推演 · 围绕同一任务补做的只读界面对照，用于说明适用条件与取舍。")}</figcaption>
    </figure>
  </div>;
}

const ruleChecks = [
  {
    title: "季度明细与全年合计一致",
    input: "2024 年集团净利润表现如何？",
    verdict: "全年合计为 6.08 亿元，结论、图表与明细沿用相同口径。",
    evidence: "1.32 + 1.46 + 1.59 + 1.71 = 6.08；期间为 2024 年，组织为全集团，单位为亿元。",
  },
  {
    title: "同年季度比较，明确比较基准",
    input: "四季度比一季度增长了多少？",
    verdict: "增加 0.39 亿元，增幅为 29.55%。这是同年季度比较，不能标为同比。",
    evidence: "（1.71 − 1.32）÷ 1.32 × 100% ≈ 29.55%；同比需要上年同期数据。",
  },
  {
    title: "缺少子公司明细，保留判断边界",
    input: "哪家子公司的净利润最高？",
    verdict: "未取得子公司维度明细，不生成排名，也不将缺失记为 0。",
    evidence: "当前示例仅包含 2024 年全集团季度值，集团合计不能替代子公司数据。",
  },
] as const;

export function ZhaocaiRuleChecks() {
  const { t } = useI18n();
  return <details className="zc4-disclosure zc4-rule-checks">
    <summary>{t("查阅三条回答规则的核对样例")}</summary>
    <div className="zc4-disclosure-body">
      <p className="zc4-rule-checks-intro">{t("以本页季度示例逐项核对计算、比较基准与缺失处理，完整回答可在上方工作台查看。")}</p>
      <ul className="zc4-rule-checks-list">
        {ruleChecks.map(check => <li key={check.title}><h4>{t(check.title)}</h4><dl><div><dt>{t("输入")}</dt><dd>{t(check.input)}</dd></div><div><dt>{t("判定")}</dt><dd>{t(check.verdict)}</dd></div><div><dt>{t("依据")}</dt><dd>{t(check.evidence)}</dd></div></dl></li>)}
      </ul>
      <p className="zc4-rule-checks-note">{t("核对范围：指定示例数据下的回答规则与表达；真实业务结果仍需与业务服务及来源明细核对。")}</p>
    </div>
  </details>;
}
