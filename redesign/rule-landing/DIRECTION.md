# Rule of Thumb pages as landing pages: three variants per rule

Prototype surface: `redesign/rule-landing/<rule>.html`, one file per rule, three variants behind the prototype picker (keys 1–3, ← →, R). Shared theme and picker: `shared.css`, `shared.js`. Nothing here is imported by `src/`.

## Brief

- **Who arrives.** A front-end engineer who got one rule's link from a colleague, X or LinkedIn, and a hiring manager who came from the home page. Both decide in the first screen whether the rule is worth their time.
- **The one action.** Get the rule. On a landing page that means taking it with you: understand the claim in one screen, try it once, and leave with it (copy the Markdown into `AGENTS.md`, or open the next rule).
- **Feel.** *Playful, exact, persuasive.* Playful keeps the arcade. Exact keeps the code real (real paths, real lint-like messages, real outcomes). Persuasive pulls the page away from an article and toward a pitch: one claim per screen, proof right under it.

## What "follow the theme" binds

Every variant uses the site's arcade tokens unchanged (`src/arcade.css`):

- Ground `#0e0e13` / panel `#17171f` / panel-2 `#20202b` / hair `#2c2c3a`, light theme `#f5f5f8` / `#fff` / `#ececf2` / `#d6d6df`. Text `#f4f4f8` / `#111117`, dim `#a1a1b5` / `#4b4b5b`.
- Topic hue `--c` per rule: cyan `#4dd4ff` Code Writing, pink `#ff6ad5` UX Design, amber `#ffb02e` Architecture. Yellow `--go #ffe14d` is the action key only.
- Unbounded 500/700/900 display, Geist body, Geist Mono for code only.
- Key buttons (12px radius, 4px hard drop on a darker key colour, press = `scale(.97) translateY(2px)`), raised panels (`--raise` bevel), `.hl` highlight block on one headline phrase, the dot grid and scanlines, the hue marquee band.
- Motion tokens: `--out cubic-bezier(.16,1,.3,1)`, `--snap cubic-bezier(.34,1.56,.64,1)`, `--cut cubic-bezier(.83,0,.17,1)`, `--t-step 40ms`, `--t-pop 420ms`, `--t-panel 560ms`, plus `--t-fb 160ms` for control feedback.

## Anchors

