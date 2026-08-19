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

export function AutoFocusReversibleDemoContent() {
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
            animationName: status !== "idle" ? "demo-approval-trigger" : "none",
          }}
        >
          Archive Item
        </Button>

        {/* Fake Cursor */}
        <AnimatedCursor
          moveAnimationName="demo-approval-cursor"
          rippleAnimationName="demo-approval-ripple"
        />

        <MockBackdrop animationName="demo-approval-dialog" />

        <MockDialog animationName="demo-approval-dialog" className={cx("w-full max-w-xs")}>
          <div className={cx("flex items-center justify-between mb-2")}>
            <div className={cx("font-semibold text-foreground")}>Archive this item?</div>
          </div>
          <div className={cx("text-sm text-muted-foreground mb-6")}>You can restore it later.</div>

          <div className={cx("flex gap-2")}>
            <Button variant="tertiary-neutral" className={cx("flex-1 pointer-events-none")}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className={cx(
                "flex-1 ring-2 ring-destructive ring-offset-2 ring-offset-background pointer-events-none",
              )}
            >
              Archive
            </Button>
          </div>
          <p className={cx("text-xs text-muted-foreground mt-4 text-center")}>
            ✨ Archive button is auto-focused
          </p>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Reversible Action">
        <p className={cx("text-sm text-muted-foreground")}>
          Focus the <strong className={cx("text-foreground")}>primary action</strong> for reversible
          actions.
        </p>
      </AnimationControls>
    </>
  );
}
