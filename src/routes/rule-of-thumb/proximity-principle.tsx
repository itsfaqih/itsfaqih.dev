import { createFileRoute } from "@tanstack/react-router";
import { RuleOfThumbPagination } from "./-components/rule-of-thumb-pagination";
import { useState, memo, useCallback } from "react";
import { Card } from "../../components/card";
import {
  CaretRightIcon,
  FolderIcon,
  FileIcon,
  CheckIcon,
  XIcon,
  SparkleIcon,
  MapPinIcon,
  FileCodeIcon,
  TreeStructureIcon,
  LightningIcon,
} from "@phosphor-icons/react";
import { PageContainer } from "../../components/page-container";
import { CodeComparison, CodeExample, RuleOfThumbHero, QuickRefCard } from "./-components";
import { Button } from "../../components/button";

export const Route = createFileRoute("/rule-of-thumb/proximity-principle")({
  component: ProximityPrinciple,
});

// ============================================================================
// Types
// ============================================================================

type TreeNode = {
  name: string;
  children?: TreeNode[];
  highlight?: "good" | "bad";
};

// ============================================================================
// Components
// ============================================================================

// Highlight styles hoisted outside component (rendering-hoist-jsx rule)
const TREE_HIGHLIGHT_STYLES = {
  good: "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500",
  bad: "bg-red-500/10 text-red-400 border-l-2 border-red-500",
} as const;

