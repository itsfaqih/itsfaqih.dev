import { cn } from "@/cn";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  [
    "relative isolate overflow-hidden inline-flex items-center justify-center rounded-md transition-all duration-200 text-sm backdrop-blur-md cursor-default disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
    "active:scale-95",
    // Focus State
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // Ripple Effect
    "before:absolute before:inset-0 before:bg-current before:opacity-0 before:scale-0 before:rounded-full before:transition-transform before:duration-0 active:before:duration-300 active:before:scale-150 active:before:opacity-10",
  ],
  {
    variants: {
      variant: {
        neutral: [
          "text-neutral-foreground border border-border",
          "bg-background/60 dark:bg-zinc-900/50 backdrop-blur-lg",
          "bg-linear-to-b from-white/60 to-transparent dark:from-white/10 dark:to-transparent",
          "after:absolute after:inset-0 after:bg-black/5 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
        ],
        brand: [
          "text-brand-foreground border border-brand/20",
          "bg-brand/90 backdrop-blur-md",
          "bg-linear-to-b from-white/25 to-transparent",
          "after:absolute after:inset-0 after:bg-black/10 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
        ],
        destructive: [
          "text-destructive-foreground border border-destructive/20 focus-visible:ring-destructive",
          "bg-destructive/90 backdrop-blur-md",
          "bg-linear-to-b from-white/25 to-transparent",
          "after:absolute after:inset-0 after:bg-black/10 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
        ],
        "tertiary-neutral": [
          "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/40",
          "bg-transparent backdrop-blur-sm",
          "after:absolute after:inset-0 after:bg-accent/50 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
        ],
        "tertiary-brand": [
          "text-brand border border-transparent hover:border-brand/20",
          "bg-transparent backdrop-blur-sm",
          "after:absolute after:inset-0 after:bg-linear-to-b after:from-brand/10 after:to-brand/5 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
        ],
        "tertiary-destructive": [
          "text-destructive border border-transparent hover:border-destructive/20 focus-visible:ring-destructive",
          "bg-transparent backdrop-blur-sm",
          "after:absolute after:inset-0 after:bg-linear-to-b after:from-destructive/10 after:to-destructive/5 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
        ],
        "secondary-brand": [
          "text-brand border border-brand/20 dark:border-brand/30",
          "bg-white dark:bg-zinc-900",
          "bg-linear-to-b from-brand/10 to-brand/5 dark:from-brand/20 dark:to-brand/10",
          "after:absolute after:inset-0 after:bg-linear-to-b after:from-brand/20 after:to-brand/10 after:dark:from-brand/30 after:dark:to-brand/20 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
        ],
        "secondary-neutral": [
          "text-foreground border border-muted-foreground/20 dark:border-white/10",
          "bg-white dark:bg-zinc-900",
          "bg-linear-to-b from-muted-foreground/5 to-muted-foreground/0 dark:from-white/10 dark:to-white/5",
          "after:absolute after:inset-0 after:bg-linear-to-b after:from-muted-foreground/10 after:to-muted-foreground/5 after:dark:from-white/20 after:dark:to-white/10 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
        ],
        "secondary-destructive": [
          "text-destructive border border-destructive/20 dark:border-destructive/30 focus-visible:ring-destructive",
          "bg-white dark:bg-zinc-900",
          "bg-linear-to-b from-destructive/10 to-destructive/5 dark:from-destructive/20 dark:to-destructive/10",
          "after:absolute after:inset-0 after:bg-linear-to-b after:from-destructive/20 after:to-destructive/10 after:dark:from-destructive/30 after:dark:to-destructive/20 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
        ],
      },
      padding: {
        default: "px-3 h-8.5",
        leading: "pl-2 pr-3 h-8.5",
        trailing: "pl-3 pr-2 h-8.5",
        compact: "px-2 h-8.5",
      },
      pending: {
        true: "cursor-wait",
        false: "",
      },
    },
    defaultVariants: {
      variant: "neutral",
      padding: "default",
      pending: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
  isPending?: boolean;
}

export function Button({
  className,
  children,
  variant,
  leadingIcon,
  trailingIcon,
  padding,
  isPending = false,
  ref,
  disabled,
  ...props
}: ButtonProps) {
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
      disabled={isPending || disabled}
      className={cn(
        buttonVariants({ variant, padding: computedPadding, pending: isPending, className }),
      )}
      {...props}
    >
      <span className="relative z-1 flex items-center gap-2">
        {leadingIcon}
        {children}
        {trailingIcon}
      </span>
    </button>
  );
}

export function getButtonClasses({
  variant,
  className,
  hasLeadingIcon,
  hasTrailingIcon,
}: {
  variant: VariantProps<typeof buttonVariants>["variant"];
  className?: string;
  hasLeadingIcon?: boolean;
  hasTrailingIcon?: boolean;
}) {
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
