/**
 * Pages of the „Sygnalista" subsection. The index itself is listed first, so
 * the `SiblingNav` rail on the four subpages is a complete map of the
 * subsection rather than a list of everything except where you are.
 *
 * `label` doubles as the rail link text and the tile title on the index;
 * `text` is the tile blurb only, which is why the index's own entry carries
 * one it never shows — the index skips itself when it draws the tiles.
 */
export const sygnalistaPages = [
  {
    href: "/dokumenty/sygnalista/",
    label: "Sygnalista — przegląd",
    text: "Podstawa prawna i sposoby przekazania zgłoszenia wewnętrznego.",
  },
  {
    href: "/dokumenty/sygnalista/wewnetrzna-procedura/",
    label: "Wewnętrzna procedura",
    text: "Zasady dokonywania zgłoszeń naruszeń prawa i podejmowania działań następczych.",
  },
  {
    href: "/dokumenty/sygnalista/osoba-upowazniona/",
    label: "Osoba upoważniona",
    text: "Kto przyjmuje i weryfikuje zgłoszenia wewnętrzne oraz pod jakim numerem telefonu.",
  },
  {
    href: "/dokumenty/sygnalista/klauzula-informacyjna/",
    label: "Klauzula informacyjna",
    text: "Informacja o przetwarzaniu danych osobowych sygnalisty.",
  },
  {
    href: "/dokumenty/sygnalista/zalaczniki/",
    label: "Załączniki",
    text: "Wzory dokumentów do pobrania: oświadczenie, zgłoszenie, protokół, potwierdzenie, rejestr.",
  },
] as const;
