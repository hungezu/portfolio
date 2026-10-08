"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import {
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationNodeDatum,
} from "d3-force";
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
import { NationalSciencePlatformCase, type NationalPlatformView } from "./case-studies/NationalSciencePlatformCase";
import { ProjectLocator, type ProjectLocatorSection } from "./project-locator";

const ease = [0.16, 1, 0.3, 1] as const;
const abilityAutoCycleMs = 4800;
const heroVideoAsset = "/assets/visual/hero-motion.mp4";
const heroMobileVideoAsset = "/assets/visual/hero-motion-mobile.mp4";
const abilityLabelById = new Map(abilities.map(ability => [ability.id, ability.axisLabel]));

type AbilityNetworkSide = "left" | "right" | "above" | "below";

type AbilityNetworkNode = {
  id: AbilityId;
  x: number;
  y: number;
  z: number;
  side: AbilityNetworkSide;
  details: Array<{
    label: string;
    x: number;
    y: number;
    z: number;
    side: AbilityNetworkSide;
  }>;
};

const abilityNetworkNodes: AbilityNetworkNode[] = [
  {
    id: "ai-workflow",
    x: 31,
    y: 20,
    z: -40,
    side: "left",
    details: [
      { label: "AI 原型快速验证", x: 13, y: 36, z: -62, side: "right" },
      { label: "界面方案辅助设计", x: 20, y: 9, z: -34, side: "above" },
      { label: "设计规范 Markdown 化", x: 42, y: 9, z: -12, side: "below" },
      { label: "设计资产持续维护", x: 45, y: 29, z: -28, side: "left" },
    ],
  },
  {
    id: "complex-systems",
    x: 63,
    y: 20,
    z: 28,
    side: "right",
    details: [
      { label: "业务规则与角色关系", x: 77, y: 12, z: -5, side: "right" },
      { label: "权限与数据边界", x: 89, y: 25, z: -38, side: "left" },
      { label: "复杂流程拆解", x: 78, y: 34, z: 18, side: "left" },
      { label: "系统模块规划", x: 60, y: 8, z: 8, side: "below" },
    ],
  },
  {
    id: "ai-experience",
    x: 76,
    y: 47,
    z: 68,
    side: "right",
    details: [
      { label: "意图澄清", x: 82, y: 36, z: 20, side: "right" },
      { label: "处理过程反馈", x: 80, y: 56, z: 48, side: "right" },
      { label: "结果解释", x: 81, y: 70, z: 24, side: "right" },
      { label: "引用与异常提示", x: 67, y: 61, z: 4, side: "right" },
    ],
  },
  {
    id: "interaction-design",
    x: 20,
    y: 47,
    z: 30,
    side: "left",
    details: [
      { label: "任务流程与信息架构", x: 7, y: 35, z: -12, side: "right" },
      { label: "状态与反馈", x: 7, y: 56, z: 18, side: "right" },
      { label: "复杂交互", x: 6, y: 68, z: 50, side: "right" },
      { label: "高保真原型验证", x: 22, y: 62, z: -18, side: "right" },
    ],
  },
  {
    id: "data-visualization",
    x: 35,
    y: 77,
    z: -48,
    side: "left",
    details: [
      { label: "指标层级", x: 16, y: 80, z: -30, side: "left" },
      { label: "地图与趋势", x: 27, y: 88, z: -56, side: "below" },
      { label: "多维对比", x: 46, y: 88, z: -8, side: "below" },
      { label: "大屏场景适配", x: 51, y: 78, z: -22, side: "left" },
    ],
  },
  {
    id: "design-system",
    x: 65,
    y: 78,
    z: 48,
    side: "right",
    details: [
      { label: "信息层级与版式", x: 54, y: 77, z: 8, side: "above" },
      { label: "组件与状态规范", x: 76, y: 69, z: 52, side: "left" },
      { label: "多页面一致性", x: 84, y: 88, z: 18, side: "left" },
      { label: "品牌与业务适配", x: 56, y: 93, z: 32, side: "above" },
    ],
  },
];

const abilityNetworkMeshLinks: Array<[string, string]> = [
  ["ai-workflow", "complex-systems"],
  ["complex-systems", "ai-experience"],
  ["ai-experience", "design-system"],
  ["design-system", "data-visualization"],
  ["data-visualization", "interaction-design"],
  ["interaction-design", "ai-workflow"],
  ["ai-workflow", "ai-experience"],
  ["ai-workflow", "design-system"],
  ["interaction-design", "complex-systems"],
  ["interaction-design", "design-system"],
  ["data-visualization", "complex-systems"],
  ["data-visualization", "ai-experience"],
  [abilityDetailNodeId("ai-workflow", "AI 原型快速验证"), abilityDetailNodeId("interaction-design", "任务流程与信息架构")],
  [abilityDetailNodeId("ai-workflow", "设计资产持续维护"), abilityDetailNodeId("design-system", "组件与状态规范")],
  [abilityDetailNodeId("complex-systems", "业务规则与角色关系"), abilityDetailNodeId("ai-experience", "意图澄清")],
  [abilityDetailNodeId("complex-systems", "权限与数据边界"), abilityDetailNodeId("design-system", "多页面一致性")],
  [abilityDetailNodeId("ai-experience", "处理过程反馈"), abilityDetailNodeId("interaction-design", "状态与反馈")],
  [abilityDetailNodeId("interaction-design", "任务流程与信息架构"), abilityDetailNodeId("data-visualization", "指标层级")],
  [abilityDetailNodeId("interaction-design", "复杂交互"), abilityDetailNodeId("data-visualization", "多维对比")],
  [abilityDetailNodeId("data-visualization", "指标层级"), abilityDetailNodeId("design-system", "信息层级与版式")],
  [abilityDetailNodeId("data-visualization", "地图与趋势"), abilityDetailNodeId("design-system", "品牌与业务适配")],
  [abilityDetailNodeId("ai-workflow", "AI 原型快速验证"), abilityDetailNodeId("complex-systems", "复杂流程拆解")],
];

