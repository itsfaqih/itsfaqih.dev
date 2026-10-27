# Hero illustrations: three directions to choose from

## Brief

- **Who arrives:** engineering leads, recruiters and founders reading the rotating headline ("I build interfaces that behave / agentic setups that work / dev tools that save hours / APIs that stay fast / tests that never flake").
- **The one action:** press "Email itsfaqih@gmail.com". The illustration only has to make each phrase feel true and memorable for the few seconds it's on screen.
- **Feel:** *playful, precise, quick*. Playful pulls toward toys and jokes, precise toward tidy alignment and steady loops, quick toward short, snappy motion.
- **What changed from the last round:** the scenes no longer show real UI or real APIs. Each one is an illustration of the idea (a metaphor, sometimes a pun). They keep the site's per-slide hue, light and dark themes, and the tilt toward the cursor.

## Anchors

1. **21st:kedhareswer.foundation-primitives** (moving): soft matte primitives (asterisk, sphere, capsule, hourglass, orb), each in one saturated hue on a near-white ground, lit from the top left. Variant A takes the shape vocabulary (the hourglass and asterisk especially) and the matte shading: a highlight at the top left, the body hue, and a rim about 65% toward black.
2. **bencho:bounce-loader** (moving): squash and settle. Travel uses `cubic-bezier(0.33, 0.55, 0.2, 1)` at 280ms and the scale pop `cubic-bezier(0.3, 1.12, 0.4, 1)` at 260ms. Variant A uses these for landings and the ball's stretch.
3. **recent:0t0c08y-ghost-skater-pixel-game:** pixel art at a constant 3 to 4 screen px per art pixel. The scene keeps one hue family with small warm accents, parallax bands with the sky in the top 65%, a character with one readable silhouette, and a score popup beside the action instead of in a HUD. Variant B is built on all of this.
4. **recent:1g2fr97-paper-mono-poster-series:** a riso poster with three inks only (paper, one fluorescent hue in halftone, near-black type). Glyphs are oversized and tumbling, rotated −25° to +40°; specimen data in 12px mono serves as texture; misregistered layers. Variant C is built on these.
5. **Moves:**
   - `mascot-family-as-brand`: one face (two slit eyes) shows up in every scene.
   - `spring-and-rubber-band-physics`: one overshoot curve, `(0.34, 1.56, 0.64, 1)`.
   - `halftone-dither-imagery`: coarse dots carry the hue in C.
   - `differential-speed-parallax`: the pixel layers in B.

## Shared system

