import { cx } from "@/stylex";
import { CodeExample } from "./-components";

export function StateIsolationSection() {
  return (
    <div className={cx("mb-16")}>
      <div className={cx("max-w-3xl mx-auto")}>
        <h2 className={cx("text-xl font-bold text-foreground mb-2")}>
          Exception: React State Isolation
        </h2>
        <p className={cx("text-muted-foreground mb-6")}>
          Extract a child component when it has its own state — even if only used once. This
          prevents the parent from re-rendering when the child's state changes.
        </p>
      </div>
      <div className={cx("max-w-3xl mx-auto")}>
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
  );
}
