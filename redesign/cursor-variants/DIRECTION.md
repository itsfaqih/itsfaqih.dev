# Cursor: three directions to choose from

## Brief

- **Who arrives:** the same visitors as the hero (engineering leads, recruiters, founders), on a desktop with a mouse. Touch screens keep the system pointer.
- **The one action:** read the page and press the things on it (Email, the rule cards, the deck). The cursor has to say "this is pressable" faster than the current gold pixel arrow does, and feel like it was printed by the same press as the hero.
- **Feel:** *inky, exact, springy*. Inky pulls toward misregistered halftone and rough print; exact toward a hotspot that is never late; springy toward the overshoot the hero already settles with.
- **What changed from the last round:** round one redrew the pixel arrow in the arcade palette. The user asked to stop deriving from the existing cursor, be more creative, and take the hero illustration as the reference.

## Anchors

1. **The hero's Riso system** (`redesign/hero-variants/DIRECTION.md`, `hero-prints.tsx`): two inks only, the text ink (`--text`) on top and the slide hue as halftone behind it, offset `+5/+4` for misregistration. Halftone pattern: 5-unit pitch, dot r 1.75, rotated 18°. Outline top is a 3-unit stroke. Settles on `--spring cubic-bezier(0.34, 1.56, 0.64, 1)`, travels on `--inout cubic-bezier(0.65, 0, 0.35, 1)`, and the hue eases between slides over 600ms through `@property --hue`. Vocabulary: circle, square, triangle, bar, registration mark (r 8 ring with a crosshair), the pulse `scale(0.72) → 1`.
2. **21st:designali-in.custom-cursor** (moving): a dot whose cyan and magenta channels trail the pointer at different offsets, `transform 100ms ease`. Basis of **A. Misprint**: the hue plate drifts out of register with speed.
3. **21st:uilayout.contact.cursor-follower** (moving): an exact dot with a ring that lags and grows over interactive elements, `width/height 300ms ease`. Basis of **B. Registration**: the exact crosshair with the ring on a spring.
4. **shaders:section.cursor-trail-contact**: the cursor paints halftone dots on a dark ground. B prints a halftone stamp on every click instead of a continuous trail.
5. **21st:soralabs.custom-cursor** (moving): a dot that swells into a ring over a target, opacity `150ms cubic-bezier(0.4, 0, 0.2, 1)`. Basis of **C. Primitives**: the cursor changes shape to say what the target is.
6. **21st:dillionverma.smooth-cursor** (moving): an arrow that rotates toward its direction of travel on a spring. C tumbles with velocity and settles with an overshoot, like the hero's pieces.

## Shared system

