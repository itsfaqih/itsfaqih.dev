import { cx } from "@/stylex";
import { FileTreeComparison } from "./-proximity-principle-file-tree";

export function LowestCommonAncestorSection() {
  return (
    <div className={cx("mb-16")}>
      <div className={cx("max-w-3xl mx-auto")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-2")}>Lowest Common Ancestor</h2>
        <p className={cx("text-muted-foreground mb-6")}>
          When you do share code, place it at the nearest common parent.
        </p>
        <p className={cx("text-sm text-muted-foreground mb-6 pl-4 border-l-2 border-border")}>
          <strong className={cx("text-foreground")}>Tip:</strong> Avoid generic directory names like{" "}
          <code className={cx("text-sm bg-muted px-1.5 py-0.5 rounded")}>features/</code>. Use specific
          names that describe what the directory contains: <code className={cx("text-sm bg-muted px-1.5 py-0.5 rounded")}>pages/</code>,{" "}
          <code className={cx("text-sm bg-muted px-1.5 py-0.5 rounded")}>routes/</code>,{" "}
          <code className={cx("text-sm bg-muted px-1.5 py-0.5 rounded")}>controllers/</code>, etc.
        </p>
      </div>
      <div className={cx("max-w-3xl mx-auto")}>
        <FileTreeComparison
          badTree={{
            name: "src",
            children: [
              {
                name: "pages",
                children: [
                  { name: "format-date.ts", highlight: "bad" },
                  {
                    name: "profile",
                    children: [
                      { name: "user-profile.tsx" },
                      {
                        name: "components",
                        children: [{ name: "profile-header.tsx" }],
                      },
                    ],
                  },
                  {
                    name: "activity",
                    children: [{ name: "user-activity.tsx" }],
                  },
                ],
              },
            ],
          }}
          badReason="format-date.ts looks like a page. Misleading without a directory to clarify its purpose."
          goodTree={{
            name: "src",
            children: [
              {
                name: "pages",
                children: [
                  {
                    name: "utils",
                    children: [{ name: "format-date.ts", highlight: "good" }],
                  },
                  {
                    name: "profile",
                    children: [
                      { name: "user-profile.tsx" },
                      {
                        name: "components",
                        children: [{ name: "profile-header.tsx" }],
                      },
                    ],
                  },
                  {
                    name: "activity",
                    children: [{ name: "user-activity.tsx" }],
                  },
                ],
              },
            ],
          }}
          goodReason="A utils directory clarifies intent. Still at the lowest common ancestor."
        />
      </div>
    </div>
  );
}
