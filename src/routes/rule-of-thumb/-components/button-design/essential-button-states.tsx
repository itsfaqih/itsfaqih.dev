import { cx } from "@/stylex";
import {
  CircleNotchIcon,
  CrosshairSimpleIcon,
  CursorIcon,
  HandIcon,
  ProhibitIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { FeatureTiles } from "../index";

const BUTTON_STATES = [
  {
    icon: SparkleIcon,
    title: "Idle State",
    description: "The default resting state. Clearly clickable with hover effects.",
  },
  {
    icon: CursorIcon,
    title: "Hover State",
    description:
      "Provides feedback when cursor is over the button. Signals interactivity.",
  },
  {
    icon: CrosshairSimpleIcon,
    title: "Focus State",
    description: "Shows keyboard focus with a visible ring. Essential for accessibility.",
  },
  {
    icon: HandIcon,
    title: "Pressing State",
    description: "Visual feedback on press. Scale-down or click effect.",
  },
  {
    icon: CircleNotchIcon,
    title: "Pending State",
    description: "Shows progress while waiting. Prevents double-clicks.",
  },
  {
    icon: ProhibitIcon,
    title: "Disabled State",
    description: "Indicates unavailable action. Reduced opacity and no pointer.",
  },
] as const;

export function EssentialButtonStates() {
  return (
    <div className={cx("mb-20")}>
      <h2 className={cx("text-2xl font-bold text-foreground mb-8")}>The Essential States</h2>
      <FeatureTiles items={BUTTON_STATES} columns={3} label="Button states" />
    </div>
  );
}
