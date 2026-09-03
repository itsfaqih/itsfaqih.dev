import { cx } from "@/stylex";
import {
  ArrowLeftIcon,
  CheckIcon,
  PencilIcon,
  PlusIcon,
  SparkleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { CodeExample } from "../index";
import { Button } from "../../../../components/button";



export function LeadingIconVariant() {
  return (
    <>
{/* Leading Icon Variant */}
        <div className={cx("mb-8")}>
          <h3 className={cx("text-lg font-semibold text-foreground mb-3")}>With Leading Icon</h3>

          {/* Visual Demo */}
          <div data-rule-of-thumb-card="true" className={cx("mb-4 p-6 rounded-xl squircle border border-border bg-card")}>
            <div className={cx("flex flex-wrap items-center gap-4")}>
              <Button variant="tertiary-neutral" leadingIcon={<ArrowLeftIcon size={18} />}>
                Go Back
              </Button>
              <Button variant="brand" leadingIcon={<CheckIcon className={cx("size-4")} />}>
                Approve
              </Button>
              <Button variant="destructive" leadingIcon={<XIcon className={cx("size-4")} />}>
                Reject
              </Button>
              <Button variant="neutral" leadingIcon={<PencilIcon className={cx("size-4")} />}>
                Edit
              </Button>
              <Button variant="tertiary-destructive" leadingIcon={<XIcon className={cx("size-4")} />}>
                Clear
              </Button>
            </div>
            <p className={cx("text-xs text-muted-foreground mt-3")}>Try hovering and clicking!</p>
          </div>

          {/* When to Use */}
          <div data-rule-of-thumb-card="true" className={cx("mb-4 rounded-xl squircle border border-border bg-card p-5")}>
            <h4 className={cx("font-semibold text-foreground mb-4 text-sm")}>
              When to Use Leading Icons
            </h4>
            <div className={cx("space-y-4")}>
              {[
                {
                  icon: ArrowLeftIcon,
                  title: "Back/Return actions",
                  description: "The arrow naturally points to where you're going.",
                },
                {
                  icon: CheckIcon,
                  title: "Confirmation actions",
                  description: 'Check marks before "Approve", "Confirm", "Accept".',
                },
                {
                  icon: PlusIcon,
                  title: "Add/Create actions",
                  description: 'Plus icon before "Add Item", "New Project".',
                },
                {
                  icon: SparkleIcon,
                  title: "Feature emphasis",
                  description: "Drawing attention to the action type first.",
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
          </div>

          <CodeExample
            title="Leading Icon Button"
            code={`// Using the leadingIcon prop automatically adjusts padding
<GlassyButton leadingIcon={<ArrowLeftIcon size={18} />}>
  Go Back
</GlassyButton>`}
            description="The GlassyButton component automatically detects the icon and applies 'pl-2 pr-3' for optical balance."
          />
        </div>
    </>
  );
}
