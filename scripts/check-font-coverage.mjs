#!/usr/bin/env node
/**
 * Build-time guard for the subset web fonts.
 *
 * `scripts/subset-fonts.sh` cuts both families down to the characters the site
 * uses, which is what takes them from 215 KB to 70 KB — and which also means a
 * single new character in the content (a name with a diacritic outside Polish,
 * an arrow, a different dash) would silently render from a fallback font. This
 * walks the built HTML and asserts that every character on every page exists in
 * both subsets.
 *
 * It reads `src/assets/fonts/coverage.json`, written by the subsetting script
 * and committed alongside the fonts, rather than opening the woff2 files. That
 * keeps this check plain Node with no dependencies: CI runs `bun run build` on
 * a bare Ubuntu image and needs neither `uv` nor a font parser.
 *
 * Run by `bun run build` after `astro build`. Exits 1 listing every missing
 * character with an example page.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const COVERAGE = join(ROOT, "src/assets/fonts/coverage.json");

/** Every .html under dist/, depth-first. */
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
 * The named entities Astro's HTML output can contain. Anything else is left as
 * written: an unknown entity is only ASCII letters, which every subset covers,
 * so it can never hide a missing glyph.
 */
const NAMED = {
  amp: "&",
  apos: "'",
  copy: "©",
  deg: "°",
  euro: "€",
  gt: ">",
  hellip: "…",
  laquo: "«",
  lt: "<",
  mdash: "—",
  middot: "·",
  nbsp: " ",
  ndash: "–",
  quot: '"',
  raquo: "»",
  sect: "§",
  shy: "­",
  times: "×",
};

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (whole, name) => NAMED[name.toLowerCase()] ?? whole);
}

/**
 * Every character a reader can see on the page: text nodes, plus the
 * attributes a browser renders as text of their own. Script and style bodies
 * are dropped — JSON-LD and the choreography script are never drawn.
 */
function visibleText(html) {
  const body = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const chunks = [];
  for (const match of body.matchAll(/\s(?:alt|title|aria-label)\s*=\s*"([^"]*)"/gi)) {
    chunks.push(match[1]);
  }
  chunks.push(body.replace(/<[^>]*>/g, " "));
  return chunks.map(decodeEntities);
}

/** Tab, newline and carriage return are layout, not glyphs. */
const IGNORED = new Set([0x09, 0x0a, 0x0d]);

function format(codePoint) {
  const hex = codePoint.toString(16).toUpperCase().padStart(4, "0");
  const printable = codePoint > 0x20 && codePoint !== 0xa0 && codePoint !== 0xad;
  return printable ? `"${String.fromCodePoint(codePoint)}" (U+${hex})` : `U+${hex}`;
}

const { fonts } = JSON.parse(await readFile(COVERAGE, "utf8"));
const covered = Object.fromEntries(
  Object.entries(fonts).map(([file, codePoints]) => [file, new Set(codePoints)]),
);

/** code point -> first page it was seen on. */
const used = new Map();
const files = await htmlFiles(DIST);
for (const file of files) {
  for (const chunk of visibleText(await readFile(file, "utf8"))) {
    for (const char of chunk) {
      const codePoint = char.codePointAt(0);
      if (IGNORED.has(codePoint) || used.has(codePoint)) continue;
      used.set(codePoint, file);
    }
  }
}

const failures = [];
for (const [codePoint, file] of [...used].sort((a, b) => a[0] - b[0])) {
  const missing = Object.keys(covered).filter((font) => !covered[font].has(codePoint));
  if (missing.length) failures.push({ codePoint, file, missing });
}

if (failures.length) {
  console.error(`Font coverage: ${failures.length} character(s) missing from the subsets.\n`);
  for (const { codePoint, file, missing } of failures) {
    console.error(`  ${format(codePoint)} on /${relative(DIST, file)}`);
    console.error(`      missing from: ${missing.join(", ")}`);
  }
  console.error(
    "\nAdd the character to UNICODES in scripts/subset-fonts.sh and re-run `bun run fonts`.",
  );
  process.exit(1);
}

console.log(
  `Font coverage: ${files.length} page(s) checked, ${used.size} character(s), all covered.`,
);
