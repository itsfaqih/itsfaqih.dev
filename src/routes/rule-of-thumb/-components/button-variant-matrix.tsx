import { cn } from "@/cn";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { Button } from "../../../components/button";

export function ButtonVariantMatrix() {
  const variants = [
    { name: "Brand", id: "brand" },
    { name: "Neutral", id: "neutral" },
    { name: "Destructive", id: "destructive" },
    { name: "Secondary Brand", id: "secondary-brand" },
    { name: "Secondary Neutral", id: "secondary-neutral" },
    { name: "Secondary Destr.", id: "secondary-destructive" },
    { name: "Tertiary Neutral", id: "tertiary-neutral" },
    { name: "Tertiary Brand", id: "tertiary-brand" },
    { name: "Tertiary Destr.", id: "tertiary-destructive" },
  ] as const;

  return (
    <div className="mb-16">
      <h3 className="text-lg font-semibold text-foreground mb-6">Variant States</h3>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Variant
              </th>
              <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Idle
              </th>
              <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Hover
              </th>
              <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Focus
              </th>
              <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Pressing
              </th>
              <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Disabled
              </th>
              <th className="p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Pending
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {variants.map((row) => (
              <tr key={row.name} className="group hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium text-foreground text-sm">{row.name}</td>
                {/* Idle */}
                <td className="p-4">
                  <Button variant={row.id} className="pointer-events-none">
                    Button
                  </Button>
                </td>
                {/* Hover */}
                <td className="p-4">
                  <Button
                    variant={row.id}
                    className={cn(
                      "pointer-events-none after:opacity-100",
                      row.id === "tertiary-neutral" && "border-border/40",
                      row.id === "tertiary-brand" && "border-brand/20",
                      row.id === "tertiary-destructive" && "border-destructive/20",
                    )}
                  >
                    Button
                  </Button>
                </td>
                {/* Focus */}
                <td className="p-4">
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
                <td className="p-4">
                  <Button
                    variant={row.id}
                    className={cn(
                      "pointer-events-none scale-95 after:opacity-100 before:opacity-10 before:scale-150 before:duration-0",
                      row.id === "tertiary-neutral" && "border-border/40",
                      row.id === "tertiary-brand" && "border-brand/20",
                      row.id === "tertiary-destructive" && "border-destructive/20",
                    )}
                  >
                    Button
                  </Button>
                </td>
                {/* Disabled */}
                <td className="p-4">
                  <div className="w-fit cursor-not-allowed">
                    <Button variant={row.id} disabled className="pointer-events-none">
                      Button
                    </Button>
                  </div>
                </td>
                {/* Pending */}
                <td className="p-4">
                  <div className="w-fit cursor-wait">
                    <Button
                      variant={row.id}
                      disabled
                      className="pointer-events-none disabled:opacity-80 cursor-wait min-w-[100px]"
                      leadingIcon={<CircleNotchIcon className="animate-spin" size={16} />}
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
