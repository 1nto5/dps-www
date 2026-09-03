#!/usr/bin/env node
/**
 * Build-time guard for the photos in src/assets/media/.
 *
 * The sibling check-download-links.mjs does this for public/dokumenty/pliki/,
 * and images need it for the same reason: when a page swaps one scan for a
 * better one, the old file stays in the repo forever, and nothing ever says
 * so. Unlike the downloads it cannot be answered from the built HTML — Astro
 * renames and re-encodes every processed image — so this reads the sources
 * instead and asserts that every file in the folder is named somewhere under
 * src/.
 *
 * Only orphans are reported. The other direction — a reference to a file that
 * is not there — is already a hard error: `astro build` cannot resolve the
 * import.
 *
 * Run by `bun run build` after `astro build`. Exits 1 if anything is orphaned.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const SRC = new URL("../src/", import.meta.url).pathname;
const MEDIA = new URL("../src/assets/media/", import.meta.url).pathname;

/** Directories whose contents are the assets themselves, not references to them. */
const SKIP = new Set(["assets"]);

/** Every text source under src/, depth-first, minus src/assets. */
async function sourceFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (dir === SRC.replace(/\/$/, "") && SKIP.has(entry.name)) continue;
      out.push(...(await sourceFiles(path)));
    } else if (/\.(astro|ts|tsx|js|mjs|md|mdx|json|css)$/.test(entry.name)) {
      out.push(path);
    }
  }
  return out;
}

const onDisk = (await readdir(MEDIA, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name !== ".DS_Store")
  .map((entry) => entry.name);

const sources = await Promise.all(
  (await sourceFiles(SRC.replace(/\/$/, ""))).map((file) => readFile(file, "utf8")),
);
const haystack = sources.join("\n");

const orphaned = onDisk.filter((name) => !haystack.includes(name)).sort();

if (orphaned.length) {
  console.error("Media: src/assets/media/ holds files no page imports");
  for (const name of orphaned) console.error(`  orphaned: src/assets/media/${name}`);
  console.error("  Delete them, or import them from the page that should show them.");
  process.exit(1);
}

console.log(`Media: ${onDisk.length} image(s) checked, ${orphaned.length} orphaned.`);
