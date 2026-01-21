# Table Design

Best practices for designing data tables. Clear, scannable, and user-friendly.

## Table States

Handle every possible state your table can be in.

1.  **Loading**: Use skeleton rows (not spinners) to maintain layout.
2.  **Empty**: "No users yet". Provide a clear CTA to create the first item.
3.  **Error**: "Failed to load". Offer a retry button.
4.  **Searching**: "No results for 'xyz'". Provide a clear way to clear the search.
5.  **Data**: The normal state.

## Pagination

Smart pagination ensures easy navigation.

-   **Hide when ≤1 page**: Reduces clutter.
-   **Hide when empty**: Unnecessary when there's no data.
-   **Use URL query params**: Store page state in the URL (`?page=2`) for shareable links and browser history support.

## Displaying Actions

Make actions predictable and easy to hit.

-   **Right-align Actions**: Place them in the last column.
-   **Fixed Width**: Give the actions column a fixed width (e.g., `w-32`) to prevent layout shifts.
-   **Icon Buttons**: Use icon-only buttons with tooltips for common actions (Edit, Delete) to save space.

## Displaying Numbers

Numeric data should be easy to scan and compare.

-   **Right-align Numbers**: Allows users to scan decimals vertically.
-   **Use Tabular Nums**: Apply `font-variant-numeric: tabular-nums` (Tailwind: `tabular-nums`) so digits have uniform width.
-   **Format with Locale**: Use `toLocaleString()` for thousand separators (e.g., `1,234.56`).
-   **Monospace Font**: Often helps with alignment in finance contexts.
