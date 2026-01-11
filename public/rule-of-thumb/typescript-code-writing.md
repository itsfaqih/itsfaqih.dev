# TypeScript Guidelines

Patterns for writing clean, robust, and maintainable TypeScript.  
**Strict defaults, explicit intent.**

## Exports & Functions

Consistent module structure makes code easier to navigate and refactor.

### Prefer Named Exports

Named exports ensure consistent naming across the codebase and work better with auto-imports/refactoring tools. Avoid default exports.

### Use "function" keyword

Use the function keyword for top-level functions. It hoists, provides better stack traces, and distinguishes them from variables. Reserve arrow functions for callbacks or nested logic.

#### Named Exports vs Default

```tsx
// ❌ Avoid this
export default function(items: Item[]) { ... }
// or
const calculateTotal = (items: Item[]) => { ... };
export default calculateTotal;

// ✅ Do this
export function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

Named exports prevent "magic naming" when importing and make re-exports cleaner.

## Type Definitions

How to define data shapes relative to flexibility and performance.

### Use "type" by default

Use "type" for most definitions (unions, primitives, simple objects). Use "interface" specifically when you need to **extend** other types (to avoid intersection performance issues) or for declaration merging.

### Unions over Enums

Avoid enums as they emit runtime code and reduce interoperability. String literal unions are simpler, purely type-level, and compatible with modern Node.js type-stripping.

### Infer when possible

Use inference to reduce noise. Only annotate explicitly when documenting intent or enforcing contracts.

#### Type vs Interface

```tsx
// ✅ Use type for simple objects
type User = {
  id: string;
  name: string;
}

// ❌ Avoid intersection for extension
type Admin = User & {
  permissions: string[];
}

// ✅ Use interface for extension
interface Admin extends User {
  permissions: string[];
}
```

#### Types vs Enums

```tsx
// ❌ Avoid this
enum UserRoleEnum {
  Admin = "ADMIN",
  Editor = "EDITOR",
  Viewer = "VIEWER"
}

// ✅ Do this
type UserRole = "ADMIN" | "EDITOR" | "VIEWER";
const UserRoleEnum = {
  Admin: "ADMIN",
  Editor: "EDITOR",
  Viewer: "VIEWER"
} as const
```

String literal unions are simpler and don't emit runtime code.

#### Type Inference

```tsx
// ❌ Avoid unnecessary explicit typing
const x: number = 5; // it's a constant, it's not going to change to other types
const items: string[] = ["a", "b", "c"];

// ✅ Do this - let TypeScript infer
const y = 5; // inferred as number
const items = ["a", "b", "c"]; // inferred as string[]

// ✅ Annotate when enforcing a contract
function getUser(): User { // explicit return type documents intent
  return { id: "1", name: "Alice" };
}
```

Only add type annotations when they add value - for function signatures, public APIs, or to catch errors.

## Function Parameters

Managing arguments for readability and extensibility.

### Use Option Objects

When a function takes more than two parameters, combine them into a single object argument. This improves readability (named args) and makes adding new optional parameters non-breaking.

#### Object Parameters

```tsx
// ❌ Avoid this
function createUser(name: string, email: string, role: string, isActive: boolean) { ... }

createUser("Alice", "alice@example.com", "admin", true); // what is "true"?

// ✅ Do this
type CreateUserOptions = {
  name: string;
  email: string;
  role?: "admin" | "user";
  isActive?: boolean;
}

function createUser(options: CreateUserOptions) { ... }

createUser({
  name: "Alice",
  email: "alice@example.com",
  role: "admin"
  // arguments are clear and order-independent
});
```

Positional arguments become confusing easily.

## Strictness & Config

The foundation of a safe codebase.

### Must-Have Flags

- **`"strict": true`**: Enables strictNullChecks, noImplicitAny, etc.
- **`"noUncheckedIndexedAccess": true`**: Forces you to check if array access / index signature is defined.
- **`"verbatimModuleSyntax": true`**: Enforces consistent imports/exports and ESM compatibility.

### Module System

Use **ESM (ECMAScript Modules)** exclusively.

- ✓ import / export syntax
- ✗ require() / module.exports
- ✓ Top-level await support
