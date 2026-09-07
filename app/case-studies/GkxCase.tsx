"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { type Project } from "../portfolio-data";
import { collaboration, layers, mdExamples, measurementMethods, questions, sections, value, workflow, type DiagramData, type SectionId } from "./gkx-content";
import "./gkx-case.css";

type Connector = { key: string; d: string; from: string; to: string; feedback: boolean };

function Section({ id, title, intro, children }: { id: SectionId; title: string; intro?: string; children: ReactNode }) {
  const index = sections.findIndex(section => section.id === id);
  return <section id={`gkx-${id}`} className={`gkx-section gkx-section--${id}`} data-gkx-section={id} aria-labelledby={`gkx-${id}-title`}>
    <header className="gkx-section__heading">
      <p className="gkx-eyebrow"><span>{String(index + 1).padStart(2, "0")}</span>{sections[index].label}</p>
      <h2 id={`gkx-${id}-title`}>{title}</h2>
      {intro && <p className="gkx-section__intro">{intro}</p>}
    </header>
    {children}
  </section>;
}

function useActiveSection(root: { readonly current: HTMLElement | null }) {
  const [active, setActive] = useState<SectionId>("overview");
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const threshold = Math.min(window.innerHeight * .28, 210);
      let next: SectionId = "overview";
      host.querySelectorAll<HTMLElement>("[data-gkx-section]").forEach(section => {
        if (section.getBoundingClientRect().top <= threshold) next = section.dataset.gkxSection as SectionId;
      });
      setActive(next);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => { window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); window.cancelAnimationFrame(frame); };
  }, [root]);
  return active;
}

