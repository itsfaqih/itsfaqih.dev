# Run log: rebuild every rule page on the Proximity reference

Started 2026-10-28 while the user is away. Request: "continue rebuilding all other rule of thumb pages, use the Proximity Principle as the main reference".

## Exit condition

Every rule route other than Proximity renders the Proximity page structure:

- A hero with the tilted cover.
- The island activity and title dock.
- Lessons that compare the wrong way and the right way side by side, with tabs only on mobile.
- A TL;DR.
- A drag-and-drop mini quiz.
- The Markdown take-away and the pagination.

The routes are button-design, data-loading, null-vs-undefined, typescript-code-writing, table-design, dialog-design and handling-timestamps.

Each route must pass all of the following:
- typecheck and lint are clean.
- The page renders at 1440 and 390, in light and dark, with no horizontal overflow and no console errors.
- The title docks onto the island slot.
- At least one quiz level can be cleared by tapping.
- Proximity is visually unchanged after the shared kit is extracted.

## Decisions

| # | Decision | Why |
|---|---|---|
| 1 | Extract one shared kit, `src/routes/rule-of-thumb/-components/rule-landing.tsx` with `rule-landing.css`, from the Proximity page. Each page then supplies data (lessons, TL;DR, quiz levels) plus its own lesson visuals. | Copying 2,400 lines into seven pages would leave eight forks of the dock, quiz and reveal logic. The kit sits at the lowest common ancestor of its eight callers. |
| 2 | The kit's lesson pane renders any `view` node. The row glide between tabs (FLIP on `[data-k]`) stays generic. | Code topics reuse the file tree. UX topics render real UI in the panes. |
| 3 | The quiz keeps one mechanic: drag a piece onto a slot among the context rows. Rows take any node, and wrong slots say what they cost. | The user asked for a drag-and-drop game. One engine keeps it consistent across pages. |
| 4 | No commits and no worktrees. Workers share the main checkout and write only their own page files. The kit is frozen while the pages are built. | The reference is uncommitted, so a worktree would start without it. The user asked for no commits. Using disjoint files avoids shared writes. |
| 5 | The visible pages come first (button-design, data-loading, null-vs-undefined), then the hidden ones. Batches stay at 4 workers or fewer. | Visible pages matter most. The machine has 10 cores, and each worker runs a dev server and a headless browser. |

## Iterations

| Step | Change | Predicate moved? |
|---|---|---|
| 1 | Extracted the kit (`rule-landing.tsx` and `.css`) from Proximity. Proximity is now data plus `<RuleLanding>`. | Proximity matches its pre-extraction shots. The other seven are still on the old pages. |
| 2 | Batch 1: button-design, data-loading and null-vs-undefined, one poteto-agent each, with their own dev servers and browser sessions. | 3 of 7 pages are rebuilt. Each worker verified its own dock, overflow, console and quiz. |
| 3 | Kit fixes from batch 1: slot `lead`, scoped lesson copy, no-wrap tabs, a shared grid cell for the panes on mobile, and "No." hidden for unnumbered rules. | The leads are visible once the piece is seated, and tab switches no longer jump. |
| 4 | Batch 2: typescript-code-writing, table-design, dialog-design and handling-timestamps. | 7 of 7 pages are rebuilt. |
| 5 | Integration fixes: cost chips no longer stretch at 390 (`1fr auto` rows), and the island label is capped at `100vw - 206px` with an ellipsis. | Long titles dock at 390 inside a 366px island. |
| 6 | Pruned the dead shared helpers in `-components/index.tsx` and `button-variant-matrix.tsx` (archived to `archive/v10-rot-components-index.tsx.txt`). 81 old files deleted with `git rm`. | Typecheck and lint stay clean. |
| 7 | Final check, `shots/all/`. A fresh browser per page, and an instant scroll so Lenis does not undo it. | 16/16 light (1440, 390): docked, dx within ±0.5px, no overflow, 0 errors. 16/16 dark: docked, no overflow, 0 errors. Quiz level 1 clears by tap on 8/8 pages. Hidden rules show no "No.". |
| 8 | The gallery review found the highlight block covering the first title line's descenders (y, p, g) on every page, Proximity included. Line 1 now stacks above the highlight. | Descenders show on top of the block. Dock and overflow rechecked on 4 pages at both widths, all passing. |

## Exit condition: met

- typecheck exits clean, and lint shows only the existing `redesign/trailer.js` warnings.
- Every route renders in light and dark at 1440 and 390 with `scrollWidth === innerWidth` and no console errors.
- The h1 docks onto `.act-label .title` within 0.5px. The widest island at 390 is 366px.
- Level 1 clears by tap on every route. Wrong slots register a miss first.

## Iteration 9: phones and tablets

Viewports: 360x780, 390x844, 430x932, 768x1024, 820x1180, 1024x1366, 1180x820. Audit: `rt/audit.js` (off-screen, spill past pane, clip, tiny text, tap targets), a fresh browser per page.

Root causes found:
- Grids with an implicit `auto` track grow to their widest child's min-content, so a long line pushed the whole column past its pane. Pinned to `minmax(0, 1fr)` on `.hero-copy`, `.pane`, `.board`, and null-vs-undefined's `.nv-view` and `.nv-flow`.
- The hero title grew with the viewport but a word can't wrap, so "Timestamps" ran under the cover (34px at 1024, 171px at 1440). `useTitleFit` caps the size as `--fit` where the longest word fits.
- Nowrap tabs, chips, and slot leads. Tabs and pieces wrap at 640 and below; rows with a lead wrap.

Per page: button-design card row and specimens, table-design state picker as a 3-column grid, handling-timestamps readers stacked and strings kept whole, dialog-design Help hit area.

Result: off and spill empty at every viewport. Remaining flags are by design: `.node` rail sits in the gutter left of each level (hidden below 860), `.wf-plot` is a clipped curtain, the table search input sits in a 34px label. Hero overlap 0 at 1024, 1180, 1280, 1440. Dock check 16/16 at 1440 and 390, 0 console errors. Proximity title unchanged at 1440 (100.8px, no `--fit`).
