"use client";

import "./site-navigation.css";

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
import Square from "lucide-react/dist/esm/icons/square.mjs";
import X from "lucide-react/dist/esm/icons/x.mjs";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ImgHTMLAttributes,
  type ReactNode,
  Component,
  lazy,
  Suspense,
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
  collectChatReferences,
  getChatFollowUpPrompts,
  getChatQuickPrompts,
  parseChatReplyContext,
  resolveChatPageContext,
  OUT_OF_SCOPE_REPLY,
  type ChatReplyContext,
  type ChatReference,
} from "./chat-knowledge";
import {
  clearChatSession,
  parseChatReference,
  readChatSession,
  writeChatSession,
  type PortfolioChatMessage,
  type PortfolioChatMode,
  type PortfolioChatSession,
} from "./portfolio-chat-session";
import portfolioPetAssets from "../assets/visual/sidebar-character/assets.json";
import { optimizedImage, PortfolioImage } from "./portfolio-image";
import { CapabilitySection } from "./capability-section";
import type { NationalPlatformView } from "./case-studies/NationalSciencePlatformCase";
import { ProjectLocator, type ProjectLocatorSection } from "./project-locator";

const ZhaocaiSmartCase = lazy(() => import("./case-studies/ZhaocaiSmartCase").then(module => ({ default: module.ZhaocaiSmartCase })));
const GkxCase = lazy(() => import("./case-studies/GkxCase").then(module => ({ default: module.GkxCase })));

class ProjectContentBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return <div className="case-loading image-fallback" role="alert">
      <p>项目内容暂时未能加载</p>
      <button type="button" onClick={() => window.location.reload()}>重新加载</button>
    </div>;
    return this.props.children;
  }
}

const ease = [0.16, 1, 0.3, 1] as const;
const heroVideoAsset = "/assets/visual/hero-motion.mp4";
const heroMobileVideoAsset = "/assets/visual/hero-motion-mobile.mp4";
const abilityLabelById = new Map(abilities.map(ability => [ability.id, ability.axisLabel]));

const homeProjectContent: Record<string, { titleLines: string[]; summary: string }> = {
  gkx: {
    titleLines: ["深圳国际", "科技信息中心"],
    summary: "为门户内多个业务系统建立统一的页面与组件规范，并用 AI 协作维护设计 MD、验证原型与支持评审优化。",
  },
  "zhaocai-smart": {
    titleLines: ["招财 Smart"],
    summary: "为企业经营分析场景设计从提问、澄清到执行、解释与看板沉淀的智能问数链路，并统一多类型结果的呈现规范。",
  },
  "tax-cloud": {
    titleLines: ["税纪云", "全税种申报平台"],
    summary: "主导税纪云 2.0 Web 与 App 体验改版，重构申报、审批、风险预警和法规查询等高频财税任务。",
  },
  "energy-tax": {
    titleLines: ["国家能源集团", "报税平台"],
    summary: "独立负责报税平台从 0 到 1 的 UI 设计，覆盖首页、纳税申报和综合管理工作台，并建立页面与组件规范。",
  },
  "data-visualisation": {
    titleLines: ["可视化大屏", "项目合集"],
    summary: "汇集汽车、轨道交通、新能源、电子及地产等行业大屏，以地图、指标、趋势和排行组织高密度业务信息。",
  },
};

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
  const projectBack = projectView ? (
    <a className="nav-pill nav-back" href="/portfolio/#work" onClick={onProjectBack}>
      <span className="nav-circle nav-circle-dark"><ArrowLeft size={12} strokeWidth={2.6} /></span>
      <span>返回作品</span>
    </a>
  ) : null;

  return (
    <motion.nav
      className="site-nav site-navigation"
      initial={reduce ? false : { y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease }}
    >
      <div className="nav-left">
        <a className="brand-link" href="/portfolio/#top">
          <BrandMark />
        </a>
        {projectBack}
      </div>
      <div className="nav-right">
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
    ["精选作品", "/portfolio/#work"],
    ["工作经历", "/portfolio/#experience"],
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

const CHAT_WELCOME_MESSAGE: PortfolioChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "**想先了解哪一面？**\n\n我是 Leo 的作品集助手。可以帮你找案例、看经历，也聊设计思路和协作方式。",
};

