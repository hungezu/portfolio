"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useI18n } from "../i18n";
import { publicAsset, type Project } from "../portfolio-data";
import { ProjectLocator, type ProjectLocatorSection } from "../project-locator";
import { legacyCases, type LegacyEvidence, type LegacyProjectSlug, type LegacyText } from "./legacy-case-content";
import "./legacy-project-case.css";

const assetRoot = "/assets/projects/legacy-evidence-20261124";
export function isLegacyProjectSlug(slug: string): slug is LegacyProjectSlug { return Object.hasOwn(legacyCases, slug); }

function LayoutDiagram({ kind, pick }: { kind: "workspace" | "grid" | "dashboard" | "panels"; pick: (text: LegacyText) => string }) {
  if (kind === "workspace") return <div className="legacy-workspaces" aria-label={pick(["两类卡片库的任务组织示意", "Task organization across two card libraries"])}>
    {[{ title: ["集团视角", "Group context"] as LegacyText, items: [["跨企业概览", "Cross-company overview"], ["公司排行", "Company comparison"], ["风险概览", "Risk overview"]] }, { title: ["单企业视角", "Company context"] as LegacyText, items: [["当前任务", "Current tasks"], ["税种与风险", "Tax types and risks"], ["办税日历", "Tax calendar"]] }].map(group => <div key={group.title[0]}><strong>{pick(group.title)}</strong>{group.items.map(item => <span key={item[0]}>{pick(item as unknown as LegacyText)}</span>)}</div>)}
    <p>{pick(["任务配置归纳 · 不含业务数据", "Task configuration summary · No business data"])}</p>
  </div>;
  if (kind === "grid") return <div className="legacy-grid-note"><dl>{[["设计基准", "Design baseline", "1920 px"], ["导航高度", "Navigation height", "56 px"], ["默认侧栏", "Default sidebar", "252 px"], ["两侧留白", "Side margins", "16 px × 2"]].map(([zh, en, value]) => <div key={zh}><dt>{pick([zh, en])}</dt><dd>{value}</dd></div>)}</dl><p>1920 − 252 − 16 × 2 = <strong>1636 px</strong></p></div>;
  if (kind === "panels") return <div className="legacy-panel-note"><div className="legacy-panel-array" role="img" aria-label={pick(["三列两行的六块显示器，每块分辨率1920乘1080", "A three-column, two-row display array; each panel is 1920 by 1080"])}>{Array.from({ length: 6 }, (_, index) => <div key={index}><span>1920 × 1080</span></div>)}</div><p>3 × 1920 = 5760 · 2 × 1080 = 2160</p><strong>{pick(["组合画布：5760 × 2160", "Combined canvas: 5760 × 2160"])}</strong></div>;
  return <div className="legacy-dashboard-diagram" role="img" aria-label={pick(["布局示意：概览指标在上，主要空间信息居中，趋势与排行分列两侧；不含业务数据。", "Layout illustration: overview above, spatial information in the main area, trends and rankings at the sides; no business data."])}><div className="legacy-dashboard-overview">{pick(["概览指标", "Overview"])}</div><div className="legacy-dashboard-trends">{pick(["趋势与比较", "Trends and comparison"])}</div><div className="legacy-dashboard-main"><span>{pick(["主要分析对象", "Main analysis object"])}</span><strong>{pick(["空间分布 / 对象关系", "Spatial distribution / relationships"])}</strong></div><div className="legacy-dashboard-ranks">{pick(["排行与重点", "Rankings and priorities"])}</div><p>{pick(["阅读层级示意 · 不含业务数据", "Reading hierarchy illustration · No business data"])}</p></div>;
}

