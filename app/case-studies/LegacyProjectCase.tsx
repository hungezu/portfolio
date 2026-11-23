"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { optimizedImage } from "../portfolio-image";
import { publicAsset, type Project } from "../portfolio-data";
import { ProjectLocator, type ProjectLocatorSection } from "../project-locator";
import boardLayouts from "./legacy-board-layouts.json";
import { DesignBoardImage } from "./legacy-board-corrections";
import { TaxCloudContrastSpec } from "./legacy-contrast-spec";
import "./legacy-project-case.css";

const previousAnchors: Record<string, Readonly<Record<string, string>>> = {
  "tax-cloud": {
    "legacy-tax-scope": "case-gallery-0",
    "legacy-tax-workspace": "case-gallery-7",
    "legacy-tax-forms": "case-gallery-4",
    "legacy-tax-mobile": "case-gallery-14",
  },
  "energy-tax": {
    "legacy-energy-scope": "case-gallery-0",
    "legacy-energy-workspace": "case-gallery-3",
    "legacy-energy-grid": "case-gallery-2",
    "legacy-energy-reflection": "case-gallery-5",
  },
  "data-visualisation": {
    "legacy-visual-layout": "case-gallery-0",
    "legacy-visual-display": "case-gallery-4",
    "legacy-visual-data": "case-gallery-4",
  },
};

type BoardRegion = { id: string; title: string; english: string; box: number[] };
type GalleryBoard = { src: string; title: string; alt: string; key: string; regions?: BoardRegion[] };
type ViewMode = "fit" | "read" | "regions" | "original";

const layouts: Partial<Record<string, BoardRegion[]>> = boardLayouts;

