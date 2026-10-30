# Rule of Thumb: direction

The site follows the v5 "arcade" direction (`redesign/v5-playground.html`, built into `src/arcade.css`). This file covers the Rule of Thumb pass: the index, the article pages, and a thumbnail for every rule. The earlier light direction is archived in `redesign/archive/DIRECTION-v0-light.md`.

The `redesign/` prototypes and `shots/` captures this file cites are no longer in the working tree; read them from commit `47d3d62`, for example `git show 47d3d62:redesign/v5-playground.html`.

## Brief

**Who arrives.** There are two groups:
- Front-end engineers who got an article link from a colleague, X or LinkedIn. They land on one article, read part of it, and decide whether the rest of the shelf is worth a look.
- Hiring managers who came from the home page and use the shelf as proof of how Faqih thinks.

**The one action.** Open the next rule. On the index, that means picking a rule. On an article, it means reaching the end and taking the next-rule card.

**Feel.** *Playful, legible, exact.*
- Playful keeps the arcade's select-screen energy.
- Legible pulls back toward long-form reading, because these are articles people read for ten minutes.
- Exact means each thumbnail shows the rule itself, not a generic icon.

## Anchors

1. **The site's own v5** (`src/arcade.css`) is the theme to match:
   - Ground `#0e0e13`, panel `#17171f`, panel-2 `#20202b`, hairline `#2c2c3a`.
   - Category hues: cyan `#4dd4ff` for Code Writing, pink `#ff6ad5` for UX, amber `#ffb02e` for Architecture, green `#7dff6a` for Best Practices, violet `#9d7bff` for Accessibility. Yellow `#ffe14d` is the action colour.
   - Unbounded 700/900 for display, Inter for body.
   - Hard-cut motion on `--snap: cubic-bezier(.34,1.56,.64,1)` and `--out: cubic-bezier(.16,1,.3,1)`.
2. **recent:q1jsa1k-cloudflare-customer-story-cards**: monochrome art matched to each card's hue.
   - Each card's art uses only lighter strokes of that card's own colour on a field of the same hue, so a row of different hues still reads as one set.
   - The art fills the upper ~60% of a portrait card, with the copy bottom-aligned at 16px padding.
   - Small labelled overlay boxes pop on and off over the art, so the art looks "inspected".
   - Taken: one hue per thumbnail, tints of that hue only, and one state chip that changes during the loop.
3. **uiarc:speculative-decoding** (moving): an illustration that *is* the concept.
   - Chips arrive one at a time, then a left-to-right sweep stamps each one with a verdict.
   - Probe values: chip transitions at 160ms `cubic-bezier(0.22,1,0.36,1)`, entrances at 340ms `cubic-bezier(0.16,1,0.3,1)` staggered by 50ms, a strike-through at 180ms, and narrating microcopy that changes in step.
   - Reduced motion: 0 moving. 60fps.
   - Taken: each thumbnail plays a short loop of the rule happening, with a caption chip that names the current beat.
4. **recent:i3io5ld-grokipedia-book-covers**: one cover system for a whole shelf.
   - Every entry gets its own colour and art, while the frame, title position and mark stay the same.
   - Thirty spines still read as one set.
   - Taken: the thumbnail is one component (same 16:10 screen, dot grid, chip slot and corner). Only hue and art change per rule, which is what lets the shelf grow to 100.
5. **21st:syeddhasnainn.research-report** (moving): a contents rail made of ticks for long reading.
   - A column of short ticks sits in the margin, and the active tick extends, with a 300ms `cubic-bezier(0.23,1,0.32,1)` transition.
   - The probe flags its width transition as a layout cost, so this build uses `scaleX` instead.
   - Taken: an article contents rail of ticks, one per `h2`, where the active tick grows in the rule's hue.

## Direction

### Type

| Role | Font and size | Notes |
| --- | --- | --- |
| Article H1 | Unbounded 900, 52px desktop / 36px mobile, leading 1.02 | Tracking -0.04em, as in the v5 hero h1 |
| Article H2 | Unbounded 700, 28px / 24px | Tracking -0.03em, 1.3x the H3 |
| H3 | Inter 600, 20px | Left as the articles have it, apart from colour |
| Lead paragraph | Inter 400, 19px / 1.55, `--dim` | The emphasised second line is `--text` |
| Body | Inter 16px / 1.65 | The 768px column keeps it near 70ch |
| Labels | Unbounded 500/700, 11–12px | Rule number, topic, nav and chip labels, as in the v5 `.tag` and `.tile .n` |
| Code tokens in thumbnails | Geist Mono 9–10px (SVG units) | `styles.ts`, `null` and similar. Code is the only thing set in mono. |

### Color
- **Neutrals** carry the page, using the v5 tokens above.
- **Topic hue (`--c`).** Each rule takes its topic hue. It may appear on:
  - the number and topic label,
  - the thumbnail art,
  - the 2px border of the hero thumbnail frame,
  - the active contents tick,
  - the next-rule card's border on hover,
  - the 4px top stripe of a tile.
  Body text, headings and demos never take it; demos keep their own semantic colours.
- **Yellow `--go`** is kept for actions and focus: the focus ring, the search focus and "Email me". The Markdown button stays neutral (`btn soft`).
- **Thumbnail field:** `color-mix(in srgb, var(--c) 9%, #101017)`.
- **Thumbnail art:**
  - strong strokes in `--c`,
  - highlights in `color-mix(var(--c) 55%, white)`,
  - dim parts in `color-mix(var(--c) 30%, transparent)`.
- **Dot grid:** `--c` at 14%, on an 8px pitch.

### Layout
- **Index.** Keep the v5 select layout: the 340px sticky panel plus the grid.
  - Tiles become cartridges: a 16:10 thumbnail screen on top, then the number row, then the title.
  - The grid minimum is 168px. That gives 4 columns at 1440px, 3 at 1024px and 2 at 390px.
  - The panel's big art becomes the same thumbnail at 300px wide.
- **Article.**
  - Width: the 768px column (`max-w-3xl`) for reading.
  - Hero: a two-column grid inside it, text on the left and a 280px thumbnail on the right. On mobile the thumbnail stacks under the actions.
  - A breadcrumb row "← All rules · No.002 · UX Design" sits above the H1.
  - Bottom: a two-card "Previous / Next" row, each card with a 96px thumbnail beside its title.
