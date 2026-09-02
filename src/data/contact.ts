/**
 * The Dom's contact details — one copy, for every page that prints them.
 *
 * They used to be written out at each point of use, which is how the same
 * telephone number ended up on the site in three different shapes: "(89)
 * 624-22-88" in the footer and the rail cards, "89 624 22 88" in the running
 * text, and "+48 89 624 22 88" in the JSON-LD. The signed accessibility
 * statement writes it with spaces and no parentheses, so that is the one
 * format here — for the landlines and for the mobiles alike.
 *
 * `href` is never written by hand: `tel()` builds it from the digits of the
 * label, so a corrected number cannot leave a stale link behind.
 */

/** `tel:` URI in E.164, from a label written in any spacing. */
function tel(label: string): string {
  return `tel:+48${label.replace(/\D/g, "")}`;
}

export interface Phone {
  label: string;
  href: string;
}

function phone(label: string): Phone {
  return { label, href: tel(label) };
}

export interface PostalAddress {
  street: string;
  postalCode: string;
  city: string;
}

/** One residential unit or section, with the numbers that reach it. */
export interface ContactUnit {
  name: string;
  phones: Phone[];
}

export const contact = {
  name: "Dom Pomocy Społecznej im. Jana Pawła II w Szczytnie",
  /** The name without the town, for addresses that name the town on their own line. */
  nameShort: "Dom Pomocy Społecznej im. Jana Pawła II",
  address: {
    street: "ul. Wielbarska 2",
    postalCode: "12-100",
    city: "Szczytno",
  } satisfies PostalAddress,
  phone: phone("89 624 22 88"),
  /** Plain text: the fax is not something a browser can dial. */
  fax: "89 624 34 99",
  email: "sekretariat@dpsszczytno.pl",
  epuap: "/dpsszczytno/SkrytkaESP",
  bip: "https://dpsszczytno.bip.gov.pl/",
  spychowo: {
    name: "Dom Pomocy Społecznej im. Jana Pawła II — Filia w Spychowie",
    address: {
      street: "ul. Sienkiewicza 3",
      postalCode: "12-150",
      city: "Spychowo",
    } satisfies PostalAddress,
    phone: phone("89 622 50 30"),
  },
  /** Direct numbers of the residential units and the catering section. */
  units: [
    { name: "Sekcja Żywienia", phones: [phone("89 624 64 44")] },
    { name: "Dom Mieszkalny I", phones: [phone("89 624 64 55"), phone("728 457 616")] },
    { name: "Dom Mieszkalny II", phones: [phone("89 624 64 97"), phone("600 835 191")] },
    { name: "Dom Mieszkalny III", phones: [phone("89 624 22 92"), phone("600 835 576")] },
  ] satisfies ContactUnit[],
};

/** "ul. Wielbarska 2, 12-100 Szczytno" — the one-line form. */
export function addressLine(a: PostalAddress): string {
  return `${a.street}, ${a.postalCode} ${a.city}`;
}

/** The same address as the lines an `<address>` element sets one per row. */
export function addressLines(a: PostalAddress): string[] {
  return [a.street, `${a.postalCode} ${a.city}`];
}
