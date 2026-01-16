import { createFileRoute } from "@tanstack/react-router";
import { GuidelinePagination } from "./-components/guideline-pagination";
import { FileCodeIcon, ShieldIcon, PackageIcon } from "@phosphor-icons/react";
import { PageContainer } from "../../components/page-container";
import { BestPractice, CodeExample, GuidelineHero, SectionHeading } from "./-components";

export const Route = createFileRoute("/my-views/typescript-code-writing")({
  component: TypeScriptGuidelines,
});

function TypeScriptGuidelines() {
  return (
    <PageContainer maxWidth="3xl">
      <GuidelineHero
        title="TypeScript Guidelines"
        description={
          <>
            Patterns for writing clean, robust, and maintainable TypeScript.
            <br />
            <span className="text-(--text-primary) font-medium">
              Strict defaults, explicit intent.
            </span>
          </>
        }
        badge={{
          icon: FileCodeIcon,
          text: "Code Quality",
        }}
        markdownUrl="/my-views/typescript-code-writing.md"
      />

      {/* ================================================================== */}
      {/* SECTION 1: Exports and Functions */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Exports & Functions"
          description="Consistent module structure makes code easier to navigate and refactor."
        />

        <div className="space-y-4 mb-8">
          <BestPractice
            emoji="📦"
            title="Prefer Named Exports"
            description="Named exports ensure consistent naming across the codebase and work better with auto-imports/refactoring tools. Avoid default exports."
          />
          <BestPractice
            emoji="🔧"
            title='Use "function" keyword'
            description="Use the function keyword for top-level functions. It hoists, provides better stack traces, and distinguishes them from variables. Reserve arrow functions for callbacks or nested logic."
          />
        </div>

        <CodeExample
          title="Named Exports vs Default"
          code={`// ❌ Avoid this
export default function(items: Item[]) { ... }
// or
const calculateTotal = (items: Item[]) => { ... };
export default calculateTotal;

// ✅ Do this
export function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}`}
          description='Named exports prevent "magic naming" when importing and make re-exports cleaner.'
        />
      </div>

      {/* ================================================================== */}
      {/* SECTION 2: Type Definitions */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Type Definitions"
          description="How to define data shapes relative to flexibility and performance."
        />

        <div className="space-y-4 mb-8">
          <BestPractice
            emoji="📝"
            title='Use "type" by default'
            description='Use "type" for most definitions (unions, primitives, tuples) as it"s more flexible. Use "interface" specifically when you need declaration merging or object-oriented patterns.'
          />
          <BestPractice
            emoji="🏗️"
            title="Unions over Enums"
            description="TypeScript enums can be problematic at runtime/bundle-size. Union types of string literals are simpler, safer, and compile away."
          />
          <BestPractice
            emoji="🧠"
            title="Infer when possible"
            description="Don't write types that TypeScript can infer automatically. It reduces noise and ensures the type matches the actual value."
          />
        </div>

        <CodeExample
          title="Types vs Enums"
          code={`// ❌ Avoid this
enum UserRole {
  Admin = "ADMIN",
  Editor = "EDITOR",
  Viewer = "VIEWER"
}

// ❌ Avoid redundant typing
const x: number = 5; // 'number' is unnecessary
const y = 5; // inferred as number

// ✅ Do this
type UserRole = "admin" | "editor" | "viewer";

function setRole(role: UserRole) {
  // TypeScript provides autocomplete for strings
}`}
          description="String unions are lightweight and structurally typed, unlike nominal Enums."
        />
      </div>

      {/* ================================================================== */}
      {/* SECTION 3: Function Parameters */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Function Parameters"
          description="Managing arguments for readability and extensibility."
        />

        <BestPractice
          emoji="📦"
          title="Use Option Objects"
          description="When a function takes more than two parameters, combine them into a single object argument. This improves readability (named args) and makes adding new optional parameters non-breaking."
        />

        <div className="mt-6">
          <CodeExample
            title="Object Parameters"
            code={`// ❌ Avoid this
function createUser(name: string, email: string, role: string, isActive: boolean) { ... }

createUser("Alice", "alice@example.com", "admin", true); // what is "true"?

// ✅ Do this
interface CreateUserOptions {
  name: string;
  email: string;
  role?: "admin" | "user";
  isActive?: boolean;
}

function createUser(options: CreateUserOptions) { ... }

createUser({
  name: "Alice",
  email: "alice@example.com",
  role: "admin"
  // arguments are clear and order-independent
});`}
            description="Positional arguments become confusing easily."
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 4: Strictness & Configuration */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Strictness & Config"
          description="The foundation of a safe codebase."
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-xl bg-(--bg-secondary) border border-(--border-color)">
            <div className="flex items-center gap-3 mb-4">
              <ShieldIcon size={20} className="text-(--text-primary)" />
              <h3 className="font-semibold text-(--text-primary)">Must-Have Flags</h3>
            </div>
            <ul className="space-y-3 text-sm text-(--text-secondary)">
              <li className="flex flex-col gap-1">
                <code className="text-(--text-primary) bg-zinc-500/10 px-1.5 py-0.5 rounded w-fit">
                  "strict": true
                </code>
                <span>Enables strictNullChecks, noImplicitAny, etc.</span>
              </li>
              <li className="flex flex-col gap-1">
                <code className="text-(--text-primary) bg-zinc-500/10 px-1.5 py-0.5 rounded w-fit">
                  "noUncheckedIndexedAccess": true
                </code>
                <span>Forces you to check if array access / index signature is defined.</span>
              </li>
              <li className="flex flex-col gap-1">
                <code className="text-(--text-primary) bg-zinc-500/10 px-1.5 py-0.5 rounded w-fit">
                  "verbatimModuleSyntax": true
                </code>
                <span>Enforces consistent imports/exports and ESM compatibility.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-(--bg-secondary) border border-(--border-color)">
            <div className="flex items-center gap-3 mb-4">
              <PackageIcon size={20} className="text-(--text-primary)" />
              <h3 className="font-semibold text-(--text-primary)">Module System</h3>
            </div>
            <p className="text-sm text-(--text-secondary) mb-4">
              Use <strong>ESM (ECMAScript Modules)</strong> exclusively.
            </p>
            <ul className="space-y-2 text-sm text-(--text-secondary)">
              <li className="flex items-center gap-2">
                <span className="text-(--text-primary)">✓</span>
                <span>import / export syntax</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-(--text-primary)">✗</span>
                <span>require() / module.exports</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-(--text-primary)">✓</span>
                <span>Top-level await support</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <GuidelinePagination />
    </PageContainer>
  );
}
