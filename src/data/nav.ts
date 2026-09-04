/**
 * The main navigation: the same entries the production site has, in the same
 * order and under the same addresses. The Dom's menu is flat apart from one
 * dropdown, so the four public-disclosure pages sit behind a single "Dokumenty"
 * item — a grouping, not a page: there is no hub above them, because the live
 * site has none.
 */
export interface NavItem {
  href: string;
  label: string;
  /** A dropdown parent: no page of its own, only these children. */
  children?: readonly NavItem[];
}

export const mainNav: readonly NavItem[] = [
  { href: "/o-domu/", label: "O nas" },
  { href: "/zycie-w-domu/spychowo/", label: "Filia Domu Pomocy w Spychowie" },
  { href: "/zycie-w-domu/grupa-christopher/", label: "Grupa muzyczna" },
  { href: "/zycie-w-domu/", label: "Oferta" },
  {
    href: "#dokumenty",
    label: "Dokumenty",
    children: [
      { href: "/projekty-unijne/", label: "Projekty unijne" },
      { href: "/dotacje/", label: "Dotacje" },
      { href: "/rodo/", label: "RODO" },
      { href: "/sygnalista/", label: "Sygnalista" },
    ],
  },
  { href: "/zycie-w-domu/regulamin-imprez-okolicznosciowych/", label: "Regulamin imprez okolicznościowych" },
  { href: "/deklaracja-dostepnosci/", label: "Deklaracja dostępności" },
  { href: "/kontakt/", label: "Kontakt" },
  { href: "/aktualnosci/", label: "Aktualności" },
] as const;

/** Every real page in the menu, dropdown children included. */
export const navPages: readonly NavItem[] = mainNav.flatMap((item) =>
  item.children ? [...item.children] : [item],
);

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
