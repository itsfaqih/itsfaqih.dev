import { cn } from "@/cn";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { GlassyButton } from "../../../components/glassy-button";

export const ButtonVariantMatrix = () => {
  const variants = [
    { name: "Primary", id: "primary" },
    { name: "Secondary", id: "secondary" },
    { name: "Ghost", id: "ghost" },
    { name: "Destructive", id: "destructive" },
    { name: "Ghost Destr.", id: "ghost-destructive" },
  ] as const;

  return (
    <div className="mb-16">
      <h3 className="text-lg font-semibold text-(--text-primary) mb-6">Variant States</h3>
      <div className="overflow-x-auto rounded-xl border border-(--border-color) bg-(--bg-secondary)">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-(--border-color) bg-(--bg-primary)/50">
              <th className="p-4 font-medium text-(--text-secondary) text-xs uppercase tracking-wider">
                Variant
              </th>
              <th className="p-4 font-medium text-(--text-secondary) text-xs uppercase tracking-wider">
                Idle
              </th>
              <th className="p-4 font-medium text-(--text-secondary) text-xs uppercase tracking-wider">
                Hover
              </th>
              <th className="p-4 font-medium text-(--text-secondary) text-xs uppercase tracking-wider">
                Active
              </th>
              <th className="p-4 font-medium text-(--text-secondary) text-xs uppercase tracking-wider">
                Disabled
              </th>
              <th className="p-4 font-medium text-(--text-secondary) text-xs uppercase tracking-wider">
                Loading
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border-color)">
            {variants.map((row) => (
              <tr key={row.name} className="group hover:bg-(--bg-primary)/30 transition-colors">
                <td className="p-4 font-medium text-(--text-primary) text-sm">{row.name}</td>
                {/* Idle */}
                <td className="p-4">
                  <GlassyButton variant={row.id} className="pointer-events-none">
                    Button
                  </GlassyButton>
                </td>
                {/* Hover */}
                <td className="p-4">
                  <GlassyButton
                    variant={row.id}
                    className={cn(
                      "pointer-events-none after:opacity-100",
                      row.id === "ghost" && "border-gray-500/20 dark:border-white/10",
                      row.id === "ghost-destructive" && "border-red-500/20 dark:border-red-400/30",
                    )}
                  >
                    Button
                  </GlassyButton>
                </td>
                {/* Active */}
                <td className="p-4">
                  <GlassyButton
                    variant={row.id}
                    className={cn(
                      "pointer-events-none scale-95 after:opacity-100 before:opacity-10 before:scale-150 before:duration-0",
                      row.id === "ghost" && "border-gray-500/20 dark:border-white/10",
                      row.id === "ghost-destructive" && "border-red-500/20 dark:border-red-400/30",
                    )}
                  >
                    Button
                  </GlassyButton>
                </td>
                {/* Disabled */}
                <td className="p-4">
                  <GlassyButton variant={row.id} disabled className="pointer-events-none">
                    Button
                  </GlassyButton>
                </td>
                {/* Loading */}
                <td className="p-4">
                  <GlassyButton
                    variant={row.id}
                    disabled
                    className="pointer-events-none opacity-100 cursor-wait min-w-[100px]"
                    leadingIcon={<CircleNotchIcon className="animate-spin" size={16} />}
                  >
                    Saving
                  </GlassyButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
