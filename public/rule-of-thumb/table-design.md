# Table Design

Line up what people compare, and never leave a table blank.

People scan a table for one value, so make each column easy to run an eye down.

## TL;DR

| Situation                 | Do this                                                    |
| ------------------------- | ---------------------------------------------------------- |
| A column of numbers       | Right-align it, with tabular figures and separators        |
| Money in a finance view   | Use a monospace face                                       |
| Rows still loading        | Draw skeleton rows at the real row height                  |
| Empty, failed or no match | Say which and give one next step: Add, Retry, Clear search |
| Row actions               | Put icon buttons with tooltips in a fixed last column      |
| One page, or none         | Skip the pager                                             |
| The current page          | Put it in the URL as ?page=2                               |

## Right-align numbers

People compare numbers by their last digits. Right-align every numeric column and use tabular figures, so every digit is the same width. Add thousands separators and fixed fraction digits, so `12500` reads `12,500.00`. In a finance view, set money in a monospace face.

Keep raw numbers in state, sort on them, and format only when you draw the cell. A number formatted in the API turns `b.revenue - a.revenue` into `NaN`, and formatted text sorts `"9,000.00"` above `"12,500.00"`.

```css
td.number {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
```

```ts
const sorted = rows.toSorted((a, b) => b.revenue - a.revenue);
cell.textContent = row.revenue.toLocaleString("en-US", { minimumFractionDigits: 2 });
```

## Give every state a next step

A table is often loading, empty, failed or showing no matches. Draw each one, and in every blank state say why and what to do next:

- **Loading.** Skeleton rows at the real row height keep the table's shape.
- **Empty.** "No users yet" and an Add user button.
- **Error.** "Couldn't load users" and a Retry button alone, so the failure stays in view.
- **No results.** `No results for "xyz"` and a Clear search button.

```tsx
const blank = {
  empty: { title: "No users yet", hint: "Add your first teammate.", action: "Add user" },
  error: { title: "Couldn't load users", hint: "The server didn't answer.", action: "Retry" },
  none: {
    title: `No results for "${query}"`,
    hint: "Check the spelling, or clear the search.",
    action: "Clear search",
  },
}[state];
```

## Put actions in a fixed last column

Give the column a fixed width and right-align it, so Edit sits in the same place on every row. Show the buttons on every row at all times, so people find them at a glance. Use icon buttons to save room, and give each one an accessible name and a tooltip.

```html
<td class="actions">
  <button aria-label="Edit" title="Edit">✎</button>
  <button aria-label="Delete" title="Delete">🗑</button>
</td>
```

```css
td.actions {
  width: 76px;
  text-align: right;
}
```

## Skip the pager for one page

Render the pager only for 2 or more pages. With one page it is a row of dead arrows, and under an empty table it reads "Page 1 of 0".

## Keep the page in the URL

Read the page from the URL's query, as `?page=2`, so a reload, the Back button and a shared link all land where you were.

```ts
const url = new URL(location.href);
const page = Number(url.searchParams.get("page") ?? "1");

function goTo(next: number) {
  url.searchParams.set("page", String(next));
  history.pushState(null, "", url);
}
```
