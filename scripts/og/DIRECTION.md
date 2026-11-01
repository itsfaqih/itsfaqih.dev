# Open Graph cards: direction

The build draws one 1200×630 card per page with Satori (see `card.tsx`). The card is the link preview people see in Slack, X, LinkedIn and iMessage before they visit, so it has to read at the size those apps show it, about 500px wide.

## Brief

**Who sees it.** An engineer scrolling a feed or a group chat where a colleague dropped a link to one rule. A hiring manager opening a link from a profile.

**The one action.** Open the link. The card earns the click by saying the rule's point before the visit, which the page's `<title>` alone cannot.

**Feel.** _Loud, exact, quiet._ Loud is the arcade's chunky Unbounded and topic hue, so the card stands out in a grey feed. Exact means each card names its own rule and its before→after, not a generic site banner. Quiet keeps it to one hue per card on the site's near-black ground.

## Anchors

1. **The site's v5 arcade system** (`src/arcade.css`, `DIRECTION.md` at the repo root). Taken: the palette itself (the card reads the dark `palette` tokens from `src/theme.stylex.ts` at build time, so it never copies a hex), Unbounded 900 headings at -0.04em, and the rule tile's coloured top edge.
2. **recent:i3io5ld-grokipedia-book-covers.** Thirty spines read as one shelf because frame, title position and mark never move; only the colour changes. Taken: every card shares one frame (top bar, mono eyebrow, title block, footer). Only the hue and the words change, so a feed of several rules reads as one series.
3. **shaders:section.film-festival.** A ~190px display line over 11px mono metadata, with nothing in between but one mid size. Taken: the jump from a 76 to 104px Unbounded title to 24px Geist Mono labels, metadata pinned to the top and bottom edges, and a band that bleeds off both sides (the home card's ticker).
4. **The home hero** (`src/routes/index.tsx`). Taken from `src/data/home.ts`, which the page and the card share: the first slide, "I build interfaces that feel right." with the highlight on its pink block, and the striped ticker with each word on its own topic hue. Also the green status dot before "Full-stack engineer · Yogyakarta".

## Direction

### Type

| Role                                | Font                                         | Size                                                     |
| ----------------------------------- | -------------------------------------------- | -------------------------------------------------------- |
| Title                               | Unbounded 900, tracking -0.04em, leading 1.0 | 104px up to 18 characters, 88px up to 30, 76px past that |
| Lede                                | Geist 400, `--dim`                           | 34px / 1.3, at most two lines in 960px                   |
| Eyebrow, footer labels, topic names | Geist Mono 500, uppercase, tracking +0.06em  | 24px                                                     |
| Chips                               | Unbounded 700, uppercase                     | 20px                                                     |

The title sizes step by about 1.18x, chosen so a two-word rule title fits two lines at 104px and a blog title of 60 characters fits three at 76px. A longer title stops at three lines with an ellipsis rather than running into the footer.

### Color

- Neutrals carry the card: `--bg`, `--hair`, `--text` and `--dim`, plus a dot colour of `#2a2a36`. The site's `--dot` is fainter, and it vanished at feed size (round 1).
- One hue per card (move `colour-maps-to-meaning`). A rule takes its topic hue. Home, the indexes and blog posts take the action yellow. The hue appears only on the 12px top bar, the eyebrow, the arrow and the "after" chip.
- Two cards show several hues, because there the set of topics is the subject. The Rule of Thumb card marks each topic with its dot, and the home card keeps the site's striped ticker.

### Layout

- 72px side padding, 52px top under the bar, 56px bottom.
- Eyebrow row on top, title and lede in the middle, footer row on the bottom (wordmark left, chips or domain right).
- The ground carries a dot grid like the site's, at a 28px pitch where the site uses 22px, so the dots stay distinct when the card shrinks.

### Imagery

No pictures. The title is the image. The only drawn shapes are the arrow between the before and after chips and the status dot, both SVG or boxes so they need no glyphs the subset fonts lack (the latin subset has no `→`).

### Motion

None. A link preview is a still image.

### Shader

None. Satori renders static SVG, and a still dot grid already matches the site's backdrop.

### Moves

- `colour-maps-to-meaning`: the hue is the topic, the same legend the index and tiles use.
- `mono-microlabel-layer`: Geist Mono carries every piece of metadata, Unbounded carries the statement.

### Signature

The rule card's footer shows the rule as a before→after: the "before" chip in dim outline, an arrow, the "after" chip filled in the topic hue (`SILENT → TACTILE`, `BLANK → INSTANT`). Each rule's cover tag already says what the rule changes, so the preview says it too, in a feed, before anyone visits.

## Critique, round 1

Rendered every card type (home, a short and a two-line rule title, an unpublished rule, the Rule of Thumb index, a blog post, and a 60-character post title) and viewed them at 600px wide, close to the 500px that feeds show.

- Squint: the eye lands on the title, then the eyebrow, then the before→after chips. Right order.
- Type: the 30px lede and 22px labels shrink to about 12px and 9px in a feed. Raised the lede to 34px and the labels to 24px.
- Color: one hue per card plus neutrals. The home card spent pink on the period too, while the hero sets it in text colour. Fixed.
- Space: the 60-character title wraps to three lines at 76px and the lede still clears the footer.
- The dot grid (`#24242f`) vanished at feed size. Raised to `#2a2a36`, still below the hairline.
- Generated tells: one mono eyebrow per card, which is the site's own `.tag` voice; no numbering on non-sequences (rule numbers are the shelf's real order).

## Critique, round 2

- Larger lede and labels read at feed size. Two-line titles ("Null vs Undefined", "Handling Timestamps") keep the lede two lines below them with room above the footer.
- Nit: the blog index repeated "Blog" as eyebrow and title. Its card takes the page's real heading, "Thoughts & Tutorials", under a "Blog" eyebrow.
- Nothing larger than a nit remains.

## Critique, round 3

A review of the code against the site found the home card had drifted from the page it previews.

- The home card said "interfaces that behave" over a yellow ticker with stars. The hero says "interfaces that feel right", and its ticker is a striped bar of topic hues. The card now reads both from `src/data/home.ts`.
- The Rule of Thumb lede was cut at "demos you…". The lede measure went from 880px to 960px, and the whole sentence fits in two lines.
- A 100-character title used to run into the footer. The title now stops at three lines.
- Nothing larger than a nit remains.
