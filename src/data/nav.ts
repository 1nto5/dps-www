/**
 * The main navigation, in the drawer menu: the same seven entries the
 * production site has, in the same order, pointing at the new addresses.
 * `Header` renders it; `routes.ts` takes these labels for the breadcrumbs.
 */
export const mainNav = [
  { href: "/o-domu/", label: "O nas" },
  { href: "/zycie-w-domu/", label: "Oferta" },
  { href: "/zycie-w-domu/spychowo/", label: "Filia w Spychowie" },
  { href: "/aktualnosci/", label: "Aktualności" },
  { href: "/zycie-w-domu/zdjecia/", label: "Galeria" },
  { href: "/dokumenty/", label: "Dokumenty" },
  { href: "/kontakt/", label: "Kontakt" },
] as const;

/** The nav entry a pathname sits under: the longest matching prefix. */
export function activeSection(pathname: string): string | undefined {
  let best: string | undefined;
  for (const item of mainNav) {
    if (pathname.startsWith(item.href) && (!best || item.href.length > best.length)) {
      best = item.href;
    }
  }
  return best;
}
