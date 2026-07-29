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

for (const name of await readdir(rootAssetsDirectory)) {
  if (isBuiltAsset(name)) {
    await rm(resolve(rootAssetsDirectory, name));
  }
}

for (const name of await readdir(outputAssetsDirectory)) {
  if (isBuiltAsset(name)) {
    await copyFile(
      resolve(outputAssetsDirectory, name),
      resolve(rootAssetsDirectory, name),
    );
  }
}

for (const name of ["index.html", "404.html", ".nojekyll", "og.png"]) {
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
