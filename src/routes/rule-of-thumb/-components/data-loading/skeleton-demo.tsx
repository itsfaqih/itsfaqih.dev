import { cx } from "@/stylex";
import { useState, useTransition } from "react";
import { Button } from "../../../../components/button";

export function SkeletonDemo() {
  const [loadStatus, setLoadStatus] = useState<"idle" | "loading">("idle");
  const [isPending, startTransition] = useTransition();
  const isLoading = loadStatus === "loading" || isPending;
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [useSpinDelay, setUseSpinDelay] = useState(true);

  const simulateLoad = (fast: boolean) => {
    startTransition(() => setLoadStatus("loading"));
    setShowSkeleton(false);

    const delayTimer = setTimeout(() => {
      if (useSpinDelay) {
        setShowSkeleton(true);
      }
    }, 200);

    if (!useSpinDelay) {
      setShowSkeleton(true);
    }

    setTimeout(
      () => {
        clearTimeout(delayTimer);
        startTransition(() => setLoadStatus("idle"));
        setShowSkeleton(false);
      },
      fast ? 100 : 1500,
    );
  };

  return (
    <div className={cx("rounded-2xl border border-border bg-card overflow-hidden")}>
      <div className={cx("p-6")}>
        <div className={cx("min-h-[120px] flex items-center justify-center")}>
          {isLoading && showSkeleton ? (
            <div className={cx("w-full space-y-3")}>
              <div className={cx("h-6 w-3/4 bg-border rounded animate-pulse")} />
              <div className={cx("h-4 w-1/2 bg-border rounded animate-pulse")} />
              <div className={cx("h-4 w-2/3 bg-border rounded animate-pulse")} />
            </div>
          ) : isLoading ? (
            <></>
          ) : (
            <div className={cx("w-full")}>
              <h3 className={cx("text-xl font-bold text-foreground mb-2")}>Data Loaded!</h3>
              <p className={cx("text-muted-foreground")}>This content was fetched from the server.</p>
            </div>
          )}
        </div>
      </div>

      <div className={cx("border-t border-border p-4 space-y-4")}>
        <label className={cx("flex items-center gap-2 text-sm text-muted-foreground")}>
          <input
            type="checkbox"
            checked={useSpinDelay}
            onChange={(e) => setUseSpinDelay(e.target.checked)}
            className={cx("rounded")}
          />
          Use spin delay (200ms threshold)
        </label>

        <div className={cx("flex gap-2")}>
          <Button onClick={() => simulateLoad(true)} disabled={isLoading}>
            Fast Load (100ms)
          </Button>
          <Button onClick={() => simulateLoad(false)} disabled={isLoading}>
            Slow Load (1.5s)
          </Button>
        </div>
      </div>
    </div>
  );
}