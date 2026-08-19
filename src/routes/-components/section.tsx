import { cx } from "@/stylex";
import type { ReactNode } from "react";
import { cn } from "../../cn";

export type SectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
  id?: string;
};

export function Section({ title, children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("mb-12 scroll-mt-24", className)}>
      <h2 className={cx("text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide")}>
        {title}
      </h2>
      <div className={cx("space-y-3")}>{children}</div>
    </section>
  );
}
