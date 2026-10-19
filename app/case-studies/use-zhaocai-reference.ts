"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const historyKey = "zhaocaiReadingReference";
let nextSourceId = 0;

type ReadingReference = {
  key: string;
  sourceId: string;
  sourceHash: string;
  sourceY: number;
  sourceTop: number;
  targetId: string;
};
type Navigation = { reference: ReadingReference; direction: "target" | "source" };

function readReference(state: unknown): ReadingReference | null {
  if (!state || typeof state !== "object") return null;
  const value = (state as Record<string, unknown>)[historyKey];
  if (!value || typeof value !== "object") return null;
  const reference = value as ReadingReference;
  return typeof reference.key === "string"
    && typeof reference.sourceId === "string" && Boolean(reference.sourceId)
    && typeof reference.targetId === "string" && Boolean(reference.targetId)
    && typeof reference.sourceHash === "string"
    && (!reference.sourceHash || reference.sourceHash.startsWith("#"))
    && Number.isFinite(reference.sourceY) && Number.isFinite(reference.sourceTop)
    ? reference : null;
}

function stateWithoutReference() {
  const state = { ...window.history.state };
  delete state[historyKey];
  return state;
}

function matchesHash(id: string) {
  try { return decodeURIComponent(window.location.hash.slice(1)) === id; }
  catch { return window.location.hash.slice(1) === id; }
}

function focusWithoutScrolling(element: HTMLElement | null) {
  if (!element?.isConnected) return;
  if (!element.hasAttribute("tabindex") && element.tabIndex < 0) {
    element.setAttribute("tabindex", "-1");
    element.addEventListener("blur", () => {
      if (element.getAttribute("tabindex") === "-1") element.removeAttribute("tabindex");
    }, { once: true });
  }
  element.focus({ preventScroll: true });
}

