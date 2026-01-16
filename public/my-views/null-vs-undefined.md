# Null vs Undefined

Two ways to say "nothing", but with very different meanings. Know the difference.

## The Mental Model

-   **Undefined**: "No value provided". The variable exists, but nothing has been put into it yet. It's the default state.
-   **Null**: "Empty value". Intentionally set to be empty. We checked, and the answer is explicitly "nothing".

## Undefined: No Value Provided

Use this when a value is **optional** or **hasn't been initialized**.

```tsx
function welcomeUser(name?: string) {
  // if name is not passed, it is 'undefined'
  if (name === undefined) {
    console.log("Welcome, Guest!");
  }
}
```

## Null: Intentional Empty Value

Use this when you want to **explicitly** say "this is empty".

```tsx
const [selectedUser, setSelectedUser] = useState<User | null>(null);

// Resetting selection implies an intentional 'empty' state
const clearSelection = () => {
  setSelectedUser(null); 
};
```

## Explicit vs Implicit

Sometimes "optional" is too ambiguous. Use null to force a decision.

-   `updateTask({ assigneeId: undefined })`: Ambiguous. Does this mean "ignore this field" (no change) or "unassign"?
-   `updateTask({ assigneeId: null })`: Unambiguous. Remove the assignee.

**Pattern**: Use `undefined` for "ignore" (no change) and `null` for "remove" (clear value).

## Quick Reference

-   Variable declared but not assigned -> **undefined**
-   Function argument not passed -> **undefined**
-   Resetting a form field -> **null**
-   API returns "not found" -> **null**