function createWelcomeMessage(project?: Project): PortfolioChatMessage {
  return {
    ...CHAT_WELCOME_MESSAGE,
    id: createChatMessageId(),
    context: { ...(project ? { projectSlug: project.slug } : {}), entryIds: [] },
    ...(project ? { content: `**一起看看${project.shortTitle.replace(/\n/g, "")}。**\n\n我可以帮你了解 Leo 在这个项目中的职责、关键决策和交付内容。` } : {}),
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
    .slice(0, 12)
    .map(parseChatReference)
    .filter((reference): reference is ChatReference => Boolean(reference))
    .slice(0, 3);
}

function chatModeLabel(mode: PortfolioChatMode) {
  if (mode === "api") return "Leo.li · AI 作品集导览";
  return "Leo.li · 项目与设计导览";
}

function renderPortfolioChatInline(text: string, keyPrefix: string) {
  return text
    .split(/(\*\*[^*\n]+\*\*|`[^`\n]+`)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={`${keyPrefix}-strong-${index}`}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={`${keyPrefix}-code-${index}`}>{part.slice(1, -1)}</code>;
      }
      return part;
    });
}

function PortfolioChatMessageContent({ content }: { content: string }) {
  const blocks = content.trim().split(/\n{2,}/).filter(Boolean);

  return (
    <div className="portfolio-chat-rich-text">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").map(line => line.trim()).filter(Boolean);
        const titleMatch = block.match(/^\*\*([^*\n]+)\*\*$/);
        if (titleMatch) {
          return <p className="portfolio-chat-rich-title" key={`title-${blockIndex}`}><strong>{titleMatch[1]}</strong></p>;
        }
        if (lines.length && lines.every(line => /^[-*]\s+/.test(line))) {
          return (
            <ul key={`list-${blockIndex}`}>
              {lines.map((line, lineIndex) => (
                <li key={`list-${blockIndex}-${lineIndex}`}>
                  {renderPortfolioChatInline(line.replace(/^[-*]\s+/, ""), `list-${blockIndex}-${lineIndex}`)}
                </li>
              ))}
            </ul>
          );
        }
        if (lines.length && lines.every(line => /^\d+[.)]\s+/.test(line))) {
          return (
            <ol key={`ordered-${blockIndex}`}>
              {lines.map((line, lineIndex) => (
                <li key={`ordered-${blockIndex}-${lineIndex}`}>
                  {renderPortfolioChatInline(line.replace(/^\d+[.)]\s+/, ""), `ordered-${blockIndex}-${lineIndex}`)}
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={`paragraph-${blockIndex}`}>
            {lines.map((line, lineIndex) => (
              <span key={`line-${blockIndex}-${lineIndex}`}>
                {renderPortfolioChatInline(line, `paragraph-${blockIndex}-${lineIndex}`)}
                {lineIndex < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

type PortfolioPetState =
  | "idle"
  | "waving"
  | "thinking"
  | "success"
  | "curious"
  | "pointing";

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

function isPortfolioCharacterRect(rect: number[]): rect is [number, number, number, number] {
  return rect.length === 4 && rect.every(value => Number.isFinite(value));
}

const portfolioCharacterStates = Object.entries(portfolioPetAssets.states).reduce<Record<string, PortfolioCharacterState>>(
  (states, [name, state]) => {
    states[name] = {
      ...state,
      frames: state.frames.map(frame => {
        if (!isPortfolioCharacterRect(frame.rect)) {
          throw new Error(`Invalid portfolio character frame rectangle: ${name}`);
        }
        return { ...frame, rect: frame.rect };
      }),
    };
    return states;
  },
  {},
);

const portfolioCharacterMap: {
  sources: Record<string, { file: string; width: number; height: number }>;
  states: Record<string, PortfolioCharacterState>;
} = {
  sources: portfolioPetAssets.sources,
  states: portfolioCharacterStates,
};

const portfolioPetStateMap: Record<PortfolioPetState, string> = {
  idle: "idle",
  waving: "wave",
  thinking: "thinking",
  success: "success",
  curious: "curious",
  pointing: "point",
};

type PortfolioPetDrag = {
  x: number;
  y: number;
};

type PortfolioChatContext = {
  id: string;
  elementId: string;
  text: string;
};

const HOME_CHAT_CONTEXTS: PortfolioChatContext[] = [
  { id: "home", elementId: "top", text: "想了解 Leo 的设计与经历？点我聊聊。" },
  { id: "ability", elementId: "ability", text: "想看能力对应的案例？可以问我。" },
  { id: "work", elementId: "work", text: "想了解某个项目的职责与难点？可以问我。" },
  { id: "experience", elementId: "experience", text: "想了解某段经历里 Leo 负责什么？" },
  { id: "contact", elementId: "contact", text: "想聊合作？这里有 Leo 的联系方式。" },
];

const PROJECT_CHAT_CONTEXTS: Record<string, PortfolioChatContext[]> = {
  gkx: [
    { id: "gkx-overview", elementId: "gkx-overview", text: "国科信的主线：让多个系统保持一致体验。" },
    { id: "gkx-scope", elementId: "gkx-scope", text: "哪些规则统一，哪些业务差异保留？" },
    { id: "gkx-decisions", elementId: "gkx-decisions", text: "想了解这些设计取舍的依据？可以问我。" },
    { id: "gkx-system", elementId: "gkx-design-system", text: "这里可以试用设计规范和组件。" },
    { id: "gkx-workflow", elementId: "gkx-workflow", text: "AI 做什么、Leo 判断什么，这里有实例。" },
    { id: "gkx-validation", elementId: "nsp-prototype", text: "可以操作原型，看看规则怎样落到流程里。" },
    { id: "gkx-collaboration", elementId: "gkx-collaboration", text: "想了解规范怎样用于团队协作？可以问我。" },
    { id: "gkx-outcomes", elementId: "gkx-outcomes", text: "这里收束了交付成果与项目复盘。" },
  ],
  "zhaocai-smart": [
    { id: "zcs-overview", elementId: "zcs-project-overview", text: "想了解一句提问怎样变成可核对的结果？" },
    { id: "zcs-business", elementId: "zcs-business-needs", text: "同一句“利润”，可能对应不同统计口径。" },
    { id: "zcs-demo", elementId: "zcs-experience-journey", text: "可以试试完整任务，也能体验超时和恢复。" },
    { id: "zcs-clarification", elementId: "zcs-clarification", text: "为什么先确认口径？这里有设计依据。" },
    { id: "zcs-process-feedback", elementId: "zcs-process-feedback", text: "等待时，用户也能查看进度和停止任务。" },
    { id: "zcs-markdown-system", elementId: "zcs-markdown-system", text: "结果怎样保留依据、继续复用？往这里看。" },
    { id: "zcs-trust-mechanism", elementId: "zcs-trust-mechanism", text: "想了解 AI 和设计师怎样分工？可以问我。" },
  ],
  "tax-cloud": [
    { id: "tax-cloud-overview", elementId: "project-overview", text: "税纪云可以沿着角色任务与申报流程看。" },
    { id: "tax-cloud-entry", elementId: "case-gallery-0", text: "从业务梳理开始，看看跨端改版怎样展开。" },
    { id: "tax-cloud-path", elementId: "case-gallery-2", text: "这张图串起了不同角色的申报路径。" },
    { id: "tax-cloud-form", elementId: "case-gallery-4", text: "表单重点：信息分组、筛选与错误预防。" },
    { id: "tax-cloud-redesign", elementId: "case-gallery-8", text: "可以对照新旧首页的任务优先级。" },
    { id: "tax-cloud-mobile", elementId: "case-gallery-14", text: "看看审批、查询怎样适配移动端。" },
  ],
  "energy-tax": [
    { id: "energy-overview", elementId: "project-overview", text: "先看职责范围，再看报税平台怎样落地。" },
    { id: "energy-entry", elementId: "case-gallery-0", text: "从项目背景开始了解设计范围。" },
    { id: "energy-system", elementId: "case-gallery-2", text: "统一栅格、组件和缺省状态，让页面有章可循。" },
    { id: "energy-home", elementId: "case-gallery-3", text: "首页怎样分开数据概览与任务入口？" },
    { id: "energy-workbench", elementId: "case-gallery-4", text: "看看申报任务的操作顺序与状态反馈。" },
    { id: "energy-review", elementId: "case-gallery-6", text: "别漏掉缺省状态，这里也有项目复盘。" },
  ],
  "data-visualisation": [
    { id: "visual-overview", elementId: "project-overview", text: "这些行业大屏，怎样安排信息优先级？" },
    { id: "visual-entry", elementId: "case-gallery-0", text: "先看信息层级，再看图表怎样组合。" },
    { id: "visual-multi", elementId: "case-gallery-1", text: "同样是地图和指标，各行业的阅读重点不同。" },
    { id: "visual-transport", elementId: "case-gallery-2", text: "看看空间信息与业务指标怎样放在一起。" },
    { id: "visual-estate", elementId: "case-gallery-3", text: "高密度数据，可以从分区和对比关系看。" },
    { id: "visual-rules", elementId: "case-gallery-4", text: "这里整理了可复用的大屏布局规范。" },
  ],
};

function getPortfolioChatContexts() {
  const projectRoot = document.querySelector<HTMLElement>("main[data-project]");
  const projectSlug = projectRoot?.dataset.project;
  if (projectSlug && PROJECT_CHAT_CONTEXTS[projectSlug]) return PROJECT_CHAT_CONTEXTS[projectSlug];
  if (projectRoot) {
    return [{ id: "case", elementId: "", text: "想了解这个项目的设计思路？可以问我。" }];
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
  const assetState = peeking ? "peek-right" : portfolioPetStateMap[state];
  const config = portfolioCharacterMap.states[assetState];
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    // Warm the full-body poses while the character is still peeking. Loading must
    // never decide whether an open conversation shows the closed character pose.
    const sources = new Set(Object.values(portfolioPetStateMap).map(name => portfolioCharacterMap.states[name].source));
    const images = [...sources].map(name => {
      const path = `/assets/visual/sidebar-character/${portfolioCharacterMap.sources[name].file}`;
      const original = publicAsset(path);
      const image = new Image();
      image.fetchPriority = "low";
      image.onerror = () => {
        image.onerror = null;
        image.src = original;
      };
      image.src = publicAsset(optimizedImage(path)?.src ?? path);
      return image;
    });
    return () => { images.forEach(image => { image.onerror = null; }); };
  }, []);

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
  const originalPath = `/assets/visual/sidebar-character/${source.file}`;

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
              key={config.source}
              src={publicAsset(optimizedImage(originalPath)?.src ?? originalPath)}
              alt=""
              draggable={false}
              decoding="async"
              fetchPriority="low"
              onError={event => {
                const original = publicAsset(originalPath);
                if (event.currentTarget.getAttribute("src") !== original) event.currentTarget.src = original;
              }}
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

function PortfolioChat({ project }: { project?: Project }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<PortfolioChatMode>("unknown");
  const [messages, setMessages] = useState<PortfolioChatMessage[]>(() => [createWelcomeMessage(project)]);
  const [sessionReady, setSessionReady] = useState(false);
  const [activeContext, setActiveContext] = useState<ChatReplyContext>(() => ({ ...(project ? { projectSlug: project.slug } : {}), entryIds: [] }));
  const [context, setContext] = useState<PortfolioChatContext>(HOME_CHAT_CONTEXTS[0]);
  const [contextVisible, setContextVisible] = useState(false);
  const [hintMode, setHintMode] = useState<"auto" | "intent">("auto");
  const [petState, setPetState] = useState<PortfolioPetState>("idle");
  const [petDrag, setPetDrag] = useState<PortfolioPetDrag>({ x: 0, y: 0 });
  const [petDragging, setPetDragging] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const contextIdRef = useRef(HOME_CHAT_CONTEXTS[0].id);
  const shownContextIdsRef = useRef(new Set<string>());
  const contextTimerRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const petTimerRef = useRef<number | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const pendingQueryRef = useRef<string | null>(null);
  const conversationIdRef = useRef(0);
  const sessionReadyRef = useRef(false);
  const sessionSnapshotRef = useRef<PortfolioChatSession>({ messages, draft, mode, activeContext, pageProjectSlug: project?.slug ?? null });
  const activeContextRef = useRef(activeContext);
  const sendingRef = useRef(sending);
  const openRef = useRef(open);
  const restoreLauncherFocusRef = useRef(true);
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
  openRef.current = open;
  activeContextRef.current = activeContext;
  sessionSnapshotRef.current = { messages, draft, mode, activeContext, pageProjectSlug: project?.slug ?? null };

  const persistChatSession = () => {
    if (!sessionReadyRef.current) return;
    try {
      const snapshot = sessionSnapshotRef.current;
      if (snapshot.messages.length === 1 && !snapshot.draft) clearChatSession(window.sessionStorage);
      else writeChatSession(window.sessionStorage, snapshot);
    } catch {
      // Storage can be unavailable in private browsing; the current chat still works.
    }
  };

  useEffect(() => {
    const restoreSession = () => {
      try {
        const saved = readChatSession(window.sessionStorage) ?? {
          messages: [createWelcomeMessage(project)], draft: "", mode: "unknown" as const,
          activeContext: { ...(project ? { projectSlug: project.slug } : {}), entryIds: [] },
          pageProjectSlug: project?.slug ?? null,
        };
        const restoredContext = resolveChatPageContext(
          saved.activeContext ?? [...saved.messages].reverse().find(message => message.role === "assistant" && message.context)?.context,
          saved.pageProjectSlug,
          project?.slug,
        );
        if (saved.messages.length === 1 && saved.messages[0].role === "assistant") saved.messages = [createWelcomeMessage(project)];
        const last = saved.messages[saved.messages.length - 1];
        if (last?.role === "user") {
          saved.messages.push({
            id: createChatMessageId(),
            role: "assistant",
            content: "上次回复未完成，聊天记录已保留。你可以重新发送这条问题，或继续提问。",
            state: "stopped",
            retryQuery: last.content,
            context: restoredContext,
          });
        }
        sessionSnapshotRef.current = { ...saved, activeContext: restoredContext, pageProjectSlug: project?.slug ?? null };
        activeContextRef.current = restoredContext;
        setActiveContext(restoredContext);
        setMessages(saved.messages);
        setDraft(saved.draft);
        setMode(saved.mode);
        setSending(false);
        setPetState("idle");
      } catch {
        // No persistence is required to ask a question.
      }
    };
    restoreSession();
    sessionReadyRef.current = true;
    setSessionReady(true);
    const onPageHide = () => {
      persistChatSession();
      conversationIdRef.current += 1;
      requestRef.current?.abort();
      requestRef.current = null;
      pendingQueryRef.current = null;
      sendingRef.current = false;
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) restoreSession();
    };
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      persistChatSession();
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      conversationIdRef.current += 1;
      requestRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (sessionReady) persistChatSession();
  }, [messages, draft, mode, activeContext, sessionReady]);

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
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      drag.active = false;
      drag.pointerId = -1;
    }
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
      }, 380);
      setPetDrag({ x: 0, y: 0 });
    }
    drag.active = false;
    drag.pointerId = -1;
    setPetDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  useEffect(() => {
    const contexts = getPortfolioChatContexts();
    let welcomeTimer: number | undefined;

    const revealContext = () => {
      setHintMode("auto");
      setContextVisible(true);
      if (contextTimerRef.current !== null) window.clearTimeout(contextTimerRef.current);
      contextTimerRef.current = window.setTimeout(() => {
        setContextVisible(false);
        contextTimerRef.current = null;
      }, 6000);
    };

    const syncContext = (show = false) => {
      const next = getNearestPortfolioChatContext(contexts);
      const changed = next.id !== contextIdRef.current;
      if (changed) {
        contextIdRef.current = next.id;
        setContext(next);
      }
      if (
        !show || openRef.current || petDragRef.current.active ||
        document.documentElement.classList.contains("portfolio-loading") ||
        shownContextIdsRef.current.has(next.id)
      ) return;
      shownContextIdsRef.current.add(next.id);
      revealContext();
      pulsePet("pointing", 1500);
    };

    // 项目页的第一段不一定和首页相同，挂载后立即校准一次。
    syncContext();

    const showWelcomeHint = () => {
      if (document.documentElement.classList.contains("portfolio-loading")) {
        welcomeTimer = window.setTimeout(showWelcomeHint, 300);
        return;
      }
      syncContext(true);
    };
    welcomeTimer = window.setTimeout(showWelcomeHint, 1800);

    const onScroll = () => {
      setContextVisible(false);
      if (scrollTimerRef.current !== null) window.clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = window.setTimeout(() => {
        if (!sendingRef.current) setPetState("idle");
        syncContext(true);
        scrollTimerRef.current = null;
      }, 650);
    };

    const onResize = () => syncContext();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(welcomeTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (contextTimerRef.current !== null) window.clearTimeout(contextTimerRef.current);
      if (scrollTimerRef.current !== null) window.clearTimeout(scrollTimerRef.current);
    };
  }, [open]);

  useEffect(() => () => {
    if (petTimerRef.current !== null) window.clearTimeout(petTimerRef.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const viewport = window.visualViewport;
    const element = chatRef.current;
    if (!viewport || !element) return;
    let frame = 0;
    const syncViewport = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        // Keep the composer above the on-screen keyboard without changing pinch zoom.
        if (viewport.scale !== 1) return;
        element.style.setProperty("--chat-viewport-height", `${viewport.height}px`);
        element.style.setProperty("--chat-viewport-bottom", `${Math.max(0, document.documentElement.clientHeight - viewport.height - viewport.offsetTop)}px`);
      });
    };
    syncViewport();
    viewport.addEventListener("resize", syncViewport);
    viewport.addEventListener("scroll", syncViewport);
    window.addEventListener("resize", syncViewport);
    return () => {
      window.cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", syncViewport);
      viewport.removeEventListener("scroll", syncViewport);
      window.removeEventListener("resize", syncViewport);
      element.style.removeProperty("--chat-viewport-height");
      element.style.removeProperty("--chat-viewport-bottom");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    restoreLauncherFocusRef.current = true;
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusFrame = window.requestAnimationFrame(() => {
      // Opening the panel on touch devices should not immediately summon the keyboard.
      if (window.matchMedia("(min-width: 768px) and (pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
      else document.getElementById("portfolio-chat-panel")?.focus({ preventScroll: true });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.isComposing && !event.defaultPrevented) {
        event.preventDefault();
        setOpen(false);
        setContextVisible(false);
        setPetState("idle");
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      if (!restoreLauncherFocusRef.current) return;
      window.requestAnimationFrame(() => {
        if (
          previouslyFocused &&
          previouslyFocused !== document.body &&
          document.contains(previouslyFocused)
        ) previouslyFocused.focus({ preventScroll: true });
        else launcherRef.current?.focus({ preventScroll: true });
      });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const list = messageListRef.current;
    if (!list) return;
    const latest = messages[messages.length - 1];
    const reply = !sending && latest?.role === "assistant" && messages.length > 1
      ? list.querySelector<HTMLElement>(`[data-chat-message-id="${latest.id}"]`)
      : null;
    const frame = window.requestAnimationFrame(() => {
      list.scrollTo({
        top: reply
          ? list.scrollTop + reply.getBoundingClientRect().top - list.getBoundingClientRect().top - 16
          : messages.length === 1 ? 0 : list.scrollHeight,
        behavior: reduce ? "auto" : "smooth",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [messages, sending, open, reduce]);

  const sendMessage = async (rawValue: string, preserveDraft = false) => {
    if (sending || sendingRef.current) return;
    const conversationId = conversationIdRef.current;
    const startedAt = performance.now();
    const minimumReplyDelay = reduce ? 140 : 480;
    const query = rawValue.trim().slice(0, 600);
    if (!query) return;
    sendingRef.current = true;
    const controller = new AbortController();
    requestRef.current = controller;
    pendingQueryRef.current = query;

    const userMessage: PortfolioChatMessage = {
      id: createChatMessageId(),
      role: "user",
      content: query,
    };
    const nextConversation = [...messages, userMessage];
    const usedQuestionButton = messageListRef.current?.contains(document.activeElement);
    setMessages(nextConversation);
    if (!preserveDraft) setDraft("");
    setSending(true);
    setPetState("thinking");
    if (usedQuestionButton) window.requestAnimationFrame(() => {
      if (!openRef.current) return;
      if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true });
      else document.getElementById("portfolio-chat-panel")?.focus({ preventScroll: true });
    });

    const previousContext = activeContextRef.current;
    const userContext = previousContext
      ? [project?.slug ?? "", previousContext.projectSlug ?? "", query].join(" ")
      : [project?.slug ?? "", ...nextConversation.filter(message => message.role === "user").slice(-3).map(message => message.content)].join(" ");
    const requestIsCurrent = () => conversationId === conversationIdRef.current && requestRef.current === controller;
    const appendLocalReply = (fallback: boolean) => {
      if (!requestIsCurrent()) return;
      const local = buildLocalChatReply(query, userContext, previousContext);
      activeContextRef.current = local.context;
      setActiveContext(local.context);
      setMode(local.reply === OUT_OF_SCOPE_REPLY ? "guardrail" : fallback ? "local-fallback" : "local");
      pulsePet(local.reply === OUT_OF_SCOPE_REPLY ? "curious" : "success");
      setMessages(current => [
        ...current,
        {
          id: createChatMessageId(),
          role: "assistant",
          content: local.reply,
          references: collectChatReferences(local.entries, 3),
          context: local.context,
          ...(fallback && local.reply !== OUT_OF_SCOPE_REPLY ? { state: "fallback" as const } : {}),
        },
      ]);
    };

    let timeout: number | undefined;
    try {
      // Static hosting uses the same knowledge directly, with cancellable pending state.
      if (window.__PORTFOLIO_BASE__ && !window.__PORTFOLIO_CHAT_API__) {
        await waitForChatReply(startedAt, minimumReplyDelay);
        appendLocalReply(false);
        return;
      }
      timeout = window.setTimeout(() => controller.abort(), 11_000);
      const response = await fetch(getChatEndpoint(), {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectSlug: project?.slug,
          conversationContext: previousContext,
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
        context?: unknown;
      } | null;
      if (!response.ok || typeof payload?.reply !== "string" || !payload.reply.trim()) {
        throw new Error("chat endpoint unavailable");
      }
      const reply = payload.reply.trim();
      await waitForChatReply(startedAt, minimumReplyDelay);
      if (!requestIsCurrent()) return;

      const responseMode: PortfolioChatMode = payload.mode === "api"
        ? "api"
        : payload.mode === "guardrail"
          ? "guardrail"
          : payload.mode === "local-fallback" ? "local-fallback" : "local";
      setMode(responseMode);
      const nextContext = parseChatReplyContext(payload.context) ?? buildLocalChatReply(query, userContext, previousContext).context;
      activeContextRef.current = nextContext;
      setActiveContext(nextContext);
      pulsePet(reply === OUT_OF_SCOPE_REPLY ? "curious" : "success");
      setMessages(current => [
        ...current,
        {
          id: createChatMessageId(),
          role: "assistant",
          content: reply,
          references: parseChatReferences(payload.references),
          context: nextContext,
          ...(responseMode === "local-fallback" ? { state: "fallback" as const } : {}),
        },
      ]);
    } catch {
      if (!requestIsCurrent()) return;
      await waitForChatReply(startedAt, minimumReplyDelay);
      appendLocalReply(true);
    } finally {
      window.clearTimeout(timeout);
      if (requestIsCurrent()) {
        requestRef.current = null;
        pendingQueryRef.current = null;
        sendingRef.current = false;
        setSending(false);
      }
    }
  };

  const stopReply = () => {
    if (!sendingRef.current) return;
    const query = pendingQueryRef.current;
    const previousContext = activeContextRef.current;
    conversationIdRef.current += 1;
    requestRef.current?.abort();
    requestRef.current = null;
    pendingQueryRef.current = null;
    sendingRef.current = false;
    setSending(false);
    setPetState("idle");
    setMessages(current => [...current, {
      id: createChatMessageId(),
      role: "assistant",
      content: "已停止这次回复。聊天记录已保留，可以继续提问。",
      state: "stopped",
      ...(query ? { retryQuery: query } : {}),
      context: previousContext,
    }]);
  };

  const startNewConversation = () => {
    conversationIdRef.current += 1;
    requestRef.current?.abort();
    requestRef.current = null;
    pendingQueryRef.current = null;
    sendingRef.current = false;
    const initialMessages = [createWelcomeMessage(project)];
    const initialContext: ChatReplyContext = { ...(project ? { projectSlug: project.slug } : {}), entryIds: [] };
    activeContextRef.current = initialContext;
    setActiveContext(initialContext);
    sessionSnapshotRef.current = { messages: initialMessages, draft: "", mode: "unknown", activeContext: initialContext, pageProjectSlug: project?.slug ?? null };
    try { clearChatSession(window.sessionStorage); } catch { /* Storage is optional. */ }
    setMessages(initialMessages);
    setDraft("");
    setSending(false);
    setMode("unknown");
    setPetState("idle");
    window.requestAnimationFrame(() => { if (openRef.current) inputRef.current?.focus({ preventScroll: true }); });
  };

  const closeChat = (restoreFocus = true) => {
    restoreLauncherFocusRef.current = restoreFocus;
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

  const showPetHint = () => {
    if (open || petDragging) return;
    setContext(getNearestPortfolioChatContext(getPortfolioChatContexts()));
    setHintMode("intent");
    setContextVisible(true);
    if (contextTimerRef.current !== null) window.clearTimeout(contextTimerRef.current);
    contextTimerRef.current = null;
  };

  const quickPrompts = messages.length === 1
    ? getChatQuickPrompts(project?.slug)
    : getChatFollowUpPrompts(activeContext, messages.filter(message => message.role === "user").map(message => message.content));

  const visiblePetState: PortfolioPetState = sending ? "thinking" : petState;
  const petPositionStyle = {
    "--pet-drag-right": `${-petDrag.x}px`,
    "--pet-drag-bottom": `${-petDrag.y}px`,
  } as CSSProperties;

  return (
    <div
      ref={chatRef}
      className="portfolio-chat"
      style={petPositionStyle}
      data-chat-mode={mode}
      data-chat-open={open}
      data-pet-state={visiblePetState}
    >
      <AnimatePresence initial={false}>
        {!open && contextVisible ? (
          <motion.div
            className="portfolio-pet-context"
            id="portfolio-pet-hint"
            data-hint-mode={hintMode}
            key={context.id}
            role="tooltip"
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
        aria-controls={open ? "portfolio-chat-panel" : undefined}
        aria-describedby={!open && contextVisible ? "portfolio-pet-hint" : undefined}
        aria-expanded={open}
        title={open ? "关闭作品集助手" : "打开作品集助手"}
        onClick={handlePetClick}
        onPointerEnter={event => { if (event.pointerType === "mouse") showPetHint(); }}
        onPointerLeave={() => { if (hintMode === "intent") setContextVisible(false); }}
        onFocus={showPetHint}
        onBlur={() => { if (hintMode === "intent") setContextVisible(false); }}
        onPointerDown={handlePetPointerDown}
        onPointerMove={handlePetPointerMove}
        onPointerUp={finishPetDrag}
        onPointerCancel={finishPetDrag}
        whileTap={reduce ? undefined : { scale: 0.96 }}
      >
        <span className="portfolio-pet-window" aria-hidden="true">
          <PortfolioPetSprite state={visiblePetState} peeking={!open} />
        </span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.section
            id="portfolio-chat-panel"
            className={`portfolio-chat-panel${messages.length === 1 ? " is-empty" : ""}`}
            role="dialog"
            aria-modal="false"
            aria-labelledby="portfolio-chat-title"
            tabIndex={-1}
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
                  <h2 id="portfolio-chat-title">作品集助手</h2>
                  <p>{chatModeLabel(mode)}</p>
                </div>
              </div>
              <div className="portfolio-chat-actions">
                <span className="portfolio-chat-reset-wrap">
                <button
                  className="portfolio-chat-new"
                  type="button"
                  aria-label="重置对话"
                  aria-describedby="portfolio-chat-reset-hint"
                  onClick={startNewConversation}
                  disabled={messages.length === 1 && !draft.trim()}
                >
                  <RotateCcw size={16} strokeWidth={2} />
                </button>
                <span id="portfolio-chat-reset-hint" className="portfolio-chat-action-tooltip" role="tooltip">重置对话</span>
                </span>
                <button
                  className="portfolio-chat-close"
                  type="button"
                  aria-label="关闭作品集助手"
                  title="关闭对话（Esc）"
                  onClick={() => closeChat()}
                >
                  <X size={17} strokeWidth={2} />
                </button>
              </div>
            </header>

            <div
              ref={messageListRef}
              className="portfolio-chat-messages"
              role="log"
              aria-live="polite"
              aria-busy={sending}
              aria-label="对话内容"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {messages.map((message, messageIndex) => (
                  <motion.div
                    className={`portfolio-chat-message is-${message.role}${messageIndex === 0 ? " is-intro" : ""}`}
                    data-chat-message-id={message.id}
                    key={message.id}
                    layout="position"
                    initial={reduce ? false : { opacity: 0, y: 10, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? undefined : { opacity: 0, y: -5, scale: 0.99 }}
                    transition={{ duration: reduce ? 0 : 0.24, ease }}
                  >
                    {message.role === "assistant" && messageIndex !== 0 ? (
                      <span className="portfolio-chat-avatar" aria-hidden="true"><MessageCircle size={14} /></span>
                    ) : null}
                    <div className="portfolio-chat-bubble-wrap">
                      <div className="portfolio-chat-bubble">
                        {message.role === "assistant"
                          ? <PortfolioChatMessageContent content={message.content} />
                          : message.content}
                      </div>
                      {message.state === "fallback" ? <p className="portfolio-chat-reply-note">本次根据作品集资料整理</p> : null}
                      {message.retryQuery ? (
                        <button
                          className="portfolio-chat-retry"
                          type="button"
                          disabled={sending}
                          onClick={() => { if (message.retryQuery) void sendMessage(message.retryQuery, true); }}
                        >
                          <RotateCcw size={13} aria-hidden="true" />
                          重新发送
                        </button>
                      ) : null}
                      {message.references?.length ? (
                        <div className="portfolio-chat-references">
                          <span>{message.references.every(reference => reference.kind === "project") ? "相关案例" : "相关内容"}</span>
                          <div>
                            {message.references.map(reference => (
                              <a
                                key={`${message.id}-${reference.href}`}
                                href={getPortfolioRoute(reference.href)}
                                onClick={() => { persistChatSession(); closeChat(false); }}
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
                {!sending && quickPrompts.length ? (
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
                    <p>{messages.length === 1 ? "可以从这里开始" : "也可以继续了解"}</p>
                    {quickPrompts.map(prompt => (
                      <button
                        key={prompt}
                        type="button"
                        disabled={sending}
                        aria-label={`提问：${prompt}`}
                        onClick={() => void sendMessage(prompt, true)}
                      >
                        <span>{prompt}</span>
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
                    <span className="portfolio-chat-avatar" aria-hidden="true"><MessageCircle size={14} /></span>
                    <div className="portfolio-chat-bubble portfolio-chat-loading-bubble">
                      <span /><span /><span />
                      <p>正在整理相关内容</p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <form
              className="portfolio-chat-composer"
              onSubmit={event => {
                event.preventDefault();
                void sendMessage(draft);
              }}
            >
              <div className="portfolio-chat-input-row">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={event => setDraft(event.target.value)}
                rows={2}
                maxLength={600}
                placeholder={project ? "问问这个项目的职责、难点…" : "问问项目、经历或设计思路…"}
                aria-label="输入关于李家豪及其设计作品的问题"
                autoComplete="off"
                enterKeyHint="send"
                onKeyDown={event => {
                  if (event.key !== "Enter" || event.shiftKey) return;
                  if (event.nativeEvent.isComposing || event.keyCode === 229) return;
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }}
              />
              <button
                type={sending ? "button" : "submit"}
                aria-label={sending ? "停止本次回复" : "发送问题"}
                title={sending ? "停止本次回复" : "发送问题"}
                onClick={sending ? event => {
                  event.preventDefault();
                  stopReply();
                } : undefined}
                disabled={!sessionReady || (!sending && !draft.trim())}
              >
                {sending ? <Square size={13} fill="currentColor" strokeWidth={0} /> : <Send size={16} strokeWidth={2.1} />}
              </button>
              </div>
              <div className="portfolio-chat-composer-note">
                <span>{sending ? "可点击方块停止，聊天记录会保留" : "根据作品集公开内容回答"}</span>
                <span className="portfolio-chat-key-hint">{sending ? "可点击方块停止，聊天记录会保留" : "Enter 发送 · Shift + Enter 换行"}</span>
              </div>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoPreloadState, setVideoPreloadState] = useState<"pending" | "disabled" | "loading" | "ready" | "error">("pending");
  const [videoFallbackReason, setVideoFallbackReason] = useState<string>();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroVisibleRef = useRef(true);

  useEffect(() => {
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean };
    }).connection;
    // Keep the requested hero film independent of reduced entrance animation.
    // Data-saving connections and unsupported video still use the poster.
    const fallbackReason = connection?.saveData ? "save-data"
      : !videoRef.current?.canPlayType("video/mp4") ? "unsupported-format" : undefined;
    setVideoFallbackReason(fallbackReason);
    if (fallbackReason) {
      setShouldLoadVideo(false);
      setVideoPreloadState("disabled");
      return;
    }

    // The opening loader waits for this video to have a first frame available.
    setVideoPreloadState(current => current === "ready" ? current : "loading");
    setShouldLoadVideo(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!shouldLoadVideo) {
      video.pause();
      video.load();
      setIsVideoPlaying(false);
      return;
    }

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

    video.load();
    tryPlay();
    observer.observe(video.closest(".hero") ?? video);
    window.addEventListener("pageshow", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    window.addEventListener("pointerdown", syncPlayback, { passive: true, once: true });
    window.addEventListener("keydown", syncPlayback, { once: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("pageshow", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      window.removeEventListener("pointerdown", syncPlayback);
      window.removeEventListener("keydown", syncPlayback);
    };
  }, [shouldLoadVideo]);

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
            srcSet={publicAsset("/assets/optimized/visual/hero-poster-mobile.webp")}
          />
          <img
            src={publicAsset("/assets/optimized/visual/hero-poster-desktop.webp")}
            alt=""
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <video
          ref={videoRef}
          className={isVideoPlaying ? "is-playing" : ""}
          data-preload-state={videoPreloadState}
          data-fallback-reason={videoFallbackReason}
          aria-hidden="true"
          autoPlay={shouldLoadVideo}
          disablePictureInPicture
          muted
          loop
          playsInline
          preload={shouldLoadVideo ? "auto" : "none"}
          onLoadedData={(event) => {
            if (shouldLoadVideo && event.currentTarget.readyState >= 2) setVideoPreloadState("ready");
          }}
          onCanPlay={(event) => {
            if (shouldLoadVideo && event.currentTarget.readyState >= 2) setVideoPreloadState("ready");
            if (!shouldLoadVideo || document.visibilityState !== "visible" || !heroVisibleRef.current) {
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
          onError={() => {
            setIsVideoPlaying(false);
            if (shouldLoadVideo) setVideoPreloadState("error");
          }}
        >
          {shouldLoadVideo ? <>
            <source
              media="(max-width: 767px)"
              src={publicAsset(heroMobileVideoAsset)}
              type="video/mp4"
            />
            <source src={publicAsset(heroVideoAsset)} type="video/mp4" onError={() => setVideoPreloadState("error")} />
          </> : null}
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
            <span className="hero-name">我是李家豪</span>
            <span className="hero-statement">
              <span className="hero-role-en">AI</span> 体验产品设计师，
              <br />
              让复杂业务更清晰，让智能体验更可控。
            </span>
          </motion.h1>
          <motion.div
            className="hero-actions"
            initial={reduce ? false : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8, ease }}
          >
            <a className="hero-contact-button" href="#work">
              <span>查看精选作品</span>
              <span className="hero-action-icon" aria-hidden="true">
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

function ImageWithFallback({
  alt,
  className = "",
  decoding = "async",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <picture className="optimized-picture">
      <PortfolioImage
        alt={alt}
        className={className}
        decoding={decoding}
        {...props}
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
  const homeContent = homeProjectContent[project.slug] ?? {
    titleLines: [project.title],
    summary: project.summary,
  };

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
    [1, 0.995, reduce ? 1 : 0.985],
  );
  const opacity = useTransform(
    smoothProgress,
    [0, 0.2, 1],
    [1, 0.985, reduce ? 1 : 0.78],
  );
  const y = useTransform(
    smoothProgress,
    [0, 0.24, 1],
    [0, -1, reduce ? 0 : -4],
  );

  return (
    <motion.article
      ref={cardRef}
      className={`project-card${abilityMatch ? " is-ability-match" : ""}`}
      data-project={project.slug}
      data-ability-match={abilityMatch ? "true" : undefined}
      style={{
        scale,
        opacity,
        y,
        zIndex: index + 1,
      }}
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
          <div className="project-info-group">
            <p className="project-type">{project.type}</p>
            <h3 id={titleId}>
              {homeContent.titleLines.map((line, lineIndex) => (
                <span key={line}>
                  {line}
                  {lineIndex < homeContent.titleLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </h3>
            <p className="project-summary" id={summaryId}>{homeContent.summary}</p>
          </div>
          <div className="project-meta">
            <p className="project-role">
              <span>职责</span>
              <strong>{project.role}</strong>
            </p>
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
        </div>
        <div className="project-visual">
          <ImageWithFallback
            src={project.cardCover ?? project.cover}
            alt={`${project.title}项目封面`}
            width={1672}
            height={941}
            loading="lazy"
            sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1200px) 50vw, 720px"
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
          description="构建 AI 增强的设计工作流，贯穿需求拆解、原型验证与规范沉淀，支持复杂项目持续验证与交付。"
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
  const reduce = useReducedMotion();

  return (
    <section className="section experience-section" id="experience">
      <div className="section-shell">
        <div className="experience-heading">
          <SectionIntro
            title="工作经历"
            description="从财税系统到 AI 产品与政企平台，围绕复杂业务开展交互设计、界面设计与设计规范建设。"
          />
          <motion.dl
            className="experience-stats"
            aria-label="职业经验概览"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ duration: 0.52, delay: 0.08, ease }}
          >
            <div>
              <dt>项目经历</dt>
              <dd>15<sup>+</sup></dd>
            </div>
            <div>
              <dt>工作年限</dt>
              <dd>7<sup>+</sup></dd>
            </div>
          </motion.dl>
        </div>
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
  const [copied, setCopied] = useState<"wechat" | "email" | null>(null);
  const feedbackTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current);
  }, []);

  const copyContact = async (type: "wechat" | "email", value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(type);
    if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setCopied(null), 1800);
  };

  return (
    <section className="section contact-section" id="contact">
      <div className="section-shell contact-shell">
        <div className="contact-copy">
          <h2>聊聊新的合作机会</h2>
          <p>如果你在寻找一位能理解复杂业务、并把 AI 能力转化为清晰产品体验的设计师，欢迎联系我。</p>
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
              <button
                className="contact-copy-button"
                type="button"
                onClick={() => void copyContact("wechat", "Hungezu")}
                aria-label="复制微信号 Hungezu"
              >
                <span aria-live="polite">{copied === "wechat" ? "已复制" : "复制"}</span>
              </button>
            </div>
            <div className="contact-item">
              <span className="contact-label">邮箱</span>
              <a className="contact-value contact-value-link" href="mailto:2146953949@qq.com">2146953949@qq.com</a>
              <button
                className="contact-copy-button"
                type="button"
                onClick={() => void copyContact("email", "2146953949@qq.com")}
                aria-label="复制邮箱 2146953949@qq.com"
              >
                <span aria-live="polite">{copied === "email" ? "已复制" : "复制"}</span>
              </button>
            </div>
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
    try {
      window.sessionStorage.setItem("portfolio-work-highlight", abilityId);
    } catch {
      // Keep the current-page highlight available when storage is unavailable.
    }
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById("work")?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
      });
    });
  };

  const clearProjectHighlight = () => {
    setHighlightedAbilityId(null);
    try {
      window.sessionStorage.removeItem("portfolio-work-highlight");
    } catch {
      // Clearing the visible highlight does not depend on storage access.
    }
  };

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnProject = params.get("returnProject");
    const returnY = Number.parseInt(params.get("returnY") ?? "", 10);
    const shouldRestoreWork = params.get("returnSection") === "work";
    if (!returnProject && !shouldRestoreWork) {
      try {
        window.sessionStorage.removeItem("portfolio-work-highlight");
      } catch {
        // A fresh visit starts without an active project highlight.
      }
      return;
    }

    try {
      const savedHighlight = window.sessionStorage.getItem("portfolio-work-highlight");
      if (abilities.some(ability => ability.id === savedHighlight)) {
        setHighlightedAbilityId(savedHighlight as AbilityId);
      }
    } catch {
      // Scroll restoration still works when storage is unavailable.
    }

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
        <CapabilitySection
          highlightedAbilityId={highlightedAbilityId}
          onShowProjects={showRelatedProjects}
          onOpenEvidence={openProjectEvidence}
        />
        <WorkSection
          highlightedAbilityId={highlightedAbilityId}
          onClearHighlight={clearProjectHighlight}
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
  const isEnergyProject = project.slug === "energy-tax";
  const locatorSections: ProjectLocatorSection[] = [
    ["project-overview", "项目介绍"],
    ...project.gallery.map((_, index) => [
      `case-gallery-${index}`,
      project.galleryLabels?.[index] ?? `项目图片 ${index + 1}`,
    ] as const),
  ];

  return (
    <>
      <ProjectLocator sections={locatorSections} ariaLabel={`${project.shortTitle}项目章节定位`} />
      <section className={`case-gallery${isEnergyProject ? " case-gallery-energy" : ""}`} aria-label={`${project.title}项目图片`}>
        {project.gallery.map((image, index) => (
          <motion.figure
            id={`case-gallery-${index}`}
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
    </>
  );
}

function ProjectPage({ project, projectView }: { project: Project; projectView?: NationalPlatformView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();
  const isZhaocaiCase = project.slug === "zhaocai-smart";
  const isNationalPlatformCase = project.slug === "gkx";
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
        className={`case-page${isZhaocaiCase ? " case-page-zhaocai" : ""}${isNationalPlatformCase ? " case-page-gkx" : ""}`}
        data-project={project.slug}
      >
        {!isCustomCase ? <header className="case-hero" id="project-overview">
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
        <ProjectContentBoundary>
        <Suspense fallback={<p className="case-loading" role="status">正在加载项目内容…</p>}>
        {isZhaocaiCase ? (
          <ZhaocaiSmartCase />
        ) : isNationalPlatformCase ? (
          <GkxCase project={project} legacyView={projectView} />
        ) : (
          <ProjectImageGallery project={project} reduce={reduce} />
        )}
        </Suspense>
        </ProjectContentBoundary>
      </main>
      <BackToTop />
      <PortfolioChat project={project} />
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
