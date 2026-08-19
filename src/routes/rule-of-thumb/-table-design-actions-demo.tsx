import { cx } from "@/stylex";
import { DotsThreeIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { Card } from "../../components/card";
import { sampleUsers } from "./-table-design-data";

export function ActionsDemo() {
  return (
    <Card className={cx("rounded-2xl overflow-hidden")}>
      <div className={cx("overflow-x-auto")}>
        <table className={cx("w-full")}>
          <thead>
            <tr className={cx("border-b border-border bg-muted/50")}>
              <th className={cx("px-4 py-3 text-left text-sm font-medium text-muted-foreground")}>Name</th>
              <th className={cx("px-4 py-3 text-left text-sm font-medium text-muted-foreground")}>Email</th>
              <th className={cx("px-4 py-3 text-right text-sm font-medium text-muted-foreground")}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sampleUsers.slice(0, 3).map((user) => (
              <tr
                key={user.id}
                className={cx("border-b border-border hover:bg-muted/50 transition-colors")}
              >
                <td className={cx("px-4 py-3 text-foreground")}>{user.name}</td>
                <td className={cx("px-4 py-3 text-muted-foreground")}>{user.email}</td>
                <td className={cx("px-4 py-3")}>
                  <div className={cx("flex items-center justify-end gap-2")}>
                    <button
                      type="button"
                      aria-label={`Edit ${user.name}`}
                      className={cx("p-2 rounded-lg hover:bg-muted transition-colors")}
                    >
                      <PencilSimpleIcon size={14} className={cx("text-muted-foreground")} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${user.name}`}
                      className={cx("p-2 rounded-lg hover:bg-destructive/10 transition-colors")}
                    >
                      <TrashIcon size={14} className={cx("text-destructive")} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`More actions for ${user.name}`}
                      className={cx("p-2 rounded-lg hover:bg-muted transition-colors")}
                    >
                      <DotsThreeIcon size={14} className={cx("text-muted-foreground")} aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={cx("border-t border-border p-4 text-sm text-muted-foreground")}>
        ✓ Actions column is right-aligned for predictable interaction
      </div>
    </Card>
  );
}
