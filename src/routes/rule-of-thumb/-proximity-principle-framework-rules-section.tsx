import { cx } from "@/stylex";
import { FileTreeComparison } from "./-proximity-principle-file-tree";

export function FrameworkRulesSection() {
  return (
    <div className={cx("mb-16")}>
      <div className={cx("max-w-3xl mx-auto")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-2")}>Follow Framework Rules</h2>
        <p className={cx("text-muted-foreground mb-6")}>
          File-based routers (Next.js, TanStack Router) often turn <strong>every</strong> file into a
          route. Co-location requires understanding how to "hide" files.
        </p>
      </div>
      <div className={cx("max-w-3xl mx-auto")}>
        <FileTreeComparison
          badTree={{
            name: "routes",
            children: [
              {
                name: "blog",
                children: [
                  { name: "posts.tsx", highlight: "good" },
                  { name: "post-header.tsx", highlight: "bad" },
                ],
              },
            ],
          }}
          badReason="Default behavior: 'post-header' becomes a public route (`/blog/post-header`). Ouch."
          goodTree={{
            name: "routes",
            children: [
              {
                name: "blog",
                children: [
                  { name: "posts.tsx", highlight: "good" },
                  {
                    name: "-components",
                    children: [{ name: "post-header.tsx", highlight: "good" }],
                  },
                ],
              },
            ],
          }}
          goodReason="Using ignored folders (via config or convention like `-components`) keeps files safe."
        />
      </div>
    </div>
  );
}
