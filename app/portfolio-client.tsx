"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left.mjs";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up.mjs";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right.mjs";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle.mjs";
import Plus from "lucide-react/dist/esm/icons/plus.mjs";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw.mjs";
import Send from "lucide-react/dist/esm/icons/send.mjs";
import X from "lucide-react/dist/esm/icons/x.mjs";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ImgHTMLAttributes,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  abilities,
  experiences,
  projects,
  publicAsset,
  type AbilityId,
  type Project,
} from "./portfolio-data";
import {
  buildLocalChatReply,
  CHAT_QUICK_PROMPTS,
  OUT_OF_SCOPE_REPLY,
  type ChatReference,
} from "./chat-knowledge";
import portfolioPetAssets from "../assets/visual/sidebar-character/assets.json";
import { ZhaocaiSmartCase } from "./case-studies/ZhaocaiSmartCase";
import { GkxCase } from "./case-studies/GkxCase";
import { GkxDesignSystemInteractive, NationalSciencePlatformCase, ProjectSubnav, type NationalPlatformView } from "./case-studies/NationalSciencePlatformCase";

const ease = [0.16, 1, 0.3, 1] as const;
const heroVideoAsset = "/assets/visual/hero-motion.mp4";
const heroMobileVideoAsset = "/assets/visual/hero-motion-mobile.mp4";
const abilityLabelById = new Map(abilities.map(ability => [ability.id, ability.axisLabel]));
const radarValues = abilities.map(() => .9);
const radarRadius = 166;
const radarButtonOrbitX = 54;
const radarButtonOrbitY = 50;

function openProjectFromPortfolio(
  event: ReactMouseEvent<HTMLAnchorElement>,
  slug: string,
) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const returnY = Math.max(0, Math.round(window.scrollY));
  const destination = `/portfolio/project/${slug}/?from=portfolio&returnProject=${encodeURIComponent(slug)}&returnY=${returnY}`;
  const card = event.currentTarget.closest<HTMLElement>(".project-card");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!card || reduceMotion) {
    window.location.assign(destination);
    return;
  }
  if (card.classList.contains("is-opening")) return;

  const rect = card.getBoundingClientRect();
  const overlay = document.createElement("div");
  overlay.className = "project-transition-shell";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.setProperty("--project-transition-x", `${rect.left}px`);
  overlay.style.setProperty("--project-transition-y", `${rect.top}px`);
  overlay.style.setProperty("--project-transition-scale-x", `${rect.width / window.innerWidth}`);
  overlay.style.setProperty("--project-transition-scale-y", `${rect.height / window.innerHeight}`);
  const source = card.querySelector<HTMLElement>(".project-card-link");
  if (source) {
    const preview = source.cloneNode(true) as HTMLElement;
    preview.classList.add("project-transition-preview");
    preview.removeAttribute("href");
    preview.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
    overlay.appendChild(preview);
  }
  document.body.appendChild(overlay);
  card.classList.add("is-opening");
  card.setAttribute("aria-busy", "true");
  document.documentElement.classList.add("portfolio-transitioning");

  let navigated = false;
  const navigate = () => {
    if (navigated) return;
    navigated = true;
    window.location.assign(destination);
  };

  overlay.addEventListener("transitionend", event => {
    if (event.target === overlay && event.propertyName === "transform") navigate();
  }, { once: true });
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => overlay.classList.add("is-expanded"));
  });
  window.setTimeout(navigate, 560);
}

function openProjectEvidence(
  event: ReactMouseEvent<HTMLAnchorElement>,
  slug: string,
  anchor?: string,
) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const returnY = Math.max(0, Math.round(window.scrollY));
  const destination = `/portfolio/project/${slug}/?from=portfolio&returnProject=${encodeURIComponent(slug)}&returnY=${returnY}${anchor ? `#${anchor}` : ""}`;
  window.location.assign(destination);
}

function returnToProjectLocation(
  event: ReactMouseEvent<HTMLAnchorElement>,
  projectSlug: string,
) {
  event.preventDefault();
  const params = new URLSearchParams(window.location.search);
  const returnY = Number.parseInt(params.get("returnY") ?? "", 10);
  const returnProject = params.get("returnProject");
  if (Number.isFinite(returnY) && returnProject === projectSlug) {
    window.location.assign(`/portfolio/?returnProject=${encodeURIComponent(projectSlug)}&returnY=${returnY}`);
    return;
  }
  window.location.assign("/portfolio/?returnSection=work");
}

function getRadarPoints(values: number[], radius = radarRadius) {
  const center = 240;
  return values
    .map((value, index) => {
      const angle = (-90 + index * (360 / values.length)) * (Math.PI / 180);
      return `${center + Math.cos(angle) * radius * value},${center + Math.sin(angle) * radius * value}`;
    })
    .join(" ");
}

function BrandMark() {
  return (
    <span className="brand-lockup" aria-label="李家豪作品集">
      <img
        className="brand-logo"
        src={publicAsset("/assets/visual/hj-logo-112.png")}
        alt=""
        width="112"
        height="112"
        decoding="async"
        aria-hidden="true"
      />
      <span className="brand-name">Leo.li</span>
    </span>
  );
}

function NavPill({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`nav-pill ${className}`} type="button" {...props}>
      {children}
    </button>
  );
}

function SiteNav({
  onMenu,
  onProjectBack,
  projectView = false,
}: {
  onMenu: () => void;
  onProjectBack?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
  projectView?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.nav
      className="site-nav"
      initial={reduce ? false : { y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease }}
    >
      <div className="nav-left">
        <a className="brand-link" href="/portfolio/#top">
          <BrandMark />
        </a>
      </div>
      <div className="nav-right">
        {projectView ? (
          <a
            className="nav-pill nav-back"
            href="/portfolio/#work"
            onClick={onProjectBack}
          >
            <span className="nav-circle nav-circle-dark">
              <ArrowLeft size={12} strokeWidth={2.6} />
            </span>
            <span>返回作品</span>
          </a>
        ) : null}
        <NavPill className="nav-pill-dark" onClick={onMenu} aria-label="打开导航菜单">
          <span className="nav-circle nav-circle-light">
            <Plus size={12} strokeWidth={3} />
          </span>
          <span>菜单</span>
        </NavPill>
      </div>
    </motion.nav>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setVisible(window.scrollY > Math.max(640, window.innerHeight * 0.85));
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          className="back-to-top"
          type="button"
          aria-label="返回页面顶部"
          title="返回顶部"
          initial={reduce ? false : { opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, y: 8, scale: 0.94 }}
          transition={{ duration: reduce ? 0 : 0.28, ease }}
          whileHover={reduce ? undefined : { y: -3 }}
          whileTap={reduce ? undefined : { scale: 0.94 }}
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: reduce ? "auto" : "smooth",
            })
          }
        >
          <ArrowUp size={18} strokeWidth={2} />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}

