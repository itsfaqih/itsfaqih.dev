# Styling Guidelines

## Core Philosophy

This project prioritizes **Tailwind CSS utility classes** over custom CSS rules. Avoid writing raw CSS or `@apply` blocks in `.css` files whenever possible. Instead, apply styling directly to the HTML/JSX elements.

## Rules

### 1. Avoid Raw CSS in `styles.css`

Do not use CSS selectors (like `body`, `h1`, `.my-class`) in `styles.css` to apply styles.
**Incorrect:**

```css
/* styles.css */
body {
  background-color: var(--background);
  font-family: "Inter", sans-serif;
}
```

**Correct:**
Apply classes directly in your layout file (e.g., `__root.tsx`):

```tsx
<body className="bg-background font-sans ...">
```

### 2. Use Tailwind Theme Configuration

Define your design tokens (fonts, colors, etc.) in the Tailwind configuration (or CSS variables compliant with Tailwind) and access them via utility classes.

- **Fonts:** Use `font-sans` (mapped to Inter in config).
- **Colors:** Use semantic tokens like `text-primary` or `bg-card`.

### 3. Arbitrary Values for Complex Styles

For one-off complex styles like background patterns, use Tailwind's arbitrary value syntax instead of creating a custom class.

**Example:**

```tsx
<div className="bg-[radial-gradient(var(--dot-color)_1px,transparent_1px)] bg-[length:24px_24px]">
```

### 4. Use `cn` Utility for ClassName Merging

When combining multiple classNames (especially when accepting a `className` prop), always use the `cn` utility from `src/cn.ts`. This utility uses `clsx` and `tailwind-merge` to properly merge and deduplicate Tailwind classes.

**Incorrect:**

```tsx
<div className={`${baseClasses} ${className}`}>
```

**Correct:**

```tsx
import { cn } from "../cn";

<div className={cn(baseClasses, className)}>
```

**Benefits:**

- Properly handles conditional classes
- Deduplicates conflicting Tailwind classes (e.g., `text-red-500` overrides `text-blue-500`)
- Type-safe with TypeScript
- Cleaner syntax than template literals

### 5. Prefer Semantic Theme Variables

We follow shadcn/ui theming conventions. Define design tokens in the CSS variables and expose them via `@theme` block.

**Incorrect:**

```css
/* styles.css */
@layer base {
  :root {
    --bg-primary: #fafafa;
    --text-primary: #18181b;
  }
}
```

```tsx
<div className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
```

**Correct:**

```css
/* styles.css */
:root {
  --background: oklch(0.98 0 0);
  --foreground: oklch(0.145 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

```tsx
<div className="bg-background text-foreground">
```

**When Custom CSS Variables Are Acceptable:**

- Third-party library overrides that don't support Tailwind classes
- Complex calculated values that need to be referenced in multiple places
- Values that need to be dynamically updated via JavaScript

## Exceptions

- **CSS Variables Definition:** It is acceptable to define global CSS variables (like theme colors) in a `@layer base` block in `styles.css`.
- **Third-Party Overrides:** Sometimes specific overrides for libraries (like syntax highlighters) may require CSS if they don't support class injection easily.
