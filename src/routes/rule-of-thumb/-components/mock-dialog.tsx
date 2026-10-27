import type { ReactNode } from "react";
import { cn } from "@/cn";
import { useAnimationDemo } from "../../../components/animation-demo";

export function MockDialog({
  children,
  className,
  animationName,
  transform = "scale(1)",
}: {
  children: ReactNode;
  className?: string;
  animationName?: string;
  transform?: string;
}) {
  const { status, animationStyle } = useAnimationDemo();
  return (
    <div
      className={cn(
        "rk-window absolute left-1/2 top-1/2 z-20 outline-none p-6",
        className || "w-full max-w-sm",
      )}
      style={{
        ...animationStyle,
        animationName: status !== "idle" ? animationName : "none",
        opacity: status === "idle" ? 1 : undefined,
        transform,
        translate: "-50% -50%",
      }}
    >
      {children}
    </div>
  );
}
