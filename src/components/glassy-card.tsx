import { cn } from "@/cn";
import { ElementType, ComponentPropsWithoutRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-xl border border-(--border-color) bg-(--bg-secondary)/50 backdrop-blur-md transition-all duration-300",
  {
    variants: {
      hoverEffect: {
        true: "hover:border-(--text-secondary)/30",
        false: "",
      },
    },
    defaultVariants: {
      hoverEffect: true,
    },
  },
);

export interface GlassyCardProps<T extends ElementType> extends VariantProps<typeof cardVariants> {
  as?: T;
  children: React.ReactNode;
  className?: string;
}

export function GlassyCard<T extends ElementType = "div">({
  as,
  children,
  className,
  hoverEffect,
  ...props
}: GlassyCardProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof GlassyCardProps<T> | "hoverEffect">) {
  const Component = as || "div";

  return (
    <Component className={cn(cardVariants({ hoverEffect, className }))} {...props}>
      {children}
    </Component>
  );
}
