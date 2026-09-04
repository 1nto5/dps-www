/**
 * The main navigation: six top-level entries, three of which group a handful of
 * pages beneath them. There are no dropdowns in the header — the children only
 * ever appear in `SubNav`, on the pages that belong to the section.
 *
 * A child does not have to sit under its parent's URL: „Deklaracja dostępności"
 * belongs to „O nas" and „Dotacje" to „Dokumenty", even though their addresses
 * are at the root. The addresses are the Dom's; only the grouping is ours.
 */
export interface NavItem {
  href: string;
  label: string;
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
      { href: "/projekty-unijne/", label: "Projekty unijne" },
      { href: "/rodo/", label: "RODO" },
      { href: "/sygnalista/", label: "Sygnalista" },
    ],
  },
  { href: "/aktualnosci/", label: "Aktualności" },
  { href: "/kontakt/", label: "Kontakt" },
] as const;

/** Every page named in the menu, parents and children alike, each listed once. */
export const navPages: readonly NavItem[] = mainNav.flatMap((item) => [
  { href: item.href, label: item.label },
  ...(item.children ?? []),
]);

/** True when `href` is the page at `pathname`, or an ancestor of it. */
function covers(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * The top-level entry a pathname sits under. A page is matched against the
 * section's own address and against every child address; the longest match wins,
 * so `/sygnalista/zalaczniki/` lands under „Dokumenty" and not under „/".
 */
export function activeSection(pathname: string): NavItem | undefined {
  let best: NavItem | undefined;
  let bestLength = 0;
  for (const section of mainNav) {
    for (const href of [section.href, ...(section.children ?? []).map((c) => c.href)]) {
      if (covers(href, pathname) && href.length >= bestLength) {
        best = section;
        bestLength = href.length;
      }
    }
  }
  return best;
}

/**
 * The list `SubNav` shows on a page: the section's own page first, then its
 * children. Empty for a section that has none.
 */
export function sectionPages(pathname: string): readonly NavItem[] {
  const section = activeSection(pathname);
  if (!section?.children) return [];
  return [{ href: section.href, label: section.label }, ...section.children];
}
