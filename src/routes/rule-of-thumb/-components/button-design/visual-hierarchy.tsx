import { cx } from "@/stylex";
import { Button } from "../../../../components/button";



export function VisualHierarchy() {
  return (
    <>
{/* Visual Style Variants */}
        <div className={cx("mb-12")}>
          <h3 className={cx("text-lg font-semibold text-foreground mb-3")}>Visual Hierarchy</h3>

          {/* Primary (Filled) */}
          <div className={cx("mb-6")}>
            <h4 className={cx("text-sm font-medium text-foreground mb-3 flex items-center gap-2")}>
              <span className={cx("size-2 rounded-full bg-brand")} />
              Primary (Filled)
            </h4>
            <div className={cx("p-4 rounded-xl border border-border bg-card")}>
              <div className={cx("flex flex-wrap items-center gap-3 mb-3")}>
                <Button variant="brand">Submit</Button>
                <Button variant="neutral">Cancel</Button>
              </div>
              <p className={cx("text-xs text-muted-foreground")}>
                <strong>When to use:</strong> Main call-to-action that demands immediate attention.
                Use <strong>Brand</strong> for the primary CTA (one per screen/section) and{" "}
                <strong>Neutral</strong> for important but non-primary actions like "Cancel" or
                "Back".
              </p>
            </div>
          </div>

          {/* Secondary (Tinted) */}
          <div className={cx("mb-6")}>
            <h4 className={cx("text-sm font-medium text-foreground mb-3 flex items-center gap-2")}>
              <span className={cx("size-2 rounded-full bg-brand/30")} />
              Secondary (Tinted)
            </h4>
            <div className={cx("p-4 rounded-xl border border-border bg-card")}>
              <div className={cx("flex flex-wrap items-center gap-3 mb-3")}>
                <Button variant="secondary-brand">Edit Profile</Button>
                <Button variant="secondary-neutral">View Details</Button>
              </div>
              <p className={cx("text-xs text-muted-foreground")}>
                <strong>When to use:</strong> Actions that need emphasis without competing with
                primary CTAs. Great for card actions, toolbar buttons, or when you have multiple
                actions of similar importance. The tinted background provides visual weight without
                overwhelming.
              </p>
            </div>
          </div>

          {/* Tertiary (Minimal) */}
          <div className={cx("mb-6")}>
            <h4 className={cx("text-sm font-medium text-foreground mb-3 flex items-center gap-2")}>
              <span className={cx("size-2 rounded-full border border-muted-foreground")} />
              Tertiary (Minimal)
            </h4>
            <div className={cx("p-4 rounded-xl border border-border bg-card")}>
              <div className={cx("flex flex-wrap items-center gap-3 mb-3")}>
                <Button variant="tertiary-brand">Learn More</Button>
                <Button variant="tertiary-neutral">Skip</Button>
              </div>
              <p className={cx("text-xs text-muted-foreground")}>
                <strong>When to use:</strong> Low-priority actions that shouldn't distract from main
                content. Ideal for "Skip", "Learn more", "Dismiss", or repeated/inline actions. They
                stay invisible until hovered, keeping the UI clean.
              </p>
            </div>
          </div>

          {/* Summary Card */}
          <div className={cx("p-4 rounded-xl bg-muted/30 border border-border")}>
            <h4 className={cx("font-semibold text-foreground mb-3 text-sm")}>Quick Reference</h4>
            <div className={cx("grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs")}>
              <div>
                <p className={cx("font-medium text-foreground mb-1")}>Primary (Filled)</p>
                <ul className={cx("text-muted-foreground space-y-0.5")}>
                  <li>• Main CTA per section</li>
                  <li>• "Submit", "Confirm", "Save"</li>
                  <li>• High visual prominence</li>
                </ul>
              </div>
              <div>
                <p className={cx("font-medium text-foreground mb-1")}>Secondary (Tinted)</p>
                <ul className={cx("text-muted-foreground space-y-0.5")}>
                  <li>• Supporting actions</li>
                  <li>• Card/toolbar buttons</li>
                  <li>• Medium visual weight</li>
                </ul>
              </div>
              <div>
                <p className={cx("font-medium text-foreground mb-1")}>Tertiary (Minimal)</p>
                <ul className={cx("text-muted-foreground space-y-0.5")}>
                  <li>• Low-priority actions</li>
                  <li>• "Skip", "Dismiss", links</li>
                  <li>• Minimal visual weight</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
