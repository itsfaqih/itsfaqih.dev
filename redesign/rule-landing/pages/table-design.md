# Table Design (pink, UX Design, hidden)

Copy source: `public/rule-of-thumb/table-design.md`. Reference caller: `-proximity-principle-page.tsx`.

## Brief

- **Who arrives.** A front-end engineer who has shipped a dozen admin tables, sent the link after a review comment like "the numbers don't line up" or "what does this look like empty?". They know `<table>`; they have not watched their own table change under them.
- **The one action.** Work the two tables in each lesson until the difference is felt, then take the rule as Markdown.
- **Feel.** *Exact, live, calm.* Exact: real formatted figures, real row counts, real URLs. Live: every pane is a working table you can search, delete from and page through. Calm pulls against live, because a table is a reading surface, so only the one signature moment moves on its own.

## Plan

Each pane holds a small app card (panel surface, hairline ring) with a real `<table>` inside the sunken well. The left side is how tables usually ship, the right side is the rule. Both panes of a lesson run the same data.

1. **Line numbers up on the right.** Numbers.
   - ✕ *Left, as typed.* MRR left-aligned in proportional figures, raw `12500`, `8750.5`. A live column changes every 1.6s and its right edge jitters.
   - ✓ *Right, tabular.* Right-aligned, `tabular-nums`, `toLocaleString` to `12,500.00`. The changed digits roll in place; the edge never moves.
   - A Pause control sits in the lesson copy (live content gets a pause).
2. **Give every state a next step.** Loading, empty, error, no results.
   - One switch in the lesson copy drives both tables: Loading, Empty, Error, No results, Data. Both have a real search box that filters.
   - ✕ *Left blank.* A spinner in a collapsed body while loading, then the same grey "No data" for empty, error and no results.
   - ✓ *Says what's next.* Skeleton rows at the real row height; "No users yet" with Add user; "Couldn't load users" with Retry (which reloads); `No results for "zed"` with Clear search. The body holds one height in every state.
3. **Actions in a fixed last column.** Displaying actions.
   - ✕ *Hover only.* Text Edit and Delete appear only on hover, right after each name, so they land at a different x on every row.
   - ✓ *Last column.* Icon buttons in a right-aligned 76px column, always visible, each with a tooltip. Delete works on both; Restore brings the rows back.
4. **No pager for one page.** Hide when ≤1 page and when empty.
   - A filter switch in the lesson copy: All (9), Admins (3), Owners (0), 4 rows per page.
   - ✕ *Always there.* "Page 1 of 1" with dead arrows, "Page 1 of 0" under nothing.
   - ✓ *Past page 1.* The pager shows for 3 pages and disappears otherwise.
5. **Keep the page in the URL.** URL query params.
   - Each pane has a small address bar and a Reload button above a 3-page table.
   - ✕ *In state.* The address stays `/users`; Reload lands on page 1.
   - ✓ *In the URL.* The address reads `/users?page=2`; Reload keeps it.

## Quiz

Board noun: "table". Five levels.

1. **Where the actions go.** Piece "Edit · Delete" into a `<tr>`. Slots: a first cell, inside the Name cell, the last cell (answer).
2. **Format at the edge.** Piece "toLocaleString()" into a revenue table's code. Slots: in `getRevenue()` on the server, as the sort key, in the cell (answer).
3. **Nothing to show.** Piece "Add user" into the table's states. Slots: under the error, under the empty state (answer), under no results.
4. **One page or two.** Piece "<Pagination>" with 25 rows per page. Slots: 25 admins, 31 users (answer), 0 owners.
5. **Page 3, shared.** Piece "page 3". Slots: `useState()`, `/orders?page=` (answer), `localStorage`.

## Signature

The live MRR column. Once lesson 1 is on screen a value changes every 1.6s. On the right each changed digit rolls to its new value on its own reel (translateY, 320ms on the kit's OUT curve) while the column's right edge and every decimal stay put; on the left the same change makes the edge jump. The changed cell's row tints for a moment on both sides.

Under reduced motion the ticker starts paused on a still frame; Play still works, and digits then swap with no roll.

## Critique

### Round 1

Shots: `redesign/rule-landing/shots/table-design/`, held next to `shots/kit/after-*.png`.

- **Squint.** Each lesson reads as copy, one control row, then two cards with red and green chips. Pink shows only on the pressed segment, the current page and the one primary button, so the eye lands on the state you picked. Structure matches Proximity. Pass.
- **Type.** Tables are Geist 14px with 12px headers on a panel-2 tint, chips in mono. One fault: the bad L1 chip said "ragged edge" with no number, and L3 said "Edit at 4 x-positions". Measured, the left edges sit at 3 distinct x (265, 293, 317px).
- **Colour.** Red and green stay inside chips and captions. The address query uses `--c-ink`. Dark mode holds (checked every dark shot). Pass.
- **Space.** At 1440 the L4 careful card stretched about 30px below its last row to match the bad pane, so it read as a broken table. The careful L2 blank body measured 163px against 160px for four rows, so "height holds" was false by 3px.
- **Motion.** One signature (digit reels, 320ms on `--out`). Everything else is opacity: the row flash, the skeleton pulse, the reload fade. The spinner only lives on the bad side. Pass.
- **Mobile (390).** The L3 tab pair "On hover, after the name" and "Last column, fixed" ran out of the pane. The kit hides the caption under 820px, which drops `.costs` into the `1fr` row, so L4's single "0 dead controls" chip stretched to 70px tall. The actions column shrank to 72px while the chip said 76px.
- **Generated tells: 5.** Two "X, not Y" contrasts back to back in the learn intro, a colon-led sentence in the same intro, and three semicolon splices (L1 body, two quiz notes).

### Round 2

- Chips now carry measured numbers. L1 bad reads "edges 25px apart" (sampled over 12 ticks, the spread runs 12.9 to 24.9px). L3 bad reads "Edit at 3 x-positions".
- `.td-said` min-height is `calc(var(--row) * 4)`. Careful L2 body measures 160px in Loading, Empty, Error, No results and Data. The bad body measures 56px blank and 160px with data, so its card jumps 104px.
- Cards take `align-self: start` and chips `align-self: end` (scoped to this page). L4 chips now sit level at the same y in both panes and measure 22px tall at 390.
- Labels shortened to "Hover only" / "Last column" and "Always there" / "Past page 1". At 390 the L4 tabs end at 326px inside a 352px pane.
- The 72px mobile override is gone, so the chip's 76px is true at every width.
- Generated tells: 1 left, the title "Tables get scanned, not read", kept on purpose as the one contrast the page argues.
