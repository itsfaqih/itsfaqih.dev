# Button Design

Make a button show what it does and what it's doing.

## TL;DR

| Situation                  | Do this                                                      |
| -------------------------- | ------------------------------------------------------------ |
| Any button                 | Give hover, press and focus a look, in 100 to 200ms          |
| Hovering a disabled button | Keep its colour and drop still                               |
| Picking a variant          | Fill one per screen, tint the secondary, make Cancel text    |
| An icon beside the label   | Take 4px off the icon's side                                 |

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

## Keep a disabled button still on hover

A disabled button that lights up on hover says yes while its cursor says no, so people click and nothing happens. Keep its colour and its drop still on hover and press. Scope the hover and press looks to buttons that can act.

```css
button:hover:not(:disabled, [aria-disabled="true"]) {
  background-color: var(--button-hover);
}
button:active:not(:disabled, [aria-disabled="true"]) {
  transform: translateY(2px) scale(0.97);
}
```

## Fill one button per screen

Visual weight shows people the next step. Fill the main action in the brand colour, tint the supporting one, and leave Cancel as text. Save red for destructive actions.

A tint is the brand colour at low strength, such as `color-mix(in srgb, var(--brand) 18%, transparent)`. A text button stays transparent until hover.

```html
<button class="text">Cancel</button>
<button class="tinted">Save draft</button>
<button class="filled">Publish</button>
```

## Optical alignment over mathematical alignment

Take 4px off the icon's side. An icon carries white space inside its own box, so equal padding makes that side look wider.

```css
.icon-start {
  padding-inline: 12px 16px; /* + New project */
}
.icon-end {
  padding-inline: 16px 12px; /* Continue → */
}
```
