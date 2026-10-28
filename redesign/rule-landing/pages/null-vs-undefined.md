# Null vs Undefined, on the rule-landing kit

Topic: Code Writing, cyan (`--cw`), the same hue as Proximity. Class `.rule-page.null-vs-undefined`.

## Brief

- **Who arrives.** A front-end engineer who has shipped a form or an API and been bitten once by a field that came back empty when nobody emptied it. They know both words. They don't have a rule for when to use which.
- **The one action.** Leave with the pattern: `undefined` for "no value given" (skip it), `null` for "emptied on purpose" (clear it). Copy the Markdown, or clear the quiz.
- **Feel.** *Exact, plain, alive.* Exact pulls toward real code and the real bytes it sends. Plain keeps every view to a few lines. Alive pulls against both: two of the panes actually send their request and you watch the record change.

## Plan

Every pane is code with its data beside it. Each line can carry an out chip on its right: what that line produces (a value, a compiler message, what the app does). Below about 460px of pane width the chip drops under its line. In the code, `null` wears a solid hue box and `undefined` a dashed empty slot, the same marks the thumbnail uses.

1. **Missing or empty.** Ana skipped the phone question. Bo said he has none.
   - Bad, "Both null". Both rows come back `"phone": null`, and `ask = (u) => u.phone === null` asks both. Bo is nagged. Costs: "1 user nagged".
   - Good, "Missing vs null". Ana's row has no phone key; Bo's is `null`. `=== undefined` asks Ana only. Costs: "0 nagged".
2. **Optional means undefined.** A parameter the caller may skip.
   - Bad, "string | null". `welcome()` fails with TS2554; every caller writes `welcome(null)`. Costs: "1 type error", "null at every call".
   - Good, "name?: string". `welcome()` gives "Hi, guest". Costs: "0 errors", "0 extra args".
3. **Clear with null.** Live: a Reviewer field with a chip you can clear.
   - Bad, "= undefined". `changes.reviewer = undefined`. The wire shows `{}` (JSON drops it), the record keeps Rina. Costs: "{} sent", "clear lost".
   - Good, "= null". The wire shows `{"reviewer":null}`, the record clears. Costs: "1 field cleared".
4. **Leave untouched fields out.** Live: a title input and Save. The record starts as Ship v1, Rina, Nov 3.
   - Bad, "Every field". The draft starts as all `null`, so the PATCH wipes assignee and due. Costs: "2 fields wiped".
   - Good, "Only changes". The draft starts as `{}`, so only the title moves. Costs: "0 fields wiped".
5. **Force the decision.** A type field everyone must fill.
   - Bad, "assignee?:". `{ title: "Ship v2" }` compiles; the task shows Unassigned though nobody decided. Costs: "forgot it: 0 errors".
   - Good, "User | null". The same literal fails with TS2741; `assignee: null` passes. Costs: "forgot it: 1 error".
6. **Not found is null.** A lookup endpoint.
   - Bad, "res.json(user)". `Map.get` gives `undefined`, `JSON.stringify` gives nothing, the body is 0 bytes, the client's `r.json()` throws. Costs: "0-byte body", "1 SyntaxError".
   - Good, "user ?? null". The body is `null`, 4 bytes, and the client shows "No such user". Costs: "4-byte body", "0 errors".

The record in 3 and 4 is computed, not drawn: `{ ...before, ...JSON.parse(JSON.stringify(body)) }`. So the bad side really loses `undefined` in transit.

## Quiz

Board noun "code". Five levels, pieces `null`, `undefined`, `| null`, and "omit the key".

1. **The date picker.** Piece `null`. The user pressed ✕ on the due date and never opened notes or assignee. Slots `due`, `notes`, `assignee`. Answer `due`.
2. **Only the title.** Piece `undefined`. Renamed, removed the reviewer, didn't touch the date. Slots `title`, `reviewer`, `due`. Answer `due`.
3. **Two sign-ups.** Piece `null`. A lookup cache: bo@ looked up and nobody has it, cy@ not looked up yet. Slots bo, cy. Answer bo.
4. **A new task.** Piece `| null`. Every new task must name an assignee or say there's none; colour is optional. Slots title, assignee, color. Answer assignee.
5. **Fields you asked for.** Piece "omit the key". A response for `?fields=name,manager`; Bo has no manager; phone wasn't asked for. Slots manager, phone. Answer phone.

## Signature

**The request lands.** In lessons 3 and 4 each pane holds a working form, the wire and the record. Saving (or the lesson coming on screen, once) runs it: the record rewinds to before, the JSON body types onto the wire, a hue pixel drops from the wire into the record, and each cell settles. A cell the user meant to change lands green; a cell nobody touched that got wiped flashes red; a clear that never arrived stays red. Both panes run together, so you read the wipe on the left against the untouched record on the right.

Timing: body 180ms `OUT`, pixel 260ms `OUT` after it, cells 240ms rise plus a 600ms tint fade. Under reduced motion there's no autoplay and no travel: the values and tints swap, opacity and colour only.

## Critique

### Round 1

Shots at 1440 and 390, light and dark, against `shots/kit/after-*.png`.

- **Squint.** The order reads title, then claim, then the six cards, then the TL;DR, then the quiz, same as the kit. In each card the hot line and the cost chips carry the red and green, so the verdict reads before the code does.
- **Type.** The kit's display, sans and mono. Code is 12.5px, or 12px under 640px. The out chips are 11.5px, one step under the code they annotate.
- **Colour.** Cyan comes only from the rule's hue. `null` is a solid hue box and `undefined` a dashed grey slot, the thumbnail's two marks. A wiped `null` in the record had kept its hue box. It now turns red with its cell.
- **Space.** The panes use the kit's padding. In lesson 4 the good side keeps a blank line, so its `draft.title` lines up with the bad side's.
- **Motion.** The request lands once, when lessons 3 and 4 come on screen, and on every save after that. Measured: idle, then sent at 525ms, then done at 984ms. Body, pixel and cells use transform and opacity on `--out`, with every step under 300ms. Under reduced motion only the 640ms tint fade plays.
- **Mobile.** No overflow (scrollWidth 390). The lesson 3 and 4 tab labels ("Clear to undefined", "Send every field") wrapped to two lines, unlike the other four lessons.
- **Copy.** Two hints ("Press ✕ on either chip.", "Rename the task and save.") narrated the control. Both are cut, because the chip and the Save button say it already.
- **Generated tells.** 3: the narrated hints, the red-blind wiped `null`, the wrapped tabs.
- **Kit gap.** A seated piece replaces the slot's label, so cleared level 1 shows `null` without its `due:` key. The kit doesn't expose a slot id, so the page can't fix this. It goes on the kit request list.

Fixes: hints cut; wiped and lost `null` turn red; tab labels shortened to `= undefined` / `= null` and "Every field" / "Only changes". All twelve tabs are now one line at 34px.

### Round 2

- **Squint, type, colour, space.** Unchanged and holding.
- **Mobile.** Every tab is one line, scrollWidth is 390 in both themes, and the dock lefts match (62 vs 61.8).
- **Behaviour.** All six lessons switch bad and good at 390. Level 1 clears by tapping (3 stars, "1 field cleared"). The wrong slot in level 2 shows "undefined drops out of the JSON, so the rename never reaches the server." with "rename lost". There are no console errors.
- **Generated tells.** 0 left on the page. The seated-slot label stays as the one kit-side gap.
