import { cx } from "@/stylex";
import { BestPractice, CodeExample, SectionHeading } from "../index";
import { ErrorDemo } from "./error-demo";

export function ErrorHandlingSection() {
  return (
    <>
      <div className={cx("mb-20")}>
        <SectionHeading
          title="Error Handling"
          description="Show errors where users can act on them. Make them recoverable."
        />

        <ErrorDemo />

        <div className={cx("mt-8 space-y-4")}>
          <BestPractice
            emoji="🎯"
            title="Inline error states"
            description="Keep each error next to the data it belongs to, even when multiple requests fail."
          />
          <BestPractice
            emoji="🔄"
            title="Always offer retry"
            description="Include a retry button so users can recover without refreshing the entire page."
          />
          <BestPractice
            emoji="📊"
            title="Report to observability"
            description="Log errors to your monitoring tools (Sentry, DataDog, etc.) so you can track and fix issues."
          />
        </div>

        <div className={cx("mt-8")}>
          <CodeExample
            title="Error State Pattern"
            code={`function UserProfile() {
  const { data, error, refetch } = useQuery('user');

  // Report to observability
  useEffect(() => {
    if (error) {
      // Send to Sentry, DataDog, etc.
      captureException(error, {
        context: 'UserProfile',
        userId: currentUserId,
      });
    }
  }, [error]);

  if (error) {
    // Show an inline error state
    return (
      <div className={cx("error-state")}>
        <AlertCircle />
        <p>Failed to load profile</p>
        <p className={cx("text-sm")}>{error.message}</p>
        <button onClick={refetch}>
          <RefreshCw /> Retry
        </button>
      </div>
    );
  }

  return <Profile data={data} />;
}`}
            description="Inline errors keep feedback contextual and actionable."
          />
        </div>
      </div>
    </>
  );
}
