# CLAUDE.md — dps-www

Static site of Dom Pomocy Społecznej im. Jana Pawła II w Szczytnie (public care home,
branch in Spychowo). Replaces an old WordPress/Elementor site.

## Stack and commands

Astro 5 + Tailwind 4 (`@tailwindcss/vite`) + Bun. Package manager is **bun** (`bun.lock`).

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
  JSON-LD. Every page uses it.
- `src/components/` — `PageHeader` (`eyebrow?`, `title`, `lead?`), `ArchImage`
  (signature arch-window frame; `src` is an imported `ImageMetadata`), `Gallery`
  (`photos: {src, alt}[]`), `DocList` (`docs: {href, label, format, size?}[]`),
  `Button` (`variant`: `primary` — the one action of a page, `secondary` — the
  alternative beside it, `quiet` — a small chip for a link that is not the page's
  point), `LinkCard`, `RailContactCard`, `PosterFigure`, `BackLink` (always placed
  **outside** `.doc`, so prose link styling never reaches it), `NewsCard`, `PostDate`,
  `A11yTools` (the accessibility toolbar).
- **Images:** `ArchImage` is portrait-and-square only (`aspect` ≤ 1, validated at build
  time); landscape photos use `FramedImage`.
- `src/pages/` — one `.astro` file per URL. `trailingSlash: "always"`, `build.format:
"directory"` — internal links must end with `/`. Besides the sections above it holds
  `/dostepnosc/` (what the Dom does in practice for accessibility — distinct from the
  signed statement at `/deklaracja-dostepnosci/`) and `/przyjecie-do-domu/` (how someone
  is admitted).
- `src/data/` — the shared facts, so no page writes them twice: `contact.ts` is the
  **only** place a telephone number or a postal address is written (numbers in the
  format `89 624 22 88` — spaces, no parentheses, no `+48`; the `tel:` href is derived,
  never typed), plus `nav.ts`, `routes.ts` and the per-section document lists.
- `src/content/aktualnosci/` — news posts, schema in `src/content.config.ts`. Markdown
  tables are wrapped by the `rehype-table-scroll` plugin (`src/lib/`, registered in
  `astro.config.mjs`) so a wide table scrolls in its own region instead of pushing the
  page sideways; hand-written HTML tables in `.doc` need the same
  `<div class="table-scroll" tabindex="0" role="region" aria-label="…">` by hand.
- `docs/pytania-do-domu.md` — the running list of open questions for the Dom: anything
  the site cannot state until someone there confirms it. Add to it rather than guessing.
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
`paper`, `ink`, `ink-soft`, `muted`, `spruce`, `spruce-deep`, `honey`, `line`, `edge`,
`moss`, `card` (the card surface), `overlay` / `on-overlay` (the lightbox ground and the
text on it), `on-dark`, and `focus-ring`; `font-display` = Fraunces, `font-body` =
Source Sans 3. Contrast is handled by the tokens. No animations or transitions on
motion-sensitive elements.

`line` is decoration — a hairline that separates or frames. `edge` is the boundary of a
control the reader can operate (button, menu button, panel, chip): it meets the 3:1 of
WCAG 2.1 SC 1.4.11, and its hover colour is never weaker than its resting one.

**Type scale.** Four roles, and nothing outside them: `text-meta` for metadata,
captions, labels, dates, table cells and navigation; `text-base` for body text;
`text-lg` for a page lead; `text-xl` … `text-5xl` for headings. Do not use `text-sm` or
`text-xs` (nothing on the site may go below `text-meta` — the accessibility bar is
chrome and carries its own scale), do not write arbitrary sizes like `text-[15px]`, do
not use `font-bold` (headings carry their weight themselves; `font-semibold` is the
heaviest body weight), and no uppercase-plus-tracking labels. Link underlines get their
offset from one global rule — never add `underline-offset-*` on an element.

**Measure and width.** `max-w-column` (the `--container-column` token, 46rem) is the
page's content column. `--measure-prose` (33rem) is the narrower reading measure for
running text; tables, floated photos and card lists keep the full column. It is
deliberately not a spacing token, so there is no `max-w-` utility that could drift onto
things that are not prose.

**Spacing.** Three steps, and they are named: `mt-section` between the top-level blocks
of a page, `mt-subsection` inside one, `mt-block` between a paragraph group and the next
thing. Prefer them to raw numbers, so a chapter boundary always reads as bigger than a
paragraph gap.

**Radius.** `rounded-xl` for cards, `rounded-lg` for panels, images and buttons. Nothing
else.

**Inline SVG** never carries a hex fill or stroke: use `currentColor`, or a token
through `var()`. An icon with a baked-in colour goes invisible in the high-contrast
modes.

