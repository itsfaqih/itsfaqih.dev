# Hero dioramas: direction

## Brief

- **Who arrives:** engineering leads, recruiters and founders landing on itsfaqih.dev. They read one headline ("I build interfaces that behave", "agentic setups that work", "dev tools that save hours", "APIs that stay fast", "tests that never flake") and decide whether to keep reading.
- **The one action:** believe the headline long enough to press "Email itsfaqih@gmail.com" (or "Read my rules"). The illustration has to _prove_ each phrase by acting it out, not decorate it.
- **Feel:** _toy-like, exact, quick_. "Toy" pulls toward chunky play, "exact" toward correct data and real UI words, "quick" toward short travel and snappy presses.
- **Constraints:** the site's arcade system (Unbounded/Geist/Geist Mono, slide hues `--ux #ff6ad5`, `--cw #4dd4ff`, `--ar #ffb02e`, `--ts #7dff6a`, `--ax #9d7bff`, keys with a hard 4px bottom edge), the Rule of Thumb thumbnail screen (hue-tinted ground, 8px dot grid, mono labels, a beat chip in the top right), real 3D, tilt toward the cursor, light and dark themes.

## Anchors

1. **aceternity:component.3d-card-effect**: CSS `perspective` on a stage, `rotateX/rotateY` from the pointer, and each child lifted with its own `translateZ` so the card reads as a stack of sheets. Rest tilt in its poster: about 5–8° on Y and 3–5° on X. Its 200ms _linear_ follow is too mechanical for us; we keep the layer depth and replace the follow with a damped approach (see Motion).
2. **21st:ayushmxxn.vintage-keyboard**: the press. Cap drops in **15ms linear**, releases in **260ms `cubic-bezier(0.34, 1.56, 0.64, 1)`** (overshoot past rest), and the light changes on press as well as the position. The cap's look comes from a lit top plus a darker skirt.
3. **recent:cghdokb-bouncing-icon-shape-morph**: a flat saturated character whose identity is **two vertical slit eyes (about 3×8px)** that never change, while its body takes a new hue each time. Pure flat fills, no gradient. This becomes "Bit", the operator in every scene: same face, body in the slide hue.
4. **transitions:streaming-text** and the **ai-working-states** move: words resolve with **1px blur + fade over 350ms, 60ms apart** on `cubic-bezier(0.22, 1, 0.36, 1)`. Status lines swap with an **8px rise and 2px blur over 150ms**. Used for the agent's log.
5. **dithercn:line-chart**: latency charting conventions: a dashed reference line for the budget, markers on every sparse point, the readout as value then range. Its line draws in over **700ms `cubic-bezier(0.23, 1, 0.32, 1)`** with markers fading **+500ms** after. We take the dashed budget and the marked points, built in 3D: bars rise under a dashed "200ms budget" ceiling.
6. **bencho:tilt**: light and shadow belong to the object, not fixed to a corner. Its entrance stagger runs **60–80ms steps on `cubic-bezier(0.22, 1, 0.36, 1)`**. We use the cast shadow under each block (it stays on the plate while the block lifts) to show height.

## Direction

### Type

- Labels on blocks: **Geist Mono 500**, 11 units on the 560-unit plate (about 11px at 560px wide, 7.5px at 390px). Tracking 0.
- Keys that act as buttons ("Save", "run release"): **Unbounded 700**, 11 units, like `.btn` on the site.
- Beat chip: Unbounded 700, 10px, tracking 0.04em, the thumbnail chip.
- No headings inside the scenes. The page headline is the heading.

### Color

The diorama does not add hues. Each slide uses exactly one: its own `--c`.

