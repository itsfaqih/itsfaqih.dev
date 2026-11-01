# Porting a rule page onto the Astro frame

Every rule page renders the same frame: the title screen, the lessons with their quiz levels, the
TL;DR, "Take the rule with you" and the pager. The frame is now Astro (`src/rules/rule-landing.astro`).
The proximity page runs on it. The other pages still render the React frame (`rule-landing.tsx`),
which stays until the last of them moves. This guide maps a React page onto the Astro frame, with
proximity as the worked example.

## The pieces

| React (`rule-landing.tsx`)                            | Astro                                                                                                                       |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `<RuleLanding id lead learn lessons tldr board take>` | `<RuleLanding id learn tldr take>` in `rule-landing.astro`, with slots `lead`, `intro` and the default slot for the lessons |
| `LessonCard` (from `lessons[]`)                       | `<RuleLesson lesson rows? costsStyle?>` in `rule-lesson.astro`, slots `body`, `extra`, `bad`, `good`                        |
| `LevelBoard` (from `lesson.levels[]`)                 | `<RuleQuiz n level board>` in `rule-quiz.astro`, the prompt as its default slot                                             |
| `<Code>` under a `Tone` context                       | `<Code tone="chip" \| "prompt" \| "wrap" \| "take">` in `code.astro` (no context in Astro, so name the tone)                |
| `<LessonText style?>`, `<Tip>`                        | `<LessonText style?>`, `<LessonText tip>` in `lesson-text.astro`                                                            |
| `<Kbd>`                                               | `<Kbd>` in `kbd.astro`                                                                                                      |
| `<Tree rows>` (proximity only)                        | `<Tree rows>` in `tree.astro`                                                                                               |
| `onceOnScreen`, `OUT`, `TABBED`, `SNAP`               | `rule-motion.ts`, `rule-landing.styles.ts`                                                                                  |
| `kit` tokens                                          | unchanged, `rule-landing.stylex.ts`                                                                                         |

The frame's behavior lives in custom elements: `<rule-landing>` (reveals, title fit and swap, the
header island, Share, Copy as Markdown, the cover's lean, the pager's art and dive),
`<rule-lesson>` (the ✕/✓ flip, the rows gliding between panes, the phone rewind, the "Try it"
arrows) and `<rule-quiz>` (drag, tap, keyboard, misses, the seat, the stars). A page adds no
script for any of that.

## Steps for one page

1. **Data to `src/rules/<id>.ts`.** Move `LESSONS` and `TLDR` out of `<id>-page.tsx` into a plain
   module typed with `src/rules/lesson.ts`. Keep only plain data: titles, labels, costs, quiz rows,
   slot notes, and whatever the panes draw from. The rich copy (`body`, `extra`, `prompt`) moves
   to slots in the page component. `Lesson<S>` takes the page's own side shape, as proximity's
   `Lesson<Side & { tree: TreeRow[] }>` does. Point `src/rules/markdown-twins.test.ts` at the new
   module.
2. **Page component `src/rules/<id>-page.astro`.** Compose the frame by hand, one `RuleLesson` and
   its `RuleQuiz` levels per lesson, in the order `lessons` had. Number the quiz levels across the
   page (`n` was `levels.indexOf(level) + 1`).
3. **Demos to `.astro` components with custom elements.** Each `view` and each page-local React
   component becomes its own `.astro` file beside the page, with its behavior in a
   `<name>.client.ts` element. Follow the recipe: the element is the root (or a `display: contents`
   host), parts carry `data-part`, one `AbortController`, a `#stop` from `disconnectedCallback`,
   and view helpers in the page's `.styles.ts` for any class the client toggles.
4. **Page styles to `src/rules/<id>.styles.ts`.** `stylex.create` cannot live in `.astro`.
5. **Route.** `src/pages/rule-of-thumb/<id>.astro` renders `<RulePage id><Page /></RulePage>` with
   no `client:` directive. Delete `<id>-page.tsx`.
