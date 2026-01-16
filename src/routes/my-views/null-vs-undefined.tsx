import { createFileRoute } from "@tanstack/react-router";
import { GuidelinePagination } from "./-components/guideline-pagination";
import { ProhibitIcon, QuestionIcon } from "@phosphor-icons/react";
import { PageContainer } from "../../components/page-container";
import {
  CodeComparison,
  CodeExample,
  GuidelineHero,
  QuickRefCard,
  SectionHeading,
} from "./-components";

export const Route = createFileRoute("/my-views/null-vs-undefined")({
  component: NullVsUndefined,
});

function NullVsUndefined() {
  return (
    <PageContainer maxWidth="3xl">
      {/* Hero Section */}
      <GuidelineHero
        title="Null vs Undefined"
        description={
          <>
            Two ways to say "nothing", but with very different meanings.
            <br />
            <span className="text-(--text-primary) font-medium">Know the difference.</span>
          </>
        }
        badge={{
          icon: QuestionIcon,
          text: "JavaScript Fundamentals",
        }}
        markdownUrl="/my-views/null-vs-undefined.md"
      />

      {/* Concept Section */}
      <div className="mb-20">
        <SectionHeading
          title="The Golden Rule"
          description="A mental model to keep them straight."
        />
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-(--border-color) bg-(--bg-secondary)">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-zinc-500/10 text-(--text-primary)">
                <QuestionIcon size={24} />
              </div>
              <h3 className="text-lg font-bold text-(--text-primary)">Undefined</h3>
            </div>
            <p className="text-(--text-secondary) font-medium mb-2">"No value provided"</p>
            <p className="text-sm text-(--text-secondary)">
              The variable exists, but nothing has been put into it yet. It's the default state of
              things.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-(--border-color) bg-(--bg-secondary)">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-zinc-500/10 text-(--text-primary)">
                <ProhibitIcon size={24} />
              </div>
              <h3 className="text-lg font-bold text-(--text-primary)">Null</h3>
            </div>
            <p className="text-(--text-secondary) font-medium mb-2">"Empty value"</p>
            <p className="text-sm text-(--text-secondary)">
              Intentionally set to be empty. We checked, and the answer is explicitly "nothing".
            </p>
          </div>
        </div>
      </div>

      {/* Undefined Example */}
      <div className="mb-20">
        <SectionHeading
          title="Undefined: No Value Provided"
          description="Use this when a value is optional or hasn't been initialized."
        />
        <CodeExample
          title="Optional Parameters"
          code={`function welcomeUser(name?: string) {
  // if name is not passed, it is 'undefined'
  if (name === undefined) {
    console.log("Welcome, Guest!");
  } else {
    console.log(\`Welcome, \${name}!\`);
  }
}

welcomeUser(); // Logs: "Welcome, Guest!"
welcomeUser("Alice"); // Logs: "Welcome, Alice!"`}
          description='When you don"t pass an argument, JavaScript automatically assigns it "undefined". It simply means "missing".'
        />
      </div>

      {/* Null Example */}
      <div className="mb-20">
        <SectionHeading
          title="Null: Intentional Empty Value"
          description='Use this when you want to explicitly say "this is empty".'
        />
        <CodeExample
          title="Resetting State"
          code={`const [selectedUser, setSelectedUser] = useState<User | null>(null);

// 1. Initial state is null (we haven't selected anyone yet, intentionally)

// 2. User selects something
const selectUser = (user: User) => {
  setSelectedUser(user);
};

// 3. User clears the selection
const clearSelection = () => {
  setSelectedUser(null); // Explicitly setting it back to "empty"
};`}
          description='We use "null" to reset the selection. We aren"t saying the selection is "missing" (undefined), we are saying it is "empty" (null).'
        />
      </div>

      {/* Explicit vs Implicit */}
      <div className="mb-20">
        <SectionHeading
          title="Explicit vs Implicit"
          description='Sometimes "optional" is too ambiguous. Use null to force a decision.'
        />
        <CodeComparison
          badTitle="Optional (Ambiguous)"
          badCode={`// ⚠️ Does this unassign the task?
// Or just ignore the assignment field?
updateTask({
  id: "TASK-123",
  assigneeId: undefined 
});`}
          badReason='Ambiguity is dangerous here. If "undefined" means "ignore", we have no way to unassign the user without a separate function.'
          goodTitle="Nullable (Explicit)"
          goodCode={`// ✅ Intent is clear:

// 1. Check for assignee updates
if (data.assigneeId === undefined) {
  // Field missing -> Do nothing (retain current assignee)
}

// 2. Unassign the user
if (data.assigneeId === null) {
  // Value is null -> Remove the assignee
}`}
          goodReason='We use "undefined" for "ignore" (no change) and "null" for "remove" (clear value). Distinct and critical.'
        />
      </div>

      {/* Quick Reference */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-(--text-primary) text-center mb-8">
          Quick Reference
        </h2>
        <div className="space-y-3">
          <QuickRefCard
            emoji="❓"
            title="Variable declared but not assigned"
            action="It is undefined"
          />
          <QuickRefCard emoji="📥" title="Function argument not passed" action="It is undefined" />
          <QuickRefCard emoji="🚫" title="Resetting a form field" action="Set it to null" />
          <QuickRefCard emoji="🔍" title='API returns "not found"' action="Ideally returns null" />
        </div>
      </div>

      {/* Footer */}
      <GuidelinePagination />
    </PageContainer>
  );
}
