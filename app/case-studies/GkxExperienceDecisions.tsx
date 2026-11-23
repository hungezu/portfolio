import type { ReactNode } from "react";
import { useI18n } from "../i18n";

function DesignAcceptance({ title, points }: { title: string; points: ReadonlyArray<readonly [string, string]> }) {
  return <aside className="gkx-design-acceptance" aria-label={title}>
    <h4>{title}</h4>
    <dl>{points.map(([label, detail]) => <div key={label}><dt>{label}</dt><dd>{detail}</dd></div>)}</dl>
  </aside>;
}

export function GkxSkeletonJudgment() {
  const { locale } = useI18n();
  const english = locale === "en";
  const choices = english ? [
    ["Compare resources", "Use a gallery for choosing models, and a list for scanning defined research resources.", "Keep search, filters and results in a predictable order.", "#gkx-portal-task", "See the portal results"],
    ["Inspect or update a record", "Keep a short, single-record task in a dialog over its source list.", "Keep the object and its status identifiable; the dialog has limited space.", "#gkx-rule-containers", "See the record designs"],
    ["Edit dependencies", "Give workflow nodes a dedicated canvas and a property panel that can be read together.", "Keep save and publish separate. A full workspace adds a step between the list and the editor.", "#gkx-flow-decision", "See the workflow designs"],
  ] : [
    ["找资源或做比较", "选模型用卡片，扫查有明确类型的科研资源用列表。", "共用查询、筛选和结果的顺序，结果字段按资源类型决定。", "#gkx-portal-task", "看门户结果"],
    ["查看或修改一条记录", "单条论文核对用同页弹窗，保留来源列表和对象上下文。", "代价是弹窗空间有限；字段或步骤变多时，要重新选容器。", "#gkx-rule-containers", "看记录图稿"],
    ["编辑节点及依赖", "多节点编排用独立画布，关系和当前节点属性可以同时看。", "保存与发布分开；独立工作区增加一次进入与返回。", "#gkx-flow-decision", "看流程图稿"],
  ];

  return <section id="gkx-skeleton-judgment" className="gkx-topic gkx-experience-decisions" aria-labelledby="gkx-skeleton-judgment-title">
    <header className="gkx-content-heading">
      <h3 id="gkx-skeleton-judgment-title">{english ? "Choose the task before the layout" : "先判断任务，再选择页面骨架"}</h3>
      <p>{english
        ? "The reusable layer is what people learn to operate: how they enter conditions, execute a query and interpret feedback. The workspace depends on the objects they work with and what must remain visible."
        : "可以复用的是用户已学会的操作顺序，例如怎样填写条件、执行和看反馈。页面布局由处理对象、任务持续时间和需要同时查看的信息决定。"}
      </p>
    </header>
    <ul className="gkx-experience-decisions__grid">
      {choices.map(([title, choice, reason, target, link]) => <li key={target}>
        <h4>{title}</h4>
        <p>{choice}</p>
        <p>{reason}</p>
        <a href={target}>{link}</a>
      </li>)}
    </ul>
    <p className="gkx-source-note">{english
      ? "A task pattern defines the work, a container defines where it happens, and status or permissions constrain available actions. The directory documents patterns; actual permissions and publishing behavior still require implementation checks."
      : "任务模式说明做什么，容器说明在哪里做，状态和权限决定能做哪些操作。规范目录提供页面模式，真实权限和发布行为仍需结合业务实现核对。"}
    </p>
  </section>;
}

