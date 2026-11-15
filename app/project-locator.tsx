"use client";
import { useI18n } from "./i18n";


import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";

export type ProjectLocatorSection = readonly [id: string, label: string];

type ProjectLocatorProps = {
  sections: readonly ProjectLocatorSection[];
  ariaLabel?: string;
  legacyAnchors?: Readonly<Record<string, string>>;
  onNavigate?: () => void;
  compactMenu?: boolean;
};

const emptyLegacyAnchors: Readonly<Record<string, string>> = {};

export function ProjectLocator({
  sections,
  ariaLabel = "项目章节定位",
  legacyAnchors = emptyLegacyAnchors,
  onNavigate,
  compactMenu = false,
}: ProjectLocatorProps) {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState(sections[0]?.[0] ?? "");
  const navRef = useRef<HTMLElement>(null);
  const compactRef = useRef<HTMLDetailsElement>(null);
  const sectionKey = sections.map(([id]) => id).join("|");

  useEffect(() => {
    const nodes = sections
      .map(([id]) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const marker = window.innerHeight * 0.28;
        const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
        const current = atPageEnd
          ? nodes[nodes.length - 1]
          : nodes.reduce(
              (active, node) => node.getBoundingClientRect().top <= marker ? node : active,
              nodes[0],
            );
        setActiveSection(current.id);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // Re-evaluate GKX's reading position when images, language, or disclosures
    // change the layout without a scroll event.
    const observer = compactMenu ? new ResizeObserver(update) : null;
    if (observer) observer.observe(nodes[0].closest("main") ?? document.body);

    const requested = window.location.hash.slice(1);
    const targetId = legacyAnchors[requested] ?? requested;
    if (targetId && document.getElementById(targetId)) {
      window.requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [legacyAnchors, sectionKey, sections, compactMenu]);

  useEffect(() => {
    if (!compactMenu) return;
    const closeOutside = (event: PointerEvent) => {
      const menu = compactRef.current;
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      const menu = compactRef.current;
      if (event.key === "Escape" && menu?.open) {
        event.preventDefault();
        menu.open = false;
        menu.querySelector("summary")?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [compactMenu]);

  useEffect(() => {
    const nav = navRef.current;
    const activeLink = nav?.querySelector<HTMLElement>(`a[href="#${activeSection}"]`);
    if (!nav || !activeLink || nav.clientWidth === 0) return;

    const revealActiveLink = () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const horizontal = window.getComputedStyle(nav).flexDirection === "row";
      if (horizontal) {
        nav.scrollTo({
          left: Math.max(0, activeLink.offsetLeft - (nav.clientWidth - activeLink.offsetWidth) / 2),
          behavior: reduceMotion ? "auto" : "smooth",
        });
        return;
      }

      const linkTop = activeLink.offsetTop;
      const linkBottom = linkTop + activeLink.offsetHeight;
      if (linkTop < nav.scrollTop) {
        nav.scrollTo({ top: linkTop, behavior: reduceMotion ? "auto" : "smooth" });
      } else if (linkBottom > nav.scrollTop + nav.clientHeight) {
        nav.scrollTo({
          top: linkBottom - nav.clientHeight + 2,
          behavior: reduceMotion ? "auto" : "smooth",
        });
      }
    };

    revealActiveLink();
    window.addEventListener("resize", revealActiveLink);
    return () => window.removeEventListener("resize", revealActiveLink);
  }, [activeSection]);

  const navigateTo = (event: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate?.();
    window.history.replaceState(window.history.state, "", `#${id}`);
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    setActiveSection(id);
    if (compactRef.current?.open) {
      compactRef.current.open = false;
      compactRef.current.querySelector("summary")?.focus({ preventScroll: true });
    }
  };

  return (
    <>
    <nav ref={navRef} className={`zhaocai-locator${compactMenu ? " has-compact-menu" : ""}`} aria-label={t(ariaLabel)}>
      {sections.map(([id, label]) => (
        <a
          className={activeSection === id ? "active" : ""}
          href={`#${id}`}
          aria-current={activeSection === id ? "location" : undefined}
          onClick={event => navigateTo(event, id)}
          key={id}
        >
          <em>{t(label)}</em>
        </a>
      ))}
    </nav>
    {compactMenu && <details ref={compactRef} className="gkx-mobile-chapters">
      <summary aria-label={t("展开项目章节目录")}><span>{t(sections.find(([id]) => id === activeSection)?.[1] ?? sections[0]?.[1] ?? "")}</span></summary>
      <nav aria-label={t("项目章节目录")}>{sections.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={activeSection === id ? "location" : undefined} onClick={event => navigateTo(event, id)}>{t(label)}</a>)}</nav>
    </details>}
    </>
  );
}
