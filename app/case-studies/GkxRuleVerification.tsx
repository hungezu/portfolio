"use client";

import type { MouseEvent } from "react";
import { IconArrowRight } from "@arco-design/web-react/icon";
import { useI18n } from "../i18n";
import { GkxPaperQueryDemo } from "./GkxPaperQueryDemo";

const content = {
  "zh-CN": {
    title: "一条查询要求，怎样变成可检查的规则",
    intro: "本例围绕内容维护者按标题片段或关键词定位记录的任务。原列表将编号与名称拆开，我优先合并内容查询、保留机构筛选；精确编号查询仍有单独的适用场景。下面把这项取舍写成规则，再用论文与专利的独立示例核对迁移。",
    specLabel: "01 · 规则输入",
    specNote: "Markdown 设计说明的公开规则摘要，由本页整理；不是原始文件逐字摘录。",
    spec: "## 统一记录查询\n- 搜索匹配标题与关键词\n- 机构筛选与搜索同时生效\n- 点击查询后更新结果；无结果提供清空条件入口\n- 重置恢复当前类型全部记录；切换类型清空旧条件",
    demoLabel: "02 · 在本页复现规则",
    demoIntro: "迁移时替换记录类型、内容与对应字段文案，保留匹配范围、条件组合、执行与重置规则。先在论文中执行下面三项，再切到专利重复；原查询布局另外保留编号精确查询，便于看清取舍。",
    checksLabel: "03 · 人工核验：输入、反馈与恢复",
    checks: [
      ["查询与组合条件", "选“统一查询布局”，输入“深度学习”后查询，应返回 3 条；再选“清华大学”并查询，应只剩 1 条。两种记录类型都按搜索与机构共同限定结果。"],
      ["无匹配与继续处理", "输入“无匹配示例”并查询，应显示无结果，不能沿用旧结果。再用“清空查询条件”恢复当前类型的 6 条记录，继续新查询。"],
      ["重置与跨对象迁移", "重置应清空条件并恢复 6 条；带着旧条件切换论文／专利时，也应恢复新类型的 6 条，再用同样的输入核对 3 条→1 条。"],
    ],
    scope: "这些检查针对本页构造的示例与交互行为，不验证模型能力、真实业务数据或线上实现。",
    rulesLink: "对照页面规范的应用",
    details: "查阅本例的核对点与观察范围",
  },
  en: {
    title: "Turn a query requirement into rules that can be checked",
    intro: "Content maintainers can start from a title fragment or keyword. The original list separated ID and title; I prioritized a shared content query with an independent institution filter. Exact-ID lookup still has its own use case. The separate paper and patent examples below check how this decision transfers.",
    specLabel: "01 · Rule input",
    specNote: "A public summary of the Markdown design specifications, prepared for this page; not a verbatim extract from the original file.",
    spec: "## Shared record queries\n- Search titles and keywords\n- Apply institution and search filters together\n- Update results on Search; offer Clear filters for empty results\n- Reset restores the current type; changing type clears old conditions",
    demoLabel: "02 · Reconstruct the rules on this page",
    demoIntro: "Change the record type, content and field wording while retaining matching scope, combined conditions, execution and reset rules. Run the three checks with papers, then repeat with patents. The original layout retains exact-ID lookup so the tradeoff stays visible.",
    checksLabel: "03 · Manual checks: input, feedback and recovery",
    checks: [
      ["Search and combined conditions", "Choose Shared layout and search for “deep learning”: expect three samples. Select “Tsinghua University” and search again: expect one. Search and institution must constrain the result together for both record types."],
      ["Empty results and recovery", "Search for “unmatched example”: expect an empty result, with no stale records. Use Clear filters to restore all six samples of the current type and begin another query."],
      ["Reset and transfer", "Reset clears conditions and restores six samples. Changing between papers and patents with old conditions must also restore six samples of the new type. Repeat the same inputs to check the three-to-one transition."],
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
