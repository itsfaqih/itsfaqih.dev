# The Proximity Principle

A visual guide to structuring code and files. Less jumping, more shipping.

## The Core Principles

1.  **Colocate**: Put related code as close as possible to where it's used.
2.  **Inline First**: Don't extract until code is reused. Keep it inline by default.
3.  **Lowest Common Ancestor**: When sharing code, place it at the nearest common parent directory.
4.  **Prefer Fewer Files**: One file with related code beats many files requiring imports.

## Don't Abstract Prematurely

If code is only used once, keep it inline. Abstraction adds complexity.

- **Bad**: Creating `utils/date.ts` for a function used once in `UserProfile.tsx`.
- **Good**: Defining the function inside `UserProfile.tsx` or using it inline.

## Exception: React State Isolation

Extract a child component when it has its own state — even if only used once. This prevents the parent from re-rendering when the child's state changes.

```tsx
// Good - child state doesn't re-render parent
function SearchInput({ onSearch }) {
  const [query, setQuery] = useState(""); // Only SearchInput re-renders
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

## Prefer Fewer Files

Splitting code across many files increases cognitive load. Keep related code together.

- **Bad**: `UserProfile/` folder with `index.tsx`, `UserProfile.tsx`, `styles.ts`, `types.ts`, `hooks.ts`. (5 files for one component).
- **Good**: `user-profile.tsx`. One file. Everything related is together.

## Extract Only When Reused

Only move code to a separate file when it's needed in multiple files.

1.  **Code used once**: Keep inline.
2.  **Code reused in same file**: Extract to function in same file.
3.  **Code reused across files**: Extract to lowest common ancestor.

## Lowest Common Ancestor

When you do share code, place it at the nearest common parent. This makes it clear which scope the utility belongs to.

## Bonus: File Suffixes

When organizing by type at scale, use suffixes for discoverability (Ctrl+P).

- `user.schema.ts`
- `use-auth.hook.ts`
- `dashboard.page.tsx`

## Quick Reference

- **Code used once** -> Keep it inline
- **Code is too long** -> Extract to function, keep in file
- **Code reused in same file** -> Extract to function, keep in file
- **Code reused across files** -> Extract to lowest common ancestor
- **React: Child has own state** -> Extract to component
