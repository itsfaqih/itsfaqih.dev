import { cx } from "@/stylex";
import { BestPractice, CodeExample, SectionHeading } from "./-components";
import { ActionsDemo } from "./-table-design-actions-demo";

export function TableActionsSection() {
  return (
    <div className={cx("mb-20")}>
      <SectionHeading
        title="Displaying Actions"
        description="Action buttons should be predictable and easy to access."
      />

      <ActionsDemo />

      <div className={cx("mt-8 space-y-4")}>
        <BestPractice
          emoji="➡️"
          title="Right-align actions"
          description="Place action buttons on the right side of the row for consistent, predictable positioning."
        />
        <BestPractice
          emoji="📏"
          title="Fixed-width action column"
          description="Give the actions column a fixed width so buttons don't shift as data changes."
        />
        <BestPractice
          emoji="🎯"
          title="Use icon buttons for space"
          description="Icon-only buttons with tooltips save horizontal space while remaining accessible."
        />
      </div>

      <div className={cx("mt-8")}>
        <CodeExample
          title="Right-aligned Actions Column"
          code={`<table>
  <thead>
    <tr>
      <th className={cx("text-left")}>Name</th>
      <th className={cx("text-left")}>Email</th>
      {/* Right-align the actions header */}
      <th className={cx("text-right w-32")}>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Alice Johnson</td>
      <td>alice@example.com</td>
      {/* Right-align the actions */}
      <td className={cx("text-right")}>
        <div className={cx("flex justify-end gap-2")}>
          <IconButton icon={Pencil} />
          <IconButton icon={Trash2} />
        </div>
      </td>
    </tr>
  </tbody>
</table>`}
          description="Right-aligned actions are easier to click and create a clean visual edge."
        />
      </div>
    </div>
  );
}
