import { cx } from "@/stylex";
import {
  FileCodeIcon,
  LightningIcon,
  MapPinIcon,
  TreeStructureIcon,
} from "@phosphor-icons/react";
import { FeatureTiles } from "./-components";

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
    <div className={cx("mb-20")}>
      <h2 className={cx("text-2xl font-bold text-foreground mb-8")}>The Core Principles</h2>
      <FeatureTiles items={CORE_PRINCIPLES} columns={2} label="Proximity principles" />
    </div>
  );
}
