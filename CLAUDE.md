# CLAUDE.md — dps-www

Static site of Dom Pomocy Społecznej im. Jana Pawła II w Szczytnie (public care home,
branch in Spychowo). Replaces an old WordPress/Elementor site.

## Stack and commands

Astro 5 + Tailwind 4 (`@tailwindcss/vite`) + Bun. Fonts are subset by `bun run fonts`. Package manager is **bun** (`bun.lock`).

- `bun run dev` — dev server
- `bun run build` — static build into `dist/`, then four checks that fail the build:
  `check-section-nav` (every page with a `SectionNav` really has the sections it lists),
  `check-font-coverage` (every character on the site exists in the subset fonts),
  `check-download-links` (every document link resolves, and no file is orphaned),
  `check-media-orphans` (every image in `src/assets/media/` is actually used).
  All four live in `scripts/`.
- `bunx astro check` — type-check; must be clean for files you touch

Never add a client-side framework, external font/CDN/analytics/Maps request, or an
iframe. No JavaScript unless a feature genuinely cannot work without it.

## Structure

- `src/layouts/Base.astro` — the only layout. Props: `title`, `description`. It renders
  `<html lang="pl">`, the skip link, `Header`, `<main id="tresc">`, `Footer` and
  JSON-LD. Every page uses it. A parser-blocking `<head>` script applies the reader's
  text size and contrast before first paint.
- `src/components/` — `PageHeader` (`title`, `lead?`, `breadcrumbs?`, `current?`; the
  one `h1`), `PageShell` (rail slot on the left, content on the right), `Toc` (the
  page's `h2` ids; build fails on a missing id), `PageList` (a plain list of pages, one
  per row — the only "card"), `Brief` (the „W skrócie" box, 2–3 `<li>`, at the top of
  every content page), `Figure` (a photo in its natural rectangle with a caption),
  `Gallery` + `Lightbox`, `DocList`, `Button` (`primary` — the one action of a page,
  `secondary`; `phone` for the large number), `Breadcrumbs`, `PostDate`, `Header`
  (brand, four sections, A / A+ / A++ / Kontrast tools, the phone, the mobile bottom
  bar and the `<dialog>` menu), `Footer`.
- `src/pages/` — one `.astro` file per URL. `trailingSlash: "always"`, `build.format:
  "directory"` — internal links must end with `/`. Four sections, named the way
  readers think: `/zamieszkac-u-nas/`, `/zycie-w-domu/` (with `spychowo/`,
  `grupa-christopher/`, `zdjecia/`, `regulamin-imprez-okolicznosciowych/`), `/o-domu/`,
  `/dokumenty/` (with `dotacje/` as one page, `projekty-unijne/`, `rodo/`,
  `sygnalista/`, `zamowienia-publiczne/`). Outside the sections: `/kontakt/`,
  `/aktualnosci/`, `/dostepnosc/` (easy-to-read text), `/deklaracja-dostepnosci/` (the
  signed statement). Old URLs redirect from `astro.config.mjs`.
- `src/data/` — the shared facts: `contact.ts` is the **only** place a telephone number
  or a postal address is written (`89 624 22 88` — spaces, no `+48`; the `tel:` href is
  derived), `nav.ts` (the four sections and `activeSection()`), `routes.ts`
  (breadcrumb labels, one line per URL), and the per-section document lists.
- `src/content/aktualnosci/` — news posts, schema in `src/content.config.ts`. Markdown
  tables are wrapped by `rehype-table-scroll` (`src/lib/`); hand-written HTML tables in
  `.doc` need `<div class="table-scroll" tabindex="0" role="region" aria-label="…">`.
- `docs/pytania-do-domu.md` — open questions for the Dom. Add to it rather than guessing.
- `src/assets/media/` — images, imported in frontmatter and rendered through
  `Figure`/`Gallery`/`astro:assets`. Never `<img src="http…">`.
- `public/dokumenty/pliki/` — PDF/DOC downloads, linked as `/dokumenty/pliki/<file>`.

## Content conventions

- All visible content is **Polish**, with correct orthography and diacritics. Code,
  comments, identifiers, commit messages: English.
- Tone: calm, warm, dignified — a home, not an office. Sentence-case headings, no
  emoji, no numbered section markers. Paragraphs of at most four sentences.
