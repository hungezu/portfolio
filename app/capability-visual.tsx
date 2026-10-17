"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { AbilityId } from "./portfolio-data";
import { capabilitySceneDescriptions, capabilitySceneSpecs } from "./capability-models";
import "./capability-visual.css";

const sceneFamily = Object.values(capabilitySceneSpecs);
type SceneController = ReturnType<typeof import("./capability-scene").createCapabilityScene>;
let sceneModule: Promise<typeof import("./capability-scene")> | undefined;

function loadSceneModule() {
  sceneModule ??= import("./capability-scene").catch(error => {
    sceneModule = undefined;
    throw error;
  });
  return sceneModule;
}

export function CapabilityVisual({ abilityId }: { abilityId: AbilityId }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneController | undefined>(undefined);
  const reducedMotion = useReducedMotion();
  const presentationRef = useRef(capabilitySceneSpecs[abilityId]);
  presentationRef.current = { ...capabilitySceneSpecs[abilityId], reducedMotion: Boolean(reducedMotion) };
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    if (!hostRef.current) return;
    const host = hostRef.current;
    let cancelled = false;
    let controller: SceneController | undefined;
    setState("loading");
    // Start behind the existing page loader, before the first downward scroll.
    loadSceneModule().then(async module => {
      if (cancelled) return;
      controller = module.createCapabilityScene(host, presentationRef.current, sceneFamily);
      sceneRef.current = controller;
      await controller.ready;
      if (!cancelled) setState("ready");
    }).catch(() => {
      if (cancelled) return;
      controller?.dispose();
      if (sceneRef.current === controller) sceneRef.current = undefined;
      setState("unavailable");
    });
    return () => {
      cancelled = true;
      controller?.dispose();
      if (sceneRef.current === controller) sceneRef.current = undefined;
    };
  }, [reducedMotion]);

  useEffect(() => {
    sceneRef.current?.setSpec(presentationRef.current);
  }, [abilityId, reducedMotion]);

  return <div className="capability-visual" ref={hostRef} role="img"
    aria-label={capabilitySceneDescriptions[abilityId]} aria-busy={state === "loading"}
    data-renderer={state} data-ability-visual={abilityId}>
    {state === "loading" && <span className="cv-render-loading" aria-hidden="true">正在准备展示…</span>}
    {state === "unavailable" && <p className="cv-render-fallback">{capabilitySceneDescriptions[abilityId]}</p>}
  </div>;
}