function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const links = [
    ["首页", "/portfolio/#top"],
    ["核心能力", "/portfolio/#ability"],
    ["项目", "/portfolio/#work"],
    ["经历", "/portfolio/#experience"],
    ["联系", "/portfolio/#contact"],
  ];

  useEffect(() => {
    if (!open) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const pageMain = document.querySelector<HTMLElement>("main");
    const siteNav = document.querySelector<HTMLElement>(".site-nav");

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = overlayRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    pageMain?.setAttribute("inert", "");
    siteNav?.setAttribute("inert", "");
    window.addEventListener("keydown", onKey);
    document.body.classList.add("menu-is-open");
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("menu-is-open");
      pageMain?.removeAttribute("inert");
      siteNav?.removeAttribute("inert");
      window.requestAnimationFrame(() => previouslyFocused?.focus());
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={overlayRef}
          className="menu-overlay"
          initial={reduce ? false : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
          exit={reduce ? undefined : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: reduce ? 0 : 0.42, ease }}
          role="dialog"
          aria-modal="true"
          aria-label="导航菜单"
        >
          <motion.button
            ref={closeButtonRef}
            className="menu-close nav-pill nav-pill-dark"
            type="button"
            aria-label="关闭导航菜单"
            onClick={onClose}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.24, delay: reduce ? 0 : 0.08, ease }}
          >
            <motion.span
              className="nav-circle nav-circle-light"
              initial={reduce ? false : { rotate: 0 }}
              animate={{ rotate: 45 }}
              transition={{ duration: reduce ? 0 : 0.3, ease }}
            >
              <Plus size={12} strokeWidth={3} />
            </motion.span>
            <span>关闭</span>
          </motion.button>
          <div className="menu-content">
            {links.map(([label, href], index) => (
              <motion.a
                key={href}
                href={href}
                onClick={onClose}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.08 + index * 0.055, duration: 0.55, ease }}
              >
                {label}
              </motion.a>
            ))}
          </div>
          <div className="menu-contact">
            <a href="mailto:2146953949@qq.com">邮箱 2146953949@qq.com</a>
            <span>手机 13670115683</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

declare global {
  interface Window {
    /** 可选的跨域对话服务地址；未配置时使用同源 /api/chat。 */
    __PORTFOLIO_CHAT_API__?: string;
  }
}

type PortfolioChatMode = "unknown" | "api" | "local" | "local-fallback" | "guardrail";

type PortfolioChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  references?: ChatReference[];
};

const CHAT_WELCOME_MESSAGE: PortfolioChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "你好，我是 Leo。\n想了解我的经历、项目，还是某个设计取舍？",
};

function createWelcomeMessage(): PortfolioChatMessage {
  return {
    ...CHAT_WELCOME_MESSAGE,
    id: createChatMessageId(),
  };
}