- **Copy comes from the production site, never from us.** Every visible sentence is a
  sentence the Dom published (the old WordPress site, carried over in git history on
  `main`). Titles, leads and section headings keep their original wording. `Brief`
  („W skrócie") may only quote two or three sentences already on the page; a page that
  has none suitable simply has no `Brief`. Photo captions only where the Dom wrote one.
- Vocabulary for people, identical on every page: capitalised **„Mieszkańcy"** (never
  „podopieczni", „pensjonariusze"), **„osoby chorujące psychicznie"**, **„osoby z
  niepełnosprawnościami"**. The Dom is **„Dom"**, never „placówka". The only exception
  is the statutory type — „dom dla osób przewlekle psychicznie chorych" — quoted as the
  law words it.
- Long-form and legal text sits inside `<div class="doc">`, whole.
- Exactly one `h1` per page, from `PageHeader`. Body content starts at `h2`, no skips.

## Design tokens

Defined in `src/styles/global.css` under `@theme` — use these, never invent colors:
`paper` (ground), `mist` / `mist-deep` (second ground, pressed state), `card`, `ink`,
`ink-soft`, `lake` / `lake-deep` (the **only** action colour: links, buttons, the
active nav item), `heather` / `heather-soft` (the **only** emphasis colour: `Brief`,
a pulled sentence), `line` (decorative hairline), `edge` (a control's boundary, 3:1),
`overlay` / `on-overlay` (the lightbox), `on-dark`. `font-display` = Bricolage
Grotesque (headings, automatic), `font-body` = Golos Text. Dark mode follows the
system only; the two contrast modes (`data-contrast` = `yellow` / `bw`) win over it.

**Type scale.** `text-meta` for captions, dates, formats and the phone bar; `text-base`
for body; `text-lg` for a lead; `text-xl` … `text-5xl` for headings. No `text-sm`,
no arbitrary sizes, no `font-bold` in body text, no uppercase-plus-tracking labels.

**Width.** `max-w-wide` (68rem) is the page, `max-w-column` (42rem) the content
column, `--measure-prose` (34rem, `max-w-prose-measure`) the running-text measure.

**Spacing.** `mt-section`, `mt-subsection`, `mt-block`. **Radius.** `rounded-lg` only.

**Inline SVG** never carries a hex fill or stroke: `currentColor` or a token.

**Non-breaking spaces** (U+00A0) belong in visible Polish text only.

## Motion

One gesture — a quiet rise with a fade, the way `main` arrives — and one clock,
declared in `global.css` and nowhere else: `--dur-fast` (300ms, state feedback),
`--dur-panel` (500ms, a surface opening), `--dur-enter` (350ms, the page arriving),
`--dur-press` (800ms, the bloom after a press), `--ease-out` the only easing. What
moves: links and buttons crossfade their colour, a pressed button blooms softly from
the click point (`--px`/`--py` written by the pointer script in `Base`; `data-press`
while it runs), the drawer rises in from the left, the lightbox rises, `main` rises
once per load, below the fold each block rises in as the reader scrolls to it (a
scroll-driven animation on `view()`, pure CSS, `@supports`-guarded; a block on screen
at load is simply painted), a heading reached by anchor glows briefly (`:target`), anchors scroll smoothly,
and pages crossfade through a cross-document view transition with the header held
still (`view-transition-name: site-header` — exactly one element may carry it). All
of it sits under `prefers-reduced-motion: no-preference` and outside `[data-contrast]`.
No `transition-*`, `duration-*` or `animate-*` utility in a template, ever, and no
`position: fixed` element inside `<main>` (it carries a transform while rising).

## Accessibility (WCAG 2.1 AA — a legal duty here)

The public accessibility statement at `/deklaracja-dostepnosci/` is a signed legal
declaration, so regressions are a compliance problem, not just a bug.

- Semantic landmarks, logical heading order, one `h1`.
- Meaningful Polish `alt` on every image; `alt=""` only for decoration.
- Link text meaningful on its own — never a bare "kliknij tutaj"; document links state
  format and size.
- Visible focus states come from the global `:focus-visible` rule — do not remove them.
- The header tools write `data-contrast` and `data-font-size` on `<html>`, remembered
  in `localStorage` under `dps-contrast` and `dps-font`. A new colour must be a token,
  or the contrast modes cannot repaint it; the contrast modes never touch photographs.
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
