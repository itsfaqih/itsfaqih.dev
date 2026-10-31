# Button Design

Make a button show what it does and what it's doing.

## TL;DR

| Situation                | Do this                                                      |
| ------------------------ | ------------------------------------------------------------ |
| Any button               | Give hover, press and focus a look, in 100 to 200ms          |
| Not available yet        | Show the no-entry cursor and a tooltip that says why         |
| Picking a variant        | Fill one per screen, tint the secondary, make Cancel text    |
| It deletes something     | Make it red, then confirm by name, hold, or offer Undo       |
| An icon beside the label | Take 4px off the icon's side                                 |
| An icon with no label    | Make it a fixed square with an accessible name and a tooltip |

## Give every state a look

Give hover, press and focus each a visible change, so a click lands where people can see it and a keyboard user can see where they are. Animate each change in 100 to 200ms. Draw the focus ring on `:focus-visible`, so it shows for the keyboard only.

```css
button {
  transition:
    transform 150ms ease-out,
    background-color 150ms ease,
    box-shadow 150ms ease;
}
button:hover {
  background-color: var(--button-hover);
}
button:active {
  transform: translateY(2px) scale(0.97);
}
button:focus-visible {
  outline: 3px solid var(--focus);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  button:active {
    transform: none;
  }
}
```

## Say why it's off

A button that only fades leaves people guessing, most of all when the form looks done and the cause sits off screen, such as a URL an older post already uses. Show the no-entry cursor, keep the label readable, and put the reason in a tooltip. Mark it disabled for assistive tech while it still takes hover and focus, so it can show its tooltip. Dim the text colour and keep it fully opaque.

```html
<button type="button" aria-disabled="true" aria-describedby="publish-why">Publish</button>
<span role="tooltip" id="publish-why">That URL is taken</span>
```

```css
button[aria-disabled="true"] {
  cursor: not-allowed;
  color: var(--text-dim);
}
```

The click handler checks the state itself, since `aria-disabled` blocks nothing.

## Fill one button per screen

Visual weight shows people the next step. Fill the main action in the brand colour, tint the supporting one, and leave Cancel as text. Save red for destructive actions.

A tint is the brand colour at low strength, such as `color-mix(in srgb, var(--brand) 18%, transparent)`. A text button stays transparent until hover.

```html
<button class="text">Cancel</button>
<button class="tinted">Save draft</button>
<button class="filled">Publish</button>
```

## Guard the destructive action

Put a guard between every delete and the click that starts it. Pick one: a confirm with a red button that names what goes, a button people hold down, or an instant delete with Undo. A confirm lands focus on Cancel, the safe answer. A hold fills the button as it counts down and stops on release. Undo keeps the data until its window closes.

Confirm by name:

```html
<div role="alertdialog" aria-labelledby="confirm-title">
  <p><b id="confirm-title">Delete Moonbase?</b> Its 214 files go too. You can't undo this.</p>
  <button class="text" autofocus>Cancel</button>
  <button class="filled red">Delete project</button>
</div>
```

Hold to delete:

```ts
let timer = 0;
const start = () => (timer = setTimeout(deleteProject, 1200));
const stop = () => clearTimeout(timer);

button.addEventListener("pointerdown", start);
button.addEventListener("pointerup", stop);
button.addEventListener("pointercancel", stop);
button.addEventListener(
  "keydown",
  (e) => (e.key === " " || e.key === "Enter") && !e.repeat && start(),
);
button.addEventListener("keyup", stop);
```

Undo after:

```ts
function remove() {
  hideProject();
  const commit = setTimeout(deleteProject, 5000);
  toast("Moonbase deleted", {
    action: { label: "Undo", onClick: () => (clearTimeout(commit), showProject()) },
  });
}
```

## Pad the icon side less

Take 4px off the icon's side. An icon carries white space inside its own box, so equal padding makes that side look wider.

```css
.icon-start {
  padding-inline: 12px 16px; /* + New project */
}
.icon-end {
  padding-inline: 16px 12px; /* Continue → */
}
```

## Fix the size of an icon-only button

With no label, padding sets the size, so the button misses its neighbours' height and changes with every icon. Make it a fixed square as tall as its neighbours, and centre the icon. With no text to read, give it an accessible name, and add a tooltip that shows on hover and on keyboard focus.

```html
<button class="icon-only" aria-label="Settings"><svg aria-hidden="true">…</svg></button>
<span role="tooltip">Settings</span>
```

```css
.icon-only {
  inline-size: 36px;
  block-size: 36px;
  padding: 0;
  display: inline-grid;
  place-items: center;
}
```
