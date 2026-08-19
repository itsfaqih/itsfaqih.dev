import { cx } from "@/stylex";
import { BestPractice } from "../index";



export function ButtonBestPractices() {
  return (
    <>
{/* Best Practices */}
      <div className={cx("mb-20")}>
        <h2 className={cx("text-2xl font-bold text-foreground text-center mb-8")}>Best Practices</h2>
        <div className={cx("space-y-4")}>
          <BestPractice
            emoji="⚡"
            title="Keep transitions snappy"
            description="Use 100-200ms for state changes. Any longer feels sluggish."
          />
          <BestPractice
            emoji="🎯"
            title="Prevent double-clicks"
            description="Always disable the button during loading to prevent duplicate submissions."
          />
          <BestPractice
            emoji="💬"
            title="Update button text"
            description="Change from 'Submit' to 'Processing...' to 'Done!' for clear communication."
          />
          <BestPractice
            emoji="🔄"
            title="Show success state"
            description="After completing an action, briefly show a success state before resetting."
          />
          <BestPractice
            emoji="🎨"
            title="Maintain contrast"
            description="Even in disabled state, ensure text remains readable for accessibility."
          />
        </div>
      </div>
    </>
  );
}
