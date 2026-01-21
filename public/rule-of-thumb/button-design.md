# Button Design

The details that make buttons feel tangible and responsive. Don't settle for browser defaults.

## The Essential States

A well-designed button handles these five states seamlessly:

1.  **Idle State**: The default resting state. Clearly clickable with valid contrast. Use `cursor: default`.
2.  **Hover State**: Provides feedback when cursor is over the button. Signals interactivity.
3.  **Pressing State**: Visual feedback on press. Scale-down or click effect.
4.  **Loading State**: Shows progress while waiting. Prevents double-clicks. Use `cursor: wait`.
5.  **Disabled State**: Indicates unavailable action. Reduced opacity and no pointer events. Use `cursor: not-allowed`.
6.  **Cursor**: Use `cursor: default` for buttons (actions) and `cursor: pointer` for links (navigation).

## Disabled State UX

When a button is disabled, the cursor should immediately change to indicate the action is forbidden (`cursor: not-allowed`).
Consider adding a tooltip explaining *why* it is disabled.

## Code Implementation

A robust implementation handles all states in a unified component:

```tsx
<button
  disabled={isLoading || isDisabled}
  className={cn(
    // Base styles
    "px-6 py-3 rounded-xl font-medium transition-all",
    // Hover
    "hover:bg-zinc-500/5 hover:shadow-lg",
    // Active/Press
    "active:scale-95",
    // Loading/Disabled
    isLoading ? "cursor-wait" : isDisabled ? "cursor-not-allowed opacity-60" : "cursor-default"
  )}
>
  {isLoading ? <Loader2 className="animate-spin" /> : "Submit"}
</button>
```

## Button Variants

Different actions require different visual weights.

### Visual Hierarchy
-   **Primary**: Main call-to-action (e.g., "Save", "Submit").
-   **Secondary**: Standard actions (e.g., "Cancel", "Back").
-   **Ghost**: Low-priority or repetitive actions.

### Destructive Actions
-   **Destructive**: High-impact negative actions (e.g., "Delete Project"). Use Red sparingly.
-   **Ghost Destructive**: Lower priority negative actions (e.g., "Unsubscribe").

**Avoid Red for Primary Actions**: Reserve red for destructive actions only. Using red for a "Confirm" button creates cognitive friction.

## Icon Integration

### Leading Icons
Use for:
-   **Back/Return actions** (ArrowLeft)
-   **Confirmation actions** (Check)
-   **Add/Create actions** (Plus)
-   **Feature emphasis** (Sparkles)

*Padding tip*: Apply `pl-2 pr-3` for optical balance when using a leading icon.

### Trailing Icons
Use for:
-   **Forward/Next actions** ("Continue" -> ArrowRight)
-   **External links** (ArrowUpRight)
-   **Dropdown triggers** (ChevronDown)
-   **Download actions** (Download)

*Padding tip*: Apply `pl-3 pr-2` for optical balance.

### Icon-Only Buttons
Use for:
-   **Toolbars & action bars** (Settings)
-   **Repeated actions** (Delete, Edit)
-   **Mobile interfaces** (Search)

**Requirements**:
1.  **Tooltip** is mandatory to explain the action.
2.  **aria-label** is required for accessibility.
3.  **Square aspect ratio** (e.g., `size-8.5 p-0`).

## Best Practices

-   **Keep transitions snappy**: Use 100-200ms.
-   **Prevent double-clicks**: Disable during loading.
-   **Update text**: "Submit" -> "Processing..." -> "Done!".
-   **Show success**: Briefly show a success state before resetting.
-   **Maintain contrast**: Ensure readability even when disabled.

## Why It Matters

-   **Reduces uncertainty**: Users know their action was registered.
-   **Prevents errors**: Block double-submissions.
-   **Feels premium**: Polished interactions build trust.
-   **Improves accessibility**: Clear states help everyone.
