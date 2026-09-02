# Visual, UI and UX overhaul — design

Date: 2026-08-07
Status: proposed, awaiting approval
Scope: full layout rebuild approved by the site owner

## Goal

The site's design language, palette and typography are sound, and the motion layer is
correctly built (reduced-motion honoured, transform/opacity only, no-JS safe). What is
wrong is structural: one layout flaw repeated on every long-form page, a signature
graphic treatment that degenerates on landscape crops, three interaction defects, and a
reveal animation tuned slowly enough to show blank paper during fast scrolling.

This document defines what changes. It does not change content, wording, the vocabulary
rules for describing Mieszkańcy, or the accessibility statement.

## Evidence

Audited against the dev server with headless Chromium: full-page captures of 12 routes at
1440×900 and 390×844, interaction states, measured tap targets, computed contrast, and a
network trace.

Measured facts this design responds to:

| Measurement                                      | Value                                                        |
| ------------------------------------------------ | ------------------------------------------------------------ |
| Mobile header height at 390px                    | 145px (17% of viewport)                                      |
| `ArchImage` rendered ratios                      | 0.96 (hero), 1.5 (oferta ×3), 1.6–2.2 (o-nas), 2.8 (kontakt) |
| Reveal transition + max stagger                  | 550ms + 420ms                                                |
| Footer / inline link height                      | 22px                                                         |
| Card fill `bg-white/60` over paper               | resolves to ≈`#fdfcfb` — 1% lift                             |
| Fonts per page                                   | 215 KB across 4 files, none preloaded                        |
| Contrast (honey / muted / spruce / ink on paper) | 5.1 / 6.0 / 7.2 / 12.9 : 1 — all pass                        |
| Escape closes mobile menu                        | No (verified)                                                |

Contrast needs no work. Everything else below does.

---

## 1. Page shell and the dead right column

**Problem.** The page container is 72rem but prose is capped at 46rem and left-aligned.
On every long-form route, 40–45% of a desktop viewport is empty paper down the entire
page. It reads as unfinished rather than spacious.

**Design.** A `PageShell` component wrapping main content:

- Below 1024px: single column, unchanged.
- At ≥1024px: `grid-template-columns: minmax(0, 46rem) minmax(0, 18rem)` with a 4rem gap,
  the whole grid centred in the 72rem container.
- The second column is an optional rail, `position: sticky`, offset below the sticky
  header. Pages with nothing to put there fall back to a centred single column rather
  than leaving the rail empty.

Rail content per route:

| Route                                                     | Rail                                                     |
| --------------------------------------------------------- | -------------------------------------------------------- |
| `o-nas`, `rodo`, `sygnalista/*`, `deklaracja-dostepnosci` | Section TOC (§6)                                         |
| `oferta`, `filia-w-spychowie`                             | Section TOC + a contact card                             |
| `dokumenty/*` index pages                                 | Sibling-section links                                    |
| `kontakt`                                                 | No rail — content becomes a centred two-column card grid |
| `aktualnosci`                                             | No rail                                                  |

**Constraint.** The rail is supplementary, never the only route to information. It is
skipped in the tab order only in the sense that it comes after the prose in DOM order on
mobile; on desktop it precedes nothing critical. All rail links duplicate content
reachable from the body or the main nav.

## 2. Spacing scale

**Problem.** Every section uses `mt-14`. Nothing distinguishes a chapter boundary from a
paragraph group, so a 5,000px page has no visible structure.

**Design.** Three steps, added to `@theme` so they are available as Tailwind utilities:

```css
--spacing-section: clamp(3.5rem, 8vw, 6rem); /* between top-level sections */
--spacing-subsection: clamp(2rem, 4vw, 3rem); /* between h3 groups */
--spacing-block: 1.5rem; /* between paragraphs and lists */
```

Replace every `mt-14` between top-level sections with `mt-section`. Long pages
additionally alternate a `bg-moss/40` full-bleed band every second or third section, so
chapter boundaries are visible while scrolling past.

