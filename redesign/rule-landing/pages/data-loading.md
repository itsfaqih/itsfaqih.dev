# Data Loading (amber, Architecture)

Copy source: `public/rule-of-thumb/data-loading.md`. Reference caller: `-proximity-principle-page.tsx`.

## Brief

- **Who arrives.** A front-end engineer who builds screens that wait on the network, sent the link by a colleague after a review comment like "this flashes a spinner". They know `fetch`; they have not watched their own loading states frame by frame.
- **The one action.** See the wrong loading behaviour and the right one run side by side, press the buttons until the difference is felt, then take the rule as Markdown.
- **Feel.** *Patient, exact, live.* Patient: the page itself never makes you wait or blink. Exact: real milliseconds, real error messages, real requests on a timeline. Live: the panes are working UI, not pictures of UI, and that pulls against patient, because live things move.

## Plan

Every lesson pane is working UI on the site's tokens. The two panes of a lesson run the same request, so pressing both shows the difference as it happens.

1. **Start fetching early.** Signature lesson. Each pane is a request waterfall on a 0 to 1000ms axis.
   - ✕ *In useEffect.* `app.js` 0 to 300, render `<Orders>` 300 to 330, `GET /orders` 330 to 820, data on screen at 840. Costs: `data at 840ms`, `1 waterfall`.
   - ✓ *In the loader.* `app.js` 0 to 300 and `GET /orders` 0 to 500 in parallel, `<Orders>` renders 500 to 520, `GET /reviews` deferred and streamed until 880. Data on screen at 520. Costs: `data at 520ms`, `0 waterfalls`.
2. **Keep stale data on screen.** A revenue card with a Refetch button.
   - ✕ *Blank.* The figure is swapped for a centred spinner for 900ms. Costs: `blank 900ms`.
   - ✓ *Stale, then fresh.* The figure stays, a small spinner and "Updating" sit in the corner, the new figure crossfades in with "Updated just now". Costs: `0ms blank`, `1 quiet update`.
3. **Wait before the skeleton.** An inbox list. "Server replies in" 80ms or 1.2s, plus a readout of how long the skeleton showed.
   - ✕ *At once.* An 80ms reply blinks the skeleton for 80ms. Costs: `flashes 80ms`.
   - ✓ *After 200ms.* An 80ms reply swaps straight in; a 1.2s reply gets the skeleton at 200ms. Costs: `0 flashes`.
4. **Errors where the data was.** A team card and a "Fail a request" control.
   - ✕ *A toast.* The list empties and a toast "Something went wrong" fades after 3s. No retry. Costs: `0 retries`, `gone in 3s`.
   - ✓ *Inline, with Retry.* The error takes the list's place with Retry, which works, and a "Logged" line. Costs: `1 tap to recover`, `logged`.
5. **Parse at the boundary.** The API leaves out `city`. A Fetch button runs real code on the response.
   - ✕ *Trust it.* `JSON.parse` assigned straight to the type, then `user.city.toUpperCase()` throws; the pane shows the real TypeError where the card should be. Costs: `1 crash`, `blank card`.
   - ✓ *Parse it.* The pane's code reads as a zod schema with `city: z.string().catch("Unknown")`; the demo runs a typed parser with the same fallback, and the card renders "Unknown". Costs: `0 crashes`, `1 fallback`.
   - Extra: keep schemas in sync, show a plain message when a parse fails.
6. **Persist what can't mislead.** A wallet opened offline on day 3, with "Get signal" and "Reopen offline" buttons.
   - ✕ *Persist all.* The cached $2,140 balance shows with no date, then jumps to $310. Costs: `$1,830 off`, `no date`.
   - ✓ *History only.* The balance says "Needs a connection"; the transaction history shows from cache with "Updated 2 days ago". Costs: `balance always live`, `history dated`.
   - Extra: the storage chips `localStorage ~5MB, sync`, `IndexedDB large, async`, `PGlite SQL + sync`.

TL;DR (7 rows): SSR vs SPA, the loader and deferring, stale data, the 200ms delay, inline errors, WebSocket vs polling, parsing.

## Quiz

Board noun: "timeline". Each level is a request timeline with millisecond stamps; the slots are moments or outcomes on it.

1. **A quick reply.** Piece `<Spinner />`. Slots: at once on click (flashes 80ms), at 200ms if still waiting (answer), at 1s if still waiting (1s of nothing on slow replies).
2. **Back to the tab.** Piece `cached prices`. Slots: make way for a spinner (blank 600ms), stay with a small spinner (answer), stay until the user reloads (never revalidates).
3. **Twenty orders.** Piece `fetch(orders)`. Slots: in the route loader (answer), in `useEffect` in `<Orders>` (+300ms), in each `<OrderRow>` (20 requests).
4. **One card fails.** Piece `error + Retry`. Slots: an error page (4 cards lost), inside the revenue card with Retry (answer), a toast (gone in 4s).
5. **Offline on day 3.** Piece `from cache`. Slots: the balance ($1,830 off), last week's transactions with their date (answer), the exchange rate (2 days stale).

## Signature

The waterfall fills in. When lesson 1 comes on screen, a playhead sweeps both timelines at once over 1.6s; a cover slides off the bars with it (transform only), and a "data on screen" marker lands at 840ms on the left and at 520ms on the right, so you watch the right pane finish first. A Replay key runs it again. Under reduced motion the cover is gone and both timelines show their finished frame.

## Critique

### Round 1

Shots: `redesign/rule-landing/shots/data-loading/{1440,390}-{light,dark}-{top,docked,les1..les6,tldr,quiz}.png`, held next to `shots/kit/after-*.png`.

- **Squint.** Reads as Proximity's sibling. Hero, cover, lesson cards, TL;DR and quiz sit in the same places at the same weights. The amber request bars and the red crash block are the only loud marks in the lessons, and they land on the point of each lesson.
- **Type.** Kit faces only. Mono is kept for machine text: the axis, the code, `3 unread`, the said readout and the timeline stamps. Gap: the inbox's idle readout said "Press a reply time.", which is not English anyone says.
- **Colour.** Amber is the topic and the good request colour; the bad request turns `--no` red so the late bar reads as the cost. Dark mode holds: the striped deferred bar, the chips and the stamp pill all keep contrast.
- **Space.** Five demo cards share one frame: card, dashed control rule, note left, action right. Gap: the inbox broke that frame with two buttons pushed to opposite edges and no note, leaving a hole in the middle at 1440.
- **Motion.** The sweep runs once per view at 1.6s linear, the markers pop in 260ms on the kit's snap curve, entrances are 4px plus opacity, nothing starts from scale(0). Reduced motion verified: the cover is `display: none`, the markers sit at opacity 1 with no animation, the skeleton pulses on opacity only.
- **Mobile.** At 390 the flip labels fit on one line after the shortening pass, the marker drops "on screen" and keeps "840ms", scrollWidth is 390, and every lesson's bad tab shows its own finished state.
- **Generated tells.** 1. Four demo cards (revenue, inbox, team, wallet) use the same "title left, mono meta right" head. It is the same kind of card, so it stays.

Fixes: the inbox controls now read "Server replies in" with `80ms` and `1.2s` grouped on the right, and the idle readout says "Pick how fast the server replies."

### Round 2

Re-shot lesson 3 at 1440 and 390, light and dark; typecheck and lint clean. The inbox controls sit on one line at 390 and match the other panes. Nits only: the parse pane's code shows zod while the running parser is a typed function, because zod is not a direct dependency; and the `<Orders>` render bar is a 30ms sliver that reads as a dot at 390.
