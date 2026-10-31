# Data Loading

Fetch early, show what you have, and never blank the screen.

People judge loading by what they see while it lasts, so design the wait.

## TL;DR

| Situation                  | Do this                                                      |
| -------------------------- | ------------------------------------------------------------ |
| SEO or first paint matters | Render it on the server. Behind a login, the browser is fine |
| Data a page needs          | Start it on navigation, batch it, stream the rest            |
| Refetching data you have   | Keep it on screen with a small spinner                       |
| A reply that may be quick  | Show loading UI only after 200ms                             |
| A request that fails       | Show the error in place, with Retry. Log it                  |
| Updates within a second    | Push them over a live connection. At 30s or slower, poll     |
| Anything from an API       | Parse it where it arrives                                    |

## Start fetching early

Fetch on navigation, not on render. A fetch that starts when the page renders waits for the page's code to load and render first, so the requests form a waterfall. Start every request the page needs as the user navigates, so they run while the code loads. Wait for what the page needs and stream the rest.

```ts
// runs when the user navigates to /invoices/:id, before the page renders
function onNavigate(id: string) {
  const invoice = fetchInvoice(id); // the page waits for this
  const activity = fetchActivity(id); // streamed: the page shows it when it lands
  return { invoice, activity };
}
```

## Keep stale data on screen

When you refetch data you already have, keep it on screen with a small spinner beside it, and swap the new value in place. Clearing it to a skeleton makes the page jump and hides numbers people were reading.

```ts
async function refetch() {
  spinner.hidden = false; // the old value stays on screen
  total.textContent = format(await fetchRevenue(range));
  spinner.hidden = true;
}
```

## Wait before the skeleton

Most replies are quick. Show loading UI only after 200ms, so a fast reply appears with no skeleton flash.

```ts
const timer = setTimeout(() => (skeleton.hidden = false), 200);
const data = await request;
clearTimeout(timer);
skeleton.hidden = true;
```

## Errors where the data was

Show the error where the data would go, with a Retry button. There it stays until someone acts on it, and the card explains its own gap. A toast fades before anyone reads it and leaves an empty card. Log every failure so you hear about it before your users do.

```html
<section role="alert">Couldn't load the team. <button>Retry</button></section>
```

## Parse at the boundary

Treat API data as a guess until you check it. Parse it as soon as it arrives and give optional fields a fallback, so the rest of your code gets real types and a missing field fails where it came in. When a required field is missing, show a plain message and log the details.

```ts
function parseUser(data: unknown): User {
  const raw = data as Record<string, unknown>;
  if (typeof raw.id !== "number" || typeof raw.name !== "string") {
    log("bad user payload", data);
    throw new Error("Couldn't load this profile");
  }
  const city = typeof raw.city === "string" ? raw.city : "Unknown"; // a missing city becomes "Unknown"
  return { id: raw.id, name: raw.name, city };
}

const user = parseUser(await response.json());
```

## Persist what can't mislead

A disk cache is already old when the app next opens. Persist history, settings and static content, and show when each was updated. Fetch balances, prices and stock counts live, since a stale number there leads to a wrong decision.
