# Styling Guidelines

## Core Philosophy

This project uses **vanilla-extract** for type-safe component styles that compile to plain CSS at build time. Every component styles itself with a colocated `.css.ts` module. Do not add a utility framework, a class-merging helper, or ad-hoc inline style objects.

## Rules

### 1. Define Component Styles in a `.css.ts` Module

Put styles in a module beside the component (`card.css.ts` for `card.astro`) and join classes with `cx` from `src/cx.ts`:

```ts
// card.css.ts
import { style } from "@vanilla-extract/css";
import { HOVER } from "../browser/media-query";
import { palette } from "../theme.vars.css";

export const styles = {
  card: style({
    borderRadius: "0.75rem",
    padding: "1rem",
    backgroundColor: palette["--panel"],
  }),
  interactive: style({
    borderColor: palette["--hair"],
    "@media": {
      [HOVER]: { selectors: { "&:hover": { borderColor: palette["--dim"] } } },
    },
  }),
};
```

```astro
---
// card.astro
import { cx } from "../cx";
import { styles } from "./card.css";
---

<article class={cx(styles.card, styles.interactive)}><slot /></article>
```

A `.css.ts` module runs at build time and may export only serializable values: class strings, and objects or arrays of them. A helper that picks classes at runtime, such as `rowView` in `src/sections/experience-list.view.ts`, lives in a `.view.ts` module beside it. A client script imports the `.css.ts` module for a single class and the view module for a helper or composition. A view entry that only names one class does not earn its place.

The server build owns the rules. The `serverOwnsCss` plugin in `astro.config.ts` empties CSS in the client build, so the browser gets class strings without a second copy of the rules. A module reached only from a client script therefore loses its rules in the build, so the component's frontmatter must import it too.

### 2. Decide Overrides with Cascade Layers

`cx` joins class names and merges nothing. When two classes on one element set the same property, the cascade decides, and the order of the arguments to `cx` has no effect. Do not rely on source order across modules. An unrelated import can change it. `tests/visual/css-order.test.ts` fails when two classes on one element in a built page conflict at the same layer, condition and state.

Name the loser instead. A style that another class on the same element overrides goes whole in a layer from `src/layers.css.ts`:

```ts
import { under1 } from "../layers.css";

export const styles = {
  panel: style({
    "@layer": { [under1]: { display: "grid", padding: "1rem" } },
  }),
  // Unlayered, so this replaces the panel's padding.
  tight: style({ padding: "0.5rem" }),
};
```

`LAYER_ORDER` in `src/layers.ts` holds the order, and the first `<style>` in `src/layouts/site.astro` declares it: `base`, `global`, `under5`, `under4`, `under3`, `under2`, `under1`. A later layer beats an earlier one whatever the specificity, and an unlayered declaration beats every layer. `!important` inverts this, so an important declaration in an earlier layer beats a later layer and every unlayered one. So `under1` loses only to unlayered classes, and `under2` also loses to `under1`. Use a higher number only for a chain of overrides, where a class overrides one class and is overridden by another.

Conditions need the same care. A class that overrides a property replaces all of that property's states unless it restates them, so an override with a hover state and a base with a hover state compete at the same layer and specificity. `:hover` has higher specificity than a plain class, so a base's hover rule beats an unlayered override's resting value. When the override must also win on hover, put the base's hover rule in the layer too.

Inside one layer, specificity still decides. A few rules use a repeated `&&` selector, or `!important`, to beat another rule in the same layer. Add one only when a layer cannot express the order.

A component that lets its caller adjust it takes a class, passes it last for readability, and layers the properties the caller may change:

```astro
---
import type { ClassValue } from "../cx";
type Props = { class?: ClassValue };
const { class: className } = Astro.props;
---

<div class={cx(styles.panel, className)}><slot /></div>
```

### 3. Style on a Parent State with Markers

`when.ancestor` in `src/when.ts` builds a zero-specificity selector from a marker class. The parent carries `marker`, or a named marker for a nested state, and the descendant keys on it:

```ts
import { marker, when } from "../when";

export const styles = {
  chevron: style({
    selectors: { [`&${when.ancestor(":hover")}`]: { rotate: "90deg" } },
  }),
};
```

