import { cx } from "@/stylex";
import { Card } from "../../components/card";
import { sampleUsers } from "./-table-design-data";

const REVENUE_FORMATTER = new Intl.NumberFormat();

export function NumbersDemo() {
  return (
    <Card className={cx("rounded-2xl overflow-hidden")}>
      <div className={cx("overflow-x-auto")}>
        <table className={cx("w-full")}>
          <thead>
            <tr className={cx("border-b border-border bg-muted/50")}>
              <th className={cx("px-4 py-3 text-left text-sm font-medium text-muted-foreground")}>Name</th>
              <th className={cx("px-4 py-3 text-right text-sm font-medium text-muted-foreground")}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {sampleUsers.map((user) => (
              <tr
                key={user.id}
                className={cx("border-b border-border hover:bg-muted/50 transition-colors")}
              >
                <td className={cx("px-4 py-3 text-foreground")}>{user.name}</td>
                <td className={cx("px-4 py-3 text-right font-mono tabular-nums text-foreground")}>
                  ${REVENUE_FORMATTER.format(user.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={cx("border-t border-border p-4 text-sm text-muted-foreground")}>
        ✓ Numbers use <code className={cx("px-1.5 py-0.5 rounded bg-muted text-xs")}>tabular-nums</code>{" "}
        and are right-aligned for easy scanning
      </div>
    </Card>
  );
}
