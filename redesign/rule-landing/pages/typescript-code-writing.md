# TypeScript Guidelines, on the rule-landing kit

Topic: Code Writing, cyan (`--cw`), the same hue as Proximity. Class `.rule-page.typescript-code-writing`. The rule stays hidden in the index.

## Brief

- **Who arrives.** A front-end engineer who writes TypeScript every day and has shipped a bug the compiler could have caught. They know the syntax. They don't have a house style for exports, shapes, enums, annotations, arguments and flags.
- **The one action.** Leave with the habit: write the precise form, so the compiler catches the mistake on the line that made it. Copy the Markdown, or clear the quiz.
- **Feel.** *Strict, quiet, alive.* Strict pulls toward real compiler output, checked by running `tsc`. Quiet keeps each pane to five or six lines. Alive pulls against both: `tsc` actually reads each pane, top to bottom, and plants its findings as it passes.

## Plan

Every pane is TypeScript, loose on the left and precise on the right. Each line can carry a note on its right: what the compiler or the runtime says about it. A compiler error also gets a squiggle under its line. Under each pane a terminal row runs `tsc` and prints the count. Every code and message was checked with `tsc` 7.0.2 and Node 24 in `scratchpad/tsv/`.

1. **Name it once.** Exports and the function keyword.
   - Bad, "Default export". `export default function (items)`; two files import it as `total` and `calcTotl`. The typo compiles. The stack says `at default`. Costs: "2 names, 1 function", "typo: 0 errors".
   - Good, "By name". `export function calculateTotal`; `import { calculateTotl }` fails with TS2724, did you mean `calculateTotal`. Costs: "1 name", "typo: TS2724".
2. **Extend with interface.** A shape built on another.
   - Bad, "User & {…}". `type Admin = User & { id: number }` compiles; `id` is `never`, and the error lands later, at the object: TS2322 "number is not assignable to never". Costs: "0 errors at the type", "TS2322 at the use".
   - Good, "extends User". `interface Admin extends User { id: number }` fails right there with TS2430. Costs: "TS2430 at the type".
3. **Unions, not enums.** A fixed set of roles.
   - Bad, "enum Role". `setRole("ADMIN")` fails with TS2345 although it is the right value; the enum emits 5 lines of JS; Node's type stripping throws on it. Costs: "TS2345 on \"ADMIN\"", "+5 lines of JS".
   - Good, "string union". `setRole("ADMIN")` passes, `setRole("ADMN")` fails with TS2345. Costs: "0 lines of JS", "typo: TS2345".
4. **Infer inside, annotate the edges.**
   - Bad, "Label locals". `const role: string = "ADMIN"` widens, so `setRole(role)` fails TS2345. `getUser()` has no return type, so its typo surfaces at the caller as TS2339. Costs: "TS2345 from a label", "typo: TS2339 at the caller".
   - Good, "Label edges". `const role = "ADMIN"` stays `"ADMIN"`; `getUser(): User` fails at the return with TS2353. Costs: "0 labels on locals", "typo: TS2353 at the return".
5. **One options object.** Four parameters.
   - Bad, "4 arguments". `createUser("ana@x.io", "Ana", "admin", true)` swaps name and email with 0 errors. Costs: "swap: 0 errors".
   - Good, "{ options }". Keys in any order; `role: "admn"` fails TS2820, did you mean "admin". Costs: "swap: impossible", "typo: TS2820".
6. **Turn the flags on.** `users[0].name` on an empty list.
   - Bad, "strict only". `first` is `User`, 0 errors, TypeError at runtime. Costs: "0 errors", "1 TypeError in prod".
   - Good, "+ noUnchecked…". `first` is `User | undefined`; `first.name` fails TS18048; `first?.name` passes. Costs: "TS18048 at build", "0 crashes".
   - Tip: `verbatimModuleSyntax` makes a type import say `import type` (TS1484 otherwise), and the code is ESM only.

## Quiz

Board noun "code". Four levels, every slot a value after a key.

1. **Send an email.** Piece `options`. Which function takes an options object? `double(n)`, `fullName(first, last)`, `sendEmail(to, subject, body, cc)`. Answer `sendEmail`.
2. **The role list.** Piece `as const`. `ROLES = ["ADMIN", "EDITOR"]`, `let role = "ADMIN"`, `const limit = 3`. Answer `ROLES`.
3. **The contract.** Piece `: User`. `const user = getUser()`, `function getUser()` return, `users.map((u) =>`. Answer the return.
4. **The crash report.** Piece `true`. `users[0].name` crashed in prod and `strict` is on. Slots `noImplicitAny`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`. Answer `noUncheckedIndexedAccess`.

## Signature

**tsc reads the file.** When a lesson comes on screen, both panes run the compiler at once. A thin hue bar sweeps down the code, and each note lands as the bar passes its line: a squiggle draws under an error from left to right, the chip slides in 6px. The terminal row reads "checking…" and then the count. The loose side says "0 errors" or lands its error lines later, while the precise side flags the line that made the mistake. Run tsc replays it.

Timing: the sweep runs 110ms per line on `OUT`, chips land in 200ms, squiggles draw in 240ms. All transform and opacity. Phones (tabbed) and reduced motion skip the autoplay. Under reduced motion Run tsc only fades the notes back in, with no bar and no travel.

## Critique

### Round 1 (shots in `shots/typescript-code-writing/r1/`)

- **Squint.** Reads as Proximity's sibling: cyan hero, tilted cover, white lesson cards, red left and cyan right. Each pane carries more than Proximity's tree (code, notes, a terminal row, costs), but the code column stays the heaviest thing in it.
- **Type.** Gap: "Guidelines" is one word, and at the kit's 7vw the h1 ran 104px out of its column into the cover at 1440 (right edge 833 against 729). Fixed with a page-scoped clamp to 5.6vw; it now ends at 697.
- **Colour.** Errors the compiler catches late or never are red; errors it catches on the right line take the rule's hue. Squiggles follow the same split. No gap.
- **Space.** Gap: the quiz slot leads came out at 18px with a 30px bottom margin, because arcade.css's hero `.arc .lead` also matches the kit's slot `.lead`. Fixed in page CSS.
- **Motion.** The sweep, notes and squiggles land on time (lesson 3 sampled: cursor at 0, 29, 45, 73, 101px; done at 769ms). Transform and opacity only, no `scale(0)`, every move under 300ms. No gap.
- **Mobile.** Gaps: the tab rows for lessons 1 and 4 were wider than their panes (337 and 315 against 314), so I cut the labels to "Default export / By name" and "Label locals / Label edges" (now 280 and 285). Behind tabs the kit hides the caption, so the costs took the `1fr` row and stretched tall in the shorter pane; page CSS gives that row to the code, and every chip is 22px now.
- **Generated tells.** 1: "No enum, no extra JavaScript." in a level 2 note is a staccato pair. Left in; it is the point of the slot.

### Round 2 (shots in `shots/typescript-code-writing/r2/`, 1440 and 390, light and dark)

- Squint, colour and type hold in both themes. Dark keeps the squiggles and hot lines readable.
- Mobile: no horizontal scroll (390/390), all six tab pairs switch, panes keep the taller side's height.
- Reduced motion: no idle state on load; Run tsc plays 3 opacity animations of 200ms and no cursor.
- Nits only: the hidden rule's crumb reads "No." with no number, and at 390 the docked title sits 13px right of the h1 because the long title clamps the island. Both are kit-side.
