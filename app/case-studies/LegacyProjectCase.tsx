"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { optimizedImage, PortfolioImage } from "../portfolio-image";
import type { Project } from "../portfolio-data";
import { ProjectLocator, type ProjectLocatorSection } from "../project-locator";
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

type GalleryBoard = { src: string; title: string; alt: string };

export function LegacyProjectCase({ project }: { project: Project }) {
  const { locale, t } = useI18n();
  const english = locale === "en";
  const [viewer, setViewer] = useState<GalleryBoard | null>(null);
  const [original, setOriginal] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
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
    return { src, title, alt: project.galleryAlt?.[index] ?? title };
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

  const open = (board: GalleryBoard, button: HTMLButtonElement) => {
    trigger.current = button;
    setOriginal(false);
    setViewer(board);
  };

  return <article className="legacy-case" aria-label={english ? "Complete design boards" : "完整设计展板"}>
    <ProjectLocator sections={sections} legacyAnchors={previousAnchors[project.slug]} ariaLabel="项目章节定位" />
    <p className="legacy-gallery-note">
      {english
        ? "Original design boards in Chinese. The figures are shown as part of the interface design and are not project outcome metrics."
        : "原设计展板，按原顺序展示。图内数值用于说明界面，不作为项目成效。"}
    </p>
    <div className="legacy-gallery">
      {boards.map((board, index) => <figure className="legacy-board" key={board.src} id={"case-gallery-" + index}>
        <div className="legacy-board-frame">
          <PortfolioImage
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
          <button type="button" onClick={event => open(board, event.currentTarget)}>
            {english ? "Enlarge" : "放大查看"}
          </button>
        </figcaption>
      </figure>)}
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
          <div>
            <button type="button" aria-pressed={original} onClick={() => setOriginal(value => !value)}>
              {original ? (english ? "Fit width" : "适合宽度") : (english ? "Original size" : "原始尺寸")}
            </button>
            <button type="button" autoFocus onClick={() => setViewer(null)}>{t("关闭")}</button>
          </div>
        </header>
        <div className={"legacy-viewer-canvas" + (original ? " is-original" : "")} tabIndex={0}>
          <PortfolioImage src={viewer.src} alt={viewer.alt} original={original} loading="eager"
            sizes="(max-width: 767px) calc(100vw - 48px), 1460px"
            style={original ? undefined : { maxWidth: optimizedImage(viewer.src)?.width }}
          />
        </div>
      </div>
    </dialog>}
  </article>;
}
