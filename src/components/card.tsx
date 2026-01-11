import { cn } from "@/cn";
import type { ElementType, ComponentPropsWithoutRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-xl border border-border bg-card backdrop-blur-md transition-all duration-300",
  {
    variants: {
      hoverEffect: {
        true: "hover:border-muted-foreground/30",
        false: "",
      },
    },
    defaultVariants: {
      hoverEffect: true,
    },
  },
);

export interface CardProps<T extends ElementType> extends VariantProps<typeof cardVariants> {
  as?: T;
  children: React.ReactNode;
  className?: string;
}

export function Card<T extends ElementType = "div">({
  as,
  children,
  className,
  hoverEffect,
  ...props
}: CardProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof CardProps<T> | "hoverEffect">) {
  const Component = as || "div";

  return (
    <Component className={cn(cardVariants({ hoverEffect, className }))} {...props}>
      {children}
    </Component>
  );
}
