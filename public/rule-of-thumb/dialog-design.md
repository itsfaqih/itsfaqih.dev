# Dialog Design

Hold focus in a dialog, let Escape close it, and keep what people typed.

Trap Tab inside the dialog, lock the page behind it, and name it for screen readers.

## Keep focus inside

Move focus into the dialog when it opens. Let `Tab` cycle its controls and never reach the inert page behind. On close, return focus to the button that opened it.

Bad (Focus wanders):

```tsx
<button onClick={() => setOpen(true)}>Edit profile</button>;
{
  open && (
    <div className="dialog">
      <input name="name" />
      <button onClick={() => setOpen(false)}>Save</button>
    </div>
  );
}
```

Good (Hold focus):

```tsx
const dialog = useRef<HTMLDialogElement>(null);

// showModal() moves focus in, makes the page behind inert,
// and returns focus to the trigger on close()
<button onClick={() => dialog.current?.showModal()}>Edit profile</button>
<dialog ref={dialog}>
  <input name="name" />
  <button onClick={() => dialog.current?.close()}>Save</button>
</dialog>
```

## Let Escape close it

Close every dialog on `Esc`, every time, since keyboard users leave that way. Let a click outside close an info dialog too, as it has nothing to lose.

```tsx
useEffect(() => {
  if (!open) return;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") close();
  };
  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, [open]);
```

A native `<dialog>` opened with `showModal()` closes on `Esc` without this listener.

## Focus the safe answer

Focus a form's first field so people can type at once. Focus Cancel on a confirm that destroys something, so a stray `Enter` backs out.

Focus the destructive button only where speed matters more and the action can be undone.

Bad (Delete first):

```tsx
<AlertDialog.Title>Delete Moonbase?</AlertDialog.Title>
<button>Cancel</button>
<button autoFocus>Delete</button>
```

Good (Focus Cancel):

```tsx
<AlertDialog.Title>Delete Moonbase?</AlertDialog.Title>
<button autoFocus>Cancel</button>
<button>Delete</button>
```

## Ask before you drop a draft

A click outside is often a slip. Once a form has input, shake the dialog on that click instead of closing it, and ask before `Esc` or × discards the draft.

```tsx
function requestClose(reason: "outside" | "escape" | "close-button") {
  if (!dirty) return close();
  if (reason === "outside") return shake();
  if (confirm("Discard your changes?")) close();
}
```

## Lock the page behind

Set `overflow: hidden` on the body so the page under the dialog stays still. Add `scrollbar-gutter: stable` so nothing shifts when the scrollbar hides.

```css
html {
  scrollbar-gutter: stable;
}

body:has(dialog[open]) {
  overflow: hidden;
}
```

## Give it a name

Tell a screen reader that a dialog opened and what it's called. Give it `role="dialog"`, point `aria-labelledby` at the title and `aria-describedby` at the text. On a real page add `aria-modal="true"`, or use `<dialog>` with `showModal()`.

Bad (A plain div):

```tsx
<div className="dialog">
  <h2>Edit profile</h2>
  <p>Update your details below.</p>
</div>
```

Good (Name the dialog):

```tsx
<div role="dialog" aria-modal="true" aria-labelledby="edit-title" aria-describedby="edit-desc">
  <h2 id="edit-title">Edit profile</h2>
  <p id="edit-desc">Update your details below.</p>
</div>
```

## TL;DR

| Situation       | Do this                                                   |
| --------------- | --------------------------------------------------------- |
| It opens        | Focus the first field, or Cancel if it destroys something |
| While it's open | Cycle Tab inside. Keep the page behind inert and still    |
| Escape          | Close it, every time                                      |
| A click outside | Close an info dialog. Shake or ask on a form with input   |
| It closes       | Return focus to the button that opened it                 |
| The markup      | Add role="dialog" and aria-modal. Label it by its title   |
| On a phone      | Use a bottom sheet that swipes down to close              |
