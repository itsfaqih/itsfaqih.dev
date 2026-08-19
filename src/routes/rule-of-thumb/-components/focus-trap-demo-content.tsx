import { cx } from "@/stylex";
import { cn } from "@/cn";
import {
  AnimationControls,
  AnimationStage,
  useAnimationDemo,
} from "../../../components/animation-demo";
import { Button } from "../../../components/button";
import { KeyboardKey } from "./keyboard-key";
import { MockBackdrop } from "./mock-backdrop";
import { MockDialog } from "./mock-dialog";

export function FocusTrapDemoContent() {
  const { status, progress } = useAnimationDemo();
  const focusedButton =
    status !== "playing"
      ? "none"
      : progress >= 80
        ? "btn1"
        : progress >= 50
          ? "btn2"
          : progress >= 20
            ? "btn1"
            : "none";

  const focusRingClasses = "ring-2 ring-ring ring-offset-2 ring-offset-background";

  return (
    <>
      <AnimationStage>
        {/* Fake TAB Key */}
        <KeyboardKey animationName="demo-focus-tab-press">TAB</KeyboardKey>

        <MockBackdrop />
        <MockDialog className={cx("w-full max-w-xs")}>
          <div className={cx("font-semibold text-foreground mb-4")}>Focus Trap Demo</div>
          <div className={cx("flex gap-2")}>
            <Button
              variant="tertiary-neutral"
              className={cn("flex-1", focusedButton === "btn1" && focusRingClasses)}
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              className={cn("flex-1", focusedButton === "btn2" && focusRingClasses)}
            >
              Confirm
            </Button>
          </div>
          <div className={cx("text-xs text-muted-foreground mt-4 text-center")}>
            Tab key cycles focus within the dialog.
          </div>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Focus Trap">
        <p className={cx("text-sm text-muted-foreground")}>
          <strong className={cx("text-foreground")}>Focus Trap:</strong> Keeps keyboard focus inside
          the dialog.
        </p>
      </AnimationControls>
    </>
  );
}
