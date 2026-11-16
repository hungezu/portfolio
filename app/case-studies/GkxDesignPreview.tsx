"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { publicAsset } from "../portfolio-data";
import "./gkx-design-preview.css";

export type GkxDesignPreviewProps = {
  title: string;
  documentId?: string;
  className?: string;
  initialHeight?: number;
};

const heightMessage = "gkx:design-preview:height";
const measureMessage = "gkx:design-preview:measure";
const maximumHeight = 16_000;

/** The public specification grows with its content; the host page owns scrolling. */
export function GkxDesignPreview({ title, documentId = "page-index", className = "", initialHeight = 720 }: GkxDesignPreviewProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(() => Math.max(240, Math.min(maximumHeight, initialHeight)));
  const source = publicAsset(`/assets/projects/gkx/design-preview/index.html?id=${encodeURIComponent(documentId)}&embed=1&v=20261116-single-line-notice`);
  const requestMeasurement = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage({ type: measureMessage, version: 1 }, window.location.origin);
  }, []);

  useEffect(() => {
    const receiveHeight = (event: MessageEvent<unknown>) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return;
      const message = event.data;
      if (!message || typeof message !== "object") return;
      const data = message as { type?: unknown; version?: unknown; height?: unknown };
      if (data.type !== heightMessage || data.version !== 1 || typeof data.height !== "number") return;
      if (!Number.isFinite(data.height) || data.height < 240 || data.height > maximumHeight) return;
      const nextHeight = Math.ceil(data.height);
      setHeight(current => current === nextHeight ? current : nextHeight);
    };
    window.addEventListener("message", receiveHeight);

    let lastWidth = -1;
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      observer = new ResizeObserver(entries => {
        const width = entries[0]?.contentRect.width;
        // Changing iframe height must not trigger another measurement request.
        if (width !== undefined && Math.abs(width - lastWidth) > 0.5) {
          lastWidth = width;
          requestMeasurement();
        }
      });
      observer.observe(containerRef.current);
    }
    window.addEventListener("resize", requestMeasurement);
    requestMeasurement();
    return () => {
      window.removeEventListener("message", receiveHeight);
      window.removeEventListener("resize", requestMeasurement);
      observer?.disconnect();
    };
  }, [requestMeasurement, source]);

  return <div ref={containerRef} className={`gkx-design-preview${className ? ` ${className}` : ""}`}>
    <iframe
      ref={frameRef}
      src={source}
      title={title}
      loading="lazy"
      scrolling="no"
      sandbox="allow-scripts allow-same-origin allow-forms"
      height={height}
      style={{ height }}
      onLoad={requestMeasurement}
    />
  </div>;
}
