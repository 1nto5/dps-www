/**
 * The public-disclosure sections, grouped in the menu under "Dokumenty".
 * There is no hub page above them — the live site has none — so this list serves one purpose: the sibling
 * rail on every page inside the section. `label` is the rail link text; there
 * are no blurbs, because the Dom published none.
 */
export const dokumentySections = [
  { href: "/dotacje/", label: "Dotacje" },
  { href: "/projekty-unijne/", label: "Projekty unijne" },
  { href: "/sygnalista/", label: "Sygnalista" },
  { href: "/rodo/", label: "RODO" },
] as const;
