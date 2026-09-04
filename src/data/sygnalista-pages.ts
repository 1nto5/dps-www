/**
 * Pages of the „Sygnalista" subsection. The index itself is listed first, so
 * the `SiblingNav` rail on the four subpages is a complete map of the
 * subsection rather than a list of everything except where you are.
 *
 * `label` is the rail link text and the row title on the index. There are no
 * blurbs: the Dom published none, and this project writes none of its own.
 */
export const sygnalistaPages = [
  { href: "/sygnalista/", label: "Sygnalista — przegląd" },
  { href: "/sygnalista/wewnetrzna-procedura/", label: "Wewnętrzna procedura" },
  { href: "/sygnalista/osoba-upowazniona/", label: "Osoba upoważniona" },
  { href: "/sygnalista/klauzula-informacyjna/", label: "Klauzula informacyjna" },
  { href: "/sygnalista/zalaczniki/", label: "Załączniki" },
] as const;
