import { cx } from "@/stylex";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { TechTagComponent } from "./tech-tag";
import type { TechTag } from "./tech-tag";

type TimelineItemProps = {
  title: string;
  subtitle?: string;
  date?: string;
  tags?: TechTag[];
  isExternal?: boolean;
  description?: string[];
  isLast?: boolean;
};

export function TimelineItem({
  title,
  subtitle,
  date,
  tags,
  isExternal = false,
  description,
  isLast = false,
}: TimelineItemProps) {
  return (
    <div className={cx("group relative flex gap-6")}>
      {/* Timeline line and dot */}
      <div className={cx("relative flex flex-col items-center")}>
        {/* Dot */}
        <div className={cx("size-2.5 rounded-full bg-foreground ring-4 ring-background z-10 mt-1.5")} />

        {/* Connecting Line - absolutely positioned to connect perfectly */}
        {!isLast && <div className={cx("absolute top-2.5 bottom-[-40px] w-px bg-border")} />}
      </div>

      {/* Content */}
      <div className={cx("flex-1 pb-10", isLast && "pb-0")}>
        <div className={cx("flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2")}>
          <div>
            <div className={cx("flex items-center gap-2")}>
              <h3 className={cx("font-medium text-foreground text-base")}>{title}</h3>
              {isExternal && (
                <ArrowUpRightIcon
                  size={14}
                  className={cx("text-muted-foreground opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all")}
                />
              )}
            </div>

            {subtitle && <p className={cx("text-sm text-muted-foreground mt-1")}>{subtitle}</p>}
          </div>

          {date && (
            <span className={cx("text-sm text-muted-foreground tabular-nums whitespace-nowrap")}>
              {date}
            </span>
          )}
        </div>

        {description && description.length > 0 && (
          <ul className={cx("text-sm text-muted-foreground leading-relaxed max-w-xl mb-3 list-disc pl-4 space-y-1")}>
            {description.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}

        {tags && tags.length > 0 && (
          <div className={cx("flex flex-wrap gap-1.5")}>
            {tags.map((tag) => (
              <TechTagComponent key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
