# TypeScript Guidelines

Write types precise enough that the compiler catches a mistake where you made it.

Prefer named exports, unions and typed edges. Turn on the strict flags. Make a typo fail where you wrote it, not in a caller.

## Name it once

Export each function by name, with the `function` keyword. A default export takes whatever name each importer gives it, so a typo compiles and the stack trace says `default`. Keep arrow functions for callbacks.

Bad (Default export):

```ts
// cart.ts
export default function (items: Item[]) {…} // stack trace: at default
// receipt.tsx
import calcTotl from "./cart"; // 0 errors
```

Good (By name):

```ts
// cart.ts
export function calculateTotal(items: Item[]) {…} // stack trace: at calculateTotal
// receipt.tsx
import { calculateTotl } from "./cart"; // TS2724: did you mean 'calculateTotal'?
```

## Extend with interface

Use `type` for shapes, unions and aliases. To build one shape on another, use `interface … extends`. A clash then fails at the declaration, in plain words. With `&`, the clash compiles, the field becomes `never`, and the error shows up at the first object of that type.

Bad (User & {…}):

```ts
type User = { id: string; name: string };
type Admin = User & { id: number }; // id: never, 0 errors
const ana: Admin = { id: 1, name: "Ana" }; // TS2322: 'number' is not assignable to 'never'
```

Good (extends User):

```ts
type User = { id: string; name: string };
interface Admin extends User {
  // TS2430: incorrectly extends 'User'
  id: number;
}
```

## Use unions, not enums

Write a string union, which is only a type. A string enum is a runtime object. It rejects the plain string it stands for, adds JavaScript to your bundle, and won't run under Node's type stripping.

Bad (enum Role):

```ts
enum Role {
  Admin = "ADMIN",
  Viewer = "VIEWER",
} // emits a runtime object
function setRole(role: Role) {}
setRole("ADMIN"); // TS2345: '"ADMIN"' is not a 'Role'
```

Good (String union):

```ts
type Role = "ADMIN" | "VIEWER"; // 0 lines of JS
function setRole(role: Role) {}
setRole("ADMIN"); // 0 errors
setRole("ADMN"); // TS2345
```

If you need the values at runtime too, freeze the list with `as const` and derive the type from it:

```ts
const ROLES = ["ADMIN", "VIEWER"] as const;
type Role = (typeof ROLES)[number]; // "ADMIN" | "VIEWER"
```

## Infer inside, annotate the edges

Let TypeScript infer locals. A label on a local only widens it. Annotate where a contract starts: a return type, a public API. Then a typo fails where you wrote it, not in a caller.

Bad (Label locals):

```ts
const role: string = "ADMIN";
setRole(role); // TS2345: 'string' is not a 'Role'
function getUser() {
  return { id: "1", nmae: "Ana" }; // 0 errors
}
getUser().name; // TS2339 at the caller
```

Good (Label edges):

```ts
const role = "ADMIN"; // role: "ADMIN"
setRole(role); // 0 errors
function getUser(): User {
  return { id: "1", nmae: "Ana" }; // TS2353: 'nmae' is not in 'User'
}
```

## Take one options object

Past two parameters, take one object. Four positional arguments say nothing at the call, and two strings can swap with no error. Named keys can't swap, label each value, and take a new optional field without breaking a caller.

Bad (4 arguments):

```ts
function createUser(name: string, email: string, role: string, active: boolean) {}
createUser("ana@x.io", "Ana", "admin", true); // 0 errors, name and email swapped
```

Good ({ options }):

```ts
function createUser(options: { name: string; email: string; role?: "admin" | "user" }) {}
createUser({ email: "ana@x.io", name: "Ana" }); // 0 errors, any order
createUser({ name, email, role: "admn" }); // TS2820: did you mean '"admin"'?
```

## Turn the flags on

Enable `noUncheckedIndexedAccess`, which types every index read as possibly `undefined`. Under `strict` alone, `users[0]` still reads as a `User` on an empty list.

Add `verbatimModuleSyntax` too, so a type import must say `import type`. Write ESM only: `import` and `export`, never `require`.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true
  }
}
```

Bad (strict only):

```ts
const first = users[0]; // first: User
first.name.toUpperCase(); // TypeError at runtime when users is []
```

Good (+ noUnchecked…):

```ts
const first = users[0]; // first: User | undefined
first.name.toUpperCase(); // TS18048: 'first' is possibly 'undefined'
first?.name ?? "No users yet"; // 0 errors
```

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
