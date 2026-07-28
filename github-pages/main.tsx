import React from "react";
import { createRoot } from "react-dom/client";
import PortfolioClient from "../app/portfolio-client";
import "../app/globals.css";

const basePath = "/portfolio";
const routePath = window.location.pathname.startsWith(basePath)
  ? window.location.pathname.slice(basePath.length)
  : window.location.pathname;
const projectMatch = routePath.match(/^\/project\/([^/]+)\/?$/);
const projectSlug = projectMatch
  ? decodeURIComponent(projectMatch[1])
  : undefined;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PortfolioClient projectSlug={projectSlug} />
  </React.StrictMode>,
);
