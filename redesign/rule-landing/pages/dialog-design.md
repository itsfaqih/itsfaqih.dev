# Dialog Design (pink, UX Design, hidden)

Copy source: `public/rule-of-thumb/dialog-design.md`. Reference caller: `-proximity-principle-page.tsx`. Closest sibling: `-button-design-page.tsx`.

## Brief

- **Who arrives.** A front-end engineer who has shipped a modal and got a review comment like "focus escapes" or "Esc does nothing". They know `<dialog>` exists. They have not pressed Tab through their own modal.
- **The one action.** Open each pair of dialogs, press the keys, feel which one holds and which one leaks, then take the Markdown.
- **Feel.** _Contained, exact, playful._ Contained pulls toward small sealed windows that never touch the real page. Exact pulls toward counted things (Tab stops, characters lost, pixels scrolled). Playful pulls toward keys you want to press, which works against contained, because pressing things wants room.

## Plan

Every pane holds a small window (`.dd-screen`): a fake app page, a scrim and a dialog, all positioned inside the pane, so nothing covers the real page and nothing locks its scroll. Under each window sits a row of virtual keys (Tab, Esc, Enter, Scroll) that run the same code as the real keys, so it works on a phone. A focus ring (`[data-at]`) marks where focus is in the window. The left pane is the way it often ships, the right pane is the rule.

1. **Keep focus inside.** Focus trap, inert background, focus on open, focus back on close. A checkout page with an Edit profile dialog. Help sits in the top strip and Edit profile and Pay now in the bottom strip, clear of the dialog, so focus that slips behind stays in view.
   - Bad (`Focus wanders`): focus stays on the trigger when it opens. Tab walks Pay now, then the dialog, then Help and the trigger behind the scrim. A control focused behind is lifted above the scrim with a red dashed ring. Closing never moves focus. Costs: `starts behind`, `Tab leaves it`, `lost on close`.
   - Good (`Focus held`): focus lands in Name. Tab cycles Name, Cancel, Save. The page is `inert`. Closing puts focus back on Edit profile. Costs: `starts in Name`, `Tab stays in`, `back on close`.
2. **Let Escape close it.** Escape, and outside clicks for an info dialog. A What's new dialog.
   - Bad (`Esc ignored`): Esc and the scrim do nothing. Only × and Got it close it. A readout counts the ignored presses. Costs: `Esc ignored`, `2 ways out`.
   - Good (`Esc closes`): Esc, the scrim, × and Got it all close it. Costs: `Esc closes`, `4 ways out`.
3. **Focus the safe answer.** Smart auto-focus on a destructive confirm. "Delete Moonbase?"
   - Bad (`Delete first`): focus lands on Delete. The Enter key deletes the project and its 214 files. Costs: `Enter deletes`, `214 files`.
   - Good (`Cancel first`): focus lands on Cancel. Enter backs out. Costs: `Enter cancels`, `0 files lost`.
   - Extra: forms focus their first field; Delete takes focus only where speed beats safety and it can be undone.
4. **Ask before you drop a draft.** No data loss. A New issue form with a typed draft.
   - Bad (`Click drops it`): a click on the scrim closes it, and reopening shows an empty form. Costs: `1 stray click`, `48 chars gone`.
   - Good (`Asks first`): a click on the scrim shakes the dialog and keeps it. Esc or × asks "Discard this draft?" in a second dialog with Keep editing focused. Esc there goes back to the draft. Costs: `0 chars lost`, `asks first`.
5. **Lock the page behind.** Scroll lock. A long article with a Share dialog.
   - Bad (`Page scrolls`): the wheel or the Scroll key moves the article under the scrim. Readout: px moved since it opened. Costs: `page moves`, `place lost`.
   - Good (`Page locked`): the article gets `overflow: hidden`, and `scrollbar-gutter: stable` keeps it from shifting. Costs: `0px moved`, `0px shift`.
   - The wheel listener calls `preventDefault` over an open window on both sides, so the real page never scrolls under the pane either. Lenis already skips prevented wheels.
6. **Give it a name.** Screen readers. A Rename file dialog with a live "screen reader says" line computed from the DOM.
   - Bad (`A plain div`): a plain `div`. It says only "Name, edit text, report.pdf". Costs: `no role`, `no name`.
   - Good (`A named dialog`): `role="dialog"`, `aria-labelledby`, `aria-describedby`. It says "Rename file, dialog. Pick a name your team will find. Name, edit text, report.pdf". Costs: `role=dialog`, `named`, `described`.
   - The demos leave out `aria-modal`: inside a pane it would tell a screen reader that the real page is gone. The copy says to add it on a real page.

