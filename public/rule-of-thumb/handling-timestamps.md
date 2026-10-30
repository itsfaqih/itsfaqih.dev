# Handling Timestamps

Store and send UTC. Turn it local only on the reader's screen.

Convert picked times to UTC in the browser, return ISO strings ending in Z, and filter by the user's own day as a UTC range.

The examples use Rina in Jakarta (UTC+7) and Sam in New York (UTC−5), who order at the same moment, `2026-01-10T06:00:00.000Z`.

## Store the moment in UTC

Rina and Sam order in the same second. A column with no offset stores each writer's local time, so one moment becomes two values. Store UTC to keep it one. UTC never shifts for daylight saving or politics, so it means the same moment everywhere. Store only the UTC moment, with no offset column next to it.

Bad (Local, no offset):

```text
orders.created_at, the writer's clock
id  by    created_at
41  Rina  2026-01-10 13:00:00
42  Sam   2026-01-10 01:00:00    one second, stored 12 h apart
```

Good (Store UTC):

```text
orders.created_at, UTC
id  by    created_at
41  Rina  2026-01-10 06:00:00
42  Sam   2026-01-10 06:00:00    one second, one value
```

## Return it with a Z

An ISO 8601 string without a `Z` has no zone, so each browser reads it as local time. Rina and Sam both see 6:00 AM, and both are wrong. End it with a `Z` so each browser converts it to its own zone.

Bad (No Z):

```json
{ "createdAt": "2026-01-10T06:00:00" }
```

Good (End with Z):

```json
{ "createdAt": "2026-01-10T06:00:00.000Z" }
```

In JavaScript, `date.toISOString()` produces this format.

## Turn it local in the browser

The server knows only its own time zone, so a time it formats is right only where it runs. Send UTC and let each browser format it with `toLocaleString()` or `Intl.DateTimeFormat`, which use the reader's zone.

Bad (Server time):

```ts
// the API, running in New York
createdAt.toLocaleString(); // "1/10/2026, 1:00:00 AM" for every reader, 12 h off for Rina
```

Good (Format in browser):

```ts
// in each reader's browser
const createdAt = "2026-01-10T06:00:00.000Z";
new Date(createdAt).toLocaleString(); // 1:00 PM for Rina, 1:00 AM for Sam
new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
  new Date(createdAt),
);
```

## Send the zone with the input

Rina sets a reminder for 7:00 AM. From `2026-01-01T07:00:00` the server can't tell whose 7:00 that is, so it reads it as UTC and the reminder fires 7 hours late. Send UTC with a `Z`, or the local time with its offset. Both name one moment.

Bad (No zone):

```ts
// POST /reminders body
const body = { at: "2026-01-01T07:00:00" }; // the server reads it as 07:00 UTC
```

Good (Send UTC or offset):

```ts
// in Rina's browser; a date-time string without a zone parses as local time
const at = new Date("2026-01-01T07:00").toISOString();
const body = { at }; // POST /reminders
// at: "2026-01-01T00:00:00.000Z", or send "2026-01-01T07:00:00+07:00"
```

## Filter by the user's day

Rina asks for her orders on Jan 10. Her day starts at midnight in Jakarta, 17:00 UTC the day before, so send that moment. If you send midnight with no zone, the query runs 07:00 to 07:00 her time, so orders before 07:00 go missing and the next morning's show up.

Bad (UTC midnight):

```ts
// GET /orders?from=2026-01-10T00:00:00&to=2026-01-11T00:00:00
```

Good (Use her midnight):

```ts
// in Rina's browser (UTC+7)
const from = new Date(2026, 0, 10); // her local midnight
const to = new Date(2026, 0, 11);
fetch(`/orders?from=${from.toISOString()}&to=${to.toISOString()}`);
// GET /orders?from=2026-01-09T17:00:00.000Z&to=2026-01-10T17:00:00.000Z
```

## TL;DR

| Situation                      | Do this                                         |
| ------------------------------ | ----------------------------------------------- |
| Saving a timestamp             | Store UTC, with no offset column                |
| Returning one from the API     | Return ISO 8601 ending in Z                     |
| Showing it to someone          | Format it in their browser                      |
| Sending a time the user picked | Convert to UTC, or keep its offset              |
| Filtering by a date            | Send the user's day as a UTC range              |
| Date math                      | Do the math on Date values, never on the string |
