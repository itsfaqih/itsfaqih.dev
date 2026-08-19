import { cx } from "@/stylex";



export function OpticalAlignment() {
  return (
    <>
{/* Why Optical Alignment Matters */}
        <div className={cx("p-6 rounded-xl bg-amber-500/10 border border-amber-500/20")}>
          <h4 className={cx("font-semibold text-foreground mb-2 flex items-center gap-2")}>
            <span>👁️</span> Why Optical Alignment Matters
          </h4>
          <p className={cx("text-sm text-muted-foreground mb-3")}>
            Icons are visually denser than whitespace. When you place an icon at the edge of a
            button, it creates an optical illusion where that side appears "heavier" than the other.
          </p>
          <p className={cx("text-sm text-muted-foreground")}>
            By reducing the padding on the icon side, you're compensating for this visual weight,
            making the button appear evenly balanced. This is the same principle used in typography
            when kerning letters—mathematical spacing isn't always visually correct.
          </p>
        </div>
    </>
  );
}