| Role                                | Dark                                                                            | Light                                      |
| ----------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------ |
| Plate top                           | `color-mix(--c 9%, #101017)` + dots `--c 16%` at 8 units (the thumbnail screen) | `color-mix(--c 7%, #fff)` + dots `--c 30%` |
| Plate edge (skirt)                  | `color-mix(--c 30%, #07070c)`                                                   | `color-mix(--c 35%, #c5c5d1)`              |
| Neutral block top                   | `--panel-2 #20202b`                                                             | `#ffffff`                                  |
| Neutral block skirt (front / sides) | `#101017` / `#0b0b10`                                                           | `--drop-ink #c5c5d1` / `#b4b4c2`           |
| Hue block top                       | `--c`                                                                           | `--c`                                      |
| Hue block skirt                     | `color-mix(--c 62%, #000)` (like `--go-shadow` under `--go`)                    | same                                       |
| Text on neutral                     | `--text`, labels `--dim`                                                        | `--text`, labels `--dim`                   |
| Text on hue                         | `#0e0e13` (`--on-accent`)                                                       | same                                       |
| Hue-coloured text on plate          | `color-mix(--c 55%, white)`                                                     | `color-mix(--c 55%, #000)` (`--ink-mix`)   |
| Cast shadow                         | `rgb(0 0 0 / .45)`                                                              | `rgb(30 30 60 / .14)`                      |

The accent (the slide hue) is spent on **Bit** and on **the one block the scene is about** (the Save key, the PR card, the release key, the packets and bars, the passing tests). Everything else stays neutral.

### Layout

- One plate, 16:10, designed on a **560 × 350 unit** grid (`--u = 100cqw / 560`), at most 560px wide. Blocks snap to an 8-unit grid; keep 24 units of margin at the plate edge and leave the top-right 120 × 36 for the chip.
- Plate thickness 14 units. Block heights (extrusion): low slab 6, key 14, card 10, Bit 30 (a cube).
- Each scene has at most 7 blocks plus Bit. One clear subject, the rest supporting.

### Imagery

All HTML/CSS 3D, no canvas, no images: every block is a box (`preserve-3d`) with a top face and four skirts, positioned on the plate. Text is real text on the top faces.

### Motion

The slide timer already exists: 6.8–7.6s per slide, a progress pip, pause, and hover hold. Each scene plays **once** over its slide and holds its last frame, which is also its resting style (so reduced motion, pause and before-start all show the finished picture). Beats are timed as fractions of the slide (`--at`), so a scene stretches with its slide.

| Moment                              | Trigger                                   | Properties                                                                                            | Curve                                                                                                                        | Duration                | Reduced motion      | From                                                            |
| ----------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------- | --------------------------------------------------------------- |
| Tilt toward cursor                  | pointer anywhere on the page (mouse only) | `transform: rotateX(base + dy·9°) rotateY(dx·14°)` on the plate, written directly each frame          | damped approach, 12% of the gap per frame (critically damped, no bounce)                                                     | settles in about 300ms  | off; rest tilt held | anchor 1, `motion-token-scale` rule "track on the flat wrapper" |
| Bit hops                            | scene beats                               | wrapper `translate` across the plate (ease-in-out), inner `translateZ` arc, squash `scale` on landing | travel `cubic-bezier(0.645, 0.045, 0.355, 1)`, arc rises ease-out, lands ease-in; squash recovers on `(0.34, 1.56, 0.64, 1)` | hop 420ms, squash 200ms | finished frame      | anchor 3, `spring-and-rubber-band-physics`                      |
| Key press                           | Bit lands                                 | `translateZ` of the cap down by its extrusion minus 3 units, then back                                | 15ms linear down, 260ms `(0.34, 1.56, 0.64, 1)` up                                                                           | 275ms                   | finished frame      | anchor 2                                                        |
| Block rises (toast, PR card, badge) | beat                                      | `translateZ` from 0 plus opacity                                                                      | `--snap (0.34, 1.56, 0.64, 1)`                                                                                               | 420ms (`--t-pop`)       | finished frame      | anchor 2 overshoot, `asymmetric-open-close`                     |
| Streaming log words                 | beat                                      | opacity, `filter: blur(1px → 0)`                                                                      | `(0.22, 1, 0.36, 1)`                                                                                                         | 350ms, 60ms apart       | finished frame      | anchor 4                                                        |
| Status swap                         | beat                                      | `translateY 8 units`, blur 2px, opacity                                                               | ease-in-out                                                                                                                  | 150ms                   | finished frame      | anchor 4                                                        |
| Bars rise                           | packet returns                            | `scaleZ`-like: bar's `translateZ` lift with its skirt height via `scale3d(1,1,s)` on the bar box      | `(0.23, 1, 0.32, 1)`                                                                                                         | 700ms                   | finished frame      | anchor 5                                                        |
| Test wave                           | Bit presses rerun                         | each cap dips 3 units and lights, 30ms stagger                                                        | 15ms down / 260ms overshoot up                                                                                               | 275ms + 11×30ms         | finished frame      | anchors 2 and 6                                                 |
| Scene swap                          | slide change                              | whole scene opacity                                                                                   | `ease`                                                                                                                       | 320ms                   | same                | existing `.bench` behaviour                                     |

