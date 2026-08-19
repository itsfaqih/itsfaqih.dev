# Animation Plans

These plans were derived from the animation verdict for the personal website.
They were written against commit `ed2b8c8`; the repository already contained
substantial user-owned modified and untracked work when the plans were created.
Only files under `plans/` were created by this planning pass.

## Plan index

| # | Plan | Severity | Status | Depends on |
|---|---|---|---|---|
| 001 | [Repair the responsive dialog transition](001-repair-responsive-dialog-transition.md) | HIGH | DONE | — |
| 002 | [Animate the proximity tree collapse](002-animate-proximity-tree-collapse.md) | MEDIUM | DONE | 001 |
| 003 | [Animate the guideline category popup](003-animate-guideline-category-popup.md) | MEDIUM | DONE | 001 |

## Recommended execution order

1. **001 — Responsive dialog**: fixes the highest-leverage no-op transition and establishes the shared `--ease-out` token.
2. **002 — Proximity tree**: uses the shared token to make the recursive expand/collapse reversible and readable.
3. **003 — Category popup**: uses the same token and adds trigger-relative motion to the Base UI combobox surface.

Plans 002 and 003 depend on Plan 001 because both use:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
```

If Plan 001 is not executed first, the executor for either dependent plan must
stop rather than introduce a duplicate easing value.

## Shared quality bar

- UI motion stays below 300ms: 200ms for the dialog/tree and 150ms for the popup.
- Predetermined motion uses CSS transitions, not JavaScript animation loops or restartable keyframes.
- Motion is limited to scale/transform, opacity, and the minimum grid-row transition required to reveal a collapsible tree.
- `prefers-reduced-motion: reduce` preserves a small opacity cue while removing scale, caret, and spatial movement.
- No plan changes source behavior, data, content, dependencies, routing, or focus semantics beyond the explicit tree visibility check in Plan 002.
- Every plan includes mechanical checks and a manual feel check; a passing build alone is not sufficient.
