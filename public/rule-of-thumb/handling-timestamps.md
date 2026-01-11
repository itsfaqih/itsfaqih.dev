# Handling Timestamps

The timezone problem, solved simply. Store UTC, display local.

## The Timestamp Flow

A consistent approach that works across all timezones.

1.  **Store as UTC**: Always store timestamps in UTC in the database. No timezone offset.
2.  **API Returns UTC**: Backend returns ISO 8601 strings with Z suffix (e.g., `2026-01-10T06:00:00.000Z`).
3.  **Display Local**: Frontend converts UTC to user's local timezone.

## Displaying Timestamps

Use `Intl.DateTimeFormat` or `new Date()` which automatically handles conversion.

```tsx
const utcString = "2026-01-10T06:00:00.000Z";

// Browser automatically uses user's timezone!
const localString = new Date(utcString).toLocaleString();
```

## Filtering by Date

When users input a date filter, they think in their **local** timezone. You must convert it to UTC representing that moment before querying.

- User in Jakarta (UTC+7) selects `07:00 AM`.
- This equals `00:00 AM UTC`.
- Query the backend for records after `00:00 AM UTC`.

## Do's and Don'ts

- **Do**: Store all timestamps as UTC.
- **Do**: Return ISO 8601 strings (Z suffix).
- **Don't**: Store offsets in the DB if not needed.
- **Don't**: Convert to user's timezone on the backend.
