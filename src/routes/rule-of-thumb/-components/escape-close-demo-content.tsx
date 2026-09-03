import { cx } from "@/stylex";
import { AnimationControls, AnimationStage } from "../../../components/animation-demo";
import { Button } from "../../../components/button";
import { XIcon } from "@phosphor-icons/react";
import { KeyboardKey } from "./keyboard-key";
import { MockBackdrop } from "./mock-backdrop";
import { MockDialog } from "./mock-dialog";

export function EscapeCloseDemoContent() {
  // useAnimationDemo context is used by child components (KeyboardKey, MockDialog, MockBackdrop)

  return (
    <>
      <AnimationStage>
        {/* Fake ESC Key */}
        <KeyboardKey animationName="demo-esc-key">ESC</KeyboardKey>

        <MockBackdrop animationName="demo-esc-dialog" />

        <MockDialog animationName="demo-esc-dialog">
          <div className={cx("flex items-center justify-between mb-2")}>
            <div className={cx("font-semibold text-foreground")}>Press ESC to Close</div>
            <XIcon size={18} className={cx("text-muted-foreground")} />
          </div>
          <div className={cx("text-sm text-muted-foreground mb-4")}>
            Keyboard users expect Escape to dismiss dialogs.
          </div>
          <Button
            variant="brand"
            className={cx("w-full ring-2 ring-brand ring-offset-1 ring-offset-background")}
          >
            Or Click Here
          </Button>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Escape Key">
        <p className={cx("text-sm text-muted-foreground")}>
          Listen for{" "}
          <code className={cx("px-1 py-0.5 rounded bg-card text-foreground")}>keydown</code> events.
        </p>
      </AnimationControls>
    </>
  );
}
