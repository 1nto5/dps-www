/**
 * The main navigation: the seven routes in the header bar and the mobile menu,
 * in the order they are read.
 *
 * `Header` renders it, `routes.ts` takes the breadcrumb labels of these seven
 * routes from it, and `/404/` builds its "where to go instead" tiles on top of
 * it. The footer is deliberately NOT generated from this list — it is a
 * different selection ("Na skróty"), and making it follow the navigation would
 * turn one edit into two unrelated changes.
 */
export const mainNav = [
  { href: "/o-nas/", label: "O nas" },
  { href: "/oferta/", label: "Oferta" },
  { href: "/filia-w-spychowie/", label: "Filia w Spychowie" },
  { href: "/aktualnosci/", label: "Aktualności" },
  { href: "/galeria/", label: "Galeria" },
  { href: "/dokumenty/", label: "Dokumenty" },
  { href: "/kontakt/", label: "Kontakt" },
] as const;
