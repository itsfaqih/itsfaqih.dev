import { createFileRoute } from "@tanstack/react-router";
import { RuleOfThumbPagination } from "./-components/rule-of-thumb-pagination";
import { ShieldIcon, PackageIcon } from "@phosphor-icons/react";
import { PageContainer } from "../../components/page-container";
import { BestPractice, CodeExample, RuleOfThumbHero, SectionHeading } from "./-components";

export const Route = createFileRoute("/rule-of-thumb/typescript-code-writing")({
  component: TypeScriptGuidelines,
});

function TypeScriptGuidelines() {
  return (
    <PageContainer maxWidth="3xl">
      <RuleOfThumbHero
        title="TypeScript Guidelines"
        description={
          <>
            Patterns for writing clean, robust, and maintainable TypeScript.
            <br />
            <span className="text-foreground font-medium">Strict defaults, explicit intent.</span>
          </>
        }
        badge={{
          text: "Code Writing",
        }}
        markdownUrl="/rule-of-thumb/typescript-code-writing.md"
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
            description='Use "type" for definitions (unions, primitives, simple objects). Use "interface" only when you need to extend other types (prefer "extends" over "&") or for declaration merging.'
          />
          <BestPractice
            emoji="🏗️"
            title="Unions over Enums"
            description="Avoid enums as they emit runtime code and reduce interoperability. String literal unions are simpler, purely type-level, and compatible with modern Node.js type-stripping."
          />
          <BestPractice
            emoji="🧠"
            title="Infer when possible"
            description="Use inference to reduce noise. Only annotate explicitly when documenting intent or enforcing contracts."
          />
        </div>

        <CodeExample
          title="Type vs Interface"
          code={`// ✅ Use type for simple objects
type User = {
  id: string;
  name: string;
}

// ❌ Avoid intersection for extension
type Admin = User & {
  permissions: string[];
}

// ✅ Use interface for extension
interface Admin extends User {
  permissions: string[];
}`}
        />

        <CodeExample
          title="Types vs Enums"
          code={`// ❌ Avoid this
enum UserRoleEnum {
  Admin = "ADMIN",
  Editor = "EDITOR",
  Viewer = "VIEWER"
}

// ✅ Do this
type UserRole = "ADMIN" | "EDITOR" | "VIEWER";
const UserRoleEnum = {
  Admin: "ADMIN",
  Editor: "EDITOR",
  Viewer: "VIEWER"
} as const`}
          description="String literal unions are simpler and don't emit runtime code."
        />

        <CodeExample
          title="Type Inference"
          code={`// ❌ Avoid unnecessary explicit typing
const x: number = 5; // it's a constant, it's not going to change to other types
const items: string[] = ["a", "b", "c"];

// ✅ Do this - let TypeScript infer
const y = 5; // inferred as number
const items = ["a", "b", "c"]; // inferred as string[]

// ✅ Annotate when enforcing a contract
function getUser(): User { // explicit return type documents intent
  return { id: "1", name: "Alice" };
}`}
          description="Only add type annotations when they add value - for function signatures, public APIs, or to catch errors."
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
type CreateUserOptions = {
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
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <ShieldIcon size={20} className="text-foreground" />
              <h3 className="font-semibold text-foreground">Must-Have Flags</h3>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex flex-col gap-1">
                <code className="text-foreground bg-muted px-1.5 py-0.5 rounded w-fit">
                  "strict": true
                </code>
                <span>Enables strictNullChecks, noImplicitAny, etc.</span>
              </li>
              <li className="flex flex-col gap-1">
                <code className="text-foreground bg-muted px-1.5 py-0.5 rounded w-fit">
                  "noUncheckedIndexedAccess": true
                </code>
                <span>Forces you to check if array access / index signature is defined.</span>
              </li>
              <li className="flex flex-col gap-1">
                <code className="text-foreground bg-muted px-1.5 py-0.5 rounded w-fit">
                  "verbatimModuleSyntax": true
                </code>
                <span>Enforces consistent imports/exports and ESM compatibility.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <PackageIcon size={20} className="text-foreground" />
              <h3 className="font-semibold text-foreground">Module System</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Use <strong>ESM (ECMAScript Modules)</strong> exclusively.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-foreground">✓</span>
                <span>import / export syntax</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-foreground">✗</span>
                <span>require() / module.exports</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-foreground">✓</span>
                <span>Top-level await support</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <RuleOfThumbPagination />
    </PageContainer>
  );
}
