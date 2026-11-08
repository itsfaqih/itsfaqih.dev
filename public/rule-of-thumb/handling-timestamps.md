---
name: handling-timestamps
description: Store and send UTC. Turn it local only on the reader's screen. Use when you store, send, show or filter by a date and time.
---

# Handling Timestamps

Store and send UTC. Turn it local only on the reader's screen.

The examples follow Rina in Jakarta (UTC+7) and Sam in New York (UTC−5), who order at the same moment, `2026-01-10T06:00:00.000Z`.

## TL;DR

| Situation                      | Do this                                          |
| ------------------------------ | ------------------------------------------------ |
| Saving a timestamp             | Store UTC, with no offset column                 |
| Returning one from the API     | Return ISO 8601 ending in Z                      |
| Showing it to someone          | Format it in their browser                       |
| Sending a time the user picked | Convert to UTC, or keep its offset               |
| Filtering by a date            | Send the user's day as a UTC range               |
| Date math                      | Do the math on parsed times, never on the string |

## Store the moment in UTC

Store every timestamp as a UTC instant, with no offset column beside it. UTC never shifts for daylight saving or politics, so one moment keeps one value. A naive column stores each writer's local clock, which puts Rina's and Sam's same-second orders 12 hours apart.

```text
orders.created_at, UTC
id  by    created_at
41  Rina  2026-01-10 06:00:00
42  Sam   2026-01-10 06:00:00    one second, one value
```

## Return it with a Z

End every ISO 8601 string with `Z`, so each browser converts it to its own zone. A browser reads a string with no zone as local time, so Rina and Sam both see 6:00 AM, and both are wrong.

```json
{ "createdAt": "2026-01-10T06:00:00.000Z" }
```

## Turn it local in the browser

Send UTC and let each browser format it with `toLocaleString()` or `Intl.DateTimeFormat`, which use the reader's zone. The server knows only its own zone, so a time it formats is right only where it runs.

```ts
// in each reader's browser
const createdAt = "2026-01-10T06:00:00.000Z";
new Date(createdAt).toLocaleString(); // 1:00 PM for Rina, 1:00 AM for Sam
new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
  new Date(createdAt),
);
```

## Send the zone with the input

When a user picks a time, send it as UTC with a `Z`, or as local time with its offset. Both name one moment. Rina sets a reminder for 7:00 AM. A bare `2026-01-01T07:00:00` reads as 07:00 UTC on the server, and the reminder fires 7 hours late.

```ts
// in Rina's browser; a date-time string with no zone parses as local time
const at = new Date("2026-01-01T07:00").toISOString();
const body = { at }; // POST /reminders
// at: "2026-01-01T00:00:00.000Z", or send "2026-01-01T07:00:00+07:00"
```

## Filter by the user's day

Send the user's day as a UTC range that starts at their local midnight. Rina's Jan 10 starts at 17:00 UTC on Jan 9. A bare midnight runs the query from 07:00 to 07:00 her time. Orders before 07:00 go missing, and the next morning's show up.

```ts
// in Rina's browser (UTC+7)
const from = new Date(2026, 0, 10); // her local midnight
const to = new Date(2026, 0, 11);
fetch(`/orders?from=${from.toISOString()}&to=${to.toISOString()}`);
// GET /orders?from=2026-01-09T17:00:00.000Z&to=2026-01-10T17:00:00.000Z
```
