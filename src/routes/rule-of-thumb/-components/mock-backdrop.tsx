import { cx } from "@/stylex";
import { useAnimationDemo } from "../../../components/animation-demo";

export function MockBackdrop({ animationName }: { animationName?: string }) {
  const { status, animationStyle } = useAnimationDemo();
  return (
    <div
      className={cx("absolute inset-0 bg-white/20 dark:bg-black/40 backdrop-blur-sm z-10")}
      style={{
        ...animationStyle,
        animationName: status !== "idle" ? animationName : "none",
        opacity: status === "idle" ? 1 : undefined,
      }}
    />
  );
}
