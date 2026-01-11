# Code Structure Guidelines

This document outlines the principles for structuring code and files in this project. The core philosophy is **simplicity over abstraction** and **colocation over separation**.

---

## Core Principles

### 1. Don't Abstract Prematurely

**Don't create a function or any kind of abstraction if it's not being reused.**

- If there are lines of code that are not being reused, let them be inline.
- Abstraction adds indirection. Only pay that cost when you get the benefit of reuse.

**Exception 1:** If the code is too long and hurts readability, it's fine to extract it into a function — but keep it in the same file. The goal is **readability**, not creating unnecessary abstractions across files.

**Exception 2 (React):** Extract a child component when it has its own state that shouldn't trigger parent re-renders. This is a performance optimization, not reuse — the child's state changes won't cause the parent to re-render.

```tsx
// ✅ Good - child state doesn't re-render parent
function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState(""); // Only SearchInput re-renders on typing
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

function Parent() {
  return <SearchInput onSearch={handleSearch} />; // Doesn't re-render on every keystroke
}
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
 
 - If a framework (like Next.js or TanStack Router) enforces a specific file structure (e.g., file-based routing), follow it.
 - **Example:** If you need to colocate components in a route directory but the framework thinks they are routes, create a `components` folder to hold them.

---

## Examples

### Inline Code (No Reuse)

```tsx
// ✅ Good - code is only used here, keep it inline
function UserProfile() {
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return <div>{formattedDate}</div>;
}
```

### Same-File Extraction (Reused Within File)

```tsx
// ✅ Good - reused within the same file, extract but keep in same file
function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function UserProfile() {
  return <div>{formatDate(new Date())}</div>;
}

function UserActivity() {
  return <div>Last active: {formatDate(user.lastActiveAt)}</div>;
}
```

### Separate File Extraction (Reused Across Files)

When code is needed in multiple files, extract it to a new file placed at the **lowest common ancestor** directory.

#### Same Folder

If both files are in the same folder:

```
src/
└── components/
    ├── user-profile.tsx    ← needs formatDate
    ├── user-activity.tsx   ← needs formatDate
    └── format-date.ts      ← put it here (same folder)
```

#### Different Folders (Common Ancestor)

If files are in different folders, find their common ancestor:

```
src/
└── features/
    ├── utils.ts            ← put shared code here (common ancestor)
    ├── profile/
    │   └── user-profile.tsx    ← needs formatDate
    └── activity/
        └── user-activity.tsx   ← needs formatDate
```

#### Deeper Example

```
src/
├── shared.ts               ← if needed by files across all of src/
└── features/
    ├── feature-utils.ts    ← if needed by multiple features
    ├── feature-a/
    │   ├── components/
    │   │   └── card.tsx
    │   └── hooks/
    │       └── use-card.ts
    └── feature-b/
        └── components/
            └── card.tsx
```

---

## Organizing by Type

Since one file for everything sometimes doesn't make sense, it's okay to separate content based on **what they are**.

### Single Files (Small Scale)

When you have a few shared items of the same type, group them in a single file:

```
src/
├── schemas.ts      ← only contains Zod schemas
├── hooks.ts        ← only contains React hooks
├── icons.tsx       ← only contains icon components
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
│   ├── use-intersection.hook.ts
│   └── use-unmount.hook.ts
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

| Type     | Suffix         | Example             |
| -------- | -------------- | ------------------- |
| Schema   | `.schema.ts`   | `user.schema.ts`    |
| Hook     | `.hook.ts`     | `use-auth.hook.ts`  |
| Utility  | `.util.ts`     | `date.util.ts`      |
| Type     | `.type.ts`     | `api.type.ts`       |
| Constant | `.const.ts`    | `routes.const.ts`   |
| Context  | `.context.tsx` | `theme.context.tsx` |

---

## Summary

| Scenario                          | Action                                         |
| --------------------------------- | ---------------------------------------------- |
| Code used once                    | Keep it inline                                 |
| Code is too long                  | Extract to function, keep in same file         |
| Code reused in same file          | Extract to function, keep in same file         |
| Code reused across files          | Extract to new file at lowest common ancestor  |
| React: Child has own state        | Extract to component (prevents parent re-render) |
| Deciding where to put shared file | As close as possible to the files that need it |

---

## Why This Matters

- **Reduces cognitive load** - Less jumping between files
- **Easier to delete** - Code is localized, easier to remove features
- **Prevents over-engineering** - No premature abstractions
- **Better discoverability** - Related code lives together
