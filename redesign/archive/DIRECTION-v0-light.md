# itsfaqih.dev redesign: direction

## Brief

**Who arrives.** Hiring managers, founders, and engineering leads who got a link from LinkedIn, a CV, or a Rule of Thumb article someone shared. Fellow front-end engineers come in through the articles. Most visitors read once, skim the experience, and decide whether to get in touch.

**The one action.** Email Faqih (`mailto:itsfaqih@gmail.com`). The Rule of Thumb articles are the proof that gets them there.

**Feel.** *Exact, candid, playful.* Exact pulls toward spec sheets and measurement. Candid pulls toward plain first-person copy with opinions in it. Playful keeps the precision from going cold: the page lets you poke it.

## Anchors

1. **godly:vessa**: the frame and the color. A cool off-white ground `#eef0f3` (not warm paper), faint vertical dashed rails about 12px in from each viewport edge, dashed horizontal rules between sections, and one ultramarine `#1f2de6` spent on the primary button, the active item, and the last line of the argument. One tight grotesk (Switzer) for everything: H1 about 52px medium at -3% tracking, section heads about 38px, body 16 to 18px at 1.6 in `#4a4d57`, card titles 15px medium over 12 to 13px grey. Placeholder grey blocks with a single blue block marking the active one. Its pitch, "guidelines that move" and "every value is one click away", is close to what Rule of Thumb does.
2. **21st:ham7a311.caliper** (moving): the signature. A measuring cursor: full-viewport 1px crosshair lines, x/y coordinate chips riding the viewport rims, a hover outline with a `W × H` size readout, and red spacing lines from the hovered element to its parent's edges. Probe: pure DOM, four elements transitioning `opacity 140ms ease`, position written directly from pointer events with no easing, 0 rAF/s, 60fps. Color by role: blue for cursor and grid, red only for measured gaps.
3. **anatomy:anatomy**: documentation voice and the intro curve. The text column is capped at 520px. Metadata runs in a mono row ("23 figures, all live / by Ryan / 8 October 2026"). Three greys on one ink: `#171717`, `#525252`, `#8f8f8f`. Inline links get a 1px grey underline that darkens on hover. On load, a row resolves blur-to-sharp: `transform, filter, opacity` over 500ms on `cubic-bezier(0.22, 0.75, 0.2, 1)`, staggered 32ms. Reduced motion drops to 0 animations.
4. **bencho:blueprint-loader**: the hero's first frame. The plan is drawn first, dotted outline boxes measured off the real layout, then the real content blends in over it (`g.bpl-box` opacity 220ms ease after 200ms), so nothing shifts when the content arrives.
5. **21st:uilayout.contact.impact-experience**: the experience rows. Each job is one row on a shared grid: company in bold about 20px, then small grey labels, then the paragraph, with rows defined by alignment rather than cards.

## Direction

