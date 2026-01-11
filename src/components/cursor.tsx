import { CursorIcon } from "@phosphor-icons/react";
import { cn } from "@/cn";

type CursorProps = {
  className?: string;
  size?: number;
};

/**
 * A reusable cursor component with consistent styling across all demos.
 * Uses white fill and black stroke for visibility in both light and dark modes.
 */
export function Cursor({ className, size = 18 }: CursorProps) {
  return (
    <CursorIcon
      className={cn("text-white stroke-black stroke-6 rotate-20", className)}
      weight="fill"
      size={size}
    />
  );
}
