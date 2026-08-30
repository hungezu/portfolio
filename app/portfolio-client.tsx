"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left.mjs";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up.mjs";
import ArrowUpRight from "lucide-react/dist/esm/icons/arrow-up-right.mjs";
import Plus from "lucide-react/dist/esm/icons/plus.mjs";
import {
  type MouseEvent as ReactMouseEvent,
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
  type Project,
} from "./portfolio-data";
import { ZhaocaiSmartCase } from "./case-studies/ZhaocaiSmartCase";

const ease = [0.16, 1, 0.3, 1] as const;
const heroVideoAsset = "/assets/visual/hero-motion.mp4";
const heroMobileVideoAsset = "/assets/visual/hero-motion-mobile.mp4";
const radarValues = [0.9, 0.9, 0.9, 0.9, 0.9, 0.9];
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

  const rect = card.getBoundingClientRect();
  const overlay = document.createElement("div");
  overlay.className = "project-transition-shell";
  overlay.style.setProperty("--project-transition-x", `${rect.left}px`);
  overlay.style.setProperty("--project-transition-y", `${rect.top}px`);
  overlay.style.setProperty("--project-transition-scale-x", `${rect.width / window.innerWidth}`);
  overlay.style.setProperty("--project-transition-scale-y", `${rect.height / window.innerHeight}`);
  document.body.appendChild(overlay);
  card.classList.add("is-opening");
  document.documentElement.classList.add("portfolio-transitioning");

  let navigated = false;
  const navigate = () => {
    if (navigated) return;
    navigated = true;
    window.location.assign(destination);
  };

  window.requestAnimationFrame(() => overlay.classList.add("is-expanded"));
  window.setTimeout(navigate, 540);
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
            <span className="hero-name">I’m 李家豪</span>
            <span className="hero-statement">
              把复杂系统理清，
              <br />
              让产品更好用，也更可信。
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

