import { cx } from "@/stylex";
import {
  ArrowsClockwiseIcon,
  DatabaseIcon,
  FileXIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "../../components/button";
import { Card } from "../../components/card";
import { sampleUsers, type TableState } from "./-table-design-data";

const STATE_INFO: Record<TableState, { label: string; description: string; color: string }> = {
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

export function InteractiveTableDemo() {
  const [state, setState] = useState<TableState>("data");
  const [searchQuery, setSearchQuery] = useState("");

  const renderTableContent = () => {
    switch (state) {
      case "loading":
        return (
          <tbody>
            {[1, 2, 3].map((row) => (
              <tr key={row} className={cx("border-b border-border")}>
                <td className={cx("px-4 py-3")}>
                  <div className={cx("h-4 w-32 bg-muted rounded animate-pulse")} />
                </td>
                <td className={cx("px-4 py-3")}>
                  <div className={cx("h-4 w-40 bg-muted rounded animate-pulse")} />
                </td>
                <td className={cx("px-4 py-3")}>
                  <div className={cx("h-4 w-20 bg-muted rounded animate-pulse")} />
                </td>
                <td className={cx("px-4 py-3")}>
                  <div className={cx("h-4 w-16 bg-muted rounded animate-pulse")} />
                </td>
              </tr>
            ))}
          </tbody>
        );

      case "empty":
        return (
          <tbody>
            <tr>
              <td colSpan={4} className={cx("px-4 py-12 text-center")}>
                <div className={cx("flex flex-col items-center gap-3")}>
                  <DatabaseIcon size={40} className={cx("text-muted-foreground opacity-50")} />
                  <p className={cx("text-muted-foreground")}>No users yet</p>
                  <Button className={cx("text-sm")}>Add First User</Button>
                </div>
              </td>
            </tr>
          </tbody>
        );

      case "error":
        return (
          <tbody>
            <tr>
              <td colSpan={4} className={cx("px-4 py-12 text-center")}>
                <div className={cx("flex flex-col items-center gap-3")}>
                  <WarningCircleIcon size={40} className={cx("text-destructive")} />
                  <p className={cx("text-destructive")}>Failed to load users</p>
                  <Button className={cx("text-sm gap-2")}>
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
              <td colSpan={4} className={cx("px-4 py-12 text-center")}>
                <div className={cx("flex flex-col items-center gap-3")}>
                  <FileXIcon size={40} className={cx("text-muted-foreground opacity-50")} />
                  <p className={cx("text-muted-foreground")}>
                    No results for "<span className={cx("text-foreground")}>{searchQuery || "xyz"}</span>"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setState("data");
                    }}
                    className={cx("text-foreground text-sm hover:underline decoration-zinc-400 underline-offset-4")}
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
                className={cx("border-b border-border hover:bg-muted/50 transition-colors")}
              >
                <td className={cx("px-4 py-3 text-foreground")}>{user.name}</td>
                <td className={cx("px-4 py-3 text-muted-foreground")}>{user.email}</td>
                <td className={cx("px-4 py-3 text-muted-foreground")}>{user.role}</td>
                <td className={cx("px-4 py-3")}>
                  <span
                    className={cx(`px-2 py-1 rounded-full text-xs font-medium ${user.status === "active"
                        ? "bg-muted text-foreground"
                        : "bg-muted text-zinc-400"
                      }`)}
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
    <Card className={cx("rounded-2xl overflow-hidden")}>
      <div className={cx("p-4 border-b border-border flex items-center gap-3")}>
        <div className={cx("relative flex-1")}>
          <label htmlFor="table-search" className={cx("sr-only")}>
            Search users
          </label>
          <MagnifyingGlassIcon
            size={16}
            className={cx("absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground")}
            aria-hidden="true"
          />
          <input
            id="table-search"
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cx("w-full pl-9 pr-4 py-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20")}
          />
        </div>
      </div>

      <div className={cx("overflow-x-auto")}>
        <table className={cx("w-full")}>
          <thead>
            <tr className={cx("border-b border-border bg-muted/50")}>
              <th className={cx("px-4 py-3 text-left text-sm font-medium text-muted-foreground")}>Name</th>
              <th className={cx("px-4 py-3 text-left text-sm font-medium text-muted-foreground")}>Email</th>
              <th className={cx("px-4 py-3 text-left text-sm font-medium text-muted-foreground")}>Role</th>
              <th className={cx("px-4 py-3 text-left text-sm font-medium text-muted-foreground")}>Status</th>
            </tr>
          </thead>
          {renderTableContent()}
        </table>
      </div>

      <div className={cx("border-t border-border p-6")}>
        <div className={cx("flex items-center justify-between mb-4")}>
          <div className={cx("flex items-center gap-3")}>
            <span className={cx(`text-lg font-semibold ${STATE_INFO[state].color}`)}>
              {STATE_INFO[state].label}
            </span>
            <span className={cx("text-sm text-muted-foreground")}>{STATE_INFO[state].description}</span>
          </div>
        </div>

        <div className={cx("flex flex-col gap-4")}>
          <div className={cx("flex flex-wrap items-center justify-center gap-2")}>
            {(["loading", "data", "empty", "error"] as TableState[]).map((nextState, index, states) => (
              <div key={nextState} className={cx("flex items-center gap-2")}>
                <button
                  type="button"
                  onClick={() => setState(nextState)}
                  className={cx(`px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-sm ${state === nextState
                      ? "bg-muted text-foreground border-2 border-muted-foreground/20"
                      : "bg-background/50 text-muted-foreground hover:text-foreground border border-border hover:bg-muted/70"
                    }`)}
                >
                  {STATE_INFO[nextState].label}
                </button>
                {index < states.length - 1 && <span className={cx("text-muted-foreground text-xs")}>|</span>}
              </div>
            ))}
          </div>

          <div className={cx("flex items-center justify-center gap-2 text-sm text-muted-foreground")}>
            <span className={cx("italic")}>with search:</span>
            <span aria-hidden="true">→</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("xyz");
                setState("searching");
              }}
              className={cx(`px-4 py-2 rounded-lg text-sm font-medium transition-all ${state === "searching"
                  ? "bg-muted text-foreground border-2 border-muted-foreground/20"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`)}
            >
              No Results
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
