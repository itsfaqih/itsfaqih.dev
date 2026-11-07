# Code Structure Guidelines

This document outlines the principles for structuring code and files in this project. The core philosophy is **simplicity over abstraction** and **colocation over separation**.

---

## Core Principles

### 1. Don't Abstract Prematurely

**Don't create a function or any kind of abstraction if it's not being reused.**

- If there are lines of code that are not being reused, let them be inline.
- Abstraction adds indirection. Only pay that cost when you get the benefit of reuse.

**Exception 1:** If the code is too long and hurts readability, it's fine to extract it into a function — but keep it in the same file. The goal is **readability**, not creating unnecessary abstractions across files.

**Exception 2 (Astro):** vanilla-extract compiles `.css.ts` modules only, and an `.astro` file's browser code runs from a `<script>`. Put a component's styles in `<name>.css.ts` and its custom element in `<name>.client.ts`, beside the `.astro` file. Class helpers that run at request time or in the browser, and plain values the `.astro` file and its client share, go in `<name>.view.ts`, because a `.css.ts` module exports only serializable values. This is a framework constraint, not reuse, so it does not count against the rules below.

```
src/components/
├── header.astro        ← markup, and a <script> that imports header.client.ts
├── header.client.ts    ← the <site-header> custom element
├── header.css.ts       ← styles for both
└── header.view.ts      ← class helpers and values for both
```

### 2. Prefer Fewer Files

**Prefer one big file over multiple files.**

- Splitting code across many files increases cognitive load.
- Keep related code together until there's a compelling reason to separate.

### 3. Extract Only When Necessary

**Don't move a function out of a file if it's not being reused in another file.**

- If code is reused within the same file → extract to a function, keep it in the same file.
- If code is too long and hurts readability → extract to a function, keep it in the same file.
- If code is needed in another file → then and only then, move it to a separate file.

Note: Extracting for readability vs extracting for reuse are both valid. The key principle is that **file extraction** should only happen when code is shared across files.

### 4. Code Colocation

**Put related files as close as possible to where they're used.**

When extracting shared code to a new file, place it at the **lowest common ancestor** of the files that need it.

### 5. Follow Framework Rules

**Framework constraints override these guidelines.**

- If a framework (like Next.js or Astro) enforces a specific file structure (e.g., file-based routing), follow it.
- **Example:** Astro treats every file in `src/pages/` as a page, so a page's components live outside it: `src/sections/` for the home page and the pieces the rule pages share, `src/rules/` for the rule pages, and `src/blog/` for the blog.

---

## Examples

### Inline Code (No Reuse)

```ts
// ✅ Good - code is only used here, keep it inline
function profileLine(user: User) {
  const joined = user.joinedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `${user.name}, joined ${joined}`;
}
```

### Same-File Extraction (Reused Within File)

```ts
// ✅ Good - reused within the same file, extract but keep in same file
function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function profileLine(user: User) {
  return `${user.name}, joined ${formatDate(user.joinedAt)}`;
}

function activityLine(user: User) {
  return `Last active: ${formatDate(user.lastActiveAt)}`;
}
```

### Separate File Extraction (Reused Across Files)

When code is needed in multiple files, extract it to a new file placed at the **lowest common ancestor** directory.

#### Same Folder

If both files are in the same folder:

```
src/
└── components/
    ├── user-profile.astro  ← needs formatDate
    ├── user-activity.astro ← needs formatDate
    └── format-date.ts      ← put it here (same folder)
```

#### Different Folders (Common Ancestor)

If files are in different folders, find their common ancestor:

```
src/
└── features/
    ├── utils.ts            ← put shared code here (common ancestor)
    ├── profile/
    │   └── user-profile.astro  ← needs formatDate
    └── activity/
        └── user-activity.astro ← needs formatDate
```

#### Deeper Example

```
src/
├── shared.ts               ← if needed by files across all of src/
└── features/
    ├── feature-utils.ts    ← if needed by multiple features
    ├── feature-a/
    │   ├── components/
    │   │   └── card.astro
    │   └── hooks/
    │       └── card-drag.ts
    └── feature-b/
        └── components/
            └── card.astro
```

Shared styles follow the same rule: `src/components/button.css.ts` serves the whole site, while `src/sections/section.css.ts` serves only the home page and the rule pages.

---

## Organizing by Type

Since one file for everything sometimes doesn't make sense, it's okay to separate content based on **what they are**.

### Single Files (Small Scale)

When you have a few shared items of the same type, group them in a single file:

```
src/
├── schemas.ts      ← only contains Zod schemas
├── hooks.ts        ← only contains browser helpers
├── icons.ts        ← only contains icon path data
└── utils.ts        ← only contains utility functions
```

### Directories with Suffixes (Large Scale)

When files get too big, convert them to a directory and separate by domain. **Use file suffixes** to differentiate between types:

```
src/
├── schemas/
│   ├── user.schema.ts
│   └── organization.schema.ts
├── hooks/
│   ├── idle.hook.ts
│   └── media-query.hook.ts
└── utils/
    ├── date.util.ts
    └── user.util.ts
```

