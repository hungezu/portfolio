"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { cancelHomeScroll } from "./home-scroll";
import { imageLanding, parseProjectRoute, titleLanding, type MotionRect, type ProjectRoute } from "./project-transition-geometry";
import "./project-transition.css";

const navigationEvent = "portfolio-project-navigation";
const showcaseSelectEvent = "portfolio-showcase-select";
const returnKey = "portfolioCardReturn";
const positionKey = "portfolioRoutePosition";
const easing = "cubic-bezier(0.16, 1, 0.3, 1)";
type Request = { url: string; slug: string; direction: "forward" | "back"; trigger?: HTMLElement; keyboard?: boolean };
type Options = { slugs: string[]; prepare: (slug: string) => Promise<unknown> };
type RoutePosition = { id: string; y: number };

export function requestProjectNavigation(request: Request) {
  const event = new CustomEvent<Request>(navigationEvent, { detail: request, cancelable: true });
  if (window.dispatchEvent(event)) window.location.assign(request.url);
}

function rect(element: HTMLElement): MotionRect {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { left, top, width, height };
}

function visible(element: HTMLElement | null): element is HTMLElement {
  if (!element) return false;
  const box = rect(element);
  return box.width > 0 && box.height > 0 && box.top < innerHeight && box.top + box.height > 0;
}

function caseAnchors() {
  return {
    title: document.querySelector<HTMLElement>('[data-project-motion-title], .gkx-hero__name, .zc4-opening-identity h1, .case-heading h1'),
    media: document.querySelector<HTMLElement>('.gkx-hero__frame .gkx-image-button, .zc4-opening-task, .legacy-evidence-open img'),
  };
}

function cardAnchors(slug: string) {
  const card = [...document.querySelectorAll<HTMLElement>(".project-card")].find(element => element.dataset.project === slug);
  return { card, title: card?.querySelector<HTMLElement>(".project-copy h3") ?? card?.querySelector<HTMLElement>("h3") ?? null, media: card?.querySelector<HTMLElement>(".project-visual") ?? null };
}

function cardExpanded(card: HTMLElement | undefined) {
  return Boolean(card && (!card.closest(".project-showcase") || card.classList.contains("is-expanded")));
}

function cardFocusTarget(slug: string) {
  const { card, title } = cardAnchors(slug);
  const link = card?.querySelector<HTMLElement>(".project-card-link");
  return cardExpanded(card) && link && !link.hasAttribute("inert") && link.getAttribute("aria-hidden") !== "true"
    ? link
    : card?.querySelector<HTMLElement>(".project-exhibit-toggle") ?? title;
}

const snapshotProperties = [
  "display", "position", "inset", "box-sizing", "width", "height", "min-width", "max-width", "min-height", "max-height",
  "margin", "padding", "gap", "grid-template-columns", "grid-template-rows", "flex-direction", "align-items", "justify-content",
  "font-family", "font-size", "font-weight", "font-style", "line-height", "letter-spacing", "color", "text-align", "white-space",
  "background", "border", "border-radius", "overflow", "object-fit", "object-position", "vertical-align", "opacity",
];

