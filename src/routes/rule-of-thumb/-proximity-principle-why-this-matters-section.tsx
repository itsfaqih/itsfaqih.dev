import { cx } from "@/stylex";

export function WhyThisMattersSection() {
  return (
    <div className={cx("mb-20")}>
      <div className={cx("p-8 rounded-2xl bg-card border border-border")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-4")}>Why This Matters</h2>
        <ul className={cx("space-y-3 text-muted-foreground")}>
          <li className={cx("flex items-start gap-3")}>
            <span className={cx("text-lg")}>🧠</span>
            <span>
              <strong className={cx("text-foreground")}>Reduces cognitive load</strong> — Less jumping
              between files
            </span>
          </li>
          <li className={cx("flex items-start gap-3")}>
            <span className={cx("text-lg")}>🚀</span>
            <span>
              <strong className={cx("text-foreground")}>Faster shipping</strong> — Less time spent
              managing file structure
            </span>
          </li>
          <li className={cx("flex items-start gap-3")}>
            <span className={cx("text-lg")}>🧹</span>
            <span>
              <strong className={cx("text-foreground")}>Easier cleanup</strong> — Delete a file and
              everything goes with it
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
