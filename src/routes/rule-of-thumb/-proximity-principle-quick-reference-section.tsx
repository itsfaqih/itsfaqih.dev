import { cx } from "@/stylex";
import { QuickRefTable } from "./-components";

const QUICK_REFERENCE_ITEMS = [
  { scenario: "Code used once", action: "Keep it inline" },
  { scenario: "Code is too long", action: "Extract to function, keep in file" },
  { scenario: "Code reused in same file", action: "Extract to function, keep in file" },
  { scenario: "Code reused across files", action: "Extract to lowest common ancestor" },
  { scenario: "Code used globally / almost everywhere", action: "Put in a type directory (e.g. components/, schemas/)" },
  { scenario: "React: Child has own state", action: "Extract to component (prevents parent re-render)" },
] as const;

export function QuickReferenceSection() {
  return (
    <div className={cx("mb-16")}>
      <h2 className={cx("text-2xl font-bold text-foreground text-center mb-8")}>Quick Reference</h2>
      <div className={cx("flex justify-center")}>
        <QuickRefTable items={[...QUICK_REFERENCE_ITEMS]} />
      </div>
    </div>
  );
}