const abilityNetworkAnchorById = new Map<string, AbilityNetworkPosition>(
  abilityNetworkNodes.flatMap(node => [
    [node.id, { x: node.x, y: node.y }],
    ...node.details.map(detail => [
      abilityDetailNodeId(node.id, detail.label),
      { x: detail.x, y: detail.y },
    ] as [string, AbilityNetworkPosition]),
  ] as Array<[string, AbilityNetworkPosition]>),
);
const abilityNetworkDepthById = new Map<string, number>(
  abilityNetworkNodes.flatMap(node => [
    [node.id, node.z],
    ...node.details.map(detail => [
      abilityDetailNodeId(node.id, detail.label),
      detail.z,
    ] as [string, number]),
  ] as Array<[string, number]>),
);

const abilityNetworkMotionIndexById = new Map<string, number>(
  abilityNetworkNodes
    .flatMap(node => [
      node.id,
      ...node.details.map(detail => abilityDetailNodeId(node.id, detail.label)),
    ])
    .map((id, index) => [id, index]),
);

const abilityDetailIndexesByNodeId = new Map<string, readonly number[]>([
  [abilityDetailNodeId("ai-experience", "意图澄清"), [0]],
  [abilityDetailNodeId("ai-experience", "处理过程反馈"), [1]],
  [abilityDetailNodeId("ai-experience", "结果解释"), [2]],
  [abilityDetailNodeId("ai-experience", "引用与异常提示"), [3]],
  [abilityDetailNodeId("ai-workflow", "AI 原型快速验证"), [0]],
  [abilityDetailNodeId("ai-workflow", "界面方案辅助设计"), [1]],
  [abilityDetailNodeId("ai-workflow", "设计规范 Markdown 化"), [2]],
  [abilityDetailNodeId("ai-workflow", "设计资产持续维护"), [3]],
  [abilityDetailNodeId("complex-systems", "业务规则与角色关系"), [0]],
  [abilityDetailNodeId("complex-systems", "权限与数据边界"), [1]],
  [abilityDetailNodeId("complex-systems", "复杂流程拆解"), [2]],
  [abilityDetailNodeId("complex-systems", "系统模块规划"), [3]],
  [abilityDetailNodeId("interaction-design", "任务流程与信息架构"), [0]],
  [abilityDetailNodeId("interaction-design", "状态与反馈"), [1]],
  [abilityDetailNodeId("interaction-design", "复杂交互"), [2]],
  [abilityDetailNodeId("interaction-design", "高保真原型验证"), [3]],
  [abilityDetailNodeId("data-visualization", "指标层级"), [0]],
  [abilityDetailNodeId("data-visualization", "地图与趋势"), [1]],
  [abilityDetailNodeId("data-visualization", "多维对比"), [2]],
  [abilityDetailNodeId("data-visualization", "大屏场景适配"), [3]],
  [abilityDetailNodeId("design-system", "信息层级与版式"), [0]],
  [abilityDetailNodeId("design-system", "组件与状态规范"), [1]],
  [abilityDetailNodeId("design-system", "多页面一致性"), [2]],
  [abilityDetailNodeId("design-system", "品牌与业务适配"), [3]],
]);

type AbilitySimulationNode = SimulationNodeDatum & {
  id: string;
  anchorX: number;
  anchorY: number;
};

type AbilityNetworkPosition = { x: number; y: number };

function projectAbilityPoint(point: AbilityNetworkPosition, depth: number) {
  const perspective = 1 + depth / 520;
  return {
    x: 50 + (point.x - 50) * perspective,
    y: 50 + (point.y - 50) * perspective,
  };
}

function abilityDetailNodeId(abilityId: AbilityId, label: string) {
  return `${abilityId}:${label}`;
}

function addAbilityNetworkDrift(
  id: string,
  point: AbilityNetworkPosition,
  phase: number,
  amplitudeScale = 1,
) {
  const index = abilityNetworkMotionIndexById.get(id) ?? 0;
  const isDetail = id.includes(":");
  const xAmplitude = (isDetail ? .48 : .68) * amplitudeScale;
  const yAmplitude = (isDetail ? .36 : .48) * amplitudeScale;
  return {
    x: point.x + Math.sin(phase * (.72 + index % 3 * .055) + index * 1.17) * xAmplitude,
    y: point.y + Math.cos(phase * (.64 + index % 4 * .035) + index * 1.63) * yAmplitude,
  };
}

function addAbilityNetworkDepthDrift(id: string, depth: number, phase: number, amplitudeScale = 1) {
  const index = abilityNetworkMotionIndexById.get(id) ?? 0;
  const amplitude = (id.includes(":") ? 3.2 : 4.8) * amplitudeScale;
  return depth + Math.sin(phase * (.62 + index % 5 * .03) + index * 1.39) * amplitude;
}

