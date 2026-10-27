import { cx } from "@/stylex";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Card } from "../../components/card";

const UTC_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "long",
  timeZone: "UTC",
});

type TimezoneDemoProps = {
  initialUtcTime: string;
};

export function TimezoneDemo({ initialUtcTime }: TimezoneDemoProps) {
  const [utcTime, setUtcTime] = useState(initialUtcTime);
  const [userTimezone, setUserTimezone] = useState("UTC");
  const localTimeFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "long",
    timeZone: userTimezone,
  });

  useEffect(() => {
    setUtcTime(new Date().toISOString());
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

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
              Your Local Time ({userTimezone})
            </h3>
            <div className={cx("p-4 rounded-lg bg-muted border border-border")}>
              <p className={cx("text-foreground")}>{localTimeFormatter.format(new Date(utcTime))}</p>
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
