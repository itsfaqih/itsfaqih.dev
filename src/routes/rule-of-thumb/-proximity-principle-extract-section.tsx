import { cx } from "@/stylex";
import { CodeComparison } from "./-components";

export function ExtractOnlyWhenReusedSection() {
  return (
    <div className={cx("mb-16")}>
      <div className={cx("max-w-3xl mx-auto")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-2")}>Extract Only When Reused</h2>
        <p className={cx("text-muted-foreground mb-6")}>
          Only move code to a separate file when it's needed in multiple files.
        </p>
      </div>
      <div className={cx("w-screen relative left-1/2 -translate-x-1/2 px-4")}>
        <div className={cx("max-w-5xl mx-auto")}>
          <CodeComparison
            badTitle="Premature extraction"
            badCode={`// hooks/use-user-status.ts
export function useUserStatus() {
  // Only used in dashboard.tsx...
}

// components/dashboard.tsx
import { useUserStatus } from '../hooks/use-user-status'`}
            badReason="Extracted to separate file even though only used in one place."
            goodTitle="Same file"
            goodCode={`// components/dashboard.tsx
function useUserStatus() {
  // Reused within this file only
}

function UserCard() {
  const status = useUserStatus();
}

function UserBadge() {
  const status = useUserStatus();
}`}
            goodReason="Hook stays in the file where it's used. Easier to find and modify."
          />
        </div>
      </div>
    </div>
  );
}
