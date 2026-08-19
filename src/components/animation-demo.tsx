import { cx } from "@/stylex";
import { createContext, useContext } from "react";
import { useCssAnimation } from "../hooks/use-css-animation";
import { cn } from "@/cn";
import { Button } from "./button";
import { Card } from "./card";
import { PlayIcon, PauseIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { Cursor } from "./cursor";

const ANIMATION_STYLE_DEFAULTS = {
  animationIterationCount: "1",
  animationFillMode: "forwards",
  animationPlayState: "paused",
};

interface AnimationDemoContextType extends ReturnType<typeof useCssAnimation> {
  animationStyle: React.CSSProperties;
}

const AnimationDemoContext = createContext<AnimationDemoContextType | null>(null);

export function useAnimationDemo() {
  const context = useContext(AnimationDemoContext);
  if (!context) throw new Error("useAnimationDemo must be used within AnimationDemo");
  return context;
}

export function AnimationDemo({
  duration,
  masterAnimationName,
  children,
  className,
}: {
  duration: number;
  masterAnimationName: string;
  children: React.ReactNode;
  className?: string;
}) {
  const animationData = useCssAnimation({ duration, masterAnimationName });

  const animationStyle = {
    animationDuration: `${duration}ms`,
    ...ANIMATION_STYLE_DEFAULTS,
  };

  return (
    <AnimationDemoContext.Provider value={{ ...animationData, animationStyle }}>
      <Card className={cn("rounded-2xl overflow-hidden h-full flex flex-col", className)}>
        {children}
      </Card>
    </AnimationDemoContext.Provider>
  );
}

export function AnimationStage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { status, containerRef, restart } = useAnimationDemo();

  return (
    <div
      className={cn(
        "relative p-8 flex flex-col items-center justify-center min-h-[400px] flex-1 overflow-hidden",
        className,
      )}
    >
      <div ref={containerRef} className={cx("absolute inset-0 w-full h-full pointer-events-none")}>
        {children}
      </div>

      {(status === "idle" || status === "finished") && (
        <DemoOverlay
          onClick={restart}
          icon={
            status === "finished" ? (
              <ArrowCounterClockwiseIcon size={24} className={cx("text-foreground")} />
            ) : (
              <PlayIcon size={24} className={cx("fill-foreground text-foreground")} />
            )
          }
          label={status === "finished" ? "Replay" : "Watch Demo"}
        />
      )}
    </div>
  );
}

function DemoOverlay({
  onClick,
  icon,
  label,
  circleClass = "bg-black/10 border-black/20 group-hover:bg-black/20",
  textClass = "text-black",
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  circleClass?: string;
  textClass?: string;
}) {
  return (
    <div className={cx("absolute inset-0 z-60 flex items-center justify-center bg-background/60 backdrop-blur-sm transition-all duration-500 pointer-events-auto")}>
      <button
        onClick={onClick}
        className={cx("flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95 bg-background/50 p-4 rounded-2xl backdrop-blur-sm")}
      >
        <div
          className={cx(`size-14 flex items-center justify-center rounded-full border backdrop-blur-md transition-colors ${circleClass}`)}
        >
          {icon}
        </div>
        <span className={cx(`text-sm font-medium ${textClass}`)}>{label}</span>
      </button>
    </div>
  );
}

function AnimationSlider(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="range"
      className={cx("flex-1 h-1.5 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-125")}
      {...props}
    />
  );
}

type AnimationControlsProps = {
  title: string;
  children?: React.ReactNode;
};

export function AnimationControls({ title, children }: AnimationControlsProps) {
  const { progress, handleSeek: seek, togglePlay, status } = useAnimationDemo();

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  return (
    <div className={cx("border-t border-border p-6 pointer-events-auto")}>
      <div className={cx("flex items-center justify-between mb-4")}>
        <span className={cx("font-semibold text-foreground")}>{title}</span>
        <Button onClick={togglePlay}>
          {status === "playing" ? (
            <>
              <PauseIcon size={14} /> Pause
            </>
          ) : status === "finished" ? (
            <>
              <ArrowCounterClockwiseIcon size={14} /> Replay
            </>
          ) : (
            <>
              <PlayIcon size={14} /> Play
            </>
          )}
        </Button>
      </div>
      <div className={cx("flex items-center gap-3 mb-2")}>
        <AnimationSlider min="0" max="100" value={progress} onChange={onSeek} />
      </div>
      {children}
    </div>
  );
}

type AnimatedCursorProps = {
  moveAnimationName: string;
  rippleAnimationName: string;
  className?: string;
  transform?: string;
};

export function AnimatedCursor({
  moveAnimationName,
  rippleAnimationName,
  className,
  transform,
}: AnimatedCursorProps) {
  const { status, animationStyle } = useAnimationDemo();

  if (status === "idle") return null;

  return (
    <div
      className={cn("absolute z-50 pointer-events-none", className)}
      style={{
        ...animationStyle,
        animationName: moveAnimationName,
        transform: transform,
      }}
    >
      <Cursor />
      {/* Ripple */}
      <div
        className={cx("absolute top-0 left-0 size-8 rounded-full bg-foreground/50 -translate-x-1/2 -translate-y-1/2 pointer-events-none")}
        style={{
          ...animationStyle,
          animationName: rippleAnimationName,
        }}
      />
    </div>
  );
}
