import { cx } from "@/stylex";
import { ArrowsClockwiseIcon, BroadcastIcon } from "@phosphor-icons/react";
import { BestPractice, SectionHeading } from "../index";

export function RealtimeSection() {
  return (
    <>
{/* ================================================================== */}
      {/* SECTION 6: Realtime Data */}
      {/* ================================================================== */}
      <div className={cx("mb-20")}>
        <SectionHeading
          title="Realtime Data"
          description='Choose the right approach based on how "real" your realtime needs to be.'
        />

        <div className={cx("grid sm:grid-cols-2 gap-4 mb-8")}>
          <div data-rule-of-thumb-card="true" className={cx("p-6 rounded-xl border border-border bg-card")}>
            <div className={cx("flex items-center gap-3 mb-4")}>
              <div className={cx("size-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center")}>
                <BroadcastIcon size={20} className={cx("text-accent-foreground")} />
              </div>
              <h3 className={cx("font-semibold text-foreground")}>WebSocket</h3>
            </div>
            <div className={cx("text-sm text-muted-foreground space-y-2")}>
              <p>
                <strong className={cx("text-foreground")}>Use when:</strong>
              </p>
              <ul className={cx("list-disc list-inside space-y-1 mt-2")}>
                <li>Updates need to be instant ({"<"}1 second)</li>
                <li>High frequency updates (chat, live scores)</li>
                <li>Bi-directional communication needed</li>
                <li>Many small messages over time</li>
              </ul>
            </div>
          </div>

          <div data-rule-of-thumb-card="true" className={cx("p-6 rounded-xl border border-border bg-card")}>
            <div className={cx("flex items-center gap-3 mb-4")}>
              <div className={cx("size-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center")}>
                <ArrowsClockwiseIcon size={20} className={cx("text-accent-foreground")} />
              </div>
              <h3 className={cx("font-semibold text-foreground")}>Interval HTTP</h3>
            </div>
            <div className={cx("text-sm text-muted-foreground space-y-2")}>
              <p>
                <strong className={cx("text-foreground")}>Use when:</strong>
              </p>
              <ul className={cx("list-disc list-inside space-y-1 mt-2")}>
                <li>Updates every 30+ seconds is acceptable</li>
                <li>Simpler infrastructure needed</li>
                <li>Server doesn't support WebSocket</li>
                <li>Lower frequency dashboard updates</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={cx("space-y-4")}>
          <BestPractice
            emoji="⚡"
            title="WebSocket for true realtime"
            description="HTTP requests have overhead (headers, connection setup). WebSocket maintains a persistent connection — much faster for frequent small updates."
          />
          <BestPractice
            emoji="🔄"
            title="Interval polling for 30s+ updates"
            description="If data only needs to refresh every 30 seconds or more, start with interval HTTP polling. Simpler to implement and debug."
          />
          <BestPractice
            emoji="📊"
            title="Consider the trade-offs"
            description="WebSocket requires more infrastructure (connection management, reconnection logic). Don't over-engineer if polling works fine."
          />
        </div>
      </div>
    </>
  );
}