- **Contents rail.** Fixed to the left edge at 24px from 1280px wide up, with 18px ticks spaced 12px apart. Hidden below 1280px.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.

### Imagery
Every visible rule gets a hand-made SVG thumbnail (viewBox 160×100), animated with CSS keyframes:

| Rule | Loop (≈3.2s) | Still frame | Chip |
| --- | --- | --- | --- |
| Proximity Principle | `styles.ts` sits in `shared/`, far from `OrderCard/`. A dashed link from `OrderCard.tsx` to it is long. The file slides into `OrderCard/` and the link shrinks to nothing. | file inside `OrderCard/` | `FAR` → `NEAR` |
| Button Design | A cursor arrives, the button lightens (hover), presses (scale .94), spins (`Saving…`) and lands on `Saved ✓`. A row of 5 pips marks each state. | `Saved ✓`, all pips lit | `IDLE` / `HOVER` / `PRESS` / `LOAD` / `DONE` |
| Data Loading | Cached rows show at once, dimmed. A revalidate bar sweeps the top edge, and row 2 changes value and flashes. | fresh rows | `STALE` → `FRESH` |
| Null vs Undefined | Two slots. `undefined` is a dashed outline with a blinking `?`. A solid box with `∅` drops into the `null` slot. | both slots filled as described | `MISSING` / `EMPTY` |
| Any rule without art | The topic glyph, centred on the dot grid in the same frame. | — | — |

The fallback lets the shelf grow to 100 rules before each one has custom art.

### Motion
| Moment | Trigger | Properties | Curve / duration | Reduced motion | Source |
| --- | --- | --- | --- | --- | --- |
| Thumbnail loop | `[data-play]` on an ancestor: the selected tile, the select panel, the hovered next-rule card, and the article hero for 2 loops | transform, opacity only, as keyframes with 4 beats and per-beat `--out` easing | 3200ms | no animation; the designed still shows | uiarc:speculative-decoding |
| Tile select | hover or focus | existing lift (−4px, scale 1.04) and sibling dim to 25%; the thumbnail starts playing | 220ms `--snap`, dim 160ms ease | colour and opacity only | v5 |
| Panel swap | selection changes | thumbnail enters `translateX(-60px) scale(.7)` → 0 | 380ms `--snap` | none | v5 `.sel .big` |
| Article hero entrance | load, once | breadcrumb, H1, lead and actions move `translateX(-24px)` → 0 with opacity, staggered 60ms; the thumbnail goes scale .9 → 1 | 380ms `--snap` | opacity, 200ms | v5 cut-in |
| Contents tick | active section changes (IntersectionObserver) | `scaleX` 1 → 2.2 and colour to `--c` | 300ms `cubic-bezier(.23,1,.32,1)` | colour only | 21st:research-report |
| Next-rule card | hover or focus | `translateY(-4px)`, border to `--c`, thumbnail plays | 220ms `--snap` | border colour only | v5 tile |

**What stays still:** the article body, demos (they have their own controls), headings after their entrance, and every thumbnail not being pointed at. Only one thumbnail loops in the grid at a time, plus the panel's copy of the same rule.

### Shader
None. The thumbnails are the moving signature, and a shader ground would compete with long-form reading.

### Moves
- `monochrome-hue-matched-card-art`: one hue per rule keeps a shelf of up to 100 rules coherent.
- `state-narrating-microcopy`: the chip names each beat, so the loop teaches the rule even on a small tile.
- `hover-focus-dims-siblings`: kept from v5 on the grid.
- `colour-maps-to-meaning`: the topic hue means the topic everywhere: tile, panel, cover, rail, next card.

### Signature
**Every rule is a cartridge that plays its own rule.** Point at a tile and its screen acts the rule out in three seconds:
- a styles file walks over to the component that uses it,
- a button runs through all five states,
- stale rows revalidate,
- a `null` box drops into the slot that `undefined` leaves empty.

The same cartridge is the article's cover and the "next rule" card, so a visitor learns the shelf by its pictures. None of the anchors makes the thumbnail a demonstration of the content it covers.

## Sameness check (planned)
Only one house-style trait is shared: numbered items ("No.002"). The page avoids the rest:
- the ground is near-black, not warm paper;
- there are five topic hues plus yellow, not one orange accent;
- the display face is Unbounded 900, not a light serif;
- labels are set in display type, not mono microlabels;
- there are no ruled rows;
- there is no dark closing band with a giant wordmark.

## Critique, round 1
Shots: `shots/rot/r1-index`, `shots/rot/r1-article`, `shots/rot/r1-proximity`.
- **Squint (1440).** The eye lands on the H1, then the cover, then "View Markdown", then the first demo. The cover is the brightest thing in the hero but sits second because of the H1's size. That is the intended order.
- **Type.** H1 46px, then H2 Unbounded 28px, then H3 Inter 20px (about 1.4× each step). Display tracking is tightened. The 768px column keeps body text near 70ch. The H2 override beats the StyleX classes, which the shots confirm.
- **Color.** Neutrals carry the page, with one topic hue per article: the crumb, the cover and the active tick. Yellow appears only on "Email me". There are three hues on screen, counting the demo's blue.
- **Space.** The hero, the first section and the pager follow 24/48/64 steps.
- **Gaps found:**
  1. Button thumbnail: during the LOAD beat, the `Saving…` label ran over the spinner (Unbounded at 10px is wider than planned).
  2. At 390px the cover was 300px wide and centred. It pushed the first section below the fold and broke the left edge the H1 and actions sit on.
- **Detail specificity.** The page has real rule content in every thumbnail: `styles.ts` walking into `OrderCard/`, the five button states, `$8 → $14` revalidating, and `null` filling the slot that `undefined` leaves empty. It also has the rule number, the topic-hued contents rail, and a next card that previews the next rule's art. That is 7 product-only touches; the best anchor (uiarc:speculative-decoding) has about 4.
- **Sameness.** Only one house-style trait is shared (the numbered items).

Fixes: the spinner moved to x=52 and `Saving…` is now 8px at x=88. The mobile cover is now 240px and left-aligned with the text.

