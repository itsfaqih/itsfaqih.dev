import { cx } from "@/stylex";

export type ButtonVariant =
  | "neutral"
  | "brand"
  | "destructive"
  | "tertiary-neutral"
  | "tertiary-brand"
  | "tertiary-destructive"
  | "secondary-brand"
  | "secondary-neutral"
  | "secondary-destructive";

export type ButtonPadding = "default" | "leading" | "trailing" | "compact";

const buttonBase = [
  "relative isolate overflow-hidden inline-flex items-center justify-center rounded-md transition-all duration-200 text-sm backdrop-blur-md cursor-default disabled:pointer-events-none disabled:cursor-not-allowed",
  "active:scale-95",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "before:absolute before:inset-0 before:bg-current before:opacity-0 before:scale-0 before:rounded-full before:transition-transform before:duration-0 active:before:duration-300 active:before:scale-150 active:before:opacity-10",
] as const;

const variantStyles: Record<ButtonVariant, string> = {
  neutral: [
    "text-neutral-foreground border border-border",
    "bg-popover backdrop-blur-lg",
    "after:absolute after:inset-0 after:bg-black/5 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
  ].join(" "),
  brand: [
    "text-brand-foreground border border-brand/20",
    "bg-brand/90 backdrop-blur-md",
    "bg-linear-to-b from-white/25 to-transparent",
    "after:absolute after:inset-0 after:bg-black/10 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
  ].join(" "),
  destructive: [
    "text-destructive-foreground border border-destructive/20 focus-visible:ring-destructive",
    "bg-destructive/90 backdrop-blur-md",
    "bg-linear-to-b from-white/25 to-transparent",
    "after:absolute after:inset-0 after:bg-black/10 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
  ].join(" "),
  "tertiary-neutral": [
    "text-muted-foreground hover:text-foreground border border-transparent",
    "bg-transparent backdrop-blur-sm",
    "button-tertiary-neutral-hover-surface after:absolute after:inset-0 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
  ].join(" "),
  "tertiary-brand": [
    "text-brand border border-transparent",
    "bg-transparent backdrop-blur-sm",
    "button-tertiary-brand-hover-surface after:absolute after:inset-0 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
  ].join(" "),
  "tertiary-destructive": [
    "text-destructive border border-transparent focus-visible:ring-destructive",
    "bg-transparent backdrop-blur-sm",
    "button-tertiary-destructive-hover-surface after:absolute after:inset-0 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
  ].join(" "),
  "secondary-brand": [
    "text-brand border border-brand/20 dark:border-brand/30",
    "bg-popover",
    "bg-linear-to-b from-brand/10 to-brand/5 button-secondary-brand-surface",
    "after:absolute after:inset-0 after:bg-linear-to-b after:from-brand/20 after:to-brand/10 after:dark:from-brand/30 after:dark:to-brand/20 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
  ].join(" "),
  "secondary-neutral": [
    "text-foreground border border-muted-foreground/20 dark:border-white/10",
    "bg-card",
    "bg-linear-to-b from-muted-foreground/5 to-muted-foreground/0 button-secondary-neutral-surface",
    "after:absolute after:inset-0 after:bg-linear-to-b after:from-muted-foreground/10 after:to-muted-foreground/5 after:dark:from-white/20 after:dark:to-white/10 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
  ].join(" "),
  "secondary-destructive": [
    "text-destructive border border-destructive/20 dark:border-destructive/30 focus-visible:ring-destructive",
    "bg-popover",
    "bg-linear-to-b from-destructive/10 to-destructive/5 button-secondary-destructive-surface",
    "after:absolute after:inset-0 after:bg-linear-to-b after:from-destructive/20 after:to-destructive/10 after:dark:from-destructive/30 after:dark:to-destructive/20 after:opacity-0 after:transition-opacity select-none hover:after:opacity-100",
  ].join(" "),
};

const paddingStyles: Record<ButtonPadding, string> = {
  default: "px-3 h-8.5",
  leading: "pl-2 pr-3 h-8.5",
  trailing: "pl-3 pr-2 h-8.5",
  compact: "px-2 h-8.5",
};

function resolvePadding(
  padding: ButtonPadding | undefined,
  hasLeadingIcon: boolean,
  hasTrailingIcon: boolean,
): ButtonPadding {
  if (padding) return padding;
  if (hasLeadingIcon && hasTrailingIcon) return "compact";
  if (hasLeadingIcon) return "leading";
  if (hasTrailingIcon) return "trailing";
  return "default";
}

export type ButtonClassNamesOptions = {
  variant?: ButtonVariant;
  className?: string;
  padding?: ButtonPadding;
  leadingIcon?: unknown;
  trailingIcon?: unknown;
  isPending?: boolean;
};

export function buttonClassNames({
  variant = "neutral",
  className,
  padding,
  leadingIcon,
  trailingIcon,
  isPending = false,
}: ButtonClassNamesOptions) {
  const resolvedPadding = resolvePadding(padding, Boolean(leadingIcon), Boolean(trailingIcon));
  return cx(
    buttonBase,
    variantStyles[variant],
    !isPending && "button-disabled-state",
    paddingStyles[resolvedPadding],
    isPending && "cursor-wait",
    className,
  );
}

export function getButtonClasses({
  variant = "neutral",
  className,
  hasLeadingIcon = false,
  hasTrailingIcon = false,
}: {
  variant?: ButtonVariant;
  className?: string;
  hasLeadingIcon?: boolean;
  hasTrailingIcon?: boolean;
}) {
  return cx(
    buttonBase,
    variantStyles[variant],
    paddingStyles[resolvePadding(undefined, hasLeadingIcon, hasTrailingIcon)],
    className,
  );
}
