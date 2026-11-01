# Styling Guidelines

## Core Philosophy

This project uses **StyleX** for extracted, type-safe component styles. Every component styles itself with a colocated `stylex.create`. Do not add a utility framework, a class-merging helper, or ad-hoc inline style objects.

## Rules

### 1. Define New Component Styles with StyleX

StyleX compiles TypeScript modules only, not `.astro` files. Put `stylex.create` in a module beside the component (`card.styles.ts` for `card.astro`), and spread `stylex.attrs` on the element in the `.astro` template:

```ts
// card.styles.ts
import * as stylex from "@stylexjs/stylex";
import { palette } from "../theme.stylex";

export const styles = stylex.create({
  card: {
    borderRadius: "0.75rem",
    padding: "1rem",
    backgroundColor: palette["--panel"],
  },
  interactive: {
    borderColor: {
      default: palette["--hair"],
      ":hover": { default: null, "@media (hover: hover)": palette["--dim"] },
    },
  },
});
```

```astro
---
// card.astro
import * as stylex from "@stylexjs/stylex";
import { styles } from "./card.styles";
---

<article {...stylex.attrs(styles.card, styles.interactive)}><slot /></article>
```

Keep style definitions static so the Vite StyleX plugin can extract them at build time.

Some modules export ready class strings instead, built with `stylex.props(...).className`, as `src/layouts/site.stylex.ts` does for the layout and the `post` and `prose` objects in `src/blog/post.styles.ts` do for the blog post frame. A custom element that swaps classes at runtime reads them from view helpers in the same module, such as `landingView` in `src/rules/rule-landing.styles.ts`.

### 2. Accept StyleX Styles, Not Class Strings

A component that lets its caller adjust it takes a `style?: stylex.StyleXStyles` prop and passes it last to `stylex.attrs`, so the caller's values win:

```astro
---
type Props = { style?: stylex.StyleXStyles };
const { style } = Astro.props;
---

<div {...stylex.attrs(styles.panel, style)}><slot /></div>
```

Parent hover and focus states use `stylex.when.ancestor(...)` with `stylex.defaultMarker()` on the parent.

### 3. Prefer Semantic Theme Variables

Tokens live in `src/theme.stylex.ts`, and `src/theme.ts` overrides them for the light theme. StyleX styles read them through the exported objects, so a misspelt token fails the typecheck. Each keeps its literal `--name`, so plain CSS and runtime values read it as `var(--name)`:

```ts
const styles = stylex.create({
  root: {
    color: palette["--text"],
    backgroundColor: palette["--bg"],
  },
});
```

Use the semantic variables (`--bg`, `--text`, `--panel`, `--hair`, `--dim`) instead of duplicating colour values. The blog and code blocks read `--card`, `--border` and `--muted-foreground`, which keep the old site's greys in light mode.

### 4. Keep Global CSS to What StyleX Cannot Express

Global CSS lives in `src/styles.css`, `src/arcade.css` and `src/fonts.css`, and every rule there carries a one-line comment saying why it is global. A rule belongs there only when:

- it is an at-rule with no StyleX form: `@font-face`, `@property`, or the preflight's `@layer base`;
- it styles `<html>` itself, a pseudo-element of it (the native scrollbar, view transitions), or a class or attribute a script sets on it, where no component renders a class;
- it styles third-party markup that takes no class, such as the Lenis sheet;
- it must reach every element under a root, such as the reduced-motion blanket.

Everything else is StyleX, including keyframes, page backgrounds, and states keyed on a class a script sets on `<html>`, which a component reads with a condition such as `":is(.dark *)"` or `":is(.js.no-intro *)"`. When several files share a style, export it from a `stylex.create` module at their lowest common ancestor (`src/components/button.ts`, `src/sections/section.ts`) and compose it first, before the caller's own styles. Style rendered Markdown through an MDX `components` map instead of descendant selectors. Astro passes an element's children to that map's entries as a slot, so the blog's `p` and `h2` entries are Astro components (`src/blog/prose-p.astro`, `prose-h2.astro`) that put the `prose` classes on the element.

Do not add a new global utility class when a local StyleX rule can express the same style.

### 5. Preserve Interactive and Responsive States

Nest pseudo-classes and media queries under the property they change. Hover styles sit inside `@media (hover: hover)` so touch screens do not keep them after a tap:

```ts
const styles = stylex.create({
  link: {
    color: {
      default: palette["--dim"],
      ":hover": { default: null, "@media (hover: hover)": palette["--text"] },
    },
    fontSize: { default: "1rem", "@media (min-width: 640px)": "0.875rem" },
  },
});
```

When a state depends on a component's data attribute, key on it with a StyleX condition such as `":is([data-shown])"`, or `stylex.when.ancestor(...)` for a parent's attribute, rather than a global selector.

## Verification

After styling changes, run:

```bash
vp run typecheck
vp run lint
vp run test
vp build
```

The StyleX Vite plugin must be active in `astro.config.ts`. The build inlines its collected sheet into every page's `<head>` after the global CSS, so a built page must carry that `<style>` block. In development the layout links `/virtual:stylex.css` instead.
