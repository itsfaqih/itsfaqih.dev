import { createFileRoute } from "@tanstack/react-router";
import { GuidelinePagination } from "./-components/guideline-pagination";
import { useState } from "react";
import {
  TableIcon,
  WarningCircleIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  FileXIcon,
  DatabaseIcon,
  CaretLeftIcon,
  CaretRightIcon,
  DotsThreeIcon,
  TrashIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";
import { GlassyCard } from "../../components/glassy-card";
import { BestPractice, CodeExample, RuleOfThumbHero, SectionHeading } from "./-components";
import { GlassyButton } from "../../components/glassy-button";
import { PageContainer } from "../../components/page-container";

export const Route = createFileRoute("/rule-of-thumb/table-design")({
  component: TableDesign,
});

// ============================================================================
// Sample Data
// ============================================================================

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  revenue: number;
};

const sampleUsers: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "active",
    revenue: 12500,
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "Editor",
    status: "active",
    revenue: 8750,
  },
  {
    id: 3,
    name: "Carol Williams",
    email: "carol@example.com",
    role: "Viewer",
    status: "inactive",
    revenue: 340,
  },
  {
    id: 4,
    name: "David Brown",
    email: "david@example.com",
    role: "Editor",
    status: "active",
    revenue: 95200,
  },
];

// ============================================================================
// Interactive Table Demo Component (States)
// ============================================================================

type TableState = "loading" | "empty" | "error" | "data" | "searching";

