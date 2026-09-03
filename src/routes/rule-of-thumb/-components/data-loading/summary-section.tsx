import { cx } from "@/stylex";
import {
  ArrowsClockwiseIcon,
  BroadcastIcon,
  ClockIcon,
  DatabaseIcon,
  HardDriveIcon,
  HardDrivesIcon,
  LightningIcon,
  ShieldCheckIcon,
  StackIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

export function DataLoadingSummary() {
  return (
    <>
{/* Summary */}
      <div className={cx("mb-20")}>
        <div data-rule-of-thumb-card="true" className={cx("p-8 rounded-2xl bg-card border border-border")}>
          <h2 className={cx("text-xl font-bold text-foreground mb-4")}>Quick Reference</h2>
          <div className={cx("space-y-3 text-muted-foreground")}>
            <div className={cx("flex items-start gap-3")}>
              <HardDrivesIcon size={18} className={cx("text-foreground mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>SSR</strong> — Use for SEO-critical, important
                content
              </span>
            </div>
            <div className={cx("flex items-start gap-3")}>
              <LightningIcon size={18} className={cx("text-foreground mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>Loader</strong> — Trigger fetches on navigation,
                not render
              </span>
            </div>
            <div className={cx("flex items-start gap-3")}>
              <StackIcon size={18} className={cx("text-foreground mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>Defer</strong> — Don't block render, show
                skeleton first
              </span>
            </div>
            <div className={cx("flex items-start gap-3")}>
              <DatabaseIcon size={18} className={cx("text-cyan-400 mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>Batch</strong> — Group queries when possible,
                separate if heavy
              </span>
            </div>
            <div className={cx("flex items-start gap-3")}>
              <ArrowsClockwiseIcon size={18} className={cx("text-positive-foreground mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>SWR</strong> — Show stale data, indicate
                background refresh
              </span>
            </div>
            <div className={cx("flex items-start gap-3")}>
              <ClockIcon size={18} className={cx("text-foreground mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>Spin Delay</strong> — Wait 200ms before showing
                skeleton
              </span>
            </div>
            <div className={cx("flex items-start gap-3")}>
              <WarningCircleIcon size={18} className={cx("text-negative-foreground mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>Errors</strong> — Inline, not toast. Include
                retry. Log to observability.
              </span>
            </div>
            <div className={cx("flex items-start gap-3")}>
              <BroadcastIcon size={18} className={cx("text-pink-400 mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>WebSocket</strong> — Use for realtime data that
                needs instant updates
              </span>
            </div>
            <div className={cx("flex items-start gap-3")}>
              <HardDriveIcon size={18} className={cx("text-muted-foreground mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>Cache</strong> — Don't persist client cache
                unless app works offline or needs latest data on revisit
              </span>
            </div>
            <div className={cx("flex items-start gap-3")}>
              <ShieldCheckIcon size={18} className={cx("text-positive-foreground mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>Parse</strong> — Validate external data with
                Zod. Use fallbacks or show meaningful errors.
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