**Non-breaking spaces** (U+00A0) belong in visible Polish text only — after a one-letter
preposition, inside a phone number. Never inside an attribute value (`class`, `href`,
`alt` metadata keys), where they are invisible and break matching.

## Motion

One clock. Every duration is a token in `src/styles/global.css` — `--dur-fast`
(150ms, paint-only feedback: hover, focus, press), `--dur-panel` (180ms, a
surface opening), `--dur-move` (250ms, a transform under the pointer, and the
anchor acknowledgement), `--dur-enter` (450ms, the page or one block arriving),
`--dur-exit` (120ms, the outgoing page) — plus `--stagger-step` (80ms),
`--stagger-max` (400ms) and `--rise` (14px). `--ease-out` is the only easing.
They are plain `:root` properties, not `@theme` entries, because Tailwind has
no `duration-*` namespace.

**Motion is declared in `global.css` and nowhere else.** No `transition-*`,
`duration-*`, `ease-*` or `animate-*` utility in a template, and no ms literal
outside the token block.

**One entrance gesture**, `@keyframes rise-in`. `main` plays it once on every
page, from CSS, with no markup and no JavaScript — that is how the prose pages,
404 and the news posts are covered, and it is why a page added tomorrow needs no
opt-in. Below the fold the choreography stages top-level blocks of each root
(`main section`, `main [data-shell-content]`) and plays the same keyframe as the
reader scrolls. **Nothing above the fold is ever hidden by script**;
`data-no-reveal` opts a root out.

It is a CSS **animation**, never a `transition`: a `transition` shorthand on an
element replaces the state-feedback transition under it and silently kills that
element's hover crossfade.

**Long-form prose and legal text arrive as one block, never a paragraph at a
time.** The accessibility statement and the migrated document pages get the
whole-page rise and nothing else. Do not cut them into sections to animate them.
`.doc` is a single unit to the choreography, which is what enforces this.

Arriving by anchor acknowledges the jump with `@keyframes arrive-in` — the same
movement as `rise-in`, deliberately under a **different name**, because a target
that is itself a staged block is already named for `rise-in` and cannot restart
an animation it is running.

**Cross-page transitions**: `header` and `.a11y-bar` carry a
`view-transition-name` so they hold still. The footer deliberately does not —
its document position differs between a short page and a long one. Exactly one
element per document may carry a given name; a duplicate skips the whole
transition, silently. Every `::view-transition-old/new()` we touch is forced to
`mix-blend-mode: normal`, because the UA default `plus-lighter` is additive: the
incoming root is held at full opacity, and the named groups have their animation
switched off, so both of their snapshots sit at full opacity too. Cancelling the
transition for a reader who asked for less movement needs a **later**
`@view-transition` rule than the one in `global.css`, so that stylesheet is
injected at the end of `<body>`, never from `<head>` — Astro appends its own
stylesheet link last, and a rule in `<head>` would lose to it.

**Movement is never the reason something is unreadable.** The staged state
exists only under `@media screen and (prefers-reduced-motion: no-preference) and
(scripting: enabled)` and only outside `[data-motion="reduce"]` and
`[data-contrast]`; forced-colors kills it too. It is released by keyboard focus,
by a 1500ms failsafe that forces paint rather than merely adding a class, on a
bfcache restore, on `visibilitychange`, and by the script's own `catch`.

**No `position: fixed` element inside `<main>`.** `main` carries a `transform`
for 450ms, which would make it that element's containing block. Today the
lightbox `<dialog>` is appended to `document.body` and the menu scrim lives
inside `header`; both are outside `main`, and must stay there.

## Accessibility (WCAG 2.1 AA — a legal duty here)

The public accessibility statement at `/deklaracja-dostepnosci/` is a signed legal
declaration, so regressions are a compliance problem, not just a bug.

- Semantic landmarks, logical heading order, one `h1`.
- Meaningful Polish `alt` on every image; `alt=""` only for decoration.
- Link text meaningful on its own — never a bare "kliknij tutaj"; document links state
  format and size.
- Visible focus states come from the global `:focus-visible` rule — do not remove them.
- The accessibility toolbar (`A11yTools`) writes `data-contrast`, `data-font-size` and
  `data-motion` on `<html>`, and the header's `ThemeSwitch` writes `data-theme`
  (`dark` / `light`; absent = follow `prefers-color-scheme`); all are remembered in
  `localStorage` under the `dps-*` keys. The dark palette is a token re-cut in
  `global.css`, and the high-contrast modes always win over it.
  Two consequences for every change you make: a new colour must be expressed through a
  token, or the contrast modes cannot repaint it; and the contrast modes must never
  invert photographs — they repaint interface colours, never image content.
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