function InteractiveTableDemo() {
  const [state, setState] = useState<TableState>("data");
  const [searchQuery, setSearchQuery] = useState("");

  const stateInfo: Record<TableState, { label: string; description: string; color: string }> = {
    loading: {
      label: "Loading",
      description: "Fetching data from the server. Show skeleton or spinner.",
      color: "text-zinc-400",
    },
    empty: {
      label: "Empty",
      description: "No data available. Provide helpful guidance.",
      color: "text-zinc-400",
    },
    error: {
      label: "Error",
      description: "Something went wrong. Show retry option.",
      color: "text-red-400",
    },
    data: {
      label: "Data",
      description: "Displaying table content. The normal state.",
      color: "text-(--text-primary)",
    },
    searching: {
      label: "No Results",
      description: "Search returned no matches. Suggest alternatives.",
      color: "text-zinc-400",
    },
  };

  const renderTableContent = () => {
    switch (state) {
      case "loading":
        return (
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-(--border-color)">
                <td className="px-4 py-3">
                  <div className="h-4 w-32 bg-(--border-color) rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-40 bg-(--border-color) rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 bg-(--border-color) rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-16 bg-(--border-color) rounded animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        );

      case "empty":
        return (
          <tbody>
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <DatabaseIcon size={40} className="text-(--text-secondary) opacity-50" />
                  <p className="text-(--text-secondary)">No users yet</p>
                  <GlassyButton className="text-sm">Add First User</GlassyButton>
                </div>
              </td>
            </tr>
          </tbody>
        );

      case "error":
        return (
          <tbody>
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <WarningCircleIcon size={40} className="text-red-400" />
                  <p className="text-red-400">Failed to load users</p>
                  <GlassyButton className="text-sm gap-2">
                    <ArrowsClockwiseIcon size={14} />
                    Try Again
                  </GlassyButton>
                </div>
              </td>
            </tr>
          </tbody>
        );

      case "searching":
        return (
          <tbody>
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <FileXIcon size={40} className="text-(--text-secondary) opacity-50" />
                  <p className="text-(--text-secondary)">
                    No results for "
                    <span className="text-(--text-primary)">{searchQuery || "xyz"}</span>"
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setState("data");
                    }}
                    className="text-(--text-primary) text-sm hover:underline decoration-zinc-400 underline-offset-4"
                  >
                    Clear search
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        );

      case "data":
      default:
        return (
          <tbody>
            {sampleUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-(--border-color) hover:bg-(--bg-primary) transition-colors"
              >
                <td className="px-4 py-3 text-(--text-primary)">{user.name}</td>
                <td className="px-4 py-3 text-(--text-secondary)">{user.email}</td>
                <td className="px-4 py-3 text-(--text-secondary)">{user.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === "active"
                        ? "bg-zinc-500/10 text-(--text-primary)"
                        : "bg-zinc-500/10 text-zinc-400"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        );
    }
  };

  return (
    <GlassyCard className="rounded-2xl overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-(--border-color) flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)"
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-(--bg-primary)/50 backdrop-blur-sm border border-(--border-color) text-sm text-(--text-primary) placeholder:text-(--text-secondary) focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-(--border-color) bg-(--bg-primary)">
              <th className="px-4 py-3 text-left text-sm font-medium text-(--text-secondary)">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-(--text-secondary)">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-(--text-secondary)">
                Role
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-(--text-secondary)">
                Status
              </th>
            </tr>
          </thead>
          {renderTableContent()}
        </table>
      </div>

      {/* State Controls */}
      <div className="border-t border-(--border-color) p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`text-lg font-semibold ${stateInfo[state].color}`}>
              {stateInfo[state].label}
            </span>
            <span className="text-sm text-(--text-secondary)">{stateInfo[state].description}</span>
          </div>
        </div>

        {/* FSM Diagram */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(["loading", "data", "empty", "error"] as TableState[]).map((s, index, arr) => (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => setState(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-sm ${
                    state === s
                      ? "bg-zinc-500/10 text-(--text-primary) border-2 border-zinc-500/20"
                      : "bg-(--bg-primary)/50 text-(--text-secondary) hover:text-(--text-primary) border border-(--border-color) hover:bg-(--bg-primary)/70"
                  }`}
                >
                  {stateInfo[s].label}
                </button>
                {index < arr.length - 1 && (
                  <span className="text-(--text-secondary) text-xs">|</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-(--text-secondary)">
            <span className="italic">with search:</span>
            <ArrowRightIcon size={14} />
            <button
              onClick={() => {
                setSearchQuery("xyz");
                setState("searching");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                state === "searching"
                  ? "bg-zinc-500/10 text-(--text-primary) border-2 border-zinc-500/20"
                  : "bg-(--bg-primary) text-(--text-secondary) hover:text-(--text-primary) border border-(--border-color)"
              }`}
            >
              No Results
            </button>
          </div>
        </div>
      </div>
    </GlassyCard>
  );
}

// ============================================================================
// Pagination Demo Component
// ============================================================================

function PaginationDemo() {
  const [currentPage, setCurrentPage] = useState(2);
  const [showPagination, setShowPagination] = useState(true);
  const totalPages = 5;

  return (
    <GlassyCard className="rounded-2xl overflow-hidden">
      {/* Demo Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-(--border-color) bg-(--bg-primary)">
              <th className="px-4 py-3 text-left text-sm font-medium text-(--text-secondary)">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-(--text-secondary)">
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleUsers.slice(0, 3).map((user) => (
              <tr key={user.id} className="border-b border-(--border-color)">
                <td className="px-4 py-3 text-(--text-primary)">{user.name}</td>
                <td className="px-4 py-3 text-(--text-secondary)">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="border-t border-(--border-color) px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-(--text-secondary)">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-(--bg-primary) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CaretLeftIcon size={16} className="text-(--text-secondary)" />
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-(--text-secondary) hover:bg-(--bg-primary)"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-(--bg-primary) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CaretRightIcon size={16} className="text-(--text-secondary)" />
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="border-t border-(--border-color) p-4">
        <label className="flex items-center gap-2 text-sm text-(--text-secondary)">
          <input
            type="checkbox"
            checked={showPagination}
            onChange={(e) => setShowPagination(e.target.checked)}
            className="rounded"
          />
          Show pagination (hide when only 1 page)
        </label>
      </div>
    </GlassyCard>
  );
}

// ============================================================================
// Actions Demo Component
// ============================================================================

function ActionsDemo() {
  return (
    <GlassyCard className="rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-(--border-color) bg-(--bg-primary)">
              <th className="px-4 py-3 text-left text-sm font-medium text-(--text-secondary)">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-(--text-secondary)">
                Email
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-(--text-secondary)">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleUsers.slice(0, 3).map((user) => (
              <tr
                key={user.id}
                className="border-b border-(--border-color) hover:bg-(--bg-primary) transition-colors"
              >
                <td className="px-4 py-3 text-(--text-primary)">{user.name}</td>
                <td className="px-4 py-3 text-(--text-secondary)">{user.email}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 rounded-lg hover:bg-(--bg-secondary) transition-colors">
                      <PencilSimpleIcon size={14} className="text-(--text-secondary)" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-zinc-500/10 transition-colors">
                      <TrashIcon size={14} className="text-(--text-primary)" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-(--bg-secondary) transition-colors">
                      <DotsThreeIcon size={14} className="text-(--text-secondary)" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-(--border-color) p-4 text-sm text-(--text-secondary)">
        ✓ Actions column is right-aligned for predictable interaction
      </div>
    </GlassyCard>
  );
}

// ============================================================================
// Numbers Demo Component
// ============================================================================

function NumbersDemo() {
  return (
    <GlassyCard className="rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-(--border-color) bg-(--bg-primary)">
              <th className="px-4 py-3 text-left text-sm font-medium text-(--text-secondary)">
                Name
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-(--text-secondary)">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-(--border-color) hover:bg-(--bg-primary) transition-colors"
              >
                <td className="px-4 py-3 text-(--text-primary)">{user.name}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-(--text-primary)">
                  ${user.revenue.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-(--border-color) p-4 text-sm text-(--text-secondary)">
        ✓ Numbers use{" "}
        <code className="px-1.5 py-0.5 rounded bg-(--bg-primary) text-xs">tabular-nums</code> and
        are right-aligned for easy scanning
      </div>
    </GlassyCard>
  );
}

// ============================================================================
// Code Example Component with Syntax Highlighting
// ============================================================================

// ============================================================================
// Main Page Component
// ============================================================================

function TableDesign() {
  return (
    <PageContainer maxWidth="3xl">
      <RuleOfThumbHero
        title="Table Design"
        description={
          <>
            Best practices for designing data tables.
            <br />
            <span className="text-(--text-primary) font-medium">
              Clear, scannable, and user-friendly.
            </span>
          </>
        }
        badge={{
          icon: TableIcon,
          text: "UI/UX Pattern",
        }}
        markdownUrl="/rule-of-thumb/table-design.md"
      />

      {/* ================================================================== */}
      {/* SECTION 1: States */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Table States"
          description="Handle every possible state your table can be in: loading, empty, error, data, and no search results."
        />

        <InteractiveTableDemo />

        <div className="mt-8 space-y-4">
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

      {/* ================================================================== */}
      {/* SECTION 2: Pagination */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Pagination"
          description="Smart pagination that only appears when needed and integrates with URL state."
        />

        <PaginationDemo />

        <div className="mt-8 space-y-4">
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

        <div className="mt-8">
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

      {/* ================================================================== */}
      {/* SECTION 3: Displaying Actions */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Displaying Actions"
          description="Action buttons should be predictable and easy to access."
        />

        <ActionsDemo />

        <div className="mt-8 space-y-4">
          <BestPractice
            emoji="➡️"
            title="Right-align actions"
            description="Place action buttons on the right side of the row for consistent, predictable positioning."
          />
          <BestPractice
            emoji="📏"
            title="Fixed-width action column"
            description="Give the actions column a fixed width so buttons don't shift as data changes."
          />
          <BestPractice
            emoji="🎯"
            title="Use icon buttons for space"
            description="Icon-only buttons with tooltips save horizontal space while remaining accessible."
          />
        </div>

        <div className="mt-8">
          <CodeExample
            title="Right-aligned Actions Column"
            code={`<table>
  <thead>
    <tr>
      <th className="text-left">Name</th>
      <th className="text-left">Email</th>
      {/* Right-align the actions header */}
      <th className="text-right w-32">Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Alice Johnson</td>
      <td>alice@example.com</td>
      {/* Right-align the actions */}
      <td className="text-right">
        <div className="flex justify-end gap-2">
          <IconButton icon={Pencil} />
          <IconButton icon={Trash2} />
        </div>
      </td>
    </tr>
  </tbody>
</table>`}
            description="Right-aligned actions are easier to click and create a clean visual edge."
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 4: Displaying Numbers */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Displaying Numbers"
          description="Numeric data should be easy to scan and compare at a glance."
        />

        <NumbersDemo />

        <div className="mt-8 space-y-4">
          <BestPractice
            emoji="🔢"
            title="Use tabular-nums"
            description="The tabular-nums CSS property ensures all digits have equal width for perfect alignment."
          />
          <BestPractice
            emoji="➡️"
            title="Right-align numbers"
            description="Right-aligned numbers let users easily compare values by scanning the decimal points."
          />
          <BestPractice
            emoji="💰"
            title="Format with locale"
            description="Use toLocaleString() for proper thousand separators and currency formatting."
          />
        </div>

        <div className="mt-8">
          <CodeExample
            title="Properly Formatted Numbers"
            code={`<table>
  <thead>
    <tr>
      <th className="text-left">Name</th>
      {/* Right-align the number header */}
      <th className="text-right">Revenue</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Alice Johnson</td>
      {/* Use tabular-nums + right-align + mono font */}
      <td className="text-right font-mono tabular-nums">
        \${revenue.toLocaleString()}
      </td>
    </tr>
  </tbody>
</table>

/* CSS for tabular numbers */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}`}
            description="Tabular figures + right alignment = easy-to-scan numeric columns."
          />
        </div>
      </div>

      {/* Footer */}
      <GuidelinePagination />
    </PageContainer>
  );
}