export function LegacyProjectCase({ project }: { project: Project }) {
  const { locale, t } = useI18n();
  const english = locale === "en";
  const [viewer, setViewer] = useState<GalleryBoard | null>(null);
  const [mode, setMode] = useState<ViewMode>("fit");
  const trigger = useRef<HTMLButtonElement | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const readingProgress = useRef<number | null>(null);
  const dialogTitle = useId();
  const sections = useMemo<ProjectLocatorSection[]>(() => {
    const chapters = project.gallerySections ?? project.gallery.map((_, index) => ({
      startIndex: index,
      label: project.galleryLabels?.[index] ?? project.shortTitle,
    }));
    return [
      ["project-overview", "项目介绍"],
      ...chapters.map(({ startIndex, label }) => ["case-gallery-" + startIndex, label] as const),
    ];
  }, [project]);
  const boards = project.gallery.map((src, index) => {
    const title = project.galleryLabels?.[index] ?? project.shortTitle;
    const key = src.split("/assets/projects/").at(-1)?.replace(/\.png$/i, "") ?? "";
    return { src, title, alt: project.galleryAlt?.[index] ?? title, key, regions: layouts[key] };
  });

  useEffect(() => {
    if (!viewer || !dialog.current) return;
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [viewer]);

  useLayoutEffect(() => {
    const panel = canvas.current;
    if (!panel || readingProgress.current === null) return;
    panel.scrollTop = (panel.scrollHeight - panel.clientHeight) * readingProgress.current;
    if (mode === "fit" || mode === "regions") panel.scrollLeft = 0;
    readingProgress.current = null;
  }, [mode]);

  const changeMode = (next: ViewMode) => {
    if (mode === next) return;
    const panel = canvas.current;
    if (next === "regions" || mode === "regions") readingProgress.current = 0;
    else if (panel) readingProgress.current = panel.scrollTop / Math.max(1, panel.scrollHeight - panel.clientHeight);
    setMode(next);
  };

  const open = (board: GalleryBoard, button: HTMLButtonElement, initial?: ViewMode) => {
    trigger.current = button;
    readingProgress.current = null;
    const phone = window.matchMedia("(max-width: 767px)").matches;
    setMode(initial ?? (phone ? (board.regions ? "regions" : "read") : "fit"));
    setViewer(board);
  };
  const fitWidth = viewer ? optimizedImage(viewer.src)?.width : undefined;
  const modes: Array<[ViewMode, string, string]> = [
    ["fit", "整图适宽", "Fit width"],
    viewer?.regions ? ["regions", "分区阅读", "By section"] : ["read", "放大阅读", "Read larger"],
    ["original", "原始尺寸", "Original size"],
  ];

  return <article className="legacy-case" aria-label={english ? "Complete design boards" : "完整设计展板"}>
    <ProjectLocator sections={sections} legacyAnchors={previousAnchors[project.slug]} ariaLabel="项目章节定位" />
    <p className="legacy-gallery-note">
      {english
        ? "Original design boards in Chinese. The figures are shown as part of the interface design and are not project outcome metrics."
        : "原设计展板，按原顺序展示。图内数值用于说明界面，不作为项目成效。"}
    </p>
    <div className="legacy-gallery">
      {boards.map((board, index) => <div className="legacy-board-entry" key={board.src}>
        <figure className="legacy-board" id={"case-gallery-" + index}>
        <div className="legacy-board-frame">
          <DesignBoardImage
            boardKey={board.key}
            src={board.src}
            alt={board.alt}
            data-motion-source={board.src}
            sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1264px) calc(100vw - 64px), 1200px"
          />
          <button
            type="button"
            className="legacy-board-hit"
            aria-label={(english ? "Enlarge " : "放大查看：") + t(board.title)}
            onClick={event => open(board, event.currentTarget)}
          />
        </div>
        <figcaption>
          <span>{t(board.title)}</span>
          <button type="button" onClick={event => open(board, event.currentTarget, board.regions ? "regions" : undefined)}>
            {board.regions ? (english ? "Read by section" : "分区阅读") : (english ? "Enlarge" : "放大查看")}
          </button>
        </figcaption>
        </figure>
        {board.key === "tax-cloud/03-global-style" && <TaxCloudContrastSpec english={english} />}
      </div>)}
    </div>
    {viewer && <dialog
      ref={dialog}
      className="legacy-viewer"
      aria-labelledby={dialogTitle}
      onCancel={event => { event.preventDefault(); setViewer(null); }}
      onClick={event => { if (event.target === event.currentTarget) setViewer(null); }}
    >
      <div className="legacy-viewer-panel">
        <header>
          <h2 id={dialogTitle}>{t(viewer.title)}</h2>
          <button className="legacy-viewer-close" type="button" autoFocus onClick={() => setViewer(null)}>{t("关闭")}</button>
          <div className="legacy-viewer-modes" role="group" aria-label={english ? "Image reading mode" : "图片阅读方式"}>
            {modes.map(([key, title, label]) => <button
              type="button" key={key} aria-pressed={mode === key} onClick={() => changeMode(key)}
            >{english ? label : title}</button>)}
          </div>
        </header>
        <div className={`legacy-viewer-canvas is-${mode}`} ref={canvas} tabIndex={0}>
          {mode === "regions" ? <div className="legacy-board-regions">
            {viewer.regions?.map(region => {
              const label = english ? region.english : region.title;
              const [, , width, height] = region.box;
              const scrollable = width >= 800 && width / height >= 1.8;
              return <figure className="legacy-board-region" key={region.id}>
                <figcaption>
                  <span>{label}</span>
                  {scrollable && <small>{english ? "Scroll sideways" : "可左右滑动"}</small>}
                </figcaption>
                <div className={scrollable ? "legacy-board-region-scroll" : undefined}
                  tabIndex={scrollable ? 0 : undefined} aria-label={scrollable ? label : undefined}
                  role={scrollable ? "region" : undefined}>
                  <DesignBoardImage
                    boardKey={viewer.key}
                    region={region.box}
                    original
                    src={publicAsset(`/assets/projects/legacy-board-details/${viewer.key}/${region.id}.webp`)}
                    alt={label}
                    width={width}
                    height={height}
                    style={{ maxWidth: width }}
                  />
                </div>
              </figure>;
            })}
          </div> : <DesignBoardImage
            boardKey={viewer.key}
            src={viewer.src}
            alt={viewer.alt}
            original={mode === "original"}
            loading="eager"
            sizes={mode === "read" ? "(max-width: 767px) calc(250vw - 120px), 1920px"
              : "(max-width: 767px) calc(100vw - 40px), 1460px"}
            style={mode === "read" && fitWidth ? { width: `min(250%, ${fitWidth}px)` }
              : mode === "fit" ? { maxWidth: fitWidth } : undefined}
          />}
        </div>
      </div>
    </dialog>}
  </article>;
}
