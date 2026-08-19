import { cx } from "@/stylex";
import { CaretDownIcon, CaretUpIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "../../cn";
import { Button } from "../../components/button";
import { Section } from "./section";
import { TimelineItem } from "./timeline-item";
import type { TechTag } from "./tech-tag";

export type Experience = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string[];
  tags: TechTag[];
};

export type ExperienceSectionProps = {
  experiences: Experience[];
};

const INITIAL_EXPERIENCE_COUNT = 3;

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasMore = experiences.length > INITIAL_EXPERIENCE_COUNT;

  return (
    <Section title="Experience">
      <div className={cx("relative")}>
        {experiences.map((job, index) => {
          const isHidden = !isExpanded && index >= INITIAL_EXPERIENCE_COUNT;
          const isLastVisible = isExpanded
            ? index === experiences.length - 1
            : index === INITIAL_EXPERIENCE_COUNT - 1 && !hasMore;

          return (
            <div
              key={job.id}
              className={cx("grid transition-all duration-300 ease-out")}
              style={{
                gridTemplateRows: isHidden ? "0fr" : "1fr",
                opacity: isHidden ? 0 : 1,
              }}
            >
              <div className={cx("overflow-hidden")}>
                <TimelineItem
                  title={job.title}
                  subtitle={job.subtitle}
                  date={job.date}
                  description={job.description}
                  tags={job.tags}
                  isLast={isLastVisible}
                />
              </div>
            </div>
          );
        })}

        {/* Bottom fade gradient - visible when collapsed with more items */}
        {hasMore && (
          <div
            className={cn(
              "bg-linear-to-b from-transparent via-transparent to-background absolute bottom-0 left-0 right-0 h-24 pointer-events-none transition-opacity duration-300",
              isExpanded ? "opacity-0" : "opacity-100",
            )}
          />
        )}
      </div>

      {hasMore && (
        <Button
          variant="tertiary-neutral"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cx("w-full")}
        >
          {isExpanded ? (
            <>
              <CaretUpIcon size={14} />
              Show less
            </>
          ) : (
            <>
              <CaretDownIcon size={14} />
              Show all ({experiences.length})
            </>
          )}
        </Button>
      )}
    </Section>
  );
}
