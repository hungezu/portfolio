import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outputDirectory = resolve(process.cwd(), "gh-pages-dist");
const projectSlugs = [
  "gkx",
  "zhaocai-smart",
  "tax-cloud",
  "energy-tax",
  "data-visualisation",
];

await writeFile(resolve(outputDirectory, ".nojekyll"), "");
await copyFile(
  resolve(outputDirectory, "index.html"),
  resolve(outputDirectory, "404.html"),
);

for (const slug of projectSlugs) {
  const routeDirectory = resolve(outputDirectory, "project", slug);
  await mkdir(routeDirectory, { recursive: true });
  await copyFile(
    resolve(outputDirectory, "index.html"),
    resolve(routeDirectory, "index.html"),
  );
}
