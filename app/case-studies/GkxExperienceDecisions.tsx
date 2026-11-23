import type { ReactNode } from "react";
import { useI18n } from "../i18n";

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
        <h3 id="gkx-ai-experience-title">{english ? "Research AI: discovery, verification and release" : "科研 AI 体验：发现、核对与发布"}</h3>
        <p>{english
          ? "Research work moves between finding material and judging whether it supports a decision. I kept the source material and the user's control visible at those points."
          : "科研用户既要找到材料，也要判断材料能不能支撑下一步。我的判断是，在需要做决定的地方，把原始依据和可执行操作留在用户面前。"}
        </p>
      </header>
      <div className="gkx-experience-decisions__scenario">
        <h4>{english ? "Keep discovery modes separate" : "按查找目的选择入口"}</h4>
        <p>{english
          ? "Use a keyword search for a known title or expert and offer AI search for an open research question. The portal shows both entry points. Keyword results retain resource type, source and summary so readers can choose what to open."
          : "已知题名或专家时用关键词直查，只有研究方向时可用 AI 搜索探索。两种入口并列，关键词结果保留资源类型、来源和摘要，便于决定打开哪条。"}
        </p>
        <a href="#gkx-portal-task">{english ? "See the portal result design" : "查看门户结果图稿"}</a>
      </div>
    </section>
    <section id="gkx-reading-workspace" className="gkx-topic gkx-experience-decisions" aria-labelledby="gkx-reading-workspace-title">
      <header className="gkx-content-heading">
        <h3 id="gkx-reading-workspace-title">{english ? "Keep the source visible while reading AI output" : "读 AI 解读时，原文始终可见"}</h3>
        <p>{english
          ? "The reading workspace keeps the outline and paper visible alongside the AI summary, contributions and limitations. I would verify that a reader can move from a specific finding to its original passage before relying on it."
          : "智能阅读把目录、论文原文和 AI 总结、核心贡献、研究局限并列。下一步要核对的是：用户能否从某条解读回到对应原文，看到实验条件和限制，再决定是否引用。"}
        </p>
      </header>
      {readingEvidence}
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
        <p className="gkx-source-note">{english
          ? "Next checks: return to the source passage, retain the query after an empty result or error, and verify how a rejected report returns for revision. The published designs establish the entry points, workspace and status split."
          : "待核对原文定位、无结果或失败后是否保留查询，以及审核驳回后的修改路径。现有图稿支持入口、阅读分栏和状态拆分。"}
        </p>
      </div>
      {reportEvidence}
    </section>
  </>;
}
