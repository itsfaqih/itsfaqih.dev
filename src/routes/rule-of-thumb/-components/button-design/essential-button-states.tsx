import { cx } from "@/stylex";
import {
  CircleNotchIcon,
  CrosshairSimpleIcon,
  CursorIcon,
  HandIcon,
  ProhibitIcon,
  SparkleIcon,
} from "@phosphor-icons/react";



export function EssentialButtonStates() {
  return (
    <>
{/* States Overview Grid */}
      <div className={cx("mb-20")}>
        <h2 className={cx("text-2xl font-bold text-foreground text-center mb-8")}>
          The Essential States
        </h2>
        <ul
          className={cx("grid grid-cols-2 md:grid-cols-3 gap-0 pl-px pt-px")}
          aria-label="Button states"
        >
          {[
            {
              id: "idle",
              icon: SparkleIcon,
              title: "Idle State",
              description: "The default resting state. Clearly clickable with hover effects.",
            },
            {
              id: "hover",
              icon: CursorIcon,
              title: "Hover State",
              description:
                "Provides feedback when cursor is over the button. Signals interactivity.",
            },
            {
              id: "focus",
              icon: CrosshairSimpleIcon,
              title: "Focus State",
              description: "Shows keyboard focus with a visible ring. Essential for accessibility.",
            },
            {
              id: "pressing",
              icon: HandIcon,
              title: "Pressing State",
              description: "Visual feedback on press. Scale-down or click effect.",
            },
            {
              id: "pending",
              icon: CircleNotchIcon,
              title: "Pending State",
              description: "Shows progress while waiting. Prevents double-clicks.",
            },
            {
              id: "disabled",
              icon: ProhibitIcon,
              title: "Disabled State",
              description: "Indicates unavailable action. Reduced opacity and no pointer.",
            },
          ].map((state) => (
            <li
              key={state.id}
              className={cx("relative flex flex-col items-center justify-center gap-3 p-6 h-auto min-h-[200px] transition-all group hover:z-10 -ml-px -mt-px\r\n                before:pointer-events-none before:absolute before:-inset-x-2 before:top-0 before:bottom-0 before:border-t before:border-b before:border-zinc-200 dark:before:border-white/10 group-hover:before:border-muted-foreground before:transition-colors before:mask-[linear-gradient(to_right,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)]\r\n                after:pointer-events-none after:absolute after:-inset-y-2 after:left-0 after:right-0 after:border-l after:border-r after:border-zinc-200 dark:after:border-white/10 group-hover:after:border-muted-foreground after:transition-colors after:mask-[linear-gradient(to_bottom,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)]")}
            >
              <div
                className={cx("size-10 flex items-center justify-center z-10 rounded-lg bg-zinc-500/10 dark:bg-zinc-500/20 text-foreground")}
                aria-hidden="true"
              >
                <state.icon size={20} />
              </div>
              <h3 className={cx("font-semibold text-foreground text-center z-10")}>{state.title}</h3>
              <p className={cx("text-sm text-muted-foreground text-center leading-relaxed z-10")}>
                {state.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
