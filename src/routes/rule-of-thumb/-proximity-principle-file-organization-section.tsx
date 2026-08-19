import { cx } from "@/stylex";
import { FileTreeComparison } from "./-proximity-principle-file-tree";

export function FileOrganizationSection() {
  return (
    <div className={cx("mb-16")}>
      <div className={cx("max-w-3xl mx-auto")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-2")}>Prefer Fewer Files</h2>
        <p className={cx("text-muted-foreground mb-6")}>
          Splitting code across many files increases cognitive load. Keep related code together.
        </p>
      </div>
      <div className={cx("max-w-3xl mx-auto")}>
        <FileTreeComparison
          badTree={{
            name: "src",
            children: [
              {
                name: "components",
                children: [
                  {
                    name: "UserProfile",
                    children: [
                      { name: "index.tsx", highlight: "bad" },
                      { name: "UserProfile.tsx", highlight: "bad" },
                      { name: "UserProfile.styles.ts", highlight: "bad" },
                      { name: "UserProfile.types.ts", highlight: "bad" },
                      { name: "UserProfile.hooks.ts", highlight: "bad" },
                    ],
                  },
                ],
              },
            ],
          }}
          badReason="5 files for one component. Too many imports, too much jumping."
          goodTree={{
            name: "src",
            children: [
              {
                name: "components",
                children: [{ name: "user-profile.tsx", highlight: "good" }],
              },
            ],
          }}
          goodReason="One file. Everything related is together."
        />
      </div>
    </div>
  );
}
