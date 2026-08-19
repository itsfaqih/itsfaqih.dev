import { cx } from "@/stylex";
import { ButtonVariantMatrix } from "../index";
import { DestructiveActions } from "./destructive-actions";
import { IconOnlyVariant } from "./icon-only-variant";
import { LeadingIconVariant } from "./leading-icon-variant";
import { OpticalAlignment } from "./optical-alignment";
import { TrailingIconVariant } from "./trailing-icon-variant";
import { VisualHierarchy } from "./visual-hierarchy";

export function ButtonVariantsSection() {
  return (
    <div className={cx("mb-20")}>
      <h2 className={cx("text-2xl font-bold text-foreground text-center mb-4")}>Button Variants</h2>
      <p className={cx("text-muted-foreground text-center mb-8 max-w-2xl mx-auto")}>
        Buttons with icons require special attention to optical alignment. When adding icons, the
        padding should be adjusted to maintain visual balance.
      </p>
      <VisualHierarchy />
      <DestructiveActions />
      <ButtonVariantMatrix />
      <LeadingIconVariant />
      <TrailingIconVariant />
      <IconOnlyVariant />
      <OpticalAlignment />
    </div>
  );
}
