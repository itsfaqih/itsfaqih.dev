# Data Loading Strategies

Strategies for fast, reliable data fetching. Fast first paint, smooth updates.

## SSR vs SPA

Choose the right rendering strategy based on your requirements.

- **Server-Side Rendering (SSR)**: Use when SEO is critical, First Contentful Paint matters, or data is static.
- **Single Page App (SPA)**: Use for apps behind authentication, highly interactive dashboards, and real-time data.

**Best Practice**: Render important content on the server (SSR). Less critical data can be streamed or loaded client-side.

## Trigger Fetching Early

Start data fetching as soon as possible — don't wait for components to render.

- **Use Route Loaders**: Fetch data during navigation (e.g., TanStack Router loaders or React Router loaders).
- **Don't Block Render**: Await critical data, but defer non-critical data.
- **Batch Queries**: Group related queries to reduce round trips.

## Stale-While-Revalidate (SWR)

Show cached data immediately, then fetch fresh data in the background.

1.  **Show Stale Data**: Display cached content instantly for perceived performance.
2.  **Indicate Refetch**: Show a subtle spinner while background fetching occurs.
3.  **Smooth Updates**: Update the UI without jarring layout shifts when fresh data arrives.

## Spin Delay

Prevent flickering skeletons for fast responses.

- **Wait before showing skeleton**: Only show loading UI if the request takes longer than ~200ms.
- **Avoid Flicker**: A skeleton that flashes for 50ms is annoying.

## Error Handling

Show errors inline, not as toasts. Make them recoverable.

- **Inline Errors**: Place error messages where the data would have appeared.
- **Retry Button**: Always offer a way to retry the failed request.
- **Observability**: Log errors to monitoring services.

## Realtime Data

- **WebSocket**: Use for instant (<1s), high-frequency updates (chat, stock tickers). Persistant connection.
- **Interval Polling**: Use for updates every 30s+. Simpler infrastructure (HTTP).

## Cache Persistence

Not all data should be persisted to local storage.

- **Don't Persist**: Bank balances, stock prices, inventory counts (stale data leads to bad decisions).
- **OK to Persist**: Transaction history, user preferences, static content.
- **Best Practice**: Always show a "Last updated" timestamp when displaying persisted/cached data.

### Persistence Methods

Choose the right storage mechanism based on your needs:

#### LocalStorage (~5MB limit)

Simple key-value storage. Best for small, string-based data.

- Synchronous API — can block main thread
- Only stores strings (requires JSON.stringify)
- Good for: user preferences, tokens, small cache

#### IndexedDB (No practical limit)

Full database in the browser. Best for structured, large datasets.

- Asynchronous API — doesn't block UI
- Supports indexes, transactions, and cursors
- Good for: offline-first apps, large cache, complex queries

#### Embedded Database (ElectricSQL, Turso, PGlite, etc.)

Full SQL database running in the browser with sync capabilities.

- Real SQL queries (SQLite-based)
- Automatic sync with remote database
- Good for: offline-first apps, local-first architecture, complex data

## Parsing Data from External Source

When retrieving data from external sources (HTTP APIs, databases, third-party services), always parse and validate it to ensure correctness.

### Why Parse External Data?

- **Without Parsing**: Runtime crashes from `undefined` values, type mismatches (`"42"` instead of `42`), silent failures.
- **With Parsing**: Early error detection, full TypeScript type safety after parsing, graceful error handling with fallbacks.

### Best Practices

- **Parse at the boundary**: Validate data immediately after `fetch()` or database query. Don't let invalid data propagate.
- **Use fallback values**: For optional fields, provide sensible defaults (e.g., `role: 'User'`).
- **Show meaningful errors**: Display user-friendly messages when parsing fails. Log technical details to observability tools.
- **Keep schemas in sync**: Update validation schemas when your API changes. They serve as living documentation.

### Tools

Use **Zod** or similar libraries to handle missing data gracefully using `.catch()`:

#### 1. The Scenario

The API response is missing a required field (`city`), but we don't want to crash.

```json
// Raw API Response
{
  "id": 1,
  "name": "Alice"
}
```

#### 2. The Solution

Use `.catch()` to provide a fallback value when a field is missing or invalid.

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  // Fallback to "Unknown" if missing
  city: z.string().catch("Unknown"),
});

const user = UserSchema.parse(response);
```

#### 3. The Result

The data is now safe to use in your application.

```json
{
  "id": 1,
  "name": "Alice",
  "city": "Unknown" // ✅ Safe fallback applied
}
```
