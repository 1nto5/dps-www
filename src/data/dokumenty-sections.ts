/**
 * The public-disclosure sections under /dokumenty/. One list, used twice: the
 * cards on the section hub, and the `SiblingNav` rail on every page inside the
 * section. Keeping it here is what stops the two from drifting apart.
 *
 * `label` doubles as the card title and the rail link text; `text` is the card
 * blurb only.
 *
 * The accessibility statement is deliberately not one of these. It is not a
 * disclosure section with pages under it — it is a signed declaration that
 * lives at the top level — so the hub links to it from a short "Powiązane"
 * list instead, and the rail on these pages no longer offers it as a sibling.
 */
export const dokumentySections = [
  {
    href: "/dokumenty/dotacje/",
    label: "Dotacje",
    text: "Dotacje i dofinansowania otrzymane przez Dom, zestawione rok po roku.",
  },
  {
    href: "/dokumenty/projekty-unijne/",
    label: "Projekty unijne",
    text: "Zadania realizowane przy wsparciu funduszy Unii Europejskiej.",
  },
  {
    href: "/dokumenty/zamowienia-publiczne/",
    label: "Zamówienia publiczne",
    text: "Ogłoszenia o postępowaniach, dokumentacja i informacje o wynikach.",
  },
  {
    href: "/dokumenty/sygnalista/",
    label: "Sygnalista",
    text: "Procedura zgłaszania naruszeń prawa i zasady ochrony osób zgłaszających.",
  },
  {
    href: "/dokumenty/rodo/",
    label: "RODO",
    text: "Klauzula informacyjna o przetwarzaniu danych osobowych w naszym Domu.",
  },
] as const;
