# dps-www

Static website of **Dom Pomocy Społecznej im. Jana Pawła II w Szczytnie** — a public
care home for chronically mentally ill residents, with a branch in Spychowo. This
repository replaces the old WordPress site.

## Stack

- [Astro 5](https://astro.build) — static output, no client-side framework
- [Tailwind CSS 4](https://tailwindcss.com) via `@tailwindcss/vite`, design tokens in `src/styles/global.css`
- `@astrojs/sitemap`, `astro:assets` (sharp) for image optimization
- Self-hosted fonts (`@fontsource-variable/fraunces`, `@fontsource-variable/source-sans-3`) — no external requests at runtime
- [Bun](https://bun.sh) as package manager and task runner

```bash
bun install
bun run dev      # local dev server
bun run build    # static build into dist/
bun run preview  # serve the built site
bunx astro check # type-check .astro files
```

## Structure

```
src/
  assets/media/   images imported by pages and posts (<mediaId>-<basename>)
  components/     Header, Footer, PageHeader, ArchImage, Gallery, DocList
  content/        aktualnosci/ — news posts (Markdown collection)
  layouts/        Base.astro — the only layout; every page uses it
  pages/          one .astro file per URL
  styles/         global.css — design tokens and the .doc prose styles
public/
  dokumenty/pliki/  downloadable PDF/DOC files served as-is
  robots.txt, favicon.svg
```

All visible copy is Polish. Code, comments and identifiers are English.

## Adding an aktualność (news post)

1. Create `src/content/aktualnosci/YYYY-MM-DD-krotki-tytul.md` — lowercase, hyphens,
   no Polish diacritics in the filename. The filename (without extension) becomes the
   URL slug.
2. Frontmatter — schema lives in `src/content.config.ts`:

   ```yaml
   ---
   title: Wigilia w naszym Domu
   date: 2025-12-20
   description: Krótkie streszczenie, widoczne na liście i w wynikach wyszukiwania.
   cover: ../../assets/media/1234-wigilia.jpg
   coverAlt: Mieszkańcy i pracownicy przy wspólnym stole wigilijnym.
   ---
   ```

   `title` and `date` are required; `description`, `cover` and `coverAlt` are optional.
   `cover` is a path relative to the Markdown file and is processed by `astro:assets`,
   so the image must live in `src/assets/media/` — never in `public/`.

3. Body: plain Markdown. Start at `##` — the `#` heading is rendered from `title`.
4. Extra images: put them in `src/assets/media/` and reference them with a relative
   Markdown path. **Every image needs meaningful Polish alt text**; use `alt=""` only
   for purely decorative images.
5. Documents: drop the file into `public/dokumenty/pliki/` and link it as
   `/dokumenty/pliki/<file>`, stating format and size in the link context.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`: Bun installs dependencies,
`bun run build` produces `dist/`, `actions/upload-pages-artifact` uploads it and
`actions/deploy-pages` publishes it to GitHub Pages.

The site is currently verified on its `*.github.io` URL. There is **no `public/CNAME`
file yet** — it will be added together with the DNS cutover to `dpsszczytno.pl`.
`astro.config.mjs` already sets `site: "https://dpsszczytno.pl"`, so canonical URLs and
the sitemap point at the final domain.