### Type
- **Switzer** (Fontshare, free) carries everything, after Vessa. Weights 400, 500, 600.
- **Geist Mono** for measurement readouts, code, keyboard hints, and the meta row. It is never used for headings and never set in all caps, which keeps it off the house-style "mono microlabel" device. It is functional text: numbers you can check.
- Scale (px): 12 / 13 / 15 / 17 / 22 / 30 / 44 / 64. Every step is at least 1.25x apart from 22 up (22 to 30 is 1.36x, 30 to 44 is 1.47x, 44 to 64 is 1.45x).
  - H1 (name), 64px desktop / 44px mobile, 600, tracking -0.035em, leading 0.98 (Vessa's tight display).
  - Section heads, 30px, 600, tracking -0.025em, leading 1.1.
  - Lead paragraph, 22px, 400, `--ink-2`, tracking -0.01em, measure 30em.
  - Body, 17px / 1.6, `--ink-2` (Vessa 16 to 18 at 1.6). Measure capped at 62ch.
  - Card titles, 17px 500 `--ink`; card captions, 15px `--ink-3`.
  - Meta, 13px Geist Mono, `--ink-3`, tabular numerals.
- Article pages keep their own scale but inherit the families and colors.

### Color
Light (after Vessa, with Anatomy's three greys on one ink):
| token | hex | role |
| --- | --- | --- |
| `--paper` | `#eef0f3` | page ground |
| `--paper-2` | `#f6f7f9` | raised surfaces: cards, demo wells |
| `--paper-3` | `#ffffff` | inputs, pressed-in controls |
| `--ink` | `#101216` | headings, primary text |
| `--ink-2` | `#3f434b` | body |
| `--ink-3` | `#676d78` | captions, meta (4.9:1 on paper) |
| `--rule` | `#c6cbd4` | dashed rules and rails |
| `--rule-soft` | `#dde0e6` | solid hairlines inside cards |
| `--accent` | `#1f2de6` | **the one accent** |
| `--measure` | `#e5484d` | spacing lines in the inspector only |

Dark: paper `#0c0e12`, paper-2 `#14171d`, paper-3 `#1b1f27`, ink `#eceef2`, ink-2 `#b3b8c3`, ink-3 `#7f8693`, rule `#2c313b`, rule-soft `#1f232b`, accent `#7c84ff` (ultramarine lifted for 5.6:1 on dark paper), measure `#ff6b6f`.

**Where the accent may appear:** the "Email me" button, the inspector crosshair and size chips, the active nav item's underline, link hover underlines, the one highlighted word per section head, and the Rule of Thumb card's hover corner marks. Nothing else is chromatic. Article demos keep their own semantic colors (success, error), which are content.

### Layout
- Fixed dashed rails 12px in from each viewport edge, plus a centered 1120px content frame bounded by dashed rails on desktop (Vessa).
- Inside the frame there is a 12-column grid with 24px gutters. The hero text sits in columns 1 to 7 and the "Now" spec card in columns 9 to 12.
- Sections are separated by a full-frame dashed rule, with 96px of padding above and below on desktop and 64px on mobile. The spacing scale is 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
- Section header pattern: the head (30px) on the left, with a one-sentence candid aside in `--ink-3` beside it on the right.
- Density: generous in the hero, dense in the experience rows and stack list (Impact Experience).
- Mobile: a single column, rails at 8px, frame padding 20px.

### Imagery
- No photos. The visuals are the site's own UI.
- The Rule of Thumb cards reuse the existing hand-built thumbnails (SVG/CSS) on a `--paper-2` well with corner crop marks instead of a full border, after the technical-annotation-overlay move.
- The hero's right column is a **"Now" spec card**, an HTML readout like an inspector panel: Role, Company, Based in, Local time (a live clock in Asia/Jakarta, after the live-data-as-proof-and-ornament move), Stack, and Open to.
- Project rows are text-first, with a tiny mono domain chip.

### Motion
Budget: one hero intro, two scroll moments, control feedback, and one signature.

| moment | trigger | properties | curve / duration | reduced motion | source |
| --- | --- | --- | --- | --- | --- |
| Hero blueprint intro | page load, once | dashed outline boxes over each hero block fade in (opacity 220ms ease, 0ms), then the content rises and resolves (`opacity 0→1`, `translateY 8px→0`, `filter blur(6px)→0`) while the boxes fade out | content 500ms `cubic-bezier(0.22,0.75,0.2,1)`, 40ms stagger by block, starting at 180ms; boxes fade out over 300ms ease once each block lands | the boxes are not shown; content fades over 200ms, nothing travels | bencho:blueprint-loader, anatomy:anatomy |
| Section reveal | IntersectionObserver at -10%, once | section heads and first rows: opacity + translateY 12px | 500ms `cubic-bezier(0.19,1,0.22,1)`, 60ms stagger, at most 3 items | fade only | MOTION.md triggered reveal |
| Rule of Thumb card hover | hover (fine pointer) / focus-visible | four corner marks slide 4px outward and turn accent; the thumbnail inner scales 1.02 | 200ms `cubic-bezier(0.23,1,0.32,1)` | color change only | technical-annotation-overlay |
| Control press | `:active` on buttons | scale 0.97 | 150ms `cubic-bezier(0.25,0.46,0.45,0.94)` | none | MOTION.md presses |
| Link and nav hover | hover | color, underline color | 120ms ease | same | anatomy:anatomy (sped up from 300ms to fit the hover window) |
| Copy-email confirmation | click | the label swaps to "Copied" with an 8px rise and a blur crossfade | 200ms ease-out | crossfade only | MOTION.md crossfade |
| **Signature: Inspect mode** | pointer movement over the hero (always on there), or site-wide when switched on with the nav toggle or the `I` key | crosshair lines and rim chips follow the pointer 1:1 with no easing; the hover outline, `W × H` chip, and red spacing lines fade in | opacity 140ms ease; position untransitioned | crosshair stays (it is user-driven); no transitions | 21st:ham7a311.caliper |

**What stays still:** the background (the old animated skewed grid with drifting boxes is removed), the nav, every heading after its first reveal, the experience list (no hover images), and the footer. No idle loops anywhere.

Rejected: a hero letter-by-letter reveal (fails Purpose, since the blueprint intro already says "built to spec"); a hover gradient on experience rows (fails Function, decoration on the densest reading area); a carousel for Rule of Thumb (fails Function, because it hides 3 of 4 cards behind arrows); page transition floods (fails Frequency, since article hopping is frequent).

### Shader
None. The signature is a DOM measurement layer, and a shader ground would compete with it. It would also break "exact" by moving things the visitor didn't ask to move.

### Moves
- `technical-annotation-overlay`: corner crop marks on card wells and the hero spec card, plus hairline callouts. It fits because the person is a design engineer who writes about pixel-level details.
- `cursor-driven-reveal`: in its caliper form, the pointer reveals the page's real measurements.
- `live-data-as-proof-and-ornament`: a live Yogyakarta clock in the Now card. It answers "what timezone is this person in" for remote hiring.
- `hairline-grid-structure`: dashed rails and section rules as the page frame (Vessa).
- `single-accent`: ultramarine on the email action and the inspector.
- `blur-to-sharp-resolve`: the hero intro (Anatomy).

### Signature
**The site measures itself.** Move the pointer over the hero and it turns into a caliper: crosshairs, live coordinates on the rails, and every element you point at reports its real rendered size and its padding to its parent, read from the DOM. A ruler toggle in the nav (or the `I` key) extends Inspect mode to every page, so you can point at the Button Design demos and read their exact paddings. None of the anchors ties the measuring tool to an author's own claims about craft. Here it is the proof: "this person says they sweat 4px, so go measure it."

## Sameness check (planned)
House-style traits avoided: warm paper (we use cool grey `#eef0f3`), an orange accent (we use ultramarine), a light serif display (we use a grotesk at 600), numbered sections (none), and a dark closing band with a giant wordmark (the close is light, a single row). Traits kept: dashed ruled frames (1) and mono text (2, used only for readouts and the meta row, never as uppercase eyebrows). Two shared, which is the limit.