/** Re-resolve the destination while React commits and images change the layout. */
function scrollToReadingPosition(
  resolveElement: () => HTMLElement | null,
  resolveTop: (element: HTMLElement | null) => number,
  onFinish: () => void,
) {
  const requestedAt = performance.now();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let start = window.scrollY;
  let startedAt: number | null = null;
  let duration = 0;
  let stableSince = requestedAt;
  let previousDestination: number | null = null;
  let frame = 0;
  let stopped = false;
  const clamp = (top: number) => Math.max(0, Math.min(top,
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight)));

  const stop = () => {
    if (stopped) return false;
    stopped = true;
    window.cancelAnimationFrame(frame);
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("pointerdown", cancel);
    window.removeEventListener("keydown", cancelOnKey);
    return true;
  };
  const cancel = () => { if (stop()) onFinish(); };
  const cancelOnKey = (event: KeyboardEvent) => {
    if (["Escape", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Tab"].includes(event.key)) cancel();
  };
  const animate = (now: number) => {
    const element = resolveElement();
    // A conditional demo can mount on the same click as this navigation.
    if (!element && now - requestedAt < 1600) {
      frame = window.requestAnimationFrame(animate);
      return;
    }
    const destination = clamp(resolveTop(element));
    if (startedAt === null) {
      start = window.scrollY;
      startedAt = now;
      duration = reducedMotion ? 0 : Math.min(900, Math.max(360, Math.abs(destination - start) * 0.18));
      stableSince = now;
    }
    if (previousDestination === null || Math.abs(destination - previousDestination) > 0.5) stableSince = now;
    previousDestination = destination;
    const progress = duration === 0 ? 1 : Math.min((now - startedAt) / duration, 1);
    window.scrollTo({ top: start + (destination - start) * (1 - (1 - progress) ** 3), behavior: "instant" });
    const settled = progress === 1 && now - Math.max(stableSince, startedAt + duration) >= 180;
    if (settled || now - startedAt >= duration + 1600) {
      window.scrollTo({ top: clamp(resolveTop(resolveElement())), behavior: "instant" });
      focusWithoutScrolling(resolveElement());
      if (stop()) onFinish();
    } else frame = window.requestAnimationFrame(animate);
  };
  window.addEventListener("wheel", cancel, { passive: true });
  window.addEventListener("touchstart", cancel, { passive: true });
  window.addEventListener("pointerdown", cancel, { passive: true });
  window.addEventListener("keydown", cancelOnKey);
  frame = window.requestAnimationFrame(animate);
  return cancel;
}

/** One shared return path for the case study's rule and demo references. */
export function useZhaocaiReference() {
  const [navigation, setNavigation] = useState<Navigation | null>(null);
  const navigationRef = useRef<Navigation | null>(null);
  const lastReference = useRef<ReadingReference | null>(null);
  const sourceElements = useRef(new Map<string, HTMLElement>());
  const generatedIds = useRef(new Map<HTMLElement, string>());
  const invalidatedKeys = useRef(new Set<string>());
  const cancelScroll = useRef<(() => void) | null>(null);
  const previousRestoration = useRef<ScrollRestoration | null>(null);

  const restoreBrowserMode = useCallback(() => {
    if (previousRestoration.current !== null) window.history.scrollRestoration = previousRestoration.current;
    previousRestoration.current = null;
  }, []);
  const navigate = useCallback((next: Navigation | null) => {
    navigationRef.current = next;
    setNavigation(next);
  }, []);
  const clearReference = useCallback(() => {
    const reference = lastReference.current ?? navigationRef.current?.reference ?? readReference(window.history.state);
    if (reference) invalidatedKeys.current.add(reference.key);
    cancelScroll.current?.();
    cancelScroll.current = null;
    lastReference.current = null;
    navigate(null);
    restoreBrowserMode();
    if (readReference(window.history.state)) window.history.replaceState(stateWithoutReference(), "");
  }, [navigate, restoreBrowserMode]);

  useEffect(() => {
    const validReference = () => {
      const reference = readReference(window.history.state);
      return reference && !invalidatedKeys.current.has(reference.key) ? reference : null;
    };
    const onPopState = () => {
      cancelScroll.current?.();
      const reference = validReference();
      if (reference && matchesHash(reference.targetId)) {
        lastReference.current = reference;
        navigate({ reference, direction: "target" });
      } else if (lastReference.current && window.location.hash === lastReference.current.sourceHash) {
        navigate({ reference: lastReference.current, direction: "source" });
      } else {
        lastReference.current = null;
        navigate(null);
        restoreBrowserMode();
      }
    };
    const onHashChange = () => {
      const reference = lastReference.current;
      if (reference && !matchesHash(reference.targetId) && window.location.hash !== reference.sourceHash) clearReference();
    };
    const savedReference = validReference();
    if (savedReference && matchesHash(savedReference.targetId)) {
      lastReference.current = savedReference;
      navigate({ reference: savedReference, direction: "target" });
    }
    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelScroll.current?.();
      restoreBrowserMode();
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onHashChange);
      for (const [element, id] of generatedIds.current) {
        if (element.id === id) element.removeAttribute("id");
      }
    };
  }, [clearReference, navigate, restoreBrowserMode]);

  useEffect(() => {
    if (!navigation) return;
    const { reference, direction } = navigation;
    lastReference.current = reference;
    if (previousRestoration.current === null) previousRestoration.current = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const resolveElement = () => {
      if (direction === "target") return document.getElementById(reference.targetId);
      const source = sourceElements.current.get(reference.sourceId);
      return source?.isConnected ? source : document.getElementById(reference.sourceId);
    };
    const resolveTop = (element: HTMLElement | null) => {
      if (!element) return reference.sourceY;
      const offset = direction === "target"
        ? Number.parseFloat(window.getComputedStyle(element).scrollMarginTop) || 0
        : reference.sourceTop;
      return window.scrollY + element.getBoundingClientRect().top - offset;
    };
    const cancel = scrollToReadingPosition(resolveElement, resolveTop, () => {
      if (direction === "source" && lastReference.current?.key === reference.key) {
        lastReference.current = null;
        restoreBrowserMode();
      }
    });
    cancelScroll.current = cancel;
    return cancel;
  }, [navigation, restoreBrowserMode]);

  const openReference = useCallback((source: HTMLElement, targetId: string) => {
    if (!source.isConnected || !targetId) return;
    cancelScroll.current?.();
    let sourceId = source.id;
    if (!sourceId) {
      do { sourceId = `zhaocai-reference-source-${++nextSourceId}`; }
      while (document.getElementById(sourceId));
      source.id = sourceId;
      generatedIds.current.set(source, sourceId);
    }
    sourceElements.current.set(sourceId, source);
    // The current entry becomes the latest source, including when two targets
    // share a hash. This keeps a single return path instead of stacking banners.
    if (readReference(window.history.state)) window.history.replaceState(stateWithoutReference(), "");
    const reference: ReadingReference = {
      key: `${Date.now()}-${Math.random()}`,
      sourceId, targetId, sourceHash: window.location.hash,
      sourceY: window.scrollY, sourceTop: source.getBoundingClientRect().top,
    };
    lastReference.current = reference;
    window.history.pushState({ ...window.history.state, [historyKey]: reference }, "",
      `${window.location.pathname}${window.location.search}#${encodeURIComponent(targetId)}`);
    navigate({ reference, direction: "target" });
  }, [navigate]);

  const returnToSource = useCallback(() => {
    const currentNavigation = navigationRef.current;
    if (!currentNavigation || currentNavigation.direction !== "target") return;
    const { reference } = currentNavigation;
    cancelScroll.current?.();
    const current = readReference(window.history.state);
    if (current?.key === reference.key && matchesHash(reference.targetId)) window.history.back();
    else {
      window.history.replaceState(stateWithoutReference(), "",
        `${window.location.pathname}${window.location.search}${reference.sourceHash}`);
      navigate({ reference, direction: "source" });
    }
  }, [navigate]);

  return {
    openReference, returnToSource, clearReference,
    returnAvailable: navigation?.direction === "target",
    targetId: navigation?.direction === "target" ? navigation.reference.targetId : null,
  };
}
