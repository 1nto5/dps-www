/**
 * The main navigation. Every address here is one the Dom uses; the grouping is
 * ours, because the Dom's own menu is a flat row of fourteen items and a row
 * that long is read by nobody.
 *
 * A parent is never an invented section name: "O nas" and "Oferta" are real
 * pages, and each opens a submenu whose first entry is the parent page itself,
 * the way the sibling rails already work. "Dokumenty" is the one parent with no
 * page of its own — the Dom has none either.
 */
export interface NavItem {
  /** Absent on a parent that is only a grouping, like "Dokumenty". */
  href?: string;
  label: string;
  /** The submenu under this entry. Its first item is the parent's own page. */
  children?: readonly NavItem[];
}

export const mainNav: readonly NavItem[] = [
  {
    href: "/o-domu/",
    label: "O nas",
    children: [
      { href: "/o-domu/", label: "O nas" },
      { href: "/deklaracja-dostepnosci/", label: "Deklaracja dostępności" },
    ],
  },
  {
    href: "/zycie-w-domu/",
    label: "Oferta",
    children: [
      { href: "/zycie-w-domu/", label: "Oferta" },
      { href: "/zycie-w-domu/spychowo/", label: "Filia Domu Pomocy w Spychowie" },
      { href: "/zycie-w-domu/grupa-christopher/", label: "Grupa muzyczna" },
      {
        href: "/zycie-w-domu/regulamin-imprez-okolicznosciowych/",
        label: "Regulamin imprez okolicznościowych",
      },
    ],
  },
  {
    label: "Dokumenty",
    children: [
      { href: "/projekty-unijne/", label: "Projekty unijne" },
      { href: "/dotacje/", label: "Dotacje" },
      { href: "/rodo/", label: "RODO" },
      { href: "/sygnalista/", label: "Sygnalista" },
    ],
  },
  { href: "/aktualnosci/", label: "Aktualności" },
  { href: "/kontakt/", label: "Kontakt" },
] as const;

/** A menu entry that really has a page behind it. */
export interface NavPage {
  href: string;
  label: string;
}

/** Every real page in the menu, submenus included, each listed once. */
export const navPages: readonly NavPage[] = mainNav
  .flatMap((item) => (item.children ? [...item.children] : [item]))
  .filter((item): item is NavPage => Boolean(item.href))
  .filter((item, i, all) => all.findIndex((other) => other.href === item.href) === i);

/** A parent that also has a page of its own: its first child repeats it. */
export const ownPage = (item: NavItem) =>
  item.children?.[0]?.href === item.href ? item.href : undefined;

/** The nav entry a pathname sits under: the longest matching prefix. */
export function activeSection(pathname: string): string | undefined {
  let best: string | undefined;
  for (const item of navPages) {
    if (pathname.startsWith(item.href) && (!best || item.href.length > best.length)) {
      best = item.href;
    }
  }
  return best;
}
