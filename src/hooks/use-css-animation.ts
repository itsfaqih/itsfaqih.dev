import { useEffect, useRef, useState } from "react";

export type AnimationStatus = "idle" | "playing" | "paused" | "finished";

type UseCssAnimationConfig = {
  duration: number;
  masterAnimationName: string;
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

export function useCssAnimation({ duration, masterAnimationName }: UseCssAnimationConfig) {
  const [status, setStatus] = useState<AnimationStatus>("idle");
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
    let frameId = 0;
    const loop = () => {
      const container = containerRef.current;
      if (status === "playing" && container) {
        const animations = container.getAnimations({ subtree: true });
        const master = animations.find(
          (animation) => (animation as CSSAnimation).animationName === masterAnimationName,
        );

        if (master) {
          const currentTime = (master.currentTime as number) || 0;
          setProgress((currentTime / duration) * 100);
          if (currentTime >= duration) {
            setStatus("finished");
            setProgress(100);
          }
        }
      }
      frameId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(frameId);
  }, [status, duration, masterAnimationName]);

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