6. **Parity.** Build, then diff the normalized `<main>` against the React build (see below). Run
   `vp test run --project visual -t rule-of-thumb__<id>` and the same for `--project behavior`.

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

`rows` is the larger pane's tree length, which React read from the `Tree` element. Other pages
pass nothing and get `--rows:0`, as React gave them.

## Rules that bite

- **Tones.** React picked a code's look from where it sat. Name it: `chip` in a lesson `body` and
  inside `LessonText`, `prompt` in a quiz prompt, `wrap` in an intro or a slot label, `take` in the
  take line. A wrong tone shows as a class diff in the parity check.
- **Text-node boundaries.** JSX `{" "}` after text makes a separate node, which React SSR marks
  with `<!-- -->`. Chrome shapes each node apart, so put the comment back where React had one.
  Astro strips a literal `<!-- -->` from slotted content, so in a page write
  `not<Fragment set:html="<!-- -->" /> <Code tone="chip">features/</Code>`. A literal comment
  survives only in a component's own template, as in `No.<!-- -->{n}`. Look for `{" "}` at line
  ends in the old page, and check the result in the parity diff.
- **Whitespace.** Write a slot's copy on one line, and close adjacent inline tags without a line
  break between them (`</Code><Code …>`), as JSX dropped those breaks.
- **Data attributes.** React wrote `data-rev="true"`, `data-moved="true"` and
  `data-hint-layer="true"`; the frame writes the same.
- **Quiz rows with markup.** `RuleQuiz` renders `text`, `lead` and slot `label` as strings, which
  is all proximity needs. Pages whose rows carry markup (`lead: code(...)` in
  null-vs-undefined and handling-timestamps, `paint(...)` code) need `RuleQuiz` to grow a way to
  take it, such as named slots per row. Add that with the first page that needs it.
- **Hints.** A demo control marked `data-hint` gets a "Try it" arrow, placed by `watchHints` in
  `hints.ts`. Proximity has none, so the next page with hints is the first real test of the
  vanilla renderer in `rule-lesson.client.ts`.
- **`costsStyle`** (handling-timestamps) is a `RuleLesson` prop, applied last to the cost row.

## Parity check

Build the React page first (`git stash` is shared across worktrees, so use a scratch worktree or a
copy of `dist/`), then compare the normalized `<main>` of both builds: unwrap `astro-island`, drop
scripts, sort each element's classes, and diff token by token. Expected differences are the
custom-element hosts (`rule-landing`, `rule-lesson`, `rule-quiz`) with their `display` classes and
`data-*` attributes, `data-part` attributes, the `<site-backdrop>` and `<template>` elements, and
`data-rule-open` on the pager links. Anything else is a bug.

Proximity's scripts for this check live outside the repo; the steps are short enough to redo. Copy
`dist/` to a scratch directory after a build of the React page, normalize both pages' `<main>`
with a small script, and `diff` the results.

## Driving the page

The visual and behavior suites catch layout and the basics. Before calling a page done, drive it at
1440x900 and 390x844 in light and dark: every flip key, every quiz by drag, by tap and by keyboard
(Enter, Escape, Tab, Enter), a miss before a clear, Share with and without `navigator.canShare`,
Copy as Markdown, the reveals on scroll, the compact header island, and the dive to the index and
back. Two traps in headless Chrome:

- The clipboard API refuses reads even with permission granted over CDP. Wrap
  `navigator.clipboard.writeText` in the page to record what the buttons wrote.
- A tab can report `document.visibilityState === "hidden"`, and Chrome then skips every view
  transition, so the dive looks broken on React pages too. Send `Page.bringToFront` over CDP
  first.

At 390 the compact island clips the title and hides its Share button under the search icon. The
React frame does the same; it is the header's layout, not the port.

The React frame's shared pieces (`Code`, `Kbd`, `Tip`, `onceOnScreen`, `OUT`, `TABBED`, `paint`,
the `Lesson` type) stay exported from `rule-landing.tsx` while any React page imports them. The
lane that ports the last React page deletes `rule-landing.tsx`.
