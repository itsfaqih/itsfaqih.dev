# Page scrollbar

## Brief

- **Who arrives:** the same desktop visitors as the rest of the site, reading long Rule of Thumb pages and the home page with a mouse or trackpad. Touch keeps the system's overlay scrollbar.
- **The one action:** know where you are in the page while scrolling, and grab the bar to jump.
- **Feel:** *quiet, exact, coloured*. Quiet: it is not there until you scroll or reach for it. Exact: it tracks the page 1:1 and drags 1:1. Coloured: it is one flat hue, the page's own.
- **What changed:** round one styled the native scrollbar and showed it only near the edge. Native scrollbars cannot fade or change colour smoothly, and the user wants it visible while scrolling and in a single solid colour that follows the page.

## Anchors

1. **uiarc:scroll-area**: overlay bars that exist only while scrolling or hovered, hidden after a delay; track fades on opacity 480ms `cubic-bezier(0.22, 1, 0.36, 1)` (the probe flags it as slow for feedback); the thumb thickens under the pointer as a target-size cue; pressing the track pages 90% of the viewport so a line of context carries over; keyboard and find-in-page stay native because the page itself still scrolls.
2. **Move colour-field-per-route-or-project**: one flat colour per route or item, while the system stays constant. Here the "field" is 6px wide.
3. **aceternity:component.tracing-beam**: progress as a single lit rail in one accent on the page's ground, no track drawn.
4. **Move accent-hue-encodes-state**: the colour itself is the information; here it says which rule or section you are in.
5. **The site's hue system** (`src/arcade.css`): every rule, project and slide carries `--c`; light theme darkens it with `color-mix(in oklab, var(--c) var(--ink-mix), #000)` and gold takes `--go-ink`. Colour changes ease 180ms, the same as the print cursor's hue.

## Direction

- **Colour.** One solid fill, no border, no track. The fill is the `--c` of whatever sits under the middle of the viewport, else `--go`. Dark theme uses the hue as is; light theme uses the site's ink mix of it (`--go-ink` for gold) so it holds 3:1 against `#f5f5f8`. Forced colours: `CanvasText`.
- **Shape.** 6px wide, 3px radius, 6px from the right edge; 10px wide under the pointer or while held (anchor 1's target-size cue). The hit strip is 24px wide for WCAG 2.5.8. Minimum length 40px.
- **When it shows.** While scrolling (any source: wheel, Lenis glide, keys, find-in-page), while the pointer is within 32px of the right edge, and while dragging. Hides 900ms after the last of these.
- **Motion.** In: opacity 120ms ease-out. Out: opacity 320ms `cubic-bezier(0.22, 1, 0.36, 1)` (anchor 1's curve, shortened past the probe's finding). Width 160ms same curve. Colour 180ms ease. Reduced motion: no opacity or width transition, colour still changes.
- **Input.** Drag the thumb 1:1 (pointer capture, cursor `grab` then `grabbing`, the print cursor's hands). Press the track to page 90% toward the pointer. Keyboard scrolling stays the page's own. The bar is `aria-hidden`: it duplicates the page's native scroll, which assistive tech already exposes.
- **Signature.** The bar is the only always-in-reach object that changes hue as you read: scroll the home page and it turns pink, cyan, orange as each section's hue passes the middle of the screen; open a rule and it is that rule's colour.
- **Shader.** None; a 6px bar.

## Critique, round 1

Checked in Chrome at 1280×800 in light and dark (shots in `shots/`).

- **Visible while scrolling.** After one wheel tick the bar is at opacity 1 within 150ms, rides the whole Lenis glide, and fades out 900ms after the glide ends (opacity 0.1 at 2.5s, gone at 3.2s). Pass.
- **Colour.** Home mid-page: gold (`#8b5f00` light, `#ffe14d` dark). Proximity Principle: its cyan `#4dd4ff`, at the 55% ink mix in light and the full hue in dark. One flat fill, no track. Pass.
- **Reach.** Pointer within 32px of the edge shows it and keeps it while near; the thumb widens 6 → 10px on hover. Pass.
- **Drag.** Pointer capture holds when the pointer leaves the strip: 200px down moved scrollY 0 → 984, the bar stayed shown, and the print cursor switched grab → grabbing. Hidden again 1.5s after release. Pass.
- **Track.** Pressing below the thumb paged 984 → 1794 (810 = 90% of 900). Pass.
- **Squint / colour count.** One hue on the bar at any time, the same one the section already shows. Nothing louder than the content.
- Gap: the first dark check ran with `.light` still on `<html>`, so it read the light mix. It was a test error, not a bug; checked again by setting the theme through `localStorage`.

## Critique, round 2

- Typecheck, oxlint on both new files, and the unit tests pass.
- Reduced motion: CSS removes the opacity and width transitions and keeps the colour change; Lenis is off, so scrolling is native. Read from the code; not run in the browser.
- Forced colours: `CanvasText` fill. Read from the code.
- Nothing larger than a nit. Nit: on very short pages the 40px minimum thumb can sit over the header's theme button area at the top right; the 24px strip only takes pointer events while shown, so clicks pass through at rest.
