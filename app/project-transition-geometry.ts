export type MotionRect = { left: number; top: number; width: number; height: number };
export type ProjectRoute = {
  url: string;
  projectSlug?: string;
  projectView?: "story" | "systems" | "design-system";
  motionEntry?: boolean;
  homeRestore?: { slug: string; y: number };
};

export function parseProjectRoute(url: string, origin: string, slugs: readonly string[], base = "/portfolio"): ProjectRoute | null {
  let destination: URL;
  try { destination = new URL(url, origin); } catch { return null; }
  if (destination.origin !== origin || !/^https?:$/.test(destination.protocol)) return null;
  const path = destination.pathname.replace(/\/$/, "");
  if (path === base) return { url: destination.pathname + destination.search + destination.hash };
  if (!path.startsWith(`${base}/project/`)) return null;
  const [encodedSlug, view, ...extra] = path.slice(`${base}/project/`.length).split("/");
  let slug: string;
  try { slug = decodeURIComponent(encodedSlug); } catch { return null; }
  if (!slugs.includes(slug) || extra.length || (view && !["systems", "design-system"].includes(view))) return null;
  return {
    url: destination.pathname + destination.search + destination.hash,
    projectSlug: slug,
    projectView: view as ProjectRoute["projectView"],
  };
}

export function rectClip(rect: MotionRect, width: number, height: number, radius = 12): string {
  const left = Math.max(0, Math.min(width, rect.left));
  const top = Math.max(0, Math.min(height, rect.top));
  const right = Math.max(left, Math.min(width, rect.left + rect.width));
  const bottom = Math.max(top, Math.min(height, rect.top + rect.height));
  return `inset(${top}px ${width - right}px ${height - bottom}px ${left}px round ${radius}px)`;
}

export function titleLanding(from: MotionRect, to: MotionRect, sourceFontSize: number, targetFontSize: number): string {
  const scale = targetFontSize / Math.max(1, sourceFontSize);
  return `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${scale})`;
}

// The frame may change aspect ratio. Counter-scale its image so the bitmap never stretches.
export function imageLanding(from: MotionRect, to: MotionRect, naturalWidth: number, naturalHeight: number) {
  const sx = from.width / Math.max(1, to.width);
  const sy = from.height / Math.max(1, to.height);
  const fromFit = Math.max(from.width / naturalWidth, from.height / naturalHeight);
  const toFit = Math.max(to.width / naturalWidth, to.height / naturalHeight);
  const ratio = fromFit / toFit;
  return {
    frame: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${sx}, ${sy})`,
    image: `scale(${ratio / sx}, ${ratio / sy})`,
    sx, sy, imageX: ratio / sx, imageY: ratio / sy,
  };
}
