import { copyFile, cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const publicDirectory = resolve(root, "public");

// Native specification views share the exact same translation source as React.
await copyFile(resolve(root, "app/i18n/messages.en.json"), resolve(root, "assets/projects/zhaocai-smart/long-image/messages.en.json"));
await mkdir(publicDirectory, { recursive: true });
await rm(resolve(publicDirectory, "portfolio.html"), { force: true });
await rm(resolve(publicDirectory, "assets"), { recursive: true, force: true });
await mkdir(resolve(publicDirectory, "assets"), { recursive: true });
await cp(
  resolve(root, "assets", "optimized"),
  resolve(publicDirectory, "assets", "optimized"),
  { recursive: true, filter: (source) => !source.endsWith(".cache.json") },
);
await cp(
  resolve(root, "assets", "visual"),
  resolve(publicDirectory, "assets", "visual"),
  { recursive: true },
);
await cp(
  resolve(root, "assets", "portfolio"),
  resolve(publicDirectory, "assets", "portfolio"),
  { recursive: true },
);
await cp(
  resolve(root, "assets", "li-jiahao-ui-portfolio-web.pdf"),
  resolve(publicDirectory, "assets", "li-jiahao-ui-portfolio-web.pdf"),
);
await mkdir(resolve(publicDirectory, "assets", "projects"), { recursive: true });
await cp(
  resolve(root, "assets", "projects", "covers"),
  resolve(publicDirectory, "assets", "projects", "covers"),
  { recursive: true },
);
await cp(
  resolve(root, "assets", "projects", "zhaocai-smart"),
  resolve(publicDirectory, "assets", "projects", "zhaocai-smart"),
  { recursive: true },
);
for (const slug of ["tax-cloud", "energy-tax", "data-visualisation"]) {
  await cp(
    resolve(root, "assets", "projects", slug),
    resolve(publicDirectory, "assets", "projects", slug),
    { recursive: true },
  );
}
await cp(
  resolve(root, "assets", "projects", "gkx"),
  resolve(publicDirectory, "assets", "projects", "gkx"),
  { recursive: true },
);
