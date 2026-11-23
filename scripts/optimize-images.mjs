import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, readdir, stat, rename, unlink } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Keep the originals for downloads and future exports. The website consumes the
// manifest, so an original PNG and its existing WebP both resolve to one output.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetDirectory = join(root, "assets");
const outputDirectory = join(assetDirectory, "optimized");
const manifestPath = join(outputDirectory, "manifest.json");
const cachePath = join(outputDirectory, ".cache.json");
const settings = {
  version: 1,
  quality: 85,
  alphaQuality: 100,
  effort: 4,
  maxWidth: 2400,
  responsiveWidths: [640, 1280],
  sharp: sharp.versions.sharp,
  webp: sharp.versions.webp,
};
const settingsKey = JSON.stringify(settings);
const extensionPriority = { ".png": 0, ".jpg": 1, ".jpeg": 2, ".webp": 3 };
sharp.concurrency(1);
sharp.cache({ memory: 32, files: 0, items: 20 });

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, "en"))) {
    if (entry.name === "optimized") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name)) files.push(path);
  }
  return files;
}

function assetPath(path) {
  return relative(assetDirectory, path).replaceAll("\\", "/");
}

function urlFor(path) {
  return `/assets/${assetPath(path)}`;
}

async function writeJson(path, value) {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  try {
    if (await readFile(path, "utf8") === content) return;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, content);
  await rename(temporaryPath, path);
}

async function existsWithSize(path, size) {
  try {
    const info = await stat(path);
    return info.isFile() && info.size === size;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function mib(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`;
}

await mkdir(outputDirectory, { recursive: true });
const oldCache = await readJson(cachePath, {});
const sourcePaths = [
  ...await walk(join(assetDirectory, "projects")),
  ...await walk(join(assetDirectory, "portfolio")),
  ...await walk(join(assetDirectory, "visual", "sidebar-character")),
];
for (const entry of await readdir(join(assetDirectory, "visual"), { withFileTypes: true })) {
  if (entry.isFile() && /^hero-poster-.*\.jpg$/i.test(entry.name)) {
    sourcePaths.push(join(assetDirectory, "visual", entry.name));
  }
}
sourcePaths.sort((a, b) => assetPath(a).localeCompare(assetPath(b), "en"));

const groups = new Map();
const sourceStats = new Map();
for (const path of sourcePaths) {
  const extension = extname(path).toLowerCase();
  const key = assetPath(path).slice(0, -extension.length);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(path);
  sourceStats.set(path, await stat(path));
}

const manifest = {};
const nextCache = {};
const results = [];
let cachedCount = 0;
let generatedCount = 0;
let allOutputBytes = 0;
for (const [key, paths] of groups) {
  paths.sort((a, b) => extensionPriority[extname(a).toLowerCase()] - extensionPriority[extname(b).toLowerCase()]);
  const sourcePath = paths[0];
  const input = await readFile(sourcePath);
  const digest = createHash("sha256").update(settingsKey).update(input).digest("hex");
  const cached = oldCache[key];
  let item;
  if (cached?.digest === digest && cached.files?.length) {
    let valid = true;
    for (const file of cached.files) {
      if (!await existsWithSize(join(assetDirectory, file.path), file.bytes)) {
        valid = false;
        break;
      }
    }
    if (valid) {
      item = cached;
      cachedCount += 1;
    }
  }
  if (!item) {
    const metadata = await sharp(input).metadata();
    const dimensions = metadata.autoOrient ?? metadata;
    const originalWidth = dimensions.width;
    const originalHeight = dimensions.height;
    if (!originalWidth || !originalHeight) throw new Error(`Missing dimensions: ${sourcePath}`);
    const preserveDimensions = key.startsWith("visual/sidebar-character/");
    const width = preserveDimensions ? originalWidth : Math.min(originalWidth, settings.maxWidth);
    const widths = preserveDimensions ? [] : settings.responsiveWidths.filter(candidate => candidate < width);
    widths.push(width);
    const files = [];
    for (const targetWidth of widths) {
      const suffix = targetWidth === width ? "" : `-${targetWidth}`;
      const targetPath = join(outputDirectory, `${key}${suffix}.webp`);
      await mkdir(dirname(targetPath), { recursive: true });
      const temporaryPath = `${targetPath}.tmp`;
      try {
        const info = await sharp(input)
          .rotate()
          .resize({ width: targetWidth, withoutEnlargement: true })
          .webp({ quality: settings.quality, alphaQuality: settings.alphaQuality, effort: settings.effort })
          .toFile(temporaryPath);
        await rename(temporaryPath, targetPath);
        files.push({ path: assetPath(targetPath), width: info.width, height: info.height, bytes: info.size });
      } catch (error) {
        await unlink(temporaryPath).catch(() => {});
        throw error;
      }
    }
    const full = files.at(-1);
    item = {
      digest,
      source: urlFor(sourcePath),
      originalWidth,
      originalHeight,
      files,
      src: `/assets/${full.path}`,
      width: full.width,
      height: full.height,
      srcSet: files.map(file => `/assets/${file.path} ${file.width}w`).join(", "),
      optimizedBytes: full.bytes,
    };
    generatedCount += 1;
  }
  nextCache[key] = item;
  allOutputBytes += item.files.reduce((total, file) => total + file.bytes, 0);
  for (const path of paths) {
    manifest[urlFor(path)] = {
      src: item.src,
      width: item.width,
      height: item.height,
      srcSet: item.srcSet,
      originalBytes: sourceStats.get(path).size,
      optimizedBytes: item.optimizedBytes,
    };
  }
  results.push({ source: item.source, originalBytes: sourceStats.get(sourcePath).size, optimizedBytes: item.optimizedBytes, width: item.width, height: item.height });
  const completed = cachedCount + generatedCount;
  if (completed % 20 === 0 || completed === groups.size) {
    console.log(`Optimized ${completed}/${groups.size} images (${cachedCount} cached).`);
  }
}

await writeJson(manifestPath, Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b, "en"))));
await writeJson(cachePath, nextCache);
const sourceBytes = [...sourceStats.values()].reduce((total, info) => total + info.size, 0);
const canonicalBytes = results.reduce((total, item) => total + item.originalBytes, 0);
const optimizedBytes = results.reduce((total, item) => total + item.optimizedBytes, 0);
console.log(`\n${sourcePaths.length} source URLs → ${results.length} unique optimized images.`);
console.log(`All source files: ${mib(sourceBytes)}; preferred originals: ${mib(canonicalBytes)}.`);
console.log(`Optimized main images: ${mib(optimizedBytes)} (${(100 * (1 - optimizedBytes / canonicalBytes)).toFixed(1)}% smaller than preferred originals).`);
console.log(`All responsive outputs: ${mib(allOutputBytes)}. Generated: ${generatedCount}; cached: ${cachedCount}.`);
console.log("Largest optimized images:");
for (const item of results.sort((a, b) => b.optimizedBytes - a.optimizedBytes).slice(0, 8)) {
  console.log(`  ${item.source}: ${mib(item.originalBytes)} → ${mib(item.optimizedBytes)} (${item.width}×${item.height})`);
}
