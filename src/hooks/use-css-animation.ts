import { useEffect, useRef, useState } from "react";

export type AnimationStatus = "idle" | "playing" | "paused" | "finished";

type UseCssAnimationConfig = {
  duration: number;
  masterAnimationName: string;
  autoplay?: boolean;
  loop?: boolean;
};

function setAnimationTime(container: HTMLDivElement | null, timeMs: number) {
  if (!container) return;
  for (const animation of container.getAnimations({ subtree: true })) {
    animation.currentTime = timeMs;
  }
}

function pauseAnimations(container: HTMLDivElement | null) {
  if (!container) return;
  for (const animation of container.getAnimations({ subtree: true })) {
    animation.pause();
  }
}

function playAnimations(container: HTMLDivElement | null) {
  if (!container) return;
  for (const animation of container.getAnimations({ subtree: true })) {
    animation.play();
  }
}

export function useCssAnimation({
  duration,
  masterAnimationName,
  autoplay = false,
  loop = false,
}: UseCssAnimationConfig) {
  const [status, setStatus] = useState<AnimationStatus>(() => (autoplay ? "playing" : "idle"));
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "playing") {
      playAnimations(containerRef.current);
    } else {
      pauseAnimations(containerRef.current);
    }
  }, [status]);

  useEffect(() => {
    if (status !== "playing") return;

    let frameId = 0;
    const tick = () => {
      const container = containerRef.current;
      if (container) {
        const master = container.getAnimations({ subtree: true }).find(
          (animation) => animation instanceof CSSAnimation && animation.animationName === masterAnimationName,
        );

        if (master) {
          // Document-timeline CSS animations report milliseconds; Number also handles an unresolved null time.
          const currentTime = Number(master.currentTime);
          const progressTime = loop ? currentTime % duration : Math.min(currentTime, duration);
          setProgress((progressTime / duration) * 100);
          if (!loop && currentTime >= duration) {
            setStatus("finished");
            setProgress(100);
            return;
          }
        }
      }
      frameId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(frameId);
  }, [status, duration, masterAnimationName, loop]);

  const handleSeek = (value: number) => {
    setProgress(value);
    if (status !== "paused") {
      setStatus("paused");
    }
    setAnimationTime(containerRef.current, (value / 100) * duration);
  };

  const restart = () => {
    setProgress(0);
    setAnimationTime(containerRef.current, 0);
    setStatus("playing");
  };

  const togglePlay = () => {
    if (status === "playing") {
      setStatus("paused");
    } else if (status === "paused") {
      setStatus("playing");
    } else {
      restart();
    }
  };

  return {
    status,
    progress,
    containerRef,
    handleSeek,
    togglePlay,
    restart,
  };
}
