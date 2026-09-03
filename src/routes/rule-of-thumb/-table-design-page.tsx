import { cx } from "@/stylex";
import { PageContainer } from "../../components/page-container";
import { RuleOfThumbPagination } from "./-components/rule-of-thumb-pagination";
import { RuleOfThumbHero } from "./-components";
import { TableActionsSection } from "./-table-design-actions-section";
import { TableNumbersSection } from "./-table-design-numbers-section";
import { TablePaginationSection } from "./-table-design-pagination-section";
import { TableStatesSection } from "./-table-design-states-section";

export function TableDesign() {
  return (
    <PageContainer maxWidth="3xl" className="rule-of-thumb-page">
      <RuleOfThumbHero
        title="Table Design"
        description={
          <>
            Best practices for designing data tables.
            <br />
            <span className={cx("text-foreground font-medium")}>
              Clear, scannable, and user-friendly.
            </span>
          </>
        }
        badge={{
          text: "UX Design",
        }}
        markdownUrl="/rule-of-thumb/table-design.md"
      />

      <TableStatesSection />
      <TablePaginationSection />
      <TableActionsSection />
      <TableNumbersSection />

      <RuleOfThumbPagination />
    </PageContainer>
  );
}
