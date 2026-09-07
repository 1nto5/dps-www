/**
 * The news collection, newest first, and the one long-form Polish date every
 * list row and every post prints — so a row and its post cannot disagree.
 */
import { getCollection, type CollectionEntry } from "astro:content";

const dateFormat = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatPostDate(date: Date): string {
  return dateFormat.format(date);
}

export async function getPosts(): Promise<CollectionEntry<"aktualnosci">[]> {
  return (await getCollection("aktualnosci")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

/** A `PageList` row for a post: the title, then the date — and the blurb, when asked. */
export function postListItem(post: CollectionEntry<"aktualnosci">, withDescription = false) {
  const date = formatPostDate(post.data.date);
  return {
    href: `/aktualnosci/${post.id}/`,
    label: post.data.title,
    text: withDescription && post.data.description ? `${date} — ${post.data.description}` : date,
  };
}
