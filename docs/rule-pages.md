# Writing a rule page

Every rule page renders the same frame. It holds the title screen, the lessons with their quiz
levels, the TL;DR, "Take the rule with you" and the pager. The frame is `src/rules/rule-landing.astro`. A page
composes it by hand from the pieces below, with proximity as the worked example.

## The pieces

| Piece                                     | Where                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------- |
| `<RuleLanding id learn tldr take>`        | `rule-landing.astro`, with slots `lead`, `intro` and the default slot for the lessons |
| `<RuleLesson lesson rows? costsClass?>`   | `rule-lesson.astro`, slots `body`, `extra`, `bad`, `good`                             |
| `<RuleQuiz n level board marks?>`         | `rule-quiz.astro`, the prompt as its default slot                                     |
| `<Code tone?>`                            | `code.astro`, tone `"chip"`, `"prompt"`, `"wrap"` or `"take"` (default `"plain"`)     |
| `<LessonText style?>`, `<LessonText tip>` | `lesson-text.astro`                                                                   |
| `<Kbd>`                                   | `kbd.astro`                                                                           |
| `<Tree rows>`                             | `tree.astro`                                                                          |
| `onceOnScreen`, `watchReveal`             | `rule-motion.ts`                                                                      |
| `OUT`, `TABBED`                           | `rule-landing.css.ts`                                                                 |
| `SNAP`, view helpers                      | `rule-landing.view.ts`                                                                |
| `kit` tokens                              | `rule-landing.vars.css.ts`                                                            |
| `Lesson<S>`, `Level`, `Tldr`              | `lesson.ts`                                                                           |

The frame's behavior lives in three custom elements. `<rule-landing>` runs the reveals, the title
fit and swap, the compact header's way back, tags and Share, Copy SKILL.md, the cover's lean, and
the pager's art and dive. `<rule-lesson>` runs the ✕/✓ flip, the rows gliding between panes, the
phone rewind and the hint arrows ("Tap it", "Drag it" and the rest). `<rule-quiz>` runs drag, tap and keyboard play, misses, the
seat and the stars. A page adds no script for any of that.

## Files for one page

1. **Data in `src/rules/<id>.ts`.** `LESSONS` and `TLDR`, typed with `src/rules/lesson.ts`. Keep
   only plain data here: titles, labels, costs, quiz rows, slot notes, and whatever the panes draw
   from. The rich copy (`body`, `extra`, the prompt) goes in slots in the page component.
   `Lesson<S>` takes the page's own side shape, as proximity's `Lesson<Side & { tree: TreeRow[] }>`
   does. `src/rules/markdown-twins.test.ts` imports the module and checks it against
   `public/rule-of-thumb/<id>.md`.
2. **Page component `src/rules/<id>-page.astro`.** One `RuleLesson` and its `RuleQuiz` levels per
   lesson, in the order of `LESSONS`. Number the quiz levels across the page with `n`, starting at 1.
3. **Demos as `.astro` components with custom elements.** Each demo is its own `.astro` file beside
   the page, with its behavior in a `<name>.client.ts` element. Follow the custom-element pattern in
   `docs/astro-migration.md`.
4. **Page styles in `src/rules/<id>.css.ts`.** vanilla-extract compiles `.css.ts` modules only, not `.astro`. Class helpers go in `<id>.view.ts`.
5. **Route.** `src/pages/rule-of-thumb/<id>.astro` renders `<RulePage id><Page /></RulePage>`.
   `rule-page.astro` wraps the page in the site layout with the rule's head tags. The rule needs a
   published entry in `src/data/guidelines.ts`, or `RuleLanding` throws.
6. **Checks.** Build, then run `vp test run --project visual -t rule-of-thumb__<id>` and the same
   for `--project behavior`, and drive the page (see below).

## Proximity, worked

`src/rules/proximity-principle.ts` holds the data:

```ts
export const LESSONS: Lesson<Side & { tree: TreeRow[] }>[] = [
  {
    title: "Inline it first",
    bad: { label: "In utils/", costs: ["2 files", "1 import"], tree: [/* rows */] },
    good: { label: "Inline", costs: ["1 file", "0 imports"], tree: [/* rows */] },
    levels: [{ name: "One caller", piece: "formatDate()", answer: "inline", rows: [/* rows */] }],
  },
  // …
];
export const TLDR = [["Code used once", "Keep it inline"] /* … */] as const satisfies Tldr;
```

`src/rules/proximity-principle-page.astro` composes it:

```astro
<RuleLanding id="proximity-principle" learn="Choose near over far" tldr={TLDR} take="place files the same way">
  <Fragment slot="lead">Start inline. Extract only when a second caller, or a constraint, demands it.</Fragment>
  <Fragment slot="intro">Move code only as far as its callers need.</Fragment>

  <RuleLesson lesson={inline} rows={rows(inline)}>
    <Fragment slot="body"
      >Keep code used once where it's used. A helper in <Code tone="chip">utils/</Code> with one caller …</Fragment
    >
    <Tree slot="bad" rows={inline.bad.tree} />
    <Tree slot="good" rows={inline.good.tree} />
  </RuleLesson>
  <RuleQuiz n={1} level={inline.levels[0]} board="tree"
    >Only <Code tone="prompt">user-profile.ts</Code> calls <Code tone="prompt">formatDate()</Code>. Place it.</RuleQuiz
  >
  …
</RuleLanding>
```

