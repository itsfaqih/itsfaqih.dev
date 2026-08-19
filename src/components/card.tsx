import { cx } from "@/stylex";
import type { ComponentPropsWithoutRef, ElementType } from "react";

type CardOwnProps = {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  as?: ElementType;
};

export interface CardProps<T extends ElementType = "div"> extends CardOwnProps {
  as?: T;
}

export function Card<T extends ElementType = "div">({
  as,
  children,
  className,
  hoverEffect = true,
  ...props
}: CardProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps>) {
  const Component = as || "div";

  return (
    <Component
      className={cx(
        "rounded-xl border border-border bg-card backdrop-blur-md transition-all duration-300",
        hoverEffect && "hover:border-muted-foreground/30",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