function AbilitySection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const current = abilities[active];

  useEffect(() => {
    if (
      reduce ||
      paused ||
      window.matchMedia("(max-width: 767px)").matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      setActive((index) => (index + 1) % abilities.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused, reduce]);

  return (
    <section className="section ability-section" id="ability">
      <div className="section-shell">
        <SectionIntro
          title="核心能力"
          description="从业务规则与任务路径出发，覆盖系统规划、AI 交互与跨端交付。"
        />
        <div className="ability-layout">
          <div
            className="ability-visual"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <div
              className="ability-radar"
              role="group"
              aria-label={`核心能力图，当前为${current.name}`}
            >
              <svg viewBox="36 36 408 408" aria-hidden="true">
                {[0.25, 0.5, 0.75, 1].map((level) => (
                  <polygon
                    key={level}
                    className="radar-grid"
                    points={getRadarPoints(Array(abilities.length).fill(level))}
                  />
                ))}
                {abilities.map((ability, index) => {
                  const angle = (-90 + index * (360 / abilities.length)) * (Math.PI / 180);
                  const x = 240 + Math.cos(angle) * radarRadius;
                  const y = 240 + Math.sin(angle) * radarRadius;
                  return (
                    <line
                      key={ability.name}
                      className="radar-axis"
                      x1="240"
                      y1="240"
                      x2={x}
                      y2={y}
                    />
                  );
                })}
                <motion.polygon
                  className="radar-shape"
                  points={getRadarPoints(radarValues)}
                  initial={false}
                  animate={{ points: getRadarPoints(radarValues) }}
                  transition={{ duration: reduce ? 0 : 0.62, ease }}
                />
                {radarValues.map((value, index) => {
                  const angle = (-90 + index * (360 / radarValues.length)) * (Math.PI / 180);
                  const x = 240 + Math.cos(angle) * radarRadius * value;
                  const y = 240 + Math.sin(angle) * radarRadius * value;
                  return (
                    <motion.circle
                      key={abilities[index].name}
                      className={`radar-point${active === index ? " is-active" : ""}`}
                      initial={false}
                      animate={{ cx: x, cy: y }}
                      transition={{ duration: reduce ? 0 : 0.62, ease }}
                      r={active === index ? 7 : 4}
                    />
                  );
                })}
              </svg>
              <div
                className="ability-switcher"
                role="tablist"
                aria-label="核心能力切换"
              >
                {abilities.map((ability, index) => {
                  const angle = (-90 + index * (360 / abilities.length)) * (Math.PI / 180);
                  const x = 50 + Math.cos(angle) * radarButtonOrbitX;
                  const y = 50 + Math.sin(angle) * radarButtonOrbitY;
                  return (
                    <button
                      key={ability.name}
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
                        if (!direction && event.key !== "Home" && event.key !== "End") {
                          return;
                        }
                        event.preventDefault();
                        const next =
                          event.key === "Home"
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
                <span className="ability-kicker">
                  {String(active + 1).padStart(2, "0")} / {String(abilities.length).padStart(2, "0")}
                </span>
                <h3>{current.name}</h3>
                <p>{current.description}</p>
                <ul>
                  {current.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
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

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const fadeProgress = useMotionValue(0);
  const titleId = `project-${project.slug}-title`;
  const summaryId = `project-${project.slug}-summary`;
  const roleId = `project-${project.slug}-role`;

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

    measure();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
    };
  }, [fadeProgress, reduce]);

  const scale = useTransform(
    fadeProgress,
    [0, 0.28, 1],
    [1, 0.992, reduce ? 1 : 0.97],
  );
  const opacity = useTransform(
    fadeProgress,
    [0, 0.2, 1],
    [1, 0.97, reduce ? 1 : 0.68],
  );
  const filter = useTransform(
    fadeProgress,
    [0, 0.18, 1],
    [
      "blur(0px)",
      "blur(0.5px)",
      reduce ? "blur(0px)" : "blur(3px)",
    ],
  );
  const y = useTransform(
    fadeProgress,
    [0, 0.24, 1],
    [0, -2, reduce ? 0 : -8],
  );

  return (
    <motion.article
      ref={cardRef}
      className="project-card"
      data-project={project.slug}
      style={{ scale, opacity, filter, y, zIndex: index + 1 }}
    >
      <a
        className="project-card-link"
        href={`/portfolio/project/${project.slug}/`}
        onClick={event => openProjectFromPortfolio(event, project.slug)}
        aria-labelledby={titleId}
        aria-describedby={`${summaryId} ${roleId}`}
      >
        <div className="project-copy">
          <p className="project-type">{project.type}</p>
          <h3 id={titleId}>{project.title}</h3>
          <p className="project-summary" id={summaryId}>{project.summary}</p>
          <p className="project-role" id={roleId}>{project.role}</p>
          <span className="project-link" aria-hidden="true">
            查看项目
            <ArrowUpRight size={15} strokeWidth={1.8} />
          </span>
        </div>
        <div className="project-visual">
          <ImageWithFallback
            src={project.cover}
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

function WorkSection() {
  return (
    <section className="section work-section" id="work">
      <div className="section-shell">
        <SectionIntro
          title="精选作品"
          description="四组案例覆盖金融 AI、企业财税与数据可视化。"
        />
        <div className="project-stack">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
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
          description="经历覆盖工具型产品、企业财税、政企系统与 AI 产品体验。"
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
                          {experience.details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
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
          <p>
            <span className="contact-copy-desktop">
              如需了解项目细节，欢迎通过右侧联系方式与我联系。
            </span>
            <span className="contact-copy-mobile">
              如需了解项目细节，欢迎通过下方联系方式与我联系。
            </span>
          </p>
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
        <AbilitySection />
        <WorkSection />
        <ExperienceSection />
        <ContactSection />
      </main>
      <BackToTop />
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

function ProjectPage({ project }: { project: Project }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();
  const isZhaocaiCase = project.slug === "zhaocai-smart";
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
        className={`case-page${isZhaocaiCase ? " case-page-zhaocai" : ""}`}
        data-project={project.slug}
      >
        {!isZhaocaiCase ? <header className="case-hero">
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
        ) : (
          <ProjectImageGallery project={project} reduce={reduce} />
        )}
        {!isZhaocaiCase ? (
          <footer className="case-footer">
            <a href="/portfolio/#work" onClick={handleProjectBack}>
              <ArrowLeft size={16} strokeWidth={1.8} />
              返回项目列表
            </a>
          </footer>
        ) : null}
      </main>
      <BackToTop />
    </>
  );
}

export default function PortfolioClient({ projectSlug }: { projectSlug?: string }) {
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
  return <ProjectPage project={project} />;
}