## Quiz

Board noun: "screen". Five levels.

1. **Delete forever.** Piece `autoFocus`. Slots: the page's Delete project button (focus stays behind), Cancel (answer), Delete.
2. **Add a contact.** Piece `autoFocus`. Slots: × close, Name (answer), Save.
3. **A click outside.** Piece `close()`. Slots: New issue with a typed title, What's new (answer), Edit profile untouched.
4. **It closed.** Piece `focus()`. Slots: `<body>`, Change password (the next control), Edit profile (answer).
5. **Hold the page.** Piece `overflow: hidden`. Slots: `<body>` (answer), the scrim, the dialog panel.

The mobile bottom sheet and the ARIA attributes sit in the TL;DR.

## Signature

**The Tab walk.** When lesson 1 is 60% on screen, both windows open their dialog and Tab presses itself seven times, 600ms apart. The focus ring lands on each stop with a 220ms pop, a ring that settles from `scale(1.12)` and opacity 0 on the kit's OUT curve (`--out`). On the left it goes Pay now, the dialog, Help, Edit profile and ends on Pay now, lifted above the scrim in a red dashed ring. On the right it goes round Name, Cancel, Save twice and ends on Cancel. Seven presses, not five, so the two windows end apart. Any press by the reader stops the walk. Under reduced motion the walk does not autoplay and the ring appears without the pop. Dialogs open with opacity only.

## Critique

### Round 1

Shots: `shots/dialog-design/r1-*`. Checks: dock lefts 602.20 vs 602.64 at 1440 and 84.45 vs 84.33 at 390. scrollWidth equals innerWidth at both sizes. No console errors.

- **The walk ended in a tie.** Five presses left both windows on Save, so the end state showed no difference. Fix: seven presses. The left now ends behind on Pay now, the right on Cancel.
- **Focus behind was invisible.** Pay now sat under the dialog, so the lifted red ring was covered. Fix: lesson 1's page moves Help to the top strip and the buttons to a bottom strip, and every window grows to 260px so the dialog clears them.
- **The scroll readout read 0px while the article moved.** It listened for scroll events, which a hidden tab never fires. Fix: the demo counts the distance where it moves the article.
- **Careless close lost track of focus.** Closing with focus behind reported `<body>` while the browser kept Pay now focused. Fix: the careless close leaves the ring where focus really is.
- **Three phone pills ran past their card.** At 390 the tab pills for lessons 2, 3 and 4 measured 355, 391 and 410 against a 352 edge. Fix: shorter labels (`Esc ignored`, `Delete first` / `Cancel first`, `Click drops it` / `Asks first`).
- **Readouts said "Open it".** Fix: they name the trigger (Open What's new, Open Delete project, Open Rename).
- **"2 Tabs behind" counted the wrong thing.** Fix: `Tab leaves it` against `Tab stays in`.
- **Lesson 6's Rename button stretched full width.** The card was a grid. Fix: it uses the project row layout.

### Round 2

Shots: `shots/dialog-design/r2-*`. Checks: dock lefts 602.30 vs 602.64 at 1440 and 84.45 vs 84.33 at 390. scrollWidth 1440 and 390. No console errors. Pills now end at 341, 310, 317, 316, 326 and 338 against 352.

- Every lesson works with real keys. L1: Tab stays in Name, Cancel, Save on the right, and Esc returns focus to Edit profile. On the left Tab reaches Pay now behind. L2: Esc and the scrim are refused and counted on the left and close it on the right. L3: Enter deletes Moonbase on the left and cancels on the right, also at 390. L4: the scrim drops 48 chars on the left. On the right it keeps the draft, Esc asks, and Esc again returns with 48 chars. L5: two wheels move the left article 200px and the right one 0px. The real page stays put on both. L6: the right side says "Rename file, dialog. Pick a name your team will find. Name, edit text, report.pdf". The left says only "Name, edit text, report.pdf".
- The quiz clears level 1 on Cancel, and a wrong slot on level 2 shows its note and costs.
- Reduced motion: no autoplay, no dialog transform, no ring pop, and the shake becomes a red outline flash.
- Left as is: lesson 6's readout wraps to three lines at 390 once open, which pushes the costs down by two lines. The cover shows `No.` with no number because the rule is hidden. That comes from the kit.
