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
import { readFile, writeFile } from "node:fs/promises";
import { DIST, walk } from "./lib/fs.mjs";

const files = await walk(DIST, (name) => name === "index.html");
const htmls = await Promise.all(files.map((file) => readFile(file, "utf8")));
const writes = [];

for (const [i, html] of htmls.entries()) {
  const file = files[i];

  // A redirect stub: no <html> element yet, and a meta refresh in it.
  if (html.includes("<html") || !html.includes('http-equiv="refresh"')) continue;

  const bodyStart = html.indexOf("<body");
  if (bodyStart === -1) continue; // not the shape we expect — leave it alone

  const head = html.slice("<!doctype html>".length, bodyStart);
  const body = html.slice(bodyStart);

  const fixedHtml = `<!doctype html><html lang="pl"><head><meta charset="utf-8">${head}</head>${body}</html>`;
  writes.push(writeFile(file, fixedHtml));
}
await Promise.all(writes);

console.log(`Redirects: ${writes.length} page(s) wrapped in a proper <html lang="pl">.`);
