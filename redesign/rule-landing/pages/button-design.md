# Button Design on the rule-landing kit

## Brief

- **Who arrives.** A front-end engineer or designer who got the link from a colleague, and a hiring manager from the home page. Both have built a hundred buttons and think they know this one.
- **The one action.** Press the two buttons in each lesson and feel the difference, then take the Markdown.
- **Feel.** *Tactile, exact, quiet.* Tactile pulls toward springy keys you want to press. Exact pulls toward measured numbers (px, requests, contrast). Quiet keeps the demo buttons from shouting over the page's own Share and Copy keys.

## Plan

Each pane is a sunken well holding a small stage of real buttons. The left side is the way it usually ships, the right side is the rule. Both share one markup per lesson so the difference is only the rule.

1. **Give every state a look.** Hover, press and focus.
   - Bad: a hue button with no hover, no press and `outline: none`. Under it a state strip of four frozen copies (idle, hover, press, focus) that all look the same.
   - Good: the same button with a lighter hover, a 2px press and a 3px focus ring, all in 150ms. Its strip shows four different looks.
   - Costs: "1 look for 4 states", "0px focus ring" against "4 looks", "3px focus ring".
2. **Hold the width while it works.** Pending, double clicks, text updates and success.
   - Bad: Save swaps to a spinner and "Saving…" in the flow. The width jumps, and the button keeps taking clicks; a request counter climbs.
   - Good: all three labels stack in one grid cell, so the width never moves. The button turns `aria-disabled` with `cursor: wait`, says Saving…, then Saved, then resets.
   - A live ruler under each button prints its width in px.
3. **Say why it's off.** Disabled.
   - Bad: Publish at 35% opacity with the hand cursor. Hovering says nothing.
   - Good: Publish stays readable, shows `not-allowed`, and a tooltip says "Add a title first" on hover and focus. Typing a title enables both.
4. **One filled button per screen.** Variant hierarchy and red for primary.
   - Bad: three filled buttons, with Publish in red.
   - Good: Publish filled in the brand hue, Save draft tinted, Cancel text-only.
   - A "Squint" toggle blurs both stages so the weights show without reading.
5. **Guard the destructive action.** Destructive tiers.
   - Bad: a filled red Delete project that deletes on one click.
   - Good: a tinted red trigger opens a confirm that names the project and its 214 files. Cancel takes focus first.
6. **Pad the icon side less.** Leading, trailing and icon-only.
   - Bad: 16px on both sides, icons on the text baseline, and a wide icon-only button with no tooltip.
   - Good: 12px on the icon side, icons centred, and a square icon-only button with `aria-label` and a tooltip.
   - A "Show padding" toggle stripes the padding boxes.

## Quiz

Board noun: "layout". Five levels.

1. **The one next step.** Piece "Checkout" into a cart footer. Slots: tinted like Edit cart, filled red, filled brand (answer).
2. **Remove a teammate.** Piece "Remove access" into a member row. Slots: filled red, grey text with no confirm, tinted red then a confirm (answer).
3. **While it saves.** Piece "disabled · Saving…" onto a timeline of a 1.2s save with a second click at 300ms. Slots: at the click (answer), at 400ms, after the response.
4. **Less padding.** Piece "12px on the icon side" into a toolbar. Slots: Continue → (trailing), ＋ New project (answer), ⚙ icon-only.
5. **Can't be pressed.** Piece "cursor: not-allowed" into Publish's states. Slots: idle, saving, disabled (answer).

## Signature

The careful Save button walks through its states once when its lesson comes on screen: it presses itself, its label rolls up from Save to Saving… to Saved and back, and the ruler under it never moves. The careless one beside it runs the same walk while its ruler jumps. Labels roll on `translate` and `opacity`, 220ms on the kit's OUT curve.

Under reduced motion the walk does not autoplay, labels swap by opacity only, and the spinner holds still.

## Critique

### Round 1

Held each shot next to `shots/kit/after-*.png` at 1440 and 390, light and dark.

- **Squint.** Every pane reads as one hue button on a sunken well, so the bad and good sides only part once you look at the chips. That is right for a rule about detail, and the Squint toggle in lesson 4 gives the one lesson where weight is the point a way to show it blurred.
- **Type.** Pane copy is kit type throughout. The tiny `idle / hover / press / focus` captions sit in the mono face at the chip size, so they read as labels, not prose.
- **Colour.** The careful lesson 4 put Save draft in a tint. Measured it: 6.5:1 light, 5.3:1 dark. The tinted red Delete project is 7.2:1 light, 4.5:1 dark. All pass AA.
- **Space.** Three gaps found.
  - The confirm row in lesson 5 wrapped to the left edge of the card. It now sits right with `margin-left: auto`.
  - The bad icons in lesson 6 sat top-aligned under `align-items: baseline`, because global CSS makes svg a block. They are now inline on a 38px line box, which puts the icon 4px above centre. The chip was corrected from "3px" to that measured number.
  - At 390 the tabs moved the page. Lessons 3 and 6 grew 28px when you switched sides, because one side's chips wrapped to a second row and the other's did not.
- **Motion.** Two gaps found.
  - Under reduced motion, the press transform still applied because the override lost on specificity. It now matches the same `:is(:active, [data-force])` selector.
  - The careful Save in its pending state turned grey from the `aria-disabled` rule meant for Publish. That rule is now scoped off `.bd-save`, so pending Save keeps its hue and shows `cursor: wait`.
- **Mobile.** The careful Publish explains itself on hover and focus, and a tap gives neither, so a phone reader never saw "Add a title first".
- **Numbers.** Every chip was checked against the page:
  - 83 → 136px, a 53px jump.
  - 3 requests against 1.
  - 1.6:1 against 6.4:1 contrast.
  - 52 × 38 against 38 × 38.
- **Generated tells.** 0 em dashes, 0 "elevate / seamless / unleash", 0 gradient text, 0 decorative icons. Every chip is a measured number or a named property, and "150ms" in lesson 1 matches the CSS.

### Round 2

- Lessons at 390, height per tab: 597/597, 625/625, 598/598, 651/651, 571/571, 651/651. The bad side of lesson 3 gained the true cost "hand cursor", so both sides wrap to two rows. "icon 4px high" became "icon 4px up", which fits on one row like the good side.
- Tapping the blocked Publish opens its tooltip for 1.6s. It sits at x 40 to 146 inside the 390 viewport, and the cursor stays `not-allowed`.
- Reduced motion: the press keeps `transform: none`, labels and confirm steps fade in 160ms, and the spinner holds still.
- Dock: h1 left 592.2 vs title 592.6 at 1440, and 74.5 vs 74.3 at 390. scrollWidth equals innerWidth at both. 0 console errors.
- No gaps left open.
