import { cx } from "@/stylex";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { TechTagComponent } from "./tech-tag";
import type { ListItemProps } from "./list-item-types";

export function ListItemContent({
  title,
  subtitle,
  date,
  tags,
  isExternal,
  description,
}: Omit<ListItemProps, "href">) {
  return (
    <div className={cx("group relative grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 sm:gap-4 items-start p-4 -mx-4 rounded-2xl squircle transition-all duration-300 border border-transparent hover:border-border hover:bg-linear-to-br hover:from-gray-500/10 hover:to-gray-500/5 hover:backdrop-blur-md")}>
      <div className={cx("space-y-1.5")}>
        <div className={cx("flex items-center gap-2")}>
          <h3 className={cx("font-medium text-foreground text-sm transition-colors")}>{title}</h3>
          {isExternal && (
            <ArrowUpRightIcon
              size={12}
              className={cx("text-muted-foreground opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all")}
            />
          )}
        </div>

        {subtitle && <p className={cx("text-sm text-muted-foreground")}>{subtitle}</p>}

        {description && (
          <p className={cx("text-sm text-muted-foreground leading-relaxed max-w-xl")}>{description}</p>
        )}

        {tags && tags.length > 0 && (
          <div className={cx("flex flex-wrap gap-1.5 mt-2")}>
            {tags.map((tag) => (
              <TechTagComponent key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>

      {date && (
        <span className={cx("text-xs text-muted-foreground tabular-nums whitespace-nowrap")}>{date}</span>
      )}
    </div>
  );
}
