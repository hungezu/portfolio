"use client";

import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right.mjs";
import Pause from "lucide-react/dist/esm/icons/pause.mjs";
import Play from "lucide-react/dist/esm/icons/play.mjs";
import Plus from "lucide-react/dist/esm/icons/plus.mjs";
import { useEffect, useLayoutEffect, useRef, useState, type AnimationEvent, type CSSProperties, type MouseEvent } from "react";
import { abilities, projects, type AbilityId } from "./portfolio-data";
import { CapabilityVisual } from "./capability-visual";
import "./capability-section.css";

export const capabilityOrder: AbilityId[] = [
  "ai-experience", "ai-workflow", "complex-systems",
  "interaction-design", "design-system", "data-visualization",
];

const cycleDuration = 7000;
const manualReadingTime = 60000;

const presentations: Record<AbilityId, {
  label: string; statement: string; description: string;
}> = {
  "ai-experience": {
    label: "AI 体验",
    statement: "把不确定，变成可控的体验。",
    description: "串联意图澄清、过程反馈与依据说明，让 AI 任务可理解、可确认。",
  },
  "ai-workflow": {
    label: "AI 工作流",
    statement: "让设计判断，在原型中被验证。",
    description: "用 AI 搭建可运行原型，以 Markdown 维护规范，关键设计判断由我完成。",
  },
  "complex-systems": {
    label: "复杂系统",
    statement: "把复杂业务，组织成清晰的系统。",
    description: "先理清系统、角色与业务边界，再组织任务流程、权限和页面结构。",
  },
  "interaction-design": {
    label: "交互策略",
    statement: "让每一步操作，都有清楚的反馈。",
    description: "围绕任务路径定义信息结构与状态，通过原型验证关键操作和异常场景。",
  },
  "design-system": {
    label: "设计系统",
    statement: "让一致性，成为可复用的规则。",
    description: "以栅格、组件与状态规则统一页面，把评审共识沉淀为可维护的规范。",
  },
  "data-visualization": {
    label: "数据可视化",
    statement: "让关键数据，成为看得懂的判断。",
    description: "按指标优先级组织地图、趋势与对比，建立从整体态势到关键细节的阅读路径。",
  },
};

type CapabilitySectionProps = {
  highlightedAbilityId: AbilityId | null;
  onShowProjects: (abilityId: AbilityId) => void;
  onOpenEvidence: (event: MouseEvent<HTMLAnchorElement>, slug: string, anchor?: string) => void;
};

