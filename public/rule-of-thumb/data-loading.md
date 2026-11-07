---
name: data-loading
description: Fetch early, show what you have, and never blank the screen. Use when a page or component fetches data, shows a loading state, refreshes stale data or shows a fetch error.
---

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
| Search as you type         | Send it 300ms after the last key. Cancel the old one         |
| A request that fails       | Show the error in place, with Retry. Log it                  |
| Updates within a second    | Push them over a live connection. At 30s or slower, poll     |
| Anything from an API       | Parse it where it arrives                                    |

## Render public pages on the server

Render a page that needs search traffic or a fast first paint on the server, so the first HTML response carries the content. A page rendered in the browser sends an empty shell and paints nothing until its code loads and fetches. Many crawlers and link previews read only that first response. A page behind a login never shows up in search, so the browser is fine there.

```html
<!-- Rendered in the browser. The first response has nothing to paint or index -->
<div id="root"></div>
<script src="/app.js"></script>

<!-- Rendered on the server. The first response carries the content -->
<h1>Desk lamp</h1>
<p>$48 · In stock</p>
<script src="/app.js"></script>
```

## Start fetching early

Fetch on navigation, not on render. A fetch that starts when the page renders waits for the page's code to load and render first, so the requests form a waterfall. Start every request the page needs as the user navigates, so they run while the code loads. Wait for what the page needs and stream the rest.

```ts
// runs when the user navigates to /invoices/:id, before the page renders
function onNavigate(id: string) {
  const invoice = fetchInvoice(id); // the page waits for this
  const activity = fetchActivity(id); // streamed, so the page shows it when it lands
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

## Avoid skeleton flickers

Most replies are quick. Show loading UI only after 200ms, so a fast reply appears with no skeleton flash.

```ts
const timer = setTimeout(() => (skeleton.hidden = false), 200);
const data = await request;
clearTimeout(timer);
skeleton.hidden = true;
```

## Debounce search input

A search box that sends a request on every keystroke floods the server, and a slow reply for an old query can land after the newest one. Wait for a pause in typing, then send one request, and cancel the one in flight when a new one starts.

```ts
let timer: ReturnType<typeof setTimeout> | undefined;
let inFlight: AbortController | undefined;

input.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    inFlight?.abort(); // an older reply can no longer land after this one
    const current = (inFlight = new AbortController());
    try {
      const response = await fetch(`/search?q=${encodeURIComponent(input.value)}`, {
        signal: current.signal,
      });
      showResults(await response.json());
    } catch (error) {
      if (!current.signal.aborted) throw error;
    }
  }, 300);
});
```

## Errors where the data was

Show the error where the data would go, with a Retry button. It stays there until someone acts on it, and it says why the card is empty. A toast fades before anyone reads it and leaves an empty card. Log every failure so you learn about it before a user reports it.

```html
<section role="alert">Couldn't load the team. <button>Retry</button></section>
```

## Parse at the boundary

Treat API data as a guess until you check it. Parse it as soon as it arrives and give optional fields a fallback. The rest of your code then gets real types, and a missing field fails where it came in. When a required field is missing, show a plain message and log the details.

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
