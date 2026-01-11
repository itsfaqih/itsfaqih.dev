Update Background Gradient

I've added a vertical linear gradient to the `GridBackground` component. This complements the existing horizontal gradient, ensuring that the architectural grid pattern fades out in the center of the screen (both horizontally and vertically) to improve content readability.

### Changes Made
- Added a new `div` with `bg-linear-to-b from-transparent via-(--bg-primary) to-transparent opacity-80` to `src/components/grid-background.tsx`.

### Result
- The center of the viewport now has a stronger solid background overlay, making text and content much easier to read against the grid.
- The grid remains visible at the top, bottom, left, and right edges, maintaining the aesthetic.
- The gradient adapts to both light (white) and dark (black) modes automatically via `--bg-primary`.
