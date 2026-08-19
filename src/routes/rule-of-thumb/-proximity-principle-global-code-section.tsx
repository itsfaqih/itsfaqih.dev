import { cx } from "@/stylex";
import { FileTreeComparison } from "./-proximity-principle-file-tree";

export function GlobalCodeSection() {
  return (
    <div className={cx("mb-16")}>
      <div className={cx("max-w-3xl mx-auto")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-2")}>Exception: Global Code</h2>
        <p className={cx("text-muted-foreground mb-6")}>
          For something that we can expect to be used globally (e.g. a button component) or used almost
          everywhere, it's better to put them in a "type" directory (e.g. <code className={cx("text-sm bg-muted px-1.5 py-0.5 rounded")}>components/</code>,{" "}
          <code className={cx("text-sm bg-muted px-1.5 py-0.5 rounded")}>schemas/</code>).
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
                  { name: "button.tsx", highlight: "bad" },
                  { name: "profile", children: [{ name: "user-profile.tsx" }] },
                  { name: "settings", children: [{ name: "settings-page.tsx" }] },
                  { name: "dashboard", children: [{ name: "dashboard.tsx" }] },
                ],
              },
            ],
          }}
          badReason="Button is used everywhere, but placed at the lowest ancestor. It doesn't belong to any page."
          goodTree={{
            name: "src",
            children: [
              {
                name: "components",
                children: [{ name: "button.tsx", highlight: "good" }],
              },
              {
                name: "pages",
                children: [
                  { name: "profile", children: [{ name: "user-profile.tsx" }] },
                  { name: "settings", children: [{ name: "settings-page.tsx" }] },
                  { name: "dashboard", children: [{ name: "dashboard.tsx" }] },
                ],
              },
            ],
          }}
          goodReason="Globally used code lives in a type directory. Clear intent, easy to find."
        />
      </div>
    </div>
  );
}
