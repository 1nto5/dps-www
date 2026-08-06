import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const aktualnosci = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/aktualnosci" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      description: z.string().optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
    }),
});

export const collections = { aktualnosci };
