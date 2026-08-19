import { cx } from "@/stylex";
import { Link } from "@tanstack/react-router";
import { ListItemContent } from "./list-item-content";
import type { ListItemProps } from "./list-item-types";

export type { ListItemProps, ProjectListItem } from "./list-item-types";

export function ListItem({
  title,
  subtitle,
  date,
  tags,
  href,
  isExternal = false,
  description,
}: ListItemProps) {
  const contentProps = { title, subtitle, date, tags, isExternal, description };

  if (href) {
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cx("block")}>
          <ListItemContent {...contentProps} />
        </a>
      );
    }
    return (
      <Link to={href} className={cx("block")}>
        <ListItemContent {...contentProps} />
      </Link>
    );
  }

  return <ListItemContent {...contentProps} />;
}
