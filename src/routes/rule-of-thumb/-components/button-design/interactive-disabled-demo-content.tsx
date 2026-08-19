import { cx } from "@/stylex";
import {
  AnimationStage,
  AnimationControls,
  useAnimationDemo,
} from "../../../../components/animation-demo";
import { Button } from "../../../../components/button";
import { Cursor } from "../../../../components/cursor";
import { ProhibitIcon } from "@phosphor-icons/react";

export function InteractiveDisabledDemoContent() {
  const { status, animationStyle } = useAnimationDemo();

  return (
    <>
      <style>
        {`
          @keyframes disabled-demo-cursor-move {
            0% { transform: translate(100px, 80px); }
            35% { transform: translate(0px, 0px); } /* Center/Over button */
            65% { transform: translate(20px, -15px); } /* Still over button */
            100% { transform: translate(100px, 80px); }
          }
           @keyframes disabled-demo-cursor-swap {
            0%, 16% { opacity: 1; }
            17%, 71% { opacity: 0; }
            72%, 100% { opacity: 1; }
          }
          @keyframes disabled-demo-cursor-swap-inverse {
            0%, 16% { opacity: 0; }
            17%, 71% { opacity: 1; }
            72%, 100% { opacity: 0; }
          }
        `}
      </style>
      <AnimationStage>
        {/* Disabled Button - Centered */}
        <div className={cx("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2")}>
          <Button
            disabled
            className={cx("w-24 opacity-60 cursor-not-allowed bg-none bg-zinc-200/50 dark:bg-zinc-800/50 backdrop-blur-none shadow-none border-black/5 dark:border-white/5")}
          >
            Submit
          </Button>
        </div>

        {/* Cursor Container - Origin at Center */}
        <div
          className={cx("absolute top-1/2 left-1/2 pointer-events-none z-50")}
          style={{
            ...animationStyle,
            animationName: status !== "idle" ? "disabled-demo-cursor-move" : "none",
            marginLeft: "-6px", // Offset to center pointer tip visually
            marginTop: "-2px",
          }}
        >
          {/* Default Pointer */}
          <div
            className={cx("absolute top-0 left-0")}
            style={{
              animation:
                status !== "idle" ? "4000ms disabled-demo-cursor-swap linear infinite" : "none",
            }}
          >
            <Cursor size={24} />
          </div>

          {/* Forbidden Cursor */}
          <div
            className={cx("absolute top-0 left-0")}
            style={{
              animation:
                status !== "idle"
                  ? "4000ms disabled-demo-cursor-swap-inverse linear infinite"
                  : "none",
              opacity: 0,
            }}
          >
            <ProhibitIcon className={cx("text-red-500")} size={24} />
          </div>
        </div>
      </AnimationStage>

      <AnimationControls title="Disabled State Behavior">
        <p className={cx("text-sm text-muted-foreground")}>
          <strong className={cx("text-foreground")}>Visual Feedback:</strong> When a button is disabled,
          the cursor should immediately change to indicate the action is forbidden.
        </p>
      </AnimationControls>
    </>
  );
}