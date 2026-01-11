The fading tiles on the floor were misaligned because the background grid pattern (CSS gradients) and the tile positions (calculated via JavaScript) were using different reference points.

The tiles are positioned:
- Horizontally: Relative to the center of the screen (`left: 50%`).
- Vertically: Relative to the bottom of the container (`bottom: ...` for floor, `top: ...` for ceiling).

The background grid pattern, by default:
- Anchored to the **top-left** corner of the container.

This mismatch caused the tiles to float off the visual grid lines, especially when the window width or height wasn't perfectly aligned with the grid pattern's repetition.

The fix involved updating `src/styles.css` to explicitly align the background patterns to match the tile positioning logic:

```css
.grid-ceiling {
  /* ... */
  background-position: center top; /* Matches left: 50%, top: ... */
}

.grid-floor {
  /* ... */
  background-position: center bottom; /* Matches left: 50%, bottom: ... */
}
```

This ensures that the "center" of the grid pattern always aligns with the center of the screen, and the vertical start of the pattern aligns with the edge from which tiles are measured.