export function GkxProductAiExperience({ readingEvidence, reportEvidence }: { readingEvidence: ReactNode; reportEvidence: ReactNode }) {
  const { locale } = useI18n();
  const english = locale === "en";

  return <>
    <section id="gkx-ai-experience" className="gkx-topic gkx-experience-decisions" aria-labelledby="gkx-ai-experience-title">
      <header className="gkx-content-heading">
        <h3 id="gkx-ai-experience-title">{english ? "Research AI: find material, verify it, then prepare a report" : "科研 AI 体验：找到材料，再判断能否用于报告"}</h3>
        <p>{english
          ? "A research user needs to find relevant material, check a claim against the paper, and decide what can enter a report. The portal search and reading designs and the think-tank report task design show how I addressed these separate decisions."
          : "科研使用者要找相关材料、回论文核对解读，再决定哪些内容可以进入报告。我分别用门户搜索与阅读图稿、智库报告任务图稿，说明如何保留依据与操作控制。"}
        </p>
      </header>
      <p className="gkx-source-note">{english
        ? "The designs below show the interface structure. The acceptance points are requirements for a subsequent prototype or implementation check, not completed tests of the live product."
        : "下方图稿展示界面结构；各段验收要点用于后续原型或实现核对，不代表已经完成线上测试。"}
      </p>
      <div className="gkx-experience-decisions__scenario">
        <h4>{english ? "Keep discovery modes separate" : "按查找目的选择入口"}</h4>
        <p>{english
          ? "Use a keyword search for a known title or expert and offer AI search for an open research question. The portal shows both entry points. Keyword results retain resource type, source and summary so readers can choose what to open."
          : "已知题名或专家时用关键词直查，只有研究方向时可用 AI 搜索探索。两种入口并列，关键词结果保留资源类型、来源和摘要，便于决定打开哪条。"}
        </p>
        <a href="#gkx-portal-task">{english ? "See the portal result design" : "查看门户结果图稿"}</a>
      </div>
      <DesignAcceptance title={english ? "Acceptance point · Keep the search recoverable" : "设计验收要点 · 查询后仍能继续调整"} points={[
        [english ? "Entry and recovery" : "入口与恢复", english
          ? "Try a known paper title and an open research question through their respective entry points. Check that the active mode and conditions remain identifiable. An empty result or request failure should retain the question and let the user revise conditions or retry."
          : "分别用已知题名和开放研究问题进入，核对当前模式与条件是否清楚。无结果或请求失败后，应保留问题与条件，让用户可以调整后再查。"],
      ]} />
    </section>
    <section id="gkx-reading-workspace" className="gkx-topic gkx-experience-decisions" aria-labelledby="gkx-reading-workspace-title">
      <header className="gkx-content-heading">
        <h3 id="gkx-reading-workspace-title">{english ? "Read AI output alongside the source" : "让 AI 解读与论文原文可以对照"}</h3>
        <p>{english
          ? "The design places the outline and paper beside the AI summary, contributions and limitations. This gives readers room to compare the interpretation with the paper; linked passage navigation still needs an interactive check."
          : "图稿将目录、论文原文与 AI 总结、核心贡献、研究局限并列，给人工对照留下空间；解读能否联动定位到具体段落，仍需在可操作原型中验收。"}
        </p>
      </header>
      {readingEvidence}
      <DesignAcceptance title={english ? "Acceptance points · Check support before using a claim" : "设计验收要点 · 先核对依据，再使用结论"} points={[
        [english ? "Check one claim" : "核对一条解读", english
          ? "Use a neutral test claim, “the method outperforms a baseline.” Locate the passage and compare the study object, baseline, evaluation measure and limitations. Check whether the interpretation states the same conditions as the paper."
          : "用中性示例“某方法优于基线”，定位原文，核对研究对象、对照方法、评价指标与适用限制，判断解读是否保留了原文条件。"],
        [english ? "When support is missing" : "依据不足时", english
          ? "If the passage cannot be found, the interpretation conflicts with it, or the file fails to load, make the unresolved state clear. Retain the paper and question so the reader can inspect the source or revise the question before citing the claim."
          : "找不到支撑、解读与原文冲突或文件未读成功时，应说明未完成核对，保留论文与问题，让用户回原文人工检查或调整提问，再决定是否引用。"],
      ]} />
    </section>
    <section id="gkx-ai-release-boundary" className="gkx-topic gkx-experience-decisions gkx-experience-decisions__with-evidence"
      aria-labelledby="gkx-ai-release-boundary-title">
      <div>
        <header className="gkx-content-heading">
          <h3 id="gkx-ai-release-boundary-title">{english ? "Separate generation and release approval" : "分别呈现生成进度和发布审核"}</h3>
          <p>{english
            ? "The report task design shows a generation state and a publication review state. A completed report can still be unsubmitted or under review, so people can tell whether to wait, review the draft, or check approval."
            : "智库报告任务图稿分别展示生成状态和发布审核。报告已生成后仍可能未申请或审核中，让用户知道下一步是等待、检查草稿，还是跟进审核。"}
          </p>
        </header>
        <DesignAcceptance title={english ? "Acceptance points · Make the next action identifiable" : "设计验收要点 · 状态对应下一步"} points={[
          [english ? "Distinguish the two states" : "区分两组状态", english
            ? "Use the shown combinations “Completed + Not submitted” and “Completed + Under review.” The former should lead to checking the draft and applying for release; the latter to tracking approval. Completion must not imply publication."
            : "用图中的“已完成＋未申请”和“已完成＋审核中”核对：前者应能检查草稿并申请发布，后者应能跟进审核；生成完成不能被理解为已经发布。"],
          [english ? "Failure and rejection" : "失败与驳回", english
            ? "Generation failure should retain the task and its conditions, explain the cause and indicate how to continue. Rejection should link the review feedback to draft revision. These exceptions are absent from this image and need a prototype before acceptance."
            : "生成失败应保留任务与条件，说明原因和继续入口；审核驳回应把意见连接到草稿修订。当前图未覆盖这两种异常，需补齐原型后验收。"],
        ]} />
      </div>
      {reportEvidence}
    </section>
  </>;
}
