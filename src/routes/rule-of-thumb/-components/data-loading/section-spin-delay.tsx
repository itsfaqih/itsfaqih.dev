import { cx } from "@/stylex";
import { BestPractice, CodeExample, SectionHeading } from "../index";
import { SkeletonDemo } from "./skeleton-demo";

export function SpinDelaySection() {
  return (
    <>
{/* ================================================================== */}
      {/* SECTION 4: Spin Delay */}
      {/* ================================================================== */}
      <div className={cx("mb-20")}>
        <SectionHeading
          title="Spin Delay"
          description="Prevent flickering skeletons for fast responses."
        />

        <SkeletonDemo />

        <div className={cx("mt-8 space-y-4")}>
          <BestPractice
            emoji="⏱️"
            title="Wait before showing skeleton"
            description="Only show loading UI if the request takes longer than ~200ms. Fast responses don't need skeletons."
          />
          <BestPractice
            emoji="🚫"
            title="Avoid UI flicker"
            description="A skeleton that appears and disappears in 50ms is jarring. Better to show nothing for quick loads."
          />
        </div>

        <div className={cx("mt-8")}>
          <CodeExample
            title="Spin Delay Implementation"
            code={`import { useSpinDelay } from 'spin-delay';

function LoadingState({ isLoading }) {
  // Only show loading after 200ms delay
  // Keep showing for at least 300ms once visible
  const showSpinner = useSpinDelay(isLoading, {
    delay: 200,
    minDuration: 300,
  });

  if (!showSpinner) return null;
  
  return <Skeleton />;
}

// Or manual implementation
function useDelayedLoading(isLoading, delay = 200) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
    setShow(false);
  }, [isLoading, delay]);
  
  return show;
}`}
            description="spin-delay library or a simple timeout prevents skeleton flicker."
          />
        </div>
      </div>
    </>
  );
}