function abilityNetworkLineOpacity(fromDepth: number, toDepth: number) {
  const normalizedDepth = Math.max(-1, Math.min(1, (fromDepth + toDepth) / 140));
  return .3 + normalizedDepth * .14;
}

function getAbilityNetworkNeighbors(id: string) {
  const neighbors = new Set<string>();
  abilityNetworkNodes.forEach(node => {
    const detailIds = node.details.map(detail => abilityDetailNodeId(node.id, detail.label));
    if (node.id === id) detailIds.forEach(detailId => neighbors.add(detailId));
    if (detailIds.includes(id)) neighbors.add(node.id);
  });
  abilityNetworkMeshLinks.forEach(([fromId, toId]) => {
    if (fromId === id) neighbors.add(toId);
    if (toId === id) neighbors.add(fromId);
  });
  return neighbors;
}

function createAbilityNetworkPositions() {
  return Object.fromEntries(
    abilityNetworkNodes.flatMap(node => [
      [node.id, { x: node.x, y: node.y }],
      ...node.details.map(detail => [
        abilityDetailNodeId(node.id, detail.label),
        { x: detail.x, y: detail.y },
      ]),
    ]),
  ) as Record<string, AbilityNetworkPosition>;
}

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
  { id: "home", elementId: "top", text: "我是 Leo。你可以直接问我擅长的方向、代表项目，或某个方案为什么这样设计。" },
  { id: "ability", elementId: "ability", text: "点任一能力，会同步突出能证明它的项目；也可以问我具体用在哪个案例里。" },
  { id: "work", elementId: "work", text: "想快速判断匹配度？可以问我哪个项目最能代表 AI 体验、复杂系统或设计系统能力。" },
  { id: "experience", elementId: "experience", text: "展开任一段经历能看到项目范围与职责；也可以直接告诉我公司或项目名。" },
  { id: "contact", elementId: "contact", text: "还没决定要不要联系？可以先问我协作方式、交付范围或项目细节。" },
];

const PROJECT_CHAT_CONTEXTS: Record<string, PortfolioChatContext[]> = {
  gkx: [
    { id: "gkx-overview", elementId: "gkx-overview", text: "这个项目覆盖多个业务系统，阅读时可以重点看我如何统一规则，而不只是页面数量。" },
    { id: "gkx-scope", elementId: "gkx-scope", text: "这一段关注哪些规则应该跨系统统一，以及哪些业务差异必须保留。" },
    { id: "gkx-decisions", elementId: "gkx-decisions", text: "这里把选择依据摆出来，方便区分审美偏好和能够验证的设计判断。" },
    { id: "gkx-system", elementId: "gkx-system", text: "规范分层是为了复用通用组件，同时避免给特殊业务套错模板。" },
    { id: "gkx-workflow", elementId: "gkx-workflow", text: "AI 负责整理初稿，我保留边界判断、校准和应用检查，不把生成结果直接当结论。" },
    { id: "gkx-validation", elementId: "gkx-validation", text: "原型在这里承担检查工具：用真实状态验证规则能否落到操作流程。" },
    { id: "gkx-collaboration", elementId: "gkx-collaboration", text: "共享设计 MD 的价值，是让业务、设计和实现围绕同一份规则讨论。" },
    { id: "gkx-outcomes", elementId: "gkx-outcomes", text: "没有可靠数据的部分不补写，这里只呈现可追溯的设计资产与验证结果。" },
  ],
  "zhaocai-smart": [
    { id: "zcs-homepage", elementId: "zcs-homepage", text: "可以先记住一条主线：提问之后，系统还要完成澄清、执行、解释和沉淀。" },
    { id: "zcs-trust-mechanism", elementId: "zcs-trust-mechanism", text: "可信感不是一句提示文案，而是来源、过程和结果都能被用户理解与核对。" },
    { id: "zcs-process-feedback", elementId: "zcs-process-feedback", text: "过程反馈要持续说明系统正在做什么，避免用户把等待误认为失败。" },
    { id: "zcs-original-output", elementId: "zcs-original-output", text: "保留原始输出作为对照，能更清楚地看到信息组织问题，而不只比较视觉差异。" },
    { id: "zcs-markdown-system", elementId: "zcs-markdown-system", text: "统一输出结构，是为了让表格、图表、引用和代码在不同答案里保持可读。" },
  ],
  "tax-cloud": [
    { id: "tax-cloud-overview", elementId: "project-overview", text: "这个项目跨 Web 与 App，建议沿着角色任务与申报链路看，而不是逐张浏览页面。" },
    { id: "tax-cloud-entry", elementId: "case-gallery-0", text: "后面的内容会按业务理解、流程重构、设计规范和跨端落地逐步展开。" },
    { id: "tax-cloud-path", elementId: "case-gallery-2", text: "这张路径图解释不同角色怎样进入申报任务，后面的页面都围绕这条主线展开。" },
    { id: "tax-cloud-form", elementId: "case-gallery-4", text: "表单部分可以重点看信息密度、筛选和错误预防，而不只是视觉样式。" },
    { id: "tax-cloud-redesign", elementId: "case-gallery-8", text: "新旧首页的核心差别在任务优先级与信息分组，可以和前面的旧版问题对照看。" },
    { id: "tax-cloud-mobile", elementId: "case-gallery-14", text: "移动端没有简单缩小桌面版，而是优先保留审批、查询等高频任务。" },
  ],
  "energy-tax": [
    { id: "energy-overview", elementId: "project-overview", text: "这是从 0 到 1 独立负责的项目，可以先看职责范围，再对照后面的页面落地。" },
    { id: "energy-entry", elementId: "case-gallery-0", text: "接下来会从背景与规范进入首页、申报和管理场景，可以连续看设计怎样逐步落地。" },
    { id: "energy-system", elementId: "case-gallery-2", text: "先统一栅格、组件和缺省规则，后面的首页与工作台才能保持一致结构。" },
    { id: "energy-home", elementId: "case-gallery-3", text: "首页重点是把数据展示与任务入口分层，避免所有信息同时争夺注意力。" },
    { id: "energy-workbench", elementId: "case-gallery-4", text: "申报工作台更值得看任务执行顺序和状态反馈，而不只是表格排版。" },
    { id: "energy-review", elementId: "case-gallery-6", text: "最后补充了缺省状态与复盘，用来覆盖正常流程之外容易被遗漏的情况。" },
  ],
  "data-visualisation": [
    { id: "visual-overview", elementId: "project-overview", text: "这是一组跨行业案例，建议先找共同框架，再比较各行业的信息优先级。" },
    { id: "visual-entry", elementId: "case-gallery-0", text: "接下来可以用同一套观察方法：先看信息层级，再看图表组合，最后看规范复用。" },
    { id: "visual-multi", elementId: "case-gallery-1", text: "地图、指标、趋势和排行可以复用，但每个行业的主阅读顺序并不相同。" },
    { id: "visual-transport", elementId: "case-gallery-2", text: "运输场景可以重点看空间信息与业务指标怎样同时保持可读。" },
    { id: "visual-estate", elementId: "case-gallery-3", text: "地产场景更适合观察高密度数据的分区方式与横向对比关系。" },
    { id: "visual-rules", elementId: "case-gallery-4", text: "最后沉淀的是可复用布局规范，而不只是某一张大屏的视觉样式。" },
  ],
};

