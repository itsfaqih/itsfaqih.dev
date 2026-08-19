import { cx } from "@/stylex";
import { BestPractice, SectionHeading } from "./-components";
import { InteractiveTableDemo } from "./-table-design-interactive-demo";

export function TableStatesSection() {
  return (
    <div className={cx("mb-20")}>
      <SectionHeading
        title="Table States"
        description="Handle every possible state your table can be in: loading, empty, error, data, and no search results."
      />

      <InteractiveTableDemo />

      <div className={cx("mt-8 space-y-4")}>
        <BestPractice
          emoji="💀"
          title="Use skeletons over spinners"
          description="Skeleton rows maintain layout and feel faster than a centered spinner."
        />
        <BestPractice
          emoji="✨"
          title="Guide on empty state"
          description="Don't just say 'No data'. Tell users how to add their first item with a CTA."
        />
        <BestPractice
          emoji="🔄"
          title="Always offer recovery"
          description="Error states need retry buttons. Empty search needs a clear filter option."
        />
      </div>
    </div>
  );
}
