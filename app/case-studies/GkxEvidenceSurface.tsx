import type { ReactNode } from "react";
import "./gkx-evidence-surface.css";

export type GkxEvidenceSurfaceProps = {
  children: ReactNode;
  className?: string;
};

/** A visual backing only; captions and interaction stay with the caller. */
export function GkxEvidenceSurface({ children, className = "" }: GkxEvidenceSurfaceProps) {
  return <div className={`gkx-evidence-surface${className ? ` ${className}` : ""}`}>{children}</div>;
}
