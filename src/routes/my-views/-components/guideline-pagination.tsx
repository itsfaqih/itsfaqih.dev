import { Link, useLocation } from "@tanstack/react-router";
import { GUIDELINES } from "../../../data/guidelines";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { GlassyCard } from "../../../components/glassy-card";

export function GuidelinePagination() {
  const location = useLocation();
  const currentIndex = GUIDELINES.findIndex((g) => g.href === location.pathname);

  if (currentIndex === -1) return null;

  const prevGuideline = GUIDELINES[currentIndex - 1];
  const nextGuideline = GUIDELINES[currentIndex + 1];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16 pt-8 border-t border-(--border-color)">
      {/* Previous */}
      {prevGuideline ? (
        <Link to={prevGuideline.href} className="group block h-full">
          <GlassyCard className="h-full p-6 flex flex-col items-start gap-2 group-hover:border-(--text-secondary)/50 transition-colors">
            <div className="flex items-center gap-2 text-sm text-(--text-secondary) mb-1">
              <ArrowLeftIcon
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Previous View
            </div>
            <span className="font-semibold text-(--text-primary) text-lg">
              {prevGuideline.title}
            </span>
          </GlassyCard>
        </Link>
      ) : (
        <div /> /* Spacer */
      )}

      {/* Next */}
      {nextGuideline ? (
        <Link to={nextGuideline.href} className="group block h-full">
          <GlassyCard className="h-full p-6 flex flex-col items-end gap-2 group-hover:border-(--text-secondary)/50 transition-colors text-right">
            <div className="flex items-center gap-2 text-sm text-(--text-secondary) mb-1">
              Next View
              <ArrowRightIcon
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
            <span className="font-semibold text-(--text-primary) text-lg">
              {nextGuideline.title}
            </span>
          </GlassyCard>
        </Link>
      ) : (
        <div /> /* Spacer */
      )}
    </div>
  );
}
