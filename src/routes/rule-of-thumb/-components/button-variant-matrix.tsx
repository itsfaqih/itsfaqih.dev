import { cx } from "@/stylex";
import { cn } from "@/cn";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { Button } from "../../../components/button";

export function ButtonVariantMatrix() {
  const variants = [
    { name: "Brand", id: "brand" },
    { name: "Neutral", id: "neutral" },
    { name: "Destructive", id: "destructive" },
    { name: "Secondary Brand", id: "secondary-brand" },
    { name: "Secondary Destr.", id: "secondary-destructive" },
    { name: "Tertiary Neutral", id: "tertiary-neutral" },
    { name: "Tertiary Brand", id: "tertiary-brand" },
    { name: "Tertiary Destr.", id: "tertiary-destructive" },
  ] as const;

  return (
    <div className={cx("mb-16")}>
      <h3 className={cx("text-lg font-semibold text-foreground mb-6")}>Variant States</h3>
      <div
        data-rule-of-thumb-card="true"
        className={cx("button-variant-matrix-scroll overflow-x-auto rounded-xl border border-border bg-card")}
      >
        <table className={cx("text-left border-collapse", "button-variant-matrix-table")}>
          <thead>
            <tr className={cx("border-b border-border bg-muted/50")}>
              <th className={cx("p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider")}>
                Variant
              </th>
              <th className={cx("p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider")}>
                Idle
              </th>
              <th className={cx("p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider")}>
                Hover
              </th>
              <th className={cx("p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider")}>
                Focus
              </th>
              <th className={cx("p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider")}>
                Pressing
              </th>
              <th className={cx("p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider")}>
                Disabled
              </th>
              <th className={cx("p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider")}>
                Pending
              </th>
            </tr>
          </thead>
          <tbody className={cx("divide-y divide-border")}>
            {variants.map((row) => (
              <tr key={row.name} className={cx("group hover:bg-muted/30 transition-colors")}>
                <td className={cx("p-4 font-medium text-foreground text-sm")}>{row.name}</td>
                {/* Idle */}
                <td className={cx("p-4")}>
                  <Button variant={row.id} className={cx("pointer-events-none")}>
                    Button
                  </Button>
                </td>
                {/* Hover */}
                <td className={cx("p-4")}>
                  <Button
                    variant={row.id}
                    className={cn(
                      "pointer-events-none after:opacity-100",
                      row.id === "tertiary-neutral" && "button-tertiary-neutral-hover-state",
                    )}
                  >
                    Button
                  </Button>
                </td>
                {/* Focus */}
                <td className={cx("p-4")}>
                  <Button
                    variant={row.id}
                    className={cn(
                      "pointer-events-none ring-2 ring-offset-2 ring-offset-background",
                      row.id.includes("destructive") ? "ring-destructive" : "ring-ring",
                    )}
                  >
                    Button
                  </Button>
                </td>
                {/* Active */}
                <td className={cx("p-4")}>
                  <Button
                    variant={row.id}
                    className={cn(
                      "pointer-events-none scale-95 after:opacity-100 before:opacity-10 before:scale-150 before:duration-0",
                      row.id === "tertiary-neutral" && "button-tertiary-neutral-pressing-state",
                      row.id === "tertiary-brand" && "button-tertiary-brand-pressing-state",
                      row.id === "tertiary-destructive" && "button-tertiary-destructive-pressing-state",
                    )}
                  >
                    Button
                  </Button>
                </td>
                {/* Disabled */}
                <td className={cx("p-4")}>
                  <div className={cx("w-fit cursor-not-allowed")}>
                    <Button variant={row.id} disabled className={cx("pointer-events-none")}>
                      Button
                    </Button>
                  </div>
                </td>
                {/* Pending */}
                <td className={cx("p-4")}>
                  <div className={cx("w-fit cursor-wait")}>
                    <Button
                      variant={row.id}
                      isPending
                      className={cx("pointer-events-none cursor-wait min-w-[100px]")}
                      leadingIcon={<CircleNotchIcon className={cx("animate-spin")} size={16} />}
                    >
                      Pending
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
