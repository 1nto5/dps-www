/**
 * Route → breadcrumb label for every URL the site builds. Short, nav-style
 * names, because a crumb is read in a row of other crumbs. One entry per URL;
 * the news posts pass their own title in at render time.
 */
import { navPages } from "./nav";

export const routeLabels: Record<string, string> = {
  "/": "Strona główna",
  ...Object.fromEntries(navPages.map((item) => [item.href, item.label])),

  "/zycie-w-domu/grupa-christopher/": "Grupa muzyczna",
  "/zycie-w-domu/regulamin-imprez-okolicznosciowych/": "Regulamin imprez okolicznościowych",

  "/deklaracja-dostepnosci/": "Deklaracja dostępności",

  "/dotacje/": "Dotacje",
  "/projekty-unijne/": "Projekty unijne",
  "/projekty-unijne/oze/": "Instalacje OZE",
  "/rodo/": "RODO",
  "/sygnalista/": "Sygnalista",
  "/sygnalista/wewnetrzna-procedura/": "Wewnętrzna procedura",
  "/sygnalista/klauzula-informacyjna/": "Klauzula informacyjna",
  "/sygnalista/osoba-upowazniona/": "Osoba upoważniona",
  "/sygnalista/zalaczniki/": "Załączniki",
};

export interface Crumb {
  href: string;
  label: string;
}

/** Home → … → the page itself, walking the URL one segment at a time. */
export function breadcrumbsFor(pathname: string, current?: string): Crumb[] {
  const home: Crumb = { href: "/", label: routeLabels["/"] };
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [home];
  let href = "/";
  for (const [i, segment] of segments.entries()) {
    href += `${segment}/`;
    const last = i === segments.length - 1;
    const label = routeLabels[href] ?? (last ? current : undefined);
    if (label) crumbs.push({ href, label });
  }
  return crumbs;
}
