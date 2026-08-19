import { cx } from "@/stylex";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Card } from "../../components/card";
import { sampleUsers } from "./-table-design-data";

const TOTAL_PAGES = 5;
const PAGINATION_PAGES = [1, 2, 3, 4, 5];

export function PaginationDemo() {
  const [currentPage, setCurrentPage] = useState(2);
  const [showPagination, setShowPagination] = useState(true);

  return (
    <Card className={cx("rounded-2xl overflow-hidden")}>
      <div className={cx("overflow-x-auto")}>
        <table className={cx("w-full")}>
          <thead>
            <tr className={cx("border-b border-border bg-muted/50")}>
              <th className={cx("px-4 py-3 text-left text-sm font-medium text-muted-foreground")}>Name</th>
              <th className={cx("px-4 py-3 text-left text-sm font-medium text-muted-foreground")}>Email</th>
            </tr>
          </thead>
          <tbody>
            {sampleUsers.slice(0, 3).map((user) => (
              <tr key={user.id} className={cx("border-b border-border")}>
                <td className={cx("px-4 py-3 text-foreground")}>{user.name}</td>
                <td className={cx("px-4 py-3 text-muted-foreground")}>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className={cx("border-t border-border px-4 py-3 flex items-center justify-between")}>
          <span className={cx("text-sm text-muted-foreground")}>
            Page {currentPage} of {TOTAL_PAGES}
          </span>
          <div className={cx("flex items-center gap-1")}>
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className={cx("p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors")}
            >
              <CaretLeftIcon size={16} className={cx("text-muted-foreground")} aria-hidden="true" />
            </button>
            {PAGINATION_PAGES.map((page) => (
              <button
                type="button"
                key={page}
                onClick={() => setCurrentPage(page)}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
                className={cx(`size-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                  }`)}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(TOTAL_PAGES, currentPage + 1))}
              disabled={currentPage === TOTAL_PAGES}
              aria-label="Next page"
              className={cx("p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors")}
            >
              <CaretRightIcon size={16} className={cx("text-muted-foreground")} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className={cx("border-t border-border p-4")}>
        <label className={cx("flex items-center gap-2 text-sm text-muted-foreground")}>
          <input
            type="checkbox"
            checked={showPagination}
            onChange={(e) => setShowPagination(e.target.checked)}
            className={cx("rounded border-border bg-background text-brand focus:ring-brand")}
          />
          Show pagination (hide when only 1 page)
        </label>
      </div>
    </Card>
  );
}
