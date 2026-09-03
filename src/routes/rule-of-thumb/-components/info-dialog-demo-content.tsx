import { cx } from "@/stylex";
import {
  AnimatedCursor,
  AnimationControls,
  AnimationStage,
} from "../../../components/animation-demo";
import { Button } from "../../../components/button";
import { XIcon } from "@phosphor-icons/react";
import { MockBackdrop } from "./mock-backdrop";
import { MockDialog } from "./mock-dialog";

export function InfoDialogDemoContent() {
  return (
    <>
      <AnimationStage>
        {/* Fake Cursor */}
        <AnimatedCursor
          moveAnimationName="demo-info-cursor"
          rippleAnimationName="demo-info-ripple"
        />

        <MockBackdrop animationName="demo-info-dialog" />

        <MockDialog animationName="demo-info-dialog" className={cx("w-full max-w-xs")}>
          <div className={cx("flex items-center justify-between mb-4")}>
            <div className={cx("font-semibold text-foreground")}>Information</div>
            <XIcon size={18} className={cx("text-muted-foreground")} />
          </div>
          <div className={cx("text-sm text-muted-foreground mb-6")}>
            Click anywhere outside to close.
          </div>
          <Button
            variant="brand"
            className={cx(
              "w-full ring-2 ring-brand ring-offset-1 ring-offset-background pointer-events-none",
            )}
          >
            Got it
          </Button>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Info Dialog">
        <p className={cx("text-sm text-muted-foreground")}>
          Info dialogs should be dismissible by clicking the backdrop.
        </p>
      </AnimationControls>
    </>
  );
}
