# Data Loading

Fetch early, show what you have, and never blank the screen.

Start requests in the loader and keep stale data on screen. Show a skeleton only after 200ms. Design the wait, because people judge loading by what they see while it lasts.

## Start fetching early

Fetch in the route loader. A fetch in `useEffect` waits until the page's code loads and renders. A loader starts it with the navigation, so it runs while the code loads. Await what the page needs and stream the rest.

Bad (In useEffect):

```tsx
function Invoice({ id }: { id: string }) {
  const [invoice, setInvoice] = useState<Invoice>();
  useEffect(() => {
    fetchInvoice(id).then(setInvoice);
  }, [id]);
  // ...
}
```

Good (Fetch in the loader), with TanStack Router:

```tsx
export const Route = createFileRoute("/invoices/$id")({
  loader: async ({ params }) => {
    const invoice = await fetchInvoice(params.id); // the page needs it
    const activity = fetchActivity(params.id); // streamed: render it with <Await promise={activity}>
    return { invoice, activity };
  },
});
```

## Keep stale data on screen

When you refetch data you already have, show a small spinner beside it and swap the new value in place.

Bad (Blank):

```tsx
if (isFetching) return <Skeleton />;
```

Good (Keep it, then swap), with TanStack Query:

```tsx
const { data, isFetching } = useQuery({
  queryKey: ["revenue", range],
  queryFn: () => fetchRevenue(range),
  placeholderData: keepPreviousData,
});

// data stays on screen while the new value loads
<Card>
  {data && <Revenue value={data.total} />}
  {isFetching && <Spinner size="sm" />}
</Card>;
```

## Wait before the skeleton

Most replies are quick. Show loading UI only after 200ms, so a fast reply appears without a skeleton flash.

Bad (At once):

```tsx
if (isLoading) return <Skeleton />;
```

Good (Wait 200ms), with `spin-delay`:

```tsx
const showSkeleton = useSpinDelay(isLoading, { delay: 200 });
if (showSkeleton) return <Skeleton />;
if (isLoading) return null;
```

## Errors where the data was

Show the error where the data would go, with a Retry button. A toast fades before anyone reads it and leaves an empty card. Log every failure so you hear about it before your users do.

Bad (A toast):

```tsx
if (error) toast.error("Couldn't load the team");
```

Good (Show it inline, with Retry):

```tsx
// log in the query's error path too: Sentry.captureException(error)
if (error) {
  return (
    <Card role="alert">
      Couldn't load the team. <button onClick={() => refetch()}>Retry</button>
    </Card>
  );
}
```

## Parse at the boundary

API data is a guess until you check it. Parse it right after `fetch()` and give optional fields a fallback, so the rest of your code gets real types. If you skip it, a missing field crashes far from where it came in.

When a required field fails, show a plain message and log the details. Update the schema when the API changes. It documents the API too.

Bad (Trust it):

```ts
const user = (await res.json()) as User; // { "id": 1, "name": "Alice" } has no city
user.city.toUpperCase(); // TypeError, far from the fetch
```

Good (Parse it), with Zod:

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  city: z.string().catch("Unknown"), // optional: falls back when missing or invalid
});

const result = UserSchema.safeParse(await res.json());
if (!result.success) {
  Sentry.captureException(result.error); // log the details, show a plain message
  throw new Error("Couldn't load this profile");
}
const user = result.data; // { id: 1, name: "Alice", city: "Unknown" }
```

## Persist what can't mislead

A disk cache is already old when the app next opens. Persist history, settings and static content, and show when it was updated. Never persist balances, prices or stock counts. A stale number there leads to a wrong decision.

Pick the store by size and access:

- `localStorage`: about 5MB, synchronous, strings only.
- `IndexedDB`: large, asynchronous.
- PGlite: SQL in the browser, with sync to a server database.

## TL;DR

| Situation                  | Do this                                                 |
| -------------------------- | ------------------------------------------------------- |
| SEO or first paint matters | Render it on the server. Behind a login, an SPA is fine |
| Data a route needs         | Start it in the loader, batch it, stream the rest       |
| Refetching data you have   | Keep it on screen with a small spinner                  |
| A reply that may be quick  | Show loading UI only after 200ms                        |
| A request that fails       | Show the error in place, with Retry. Log it             |
| Updates within a second    | Use a WebSocket. At 30s or slower, poll                 |
| Anything from an API       | Parse it where it arrives                               |