**Stays still:** the plate itself (apart from tilt), the chip's position, neutral blocks that are not pressed, all labels once they land. No ambient float, no glow pulse, no looping spinner.

### Shader

None. The scenes are about UI and objects; a shader ground would compete with the dotted plate and add GPU cost to a hero that already animates.

### Moves

- `pointer-driven-layer-depth`: blocks lifted off the plate at their own depth, so the tilt shows parallax for free.
- `skeuomorphic-hardware-controls`: every trigger is a physical key that sinks and lights, which is what this site's buttons already are.
- `constant-face-changing-body`: Bit keeps its slit eyes, and its body takes the slide hue.
- `ai-working-states`: the agent's log streams words and swaps its status line rather than spinning.
- `spring-and-rubber-band-physics`: one overshoot curve, `(0.34, 1.56, 0.64, 1)`, for every press release, landing and rise.

### Signature

**Bit, a keycap with a face.** The operator in every scene is itself a key: a 30-unit cube with the site's hard skirt and two slit eyes, recoloured to each slide's hue. It hops onto the key the headline is about and presses it, and the scene answers. A visitor would describe it as "a little key guy who presses the buttons for each thing he builds". None of the anchors puts the character and the control in the same material.

### Scenes

1. **Interfaces that behave (`--ux`).** A settings slab with a "Dark mode" toggle and a hue "Save" key. Bit hops onto the toggle (the knob slides on), then onto Save (press and release), and a "✓ Saved" toast block rises. Chip: TOGGLE → SAVE → SAVED.
2. **Agentic setups that work (`--cw`).** A terminal slab streams the task; a status line swaps "reading", "editing", "testing". Bit hops across three file blocks (`cart.spec.ts`, `cart.ts`, `vp test`), each lighting with a ✓ when it lands, then a hue "PR #128 ready" card rises. Chip: READ → EDIT → TEST → SHIP.
3. **Dev tools that save hours (`--ar`).** A tower of five chore slabs (bump version, changelog, build, tag, deploy) labelled "by hand 4h 10m". Bit presses the hue "vp run release" key; the tower drops into one slab, 40ms stagger, and it reads "release ✓ 6m". A "4h 04m saved" tag rises. Chip: BY HAND → RUN → SAVED.
4. **APIs that stay fast (`--ts`).** A `client` block and an `api` block joined by a groove. Bit runs three round trips; after each one a hue bar rises on the chart (38, 44, 41 ms) far below a dashed "200ms budget" ceiling. "p95 42ms" lands. Chip: REQUEST → 200 OK → P95 42MS.
5. **Tests that never flake (`--ax`).** A 4×3 grid of test caps. Bit stands on "rerun" and presses it five times; each press sends a lit wave across all twelve caps (all pass, every time) and the counter steps "run 1/5" to "5/5". A "0 flaky" badge rises. Chip: RUN → RERUN → STABLE.

## Build notes (changes from the direction)

