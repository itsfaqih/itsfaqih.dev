import { cx } from "@/stylex";
import {
  AnimatedCursor,
  AnimationControls,
  AnimationStage,
  useAnimationDemo,
} from "../../../components/animation-demo";
import { XIcon } from "@phosphor-icons/react";
import { FakeButton } from "./fake-button";
import { MockBackdrop } from "./mock-backdrop";
import { MockDialog } from "./mock-dialog";

export function AutoFocusFormDemoContent() {
  const { status, animationStyle } = useAnimationDemo();

  return (
    <>
      <AnimationStage>
        {/* The Trigger Button */}
        <FakeButton
          className={cx("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2")}
          style={{
            ...animationStyle,
            animationName: status !== "idle" ? "demo-button-press" : "none",
          }}
        >
          Open Form
        </FakeButton>

        {/* Fake Cursor */}
        <AnimatedCursor
          moveAnimationName="demo-cursor-move"
          rippleAnimationName="demo-cursor-ripple"
        />

        <MockBackdrop animationName="demo-dialog-cycle" />

        <MockDialog animationName="demo-dialog-cycle" className={cx("w-full max-w-xs")}>
          <div className={cx("flex items-center justify-between mb-2")}>
            <div className={cx("font-semibold text-foreground")}>Add Item</div>
            <XIcon size={18} className={cx("text-muted-foreground")} />
          </div>
          <div
            className={cx(
              "w-full h-8.5 rounded-lg border border-border bg-card mb-4 ring-2 ring-black flex items-center px-2.5 text-sm text-foreground",
            )}
          >
            <span
              className={cx(
                "w-[1.5px] h-5 bg-black block animate-[caret-blink_1s_step-end_infinite]",
              )}
            ></span>
          </div>
          <div className={cx("text-xs text-muted-foreground mb-4")}>✨ Input is auto-focused</div>
          <FakeButton className={cx("w-full")}>Add</FakeButton>
        </MockDialog>
      </AnimationStage>

      <AnimationControls title="Form Dialog">
        <p className={cx("text-sm text-muted-foreground")}>Focus the first input field.</p>
      </AnimationControls>
    </>
  );
}
