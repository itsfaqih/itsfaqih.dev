# 001 — Repair the responsive dialog transition

- **Status**: DONE
- **Commit**: ed2b8c8
- **Severity**: HIGH
- **Category**: Easing & duration / Performance
- **Estimated scope**: 2 files, approximately 20 lines

## Problem

The desktop branch of `ResponsiveDialog` intends to animate the popup from
`scale-95`/transparent to `scale-100`/opaque, but the popup has a duration and
no transition property. The state change therefore jumps instead of animating.
The backdrop also uses `transition-all`, which can animate unrelated properties
and violates the repository's transform/opacity-only motion rule.

The cited code is in `src/routes/rule-of-thumb/-components/responsive-dialog.tsx:67-75`:

```tsx
<Dialog.Backdrop
  className={cx(
    "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-all duration-200 opacity-0 data-[state=open]:opacity-100",
  )}
/>
<Dialog.Popup
  className={cx(
    "fixed left-[50%] top-[50%] z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-background p-6 shadow-lg duration-200 opacity-0 scale-95 data-[state=open]:opacity-100 data-[state=open]:scale-100 rounded-xl outline-none",
  )}
>
```

The current root motion declarations in `src/styles.css:3-9` contain font and
animation variables but no shared easing token:

```css
:root {
  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;

  --animate-fade-in: fade-in 0.4s ease-out forwards;
  --animate-ripple: ripple 0.6s ease-out forwards;
}
```

## Target

Add the shared strong ease-out token from the audit playbook to
`src/styles.css`:

```css
:root {
  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;

  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);

  --animate-fade-in: fade-in 0.4s ease-out forwards;
  --animate-ripple: ripple 0.6s ease-out forwards;
}
```

Give the two surfaces named motion hooks and replace the broad transition:

```tsx
<Dialog.Backdrop
  className={cx(
    "responsive-dialog-backdrop fixed inset-0 z-50 bg-black/40 backdrop-blur-sm opacity-0 data-[state=open]:opacity-100",
  )}
/>
<Dialog.Popup
  className={cx(
    "responsive-dialog-popup fixed left-[50%] top-[50%] z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border border-border bg-background p-6 shadow-lg opacity-0 scale-95 data-[state=open]:opacity-100 data-[state=open]:scale-100 rounded-xl outline-none",
  )}
>
```

Add these rules to `src/styles.css` after the root variables. The popup uses
only `scale` and `opacity`; the backdrop uses only `opacity`:

```css
.responsive-dialog-backdrop {
  transition: opacity 200ms var(--ease-out);
}

.responsive-dialog-popup {
  transition:
    scale 200ms var(--ease-out),
    opacity 200ms var(--ease-out);
}

@media (prefers-reduced-motion: reduce) {
  .responsive-dialog-backdrop {
    transition-duration: 150ms;
  }

  .responsive-dialog-popup {
    transition: opacity 200ms var(--ease-out);
    scale: 1;
  }
}
```

The normal desktop dialog therefore enters/exits within 200ms using the strong
`cubic-bezier(0.23, 1, 0.32, 1)` ease-out. Reduced motion keeps the opacity
feedback but removes the scale movement.

## Repo conventions to follow

- Global theme and motion declarations belong in `src/styles.css`.
- `src/components/command-palette-view.tsx:37-38` already separates backdrop
  and popup motion and uses different durations for each surface.
- `src/styles.css:11-19` already uses an ease-out entrance for page content.
- The audit playbook requires UI motion to stay under 300ms and to animate
  `transform` and `opacity` rather than `transition: all`.

## Steps

1. In `src/styles.css`, add exactly `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);` to the existing `:root` block. Do not rename or alter the existing animation variables.
2. In `src/routes/rule-of-thumb/-components/responsive-dialog.tsx`, add `responsive-dialog-backdrop` to the `Dialog.Backdrop` class list and remove `transition-all duration-200` from that list.
3. In the same file, add `responsive-dialog-popup` to the `Dialog.Popup` class list and remove the standalone `duration-200`; keep the existing positioning, `opacity-0`, `scale-95`, and `data-[state=open]` state classes unchanged.
4. Add the exact `.responsive-dialog-backdrop`, `.responsive-dialog-popup`, and reduced-motion rules from the Target section to `src/styles.css`.
5. Do not change the mobile `Drawer` branch, dialog markup, focus behavior, children, or open-state logic.

## Boundaries

- Do **not** touch `src/components/command-palette-view.tsx`; its animation is a separate, already-working interaction.
- Do **not** change the dialog's size, position, backdrop color, border, shadow, or focus management.
- Do **not** add a dependency, formatter, animation library, or JavaScript animation loop.
- If the cited popup class no longer contains the `opacity-0 scale-95` and `data-[state=open]` pairs, stop and report source drift instead of improvising.
- Preserve the existing CRLF convention in the TSX file if the executor edits it.

## Verification

- **Mechanical**: Run `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` from `/Users/itsfaqih/itsfaqih.dev`. Each must exit 0. Run `git -c core.whitespace=cr-at-eol diff --check` after the edit.
- **Feel check**: Run the site with `npm run dev --host 127.0.0.1 --port 4174`, open `/rule-of-thumb/dialog-design`, and trigger the interactive dialog on a desktop-width viewport.
  - Confirm the backdrop fades in/out without changing unrelated properties.
  - Confirm the centered popup scales from `0.95` to `1` and fades within 200ms; it must not slide from the top or bottom.
  - Close and reopen repeatedly while the transition is running; the CSS transition must retarget from the current state rather than restart from a keyframe.
  - In DevTools, inspect computed styles and confirm the popup transition lists only `scale` and `opacity`, both using `200ms cubic-bezier(0.23, 1, 0.32, 1)`.
  - Toggle `prefers-reduced-motion: reduce` and confirm the popup stays at its centered full scale while opacity still transitions.
- **Done when**: The popup visibly animates instead of jumping, the backdrop no longer uses `transition-all`, reduced motion removes scale movement but preserves opacity feedback, and all mechanical checks pass.