function snapshot(element: HTMLElement, layer: HTMLElement) {
  const box = rect(element);
  const host = document.createElement("div");
  host.className = "project-motion-actor";
  Object.assign(host.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
  const clone = element.cloneNode(true) as HTMLElement;
  const originalNodes = [element, ...element.querySelectorAll<HTMLElement>("*")];
  const clonedNodes = [clone, ...clone.querySelectorAll<HTMLElement>("*")];
  originalNodes.forEach((original, index) => {
    const copied = clonedNodes[index];
    const style = getComputedStyle(original);
    snapshotProperties.forEach(property => copied.style.setProperty(property, style.getPropertyValue(property)));
    copied.removeAttribute("id");
    if (copied.tagName.toLowerCase() === "a") copied.removeAttribute("href");
    copied.removeAttribute("name");
    copied.removeAttribute("autofocus");
    copied.setAttribute("tabindex", "-1");
    copied.style.animation = "none";
    copied.style.transition = "none";
  });
  Object.assign(clone.style, { position: "relative", inset: "auto", margin: "0", width: "100%", height: "100%", maxWidth: "none", transform: "none" });
  host.append(clone);
  layer.append(host);
  return { host, box, font: Number.parseFloat(getComputedStyle(element).fontSize) || 16 };
}

function imageIn(element: HTMLElement): HTMLImageElement | null {
  return element instanceof HTMLImageElement ? element : element.querySelector("img");
}

function canSnapshotMedia(element: HTMLElement | null): element is HTMLElement {
  return Boolean(element && (imageIn(element) || element.querySelector("svg image")));
}

function imageIdentity(element: HTMLElement): string | undefined {
  return element.closest<HTMLElement>("[data-project-motion-media]")?.dataset.projectMotionMedia ?? imageIn(element)?.getAttribute("data-motion-source") ?? undefined;
}

function waitForTarget(direction: Request["direction"], slug: string, signal: AbortSignal): Promise<ReturnType<typeof caseAnchors>> {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const poll = () => {
      if (signal.aborted) { reject(new DOMException("Cancelled", "AbortError")); return; }
      const home = direction === "back" ? cardAnchors(slug) : undefined;
      const anchors = home ?? caseAnchors();
      if ((!home || cardExpanded(home.card)) && anchors.title && rect(anchors.title).width > 0 && rect(anchors.title).height > 0) { resolve(anchors); return; }
      if (document.querySelector('.case-loading[role="alert"]') || performance.now() - start > 2000) {
        reject(new Error("Project content is not ready")); return;
      }
      window.setTimeout(poll, 16);
    };
    poll();
  });
}

function focusLanding(element: HTMLElement | null, keyboard?: boolean) {
  if (!element || !keyboard) return;
  const hadTabindex = element.hasAttribute("tabindex");
  if (!hadTabindex) element.setAttribute("tabindex", "-1");
  element.focus({ preventScroll: true });
  if (!hadTabindex) element.addEventListener("blur", () => element.removeAttribute("tabindex"), { once: true });
}

