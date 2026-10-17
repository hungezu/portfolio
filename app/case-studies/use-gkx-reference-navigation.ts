"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

const historyKey = "gkxReadingReference";
type ReadingReference = { key: string; sourceHash: string; sourceY: number; sourceTop: number; sourceId: string; targetId: string };
type Navigation = { reference: ReadingReference; direction: "target" | "source" };

function readReference(state: unknown, sourceId: string, targetId: string): ReadingReference | null {
  const reference = state && typeof state === "object" ? (state as Record<string, unknown>)[historyKey] as ReadingReference | undefined : undefined;
  return reference && reference.sourceId === sourceId && reference.targetId === targetId
    && typeof reference.key === "string" && typeof reference.sourceHash === "string"
    && (!reference.sourceHash || reference.sourceHash.startsWith("#"))
    && Number.isFinite(reference.sourceY) && Number.isFinite(reference.sourceTop) ? reference : null;
}

function scrollToReadingPosition(resolveTop: () => number, focus: HTMLElement | null, onFinish: () => void) {
  const start = window.scrollY;
  const startedAt = performance.now();
  const duration = Math.min(1000, Math.max(500, Math.abs(resolveTop() - start) * 0.2));
  const clamp = (top: number) => Math.max(0, Math.min(top, document.documentElement.scrollHeight - window.innerHeight));
  let frame = 0;
  const stop = () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("pointerdown", cancel);
    window.removeEventListener("keydown", cancelOnKey);
  };
  const cancel = () => { stop(); onFinish(); };
  const cancelOnKey = (event: KeyboardEvent) => {
    if (["Escape", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Tab"].includes(event.key)) cancel();
  };
  const finish = () => {
    window.scrollTo({ top: clamp(resolveTop()), behavior: "instant" });
    focus?.focus({ preventScroll: true });
    stop();
    onFinish();
  };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish();
    return cancel;
  }
  const animate = (now: number) => {
    const progress = Math.min((now - startedAt) / duration, 1);
    window.scrollTo({ top: start + (clamp(resolveTop()) - start) * (1 - (1 - progress) ** 3), behavior: "instant" });
    if (progress < 1) frame = window.requestAnimationFrame(animate);
    else finish();
  };
  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchstart", cancel, { passive: true });
  window.addEventListener("pointerdown", cancel, { passive: true });
  window.addEventListener("keydown", cancelOnKey);
  frame = window.requestAnimationFrame(animate);
  return cancel;
}

export function useGkxReferenceNavigation(sourceId: string, targetId: string) {
  const [navigation, setNavigation] = useState<Navigation | null>(null);
  const lastReference = useRef<ReadingReference | null>(null);
  const cancelScroll = useRef<(() => void) | null>(null);
  const previousRestoration = useRef<ScrollRestoration | null>(null);
  const restoreBrowserMode = () => {
    if (previousRestoration.current !== null) window.history.scrollRestoration = previousRestoration.current;
    previousRestoration.current = null;
  };

  function clearReference() {
    cancelScroll.current?.();
    lastReference.current = null;
    setNavigation(null);
    restoreBrowserMode();
    if (readReference(window.history.state, sourceId, targetId)) {
      const state = { ...window.history.state };
      delete state[historyKey];
      window.history.replaceState(state, "");
    }
  }

  useEffect(() => {
    const onPopState = () => {
      const reference = readReference(window.history.state, sourceId, targetId);
      if (reference && window.location.hash === `#${targetId}`) {
        setNavigation({ reference, direction: "target" });
      } else if (lastReference.current && window.location.hash === lastReference.current.sourceHash) {
        setNavigation({ reference: lastReference.current, direction: "source" });
      } else {
        cancelScroll.current?.();
        lastReference.current = null;
        setNavigation(null);
        restoreBrowserMode();
      }
    };
    const onHashChange = () => {
      const reference = lastReference.current;
      if (reference && ![`#${targetId}`, reference.sourceHash].includes(window.location.hash)) {
        clearReference();
      }
    };
    const savedReference = readReference(window.history.state, sourceId, targetId);
    if (savedReference && window.location.hash === `#${targetId}`) setNavigation({ reference: savedReference, direction: "target" });
    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelScroll.current?.();
      restoreBrowserMode();
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [sourceId, targetId]);

  useEffect(() => {
    if (!navigation) return;
    const { reference, direction } = navigation;
    lastReference.current = reference;
    if (previousRestoration.current === null) previousRestoration.current = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const element = document.getElementById(direction === "target" ? targetId : sourceId);
    const resolveTop = () => {
      if (!element) return reference.sourceY;
      const offset = direction === "target" ? Number.parseFloat(window.getComputedStyle(element).scrollMarginTop) || 0 : reference.sourceTop;
      return window.scrollY + element.getBoundingClientRect().top - offset;
    };
    cancelScroll.current = scrollToReadingPosition(resolveTop, element, () => {
      if (direction === "source") {
        lastReference.current = null;
        restoreBrowserMode();
      }
    });
    return () => cancelScroll.current?.();
  }, [navigation, sourceId, targetId]);

  function openReference(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !document.getElementById(targetId)) return;
    event.preventDefault();
    cancelScroll.current?.();
    if (window.location.hash === `#${targetId}`) {
      const existing = readReference(window.history.state, sourceId, targetId);
      const state = { ...window.history.state };
      delete state[historyKey];
      window.history.replaceState(state, "", `${window.location.pathname}${window.location.search}${existing?.sourceHash || `#${sourceId}`}`);
    }
    const reference: ReadingReference = { key: `${Date.now()}-${Math.random()}`, sourceId, targetId, sourceHash: window.location.hash, sourceY: window.scrollY, sourceTop: event.currentTarget.getBoundingClientRect().top };
    lastReference.current = reference;
    window.history.pushState({ ...window.history.state, [historyKey]: reference }, "", event.currentTarget.hash);
    setNavigation({ reference, direction: "target" });
  }

  function returnToSource() {
    if (!navigation) return;
    const { reference } = navigation;
    cancelScroll.current?.();
    const current = readReference(window.history.state, sourceId, targetId);
    if (current?.key === reference.key && window.location.hash === `#${targetId}`) window.history.back();
    else {
      const state = { ...window.history.state };
      delete state[historyKey];
      window.history.replaceState(state, "", `${window.location.pathname}${window.location.search}${reference.sourceHash}`);
      setNavigation({ reference, direction: "source" });
    }
  }

  return { openReference, returnToSource, clearReference, returnAvailable: navigation?.direction === "target" };
}
