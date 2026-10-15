import {
  copyFile,
  cp,
  mkdir,
  readdir,
  rm,
} from "node:fs/promises";
import { resolve } from "node:path";

const repositoryRoot = process.cwd();
const outputDirectory = resolve(repositoryRoot, "gh-pages-dist");
const outputAssetsDirectory = resolve(outputDirectory, "assets");
const rootAssetsDirectory = resolve(repositoryRoot, "assets");

const isBuiltAsset = (name) => /^index-.*\.(?:css|js)$/.test(name);

await mkdir(rootAssetsDirectory, { recursive: true });

for (const entry of await readdir(rootAssetsDirectory, { withFileTypes: true })) {
  if (entry.isFile() && isBuiltAsset(entry.name)) {
    await rm(resolve(rootAssetsDirectory, entry.name));
  }
}

// CSS imports can emit images and fonts beside the entry bundles. Preserve
// source asset directories and sync every top-level output file.
for (const entry of await readdir(outputAssetsDirectory, { withFileTypes: true })) {
  if (entry.isFile()) {
    await copyFile(
      resolve(outputAssetsDirectory, entry.name),
      resolve(rootAssetsDirectory, entry.name),
    );
  }
}

for (const name of [
  "index.html",
  "404.html",
  ".nojekyll",
  "og.png",
  "favicon-32.png",
  "apple-touch-icon.png",
]) {
  await copyFile(
    resolve(outputDirectory, name),
    resolve(repositoryRoot, name),
  );
}

const rootProjectDirectory = resolve(repositoryRoot, "project");
await rm(rootProjectDirectory, { recursive: true, force: true });
await cp(
  resolve(outputDirectory, "project"),
  rootProjectDirectory,
  { recursive: true },
);

console.log("Synced GitHub Pages output into the repository root.");
