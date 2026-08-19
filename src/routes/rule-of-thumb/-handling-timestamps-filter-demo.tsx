import { cx } from "@/stylex";
import { useState } from "react";
import { Card } from "../../components/card";

const USER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function FilterDemo() {
  const [inputDate, setInputDate] = useState("2026-01-01");
  const [inputTime, setInputTime] = useState("07:00");

  const getUTCEquivalent = () => {
    const localDate = new Date(`${inputDate}T${inputTime}:00`);
    return localDate.toISOString();
  };

  const getWithOffset = () => {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const mins = Math.abs(offset % 60);
    const sign = offset <= 0 ? "+" : "-";
    return `${inputDate}T${inputTime}:00${sign}${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  return (
    <Card className={cx("rounded-2xl overflow-hidden")}>
      <div className={cx("p-6 space-y-6")}>
        <div>
          <h3 className={cx("text-sm font-medium text-muted-foreground mb-3")}>
            User inputs filter date ({USER_TIMEZONE})
          </h3>
          <div className={cx("flex gap-3")}>
            <label htmlFor="timestamp-filter-date" className={cx("sr-only")}>
              Filter date
            </label>
            <input
              id="timestamp-filter-date"
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className={cx("px-4 py-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-500/20")}
            />
            <label htmlFor="timestamp-filter-time" className={cx("sr-only")}>
              Filter time
            </label>
            <input
              id="timestamp-filter-time"
              type="time"
              value={inputTime}
              onChange={(e) => setInputTime(e.target.value)}
              className={cx("px-4 py-2 rounded-lg bg-background/50 backdrop-blur-sm border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-zinc-500/20")}
            />
          </div>
        </div>

        <div className={cx("flex items-center gap-3")}>
          <div className={cx("flex-1 h-px bg-border")} />
          <span className={cx("text-xs text-muted-foreground")}>sent to backend as</span>
          <div className={cx("flex-1 h-px bg-border")} />
        </div>

        <div className={cx("grid sm:grid-cols-2 gap-4")}>
          <div>
            <h3 className={cx("text-sm font-medium text-muted-foreground mb-2")}>Option 1: UTC</h3>
            <div className={cx("p-4 rounded-lg bg-zinc-500/10 border border-border font-mono text-xs")}>
              <span className={cx("text-foreground")}>{getUTCEquivalent()}</span>
            </div>
          </div>
          <div>
            <h3 className={cx("text-sm font-medium text-muted-foreground mb-2")}>
              Option 2: With Offset
            </h3>
            <div className={cx("p-4 rounded-lg bg-zinc-500/10 border border-border font-mono text-xs")}>
              <span className={cx("text-foreground")}>{getWithOffset()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={cx("border-t border-border p-4 text-sm text-muted-foreground")}>
        ✓ Both formats include timezone info — backend knows the exact moment
      </div>
    </Card>
  );
}
