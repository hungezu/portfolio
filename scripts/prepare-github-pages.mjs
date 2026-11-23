import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outputDirectory = resolve(process.cwd(), "gh-pages-dist");
const projectSlugs = [
  "gkx",
  "zhaocai-smart",
  "tax-cloud",
  "energy-tax",
  "data-visualisation",
];

const baseHtml = (await readFile(resolve(outputDirectory, "index.html"), "utf8"))
  .replace(/\r\n/g, "\n")
  .replace(/\s*<link\b[^>]*data-capability-preload[^>]*>/g, "");
const caseHtml = baseHtml.replace(/\s*<link\s+rel="preload"\s+as="image"[^>]*hero-poster-(?:mobile|desktop)\.(?:jpg|webp)[^>]*>/g, "");

const caseMetadata = {
  "zhaocai-smart": {
    title: "招财 Smart｜AI 财务智能问数项目｜李家豪",
    description: "招财 Smart 项目案例：从业务任务与口径确认，到过程反馈、结果依据、看板复用和交互交付。",
    image: "assets/projects/zhaocai-smart/long-image/assets/homepage-original.png",
    imageAlt: "招财 Smart 财务智能问数产品界面",
  },
  gkx: {
    title: "GKX｜门户与多系统体验设计｜李家豪",
    description: "GKX项目案例：统一门户与多系统设计，梳理业务任务、可信机制、操作反馈、AI 原型和设计交付核对。",
    image: "assets/projects/gkx/case-study/ui/portal-workspace.png",
    imageAlt: "GKX智慧门户工作区产品界面",
  },
  "tax-cloud": {
    title: "税纪云 2.0｜全税种申报平台｜李家豪",
    description: "税纪云跨端改版案例：企业与集团工作台、密集表单筛选、移动审批及交付走查。",
    image: "assets/projects/covers/tax-cloud-cover-20260828.jpg",
    imageAlt: "税纪云 2.0 项目封面",
  },
  "energy-tax": {
    title: "集团报税平台｜申报工作台与界面规范｜李家豪",
    description: "集团报税平台设计案例：保留申报习惯、统一任务状态与表格结构。",
    image: "assets/projects/covers/energy-tax-cover-20260828.jpg",
    imageAlt: "集团报税平台项目封面",
  },
  "data-visualisation": {
    title: "数据可视化大屏｜阅读顺序与信息分区｜李家豪",
    description: "数据可视化大屏项目：税务驾驶舱的指标、地图、趋势与详细数据的布局。",
    image: "assets/projects/covers/data-visualisation-cover-20260828.jpg",
    imageAlt: "数据可视化大屏项目封面",
  },
};

function withCaseMetadata(html, slug) {
  const metadata = caseMetadata[slug];
  const { title, description, imageAlt } = metadata;
  const image = `https://hungezu.github.io/portfolio/${metadata.image}`;
  const url = `https://hungezu.github.io/portfolio/project/${slug}/`;
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/s, `<meta name="description" content="${description}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?\s*>/s, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?\s*>/s, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?\s*>/s, `<meta property="og:image" content="${image}" />\n    <meta property="og:image:alt" content="${imageAlt}" />\n    <meta property="og:type" content="article" />\n    <meta property="og:url" content="${url}" />\n    <link rel="canonical" href="${url}" />\n    <meta name="twitter:card" content="summary_large_image" />`);
}

await writeFile(resolve(outputDirectory, ".nojekyll"), "");
await writeFile(resolve(outputDirectory, "index.html"), baseHtml);
await writeFile(resolve(outputDirectory, "404.html"), baseHtml);

for (const slug of projectSlugs) {
  const routeDirectory = resolve(outputDirectory, "project", slug);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(
    resolve(routeDirectory, "index.html"),
    withCaseMetadata(caseHtml, slug),
  );
}

for (const view of ["systems", "design-system"]) {
  const routeDirectory = resolve(outputDirectory, "project", "gkx", view);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(resolve(routeDirectory, "index.html"), withCaseMetadata(caseHtml, "gkx"));
}