function RelationDiagram({ data, selected, onSelect }: { data: DiagramData; selected: string; onSelect: (id: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<{ width: number; height: number; lines: Connector[] }>({ width: 1, height: 1, lines: [] });
  const marker = `gkx-arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const chosen = data.nodes.find(node => node.id === selected) ?? data.nodes[0];
  useEffect(() => {
    const board = host.current;
    if (!board) return;
    let frame = 0;
    const draw = () => {
      frame = 0;
      const rect = board.getBoundingClientRect();
      if (!rect.width) return;
      const narrow = rect.width <= 520;
      const lines: Connector[] = [];
      for (const edge of data.edges) {
        const source = board.querySelector<HTMLElement>(`[data-gkx-node="${edge.from}"]`);
        const target = board.querySelector<HTMLElement>(`[data-gkx-node="${edge.to}"]`);
        if (!source || !target) continue;
        const a = source.getBoundingClientRect(), b = target.getBoundingClientRect();
        const A = { l: a.left - rect.left, r: a.right - rect.left, t: a.top - rect.top, b: a.bottom - rect.top, x: a.left - rect.left + a.width / 2, y: a.top - rect.top + a.height / 2 };
        const B = { l: b.left - rect.left, r: b.right - rect.left, t: b.top - rect.top, b: b.bottom - rect.top, x: b.left - rect.left + b.width / 2, y: b.top - rect.top + b.height / 2 };
        let d: string;
        if (narrow) {
          d = !edge.feedback && B.t > A.b && B.t - A.b < 50
            ? `M ${A.x} ${A.b + 3} L ${B.x} ${B.t - 5}`
            : `M ${A.l - 3} ${A.y} C 7 ${A.y} 7 ${B.y} ${B.l - 5} ${B.y}`;
        } else if (edge.feedback && Math.abs(A.y - B.y) < 20) {
          const lane = Math.max(3, Math.min(A.t, B.t) - 20);
          d = `M ${A.x} ${A.t - 2} C ${A.x} ${lane} ${B.x} ${lane} ${B.x} ${B.t - 5}`;
        } else if (Math.abs(A.x - B.x) < 26) {
          const down = B.y > A.y, sy = down ? A.b + 3 : A.t - 3, ty = down ? B.t - 5 : B.b + 5;
          d = `M ${A.x} ${sy} C ${A.x} ${(sy + ty) / 2} ${B.x} ${(sy + ty) / 2} ${B.x} ${ty}`;
        } else {
          const right = B.x > A.x, sx = right ? A.r + 3 : A.l - 3, tx = right ? B.l - 5 : B.r + 5;
          d = `M ${sx} ${A.y} C ${(sx + tx) / 2} ${A.y} ${(sx + tx) / 2} ${B.y} ${tx} ${B.y}`;
        }
        lines.push({ key: `${edge.from}-${edge.to}`, d, from: edge.from, to: edge.to, feedback: Boolean(edge.feedback) });
      }
      setGeometry({ width: rect.width, height: rect.height, lines });
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(draw); };
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    observer?.observe(board);
    window.addEventListener("resize", schedule);
    let alive = true;
    document.fonts?.ready.then(() => { if (alive) schedule(); });
    draw();
    return () => { alive = false; observer?.disconnect(); window.removeEventListener("resize", schedule); window.cancelAnimationFrame(frame); };
  }, [data]);
  return <div className="gkx-graph" role="group" aria-label={data.label}>
    <div className="gkx-graph__legend"><span>{data.label}</span><span>实线：推进　虚线：反馈</span></div>
    <div className="gkx-graph__map" ref={host}>
      <svg className="gkx-graph__edges" aria-hidden="true" width={geometry.width} height={geometry.height} viewBox={`0 0 ${geometry.width} ${geometry.height}`}>
        <defs><marker id={marker} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M 1 1 L 7 4 L 1 7" className="gkx-graph__arrow" /></marker></defs>
        {geometry.lines.map(line => <path key={line.key} d={line.d} className={`gkx-graph__line${line.from === selected || line.to === selected ? " is-active" : ""}`} strokeDasharray={line.feedback ? "4 5" : undefined} markerEnd={`url(#${marker})`} />)}
      </svg>
      {data.nodes.map(node => <button key={node.id} type="button" className="gkx-graph__node" data-gkx-node={node.id} aria-pressed={node.id === selected} aria-controls={`gkx-${data.id}-detail`} onClick={() => onSelect(node.id)} style={{ gridColumn: node.column, gridRow: `${node.row} / span ${node.span ?? 1}` } as CSSProperties}>
        <span>{node.role}</span><strong>{node.title}</strong><small>{node.description}</small>
      </button>)}
    </div>
    <p className="gkx-graph__detail" id={`gkx-${data.id}-detail`} aria-live="polite"><strong>{chosen.title}</strong>{chosen.detail}</p>
    <p className="gkx-sr-only">{data.edges.map(edge => `${data.nodes.find(node => node.id === edge.from)?.title} ${edge.feedback ? "反馈至" : "连接至"} ${data.nodes.find(node => node.id === edge.to)?.title}`).join("；")}</p>
  </div>;
}

function DecisionMatrix() {
  const [selected, setSelected] = useState(0);
  const item = questions[selected];
  return <>
    <table className="gkx-decisions"><caption className="gkx-sr-only">设计课题、判断、策略与验证的对应关系</caption>
      <thead><tr><th>设计课题</th><th>设计判断</th><th>策略选择</th><th>验证依据</th></tr></thead>
      <tbody>{questions.map((question, index) => <tr key={question.id} className={index === selected ? "is-selected" : undefined}>
        <td data-label="课题"><button type="button" aria-pressed={index === selected} aria-controls="gkx-decision-detail" onClick={() => setSelected(index)}>{question.question}</button></td>
        <td data-label="判断">{question.insight}</td><td data-label="策略">{question.decision}</td><td data-label="验证">{question.validation}</td>
      </tr>)}</tbody>
    </table>
    <div className="gkx-tradeoff" id="gkx-decision-detail" aria-live="polite">
      <div className="gkx-subheading"><h3>方案取舍</h3><a className="gkx-text-link" href={`#gkx-${item.target}`}>查看对应实践 <span aria-hidden="true">↗</span></a></div>
      <div className="gkx-options">{item.options.map(option => <div key={option.title} className={"selected" in option && option.selected ? "is-chosen" : undefined}><p>{"selected" in option && option.selected ? "采用" : "备选"}</p><h4>{option.title}</h4><p>{option.note}</p></div>)}</div>
    </div>
  </>;
}

function ComponentPreview() {
  const [state, setState] = useState("default");
  const variants = [{ id: "default", label: "默认" }, { id: "loading", label: "提交中" }, { id: "disabled", label: "禁用" }];
  return <div className="gkx-component-demo">
    <div className="gkx-subheading"><h3>同一组件，完整的状态规则</h3><span className="gkx-label">交互演示</span></div>
    <div className="gkx-segments" role="group" aria-label="组件状态">{variants.map(variant => <button key={variant.id} type="button" aria-pressed={variant.id === state} onClick={() => setState(variant.id)}>{variant.label}</button>)}</div>
    <div className="gkx-component-demo__body"><div className="gkx-component-stage"><button className="gkx-button" type="button" disabled={state !== "default"} onClick={() => setState("loading")}>{state === "loading" ? "提交中…" : "提交"}</button><p>{state === "default" ? "主要操作 · 可点击" : state === "loading" ? "执行中 · 阻止重复触发" : "条件未满足 · 说明不可用原因"}</p></div>
      <dl className="gkx-rule-list"><div><dt>视觉属性</dt><dd>颜色、字号、圆角</dd></div><div><dt>布局规则</dt><dd>高度、内边距、间距</dd></div><div><dt>行为规则</dt><dd>默认、提交中、禁用</dd></div><div><dt>规范依据</dt><dd>对应 MD 条款</dd></div></dl>
    </div>
  </div>;
}

function MarkdownWorkbench() {
  const [selected, setSelected] = useState("calibrate");
  const [copied, setCopied] = useState("");
  const version = selected === "input" ? "input" : selected === "draft" ? "draft" : "calibrate";
  const document = mdExamples[version];
  const changeNode = (id: string) => { setSelected(id); setCopied(""); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(document.text); setCopied("已复制"); }
    catch { setCopied("请选中文本复制"); }
  };
  return <>
    <RelationDiagram data={workflow} selected={selected} onSelect={changeNode} />
    <div className="gkx-subheading"><h3>从流程节点进入规范正文</h3><span className="gkx-label">MD 表达样例</span></div>
    <div className="gkx-workbench"><div className="gkx-document"><header><span>form-spec.md</span><span>{document.label}</span><button type="button" onClick={copy}>复制</button></header><pre><code>{document.text.split("\n").map((line, index) => <span key={index} className={version === "calibrate" && /校验|错误|重复提交|失败|检查项/.test(line) ? "is-revised" : undefined}>{line || " "}{"\n"}</span>)}</code></pre><p className="gkx-copy-status" role="status">{copied}</p></div>
      <aside className="gkx-workbench__notes"><p className="gkx-eyebrow">设计师的判断</p><h3>范围、边界与质量</h3><p>确认 AI 对既定标准的理解，补充组件状态与例外情况，并把修改留在规范中。</p><dl><div><dt>输入质量</dt><dd>场景与规则是否明确</dd></div><div><dt>输出校准</dt><dd>条款是否准确、完整</dd></div><div><dt>应用验证</dt><dd>原型行为是否符合规范</dd></div></dl><a className="gkx-text-link" href="#gkx-validation">查看原型验证 <span aria-hidden="true">↗</span></a></aside>
    </div>
  </>;
}

function PrototypeDemo() {
  const [name, setName] = useState("");
  const [result, setResult] = useState<"idle" | "invalid" | "pending" | "error" | "success">("idle");
  const [fail, setFail] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef(false);
  const id = useId();
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (pending.current) return;
    if (!name.trim()) { setResult("invalid"); input.current?.focus(); return; }
    pending.current = true; setResult("pending");
    timer.current = setTimeout(() => { pending.current = false; timer.current = null; setResult(fail ? "error" : "success"); }, 650);
  };
  const reset = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; pending.current = false; setName(""); setResult("idle"); setFail(false); };
  const message = result === "invalid" ? "请填写申请名称。" : result === "pending" ? "正在提交，请稍候。" : result === "error" ? "提交未完成。内容已保留，可以重试。" : result === "success" ? "示例提交完成。" : "";
  return <div className="gkx-validation-grid">
    <div className="gkx-prototype"><div className="gkx-prototype__bar"><span>表单状态验证</span><span className="gkx-label">交互演示</span></div>
      <form onSubmit={submit} noValidate><h3>提交申请</h3><label htmlFor={`${id}-name`}>申请名称 <span>必填</span></label><input ref={input} id={`${id}-name`} value={name} onChange={event => { setName(event.target.value); if (result === "invalid") setResult("idle"); }} disabled={result === "pending"} aria-invalid={result === "invalid" || undefined} aria-describedby={`${id}-feedback`} placeholder="填写申请名称" autoComplete="off" />
        <div className="gkx-prototype__actions"><button className="gkx-button" disabled={result === "pending"} type="submit">{result === "pending" ? "提交中…" : result === "error" ? "重新提交" : "提交"}</button><button className="gkx-plain-button" type="button" onClick={reset}>重置</button></div>
        <p id={`${id}-feedback`} className={`gkx-feedback is-${result}`} role={result === "invalid" || result === "error" ? "alert" : "status"}>{message}</p>
        <label className="gkx-demo-option"><input type="checkbox" checked={fail} disabled={result === "pending"} onChange={event => setFail(event.target.checked)} />体验失败与重试状态</label>
      </form>
    </div>
    <div className="gkx-review-evidence"><p className="gkx-eyebrow">条款与行为对应</p><h3>评审前，把状态检查完整</h3><ol><li><strong>必填校验</strong><span>空值提交时定位到字段。</span></li><li><strong>重复提交控制</strong><span>执行中反馈状态并禁用主操作。</span></li><li><strong>失败恢复</strong><span>保留输入，提供明确的重试入口。</span></li><li><strong>结果确认</strong><span>让用户知道本次操作是否完成。</span></li></ol></div>
  </div>;
}

