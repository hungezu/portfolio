import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const publicDirectory = resolve(root, "public");

await mkdir(publicDirectory, { recursive: true });
await cp(resolve(root, "index.html"), resolve(publicDirectory, "portfolio.html"));
await rm(resolve(publicDirectory, "assets"), { recursive: true, force: true });
await mkdir(resolve(publicDirectory, "assets", "visual"), { recursive: true });
await cp(
  resolve(root, "assets", "visual"),
  resolve(publicDirectory, "assets", "visual"),
  { recursive: true },
);
await cp(
  resolve(root, "assets", "li-jiahao-ui-portfolio-web.pdf"),
  resolve(publicDirectory, "assets", "li-jiahao-ui-portfolio-web.pdf"),
);
await mkdir(resolve(publicDirectory, "assets", "projects"), { recursive: true });
await cp(
  resolve(root, "output", "portfolio-images"),
  resolve(publicDirectory, "assets", "projects", "portfolio-images"),
  { recursive: true },
);
await cp(
  resolve(root, "output", "zhaocai-smart-case-refined"),
  resolve(publicDirectory, "assets", "projects", "zhaocai-smart"),
  { recursive: true },
);
await cp(
  resolve(root, "assets", "projects", "tax-cloud"),
  resolve(publicDirectory, "assets", "projects", "tax-cloud"),
  { recursive: true },
);