// Memoized to prevent unnecessary re-renders in recursive tree (rerender-memo rule)
const TreeNodeComponent = memo(function TreeNodeComponent({
  node,
  depth = 0,
}: {
  node: TreeNode;
  depth?: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isFile = !hasChildren;

  // Functional setState prevents stale closure (rerender-functional-setstate rule)
  const toggleOpen = useCallback(() => {
    if (hasChildren) {
      setIsOpen((prev) => !prev);
    }
  }, [hasChildren]);

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1.5 py-1 px-2 rounded-md transition-all cursor-default hover:bg-muted/50 ${
          node.highlight ? TREE_HIGHLIGHT_STYLES[node.highlight] : ""
        }`}
        style={{ paddingLeft: depth * 16 + 8 }}
        onClick={toggleOpen}
      >
        {/* Ternary for explicit conditional rendering (rendering-conditional-render rule) */}
        {hasChildren ? (
          <CaretRightIcon
            size={14}
            weight="regular"
            className={`text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`}
          />
        ) : (
          <span className="w-3.5" />
        )}

        {isFile ? (
          <FileIcon size={14} weight="regular" className="text-muted-foreground" />
        ) : (
          <FolderIcon size={14} weight="regular" className="text-foreground" />
        )}

        <span className="text-sm font-mono">{node.name}</span>
      </div>

      {hasChildren && isOpen ? (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent key={child.name} node={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
});

function FileTreeComparison({
  badTree,
  badReason,
  goodTree,
  goodReason,
  showSingle = false,
}: {
  badTree?: TreeNode;
  badReason?: string;
  goodTree: TreeNode;
  goodReason: string;
  showSingle?: boolean;
}) {
  if (showSingle) {
    return (
      <Card className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <CheckIcon size={14} className="inline mr-2" />
          <span className="font-medium text-foreground">Organized Structure</span>
        </div>
        <div className="p-4">
          <TreeNodeComponent node={goodTree} />
        </div>
        <div className="px-4 py-3 bg-emerald-500/5 border-t border-border text-sm text-emerald-400">
          <CheckIcon size={14} className="inline mr-2" />
          {goodReason}
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center lg:grid lg:grid-cols-2 gap-4">
      {/* Don't / Bad */}
      <Card
        className="border-red-500/30 bg-card/30 hover:border-red-500/30 overflow-hidden"
        hoverEffect={false}
      >
        <div className="px-4 py-3 border-b border-red-500/30 bg-red-500/5 flex items-center gap-2">
          <XIcon size={16} className="text-red-400" />
          <span className="font-medium text-red-400">Bad</span>
        </div>
        <div className="p-4">{badTree && <TreeNodeComponent node={badTree} />}</div>
        <div className="px-4 py-3 border-t border-red-500/30 bg-red-500/5 text-sm text-red-400">
          <XIcon size={14} className="inline mr-2" />
          {badReason}
        </div>
      </Card>

      {/* Do / Good */}
      <Card
        className="border-emerald-500/30 bg-card/30 hover:border-emerald-500/30 overflow-hidden"
        hoverEffect={false}
      >
        <div className="px-4 py-3 border-b border-emerald-500/30 bg-emerald-500/5 flex items-center gap-2">
          <CheckIcon size={16} className="text-emerald-400" />
          <span className="font-medium text-emerald-400">Good</span>
        </div>
        <div className="p-4">
          <TreeNodeComponent node={goodTree} />
        </div>
        <div className="px-4 py-3 border-t border-emerald-500/30 bg-emerald-500/5 text-sm text-emerald-400">
          <CheckIcon size={14} className="inline mr-2" />
          {goodReason}
        </div>
      </Card>
    </div>
  );
}

function InteractiveDemo() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "You write some code...",
      tree: {
        name: "src",
        children: [
          {
            name: "components",
            children: [{ name: "dashboard.tsx", highlight: "good" as const }],
          },
        ],
      },
      description: "Everything starts in one file. Clean and simple.",
    },
    {
      title: "You need to reuse something...",
      tree: {
        name: "src",
        children: [
          {
            name: "components",
            children: [
              { name: "dashboard.tsx", highlight: "good" as const },
              { name: "settings.tsx", highlight: "good" as const },
            ],
          },
        ],
      },
      description: "Both files need the same utility. Time to extract!",
    },
    {
      title: "But where do you put it?",
      tree: {
        name: "src",
        children: [
          {
            name: "components",
            children: [
              { name: "shared.ts", highlight: "good" as const },
              { name: "dashboard.tsx" },
              { name: "settings.tsx" },
            ],
          },
        ],
      },
      description: "At the lowest common ancestor! Both files can easily import it.",
    },
  ];

  return (
    <Card className="bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <SparkleIcon size={18} className="text-foreground" />
        <span className="font-medium text-foreground">Interactive Demo</span>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Step {step + 1} of {steps.length}
          </span>
        </div>

        {steps[step] && (
          <>
            <h3 className="text-lg font-semibold text-foreground mb-4">{steps[step].title}</h3>

            <div className="p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border mb-4">
              <TreeNodeComponent node={steps[step].tree} />
            </div>

            <p className="text-sm text-muted-foreground mb-4">{steps[step].description}</p>
          </>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-sm"
          >
            Previous
          </Button>
          <Button
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={step === steps.length - 1}
            className="text-sm bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Next
          </Button>
        </div>
      </div>

      <div className="h-1 bg-border">
        <div
          className="h-full bg-foreground transition-all duration-300"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
    </Card>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

function ProximityPrinciple() {
  return (
    <PageContainer maxWidth="3xl">
      {/* Hero Section */}
      <RuleOfThumbHero
        title="The Proximity Principle"
        description={
          <>
            A visual guide to structuring code and files.
            <br />
            <span className="text-foreground font-medium">Less jumping, more shipping.</span>
          </>
        }
        badge={{
          text: "Code Writing",
        }}
        markdownUrl="/rule-of-thumb/proximity-principle.md"
      />

      {/* Interactive Demo */}
      <div className="mb-16">
        <InteractiveDemo />
      </div>

      {/* Core Principles Grid */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">The Core Principles</h2>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-0 pl-px pt-px"
          role="list"
          aria-label="Proximity principles"
        >
          {[
            {
              icon: MapPinIcon,
              title: "Colocate",
              description: "Put related code as close as possible to where it's used.",
            },
            {
              icon: FileCodeIcon,
              title: "Inline First",
              description: "Don't extract until code is reused. Keep it inline by default.",
            },
            {
              icon: TreeStructureIcon,
              title: "Lowest Common Ancestor",
              description: "When sharing code, place it at the nearest common parent directory.",
            },
            {
              icon: LightningIcon,
              title: "Prefer Fewer Files",
              description: "One file with related code beats many files requiring imports.",
            },
          ].map((principle) => (
            <div
              key={principle.title}
              className="relative flex flex-col items-center justify-center gap-3 p-6 h-auto min-h-[200px] transition-all group hover:z-10 -ml-px -mt-px
                before:pointer-events-none before:absolute before:-inset-x-2 before:top-0 before:bottom-0 before:border-t before:border-b before:border-zinc-200 dark:before:border-white/10 group-hover:before:border-muted-foreground before:transition-colors before:mask-[linear-gradient(to_right,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)]
                after:pointer-events-none after:absolute after:-inset-y-2 after:left-0 after:right-0 after:border-l after:border-r after:border-zinc-200 dark:after:border-white/10 group-hover:after:border-muted-foreground after:transition-colors after:mask-[linear-gradient(to_bottom,transparent,black_0.25rem,black_calc(100%-0.25rem),transparent)]"
              role="listitem"
            >
              <div
                className="size-10 flex items-center justify-center z-10 rounded-lg bg-zinc-500/10 dark:bg-zinc-500/20 text-foreground"
                aria-hidden="true"
              >
                <principle.icon size={20} />
              </div>
              <h3 className="font-semibold text-foreground text-center z-10">{principle.title}</h3>
              <p className="text-sm text-muted-foreground text-center leading-relaxed z-10">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Principle 1 */}
      <div className="mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-2">Don't Abstract Prematurely</h2>
          <p className="text-muted-foreground mb-6">
            If code is only used once, keep it inline. Abstraction adds complexity.
          </p>
        </div>
        <div className="w-screen relative left-1/2 -translate-x-1/2 px-4">
          <div className="max-w-5xl mx-auto">
            <CodeComparison
              badTitle="Over-abstracted"
              badCode={`// utils/format-date.ts
export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// components/user-profile.tsx
import { formatDate } from '../utils/format-date'
// Used only once here...`}
              badReason="Separate file for code used only once. Extra import, extra cognitive load."
              goodTitle="Inline"
              goodCode={`// components/user-profile.tsx
function UserProfile() {
  const formattedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return <div>{formattedDate}</div>;
}`}
              goodReason="Code lives where it's used. No imports, no jumping between files."
            />
          </div>
        </div>
      </div>
      {/* Principle 2 */}
      <div className="mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Exception: React State Isolation
          </h2>
          <p className="text-muted-foreground mb-6">
            Extract a child component when it has its own state — even if only used once. This
            prevents the parent from re-rendering when the child's state changes.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <CodeExample
            title="State Isolation Pattern"
            code={`// ✅ Good - child state doesn't re-render parent
function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState(""); // Only SearchInput re-renders
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onSearch(query)}
    />
  );
}

function Parent() {
  // This component does NOT re-render on every keystroke
  return <SearchInput onSearch={handleSearch} />;
}`}
            description="The child owns the state, so typing only re-renders the input — not the entire parent tree."
          />
        </div>
      </div>

      {/* Principle 3 */}
      <div className="mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-2">Prefer Fewer Files</h2>
          <p className="text-muted-foreground mb-6">
            Splitting code across many files increases cognitive load. Keep related code together.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
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

      {/* Principle 3 */}
      <div className="mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-2">Extract Only When Reused</h2>
          <p className="text-muted-foreground mb-6">
            Only move code to a separate file when it's needed in multiple files.
          </p>
        </div>
        <div className="w-screen relative left-1/2 -translate-x-1/2 px-4">
          <div className="max-w-5xl mx-auto">
            <CodeComparison
              badTitle="Premature extraction"
              badCode={`// hooks/use-user-status.ts
export function useUserStatus() {
  // Only used in dashboard.tsx...
}

// components/dashboard.tsx
import { useUserStatus } from '../hooks/use-user-status'`}
              badReason="Extracted to separate file even though only used in one place."
              goodTitle="Same file"
              goodCode={`// components/dashboard.tsx
function useUserStatus() {
  // Reused within this file only
}

function UserCard() {
  const status = useUserStatus();
}

function UserBadge() {
  const status = useUserStatus();
}`}
              goodReason="Hook stays in the file where it's used. Easier to find and modify."
            />
          </div>
        </div>
      </div>

      {/* Principle 4 */}
      <div className="mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-2">Lowest Common Ancestor</h2>
          <p className="text-muted-foreground mb-6">
            When you do share code, place it at the nearest common parent.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <FileTreeComparison
            badTree={{
              name: "src",
              children: [
                { name: "utils", children: [{ name: "format-date.ts", highlight: "bad" }] },
                {
                  name: "features",
                  children: [
                    { name: "profile", children: [{ name: "user-profile.tsx" }] },
                    { name: "activity", children: [{ name: "user-activity.tsx" }] },
                  ],
                },
              ],
            }}
            badReason="Shared code is far from where it's used. Deep import paths."
            goodTree={{
              name: "src",
              children: [
                {
                  name: "features",
                  children: [
                    { name: "format-date.ts", highlight: "good" },
                    { name: "profile", children: [{ name: "user-profile.tsx" }] },
                    { name: "activity", children: [{ name: "user-activity.tsx" }] },
                  ],
                },
              ],
            }}
            goodReason="Shared code at the lowest common ancestor. Both features can easily access it."
          />
        </div>
      </div>

      <div className="mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-2">Follow Framework Rules</h2>
          <p className="text-muted-foreground mb-6">
            File-based routers (Next.js, TanStack Router) often turn <strong>every</strong> file
            into a route. Co-location requires understanding how to "hide" files.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
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
                      name: "components", // In strict routers, this needs config like `routeFileIgnorePattern`
                      children: [{ name: "post-header.tsx", highlight: "good" }],
                    },
                  ],
                },
              ],
            }}
            goodReason="Using ignored folders (via config or convention like `_components`) keeps files safe."
          />
        </div>
      </div>

      {/* File Suffixes */}
      <div className="mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-2">Bonus: File Suffixes</h2>
          <p className="text-muted-foreground mb-6">
            When organizing by type at scale, use suffixes for discoverability.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
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

      {/* Quick Reference */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">Quick Reference</h2>
        <div className="space-y-3">
          <QuickRefCard emoji="1️⃣" title="Code used once" action="Keep it inline" />
          <QuickRefCard
            emoji="📏"
            title="Code is too long"
            action="Extract to function, keep in file"
          />
          <QuickRefCard
            emoji="📄"
            title="Code reused in same file"
            action="Extract to function, keep in file"
          />
          <QuickRefCard
            emoji="📁"
            title="Code reused across files"
            action="Extract to lowest common ancestor"
          />
          <QuickRefCard
            emoji="⚛️"
            title="React: Child has own state"
            action="Extract to component (prevents parent re-render)"
          />
        </div>
      </div>

      {/* Why This Matters */}
      <div className="mb-20">
        <div className="p-8 rounded-2xl bg-card border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Why This Matters</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-lg">🧠</span>
              <span>
                <strong className="text-foreground">Reduces cognitive load</strong> — Less jumping
                between files
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">🚀</span>
              <span>
                <strong className="text-foreground">Faster shipping</strong> — Less time spent
                managing file structure
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">🧹</span>
              <span>
                <strong className="text-foreground">Easier cleanup</strong> — Delete a file and
                everything goes with it
              </span>
            </li>
          </ul>
        </div>
      </div>

      <RuleOfThumbPagination />
    </PageContainer>
  );
}
