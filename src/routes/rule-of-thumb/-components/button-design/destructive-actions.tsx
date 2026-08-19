import { cx } from "@/stylex";
import { WarningIcon } from "@phosphor-icons/react";
import { Button } from "../../../../components/button";



export function DestructiveActions() {
  return (
    <>
{/* Destructive Actions */}
        <div className={cx("mb-12")}>
          <h3 className={cx("text-lg font-semibold text-foreground mb-3")}>Destructive Actions</h3>

          <div className={cx("mb-4 p-6 rounded-xl border border-border bg-card")}>
            <div className={cx("flex flex-wrap items-center gap-4")}>
              <div className={cx("flex flex-col items-center gap-2")}>
                <Button variant="destructive">Delete Project</Button>
                <span className={cx("text-xs text-muted-foreground")}>Destructive</span>
              </div>

              <div className={cx("flex flex-col items-center gap-2")}>
                <Button variant="secondary-destructive">Remove Access</Button>
                <span className={cx("text-xs text-muted-foreground")}>Secondary Destructive</span>
              </div>

              <div className={cx("flex flex-col items-center gap-2")}>
                <Button variant="tertiary-destructive">Cancel Subscription</Button>
                <span className={cx("text-xs text-muted-foreground")}>Tertiary Destructive</span>
              </div>
            </div>
          </div>

          <div className={cx("p-4 rounded-xl bg-red-500/10 border border-red-500/20")}>
            <h4 className={cx("font-semibold text-foreground mb-2 text-sm flex items-center gap-2")}>
              <WarningIcon size={16} className={cx("text-red-500")} />
              Avoid Red for Primary Actions
            </h4>
            <p className={cx("text-sm text-muted-foreground")}>
              Reserved red colors for <strong>destructive</strong> actions (delete, remove, block).
              Using red for a primary action (like "Confirm" or "Save") creates cognitive friction
              as users are trained to associate red with danger/warning.
            </p>
          </div>
        </div>
    </>
  );
}
