# Favicon: direction

## Brief

- **Who sees it:** anyone with itsfaqih.dev open among other tabs, bookmarks and history rows. It is 16px most of the time, 32px on retina, 180px as a home-screen icon.
- **The one action:** find this tab again. The mark should match the hero, so the tab looks like the page it belongs to.
- **Feel:** *printed, tiny, loud*. "Printed" asks for texture and misregistration, "tiny" needs 2 or 3 shapes at most, and "loud" means the hue gets a large area, not a sliver.

## Anchors

1. **The hero (`src/routes/-components/hero/hero-prints.tsx`)**: the source. Solid ink primitives (square, circle, triangle, bar) on a 320 × 200 viewBox. Under each one sits a halftone plate in the slide hue: a dot pattern on a 5-unit pitch, r 1.75, rotated 18°, offset (5, 4), blended with `multiply` in light mode and `screen` in dark. Registration marks are a ring (r 8) and a crosshair (±14), both 1.8 stroke in the hue.
2. **recent:1g2fr97-paper-mono-poster-series**: two inks. A big flat pink block sits under black type, and the overlap stays black. This is why the hue takes a large area here and is not just an outline.
3. **recent:p35y20j-elevenlabs-brand-identity**: one glyph built from plain bars that still reads at sticker size and at avatar size. At 16px each variant gets at most three shapes.

## System

- **Grid.** The viewBox is 32 × 32 on a 2-unit grid, so at 16px every edge lands on a whole pixel. The tile has rx 7.
- **Ink and ground.** These are the site tokens. In light mode the tile is `--bg #f5f5f8` and the ink is `--text #111117`. In dark mode the tile is `#0e0e13` and the ink is `#f4f4f8`. The SVG switches between them with `prefers-color-scheme`, the same way the hero switches.
- **Hue.** `--ux`: `#e0389f` in light mode, `#ff6ad5` in dark. It is slide 1's hue and the "behave" highlight, so it is the colour of the headline a visitor reads first.
- **Halftone at favicon scale.** The hero's 5-unit pitch is 1.6% of its width. At favicon scale, 1.6% of 32 would be a 0.5-unit pitch, which turns into a flat tint. So the pitch is 3.2 units with r 1.15, still rotated 18°. At 32px the dots are visible, and at 16px they read as a lighter tint of the hue, as a print viewed from far away does.
- **Misregistration.** The hero offsets the plate by (5, 4) on 320 units, about 1.5%. At 32 units that would be under half a pixel and invisible, so the offset is exaggerated to (2.5, 2). This is the only thing pushed beyond the hero's proportions, and the reason is legibility.

## Variants

- **A. Print.** This is the hero's opening frame with the triangle and bar removed: an ink square, and a hue circle overlapping its top-right corner, both with offset halftone plates. It is the most literal of the three.
- **B. Registration.** The hero's registration mark becomes the logo: an ink ring and crosshair over a halftone hue disc that sits off-register. It is the most "print shop" of the three and the most legible at 16px.
- **C. F.** The monogram from the current favicon, rebuilt from the hero's primitives: three ink bars make the F, a solid hue circle stands in for the full stop of "behave.", and the halftone plate sits off-register under all of them. It keeps the name in the tab.

## Critique, round 1 (shots/r1-preview.png, SVGs in archive/v1)

- **Squint, 16px.** C reads as "F". A reads as a square with a pink blob. B blurred into a blob because its strokes sat on half pixels and the stroke was 2.6.
- **Halftone.** A 3.2 pitch is 10% of the icon, so at 180px it read as polka dots. Dots clipped at the shape edges looked like splatter, worst under C's full stop.
- **Pixel grid.** The stems in B and C landed on odd units, which are half pixels at 16px.
- **Fixes.** The pitch is now 2.4 with r 0.85. Every straight edge sits on an even unit. B is centred at 15 with a 2-unit stroke. C's solid dot has no plate.

## Critique, round 2 (shots/r2-preview.png)

- **Squint.** At 16px, all three hold their silhouette in both tab themes. C is the sharpest, with every edge on a whole pixel. B's crosshair stays open.
- **Colour.** Each variant uses two inks plus the ground: ink and `--ux`. Light and dark switch the way the hero does: multiply on light, screen on dark.
- **Sameness and tells.** None found. These are the hero's own primitives, not a generic gradient blob.
- **Nits.**
  - A's light-mode circle reads deeper magenta than the slide, because the hue is multiplied over its own plate, the same as in the hero.
  - At 16px, B's plate is only a faint pink wash.