## 3. The arch motif

**Problem.** `rounded-t-[999px]` produces a semicircular arch whose height always equals
half the image width, because the browser clamps the radius. Consequences by ratio:

- ratio ≤ 1 (hero, filia): correct — a window arch with wall below it.
- ratio ~1.5 (oferta ×3): geometrically a semicircle, but it consumes 75% of the image
  height. Reads as a dome, not a window.
- ratio > 2 (kontakt at 2.79, o-nas at 2.21): the radius clamps against the height
  instead of the width, degenerating into a stadium shape with a flat span between two
  rounded corners. This is the mushroom shape visible on `/kontakt/`.

**Design.** The arch is a **portrait-and-square-only treatment**. `ArchImage` gains an
`aspect` prop, defaults to `4/5`, and accepts only ratios ≤ 1. Passing a wider ratio
raises a build-time error rather than rendering a broken shape. Validation runs on the
**rendered `aspect` prop, not the source image's ratio** — the frame is what determines
the geometry. Landscape photos use a new `FramedImage` with plain `rounded-xl` — same
border and hover behaviour, no arch.

Both advisors confirmed the rule. The alternative formulation is an elliptical cap
(`border-radius: 50% 50% 0 0 / 100% 100% 0 0`), which survives any ratio but reads as a
shallow eyebrow rather than a window arch. Rejected: it is a different motif, not a
rescue of this one.

Route changes that follow:

- `oferta`: three arch images become portrait crops, and alternate left/right instead of
  all sitting right. The section with no image gets one, so the rhythm does not break.
- `o-nas`: the 2.21-ratio image becomes a portrait crop or `FramedImage`.
- `kontakt`: the decorative 2.79-ratio image is removed outright. It carries no
  information and delays the phone numbers people came for.
- Hero: `aspect-[3/4]` is currently overridden by `max-h-[34rem]` — it renders at 0.96,
  not 0.75. Drop the max-height and let the declared aspect hold.

Record the portrait-only rule in `CLAUDE.md` so it is not re-broken.

## 4. Cards and grids

**Cards.** `bg-white/60` over paper resolves to a 1% lift — the fill does nothing and only
the border reads. Change to solid `#fff` with the existing `line` border. On hover, keep
the border colour shift and add a 1px shadow; no lift, no scale.

**Grids.** Ragged trailing rows appear wherever item count is not a multiple of the
column count. Rules:

- Photo grids: curate to multiples of the column count. Where a group has a single photo
  (galeria, "Zajęcia i występy"), render it at single-column width with a visible
  caption, not spanning two columns.
- News cards: when fewer than three posts exist, switch to a single-column list layout
  with a larger type scale, rather than one narrow card marooned in a three-column grid.
  This is a rendering fix, not a substitute for §10.

## 5. Header and navigation

**Mobile lockup.** 145px on a 390px viewport, because the wordmark wraps to three lines.
Below `sm`, render the mark plus "Dom Pomocy Społecznej" on one line and hide the
"im. Jana Pawła II w Szczytnie" subtitle. Target ≤64px. The full name remains in the
footer, the `<title>`, and the JSON-LD, so nothing is lost.

**Sticky. Built and verified.** `position: sticky; top: 0` at all widths, with a permanent
hairline bottom border and `z-40` — the z-index is required, not decorative: revealed
sections carry an opacity transition, which makes them stacking contexts that would
otherwise paint over a header appearing earlier in the document.

Measured outcomes: mobile header 145px → **72px**; the 1024px case, where the desktop nav
appears and previously wrapped the wordmark onto a second line at **123px**, is now 96px
on one line. The lockup did not reach the ≤64px target — 72px is where it lands with the
full name legible on one line — but it is under the 9% of viewport height that made the
original worth changing.

The wordmark is sized with `clamp(0.8rem, 3.6vw, 1.125rem)` rather than breakpoint steps,
because `whitespace-nowrap` at a fixed size overflowed at 320px, and WCAG 2.1 SC 1.4.10
requires reflow without horizontal scrolling at exactly that width. Verified: no page-level
horizontal overflow at any of 15 widths from 320px to 1920px.

