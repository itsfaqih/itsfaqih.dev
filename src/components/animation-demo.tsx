import { createContext, useContext, useMemo } from "react";
import { useCssAnimation } from "../hooks/use-css-animation";
import { cn } from "@/cn";
import { GlassyButton } from "./glassy-button";
import { GlassyCard } from "./glassy-card";
import { PlayIcon, PauseIcon, ArrowCounterClockwiseIcon, CursorIcon } from "@phosphor-icons/react";

export const ANIMATION_STYLE_DEFAULTS = {
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

  const animationStyle = useMemo(
    () => ({
      animationDuration: `${duration}ms`,
      ...ANIMATION_STYLE_DEFAULTS,
    }),
    [duration],
  );

  return (
    <AnimationDemoContext.Provider value={{ ...animationData, animationStyle }}>
      <GlassyCard className={cn("rounded-2xl overflow-hidden h-full flex flex-col", className)}>
        {children}
      </GlassyCard>
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
      <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none">
        {children}
      </div>

      {(status === "idle" || status === "finished") && (
        <DemoOverlay
          onClick={restart}
          icon={
            status === "finished" ? (
              <ArrowCounterClockwiseIcon size={24} className="text-black ml-0" />
            ) : (
              <PlayIcon size={24} className="fill-black text-black ml-1" />
            )
          }
          label={status === "finished" ? "Replay" : "Watch Demo"}
        />
      )}
    </div>
  );
}

export function DemoOverlay({
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
    <div className="absolute inset-0 z-60 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm transition-all duration-500 pointer-events-auto">
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95 bg-white/50 dark:bg-black/50 p-4 rounded-2xl backdrop-blur-sm"
      >
        <div
          className={`p-4 rounded-full border backdrop-blur-md transition-colors ${circleClass}`}
        >
          {icon}
        </div>
        <span className={`text-sm font-medium ${textClass}`}>{label}</span>
      </button>
    </div>
  );
}

function AnimationSlider(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="range"
      className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-125"
      {...props}
    />
  );
}

interface AnimationControlsProps {
  title: string;
  children?: React.ReactNode;
}

export function AnimationControls({ title, children }: AnimationControlsProps) {
  const { progress, handleSeek: seek, togglePlay, status } = useAnimationDemo();

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  return (
    <div className="border-t border-(--border-color) p-6 pointer-events-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-black dark:text-white">{title}</span>
        <GlassyButton onClick={togglePlay}>
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
        </GlassyButton>
      </div>
      <div className="flex items-center gap-3 mb-2">
        <AnimationSlider min="0" max="100" value={progress} onChange={onSeek} />
      </div>
      {children}
    </div>
  );
}

interface AnimatedCursorProps {
  moveAnimationName: string;
  rippleAnimationName: string;
  className?: string;
  transform?: string;
}

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
      <CursorIcon className="fill-white stroke-1 rotate-20" />
      {/* Ripple */}
      <div
        className="absolute top-0 left-0 w-8 h-8 rounded-full bg-black/50 dark:bg-white/50 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          ...animationStyle,
          animationName: rippleAnimationName,
        }}
      />
    </div>
  );
}
