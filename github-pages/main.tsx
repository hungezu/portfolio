import React from "react";
import { createRoot } from "react-dom/client";
import PortfolioClient from "../app/portfolio-client";
import "../app/globals.css";

const basePath = "/portfolio";
const routePath = window.location.pathname.startsWith(basePath)
  ? window.location.pathname.slice(basePath.length)
  : window.location.pathname;
const projectMatch = routePath.match(/^\/project\/([^/]+)(?:\/([^/]+))?\/?$/);
const projectSlug = projectMatch
  ? decodeURIComponent(projectMatch[1])
  : undefined;
const projectView = projectMatch?.[2] === "systems" || projectMatch?.[2] === "design-system"
  ? projectMatch[2]
  : undefined;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PortfolioClient projectSlug={projectSlug} projectView={projectView} />
  </React.StrictMode>,
);