function EvidenceTabs({ items, pick, onOpen }: { items: LegacyEvidence[]; pick: (text: LegacyText) => string; onOpen: (asset: LegacyEvidence, trigger: HTMLButtonElement) => void }) {
  const [index, setIndex] = useState(0);
  const id = useId();
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = items[index] ?? items[0];
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, active: number) => {
    const next = event.key === "ArrowRight" ? (active + 1) % items.length : event.key === "ArrowLeft" ? (active - 1 + items.length) % items.length : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault(); setIndex(next); tabs.current[next]?.focus();
  };
  return <div className="legacy-evidence">
    {items.length > 1 && <div className="legacy-evidence-tabs" role="tablist" aria-label={pick(["选择设计证据", "Choose design evidence"])}>{items.map((item, tab) => <button key={item.id} ref={element => { tabs.current[tab] = element; }} id={`${id}-tab-${tab}`} type="button" role="tab" aria-selected={index === tab} aria-controls={`${id}-panel-${tab}`} tabIndex={index === tab ? 0 : -1} onClick={() => setIndex(tab)} onKeyDown={event => onKey(event, tab)}>{pick(item.title)}</button>)}</div>}
    {items.map((item, panel) => <div key={item.id} id={`${id}-panel-${panel}`} hidden={index !== panel} role={items.length > 1 ? "tabpanel" : "group"} aria-labelledby={items.length > 1 ? `${id}-tab-${panel}` : undefined} aria-label={items.length === 1 ? pick(item.title) : undefined}>
      {index === panel && <figure><div className="legacy-evidence-surface"><button type="button" className="legacy-evidence-open" style={{ maxWidth: current.width }} aria-label={`${pick(["放大：", "Enlarge: "])}${pick(current.title)}`} onClick={event => onOpen(current, event.currentTarget)}><img src={publicAsset(`${assetRoot}/${current.id}.webp`)} alt={pick(current.alt)} width={current.width} height={current.height} loading="lazy" decoding="async" /></button></div><figcaption><span>{pick(current.title)}</span><button type="button" onClick={event => onOpen(current, event.currentTarget)}>{pick(["放大证据", "Enlarge evidence"])}</button></figcaption></figure>}
    </div>)}
  </div>;
}

export function LegacyProjectCase({ project }: { project: Pick<Project, "slug"> }) {
  const { locale } = useI18n();
  const pick = (text: LegacyText) => text[locale === "en" ? 1 : 0];
  const content = isLegacyProjectSlug(project.slug) ? legacyCases[project.slug] : null;
  const [viewer, setViewer] = useState<LegacyEvidence | null>(null);
  const [original, setOriginal] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const dialog = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const legacyAnchors = useMemo(() => Object.fromEntries((content?.sections ?? []).flatMap(section => section.aliases.map(index => [`case-gallery-${index}`, section.id]))), [content]);
  const locatorSections = useMemo<ProjectLocatorSection[]>(() => [["project-overview", locale === "en" ? "Project overview" : "项目介绍"], ...(content?.sections ?? []).map(section => [section.id, section.label[locale === "en" ? 1 : 0]] as const)], [content, locale]);

  useEffect(() => {
    if (!viewer) return;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => { element?.close(); document.body.style.overflow = overflow; trigger.current?.focus({ preventScroll: true }); };
  }, [viewer]);
  useEffect(() => { setViewer(null); setOriginal(false); }, [project.slug]);

  if (!content) return null;
  const onOpen = (asset: LegacyEvidence, button: HTMLButtonElement) => { trigger.current = button; setOriginal(false); setViewer(asset); };
  return <article className={`legacy-case legacy-case--${project.slug}`} aria-label={pick(["案例设计说明与原稿证据", "Design decisions and source evidence"])}>
    <ProjectLocator sections={locatorSections} legacyAnchors={legacyAnchors} ariaLabel={pick(["案例章节定位", "Case study navigation"])} />
    {content.sections.map((section, index) => <section key={section.id} id={section.id} className="legacy-case-section" aria-labelledby={`${section.id}-title`}>
      {section.aliases.map(alias => <span key={alias} id={`case-gallery-${alias}`} className="legacy-case-anchor" aria-hidden="true" />)}
      <header><span className="legacy-case-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h2 id={`${section.id}-title`}>{pick(section.title)}</h2></header>
      <div className="legacy-case-prose">{section.paragraphs.map(paragraph => <p key={paragraph[0]}>{pick(paragraph)}</p>)}</div>
      {section.diagram && <LayoutDiagram kind={section.diagram} pick={pick} />}
      {section.evidence && <EvidenceTabs key={section.id} items={section.evidence} pick={pick} onOpen={onOpen} />}
    </section>)}
    <aside className="legacy-material-note"><p>{pick(content.materialNote)}</p></aside>
    {viewer && <dialog className="legacy-viewer" ref={dialog} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); setViewer(null); }} onClick={event => { if (event.target === event.currentTarget) setViewer(null); }}><div className="legacy-viewer-panel"><header><h2 id={titleId}>{pick(viewer.title)}</h2><div><button type="button" aria-pressed={original} onClick={() => setOriginal(value => !value)}>{pick(original ? ["适合宽度", "Fit width"] : ["原始尺寸", "Original size"])}</button><button type="button" autoFocus onClick={() => setViewer(null)}>{pick(["关闭", "Close"])}</button></div></header><div className={`legacy-viewer-canvas${original ? " is-original" : ""}`}><img src={publicAsset(`${assetRoot}/${viewer.id}.webp`)} alt={pick(viewer.alt)} width={viewer.width} height={viewer.height} style={original ? { width: viewer.width } : { maxWidth: viewer.width }} /></div><p>{pick(viewer.alt)}</p></div></dialog>}
  </article>;
}
