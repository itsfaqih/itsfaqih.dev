# TypeScript Guidelines

Patterns for writing clean, robust, and maintainable TypeScript. strict defaults, explicit intent.

## Exports & Functions

Consistent module structure makes code easier to navigate.

-   **Prefer Named Exports**: Ensure consistent naming across naming changes and refactoring.
-   **Use "function" keyword**: For top-level functions. It hoists and provides better stack traces.

```tsx
// Named export with function keyword
export function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

## Type Definitions

-   **Use "type" by default**: Flexible and sufficient for most cases (unions, primitives).
-   **Unions over Enums**: Use string unions (`"admin" | "user"`) instead of numeric enums. Simpler runtime behavior.
-   **Infer when possible**: Don't type variables that TS can infer (e.g., `const x = 5` is better than `const x: number = 5`).

## Function Parameters

-   **Use Option Objects**: If a function takes more than 2 arguments, use a single object argument.

```tsx
interface CreateUserOptions {
  name: string;
  email: string;
  role?: "admin" | "user";
}

function createUser(options: CreateUserOptions) { ... }
```

## Strictness & Configuration

Must-have flags in `tsconfig.json`:

-   `"strict": true`: Enables strictNullChecks, noImplicitAny.
-   `"noUncheckedIndexedAccess": true`: Forces checks when accessing arrays/objects by index.
-   `"verbatimModuleSyntax": true`: Enforces consistent imports.

## Module System

Use **ESM (ECMAScript Modules)** exclusively.

-   Use `import` / `export`.
-   Avoid `require()`.
-   Supports top-level await.
