import { cx } from "@/stylex";
import { createContext, useContext } from "react";
import { useCssAnimation } from "../hooks/use-css-animation";
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
  autoplay = false,
  loop = false,
  children,
  className,
}: {
  duration: number;
  masterAnimationName: string;
  autoplay?: boolean;
  loop?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const animationData = useCssAnimation({ duration, masterAnimationName, autoplay, loop });

  const animationStyle = {
    animationDuration: `${duration}ms`,
    ...ANIMATION_STYLE_DEFAULTS,
    animationIterationCount: loop ? "infinite" : ANIMATION_STYLE_DEFAULTS.animationIterationCount,
    animationPlayState: animationData.status === "playing" ? "running" : "paused",
  };

  return (
    <AnimationDemoContext.Provider value={{ ...animationData, animationStyle }}>
      <Card className={cx("overflow-hidden h-full flex flex-col", className)} hoverEffect={false}>
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
      className={cx(
        "rk-stage relative p-8 flex flex-col items-center justify-center min-h-[400px] flex-1 overflow-hidden",
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
              <ArrowCounterClockwiseIcon size={26} weight="bold" />
            ) : (
              <PlayIcon size={26} weight="fill" />
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
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rk-press" onClick={onClick} role="presentation">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
      >
        <span className="disc">{icon}</span>
        {label}
      </button>
    </div>
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
    <div className="rk-transport">
      <div className="rk-transport-top">
        <span>{title}</span>
        <button type="button" className="btn soft sm" onClick={togglePlay}>
          {status === "playing" ? (
            <>
              <PauseIcon size={14} weight="fill" /> Pause
            </>
          ) : status === "finished" ? (
            <>
              <ArrowCounterClockwiseIcon size={14} weight="bold" /> Replay
            </>
          ) : (
            <>
              <PlayIcon size={14} weight="fill" /> Play
            </>
          )}
        </button>
      </div>
      <input
        type="range"
        className="rk-scrub"
        aria-label={`Scrub ${title}`}
        min="0"
        max="100"
        value={progress}
        onChange={onSeek}
        style={{ "--p": `${progress}%` }}
      />
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
      className={cx("absolute z-50 pointer-events-none", className)}
      style={{
        ...animationStyle,
        animationName: moveAnimationName,
        transform: transform,
      }}
    >
      <Cursor />
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
