/**
 * The photographs more than one page shows.
 *
 * `hero` is the building: the homepage hero, the „O nas" tile and, cropped
 * below, the og:image of every page. `offerPhoto` and `christopherPhoto` are
 * the two the homepage tiles share with the pages they lead to — one photo,
 * one alt text, in one place.
 */
import { getImage } from "astro:assets";
import photo from "../assets/media/1377-1-1.jpg";
import offer from "../assets/media/1188-2012-07-25-at-10-18-46-1-1.jpg";
import christopher from "../assets/media/1168-christopherGroup.jpg";

export const hero = {
  photo,
  alt: "Budynek Domu Pomocy Społecznej w Szczytnie z czerwonym dachem, widziany zza kwitnących hortensji",
};

/** The common room: the „Oferta" tile and the „Oferta" page itself. */
export const offerPhoto = {
  photo: offer,
  alt: "Mieszkańcy i terapeutka przy wspólnym stole w świetlicy, w tle regały z książkami.",
};

/** The vocal group on stage: its tile and its own page. */
export const christopherPhoto = {
  photo: christopher,
  alt: "Pięciu członków grupy wokalnej „Christopher” śpiewa na plenerowej scenie pod żółtym namiotem.",
};

// The hero photo cropped to the 1200×630 social-preview shape every platform
// expects for a "large image" card. Built once for the whole build, not once
// per page; `Base` awaits it.
export const ogImage = getImage({ src: hero.photo, width: 1200, height: 630, format: "jpg" });
