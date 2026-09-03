# 003 — Animate the guideline category popup

- **Status**: DONE
- **Commit**: ed2b8c8
- **Severity**: MEDIUM
- **Category**: Physicality & origin / Missed opportunities
- **Estimated scope**: 2 files, approximately 20 lines

## Problem

The category filter uses Base UI's `Combobox.Popup`, but the popup has no
entry/exit motion or trigger-relative transform origin. It appears and
vanishes as a static rectangle, even though this is an occasional, spatially
connected surface.

The current code is in `src/routes/rule-of-thumb/index.tsx:136-160`:

```tsx
<Combobox.Portal>
  <Combobox.Positioner sideOffset={8} className={cx("z-50")}>
    <Combobox.Popup className={cx("rounded-xl border border-border backdrop-blur-xl shadow-lg overflow-hidden min-w-[200px] bg-white dark:bg-zinc-900")}>
      <Combobox.Empty>
        <div className={cx("text-center py-2 text-sm text-muted-foreground")}>
          No categories found.
        </div>
      </Combobox.Empty>
      <Combobox.List>
        <Combobox.Collection>
          {(item: CategoryItem) => (
            <Combobox.Item
              key={item.value}
              value={item}
              className={cx("flex items-center justify-between px-3 py-2 rounded-lg text-sm text-foreground cursor-pointer transition-colors data-highlighted:bg-background data-selected:bg-background")}
            >
              <span>{item.label}</span>
              <Combobox.ItemIndicator className={cx("size-4 flex items-center justify-center")}>
                <CheckIcon size={14} weight="bold" />
              </Combobox.ItemIndicator>
            </Combobox.Item>
          )}
        </Combobox.Collection>
      </Combobox.List>
    </Combobox.Popup>
  </Combobox.Positioner>
</Combobox.Portal>
```

## Target

Add a semantic motion class to the popup while leaving every item and filter
behavior unchanged:

```tsx
<Combobox.Popup
  className={cx(
    "guideline-category-popup rounded-xl border border-border backdrop-blur-xl shadow-lg overflow-hidden min-w-[200px] bg-white dark:bg-zinc-900",
  )}
>
```

Add the following to `src/styles.css`:

```css
.guideline-category-popup {
  transform-origin: var(--transform-origin, top center);
  transition:
    transform 150ms var(--ease-out),
    opacity 150ms var(--ease-out);
}

.guideline-category-popup[data-starting-style],
.guideline-category-popup[data-ending-style] {
  transform: scale(0.95);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .guideline-category-popup {
    transition: opacity 150ms var(--ease-out);
    transform-origin: top center;
  }

  .guideline-category-popup[data-starting-style],
  .guideline-category-popup[data-ending-style] {
    transform: none;
  }
}
```

Base UI supplies `--transform-origin` for trigger-anchored surfaces; the
`top center` fallback is only for environments where that variable is absent.
The popup scales from `0.95` to its settled size and fades over 150ms, which is
inside the dropdown budget. Reduced motion keeps the opacity bridge and removes
the scale movement.

## Repo conventions to follow

- `src/routes/rule-of-thumb/-components/index.tsx:120-126` already uses Base
  UI starting/ending styles for the Markdown menu:

  ```tsx
  "origin-top",
  "transition-[transform,opacity,scale] duration-150",
  "data-starting-style:scale-95 data-starting-style:opacity-0",
  "data-ending-style:scale-95 data-ending-style:opacity-0",
  ```

  The new popup should have the same 150ms scale/opacity behavior, expressed as
  named CSS rules so its `transform-origin` and reduced-motion behavior are
  explicit.
- Plan 001 introduces `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);` in
  `src/styles.css`; use that token rather than adding a second hand-typed curve.
- The audit playbook requires popovers to scale from their trigger and to use
  transform/opacity rather than layout properties.

## Steps

1. Confirm Plan 001 has added `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);` to `src/styles.css`. If the token is absent, stop and report the dependency drift.
2. In `src/routes/rule-of-thumb/index.tsx`, add `guideline-category-popup` to the `Combobox.Popup` class list. Preserve the popup's dimensions, colors, border, shadow, and children.
3. Add the exact `.guideline-category-popup`, starting/ending-style, and reduced-motion rules from the Target section to `src/styles.css`.
4. Do not add transitions to `Combobox.Item`; item highlight and selection feedback must remain immediate.

## Boundaries

- Do **not** change search filtering, category selection, `Combobox.Positioner`, `sideOffset={8}`, item order, or empty-state behavior.
- Do **not** animate `width`, `height`, `top`, `left`, or the contents of the list.
- Do **not** use `transition: all` or add a JavaScript animation state.
- Do **not** touch the existing Markdown `Menu.Popup`; it is the visual convention being reused.
- If the installed Base UI version does not emit `data-starting-style` / `data-ending-style` on `Combobox.Popup`, stop and inspect the installed API instead of guessing a replacement state selector.
- Preserve the existing CRLF convention in the TSX file if the executor edits it.

## Verification

- **Mechanical**: Run `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` from `/Users/itsfaqih/itsfaqih.dev`. Each must exit 0. Run `git -c core.whitespace=cr-at-eol diff --check` after the edit.
- **Feel check**: Run the site with `npm run dev --host 127.0.0.1 --port 4174`, open `/rule-of-thumb/`, and open the category filter several times.
  - Confirm the popup enters from the filter trigger's side with a subtle `scale(0.95)` to `scale(1)` and opacity transition over 150ms.
  - Confirm it exits using the same origin and does not jump toward the viewport center.
  - Open and close repeatedly during the transition; the CSS transition must retarget smoothly rather than replay a keyframe from zero.
  - In DevTools, inspect `transform-origin` and confirm it resolves to Base UI's `var(--transform-origin)` when available.
  - Confirm category item hover/selected feedback remains immediate and is not delayed by the popup transition.
  - Toggle `prefers-reduced-motion: reduce` and confirm the popup keeps a short opacity transition but does not scale.
- **Done when**: The popup has trigger-relative spatial motion, the list contents remain functionally unchanged, reduced motion removes scale movement, and all mechanical checks pass.
