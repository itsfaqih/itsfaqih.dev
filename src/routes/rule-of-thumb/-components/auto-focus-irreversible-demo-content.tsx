import { cx } from "@/stylex";
import {
  AnimatedCursor,
  AnimationControls,
  AnimationStage,
  useAnimationDemo,
} from "../../../components/animation-demo";
import { Button } from "../../../components/button";
import { MockBackdrop } from "./mock-backdrop";
import { MockDialog } from "./mock-dialog";

export function AutoFocusIrreversibleDemoContent() {
  const { status, animationStyle } = useAnimationDemo();

  return (
    <>
      <AnimationStage>
        {/* Trigger Button */}
        <Button
          variant="destructive"
          className={cx(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none",
          )}
          style={{
            ...animationStyle,
            animationName: status !== "idle" ? "demo-deletion-trigger" : "none",
          }}
        >
          Delete Account
        </Button>

        {/* Fake Cursor */}
        <AnimatedCursor
          moveAnimationName="demo-deletion-cursor"
          rippleAnimationName="demo-deletion-ripple"
        />

        <MockBackdrop animationName="demo-deletion-dialog" />

        <MockDialog animationName="demo-deletion-dialog" className={cx("w-full max-w-xs")}>
          <div className={cx("flex items-center justify-between mb-2")}>
            <div className={cx("font-semibold text-foreground")}>Delete Account?</div>
          </div>
          <div className={cx("text-sm text-muted-foreground mb-6")}>
            This action cannot be undone.
          </div>

          <div className={cx("flex gap-2")}>
            <Button
              variant="tertiary-neutral"
              className={cx(
                "flex-1 ring-2 ring-ring ring-offset-2 ring-offset-background pointer-events-none",
              )}
            >
              Cancel
            </Button>
            <Button variant="destructive" className={cx("flex-1 pointer-events-none")}>
              Delete
            </Button>
          </div>
          <p className={cx("text-xs text-muted-foreground mt-4 text-center")}>
            ✨ Cancel button is auto-focused
          </p>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Irreversible Action">
        <p className={cx("text-sm text-muted-foreground")}>
          Focus the <strong className={cx("text-foreground")}>Cancel button</strong> for
          irreversible actions.
        </p>
      </AnimationControls>
    </>
  );
}
