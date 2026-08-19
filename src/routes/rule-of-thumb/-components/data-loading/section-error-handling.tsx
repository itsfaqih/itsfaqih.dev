import { cx } from "@/stylex";
import { BestPractice, CodeExample, SectionHeading } from "../index";
import { ErrorDemo } from "./error-demo";

export function ErrorHandlingSection() {
  return (
    <>
{/* ================================================================== */}
      {/* SECTION 5: Error Handling */}
      {/* ================================================================== */}
      <div className={cx("mb-20")}>
        <SectionHeading
          title="Error Handling"
          description="Show errors inline, not as toasts. Make them recoverable."
        />

        <ErrorDemo />

        <div className={cx("mt-8 space-y-4")}>
          <BestPractice
            emoji="🎯"
            title="Inline error states"
            description="Show errors where the data was supposed to appear. Toasts get lost and overwhelm users with multiple failures."
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
    // Inline error, NOT toast
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
            description="Inline errors are contextual and don't overwhelm users like toasts."
          />
        </div>
      </div>
    </>
  );
}
