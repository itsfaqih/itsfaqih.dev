import { cx } from "@/stylex";
import { CodeBlock } from "@/components/code-block";

export function DataParsingDemo() {
  const rawJson = `{
  "id": 1,
  "name": "Alice"
}`;

  const zodSchema = `z.object({
  id: z.number(),
  name: z.string(),
  // Fallback to "Unknown" if missing
  city: z.string().catch("Unknown")
})`;

  const parsedResult = `{
  "id": 1,
  "name": "Alice",
  "city": "Unknown"
}`;

  return (
    <div data-rule-of-thumb-card="true" className={cx("rounded-2xl border border-border bg-card overflow-hidden mb-8")}>
      <div className={cx("p-6")}>
        <h3 className={cx("font-semibold text-foreground mb-6")}>Safe Parsing with Fallbacks</h3>

        <div className={cx("space-y-6")}>
          {/* Step 1: Raw Data */}
          <div className={cx("space-y-2")}>
            <div className={cx("flex items-center gap-2 text-sm text-muted-foreground")}>
              <span className={cx("size-5 rounded flex items-center justify-center bg-muted text-muted-foreground font-mono text-xs")}>
                1
              </span>
              Input: Raw API response or database query result
            </div>
            <div className={cx("relative")}>
              <CodeBlock code={rawJson} lang="json" />
              <div className={cx("absolute top-3 right-3")}>
                <div className={cx("px-2 py-1 rounded bg-negative/10 border border-negative/20 text-[10px] font-medium text-negative-foreground")}>
                  Missing "city"
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Schema */}
          <div className={cx("space-y-2")}>
            <div className={cx("flex items-center gap-2 text-sm text-muted-foreground")}>
              <span className={cx("size-5 rounded flex items-center justify-center bg-muted text-muted-foreground font-mono text-xs")}>
                2
              </span>
              Process: Zod (or any) Schema
            </div>
            <CodeBlock code={zodSchema} lang="typescript" />
          </div>

          {/* Step 3: Result */}
          <div className={cx("space-y-2")}>
            <div className={cx("flex items-center gap-2 text-sm text-muted-foreground")}>
              <span className={cx("size-5 rounded flex items-center justify-center bg-muted text-muted-foreground font-mono text-xs")}>
                3
              </span>
              Output: Safe Data
            </div>
            <div className={cx("relative")}>
              <CodeBlock code={parsedResult} lang="json" />
              <div className={cx("absolute top-3 right-3")}>
                <div className={cx("px-2 py-1 rounded bg-positive/10 border border-positive/20 text-[10px] font-medium text-positive-foreground")}>
                  Fallback Applied
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}