1. **aceternity:page.product-landing-page** (score 5). The page dresses itself in its own product's vocabulary: selection boxes with 6px square handles and a mono tag wrap one headline word; a "before" list in struck grey against a clean code card; 1152px content width; hero entrance 500ms `cubic-bezier(.22,1,.36,1)` staggered 60ms. Taken by **Spec**: the rule's vocabulary (an editor's reference box, a lint problem, a quick fix) wraps the headline and runs the hero.
2. **uiarc:block.feature-bento** (moving). Six unequal cells, each a small real UI that performs its feature on hover; border colour 240ms `cubic-bezier(.22,1,.36,1)`; entrances 340ms `--out` +50ms steps. Taken by **Spec**: a bento of the rule set where every cell acts its rule out on hover/focus. The probe flags its 620ms hover transitions as slow feedback, so ours land in 160–240ms and only the demo inside runs longer.
3. **Move `pinned-feature-switcher`** (details:cerebrium, details:tryarchitect). One section pins while scroll steps through 3–5 items; inactive items at ~45% luminance, the active one expanded; the media panel swaps with 8–16px of travel and a crossfade, about one viewport per item. Taken by **Poster** for the core principles.
4. **21st:fadeichev2121.orbit-delivery-hero** (moving, score 4). The product metaphor is an object you can drag in the hero, beside a large black headline. Taken by **Playground**: the hero is a toy of the rule (drag a helper closer to its only caller and watch the import line shrink).
5. **21st:unlumen.side-by-side-slide** (score 4). A before/after split whose handle follows the pointer and settles on a spring. Taken by **Spec** for "five files vs one file".
6. **The site's own hero** (`src/routes/index.tsx`, `hero-prints`). Three stacked Unbounded 900 lines at leading 1.02 with one `.hl` phrase; riso prints: black solid shapes and halftone hue shapes overlapping, misregistered. Taken by **Poster** for its figures and by all three for the headline grammar.

## The three directions (named axes)

| # | Variant | Axis | What carries the page |
| --- | --- | --- | --- |
| 1 | **Playground** | Interaction model: one toy per idea | A playable hero, then "levels": chunky game panels, each with a working toy of one sub-rule. Few words, lots of doing. |
| 2 | **Poster** | Typography and scroll narrative | One claim per screen in giant Unbounded, riso halftone figures, a pinned switcher for the core list, scroll that enacts the rule. Little interaction; the scroll is the story. |
| 3 | **Spec** | Density and product structure | The page sells the rule like a dev tool: an editor UI hero with lint-style problems and quick fixes, a rule-set bento, a before/after slider, a decision table, and an "install" step (the real Markdown into `AGENTS.md`). Everything on few screens. |

## Direction (shared)

- **Type.** Unbounded 900 display: Playground hero 64px, Poster hero `clamp(56px, 10vw, 152px)`, Spec hero 60px; section heads 40px (≥1.4× the 28px panel titles). Tracking -0.04em at display sizes, leading 1.02. Body Geist 17px/1.6, measure ≤ 60ch. Labels Unbounded 500/700 12px (the site's `.tag`), never caps-spaced eyebrows. Code Geist Mono 13px.
- **Colour.** Neutrals carry the page. `--c` (topic hue) on: the `.hl` phrase, toy art, active states, the marquee band, the next-rule card is in the *next* rule's hue. `--go` only on the primary key. Verdicts use `--no #ff5c7a` and `--yes` = `--ts #7dff6a` (dark) / its ink in light, only inside before/after demos.
- **Layout.** 1200px wrap, 32px gutters (16px at ≤ 640). Section rhythm 128px (desktop) / 88px (mobile). Spacing scale 4/8/12/16/24/32/48/64/96/128.
- **Imagery.** All product UI in HTML/CSS and inline SVG. Poster figures are CSS shapes with the site's `--halftone` tile. No photos, no generated images.
- **Motion.**
  - Hero intro: crumb, h1 lines, lead, actions cut in from `translateX(-24px)` with opacity, 420ms `--snap`, 60ms steps (site cut-in). Reduced: opacity 200ms.
  - Section reveal: once on enter, `translateY(16px)` + opacity, 560ms `--out`, sibling stagger 2×`--t-step` capped at 4. Reduced: opacity only.
  - Control feedback: hover/press 160ms, keys use the site's 150ms press.
  - Toys: transform/opacity only, `--snap` for things that land, `--out` for things that travel; drags track 1:1.
  - Signature per variant: see each rule section. Under reduced motion every toy still works but jumps to its end state.
  - Stays still: body copy, code text, the header.
- **Shader.** None. These pages are toys and type; a moving ground would fight the demos and the reading.
- **Moves.** `tool-ui-vocabulary-as-brand` (Spec), `bento-tile-grid` + `state-narrating-microcopy` (Spec), `pinned-feature-switcher` (Poster), `scroll-linked-text-reveal` (Poster, quick reference), `struck-value-before-after` (Poster, Spec), `before-after-slider-compare` (Spec), `interactive-3d-object-as-hero` adapted to a 2D toy (Playground), `colour-maps-to-meaning` (site-wide topic hue).

---

# Page 1: Proximity Principle (cyan, Code Writing)

Copy source: `public/rule-of-thumb/proximity-principle.md`.

- **Playground signature.** Drag `formatPrice()` from `utils/` toward `order-card.tsx`. A dashed import line stretches from the caller to the helper; its length is the cost. The hop counter reads 3 → 1 → 0 and the verdict chip goes FAR → NEAR → INLINE. Levels: inline-first switch, five-files-to-one merge, a state-isolation render counter you type into, a lowest-common-ancestor tree that recomputes where `useCart` lives as you tick its callers, and a global-code slider (1 caller → 12 callers).
- **Poster signature.** The hero's two riso shapes (a black component block and a cyan halftone helper) start far apart and are pulled together by the scroll itself; when they touch, the headline's "less jumping" is literally true. Then a pinned four-step switcher with one riso figure per principle, the two exceptions as inverted posters, and a quick reference that lights row by row with scroll.
- **Spec signature.** The hero is an editor: explorer, open file and a Problems panel with three `proximity/*` findings. Each has a working "Quick fix" that moves code in the tree and the editor; fixing all three takes the project from 9 files to 5 and the status bar turns to "0 problems". The install step is real: `curl -s itsfaqih.dev/rule-of-thumb/proximity-principle.md >> AGENTS.md`.

## Critique, round 1 (Proximity)

Captures: `shots/proximity/r1-v{1,2,3}` (1440 + 390 full height, dark), `r1-v{n}-light`, Poster at scroll offsets 0/700/1400/2513/3143/3773/4403/7000, motion sheets for v1 and v3.

- **Blocker.** The page script redeclared `start`/`drag`, which `shared.js` already defines as globals, so the stage rendered empty. Removed the destructure.
- **Squint.** Playground: headline, then the yellow key, then the bench (the bench's cyan chip competes a little, which is the point). Poster: headline slab, then the two riso shapes. Spec: headline, then the yellow key, then the editor's cyan status bar.
- **Type.** Poster `.po-h1` at `10vw`/152px wrapped "More shipping." and the nested `.hl` inherited `display: block`, turning the highlight into a full-width slab. Now `clamp(44px, 7.8vw, 112px)`, `.po-h1 > span` only, `.hl` inline-block: two lines, each on one row.
- **Space.** Poster figures (58% of the sticky frame) sat on the crumb and "Less". The figure band is now 46%, with the block at 15vw/220px max and the helper at 11vw/160px max, so the shapes stay above the type.
- **Detail.** Spec bento: the LCA mini moved `use-cart.ts` to `routes/` (6 rows) instead of `shop/`; it now moves 150px (5 rows of 30). The "fewer files" stack cut off its names (38% wide cards, 14% offsets); it now fans down in 20px steps, so each name shows in its strip and the kept file comes to the front on hover.
- **Mobile.** Playground overflowed by 8px at 390: the selected option's 8px select-screen nudge. `.pg-select .opts` gets 8px of right padding.
- **Motion.** Probe matches the plan: cut-in 420ms `cubic-bezier(.34,1.56,.64,1)` at +80/+140/+200/+260/+320/+380ms, wire march 600ms linear, band 48s. 60fps, 0 long tasks, 0 rAF at rest; reduced motion leaves 0 moving and 0 infinite animations. Findings: none.
- **Generated tells.** No caps-spaced eyebrows (labels are sentence-case Unbounded 500 tags), no em dashes in copy, no stats strip. "LV 1–5" are a real sequence. The `.hl` phrase is the site's own device.
- **Sameness.** Shares none of the warm-paper house style: arcade dark/light tokens, cyan topic hue, yellow action key.

## Critique, round 2 (Proximity)

Captures: `shots/proximity/r2/` (bento hovers at 1440, Poster top and pinned step at 390, Playground select at 390).

- All toys verified by script: bench FAR 3 → NEAR 1 → INLINE 0; inline switch → OVER-ABSTRACTED with 2 files/1 import; merge 5 → 1; LCA with three callers → `routes/use-cart.ts`; slider at 7 → `components/button.tsx`; render counts 2/2/2 with state in the parent, 1/2/1 in the child; quick fixes 3 → 0, 9 → 5 files, tree drops `utils/`.
- Scroll width at 390: 390 for all three variants.
- Light theme: the riso block inverts to ink-black on paper and the cyan stays the hue; contrast holds on the bench chip and the IDE status bar.
- Nits left: the Spec LCA cell has ~120px of air between its copy and its tree at 1440; the selection-box handles on "used" are small at 1440 (6px). Neither changes the pick.

---

# Proximity, production v2: the drag-and-drop game

User feedback on v1 (`archive/v1-playground-*`): too close to the home page (dot field with ripple and magnetic pull, the ticker). The page needs its own style, the card title should morph into the page title (scramble suggested), every level should be a drag-and-drop answer, and one button should finish all levels.

## Brief (unchanged one action)

- **Who / action.** Same visitor; the action is still "get the rule". The game's last screen hands over the Markdown.
- **Feel.** *Playful, exact, rewarding.* The arcade tokens stay (they are the theme); the home page's devices go (Backdrop, `.arc-scan`, the hue ticker, the glitch cut-ins).

## Anchors

1. **dithercn:scramble-text**: each character resolves on its own a few ms after the previous, with **no layout shift**: the real glyph keeps the box (`invisible`), the noise glyph is overlaid. Resolved colour settles over 700ms `cubic-bezier(.23,1,.32,1)`. Taken for the title and every reveal.
2. **aceternity:component.encrypted-text**: left-to-right front, unresolved tail in a dimmer tone so the front reads without a cursor; holds still once resolved, no loop. Taken: the noise tail is the topic hue at 55%.
3. **designspells:magnetic-drop-targets…(Dia)**: drop zones appear only while dragging (contextual UI), the nearest one swells toward the pointer, dashed outline means "will accept". Taken for the slots: idle slots are quiet rows, they light dashed in `--c` on drag and the nearest within 96px scales 1.03.
4. **move gesture-tracked-drag-feedback**: 1:1 tracking, tilt into travel (clamped ±8°), settle with a small overshoot. Taken for the code piece.
5. **move burst-feedback-on-commit**: one short burst on a correct drop (pop 0–150ms, fade by 600ms), then the persistent state. Taken as 8 square pixels out of the slot.
6. **uiarc:text-morph / shared-element-expansion**: one continuous object carries the eye from card to page; 340ms `cubic-bezier(.16,1,.3,1)` entrances at +50ms steps. Taken: the card title is the page's h1 (same words, so the morph is one object) and the noise rides along in the live snapshot.

## Direction

- **Style of its own: the board.** Ground is plain `--bg` with a static 48px hairline grid (`--hair` at 45%), masked to fade at the edges (move `hairline-grid-structure`). No dots, no scanlines, no band. Levels hang off a vertical rail with five nodes; the rail fills with `--c` as levels clear (`scaleY`, 560ms `--out`).
- **Title screen hero.** h1 is the rule's name, "Proximity / Principle", Unbounded 900 `clamp(48px, 8.2vw, 116px)`, leading .96, tracking -0.05em, "Principle" in `.hl`. The claim sits under it as the lead. Right column: the level select (five rows, names hidden as noise until cleared, stars). Keys: **Start level 1** (go), **Finish all levels** (soft), Copy as Markdown as a text link.
- **HUD.** Sticky under the site bar while the levels are on screen: rule name, five pips, stars `n/15`, Finish all levels.
- **Levels.** Each is a prompt (one sentence, real paths), a board (a file or component tree in Geist Mono 13px with three drop slots at real places) and a tray holding one code piece. The level's name shows as noise until cleared, then decodes (it is the reward). Correct drop: the piece seats in the slot, the tree rewrites itself (files vanish, imports go to 0), a stat line changes, CLEAR stamp, burst. Wrong drop: the slot shakes in `--no`, a one-line lint message says what that place costs, the piece flies home. Stars per level: 3 minus wrong drops, minimum 1.
- **Input.** Drag with pointer (mouse, pen, touch: `touch-action: none` on the piece only). Tap or Enter on the piece picks it up; slots become buttons; tap or Enter on a slot drops it. Esc puts it back.
- **Finish all levels.** Solves every open level in order, 140ms apart; each one plays its seat animation if on screen. Then glides to the results. After that the key reads **Replay** and resets the board.
- **Results.** "All clear", stars, and the cheat sheet (six situations → where) whose answers sit as noise until all five are cleared, then decode row by row. Then Copy as Markdown, View .md, next rule.

## Motion

| Moment | Trigger | Properties | Curve / duration | Reduced |
| --- | --- | --- | --- | --- |
| Card → title | `rule-open` view transition | group move (site 520ms vaul curve); old title fades out over the first 35%; the new h1 is live and scrambling | site curve; scramble below | no view transition (site already skips it) |
| Title scramble | mount | per-char noise, re-rolled every 45ms, resolves L→R 34ms apart from +90ms (≈ 800ms total) | colour settle 300ms `--out` | text shown at once |
| Hero pieces | mount | opacity + translateY(12px) | 560ms `--out`, 60ms steps after the title | opacity 200ms |
| Level reveal | enters viewport once | opacity + translateY(16px) | 560ms `--out` | opacity |
| Pick up | pointerdown | scale 1.05, shadow | 160ms `--out` | none |
| Drag | pointermove | translate 1:1, rotate ±8° by velocity | per frame, rotation eased .2 | no rotation |
| Slot near | distance < 96px | scale 1.03, hue fill 14% | 160ms `--out` | colour only |
| Correct seat | drop | FLIP into slot | 420ms `--snap` | none (jumps) |
| Burst | correct | 8 squares out 28–44px, scale→0 | 600ms `--out` | none |
| CLEAR stamp | correct | scale .6→1, rotate -8°→-4° | 420ms `--snap` | opacity |
| Name decode | correct | scramble | as title, 26ms steps | text shown |
| Wrong | drop | slot shake ±6px ×2 | 320ms `--cut` | colour flash only |
| Fly home | wrong / cancel | FLIP back | 360ms `--out` | none |
| Rail fill | clear | scaleY | 560ms `--out` | none |

Stays still: body copy, code text, the HUD, the grid.

## Moves

`rotating-and-scrambling-text` (title and reveals), `shared-element-expansion` (card title is the h1), `gesture-tracked-drag-feedback`, `magnetic-drop-targets` + `contextual-ui-on-drag` (slots), `burst-feedback-on-commit` (clear), `hairline-grid-structure` (the board), `motion-token-scale` (one scale above), `colour-maps-to-meaning` (`--c` progress, `--no` wrong, `--yes` clear).

## Signature

The answer is a place. You do not pick A, B or C: you carry `formatDate()` to where it lives in a real tree, and the tree rewrites itself to show what that place costs.

## Critique, round 1 (v2)

- **Squint.** The 1440 hero lands on the two-line title (the highlight block on "Principle"), then the yellow "Start level 1", then the level-select panel. Inside a level the eye goes to the yellow-on-cyan piece, then the dashed slots. Holds.
- **Motion.** The card→title trace shows the view transition at 22–707ms with the h1 still noisy for the first ~400ms, then decoding through the landing and settling at ~990ms (`shots/proximity/v2/morph-sheet.png`). Drag, miss shake, FLIP seat, burst and stamp were checked frame by frame (`d-lv1-*`).
- **Gaps found.**
  1. A skipped level said "Skipped" twice (the stamp and a stars label). The level head now shows only the stamp.
  2. Replay remounted the levels without `data-in`, so all five stayed hidden, and the glide back was measured against the outgoing nodes.
  3. Every glide stopped 90–250px off: Lenis already subtracts `scroll-margin` + `scroll-padding`, and the JS offset was added on top. `glideTo` now takes no offset, and the CSS owns where things land (`.level` 60px, results 8px, on the page's 88px padding).
  4. At 390px the HUD's "Finish all levels" wrapped to two lines. Phones now read "Finish all".

## Critique, round 2 (v2)

- Start lands LV1 at 148px (HUD bottom 138), Finish lands results at 96px, Replay lands LV1 at 148px with all levels visible. Reduced motion: no noise on the title, Finish jumps straight to the results.
- At 390px the page has no horizontal overflow; the HUD stays on one line; the hero leads with the title, then the two actions.
- **Sameness.** It shares the dark arcade ground and the yellow primary with the site, as the theme asks. It has none of the home page's ripple field, magnetic ground or ticker; the grid ground is static.
- **Nits left.** The level-select names on mobile truncate their noise with an ellipsis (LV3). The cheat sheet answers decode only after all five levels are done, so a player who stops at 3 sees noise there; this is intended.

## v3: teach first, then the quiz

**Brief update.** Visitors arrive from a rule card. They come to learn where code goes. The page now teaches before it tests: five lessons, each with a visual example, then the mini quiz. Feel: patient, exact, playful.

**Changes from the user's notes**
- The title doesn't scramble any more. The card and the page share the same words, so the `rule-title` view transition simply carries the heading across.
- The card's thumbnail sits beside the title as a large tilted cover, and the `rule-thumb` view transition flies it there from the card.
- Level names print plainly and no longer give the answer away: "One caller", "Two callers"…
- The HUD and the level select are gone. The score and Finish all levels sit in the quiz header, and a results panel follows the last level.

**Anchors**
- uiarc:reasoning-tree: inactive by luminance. The far chip turns red and the near chip carries the rule's hue.
- anatomy:collection.b-tree / mark-sweep: teach by working the object, with a mono caption that counts (the cost chips: "2 files · 1 import" → "1 file · 0 imports").
- 21st:syeddhasnainn.file-tree: colour maps to meaning, with "uses it" badges at the row edge.
- 21st:dhileepkumargm.profile-card: a pointer-tilt card. The cover rests at -4deg on a hue plate (+4deg) and leans up to 10deg/8deg toward the mouse (420ms `--out`).

**Signature.** Each lesson renders the answer on the server. On the client, lessons below the fold rewind to "far" off screen. When a lesson is 60% visible, it waits 700ms and the file walks home: a FLIP with 640ms `OUT` for the moved piece and 460ms for the rest, new rows fading in at 260ms, and the cost chips flipping from red to green. This repeats the thumbnail's FAR → NEAR art at full size. The toggle lets you compare the two layouts by hand; once you've touched it, the autoplay stops. Under reduced motion, nothing rewinds and the toggle swaps instantly.

### Critique, round 1 (v3)
- Squint at 1440: the eye lands on the title, then the cover, then "Learn the rule". Good.
- The lesson, level and results h3s inherited `--dim` and read grey. **Fixed:** they now use `--text`.
- The quiz header's `> div` rule also matched `.score`, which stacked it vertically. **Fixed:** the rule now uses `:first-child`.
- At 390, the cover footer wrapped "proximity-principle.md" and "FAR → NEAR" onto two lines. **Fixed:** nowrap, a 12px gap, and 11px text on mobile.

### Critique, round 2 (v3)
- The morph from /rule-of-thumb plays cleanly (shots/proximity/v3/morph.webm, morph-sheet.png): the title and thumbnail fly into the hero, then the copy fades in.
- The lesson walk is verified from far to near on lesson 4. Under reduced motion every lesson stays at near.
- Finish all levels solves the levels and glides to "All clear". Replay resets to 0/5 and glides to LV 1.
- At 390, `scrollWidth` is 390 and nothing overflows. The light theme reads cleanly.
- No HUD, `.lv-select` or scramble nodes remain.
- Nits left: on desktop the lesson copy column has spare height beside the taller trees. That's acceptable.

## v4: wrong and right side by side

**User note.** Don't teach through tabs. Show the bad layout and the good one side by side, and keep tabs only on mobile.

**Change.** Each lesson now has its copy on top, with two panes underneath: on the left, "✕ the drift" (red caption, red chip on the moved piece, red cost chips); on the right, "✓ the rule" (green caption, the piece in the rule's hue, green cost chips). The panes stretch to the same height, so the cost chips line up at the bottom. At 820px and below, which is TABBED in the page and the media block in the CSS, the panes stack behind the old toggle. There the lessons still rewind to far and walk home when they scroll into view, and the FLIP measures each row's position against the pane that was showing. 820px is the cut-off because at 700px two panes broke `checkout/pay-button.tsx` mid-word. At 1024, 860 and 768 no row wraps, and nothing overflows horizontally.

**Signature, revised.** On wide screens the walk home becomes a static comparison you read across: the same row is red in one pane and in the rule's hue in the other. The walk survives as the phone interaction. The archive of v3 is in `archive/v3-teach-*`.

## v5: seamless thumbnail loops, TL;DR, no auto-finish

**User note.** Loop the thumbnail animations forever, with continuous movement so the loop never cuts. Apply this to every rule thumbnail. Rename the cheat-sheet heading to "TL;DR". Delete "Finish all levels".

**Loops (src/arcade.css).** Before, every loop ended on the still frame and then cut back to its first beat: the proximity file jumped from home back to shared/, and the button jumped from Saved back to Save. The cover thumbnail also stopped after two loops (`--loops: 2`). Now 0% and 100% are both the still frame, and each loop moves out of it and glides back:
- **Proximity (4.4s):** the file sits at home, walks down to shared/ while the OrderCard box fades and the link stretches, holds, then walks back home. FAR/NEAR crossfade over 6%.
- **Button (5.2s):** it rests on Saved and eases back to Save while the pips dim. The cursor drifts in, hovers and presses, then the button goes through Saving… to Saved. The cursor drifts back out and fades.
- **Data loading (4.4s):** fresh rows go stale ($14 crossfades to $8 and the rows dim), the sweep runs, and the rows come back fresh with a flash.
- **Null (4s):** the null box lifts out of its slot and fades, then drops back in with `--snap`. The `?` pulses softly in and out instead of a stepped blink.

All of them use `--io` (an ease-in-out cubic) for on-screen moves, and loop forever everywhere, the cover included. Anything that has to jump, such as the cursor's start position or the sweep's scaleX(0), only does so at opacity 0. Checked in the browser with `getAnimations()`: every element's 0% matches its 100% and its still frame. The spinner (a full turn) and the `?` pulse (it runs back and forth) are continuous by design.

**Quiz.** With the button gone, its auto-solve path went too: `solveAt`, `SOLVE_STEP`, the 0-star "Skipped" stamp. Replay stays in the results panel once all five are clear. Checked: clearing all five by tapping gives "All clear, ★ 11 of 15", and Replay resets to 0/5.

## v6: room under shared/

In the far frame, `styles.ts` landed on the `shared/` label. The tree's top half moved up by 3 to 6 units (src/ at 15, the box at 21–67, OrderCard/ at 33, OrderCard.tsx at 47, the file's home at 52–64), and shared/ now sits at 77. The far drop grew from 26 to 31, so the file sits at 83–95, a clear child row under shared/. The link now runs from 50 to 89 and rests at scaleY(0.205), so near still tucks it behind the file. Shot: shots/proximity/v6/cover-far-near.png.

## v7: sticky bar, Share, the title docks on scroll

**User note.** Delete the results panel. Remove the CTA buttons. Add a Share button at the top right. Set the crumb to 14px (0.875rem). On scroll, the crumb and Share stay pinned, and the title shrinks to 14px and moves to the left of Share.

**Removed.** The results panel ("N levels to go" / "All clear" + Replay) and everything only it used: `round`, `replay`, the glide back to LV 1, the `replayed` prop, the `.results` styles. The hero's "Learn the rule" / "Jump to the quiz" buttons. The "Take the rule with you" buttons (Copy as Markdown, View .md) stay: they are the page's takeaway, not navigation CTAs.

**The bar.** `.stick` is pinned at `top: 72px`, right under the site bar, in a three-column grid: crumb, title slot, Share (`btn soft sm`). Once the page scrolls (the site bar's own `data-scrolled`), the site bar drops its bottom edge and drop shadow and this bar takes them over, so the two read as one bar. The page's `scroll-padding-top` grows to 146px to clear both bars. Share opens the system share sheet with the rule's name, its claim and the URL. Where there's no sheet it copies the link, and the label and icon change to "✓ Link copied" for 1.6s. A cancelled share is silent.

**The dock (motion).** The heading flies into the slot. It is a scroll-driven animation (`animation-timeline: scroll(root)`), so it is tied to the scroll position: it can stop anywhere and fly back, and it runs off the main thread, so it doesn't jitter against native touch scrolling. `useTitleDock` measures the flight: the range ends where the heading's centre meets the slot's centre, the scale is 14px over the heading's font size, and x is the slot's left minus the heading's left. Vertical travel is the page's own scroll, so there is no counter-transform. Scale and fade run linear on the scroll. x runs on an ease-in curve, so the heading rises and shrinks first and only swings right as it nears the bar, which keeps it clear of the cover. It fades out over the last 10%. At 96% of the range the page gets `data-docked`, and the bar's own one-line copy ("Proximity" + the hued "Principle" chip) crossfades in from a 2px blur over 200ms (`--out`).
- Reduced motion, or no scroll timelines: no flight. The copy fades in once the heading has scrolled fully under the bar (opacity only, no blur).
- At 640px and below, Share is icon-only (it keeps its name for screen readers). The title docks over the crumb's "No.001 · Code Writing" tags, which fade out, so "← All rules" stays.

**Checked.** At 1440, 1024, 768 and 390: no horizontal overflow, the title docks left of Share, and the crumb is 14px. Checked in the light and dark themes, and under reduced motion (no animation; docks at 400px). Both share paths work, with the sheet stubbed and the clipboard as the fallback. Recording: shots/proximity/v7/dock-scroll.webm, with its frame sheet. The archive of v6 is in archive/v6-*.

## v8: the navbar becomes a dynamic island

**User note.** Make the global navbar behave like Apple's Dynamic Island. Keep it close to the content's heading, and make it sticky as soon as the page scrolls.

**Brief.** Every visitor sees it on every page. Its one job is to keep wayfinding (home, the nav, search, theme, Connect) within reach without taking a full-width band from the content. Three feel words that pull against each other: *alive, quiet, exact*.

**Anchors.**
- `bencho:dynamic-island`: one black pill whose width, height and radius share one spring.
- `uiarc:morph-nav`: the columns animate on `grid-template-columns` with a sampled-spring `linear()`. The faces crossfade, going out in 120ms and coming in at 240/260ms with a 40ms delay, through a short blur.
- `bencho:find.matthias-oel-expanding-nav`: a small black pill holding a label and the time that grows into the whole menu.
- `aceternity:block.illustrations.dynamic-island`: the capsule resizes to fit each label as the contents swap.
- `transitions:dropdown-menu-morph`: opening is slightly springy and closing is plain.

**Moves.** morphing-menu-surface, spring-and-rubber-band-physics, blur-to-sharp-resolve, floating-pill-nav, live-data-as-proof-and-ornament (the Jakarta clock stays in the pill).

**System.**
- **Capsule.** `#0a0a0c` in both themes; 48px tall, 12px from the top, centred; radius 999px. It has a 1px white 8% inner ring and a soft drop shadow. Inside it the tokens are redefined (text white, dim white 66%, hover white 10%), so links, kbd and buttons read light on black without their own colour rules.
- **Parts.** Every part is a `.seg` with three layers: a grid column, a sideways-only clip, and a `max-content` row. Off, the column goes to `0fr` and the part leaves the tab order (`inert`). On, it goes to `1fr`, so the capsule always hugs whatever is showing. Width runs 560ms on a sampled spring (damping 0.72). The rows blur and fade out in 120ms and resolve in at 240/260ms with a 40ms delay (`--out`).
- **Modes.**
  - *Full* at the top of the page, or when the menu is open: FAQIH, Yogyakarta · clock, the nav, search, theme and Connect.
  - *Compact* once the page scrolls more than 8px. It shows the page's live activity if the page lends one, otherwise FAQIH with the clock, plus a menu button.
  - *Menu.* The button (☰ turns into ✕) unfolds the full island again. It folds back on a scroll of more than 24px, on Escape (focus goes back to the button), on a press outside the island, or on a link click.
- **Live activity API.** `IslandActivity` (in header.tsx) portals children into the island. `compactBox(el)` returns where an element will sit once the island is compact, summed from the parts' natural widths, so a page can aim at it while the island is still full.
- **Other rule pages.** The reading-progress checkpoint bar now runs along the island's bottom edge, 3px high and inset 22px, so the compact island doubles as a progress live activity.
- **Load-in.** The capsule drops in from 0.82 scale on the spring. The parts keep the arcade glitch-in, because the `.arc-header > *` children are now the parts.

**The Proximity page.**
- The crumb and Share move back into the hero, right above the heading. That answers "not too far from the heading".
- The page's own sticky bar is gone, along with its 146px scroll padding.
- Once the page scrolls, the crumb row blurs out (120ms) and the island turns compact, with the same crumb as its activity: ← All rules, then "No.001 · Code Writing", then Share as an icon.
- The heading still flies on the scroll timeline, now aimed at the island's title slot. It slips under the black capsule as the slot swaps the tags for "Proximity [Principle]" (200ms, a 2px blur and a 6px rise).
- Reduced motion, or no scroll timeline: there is no flight. The island snaps between sizes and its parts only fade. The swap waits until the heading has scrolled under the island.

### Critique, round 1
- **Squint, at 1440.** The eye goes to the heading, then the island, then the cover. The yellow Connect is the only saturated thing in the capsule, so it reads as the action.
- **Bug: the flight landed 6px right.** `compactBox` counted the island's padding twice.
- **Bug: wrong landing on the first load.** A folded row is blurred, and in Chrome that makes it the `offsetParent`, so `offsetLeft` meant different things in the two modes. Fixed by measuring with rect deltas, corrected for the island's load-in scale, and by measuring again on the island's `animationend`. Now the dock lands at x=645 at 1440, matching the slot.
- **Mobile, at 390.** In full mode the island was 384px, wider than the 366px room, and it clipped "Rule of Thumb". The open menu also had no room for the close button.

### Critique, round 2
- **Mobile.** Rows lost their padding at ≤640, and the capsule's padding is 4px at ≤480. Full mode is now 361px in the 366px room. The open menu folds the brand away below 480px. Compact with the activity is 314px. There is no horizontal overflow at 390 or 1440.
- **Motion.** The recording (shots/proximity/v8/island-scroll.webm, frame sheet island-sheet.png) shows full → compact → title swap → back to full on the way up, with no snap.
- **Remaining nits.**
  - Dark theme: the capsule against the near-black ground is held only by its 8% ring. This is deliberate (that is how the real island reads), but it is subtle.
  - In the last 4% of the flight, the second line of the heading peeks under the capsule's lower edge while it fades.

## v9: roomier island, white in dark mode

**User note.** Give the navbar more horizontal padding so Connect isn't cramped. Make the island white in dark mode.

- **Padding.** The capsule's side padding goes from 6px to 10px, and Connect's segment has 8px before it (was 6px). Connect now ends 14px from the pill's edge, where it used to be 10px. At ≤480px the padding is 6px (was 4px). The full island is then 365px in the 366px of room at 390, so it still fits.
- **Dark theme.** The capsule is `#fff` with a 6% black inner ring, and its tokens are redefined: text `#0a0a0c`, dim at 68%, mute at 50%, hover at 7%. The focus ring is yellow mixed 45% toward black, so it shows on white. The flip keeps the island the one shape that stands apart from the page: black on the light page, white on the dark one. The yellow Connect and the hued title chip work on both.
- **Checked** at 1440 and 390 in both themes: top, docked and with the menu open. The flight still lands at the slot (645px). Shots are in shots/proximity/v9. v8 is archived in archive/v8-*.

## v10: tools stay in the short island

Request: the compact island shows search and the theme switch; drop "Yogyakarta" and the clock.

- The tools segment is `compact="always"`, so compact reads brand (or the page's activity), search, theme, menu. `compactBox` sums it in, so the title dock still lands on its slot (390: x 61 = 61; 1440: x 579 = 579).
- "Yogyakarta · clock" folds away once the page scrolls; it stays in the full island at the top.
- At 390 the activity plus tools overflowed by 14px (380 > 366). Within 480px, `.find` padding is now 8px 6px and `.act-label` 0 4px, giving 364px. The old 480px `.find` rule had been losing to the 960px rule that comes after it, so the new rule is prefixed with `.arc-bar`.
- Shots: `shots/proximity/v10/`.
