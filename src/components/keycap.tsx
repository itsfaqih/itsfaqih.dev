import React from "react";
import { cn } from "../cn";

interface KeycapProps {
  children: React.ReactNode;
  pressed?: boolean;
  className?: string;
}

export function Keycap({ children, pressed, className = "" }: KeycapProps) {
  return (
    <div
      className={cn(
        // Base styles
        "px-4 py-3 rounded-xl font-bold font-mono text-xl leading-none transition-all duration-100 select-none border-2",
        // Light mode: Black (Dark Grey body for 3D contrast)
        "bg-zinc-900 border-zinc-500 text-white shadow-[0_4px_0_#000000]",
        // Dark mode: White
        "dark:bg-white dark:border-slate-300 dark:text-slate-700 dark:shadow-[0_4px_0_#94a3b8]",
        // Pressed state
        pressed ? "translate-y-1 shadow-none dark:shadow-none" : "",
        className,
      )}
    >
      {children}
    </div>
  );
}