- **Inks:** `--text` for the ink layer and the target's hue (`--c` of the nearest card or slide, else `--go #ffe14d`) for the halftone layer. The halftone is scaled down for a 20px object: 3.2px pitch, r 1.15, rotated 18°.
- **Hotspot is never late.** The root follows the pointer exactly on every `pointermove`. Only parts inside it (a plate, a ring, a rotation) run on springs.
- **Timing:** press down 15ms linear, release 260ms `--spring` (the hero's key press). Shape swaps 260ms `--spring` with opacity 120ms. Hue 600ms `--inout`.
- **States:** default, point (links, buttons, cards), grab and grabbing (the draggable chip), text (inputs: the custom cursor hides and the system I-beam shows).
- **Reduced motion:** springs snap to their target and nothing tumbles or trails; shape and colour still change, and B's stamp only fades.
- **Off:** touch and pen pointers, `(hover: none)`, and when the pointer leaves the window.
- **Shader:** none. Three SVG layers per frame are cheaper than a canvas over the whole page.

## A. Misprint

An ink arrow with its hue halftone plate printed out of register. At rest the plate sits `+3/+2.5` behind the ink. Moving drags the plate behind the ink (up to 9px), and stopping springs it back with a wobble. Over a link the ink knocks out to an outline and the hue fills the arrow. Pressing pulls the two plates into perfect register for the length of the click. Grab swaps the arrow for an ink square, grabbing tips it 10° and shrinks it to 82%.

## B. Registration

The printer's registration mark from the hero's paper: an exact ink crosshair with a hue ring that trails on a spring. Over a link the ring tightens from r 9 to r 6, fills with halftone and the crosshair's arms grow from 5 to 9, as if the mark locks on. Every click prints a stamp on the page: a halftone disc and an ink ring, off register, that springs in from 72% and fades over 900ms. Grab turns the ring into a square, grabbing tightens it.

## C. Primitives

The cursor is one of the hero's primitives and changes shape by state: an ink triangle with its point as the hotspot, a hue disc with an ink outline over anything pressable, a square for grab. It tumbles toward its direction of travel (up to 40°) and settles with the hero's overshoot when the pointer stops. Pressing squashes it to 78%.

## Signature

The cursor is printed, not drawn: two inks that slip out of register when you move fast and snap back into register when you press. None of the anchors ties the click to registration; here, pressing is literally "lining up the print".

## Critique, round 1

Driven live in a headless browser (pointer moves, hover on a card, press, drag the chip), dark and light, 1x crops.

- **B over the chip.** The ring was drawn in the chip's own hue and vanished on it. Grab and grabbing now draw the ring in ink. Line work stays legible on every surface; hue is only ever a fill.
- **B locked on.** At r 6 the locked ring was swamped by the crosshair arms; it is now r 7 (scale 0.78) with a matching disc.
- **Halftone at 1x.** A 3.2px pitch blurred into a flat tint at 1x; it is now 3.6px with r 1.3, which still reads as dots.

## Critique, round 2

`shots/states.png` (each state at 3x, dark and light), `shots/motion-1440.*`.

- **Motion probe.** 60fps, p95 16.8ms, 0 long tasks. The one finding that applied: the cursor's hue swap ran 600ms, too slow for hover feedback. It is now 180ms. The other findings belong to the demo's hero mimic, which copies the real hero's 600ms slide-hue ease on purpose.
- **Reduced motion.** 0 CSS animations; the springs snap, so only shape and colour change. The rAF loop keeps running because the cursor has to follow the pointer; the port should pause it when the pointer is still.
- **Squint.** In all three variants the ink shape is what you see first in both themes, and the hue shows up as a halftone offset or a fill. Nothing has less contrast than the current gold pixel arrow.
- **Nits.** C's triangle reads as a pointer, but less obviously than an arrow. B uses a centre hotspot, which is unusual for reading pages.

## Round 3: Misprint picked, pixel shapes

The user picked A and asked for round one's pixel arrow (variant B, "Lit") with every other state as a pixel hand in the same style. `shots/misprint-pixel.png`.

- **Shapes.** Drawn on a 2px grid with `crispEdges`: the pixel arrow (hotspot at its tip), a pointing hand for link and press (hotspot at the fingertip), an open hand for grab, a fist for grabbing. Each is an ink outline (`--text`) around a fill.
- **Fill.** Page colour at rest; the target's hue over anything interactive, so the arrow goes dark and the hand lights up, as round one's arrow turned gold when pointing.
- **Plate.** The halftone silhouette of the current shape sits `+3/+2.5` behind the ink, lags up to 9px with speed and springs back; press and grabbing pull it into register. Press squashes the shape to 88%.
- **Same-hue surfaces.** On the purple chip, a hue fill matched the chip and the hand read only as an outline. When the hovered element's background is its own `--c`, the fill falls back to the page colour.
- **Hand size.** The first hands (11 rows) read smaller than the 13-row arrow. The pointing hand is now 15 rows with a knuckled index finger, the open hand 14, the fist 10, so a hand weighs about the same as the arrow.

## Port

`src/components/print-cursor.tsx`, mounted in `__root.tsx`, styles in `src/arcade.css`. `shots/site-ported.png`.

- **Mode from CSS.** While the cursor is on (`html.cur-on`), the `--cursor*` tokens point at a blank `/cursors/none.svg#<glyph>`, so every existing rule that asks for `--cursor-point` or `--cursor-grab` picks the glyph with no JS selector list. `cursor: text`, `wait`, `not-allowed` and other keywords hide the print cursor and let the system cursor show.
- **Hue** comes from the nearest inline `--c`, else `--go`.
- **Idle.** The rAF loop stops once the pointer and the plate settle and restarts on the next pointer event; a MutationObserver re-reads the mode when hover or drag state changes without a move.
- **Fallback.** Before hydration, on touch, or without JS, `scripts/cursors.py` writes the same pixel art as static SVGs at 2px cells.