function PagePatterns() {
  const [selected, setSelected] = useState("list");
  const variants = [{ id: "list", label: "列表页" }, { id: "form", label: "表单页" }, { id: "detail", label: "详情页" }];
  const rows = selected === "list" ? [["记录名称", "主次信息层级"], ["当前状态", "统一状态表达"], ["操作入口", "一致的操作位置"]] : selected === "form" ? [["基础信息", "统一标签与间距"], ["业务字段", "按场景补充规则"], ["提交操作", "共用反馈规范"]] : [["概览信息", "统一标题层级"], ["业务内容", "按任务组织分组"], ["操作记录", "共用列表规范"]];
  return <div className="gkx-patterns"><div className="gkx-subheading"><h3>共用规则，适配不同页面</h3><span className="gkx-label">页面模式演示</span></div><div className="gkx-segments" role="group" aria-label="页面模式">{variants.map(variant => <button key={variant.id} type="button" aria-pressed={selected === variant.id} onClick={() => setSelected(variant.id)}>{variant.label}</button>)}</div><div className="gkx-pattern-preview" aria-live="polite"><header><span>业务页面</span><strong>{variants.find(variant => variant.id === selected)?.label}</strong></header><div>{rows.map(([label, rule]) => <div className="gkx-pattern-row" key={label}><span>{label}</span><span>{rule}</span></div>)}</div><footer><span>统一：视觉、组件、反馈</span><span>适配：字段、流程、内容</span></footer></div></div>;
}

