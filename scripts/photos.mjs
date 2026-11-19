#!/usr/bin/env node
/**
 * pnpm photos — prepare album photos for the web.
 *
 * For every image in public/albums/<class>/ it:
 *   - converts HEIC/HEIF (iPhone) to JPEG (uses macOS `sips`),
 *   - applies the EXIF rotation, resizes to at most 2000px wide,
 *   - strips all metadata (including GPS location),
 *   - recompresses as JPEG (quality 78).
 * Files that are already prepared (<= 2000px, no metadata) are left alone, so
 * it is safe to run repeatedly. Originals are replaced — keep your own copy.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "albums");
const MAX_WIDTH = 2000;
const QUALITY = 78;

if (!fs.existsSync(ROOT)) {
  console.log("No public/albums folder yet.");
  process.exit(0);
}

let converted = 0;
let skipped = 0;

for (const slug of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, slug);
  if (!fs.statSync(dir).isDirectory()) continue;

  for (let file of fs.readdirSync(dir)) {
    let full = path.join(dir, file);
    const ext = path.extname(file).toLowerCase();

    if (ext === ".heic" || ext === ".heif") {
      const jpg = full.slice(0, -ext.length) + ".jpg";
      try {
        execFileSync("sips", ["-s", "format", "jpeg", full, "--out", jpg], { stdio: "ignore" });
      } catch {
        console.warn(`! ${slug}/${file}: HEIC conversion needs macOS (sips). Convert it to JPEG first.`);
        continue;
      }
      fs.rmSync(full);
      full = jpg;
      file = path.basename(jpg);
    } else if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      continue;
    }

    const meta = await sharp(full).metadata();
    const isReady =
      (ext === ".jpg" || ext === ".jpeg") &&
      meta.width <= MAX_WIDTH &&
      !meta.exif &&
      !meta.icc &&
      (meta.orientation ?? 1) === 1;
    if (isReady) {
      skipped++;
      continue;
    }

    const out = full.replace(/\.[^.]+$/, ".jpg");
    const buffer = await sharp(full)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(out, buffer);
    if (out !== full) fs.rmSync(full);
    converted++;
    console.log(`✓ ${slug}/${path.basename(out)}  ${Math.round(buffer.length / 1024)} KB`);
  }
}

console.log(`Done: ${converted} prepared, ${skipped} already fine.`);
