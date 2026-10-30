# Null vs Undefined

Use undefined for a value nobody gave, and null for one emptied on purpose.

Send `null` to clear a field. Leave a field out to keep it.

## Tell missing from empty

Read `undefined` to mean nobody gave a value. Read `null` to mean someone checked and found nothing. Ana skipped the phone question. Bo said he has no phone. If you send both as `null`, no code can tell them apart.

Bad (Both null):

```ts
const ask = (u: User) => u.phone === null;
ask({ name: "Ana", phone: null }); // true
ask({ name: "Bo", phone: null }); // true: Bo gets asked for a phone he does not have
```

Good (Keep them apart):

```ts
const ask = (u: User) => u.phone === undefined;
ask({ name: "Ana" }); // true
ask({ name: "Bo", phone: null }); // false
```

## Mark optional with ?:

Leave a skipped value `undefined`. If you type it with `?:`, callers can leave it out. If you type it `| null`, callers with no value must pass `null`.

Bad (string | null):

```ts
function welcome(name: string | null) {
  return `Hi, ${name ?? "guest"}`;
}
welcome(); // TS2554: Expected 1 argument
welcome(null); // "Hi, guest"
```

Good (name?: string):

```ts
function welcome(name?: string) {
  return `Hi, ${name ?? "guest"}`;
}
welcome(); // "Hi, guest"
welcome("Ana"); // "Hi, Ana"
```

## Clear with null

When the user empties a field, send `null`. JSON drops keys set to `undefined`, so that clear never reaches the server.

Bad (= undefined):

```ts
changes.reviewer = undefined;
patch("/tasks/12", changes); // body: {}, the reviewer stays
```

Good (= null):

```ts
changes.reviewer = null;
patch("/tasks/12", changes); // body: { "reviewer": null }, the reviewer is removed
```

## Leave untouched fields out

A PATCH changes only the fields it carries. If you fill a draft with `null`, every untouched field goes out as a clear. Start it empty so only the changes go out.

Bad (Every field):

```ts
const draft = { title: input.value, assignee: null, due: null };
patch("/tasks/12", draft); // wipes assignee and due
```

Good (Only changes):

```ts
const draft: Partial<Task> = {};
draft.title = input.value;
patch("/tasks/12", draft); // body: { "title": "Ship v2" }
```

## Force the decision

`?:` lets a caller skip a field silently. When every caller must decide, make it required and nullable. A caller who leaves it out gets a type error, and "nobody" is a `null` someone wrote on purpose.

Bad (assignee?: User):

```ts
type Task = {
  title: string;
  assignee?: User;
};
save({ title }); // 0 errors; shows "Unassigned", and nobody chose it
```

Good (User | null):

```ts
type Task = {
  title: string;
  assignee: User | null;
};
save({ title }); // TS2741: Property 'assignee' is missing
save({ title, assignee: null }); // 0 errors
```

## Return null for not found

Return `null` from a lookup that finds nothing. `Map.get` returns `undefined`, and `JSON.stringify` turns that into no body.

Bad (res.json(user)):

```ts
const user = users.get(email); // undefined
res.json(user); // body: 0 bytes
// client: await r.json() throws SyntaxError: Unexpected end of JSON input
```

Good (user ?? null):

```ts
const user = users.get(email); // undefined
res.json(user ?? null); // body: null
// client: await r.json() returns null, so show "No such user"
```

## TL;DR

| Situation                        | Do this                     |
| -------------------------------- | --------------------------- |
| Declared, not assigned yet       | Leave it undefined          |
| An argument the caller may skip  | Type it name?: string       |
| The user cleared a field         | Set it to null              |
| A field the user didn't touch    | Leave it out of the request |
| A field every caller must decide | Type it T \| null, not ?:   |
| A lookup that found nothing      | Return null                 |
