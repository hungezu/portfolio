"use client";

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { IconArrowLeft, IconArrowRight } from "@arco-design/web-react/icon";
import "./gkx-evidence-carousel.css";

export type GkxEvidenceItem = {
  id: string;
  title: string;
  content: ReactNode;
};

export type GkxEvidenceCarouselProps = {
  items: readonly GkxEvidenceItem[];
  label: string;
  previousLabel: string;
  nextLabel: string;
  tabsLabel?: string;
  roleDescription?: string;
  initialIndex?: number;
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
  getPositionLabel?: (oneBasedIndex: number, total: number) => string;
  className?: string;
  /** Keep the tallest natural panel seen at the current width; never clip it. */
  reserveHeight?: boolean;
};

function boundedIndex(index: number, length: number) {
  return Math.min(Math.max(Number.isFinite(index) ? Math.trunc(index) : 0, 0), Math.max(0, length - 1));
}

export function GkxEvidenceCarousel({
  items,
  label,
  previousLabel,
  nextLabel,
  tabsLabel = label,
  roleDescription,
  initialIndex = 0,
  activeIndex,
  onIndexChange,
  getPositionLabel = (position, total) => `${position} / ${total}`,
  className = "",
  reserveHeight = true,
}: GkxEvidenceCarouselProps) {
  const instanceId = useId();
  const [internalIndex, setInternalIndex] = useState(() => boundedIndex(initialIndex, items.length));
  const selectedIndex = boundedIndex(activeIndex ?? internalIndex, items.length);
  const current = items[selectedIndex];
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const measured = useRef({ group: "", width: 0, height: 0 });
  const [reservedHeight, setReservedHeight] = useState(0);
  const groupKey = JSON.stringify(items.map(item => item.id));
  const titleId = `${instanceId}-title`;
  const hasChoices = items.length > 1;
  const tabId = (index: number) => `${instanceId}-tab-${index}`;
  const panelId = (index: number) => `${instanceId}-panel-${index}`;

  useLayoutEffect(() => {
    if (!reserveHeight) {
      measured.current = { group: "", width: 0, height: 0 };
      setReservedHeight(0);
      return;
    }
    const stage = stageRef.current;
    const panel = panelRef.current;
    if (!stage || !panel) return;
    const measure = () => {
      const width = Math.round(stage.getBoundingClientRect().width);
      const height = Math.ceil(panel.getBoundingClientRect().height);
      if (!width || !height) return;
      const previous = measured.current;
      const reset = previous.group !== groupKey || Math.abs(previous.width - width) > 1;
      const nextHeight = reset ? height : Math.max(previous.height, height);
      measured.current = { group: groupKey, width, height: nextHeight };
      setReservedHeight(value => value === nextHeight ? value : nextHeight);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(stage);
    observer?.observe(panel);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [groupKey, items, reserveHeight, selectedIndex]);

  const select = (requested: number) => {
    const next = boundedIndex(requested, items.length);
    if (next === selectedIndex) return;
    if (activeIndex === undefined) setInternalIndex(next);
    onIndexChange?.(next);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    let next: number;
    switch (event.key) {
      case "ArrowRight": next = (index + 1) % items.length; break;
      case "ArrowLeft": next = (index - 1 + items.length) % items.length; break;
      case "Home": next = 0; break;
      case "End": next = items.length - 1; break;
      default: return;
    }
    event.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  if (!current) return null;

  return <section
    className={`gkx-evidence-carousel${className ? ` ${className}` : ""}`}
    role="region"
    aria-label={label}
    aria-roledescription={roleDescription}
  >
    <header className={`gkx-evidence-carousel__header${hasChoices ? "" : " gkx-evidence-carousel__header--single"}`}>
      {hasChoices && <div className="gkx-evidence-carousel__tabs" role="tablist" aria-label={tabsLabel} aria-orientation="horizontal">
        {items.map((item, index) => <button
          type="button"
          role="tab"
          key={item.id}
          id={tabId(index)}
          aria-controls={panelId(index)}
          aria-selected={index === selectedIndex}
          tabIndex={index === selectedIndex ? 0 : -1}
          ref={element => { tabRefs.current[index] = element; }}
          onClick={() => select(index)}
          onKeyDown={event => onTabKeyDown(event, index)}
        >{item.title}</button>)}
      </div>}
      <div className="gkx-evidence-carousel__meta">
        <p className="gkx-evidence-carousel__status" aria-live="polite" aria-atomic="true">
          <span className="gkx-evidence-carousel__title" id={titleId}>{current.title}</span>
          <span className="gkx-evidence-carousel__position">{getPositionLabel(selectedIndex + 1, items.length)}</span>
        </p>
        {hasChoices && <div className="gkx-evidence-carousel__arrows">
          <button type="button" aria-label={previousLabel} aria-controls={panelId(selectedIndex)} disabled={selectedIndex === 0} onClick={() => select(selectedIndex - 1)}>
            <IconArrowLeft aria-hidden="true" />
          </button>
          <button type="button" aria-label={nextLabel} aria-controls={panelId(selectedIndex)} disabled={selectedIndex === items.length - 1} onClick={() => select(selectedIndex + 1)}>
            <IconArrowRight aria-hidden="true" />
          </button>
        </div>}
      </div>
    </header>
    <div
      className="gkx-evidence-carousel__stage"
      ref={stageRef}
      style={reserveHeight && reservedHeight ? { minHeight: reservedHeight } : undefined}
    >
      {items.map((item, index) => <div
        className="gkx-evidence-carousel__panel"
        key={item.id}
        id={panelId(index)}
        role={hasChoices ? "tabpanel" : "group"}
        aria-labelledby={hasChoices ? tabId(index) : titleId}
        hidden={index !== selectedIndex}
        tabIndex={index === selectedIndex ? 0 : -1}
        ref={index === selectedIndex ? panelRef : undefined}
      >{index === selectedIndex ? item.content : null}</div>)}
    </div>
  </section>;
}
