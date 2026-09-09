/**
 * The main navigation: six top-level entries, three of which group a handful of
 * pages beneath them, and two of those („Sygnalista", „Projekty unijne") with
 * pages of their own. There are no dropdowns in the header — the children only
 * ever appear in `SubNav`, on the pages that belong to the section, and in the
 * breadcrumbs.
 *
 * A child does not have to sit under its parent's URL: „Deklaracja dostępności"
 * belongs to „O nas" and „Dotacje" to „Dokumenty", even though their addresses
 * are at the root. The addresses are the Dom's; only the grouping is ours.
 */
export interface NavItem {
  href: string;
  label: string;
  /** The label in the `SubNav` rail, when the rail should say more than the menu. */
  rail?: string;
  /** The label in the breadcrumbs, when a shorter one reads better in a row. */
  crumb?: string;
  children?: readonly NavItem[];
}

export const mainNav: readonly NavItem[] = [
  { href: "/", label: "Strona główna" },
  {
    href: "/o-domu/",
    label: "O nas",
    children: [{ href: "/deklaracja-dostepnosci/", label: "Deklaracja dostępności" }],
  },
  {
    href: "/zycie-w-domu/",
    label: "Oferta",
    children: [
      { href: "/zycie-w-domu/spychowo/", label: "Filia Domu Pomocy w Spychowie" },
      { href: "/zycie-w-domu/grupa-christopher/", label: "Grupa wokalna „Christopher”" },
      {
        href: "/zycie-w-domu/regulamin-imprez-okolicznosciowych/",
        label: "Regulamin imprez okolicznościowych",
      },
    ],
  },
  {
    href: "/dokumenty/",
    label: "Dokumenty",
    children: [
      { href: "/dotacje/", label: "Dotacje" },
      {
        href: "/projekty-unijne/",
        label: "Projekty unijne",
        rail: "Projekty unijne — przegląd",
        children: [
          { href: "/projekty-unijne/oze/", label: "Wykorzystanie OZE w Domu", crumb: "Instalacje OZE" },
        ],
      },
      { href: "/rodo/", label: "RODO" },
      {
        href: "/sygnalista/",
        label: "Sygnalista",
        rail: "Sygnalista — przegląd",
        children: [
          { href: "/sygnalista/wewnetrzna-procedura/", label: "Wewnętrzna procedura" },
          { href: "/sygnalista/osoba-upowazniona/", label: "Osoba upoważniona" },
          { href: "/sygnalista/klauzula-informacyjna/", label: "Klauzula informacyjna" },
          { href: "/sygnalista/zalaczniki/", label: "Załączniki" },
        ],
      },
    ],
  },
  { href: "/aktualnosci/", label: "Aktualności" },
  { href: "/kontakt/", label: "Kontakt" },
] as const;

/** Every item in the tree, depth-first, with its parent and its top-level section. */
export const navTree: readonly { item: NavItem; parent?: NavItem; section: NavItem }[] = (function flatten(
  items: readonly NavItem[],
  parent?: NavItem,
  section?: NavItem,
): { item: NavItem; parent?: NavItem; section: NavItem }[] {
  return items.flatMap((item) => [
    { item, parent, section: section ?? item },
    ...flatten(item.children ?? [], item, section ?? item),
  ]);
})(mainNav);

/** Every page in the menu and one level below it, each listed once. */
export const navPages: readonly NavItem[] = navTree
  .filter(({ parent, section }) => !parent || parent === section)
  .map(({ item }) => ({ href: item.href, label: item.label }));

/** The menu label of the page at `href`. Throws when the tree has no such page. */
export function navLabel(href: string): string {
  const node = navTree.find((node) => node.item.href === href);
  if (!node) throw new Error(`navLabel: no navigation entry for ${href}`);
  return node.item.label;
}

/** True when `href` is the page at `pathname`, or an ancestor of it. */
function covers(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * The top-level entry a pathname sits under. Every address in the tree is
 * tried and the longest match wins, so `/sygnalista/zalaczniki/` lands under
 * „Dokumenty" and not under „/".
 */
export function activeSection(pathname: string): NavItem | undefined {
  let best: NavItem | undefined;
  let bestLength = 0;
  for (const { item, section } of navTree) {
    if (covers(item.href, pathname) && item.href.length >= bestLength) {
      best = section;
      bestLength = item.href.length;
    }
  }
  return best;
}

/** The children of the page at `href`, or none. */
export function childrenOf(href: string): readonly NavItem[] {
  return navTree.find(({ item }) => item.href === href)?.item.children ?? [];
}

/**
 * The list `SubNav` shows on a page: the nearest group that holds the page —
 * its own page first, then its children. Inside „Sygnalista" that is the
 * subsection, elsewhere the top-level section. Empty when there is no group.
 */
export function sectionPages(pathname: string): readonly NavItem[] {
  let group: NavItem | undefined;
  for (const { item } of navTree) {
    if (!item.children) continue;
    const inside =
      covers(item.href, pathname) ||
      item.children.some((child) => covers(child.href, pathname));
    if (inside && (!group || item.href.length >= group.href.length)) group = item;
  }
  if (!group) return [];
  return [{ href: group.href, label: group.rail ?? group.label }, ...group.children!];
}
