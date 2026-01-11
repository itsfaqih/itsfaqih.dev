import { ReactNode } from "react";
import { cn } from "../cn";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "2xl" | "3xl";
  className?: string;
}

export function PageContainer({ children, maxWidth = "2xl", className = "" }: PageContainerProps) {
  const maxWidthClass = maxWidth === "3xl" ? "max-w-3xl" : "max-w-2xl";

  return (
    <div
      className={cn(maxWidthClass, "mx-auto px-6 pt-8 sm:pt-24 pb-20 animate-fade-in", className)}
    >
      {children}
    </div>
  );
}
