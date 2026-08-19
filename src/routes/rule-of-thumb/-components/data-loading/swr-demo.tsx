import { cx } from "@/stylex";
import { useState } from "react";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { Button } from "../../../../components/button";

export function SWRDemo() {
  const [data, setData] = useState<string>("User count: 1,234");
  const [isRefetching, setIsRefetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("2 min ago");

  const simulateRefetch = () => {
    setIsRefetching(true);
    setTimeout(() => {
      setData(`User count: ${Math.floor(1200 + Math.random() * 100).toLocaleString()}`);
      setLastUpdated("just now");
      setIsRefetching(false);
    }, 1500);
  };

  return (
    <div className={cx("rounded-2xl border border-border bg-card overflow-hidden")}>
      <div className={cx("p-6")}>
        <div className={cx("flex items-center justify-between mb-4")}>
          <h3 className={cx("font-semibold text-foreground")}>Dashboard Stats</h3>
          <div className={cx("flex items-center gap-2")}>
            {isRefetching && (
              <ArrowsClockwiseIcon size={14} className={cx("text-muted-foreground animate-spin")} />
            )}
            <span className={cx("text-xs text-muted-foreground")}>Updated {lastUpdated}</span>
          </div>
        </div>

        <div className={cx("p-4 rounded-lg bg-background border border-border")}>
          <p className={cx("text-2xl font-bold text-foreground tabular-nums")}>{data}</p>
        </div>
      </div>

      <div className={cx("border-t border-border p-4 flex items-center justify-between")}>
        <span className={cx("text-sm text-muted-foreground")}>
          {isRefetching ? "Fetching fresh data..." : "Showing cached data"}
        </span>
        <Button
          onClick={simulateRefetch}
          disabled={isRefetching}
          className={cx("h-9 px-4 text-sm gap-2")}
        >
          <ArrowsClockwiseIcon size={14} className={isRefetching ? "animate-spin" : ""} />
          Revalidate
        </Button>
      </div>
    </div>
  );
}