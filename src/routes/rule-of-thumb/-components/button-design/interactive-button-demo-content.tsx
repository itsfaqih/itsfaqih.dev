import "../../button-design.css";
import { cx } from "@/stylex";
import { cn } from "@/cn";
import {
  AnimationStage,
  AnimationControls,
  useAnimationDemo,
} from "../../../../components/animation-demo";
import { CircleNotchIcon, CheckIcon } from "@phosphor-icons/react";
import { Cursor } from "../../../../components/cursor";
import { getButtonClasses } from "../../../../components/button-styles";

export function InteractiveButtonDemoContent() {
  const { status, animationStyle } = useAnimationDemo();

  // Keep the animated surface in sync with the shared Brand button variant.
  const base = getButtonClasses({ variant: "brand" });

  return (
    <>
      <AnimationStage>
        {/* Fake Cursor */}
        {status !== "idle" && (
          <div
            className={cx("absolute z-50 pointer-events-none")}
            style={{
              ...animationStyle,
              animationName: "button-demo-cursor-move",
            }}
          >
            {/* Default Pointer */}
            <div
              style={{
                ...animationStyle,
                animationName: "button-demo-cursor-swap-default",
              }}
            >
              <Cursor />
            </div>

            {/* Pending Spinner */}
            <div
              className={cx("absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2")}
              style={{
                ...animationStyle,
                animationName: "button-demo-cursor-swap-spinner",
                opacity: 0,
              }}
            >
              <CircleNotchIcon
                size={24}
                className={cx("animate-spin")}
                stroke="var(--brand)"
                strokeWidth={20}
              />
            </div>

            {/* Ripple */}
            <div
              className={cx("absolute top-0 left-0 size-8 rounded-full bg-black/50 dark:bg-white/50 -translate-x-1/2 -translate-y-1/2 pointer-events-none")}
              style={{
                ...animationStyle,
                animationName: "button-demo-cursor-ripple",
              }}
            />
          </div>
        )}

        {/* The Button */}
        <div
          className={cn(
            base,
            "cursor-default absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          )}
          style={{
            display: "grid",
            placeItems: "center",
            width: "78px",
            ...animationStyle,
            animationName:
              status !== "idle"
                ? "button-demo-width, button-demo-container-scale, button-demo-border-success"
                : "none",
          }}
        >
          <div
            className={cx("absolute inset-0 bg-black/10 pointer-events-none")}
            style={{
              ...animationStyle,
              animationName: status !== "idle" ? "button-demo-highlight" : "none",
              opacity: 0,
            }}
          />

          {/* Idle Content */}
          <div
            className={cx("relative z-1 flex items-center gap-2")}
            style={{
              gridColumn: "1",
              gridRow: "1",
              ...animationStyle,
              animationName: status !== "idle" ? "button-demo-content-idle" : "none",
            }}
          >
            Submit
          </div>

          {/* Pending Content */}
          <div
            className={cx("relative z-1 flex items-center gap-2 justify-center")}
            style={{
              gridColumn: "1",
              gridRow: "1",
              ...animationStyle,
              animationName: status !== "idle" ? "button-demo-content-loading" : "none",
              opacity: 0,
            }}
          >
            <CircleNotchIcon size={18} className={cx("animate-spin")} />
            Processing...
          </div>

          {/* Success Content */}
          <div
            className={cx("relative z-1 flex items-center gap-2 justify-center")}
            style={{
              gridColumn: "1",
              gridRow: "1",
              ...animationStyle,
              animationName: status !== "idle" ? "button-demo-content-success" : "none",
              opacity: 0,
            }}
          >
            <CheckIcon size={18} />
            Submitted
          </div>
        </div>
      </AnimationStage>

      <AnimationControls title="Button Interaction">
        <p className={cx("text-sm text-muted-foreground")}>
          <strong className={cx("text-foreground")}>Complete Lifecycle:</strong> A well-designed button
          handles idle, hover, press, loading, and success states seamlessly.
        </p>
      </AnimationControls>
    </>
  );
}