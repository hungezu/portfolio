import { useLayoutEffect, useState } from "react";

export type HomeOpeningPhase = "waiting" | "visible" | "settled";

export function initialHomeOpeningPhase(): HomeOpeningPhase {
  if (typeof window === "undefined") return "settled";
  const params = new URLSearchParams(window.location.search);
  const returningToWork = params.has("returnProject") || params.get("returnSection") === "work";
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return returningToWork || navigation?.type === "back_forward" ? "settled" : "waiting";
}

export function homeEntranceTiming(reduce: boolean | null) {
  const copyDelay = reduce ? 0.28 : 0.42;
  const copyDuration = reduce ? 1.05 : 1.2;
  const actionDelay = copyDelay + copyDuration + 0.08;
  const actionDuration = reduce ? 0.3 : 0.4;
  return {
    copyDelay,
    copyDuration,
    actionDelay,
    actionDuration,
    navigationDelay: reduce ? 0.18 : 0.28,
    assistantDelay: actionDelay + actionDuration + 0.04,
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
