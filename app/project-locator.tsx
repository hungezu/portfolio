"use client";

import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";

export type ProjectLocatorSection = readonly [id: string, label: string];

type ProjectLocatorProps = {
  sections: readonly ProjectLocatorSection[];
  ariaLabel?: string;
  legacyAnchors?: Readonly<Record<string, string>>;
};

const emptyLegacyAnchors: Readonly<Record<string, string>> = {};

export function ProjectLocator({
  sections,
  ariaLabel = "项目章节定位",
  legacyAnchors = emptyLegacyAnchors,
}: ProjectLocatorProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.[0] ?? "");
  const navRef = useRef<HTMLElement>(null);
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
    };
  }, [legacyAnchors, sectionKey, sections]);

  useEffect(() => {
    const nav = navRef.current;
    const activeLink = nav?.querySelector<HTMLElement>(`a[href="#${activeSection}"]`);
    if (!nav || !activeLink) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.matchMedia("(max-width: 1120px)").matches) {
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
  }, [activeSection]);

  const navigateTo = (event: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    window.history.replaceState(window.history.state, "", `#${id}`);
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
    setActiveSection(id);
  };

  return (
    <nav ref={navRef} className="zhaocai-locator" aria-label={ariaLabel}>
      {sections.map(([id, label]) => (
        <a
          className={activeSection === id ? "active" : ""}
          href={`#${id}`}
          aria-current={activeSection === id ? "location" : undefined}
          onClick={event => navigateTo(event, id)}
          key={id}
        >
          <em>{label}</em>
        </a>
      ))}
    </nav>
  );
}
