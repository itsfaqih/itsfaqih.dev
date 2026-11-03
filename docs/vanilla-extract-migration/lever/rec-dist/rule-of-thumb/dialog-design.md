# Dialog Design

Hold focus in a dialog, let Escape close it, and keep what people typed.

## TL;DR

| Situation          | Do this                                                   |
| ------------------ | --------------------------------------------------------- |
| It opens           | Focus the first field, or Cancel if it destroys something |
| While it's open    | Cycle Tab inside. Keep the page behind inert and still    |
| Escape             | Close it, every time                                      |
| A click outside    | Close an info dialog. Shake or ask on a form with input   |
| It closes          | Return focus to the button that opened it                 |
| For screen readers | Mark it as a modal dialog. Name it by its title           |
| On a phone         | Use a bottom sheet that swipes down to close              |

## Keep focus inside

Trap focus in the dialog. Move focus in when it opens, let `Tab` cycle its controls, and make the page behind inert. On close, return focus to the button that opened it. A native `<dialog>` opened with `showModal()` does all of this.

```html
<button onclick="profile.showModal()">Edit profile</button>
<dialog id="profile">
  <input name="name" />
  <button onclick="profile.close()">Save</button>
</dialog>
```

## Let Escape close it

Close every dialog on `Esc`, every time, since keyboard users leave that way. Let a click outside close an info dialog too, as it has nothing to lose. A `<dialog>` opened with `showModal()` closes on `Esc` already. A custom dialog listens while it's open and removes the listener on close:

```ts
function onKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") close();
}
window.addEventListener("keydown", onKeyDown); // on open
window.removeEventListener("keydown", onKeyDown); // on close
```

## Focus the safe answer

Focus a form's first field so people can type at once. On a confirm that destroys something, focus Cancel, so a stray `Enter` backs out. Focus the destructive button only where speed matters more and the action can be undone.

```html
<dialog role="alertdialog" aria-labelledby="confirm-title">
  <h2 id="confirm-title">Delete Moonbase?</h2>
  <button autofocus>Cancel</button>
  <button>Delete</button>
</dialog>
```

## Ask before you drop a draft

Treat a click outside as a likely slip. Once a form has input, shake the dialog on that click and keep it open, and ask before `Esc` or × discards the draft.

```tsx
function requestClose(reason: "outside" | "escape" | "close-button") {
  if (!dirty) return close();
  if (reason === "outside") return shake();
  if (confirm("Discard your changes?")) close();
}
```

## Lock the page behind

Stop the page under the dialog from scrolling, so it stays still. Keep the scrollbar's space so nothing shifts when the scrollbar hides.

```css
html {
  scrollbar-gutter: stable;
}

body:has(dialog[open]) {
  overflow: hidden;
}
```

## Give it a name

Tell a screen reader that a dialog opened and what it's called. Mark it as a modal dialog, name it by its title and describe it by its text. A `<dialog>` opened with `showModal()` is modal already. On a custom one, set the roles yourself.

```html
<div role="dialog" aria-modal="true" aria-labelledby="edit-title" aria-describedby="edit-desc">
  <h2 id="edit-title">Edit profile</h2>
  <p id="edit-desc">Update your details below.</p>
</div>
```
