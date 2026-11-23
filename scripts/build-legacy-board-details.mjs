import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const layouts = JSON.parse(await readFile(
  new URL("../app/case-studies/legacy-board-layouts.json", import.meta.url), "utf8",
));

for (const [board, regions] of Object.entries(layouts)) {
  const source = resolve("assets/projects", board + ".png");
  const output = resolve("assets/projects/legacy-board-details", board);
  const { width, height } = await sharp(source).metadata();
  await mkdir(output, { recursive: true });

  for (const { id, box: [left, top, regionWidth, regionHeight] } of regions) {
    if (left < 0 || top < 0 || regionWidth <= 0 || regionHeight <= 0 ||
        left + regionWidth > width || top + regionHeight > height) {
      throw new Error(`Invalid region ${board}/${id}`);
    }
    const { size } = await sharp(source)
      .extract({ left, top, width: regionWidth, height: regionHeight })
      .webp({ lossless: true, effort: 4 })
      .toFile(resolve(output, id + ".webp"));
    console.log(`${board}/${id} · ${regionWidth}×${regionHeight} · ${Math.round(size / 1024)} KiB`);
  }
}
