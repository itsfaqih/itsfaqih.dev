# Dialog Design Guidelines

Accessible, intuitive modal dialogs. Key focus text on **focus management**, **keyboard navigation**, and **data safety**.

## The Principles

1.  **Focus Trap**: Keep keyboard focus inside the modal. Tabbing should cycle through modal elements only.
2.  **Inert Background**: Make outside content non-interactive and visually dimmed.
3.  **Escape to Close**: Allow dismissal with the `Escape` key.
4.  **Smart Auto-Focus**: Automatically focus the first input or the primary action when opened.
5.  **No Data Loss**: Prevent accidental closing of forms on backdrop click.
6.  **Screen Readers**: Use proper ARIA roles (`role="dialog"`, `aria-modal="true"`) and labels.

## Focus Management

- **On Open**: Focus should move _into_ the dialog.
- **Focus Trap**: Users shouldn't be able to tab out of the dialog into the background page.
- **On Close**: Focus should return to the element that triggered the dialog.

## Closing Behavior

### Escape Key

Listen for the `keydown` event on the window. If `key === "Escape"`, close the dialog. This is a critical accessibility requirement for keyboard users.

### Backdrop Click

- **For Info/Alert Dialogs**: Clicking the backdrop _should_ close the dialog.
- **For Form/Input Dialogs**: Clicking the backdrop _should NOT_ close the dialog to prevent accidental data loss.

## Forms & Auto-Focus

### Input Forms

Focus the **first input field** so the user can start typing immediately.
Example: "Add Item" dialog -> Focus the "Name" input.

### Destructive Confirmations

Focus the **Cancel** button or the **Primary** action depending on safety.
Safe default: Focus "Cancel" to prevent accidental deletion if the user hits Enter.
Aggressive workflow: Focus "Delete" for speed (use with caution).

## Warning: Data Loss Prevention

If a user has entered data into a dialog (dirty state), do not close strictly on backdrop click.
Instead:

1.  Shake the dialog or pulse it to indicate it's modal.
2.  Or, show a second "Discard Changes?" confirmation dialog.

## Scroll Locking

When a dialog is open, the background page should **not scroll**.

- Set `overflow: hidden` on the `<body>`.
- Reserve space for the scrollbar to prevent layout shift (layout jumping).

## Mobile Responsiveness

On mobile devices, standard modal dialogs can be hard to reach and use.
**Pattern**: Use a **Bottom Sheet (Drawer)** on mobile viewports (typically `< 640px` or `< 768px`).

### Why?

- **Reachability**: Bottom sheets are closer to the thumb zone.
- **Context**: Users can still see some of the underlying content.
- **Gestures**: Users expect to swipe down to close.

### Implementation

We recommend using [Vaul](https://vaul.emilkowal.ski/) or similar drawer libraries that handle the gesture physics and accessibility automatically.

## Interactive Example

A proper implementation involves:

- `role="dialog"` and `aria-modal="true"`
- `aria-labelledby` pointing to the Title ID
- `aria-describedby` pointing to the Description ID

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Backdrop />
  <Dialog.Popup>
    <Dialog.Title>Edit Profile</Dialog.Title>
    <Dialog.Description>Update your details below.</Dialog.Description>
    {/* Content */}
    <Dialog.Close />
  </Dialog.Popup>
</Dialog>
```
