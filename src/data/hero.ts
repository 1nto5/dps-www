/**
 * The photographs more than one page shows.
 *
 * `hero` is the building: the homepage hero, the „O nas" tile and, cropped
 * below, the og:image of every page. `offerPhoto` is the one the homepage tile
 * shares with the page it leads to — one photo, one alt text, in one place.
 */
import { getImage } from "astro:assets";
import photo from "../assets/media/1377-1-1.jpg";
import offer from "../assets/photos-2026/common-room.jpg";

export const hero = {
  photo,
  alt: "Budynek Domu Pomocy Społecznej w Szczytnie z czerwonym dachem, widziany zza kwitnących hortensji",
};

/**
 * The common room: the „Oferta" tile and the „Oferta" page itself. The caption
 * is the Dom's own title for the photo; the tile shows only the picture.
 */
export const offerPhoto = {
  photo: offer,
  alt: "Kilkanaście osób przy długich stołach w świetlicy, na ścianie ekran z wyświetlanym obrazem.",
  caption: "Zajęcia świetlicowe",
};

// The hero photo cropped to the 1200×630 social-preview shape every platform
// expects for a "large image" card. Built once for the whole build, not once
// per page; `Base` awaits it.
export const ogImage = getImage({ src: hero.photo, width: 1200, height: 630, format: "jpg" });
