"use client";

import { useState, type ImgHTMLAttributes } from "react";
import manifest from "../assets/optimized/manifest.json";
import { publicAsset } from "./portfolio-data";

type ImageAsset = {
  src: string;
  srcSet: string;
  width: number;
  height: number;
};

const images = manifest as Record<string, ImageAsset>;

export function optimizedImage(path: string) {
  const clean = path.replace(/^\/portfolio(?=\/assets\/)/, "").split(/[?#]/)[0];
  return images[clean];
}

type PortfolioImageProps = ImgHTMLAttributes<HTMLImageElement> & { original?: boolean };

export function PortfolioImage(props: PortfolioImageProps) {
  return <ImageRequest key={`${props.src}:${props.original ?? false}`} {...props} />;
}

function ImageRequest({
  src,
  alt = "",
  original = false,
  loading = "lazy",
  decoding = "async",
  srcSet,
  sizes = "(max-width: 767px) calc(100vw - 32px), (max-width: 1664px) calc(100vw - 64px), 1600px",
  width,
  height,
  onError,
  ...props
}: PortfolioImageProps) {
  const asset = typeof src === "string" && !original ? optimizedImage(src) : undefined;
  const [stage, setStage] = useState<"optimized" | "original" | "failed">(asset ? "optimized" : "original");
  const [attempt, setAttempt] = useState(0);
  const useOptimized = stage === "optimized" && asset;
  const imageWidth = width ?? asset?.width;
  const imageHeight = height ?? asset?.height;

  if (stage === "failed") {
    return <div className={`image-fallback ${props.className ?? ""}`} style={{
      ...props.style,
      aspectRatio: imageWidth && imageHeight ? `${imageWidth} / ${imageHeight}` : undefined,
    }} role="group" aria-label={alt}>
      <span>图片暂时未能加载</span>
      <button type="button" onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        setAttempt(value => value + 1);
        setStage(asset ? "optimized" : "original");
      }}>重试加载图片</button>
    </div>;
  }

  const withRetry = (url: string) => attempt ? `${url}${url.includes("?") ? "&" : "?"}retry=${attempt}` : url;
  const requestSource = useOptimized ? publicAsset(asset.src) : src;
  const requestSet = useOptimized ? asset.srcSet : srcSet;
  return <img
    {...props}
    key={`${stage}:${attempt}`}
    data-portfolio-image=""
    src={typeof requestSource === "string" ? withRetry(requestSource) : requestSource}
    srcSet={requestSet?.split(/,\s*/).map(candidate => {
      const [url, descriptor] = candidate.trim().split(/\s+/);
      return [withRetry(useOptimized ? publicAsset(url) : url), descriptor].filter(Boolean).join(" ");
    }).join(", ")}
    sizes={requestSet ? sizes : undefined}
    alt={alt}
    width={imageWidth}
    height={imageHeight}
    loading={loading}
    decoding={decoding}
    onError={event => {
      if (useOptimized) setStage("original");
      else {
        setStage("failed");
        onError?.(event);
      }
    }}
  />;
}