Anchor offsetting is one declaration — `scroll-padding-top` on `html`, driven by a
`--header-h` custom property — which covers in-page anchors, the skip link and keyboard
focus scrolling together. `--header-h` deliberately overshoots the 85px header above `sm`
so the taller 96px `lg` case still clears; overshooting drops a target slightly lower,
undershooting hides it behind the header. Verified at four viewports: anchors land clear,
the skip link moves focus to `main#tresc` and lands it at the header's bottom edge.

The mobile menu panel is now anchored to the header bar rather than to its button, so it
drops below the header's bottom border instead of straddling it. Its dismissal behaviour
(Escape, light-dismiss, scrim) is still outstanding Phase 0 work.

Cut on Codex's advice: a sentinel plus IntersectionObserver to fade in a shadow once
scrolled. Purely cosmetic JavaScript, and the project rule does not bend for cosmetics.

Every heading anchor and `#tresc` gets `scroll-margin-top` matching the sticky header
height, so skip-link and TOC targets are not hidden underneath it. Both advisors raised
this independently.

**Back to top.** A text link at the end of every page longer than roughly two viewports.
Not a floating button.

**Mobile menu dismissal.** The `<details>` element has no light-dismiss and, verified, no
Escape handling. Keep `<details>` — it works with JS disabled — and add progressive
enhancement: close on Escape, close on pointer-down outside the panel, close on
navigation. Add a translucent scrim behind the open panel so it reads as a layer.

Rejected: the Popover API. It would give light-dismiss and Escape for free, but without
`popover` support the panel renders permanently open, and the no-JS fallback matters more
here than the saved lines.

## 6. Wayfinding

**Breadcrumbs.** A `Breadcrumbs` component driven by a route→label map, rendered as
`<nav aria-label="Ścieżka nawigacji">` with an `<ol>`, on every page below the top level.
Emit matching `BreadcrumbList` JSON-LD. The existing `eyebrowHref` on `PageHeader` becomes
redundant and is removed.

**Section TOC.** A `SectionNav` component taking an explicit `{id, label}[]` array — pages
pass it rather than having it introspect headings, so labels can be shortened. Renders in
the rail on desktop; on mobile it collapses into a `<details>` above the content. Applies
to the six routes listed in §1. **Moved into phase 1** — see Phasing.

Two guards both advisors asked for:

- A dev-time check that every `id` passed to `SectionNav` actually exists on the rendered
  page. Explicit arrays drift from real headings; this is the component's main failure
  mode.
- One logical DOM order at every breakpoint. The mobile `<details>` and the desktop rail
  must be the same element repositioned by CSS, never two copies, so focus order and
  screen-reader order stay identical.

**Search — cut.** Previously specified as Pagefind on a `/szukaj/` page, justified by
"a document repository cannot be navigated without it". Fable showed the justification is
false and I verified it: Pagefind indexes built HTML only and does not extract text from
PDF or DOC files. It would return the same link labels the `dokumenty` index already
lists. With that premise gone there is no case for invoking the no-JavaScript exception
across 12 routes of prose, so the feature is removed rather than re-justified.

## 7. Motion — one choreography site-wide

**Status: built and verified.** Revised on the owner's direction, which reversed the
original approach here. What follows describes the shipped behaviour.

**The problem, restated.** The original text in this section proposed _reducing_ reveal to
the first three below-fold sections. That was wrong about what bothered a reader. Every
below-fold section already revealed — but as one slab, with no internal choreography,
while the homepage hero staged its children in sequence. Two of the homepage sections were
worse still: a per-item card stagger ran _inside_ a parent that was itself mid-fade, two
animations layered on the same pixels. A slab appearing reads as "not animated", and the
layered case reads as muddy.

