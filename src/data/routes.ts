/**
 * Route → breadcrumb label, one line per URL the site builds. Short, nav-style
 * names, because a crumb is read in a row of other crumbs. News posts pass their
 * own title in at render time.
 */

export const routeLabels: Record<string, string> = {
  "/": "Strona główna",

  "/o-domu/": "O nas",
  "/deklaracja-dostepnosci/": "Deklaracja dostępności",

  "/zycie-w-domu/": "Oferta",
  "/zycie-w-domu/spychowo/": "Filia Domu Pomocy w Spychowie",
  "/zycie-w-domu/grupa-christopher/": "Grupa wokalna „Christopher”",
  "/zycie-w-domu/regulamin-imprez-okolicznosciowych/": "Regulamin imprez okolicznościowych",

  "/dokumenty/": "Dokumenty",
  "/dotacje/": "Dotacje",
  "/projekty-unijne/": "Projekty unijne",
  "/projekty-unijne/oze/": "Instalacje OZE",
  "/rodo/": "RODO",
  "/sygnalista/": "Sygnalista",
  "/sygnalista/wewnetrzna-procedura/": "Wewnętrzna procedura",
  "/sygnalista/klauzula-informacyjna/": "Klauzula informacyjna",
  "/sygnalista/osoba-upowazniona/": "Osoba upoważniona",
  "/sygnalista/zalaczniki/": "Załączniki",

  "/aktualnosci/": "Aktualności",
  "/kontakt/": "Kontakt",
};

/**
 * Pages whose address does not sit under the section they belong to. Without
 * this, „Dotacje" would trail straight off the home page instead of through
 * „Dokumenty".
 */
export const routeParents: Record<string, string> = {
  "/deklaracja-dostepnosci/": "/o-domu/",
  "/dotacje/": "/dokumenty/",
  "/projekty-unijne/": "/dokumenty/",
  "/rodo/": "/dokumenty/",
  "/sygnalista/": "/dokumenty/",
};

export interface Crumb {
  href: string;
  label: string;
}

/**
 * Home → … → the page itself. The trail follows `routeParents` where a page has
 * one, and otherwise walks the URL one segment at a time. `current` names the
 * last crumb when the route map cannot know it — a news post.
 */
export function breadcrumbsFor(pathname: string, current?: string): Crumb[] {
  const home: Crumb = { href: "/", label: routeLabels["/"]! };
  if (pathname === "/") return [home];

  const trail: Crumb[] = [];
  const seen = new Set<string>();
  let href: string | undefined = pathname;

  while (href && href !== "/" && !seen.has(href)) {
    seen.add(href);
    const label = routeLabels[href] ?? (href === pathname ? current : undefined);
    if (label) trail.unshift({ href, label });
    href = routeParents[href] ?? parentSegment(href);
  }

  return [home, ...trail];
}

/** "/sygnalista/zalaczniki/" → "/sygnalista/" */
function parentSegment(href: string): string {
  const segments = href.split("/").filter(Boolean);
  segments.pop();
  return segments.length ? `/${segments.join("/")}/` : "/";
}
