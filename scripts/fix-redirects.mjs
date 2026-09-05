#!/usr/bin/env node
/**
 * Astro's `redirects` config (see astro.config.mjs) emits bare meta-refresh
 * stubs: a doctype followed straight by <title>, <meta refresh>, <meta
 * robots> and <link canonical> — no <html> element and no charset. That is
 * invalid HTML and ships with no declared language, which trips up screen
 * readers and validators alike.
 *
 * This runs after `astro build` and rewrites every such stub in dist/ into a
 * real document — `<!doctype html><html lang="pl"><head><meta charset="utf-8">`
 * around the same head tags — without touching the redirect itself (the meta
 * refresh, the title and the canonical link are carried over unchanged). Any
 * page that already has an <html> tag (i.e. every normal Astro page) is left
 * alone, so running this twice is harmless.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const DIST = join(root, "dist");

async function walk(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(path)));
    else if (entry.name === "index.html") found.push(path);
  }
  return found;
}

let fixed = 0;
for (const file of await walk(DIST)) {
  const html = await readFile(file, "utf8");

  // A redirect stub: no <html> element yet, and a meta refresh in it.
  if (html.includes("<html") || !html.includes('http-equiv="refresh"')) continue;

  const bodyStart = html.indexOf("<body");
  if (bodyStart === -1) continue; // not the shape we expect — leave it alone

  const head = html.slice("<!doctype html>".length, bodyStart);
  const body = html.slice(bodyStart);

  const fixedHtml = `<!doctype html><html lang="pl"><head><meta charset="utf-8">${head}</head>${body}</html>`;
  await writeFile(file, fixedHtml);
  fixed += 1;
}

console.log(`Redirects: ${fixed} page(s) wrapped in a proper <html lang="pl">.`);