**The design.** `.hero-enter` becomes the only reveal gesture on the site. For each
below-fold section, walk down through wrappers holding a single element until reaching a
node with real siblings; those children are the reveal units, staged in sequence exactly
as the hero stages its own. A card or photo grid contributes its items to that same
sequence rather than nesting a second animation inside the first. This deletes a code
path rather than adding one.

- Units rise 14px and fade over 700ms, `--ease-out`, 85ms apart, capped at 400ms total
  delay — a four-element section resolves in about 710ms. Set on the owner's direction
  after seeing it run; an earlier revision used 450ms/60ms on the reasoning that motion
  during scrolling should be quicker than the hero's 550ms/70ms, and that read as too
  brisk. The duration lives in one place, `--reveal-duration`, and `STEP` in the
  choreography script should move with it.
- The timer that clears each element's stagger delay must outlast that element's own run
  (delay + duration). It was sized for the 450ms revision and would have fired exactly as
  the 700ms transition ended.
- **Content already on screen when the page opens plays on load**, as one continuous
  cascade trailing the hero by 140ms. Without this, a reader on a tall display finds the
  upper sections already in place and never sees them arrive — measured: on any viewport
  ≥1000px tall, "Czym jest nasz dom" was staged with zero units and never animated at all.
  Sections below the reveal line still wait for the scroll.
- **The staged state is applied by render-blocking CSS in `<head>`, not by script.**
  Astro's default `<script>` is a deferred module that runs only after the browser has
  painted — measured at 18ms behind first paint locally and 18.7s behind it on a throttled
  connection, because the module queues behind fonts and images. Moving the script inline
  to the end of `<body>` was not enough either: the browser paints incrementally, so
  content still appeared 2.7s before the script ran. A `.reveal-armed` class set by a tiny
  parser-blocking `<head>` script, plus one CSS rule holding top-level sections at
  `opacity: 0`, is the only thing that beats first paint. The choreography script releases
  the class once every section holds its own staged state.
- **Two failsafes, both verified**, because permanently invisible content is the worst
  possible failure here: the `<head>` script removes its own class after 2.5s if the
  choreography never arrives, and the choreography script un-hides everything it staged if
  it throws. Tested by forcing the script to throw — content recovers to full opacity.
- **One number governs when a section plays.** `INSET` = 12% of viewport height is both
  the staging test (`rect.top > innerHeight - INSET`) and the observer's reveal line
  (`rootMargin: 0px 0px -INSET 0px`). They must not diverge: an earlier revision staged at
  90% of viewport height while the observer fired on plain intersection, so any section
  landing in that band was staged and then revealed _during page load_ — the reader, who
  had not scrolled yet, never saw it move. Measured on the homepage before the fix: all
  four units of "Czym jest nasz dom" sat at opacity ≈1 at `scrollY = 0`.
- An earlier revision also claimed reveals begin before a section reaches the viewport.
  That was false — the `rootMargin` expanded the _top_ edge, which does nothing when
  scrolling down. Sections now play as they scroll into view, which is the requested
  behaviour; the safety timer covers stalls instead.
- Zero-size units (`sr-only` headings) are filtered out so they do not consume a step.
- The hero itself is unchanged. It is the reference the rest now matches.

**Arriving by anchor.** Jumping to a section — via in-page links, and via the `SectionNav`
rail in phase 1 — replays the gesture once on the whole section over 250ms, without the
per-element cascade. Hopping between six TOC entries on a long page therefore never
replays a full entrance six times. A section not yet revealed plays its full entrance
instead. Verified to replay correctly on repeat jumps to the same target.

**Guards.**

- Keyboard focus landing on anything not fully painted reveals its section **instantly**,
  with transitions suppressed — not with the 450ms fade, which would leave the focus ring
  drawn on transparent content for that whole window. The test is the element's computed
  opacity, not its class: `show` marks every unit in a section visible at once while each
  waits out its stagger delay, so a unit can carry `is-visible` and still be fully
  transparent. Checking the class alone missed exactly that case. Verified across six
  routes at five viewport sizes: no focused element sits below 1.0 opacity.
