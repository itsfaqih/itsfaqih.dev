import { createFileRoute } from "@tanstack/react-router";
import { RuleOfThumbPagination } from "./-components/rule-of-thumb-pagination";
import { useState } from "react";
import {
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
import { Card } from "../../components/card";
import { BestPractice, CodeExample, RuleOfThumbHero, SectionHeading } from "./-components";
import { Button } from "../../components/button";
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
      color: "text-muted-foreground",
    },
    empty: {
      label: "Empty",
      description: "No data available. Provide helpful guidance.",
      color: "text-muted-foreground",
    },
    error: {
      label: "Error",
      description: "Something went wrong. Show retry option.",
      color: "text-destructive",
    },
    data: {
      label: "Data",
      description: "Displaying table content. The normal state.",
      color: "text-foreground",
    },
    searching: {
      label: "No Results",
      description: "Search returned no matches. Suggest alternatives.",
      color: "text-muted-foreground",
    },
  };

  const renderTableContent = () => {
    switch (state) {
      case "loading":
        return (
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-border">
                <td className="px-4 py-3">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
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
                  <DatabaseIcon size={40} className="text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No users yet</p>
                  <Button className="text-sm">Add First User</Button>
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
                  <WarningCircleIcon size={40} className="text-destructive" />
                  <p className="text-destructive">Failed to load users</p>
                  <Button className="text-sm gap-2">
                    <ArrowsClockwiseIcon size={14} />
                    Try Again
                  </Button>
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
                  <FileXIcon size={40} className="text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    No results for "<span className="text-foreground">{searchQuery || "xyz"}</span>"
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setState("data");
                    }}
                    className="text-foreground text-sm hover:underline decoration-zinc-400 underline-offset-4"
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
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3 text-foreground">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === "active"
                        ? "bg-muted text-foreground"
                        : "bg-muted text-zinc-400"
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
    <Card className="rounded-2xl overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          {renderTableContent()}
        </table>
      </div>

      {/* State Controls */}
      <div className="border-t border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`text-lg font-semibold ${stateInfo[state].color}`}>
              {stateInfo[state].label}
            </span>
            <span className="text-sm text-muted-foreground">{stateInfo[state].description}</span>
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
                      ? "bg-muted text-foreground border-2 border-muted-foreground/20"
                      : "bg-background/50 text-muted-foreground hover:text-foreground border border-border hover:bg-muted/70"
                  }`}
                >
                  {stateInfo[s].label}
                </button>
                {index < arr.length - 1 && <span className="text-muted-foreground text-xs">|</span>}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="italic">with search:</span>
            <ArrowRightIcon size={14} />
            <button
              onClick={() => {
                setSearchQuery("xyz");
                setState("searching");
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                state === "searching"
                  ? "bg-muted text-foreground border-2 border-muted-foreground/20"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              No Results
            </button>
          </div>
        </div>
      </div>
    </Card>
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
    <Card className="rounded-2xl overflow-hidden">
      {/* Demo Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleUsers.slice(0, 3).map((user) => (
              <tr key={user.id} className="border-b border-border">
                <td className="px-4 py-3 text-foreground">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="border-t border-border px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CaretLeftIcon size={16} className="text-muted-foreground" />
            </button>
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`size-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CaretRightIcon size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="border-t border-border p-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={showPagination}
            onChange={(e) => setShowPagination(e.target.checked)}
            className="rounded border-border bg-background text-brand focus:ring-brand"
          />
          Show pagination (hide when only 1 page)
        </label>
      </div>
    </Card>
  );
}

// ============================================================================
// Actions Demo Component
// ============================================================================

function ActionsDemo() {
  return (
    <Card className="rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleUsers.slice(0, 3).map((user) => (
              <tr
                key={user.id}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3 text-foreground">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <PencilSimpleIcon size={14} className="text-muted-foreground" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                      <TrashIcon size={14} className="text-destructive" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <DotsThreeIcon size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border p-4 text-sm text-muted-foreground">
        ✓ Actions column is right-aligned for predictable interaction
      </div>
    </Card>
  );
}

// ============================================================================
// Numbers Demo Component
// ============================================================================

function NumbersDemo() {
  return (
    <Card className="rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody>
            {sampleUsers.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3 text-foreground">{user.name}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                  ${user.revenue.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-border p-4 text-sm text-muted-foreground">
        ✓ Numbers use <code className="px-1.5 py-0.5 rounded bg-muted text-xs">tabular-nums</code>{" "}
        and are right-aligned for easy scanning
      </div>
    </Card>
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
            <span className="text-foreground font-medium">
              Clear, scannable, and user-friendly.
            </span>
          </>
        }
        badge={{
          text: "UX Design",
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
      <RuleOfThumbPagination />
    </PageContainer>
  );
}