- Rest tilt is `rotateX(34deg) rotateY(-10deg)` with a reach of 9° and 14°. The plate leans back like a desk, so the keys' front skirts show.
- In dark mode, neutral skirts use `--drop-ink #0a0a0e` and `#050508`. The plate top is lifted to `color-mix(--c 10%, #17171f)`. With the planned `#101017` skirts, the skirts matched the plate and every block read flat.
- Every block casts its own blurred shadow on its base plane (anchor 6), so the shadow sinks and rises with the block.
- The API budget is a dashed glass volume 80 units tall (200ms × 0.4), and the bars stand inside it. A floating dashed ceiling had nothing tying it to the plate and read as a flat rectangle.
- After its last press, Bit steps off the key (Save, PR card, Rerun), so the finished frame shows the key's label.
- Bars rise through the plate with `--snap` instead of scaling, so their skirts keep a fixed height.
- Below 600px the diorama takes 90% of its column, so the turned plate's far corner stays on screen.

## Critique, round 1

Captures: dark final frames at 1440, taken under reduced motion so they show the resting frame.

- **Squint.** The headline lands first, the yellow Email key second, then the diorama's hue key (Save, release, Rerun). The diorama sits right of the copy and never outranks the headline.
- **Type.** Mono labels at 11 units, Unbounded on keys and readouts at 12 and 20 units: a 1.67× jump.
- **Color.** One hue per scene plus neutrals. The hue goes only to Bit, the subject key and the chip. Pass.
- **Space.** Blocks sit on the 8-unit grid with 24+ units of margin.
- **Motion.** Not watched live yet.
- **Detail specificity.** Real states and data: "Follows your system", `cart.spec.ts`, `cart.ts +4 −2`, `vp test · 48 passed`, PR #128, `$ vp run release`, 4h 10m to 6m, GET /cart and 200 OK, 38/44/41ms under a 200ms budget, p95, `vp test --repeat 5`, 60 of 60 passed. That is more than anchor 1's count.
- **Sameness.** Shares none of the house-style traits: dark arcade ground, Unbounded, saturated per-slide hues.
- **Generated tells.** No numbered sections, no glow orbs, and no pills laid over a visual. The beat chip is the existing thumbnail device and does real work.
- **Gaps found:**
  1. Neutral skirts disappear into the plate in dark mode, so the blocks read flat.
  2. Bit covers the Save, PR and Rerun labels at rest.
  3. The budget ceiling reads as a flat dashed rectangle, not a height.
  4. The plate's dot grid moirés under perspective.
  5. The tests scene capture caught the intro, so recapture it.

All five were fixed (see Build notes; the dots dropped to 12% and 22% alpha).

## Critique, round 2

Captures in `shots/`: `dark-0..4.png` and `light-0..3.png` at 1440, `mobile-390-light-0.png`, and the motion sheets and clips `motion-1440.*` and `motion-390.*`.

- **Squint.** Unchanged and correct. The diorama now has real depth: skirts and shadows separate every block from the plate in both themes.
- **Color, light and dark.** Light uses white tops, `#c5c5d1` skirts and a soft `rgb(30 30 60/.14)` shadow. The hue-tinted plate matches the light thumbnails, and no text falls below its dark-mode legibility.
- **Motion.**
  - The live probe holds 57 to 58fps, p95 16.8ms.
  - Every beat plays in the recording: the tower drops top-first and the toast rises with overshoot.
  - Probe findings are all outside the diorama: the 7.4s and 7.6s linear progress pip, and the site's existing entrances under reduced motion.
  - Under reduced motion the global `.arc *` rule removes every diorama animation. Tilt is off and each part shows its last frame.
  - Deleting Bit would leave five static mockups, so the signature earns its place.
- **Mobile.** At 390 the headline and both actions come first and the diorama sits below them. After the 90% width fix the plate fits with no page overflow (scrollWidth 390).
- **Nits, left as they are:** labels drop to about 6px at 390, which is fine for an illustration but not for reading. The chore names on the tower's front skirts can be read only on desktop.
