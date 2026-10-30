# Proximity Principle

Keep code next to the code that uses it.

Start inline. Extract only when a second caller, or its own state, demands it. Move code only as far as its callers need.

## Inline it first

Keep code used once where it's used. A helper in `utils/` with one caller adds a file and an import, and shares nothing.

Bad: In utils/ (2 files, 1 import)

```text
src/
  routes/profile/
    user-profile.tsx      calls formatDate()
  utils/
    format-date.ts        export function formatDate()
```

Good: Inline (1 file, 0 imports)

```tsx
// src/routes/profile/user-profile.tsx
function formatDate(date: Date) {
  return date.toLocaleDateString();
}

export function UserProfile({ user }: { user: User }) {
  return <p>Joined {formatDate(user.joinedAt)}</p>;
}
```

## Prefer fewer files

Keep one component in one file. If you split its types, styles and hook into a folder, reading it takes five tabs.

Bad: A folder (5 files, 4 imports)

```text
routes/profile/
  user-profile/
    index.tsx
    user-profile.tsx
    types.ts
    styles.ts
    hooks.ts
```

Good: One file (1 file, 0 imports)

```text
routes/profile/
  user-profile.tsx        type Profile, const styles, function useProfile(), UserProfile
```

## Give state its own component

Extract code used once only when it has its own state. In a child, a keystroke re-renders the child, not the page and its 500 rows.

Bad: In the page (501 renders per key)

```tsx
function OrderPage() {
  const [query, setQuery] = useState(""); // each keystroke re-renders OrderPage and OrderList
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <OrderList /> {/* 500 rows */}
    </>
  );
}
```

Good: In a child (1 render per key)

```tsx
function SearchInput({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState(""); // only SearchInput re-renders
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(query);
      }}
    >
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
    </form>
  );
}

function OrderPage() {
  return (
    <>
      <SearchInput onSearch={search} />
      <OrderList /> {/* 500 rows */}
    </>
  );
}
```

## Use the lowest common ancestor

When a second file needs it, move it up to the nearest folder both callers share. The path then names its owner.

Name folders for what they hold, like `routes/` or `controllers/`, not `features/`.

Bad: In hooks/ (2 hops each, owner unclear)

```text
src/
  hooks/
    use-cart.ts
  routes/shop/
    cart/summary.tsx          calls useCart()
    checkout/pay-button.tsx   calls useCart()
```

Good: In routes/shop/ (1 hop each, owner: shop)

```text
src/
  routes/shop/
    use-cart.ts
    cart/summary.tsx          calls useCart()
    checkout/pay-button.tsx   calls useCart()
```

## Give global code a type folder

Code used almost everywhere, like a button, belongs to no page. Give it a folder named for its type, and a suffix so `⌘P` finds it: `user.schema.ts`, `use-auth.hook.ts`, `dashboard.page.tsx`.

Bad: In settings/ (11 cross-imports)

```text
src/
  routes/
    settings/
      button.tsx
    checkout/, … 10 more pages               import ../settings/button
```

Good: In components/ (1 obvious home)

```text
src/
  components/
    button.tsx
  routes/
    settings/, checkout/, … 10 more pages    import components/button
```

## TL;DR

| Situation                  | Do this                               |
| -------------------------- | ------------------------------------- |
| Code used once             | Keep it inline                        |
| Code too long              | Extract a function, same file         |
| Reused in the same file    | Extract a function, same file         |
| Reused across files        | Move it to the lowest common ancestor |
| Used almost everywhere     | Use a type folder, like components/   |
| A child with its own state | Give it its own component             |
