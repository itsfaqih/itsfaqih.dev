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
    <div className={cx("p-6 rounded-xl border border-border bg-card")}>
      <div className={cx("flex items-center gap-3 mb-4")}>
        <div className={cx("size-10 rounded-lg bg-zinc-500/10 dark:bg-zinc-500/20 flex items-center justify-center")}>
          <Icon size={20} className={cx("text-foreground")} />
        </div>
        <h3 className={cx("font-semibold text-foreground")}>{title}</h3>
      </div>
      <div className={cx("text-sm text-muted-foreground space-y-2")}>{children}</div>
    </div>
  );
}