import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, extname, relative, resolve } from "node:path";
import ts from "typescript";

// Static artifact integrity only. Rendering, focus, gestures, contrast, and
// application behavior require browser evidence; this script cannot pass them.
const root = process.cwd();
const prepared = process.argv.includes("--prepared");
const artifactRoot = prepared ? resolve(root, "gh-pages-dist") : root;
const sourceFiles = [
  "app/case-studies/ZhaocaiSmartCompleteCase.tsx",
  "app/case-studies/GkxCase.tsx",
  "app/case-studies/GkxSupplementalMaterials.tsx",
  "app/case-studies/NationalSciencePlatformCase.tsx",
];
const findings = [];
const references = [];
const imageRatios = [];
const locatorCoverage = [];
const visited = new Set();
const fingerprints = {};
const snapshots = new Map();
const assetPattern = /\.(?:png|jpe?g|webp|gif|svg|avif|html|css|m?js|woff2?|ttf|otf|pdf)(?:[?#].*)?$/i;
const exists = async path => { try { return (await stat(path)).isFile(); } catch { return false; } };

function localPath(url, owner) {
  const clean = decodeURIComponent(url.split(/[?#]/)[0]);
  if (!clean || /^(?:[a-z]+:|\/\/|#)/i.test(clean)) return null;
  if (clean.startsWith("/portfolio/")) return resolve(artifactRoot, clean.slice(11));
  if (clean.startsWith("/")) return resolve(artifactRoot, clean.slice(1));
  return resolve(dirname(owner), clean);
}

async function reference(url, owner, line, kind) {
  if (!assetPattern.test(url)) return;
  const target = localPath(url, owner);
  if (!target) return;
  const present = await exists(target);
  const record = { owner: relative(root, owner).replaceAll("\\", "/"), line, url, kind, present };
  references.push(record);
  if (!present) findings.push({ status: "Fail", check: "local-resource", ...record });
  if (present && [".html", ".css", ".js", ".mjs"].includes(extname(target))) await inspectTextAsset(target);
}

async function inspectTextAsset(path) {
  if (visited.has(path)) return;
  visited.add(path);
  const text = await readFile(path, "utf8");
  const tokens = [];
  if (extname(path) === ".html") {
    for (const match of text.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g)) tokens.push(match);
  } else if (extname(path) === ".css") {
    for (const match of text.matchAll(/url\(\s*["']?([^\s)'";]+)["']?\s*\)/g)) tokens.push(match);
  } else {
    // JS assets often keep runtime image URLs in string tables.
    for (const match of text.matchAll(/["']((?:\.?\.?\/|\/assets\/)[^"']+\.(?:png|jpe?g|webp|svg|html|css|js|woff2?)(?:[?#][^"']*)?)["']/g)) tokens.push(match);
  }
  for (const match of tokens) await reference(match[1], path, text.slice(0, match.index).split("\n").length, "asset-reference");
}

function unwrap(node) {
  while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node))) node = node.expression;
  return node;
}

function staticValue(node, constants, seen = new Set()) {
  node = unwrap(node);
  if (!node) return undefined;
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isIdentifier(node) && constants.has(node.text) && !seen.has(node.text)) return staticValue(constants.get(node.text), constants, new Set([...seen, node.text]));
  if (ts.isTemplateExpression(node)) {
    let text = node.head.text;
    for (const span of node.templateSpans) {
      const value = staticValue(span.expression, constants, seen);
      if (value === undefined) return undefined;
      text += value + span.literal.text;
    }
    return text;
  }
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(item => staticValue(item, constants, seen));
  if (ts.isObjectLiteralExpression(node)) {
    const entries = node.properties.filter(ts.isPropertyAssignment).map(property => [property.name.getText().replace(/^['"]|['"]$/g, ""), staticValue(property.initializer, constants, seen)]);
    return Object.fromEntries(entries);
  }
  if (ts.isPropertyAccessExpression(node)) return staticValue(node.expression, constants, seen)?.[node.name.text];
  return undefined;
}

function dimensions(buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset++; continue; }
    const marker = buffer[offset + 1];
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2) break;
    offset += length + 2;
  }
  return null;
}

for (const file of sourceFiles) {
  const path = resolve(root, file);
  const text = await readFile(path, "utf8");
  const tree = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const constants = new Map();
  const ids = new Set();
  const anchors = [];
  const assets = [];
  fingerprints[file] = createHash("sha256").update(text).digest("hex");
  const visit = node => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) constants.set(node.name.text, node.initializer);
    if (ts.isJsxAttribute(node) && node.initializer) {
      const value = ts.isJsxExpression(node.initializer) ? staticValue(node.initializer.expression, constants) : staticValue(node.initializer, constants);
      const line = tree.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      if (node.name.text === "id" && typeof value === "string") ids.add(value);
      if (node.name.text === "href" && typeof value === "string" && value.startsWith("#")) anchors.push({ target: value.slice(1), line });
    }
    if (ts.isObjectLiteralExpression(node)) {
      const value = staticValue(node, constants);
      if (typeof value?.src === "string" && value.width && value.height) assets.push(value);
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  const collect = async node => {
    const value = staticValue(node, constants);
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "publicAsset") {
      const path = staticValue(node.arguments[0], constants);
      if (typeof path === "string" && path.startsWith("/portfolio/")) findings.push({ status: "Fail", check: "duplicated-base-path", file, line: tree.getLineAndCharacterOfPosition(node.getStart()).line + 1, path, reason: "publicAsset adds the deployed /portfolio base to an already based URL." });
    }
    if ((ts.isStringLiteralLike(node) || ts.isTemplateExpression(node)) && typeof value === "string" && /^\/(?:portfolio\/)?(?:assets|fonts)\//.test(value)) {
      await reference(value, path, tree.getLineAndCharacterOfPosition(node.getStart()).line + 1, "source-reference");
    }
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text.endsWith(".css")) await reference(node.moduleSpecifier.text, path, tree.getLineAndCharacterOfPosition(node.getStart()).line + 1, "style-import");
    for (const child of node.getChildren(tree)) await collect(child);
  };
  await collect(tree);
  for (const asset of assets) {
    const target = localPath(asset.src, path);
    if (!target || !await exists(target)) continue;
    const actual = dimensions(await readFile(target));
    imageRatios.push({ file, src: asset.src, declared: { width: asset.width, height: asset.height }, actual, status: actual ? Math.abs((asset.width / asset.height) / (actual.width / actual.height) - 1) <= 0.01 ? "Pass" : "Fail" : "Unverified" });
    if (actual && Math.abs((asset.width / asset.height) / (actual.width / actual.height) - 1) > 0.01) findings.push({ status: "Fail", check: "image-aspect-ratio", file, src: asset.src, declared: { width: asset.width, height: asset.height }, actual });
  }
  for (const name of ["locatorSections", "sections", "systemsSections", "designSystemSections"]) {
    const items = staticValue(constants.get(name), constants);
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (!Array.isArray(item) || item.length !== 2 || typeof item[0] !== "string") continue;
      const present = ids.has(item[0]);
      locatorCoverage.push({ file, locator: name, target: item[0], label: item[1], status: present ? "Pass" : "Unverified" });
      if (!present) findings.push({ status: "Unverified", check: "locator-target", file, locator: name, target: item[0], reason: "Target may be emitted by a child component; confirm in active route DOM." });
    }
  }
  for (const anchor of anchors) if (!ids.has(anchor.target)) findings.push({ status: "Unverified", check: "local-anchor", file, ...anchor, reason: "Target may be emitted by a child component or conditional view; confirm in DOM." });
  snapshots.set(file, { tree, text, constants, ids });
}

const zhaocai = snapshots.get(sourceFiles[0]);
const fixture = staticValue(zhaocai.constants.get("profitData"), zhaocai.constants);
const total = fixture?.reduce((sum, row) => sum + row.value, 0);
const literalTotals = [...zhaocai.text.matchAll(/(?:净利润合计|全年净利润合计)\s*(\d+\.\d+)\s*亿元/g)].map(match => Number(match[1]));
if (!Array.isArray(fixture) || !Number.isFinite(total)) findings.push({ status: "Unverified", check: "quarter-fixture", reason: "Fixture could not be statically resolved." });
else for (const value of literalTotals) if (Math.abs(total - value) > 0.005) findings.push({ status: "Fail", check: "quarter-fixture-total", total, literalTotal: value });

let specFixture;
const specDataPath = localPath("/assets/projects/zhaocai-smart/long-image/zhaocai-smart-04-data.js", resolve(root, sourceFiles[0]));
if (await exists(specDataPath)) {
  const text = await readFile(specDataPath, "utf8");
  const start = text.indexOf("const data=");
  const end = text.lastIndexOf(";root.ZMD_DATA=");
  if (start >= 0 && end > start) {
    const data = JSON.parse(text.slice(start + 11, end));
    const datasets = data.datasets;
    const unit = Number(datasets?.storageUnit?.match(/^[\d.]+/)?.[0]);
    specFixture = { storageUnit: datasets?.storageUnit, quarters: datasets?.quarterly?.map(row => ({ quarter: row.quarter, value: row.netProfit * unit })), sceneCount: data.scenes.length, ruleCount: data.rules.length };
    for (let index = 0; index < (Array.isArray(fixture) ? fixture.length : 0); index++) {
      const embedded = specFixture.quarters?.[index];
      if (!embedded || embedded.quarter !== fixture[index].quarter || Math.abs(embedded.value - fixture[index].value) > 0.00001) findings.push({ status: "Fail", check: "embedded-quarter-fixture", index, main: fixture[index], embedded });
    }
    for (const [name, rows] of Object.entries(datasets)) {
      if (!Array.isArray(rows)) continue;
      const datasetTotal = rows.reduce((sum, row) => sum + row.netProfit * unit, 0);
      if (Math.abs(datasetTotal - total) > 0.005) findings.push({ status: "Fail", check: "embedded-dataset-total", name, mainTotal: total, datasetTotal });
    }
  } else findings.push({ status: "Unverified", check: "embedded-quarter-fixture", reason: "Embedded dataset serialization changed; inspect its current data source." });
}

const copyPath = resolve(root, "app/case-studies/gkx-public-copy.json");
const copyText = await readFile(copyPath, "utf8");
const copy = JSON.parse(copyText);
fingerprints[relative(root, copyPath).replaceAll("\\", "/")] = createHash("sha256").update(copyText).digest("hex");
const gkx = snapshots.get(sourceFiles[1]);
for (const item of copy.navigation) {
  const literal = gkx.ids.has(item.id);
  const sectionIndex = copy.sections.findIndex(section => section.id === item.id);
  const variable = ["overviewCopy", "strategyCopy", "rulesCopy", "prototypeCopy", "supplierCopy", "outcomesCopy"][sectionIndex];
  const bound = variable && gkx.text.includes(`id={${variable}.id}`);
  locatorCoverage.push({ file: sourceFiles[1], locator: "copy.navigation", target: item.id, label: item.label, status: literal || bound ? "Pass" : "Fail" });
  if (!literal && !bound) findings.push({ status: "Fail", check: "gkx-navigation", id: item.id, label: item.label });
}

if (prepared) for (const route of ["index.html", "project/zhaocai-smart/index.html", "project/gkx/index.html", "project/gkx/systems/index.html", "project/gkx/design-system/index.html"]) {
  const path = resolve(artifactRoot, route);
  if (!await exists(path)) findings.push({ status: "Fail", check: "prepared-route", route });
  else await inspectTextAsset(path);
}

const uniqueReferences = [...new Map(references.map(item => [`${item.owner}:${item.url}`, item])).values()];
const report = {
  method: "Static artifact reference and data integrity inspection; no browser claims.",
  artifactRoot: relative(root, artifactRoot) || ".",
  fingerprints,
  resourceCount: uniqueReferences.length,
  missingResourceCount: uniqueReferences.filter(item => !item.present).length,
  fixture: { quarters: fixture, annualTotal: Number(total?.toFixed(2)), unit: "亿元", literalTotals },
  specFixture,
  imageRatios,
  locatorCoverage,
  findings,
  references: uniqueReferences,
  browserChecks: { status: "Unverified", checks: ["DOM anchor coverage", "image load and displayed proportions", "computed contrast and text size", "overflow at all approved breakpoints", "keyboard focus and modal return", "interaction state recovery", "console errors", "iframe content behavior"] },
};
console.log(JSON.stringify(report, null, 2));
process.exitCode = findings.some(item => item.status === "Fail") ? 1 : 0;
