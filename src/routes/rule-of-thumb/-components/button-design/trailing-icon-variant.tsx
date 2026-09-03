import { cx } from "@/stylex";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CaretDownIcon,
  DownloadSimpleIcon,
  ProhibitIcon,
  XIcon,
} from "@phosphor-icons/react";
import { CodeExample } from "../index";
import { Button } from "../../../../components/button";



export function TrailingIconVariant() {
  return (
    <>
{/* Trailing Icon Variant */}
        <div className={cx("mb-8")}>
          <h3 className={cx("text-lg font-semibold text-foreground mb-3")}>With Trailing Icon</h3>

          {/* Visual Demo */}
          <div data-rule-of-thumb-card="true" className={cx("mb-4 p-6 rounded-xl border border-border bg-card")}>
            <div className={cx("flex flex-wrap items-center gap-4")}>
              <Button variant="brand" trailingIcon={<ArrowRightIcon size={18} />}>
                Continue
              </Button>
              <Button variant="neutral" trailingIcon={<CaretDownIcon size={18} />}>
                Action
              </Button>
              <Button variant="tertiary-neutral" trailingIcon={<ArrowUpRightIcon size={18} />}>
                Read more
              </Button>
              <Button variant="destructive" trailingIcon={<ProhibitIcon size={18} />}>
                Revoke Access
              </Button>
              <Button variant="tertiary-destructive" trailingIcon={<XIcon size={18} />}>
                Remove Item
              </Button>
            </div>
            <p className={cx("text-xs text-muted-foreground mt-3")}>
              Notice how the reduced right padding (pr-4) keeps the content visually centered.
            </p>
          </div>

          {/* When to Use */}
          <div data-rule-of-thumb-card="true" className={cx("mb-4 rounded-xl border border-border bg-card p-5")}>
            <h4 className={cx("font-semibold text-foreground mb-4 text-sm")}>
              When to Use Trailing Icons
            </h4>
            <div className={cx("space-y-4")}>
              {[
                {
                  icon: ArrowRightIcon,
                  title: "Forward/Next actions",
                  description: '"Continue", "Next Step", "Proceed".',
                },
                {
                  icon: ArrowUpRightIcon,
                  title: "External links",
                  description: "Indicating the action opens something new.",
                },
                {
                  icon: CaretDownIcon,
                  title: "Dropdown triggers",
                  description: "Chevron indicating expandable content.",
                },
                {
                  icon: DownloadSimpleIcon,
                  title: "Download actions",
                  description: 'Arrow pointing down after "Download".',
                },
              ].map((item) => (
                <div key={item.title} className={cx("flex gap-3 items-start")}>
                  <div className={cx("mt-0.5 p-1 rounded-md bg-accent text-accent-foreground")}>
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
            <p className={cx("text-xs text-muted-foreground mt-4 italic border-t border-border pt-3")}>
              Rule of thumb: Trailing icons often indicate <strong>direction</strong> or{" "}
              <strong>consequence</strong> of the action.
            </p>
          </div>

          <CodeExample
            title="Trailing Icon Button"
            code={`// Using the trailingIcon prop automatically adjusts padding
<GlassyButton trailingIcon={<ArrowRightIcon size={18} />}>
  Continue
</GlassyButton>`}
            description="The GlassyButton component automatically detects the icon and applies 'pl-3 pr-2' for optical balance."
          />
        </div>
    </>
  );
}
