# TypeScript Guidelines Compliance Audit

Generated: 2026-01-27

## Executive Summary

This audit analyzes the codebase against the TypeScript Guidelines defined in `public/rule-of-thumb/typescript-code-writing.md`.

### Compliance Status

| Guideline | Status | Violations Found |
|-----------|--------|------------------|
| **Exports & Functions** | ❌ Non-Compliant | 4 default exports |
| **Type Definitions** | ⚠️ Partially Compliant | 40+ interfaces used instead of types |
| **Function Parameters** | ✅ Compliant | Good usage of option objects |
| **Strictness & Config** | ⚠️ Partially Compliant | Missing 2 critical flags |
| **Module System** | ✅ Compliant | ESM used throughout |

---

## 1. Exports & Functions

### ❌ Prefer Named Exports

**Guideline:** Named exports ensure consistent naming across the codebase and work better with auto-imports/refactoring tools. Avoid default exports.

**Violations Found: 4**

1. **`src/components/architectural-background.tsx`** (Line 3)
   ```tsx
   export default function ArchitecturalBackground() {
   ```
   **Fix:** Change to named export
   ```tsx
   export function ArchitecturalBackground() {
   ```

2. **`src/components/header.tsx`** (Line 18)
   ```tsx
   export default function Header() {
   ```
   **Fix:** Change to named export
   ```tsx
   export function Header() {
   ```

3. **`src/components/grid-background.tsx`** (Line 132)
   ```tsx
   export default function GridBackground() {
   ```
   **Fix:** Change to named export
   ```tsx
   export function GridBackground() {
   ```

4. **`src/content/blog/counter.tsx`** (Line 4)
   ```tsx
   export default function Counter() {
   ```
   **Fix:** Change to named export
   ```tsx
   export function Counter() {
   ```

### ✅ Use "function" keyword

**Status:** ✅ **COMPLIANT**

All top-level functions use the `function` keyword. No arrow function exports found.

---

## 2. Type Definitions

### ⚠️ Use "type" by default

**Guideline:** Use "type" for most definitions (unions, primitives, tuples). Use "interface" specifically when you need declaration merging or object-oriented patterns.

**Violations Found: 40+**

The codebase extensively uses `interface` where `type` would be more appropriate. Here are key examples:

#### High-Priority Files to Update:

1. **`src/data/guidelines.ts`** (Line 1)
   ```tsx
   export interface Guideline {
   ```
   **Fix:** Change to type
   ```tsx
   export type Guideline = {
   ```

2. **`src/components/button.tsx`** (Line 88)
   ```tsx
   export interface ButtonProps
     extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
   ```
   **Fix:** Change to type
   ```tsx
   export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
     VariantProps<typeof buttonVariants> & {
   ```

3. **`src/components/rule-of-thumb-card.tsx`** (Line 13)
   ```tsx
   export interface RuleOfThumb {
   ```
   **Fix:** Change to type

4. **`src/components/card.tsx`** (Line 20)
   ```tsx
   export interface CardProps<T extends ElementType> extends VariantProps<typeof cardVariants> {
   ```
   **Fix:** Change to type with intersection

5. **`src/types/blog.ts`** (Lines 3, 9, 14)
   - `BlogFrontmatter`
   - `BlogModule`
   - `BlogPost`
   
   All should be changed to `type`.

#### Internal Component Props (Lower Priority):

These are internal and not exported, but should still follow guidelines:
- `src/components/code-block.tsx` - `CodeBlockProps`
- `src/components/tooltip.tsx` - `SimpleTooltipProps`
- `src/components/page-container.tsx` - `PageContainerProps`
- `src/components/cursor.tsx` - `CursorProps`
- `src/routes/index.tsx` - Multiple interfaces (SectionProps, SocialLinkProps, etc.)
- `src/routes/rule-of-thumb/-components/index.tsx` - Multiple interfaces

### ✅ Unions over Enums

**Status:** ✅ **COMPLIANT**

No actual enum usage found in source code. The only enum reference is in the example code within `typescript-code-writing.tsx` (which is intentionally showing what NOT to do).

### ✅ Infer when possible

**Status:** ✅ **COMPLIANT**

The codebase generally uses type inference well. No excessive explicit typing found.

---

## 3. Function Parameters

### ✅ Use Option Objects

**Status:** ✅ **COMPLIANT**

Functions with multiple parameters correctly use option objects. Examples:
- `Button` component uses destructured props object
- `getButtonClasses` uses a single options object
- Route components use proper prop objects

---

## 4. Strictness & Config

### ⚠️ Must-Have Flags

**Current `tsconfig.json` status:**

| Flag | Required | Present | Status |
|------|----------|---------|--------|
| `"strict": true` | ✅ | ✅ | ✅ |
| `"noUncheckedIndexedAccess": true` | ✅ | ❌ | ❌ |
| `"verbatimModuleSyntax": true` | ✅ | ❌ (set to false) | ❌ |

**Issues:**

1. **Missing `noUncheckedIndexedAccess`**
   - This flag forces you to check if array access / index signature is defined
   - **Impact:** Potential runtime errors from undefined array access
   
2. **`verbatimModuleSyntax` set to `false`**
   - Current: `"verbatimModuleSyntax": false` (Line 13)
   - Should be: `"verbatimModuleSyntax": true`
   - **Impact:** Less strict ESM compatibility checks

**Fix Required:**
```json
{
  "compilerOptions": {
    // ... other options
    "verbatimModuleSyntax": true,  // Change from false to true
    "noUncheckedIndexedAccess": true,  // Add this line
    // ... rest of config
  }
}
```

---

## 5. Module System

### ✅ Use ESM Exclusively

**Status:** ✅ **COMPLIANT**

- All files use `import` / `export` syntax
- No `require()` or `module.exports` found
- `tsconfig.json` has `"module": "ESNext"`

---

## Recommended Action Plan

### Priority 1: Critical (Affects Type Safety)

1. **Update `tsconfig.json`**
   - Add `"noUncheckedIndexedAccess": true`
   - Change `"verbatimModuleSyntax": false` to `true`

### Priority 2: High (Affects Consistency)

2. **Convert default exports to named exports** (4 files)
   - `src/components/architectural-background.tsx`
   - `src/components/header.tsx`
   - `src/components/grid-background.tsx`
   - `src/content/blog/counter.tsx`

3. **Convert exported interfaces to types** (Priority order)
   - `src/data/guidelines.ts` - `Guideline`
   - `src/components/button.tsx` - `ButtonProps`
   - `src/components/card.tsx` - `CardProps`
   - `src/components/rule-of-thumb-card.tsx` - `RuleOfThumb`
   - `src/types/blog.ts` - All 3 interfaces

### Priority 3: Medium (Internal Consistency)

4. **Convert internal component interfaces to types**
   - All component prop interfaces in `src/components/`
   - All route component interfaces in `src/routes/`

---

## Notes

- **Generated files excluded:** `src/routeTree.gen.ts` uses interfaces but is auto-generated by TanStack Router
- **Example code excluded:** Code examples in `typescript-code-writing.tsx` intentionally show anti-patterns
- **Total violations:** ~48 (4 default exports + 40+ interfaces + 2 config flags)