- A 1500ms timer reveals anything still hidden _within the viewport_, so a missed observer
  callback cannot leave content invisible. Sections further down keep their entrance.
- Feature-detected: without `IntersectionObserver`, nothing is ever hidden.
- Under `prefers-reduced-motion: reduce`, zero units are staged and nothing renders below
  full opacity. Verified.

**View transitions.** `::view-transition-new(root)` currently rises 8px while the incoming
page also runs its own reveal — the same motion twice. Reduce the view transition to a
pure crossfade (no translate) and shorten the outgoing fade to 120ms so old and new
overlap less.

Nothing else moves. No scroll-linked or parallax effects — wrong for this audience, and
the existing restraint is correct.

## 8. Lightbox

- The dialog is `width: 100vw` while `scrollbar-gutter: stable` reserves a gutter, leaving
  a white strip down the right edge. Use `100dvw` with the gutter accounted for, or size
  the dialog to `inset: 0`.
- Prev/next controls sit at 12% white over photographs that are frequently bright. Raise
  to a solid dark chip with a white glyph.
- Photos give no affordance that they enlarge on touch, since `cursor: zoom-in` is
  pointer-only. Add a small corner glyph on each thumbnail and a line of text above each
  grid.
  Cut on Codex's advice: swipe navigation on touch. The prev/next buttons already work and
  nobody asked for it.

## 9. Accessibility and performance

**Tap targets.** Footer and inline links measure 22px against WCAG 2.2 SC 2.5.8's 24px
minimum. The site declares 2.1 AA, so this is not a current breach, but EN 301 549 tracks
2.2 and the footer telephone number is a primary action for this audience. Raise footer
list spacing and add vertical padding to reach ≥24px. No change to the accessibility
statement, its dates, or its "częściowo zgodna" status.

**Active state.** `filter: brightness(0.94)` on `:active` creates a containing block,
which already required a documented workaround for stretched card links. Replace with a
background-colour change and delete the workaround.

**Fonts.** 215 KB across 4 files, none preloaded. Polish requires both `latin` and
`latin-ext` subsets of both families simultaneously, so all four always download; the
Fraunces `opsz` axis accounts for 126 KB.

- Subset both families with `pyftsubset` (run via `uv`) to Polish letters, basic Latin,
  digits, punctuation and the few symbols in use, merging `latin` and `latin-ext` into one
  file per family. Variation axes are preserved — the `opsz` axis stays, per the existing
  documented reason. Expected result: ~60–80 KB in 2 files.
- Preload both files from the layout.
- Add `size-adjust` / `ascent-override` on fallback `@font-face` rules matched to Georgia
  and system-ui, to remove the reflow when Fraunces swaps in.
- **Scripted, not hand-run.** Per Fable: a hand-subset binary rots the first time content
  introduces an uncovered glyph — a typographic quote, an em dash, a name with a diacritic
  outside Polish. The subsetting runs as a checked-in script, and the build fails if any
  glyph present in `dist/` is missing from the subset.

**LCP.** Add `fetchpriority="high"` to the eager hero image.

**Build cost.** `Gallery` calls `getImage({width: 1600})` for every photo at build time
regardless of whether it is opened. Left as is — correctness over build speed.

## 10. Content — outside this work

`Aktualności` contains one post, dated December 2022, rendered as a single card on the
homepage and again on its own page. §4 makes that render less awkwardly, but the signal it
sends is a content problem and belongs to the Dom, not to this change.

Likewise the photography: 80+ files in `src/assets/media/`, roughly 20 in use, mixed white
balance, and a boiler-room photograph currently sitting in the gallery under "Budynki i
otoczenie".

The portrait-crop dependency is smaller than first stated. Fable's correction: `object-cover`
inside an `aspect-[4/5]` frame crops landscape sources acceptably on its own, so new files
are needed only where the automatic crop cuts off a subject's head. Phase 2 proceeds and
flags individual photos that need a manual crop, rather than waiting on a photo session.

## 11. Two compliance items that are not mine to decide

