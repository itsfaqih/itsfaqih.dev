# Rule spread (home page, #rules)

## Brief

A visitor scrolling the home page (a hiring manager, a fellow engineer) meets the Rule of Thumb
section. The one action: open a rule. The spread replaces the select grid on the home page only;
the full index keeps the searchable grid.

Feel: **tactile, exact, playful.** Tactile pulls toward physics and weight, exact toward measured
geometry and crisp type, playful toward the arcade cabinet the rest of the site already is.

## Anchors

- **synapse-kit.vercel.app "Take your pick." (the user's reference).** Geometry, read from the live
  computed transforms: per step from centre the card moves 174px on a 254px card (0.68 of its width),
  drops 10px, sinks 92px in Z, turns 13deg on Y toward the centre and tilts 2.5deg on Z. Opacity
  1 / 0.8 / 0.6 / 0 at steps 0 / 1 / 2 / 3. z-index 10 minus the step. Transition 550ms
  cubic-bezier(0.22, 0.8, 0.2, 1). Its drag does not follow the pointer; release steps one card.
- **bencho:carousel.** Cards are never clipped by a mask or a box edge, and the stage stays a stage:
  DOM cards in CSS 3D driven from JS.
- **bencho:card-swap.** Order is the only state and every slot is a fixed transform. Here the slot is
  a continuous function of the card's offset from centre, so a drag can sit between slots.
- **uiarc:swipe-actions.** Rows track the finger 1:1, rubber-band at the last stop, and settle on a
  velocity-carrying spring.

## Direction

- **Type.** The site's own: Unbounded 900 for card titles (20px, -0.03em), Unbounded 700 12px for the
  number and topic line, Geist 15px/1.6 for the description in the caption strip.
- **Color.** Every card keeps its topic hue (`--c`) on a 2px border and a hard key-shade drop, as the
  tiles and the panel already do. The glow behind the stage takes the centred card's hue and eases
  between hues over 600ms (focus-carousel-receding-neighbors: ambient follows focus).
- **Layout.** Cards share one grid cell, centred; width min(300px, 66vw). The stage clips sideways
  only, so the 3D drop and shadows are never cut. The caption strip under the stage carries the
  centred rule's number, topic, demo state, description, and the arrows with a count.
- **Imagery.** Each card holds the rule's existing `RuleThumb`. The centred card plays it.
- **Motion.**
  - Position is one float: the index at the centre. Each card's offset `d = index - position` drives
    its transform and opacity through CSS (`--d`, `--ad`), written on the card itself, never on a shared
    parent.
  - Drag: 1:1, one card per 0.68 card widths of travel, rubber band at 0.35x past either end
    (spring-and-rubber-band-physics, uiarc:swipe-actions).
  - Release: target is the nearest card after projecting velocity 0.12s ahead; a flick over 30px always
    steps at least one. A spring (stiffness 140, damping ratio 0.82) carries the release velocity to
    the target, about 500ms with a hair of overshoot (gesture-tracked-drag-feedback). Grabbing mid-flight
    catches the card where it is.
  - Arrows, keys and horizontal wheel use the same spring.
  - Entrance: each card glitches in through the site's load-in system once 30% of it shows.
  - Reduced motion: the position jumps straight to the target; only opacity eases.
- **Shader.** None. The thumbnails already carry the motion, and a shader would compete with them.
- **Moves.** focus-carousel-receding-neighbors (the spread itself), gesture-tracked-drag-feedback (1:1
  drag, release spring), spring-and-rubber-band-physics (ends of the deck).
- **Signature.** The card in focus acts its rule out: its thumbnail loops the rule's demo while the
  neighbours hold their still frame, so browsing the deck reads like flipping through tiny demos.

## Critique, round 1

Shots: `shots/r1-desktop.png`, `shots/r1-middrag.png`, `shots/r1-mobile.png`, `shots/r1-dark.png`.

- **Squint.** The eye lands on the centred card's thumbnail (the only moving, saturated block), then
  its title, then the caption title. The section heading sits above, already read.
- **Gap: faded neighbours were see-through.** Slot opacity let the dark thumbnails behind bleed into
  the card in front ("Null vs Undefined" visible inside Data Loading). Fixed: cards stay opaque and
  fade under a cover of the page colour (`.spread-card::after`), 20% per step.
- **Gap: phone clipping.** The stage clipped at the 18px page gutter, a hard line inside the screen.
  Fixed: the stage runs out to the screen edge below 960px.
- **Type.** Card title 20px, caption title 24px, section title 44px: steps of 1.2x and 1.8x; the card
  and caption titles are one family at two roles, not a scale step. Fine.
- **Color.** Neutrals carry it; each card spends only its own topic hue. On screen: four topic hues
  plus the gold eyebrow, all pre-existing roles.
- **Motion.** Drag tracks 1:1 (mid-drag `--d` values -1.54 / -0.54 / 0.46 / 1.46 after 110px on a
  204px step). Release settles within 1% in 407ms, 0.2% overshoot. Reduced motion: the deck jumps in
  one frame; only the 200ms cover fade eases.
- **Detail specificity.** The centred card plays its rule's demo; the caption title scrambles as the
  centre changes, as the index panel's does; DEMO or ARTICLE per rule; real rule numbers and topic hues.
- **Sameness.** Shares none of the house-style list beyond what the site already is.
- **Generated tells.** One ↗ per card, which marks that the card itself navigates. Kept.

## Critique, round 2

Shots: `shots/r2-mobile.png`, motion sheets `shots/motion-1440-at-520.*` and `shots/motion-390-at-520.*`
(the probe's `at` did not scroll this page, so the sheets show the hero; the deck's motion was timed
in the browser instead, numbers above).

- Phone: neighbours peek from the screen edge, page scroll width 390 at 390.
- Entrance audit: 0 entrances below 30% visible at 1280x800 and 390x844.
- Click on the centred card and on a side card both navigate; a drag never does.
- Nothing larger than a nit. Nit: no written "drag" hint; the grab cursor, peeking neighbours and the
  arrow buttons carry it.

## Change, round 3: description on the cards

Each card carries its rule's one-sentence description under the title (Geist 13px/1.5, `--dim`), in a
fixed two-line slot so the deck keeps one card height. The caption under the deck drops its copy of
the description, which would repeat the card directly above it. The title no longer reserves two lines;
leftover height goes above the footer row instead. Shots: `shots/r4-1440.png`, `shots/r4-390.png`.

## Change, round 4: tighter card copy, rolling count, card-to-page morph

- **Card copy.** The description sits 3px under the title box (was 8px), so title and sentence read
  as one block and the footer keeps the leftover height.
- **Count.** The caption's `02 / 04` rolls its current number: new digits slide in from the side the
  deck moved toward (from below going forward, from above going back) over 220ms on `--out`, and the
  old digits leave the other way in 180ms. Reduced motion keeps only the crossfade. It fires as the
  spring crosses the midpoint, the same moment the caption title scrambles.
- **Morph.** Clicking a card starts a `rule-open` view transition (TanStack `viewTransition` with
  that type). The card's thumbnail grows into the rule page's cover and its title into the heading,
  520ms on cubic-bezier(0.32, 0.72, 0, 1); the rest of the page crossfades and the crumb, lead and
  actions cut in around the morph. The names exist only under
  `:active-view-transition-type(rule-open)`, so the theme switch's circle reveal is untouched.
  Arriving by morph, the hero drops its own cut-in on the heading and cover (they are the morph's end
  state) and scrolls to the top in a layout effect, because the router resets scroll only after the
  new page has been pictured. Reduced motion, or a browser without view transition types, gets a
  plain navigation. Frames: `shots/r5-morph-180ms.png`, `shots/r5-morph-360ms.png`,
  `shots/r5-morph-end.png`.
- **Page-wide.** The dot backdrop lights in the six topic hues and pulls toward the pointer (at most
  half a dot's distance, so rings never cross), drawn on a canvas inside the lit circle only. The
  cursor is a pixel-art gold arrow and hand set (`public/cursors/`, generated by
  `scripts/cursors.py`); the deck shows the open hand and the fist while dragging. Shots:
  `shots/r5-1440.png`, `shots/r5-390.png`, `shots/r5-cursors.png`.
- Entrance audit: 0 entrances below 30% at 1280x800 (home, a rule page) and 390x844 (home).

## Change, round 5: no caption title

The caption under the deck drops the centred rule's title: the card in focus already shows it at
the top of the stack, so the strip only repeated it. What is left is the arrows and the count,
centred under the centred card. A screen-reader-only live region still announces the rule's title
when the deck moves. Shots: `shots/r6-1440.png`, `shots/r6-390.png`.