function createChatMessageId() {
  return `chat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function waitForChatReply(startedAt: number, minimumMs: number) {
  const remaining = minimumMs - (performance.now() - startedAt);
  if (remaining <= 0) return Promise.resolve();
  return new Promise<void>(resolve => window.setTimeout(resolve, remaining));
}

function getChatEndpoint() {
  if (typeof window !== "undefined" && window.__PORTFOLIO_CHAT_API__?.trim()) {
    return window.__PORTFOLIO_CHAT_API__.trim();
  }
  return "/api/chat";
}

function getPortfolioRoute(href: string) {
  if (!href.startsWith("/portfolio") || typeof window === "undefined") return href;
  const base = window.__PORTFOLIO_BASE__?.trim();
  if (!base || base === "/portfolio") return href;
  return `${base.replace(/\/$/, "")}${href.slice("/portfolio".length)}` || "/";
}

function parseChatReferences(value: unknown): ChatReference[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is { label?: unknown; href?: unknown; kind?: unknown } => Boolean(item) && typeof item === "object")
    .map(item => ({
      label: typeof item.label === "string" ? item.label.trim().slice(0, 80) : "",
      href: typeof item.href === "string" ? item.href.trim() : "",
      kind: item.kind === "section" ? "section" as const : "project" as const,
    }))
    .filter(reference => reference.label && reference.href.startsWith("/") && !reference.href.startsWith("//"))
    .slice(0, 4);
}

function chatModeLabel(mode: PortfolioChatMode) {
  if (mode === "api") return "我找到相关内容了";
  if (mode === "guardrail") return "这个我不方便展开";
  if (mode === "local" || mode === "local-fallback") return "我先从作品集里找";
  return "想聊哪个项目？";
}

type PortfolioPetState =
  | "idle"
  | "waving"
  | "thinking"
  | "success"
  | "curious"
  | "pointing"
  | "jumping"
  | "dragged"
  | "landing";

type PortfolioCharacterFrame = {
  rect: [number, number, number, number];
  left: number;
  top: number;
  width: number;
  height: number;
};

type PortfolioCharacterState = {
  source: string;
  frames: PortfolioCharacterFrame[];
  fps: number;
  loop: boolean;
  mirror: boolean;
};

const portfolioCharacterMap = portfolioPetAssets as {
  sources: Record<string, { file: string; width: number; height: number }>;
  states: Record<string, PortfolioCharacterState>;
};

const portfolioPetStateMap: Record<PortfolioPetState, string> = {
  idle: "idle",
  waving: "wave",
  thinking: "thinking",
  success: "success",
  curious: "curious",
  pointing: "point",
  jumping: "jump",
  dragged: "dragged",
  landing: "landing",
};

type PortfolioPetDrag = {
  x: number;
  y: number;
};

const PORTFOLIO_PET_DETACH_DISTANCE = 16;

type PortfolioChatContext = {
  id: string;
  elementId: string;
  text: string;
};

const HOME_CHAT_CONTEXTS: PortfolioChatContext[] = [
  { id: "home", elementId: "top", text: "这里是首页开场，先看我关注的方向和工作方式。" },
  { id: "ability", elementId: "ability", text: "这里是核心能力，讲我怎么把复杂体验拆清楚。" },
  { id: "work", elementId: "work", text: "这里是精选作品，点进项目可以继续看背景和取舍。" },
  { id: "experience", elementId: "experience", text: "这里是工作经历，能看到我在不同项目里的工作范围。" },
  { id: "contact", elementId: "contact", text: "这里是联系方式，如果想聊项目可以从这里找到我。" },
];

const PROJECT_CHAT_CONTEXTS: Record<string, PortfolioChatContext[]> = {
  gkx: [
    { id: "nsp-overview", elementId: "nsp-overview", text: "这是国科信案例，先看项目范围。" },
    { id: "nsp-structure", elementId: "nsp-structure", text: "这里讲多系统怎么拆成可执行的结构。" },
    { id: "nsp-prototype", elementId: "nsp-prototype", text: "这段是可运行原型，我用它验证流程和状态。" },
    { id: "nsp-products", elementId: "nsp-products", text: "这里看系统实景，具体页面都在这一段。" },
    { id: "nsp-rules", elementId: "nsp-rules", text: "这里沉淀设计规范，方便多人一起交付。" },
    { id: "nsp-result", elementId: "nsp-result", text: "最后收束一下：AI 做辅助，设计判断由我负责。" },
  ],
  "zhaocai-smart": [
    { id: "overview", elementId: "overview", text: "这里是招财 Smart 项目概览，先看它解决的任务。" },
    { id: "strategy", elementId: "strategy", text: "这是招财 Smart，先看问数链路如何串起三个体验断点。" },
    { id: "core", elementId: "core", text: "这里进入核心交互，几个关键状态会连续展开。" },
    { id: "clarification", elementId: "clarification", text: "这里讲怎么把模糊问题说清楚。" },
    { id: "process", elementId: "process", text: "这里讲处理中怎样让人知道发生了什么。" },
    { id: "board", elementId: "board", text: "这里讲结果怎样变成可持续追踪的看板。" },
    { id: "markdown", elementId: "markdown", text: "这里是输出规范，讲不同结果怎样保持一致、易读。" },
    { id: "gallery", elementId: "gallery", text: "这里是补充交付，能看到更多页面和规范材料。" },
  ],
};

function getPortfolioChatContexts() {
  const projectRoot = document.querySelector<HTMLElement>("main[data-project]");
  const projectSlug = projectRoot?.dataset.project;
  if (projectSlug && PROJECT_CHAT_CONTEXTS[projectSlug]) return PROJECT_CHAT_CONTEXTS[projectSlug];
  if (projectRoot) {
    return [{ id: "case", elementId: "", text: "这是项目案例，往下看会有页面和设计过程。" }];
  }
  return HOME_CHAT_CONTEXTS;
}

function getNearestPortfolioChatContext(contexts: PortfolioChatContext[]) {
  const viewportBottom = window.innerHeight;
  const focusY = viewportBottom * 0.42;
  let active = contexts[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  const containing: Array<{ context: PortfolioChatContext; top: number; height: number }> = [];
  for (const context of contexts) {
    const element = context.elementId
      ? document.getElementById(context.elementId)
      : document.querySelector<HTMLElement>("main[data-project]");
    if (!element) continue;
    const rect = element.getBoundingClientRect();
    if (rect.top <= focusY && rect.bottom > focusY) {
      containing.push({ context, top: rect.top, height: rect.height });
      continue;
    }
    const distance = rect.top > focusY
      ? rect.top - focusY
      : focusY - rect.bottom;
    if (distance < bestDistance) {
      active = context;
      bestDistance = distance;
    }
  }

  if (containing.length) {
    // 子章节和父章节同时命中时，取视线中更靠后的那一段。
    containing.sort((a, b) => b.top - a.top || a.height - b.height);
    active = containing[0].context;
  }
  return active;
}

function PortfolioPetSprite({ state, peeking }: { state: PortfolioPetState; peeking: boolean }) {
  const reduce = useReducedMotion();
  const requestedAssetState = peeking && state === "idle" ? "peek-right" : portfolioPetStateMap[state];
  const [assetState, setAssetState] = useState(requestedAssetState);
  const config = portfolioCharacterMap.states[assetState];
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const sources = ["actions", "curious", "idle", "jump", "peek", "wave"];
    const preloaders = sources.map(sourceId => {
      const image = new Image();
      image.src = publicAsset(`/assets/visual/sidebar-character/${portfolioCharacterMap.sources[sourceId].file}`);
      return image;
    });
    return () => preloaders.forEach(image => {
      image.onload = null;
      image.onerror = null;
    });
  }, []);

  useEffect(() => {
    if (requestedAssetState === assetState) return;
    const nextConfig = portfolioCharacterMap.states[requestedAssetState];
    const nextSource = portfolioCharacterMap.sources[nextConfig.source];
    const image = new Image();
    let active = true;
    const showNextState = () => {
      if (active) setAssetState(requestedAssetState);
    };
    image.onload = showNextState;
    image.onerror = () => undefined;
    image.src = publicAsset(`/assets/visual/sidebar-character/${nextSource.file}`);
    if (image.complete) showNextState();
    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [assetState, requestedAssetState]);

  useEffect(() => {
    setFrameIndex(0);
    if (reduce || config.frames.length < 2 || config.fps <= 0) return;

    const timer = window.setInterval(() => {
      setFrameIndex(current => {
        if (config.loop) return (current + 1) % config.frames.length;
        return Math.min(current + 1, config.frames.length - 1);
      });
    }, 1000 / config.fps);

    return () => window.clearInterval(timer);
  }, [assetState, config.fps, config.frames.length, config.loop, reduce]);

  const frame = config.frames[Math.min(frameIndex, config.frames.length - 1)];
  const [x, y, width, height] = frame.rect;
  const source = portfolioCharacterMap.sources[config.source];

  return (
    <span
      className={`portfolio-pet-sprite pet-state-${state}`}
      data-character-state={assetState}
      aria-hidden="true"
    >
      <span className="portfolio-pet-character-motion">
        <span
          className="portfolio-pet-character-mirror"
          style={{ transform: config.mirror ? "scaleX(-1)" : undefined }}
        >
          <span
            className="portfolio-pet-character-crop"
            style={{
              left: `${frame.left * 100}%`,
              top: `${frame.top * 100}%`,
              width: `${frame.width * 100}%`,
              height: `${frame.height * 100}%`,
            }}
          >
            <img
              src={publicAsset(`/assets/visual/sidebar-character/${source.file}`)}
              alt=""
              draggable={false}
              decoding="async"
              style={{
                width: `${source.width / width * 100}%`,
                height: `${source.height / height * 100}%`,
                left: `${-x / width * 100}%`,
                top: `${-y / height * 100}%`,
              }}
            />
          </span>
        </span>
      </span>
    </span>
  );
}

function PortfolioChat() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<PortfolioChatMode>("unknown");
  const [messages, setMessages] = useState<PortfolioChatMessage[]>(() => [createWelcomeMessage()]);
  const [context, setContext] = useState<PortfolioChatContext>(HOME_CHAT_CONTEXTS[0]);
  const [contextVisible, setContextVisible] = useState(false);
  const [petState, setPetState] = useState<PortfolioPetState>("idle");
  const [petDrag, setPetDrag] = useState<PortfolioPetDrag>({ x: 0, y: 0 });
  const [petDragging, setPetDragging] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const contextIdRef = useRef(HOME_CHAT_CONTEXTS[0].id);
  const contextTimerRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const petTimerRef = useRef<number | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const conversationIdRef = useRef(0);
  const sendingRef = useRef(sending);
  const petDragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startOffset: { x: 0, y: 0 } as PortfolioPetDrag,
    startRect: { left: 0, top: 0, right: 0, bottom: 0 },
    moved: false,
  });
  const suppressPetClickRef = useRef(false);
  sendingRef.current = sending;

  const pulsePet = (nextState: PortfolioPetState, duration = 1100) => {
    setPetState(nextState);
    if (petTimerRef.current !== null) window.clearTimeout(petTimerRef.current);
    petTimerRef.current = window.setTimeout(() => {
      setPetState(sendingRef.current ? "thinking" : "idle");
      petTimerRef.current = null;
    }, duration);
  };

  const handlePetPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (open || event.pointerType === "touch" || event.button !== 0) return;
    const drag = petDragRef.current;
    drag.active = true;
    drag.pointerId = event.pointerId;
    drag.startX = event.clientX;
    drag.startY = event.clientY;
    drag.startOffset = petDrag;
    const rect = event.currentTarget.getBoundingClientRect();
    drag.startRect = {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
    };
    drag.moved = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePetPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = petDragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    setPetDragging(true);
    event.preventDefault();
    const horizontalDelta = Math.max(
      8 - drag.startRect.left,
      Math.min(-drag.startOffset.x, dx),
    );
    const verticalDelta = Math.max(
      8 - drag.startRect.top,
      Math.min(window.innerHeight - 8 - drag.startRect.bottom, dy),
    );
    setPetDrag({
      x: Math.round(drag.startOffset.x + horizontalDelta),
      y: Math.round(drag.startOffset.y + verticalDelta),
    });
  };

  const finishPetDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = petDragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    if (drag.moved) {
      suppressPetClickRef.current = true;
      window.setTimeout(() => {
        suppressPetClickRef.current = false;
      }, 120);
    }
    drag.active = false;
    drag.pointerId = -1;
    setPetDragging(false);
    if (drag.moved) pulsePet("landing", 420);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  useEffect(() => {
    const contexts = getPortfolioChatContexts();
    let frame = 0;

    const revealContext = () => {
      setContextVisible(true);
      if (contextTimerRef.current !== null) window.clearTimeout(contextTimerRef.current);
      contextTimerRef.current = window.setTimeout(() => {
        setContextVisible(false);
        contextTimerRef.current = null;
      }, 4200);
    };

    const syncContext = (show = false) => {
      const next = getNearestPortfolioChatContext(contexts);
      const changed = next.id !== contextIdRef.current;
      if (!changed) return false;
      contextIdRef.current = next.id;
      setContext(next);
      if (show) {
        revealContext();
        pulsePet("pointing", 1500);
      }
      return true;
    };

    // 项目页的第一段不一定和首页相同，挂载后立即校准一次。
    syncContext();

    const onScroll = () => {
      if (scrollTimerRef.current !== null) window.clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = window.setTimeout(() => {
        if (!sendingRef.current) setPetState("idle");
        scrollTimerRef.current = null;
      }, 520);
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        syncContext(true);
      });
    };

    const onResize = () => syncContext();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (contextTimerRef.current !== null) window.clearTimeout(contextTimerRef.current);
      if (scrollTimerRef.current !== null) window.clearTimeout(scrollTimerRef.current);
      if (petTimerRef.current !== null) window.clearTimeout(petTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusFrame = window.requestAnimationFrame(() => inputRef.current?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        setContextVisible(false);
        setPetState("idle");
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      window.requestAnimationFrame(() => {
        if (
          previouslyFocused &&
          previouslyFocused !== document.body &&
          document.contains(previouslyFocused)
        ) previouslyFocused.focus();
        else launcherRef.current?.focus();
      });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    messageEndRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "nearest",
    });
  }, [messages, sending, open, reduce]);

  const sendMessage = async (rawValue: string) => {
    if (sending || sendingRef.current) return;
    const conversationId = conversationIdRef.current;
    const startedAt = performance.now();
    const minimumReplyDelay = reduce ? 140 : 480;
    const query = rawValue.trim().slice(0, 600);
    if (!query) return;
    sendingRef.current = true;

    const userMessage: PortfolioChatMessage = {
      id: createChatMessageId(),
      role: "user",
      content: query,
    };
    const nextConversation = [...messages, userMessage];
    setMessages(nextConversation);
    setDraft("");
    setSending(true);
    setPetState("thinking");

    const userContext = nextConversation
      .filter(message => message.role === "user")
      .slice(-3)
      .map(message => message.content)
      .join(" ");
    // GitHub Pages 只提供静态文件；已知静态基路径时直接走同一份本地白名单，避免等待一个必然 404 的请求。
    if (window.__PORTFOLIO_BASE__ && !window.__PORTFOLIO_CHAT_API__) {
      await waitForChatReply(startedAt, minimumReplyDelay);
      if (conversationId !== conversationIdRef.current) return;
      const local = buildLocalChatReply(query, userContext);
      setMode(local.reply === OUT_OF_SCOPE_REPLY ? "guardrail" : "local");
      pulsePet(local.reply === OUT_OF_SCOPE_REPLY ? "curious" : "success");
      setMessages(current => [
        ...current,
        {
          id: createChatMessageId(),
          role: "assistant",
          content: local.reply,
          references: local.entries.flatMap(entry => entry.references ?? []).filter((reference, index, all) =>
            all.findIndex(item => item.href === reference.href) === index,
          ).slice(0, 4),
        },
      ]);
      sendingRef.current = false;
      setSending(false);
      window.requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 11_000);
    try {
      const response = await fetch(getChatEndpoint(), {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextConversation.slice(-8).map(message => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });
      const payload = await response.json().catch(() => null) as {
        reply?: unknown;
        mode?: unknown;
        references?: unknown;
      } | null;
      if (!response.ok || typeof payload?.reply !== "string" || !payload.reply.trim()) {
        throw new Error("chat endpoint unavailable");
      }
      await waitForChatReply(startedAt, minimumReplyDelay);
      if (conversationId !== conversationIdRef.current) return;

      const responseMode: PortfolioChatMode = payload.mode === "api"
        ? "api"
        : payload.mode === "guardrail"
          ? "guardrail"
          : "local";
      setMode(responseMode);
      pulsePet(payload.reply!.trim() === OUT_OF_SCOPE_REPLY ? "curious" : "success");
      setMessages(current => [
        ...current,
        {
          id: createChatMessageId(),
          role: "assistant",
          content: payload.reply!.trim(),
          references: parseChatReferences(payload.references),
        },
      ]);
    } catch {
      await waitForChatReply(startedAt, minimumReplyDelay);
      if (conversationId !== conversationIdRef.current) return;
      const local = buildLocalChatReply(query, userContext);
      setMode(local.reply === OUT_OF_SCOPE_REPLY ? "guardrail" : "local-fallback");
      pulsePet(local.reply === OUT_OF_SCOPE_REPLY ? "curious" : "success");
      setMessages(current => [
        ...current,
        {
          id: createChatMessageId(),
          role: "assistant",
          content: local.reply,
          references: local.entries.flatMap(entry => entry.references ?? []).filter((reference, index, all) =>
            all.findIndex(item => item.href === reference.href) === index,
          ).slice(0, 4),
        },
      ]);
    } finally {
      window.clearTimeout(timeout);
      if (requestRef.current === controller) requestRef.current = null;
      if (conversationId === conversationIdRef.current) {
        sendingRef.current = false;
        setSending(false);
        window.requestAnimationFrame(() => inputRef.current?.focus());
      }
    }
  };

  const startNewConversation = () => {
    conversationIdRef.current += 1;
    requestRef.current?.abort();
    requestRef.current = null;
    sendingRef.current = false;
    setMessages([createWelcomeMessage()]);
    setDraft("");
    setSending(false);
    setMode("unknown");
    pulsePet("jumping", 800);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const closeChat = () => {
    setOpen(false);
    setContextVisible(false);
    setPetState("idle");
  };

  const toggleChat = () => {
    if (open) {
      closeChat();
      return;
    }
    setOpen(true);
    setContextVisible(false);
    pulsePet("waving", 1100);
  };

  const handlePetClick = () => {
    if (suppressPetClickRef.current) {
      suppressPetClickRef.current = false;
      return;
    }
    toggleChat();
  };

  const visiblePetState: PortfolioPetState = petDragging
    ? "dragged"
    : sending
      ? "thinking"
      : petState;
  const petDetached = petDrag.x <= -PORTFOLIO_PET_DETACH_DISTANCE;
  const isProjectContext = !HOME_CHAT_CONTEXTS.some(item => item.id === context.id);
  const petPositionStyle = {
    "--pet-drag-right": `${-petDrag.x}px`,
    "--pet-drag-bottom": `${-petDrag.y}px`,
  } as CSSProperties;

  return (
    <div
      className="portfolio-chat"
      style={petPositionStyle}
      data-chat-mode={mode}
      data-pet-state={visiblePetState}
      data-pet-detached={petDetached ? "true" : "false"}
    >
      <AnimatePresence initial={false}>
        {!open && contextVisible && !isProjectContext ? (
          <motion.div
            className="portfolio-pet-context"
            key={context.id}
            role="status"
            initial={reduce ? false : { opacity: 0, x: 10, y: 4 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: 8, y: 3 }}
            transition={{ duration: reduce ? 0 : 0.22, ease }}
          >
            {context.text}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <motion.button
        ref={launcherRef}
        className={`portfolio-pet-trigger${open ? " is-revealed" : ""}${petDragging ? " is-dragging" : ""}`}
        type="button"
        data-pet-drag-react="true"
        aria-label={open ? "关闭作品集助手" : "打开作品集助手"}
        aria-controls="portfolio-chat-panel"
        aria-expanded={open}
        title={open ? "关闭作品集助手" : "打开作品集助手"}
        onClick={handlePetClick}
        onPointerDown={handlePetPointerDown}
        onPointerMove={handlePetPointerMove}
        onPointerUp={finishPetDrag}
        onPointerCancel={finishPetDrag}
        whileTap={reduce ? undefined : { scale: 0.96 }}
      >
        <span className="portfolio-pet-window" aria-hidden="true">
          <PortfolioPetSprite state={visiblePetState} peeking={!open && !petDetached} />
        </span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.section
            ref={panelRef}
            id="portfolio-chat-panel"
            className="portfolio-chat-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="portfolio-chat-title"
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: reduce ? 0 : 0.28, ease }}
          >
            <header className="portfolio-chat-header">
              <div className="portfolio-chat-title-wrap">
                <span className="portfolio-chat-mark" aria-hidden="true">
                  <MessageCircle size={16} strokeWidth={2.1} />
                </span>
                <div>
                  <h2 id="portfolio-chat-title">和 Leo 聊聊</h2>
                  <p>{chatModeLabel(mode)}</p>
                </div>
              </div>
              <div className="portfolio-chat-actions">
                <button
                  className="portfolio-chat-new"
                  type="button"
                  aria-label="开始新对话"
                  title="开始新对话"
                  onClick={startNewConversation}
                >
                  <RotateCcw size={14} strokeWidth={2} />
                  <span>新对话</span>
                </button>
                <button
                  className="portfolio-chat-close"
                  type="button"
                  aria-label="关闭作品集助手"
                  onClick={closeChat}
                >
                  <X size={17} strokeWidth={2} />
                </button>
              </div>
            </header>

            <div
              className="portfolio-chat-messages"
              role="log"
              aria-live="polite"
              aria-busy={sending}
              aria-label="对话内容"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {messages.map(message => (
                  <motion.div
                    className={`portfolio-chat-message is-${message.role}`}
                    key={message.id}
                    layout="position"
                    initial={reduce ? false : { opacity: 0, y: 10, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, y: -5, scale: 0.99 }}
                    transition={{ duration: reduce ? 0 : 0.24, ease }}
                  >
                    {message.role === "assistant" ? (
                      <span className="portfolio-chat-avatar" aria-hidden="true">Leo</span>
                    ) : null}
                    <div className="portfolio-chat-bubble-wrap">
                      <div className="portfolio-chat-bubble">{message.content}</div>
                      {message.references?.length ? (
                        <div className="portfolio-chat-references">
                          <span>相关内容</span>
                          <div>
                            {message.references.map(reference => (
                              <a
                                key={`${message.id}-${reference.href}`}
                                href={getPortfolioRoute(reference.href)}
                                onClick={closeChat}
                              >
                                <span>{reference.label}</span>
                                <ArrowUpRight size={12} strokeWidth={1.9} aria-hidden="true" />
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
                {messages.length === 1 ? (
                  <motion.div
                    className="portfolio-chat-quick-prompts"
                    aria-label="常用问题"
                    key="quick-prompts"
                    layout="position"
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: reduce ? 0 : 0.22, ease }}
                  >
                    {CHAT_QUICK_PROMPTS.map(prompt => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={sending}
                        aria-label={`提问：${prompt}`}
                        onClick={() => void sendMessage(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </motion.div>
                ) : null}
                {sending ? (
                  <motion.div
                    className="portfolio-chat-message is-assistant is-loading"
                    aria-label="助手正在回复"
                    key="loading"
                    layout="position"
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: reduce ? 0 : 0.2, ease }}
                  >
                    <span className="portfolio-chat-avatar" aria-hidden="true">Leo</span>
                    <div className="portfolio-chat-bubble portfolio-chat-loading-bubble">
                      <span /><span /><span />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <div ref={messageEndRef} aria-hidden="true" />
            </div>

            <form
              className="portfolio-chat-composer"
              onSubmit={event => {
                event.preventDefault();
                void sendMessage(draft);
              }}
            >
              <input
                ref={inputRef}
                value={draft}
                onChange={event => setDraft(event.target.value)}
                type="text"
                maxLength={600}
                placeholder="问经历、项目难点或设计方法…"
                aria-label="输入关于李家豪及其设计作品的问题"
                disabled={sending}
                autoComplete="off"
                enterKeyHint="send"
              />
              <button
                type="submit"
                aria-label="发送问题"
                disabled={sending || !draft.trim()}
              >
                <Send size={16} strokeWidth={2.1} />
              </button>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroVisibleRef = useRef(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      if (document.visibilityState !== "visible" || !heroVisibleRef.current) {
        video.pause();
        return;
      }
      video.muted = true;
      video.defaultMuted = true;
      void video.play()
        .then(() => setIsVideoPlaying(true))
        .catch(() => setIsVideoPlaying(false));
    };
    const syncPlayback = () => {
      if (document.visibilityState === "visible" && heroVisibleRef.current) {
        tryPlay();
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        heroVisibleRef.current = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.08 },
    );

    tryPlay();
    observer.observe(video.closest(".hero") ?? video);
    window.addEventListener("pageshow", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    window.addEventListener("touchstart", syncPlayback, { passive: true, once: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("pageshow", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      window.removeEventListener("touchstart", syncPlayback);
    };
  }, []);

  return (
    <section className="hero" id="top">
      <motion.div
        className="hero-media"
        initial={reduce ? false : { opacity: 0, scale: 1.035, clipPath: "inset(0 0 8% 0)" }}
        animate={{ opacity: 1, scale: 1, clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: 1.25, ease }}
      >
        <picture className="hero-poster" aria-hidden="true">
          <source
            media="(max-width: 767px)"
            srcSet={publicAsset("/assets/visual/hero-poster-mobile.jpg")}
          />
          <img
            src={publicAsset("/assets/visual/hero-poster-desktop.jpg")}
            alt=""
          />
        </picture>
        <video
          ref={videoRef}
          className={isVideoPlaying ? "is-playing" : ""}
          aria-hidden="true"
          autoPlay
          disablePictureInPicture
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={(event) => {
            if (document.visibilityState !== "visible" || !heroVisibleRef.current) {
              event.currentTarget.pause();
              return;
            }
            event.currentTarget.muted = true;
            event.currentTarget.defaultMuted = true;
            void event.currentTarget.play()
              .then(() => setIsVideoPlaying(true))
              .catch(() => setIsVideoPlaying(false));
          }}
          onPlaying={() => setIsVideoPlaying(true)}
          onPause={() => setIsVideoPlaying(false)}
          onError={() => setIsVideoPlaying(false)}
        >
          <source
            media="(max-width: 767px)"
            src={publicAsset(heroMobileVideoAsset)}
            type="video/mp4"
          />
          <source src={publicAsset(heroVideoAsset)} type="video/mp4" />
        </video>
      </motion.div>
      <div className="hero-video-wash" aria-hidden="true" />
      <motion.div
        className="hero-footer"
        initial={reduce ? false : { y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1, ease }}
      >
        <div className="hero-copy">
          <motion.h1
            initial={reduce ? false : { y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease }}
          >
            <span className="hero-name">李家豪</span>
            <span className="hero-statement">
              AI 体验产品设计师，
              <br />
              让复杂智能变得清晰、可控。
            </span>
          </motion.h1>
          <motion.div
            className="hero-actions"
            initial={reduce ? false : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8, ease }}
          >
            <a className="hero-contact-button" href="#contact">
              <span>联系我</span>
              <span className="hero-contact-icon" aria-hidden="true">
                <ArrowUpRight size={16} strokeWidth={2} />
              </span>
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function SectionIntro({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="section-intro"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.55 }}
      transition={{ duration: 0.52, ease }}
    >
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      <motion.span
        className="section-intro-rule"
        aria-hidden="true"
        initial={reduce ? false : { scaleX: 0.18, opacity: 0.3 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.7, delay: 0.08, ease }}
      />
    </motion.div>
  );
}

function AbilitySection({
  onShowProjects,
}: {
  onShowProjects: (abilityId: AbilityId) => void;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const current = abilities[active];
  const projectCount = new Set(current.evidence.map(item => item.projectSlug)).size;
  const groupedEvidence = current.evidence.reduce<Array<{
    projectSlug: string;
    projectTitle: string;
    items: typeof current.evidence;
  }>>((groups, item) => {
    const group = groups.find(entry => entry.projectSlug === item.projectSlug);
    if (group) group.items.push(item);
    else groups.push({ projectSlug: item.projectSlug, projectTitle: item.projectTitle, items: [item] });
    return groups;
  }, []);

  useEffect(() => {
    if (reduce || paused) return;
    const timer = window.setInterval(() => {
      setActive(index => (index + 1) % abilities.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [paused, reduce]);

  return (
    <section className="section ability-section" id="ability">
      <div className="section-shell">
        <SectionIntro
          title="核心能力"
          description="我以 AI 体验设计与交互策略为核心，把复杂业务转化为可理解、可验证、可落地的产品体验，并用 AI 工作流贯穿原型验证、界面探索、设计系统与数据表达。"
        />
        <div
          className={`ability-layout${paused ? " is-paused" : ""}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={event => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
          }}
        >
          <div className="ability-visual">
            <div className="ability-radar" role="group" aria-label={`核心能力雷达图，当前为${current.name}`}>
              <svg viewBox="36 36 408 408" aria-hidden="true">
                {[.25, .5, .75, 1].map(level => (
                  <polygon key={level} className="radar-grid" points={getRadarPoints(Array(abilities.length).fill(level))} />
                ))}
                {abilities.map((ability, index) => {
                  const angle = (-90 + index * (360 / abilities.length)) * (Math.PI / 180);
                  const x = 240 + Math.cos(angle) * radarRadius;
                  const y = 240 + Math.sin(angle) * radarRadius;
                  return <line key={ability.id} className="radar-axis" x1="240" y1="240" x2={x} y2={y} />;
                })}
                <motion.polygon
                  className="radar-shape"
                  points={getRadarPoints(radarValues)}
                  initial={false}
                  animate={{ points: getRadarPoints(radarValues) }}
                  transition={{ duration: reduce ? 0 : .62, ease }}
                />
                {radarValues.map((value, index) => {
                  const angle = (-90 + index * (360 / radarValues.length)) * (Math.PI / 180);
                  const x = 240 + Math.cos(angle) * radarRadius * value;
                  const y = 240 + Math.sin(angle) * radarRadius * value;
                  return (
                    <motion.circle
                      key={abilities[index].id}
                      className={`radar-point${active === index ? " is-active" : ""}`}
                      initial={false}
                      animate={{ cx: x, cy: y }}
                      transition={{ duration: reduce ? 0 : .62, ease }}
                      r={active === index ? 7 : 4}
                    />
                  );
                })}
              </svg>

              <div className="ability-switcher" role="tablist" aria-label="核心能力切换">
                {abilities.map((ability, index) => {
                  const angle = (-90 + index * (360 / abilities.length)) * (Math.PI / 180);
                  const x = 50 + Math.cos(angle) * radarButtonOrbitX;
                  const y = 50 + Math.sin(angle) * radarButtonOrbitY;
                  return (
                    <button
                      key={ability.id}
                      id={`ability-tab-${index}`}
                      type="button"
                      role="tab"
                      aria-selected={active === index}
                      aria-controls="ability-panel"
                      tabIndex={active === index ? 0 : -1}
                      className={`radar-axis-button${active === index ? " is-active" : ""}`}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      onClick={() => {
                        setActive(index);
                        setPaused(true);
                      }}
                      onKeyDown={(event) => {
                        const directions: Record<string, number> = {
                          ArrowRight: 1,
                          ArrowDown: 1,
                          ArrowLeft: -1,
                          ArrowUp: -1,
                        };
                        const direction = directions[event.key];
                        if (!direction && event.key !== "Home" && event.key !== "End") return;
                        event.preventDefault();
                        const next = event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? abilities.length - 1
                            : (index + direction + abilities.length) % abilities.length;
                        setActive(next);
                        setPaused(true);
                        window.requestAnimationFrame(() => {
                          document.getElementById(`ability-tab-${next}`)?.focus();
                        });
                      }}
                    >
                      {ability.axisLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div
            className="ability-detail"
            id="ability-panel"
            role="tabpanel"
            aria-labelledby={`ability-tab-${active}`}
            aria-live="polite"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.name}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.42, ease }}
              >
                <h3>{current.name}</h3>
                <p>{current.description}</p>
                <ul>
                  {current.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <section className="ability-proof ability-proof-compact" aria-label={`${current.name}对应项目`}>
                  <header>
                    <span>对应项目</span>
                    <button type="button" onClick={() => onShowProjects(current.id)}>
                      突出相关项目（{projectCount}）
                    </button>
                  </header>
                  <div className="ability-jump-list">
                    {groupedEvidence.map(group => (
                      <div className="ability-project-group" key={group.projectSlug}>
                        <strong>{group.projectTitle}</strong>
                        <div>
                          {group.items.map(item => (
                            <a
                              key={item.section}
                              href={`/portfolio/project/${item.projectSlug}/${item.anchor ? `#${item.anchor}` : ""}`}
                              onClick={event => openProjectEvidence(event, item.projectSlug, item.anchor)}
                            >
                              <span>{item.section}</span>
                              <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImageWithFallback({
  alt,
  className = "",
  decoding = "async",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div className={`image-fallback ${className}`}>项目图片暂时无法加载</div>;
  }
  const webpSource = typeof props.src === "string" && /\/assets\/projects\/.*\.(?:png|jpe?g)(?:\?.*)?$/i.test(props.src)
    ? props.src.replace(/\.(?:png|jpe?g)(\?.*)?$/i, ".webp$1")
    : null;

  return (
    <picture className="optimized-picture">
      {webpSource ? <source srcSet={webpSource} type="image/webp" /> : null}
      <img
        alt={alt}
        className={className}
        decoding={decoding}
        {...props}
        onError={() => setFailed(true)}
      />
    </picture>
  );
}

function ProjectCard({
  project,
  index,
  highlightedAbilityId,
}: {
  project: Project;
  index: number;
  highlightedAbilityId: AbilityId | null;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const fadeProgress = useMotionValue(0);
  const smoothProgress = useSpring(fadeProgress, {
    stiffness: 260,
    damping: 34,
    mass: .45,
    restDelta: .002,
  });
  const titleId = `project-${project.slug}-title`;
  const summaryId = `project-${project.slug}-summary`;
  const abilityMatch = highlightedAbilityId
    ? project.abilityIds.includes(highlightedAbilityId)
    : false;
  const highlightedAbilityLabel = highlightedAbilityId
    ? abilityLabelById.get(highlightedAbilityId)
    : null;

  useEffect(() => {
    if (reduce) {
      fadeProgress.set(0);
      return;
    }

    const card = cardRef.current;
    const nextCard = card?.nextElementSibling as HTMLElement | null;
    if (!card || !nextCard) {
      fadeProgress.set(0);
      return;
    }

    const documentTop = (element: HTMLElement) => {
      const parent = element.parentElement;
      if (!parent) return element.getBoundingClientRect().top + window.scrollY;

      let top = parent.getBoundingClientRect().top + window.scrollY;
      for (const child of Array.from(parent.children)) {
        if (!(child instanceof HTMLElement)) continue;
        top += Number.parseFloat(window.getComputedStyle(child).marginTop) || 0;
        if (child === element) return top;
        top += child.offsetHeight;
      }
      return element.getBoundingClientRect().top + window.scrollY;
    };

    let nextCardTop = documentTop(nextCard);
    let stickyTop = 72;
    let frame = 0;

    const render = () => {
      const approachDistance = Math.min(380, Math.max(260, window.innerHeight * 0.46));
      const start = nextCardTop - approachDistance;
      const end = nextCardTop - stickyTop;
      const progress = (window.scrollY - start) / Math.max(1, end - start);
      fadeProgress.set(Math.min(1, Math.max(0, progress)));
    };

    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        render();
      });
    };

    const measure = () => {
      nextCardTop = documentTop(nextCard);
      stickyTop = Number.parseFloat(window.getComputedStyle(card).top) || 72;
      render();
    };

    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(measure)
      : null;
    resizeObserver?.observe(card);
    resizeObserver?.observe(nextCard);
    measure();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
    };
  }, [fadeProgress, reduce]);

  const scale = useTransform(
    smoothProgress,
    [0, 0.28, 1],
    [1, 0.992, reduce ? 1 : 0.97],
  );
  const opacity = useTransform(
    smoothProgress,
    [0, 0.2, 1],
    [1, 0.97, reduce ? 1 : 0.68],
  );
  const y = useTransform(
    smoothProgress,
    [0, 0.24, 1],
    [0, -2, reduce ? 0 : -8],
  );

  return (
    <motion.article
      ref={cardRef}
      className={`project-card${abilityMatch ? " is-ability-match" : ""}`}
      data-project={project.slug}
      data-ability-match={abilityMatch ? "true" : undefined}
      style={{ scale, opacity, y, zIndex: index + 1 }}
    >
      <a
        className="project-card-link"
        href={`/portfolio/project/${project.slug}/`}
        onClick={event => openProjectFromPortfolio(event, project.slug)}
        aria-labelledby={titleId}
        aria-describedby={summaryId}
      >
        {abilityMatch && highlightedAbilityLabel ? (
          <span className="project-match-indicator" aria-hidden="true">
            匹配 · {highlightedAbilityLabel}
          </span>
        ) : null}
        <div className="project-copy">
          <p className="project-type">{project.type}</p>
          <h3 id={titleId}>{project.title}</h3>
          <p className="project-summary" id={summaryId}>{project.summary}</p>
          <div className="project-ability-tags" aria-label="项目对应能力">
            {project.abilityIds.slice(0, 3).map(abilityId => (
              <span key={abilityId}>{abilityLabelById.get(abilityId)}</span>
            ))}
          </div>
          <span className="project-link" aria-hidden="true">
            查看项目
            <ArrowUpRight size={15} strokeWidth={1.8} />
          </span>
        </div>
        <div className="project-visual">
          <ImageWithFallback
            src={project.cardCover ?? project.cover}
            alt={`${project.title}项目封面`}
            width={1672}
            height={941}
            loading={index < 4 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            style={{ objectPosition: project.coverPosition ?? "center" }}
          />
        </div>
      </a>
    </motion.article>
  );
}

function WorkSection({
  highlightedAbilityId,
  onClearHighlight,
}: {
  highlightedAbilityId: AbilityId | null;
  onClearHighlight: () => void;
}) {
  const highlightedAbility = abilities.find(ability => ability.id === highlightedAbilityId);
  const matchedCount = highlightedAbilityId
    ? projects.filter(project => project.abilityIds.includes(highlightedAbilityId)).length
    : 0;

  return (
    <section className={`section work-section${highlightedAbility ? " has-ability-highlight" : ""}`} id="work">
      <div className="section-shell">
        <SectionIntro
          title="精选作品"
          description="旗舰案例展示如何用 Codex 支撑大型多系统平台的设计与协作，其余案例覆盖金融 AI、复杂 B 端系统与数据体验。"
        />
        {highlightedAbility ? (
          <div className="project-highlight-status" aria-live="polite">
            <span>正在突出“{highlightedAbility.name}”对应的 {matchedCount} 个项目</span>
            <button type="button" onClick={onClearHighlight}>显示全部项目</button>
          </div>
        ) : null}
        <div className="project-stack">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
              highlightedAbilityId={highlightedAbilityId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperienceSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section experience-section" id="experience">
      <div className="section-shell">
        <SectionIntro
          title="工作经历"
          description="从财税 B 端与数据可视化，到 AI 产品和政企平台，持续负责复杂业务梳理、交互设计、视觉系统与研发交付。"
        />
        <div className="experience-list">
          {experiences.map((experience, index) => {
            const expanded = open === index;
            return (
              <article className={`experience-item ${expanded ? "is-open" : ""}`} key={experience.company}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? -1 : index)}
                >
                  <span className="experience-company">{experience.company}</span>
                  <span className="experience-role">{experience.role}</span>
                  <span className="experience-period">{experience.period}</span>
                  <span className="experience-toggle">
                    <Plus size={18} strokeWidth={1.8} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.div
                      className="experience-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease }}
                    >
                      <div>
                        <p>{experience.summary}</p>
                        <ul>
                          {experience.details.map((detail) => {
                            const [label, ...contentParts] = detail.split("｜");
                            const content = contentParts.join("｜");
                            return (
                              <li key={detail}>
                                {content ? (
                                  <>
                                    <strong>{label}</strong>
                                    <span>{content}</span>
                                  </>
                                ) : (
                                  <span>{detail}</span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="section contact-section" id="contact">
      <div className="section-shell contact-shell">
        <div className="contact-copy">
          <h2>
            <span className="contact-name">我是李家豪</span>
            <span className="contact-invite">期待与你讨论</span>
          </h2>
          <p>如果你正在寻找利用 AI 能够把复杂业务与设计交付连接起来的设计师，欢迎联系我。</p>
        </div>

        <aside className="contact-panel" aria-label="联系方式">
          <div className="contact-list">
            <a className="contact-item" href="tel:13670115683">
              <span className="contact-label">手机</span>
              <span className="contact-value">13670115683</span>
            </a>
            <div className="contact-item">
              <span className="contact-label">微信号</span>
              <span className="contact-value">Hungezu</span>
            </div>
            <a className="contact-item" href="mailto:2146953949@qq.com">
              <span className="contact-label">邮箱</span>
              <span className="contact-value">2146953949@qq.com</span>
            </a>
          </div>

          <figure className="contact-qr">
            <img
              src={publicAsset("/assets/visual/wechat-qr-hungezu.jpg")}
              alt="李家豪的微信二维码"
              loading="lazy"
              decoding="async"
            />
            <figcaption>微信扫码联系</figcaption>
          </figure>
        </aside>

        <div className="contact-copyright">
          <span>© 2026 李家豪 portfolio</span>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [highlightedAbilityId, setHighlightedAbilityId] = useState<AbilityId | null>(null);
  const reduce = useReducedMotion();

  const showRelatedProjects = (abilityId: AbilityId) => {
    setHighlightedAbilityId(abilityId);
    const firstProject = projects.find(project => project.abilityIds.includes(abilityId));
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const target = firstProject
          ? document.querySelector<HTMLElement>(`[data-project="${firstProject.slug}"]`)
          : document.getElementById("work");
        target?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
      });
    });
  };

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnProject = params.get("returnProject");
    const returnY = Number.parseInt(params.get("returnY") ?? "", 10);
    const shouldRestoreWork = params.get("returnSection") === "work";
    if (!returnProject && !shouldRestoreWork) return;

    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.classList.add("portfolio-restoring");
    root.style.scrollBehavior = "auto";

    const restore = () => {
      const projectCard = returnProject
        ? [...document.querySelectorAll<HTMLElement>("[data-project]")]
            .find(element => element.dataset.project === returnProject) ?? null
        : null;
      const workSection = document.getElementById("work");
      const targetY = Number.isFinite(returnY)
        ? returnY
        : Math.max(0, (projectCard ?? workSection)?.offsetTop ?? 0);
      window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
    };
    const frame = window.requestAnimationFrame(() => {
      restore();
      window.requestAnimationFrame(restore);
    });
    const timers = [80, 260, 620].map(delay => window.setTimeout(restore, delay));
    const targetImage = returnProject
      ? [...document.querySelectorAll<HTMLElement>("[data-project]")]
          .find(element => element.dataset.project === returnProject)
          ?.querySelector<HTMLImageElement>("img") ?? null
      : null;
    targetImage?.addEventListener("load", restore, { once: true });
    void document.fonts?.ready.then(restore);

    const finish = window.setTimeout(() => {
      restore();
      root.classList.remove("portfolio-restoring");
      root.style.scrollBehavior = previousBehavior;
      window.history.replaceState(window.history.state, "", "/portfolio/#work");
    }, 760);

    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach(timer => window.clearTimeout(timer));
      window.clearTimeout(finish);
      targetImage?.removeEventListener("load", restore);
      root.classList.remove("portfolio-restoring");
      root.style.scrollBehavior = previousBehavior;
    };
  }, []);

  return (
    <>
      <SiteNav onMenu={() => setMenuOpen(true)} />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="portfolio-home">
        <Hero />
        <AbilitySection onShowProjects={showRelatedProjects} />
        <WorkSection
          highlightedAbilityId={highlightedAbilityId}
          onClearHighlight={() => setHighlightedAbilityId(null)}
        />
        <ExperienceSection />
        <ContactSection />
      </main>
      <BackToTop />
      <PortfolioChat />
    </>
  );
}

function ProjectImageGallery({
  project,
  reduce,
}: {
  project: Project;
  reduce: boolean | null;
}) {
  return (
    <section className="case-gallery" aria-label={`${project.title}项目图片`}>
      {project.gallery.map((image, index) => (
        <motion.figure
          key={image}
          initial={reduce ? false : { opacity: 0, y: 24, clipPath: "inset(0 0 6% 0)" }}
          whileInView={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.58, ease }}
        >
          <ImageWithFallback
            src={image}
            alt={project.galleryAlt?.[index] ?? `${project.title}项目展示 ${index + 1}`}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
          />
        </motion.figure>
      ))}
    </section>
  );
}

function ProjectPage({ project, projectView }: { project: Project; projectView?: NationalPlatformView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();
  const isZhaocaiCase = project.slug === "zhaocai-smart";
  const isNationalPlatformCase = project.slug === "gkx";
  const isNationalPlatformSubpage = isNationalPlatformCase && projectView !== undefined && projectView !== "story";
  const isCustomCase = isZhaocaiCase || isNationalPlatformCase;
  const handleProjectBack = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    returnToProjectLocation(event, project.slug);
  };

  return (
    <>
      <SiteNav
        onMenu={() => setMenuOpen(true)}
        onProjectBack={handleProjectBack}
        projectView
      />
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main
        className={`case-page${isZhaocaiCase ? " case-page-zhaocai" : ""}${isNationalPlatformCase ? isNationalPlatformSubpage ? " case-page-national-platform" : " case-page-gkx" : ""}`}
        data-project={project.slug}
      >
        {!isCustomCase ? <header className="case-hero">
          <motion.div
            className="case-heading"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            <p>{project.type}</p>
            <h1>{project.title}</h1>
            <div className="case-summary">
              <p>{project.summary}</p>
              <span>{project.period}</span>
            </div>
          </motion.div>
        </header> : null}
        {isZhaocaiCase ? (
          <ZhaocaiSmartCase />
        ) : isNationalPlatformCase ? (
          isNationalPlatformSubpage ? <NationalSciencePlatformCase view={projectView} /> : <GkxCase project={project} subNavigation={<ProjectSubnav active="story" />} mdInteractiveContent={<GkxDesignSystemInteractive />} />
        ) : (
          <ProjectImageGallery project={project} reduce={reduce} />
        )}
        {!isCustomCase ? (
          <footer className="case-footer">
            <a href="/portfolio/#work" onClick={handleProjectBack}>
              <ArrowLeft size={16} strokeWidth={1.8} />
              返回项目列表
            </a>
          </footer>
        ) : null}
      </main>
      <BackToTop />
      <PortfolioChat />
    </>
  );
}

export default function PortfolioClient({ projectSlug, projectView }: { projectSlug?: string; projectView?: NationalPlatformView }) {
  if (!projectSlug) return <HomePage />;
  const project = projects.find((item) => item.slug === projectSlug);
  if (!project) {
    return (
      <main className="not-found">
        <h1>该项目暂时无法访问</h1>
        <a className="button button-primary" href="/portfolio/#work">
          返回作品列表
        </a>
      </main>
    );
  }
  return <ProjectPage project={project} projectView={projectView} />;
}
