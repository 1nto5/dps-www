/**
 * Route → breadcrumb label for every URL the site builds, plus the walker the
 * `Breadcrumbs` component uses.
 *
 * The labels are not always the page's `h1`. A breadcrumb is read in a row of
 * other breadcrumbs, so it takes the short, nav-style name of the page — the
 * label the main navigation, the `SiblingNav` rail or the eyebrow already uses
 * ("Oferta", not "Co zapewniamy naszym Mieszkańcom"). Anything longer wraps
 * onto its own line on a phone and stops being a trail.
 *
 * One entry per built URL, so a new page is a one-line addition here. The only
 * URLs deliberately absent are the news posts under /aktualnosci/, whose labels
 * are the post titles and are passed in at render time, and /404/, which has no
 * place in a hierarchy.
 */
export const routeLabels: Record<string, string> = {
  "/": "Strona główna",

  "/o-nas/": "O nas",
  "/oferta/": "Oferta",
  "/oferta/regulamin-imprez-okolicznosciowych/": "Regulamin imprez okolicznościowych",
  "/filia-w-spychowie/": "Filia w Spychowie",
  "/przyjecie-do-domu/": "Przyjęcie do Domu",
  "/aktualnosci/": "Aktualności",
  "/galeria/": "Galeria",
  "/grupa-muzyczna/": "Grupa wokalna „Christopher”",
  "/kontakt/": "Kontakt",
  "/deklaracja-dostepnosci/": "Deklaracja dostępności",
  "/dostepnosc/": "Tekst łatwy do czytania",

  "/dokumenty/": "Dokumenty",
  "/dokumenty/dotacje/": "Dotacje",
  "/dokumenty/dotacje/2025/": "Dotacje 2025",
  "/dokumenty/dotacje/2024/": "Dotacje 2024",
  "/dokumenty/dotacje/2023/": "Dotacje 2023",
  "/dokumenty/dotacje/2022/": "Dotacje 2022",
  "/dokumenty/dotacje/2021/": "Dotacje 2021",
  "/dokumenty/dotacje/2020/": "Dotacje 2020",
  "/dokumenty/dotacje/2019-2018-2016/": "Dotacje 2019, 2018 i 2016",
  "/dokumenty/projekty-unijne/": "Projekty unijne",
  "/dokumenty/projekty-unijne/oze/": "Wykorzystanie OZE w Domu",
  "/dokumenty/zamowienia-publiczne/": "Zamówienia publiczne",
  "/dokumenty/sygnalista/": "Sygnalista",
  "/dokumenty/sygnalista/wewnetrzna-procedura/": "Wewnętrzna procedura",
  "/dokumenty/sygnalista/klauzula-informacyjna/": "Klauzula informacyjna",
  "/dokumenty/sygnalista/osoba-upowazniona/": "Osoba upoważniona",
  "/dokumenty/sygnalista/zalaczniki/": "Załączniki",
  "/dokumenty/rodo/": "RODO",
};

export interface Crumb {
  href: string;
  label: string;
}

/** Leading and trailing slash, whatever the caller passed in. */
function normalise(pathname: string): string {
  const withLead = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLead.endsWith("/") ? withLead : `${withLead}/`;
}

/**
 * The trail from the home page down to `pathname`, one crumb per path segment
 * that the map knows a label for. An unknown segment is skipped rather than
 * guessed at: a made-up label is worse wayfinding than a shorter trail.
 *
 * `current` overrides the label of the last crumb, for pages whose name lives
 * in their content instead of in this map — the news posts.
 */
export function breadcrumbsFor(pathname: string, current?: string): Crumb[] {
  const path = normalise(pathname);
  const home: Crumb = { href: "/", label: routeLabels["/"] };
  if (path === "/") return [home];

  const segments = path.split("/").filter(Boolean);
  const crumbs = [home];

  segments.forEach((_segment, i) => {
    const href = `/${segments.slice(0, i + 1).join("/")}/`;
    const isLast = i === segments.length - 1;
    const label = isLast && current ? current : routeLabels[href];
    if (label) crumbs.push({ href, label });
  });

  return crumbs;
}
