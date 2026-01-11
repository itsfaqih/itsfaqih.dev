import { useState, useRef, useEffect, useCallback } from "react";

export type AnimationStatus = "idle" | "playing" | "paused" | "finished";

interface UseCssAnimationConfig {
  duration: number;
  masterAnimationName: string;
}

export function useCssAnimation({ duration, masterAnimationName }: UseCssAnimationConfig) {
  const [status, setStatus] = useState<AnimationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const setAnimationTime = useCallback((timeMs: number) => {
    if (!containerRef.current) return;
    const anims = containerRef.current.getAnimations({ subtree: true });
    anims.forEach((anim) => {
      anim.currentTime = timeMs;
    });
  }, []);

  const pauseAnimations = useCallback(() => {
    if (!containerRef.current) return;
    const anims = containerRef.current.getAnimations({ subtree: true });
    anims.forEach((anim) => anim.pause());
  }, []);

  const playAnimations = useCallback(() => {
    if (!containerRef.current) return;
    const anims = containerRef.current.getAnimations({ subtree: true });
    anims.forEach((anim) => anim.play());
  }, []);

  useEffect(() => {
    if (status === "playing") {
      playAnimations();
    } else {
      pauseAnimations();
    }
  }, [status, playAnimations, pauseAnimations]);

  useEffect(() => {
    let frameId: number;
    const loop = () => {
      if (status === "playing" && containerRef.current) {
        const anims = containerRef.current.getAnimations({ subtree: true });
        const master = anims.find((a) => {
          // @ts-ignore - animationName is CSS specific but available in browsers
          return a.animationName === masterAnimationName;
        });

        if (master) {
          const t = (master.currentTime as number) || 0;
          setProgress((t / duration) * 100);
          if (t >= duration) {
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

  const handleSeek = (val: number) => {
    setProgress(val);
    if (status !== "paused") {
      setStatus("paused");
    }
    setAnimationTime((val / 100) * duration);
  };

  const restart = () => {
    setProgress(0);
    setAnimationTime(0);
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
