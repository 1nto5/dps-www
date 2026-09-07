#!/usr/bin/env node
/**
 * The one build check. It runs after `astro build` and fails the build on four
 * things nothing else on the site notices:
 *
 *   1. an internal href/src in the built HTML that resolves to nothing,
 *   2. a link to a download that is not in public/dokumenty/pliki/,
 *   3. a file in public/dokumenty/pliki/ that no page links to,
 *   4. an image in src/assets/media/ that no page uses.
 *
 * The first three read dist/. The fourth cannot: Astro renames and re-encodes
 * every processed image, so it reads the sources instead and asks whether each
 * file name is written anywhere under src/ — a markdown post that shows a photo
 * counts, because its `.md` is read too.
 *
 * SKIP_ORPHANS=1 turns the orphan checks off. It exists for a half-built site,
 * where most pages are still placeholders; it is never set in CI.
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { root, DIST, walk } from "./lib/fs.mjs";

const SRC = join(root, "src");
const MEDIA = join(SRC, "assets", "media");
const DOWNLOADS = join(root, "public", "dokumenty", "pliki");
const DOWNLOAD_PREFIX = "/dokumenty/pliki/";

/** The build's base path, without a trailing slash: "" on the real domain. */
const BASE = (process.env.BASE ?? "").replace(/\/+$/, "");
const SKIP_ORPHANS = process.env.SKIP_ORPHANS === "1";

const problems = [];

/** Every href="…" and src="…" in one page, unescaped. */
function urls(html) {
  const found = [];
  for (const match of html.matchAll(/\b(?:href|src)\s*=\s*"([^"]*)"/gi)) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      found.push(decodeURIComponent(raw));
    } catch {
      found.push(raw);
    }
  }
  return found;
}

/** Addresses that leave the site, or never were one. */
function isExternal(url) {
  return (
    url.startsWith("#") ||
    url.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(url)
  );
}

/** "/kontakt/?a=1#b" → "/kontakt/", with the build's base taken off. */
function toPath(url) {
  const path = url.split(/[?#]/)[0];
  if (!path.startsWith("/")) return null; // a relative link; the build resolved it
  if (BASE && path === BASE) return "/";
  if (BASE && path.startsWith(`${BASE}/`)) return path.slice(BASE.length);
  return path;
}

if (!existsSync(DIST)) {
  console.error("Links: dist/ is not there. Run `astro build` first.");
  process.exit(1);
}

// --- 1 and 2: every internal address in the built HTML resolves ------------
// One walk of dist/: the pages to read, and every built file as a site path
// ("/kontakt/index.html"), so a link is checked with a lookup, not a stat.
const built = new Set(
  (await walk(DIST, () => true)).map((file) => "/" + relative(DIST, file).split(sep).join("/")),
);
const pages = [...built].filter((path) => path.endsWith(".html")).map((path) => join(DIST, path));
const htmls = await Promise.all(pages.map((page) => readFile(page, "utf8")));
const downloadsOnDisk = new Set(
  (await readdir(DOWNLOADS, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name),
);
const downloadsLinked = new Set();
let checked = 0;

for (const [i, html] of htmls.entries()) {
  const where = relative(root, pages[i]);

  for (const url of urls(html)) {
    if (isExternal(url)) continue;
    const path = toPath(url);
    if (path === null) continue;
    checked += 1;

    if (path.startsWith(DOWNLOAD_PREFIX)) {
      const name = path.slice(DOWNLOAD_PREFIX.length);
      if (!name) continue;
      downloadsLinked.add(name);
      if (!downloadsOnDisk.has(name)) {
        problems.push(`${where}: link to a document that is not there — ${path}`);
      }
      continue;
    }

    const ok = path.endsWith("/")
      ? built.has(`${path}index.html`)
      : built.has(path) || built.has(`${path}/index.html`);
    if (!ok) problems.push(`${where}: broken link — ${path}`);
  }
}

// --- 3: nothing ships that no page offers ----------------------------------
if (!SKIP_ORPHANS) {
  for (const name of [...downloadsOnDisk].sort()) {
    if (!downloadsLinked.has(name)) {
      problems.push(`orphan download: public${DOWNLOAD_PREFIX}${name} — no page links to it`);
    }
  }
}

// --- 4: nothing sits in src/assets/media/ that no page uses ----------------
if (!SKIP_ORPHANS) {
  const sources = await walk(SRC, (name) => /\.(astro|ts|tsx|js|mjs|md|mdx|json|css)$/.test(name), new Set([join(SRC, "assets")]));
  const haystack = (await Promise.all(sources.map((file) => readFile(file, "utf8")))).join("\n");
  const images = (await readdir(MEDIA, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
  // Every image-looking file name written anywhere under src/, in one pass.
  const named = new Set(haystack.match(/[\w.-]+\.(?:jpe?g|png|webp|avif|gif|svg)\b/gi) ?? []);
  for (const name of images) {
    if (!named.has(name)) {
      problems.push(`orphan image: src/assets/media/${name} — no page imports it`);
    }
  }
}

if (problems.length) {
  console.error(`Links: ${problems.length} problem(s).`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(
  `Links: ${checked} address(es) on ${pages.length} page(s) checked${SKIP_ORPHANS ? ", orphan checks skipped" : ""}.`,
);
