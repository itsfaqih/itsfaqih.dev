import { cx } from "@/stylex";
import { BestPractice, CodeExample, SectionHeading } from "./-components";
import { NumbersDemo } from "./-table-design-numbers-demo";

export function TableNumbersSection() {
  return (
    <div className={cx("mb-20")}>
      <SectionHeading
        title="Displaying Numbers"
        description="Numeric data should be easy to scan and compare at a glance."
      />

      <NumbersDemo />

      <div className={cx("mt-8 space-y-4")}>
        <BestPractice
          emoji="🔢"
          title="Use tabular-nums"
          description="The tabular-nums CSS property ensures all digits have equal width for perfect alignment."
        />
        <BestPractice
          emoji="➡️"
          title="Right-align numbers"
          description="Right-aligned numbers let users easily compare values by scanning the decimal points."
        />
        <BestPractice
          emoji="💰"
          title="Format with locale"
          description="Use toLocaleString() for proper thousand separators and currency formatting."
        />
      </div>

      <div className={cx("mt-8")}>
        <CodeExample
          title="Properly Formatted Numbers"
          code={`<table>
  <thead>
    <tr>
      <th className={cx("text-left")}>Name</th>
      {/* Right-align the number header */}
      <th className={cx("text-right")}>Revenue</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Alice Johnson</td>
      {/* Use tabular-nums + right-align + mono font */}
      <td className={cx("text-right font-mono tabular-nums")}>
        \${revenue.toLocaleString()}
      </td>
    </tr>
  </tbody>
</table>

/* CSS for tabular numbers */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}`}
          description="Tabular figures + right alignment = easy-to-scan numeric columns."
        />
      </div>
    </div>
  );
}
