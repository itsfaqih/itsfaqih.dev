import { cn } from "@/cn";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  [
    "relative overflow-hidden inline-flex items-center justify-center rounded-md transition-all duration-200 text-sm backdrop-blur-md cursor-default",
    "active:scale-95",
    // Ripple Effect
    "before:absolute before:inset-0 before:bg-current before:opacity-0 before:scale-0 before:rounded-full before:transition-transform before:duration-0 active:before:duration-300 active:before:scale-150 active:before:opacity-10",
  ],
  {
    variants: {
      variant: {
        secondary: [
          "text-(--text-primary) border border-gray-500/20 dark:border-white/10",
          "bg-white dark:bg-zinc-900",
          "bg-linear-to-b from-gray-500/5 to-gray-500/0 dark:from-white/10 dark:to-white/5",
          "after:absolute after:inset-0 after:bg-linear-to-b after:from-gray-500/10 after:to-gray-500/5 after:dark:from-white/20 after:dark:to-white/10 after:opacity-0 after:transition-opacity after:duration-200 after:ease-out hover:after:opacity-100",
        ],
        primary: [
          "text-blue-700 dark:text-blue-100 border border-blue-500/20 dark:border-blue-400/30",
          "bg-white dark:bg-zinc-900",
          "bg-linear-to-b from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/10",
          "after:absolute after:inset-0 after:bg-linear-to-b after:from-blue-500/20 after:to-blue-500/10 after:dark:from-blue-400/30 after:dark:to-blue-400/20 after:opacity-0 after:transition-opacity after:duration-200 after:ease-out hover:after:opacity-100",
        ],
        destructive: [
          "text-red-700 dark:text-red-100 border border-red-500/20 dark:border-red-400/30",
          "bg-linear-to-b from-red-500/10 to-red-500/5 dark:from-red-500/20 dark:to-red-500/10",
          "after:absolute after:inset-0 after:bg-linear-to-b after:from-red-500/20 after:to-red-500/10 after:dark:from-red-400/30 after:dark:to-red-400/20 after:opacity-0 after:transition-opacity after:duration-200 after:ease-out hover:after:opacity-100",
        ],
        ghost: [
          "text-zinc-500 dark:text-zinc-400 border border-transparent hover:text-(--text-primary)",
          "bg-transparent",
          "hover:border-gray-500/20 dark:hover:border-white/10",
          "after:absolute after:inset-0 after:bg-linear-to-b after:from-gray-500/10 after:to-gray-500/5 after:dark:from-white/20 after:dark:to-white/10 after:opacity-0 after:transition-opacity after:duration-200 after:ease-out hover:after:opacity-100",
        ],
        "ghost-destructive": [
          "text-red-600 dark:text-red-400 border border-transparent hover:text-red-700 dark:hover:text-red-100",
          "bg-transparent",
          "hover:border-red-500/20 dark:hover:border-red-400/30",
          "after:absolute after:inset-0 after:bg-linear-to-b after:from-red-500/10 after:to-red-500/5 after:dark:from-red-400/20 after:dark:to-red-400/10 after:opacity-0 after:transition-opacity after:duration-200 after:ease-out hover:after:opacity-100",
        ],
      },
      padding: {
        default: "px-3 h-8.5",
        leading: "pl-2 pr-3 h-8.5",
        trailing: "pl-3 pr-2 h-8.5",
        compact: "px-2 h-8.5",
      },
    },
    defaultVariants: {
      variant: "secondary",
      padding: "default",
    },
  },
);

export interface GlassyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const GlassyButton = React.forwardRef<HTMLButtonElement, GlassyButtonProps>(
  ({ className, children, variant, leadingIcon, trailingIcon, padding, ...props }, ref) => {
    const computedPadding = padding
      ? padding
      : leadingIcon && trailingIcon
        ? "compact"
        : leadingIcon
          ? "leading"
          : trailingIcon
            ? "trailing"
            : "default";
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, padding: computedPadding, className }))}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">
          {leadingIcon}
          {children}
          {trailingIcon}
        </span>
      </button>
    );
  },
);
GlassyButton.displayName = "GlassyButton";

export function getGlassyClasses(
  className?: string,
  variant: VariantProps<typeof buttonVariants>["variant"] = "secondary",
  hasLeadingIcon?: boolean,
  hasTrailingIcon?: boolean,
) {
  const computedPadding =
    hasLeadingIcon && hasTrailingIcon
      ? "compact"
      : hasLeadingIcon
        ? "leading"
        : hasTrailingIcon
          ? "trailing"
          : "default";

  return cn(buttonVariants({ variant, padding: computedPadding, className }));
}
