import { cx } from "@/stylex";
import type { ComponentType } from "react";

export function FlowStep({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className={cx("flex items-start gap-4")}>
      <div className={cx("size-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0")}>
        <Icon size={20} className={cx("text-accent-foreground")} />
      </div>
      <div>
        <h3 className={cx("font-semibold text-foreground")}>{title}</h3>
        <p className={cx("text-sm text-muted-foreground mt-1")}>{description}</p>
      </div>
    </div>
  );
}