const GKX_SUBPAGE_CHAT_CONTEXTS: PortfolioChatContext[] = [
  { id: "nsp-overview", elementId: "nsp-overview", text: "这里展示的是项目交付证据，可以结合页面职责理解每个系统为何这样组织。" },
  { id: "nsp-structure", elementId: "nsp-structure", text: "这里的关键是把跨系统需求压成可执行结构，后续原型与规范都从这套关系展开。" },
  { id: "nsp-prototype", elementId: "nsp-prototype", text: "可运行原型主要用来提前暴露流程和状态问题，并不等同于最终视觉稿。" },
  { id: "nsp-products", elementId: "nsp-products", text: "看系统实景时，可以对照导航、数据状态和组件在不同业务里的统一程度。" },
  { id: "nsp-rules", elementId: "nsp-rules", text: "这套规范同时约束设计协作与后续生成，不只是颜色、字号的样式表。" },
  { id: "nsp-result", elementId: "nsp-result", text: "这里刻意区分 AI 辅助和设计判断：生成由工具加速，范围与质量仍由我负责。" },
];

function getPortfolioChatContexts() {
  const projectRoot = document.querySelector<HTMLElement>("main[data-project]");
  const projectSlug = projectRoot?.dataset.project;
  if (projectSlug === "gkx" && /\/(?:systems|design-system)\/?$/.test(window.location.pathname)) {
    return GKX_SUBPAGE_CHAT_CONTEXTS;
  }
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
  const requestedAssetState = peeking ? "peek-right" : portfolioPetStateMap[state];
  const [assetState, setAssetState] = useState(requestedAssetState);
  const config = portfolioCharacterMap.states[assetState];
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const sources = ["actions", "curious", "idle", "peek", "wave"];
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
  const shownContextIdsRef = useRef(new Set<string>());
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
        if (shownContextIdsRef.current.has(next.id)) {
          setContextVisible(false);
          if (contextTimerRef.current !== null) window.clearTimeout(contextTimerRef.current);
          contextTimerRef.current = null;
        } else {
          shownContextIdsRef.current.add(next.id);
          revealContext();
          pulsePet("pointing", 1500);
        }
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
    setPetState("idle");
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

  const visiblePetState: PortfolioPetState = sending ? "thinking" : petState;
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
    >
      <AnimatePresence initial={false}>
        {!open && contextVisible ? (
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
          <PortfolioPetSprite state={visiblePetState} peeking={!open} />
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
                      <div className="portfolio-chat-bubble">
                        {message.role === "assistant"
                          ? <PortfolioChatMessageContent content={message.content} />
                          : message.content}
                      </div>
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
            fetchPriority="high"
            decoding="async"
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
          preload="auto"
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

function AbilitySection({
  onShowProjects,
}: {
  onShowProjects: (abilityId: AbilityId) => void;
}) {
  const [active, setActive] = useState(0);
  const [networkPositions, setNetworkPositions] = useState<Record<string, AbilityNetworkPosition>>(
    createAbilityNetworkPositions,
  );
  const [networkSettleVersion, setNetworkSettleVersion] = useState(0);
  const [networkMotionPhase, setNetworkMotionPhase] = useState(0);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedDetailNodeId, setSelectedDetailNodeId] = useState<string | null>(null);
  const [abilityInView, setAbilityInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [autoCyclePaused, setAutoCyclePaused] = useState(false);
  const [autoCycleVersion, setAutoCycleVersion] = useState(0);
  const reduce = useReducedMotion();
  const abilitySectionRef = useRef<HTMLElement>(null);
  const networkViewportRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const networkPositionsRef = useRef(networkPositions);
  const networkSimulationRef = useRef<{ stop: () => void } | null>(null);
  const suppressNetworkClickRef = useRef(false);
  const networkDragRef = useRef<{
    id: string | null;
    pointerId: number;
    startX: number;
    startY: number;
    startPositions: Record<string, AbilityNetworkPosition>;
    moved: boolean;
  }>({ id: null, pointerId: -1, startX: 0, startY: 0, startPositions: {}, moved: false });
  networkPositionsRef.current = networkPositions;
  const current = abilities[active];
  const activeAbilityId = current.id;
  const networkMotionScale = (id: string) => {
    if (draggingNodeId === id) return 0;
    if (hoveredNodeId === id) return .16;
    if (selectedDetailNodeId === id) return .12;
    if (id === activeAbilityId || id.startsWith(`${activeAbilityId}:`)) return .3;
    return 1;
  };
  const animatedNetworkPosition = (
    id: string,
    fallback: AbilityNetworkPosition,
  ) => {
    const base = networkPositions[id] ?? fallback;
    return reduce
      ? base
      : addAbilityNetworkDrift(id, base, networkMotionPhase, networkMotionScale(id));
  };
  const animatedNetworkDepth = (id: string, fallback: number) => reduce
    ? fallback
    : addAbilityNetworkDepthDrift(id, fallback, networkMotionPhase, networkMotionScale(id));
  const selectedDetailIndexes = selectedDetailNodeId
    ? abilityDetailIndexesByNodeId.get(selectedDetailNodeId) ?? []
    : [];
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
    const viewport = networkViewportRef.current;
    if (!viewport) return;
    let frame = 0;
    const syncViewport = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        viewport.scrollLeft = window.innerWidth <= 767
          ? Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2)
          : 0;
      });
    };
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", syncViewport);
    };
  }, []);

  useEffect(() => {
    const section = abilitySectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      setAbilityInView(entry.isIntersecting);
    }, { threshold: .35 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncVisibility = () => setPageVisible(document.visibilityState === "visible");
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  useEffect(() => {
    if (reduce || !abilityInView || !pageVisible || autoCyclePaused || selectedDetailNodeId) return;
    const timer = window.setTimeout(() => {
      const activeNodeIndex = abilityNetworkNodes.findIndex(node => node.id === abilities[active]?.id);
      const nextNode = abilityNetworkNodes[(Math.max(0, activeNodeIndex) + 1) % abilityNetworkNodes.length];
      const nextAbilityIndex = abilities.findIndex(ability => ability.id === nextNode.id);
      if (nextAbilityIndex >= 0) {
        setActive(nextAbilityIndex);
        setSelectedDetailNodeId(null);
      }
    }, abilityAutoCycleMs);
    return () => window.clearTimeout(timer);
  }, [active, abilityInView, autoCyclePaused, autoCycleVersion, pageVisible, reduce, selectedDetailNodeId]);

  useEffect(() => {
    const network = networkRef.current;
    if (!network || reduce) {
      setNetworkMotionPhase(0);
      return;
    }

    let frame = 0;
    let visible = false;
    let phase = 0;
    let lastTime = 0;
    let lastPaint = 0;

    const stop = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    };
    const tick = (time: number) => {
      frame = 0;
      if (!visible || document.visibilityState !== "visible") return;
      if (!lastTime) lastTime = time;
      phase += Math.min(50, time - lastTime) / 1000;
      lastTime = time;
      if (time - lastPaint >= 34) {
        setNetworkMotionPhase(phase);
        lastPaint = time;
      }
      frame = window.requestAnimationFrame(tick);
    };
    const start = () => {
      if (!frame && visible && document.visibilityState === "visible") {
        frame = window.requestAnimationFrame(tick);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    }, { rootMargin: "120px 0px" });
    const handleVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    observer.observe(network);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reduce]);

  useEffect(() => {
    if (reduce) {
      setNetworkPositions(createAbilityNetworkPositions());
      return;
    }

    const nodes: AbilitySimulationNode[] = abilityNetworkNodes.flatMap((node, nodeIndex) => {
      const currentNode = networkPositionsRef.current[node.id] ?? node;
      return [{
        id: node.id,
        anchorX: node.x,
        anchorY: node.y,
        x: currentNode.x,
        y: currentNode.y,
        vx: Math.sin((nodeIndex + 1) * (active + 2)) * .55,
        vy: Math.cos((nodeIndex + 2) * (active + 1)) * .48,
      }, ...node.details.map((detail, detailIndex) => {
        const id = abilityDetailNodeId(node.id, detail.label);
        const currentDetail = networkPositionsRef.current[id] ?? detail;
        return {
          id,
          anchorX: detail.x,
          anchorY: detail.y,
          x: currentDetail.x,
          y: currentDetail.y,
          vx: Math.sin((nodeIndex + detailIndex + 2) * (active + 1)) * .36,
          vy: Math.cos((nodeIndex + detailIndex + 3) * (active + 2)) * .34,
        };
      })];
    });
    const links = abilityNetworkNodes.flatMap(node =>
      node.details.map(detail => ({
        source: node.id,
        target: abilityDetailNodeId(node.id, detail.label),
      })),
    ).concat(abilityNetworkMeshLinks.map(([source, target]) => ({ source, target })));

    let frame = 0;
    const simulation = forceSimulation(nodes)
      .alpha(.32)
      .alphaDecay(.06)
      .velocityDecay(.56)
      .force("link", forceLink<AbilitySimulationNode, { source: string | AbilitySimulationNode; target: string | AbilitySimulationNode }>(links)
        .id(node => node.id)
        .strength(.02))
      .force("charge", forceManyBody<AbilitySimulationNode>().strength(-.28))
      .force("x", forceX<AbilitySimulationNode>(node => node.anchorX).strength(.36))
      .force("y", forceY<AbilitySimulationNode>(node => node.anchorY).strength(.36))
      .on("tick", () => {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => {
          const next: Record<string, AbilityNetworkPosition> = {};
          nodes.forEach(node => {
            if (node.id === "network-center") return;
            const x = node.x ?? node.anchorX;
            const y = node.y ?? node.anchorY;
            next[node.id] = {
              x: node.anchorX + Math.max(-.45, Math.min(.45, x - node.anchorX)),
              y: node.anchorY + Math.max(-.45, Math.min(.45, y - node.anchorY)),
            };
          });
          networkPositionsRef.current = next;
          setNetworkPositions(next);
        });
      });
    networkSimulationRef.current = simulation;
    const driftTimer = window.setInterval(() => {
      nodes.forEach((node, index) => {
        if (node.id === "network-center") return;
        const phase = Date.now() / 2200 + index * 1.7;
        node.vx = (node.vx ?? 0) + Math.sin(phase) * .08;
        node.vy = (node.vy ?? 0) + Math.cos(phase * .86) * .07;
      });
      simulation.alpha(.055).restart();
    }, 2200);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(driftTimer);
      simulation.stop();
      if (networkSimulationRef.current === simulation) networkSimulationRef.current = null;
    };
  }, [active, networkSettleVersion, reduce]);

  const handleNetworkPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    id: string,
  ) => {
    if (event.button !== 0) return;
    networkSimulationRef.current?.stop();
    networkDragRef.current = {
      id,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPositions: { ...networkPositionsRef.current },
      moved: false,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is unavailable for some synthetic pointer events.
    }
  };

  const handleNetworkPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = networkDragRef.current;
    const network = networkRef.current;
    if (!drag.id || drag.pointerId !== event.pointerId || !network) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    setDraggingNodeId(drag.id);
    event.preventDefault();

    const rect = network.getBoundingClientRect();
    const deltaX = dx / Math.max(1, rect.width) * 100;
    const deltaY = dy / Math.max(1, rect.height) * 100;
    const neighbors = getAbilityNetworkNeighbors(drag.id);
    const next = { ...drag.startPositions };
    const applyOffset = (nodeId: string, strength: number, limit: number) => {
      const anchor = abilityNetworkAnchorById.get(nodeId);
      const start = drag.startPositions[nodeId] ?? anchor;
      if (!anchor || !start) return;
      next[nodeId] = {
        x: Math.max(anchor.x - limit, Math.min(anchor.x + limit, start.x + deltaX * strength)),
        y: Math.max(anchor.y - limit, Math.min(anchor.y + limit, start.y + deltaY * strength)),
      };
    };
    applyOffset(drag.id, 1, 3);
    neighbors.forEach(nodeId => applyOffset(nodeId, .12, .7));
    networkPositionsRef.current = next;
    setNetworkPositions(next);
  };

  const finishNetworkDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = networkDragRef.current;
    if (!drag.id || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggingNodeId(null);
    if (drag.moved) {
      suppressNetworkClickRef.current = true;
      window.setTimeout(() => {
        suppressNetworkClickRef.current = false;
      }, 240);
      setNetworkSettleVersion(version => version + 1);
    }
    networkDragRef.current.id = null;
    networkDragRef.current.pointerId = -1;
  };

  const selectNetworkAbility = (index: number, detailId: string | null = null) => {
    if (suppressNetworkClickRef.current) {
      suppressNetworkClickRef.current = false;
      return;
    }
    setActive(index);
    setSelectedDetailNodeId(detailId);
    setAutoCycleVersion(version => version + 1);
  };

  return (
    <section className="section ability-section" id="ability" ref={abilitySectionRef}>
      <div className="section-shell">
        <SectionIntro
          title="核心能力"
          description="以 AI 体验与交互策略为核心，整合复杂系统、设计系统与数据表达能力，形成面向复杂产品的系统化设计能力。"
        />
        <div
          className={`ability-layout${autoCyclePaused ? " is-paused" : ""}`}
          data-auto-cycle={reduce ? "reduced" : abilityInView && pageVisible && !autoCyclePaused ? "running" : "paused"}
          onFocusCapture={() => setAutoCyclePaused(true)}
          onBlurCapture={event => {
            if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
              setAutoCyclePaused(false);
            }
          }}
        >
          <div className="ability-visual">
            <div className="ability-network-viewport" ref={networkViewportRef}>
              <div
                className="ability-network"
                ref={networkRef}
                data-motion-phase={networkMotionPhase.toFixed(2)}
                role="group"
                aria-label={`能力体系三维关系图，当前为${current.name}`}
              >
                <svg viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
                  {abilityNetworkNodes.map(node => {
                    const nodeDepth = animatedNetworkDepth(node.id, node.z);
                    const nodePosition = projectAbilityPoint(animatedNetworkPosition(node.id, node), nodeDepth);
                    return (
                      <g
                        key={node.id}
                        className={active === abilities.findIndex(item => item.id === node.id) ? "is-active" : undefined}
                        style={{ opacity: .72 + Math.max(-.14, Math.min(.2, nodeDepth / 300)) }}
                      >
                        {node.details.map(detail => {
                          const detailId = abilityDetailNodeId(node.id, detail.label);
                          const detailDepth = animatedNetworkDepth(detailId, detail.z);
                          const detailPosition = projectAbilityPoint(
                            animatedNetworkPosition(detailId, detail),
                            detailDepth,
                          );
                          return (
                            <line
                              key={detail.label}
                              className={`ability-network-line is-branch${selectedDetailNodeId === detailId ? " is-selected" : ""}`}
                              pathLength="1"
                              x1={nodePosition.x * 10}
                              y1={nodePosition.y * 5.6}
                              x2={detailPosition.x * 10}
                              y2={detailPosition.y * 5.6}
                              style={{ opacity: abilityNetworkLineOpacity(nodeDepth, detailDepth) }}
                            />
                          );
                        })}
                      </g>
                    );
                  })}
                  {abilityNetworkMeshLinks.map(([fromId, toId]) => {
                    const from = abilityNetworkAnchorById.get(fromId);
                    const to = abilityNetworkAnchorById.get(toId);
                    if (!from || !to) return null;
                    const fromDepth = animatedNetworkDepth(fromId, abilityNetworkDepthById.get(fromId) ?? 0);
                    const toDepth = animatedNetworkDepth(toId, abilityNetworkDepthById.get(toId) ?? 0);
                    const fromPosition = projectAbilityPoint(animatedNetworkPosition(fromId, from), fromDepth);
                    const toPosition = projectAbilityPoint(animatedNetworkPosition(toId, to), toDepth);
                    return (
                      <line
                        key={`${fromId}-${toId}`}
                        className="ability-network-line is-mesh"
                        pathLength="1"
                        x1={fromPosition.x * 10}
                        y1={fromPosition.y * 5.6}
                        x2={toPosition.x * 10}
                        y2={toPosition.y * 5.6}
                        style={{ opacity: abilityNetworkLineOpacity(fromDepth, toDepth) }}
                      />
                    );
                  })}
                </svg>

                <div
                  className="ability-network-center"
                  style={{ "--node-z": "28px" } as CSSProperties}
                  aria-hidden="true"
                >
                  <span className="ability-network-core-mark">
                    <svg viewBox="0 0 64 64" aria-hidden="true">
                      <g className="ability-network-core-orbits">
                        <ellipse cx="32" cy="32" rx="27" ry="10" />
                        <ellipse cx="32" cy="32" rx="27" ry="10" transform="rotate(60 32 32)" />
                        <ellipse cx="32" cy="32" rx="27" ry="10" transform="rotate(120 32 32)" />
                      </g>
                      <g className="ability-network-core-satellites">
                        <circle cx="59" cy="32" r="2.6" />
                        <circle cx="45.5" cy="8.6" r="2.6" />
                        <circle cx="18.5" cy="8.6" r="2.6" />
                        <circle cx="5" cy="32" r="2.6" />
                        <circle cx="18.5" cy="55.4" r="2.6" />
                        <circle cx="45.5" cy="55.4" r="2.6" />
                      </g>
                      <circle className="ability-network-core-disc" cx="32" cy="32" r="8" />
                      <circle className="ability-network-core-cutout" cx="32" cy="32" r="2.5" />
                    </svg>
                  </span>
                  <strong>能力体系</strong>
                </div>

                <div className="ability-network-tabs" role="tablist" aria-label="核心能力切换">
                  {abilityNetworkNodes.map(node => {
                    const index = abilities.findIndex(ability => ability.id === node.id);
                    const ability = abilities[index];
                    const nodeDepth = animatedNetworkDepth(node.id, node.z);
                    const nodePosition = projectAbilityPoint(animatedNetworkPosition(node.id, node), nodeDepth);
                    const depthScale = 1 + nodeDepth / 260;
                    return (
                      <button
                        key={node.id}
                        id={`ability-tab-${index}`}
                        type="button"
                        role="tab"
                        aria-selected={active === index}
                        aria-controls="ability-panel"
                        tabIndex={active === index ? 0 : -1}
                        className={`ability-network-node is-main is-${node.side}${active === index ? " is-active" : ""}${draggingNodeId === node.id ? " is-dragging" : ""}`}
                        style={{
                          left: `${nodePosition.x}%`,
                          top: `${nodePosition.y}%`,
                          opacity: .72 + Math.max(-.14, Math.min(.2, nodeDepth / 300)),
                          "--node-z": `${nodeDepth}px`,
                          "--node-scale": depthScale.toFixed(3),
                          "--node-hover-scale": (depthScale * 1.14).toFixed(3),
                          "--node-active-scale": (depthScale * 1.34).toFixed(3),
                        } as CSSProperties}
                        onClick={() => selectNetworkAbility(index)}
                        onPointerEnter={() => setHoveredNodeId(node.id)}
                        onPointerLeave={() => setHoveredNodeId(current => current === node.id ? null : current)}
                        onPointerDown={event => handleNetworkPointerDown(event, node.id)}
                        onPointerMove={handleNetworkPointerMove}
                        onPointerUp={finishNetworkDrag}
                        onPointerCancel={finishNetworkDrag}
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
                          setSelectedDetailNodeId(null);
                          setAutoCycleVersion(version => version + 1);
                          window.requestAnimationFrame(() => {
                            document.getElementById(`ability-tab-${next}`)?.focus();
                          });
                        }}
                      >
                        <span className="ability-network-node-content">
                          <span className="ability-network-dot" aria-hidden="true" />
                          <span className="ability-network-label">{ability.axisLabel}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="ability-network-detail-nodes">
                  {abilityNetworkNodes.flatMap(node => {
                    const index = abilities.findIndex(ability => ability.id === node.id);
                    const ability = abilities[index];
                    return node.details.map(detail => {
                      const detailId = abilityDetailNodeId(node.id, detail.label);
                      const detailDepth = animatedNetworkDepth(detailId, detail.z);
                      const detailPosition = projectAbilityPoint(animatedNetworkPosition(detailId, detail), detailDepth);
                      const depthScale = 1 + detailDepth / 300;
                      return (
                        <button
                          key={`${node.id}-${detail.label}`}
                          type="button"
                          aria-pressed={selectedDetailNodeId === detailId}
                          aria-label={`查看${ability.name}：${detail.label}`}
                          className={`ability-network-node is-detail is-${detail.side}${active === index ? " is-parent-active" : ""}${selectedDetailNodeId === detailId ? " is-active" : ""}${draggingNodeId === detailId ? " is-dragging" : ""}`}
                          style={{
                            left: `${detailPosition.x}%`,
                            top: `${detailPosition.y}%`,
                            opacity: .72 + Math.max(-.14, Math.min(.2, detailDepth / 300)),
                            "--node-z": `${detailDepth}px`,
                            "--node-scale": depthScale.toFixed(3),
                            "--node-hover-scale": (depthScale * 1.22).toFixed(3),
                            "--node-active-scale": (depthScale * 1.42).toFixed(3),
                          } as CSSProperties}
                          onClick={() => selectNetworkAbility(index, detailId)}
                          onPointerEnter={() => setHoveredNodeId(detailId)}
                          onPointerLeave={() => setHoveredNodeId(current => current === detailId ? null : current)}
                          onPointerDown={event => handleNetworkPointerDown(event, detailId)}
                          onPointerMove={handleNetworkPointerMove}
                          onPointerUp={finishNetworkDrag}
                          onPointerCancel={finishNetworkDrag}
                        >
                          <span className="ability-network-node-content">
                            <span className="ability-network-dot" aria-hidden="true" />
                            <span className="ability-network-label">{detail.label}</span>
                          </span>
                        </button>
                      );
                    });
                  })}
                </div>
              </div>
            </div>
          </div>
          <div
            className="ability-detail"
            id="ability-panel"
            role="tabpanel"
            aria-labelledby={`ability-tab-${active}`}
            aria-live={autoCyclePaused ? "polite" : "off"}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.name}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease }}
              >
                <h3>{current.name}</h3>
                <p>{current.description}</p>
                <ul>
                  {current.details.map((detail, detailIndex) => (
                    <li
                      className={selectedDetailIndexes.includes(detailIndex) ? "is-active" : undefined}
                      key={detail}
                    >
                      {detail}
                    </li>
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
  const webpSource = typeof props.src === "string" && /\/assets\/projects\/.*\.(?:png|jpe?g)(?:\?.*)?$/i.test(props.src)
    ? props.src.replace(/\.(?:png|jpe?g)(\?.*)?$/i, ".webp$1")
    : null;
  const [imageStage, setImageStage] = useState<"webp" | "original" | "failed">(
    webpSource ? "webp" : "original",
  );

  useEffect(() => {
    setImageStage(webpSource ? "webp" : "original");
  }, [props.src, webpSource]);

  if (imageStage === "failed") {
    return <div className={`image-fallback ${className}`}>项目图片暂时无法加载</div>;
  }

  return (
    <picture className="optimized-picture">
      {webpSource && imageStage === "webp" ? <source srcSet={webpSource} type="image/webp" /> : null}
      <img
        key={imageStage}
        alt={alt}
        className={className}
        decoding={decoding}
        {...props}
        onError={() => {
          if (webpSource && imageStage === "webp") {
            setImageStage("original");
            return;
          }
          setImageStage("failed");
        }}
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
            description="7 年持续参与财税、数据可视化、AI 产品与政企平台设计，覆盖业务梳理、交互策略、视觉系统和研发协作。"
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
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById("work")?.scrollIntoView({
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
        {isZhaocaiCase ? (
          <ZhaocaiSmartCase />
        ) : isNationalPlatformCase ? (
          isNationalPlatformSubpage ? <NationalSciencePlatformCase view={projectView} /> : <GkxCase project={project} />
        ) : (
          <ProjectImageGallery project={project} reduce={reduce} />
        )}
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
