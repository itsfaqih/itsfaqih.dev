import { cx } from "@/stylex";
import { useEffect, useState } from "react";
import { highlightShikiCode } from "../shiki-loader";

export function DataParsingDemo() {
  const [highlightedJson, setHighlightedJson] = useState<string>("");
  const [highlightedSchema, setHighlightedSchema] = useState<string>("");
  const [highlightedResult, setHighlightedResult] = useState<string>("");

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

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      highlightShikiCode(rawJson, "json"),
      highlightShikiCode(zodSchema, "typescript"),
      highlightShikiCode(parsedResult, "json"),
    ]).then(([json, schema, result]) => {
      if (cancelled) return;
      setHighlightedJson(json);
      setHighlightedSchema(schema);
      setHighlightedResult(result);
    });

    return () => {
      cancelled = true;
    };
  }, [rawJson, zodSchema, parsedResult]);

  return (
    <div className={cx("rounded-2xl border border-border bg-card overflow-hidden mb-8")}>
      <div className={cx("p-6")}>
        <h3 className={cx("font-semibold text-foreground mb-6")}>Safe Parsing with Fallbacks</h3>

        <div className={cx("space-y-6")}>
          {/* Step 1: Raw Data */}
          <div className={cx("space-y-2")}>
            <div className={cx("flex items-center gap-2 text-sm text-muted-foreground")}>
              <span className={cx("size-5 rounded flex items-center justify-center bg-slate-500/10 text-slate-500 font-mono text-xs")}>
                1
              </span>
              Input: Raw API response or database query result
            </div>
            <div className={cx("relative")}>
              <div
                className={cx("p-4 rounded-lg bg-background border border-border text-xs overflow-x-auto [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:m-0!")}
                dangerouslySetInnerHTML={{ __html: highlightedJson || `<pre>${rawJson}</pre>` }}
              />
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
              <span className={cx("size-5 rounded flex items-center justify-center bg-slate-500/10 text-slate-500 font-mono text-xs")}>
                2
              </span>
              Process: Zod (or any) Schema
            </div>
            <div
              className={cx("p-4 rounded-lg bg-background border border-border text-xs overflow-x-auto [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:m-0!")}
              dangerouslySetInnerHTML={{ __html: highlightedSchema || `<pre>${zodSchema}</pre>` }}
            />
          </div>

          {/* Step 3: Result */}
          <div className={cx("space-y-2")}>
            <div className={cx("flex items-center gap-2 text-sm text-muted-foreground")}>
              <span className={cx("size-5 rounded flex items-center justify-center bg-slate-500/10 text-slate-500 font-mono text-xs")}>
                3
              </span>
              Output: Safe Data
            </div>
            <div className={cx("relative")}>
              <div
                className={cx("p-4 rounded-lg bg-background border border-border text-xs overflow-x-auto [&_pre]:bg-transparent! [&_pre]:p-0! [&_pre]:m-0!")}
                dangerouslySetInnerHTML={{
                  __html: highlightedResult || `<pre>${parsedResult}</pre>`,
                }}
              />
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