function ProjectFigure({ src, alt, onOpen, priority = false }: { src: string; alt: string; onOpen: (src: string, alt: string, trigger: HTMLButtonElement) => void; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (failed) return null;
  return <figure className="gkx-project-figure"><button type="button" onClick={event => onOpen(src, alt, event.currentTarget)} aria-label={`放大查看：${alt}`}><img src={src} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" onError={() => setFailed(true)} /><span className="gkx-figure-zoom" aria-hidden="true">放大查看 ↗</span></button></figure>;
}

function Lightbox({ asset, onClose }: { asset: { src: string; alt: string } | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (asset && !element.open) element.showModal();
    if (!asset && element.open) element.close();
  }, [asset]);
  return <dialog ref={dialog} className="gkx-lightbox" aria-label={asset?.alt ?? "界面大图"} onClose={onClose} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); dialog.current?.close(); } }} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
    <button type="button" className="gkx-lightbox__close" onClick={() => dialog.current?.close()} autoFocus>关闭 ×</button>
    {asset && <img src={asset.src} alt={asset.alt} />}
  </dialog>;
}

export type GkxCaseProps = {
  project: Project;
  /** 必须优先传入网站已有的 MD 交互模块及必要上下文，保留原有事件和状态。 */
  mdInteractiveContent?: ReactNode;
  subNavigation?: ReactNode;
};

