/**
 * Breadcrumbs, derived from the navigation tree in `nav.ts`. A crumb carries
 * the item's `crumb` label when it has one, else its menu label. News posts
 * pass their own title in at render time.
 */
import { navTree, type NavItem } from "./nav";

/** `import.meta.env.BASE_URL` without its trailing slash: "" on the real domain. */
export const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

/** `Astro.url.pathname` without the deploy base, so route maps see site paths. */
export function sitePath(pathname: string): string {
  return pathname.startsWith(basePath) ? pathname.slice(basePath.length) || "/" : pathname;
}

const byHref = new Map<string, { item: NavItem; parent?: NavItem }>(
  navTree.map((node) => [node.item.href, node]),
);

export interface Crumb {
  href: string;
  label: string;
}

/**
 * Home → … → the page itself. The trail follows the tree where a page is in
 * it, and otherwise walks the URL one segment at a time. `current` names the
 * last crumb when the tree cannot know it — a news post.
 */
export function breadcrumbsFor(pathname: string, current?: string): Crumb[] {
  const home: Crumb = { href: "/", label: byHref.get("/")!.item.label };
  if (pathname === "/") return [home];

  const trail: Crumb[] = [];
  const seen = new Set<string>();
  let href: string | undefined = pathname;

  while (href && href !== "/" && !seen.has(href)) {
    seen.add(href);
    const node = byHref.get(href);
    const label = node ? (node.item.crumb ?? node.item.label) : href === pathname ? current : undefined;
    if (label) trail.unshift({ href, label });
    href = node?.parent?.href ?? parentSegment(href);
  }

  return [home, ...trail];
}

/** "/sygnalista/zalaczniki/" → "/sygnalista/" */
function parentSegment(href: string): string {
  const segments = href.split("/").filter(Boolean);
  segments.pop();
  return segments.length ? `/${segments.join("/")}/` : "/";
}
