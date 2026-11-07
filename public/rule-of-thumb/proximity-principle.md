---
name: proximity-principle
description: Keep code next to the code that uses it. Use when you decide where a new file, component, helper or test goes, or whether to split code into its own file.
---

# Proximity Principle

Keep code next to the code that uses it.

## TL;DR

| Situation                     | Do this                               |
| ----------------------------- | ------------------------------------- |
| Code used once                | Keep it inline                        |
| Code too long                 | Extract a function, same file         |
| Reused in the same file       | Extract a function, same file         |
| Reused across files           | Move it to the lowest common ancestor |
| Used almost everywhere        | Use a type folder, like middleware/   |
| Your stack demands a boundary | Comply with the constraint            |

## Inline it first

Keep code used once where it's used, in its caller's file. A one-caller helper in `utils/` adds a file and an import, and shares nothing.

```ts
// src/routes/orders/refund.ts
function toCents(amount: number) {
  return Math.round(amount * 100);
}

export function refund(order: Order) {
  return payments.refund(order.chargeId, toCents(order.total));
}
```

## Prefer fewer files

Keep one handler in one file, with its types, schema and helpers, so it reads in one tab. Split into a folder and reading it takes five tabs.

```text
routes/orders/
  create-order.ts         type OrderInput, const schema, function priceItems(), createOrder
```

## Comply with the constraint

Extract code used once when your stack demands a boundary. Node runs every handler on one thread, and a worker thread loads its code from its own file. Move a slow report build there and other requests stop waiting on it.

```ts
// src/routes/reports/export.ts
const worker = new Worker(new URL("./build-report.worker.ts", import.meta.url));
worker.postMessage({ month }); // buildReport() runs off the main thread
```

## Use the lowest common ancestor

When a second file needs it, move it up to the nearest folder both callers share, so the path names its owner. Name folders for what they hold, like `routes/` or `controllers/`.

```text
src/
  routes/shop/
    cart.ts
    cart/summary.ts           calls getCart()
    checkout/charge.ts        calls getCart()
```

## Give global code a type folder

Code used almost everywhere, like auth middleware, belongs to no route. Give it a folder named for its type, and a type suffix so `⌘P` finds it: `user.schema.ts`, `auth.service.ts`, `orders.controller.ts`.

```text
src/
  middleware/
    require-auth.ts
  routes/
    settings/, checkout/, … 10 more routes    import middleware/require-auth
```
