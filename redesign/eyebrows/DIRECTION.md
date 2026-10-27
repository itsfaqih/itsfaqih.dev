# Home eyebrows and ticker colour

## Brief

- **Who arrives:** people deciding whether to hire or work with Faqih, skimming the home page top to bottom.
- **The one action:** tell the sections apart at a glance while scrolling toward "Email me".
- **Feel:** *loud, legible, meaningful*. Loud: the arcade palette gets used, not hinted at. Legible: every label still passes contrast in both themes. Meaningful: a colour says something, so it never becomes confetti.
- **What changed:** every eyebrow is gold (`--go-ink`), and the ticker is a gold band with black words. The user wants each eyebrow in its own colour and a ticker with several colours.

## Anchors

1. **godly:reevo**: each product pillar owns one flat hue (orange, pink, green, yellow, blue) on a neutral page, shown as a solid field behind its content. Taking: one flat hue per item, hue as a solid field rather than a tint.
2. **21st:bundui.marquee-effect**: a ticker band where the line of text becomes a stripe of colour (green band, purple band), white caps on the fill. Taking: colour carried by the band's fill, not the letters. Moving: a linear loop.
3. **Move colour-maps-to-meaning**: give every hue one job and reuse it everywhere. Taking: the site's hues already have jobs in the hero's "What I build" pips (Interfaces `--ux`, Agents `--cw`, Dev tools `--ar`, Backends `--ts`, Tests `--ax`); the ticker names the same things, so it uses the same hues.
4. **Move section-eyebrow-label**: one 11 to 15px label 8 to 10px above each H2, one style repeated. Taking: keep the existing 13px/500 label and 10px gap; only its colour changes.
5. **Rejected, aceternity:component.colourful-text**: per-letter rainbow cycling. Colour without meaning, and it would fight the ticker.

## Direction

- **Ticker.** The band becomes a row of flat colour tiles, one per word, each the word's hue from the hero pips: INTERFACES `--ux` #ff6ad5, AGENTIC SETUPS `--cw` #4dd4ff, DEV TOOLS `--ar` #ffb02e, APIS `--ts` #7dff6a, TESTS `--ax` #9d7bff. Text stays `--on-accent` #111 (contrast 5.8:1 on the darkest, violet). Tiles butt edge to edge with no gap, so the band reads as a striped colour bar (anchor 2). Each tile is 0 28px padding with the ★ kept. Same 26s linear loop, same pause on reduced motion.
- **Eyebrows.** One hue per section, carried as `--c` on the `<small>` and rendered with the site's text rule `color-mix(in oklab, var(--c) var(--ink-mix), #000)` (full hue in dark, 55% ink in light):
  - Writing (Rule of Thumb): `--cw` cyan. Code Writing is the first and largest rule topic.
  - Experience: `--ux` pink.
  - Tools I use: `--ar` orange.
  - Side projects: `--ts` green.
  - Contact: `--ax` violet. It was pink (`.arc .end h2 small`), which now belongs to Experience; gold would vanish on the gold-framed card and its gold button, so gold stays the action colour.
  Five eyebrows, the five topic hues, each once.
- **Motion.** None added. Colour is static per section.
- **Shader.** None; this is a palette change to text and a band.
- **Moves.** colour-maps-to-meaning (the ticker is a legend of the hero pips); section-eyebrow-label (style unchanged, colour varies).
- **Signature.** The ticker is the hero's "What I build" pips laid flat and set moving: the same five hues, in a band, so the colours a visitor just saw on the pips come back as stripes.

## Critique, round 1

Shots in `shots/`, Chrome 1280×800, both themes.

- **Colour count.** Eyebrows read cyan, pink, orange, green; the ticker band runs pink, cyan, orange, green, violet in the hero pips' order. Neutrals still carry each section; the hue is one 13px word.
- **Contrast.** Eyebrows 7.6 to 13.1:1 in dark and 6.0 to 8.7:1 in light. Ticker text #111 measures 6.0:1 (violet) to 14.7:1 (green).
- **Gap.** Contact was already pink through `.arc .end h2 small`, so it matched Experience. Gold, the planned fix, would vanish on the gold-framed card. Contact is now violet through the same inline `--c`, and the old rule is gone.
- **Generated tells.** No new caps-and-tracking labels, numbering or rainbow text. The colours repeat a legend the hero already shows.

## Critique, round 2

- Contact measures 6.3:1 in dark and 9.8:1 in light. The five eyebrows use five distinct hues, and gold stays the button colour.
- At 390px the ticker tiles fill the band height, and the page width stays 390 with no overflow.
- Typecheck, oxlint and the 8 unit tests pass.
- Only nit: the duplicated ticker list means two pinks meet only at the loop seam, and the -50% loop hides that seam anyway.

## Addendum: dots scroll with the page, click ripple

- The dot layer stays fixed and slides the grid by `scrollY % 22`, so scrolling costs a transform. The magnet canvas offsets its rows to match and hashes colour on the page row, so a dot keeps its colour as it scrolls.
- A click is one physical event. The magnet's pull swings to a push (×(1 − 1.8·e^(−t/140ms))) so the dots by the cursor burst out and spring back. A ring travels 560px over 1100ms (front eased out cubic, energy fading linearly) and moves every dot it crosses by up to 6px: dots behind the crest are pushed out and dots ahead pulled back, so they bunch into a moving ring. Dots on the crest also light and grow. While a ring is out the canvas draws the whole grid and the CSS grid hides behind a screen-wide hole; when the last ring ends, the hole shrinks back to the magnet. At most 4 rings. Off under reduced motion and on touch.
- Measured on the displacement version: frame time p95 16.7ms, max 16.8ms during a ring; the hole was back to 220px after it. Strip at 51/184/434/800ms in `shots/ripple-strip.png`.