### Why Suffixes Matter

Suffixes like `.schema.ts`, `.hook.ts`, and `.util.ts` are important for **discoverability**.

When using VS Code's **Command Palette** (`Ctrl+Shift+P` → "Go to File" or `Ctrl+P`), you can quickly differentiate between:

- `user.schema` - the Zod schema for user
- `user.util` - utility functions for user
- `user.type` - types for user

Without suffixes, you'd see multiple `user.ts` files and have to guess which one you need.

### Common Type Suffixes

| Type           | Suffix         | Example                   |
| -------------- | -------------- | ------------------------- |
| Schema         | `.schema.ts`   | `user.schema.ts`          |
| Hook           | `.hook.ts`     | `idle.hook.ts`            |
| Utility        | `.util.ts`     | `date.util.ts`            |
| Type           | `.type.ts`     | `api.type.ts`             |
| Constant       | `.const.ts`    | `routes.const.ts`         |
| Styles         | `.css.ts`      | `header.css.ts`           |
| View helpers   | `.view.ts`     | `header.view.ts`          |
| CSS variables  | `.vars.css.ts` | `theme.vars.css.ts`       |
| Token values   | `.tokens.ts`   | `theme.tokens.ts`         |
| State markers  | `.markers.ts`  | `table-design.markers.ts` |
| Custom element | `.client.ts`   | `header.client.ts`        |

---

## Arrows

The site draws four kinds of arrow. **A request about "arrows" means all four** unless the user names one: a fix to the hint arrows that leaves Squint or the hero arrows broken is not done. Check every kind on every page that draws it.

| Kind   | What it is                                                                                                                                                  | Placed by                                                                                                                                    | Drawn by                                                             | Look in `ARROWS`                |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------- |
| hint   | Pixel arrow from a label ("Tap it", "Drag it") to a `[data-hint]` control in a demo pane (`figure[data-side]`)                                              | `watchHints` in `src/rules/hints.ts`                                                                                                         | `mountHints` in `src/rules/hint-layer.ts`                            | `hint`                          |
| toggle | Pixel arrow to a `[data-hint]` outside any pane: a toggle in a lesson's copy, or a quiz board's piece ("Drag it") or the box round its choices ("Pick one") | `watchHints`, the `!figure` branch; a quiz's `data-hint` is set by `src/rules/rule-quiz.client.ts`, which aims every line at a side's middle | `mountHints`                                                         | `toggle`, with the `hint` cells |
| Squint | Short pixel arrows under Squint's notes, pointing down at each button                                                                                       | `src/rules/button-hierarchy.astro` (Button Design)                                                                                           | `pixels()` in `src/arrows.ts`, inline in the same file               | `hint`                          |
| hero   | Ghost arrows in the home hero's queue scene                                                                                                                 | `routeGhost()` and `retryGhost()` in `src/sections/hero/hero-scenes.ts`                                                                      | `src/sections/hero/hero-scene.astro`, styled in `hero-prints.css.ts` | `hero`                          |

- `src/arrows.ts` owns every arrow's geometry: the looks in `ARROWS`, `pixels()` for the cell trails and pixel heads, `brush()` for the hero's marker stroke and its notched head, and `HINT_MOTION` for how a hint enters and leaves.
- Hint targets are the `data-hint` attributes in the demo components (`src/rules/*-demo.astro`, `button-toggle.astro`, `table-segments.astro` and the rest), each labelled from `HINT` in `hints.ts`. `src/rules/table-design.client.ts` moves `data-hint` to the first row's name as rows change, so its arrow follows. The "dead arrows" in `src/rules/table-design.ts` are pager copy, not drawn arrows.
- Each pixel arrow's svg carries its line as `data-spine`, which `tests/visual/arrows.test.ts` reads.
- The rules every arrow keeps are tested in `tests/visual/arrows.test.ts`, with the hero's in `src/arrows.test.ts`: the head points at its target and the nock at its word, every arrow is at least 24px long, no line bends tighter than `BEND` (`tests/arrow-rules.ts`), an arrow is straight where a straight one fits, arrows keep off each other and off the page's content where a free slot exists, and every head sits square on its stroke. Run it after any arrow change, and fix a rule it names rather than loosening it.

---

## Summary

| Scenario                          | Action                                         |
| --------------------------------- | ---------------------------------------------- |
| Code used once                    | Keep it inline                                 |
| Code is too long                  | Extract to function, keep in same file         |
| Code reused in same file          | Extract to function, keep in same file         |
| Code reused across files          | Extract to new file at lowest common ancestor  |
| Astro: styles or browser code     | Move to `.css.ts` or `.client.ts` beside it    |
| Deciding where to put shared file | As close as possible to the files that need it |

---

## Why This Matters

- **Reduces cognitive load** - Less jumping between files
- **Easier to delete** - Code is localized, easier to remove features
- **Prevents over-engineering** - No premature abstractions
- **Better discoverability** - Related code lives together
