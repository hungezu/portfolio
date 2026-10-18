import { useEffect } from "react";

const sectionIds = new Set(["top", "ability", "work", "experience", "contact"]);
const interruptKeys = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Escape", "Tab"]);
let cancelCurrentScroll: (() => void) | undefined;

export function cancelHomeScroll() {
  cancelCurrentScroll?.();
}

export function scrollToHomeSection(id: string, keyboard = false) {
  if (!sectionIds.has(id)) return;
  const target = document.getElementById(id);
  if (!target?.closest(".portfolio-home")) return;
  cancelHomeScroll();

  let frame = 0;
  let cancelled = false;
  const cleanup = () => {
    cancelled = true;
    window.cancelAnimationFrame(frame);
    window.removeEventListener("wheel", interrupt);
    window.removeEventListener("touchstart", interrupt);
    window.removeEventListener("pointerdown", interrupt);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("resize", interrupt);
    window.removeEventListener("pagehide", interrupt);
    window.removeEventListener("popstate", interrupt);
    window.removeEventListener("hashchange", interrupt);
    if (cancelCurrentScroll === cleanup) cancelCurrentScroll = undefined;
  };
  const interrupt = () => cleanup();
  const onKey = (event: KeyboardEvent) => {
    if (interruptKeys.has(event.key)) cleanup();
  };
  cancelCurrentScroll = cleanup;
  window.addEventListener("wheel", interrupt, { passive: true });
  window.addEventListener("touchstart", interrupt, { passive: true });
  window.addEventListener("pointerdown", interrupt, { passive: true });
  window.addEventListener("keydown", onKey);
  window.addEventListener("resize", interrupt);
  window.addEventListener("pagehide", interrupt);
  window.addEventListener("popstate", interrupt);
  window.addEventListener("hashchange", interrupt);

  const finish = () => {
    cleanup();
    if (!keyboard) return;
    const heading = target.querySelector<HTMLElement>("h1, h2") ?? target;
    if (!heading.hasAttribute("tabindex")) {
      heading.setAttribute("tabindex", "-1");
      heading.addEventListener("blur", () => heading.removeAttribute("tabindex"), { once: true });
    }
    heading.focus({ preventScroll: true });
  };

  // Let the menu unlock the body and restore focus before measuring the destination.
  frame = window.requestAnimationFrame(() => {
    frame = window.requestAnimationFrame(() => {
      if (cancelled || !target.isConnected) { cleanup(); return; }
      const start = window.scrollY;
      const navigationHeight = document.querySelector(".site-nav")?.getBoundingClientRect().height ?? 72;
      const margin = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
      const offset = id === "top" ? 0 : Math.max(navigationHeight + 16, margin);
      const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const landing = target.querySelector<HTMLElement>("h2") ?? target;
      let documentTop = 0;
      for (let node: HTMLElement | null = landing; node; node = node.offsetParent as HTMLElement | null) {
        documentTop += node.offsetTop;
      }
      const end = id === "top" ? 0 : Math.min(maximum, Math.max(0, documentTop - offset));
      const distance = end - start;
      const hash = `#${id}`;
      if (window.location.hash !== hash) window.history.pushState(null, "", hash);
      if (Math.abs(distance) < 1) { finish(); return; }

      const duration = Math.min(1200, Math.max(320, 320 + Math.sqrt(Math.abs(distance)) * 13));
      // The user requested motion for deliberate clicks; keep that transition shorter
      // under reduced motion. Wheel and touch scrolling always remain native.
      const milliseconds = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? Math.min(480, duration * 0.65) : duration;
      let startedAt: number | undefined;
      const tick = (now: number) => {
        if (cancelled) return;
        startedAt ??= now;
        const progress = Math.min(1, (now - startedAt) / milliseconds);
        // Zero velocity and acceleration at both ends avoid a sudden start or stop.
        const eased = progress ** 3 * (progress * (progress * 6 - 15) + 10);
        window.scrollTo({ top: start + distance * eased, left: 0, behavior: "instant" });
        if (progress < 1) frame = window.requestAnimationFrame(tick);
        else finish();
      };
      frame = window.requestAnimationFrame(tick);
    });
  });
}

export function useHomeAnchorNavigation() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin ||
        destination.search !== window.location.search ||
        destination.pathname.replace(/\/$/, "") !== window.location.pathname.replace(/\/$/, "")) return;
      const id = destination.hash.slice(1);
      if (!sectionIds.has(id) || !document.getElementById(id)?.closest(".portfolio-home")) return;
      event.preventDefault();
      scrollToHomeSection(id, event.detail === 0);
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      cancelHomeScroll();
    };
  }, []);
}
