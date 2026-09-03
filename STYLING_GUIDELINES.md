# Styling Guidelines

## Core Philosophy

This project uses **StyleX** for extracted, type-safe component styles. Prefer static StyleX styles and the shared `cx` helper over adding a new utility framework or writing ad-hoc inline style objects.

## Rules

### 1. Define New Component Styles with StyleX

Use `stylex.create` for reusable styles and `stylex.props` when rendering a host element:

```tsx
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  card: {
    borderRadius: "0.75rem",
    padding: "1rem",
    backgroundColor: "var(--card)",
  },
  interactive: {
    cursor: "pointer",
    ":hover": {
      borderColor: "var(--muted-foreground)",
    },
  },
});

export function Card() {
  return <article {...stylex.props(styles.card, styles.interactive)} />;
}
```

Keep style definitions static so the Vite StyleX plugin can extract them at build time.

### 2. Use `cx` for Existing Utility Composition

The current site has a large amount of existing utility-style markup. Use `cx` from `src/stylex.ts` when combining those styles or accepting a `className` prop:

```tsx
import { cx } from "@/stylex";

<div className={cx("flex items-center gap-2", className)} />;
```

`src/cn.ts` remains as a compatibility wrapper for components that already import `cn`. Do not add another class-merging dependency.

### 3. Prefer Semantic Theme Variables

Theme tokens live in `src/styles.css` and are shared by StyleX and the selector fallbacks:

```tsx
const styles = stylex.create({
  root: {
    color: "var(--foreground)",
    backgroundColor: "var(--background)",
  },
});
```

Use semantic variables such as `--background`, `--foreground`, `--card`, `--muted-foreground`, `--border`, and `--brand` instead of duplicating color values.

### 4. Keep Global CSS Focused

Global CSS is appropriate for:

- theme variable definitions and color-mode switching;
- document-level resets and typography;
- keyframes and page-wide backgrounds;
- syntax-highlighter and third-party component overrides;
- selector relationships that StyleX cannot express as an atomic rule, such as descendant typography or parent-state selectors.

Do not add a new global utility class when a local StyleX rule can express the same style.

### 5. Preserve Interactive and Responsive States

Use StyleX pseudo-classes and media queries for new work:

```tsx
const styles = stylex.create({
  link: {
    color: "var(--muted-foreground)",
    ":hover": { color: "var(--foreground)" },
    "@media (min-width: 640px)": { fontSize: "0.875rem" },
  },
});
```

When a state depends on a third-party component's data attribute or on a parent selector, keep the selector in the dedicated fallback stylesheet rather than introducing another styling dependency.

## Verification

After styling changes, run:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

The StyleX Vite plugin must be active in `vite.config.ts`, and production builds must contain the extracted StyleX CSS asset.
