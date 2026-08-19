import { cx } from "@/stylex";
import {
  AnimatedCursor,
  AnimationControls,
  AnimationStage,
} from "../../../components/animation-demo";
import { Button } from "../../../components/button";
import { XIcon } from "@phosphor-icons/react";
import { MockDialog } from "./mock-dialog";

export function FormDialogDemoContent() {
  return (
    <>
      <AnimationStage>
        {/* Fake Cursor */}
        <AnimatedCursor
          moveAnimationName="demo-form-cursor"
          rippleAnimationName="demo-form-ripple"
        />

        {/* Note: FormDialogDemo has a static backdrop (no animation name) */}
        <div
          className={cx("absolute inset-0 bg-white/20 dark:bg-black/40 backdrop-blur-sm z-10")}
        />

        <MockDialog animationName="demo-form-dialog-pulse">
          <div className={cx("flex items-center justify-between mb-2")}>
            <div className={cx("font-semibold text-foreground")}>Edit Profile</div>
            <XIcon size={18} className={cx("text-muted-foreground")} />
          </div>
          <div className={cx("text-sm text-muted-foreground mb-4")}>Data loss prevention.</div>

          <div
            onClick={(e) => e.preventDefault()}
            className={cx(
              "w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground mb-4 text-sm",
            )}
          >
            Your name...
          </div>
          <Button
            variant="brand"
            className={cx(
              "w-full ring-2 ring-brand ring-offset-1 dark:ring-offset-black pointer-events-none",
            )}
          >
            Save Changes
          </Button>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Form Dialog">
        <p className={cx("text-sm text-muted-foreground")}>
          Form dialogs should NOT close on backdrop click to prevent data loss.
        </p>
      </AnimationControls>
    </>
  );
}
