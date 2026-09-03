# 002 — Animate the proximity tree collapse

- **Status**: DONE
- **Commit**: ed2b8c8
- **Severity**: MEDIUM
- **Category**: Interruptibility / Missed opportunities
- **Estimated scope**: 2 files, approximately 25 lines

## Problem

The expandable file-tree nodes rotate their caret, but the child subtree is
conditionally mounted and unmounted. The complete block disappears immediately
when a reader collapses a node, so the visual state change has no spatial bridge.
This interaction is occasional and reversible, so a short CSS transition is
appropriate. The existing `ExperienceSection` already demonstrates the same
keep-mounted grid-row pattern elsewhere in the site.

The current caret and subtree code is in
`src/routes/rule-of-thumb/-proximity-principle-tree-node.tsx:57-62` and
`:96-113`:

```tsx
<CaretRightIcon
  size={14}
  weight="regular"
  className={cx(`text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`)}
/>
```

```tsx
{hasChildren && isOpen ? (
  <div>
    {groupByHighlight(children).map((group) => {
      const groupKey = `${group.highlight ?? "plain"}:${group.nodes.map((child) => child.name).join("|")}`;
      const groupContent = group.nodes.map((child) => (
        <TreeNodeComponent key={child.name} node={child} depth={depth + 1} />
      ));

      return group.highlight ? (
        <div key={groupKey} className={TREE_BORDER_STYLES[group.highlight]}>
          {groupContent}
        </div>
      ) : (
        <div key={groupKey}>{groupContent}</div>
      );
    })}
  </div>
) : null}
```

## Target

Keep the child subtree mounted while the node exists, and animate only the
collapsible wrapper's row size and opacity. Add a named class to the caret and
wrapper so their motion can use the shared token from Plan 001.

The target subtree shape is:

```tsx
{hasChildren && (
  <div
    className={cx("tree-children grid")}
    style={{
      gridTemplateRows: isOpen ? "1fr" : "0fr",
      opacity: isOpen ? 1 : 0,
    }}
    aria-hidden={!isOpen}
    inert={!isOpen}
  >
    <div className={cx("overflow-hidden")}>
      {groupByHighlight(children).map((group) => {
        const groupKey = `${group.highlight ?? "plain"}:${group.nodes.map((child) => child.name).join("|")}`;
        const groupContent = group.nodes.map((child) => (
          <TreeNodeComponent key={child.name} node={child} depth={depth + 1} />
        ));

        return group.highlight ? (
          <div key={groupKey} className={TREE_BORDER_STYLES[group.highlight]}>
            {groupContent}
          </div>
        ) : (
          <div key={groupKey}>{groupContent}</div>
        );
      })}
    </div>
  </div>
)}
```

Add the following to `src/styles.css`:

```css
.tree-children {
  transition:
    grid-template-rows 200ms var(--ease-out),
    opacity 150ms var(--ease-out);
}

.tree-caret {
  transition: transform 200ms var(--ease-out);
}

@media (prefers-reduced-motion: reduce) {
  .tree-children {
    transition: opacity 150ms var(--ease-out);
  }

  .tree-caret {
    transition: none;
  }
}
```

The wrapper must contain an `overflow-hidden` child so `0fr` clips the subtree
without animating `height`, `margin`, or `padding` directly. The reduced-motion
variant keeps the opacity cue but removes the caret rotation and layout travel.

## Repo conventions to follow

- `src/routes/-components/experience-section.tsx:40-57` keeps experience items
  mounted and transitions `gridTemplateRows` plus `opacity`; use that as the
  structural precedent, but narrow the transition properties and use the shared
  `--ease-out` token.
- `src/routes/rule-of-thumb/-proximity-principle-tree-node.tsx:80-87` already
  exposes `aria-expanded={isOpen}` on the controlling button; preserve it.
- The audit playbook requires reversible interactions to use transitions rather
  than restarting keyframes.

## Steps

1. Confirm Plan 001 has added `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);` to `src/styles.css`. If the token is absent, stop and report the dependency drift.
2. In `src/routes/rule-of-thumb/-proximity-principle-tree-node.tsx`, change the caret class to include `tree-caret` while preserving its existing `text-muted-foreground` and conditional `rotate-90` behavior.
3. Replace the `{hasChildren && isOpen ? ... : null}` block with the always-mounted `tree-children` wrapper from the Target section. Move the existing `groupByHighlight(children).map(...)` body into the `overflow-hidden` inner element without changing keys, highlight classes, recursion, or node order.
4. Add the exact `.tree-children`, `.tree-caret`, and reduced-motion rules from the Target section to `src/styles.css`.
5. Keep `aria-expanded={isOpen}` on the parent button and add both `aria-hidden={!isOpen}` and `inert={!isOpen}` only to the animated child wrapper so collapsed controls cannot receive focus or pointer input. Do not change the tree data or initial `useState(true)` behavior.

## Boundaries

- Do **not** change `TreeNode`, `groupByHighlight`, highlight colors, indentation, icons, or recursion.
- Do **not** animate `width`, `height`, `margin`, `padding`, `top`, or `left` directly.
- Do **not** add a spring library, JavaScript animation loop, or stagger between tree rows.
- Do **not** alter the existing hover background or selected-state colors.
- If a collapsed node can retain keyboard focus inside the hidden subtree, stop and resolve that accessibility issue before shipping rather than hiding a focused control with `aria-hidden`.
- Preserve the existing CRLF convention in the TSX file if the executor edits it.

## Verification

- **Mechanical**: Run `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` from `/Users/itsfaqih/itsfaqih.dev`. Each must exit 0. Run `git -c core.whitespace=cr-at-eol diff --check` after the edit.
- **Feel check**: Run the site with `npm run dev --host 127.0.0.1 --port 4174`, open a proximity-principle page, and use both the Good and Bad file-tree examples.
  - Confirm the caret rotates over 200ms and the child tree expands/collapses over approximately 200ms without clipping the final open state.
  - Click the same node repeatedly during expansion and collapse; the transition must retarget from the current row state instead of restarting from zero.
  - Confirm no sibling node moves horizontally and no border/highlight style changes because of the animation.
  - In DevTools, confirm the wrapper transitions only `grid-template-rows` and `opacity`; there must be no `transition: all`.
  - Toggle `prefers-reduced-motion: reduce` and confirm the child content still fades briefly while the caret and layout movement no longer animate.
  - Tab through the tree and confirm collapsed child controls are not keyboard-reachable.
- **Done when**: Every expandable node has a reversible spatial transition, the open/closed state remains accessible, reduced motion preserves a small opacity cue, and all mechanical checks pass.