export function useProjectNavigation(initial: { projectSlug?: string; projectView?: ProjectRoute["projectView"] }, options: Options) {
  const [route, setRoute] = useState<ProjectRoute>(() => ({ ...initial, url: typeof window === "undefined" ? "" : location.pathname + location.search + location.hash }));
  const current = useRef(route);
  const controller = useRef<AbortController | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useLayoutEffect(() => {
    let disposed = false;
    let entrySequence = 0;
    const positions = new Map<string, number>();
    const routeUrl = () => location.pathname + location.search + location.hash;
    const newPosition = (y = 0): RoutePosition => ({ id: `${Date.now().toString(36)}-${++entrySequence}`, y });
    const readPosition = (): RoutePosition | undefined => {
      const value = history.state?.[positionKey];
      return value && typeof value.id === "string" && Number.isFinite(value.y) ? value : undefined;
    };
    let activePosition = readPosition() ?? newPosition(Math.max(0, scrollY));
    let activeUrl = routeUrl();
    positions.set(activePosition.id, activePosition.y);
    history.replaceState({ ...history.state, [positionKey]: activePosition }, "");
    const capturePosition = () => {
      if (disposed || controller.current) return;
      // Same-page section links create history entries outside this hook.
      if (activeUrl !== routeUrl()) {
        activePosition = readPosition() ?? newPosition(Math.max(0, scrollY));
        activeUrl = routeUrl();
        history.replaceState({ ...history.state, [positionKey]: activePosition }, "");
      }
      positions.set(activePosition.id, Math.max(0, scrollY));
    };
    const persistPosition = () => {
      if (disposed || controller.current) return;
      capturePosition();
      history.replaceState({ ...history.state, [positionKey]: { ...activePosition, y: positions.get(activePosition.id) ?? activePosition.y } }, "");
    };
    const announcement = document.createElement("div");
    announcement.className = "project-route-announcement";
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    document.body.append(announcement);

    async function navigate(request: Request, pop = false) {
      const target = parseProjectRoute(request.url, location.origin, optionsRef.current.slugs);
      if (!target || disposed) return;
      if (!pop && controller.current) return;
      if (!pop) persistPosition();
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;
      const root = document.documentElement;
      const fromProject = Boolean(current.current.projectSlug);
      const source = request.direction === "back" || fromProject ? caseAnchors() : cardAnchors(request.slug);
      const dialogOpen = [...document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]')].some(element => rect(element).width > 0 && rect(element).height > 0);
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches || request.direction === "back" && (!visible(source.title) || dialogOpen || document.body.classList.contains("menu-is-open"));
      const duration = reduce ? 120 : innerWidth <= 767 ? 340 : 400;
      const previousRestoration = history.scrollRestoration;
      const sourceCard = request.direction === "forward" && !fromProject ? cardAnchors(request.slug).card : undefined;
      const layer = document.createElement("div");
      layer.className = "project-motion-layer";
      layer.setAttribute("aria-hidden", "true");
      const canvas = document.createElement("div");
      canvas.className = "project-motion-canvas";
      layer.append(canvas);
      const sourceTitle = !reduce && visible(source.title) ? snapshot(source.title, layer) : null;
      const sourceMedia = !reduce && visible(source.media) && canSnapshotMedia(source.media) ? snapshot(source.media, layer) : null;
      if (sourceTitle) sourceTitle.host.style.zIndex = "3";
      if (sourceTitle) source.title!.dataset.projectMotionHidden = "true";
      if (sourceMedia) source.media!.dataset.projectMotionHidden = "true";
      sourceCard?.classList.add("project-motion-source");
      request.trigger?.setAttribute("aria-busy", "true");
      announcement.textContent = "";
      let committed = false;
      let targetTitle: HTMLElement | null = null;
      let targetMedia: HTMLElement | null = null;
      const animations: Animation[] = [];
      let deadline = 0;
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        clearTimeout(deadline);
        animations.forEach(animation => animation.cancel());
        layer.remove();
        root.removeAttribute("data-project-motion");
        history.scrollRestoration = committed && request.direction === "back" ? "auto" : previousRestoration;
        sourceCard?.classList.remove("project-motion-source");
        source.title?.removeAttribute("data-project-motion-hidden");
        source.media?.removeAttribute("data-project-motion-hidden");
        request.trigger?.removeAttribute("aria-busy");
        targetTitle?.removeAttribute("data-project-motion-hidden");
        targetMedia?.removeAttribute("data-project-motion-hidden");
        removeEventListener("keydown", interrupt);
        removeEventListener("resize", interrupt);
        removeEventListener("wheel", interrupt);
        removeEventListener("touchstart", interrupt);
        if (controller.current === abort) controller.current = null;
        if (committed && !disposed) {
          persistPosition();
          const landing = target.projectSlug
            ? targetTitle ?? document.querySelector<HTMLElement>("main h1")
            : cardFocusTarget(request.slug);
          focusLanding(landing, request.keyboard || pop);
          const name = (targetTitle ?? landing)?.textContent?.trim() ?? document.title;
          const english = document.documentElement.lang.startsWith("en");
          announcement.textContent = target.projectSlug
            ? english ? `Opened ${name}` : `已打开${name}`
            : english ? `Returned to selected work: ${name}` : `已返回精选作品：${name}`;
        }
      };
      const interrupt = (event: Event) => {
        if (event instanceof KeyboardEvent && !["Escape", "Tab", " ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        abort.abort();
      };
      abort.signal.addEventListener("abort", finish, { once: true });
      addEventListener("keydown", interrupt);
      addEventListener("resize", interrupt);
      addEventListener("wheel", interrupt, { passive: true });
      addEventListener("touchstart", interrupt, { passive: true });
      cancelHomeScroll();
      history.scrollRestoration = "manual";
      document.body.append(layer);
      canvas.style.opacity = "0";
      try {
        if (request.direction === "forward") await Promise.race([optionsRef.current.prepare(request.slug), new Promise(resolve => setTimeout(resolve, 1500))]);
        if (abort.signal.aborted || disposed) return;
        const params = new URL(request.url, location.origin).searchParams;
        const y = params.has("returnY") ? Number(params.get("returnY")) : NaN;
        const remembered = (history.state?.[returnKey] ?? {}) as { slug?: string; y?: number };
        const rememberedY = remembered.slug === request.slug ? remembered.y : undefined;
        const entryPosition = pop ? readPosition() : undefined;
        const restoredY = entryPosition ? positions.get(entryPosition.id) ?? entryPosition.y : undefined;
        if (request.direction === "back") target.homeRestore = { slug: request.slug, y: Number.isFinite(restoredY) ? restoredY! : Number.isFinite(rememberedY) ? rememberedY! : Number.isFinite(y) ? Math.max(0, y) : NaN };
        if (!pop) {
          const sourceY = Math.max(0, scrollY);
          if (request.direction === "forward" && !fromProject) history.replaceState({ ...history.state, [returnKey]: { slug: request.slug, y: sourceY } }, "");
          const homeY = request.direction === "back" ? target.homeRestore?.y : !fromProject ? sourceY : undefined;
          activePosition = newPosition(request.direction === "back" && Number.isFinite(homeY) ? homeY! : 0);
          history.pushState({ [returnKey]: { slug: request.slug, ...(Number.isFinite(homeY) ? { y: homeY } : {}) }, [positionKey]: activePosition }, "", target.url);
        } else {
          activePosition = entryPosition ?? newPosition();
          if (!entryPosition) history.replaceState({ ...history.state, [positionKey]: activePosition }, "");
        }
        activeUrl = routeUrl();
        target.motionEntry = true;
        canvas.style.opacity = "1";
        root.dataset.projectMotion = "preparing";
        current.current = target;
        flushSync(() => setRoute(target));
        committed = true;
        // The showcase listener mounts in a layout effect. Expand the returning
        // project synchronously before restoring scroll or measuring its actors.
        if (!target.projectSlug) flushSync(() => window.dispatchEvent(new CustomEvent(showcaseSelectEvent, { detail: { slug: request.slug } })));
        if (request.direction === "forward") scrollTo({ top: restoredY ?? 0, left: 0, behavior: "instant" });
        const destination = await waitForTarget(request.direction, request.slug, abort.signal);
        if (abort.signal.aborted) return;
        if (request.direction === "forward" && Number.isFinite(restoredY)) scrollTo({ top: restoredY!, left: 0, behavior: "instant" });
        if (target.homeRestore && Number.isFinite(target.homeRestore.y)) scrollTo({ top: target.homeRestore.y, left: 0, behavior: "instant" });
        targetTitle = destination.title;
        targetMedia = destination.media;
        const title = visible(targetTitle) && !reduce ? snapshot(targetTitle, layer) : null;
        const media = visible(targetMedia) && !reduce && canSnapshotMedia(targetMedia) ? snapshot(targetMedia, layer) : null;
        if (title) { targetTitle!.dataset.projectMotionHidden = "true"; title.host.style.opacity = "0"; title.host.style.zIndex = "3"; }
        if (media) { targetMedia!.dataset.projectMotionHidden = "true"; media.host.style.opacity = "0"; }
        root.dataset.projectMotion = "running";
        const play = (element: HTMLElement, frames: Keyframe[], milliseconds = duration, delay = 0) => {
          const animation = element.animate(frames, { duration: milliseconds, delay, easing, fill: "both" });
          animations.push(animation);
        };
        if (reduce) {
          play(canvas, [{ opacity: 1 }, { opacity: 0 }], duration);
        } else {
          play(canvas, [{ opacity: 1 }, { opacity: 0 }], duration - 40);
          if (sourceTitle && title) {
            play(sourceTitle.host, [{ transform: "none" }, { transform: titleLanding(sourceTitle.box, title.box, sourceTitle.font, title.font) }], duration - 80);
            play(sourceTitle.host, [{ opacity: 1 }, { opacity: 0 }], 80, duration - 120);
          } else if (sourceTitle) play(sourceTitle.host, [{ opacity: 1 }, { opacity: 0 }], 140);
          if (title) play(title.host, [{ opacity: 0 }, { opacity: 1 }], 120, duration - 160);
          const sourceImage = source.media && imageIn(source.media);
          const targetImage = targetMedia && imageIn(targetMedia);
          const sameImage = source.media && targetMedia && imageIdentity(source.media) && imageIdentity(source.media) === imageIdentity(targetMedia) && sourceImage && targetImage && targetImage.complete && targetImage.naturalWidth > 0;
          if (sameImage && media && sourceMedia && sourceImage.naturalWidth && sourceImage.naturalHeight) {
            sourceMedia.host.remove();
            const landing = imageLanding(sourceMedia.box, media.box, sourceImage.naturalWidth, sourceImage.naturalHeight);
            const image = media.host.querySelector("img")!;
            media.host.style.opacity = "1";
            media.host.style.overflow = "hidden";
            play(media.host, [{ transform: landing.frame }, { transform: "none" }], duration - 40);
            play(image, [{ transform: landing.image, objectPosition: getComputedStyle(sourceImage).objectPosition }, { transform: "none", objectPosition: getComputedStyle(targetImage).objectPosition }], duration - 40);
          } else {
            if (sourceMedia) play(sourceMedia.host, [{ opacity: 1 }, { opacity: 0 }], 140, media ? duration - 160 : 0);
            if (media) play(media.host, [{ opacity: 0 }, { opacity: 1 }], 160, duration - 160);
          }
        }
        const scene = document.querySelector<HTMLElement>(".portfolio-route-scene");
        if (scene) play(scene, [{ opacity: 0 }, { opacity: 1 }], reduce ? duration : duration - 40);
        // Move the reading content, leaving fixed navigation and shared actors in viewport space.
        const arrival = target.projectSlug
          ? document.querySelector<HTMLElement>(".gkx-hero, .zc4-hero, .case-hero")
          : cardAnchors(request.slug).card;
        if (arrival && !reduce) {
          const offset = request.direction === "forward" ? 14 : -10;
          play(arrival, [{ transform: `translate3d(0, ${offset}px, 0)` }, { transform: "translate3d(0, 0, 0)" }], duration - 40);
        }
        deadline = window.setTimeout(finish, duration + 40);
        void Promise.all(animations.map(animation => animation.finished.catch(() => undefined))).then(finish);
      } catch {
        finish();
        // A rejected prefetch must not consume a valid link before a route has mounted.
        if (!committed && !abort.signal.aborted && !disposed) window.location.assign(target.url);
      } finally {
        if (abort.signal.aborted) finish();
      }
    }
    const onRequest = (event: Event) => {
      const request = event as CustomEvent<Request>;
      if (!parseProjectRoute(request.detail.url, location.origin, optionsRef.current.slugs)) return;
      request.preventDefault();
      void navigate(request.detail);
    };
    const onPop = () => {
      const target = parseProjectRoute(location.href, location.origin, optionsRef.current.slugs);
      if (!target) return;
      if (target.projectSlug === current.current.projectSlug && target.projectView === current.current.projectView) {
        activePosition = readPosition() ?? newPosition(Math.max(0, scrollY));
        activeUrl = routeUrl();
        return;
      }
      const slug = target.projectSlug ?? current.current.projectSlug;
      if (!slug) return;
      void navigate({ url: target.url, slug, direction: target.projectSlug ? "forward" : "back" }, true);
    };
    const onCaseWorkLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !current.current.projectSlug) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor?.closest(".case-page") || anchor.hasAttribute("download") || anchor.target && anchor.target !== "_self") return;
      const destination = parseProjectRoute(anchor.href, location.origin, optionsRef.current.slugs);
      if (!destination || destination.projectSlug || new URL(anchor.href).hash !== "#work") return;
      const slug = current.current.projectSlug;
      const remembered = history.state?.[returnKey] as { slug?: string; y?: number } | undefined;
      const saved = (remembered?.slug === slug ? remembered.y : undefined) ?? new URLSearchParams(location.search).get("returnY");
      const url = new URL("/portfolio/", location.origin);
      url.searchParams.set("returnProject", slug);
      if (saved !== null && saved !== undefined && Number.isFinite(Number(saved))) url.searchParams.set("returnY", String(saved));
      else url.searchParams.set("returnSection", "work");
      event.preventDefault();
      void navigate({ url: url.href, slug, direction: "back", trigger: anchor, keyboard: event.detail === 0 });
    };
    addEventListener(navigationEvent, onRequest);
    addEventListener("popstate", onPop);
    addEventListener("scroll", capturePosition, { passive: true });
    addEventListener("pagehide", persistPosition);
    document.addEventListener("click", onCaseWorkLink);
    return () => { disposed = true; controller.current?.abort(); announcement.remove(); removeEventListener(navigationEvent, onRequest); removeEventListener("popstate", onPop); removeEventListener("scroll", capturePosition); removeEventListener("pagehide", persistPosition); document.removeEventListener("click", onCaseWorkLink); };
  }, []);
  return route;
}
