"use client";
import { useI18n } from "./i18n";


import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const { locale, t, localize } = useI18n();
  const localizedFamily = useMemo(() => localize(sceneFamily), [localize]);
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneController | undefined>(undefined);
  const transitionRef = useRef<Animation | null>(null);
  const previousAbilityRef = useRef(abilityId);
  const reducedMotion = useReducedMotion();
  const presentationRef = useRef(capabilitySceneSpecs[abilityId]);
  presentationRef.current = { ...localize(capabilitySceneSpecs[abilityId]), reducedMotion: Boolean(reducedMotion) };
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
      controller = module.createCapabilityScene(host, presentationRef.current, localizedFamily);
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
      transitionRef.current?.cancel();
      transitionRef.current = null;
      controller?.dispose();
      if (sceneRef.current === controller) sceneRef.current = undefined;
    };
  }, [locale]);

  useEffect(() => {
    const changed = previousAbilityRef.current !== abilityId;
    previousAbilityRef.current = abilityId;
    transitionRef.current?.cancel();
    transitionRef.current = null;
    // setSpec draws the new first frame synchronously in the existing canvas.
    sceneRef.current?.setSpec(presentationRef.current);
    if (!changed || state !== "ready" || reducedMotion || !hostRef.current?.animate) return;
    const transition = hostRef.current.animate([{ opacity: 0.8 }, { opacity: 1 }], {
      duration: 200, easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    });
    transitionRef.current = transition;
    transition.onfinish = () => {
      if (transitionRef.current === transition) transitionRef.current = null;
    };
  }, [abilityId, reducedMotion, state]);

  return <div className="capability-visual" ref={hostRef} role="img"
    aria-label={t(capabilitySceneDescriptions[abilityId])} aria-busy={state === "loading"}
    data-renderer={state} data-ability-visual={abilityId}>
    {t(state === "loading" && <span className="cv-render-loading" aria-hidden="true">{t("正在准备展示…")}</span>)}
    {t(state === "unavailable" && <p className="cv-render-fallback">{t(capabilitySceneDescriptions[abilityId])}</p>)}
  </div>;
}
