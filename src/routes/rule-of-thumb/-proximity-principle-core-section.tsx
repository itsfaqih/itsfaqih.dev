import { cx } from "@/stylex";
import {
  FileCodeIcon,
  LightningIcon,
  MapPinIcon,
  TreeStructureIcon,
} from "@phosphor-icons/react";

const CORE_PRINCIPLES = [
  {
    icon: MapPinIcon,
    title: "Colocate",
    description: "Put related code as close as possible to where it's used.",
  },
  {
    icon: FileCodeIcon,
    title: "Inline First",
    description: "Don't extract until code is reused. Keep it inline by default.",
  },
  {
    icon: TreeStructureIcon,
    title: "Lowest Common Ancestor",
    description: "When sharing code, place it at the nearest common parent directory.",
  },
  {
    icon: LightningIcon,
    title: "Prefer Fewer Files",
    description: "One file with related code beats many files requiring imports.",
  },
] as const;

export function CorePrinciplesSection() {
  return (
    <div className={cx("rule-of-thumb-feature-grid-section mb-20")}>
      <h2 className={cx("text-2xl font-bold text-foreground text-center mb-8")}>The Core Principles</h2>
      <ul
        className={cx("list-none rule-of-thumb-feature-grid grid grid-cols-1 sm:grid-cols-2 gap-0 pl-px pt-px")}
        aria-label="Proximity principles"
      >
        {CORE_PRINCIPLES.map((principle) => {
          const Icon = principle.icon;
          return (
            <li
              key={principle.title}
              className={cx("relative flex flex-col items-center justify-start gap-3 p-6 h-auto min-h-[200px] transition-all group hover:z-10 -ml-px -mt-px before:pointer-events-none before:absolute before:-inset-x-2 before:top-0 before:bottom-0 before:border-t before:border-b before:border-border group-hover:before:border-muted-foreground before:transition-colors before:mask-[linear-gradient(to_right,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)] after:pointer-events-none after:absolute after:-inset-y-2 after:left-0 after:right-0 after:border-l after:border-r after:border-border group-hover:after:border-muted-foreground after:transition-colors after:mask-[linear-gradient(to_bottom,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)]")}
            >
              <div
                className={cx("size-10 flex items-center justify-center z-10 rounded-lg bg-accent text-accent-foreground")}
                aria-hidden="true"
              >
                <Icon size={20} />
              </div>
              <h3 className={cx("font-semibold text-foreground text-center z-10")}>{principle.title}</h3>
              <p className={cx("text-sm text-muted-foreground text-center leading-relaxed z-10")}>
                {principle.description}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
