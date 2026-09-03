/**
 * Route → breadcrumb label for every URL the site builds. Short, nav-style
 * names, because a crumb is read in a row of other crumbs. One entry per URL;
 * the news posts pass their own title in at render time.
 */
import { mainNav } from "./nav";

export const routeLabels: Record<string, string> = {
  "/": "Strona główna",
  ...Object.fromEntries(mainNav.map((item) => [item.href, item.label])),

  "/zamieszkac-u-nas/": "Przyjęcie do Domu",
  "/zycie-w-domu/grupa-christopher/": "Grupa wokalna „Christopher”",
  "/zycie-w-domu/regulamin-imprez-okolicznosciowych/": "Regulamin imprez okolicznościowych",

  "/dostepnosc/": "Tekst łatwy do czytania",
  "/deklaracja-dostepnosci/": "Deklaracja dostępności",

  "/dokumenty/dotacje/": "Dotacje",
  "/dokumenty/projekty-unijne/": "Projekty unijne",
  "/dokumenty/projekty-unijne/oze/": "Instalacje OZE",
  "/dokumenty/zamowienia-publiczne/": "Zamówienia publiczne",
  "/dokumenty/rodo/": "RODO",
  "/dokumenty/sygnalista/": "Sygnalista",
  "/dokumenty/sygnalista/wewnetrzna-procedura/": "Wewnętrzna procedura",
  "/dokumenty/sygnalista/klauzula-informacyjna/": "Klauzula informacyjna",
  "/dokumenty/sygnalista/osoba-upowazniona/": "Osoba upoważniona",
  "/dokumenty/sygnalista/zalaczniki/": "Załączniki",
};

/** Pages that sit at the top level but belong under a section in the trail. */
const parentOf: Record<string, string> = {
  "/dostepnosc/": "/o-domu/",
  "/deklaracja-dostepnosci/": "/o-domu/",
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
    const parent = parentOf[href];
    if (parent && i === 0) crumbs.push({ href: parent, label: routeLabels[parent] });
    const last = i === segments.length - 1;
    const label = routeLabels[href] ?? (last ? current : undefined);
    if (label) crumbs.push({ href, label });
  }
  return crumbs;
}
