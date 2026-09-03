import { cx } from "@/stylex";
import type { ComponentType, ReactNode } from "react";

export function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: ReactNode;
}) {
  return (
    <div data-rule-of-thumb-card="true" className={cx("p-6 rounded-xl border border-border bg-card")}>
      <div className={cx("flex items-center gap-3 mb-4")}>
        <div className={cx("size-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center")}>
          <Icon size={20} className={cx("text-accent-foreground")} />
        </div>
        <h3 className={cx("font-semibold text-foreground")}>{title}</h3>
      </div>
      <div className={cx("text-sm text-muted-foreground space-y-2")}>{children}</div>
    </div>
  );
}