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

function withZhaocaiMetadata(html) {
  const title = "招财 Smart｜AI 财务智能问数项目｜李家豪";
  const description = "招财 Smart AI 财务智能问数项目案例：口径确认、人机控制权、失败恢复、结果追溯与设计交付边界。";
  const image = "https://hungezu.github.io/portfolio/assets/projects/zhaocai-smart/long-image/assets/homepage-original.png";
  const url = "https://hungezu.github.io/portfolio/project/zhaocai-smart/";
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/s, `<meta name="description" content="${description}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?\s*>/s, `<meta property="og:title" content="招财 Smart｜AI 财务智能问数项目" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?\s*>/s, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?\s*>/s, `<meta property="og:image" content="${image}" />\n    <meta property="og:image:alt" content="招财 Smart 财务智能问数产品界面" />\n    <meta property="og:type" content="article" />\n    <meta property="og:url" content="${url}" />\n    <meta name="twitter:card" content="summary_large_image" />`);
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
    slug === "zhaocai-smart" ? withZhaocaiMetadata(baseHtml) : baseHtml,
  );
}

for (const view of ["systems", "design-system"]) {
  const routeDirectory = resolve(outputDirectory, "project", "gkx", view);
  await mkdir(routeDirectory, { recursive: true });
  await copyFile(
    resolve(outputDirectory, "index.html"),
    resolve(routeDirectory, "index.html"),
  );
}
