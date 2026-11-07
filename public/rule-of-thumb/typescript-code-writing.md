---
name: typescript-code-writing
description: Write types precise enough that the compiler catches a mistake where you made it. Use when you write or review TypeScript types, function signatures or tsconfig flags.
---

# TypeScript Guidelines

Write types precise enough that the compiler catches a mistake where you made it.

## TL;DR

| Situation                  | Do this                                                               |
| -------------------------- | --------------------------------------------------------------------- |
| A function other files use | Use export function name()                                            |
| A shape, a union, an alias | Use type                                                              |
| One shape built on another | Use interface … extends                                               |
| A fixed set of values      | Use a string union, not an enum                                       |
| A local value              | Infer it. Annotate returns and APIs.                                  |
| Three or more parameters   | Take one options object                                               |
| A new tsconfig             | Enable strict, noUncheckedIndexedAccess, verbatimModuleSyntax and ESM |

## Name it once

Export each function by name, with the `function` keyword, so every importer uses one name, a typo fails to compile, and stack traces name the function. Keep arrow functions for callbacks.

```ts
// cart.ts
export function calculateTotal(items: Item[]) {…} // stack trace: at calculateTotal
// receipt.ts
import { calculateTotl } from "./cart"; // TS2724: did you mean 'calculateTotal'?
```

## Extend with interface

Use `type` for shapes, unions and aliases. To build one shape on another, use `interface … extends`, so a clash fails at the declaration and the error names both types. An `&` intersection compiles the clash into `never` and reports it at the first object of that type.

```ts
type User = { id: string; name: string };
interface Admin extends User {
  // TS2430: incorrectly extends 'User'
  id: number;
}
```

## Use unions, not enums

Write a string union, which exists only as a type. A string enum is a runtime object. It rejects the plain string it stands for, adds JavaScript to the bundle, and fails under Node's type stripping. For the values at runtime too, derive the type from an `as const` array.

```ts
type Role = "ADMIN" | "VIEWER"; // 0 lines of JS
function setRole(role: Role) {}
setRole("ADMIN"); // 0 errors
setRole("ADMN"); // TS2345

const ROLES = ["ADMIN", "VIEWER"] as const;
type RoleFromList = (typeof ROLES)[number]; // "ADMIN" | "VIEWER"
```

## Infer inside, annotate the edges

Let TypeScript infer locals, which keeps their narrow types. Annotate where a contract starts, such as a return type or a public API. A typo then fails where you wrote it.

```ts
const role = "ADMIN"; // role: "ADMIN"
setRole(role); // 0 errors
function getUser(): User {
  return { id: "1", nmae: "Ana" }; // TS2353: 'nmae' is not in 'User'
}
```

## Take one options object

Past two parameters, take one options object. Named keys label each value at the call, can't swap, and take a new optional field without breaking a caller.

```ts
function createUser(options: { name: string; email: string; role?: "admin" | "user" }) {}
createUser({ email: "ana@x.io", name: "Ana" }); // 0 errors, any order
createUser({ name, email, role: "admn" }); // TS2820: did you mean '"admin"'?
```

## Turn the flags on

Enable `strict`, `noUncheckedIndexedAccess` and `verbatimModuleSyntax`. `noUncheckedIndexedAccess` types every index read as possibly `undefined`, which catches `users[0]` on an empty list. `verbatimModuleSyntax` makes a type import say `import type`. Write ESM, with `import` and `export`.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true
  }
}
```

```ts
const first = users[0]; // first: User | undefined
first.name.toUpperCase(); // TS18048: 'first' is possibly 'undefined'
first?.name ?? "No users yet"; // 0 errors
```
