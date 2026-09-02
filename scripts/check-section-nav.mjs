#!/usr/bin/env node
/**
 * Build-time guard for SectionNav.
 *
 * The component takes an explicit {id, label}[] array, so its ids drift from
 * the real headings the moment a section is renamed or removed — that is the
 * component's whole failure mode. This walks the built HTML and asserts that
 * every "#id" a SectionNav links to exists as an id on the same page.
 *
 * Run by `bun run build` after `astro build`. Exits 1 on the first page with
 * a broken target, after listing every failure it found.
 */
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const DIST = new URL("../dist/", import.meta.url).pathname;

/** Every index.html under dist/, depth-first. */
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
 * The fragment targets of every <a href="#..."> inside a
 * <nav ... data-section-nav> ... </nav>. Nav elements do not nest, so
 * matching to the next </nav> is exact.
 */
function navTargets(html) {
  const targets = [];
  const navStart = /<nav\b[^>]*\bdata-section-nav\b[^>]*>/gi;
  let open;
  while ((open = navStart.exec(html)) !== null) {
    const from = open.index + open[0].length;
    const end = html.indexOf("</nav>", from);
    const block = html.slice(from, end === -1 ? html.length : end);
    for (const href of block.matchAll(/href\s*=\s*"#([^"]+)"/gi)) {
      targets.push(decodeURIComponent(href[1]));
    }
  }
  return targets;
}

function pageIds(html) {
  const ids = new Set();
  for (const m of html.matchAll(/\sid\s*=\s*"([^"]+)"/gi)) ids.add(m[1]);
  return ids;
}

let checked = 0;
const failures = [];

for (const file of await htmlFiles(DIST)) {
  const html = await readFile(file, "utf8");
  if (!html.includes("data-section-nav")) continue;
  checked += 1;
  const ids = pageIds(html);
  for (const target of navTargets(html)) {
    if (!ids.has(target)) failures.push(`${relative(process.cwd(), file)}: missing #${target}`);
  }
}

if (failures.length) {
  console.error("SectionNav: broken anchor targets");
  for (const line of failures) console.error(`  ${line}`);
  process.exit(1);
}

console.log(`SectionNav: ${checked} page(s) checked, 0 failures.`);
