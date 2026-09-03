import { cx } from "@/stylex";
import {
  AnimatedCursor,
  AnimationControls,
  AnimationStage,
  useAnimationDemo,
} from "../../../components/animation-demo";
import { FakeButton } from "./fake-button";

export function ScrollLockDemoContent() {
  const { status, animationStyle } = useAnimationDemo();

  return (
    <>
      <AnimationStage className={cx("bg-background")}>
        {/* Fake Cursor */}
        <AnimatedCursor
          moveAnimationName="demo-scroll-cursor"
          rippleAnimationName="demo-scroll-ripple"
        />

        {/* The Page Content (Mock Browser) */}
        <div
          className={cx(
            "absolute inset-x-12 inset-y-8 bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col",
          )}
        >
          {/* Mock Content Area */}
          <div className={cx("relative flex-1 p-8 space-y-6")}>
            <div className={cx("h-4 w-1/3 bg-card rounded animate-pulse")} />
            <div className={cx("space-y-3")}>
              <div className={cx("h-2 w-full bg-card rounded")} />
              <div className={cx("h-2 w-5/6 bg-card rounded")} />
              <div className={cx("h-2 w-full bg-card rounded")} />
            </div>
            <div className={cx("space-y-3 opacity-50")}>
              <div className={cx("h-2 w-full bg-card rounded")} />
              <div className={cx("h-2 w-4/5 bg-card rounded")} />
              <div className={cx("h-2 w-full bg-card rounded")} />
            </div>
          </div>

          {/* The Trigger Button - Centered relative to the browser window (and thus the stage) */}
          <div
            className={cx(
              "absolute inset-0 flex items-center justify-center pointer-events-none z-0",
            )}
          >
            <div className={cx("pointer-events-auto")}>
              <FakeButton>Open Modal</FakeButton>
            </div>
          </div>

          {/* Mock Scrollbar */}
          <div
            className={cx(
              "absolute right-0 top-0 bottom-0 w-3 border-l border-border bg-card p-0.5 transition-opacity",
            )}
            style={{
              ...animationStyle,
              animationName: status !== "idle" ? "demo-scroll-scrollbar" : "none",
            }}
          >
            <div className={cx("w-full h-16 bg-muted rounded-full")} />
          </div>

          {/* Backdrop & Dialog inside the "browser window" */}
          {/* We use a custom backdrop here to constrain it to this 'browser' div instead of the full stage if we wanted,
              but MockBackdrop uses absolute inset-0 which is relative to the nearest positioned ancestor.
              AnimationStage has relative, but this 'browser' div also needs relative? 
              Actually, let's just put MockBackdrop inside this div so it covers the "content".
          */}
          <div className={cx("absolute inset-0 z-10 pointer-events-none")}>
            {/* We need to selectively wrap them or style them to be hidden initially */}
            <div
              className={cx("absolute inset-0 bg-black/20 backdrop-blur-sm")}
              style={{
                ...animationStyle,
                animationName: status !== "idle" ? "demo-scroll-dialog" : "none",
                opacity: 0, // default hidden until anim starts
              }}
            ></div>
            <div
              className={cx(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[240px] p-6 rounded-xl bg-background border border-border",
              )}
              style={{
                ...animationStyle,
                animationName: status !== "idle" ? "demo-scroll-dialog" : "none",
                opacity: 0,
              }}
            >
              <div className={cx("font-semibold text-foreground mb-2 text-center")}>
                Scroll Locked
              </div>
              <div className={cx("text-xs text-muted-foreground text-center")}>
                The scrollbar disappears to prevent background scrolling.
              </div>
            </div>
          </div>
        </div>
      </AnimationStage>

      <AnimationControls title="Scroll Locking">
        <p className={cx("text-sm text-muted-foreground")}>
          Prevent page scrolling when the dialog is open.
        </p>
      </AnimationControls>
    </>
  );
}
