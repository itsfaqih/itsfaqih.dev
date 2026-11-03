# Proximity Principle

Keep code next to the code that uses it.

## TL;DR

| Situation                     | Do this                               |
| ----------------------------- | ------------------------------------- |
| Code used once                | Keep it inline                        |
| Code too long                 | Extract a function, same file         |
| Reused in the same file       | Extract a function, same file         |
| Reused across files           | Move it to the lowest common ancestor |
| Used almost everywhere        | Use a type folder, like components/   |
| Your stack demands a boundary | Comply with the constraint            |

## Inline it first

Keep code used once where it's used, in its caller's file. A one-caller helper in `utils/` adds a file and an import, and shares nothing.

```ts
// src/routes/profile/user-profile.ts
function formatDate(date: Date) {
  return date.toLocaleDateString();
}

export function joinedLabel(user: User) {
  return `Joined ${formatDate(user.joinedAt)}`;
}
```

## Prefer fewer files

Keep one component in one file, with its types, styles and helpers, so it reads in one tab. Split into a folder and reading it takes five tabs.

```text
routes/profile/
  user-profile.ts         type Profile, const styles, function loadProfile(), UserProfile
```

## Comply with the constraint

Extract code used once when your stack demands a boundary. Many UI frameworks re-render the component that holds a piece of state. If a search box keeps its text in a child of its own, a keystroke re-renders the child, not the page and its 500 rows.

```text
Order page
  Search box            holds the query state, re-renders on each keystroke
  Order list, 500 rows  re-renders only when a search runs
```

## Use the lowest common ancestor

When a second file needs it, move it up to the nearest folder both callers share, so the path names its owner. Name folders for what they hold, like `routes/` or `controllers/`.

```text
src/
  routes/shop/
    cart.ts
    cart/summary.ts           calls getCart()
    checkout/pay-button.ts    calls getCart()
```

## Give global code a type folder

Code used almost everywhere, like a button, belongs to no page. Give it a folder named for its type, and a type suffix so `⌘P` finds it: `user.schema.ts`, `auth.service.ts`, `dashboard.page.ts`.

```text
src/
  components/
    button.ts
  routes/
    settings/, checkout/, … 10 more pages    import components/button
```
