# Handling Timestamps (green, Best Practices)

Copy source: `public/rule-of-thumb/handling-timestamps.md` (short), plus the old page `src/routes/rule-of-thumb/handling-timestamps.tsx` and its three demos. Reference caller: `-proximity-principle-page.tsx`. Class `.rule-page.handling-timestamps`. The rule stays hidden in the index.

## Brief

- **Who arrives.** A full-stack engineer whose users span time zones, sent the link after a bug like "the order shows 7 hours late for our Jakarta users". They know `new Date()`. They have no rule for where a time turns local.
- **The one action.** Leave with the flow: store UTC, return it with a Z, turn it local only in the viewer's browser, and convert what the user types back to UTC. Copy the Markdown, or clear the quiz.
- **Feel.** *Exact, calm, two-sided.* Exact pulls toward real strings and real `Intl` output. Calm keeps each pane to one value and two readers. Two-sided pulls against calm: every pane shows the same moment twice, for Rina in Jakarta (UTC+7) and Sam in New York (UTC−5), so the error is visible as a gap between two clocks.

## Plan

One moment runs through the page: `2026-01-10T06:00:00.000Z`, the md's own example. Every time on the page is computed with `Intl.DateTimeFormat` and a fixed `timeZone`, so the server and the browser render the same thing. The wrong side is computed by doing the wrong thing (reading digits with no zone as the reader's own clock, formatting in the server's zone), not drawn.

The readers' pair: two cards, each a small clock face, the person and city, the time and the date. A wrong card's hour hand is red, with a faint green hand where it should point, and a "should be 1:00 PM" line under the time. The error size lives in the pane's cost chips, so the cards don't repeat it.

1. **Store the moment in UTC.** Rina and Sam order in the same second.
   - ✕ *Local, no offset.* An `orders` table whose `created_at` holds the writer's wall clock: Sam `2026-01-10 01:00:00`, Rina `2026-01-10 13:00:00`, sorted 12 h apart. Costs: "1 moment, 2 values", "12 h apart".
   - ✓ *UTC.* Both rows `2026-01-10 06:00:00`. Costs: "1 moment, 1 value", "0 s apart".
   - Tip: why UTC (no daylight saving, no political changes), from the old page.
2. **Return it with a Z.** `GET /orders/41`.
   - ✕ *No Z.* `"2026-01-10T06:00:00"`. Each browser reads it as its own clock: both see 6:00 AM. Costs: "Rina 7 h early", "Sam 5 h late".
   - ✓ *Ends in Z.* `"2026-01-10T06:00:00.000Z"`. Rina 1:00 PM, Sam 1:00 AM. Costs: "0 h off".
3. **Turn it local in the browser.**
   - ✕ *Server time.* The API runs in New York and calls `toLocaleString()`. Both get "1:00 AM". Right for Sam, 12 h early for Rina. Costs: "right for 1 of 2", "Rina 12 h off".
   - ✓ *Viewer's time.* The API sends the Z string; each browser formats it with `Intl.DateTimeFormat`. Costs: "right for 2 of 2".
4. **Send the zone with the input.** Live: Rina's reminder form, a real date and time input (Jakarta), the request body, then both readers.
   - ✕ *No zone.* `"at": "2026-01-01T07:00:00"`; the server reads it as UTC. Rina sees 2:00 PM, Sam sees Jan 1 2:00 AM. Costs: "7 h late".
   - ✓ *UTC or offset.* `"2026-01-01T00:00:00.000Z"`, or `"2026-01-01T07:00:00+07:00"`: one moment. Rina 7:00 AM, Sam Dec 31 7:00 PM. Costs: "0 h off".
5. **Filter by the user's day.** Live: "Rina's orders on" a real date input, the query range, five orders listed in Jakarta time with their UTC day and time under each.
   - ✕ *UTC midnight.* `from=2026-01-10T00:00:00`, read as UTC: 07:00 to 07:00 Jakarta. Two early orders missing, one from Jan 11 slips in. Costs: "2 missed", "1 from the next day".
   - ✓ *Her midnight.* `from=2026-01-09T17:00:00.000Z` to `2026-01-10T17:00:00.000Z`. Costs: "3 of 3", "0 extra".