export function CapabilitySection({
  highlightedAbilityId, onShowProjects, onOpenEvidence,
}: CapabilitySectionProps) {
  const [activeId, setActiveId] = useState<AbilityId>("ai-experience");
  const [expandedId, setExpandedId] = useState<AbilityId | null>("ai-experience");
  const [animateDisclosure, setAnimateDisclosure] = useState(false);
  const [cycleGeneration, setCycleGeneration] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [pausedByUser, setPausedByUser] = useState(false);
  const [indexVisible, setIndexVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const [pointerReading, setPointerReading] = useState(false);
  const [keyboardReading, setKeyboardReading] = useState(false);
  const indexRef = useRef<HTMLElement>(null);
  const cycleRunningRef = useRef(false);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const current = abilities.find(ability => ability.id === activeId)!;
  // This local showcase never changes the work highlight; only its CTA does.
  const matchedProjects = projects.filter(project => project.abilityIds.includes(activeId));
  const cycleState = pausedByUser ? "paused" : cooldownUntil ? "cooldown"
    : !pageVisible ? "hidden" : !indexVisible ? "offscreen"
    : pointerReading || keyboardReading ? "reading" : "running";

  useLayoutEffect(() => { cycleRunningRef.current = cycleState === "running"; }, [cycleState]);

  // Narrow screens stack the evidence cards. Restore the same selection before
  // HomePage restores returnY so the preceding section retains its height.
  useLayoutEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const returning = params.has("returnProject") || params.get("returnSection") === "work";
      const saved = window.sessionStorage.getItem("portfolio-capability-selection");
      setPausedByUser(window.sessionStorage.getItem("portfolio-capability-autoplay-paused") === "true");
      if (returning && saved && capabilityOrder.includes(saved as AbilityId)) {
        setActiveId(saved as AbilityId);
        const expanded = window.sessionStorage.getItem("portfolio-capability-expanded");
        setExpandedId(expanded === saved ? saved as AbilityId : null);
        setCooldownUntil(Date.now() + manualReadingTime);
      } else if (!returning) {
        window.sessionStorage.setItem("portfolio-capability-selection", "ai-experience");
        window.sessionStorage.setItem("portfolio-capability-expanded", "ai-experience");
      }
    } catch { /* Navigation and capability switching also work without storage. */ }
  }, []);

  useEffect(() => {
    const updateVisibility = () => {
      const visible = document.visibilityState === "visible";
      if (!visible) cycleRunningRef.current = false;
      setPageVisible(visible);
    };
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio >= 0.45;
      if (!visible) cycleRunningRef.current = false;
      setIndexVisible(visible);
    }, { threshold: [0, 0.45] });
    if (indexRef.current) observer.observe(indexRef.current);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!cooldownUntil) return;
    let timer: ReturnType<typeof setTimeout>;
    const release = () => {
      clearTimeout(timer);
      const remaining = cooldownUntil - Date.now();
      if (remaining > 0) timer = setTimeout(release, remaining);
      else {
        setCooldownUntil(0);
        setCycleGeneration(value => value + 1);
      }
    };
    release();
    document.addEventListener("visibilitychange", release);
    return () => { clearTimeout(timer); document.removeEventListener("visibilitychange", release); };
  }, [cooldownUntil]);

  function saveSelection(id: AbilityId, expanded: AbilityId | null) {
    try {
      window.sessionStorage.setItem("portfolio-capability-selection", id);
      window.sessionStorage.setItem("portfolio-capability-expanded", expanded ?? "");
    } catch { /* Storage can be disabled. */ }
  }

  function holdForReading() {
    cycleRunningRef.current = false;
    setCooldownUntil(Date.now() + manualReadingTime);
    setCycleGeneration(value => value + 1);
    // A parked mouse should not turn the requested one-minute pause indefinite.
    setPointerReading(false);
  }

  function toggleAbility(id: AbilityId) {
    const nextExpanded = expandedId === id ? null : id;
    holdForReading();
    setAnimateDisclosure(true);
    setActiveId(id);
    setExpandedId(nextExpanded);
    saveSelection(id, nextExpanded);
  }

  function advanceAbility(event: AnimationEvent<HTMLSpanElement>) {
    if (event.target !== event.currentTarget || event.animationName !== "capability-tab-progress") return;
    if (!cycleRunningRef.current) {
      // An end event can be queued just as visibility/interaction pauses it.
      setCycleGeneration(value => value + 1);
      return;
    }
    const next = capabilityOrder[(capabilityOrder.indexOf(activeId) + 1) % capabilityOrder.length];
    const nextExpanded = next;
    setAnimateDisclosure(true);
    setActiveId(next);
    setExpandedId(nextExpanded);
    setCycleGeneration(value => value + 1);
    saveSelection(next, nextExpanded);
  }

  function togglePlayback() {
    const paused = !pausedByUser;
    cycleRunningRef.current = false;
    setPausedByUser(paused);
    if (!paused) {
      setCooldownUntil(0);
      setPointerReading(false);
      setKeyboardReading(false);
      setCycleGeneration(value => value + 1);
    }
    try {
      window.sessionStorage.setItem("portfolio-capability-autoplay-paused", String(paused));
    } catch { /* Storage can be disabled. */ }
  }

  const pauseForPointer = (event: { pointerType: string }) => {
    if (event.pointerType !== "mouse") return;
    cycleRunningRef.current = false;
    setPointerReading(true);
  };

  return <section className="section capability-section" id="ability" aria-label="核心能力">
    <div className="section-shell capability-shell">
      <header className="section-intro capability-section-heading">
        <h2>核心能力</h2>
        <p>从方法，到项目实践。</p>
        <span className="section-intro-rule" aria-hidden="true" />
      </header>
      <div className="capability-layout" onPointerDownCapture={() => setKeyboardReading(false)} onFocusCapture={event => {
        if (event.target.matches(":focus-visible")) {
          cycleRunningRef.current = false;
          setKeyboardReading(true);
        }
      }} onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardReading(false);
      }} onKeyDownCapture={() => { cycleRunningRef.current = false; setKeyboardReading(true); }}>
        <aside className="capability-index" ref={indexRef} aria-label="选择能力分类"
          onPointerEnter={pauseForPointer} onPointerLeave={() => setPointerReading(false)}>
          <div className="capability-accordion" data-animated={animateDisclosure}
            data-cycle-state={cycleState} data-cooldown-until={cooldownUntil || undefined}
            style={{ "--capability-cycle-duration": `${cycleDuration}ms` } as CSSProperties}>
            {capabilityOrder.map((id, index) => {
              const expanded = expandedId === id;
              return <div className="capability-item" key={id} data-active={activeId === id}>
                <h3 className="capability-item-heading">
                  <button
                    ref={element => { triggerRefs.current[index] = element; }}
                    type="button"
                    id={`capability-tab-${id}`}
                    data-ability-id={id}
                    data-active={activeId === id}
                    aria-expanded={expanded}
                    aria-controls={`capability-description-${id}`}
                    onClick={() => toggleAbility(id)}
                    onKeyDown={event => {
                      const direction = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
                      if (!direction && event.key !== "Home" && event.key !== "End") return;
                      event.preventDefault();
                      const next = event.key === "Home" ? 0 : event.key === "End" ? capabilityOrder.length - 1
                        : (index + direction + capabilityOrder.length) % capabilityOrder.length;
                      triggerRefs.current[next]?.focus();
                    }}
                  >
                    <span>{presentations[id].label}</span>
                    <Plus className="capability-disclosure-icon" size={18} strokeWidth={1.5} aria-hidden="true" />
                    {activeId === id && <span
                      key={cycleGeneration}
                      className="capability-tab-marker"
                      onAnimationEnd={advanceAbility}
                      aria-hidden="true"
                    />}
                  </button>
                </h3>
                <div
                  className="capability-disclosure"
                  id={`capability-description-${id}`}
                  role="region"
                  aria-labelledby={`capability-tab-${id}`}
                  aria-hidden={!expanded}
                  data-open={expanded}
                >
                  <div className="capability-disclosure-clip">
                    <div className="capability-disclosure-copy">
                      <h4>{presentations[id].statement}</h4>
                      <p>{presentations[id].description}</p>
                    </div>
                  </div>
                </div>
              </div>;
            })}
          </div>
          <div className="capability-playback">
            <button type="button" onClick={togglePlayback} aria-controls="capability-panel">
              {pausedByUser ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
              {pausedByUser ? "继续轮播" : "暂停轮播"}
            </button>
          </div>
        </aside>

        <div id="capability-panel" className="capability-panel" role="region" aria-label={`${presentations[activeId].label}的能力展示与相关项目`}
          onPointerEnter={pauseForPointer} onPointerLeave={() => setPointerReading(false)}>
          <div className="capability-stage">
            <CapabilityVisual abilityId={activeId} />
          </div>

          <div className="capability-projects">
            <div className="capability-project-heading">
              <h3>相关项目 <span>{String(matchedProjects.length).padStart(2, "0")}</span></h3>
            </div>
            <div
              className="capability-project-links"
              aria-label={`${current.name}对应项目`}
            >
              {matchedProjects.map(project => {
                const evidence = current.evidence.filter(item => item.projectSlug === project.slug);
                const primary = evidence[0];
                return <article className="capability-project-proof" key={project.slug}>
                  <a
                    className="capability-proof-link"
                    href={`/portfolio/project/${project.slug}/${primary?.anchor ? `#${primary.anchor}` : ""}`}
                    onClick={event => { holdForReading(); onOpenEvidence(event, project.slug, primary?.anchor); }}
                    aria-label={`查看${project.shortTitle}${primary ? `：${primary.section}` : ""}`}
                  >
                    <div className="capability-proof-title"><h4>{project.shortTitle}</h4></div>
                    <span className="capability-proof-section">{primary?.section ?? "项目实践"}</span>
                    <p>{primary?.description ?? project.summary}</p>
                  </a>
                  {evidence.slice(1).map(item => <a
                    className="capability-extra-evidence"
                    key={item.anchor ?? item.section}
                    href={`/portfolio/project/${project.slug}/${item.anchor ? `#${item.anchor}` : ""}`}
                    onClick={event => { holdForReading(); onOpenEvidence(event, project.slug, item.anchor); }}
                  >继续查看：{item.section}<ArrowUpRight size={15} aria-hidden="true" /></a>)}
                </article>;
              })}
            </div>
            <button
              type="button"
              className="capability-project-action"
              aria-controls="work"
              onClick={() => { holdForReading(); onShowProjects(activeId); }}
            >
              <span>在作品区查看 {matchedProjects.length} 个项目</span>
              <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <p className="capability-link-status" role="status">
        {highlightedAbilityId
          ? `作品区已突出“${presentations[highlightedAbilityId].label}”对应项目`
          : "点击在作品区查看，突出对应项目"}
      </p>
    </div>
  </section>;
}
