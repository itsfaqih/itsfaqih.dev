import { cx } from "@/stylex";
import { FileTreeComparison } from "./-proximity-principle-file-tree";

export function FileSuffixesSection() {
  return (
    <div className={cx("mb-16")}>
      <div className={cx("max-w-3xl mx-auto")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-2")}>File Suffixes</h2>
        <p className={cx("text-muted-foreground mb-6")}>
          When organizing by type at scale, use suffixes for discoverability.
        </p>
      </div>
      <div className={cx("max-w-3xl mx-auto")}>
        <FileTreeComparison
          showSingle
          goodTree={{
            name: "src",
            children: [
              {
                name: "schemas",
                children: [
                  { name: "user.schema.ts", highlight: "good" },
                  { name: "org.schema.ts", highlight: "good" },
                ],
              },
              {
                name: "hooks",
                children: [
                  { name: "use-auth.hook.ts", highlight: "good" },
                  { name: "use-theme.hook.ts", highlight: "good" },
                ],
              },
            ],
          }}
          goodReason="Suffixes help with VS Code's 'Go to File' (Ctrl+P). No more guessing!"
        />
      </div>
    </div>
  );
}
