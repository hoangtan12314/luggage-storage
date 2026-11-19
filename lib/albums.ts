import "server-only";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { ClassTypeSlug } from "@/lib/config";

export type AlbumPhoto = {
  /** Public URL, e.g. "/albums/coffee/01-pouring.jpg". */
  src: string;
  width: number;
  height: number;
  alt: string;
};

const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;
const ALBUMS_DIR = path.join(process.cwd(), "public", "albums");

/**
 * A class's album is just a folder: public/albums/<class-slug>/. Every image in
 * it is shown, in filename order (name them 01-…, 02-… to control the order).
 * An optional captions.json maps a filename to its alt text:
 *   { "01-pouring.jpg": "Pouring water over the coffee filter" }
 *
 * Read at build time (the class pages are statically generated); the width and
 * height come from the files so mixed portrait/landscape photos lay out
 * without a config entry. Returns [] when the folder is missing or empty.
 */
export async function getAlbum(slug: ClassTypeSlug, fallbackAlt: string): Promise<AlbumPhoto[]> {
  const dir = path.join(ALBUMS_DIR, slug);
  if (!fs.existsSync(dir)) return [];

  let captions: Record<string, string> = {};
  try {
    captions = JSON.parse(fs.readFileSync(path.join(dir, "captions.json"), "utf8"));
  } catch {
    // no (or invalid) captions file — use the default alt text
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

  const photos = await Promise.all(
    files.map(async (file, i): Promise<AlbumPhoto | null> => {
      try {
        // .rotate() semantics: EXIF orientations 5–8 swap width and height.
        const meta = await sharp(path.join(dir, file)).metadata();
        const swap = (meta.orientation ?? 1) >= 5;
        const width = swap ? meta.height : meta.width;
        const height = swap ? meta.width : meta.height;
        if (!width || !height) return null;
        return {
          src: `/albums/${slug}/${encodeURIComponent(file)}`,
          width,
          height,
          alt: captions[file] ?? `${fallbackAlt} — photo ${i + 1}`,
        };
      } catch {
        return null; // unreadable file: skip it rather than fail the page
      }
    })
  );
  return photos.filter((p): p is AlbumPhoto => p !== null);
}