- **Color:** the site's tokens (dark `#0e0e13 / #17171f / #f4f4f8`, light `#f5f5f8 / #fff / #111117`). Each scene gets exactly one slide hue (`--ux #ff6ad5`, `--cw #4dd4ff`, `--ar #ffb02e`, `--ts #7dff6a`, `--ax #9d7bff`). The site's `--go #ffe14d` is the only second accent, and only in B, for pickups and coins.
- **Type:** Unbounded 700 for anything set big (C's glyphs, popups), Geist Mono for small labels.
- **3D:** every card tilts toward the cursor (rotateX up to 10°, rotateY up to 14°, 12% damping per frame). The art layer sits `translateZ(30px)` above its ground, so the tilt shows parallax. Tilt is off under reduced motion.
- **Mascot:** a hue body with two vertical slit eyes. It's a clay ball in A, an 8×8 sprite in B, and absent in C (the type is the character there).
- **Motion:** every scene is a short seamless loop (1.6 to 4.8s). Reduced motion stops every loop on a resting pose that still tells the joke.
- **Shader:** none. Each scene is a few shapes, and SVG and CSS keep all 15 scenes cheap.

## A. Toybox

Matte clay toys on a soft hue-lit floor (anchors 1 and 2).

1. **Interfaces that behave:** three blocks and the mascot ball drop in one by one and land perfectly stacked, each with a squash. Nothing slips.
2. **Agentic setups that work:** three meshed gears turn at speeds set by their tooth counts. The big gear has the mascot's eyes.
3. **Dev tools that save hours:** an hourglass drains, flips with an overshoot, and a "+4h" coin pops out.
4. **APIs that stay fast:** the mascot ball shoots through three hoops, stretching as it goes.
5. **Tests that never flake:** a tower (cube, mascot ball, cone) balances on a seesaw that tips back and forth. The tower wobbles and never falls.

## B. Pixel arcade

Tiny 80×50 game screens, 4 screen px per art pixel at 320px wide, moving in `steps()` (anchor 3).

1. **Interfaces that behave:** Bit jumps, bumps a "?" block, and a coin pops out with "+1".
2. **Agentic setups that work:** two robots work a conveyor belt. Crates arrive plain and leave with a ✓.
3. **Dev tools that save hours:** Bit runs, grabs an hourglass pickup, and "+4H" pops beside it with afterimages.
4. **APIs that stay fast:** a rocket holds still while stars streak past in three parallax layers. A "12MS" popup sits beside it.
5. **Tests that never flake:** snow falls, Bit stays under an umbrella, the flakes burst on it, and the counter reads "FLAKY 0".

## C. Riso print

Two inks (slide hue in halftone, text ink) on the site's own ground, so it avoids the warm off-white house style (anchor 4).

1. **Interfaces that behave:** a tumbling "UI" snaps upright onto a grid, then tumbles again.
2. **Agentic setups that work:** a halftone asterisk ratchets round in 30° steps. A loop of "plan, run, check, ship" lights up one word at a time.
3. **Dev tools that save hours:** a clock's hands spin back four hours, and a "−4h" stamp lands.
4. **APIs that stay fast:** an arrow streaks across with misregistered trails, and "42ms" lands.
5. **Tests that never flake:** fifteen ✓ are stamped in sequence, then "0 FLAKY".

## Critique, round 1

Shots: `shots/r1-dark-1440.png`, `shots/r1-light-1440.png`.

- **C2 and C3 broken.** The asterisk showed one bar and the clock had no ticks. The global `transform-origin: center` was also shifting shapes that carry a `rotate(a cx cy)` attribute. Fixed by scoping the rule to `svg *:not([transform])`.
- **A4 mostly empty.** The ball was off screen for 54% of the loop. Its pass now runs over 72% of the 1.9s loop, with stretch held through the hoops.
- **B labels.** They were Unbounded, which reads as web type on a pixel screen. Switched to Silkscreen, at 5 art px.
- Squint: in every tile the eye lands on the character or object first, then the caption. Each variant uses one hue per tile; `--go` appears only in B.

## Critique, round 2

Shots: `shots/r2-{dark,light}-1440.png`, `shots/r2-light-390.png`, motion sheets at 1440 (dark) and 390 (light).

- **Light B: snow and stars invisible.** They were white on the pale sky. Added a snow ink (`.ps`): white in dark mode, the hue mixed 55% toward ink in light mode.
- **Motion probe.** 58–59fps, p95 16.8ms, no long tasks, no findings. Reduced motion runs 0 animations and 0 rAF; each scene holds a resting pose that still tells the joke.
- **390px.** One column, and every scene reads at full width. Nothing overflows.
- **Sameness.** Shares none of the house-style traits (no warm paper, no vermilion, no serif).
- Nits left: in dark mode A2's small black gear is low-contrast against the floor; C4's arrow is off screen for about 20% of its loop.

## Round 3: Riso picked, new headlines

The user picked C (Riso print). The headlines are now: interfaces that feel right / agents that finish the job / dev tools that save hours / backends that scale quietly / test suites you can trust. These are updated in `src/routes/index.tsx`, including the "Backends" tab and the intro word. Their feedback: UI, dev tools, APIs and tests left too much empty space. The three-variant page is archived at `archive/v1-three-variants.html`. The focused page is `riso.html`, with larger cards (min 420px wide).

- **Feel right.** "UI" is set at 184px and spans the full card height, with a halftone slab behind it. One line of spec text runs across the top, and a round ✓ seal stamps in on the snap.
- **Save hours.** The clock is now r=86 and fills the left half. On the right, "−4h" sits over a before/after build bar; the before bar collapses as the hands spin back.
- **Scale quietly** (replaces the arrow). A 4×3 rack of servers eases in one at a time with a soft ease-out, not a stamp, with "replicas 1 → 12" and "alerts 0 · pages 0".
- **Can trust.** A 40px-wide halftone check stretches corner to corner. The ink check draws itself in, five run lines appear, and the "0 FLAKY" stamp lands in the open corner.
- Critique: frames held at 0.6s and 2.4s, dark, light and 390px (`shots/riso-r2-*`). Fixed: the before bar scaled from its centre (`:not([transform])` outweighed its origin), the spec text touched the U, and the "h" of "−4h" ran off the edge. Remaining nit: the first ~0.5s of "can trust" is nearly empty while the check draws in.

## Round 4: three abstract variants in the Riso style

**Brief.** Same visitors and the same one action (press Email). New ask: "more abstract", three more variants in the same print style. Each headline becomes a composition of pure primitives (dots, slats, shapes) with no objects, UI or words inside the art. Feel: *playful, precise, quiet*.

**Kept from the Riso system.** Two inks only: the slide hue (halftone, offset +4/+3 for misregistration, `screen` on dark, `multiply` on light) and the text ink. Grain paper, a 16px hue grid at 26%, cursor tilt with the art at `translateZ(30px)`.

**Anchors (new).**
- `21st:kedhareswer.slat-count-preloader`. Shapes built from horizontal slats that slide row by row at 520ms `cubic-bezier(0.65,0,0.35,1)`, staggered 69ms per row. Basis of **F. Slats**.
- `21st:dhileepkumargm.metaballs`. A halftone lattice whose dot sizes carry the image, with dots swelling cell by cell. Basis of **E. Dot field**: one lattice of 8-unit cells, with dot radius = field value × 3.6.
- `21st:xubohuah.entropy`. Order vs chaos staged with nothing but dots: the "feel right" field resolves from noise into a disc.
- `21st:xubohuah.generative-geometry`. A primary-shape lattice on a flat stage. Basis of **D. Primitives**: circle, square, triangle and bar only.
- `recent:1g2fr97-paper-mono-poster-series`. Still the ink, grain and tumbling rotation.

**Moves.** `halftone-dither-imagery` (E is pure halftone); `dithered-data-fills` (density carries meaning: sparse = not yet, dense = done); `spring-and-rubber-band-physics` (D settles with `(0.34,1.56,0.64,1)`).

**D. Primitives** (SVG + CSS).
1. Feel right: four scattered, tumbling primitives settle into one balanced composition.
2. Finish the job: four quarter discs converge one by one into a whole disc, then an ink ring closes.
3. Save hours: four tall bars crunch down and a halftone disc rises into the freed space.
4. Scale quietly: one square becomes 4, then 16, with soft cross-fades and the same total area.
5. Can trust: a ball drops onto a level bar and lands inside its dashed ghost every time.

**E. Dot field** (one 40×25 halftone lattice per card on canvas 2D, a hue dot plus an ink core above 0.55).
1. Noise resolves into a crisp disc.
2. A front sweeps left to right; dots behind it fill to full.
3. A clock wedge sweeps backwards and shrinks from 360° to 30°.
4. One blob divides 1 → 2 → 4 → 8; area is kept, so it stays calm.
5. Perfectly regular rings pulse from a steady core.

**F. Slats** (16 rows, one JS tween engine, 520ms per row, 69ms stagger).
1. Ragged slats slide into a circle.
2. A diagonal "loading" slash becomes a check.
3. Long timeline bars compress to short ones.
4. One slat duplicates to 4, then 16, then two columns, with a soft ease-out.
5. Rows extend one after another to the same exact end line, then retract together.

**Motion budget.** E and F share one rAF loop that respects pause and stops under reduced motion, which shows each scene's resolved frame. The canvas backing is capped at DPR 2. No shader: canvas dots are enough for 1000 cells.

### Critique, round 1 (abstract.html)

- **E1 noise.** The summed-sine noise tiled into diagonal chevron blocks. It now uses smooth value noise at a 34-unit scale.
- **E2 sweep.** The fill ran to the card edge and turned into a solid cyan slab. The fill is now confined to an inset panel (28..292 × 24..176) and capped at 0.95.
- **F3 compress.** The ragged left edge made the short bars read as noise. Rows now share x 34, and short widths run 22–52 so the result still reads as bars.
- **D, F1, F2, F4, F5.** These read as intended. Shapes leaving the frame during the scatter is accepted as the entry.

### Critique, round 2

- **Frames.** 60fps, p95 16.7ms, 0 long tasks, motion findings none (shots/ motion sheet).
- **Reduced motion.** 0 animations, 0 rAF. D shows its settled poses. E draws each rest frame. F shows each target pose (circle, check, short bars, two columns, full rows).
- **Light mode and 390px.** No overflow (scrollWidth 390). Inks hold on white, and the mis-registered halftone uses multiply.
- **Nits.**
  - The E2 filled state is still the heaviest card on the page.
  - In D3, the first bar starts rising while the disc fades out.

## Round 5: Primitives picked; new options for dev tools, backends, tests

The user picked D Primitives, keeping "feel right" (settle) and "finish the job" (quarters + ring). The backend headline is now "backends that run reliably". There are three new Primitives options for each of the other headlines, in primitives.html:

- **Save hours.**
  - A. Shortcut: a ghost walks a meander while the ink ball takes the straight bar.
  - B. Hourglass: drains in a blink, then flips on a spring. The loop is seamless.
  - C. One nudge: the ball tips five dominoes in a 110ms cascade.
- **Run reliably.**
  - A. Pendulum: ±30°, 1.5s, sine in-out, with a tick at each pass.
  - B. Orbits: 2.4 / 4.8 / 9.6s, whole-number ratios.
  - C. Steady beam: boxes keep landing on a level beam and slide off.
- **Can trust.**
  - A. Plumb tower: blocks land inside their outlines next to a plumb line, and a registration mark seals the result.
  - B. Exact fit: a triangle settles into its notch and registration marks pop at the four corners.
  - C. Sieve: circles fall through the gaps, triangles get caught.

### Critique, round 1

- **Checks.** No console errors. Reduced motion gives 0 animations. Light mode inks hold up.
- **Fixed.** The dashed arc over the dominoes meant nothing, so it became an end marker.
- **Nits.**
  - In light mode, the hue fills (green, orange) read paler than the ink.
  - The Pendulum's still frame rests at the extreme of its swing.

## Round 6: Shortcut for dev tools; backends are about queues and retries, tests about regressions and bugs

The user picked Shortcut (A) for "save hours". backend-tests.html has three new options each for the other two headlines:

- **Run reliably.**
  - A. Retry: the ball bounces off a closed gate. A backoff ring fills, the gate lifts, and the second try lands.
  - B. Queue: a 0.9s beat moves circles one slot at a time into a worker that pulses, and squares come out the other side.
  - C. Backoff: hops of 30, 60 and 120px. The first two land on a ×, the third lands on the pad and a ring closes.
- **Can trust.**
  - A. Regression: one bar jumps past the dashed threshold, turns to the hue, gets a registration mark, and springs back.
  - B. Snapshot diff: the square in the right frame slips, a scan bar finds it, the sign shows ≠, then the square snaps back and the sign returns to =.
  - C. Bug to test: a bug wanders, brackets close on it, and it becomes the sixth square in the row of tests.

### Critique, round 1

- **Fixed.**
  - In Regression, the flag overlay was invisible: screen blend of the hue over white ink stays white. It is now solid hue.
  - Bug to test was pushed to a corner. It is recomposed around the centre with a larger bug and angled legs, and the ghost trail is dropped.
  - Under reduced motion, the ≠ slash showed and the Backoff ball sat at the start. Both are fixed.
- **Checks.** No console errors. Reduced motion gives 0 animations. Light mode holds.
