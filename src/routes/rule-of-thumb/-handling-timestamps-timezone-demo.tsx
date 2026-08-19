import { cx } from "@/stylex";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Card } from "../../components/card";

const USER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const LOCAL_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "long",
  timeZone: USER_TIMEZONE,
});
const UTC_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "long",
  timeZone: "UTC",
});

export function TimezoneDemo() {
  const [utcTime] = useState(() => new Date().toISOString());

  return (
    <Card className={cx("rounded-2xl overflow-hidden")}>
      <div className={cx("p-6 space-y-6")}>
        <div>
          <h3 className={cx("text-sm font-medium text-muted-foreground mb-2")}>
            Stored in Database (UTC)
          </h3>
          <div className={cx("p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border font-mono text-sm")}>
            <span className={cx("text-positive-foreground")}>{utcTime}</span>
          </div>
        </div>

        <div className={cx("flex items-center justify-center")}>
          <ArrowRightIcon size={20} className={cx("text-muted-foreground")} />
        </div>

        <div className={cx("grid sm:grid-cols-2 gap-4")}>
          <div>
            <h3 className={cx("text-sm font-medium text-muted-foreground mb-2")}>Displayed as UTC</h3>
            <div className={cx("p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border")}>
              <p className={cx("text-foreground")}>{UTC_TIME_FORMATTER.format(new Date(utcTime))}</p>
            </div>
          </div>
          <div>
            <h3 className={cx("text-sm font-medium text-muted-foreground mb-2")}>
              Your Local Time ({USER_TIMEZONE})
            </h3>
            <div className={cx("p-4 rounded-lg bg-zinc-500/10 border border-border")}>
              <p className={cx("text-foreground")}>{LOCAL_TIME_FORMATTER.format(new Date(utcTime))}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={cx("border-t border-border p-4 text-sm text-muted-foreground")}>
        ✓ Same UTC timestamp, displayed in user's local timezone
      </div>
    </Card>
  );
}