```astro
<a class={cx(marker, styles.link)}><span class={styles.chevron} /></a>
```

Named markers live in a `.markers.ts` module, because a `.css.ts` module that exports them would pull its rules into the importer.

### 4. Prefer Semantic Theme Variables

Tokens are declared in `src/theme.tokens.ts`. `src/theme.vars.css.ts` publishes them on `:root` in the `global` layer and overrides them under `:root.light`, the class the head script sets before first paint. Styles read them through the exported objects, so a misspelt token fails the typecheck. Each keeps its literal `--name`, so plain CSS and runtime values read it as `var(--name)`:

```ts
const styles = {
  root: style({
    color: palette["--text"],
    backgroundColor: palette["--bg"],
  }),
};
```

Use the semantic variables (`--bg`, `--text`, `--panel`, `--hair`, `--dim`) instead of duplicating colour values. The blog and code blocks read `--card`, `--border` and `--muted-foreground`, which keep their own greys.

Build scripts that need token values, such as `scripts/og/card.tsx`, import `src/theme.tokens.ts`, which has no CSS side effects. `src/theme.ts` holds theme names and colours for the head script and the browser chrome.

### 5. Keep Global CSS to What a Component Class Cannot Express

Global CSS lives in `src/styles.css`, `src/arcade.css` and `src/fonts.css`, and every rule there carries a one-line comment saying why it is global. `src/arcade.css` is in the `global` layer, so component classes beat it. A rule belongs there only when:

- it is an at-rule with no vanilla-extract form: `@font-face`, `@property`, or the preflight's `@layer base`;
- it styles `<html>` itself, a pseudo-element of it (the native scrollbar, view transitions), or a class or attribute a script sets on it, where no component renders a class;
- it styles third-party markup that takes no class, such as the Lenis sheet;
- it must reach every element under a root, such as the reduced-motion blanket, which stays unlayered with zero specificity.

Everything else belongs in a `.css.ts` module, including keyframes, page backgrounds, and states keyed on a class a script sets on `<html>`, which a component reads with a selector such as `&:is(.dark *)`.

Do not add a new global utility class when a local rule can express the same style.

### 6. Preserve Interactive and Responsive States

Hover styles sit inside `@media (hover: hover) and (pointer: fine)` so touch screens do not keep them after a tap. `HOVER`, `REDUCE` and `TOUCH` come from `src/browser/media-query.ts`, so styles and scripts read one string each. vanilla-extract does not nest `@media`, so join two conditions in one query string:

```ts
const styles = {
  link: style({
    color: palette["--dim"],
    fontSize: "1rem",
    "@media": {
      [HOVER]: { selectors: { "&:hover": { color: palette["--text"] } } },
      "(min-width: 640px)": { fontSize: "0.875rem" },
      [`${HOVER} and ${REDUCE}`]: { transition: "none" },
    },
  }),
};
```

Media queries inside one `style` apply in the order written, and rules at the same specificity follow that order. Between two ranges of `max-width`, either give the wider one a floor, or list the narrower one last. Chrome rounds `480.01px` to `480px`, so at exactly 480 both `(max-width: 480px)` and `(min-width: 480.01px)` match, and the later rule wins.

When a state depends on a component's data attribute, key on it with a selector such as `&[data-shown]`, or `when.ancestor("[data-open]")` for a parent's attribute, rather than a global selector.

## Verification

After styling changes, run:

```bash
vp run typecheck
vp run lint
vp run test
vp exec astro build
```

The vanilla-extract Vite plugin must be active in `astro.config.ts`. The build inlines each page's CSS into its `<head>`, with the `@layer` order statement first. A built page must start with that `<style>` block. `astro dev` serves the same rules as separate sheets.

vanilla-extract prints CSS as written, so the `lowerForBrowsers` plugin in `astro.config.ts` runs every `.vanilla.css` module through lightningcss with the default `browserslist` targets. That step adds the vendor prefixes Safari needs, such as `-webkit-box-decoration-break` and `-webkit-user-select`. Write the standard property and let the step add its prefix. Plain CSS in `src/styles.css` skips this step, so it writes its prefixes by hand.