**The accessibility declaration is already out of date.** It states
„Data ostatniej istotnej aktualizacji: 07.10.2008" and „Data sporządzenia deklaracji:
23.09.2020". The WordPress-to-Astro rebuild already performed is itself a significant
update, and this overhaul is another. Polish law requires the declaration to be reviewed
after significant changes. This predates the present work and is not created by it, but it
must reach the Dom before the DNS cutover. The `a11y-*` hooks, `id="a11y-deklaracja"`, the
dates and the „częściowo zgodna" status stay untouched in code until the Dom signs off.

**Forbidden vocabulary is present in six places** across four pages — verified by grep,
not asserted:

| File                                    | Term             |
| --------------------------------------- | ---------------- |
| `o-nas`                                 | „podopiecznych"  |
| `dokumenty/projekty-unijne/index` (×2)  | „pensjonariuszy" |
| `dokumenty/dotacje/2021`                | „podopiecznym"   |
| `dokumenty/dotacje/2019-2018-2016` (×2) | „placówkach"     |

Only the `o-nas` instance is unambiguous — it is the Dom's own prose and should read
„Mieszkańców". The other five sit inside grant and EU-project descriptions that appear to
be quoted official wording, where CLAUDE.md's only stated exception (the statutory
facility type) does not obviously extend. This needs the owner's call before anything is
rewritten.

## Phasing

| Phase                    | Sections                                                                              | Effort |
| ------------------------ | ------------------------------------------------------------------------------------- | ------ |
| 0 — Defects              | §5 menu dismissal + lockup, §7 reveal retune and focusin, §8 lightbox, §9 tap targets | ½ day  |
| 1 — Layout               | §1 shell, §2 spacing, §4 cards and grids, §5 sticky header, **§6 SectionNav**         | 2 days |
| 2 — Arch and photography | §3 in full                                                                            | 1 day  |
| 3 — Wayfinding           | §6 breadcrumbs                                                                        | ½ day  |
| 4 — Type and performance | §9 fonts, LCP                                                                         | ½ day  |

**Phasing correction.** Both advisors independently found the same bug in the original
plan: the rail was phase 1 but everything that fills it was phase 3, so phase 1 would have
shipped an empty rail and been unverifiable. They proposed opposite fixes — Fable to push
the rail down into phase 3, Codex to pull `SectionNav` up into phase 1. Taking Codex's:
pushing the rail down means shipping centred prose in phase 1 and then rebuilding it as a
grid later, which is the same layout work done twice. Breadcrumbs stay in phase 3; they
depend on nothing.

Phases are otherwise independently shippable and each is verifiable before the next
begins. Phase 2 flags individual photos needing manual crops rather than blocking on them.

## Verification

Per phase:

- `bunx astro check` clean for every touched file.
- `bun run build` with full output; every warning reported.
- Re-run the headless capture set at 1440×900 and 390×844 and diff against the baseline
  captured on 2026-08-07.
- Re-measure: mobile header height, `ArchImage` ratios, tap-target minimums, font bytes
  and request count.
- Keyboard pass: skip link, tab order, focus visibility, mobile menu Escape, and tabbing
  into a not-yet-revealed section (must reveal on `focusin`, never focus something at
  `opacity: 0`).
- Confirm skip-link and TOC targets land clear of the sticky header.
- Confirm `SectionNav` ids all resolve, and that its DOM order is identical at 390px and
  1440px.
- Confirm `prefers-reduced-motion: reduce` still removes all movement, and that JavaScript
  disabled still yields fully readable pages with all content visible.

## Open questions

**One, blocking §11 only.** Five of the six forbidden-vocabulary instances sit inside what
appears to be quoted grant and EU-project wording („pensjonariuszy", „podopiecznym",
„placówkach"). CLAUDE.md's only stated exception covers the statutory facility type. Does
that exception extend to quoted funding documents, or should the wording be corrected to
the Dom's own vocabulary throughout? Nothing else in the plan depends on the answer.

The accessibility-declaration review in §11 is not a question for me — it needs the Dom.
