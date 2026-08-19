import { cx } from "@/stylex";
import { SimpleTooltip } from "@/components/tooltip";
import {
  ArrowsClockwiseIcon,
  DeviceMobileIcon,
  GearIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { CodeExample } from "../index";
import { Button } from "../../../../components/button";



export function IconOnlyVariant() {
  return (
    <>
{/* Icon Only Variant */}
        <div className={cx("mb-8")}>
          <h3 className={cx("text-lg font-semibold text-foreground mb-3")}>Icon Only</h3>

          {/* Visual Demo */}
          <div className={cx("mb-4 p-6 rounded-xl border border-border bg-card")}>
            <div className={cx("flex flex-wrap items-center gap-4")}>
              {/* Square variants */}
              <div className={cx("flex flex-col items-center gap-2")}>
                <SimpleTooltip content="Settings">
                  <Button variant="tertiary-neutral" className={cx("size-8.5 p-0")} aria-label="Settings">
                    <GearIcon size={20} />
                  </Button>
                </SimpleTooltip>
                <span className={cx("text-xs text-muted-foreground")}>Square Tertiary Neutral</span>
              </div>
              <div className={cx("flex flex-col items-center gap-2")}>
                <SimpleTooltip content="Add item">
                  <Button variant="neutral" className={cx("size-8.5 p-0")} aria-label="Add item">
                    <PlusIcon size={20} />
                  </Button>
                </SimpleTooltip>
                <span className={cx("text-xs text-muted-foreground")}>Square Secondary</span>
              </div>
              <div className={cx("flex flex-col items-center gap-2")}>
                <SimpleTooltip content="Delete">
                  <Button variant="destructive" className={cx("size-8.5 p-0")} aria-label="Delete">
                    <TrashIcon size={20} />
                  </Button>
                </SimpleTooltip>
                <span className={cx("text-xs text-muted-foreground")}>Square Destructive</span>
              </div>
            </div>
            <p className={cx("text-xs text-muted-foreground mt-4")}>
              Icon-only buttons work great for toolbars and compact UIs.
            </p>
          </div>

          {/* When to Use */}
          <div className={cx("mb-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-5")}>
            <h4 className={cx("font-semibold text-foreground mb-4 text-sm")}>
              When to Use Icon-Only Buttons
            </h4>
            <div className={cx("space-y-4")}>
              {[
                {
                  icon: GearIcon,
                  title: "Toolbars & action bars",
                  description: "Where space is limited and icons are universally understood.",
                },
                {
                  icon: ArrowsClockwiseIcon,
                  title: "Repeated actions",
                  description: "Close buttons, expand/collapse, media controls.",
                },
                {
                  icon: DeviceMobileIcon,
                  title: "Mobile interfaces",
                  description: "Maximizing touch target while saving horizontal space.",
                },
                {
                  icon: MagnifyingGlassIcon,
                  title: "Universally recognized icons",
                  description: "Play, pause, close, settings, search.",
                },
              ].map((item) => (
                <div key={item.title} className={cx("flex gap-3 items-start")}>
                  <div className={cx("mt-0.5 p-1 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300")}>
                    <item.icon size={14} />
                  </div>
                  <div>
                    <p className={cx("text-sm font-medium text-foreground")}>{item.title}</p>
                    <p className={cx("text-xs text-muted-foreground leading-relaxed")}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accessibility Requirements */}
          <div className={cx("mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20")}>
            <h4 className={cx("font-semibold text-foreground mb-2 text-sm flex items-center gap-2")}>
              <span>⚠️</span> Required: Accessibility & Clarity
            </h4>
            <div className={cx("space-y-3 text-sm text-muted-foreground")}>
              <div>
                <p className={cx("font-medium text-foreground")}>
                  Always add{" "}
                  <code className={cx("px-1.5 py-0.5 rounded bg-background text-rose-400")}>
                    aria-label
                  </code>
                </p>
                <p className={cx("text-xs mt-1")}>
                  Screen readers cannot interpret icons. The aria-label provides the accessible name
                  that describes the button's action.
                </p>
              </div>
              <div>
                <p className={cx("font-medium text-foreground")}>Tooltip is mandatory</p>
                <p className={cx("text-xs mt-1")}>
                  Icons can be ambiguous. Always provide a tooltip to explain the action. We use a
                  custom <code className={cx("px-1.5 py-0.5 rounded bg-background")}>Tooltip</code>{" "}
                  component (powered by Base UI) for consistent user experience.
                </p>
              </div>
            </div>
          </div>

          <CodeExample
            title="Icon Only Button"
            code={`// 1. Mandatory Tooltip
// 2. Square sizing (size-8.5 p-0)
// 3. Aria-label for accessibility
<SimpleTooltip content="Settings">
  <GlassyButton 
    className={cx("size-8.5 p-0")}
    aria-label="Settings"
  >
    <GearIcon size={20} />
  </GlassyButton>
</SimpleTooltip>`}
            description="Icon-only buttons should be square (via explicit classes) and must always have a tooltip and aria-label."
          />
        </div>
    </>
  );
}
