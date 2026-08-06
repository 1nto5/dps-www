# CLAUDE.md — dps-www

Static site of Dom Pomocy Społecznej im. Jana Pawła II w Szczytnie (public care home,
branch in Spychowo). Replaces an old WordPress/Elementor site.

## Stack and commands

Astro 5 + Tailwind 4 (`@tailwindcss/vite`) + Bun. Package manager is **bun** (`bun.lock`).

- `bun run dev` — dev server
- `bun run build` — static build into `dist/`
- `bunx astro check` — type-check; must be clean for files you touch

Never add a client-side framework, external font/CDN/analytics/Maps request, or an
iframe. No JavaScript unless a feature genuinely cannot work without it.

## Structure

- `src/layouts/Base.astro` — the only layout. Props: `title`, `description`. It renders
  `<html lang="pl">`, the skip link, `Header`, `<main id="tresc">`, `Footer` and
  JSON-LD. Every page uses it.
- `src/components/` — `PageHeader` (`eyebrow?`, `title`, `lead?`), `ArchImage`
  (signature arch-window frame; `src` is an imported `ImageMetadata`), `Gallery`
  (`photos: {src, alt}[]`), `DocList` (`docs: {href, label, format, size?}[]`).
- `src/pages/` — one `.astro` file per URL. `trailingSlash: "always"`, `build.format:
"directory"` — internal links must end with `/`.
- `src/content/aktualnosci/` — news posts, schema in `src/content.config.ts`.
- `src/assets/media/` — images, named `<mediaId>-<basename>`, imported in frontmatter
  and rendered through `ArchImage`/`Gallery`/`astro:assets`. Never `<img src="http…">`.
- `public/dokumenty/pliki/` — PDF/DOC downloads, linked as `/dokumenty/pliki/<file>`.

## Content conventions

- All visible content is **Polish**, with correct orthography and diacritics. Code,
  comments, identifiers, commit messages: English.
- Tone: calm, warm, dignified — a home, not an office. Sentence-case headings, no
  emoji, no numbered section markers.
- Vocabulary for people, identical on every page: capitalised **„Mieszkańcy"** (never
  „podopieczni", „pensjonariusze"), **„osoby chorujące psychicznie"** (never „osoby
  chorych psychicznie"), **„osoby z niepełnosprawnościami"** (never „osoby
  niepełnosprawne"). The Dom is **„Dom"**, never „placówka" or „baza mieszkaniowa". The
  only exception is the statutory type of the facility — „dom dla osób przewlekle
  psychicznie chorych" — which is quoted as the law words it.
- Migrated WordPress HTML is stripped of Elementor wrappers, classes, inline styles and
  empty paragraphs, then placed inside `<div class="doc">` (long-form prose styling).
- Exactly one `h1` per page, and it comes from `PageHeader`. Body content starts at
  `h2`, with no skipped levels.

## Design tokens

Defined in `src/styles/global.css` under `@theme` — use these, never invent colors:
`paper`, `ink`, `muted`, `spruce`, `spruce-deep`, `honey`, `line`, `moss`;
`font-display` = Fraunces, `font-body` = Source Sans 3. Contrast is handled by the
tokens. No animations or transitions on motion-sensitive elements.

## Accessibility (WCAG 2.1 AA — a legal duty here)

The public accessibility statement at `/deklaracja-dostepnosci/` is a signed legal
declaration, so regressions are a compliance problem, not just a bug.

- Semantic landmarks, logical heading order, one `h1`.
- Meaningful Polish `alt` on every image; `alt=""` only for decoration.
- Link text meaningful on its own — never a bare "kliknij tutaj"; document links state
  format and size.
- Visible focus states come from the global `:focus-visible` rule — do not remove them.
- The accessibility statement keeps `id="a11y-deklaracja"` and the `a11y-*` class hooks
  required by the government template. Its dates and its "częściowo zgodna" status are
  carried over from the Dom's last signed statement — never edit them without a
  documented WCAG 2.1 AA audit and the Dom's written sign-off.

## Deploy

`.github/workflows/deploy.yml` on push to `main`: bun install → `bun run build` →
`actions/upload-pages-artifact` (`dist/`) → `actions/deploy-pages@v4`. Permissions:
`pages: write`, `id-token: write`.

**DNS cutover to `dpsszczytno.pl` is still pending** — the site is being verified on the
`*.github.io` URL first. Do not create `public/CNAME` until the cutover per the Hub
plan. `astro.config.mjs` already points `site` at the final domain, so canonical URLs
and the sitemap are correct in advance.
