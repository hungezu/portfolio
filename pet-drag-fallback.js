(() => {
  const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;

  const attach = () => {
    const trigger = document.querySelector(".portfolio-pet-trigger");
    if (!(trigger instanceof HTMLElement)) return;
    if (trigger.dataset.petDragReact === "true" || trigger.dataset.petDragFallback === "true") return;
    trigger.dataset.petDragFallback = "true";
    const chat = trigger.closest(".portfolio-chat");

    let offsetX = 0;
    let offsetY = 0;
    let drag = null;
    let suppressClick = false;

    const applyPosition = () => {
      trigger.style.setProperty("--pet-drag-right", `${-offsetX}px`);
      trigger.style.setProperty("--pet-drag-bottom", `${-offsetY}px`);
      chat?.style.setProperty("--pet-drag-right", `${-offsetX}px`);
      chat?.style.setProperty("--pet-drag-bottom", `${-offsetY}px`);
    };

    const onPointerDown = (event) => {
      if (!isDesktop() || trigger.classList.contains("is-revealed") || event.pointerType === "touch" || event.button !== 0) return;
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        offsetX,
        offsetY,
        moved: false,
      };
      trigger.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      drag.moved = true;
      trigger.classList.add("is-dragging");
      event.preventDefault();
      const limit = Math.max(window.innerWidth, window.innerHeight);
      offsetX = Math.max(-limit, Math.min(limit, Math.round(drag.offsetX + dx)));
      offsetY = Math.max(-limit, Math.min(limit, Math.round(drag.offsetY + dy)));
      applyPosition();
    };

    const onPointerEnd = (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      if (drag.moved) {
        suppressClick = true;
        window.setTimeout(() => {
          suppressClick = false;
        }, 120);
      }
      drag = null;
      trigger.classList.remove("is-dragging");
      if (trigger.hasPointerCapture(event.pointerId)) trigger.releasePointerCapture(event.pointerId);
    };

    const onClickCapture = (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
    };

    trigger.addEventListener("pointerdown", onPointerDown);
    trigger.addEventListener("pointermove", onPointerMove);
    trigger.addEventListener("pointerup", onPointerEnd);
    trigger.addEventListener("pointercancel", onPointerEnd);
    trigger.addEventListener("click", onClickCapture, true);
    applyPosition();
  };

  const boot = () => {
    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.body) boot();
  else window.addEventListener("DOMContentLoaded", boot, { once: true });
})();
