import type { ReactNode } from "react";
import { cx } from "@/stylex";

type PageContainerProps = {
  children: ReactNode;
  maxWidth?: "2xl" | "3xl" | "4xl";
  className?: string;
};

export function PageContainer({ children, maxWidth = "2xl", className = "" }: PageContainerProps) {
  const maxWidthClass =
    maxWidth === "4xl" ? "max-w-4xl" : maxWidth === "3xl" ? "max-w-3xl" : "max-w-2xl";

  return (
    <div className={cx("page-container", maxWidthClass, "mx-auto px-6 pt-8 sm:pt-24 pb-20 animate-fade-in", className)}>
      {children}
    </div>
  );
}
