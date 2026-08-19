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

export function InteractiveButtonDemoContent() {
  const { status, animationStyle } = useAnimationDemo();

  // Base styles: Brand variant
  const base = cn(
    "relative overflow-hidden inline-flex items-center justify-center gap-2 px-3 h-8.5 rounded-md text-brand-foreground transition-all text-sm backdrop-blur-md border border-brand/20 shadow-sm",
    "bg-brand/90",
    "bg-linear-to-b from-white/25 to-transparent",
  );

  return (
    <>
      <AnimationStage>
        {/* Fake Cursor */}
        <div
          className={cx("absolute z-50 pointer-events-none")}
          style={{
            ...animationStyle,
            animationName: status !== "idle" ? "button-demo-cursor-move" : "none",
          }}
        >
          {/* Default Pointer */}
          <div
            style={{
              ...animationStyle,
              animationName: status !== "idle" ? "button-demo-cursor-swap-default" : "none",
            }}
          >
            <Cursor />
          </div>

          {/* Pending Spinner */}
          <div
            className={cx("absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2")}
            style={{
              ...animationStyle,
              animationName: status !== "idle" ? "button-demo-cursor-swap-spinner" : "none",
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
              animationName: status !== "idle" ? "button-demo-cursor-ripple" : "none",
            }}
          />
        </div>

        {/* The Button */}
        <div
          className={cn(
            base,
            "cursor-default grid place-items-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          )}
          style={{
            ...animationStyle,
            animationName:
              status !== "idle"
                ? "button-demo-width, button-demo-container-scale, button-demo-border-success"
                : "none",
          }}
        >
          <div
            className={cx("absolute inset-0 bg-black/20 pointer-events-none")}
            style={{
              ...animationStyle,
              animationName: status !== "idle" ? "button-demo-highlight" : "none",
              opacity: 0,
            }}
          />

          {/* Idle Content */}
          <div
            className={cx("col-start-1 col-end-1 row-start-1 row-end-1 flex items-center gap-2")}
            style={{
              ...animationStyle,
              animationName: status !== "idle" ? "button-demo-content-idle" : "none",
            }}
          >
            Submit
          </div>

          {/* Pending Content */}
          <div
            className={cx("col-start-1 col-end-1 row-start-1 row-end-1 flex items-center gap-2 justify-center")}
            style={{
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
            className={cx("col-start-1 col-end-1 row-start-1 row-end-1 flex items-center gap-2 justify-center")}
            style={{
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