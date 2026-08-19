import { cx } from "@/stylex";
import { cn } from "@/cn";
import { useAnimationDemo } from "../../../components/animation-demo";

export function KeyboardKey({
  children,
  animationName,
  className,
}: {
  children: React.ReactNode;
  animationName?: string;
  className?: string;
}) {
  const { status, animationStyle } = useAnimationDemo();
  return (
    <div className={cx("absolute top-8 right-8 z-20 origin-bottom")}>
      <div
        className={cn(
          "font-bold font-mono leading-none transition-all select-none border-2 flex items-center justify-center",
          "px-3 py-2 rounded-lg text-xs bg-zinc-100 border-zinc-300 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-400",
          className,
        )}
        style={{
          ...animationStyle,
          animationName: status !== "idle" && animationName ? animationName : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
