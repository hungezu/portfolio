import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Physical crops: the published page never requests the unsafe full boards.
// No source pixels are redrawn, numbers replaced, or missing edges invented.
const root = new URL('../', import.meta.url);
const output = new URL('assets/projects/legacy-evidence-20261124/', root);
const sourceDirectory = process.argv[2];
if (!sourceDirectory) throw new Error('Usage: node scripts/generate-legacy-safe-evidence.mjs <private original projects directory>');
const crops = [
  ['tax-card-selection', 'tax-cloud/07-redesign-custom-card.png', 108, 600, 713, 386],
  ['tax-card-layout', 'tax-cloud/07-redesign-custom-card.png', 944, 657, 800, 341],
  ['tax-filter-states', 'tax-cloud/12-form-page.png', 680, 390, 340, 65],
  ['tax-approval-actions', 'tax-cloud/17-app-report-approval.png', 192, 776, 390, 48],
  ['tax-mobile-submit-boundary', 'tax-cloud/17-app-report-approval.png', 715, 506, 390, 91],
  ['energy-task-summary', 'energy-tax/04-tax-filing-workstation.png', 103, 375, 506, 87],
  ['energy-grid', 'energy-tax/06-grid-specification.png', 134, 404, 1660, 650],
];
await mkdir(output, { recursive: true });
for (const [id, source, left, top, width, height] of crops) {
  const input = resolve(sourceDirectory, source);
  const metadata = await sharp(input).metadata();
  if (left < 0 || top < 0 || left + width > metadata.width || top + height > metadata.height) throw new Error(`Out-of-bounds crop: ${id}`);
  await sharp(input).extract({ left, top, width, height }).webp({ lossless: true }).toFile(fileURLToPath(new URL(`${id}.webp`, output)));
  console.log(`${id}.webp ${width}×${height}`);
}