TL;DR (6 rows): saving, returning, showing, sending input, filtering, date math (the old page's "no string manipulation for date math").

## Quiz

Board noun "flow". Every board is the path of one timestamp: browser, API, database, back to a browser.

1. **Two readers.** Piece `Intl.DateTimeFormat`. Slots: the SQL query (one zone for everyone), the API in New York before `res.json` (Rina 12 h off), each reader's browser at render (answer).
2. **7:00 in Jakarta.** Piece "→ UTC". Slots: Rina's browser before the request (answer), the API when the request arrives (read as UTC, 7 h late), the insert as Asia/Jakarta (right for Jakarta only).
3. **One offset.** Piece `+07:00`. Slots: the request body (answer), the stored column (offsets mixed in one column), the reply to Sam (Sam does the sum).
4. **Whose Jan 10?** Piece `from=2026-01-09T17:00Z`. Slots: Rina in Jakarta (answer), Sam in New York (12 h of Jan 9), the UTC report (7 h of Jan 9).

## Signature

**The hands swing home.** In lessons 2 to 4 each reader's clock starts at the UTC reading of the moment, and when the lesson comes on screen the hour hands swing to what that screen shows: Rina's clockwise by 7 hours, Sam's back by 5, 720ms on `OUT`, 120ms apart. Where the screen is wrong the red hand swings past (or never leaves) the faint green hand that marks the true time, so the error is an angle you watch open. Editing the reminder time swings the hands again in 280ms. Below 820px the swing replays whenever a tab shows its pane. Under reduced motion the hands sit at their final angles and nothing swings.

## Critique

### Round 1 (after the first full capture, `shots/handling-timestamps/r1/`)

- **Squint.** Each lesson reads as two cards: a code line on top and a pair of clocks under it. The red hour hand and red time on the wrong side are what you see first, and they should be. The hero is the kit's: the title chip, then the claim, then the cover.
- **Type.** Mono covers every value a machine sees (strings, query ranges, times), and display type covers the people and the labels. The 20px mono time is the loudest thing in a card, which is right, because the time is the thing that's wrong.
- **Colour.** Green is the topic hue and also `--yes`, so the good side reads as both "right" and "this rule". Red is used only for the bad values. The ghost hand is the one place both colours meet, and it stays at 0.5 opacity.
- **Space.** Desktop panes balance. At 390 the reader cards stack one per row (two at 150px don't fit the pane), so lessons 2 to 4 run long but keep one column.
- **Motion.** The swing reads as "the clock moves to where this screen puts it": 720ms on OUT, 120ms apart. It's held at frame 0 below the fold and plays 240ms after the pair is 60% in view, so you see it start.
- **Mobile.** Lesson 5's tab labels ("Midnight, no zone" / "Her day in UTC") overflowed the 390 toggle.
- **Generated tells (2).** (1) Each wrong card had a verdict chip ("7 h early") that repeated the pane's cost chips word for word. (2) The lesson 5 labels overflowed.
- **Fixes.** I replaced the verdict chips with a "should be 1:00 PM" line, which tells you something the chips don't. I renamed lesson 5's sides "UTC midnight" / "Her midnight". After the fix every lesson's tabs fit at 390, with 4 to 111px to spare.

### Round 2 (`shots/handling-timestamps/r2/`)

- **Squint.** Unchanged and holding. With the verdict chips gone, a wrong card has one red value, the time, and the green "should be" line under it.
- **Type and colour.** No change needed. Dark mode keeps the inputs readable (`color-scheme` follows the theme).
- **Space.** At 390, on a tab whose pane is shorter than its pair, the cost chip stretched into a tall block. That happens because the kit hides the caption there, which drops the costs into the stretching grid track. I pinned the chips to the pane's foot in this page's CSS (`align-content: end`), so every chip is 22px and sits at the same height on both tabs. The real fix belongs in the kit (see the report).
- **Copy.** Lesson 5 showed only the UTC time under each order, so "Jan 10, 2:15 AM" sat over "19:15 UTC" without saying that's Jan 9, and the day is the point of the lesson. Each order now shows "Jan 9, 19:15 UTC".
- **Motion.** I checked it live. Lesson 3 is paused at 0 until scrolled in, then runs and finishes. Setting lesson 4's time to 09:30 re-swings for 280ms and gives `02:30:00.000Z`, Rina 9:30 AM and Sam 9:30 PM Dec 31. With reduced motion emulated, no animations run and the hands sit at their final angles.
- **Known, not mine.** The hero shows "No." with no number because the rule is hidden. At 390 the docked title is 14px off (46 vs 60), and the island clips the Share icon, because `compactBox()` doesn't clamp to the room available.
- **Generated tells (0 new).**
