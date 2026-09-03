import { cx } from "@/stylex";
import { useState } from "react";
import { ArrowsClockwiseIcon, WarningCircleIcon } from "@phosphor-icons/react";

export function ErrorDemo() {
  const [state, setState] = useState<"loading" | "success" | "error">("success");

  const simulateError = () => {
    setState("loading");
    setTimeout(() => setState("error"), 800);
  };

  const retry = () => {
    setState("loading");
    setTimeout(() => setState("success"), 800);
  };

  return (
    <div data-rule-of-thumb-card="true" className={cx("rounded-2xl border border-border bg-card overflow-hidden")}>
      <div className={cx("p-6")}>
        {state === "loading" && (
          <div className={cx("flex items-center justify-center py-8")}>
            <ArrowsClockwiseIcon size={24} className={cx("text-muted-foreground animate-spin")} />
          </div>
        )}

        {state === "success" && (
          <div className={cx("space-y-3")}>
            <h3 className={cx("font-semibold text-foreground")}>User Profile</h3>
            <div className={cx("p-4 rounded-lg bg-background border border-border")}>
              <p className={cx("text-foreground")}>Alice Johnson</p>
              <p className={cx("text-sm text-muted-foreground")}>alice@example.com</p>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className={cx("p-6 rounded-lg bg-negative/10 border border-negative/30 text-center")}>
            <WarningCircleIcon size={32} className={cx("text-negative-foreground mx-auto mb-3")} />
            <p className={cx("text-negative-foreground font-medium mb-1")}>Failed to load profile</p>
            <p className={cx("text-sm text-negative-foreground/70 mb-4")}>Network error. Please try again.</p>
            <button
              onClick={retry}
              className={cx("px-4 py-2 rounded-lg bg-negative/20 text-negative-foreground text-sm font-medium hover:bg-negative/30 transition-colors flex items-center gap-2 mx-auto")}
            >
              <ArrowsClockwiseIcon size={14} />
              Retry
            </button>
          </div>
        )}
      </div>

      <div className={cx("border-t border-border p-4 flex items-center justify-between")}>
        <span className={cx("text-sm text-muted-foreground")}>✓ Error shown inline, not as toast</span>
        <button
          onClick={simulateError}
          disabled={state === "loading"}
          className={cx("px-4 py-2 rounded-lg bg-background border border-border text-sm text-foreground hover:bg-border disabled:opacity-50 transition-colors")}
        >
          Simulate Error
        </button>
      </div>
    </div>
  );
}