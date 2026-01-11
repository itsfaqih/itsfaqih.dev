import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronRight,
  Folder,
  File,
  Check,
  X,
  Sparkles,
  ArrowLeft,
  MapPin,
  FileCode,
  FolderTree,
  Zap,
} from "lucide-react";
import { PageContainer } from "../../components/page-container";
import {
  CodeComparison,
  CodeExample,
  GuidelineHero,
  PrincipleCard,
  QuickRefCard,
} from "./components";

export const Route = createFileRoute("/my-views/proximity-principle")({
  component: ProximityPrinciple,
});

// ============================================================================
// Types
// ============================================================================

interface TreeNode {
  name: string;
  children?: TreeNode[];
  highlight?: "good" | "bad";
}

// ============================================================================
// Components
// ============================================================================

function TreeNodeComponent({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isFile = !hasChildren;

  const highlightStyles = {
    good: "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500",
    bad: "bg-red-500/10 text-red-400 border-l-2 border-red-500",
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-1.5 py-1 px-2 rounded-md transition-all cursor-default hover:bg-(--bg-secondary)/50 ${
          node.highlight ? highlightStyles[node.highlight] : ""
        }`}
        style={{ paddingLeft: depth * 16 + 8 }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        {hasChildren && (
          <ChevronRight
            size={14}
            className={`text-(--text-secondary) transition-transform ${isOpen ? `rotate-90` : ``}`}
          />
        )}
        {!hasChildren && <span className="w-3.5" />}

        {isFile ? (
          <File size={14} className="text-(--text-secondary)" />
        ) : (
          <Folder size={14} className="text-amber-500" />
        )}

        <span className="text-sm font-mono">{node.name}</span>
      </div>

      {hasChildren && isOpen && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeComponent key={child.name} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

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
      <div className="rounded-xl border border-(--border-color) bg-(--bg-secondary)/50 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-(--border-color) flex items-center gap-2">
          <Check size={16} className="text-emerald-500" />
          <span className="font-medium text-(--text-primary)">Organized Structure</span>
        </div>
        <div className="p-4">
          <TreeNodeComponent node={goodTree} />
        </div>
        <div className="px-4 py-3 bg-emerald-500/5 border-t border-(--border-color) text-sm text-emerald-400">
          <Check size={14} className="inline mr-2" />
          {goodReason}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center lg:grid lg:grid-cols-2 gap-4">
      {/* Don't / Bad */}
      <div className="rounded-xl border border-red-500/30 bg-(--bg-secondary)/30 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-red-500/5 transition-all">
        <div className="px-4 py-3 border-b border-red-500/30 bg-red-500/5 flex items-center gap-2">
          <X size={16} className="text-red-400" />
          <span className="font-medium text-red-400">Bad</span>
        </div>
        <div className="p-4">{badTree && <TreeNodeComponent node={badTree} />}</div>
        <div className="px-4 py-3 border-t border-red-500/30 bg-red-500/5 text-sm text-red-400">
          <X size={14} className="inline mr-2" />
          {badReason}
        </div>
      </div>

      {/* Do / Good */}
      <div className="rounded-xl border border-emerald-500/30 bg-(--bg-secondary)/30 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-emerald-500/5 transition-all">
        <div className="px-4 py-3 border-b border-emerald-500/30 bg-emerald-500/5 flex items-center gap-2">
          <Check size={16} className="text-emerald-400" />
          <span className="font-medium text-emerald-400">Good</span>
        </div>
        <div className="p-4">
          <TreeNodeComponent node={goodTree} />
        </div>
        <div className="px-4 py-3 border-t border-emerald-500/30 bg-emerald-500/5 text-sm text-emerald-400">
          <Check size={14} className="inline mr-2" />
          {goodReason}
        </div>
      </div>
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
    <div className="rounded-xl border border-(--border-color) bg-linear-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-md overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-(--border-color) flex items-center gap-2">
        <Sparkles size={18} className="text-indigo-400" />
        <span className="font-medium text-(--text-primary)">Interactive Demo</span>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-(--text-secondary) uppercase tracking-wide">
            Step {step + 1} of {steps.length}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-(--text-primary) mb-4">{steps[step].title}</h3>

        <div className="p-4 bg-(--bg-primary)/50 backdrop-blur-sm rounded-lg border border-(--border-color) mb-4">
          <TreeNodeComponent node={steps[step].tree} />
        </div>

        <p className="text-sm text-(--text-secondary) mb-4">{steps[step].description}</p>

        <div className="flex gap-2">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-(--border-color) text-(--text-secondary) hover:bg-(--bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <button
            onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
            disabled={step === steps.length - 1}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>

      <div className="h-1 bg-(--border-color)">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

function ProximityPrinciple() {
  return (
    <PageContainer maxWidth="3xl">
      {/* Hero Section */}
      <GuidelineHero
        title="The Proximity Principle"
        description={
          <>
            A visual guide to structuring code and files.
            <br />
            <span className="text-(--text-primary) font-medium">Less jumping, more shipping.</span>
          </>
        }
        badge={{
          icon: MapPin,
          text: "Code Structure Philosophy",
        }}
      />

      {/* Interactive Demo */}
      <div className="mb-16">
        <InteractiveDemo />
      </div>

      {/* Core Principles Grid */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-(--text-primary) text-center mb-8">
          The Core Principles
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <PrincipleCard
            icon={MapPin}
            title="Colocate"
            description="Put related code as close as possible to where it's used."
          />
          <PrincipleCard
            icon={FileCode}
            title="Inline First"
            description="Don't extract until code is reused. Keep it inline by default."
          />
          <PrincipleCard
            icon={FolderTree}
            title="Lowest Common Ancestor"
            description="When sharing code, place it at the nearest common parent directory."
          />
          <PrincipleCard
            icon={Zap}
            title="Prefer Fewer Files"
            description="One file with related code beats many files requiring imports."
          />
        </div>
      </div>

      {/* Principle 1 */}
      <div className="mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-(--text-primary) mb-2">
            Don't Abstract Prematurely
          </h2>
          <p className="text-(--text-secondary) mb-6">
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
          <h2 className="text-xl font-bold text-(--text-primary) mb-2">
            Exception: React State Isolation
          </h2>
          <p className="text-(--text-secondary) mb-6">
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
          <h2 className="text-xl font-bold text-(--text-primary) mb-2">Prefer Fewer Files</h2>
          <p className="text-(--text-secondary) mb-6">
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
          <h2 className="text-xl font-bold text-(--text-primary) mb-2">Extract Only When Reused</h2>
          <p className="text-(--text-secondary) mb-6">
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
          <h2 className="text-xl font-bold text-(--text-primary) mb-2">Lowest Common Ancestor</h2>
          <p className="text-(--text-secondary) mb-6">
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
          <h2 className="text-xl font-bold text-(--text-primary) mb-2">Follow Framework Rules</h2>
          <p className="text-(--text-secondary) mb-6">
            Frameworks like Next.js or TanStack Router have strict rules. Follow them, even if it
            adds nesting.
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
            badReason="Framework tries to make 'post-header' a page route. Broken behavior."
            goodTree={{
              name: "routes",
              children: [
                {
                  name: "blog",
                  children: [
                    { name: "posts.tsx", highlight: "good" },
                    {
                      name: "components",
                      children: [{ name: "post-header.tsx", highlight: "good" }],
                    },
                  ],
                },
              ],
            }}
            goodReason="Component is hidden from the router in a folder. Safe and sound."
          />
        </div>
      </div>

      {/* File Suffixes */}
      <div className="mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-(--text-primary) mb-2">Bonus: File Suffixes</h2>
          <p className="text-(--text-secondary) mb-6">
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
        <h2 className="text-2xl font-bold text-(--text-primary) text-center mb-8">
          Quick Reference
        </h2>
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
        <div className="p-8 rounded-2xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <h2 className="text-xl font-bold text-(--text-primary) mb-4">Why This Matters</h2>
          <ul className="space-y-3 text-(--text-secondary)">
            <li className="flex items-start gap-3">
              <span className="text-lg">🧠</span>
              <span>
                <strong className="text-(--text-primary)">Reduces cognitive load</strong> — Less
                jumping between files
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">🚀</span>
              <span>
                <strong className="text-(--text-primary)">Faster shipping</strong> — Less time spent
                managing file structure
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-lg">🧹</span>
              <span>
                <strong className="text-(--text-primary)">Easier cleanup</strong> — Delete a file
                and everything goes with it
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center pb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-(--text-secondary) hover:text-(--text-primary) transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </footer>
    </PageContainer>
  );
}
