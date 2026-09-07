/** Shared by the two post-build scripts: where the build lives, and a file walker. */
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../../", import.meta.url));
export const DIST = join(root, "dist");

/** Every file under `dir` whose name passes `keep`, depth-first. */
export async function walk(dir, keep, skipDirs = new Set()) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipDirs.has(path)) continue;
      found.push(...(await walk(path, keep, skipDirs)));
    } else if (keep(entry.name)) {
      found.push(path);
    }
  }
  return found;
}
