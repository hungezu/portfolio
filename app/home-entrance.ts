import { useLayoutEffect, useState } from "react";

export type HomeOpeningPhase = "waiting" | "visible" | "settled";

export function initialHomeOpeningPhase(): HomeOpeningPhase {
  if (typeof window === "undefined") return "settled";
  const params = new URLSearchParams(window.location.search);
  const returningToWork = params.has("returnProject") || params.get("returnSection") === "work" || document.documentElement.hasAttribute("data-project-motion");
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return returningToWork || navigation?.type === "reload" || navigation?.type === "back_forward" ? "settled" : "waiting";
}

export function homeEntranceTiming(reduce: boolean | null) {
  if (reduce) {
    return {
      copyDelay: 0,
      copyDuration: 0.16,
      actionDelay: 0,
      actionDuration: 0.16,
      navigationDelay: 0,
      assistantDelay: 0.16,
      mediaDuration: 0.2,
    };
  }
  const followsIntro = typeof document !== "undefined" &&
    document.documentElement.classList.contains("portfolio-lj-intro-complete");
  if (followsIntro) {
    return {
      copyDelay: 0.06,
      copyDuration: 0.7,
      actionDelay: 0.08,
      actionDuration: 0.24,
      navigationDelay: 0,
      assistantDelay: 0.85,
      mediaDuration: 0.65,
    };
  }
  const copyDelay = 0.42;
  const copyDuration = 1.2;
  const actionDelay = copyDelay + copyDuration + 0.08;
  const actionDuration = 0.4;
  return {
    copyDelay,
    copyDuration,
    actionDelay,
    actionDuration,
    navigationDelay: 0.28,
    assistantDelay: actionDelay + actionDuration + 0.04,
    mediaDuration: 1.1,
  };
}

// Global controls must be available on deep links even when the Hero is offscreen.
export function useHomeOpeningPhase() {
  const [phase, setPhase] = useState(initialHomeOpeningPhase);

  useLayoutEffect(() => {
    if (phase !== "waiting") return;
    const root = document.documentElement;
    const cleanup = () => {
      observer.disconnect();
      window.removeEventListener("portfolio-loader-exit", reveal);
      document.removeEventListener("visibilitychange", reveal);
    };
    const reveal = () => {
      if (document.visibilityState !== "visible" || root.classList.contains("portfolio-loading") ||
        document.getElementById("portfolio-boot")) return;
      cleanup();
      setPhase("visible");
    };
    const observer = new MutationObserver(reveal);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("portfolio-loader-exit", reveal);
    document.addEventListener("visibilitychange", reveal);
    reveal();
    return cleanup;
  }, [phase]);

  return phase;
}
