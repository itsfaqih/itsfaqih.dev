# Button Design

The details that make buttons feel tangible and responsive. Don't settle for browser defaults.

## The Essential States

A well-designed button handles these six states seamlessly:

1.  **Idle State**: The default resting state. Clearly clickable with valid contrast. Use `cursor: default`.
2.  **Hover State**: Provides feedback when cursor is over the button. Signals interactivity.
3.  **Focus State**: Shows when the button is focused via keyboard navigation. Essential for accessibility.
4.  **Pressing State**: Visual feedback on press. Scale-down or click effect.
5.  **Pending State**: Shows progress while waiting. Prevents double-clicks. Use `cursor: wait`.
6.  **Disabled State**: Indicates unavailable action. Reduced opacity and no pointer events. Use `cursor: not-allowed`.
7.  **Cursor**: Use `cursor: default` for buttons (actions) and `cursor: pointer` for links (navigation).

## Disabled State UX

When a button is disabled, the cursor should immediately change to indicate the action is forbidden (`cursor: not-allowed`).
Consider adding a tooltip explaining _why_ it is disabled.

## Code Implementation

A robust implementation handles all states in a unified component:

```tsx
<button
  disabled={isPending || isDisabled}
  className={cn(
    // Base styles
    "px-6 py-3 rounded-xl font-medium transition-all",
    // Hover
    "hover:bg-zinc-500/5 hover:shadow-lg",
    // Focus (keyboard navigation)
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // Active/Press
    "active:scale-95",
    // Pending/Disabled
    isPending ? "cursor-wait" : isDisabled ? "cursor-not-allowed opacity-60" : "cursor-default",
  )}
>
  {isPending ? <Loader2 className="animate-spin" /> : "Submit"}
</button>
```

## Button Variants

Different actions require different visual weights. Use the right variant to guide users through your interface.

### Primary (Filled)

Solid, high-contrast buttons that demand immediate attention.

**When to use:**
- Main call-to-action per screen/section
- Actions that complete a workflow: "Submit", "Save", "Confirm"
- Use **Brand** for the primary CTA
- Use **Neutral** for important but non-primary actions like "Cancel" or "Back"

**Examples:** Submit form, Create account, Checkout, Confirm purchase

### Secondary (Tinted)

Light background with subtle tint. Visible but doesn't compete with primary.

**When to use:**
- Supporting actions that need visibility without dominance
- Card actions and toolbar buttons
- When multiple actions have similar importance
- Alternative actions: "Edit", "View Details", "Share"

**Examples:** Edit profile, View report, Export data, Refresh

### Tertiary (Minimal)

Transparent background, text only. Minimal visual weight.

**When to use:**
- Low-priority actions that shouldn't distract
- Repeated actions in lists or tables
- Dismissive actions: "Skip", "Dismiss", "Maybe later"
- Inline links styled as buttons

**Examples:** Skip intro, Learn more, Show less, Clear filters

### Quick Reference

| Level | Visual Weight | Use For |
|-------|---------------|---------|
| Primary (Filled) | High | Main CTA, final actions |
| Secondary (Tinted) | Medium | Supporting actions, cards |
| Tertiary (Minimal) | Low | Skip, dismiss, inline actions |

### Destructive Actions

- **Destructive (Filled)**: High-impact negative actions (e.g., "Delete Project"). Use Red sparingly.
- **Secondary Destructive**: Moderate warnings (e.g., "Remove Access").
- **Tertiary Destructive**: Low-priority negative actions (e.g., "Unsubscribe").

**⚠️ Avoid Red for Primary Actions**: Reserve red for destructive actions only. Using red for a "Confirm" button creates cognitive friction as users are trained to associate red with danger.

## Icon Integration

### Leading Icons

Use for:

- **Back/Return actions** (ArrowLeft)
- **Confirmation actions** (Check)
- **Add/Create actions** (Plus)
- **Feature emphasis** (Sparkles)

_Padding tip_: Apply `pl-2 pr-3` for optical balance when using a leading icon.

### Trailing Icons

Use for:

- **Forward/Next actions** ("Continue" -> ArrowRight)
- **External links** (ArrowUpRight)
- **Dropdown triggers** (ChevronDown)
- **Download actions** (Download)

_Padding tip_: Apply `pl-3 pr-2` for optical balance.

### Icon-Only Buttons

Use for:

- **Toolbars & action bars** (Settings)
- **Repeated actions** (Delete, Edit)
- **Mobile interfaces** (Search)

**Requirements**:

1.  **Tooltip** is mandatory to explain the action.
2.  **aria-label** is required for accessibility.
3.  **Square aspect ratio** (e.g., `size-8.5 p-0`).

## Best Practices

- **Keep transitions snappy**: Use 100-200ms.
- **Prevent double-clicks**: Disable during pending.
- **Update text**: "Submit" -> "Processing..." -> "Done!".
- **Show success**: Briefly show a success state before resetting.
- **Maintain contrast**: Ensure readability even when disabled.

## Why It Matters

- **Reduces uncertainty**: Users know their action was registered.
- **Prevents errors**: Block double-submissions.
- **Feels premium**: Polished interactions build trust.
- **Improves accessibility**: Clear states help everyone.
