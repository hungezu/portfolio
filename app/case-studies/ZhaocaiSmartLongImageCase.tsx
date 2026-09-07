"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { publicAsset } from "../portfolio-data";
import "./zhaocai-smart-long-image.css";

const locatorSections = [
  ["zcs-homepage", "项目概览"],
  ["zcs-trust-mechanism", "可信机制"],
  ["zcs-process-feedback", "过程反馈"],
  ["zcs-original-output", "原始界面"],
  ["zcs-markdown-system", "输出规范"],
] as const;

const styleFiles = [
  "zhaocai-smart-02.css",
  "zhaocai-smart-03.css",
  "zhaocai-smart-04.css",
  "zhaocai-smart-tokens.css",
  "zhaocai-smart-case.css",
  "zhaocai-smart-ui-evidence.css",
  "zhaocai-smart-demo-viewport.css",
  "zhaocai-smart-homepage.css",
] as const;

const scriptFiles = [
  "zhaocai-smart-03.js",
  "vendor/marked.umd.js",
  "zhaocai-smart-04-data.js",
  "zhaocai-smart-04.js",
] as const;

const legacyAnchors: Record<string, string> = {
  overview: "zcs-homepage",
  strategy: "zcs-trust-mechanism",
  clarification: "zcs-trust-mechanism",
  core: "zcs-process-feedback",
  process: "zcs-process-feedback",
  board: "zcs-original-output",
  gallery: "zcs-original-output",
  markdown: "zcs-markdown-system",
};

function extractCaseMarkup(source: string, bundleBase: string) {
  const documentNode = new DOMParser().parseFromString(source, "text/html");
  const caseNode = documentNode.querySelector("main.zcs-case");
  if (!caseNode) throw new Error("内容包中未找到招财 Smart 案例主体。");

  return caseNode.innerHTML.replaceAll('src="./', `src="${bundleBase}/`);
}

async function executeRuntimeScript(src: string) {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`无法加载交互资源（${response.status}）。`);
  const source = await response.text();
  // The bundled scripts are trusted local project assets and need to run only
  // after their HTML has been inserted into the current case-study document.
  new Function(`${source}\n//# sourceURL=${src}`)();
}

export function ZhaocaiSmartLongImageCase() {
  const contentRef = useRef<HTMLDivElement>(null);
  const caseMarkupRef = useRef<HTMLElement>(null);
  const [markup, setMarkup] = useState("");
  const [error, setError] = useState("");
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [activeSection, setActiveSection] = useState(locatorSections[0][0]);
  const bundleBase = useMemo(
    () => publicAsset("/assets/projects/zhaocai-smart/long-image"),
    [],
  );

  useEffect(() => {
    const controller = new AbortController();

    void fetch(`${bundleBase}/index.html`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`内容包加载失败（${response.status}）。`);
        return response.text();
      })
      .then((source) => setMarkup(extractCaseMarkup(source, bundleBase)))
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "内容包加载失败。");
      });

    return () => controller.abort();
  }, [bundleBase]);

  useLayoutEffect(() => {
    if (!markup || !caseMarkupRef.current) return;
    caseMarkupRef.current.innerHTML = markup;
  }, [markup]);

  useEffect(() => {
    if (!markup) return;

    const boot = async () => {
      try {
        for (const file of scriptFiles) {
          await executeRuntimeScript(`${bundleBase}/${file}`);
        }
        setRuntimeReady(true);
      } catch (reason) {
        setError(
          reason instanceof Error ? reason.message : "交互资源加载失败。",
        );
      }
    };

    void boot();
  }, [bundleBase, markup]);

  useEffect(() => {
    if (!markup) return;
    const root = contentRef.current;
    if (!root) return;
    const nodes = locatorSections
      .map(([id]) => root.querySelector<HTMLElement>(`#${id}`))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const marker = window.innerHeight * 0.24;
        const current = nodes.reduce(
          (active, node) =>
            node.getBoundingClientRect().top <= marker ? node : active,
          nodes[0],
        );
        setActiveSection(current.id);
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const requestedId = window.location.hash.slice(1);
    const targetId = legacyAnchors[requestedId] ?? requestedId;
    if (targetId) {
      window.requestAnimationFrame(() =>
        root.querySelector<HTMLElement>(`#${CSS.escape(targetId)}`)?.scrollIntoView(),
      );
    }

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [markup]);

  return (
    <section
      className="zcli-page"
      aria-label="招财 Smart 项目案例"
      data-runtime-ready={runtimeReady ? "true" : "false"}
    >
      {styleFiles.map((file) => (
        <link
          key={file}
          rel="stylesheet"
          href={`${bundleBase}/${file}`}
          data-zhaocai-bundle-style={file}
        />
      ))}

      <nav className="zhaocai-locator" aria-label="案例章节定位">
        <span aria-hidden="true" />
        {locatorSections.map(([id, label], index) => (
          <a
            href={`#${id}`}
            className={activeSection === id ? "active" : ""}
            aria-current={activeSection === id ? "location" : undefined}
            onClick={(event) => {
              event.preventDefault();
              const target = contentRef.current?.querySelector<HTMLElement>(
                `#${CSS.escape(id)}`,
              );
              if (!target) return;
              window.history.replaceState(
                window.history.state,
                "",
                `${window.location.pathname}${window.location.search}#${id}`,
              );
              target.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "auto"
                  : "smooth",
                block: "start",
              });
              setActiveSection(id);
            }}
            key={id}
          >
            <b>{String(index + 1).padStart(2, "0")}</b>
            <em>{label}</em>
          </a>
        ))}
      </nav>

      <div className="zcli-content" ref={contentRef}>
        {!markup && !error ? (
          <div className="zcli-loading" role="status">正在加载项目内容…</div>
        ) : null}
        {error ? (
          <div className="zcli-error" role="alert">
            <h1>项目内容暂时无法加载</h1>
            <p>{error}</p>
          </div>
        ) : null}
        {markup ? (
          <main
            ref={caseMarkupRef}
            className="zcs-case"
            aria-label="招财 Smart 项目展示、可信机制与输出规范"
          />
        ) : null}
      </div>
    </section>
  );
}
