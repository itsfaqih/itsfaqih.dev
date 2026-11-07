---
name: null-vs-undefined
description: Use undefined for a value nobody gave, and null for one emptied on purpose. Use when a field, parameter or API value can be missing or cleared, or a lookup can find nothing.
---

# Null vs Undefined

Use undefined for a value nobody gave, and null for one emptied on purpose.

## TL;DR

| Situation                        | Do this                     |
| -------------------------------- | --------------------------- |
| Declared, not assigned yet       | Leave it undefined          |
| An argument the caller may skip  | Type it name?: string       |
| The user cleared a field         | Set it to null              |
| A field the user didn't touch    | Leave it out of the request |
| A field every caller must decide | Type it T \| null, not ?:   |
| A lookup that found nothing      | Return null                 |

## Tell missing from empty

Read `undefined` as nobody gave a value, and `null` as someone checked and found nothing. Ana skipped the phone question, so her phone is `undefined`. Bo said he has no phone, so his is `null`. Kept apart, the two let code ask Ana again and leave Bo alone.

```ts
const ask = (u: User) => u.phone === undefined;
ask({ name: "Ana" }); // true
ask({ name: "Bo", phone: null }); // false
```

## Mark optional with ?:

Leave a skipped value `undefined`, and type it with `?:`, so callers can leave it out. A `| null` type makes every caller with no value pass `null`.

```ts
function welcome(name?: string) {
  return `Hi, ${name ?? "guest"}`;
}
welcome(); // "Hi, guest"
welcome("Ana"); // "Hi, Ana"
```

## Clear with null

When a caller clears a field, send `null`. JSON drops keys set to `undefined`, so only `null` carries the clear to the server.

```ts
changes.reviewer = null;
patch("/tasks/12", changes); // body: { "reviewer": null }, so the server removes the reviewer
```

## Leave untouched fields out

A PATCH changes only the fields it carries. Start the draft empty and add only what changed, so untouched fields keep their values.

```ts
const draft: Partial<Task> = {};
draft.title = title;
patch("/tasks/12", draft); // body: { "title": "Ship v2" }
```

## Force the decision

When every caller must decide, make the field required and nullable. A caller who leaves it out gets a type error, and "nobody" is a `null` someone wrote on purpose. A `?:` field lets a caller skip it with no error.

```ts
type Task = {
  title: string;
  assignee: User | null;
};
save({ title }); // TS2741: Property 'assignee' is missing
save({ title, assignee: null }); // 0 errors
```

## Return null for not found

Return `null` from a lookup that finds nothing. A forgotten return gives `undefined` too, and the caller reads it as "not found". Type the lookup to return `User | null` and the slip fails the build.

```ts
function findUser(email: string): User | null {
  const cached = cache.get(email);
  if (cached) return cached;
  users.find((u) => u.email === email); // TS2366: the return is missing
}
// Typed User | undefined, this compiles, and findUser("ana@x.io") gives undefined though Ana exists.
```

The fix returns the miss as `null`:

```ts
function findUser(email: string): User | null {
  const cached = cache.get(email);
  if (cached) return cached;
  return users.find((u) => u.email === email) ?? null;
}
```
