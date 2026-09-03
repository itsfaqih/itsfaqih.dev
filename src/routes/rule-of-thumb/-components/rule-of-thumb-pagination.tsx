import { cx } from "@/stylex";
import { Link, useLocation } from "@tanstack/react-router";
import { GUIDELINES } from "../../../data/guidelines";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Card } from "../../../components/card";

export function RuleOfThumbPagination() {
  const location = useLocation();
  // Filter out hidden guidelines for pagination
  const visibleGuidelines = GUIDELINES.filter((g) => !g.hidden);
  const currentIndex = visibleGuidelines.findIndex((g) => g.href === location.pathname);

  if (currentIndex === -1) return null;

  const prevGuideline = visibleGuidelines[currentIndex - 1];
  const nextGuideline = visibleGuidelines[currentIndex + 1];

  return (
    <div className={cx("grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16 pt-8 border-t border-border")}>
      {/* Previous */}
      {prevGuideline ? (
        <Link to={prevGuideline.href} preload="intent" className={cx("group block h-full")}>
          <Card className={cx("h-full p-6 flex flex-col items-start gap-2 group-hover:border-muted-foreground/50 transition-colors")}>
            <div className={cx("flex items-center gap-2 text-sm text-muted-foreground mb-1")}>
              <ArrowLeftIcon
                size={16}
                className={cx("group-hover:-translate-x-1 transition-transform")}
              />
              Previous View
            </div>
            <span className={cx("font-semibold text-foreground text-lg")}>{prevGuideline.title}</span>
          </Card>
        </Link>
      ) : (
        <div /> /* Spacer */
      )}

      {/* Next */}
      {nextGuideline ? (
        <Link to={nextGuideline.href} className={cx("group block h-full")}>
          <Card className={cx("h-full p-6 flex flex-col items-end gap-2 group-hover:border-muted-foreground/50 transition-colors text-right")}>
            <div className={cx("flex items-center gap-2 text-sm text-muted-foreground mb-1")}>
              Next View
              <ArrowRightIcon
                size={16}
                className={cx("group-hover:translate-x-1 transition-transform")}
              />
            </div>
            <span className={cx("font-semibold text-foreground text-lg")}>{nextGuideline.title}</span>
          </Card>
        </Link>
      ) : (
        <div /> /* Spacer */
      )}
    </div>
  );
}
