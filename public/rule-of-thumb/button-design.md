# Button Design

Make a button show what it does and what it's doing.

Style every state, hold the width while it works, and confirm anything destructive. Give each state, wait and refusal a visible change, so no press feels lost.

## Give every state a look

Give hover, press and focus a look. If nothing changes, a click feels like it missed and a keyboard user can't see where they are. Animate each change in 100 to 200ms, and draw the focus ring on `:focus-visible` so it shows for the keyboard only.

Bad (One look):

```css
button {
  transition: none;
}
button:focus-visible {
  outline: none;
}
```

Good (Four looks):

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

## Hold the width while it works

Stop taking clicks the moment it's pressed, say what it's doing, then say it worked. Stack the labels in one grid cell so the width holds. Show `cursor: wait` while the request runs, and return to the idle label after a second or so.

Bad (Swaps the label):

```tsx
<button onClick={save}>{pending ? "Saving…" : "Save"}</button>
```

Good (Stack the labels):

```tsx
<button
  type="button"
  className="save"
  data-phase={phase}
  aria-disabled={phase !== "idle" || undefined}
  onClick={() => phase === "idle" && save()}
>
  <span aria-hidden={phase !== "idle" || undefined}>Save</span>
  <span aria-hidden={phase !== "pending" || undefined}>
    <Spinner /> Saving…
  </span>
  <span aria-hidden={phase !== "done" || undefined}>
    <Check /> Saved
  </span>
</button>
```

```css
.save {
  display: inline-grid;
}
.save > span {
  grid-area: 1 / 1;
  display: inline-flex;
  gap: 8px;
  justify-content: center;
}
.save > span[aria-hidden] {
  visibility: hidden;
}
.save[data-phase="pending"] {
  cursor: wait;
}
```

## Say why it's off

A disabled button that only fades leaves people guessing. Show the no-entry cursor (`cursor: not-allowed`), keep the label readable, and put the reason in a tooltip. Use `aria-disabled="true"` in place of `disabled` so the button still takes hover and focus and can show its tooltip. Dim the text colour and leave `opacity` at 1.

Bad (Just faded):

```tsx
<button disabled={!title} style={{ opacity: 0.35 }}>
  Publish
</button>
```

Good (Say why):

```tsx
<button
  type="button"
  aria-disabled={!title || undefined}
  aria-describedby={title ? undefined : "publish-why"}
  onClick={() => title && publish()}
>
  Publish
</button>;
{
  !title && (
    <span role="tooltip" id="publish-why">
      Add a title first
    </span>
  );
}
```

## Fill one button per screen

Visual weight shows people the next step. Fill the main action in the brand colour, tint the supporting one, and leave Cancel as text. Keep red for destructive actions.

A tint is the brand colour at low strength, such as `background: color-mix(in srgb, var(--brand) 18%, transparent)`. A text button has `background: transparent` until hover.

Bad (All filled):

```html
<button class="filled">Cancel</button>
<button class="filled">Save draft</button>
<button class="filled red">Publish</button>
```

Good (Fill, tint, text):

```html
<button class="text">Cancel</button>
<button class="tinted">Save draft</button>
<button class="filled">Publish</button>
```

## Guard the destructive action

Never let one stray click delete anything. Tint the trigger red, then confirm with a filled red button that names what goes. Land focus on Cancel, the safe answer.

Bad (One click):

```tsx
<button className="filled red" onClick={deleteProject}>
  Delete project
</button>
```

Good (Confirm by name):

```tsx
<button className="tinted red" onClick={() => setConfirming(true)}>
  Delete project
</button>;
{
  confirming && (
    <div>
      <p>
        <b>Delete Moonbase?</b> Its 214 files go too. You can't undo this.
      </p>
      <button className="text" autoFocus onClick={() => setConfirming(false)}>
        Cancel
      </button>
      <button className="filled red" onClick={deleteProject}>
        Delete project
      </button>
    </div>
  );
}
```

## Pad the icon side less

Take 4px off the icon's side. An icon has white space inside its own box, so equal padding makes that side look wider.

Bad (Even padding):

```tsx
<button className="px-4"><Plus /> New project</button>
<button className="px-4">Continue <ArrowRight /></button>
```

Good (Optical padding):

```tsx
<button className="pl-3 pr-4"><Plus /> New project</button>
<button className="pl-4 pr-3">Continue <ArrowRight /></button>
```

## Fix the size of an icon-only button

With no label, padding sets the size, so the button comes out wider than it is tall and changes with every icon. Make it a fixed square as tall as its neighbours, and centre the icon. With no text to read, add an `aria-label` and a tooltip that shows on hover and on keyboard focus.

Bad (Sized by padding):

```tsx
<button className="h-9 px-4.5">
  <Gear />
</button>
```

Good (Fixed square):

```tsx
<button className="size-9 p-0 inline-grid place-items-center" aria-label="Settings">
  <Gear aria-hidden="true" />
</button>
<span role="tooltip">Settings</span>
```

## TL;DR

| Situation                | Do this                                                   |
| ------------------------ | --------------------------------------------------------- |
| Any button               | Give hover, press and focus a look, in 100 to 200ms       |
| Waiting on a request     | Stop clicks, keep the width, say Saving… then Saved       |
| Not available yet        | Set cursor: not-allowed and add a tooltip that says why   |
| Picking a variant        | Fill one per screen, tint the secondary, make Cancel text |
| It deletes something     | Make it red, behind a confirm that names what goes        |
| An icon beside the label | Take 4px off the icon's side                              |
| An icon with no label    | Make it a fixed square with an aria-label and a tooltip   |
