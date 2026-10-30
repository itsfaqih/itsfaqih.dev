# Table Design

Line up what people compare, and never leave a table blank.

Right-align numbers, pin actions to a fixed last column, and give every blank a next step. People scan a table for one value, so make each column easy to run an eye down.

## Right-align numbers

People compare numbers by their last digits. Right-align every numeric column and set `font-variant-numeric: tabular-nums` (Tailwind: `tabular-nums`) so every digit is the same width. Format with `toLocaleString()` and fixed fraction digits, so `12500` reads `12,500.00`. In a finance view, set money in a monospace face.

Keep the raw numbers in state and sort on them. Format only when you draw the cell. If you format in the API, `b.mrr - a.mrr` is `NaN` and the sort breaks. If you sort on the formatted text, `"9,000.00"` ranks above `"12,500.00"`.

Bad (As typed):

```tsx
<td>{row.mrr}</td>
```

Good (Align right, tabular):

```tsx
const sorted = rows.toSorted((a, b) => b.mrr - a.mrr);

<td className="text-right tabular-nums">
  {row.mrr.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
</td>;
```

## Give every state a next step

A table is often loading, empty, failed or showing no matches. Draw each one. Use skeleton rows at the real row height to keep the shape while it loads, and say why and what to do next in every blank:

- **Loading**: skeleton rows, with no spinner in their place.
- **Empty**: "No users yet" and an Add user button.
- **Error**: "Couldn't load users" and a Retry button. If you offer Add user here, it hides the failure.
- **No results**: `No results for "xyz"` and a Clear search button.

Bad (Blank):

```tsx
<td colSpan={2}>{loading ? <Spinner /> : "No data"}</td>
```

Good (Say what's next):

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

Give the column a fixed width and right-align it, so Edit sits in the same place on every row. Keep the buttons visible on every row. If they appear only on hover, they stay hidden until the pointer finds them, and Edit lands at a new x-position after each name. Use icon buttons to save room, and name each one with a tooltip and an `aria-label`.

Bad (Hover only):

```tsx
<td>
  {user.name}
  <span className="opacity-0 group-hover:opacity-100">
    <button>Edit</button>
    <button>Delete</button>
  </span>
</td>
```

Good (Last column):

```tsx
<td className="w-[76px] text-right">
  <Tooltip content="Edit">
    <button aria-label="Edit">
      <PencilIcon />
    </button>
  </Tooltip>
  <Tooltip content="Delete">
    <button aria-label="Delete">
      <TrashIcon />
    </button>
  </Tooltip>
</td>
```

## Skip the pager for one page

With one page, a pager is a row of dead arrows. Under an empty table, it reads "Page 1 of 0". Render the pager only when there are 2 or more pages.

Bad (Always there):

```tsx
<Pager page={page} total={totalPages} />
```

Good (Show for 2+ pages):

```tsx
{
  totalPages > 1 && <Pager page={page} total={totalPages} />;
}
```

## Keep the page in the URL

With `?page=2` in the address, a reload, the Back button and a shared link all land where you were. Read the page from the search params. If you keep it in component state, a reload drops you back on page 1 and a shared link opens plain `/users`.

Bad (In state):

```tsx
const [page, setPage] = useState(1);
```

Good (Keep in the URL):

```tsx
const [params, setParams] = useSearchParams();
const page = Number(params.get("page") ?? "1");
const goTo = (next: number) =>
  setParams((prev) => {
    prev.set("page", String(next));
    return prev;
  });
```

## TL;DR

| Situation                 | Do this                                                    |
| ------------------------- | ---------------------------------------------------------- |
| A column of numbers       | Right-align it, set tabular-nums, call toLocaleString()    |
| Money in a finance view   | Use a monospace face                                       |
| Rows still loading        | Draw skeleton rows at the real row height                  |
| Empty, failed or no match | Say which and give one next step: Add, Retry, Clear search |
| Row actions               | Put icon buttons with tooltips in a fixed last column      |
| One page, or none         | Skip the pager                                             |
| The current page          | Put it in the URL as ?page=2                               |
