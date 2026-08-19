import { cx } from "@/stylex";
import {
  AnimatedCursor,
  AnimationControls,
  AnimationStage,
  useAnimationDemo,
} from "../../../components/animation-demo";
import { Button } from "../../../components/button";
import { XIcon } from "@phosphor-icons/react";
import { MockBackdrop } from "./mock-backdrop";
import { MockDialog } from "./mock-dialog";

export function DiscardConfirmDemoContent() {
  const { status, animationStyle } = useAnimationDemo();

  return (
    <>
      <AnimationStage>
        {/* Fake Cursor */}
        <AnimatedCursor
          moveAnimationName="demo-discard-cursor"
          rippleAnimationName="demo-discard-ripple"
        />

        {/* Mock Dialog Backdrop */}
        <MockBackdrop animationName="demo-discard-main-dialog" />

        {/* Main Dialog (Edit Profile) */}
        <MockDialog animationName="demo-discard-main-dialog">
          <div className={cx("flex items-center justify-between mb-2")}>
            <div className={cx("font-semibold text-foreground")}>Edit Profile</div>
            <XIcon size={18} className={cx("text-muted-foreground")} />
          </div>
          <div className={cx("text-sm text-muted-foreground mb-4")}>
            Make changes to your profile.
          </div>

          <div
            className={cx(
              "w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground mb-4 text-sm h-24 overflow-hidden relative",
            )}
          >
            <span
              className={cx(
                "inline-block whitespace-nowrap overflow-hidden border-r-2 border-transparent align-bottom",
              )}
              style={{
                ...animationStyle,
                animationName: status !== "idle" ? "demo-discard-typing" : "none",
                width: status === "idle" ? "0" : undefined,
              }}
            >
              Making changes...
            </span>
          </div>
          <div className={cx("flex gap-2 justify-end")}>
            <Button variant="tertiary-neutral" className={cx("pointer-events-none")}>
              Cancel
            </Button>
            <Button variant="brand" className={cx("pointer-events-none")}>
              Save
            </Button>
          </div>
        </MockDialog>

        {/* Confirmation Dialog (Discard Changes?) */}
        {/* This dialog appears OVER the other one */}
        <MockDialog
          animationName="demo-discard-dialog-2"
          className={cx("w-full max-w-[280px]")}
          transform="scale(0.95)" /* Start slightly smaller/hidden logic handled by keyframes */
        >
          <div className={cx("font-semibold text-foreground mb-2")}>Discard Changes?</div>
          <div className={cx("text-sm text-muted-foreground mb-4")}>
            You have unsaved changes. Are you sure you want to discard them?
          </div>
          <div className={cx("flex gap-2 justify-end")}>
            <Button variant="tertiary-neutral" className={cx("pointer-events-none")}>
              Keep Editing
            </Button>
            <Button variant="destructive" className={cx("pointer-events-none")}>
              Discard
            </Button>
          </div>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Discard Confirmation">
        <p className={cx("text-sm text-muted-foreground")}>
          Confirm before discarding unsaved changes.
        </p>
      </AnimationControls>
    </>
  );
}