`rows` is the larger pane's tree length, which sizes the panes on phones. Pages without trees
pass nothing and get `--rows:0`.

## Rules that bite

- **Tones.** Name each code's look by where it sits: `chip` in a lesson `body` and inside
  `LessonText`, `prompt` in a quiz prompt, `wrap` in an intro or a slot label, `take` in the take
  line.
- **Quiz rows with markup.** `RuleQuiz` renders a row's `text`, `lead` and slot `label` as strings.
  For rows that carry markup, pass `marks`, an object of components for `lead`, `label` and `text`.
  Each gets `text` and `tone` (`"wrap"` for a slot label, `"plain"` elsewhere).
  null-vs-undefined passes `NullBoardCell` for all three to paint code.
- **Text-node boundaries.** Some pages keep an empty comment between two text nodes, written
  `not<Fragment set:html="<!-- -->" /> <Code tone="chip">features/</Code>` in slotted copy, since
  Astro strips a literal `<!-- -->` there. Chrome shapes each text node apart, so removing one can
  move glyphs and fail the screenshots. A literal comment survives only in a component's own
  template, as in `No.<!-- -->{n}`.
- **Whitespace.** A line break between inline tags renders as a space. Write a slot's copy on one
  line, and close adjacent inline tags without a break between them (`</Code><Code …>`).
- **Durations in copy.** Say how long a scenario takes in words ("which takes a few seconds"),
  not "600ms". Keep a figure only when it is the advice ("Wait 200ms") or labels a chart or
  timeline in a lesson demo. `copy-durations.test.ts` fails on the prose form.
- **No clock in quizzes.** A quiz never labels its rows or ticks with times like "0ms" or
  "1500ms". Show order and state with pictures instead: a track marked where replies land, a
  request log, a path from where data arrives to where it breaks. data-loading's quizzes 4, 5 and 7
  are the examples.
- **Accent bars.** A box marked with a left bar (an inset shadow along its left edge, like a
  lesson's hot line) keeps square left corners, so the bar runs straight. `accent-bars.test.ts`
  fails on a `style()` that draws the bar without `borderTopLeftRadius: 0` and
  `borderBottomLeftRadius: 0`.
- **Reveals.** A block that rises in on scroll carries `data-rev="true"`. The visual suite fails if
  one is still unrevealed when it captures.
- **Hints.** A demo control marked `data-hint` gets a hint arrow labelled from `HINT` ("Tap it", "Drag it"), placed by `watchHints` in
  `hints.ts` and drawn by `rule-lesson.client.ts`.
- **The reader starts a demo.** A demo whose control carries a hint waits for the press.
  It renders unsent and never plays on scroll, so the reader sees the cause before the effect.
  null-vs-undefined's save demos start at "not sent yet" with Rina still assigned.
- **Disabled keys lie flat.** Draw a key's hard drop with `drop(px, color)` from `src/bevel.ts`,
  never a raw `0 4px 0 …`. A disabled control sets `--bevel` to 0 (`styles.css`), which flattens
  every drop under it. `bevel.test.ts` fails on a raw drop, and the visual suite disables every
  button on every page and fails on one still raised.
- **Moving controls keep the pointer.** A control that moves on hover or press (a lift, a press
  dip) takes `hoverHold.lift`, whose `::before` reaches 8px past it above and below while it is
  hovered. Without it, a pointer resting on an edge slips off as the control moves, so the hover
  flickers or the click misses. Every `button.base` key has it already. The visual suite hovers
  and presses each moving control on home 1px inside its top and bottom edges.
- **`costsClass`** is a `RuleLesson` prop, applied last to the cost row.

## Quiz rules

The user rejected quizzes and demos for each of these, more than once. Check a new or changed quiz
against every one before showing it.

- **Every choice looks alike.** The reader picks the answer by reading, never by spotting the odd
  one out. No choice may be the only one that moves, has an icon, is coloured or sized differently,
  or sits apart. Rejected: "too obvious that the answer is moving" and "too obvious because the only
  button with icon is the middle one".
- **The quiz has its own scenario.** It tests the rule on a case the lesson's explanation and demo
  did not show, so the reader applies the rule rather than recalling the example.
- **Code is framework-agnostic.** Write examples in plain TypeScript, HTML or pseudo-markup. Use
  React or another framework only when the rule is about that framework.
- **Never disable a submit button because the form is invalid.** Keep it enabled and say what is
  wrong on submit. A demo or quiz that shows the right way follows this too.
- **Show variants before changing a quiz's format.** When a quiz needs a new interaction (drag,
  tap, slide, pick), build a few variants as a local artifact and let the user pick before
  replacing the current one.

## Driving the page

The visual and behavior suites catch layout and the basics. Before calling a page done, drive it at
1440x900 and 390x844 in light and dark: every flip key, every quiz by drag, by tap and by keyboard
(Enter, Escape, Tab, Enter), a miss before a clear, Share with and without `navigator.canShare`,
Copy SKILL.md, the reveals on scroll, the compact header, and the dive to the index and back.
Two traps in headless Chrome:

- The clipboard API refuses reads even with permission granted over CDP. Wrap
  `navigator.clipboard.writeText` in the page to record what the buttons wrote.
- A tab can report `document.visibilityState === "hidden"`, and Chrome then skips every view
  transition, so the dive looks broken. Send `Page.bringToFront` over CDP first.

At 390 the compact header clips the title and hides its Share button under the search icon. That
is the header's layout, not the page's.
