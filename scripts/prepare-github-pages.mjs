import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outputDirectory = resolve(process.cwd(), "gh-pages-dist");
const projectSlugs = [
  "gkx",
  "zhaocai-smart",
  "tax-cloud",
  "energy-tax",
  "data-visualisation",
];

const baseHtml = await readFile(resolve(outputDirectory, "index.html"), "utf8");

function withCaseMetadata(html, slug, view) {
  const metadata = slug === "zhaocai-smart" ? {
    title: "招财 Smart｜AI 财务智能问数项目｜李家豪",
    description: "招财 Smart 项目案例：从业务任务与口径确认，到过程反馈、结果依据、看板复用和交互交付。",
    image: "assets/projects/zhaocai-smart/long-image/assets/homepage-original.png",
    imageAlt: "招财 Smart 财务智能问数产品界面",
  } : {
    title: `国科信｜${view === "systems" ? "系统实景" : view === "design-system" ? "设计规范" : "门户与多系统体验设计"}｜李家豪`,
    description: "国科信项目案例：统一门户与多系统设计，梳理业务任务、可信机制、操作反馈、AI 原型和设计交付核对。",
    image: "assets/projects/gkx/case-study/ui/portal-workspace.png",
    imageAlt: "国科信智慧门户工作区产品界面",
  };
  const { title, description, imageAlt } = metadata;
  const image = `https://hungezu.github.io/portfolio/${metadata.image}`;
  const url = `https://hungezu.github.io/portfolio/project/${slug}/${view ? `${view}/` : ""}`;
  return html
    .replace(/\s*<link\s+rel="preload"\s+as="image"[^>]*hero-poster-(?:mobile|desktop)\.jpg[^>]*>/g, "")
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/s, `<meta name="description" content="${description}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?\s*>/s, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?\s*>/s, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?\s*>/s, `<meta property="og:image" content="${image}" />\n    <meta property="og:image:alt" content="${imageAlt}" />\n    <meta property="og:type" content="article" />\n    <meta property="og:url" content="${url}" />\n    <link rel="canonical" href="${url}" />\n    <meta name="twitter:card" content="summary_large_image" />`);
}

await writeFile(resolve(outputDirectory, ".nojekyll"), "");
await copyFile(
  resolve(outputDirectory, "index.html"),
  resolve(outputDirectory, "404.html"),
);

for (const slug of projectSlugs) {
  const routeDirectory = resolve(outputDirectory, "project", slug);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(
    resolve(routeDirectory, "index.html"),
    slug === "zhaocai-smart" || slug === "gkx" ? withCaseMetadata(baseHtml, slug) : baseHtml,
  );
}

for (const view of ["systems", "design-system"]) {
  const routeDirectory = resolve(outputDirectory, "project", "gkx", view);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(resolve(routeDirectory, "index.html"), withCaseMetadata(baseHtml, "gkx", view));
}