## Critique, round 2
Shots: `shots/rot/r2-null`, `shots/rot/r2-data`. Motion: `shots/rot/r2-motion`, `r2-motion-390`, `r2-motion-index`.
- **Motion, index.** The tile stagger is 320ms `--snap` at 18ms steps, and the panel thumb enters in 380ms `--snap`. Only the selected rule's loop runs (3200ms `--out`). The dim is 160ms. Findings: none. Under reduced motion, 0 animations run.
- **Motion, article.** The crumb, H1, lead and actions enter at 380ms `--snap` with 60ms steps, and the cover at 420ms, +120ms. The cover loops twice and then holds the still frame. The rail ticks transition at 300ms.
- **Explained findings:**
  - `long-entrance` flags the cover's two 3.2s loops. They are an illustration, not an entrance: the H1 is readable by about 500ms.
  - `layout-property`, `reduce-*` and the canvas all come from the existing Button Design demo (StyleX classes, its own cursor canvas). They were not touched in this pass.
  - Everything inside `.arc` stops under reduced motion.
- **Mobile (390).** The hero leads with the H1 and the actions. The 240px cover follows on the same left edge. The pager stacks to one column. Nothing overflows.
- **Spinner fix.** It holds at every size in the LOAD frames.

Remaining nits:
- Hidden rules (typescript, table, dialog, timestamps) use the glyph fallback until they get art.
- The article demos keep their own blue, by design.

---

# Home hero: the bench (Anatomy pass)

## Brief
**Who arrives.** Hiring managers and engineers landing on the home page for the first time.
**The one action.** Email Faqih. "Read my rules" is the second action.
**Feel.** *Exact, mechanical, playful.* The hero should look like a precision instrument, while the arcade palette and the rotating headline keep it fun.
**Request.** Add a fifth headline, "I build reliable tests". The right side becomes one 3D illustration built with the Anatomy skill (github.com/wheresryan22/anatomy, MIT). The tabs, captions and state buttons go.

## Anchors
1. **Anatomy `examples/dial-indicator` and `examples/push-button`** set the drawing quality for every part:
   - a base plate on feet, a groove inset 5, corner screws as 0.5 dots inside 2.2 rings;
   - a ruler strip with ticks every 4 and a major every 5th;
   - four-tone sides, 0.6px lines, one lit part.
   - Camera: azimuth 42°, elevation 30°.
   - Motion: exponential follow (τ 0.28s), and springs at stiffness 420.
2. **anatomy:collection.mutex**: a concurrency bug told as a machine (two pumps, one interlock key). This is the idea to take: each headline gets a machine whose working *is* the claim.
3. **designspells:animated-isometric-illustrations-in-airbnb's-filters**: one line drawing per option, swapped in the same frame and at the same scale when the option changes. This is how the bench changes machine with each headline.
4. **21st:eugeneshilow.agentic-factory-3d** (moving): a pipeline drawn as a small machine on a dark stage, where a token travels station to station. It is the model for the Agents machine.

## Direction
- **Imagery.** Five machines share one bench: the same 260×140 base plate, the same camera (azimuth 40°, elevation 30°), the same scale and the same viewBox. The plate stays put and only the machine on it changes.
  1. **Interfaces that behave:** a key-switch test rig. A probe on a post lowers onto a `SAVE` keycap: hover, press, pending, done. Five state lamps on a strip light in turn, and the last one is green.
  2. **Agentic setups that work:** a conveyor. A puck (the change) passes a tool stamp, then a gate with three check lamps (lint, types, tests), then lands in a review tray, where a flag goes up.
  3. **Dev tools that save hours:** a jig press. Blanks slide from a hopper under the ram, get stamped, and stack on the output side, while a gauge needle steps forward with each part.
  4. **APIs that stay fast:** one trip with a batch. A cart loads six records from a rack all at once, makes a single run to the counter, and unloads.
  5. **Reliable tests:** a repeatability rig. A dial gauge measures the same block five times, the needle lands on the same mark every time, and five tally lamps go green.
