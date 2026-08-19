import { cx } from "@/stylex";
import { CodeComparison } from "./-components";

export function AbstractionSection() {
  return (
    <div className={cx("mb-16")}>
      <div className={cx("max-w-3xl mx-auto")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-2")}>Don't Abstract Prematurely</h2>
        <p className={cx("text-muted-foreground mb-6")}>
          If code is only used once, keep it inline. Abstraction adds complexity.
        </p>
      </div>
      <div className={cx("w-screen relative left-1/2 -translate-x-1/2 px-4")}>
        <div className={cx("max-w-5xl mx-auto")}>
          <CodeComparison
            badTitle="Over-abstracted"
            badCode={`// utils/format-date.ts
export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// components/user-profile.tsx
import { formatDate } from '../utils/format-date'
// Used only once here...`}
            badReason="Separate file for code used only once. Extra import, extra cognitive load."
            goodTitle="Inline"
            goodCode={`// components/user-profile.tsx
function UserProfile() {
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return <div>{formattedDate}</div>;
}`}
            goodReason="Code lives where it's used. No imports, no jumping between files."
          />
        </div>
      </div>
    </div>
  );
}
