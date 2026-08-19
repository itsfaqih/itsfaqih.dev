import { cx } from "@/stylex";
import { BestPractice, CodeExample, SectionHeading } from "./-components";
import { PaginationDemo } from "./-table-design-pagination-demo";

export function TablePaginationSection() {
  return (
    <div className={cx("mb-20")}>
      <SectionHeading
        title="Pagination"
        description="Smart pagination that only appears when needed and integrates with URL state."
      />

      <PaginationDemo />

      <div className={cx("mt-8 space-y-4")}>
        <BestPractice
          emoji="🚫"
          title="Hide when ≤1 page"
          description="Don't display pagination controls when there's only one page of data."
        />
        <BestPractice
          emoji="📭"
          title="Hide when empty"
          description="If the table has no data, pagination shouldn't appear at all."
        />
        <BestPractice
          emoji="🔗"
          title="Use URL query params"
          description="Store page state in ?page=2 for shareable links and browser history. Only use local state when multiple tables exist on the same page."
        />
      </div>

      <div className={cx("mt-8")}>
        <CodeExample
          title="URL-based Pagination"
          code={`// Use URL search params for pagination
const [searchParams, setSearchParams] = useSearchParams();
const page = Number(searchParams.get("page")) || 1;

// Update page via URL
const goToPage = (newPage: number) => {
  setSearchParams({ page: String(newPage) });
};

// Only show pagination when needed
{totalPages > 1 && data.length > 0 && (
  <Pagination 
    current={page} 
    total={totalPages} 
    onChange={goToPage} 
  />
)}`}
          description="URL-based pagination enables shareable links and proper back button behavior."
        />
      </div>
    </div>
  );
}