- **Color.** The figure sits directly on the page ground: paper is `#0e0e13`. The neutral tones are retuned toward the arcade's blue-greys. The single `lit` accent uses the slide's hue (`--c`, the same colour as the headline's highlighted word), so the word and the moving part read as one. Green `--ts` appears only on "pass" lamps, where colour means pass.
- **Layout.** The right column holds the bare figure: no card, no tabs, no caption. Under it is one quiet row: five progress pips (which can be clicked, and announce the slide name) and pause. These are kept because a headline that rotates on its own needs a way to pause and to choose a slide (WCAG 2.2.2).
- **Motion.** Each machine runs a timed loop (5.5–7s) while its slide is active and on screen, written as `pose(t)` on refs (no React re-render per frame). Parts move with eased segments (`out` cubic) and springs. Swapping machines takes 420ms: the new one fades in and rises 10px on `--out`, while the old one fades out over 200ms. Under reduced motion the loop does not run, each machine shows its finished state (done lamp, flag up, the stack full), and slides only change when the user picks one.
- **Shader.** None. These are SVG machines, and lamp glow is a fill change.
- **Moves.** `isometric-explainer-figure` (Anatomy), `physical-metaphor-for-data-structure`, `inactive-by-luminance` (unlit lamps sit at `lo`).
- **Signature.** The headline names the work and the bench below it does that work: change the headline and the machine on the plate changes with it.

## Critique, round 1 (hero bench)
- **Squint.** Headline, then the yellow Email button, then the bench. The bench read as a dim smudge: the structure tones (lo #3d3d4e at 0.75px) disappeared against #0e0e13 at 1x. **Fix:** lo → #4a4a5e, mid → #7d7d96, faint → #30303f, top → #21212d, weight 0.9px.
- **Size.** The plate filled about 75% of the column, but the camera fit left empty headroom. **Fix:** fit padding 14 → 6, and on desktop the figure runs 56px past the column into the gap.
- **Motion probe** (1440 and 390, `shots/hero-3d/motion-*.webp`): 57fps, p95 16.8ms, rAF only while a machine runs (35/s). Reduced motion: 0 moving, 0 rAF. Each machine shows its finished frame, checked by capture: done lamp, flag up, stack of three, batch on the counter, five passes. Findings are explained, not bugs: the 420ms machine swap is a scene change, not control feedback; the 7.6s pip bar is the slide timer.
- **Bug found:** the belt's dashed flow line kept animating while the Agents figure was hidden. **Fix:** the flow runs only under `.bench-fig.on`.
- **Hues.** Neutrals carry the bench. One slide hue per machine (on the subject part and the state lamps), and green only on pass lamps. On the APIs slide the hue is green too, which is fine: it's the slide colour, not a second accent.
- **Specificity.** The machines act out each claim: SAVE key states, three checks before review, hours counted per stamped part, one batched trip instead of N, and the same reading five times. None of the anchors tells a career this way.
- **Generated tells.** None added: no captions or pills over the visual, and no card around it.

## Critique, round 2 (hero bench)
- Desktop and 390 captures in `shots/hero-3d/desktop.png` and `mobile.png`. The bench now holds its own against the headline without competing with it. At 390 the headline and both actions stay above the fold and the bench follows.
- **Nit:** the dev-only floating widgets sit over the pause button at 390. They are not in production.
- **Cost:** the five machines ship as SVG strings, about 53KB gzipped inside the home route chunk (103KB gzipped total). This is acceptable for the hero image. If it ever matters, the next step is to lazy-load machines 2 to 5.

# Cards: game-panel pass

## Brief

**Who arrives.** The same two groups as above: engineers who land on an article, and hiring managers who come through the home page. Both spend most of their time looking at cards: project cards, rule tiles, the experience list, and article panels with code, demos, tips and verdicts.

**The one action.** Pick a card. That means a rule tile, the next-rule card, or a project. Every other card is there to be read.

**Feel.** *Toy-like, legible, tactile.*
- Toy-like means cards look like physical game pieces: raised panels, slots sunk into them, a selection cursor.
- Legible pulls against that. Article text inside the panels is read for minutes at a time, so the game language stays on the frame and never touches the copy.
- Tactile means a card you can press behaves like the arcade keys on the site's buttons: it rises on hover and sinks on press.

## Anchors

1. **recent:0t0c08y-ghost-skater-pixel-game** (Ronnie's Pro Skater). The pixel world carries all the personality while the UI chrome stays a quiet sans caption ("Press space to skate"). Taken: game styling goes on the frames, and body copy stays in the plain Geist body face.
2. **21st:shadcnspace.shine-border-06**. Four corner brackets frame a card like a camera locking focus. Its 2400ms opacity loop fails reduced motion, so the loop is not taken. Taken: four corner brackets only, 12px legs, used as a selection reticle that appears on hover or focus and never loops.
3. **21st:theorcdev.8bit-hover-card**. A near-black panel with a hard 2px outline appears over 150ms on `cubic-bezier(.4,0,.2,1)`. Taken: hard square-cut edges and no soft blur shadows; every shadow on a card is a solid offset.
4. **anatomy:community.entity.game-boy** with the move `skeuomorphic-hardware-controls`. A raised plastic body has a recessed screen well, and the screen is the one coloured thing on it. Taken: panels are raised (a 2px top highlight and a 3px bottom shade inside the edge, plus a 4px hard drop) and icon slots are sunk (a 2px inner shadow at the top), so every panel has a body and a well.
5. **bencho:tilt** (moving). The card sinks under the pointer on a 280ms `cubic-bezier(0.33,0.55,0.2,1)`. Taken: the press sinks the card into its drop shadow, from 8px to 1px, over 100ms.
6. **The site's own buttons** (`.btn`, `.rot-page [data-variant]`). Chunky keys with a hard 3px bottom edge in a darker shade. Taken: cards use the same press mechanics as these keys, so clicking a card feels like clicking a button.

## Direction

### Type
No change. Unbounded 700 for card titles and labels, and Geist for body text (from anchor 1: game styling goes on the chrome, not the copy).

### Color
- Neutrals carry the panels: `--panel`, `--panel-2` and `--hair` are unchanged.
- New tokens:
  - `--bevel-hi`: `rgba(255,255,255,.06)` in dark, `rgba(255,255,255,.9)` in light. The inner top edge.
  - `--bevel-lo`: `rgba(0,0,0,.32)` in dark, `rgba(30,30,60,.07)` in light. The inner bottom edge.
  - `--drop-ink`: the existing hard drop colour, `#0a0a0e` in dark and `#c5c5d1` in light.
- Each card's hue `--c` stays where it already is (top bar, labels and the hover border), and also colours the reticle. Yellow `--go` is the reticle colour for cards that have no hue of their own.

### Layout
No change to grids or spacing. Radii stay the same so the cards keep matching the buttons and chips.

### Imagery
No new imagery. The thumbnails stay as they are; the reticle is pure CSS (eight gradient legs on one `::after`).

### Motion
All card motion uses the existing tokens `--snap` and `--out`, plus `ease` for colour.

| Moment | Trigger | Properties | Curve and duration | Reduced motion | Source |
| --- | --- | --- | --- | --- | --- |
| Lift | hover or focus on a pickable card | `translateY(-4px)`, drop grows from 4px to 8px | `--snap`, 220ms | no movement; the drop is still applied | anchor 6 |
| Press | `:active` | `translateY(2px)`, drop shrinks to 1px | `ease`, 100ms | no movement | anchor 5 |
| Reticle lock | hover or focus on a pickable card | brackets go from opacity 0 at `scale(1.08)` to 1 at `scale(1)` | `--snap`, 200ms; fades out over 120ms | fades only, no scale | anchor 2 |

What stays still: reading panels (code, verdicts, tips, demos) get the bevel and drop but no lift, because nobody picks them. The existing small hover nudge on tip slots stays.

### Shader
None. The site already has a dithered dot-matrix backdrop, and a dither inside cards would compete with code and demos that people read.

### Moves
- `skeuomorphic-hardware-controls`: raised panels and sunken wells make the cards look like hardware.
- `technical-annotation-overlay`: only the corner brackets are taken, and they mean "selected", not measurement.

### Signature
**The select reticle.** Four chunky corner brackets in the card's own hue snap onto whichever card the pointer or keyboard focus is on, the way a fighting-game character-select cursor locks onto a fighter. It works the same on rule tiles, project cards, next-rule cards and feature tiles, and it reuses the site's "select screen" idea (`.select`, `.sel`), so the whole site has one cursor.

## Critique, round 1 (cards)

Shots: `shots/cards/home-tiles-{dark,light}.png`, `shots/cards/home-projects-{dark,light}.png`, article captures at 1440.

- **Squint.** On the home page the eye lands on the featured rule panel first, then the reticle-locked tile, then the filter chips. The reticle draws the eye only to the card you are on, which is what it is for.
- **Type and space.** Unchanged by this pass: Unbounded display, Geist body, and the existing 4px radius and padding scale.
- **Colour.** Light mode works: white bevel highlights on raised panels with a pale drop. In dark mode the hover drop used `--drop-ink` (#0a0a0e) on a near-black page, so the lift looked like a plain translate with no key under it. **Gap.**
- **Motion.** The lift (220ms `--snap`), press (100ms) and reticle lock (200ms `--snap` plus a 120ms fade) all fire. Under reduced motion the transforms are dropped and only the reticle fade and border colour remain.
- **Detail specificity.** The hue-coloured top bar on tiles, sunk thumbnail screens, recessed icon wells in article features, and title bars tinted with the rule's hue. Each one ties to the site's own rule hues and button keys, not a generic card kit.
- **Generated tells.** None added. The reticle is a game "select" device that marks the card you are on, so it is not decoration.
- **Gaps.** (1) The dark hover drop is invisible. (2) The article feature cards had a translate lift as well as a border change. That is a hover lift on a static, non-clickable panel, which promises a click that does nothing.

Fixes: the hover and press drops now use `--key`, the card's own hue mixed toward black (42% in dark, 72% in light). Feature cards no longer lift and change only their border on hover.

## Critique, round 2 (cards)

Shots: `shots/cards/home-tiles-dark.png`, `shots/cards/home-projects-dark.png`, `shots/cards/article-pager-dark.png`, `shots/cards/rot-index-light.png`, `shots/cards/article-390-dark.png`, `shots/cards/home-390-dark.png`.

- **Colour.** The dark hover now sits on a visible hue key (orange under Data Loading, pink under ruine UI), so a lifted card reads as a pressed-up keycap. There is one accent per card, and it is that card's own hue.
- **Index and pager.** The Rule of Thumb index uses the same tiles, so it inherits the lift, reticle and key. The article pager card locks the reticle and lifts on hover, and the "Back to all rules" end panel stays static and raised.
- **Mobile (390).** The home project tiles and badges keep their raised bevel and drop. Article cards stay full-bleed below 40rem because of the existing container rule (`src/styles.css:1159`), which gives demos the full width. The bevel and top bar still mark them as panels, so this is kept on purpose.
- **Sameness.** It shares none of the house-style list: dark arcade ground, Unbounded display, and no paper, serif or vermilion.
- **Remaining.** Nit only: the data-loading "Simulate Error" demo button keeps its old style. It is a button, not a card, so it is outside this pass.

# Home load-in and fixed header

## Brief

The visitor is a hiring manager or founder who opened the link from a message. The page exists for one action: **email Faqih**. Feel words: **punchy, patient, legible**. Every entrance should hit like a game panel landing, yet no content waits on it. A section that is already on screen when it loads plays its entrance once, and nothing replays on scroll back.

## Anchors

- `uiarc:user-menu`: the staggered entrance, with opacity at 340ms `cubic-bezier(0.16, 1, 0.3, 1)` (the site's `--out`) and items 16 to 50ms apart. Taken: `--out` for panels, with a 40ms step per item.
- `21st:radiumcoders.click-powerup`: a game HUD charge-up on a sampled spring. Taken: an overshoot on small pieces (badges and chips) through the site's `--snap` (`cubic-bezier(0.34, 1.56, 0.64, 1)`), which gives one visible overshoot.
- `21st:cnippet-dev.scroll-reveal-2`: card columns that start when they come into view. Taken: the trigger rule (fire once on entering view, never reverse) and the left-to-right order.
- `21st:theorcdev.8bit-loading-screen`: stepped, segmented 8-bit timing. Taken: the eyebrow labels blink on with `steps(1)` (off, on, off, on over 360ms) instead of fading.
- `21st:motiondotdev.motion-scroll-hide-header`: a header that reacts to scroll, with a 200ms ease. Taken: only the 200ms ease on the header's background change. The hide-on-scroll-down behaviour is not taken, because the request is a navbar that stays put.

## Direction

**Timing tokens** (`motion-token-scale`) in `:root`: `--t-step: 40ms`, `--t-pop: 420ms`, `--t-panel: 560ms`, `--t-bar: 200ms`. Curves stay as before: `--snap` for small pieces, `--out` for panels, `--cut` for wipes.

**Trigger.** The existing `[data-cut]` observer (rootMargin -12% at the bottom) adds `.in` once. It now starts observing only after the intro hands off (`started`), so nothing plays under the shutter. Without JS, and with no `.js` class, everything shows at rest.

| Moment | What moves | Curve and duration | Reduced motion |
| --- | --- | --- | --- |
| Header (first paint) | Bar drops from -100% to 0 | 400ms `--out` | Static |
| Header (scrolled past 8px) | Gains a panel background, hairline and 4px hard drop | 200ms ease | Same: colour only |
| Hero (on start) | Tag blinks on; headline keeps its pop and slash; lead rises 16px at +140ms; buttons pop from 0.6 at +240ms and +290ms; bench rises 32px from 0.94 at +100ms | `--out` 560ms; pops `--snap` 420ms | Fade only, 240ms |
| Ticker | Clip wipe left to right | 640ms `--cut` | Fade only |
| Section eyebrows | 8-bit blink on, `steps(1)` | 360ms | Fade only |
| Section headings | Existing pop-in, kept | 500ms `--snap` | Fade only |
| Rule tiles and project cards | Dealt like cards: from 0.6 scale and -6deg, 40ms apart | 420ms `--snap` | Fade only |
| Rule select panel, filter chips, search | Panel rises 24px; chips pop 40ms apart | `--out` 560ms; `--snap` 420ms | Fade only |
| Stack badges (signature) | Power-up collect: each badge pops from 0.3 and flashes its real brand colour on the border and icon, then settles back to neutral, 30ms apart | 520ms `--snap` | Fade only, no flash |
| Experience rows | Existing stepped flick, kept | 420ms `steps(1)` | Fade only |
| Contact panel | Rises 40ms onto its gold drop; then the buttons pop | `--out` 560ms; buttons +180ms | Fade only |
| Footer | Rises 12px | 400ms `--out` | Fade only |

**What stays still:** the backdrop, the ticker's marquee speed, and hover and press feedback, which keep their existing timings. Nothing animates on scroll back up.

**Shader:** none. The page's ground is already set and the motion lives in the panels.

**Moves:**
- `spring-and-rubber-band-physics`: one overshoot on small pieces, with a 30 to 50ms stagger.
- `motion-token-scale`: the four timing tokens.
- `branded-intro-sequence`: the order runs intro, then header, then hero, then sections, and the existing name intro stays the mark.

**Signature:** the stack badges get "collected" like power-ups. Each one pops in and flashes its own logo colour (the same colour as its hover) in a quick left-to-right run, then settles to neutral. None of the anchors does this, and it reuses the real brand data from the badges.

**Fixed header:** a full-width fixed bar (`.arc-bar`, z-index 50) holds the 1200px header wrap. `main` gets a 72px top offset and `html` gets `scroll-padding-top: 88px`, so hash links (#work, #projects) land below the bar. The sticky `.sel` panel moves from 20px to 92px.

## Critique, round 1 (load-in)

Shots: `shots/load/hero-150ms.png`, `hero-400ms.png`, `rules-120ms.png`, `projects-250ms.png`, `projects-done.png`, `work-hash-light.png`, `article-scrolled.png`, `home-390-top.png`, `home-390-projects-300ms.png`.

- **Squint.** At 150ms the eye gets the tag, then "I build", with the bench rising behind and the ticker wiping in from the left. By 400ms it rests on the headline, then the gold Email button, then the bench. The order matches the brief.
- **Motion.** Tiles and project cards come in dealt at a tilt, and the badges show the collect flash in mid-run (TypeScript blue, React cyan). Sections already on screen at load play once, and nothing replays on scroll back.
- **Fixed bar.** It holds at top 0 in dark, light and on articles. A hash link lands with #work at 88px, just under the bar. The sticky rule panel now clears the bar at 92px.
- **Mobile (390).** The hero leads with the headline and the action. The page doesn't scroll sideways (scrollWidth 390), and the deal and collect still read at that size.
- **Gaps.** (1) The scrolled bar's background was 94% opaque, so the "Rapidev" row read through it at the top edge. (2) The footer never received `.in`. It is the last element, so it can never rise above the observer's 12% bottom inset, and it stayed invisible.

Fixes: the bar's background is now solid `--bg`. The footer's entrance is tied to the contact panel (`.end.in ~ footer`, 300ms later) instead of its own trigger.

## Critique, round 2 (load-in)

Shots and motion sheets: `shots/load/`, including the probe sheets for the top at 1440 and for 390.

- **Motion probe.** Every planned moment appears with its planned curve:
  - bar 400ms `--out`;
  - tag 360ms `steps(1)`;
  - lead-in 420ms `--snap`;
  - slash 520ms `--cut`;
  - lead 560ms `--out` at +140ms;
  - buttons 420ms `--snap` at +240 and +290ms;
  - bench 560ms `--out` at +100ms;
  - ticker wipe 640ms `--cut`.
- **Findings, explained.**
  - `long-entrance` is the hero's slide-timer pip (7600ms linear). It is a timer, not an entrance.
  - `reduce-moves` doesn't reproduce: with reduced motion emulated before load, `document.getAnimations()` is empty. After a full scroll, every hidden-at-rest element ends at opacity 1 in both modes, and 0 `[data-cut]` blocks are left without `.in`.
  - `reduce-canvas` is the existing backdrop canvas, which predates this pass and is noted for a later fix.
- **Signature check.** Delete the collect flash and the stack becomes a plain fade-in list. The flash is the one moment that shows the badges' real brand data, so it stays.
- **Sameness and generated tells.** Nothing new was added, only motion on existing elements.
- **Remaining.** Nit only: the backdrop canvas still draws under reduced motion.

# Three-line hero, index load-in, and articles as scroll slides

## Brief

- **Home hero:** the visitor reads the claim in one look. Every rotating phrase sits on exactly three left-aligned lines ("I build / X that / Y."), so the headline never changes shape between slides.
- **Rule of Thumb index:** it loads in with the same game entrances as home.
- **Articles:** they stop reading as a document and play like a deck. Each section stands up into place as it scrolls in and tips back as it leaves, scrubbed by the scroll itself.
- **The one action:** keep reading the rule (home: email). Feel words: **toy-like, steady, exact**. The motion is playful, but the text is always readable at rest and nothing is pinned or hijacked.

## Anchors

- `shaders:section.contour-poster-hero`: a three-line black-weight poster title with tight leading and one accented word. Taken: three stacked lines at leading 1.02, with the accent on the last line only.
- `21st:dillionverma.word-rotate` (move `rotating-and-scrambling-text`): the slot is sized to the longest option, so nothing reflows. Taken: every phrase is broken into the same two lines, held in one grid cell.
- `21st:dhxwhy.domino-gallery`: cards lying back in 3D perspective that topple upright one after another as you scroll. Taken: each article block stands up from `rotateX(22deg)` around its bottom edge, at `perspective(1200px)`.
- `pinned-stacked-panel-scroll` (move): the outgoing panel "rises and tilts 1 to 3 degrees, or fades behind". Taken without the pin: a block leaving the top tips back by 8deg around its top edge, scales to 0.94 and dims to 0.25.
- `uiarc:block.exploded-view`: one scroll value drives the whole scene, and it calms under reduced motion. Taken: native `animation-timeline: view()`, compositor-only transform and opacity, and fully static under reduced motion.

## Direction

**Hero type:**
- The same Unbounded 900, with leading 1.02 and tracking -0.04em.
- Line 1 is "I build". Line 2 is the noun plus "that". Line 3 is the highlight plus a full stop.
- The size is capped so the longest line 2 ("agentic setups that") fits the column without wrapping: `clamp(34px, 4.1vw, 52px)` at desktop. At 390px a line 2 may wrap, which still gives three or more lines.
- The Tests slide becomes "tests that / never flake.", so every slide has the same grammar.

**Index load-in:** the shared `useCutIns` hook (extracted from home) runs on the index too, so the `[data-cut]` tiles, chips and panel deal in. This also fixes the tiles that were stuck at opacity 0 after the last pass. The head runs on load: the tag blinks in, the h1 pops, the lead rises.

**Article hero load-in:** on load, the crumb blinks in, the h1 pops (420ms `--snap`), the lead rises at +120ms, the actions pop at +200ms, and the cover stands up at +100ms.

**Article slides:** each direct child of each top-level section block is a slide piece.

| Phase | Timeline | Transform | Opacity |
| --- | --- | --- | --- |
| Enter | `view()`, `entry 0%` to `entry 100%` (capped by `cover 40%` for tall blocks) | `perspective(1200px) rotateX(22deg) translateY(60px) scale(0.92)` to none, origin at the bottom | 0 to 1 |
| Leave | `view()`, `exit 0%` to `exit 100%` | to `perspective(1200px) rotateX(-8deg) scale(0.94)`, origin at the top | to 0.25 |

- The section h2 marker square gets an extra spin-in (rotate 90deg to 0) on the same entry range, so each slide is "stamped".
- **Fallback (no scroll timelines):** a one-shot IntersectionObserver deal-in of the same pieces, at `--t-panel` with `--out`.
- **Reduced motion:** no scroll animation at all. Everything stays static.
- **Stays still:** sticky code panels and the demo internals (their own animations), the pager and the rail.

**Shader:** none, for the same reason as before.

**Moves:** `rotating-and-scrambling-text`, `pinned-stacked-panel-scroll` (adapted, no pin), `motion-token-scale`.

**Signature:** the article plays as a deck of game cards. Each section card stands up off the table as you reach it and tips away as you pass, and only the scroll drives it, so scrolling back plays it in reverse.

### Revision: a pinned deck (replaces "Article slides" above)

The user's correction: the slides must play with progress controlled by scroll, not as per-piece reveals or interactive widgets. The `pinned-stacked-panel-scroll` move is now applied for real, pin included.

**Structure:**
- `RulePage` wraps each child except the pager in `.rot-slide > .rot-card + .rot-tail`. The first slide is the hero (no panel) and the last section never holds.
- A ResizeObserver keeps each card's height in `--h`.
- The card is `position: sticky` at `--pin: min(88px, 100svh - h - 24px)`, so a short card pins under the 72px header and a tall card pins only once its bottom edge is on screen. Nothing gets covered before it has been read.
- The slide carries a `::after` spacer of `h + 24px` and `margin-bottom: -h`. The card holds for exactly the scroll it takes the next card to rise over it, and the document keeps its normal length.

**Scroll-driven moments:**

| Moment | Timeline and range | Change |
| --- | --- | --- |
| Card rise | the slide's own `view-timeline: --slide`, `cover 0%` to `cover 45svh` | `perspective(1400px) rotateX(16deg) scale(.92)` to flat |
| Pieces stand up | each piece's `view()`, `entry 0%` to `entry 100%` | `translateY(40px) scale(.96)` with opacity 0, to rest |
| Card sinks under the next | `.rot-tail`, a 1px marker at the next card's top edge (`timeline-scope: --tail`, `view-timeline-inset: 88px 0`), from the moment the next card touches this one's bottom edge to the next card reaching the header | `scale` to .88, opacity to 0, then `visibility: hidden` |
| Heading stamp | the h2 marker's `view()` | the existing spin-in |

Every moment uses linear easing because scroll is the clock, and scrolling back plays it in reverse.

**Navigation:** the deck HUD and ← → keys aim at the slide wrapper (`top - 88px`), not the heading box. Sticky cards and scrubbed transforms would otherwise skew the target.

**Fallback (no scroll timelines):** nothing pins, and the pieces get the one-shot IntersectionObserver deal-in.

**Reduced motion:** a plain column of cards, static, with no sticky positioning.

**Narrow pages:** demos that bleed to the screen edge bleed only to the card edge.

## Critique, round 1 (pinned deck)

Shots: `shots/deck/dl-1440-s1-*.png` (first build).

- **Gap: the cards didn't pin.** The hold was `padding-bottom`, but a sticky box stays inside its parent's content box, so the card scrolled away. Moved the hold into a `::after` spacer.
- **Gap: empty space at the bottom of each card.** The sections' own `mb-20` (StyleX) stayed inside the card, about 80px. It is now zeroed with `!important` inside cards only.
- **Gap: the code panels broke out of the card at 390.** The global `[data-rule-of-thumb-card]` full-bleed rule (`calc(50% - 50vw)`) applies on narrow pages. Inside a card the panel now bleeds to the card edge (-12px).
- **Gap: ← → overshot by about 110px.** The target came from the heading's box, which `card-rise` was transforming. It now aims at the wrapper.
- **Squint:** the eye lands on the pinned card's heading, then the incoming card's heading as it climbs. That's the intended reading order.

## Critique, round 2 (pinned deck)

Shots:
- `shots/deck/dl-1440-s1-{0,0.4,0.75}.png`: a short card pinned, half covered, then nearly gone.
- `dl-1440-tall-s3-0.5.png`: a tall card pinned by its bottom edge.
- `dl-1440-hero-0.5.png`: the hero sinking under slide 1.
- `nu-390-s1-0.5.png` and `nu-390-s2-0.15.png`: mobile.
- `proximity-principle-`, `button-design-` and `dialog-design-1440-s2-0.5.png`: light theme.

Checks:
- **Motion:** pinning, covering and sinking all reverse when you scroll up.
- **Navigation:** stepping with the keys lands each slide pinned at 88px with the previous slide at opacity 0.
- **Reduced motion:** `position: static`, `animation: none`, no spacer.
- **Fallback:** with `CSS.supports` patched, all 22 proximity pieces get `.in` (the piece that was stuck last pass now gets it).
- **Mobile:** no horizontal overflow at 390.

Nits left:
- The HUD title switches once the incoming heading crosses 30% of the screen, a little before that card pins.
- In dev, the PostHog toolbar and the TanStack devtools button still overlap the HUD. Neither ships.

# Rule of Thumb articles: polished game writing

The deck pass is withdrawn. The articles go back to reading top to bottom, the interactive kit and the slides are reverted, and polish comes from the arcade's own vocabulary instead.

## Brief

- **Who arrives:** a developer who landed on one rule from the index, search or a shared link, and wants the rule plus its reasoning in one sitting.
- **The one action:** read the article to the end (the pager then offers the next rule).
- **Feel words:** **bookish, punchy, exact.** It reads like an essay, it lands like a game, and nothing moves without a reason.

## Anchors

- `21st:syeddhasnainn.research-report` (moving): a narrow long-form report with a tick rail, whose sections resolve from blur as they arrive. Taken: each block resolves once, `opacity 0→1`, `blur(3px)→0`, 500ms `cubic-bezier(0.23, 1, 0.32, 1)`, and then never moves again.
- `uiarc:in-view-title` (moving): a title that lands once 45% of it is in view, with opacity first and transform after, so it is readable before it settles. Taken: section headings trigger at about 12% in view, and the text is legible from the first frame.
- `uiarc:block.docs-sidebar`: an "On this page" indicator that glides to the heading in view, 340ms `cubic-bezier(0.16, 1, 0.3, 1)`. Taken: the existing tick rail keeps that curve (`--out`), and the reading bar below shares it.
- `21st:theorcdev.8bit-progress`: a progress bar that is pure outline weight and a chunky fill. Taken: the reading bar is solid segments with square ends and no gradient or glow.
- Move `mono-microlabel-layer`, through the site's existing Unbounded labels: the section number is a key cap, not a caps eyebrow, so no new label layer is added.

## Direction

- **Type.** No changes: Unbounded (`--display`) for h2 at 28px (23px at ≤639px), Geist for the body at 16px, 1.7 leading, inside the 3xl measure.
- **Colour.** The topic hue `--c` stays the only accent. It is used on the section key cap, the checkpoint bar fill, bullets and link underlines. Verdicts keep `--no` / `--yes`. No new hues.
- **Layout.** Unchanged reading column. Each h2 gains a key cap on the left and a 2px dotted "track" running to the column's right edge, so every section start reads as a checkpoint on one route.
- **Imagery.** Unchanged: the hero cartridge art (`RuleThumb`).
- **Motion tokens.** The arcade's: `--out` for rises, `--snap` for small pops, `--t-step` (40ms) for the stagger step, `--t-pop` (420ms) and `--t-panel` (560ms).
  1. **Block reveal** (one-shot, on enter): cards, code blocks, feature tiles and quick-reference stops play `rise` (opacity and translateY 16px), 560ms `--out`. Blocks that enter in the same frame stagger by 2×`--t-step`, capped at 4 steps. Reduced motion: opacity only, 240ms `ease`.
  2. **Checkpoint heading** (one-shot): the key cap pops (`pop-up`, scale 0.6→1, 420ms `--snap`), the title rises 120ms later, and the dotted track wipes left to right (`wipe`, 640ms `--cut`). Reduced motion: opacity only.
  3. **Reading bar** (scroll-linked, the signature): see below. Reduced motion: the fill still tracks scroll, because it is position feedback and not decoration. The checkpoint flash is dropped.
  4. **Control feedback:** existing hovers stay. No new hover motion.
  - **What stays still:** prose paragraphs, lists and table rows. Text never waits for an animation. Without JS, everything sits at rest.
- **Shader.** None. This is reading UI; a moving ground would compete with the code blocks.
- **Moves.**
  - `blur-to-sharp-resolve`, as a plain rise with no blur: blur on large code panels costs frames for little gain.
  - `scroll-progress-indicator`, because long articles (8 to 10 sections) need a sense of distance left.
  - `section-eyebrow-label` is **rejected**, because it is a generated tell. The key cap carries the number instead.
- **Signature: the checkpoint bar.** The navbar's bottom border becomes the article's route. It has one segment per section, each as wide as that section is long, and each fills in the topic hue as you read through it. When a segment completes, its checkpoint notch pops (scaleY 1→2.2→1, 300ms `--snap`) and stays lit. The rail in the left margin names the sections; the bar shows how far you have come. It sits on every width, including phones, where the rail is hidden.

## Critique, round 1 (polished writing)

Shots: `shots/writing/r1-*.png` (1440 dark, every article; 390 dark; 1440 light) and `shots/writing/*motion*` from `taste.motion`.

- **Squint.** On the 1440 shots the eye lands on the numbered key cap, then on the heading, then on the first card. Hierarchy now runs by section, where before every card weighed the same.
- **Type.** Unchanged. h2 is 28px Unbounded against 16px body (1.75x).
- **Colour.** The topic hue is the only accent: key cap, bar, bullets, link underlines. Verdicts keep their pair. Two hues per screen, plus verdict red/green where present.
- **Motion.** The probe shows every planned moment:
  - h2 and blocks: `rise` 560ms `--out`.
  - Key cap: 420ms `--snap`.
  - Track: `wipe` 640ms `--cut` +160ms.
  - Checkpoint: 300ms `--snap`.
  - Stagger: +80ms steps.

  The `long-entrance` findings are the hero cartridge's own 3200ms loop, which predates this pass.
- **Bugs found and fixed.**
  - A CSS counter numbered every heading "1", because counters do not carry across the `display: contents` wrapper. Numbers now come from `data-stage`, which the rail sets.
  - The checkpoint bar could not complete the last two sections when both fit in the final screen. The bar now maps page scroll onto the route, so it always finishes at the bottom.
  - At 390px the dotted track was squeezed into a stub beside wrapped titles. It is now hidden at ≤639px.
  - In light theme the topic wash tinted short tip cards. It is now 4% over 96px, down from 6% over 120px.
- **Generated tells.** Section numbers are a real sequence (the rail and the bar count the same sections). There is no caps eyebrow, no italic accent word, and no new copy.
- **Sameness.** Of the house-style traits, the page shares only the numbered sections. The colour, ground and type are the site's own arcade.

## Critique, round 2 (polished writing)

Shots: `shots/writing/round2/`.

- After the fixes, a full scroll of all eight live articles leaves 0 blocks hidden, and every bar ends with all segments done (11/11, 6/6, 4/4, 8/8, and so on).
- At 390px nothing overflows (`scrollWidth` 390), the key cap scales to 32px and the track is gone. The bar spans the navbar's edge.
- Under emulated reduced motion, `document.getAnimations()` lists only `opacity` and `fade-in` on the article. The hero slide-in is now a fade as well.
- Before hydration the key cap is hidden (`h2:not([data-stage])`), so there is no blank coloured square in the first frame.
- **Remaining, nits only:**
  - The hero cartridge art loops for 3.2s (pre-existing).
  - The `form-submission` guideline has no route and 404s, both before and after this pass.