export function GkxCase({ project, mdInteractiveContent, subNavigation }: GkxCaseProps) {
  const root = useRef<HTMLElement>(null);
  const active = useActiveSection(root);
  const [collaborationNode, setCollaborationNode] = useState("shared");
  const [valueNode, setValueNode] = useState("approval");
  const [asset, setAsset] = useState<{ src: string; alt: string } | null>(null);
  const lightboxTrigger = useRef<HTMLButtonElement | null>(null);
  const originalPages = project.gallery.map((src, index) => ({ src, alt: project.galleryAlt?.[index] ?? `${project.title}设计界面` })).filter(item => item.src !== project.cover);
  const openImage = (src: string, alt: string, trigger: HTMLButtonElement) => { lightboxTrigger.current = trigger; setAsset({ src, alt }); };
  const closeImage = () => { setAsset(null); window.requestAnimationFrame(() => lightboxTrigger.current?.focus()); };
  return <article className="gkx-case" ref={root}>
    {subNavigation && <div className="gkx-view-nav">{subNavigation}</div>}
    <nav className="zhaocai-locator" aria-label="国科信项目章节"><span aria-hidden="true" />{sections.map((section, index) => <a key={section.id} href={`#gkx-${section.id}`} className={active === section.id ? "active" : ""} aria-current={active === section.id ? "location" : undefined}><b>{String(index + 1).padStart(2, "0")}</b><em>{section.label}</em></a>)}</nav>
    <header id="gkx-overview" className="gkx-hero" data-gkx-section="overview">
      <p className="gkx-eyebrow">01 <span>{project.type}</span></p>
      <div className="gkx-hero__grid"><div><h1>{project.title}</h1><p className="gkx-hero__subtitle">大型门户的统一设计体系<br />与 AI 协作实践</p></div><div className="gkx-hero__summary"><p>围绕一个承载多个业务系统的门户，制定整套设计系统的样式规范，借助 AI 编写设计 MD，让设计规则进入原型工作与评审。</p><dl><div><dt>项目周期</dt><dd>{project.period}</dd></div><div><dt>我的职责</dt><dd>设计系统样式规范制定<br />AI 协作编写设计 MD<br />原型设计与评审优化</dd></div></dl></div></div>
      <ProjectFigure src={project.cover} alt="国科信门户体系项目全景" onOpen={openImage} priority />
    </header>

    <Section id="scope" title="一个门户，多个业务场景。" intro="设计范围覆盖门户内多系统。共同的视觉与组件标准，需要与各业务的差异化需求同时成立。">
      <div className="gkx-scope"><div className="gkx-scope__portal"><span>门户层</span><h3>统一门户</h3><p>组织系统入口与整体体验</p></div><div className="gkx-scope__business"><span>业务层</span><h3>门户内多个业务系统</h3><p>不同角色、任务流程与页面内容</p><div><span>列表与信息浏览</span><span>表单与任务操作</span><span>详情与状态反馈</span></div></div><div className="gkx-scope__foundation"><span>规范层</span><strong>共享设计体系</strong><p>视觉基础 / 组件规则 / 页面模式 / 业务补充</p></div></div>
    </Section>

    <Section id="decisions" title="从设计课题到策略选择。" intro="围绕一致性、规范产出和评审准备，明确每项策略的判断依据与验证方式。"><DecisionMatrix /></Section>

    <Section id="system" title="定义共性，也明确差异。" intro="将设计规范分为视觉基础、通用组件、页面模式与业务补充，明确规则的复用范围。">
      <div className="gkx-layers">{layers.map((layer, index) => <div key={layer.name}><span>{String(index + 1).padStart(2, "0")}</span><h3>{layer.name}</h3><p>{layer.items}</p><p>{layer.purpose}</p></div>)}</div><ComponentPreview />
    </Section>

    <Section id="workflow" title="设计定义规则，AI 辅助编写。" intro="把业务材料与既定标准整理为清晰输入，通过初稿、校准和应用检查，逐步形成完整的设计 MD。">{mdInteractiveContent ?? <MarkdownWorkbench />}</Section>

    <Section id="validation" title="让规范成为原型的检查依据。" intro="将规则落实到页面状态与操作反馈，把设计判断、原型行为和评审意见对应起来。"><PrototypeDemo /></Section>

    <Section id="collaboration" title="围绕同一套规范，组织设计协作。" intro="用共享设计 MD 连接业务输入、规范制定与页面应用，让规则在使用和反馈中持续完善。">
      <RelationDiagram data={collaboration} selected={collaborationNode} onSelect={setCollaborationNode} />
      {originalPages.length > 0 && <div className="gkx-original-pages">{originalPages.map(item => <ProjectFigure key={item.src} src={item.src} alt={item.alt} onOpen={openImage} />)}</div>}
      <PagePatterns />
    </Section>

    <Section id="outcomes" title="从设计资产到效率与质量。" intro="AI 辅助规范编写提高设计效率，规范与原型检查结合支撑通过率改善，并留下可继续维护的设计资产。">
      <RelationDiagram data={value} selected={valueNode} onSelect={setValueNode} />
      <details className="gkx-measurement"><summary>成效如何评估</summary><div>{measurementMethods.map(method => <div key={method.title}><h3>{method.title}</h3><p>{method.detail}</p></div>)}</div></details>
      <div className="gkx-maintenance"><p>将评审中的共性问题回写规范，让后续设计继续使用。</p><a className="gkx-text-link" href="#gkx-workflow">回到规则更新流程 <span aria-hidden="true">↗</span></a></div>
    </Section>
    <Lightbox asset={asset} onClose={closeImage} />
  </article>;
}
