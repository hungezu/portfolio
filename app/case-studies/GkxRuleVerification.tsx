"use client";

import type { MouseEvent } from "react";
import { IconArrowRight } from "@arco-design/web-react/icon";
import { useI18n } from "../i18n";
import { GkxPaperQueryDemo } from "./GkxPaperQueryDemo";

const content = {
  "zh-CN": {
    title: "一条查询要求，怎样变成可检查的规则",
    intro: "原列表将编号与名称拆成两个查询项。我把按内容线索找论文作为主要路径：统一搜索标题和关键词，机构保留独立筛选，再把组合条件、无结果和重置写成明确的核对点。",
    specLabel: "01 · 规则输入",
    specNote: "Markdown 设计说明的公开规则摘要，由本页整理；不是原始文件逐字摘录。",
    spec: "## 记录查询\n- 搜索匹配标题与关键词\n- 机构筛选与搜索同时生效\n- 无结果提供清空条件入口；重置恢复全部记录",
    demoLabel: "02 · 在本页复现规则",
    demoIntro: "切换论文与专利，核对同一套查询规则。也可以对照原查询布局，比较输入前需要判断的字段。",
    checksLabel: "03 · 人工核验：输入、反馈与恢复",
    checks: [
      ["组合条件", "在统一查询中输入“深度学习”，选择“清华大学”后查询：论文和专利示例各返回 1 条；机构条件不能被搜索覆盖。"],
      ["无匹配记录", "输入“无匹配示例”后查询：显示无结果与清空入口；不能保留上一轮结果冒充本次结果。"],
      ["重置与复用", "重置后恢复当前类型的 6 条示例记录；切换论文与专利时清空旧条件，查询方式保持一致。"],
    ],
    scope: "这些检查针对本页构造的示例与交互行为，不验证模型能力、真实业务数据或线上实现。",
    rulesLink: "对照页面规范的应用",
    details: "查阅本例的核对点与观察范围",
  },
  en: {
    title: "Turn a query requirement into rules that can be checked",
    intro: "The original list separated record ID and title into two query fields. I made content-based paper search the primary path: search titles and keywords together, keep institution as an independent filter, and specify combined conditions, empty results and reset behavior.",
    specLabel: "01 · Rule input",
    specNote: "A public summary of the Markdown design specifications, prepared for this page; not a verbatim extract from the original file.",
    spec: "## Record queries\n- Search titles and keywords\n- Apply institution and search filters together\n- Offer a clear-filter action for empty results; reset restores all records",
    demoLabel: "02 · Reconstruct the rules on this page",
    demoIntro: "Switch between papers and patents to check the same query rules. Compare the original layout to see which fields users must interpret before entering a query.",
    checksLabel: "03 · Manual checks: input, feedback and recovery",
    checks: [
      ["Combined conditions", "In the shared layout, search for “deep learning” and select “Tsinghua University”: each record type returns one sample. Search must not override the institution filter."],
      ["No matching records", "Search for “unmatched example”: show an empty result and a clear-filter action. Do not present the previous query’s results as the current result."],
      ["Reset and reuse", "Reset restores all six samples of the current type. Switching between papers and patents clears old conditions while preserving the query pattern."],
    ],
    scope: "These checks cover this page’s fictional examples and interactions, not model capability, real business data or the live implementation.",
    rulesLink: "Compare the interface’s standards mapping",
    details: "Read the checks and their scope",
  },
} as const;

export function GkxRuleVerification({ onReferenceClick }: {
  onReferenceClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { locale } = useI18n();
  const copy = content[locale];
  return <article id="gkx-workflow" className="gkx-validation-evidence gkx-topic gkx-rule-verification">
    <header className="gkx-content-heading"><h3>{copy.title}</h3><p>{copy.intro}</p></header>
    <section className="gkx-rule-verification__input" aria-label={copy.specLabel}>
      <h4>{copy.specLabel}</h4><p>{copy.specNote}</p><pre><code>{copy.spec}</code></pre>
    </section>
    <section className="gkx-rule-verification__demo" aria-label={copy.demoLabel}>
      <h4>{copy.demoLabel}</h4><p>{copy.demoIntro}</p>
      <div id="gkx-ai-query-validation"><GkxPaperQueryDemo /></div>
    </section>
    <details className="gkx-supporting-material gkx-query-notes" open>
      <summary>{copy.checksLabel}</summary>
      <dl className="gkx-rule-verification__checks">{copy.checks.map(([title, description]) => <div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}</dl>
      <p className="gkx-source-note">{copy.scope}</p>
    </details>
    <div className="gkx-query-contract"><a id="gkx-ai-rules-reference" href="#gkx-standards-applications" onClick={onReferenceClick}>{copy.rulesLink}<IconArrowRight aria-hidden="true" /></a></div>
  </article>;
}
