import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const aktualnosci = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/aktualnosci" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        date: z.coerce.date(),
        description: z.string().optional(),
        cover: image().optional(),
        coverAlt: z.string().optional(),
      })
      // A cover image needs an alt text — even an empty one, set deliberately
      // for a decorative photo — so it can never be silently forgotten.
      .refine((entry) => !entry.cover || entry.coverAlt !== undefined, {
        message: "coverAlt is required when cover is set",
        path: ["coverAlt"],
      }),
});

export const collections = { aktualnosci };
