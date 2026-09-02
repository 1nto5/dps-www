#!/usr/bin/env node
/**
 * Build-time guard for the downloads in public/dokumenty/pliki/.
 *
 * Nothing links those files to the pages that offer them: a renamed PDF leaves
 * a dead download link, and a replaced one leaves the old file shipping to
 * visitors forever. This walks the built HTML and asserts set equality — every
 * linked file exists, and every file on disk is linked from at least one page.
 *
 * Run by `bun run build` after `astro build`. Exits 1 if either side differs,
 * after listing every missing and every orphaned file it found.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const DIST = new URL("../dist/", import.meta.url).pathname;
const DOWNLOADS = new URL("../public/dokumenty/pliki/", import.meta.url).pathname;
const PREFIX = "/dokumenty/pliki/";

/** Every *.html under dist/, depth-first. */
async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith(".html")) out.push(path);
  }
  return out;
}

/**
 * The file names of every <a href="/dokumenty/pliki/..."> in one page, with
 * the URI escaping (spaces, diacritics) undone so they compare to real names.
 */
function downloadHrefs(html) {
  const names = [];
  for (const m of html.matchAll(/href\s*=\s*"([^"]+)"/gi)) {
    if (!m[1].startsWith(PREFIX)) continue;
    const name = m[1].slice(PREFIX.length).split(/[?#]/)[0];
    if (!name) continue;
    try {
      names.push(decodeURIComponent(name));
    } catch {
      names.push(name);
    }
  }
  return names;
}

const onDisk = new Set(
  (await readdir(DOWNLOADS, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name !== ".DS_Store")
    .map((entry) => entry.name),
);

let links = 0;
const linked = new Set();
const missing = [];

for (const file of await htmlFiles(DIST)) {
  const html = await readFile(file, "utf8");
  for (const name of downloadHrefs(html)) {
    links += 1;
    linked.add(name);
    if (!onDisk.has(name)) missing.push(`${relative(process.cwd(), file)}: missing ${PREFIX}${name}`);
  }
}

const orphaned = [...onDisk].filter((name) => !linked.has(name)).sort();

if (missing.length || orphaned.length) {
  console.error("Download links: public/dokumenty/pliki/ does not match the links on the site");
  for (const line of missing) console.error(`  ${line}`);
  for (const name of orphaned) console.error(`  orphaned: ${PREFIX}${name} (no page links to it)`);
  process.exit(1);
}

console.log(
  `Download links: ${links} link(s) checked, ${missing.length} missing, ${orphaned.length} orphaned.`,
);
