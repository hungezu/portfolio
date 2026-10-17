"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { AbilityId } from "./portfolio-data";
import { capabilitySceneDescriptions, capabilitySceneSpecs } from "./capability-models";
import "./capability-visual.css";

const sceneFamily = Object.values(capabilitySceneSpecs);

export function CapabilityVisual({ abilityId }: { abilityId: AbilityId }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const inView = useInView(hostRef, { margin: "200px", once: true });
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    if (!inView || !hostRef.current) return;
    const host = hostRef.current;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    setState("loading");
    import("./capability-scene").then(module => {
      if (cancelled) return;
      const scene = module.createCapabilityScene(host, {
        ...capabilitySceneSpecs[abilityId], reducedMotion: Boolean(reducedMotion),
      }, sceneFamily);
      dispose = scene.dispose;
      setState("ready");
    }).catch(() => { if (!cancelled) setState("unavailable"); });
    return () => { cancelled = true; dispose?.(); };
  }, [abilityId, inView, reducedMotion]);

  return <div className="capability-visual" ref={hostRef} role="img"
    aria-label={capabilitySceneDescriptions[abilityId]} data-renderer={state} data-ability-visual={abilityId}>
    {state === "unavailable" && <p className="cv-render-fallback">{capabilitySceneDescriptions[abilityId]}</p>}
  </div>;
}
