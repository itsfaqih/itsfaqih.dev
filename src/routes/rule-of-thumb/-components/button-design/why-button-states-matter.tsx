import { cx } from "@/stylex";



export function WhyButtonStatesMatter() {
  return (
    <>
{/* Why This Matters */}
      <div className={cx("mb-20")}>
        <div className={cx("p-8 rounded-2xl bg-linear-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20")}>
          <h2 className={cx("text-xl font-bold text-foreground mb-4")}>Why Button States Matter</h2>
          <ul className={cx("space-y-3 text-muted-foreground")}>
            <li className={cx("flex items-start gap-3")}>
              <span className={cx("text-lg")}>🧠</span>
              <span>
                <strong className={cx("text-foreground")}>Reduces uncertainty</strong> — Users know their
                action was registered
              </span>
            </li>
            <li className={cx("flex items-start gap-3")}>
              <span className={cx("text-lg")}>🚫</span>
              <span>
                <strong className={cx("text-foreground")}>Prevents errors</strong> — Loading state blocks
                double-submissions
              </span>
            </li>
            <li className={cx("flex items-start gap-3")}>
              <span className={cx("text-lg")}>✨</span>
              <span>
                <strong className={cx("text-foreground")}>Feels premium</strong> — Polished
                micro-interactions build trust
              </span>
            </li>
            <li className={cx("flex items-start gap-3")}>
              <span className={cx("text-lg")}>♿</span>
              <span>
                <strong className={cx("text-foreground")}>Improves accessibility</strong> — Clear states
                help all users understand what's happening
              </span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
