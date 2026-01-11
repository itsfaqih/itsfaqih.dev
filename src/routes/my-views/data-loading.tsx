import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Server,
  Globe,
  Zap,
  Database,
  RefreshCw,
  AlertCircle,
  Clock,
  Layers,
  Radio,
  HardDrive,
} from "lucide-react";
import { PageContainer } from "../../components/page-container";
import {
  BestPractice,
  CodeExample,
  GuidelineHero,
  SectionHeading,
  TabbedCodeExample,
} from "./components";

export const Route = createFileRoute("/my-views/data-loading")({
  component: DataLoading,
});

// ============================================================================
// Interactive Demo: Stale-While-Revalidate
// ============================================================================

function SWRDemo() {
  const [data, setData] = useState<string>("User count: 1,234");
  const [isRefetching, setIsRefetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("2 min ago");

  const simulateRefetch = () => {
    setIsRefetching(true);
    setTimeout(() => {
      setData(`User count: ${Math.floor(1200 + Math.random() * 100).toLocaleString()}`);
      setLastUpdated("just now");
      setIsRefetching(false);
    }, 1500);
  };

  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-(--text-primary)">Dashboard Stats</h3>
          <div className="flex items-center gap-2">
            {isRefetching && <RefreshCw size={14} className="text-indigo-400 animate-spin" />}
            <span className="text-xs text-(--text-secondary)">Updated {lastUpdated}</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-(--bg-primary) border border-(--border-color)">
          <p className="text-2xl font-bold text-(--text-primary) tabular-nums">{data}</p>
        </div>
      </div>

      <div className="border-t border-(--border-color) p-4 flex items-center justify-between">
        <span className="text-sm text-(--text-secondary)">
          {isRefetching ? "Fetching fresh data..." : "Showing cached data"}
        </span>
        <button
          onClick={simulateRefetch}
          disabled={isRefetching}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} />
          Revalidate
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Interactive Demo: Skeleton with Spin Delay
// ============================================================================

function SkeletonDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [useSpinDelay, setUseSpinDelay] = useState(true);

  const simulateLoad = (fast: boolean) => {
    setIsLoading(true);
    setShowSkeleton(false);

    const delayTimer = setTimeout(() => {
      if (useSpinDelay) {
        setShowSkeleton(true);
      }
    }, 200);

    if (!useSpinDelay) {
      setShowSkeleton(true);
    }

    setTimeout(
      () => {
        clearTimeout(delayTimer);
        setIsLoading(false);
        setShowSkeleton(false);
      },
      fast ? 100 : 1500,
    );
  };

  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) overflow-hidden">
      <div className="p-6">
        <div className="min-h-[120px] flex items-center justify-center">
          {isLoading && showSkeleton ? (
            <div className="w-full space-y-3">
              <div className="h-6 w-3/4 bg-(--border-color) rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-(--border-color) rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-(--border-color) rounded animate-pulse" />
            </div>
          ) : isLoading ? (
            <span className="text-(--text-secondary)">Loading...</span>
          ) : (
            <div className="w-full">
              <h3 className="text-xl font-bold text-(--text-primary) mb-2">Data Loaded!</h3>
              <p className="text-(--text-secondary)">This content was fetched from the server.</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-(--border-color) p-4 space-y-4">
        <label className="flex items-center gap-2 text-sm text-(--text-secondary)">
          <input
            type="checkbox"
            checked={useSpinDelay}
            onChange={(e) => setUseSpinDelay(e.target.checked)}
            className="rounded"
          />
          Use spin delay (200ms threshold)
        </label>

        <div className="flex gap-2">
          <button
            onClick={() => simulateLoad(true)}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-color) text-sm text-(--text-primary) hover:bg-(--border-color) disabled:opacity-50 transition-colors"
          >
            Fast Load (100ms)
          </button>
          <button
            onClick={() => simulateLoad(false)}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Slow Load (1.5s)
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Interactive Demo: Error State (Not Toast)
// ============================================================================

function ErrorDemo() {
  const [state, setState] = useState<"loading" | "success" | "error">("success");

  const simulateError = () => {
    setState("loading");
    setTimeout(() => setState("error"), 800);
  };

  const retry = () => {
    setState("loading");
    setTimeout(() => setState("success"), 800);
  };

  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary) overflow-hidden">
      <div className="p-6">
        {state === "loading" && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw size={24} className="text-(--text-secondary) animate-spin" />
          </div>
        )}

        {state === "success" && (
          <div className="space-y-3">
            <h3 className="font-semibold text-(--text-primary)">User Profile</h3>
            <div className="p-4 rounded-lg bg-(--bg-primary) border border-(--border-color)">
              <p className="text-(--text-primary)">Alice Johnson</p>
              <p className="text-sm text-(--text-secondary)">alice@example.com</p>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
            <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-medium mb-1">Failed to load profile</p>
            <p className="text-sm text-red-400/70 mb-4">Network error. Please try again.</p>
            <button
              onClick={retry}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-(--border-color) p-4 flex items-center justify-between">
        <span className="text-sm text-(--text-secondary)">✓ Error shown inline, not as toast</span>
        <button
          onClick={simulateError}
          disabled={state === "loading"}
          className="px-4 py-2 rounded-lg bg-(--bg-primary) border border-(--border-color) text-sm text-(--text-primary) hover:bg-(--border-color) disabled:opacity-50 transition-colors"
        >
          Simulate Error
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Section Card Component
// ============================================================================

function SectionCard({
  icon: Icon,
  title,
  children,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-(--border-color) bg-(--bg-secondary)">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        <h3 className="font-semibold text-(--text-primary)">{title}</h3>
      </div>
      <div className="text-sm text-(--text-secondary) space-y-2">{children}</div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

function DataLoading() {
  return (
    <PageContainer maxWidth="3xl">
      {/* Hero Section */}
      <GuidelineHero
        title="Data Loading"
        description={
          <>
            Strategies for fast, reliable data fetching.
            <br />
            <span className="text-(--text-primary) font-medium">
              Fast first paint, smooth updates.
            </span>
          </>
        }
        badge={{
          icon: Zap,
          text: "Performance Pattern",
        }}
      />

      {/* ================================================================== */}
      {/* SECTION 1: SSR vs SPA Decision */}
      {/* ================================================================== */}
      {/* ================================================================== */}
      {/* SECTION 1: SSR vs SPA Decision */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="SSR vs SPA"
          description="Choose the right rendering strategy based on your requirements."
        />

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <SectionCard icon={Server} title="Server-Side Rendering" color="bg-emerald-500">
            <p>
              <strong className="text-(--text-primary)">Use when:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>SEO is critical (crawlers need content)</li>
              <li>First contentful paint matters</li>
              <li>Data is mostly static or cacheable</li>
              <li>Users have slow devices</li>
            </ul>
          </SectionCard>

          <SectionCard icon={Globe} title="Single Page App" color="bg-indigo-500">
            <p>
              <strong className="text-(--text-primary)">Use when:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Behind authentication (no SEO needed)</li>
              <li>Highly interactive dashboards</li>
              <li>Real-time data updates</li>
              <li>Rich client-side interactions</li>
            </ul>
          </SectionCard>
        </div>

        <BestPractice
          emoji="🎯"
          title="SSR for important content"
          description="If you need SSR (for SEO or initial load performance), render important content on the server. Less critical data can be loaded client-side."
        />
      </div>

      {/* ================================================================== */}
      {/* SECTION 2: Trigger Fetching Early */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Trigger Fetching Early"
          description="Start data fetching as soon as possible — don't wait for components to render."
        />

        <div className="space-y-4 mb-8">
          <BestPractice
            emoji="🚀"
            title="Use route loaders"
            description="React Router and TanStack Router support loaders that fetch data during navigation, before the component renders."
          />
          <BestPractice
            emoji="⏳"
            title="Don't block the render"
            description="Start the fetch early but defer non-critical data. Promises are handled automatically — show the page immediately with skeletons."
          />
          <BestPractice
            emoji="📦"
            title="Batch database calls"
            description="Group related queries when possible to reduce round trips. But if a query is heavy, keep it separate to avoid blocking."
          />
        </div>

        <TabbedCodeExample
          title="Route Loader with TanStack Query"
          tabs={[
            {
              label: "TanStack Router",
              code: `import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

// Route definition - prefetch during navigation
export const Route = createFileRoute('/dashboard')({
  loader: ({ context: { queryClient } }) => {
    // Prefetch critical data during navigation
    queryClient.ensureQueryData(usersQueryOptions)
    // Non-critical data: just return the promise
    // (will stream in after initial render)
    return {
      statsPromise: queryClient.ensureQueryData(statsQueryOptions),
    }
  },
  component: Dashboard,
})

function Dashboard() {
  // Data is already cached from loader
  const { data: users } = useSuspenseQuery(usersQueryOptions)
  
  return <UserList users={users} />
}`,
            },
            {
              label: "React Router",
              code: `import { useLoaderData, Await } from 'react-router-dom'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense } from 'react'

// Route loader - prefetch during navigation
export async function loader({ context: { queryClient } }) {
  // Prefetch critical data
  await queryClient.ensureQueryData(usersQueryOptions)
  // Return deferred promise for non-critical data
  return {
    statsPromise: queryClient.fetchQuery(statsQueryOptions),
  }
}

function Dashboard() {
  const { statsPromise } = useLoaderData()
  const { data: users } = useSuspenseQuery(usersQueryOptions)

  return (
    <div>
      <UserList users={users} />
      <Suspense fallback={<StatsSkeleton />}>
        <Await resolve={statsPromise}>
          {(stats) => <StatsDisplay stats={stats} />}
        </Await>
      </Suspense>
    </div>
  )
}`,
            },
          ]}
          description="Prefetch with TanStack Query during navigation. Promises are automatically deferred — no defer() wrapper needed."
        />
      </div>

      {/* ================================================================== */}
      {/* SECTION 3: Stale-While-Revalidate */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Stale-While-Revalidate"
          description="Show cached data immediately, fetch fresh data in the background."
        />

        <SWRDemo />

        <div className="mt-8 space-y-4">
          <BestPractice
            emoji="⚡"
            title="Show stale data first"
            description="Display cached data immediately for instant perceived performance. Users see content right away."
          />
          <BestPractice
            emoji="🔄"
            title="Show refetch indicator"
            description="When fetching fresh data, show a subtle spinner or indicator so users know an update is coming."
          />
          <BestPractice
            emoji="✨"
            title="Smooth updates"
            description="When new data arrives, update the UI smoothly without jarring layout shifts."
          />
        </div>

        <div className="mt-8">
          <CodeExample
            title="SWR Pattern"
            code={`import useSWR from 'swr';

function Dashboard() {
  const { data, error, isValidating } = useSWR(
    '/api/stats',
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1>Stats</h1>
        {/* Show spinner when revalidating */}
        {isValidating && <Spinner size="sm" />}
      </div>
      
      {/* Show stale data while revalidating */}
      {data && <StatsDisplay data={data} />}
      
      {error && <ErrorState onRetry={mutate} />}
    </div>
  );
}`}
            description="SWR provides automatic caching, revalidation, and background updates."
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 4: Spin Delay */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Spin Delay"
          description="Prevent flickering skeletons for fast responses."
        />

        <SkeletonDemo />

        <div className="mt-8 space-y-4">
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

        <div className="mt-8">
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

      {/* ================================================================== */}
      {/* SECTION 5: Error Handling */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Error Handling"
          description="Show errors inline, not as toasts. Make them recoverable."
        />

        <ErrorDemo />

        <div className="mt-8 space-y-4">
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

        <div className="mt-8">
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
      <div className="error-state">
        <AlertCircle />
        <p>Failed to load profile</p>
        <p className="text-sm">{error.message}</p>
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

      {/* ================================================================== */}
      {/* SECTION 6: Realtime Data */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Realtime Data"
          description='Choose the right approach based on how "real" your realtime needs to be.'
        />

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-xl border border-(--border-color) bg-(--bg-secondary)">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center">
                <Radio size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-(--text-primary)">WebSocket</h3>
            </div>
            <div className="text-sm text-(--text-secondary) space-y-2">
              <p>
                <strong className="text-(--text-primary)">Use when:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Updates need to be instant ({"<"}1 second)</li>
                <li>High frequency updates (chat, live scores)</li>
                <li>Bi-directional communication needed</li>
                <li>Many small messages over time</li>
              </ul>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-(--border-color) bg-(--bg-secondary)">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center">
                <RefreshCw size={20} className="text-white" />
              </div>
              <h3 className="font-semibold text-(--text-primary)">Interval HTTP</h3>
            </div>
            <div className="text-sm text-(--text-secondary) space-y-2">
              <p>
                <strong className="text-(--text-primary)">Use when:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Updates every 30+ seconds is acceptable</li>
                <li>Simpler infrastructure needed</li>
                <li>Server doesn't support WebSocket</li>
                <li>Lower frequency dashboard updates</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <BestPractice
            emoji="⚡"
            title="WebSocket for true realtime"
            description="HTTP requests have overhead (headers, connection setup). WebSocket maintains a persistent connection — much faster for frequent small updates."
          />
          <BestPractice
            emoji="🔄"
            title="Interval polling for 30s+ updates"
            description="If data only needs to refresh every 30 seconds or more, start with interval HTTP polling. Simpler to implement and debug."
          />
          <BestPractice
            emoji="📊"
            title="Consider the trade-offs"
            description="WebSocket requires more infrastructure (connection management, reconnection logic). Don't over-engineer if polling works fine."
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 7: Cache Persistence */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Cache Persistence"
          description="Not all data should be persisted to local storage. Some data must always be fresh."
        />

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={18} className="text-red-400" />
              <h3 className="font-semibold text-red-400">Don't Persist</h3>
            </div>
            <p className="text-sm text-(--text-secondary) mb-4">
              Data that must always be accurate:
            </p>
            <ul className="text-sm text-(--text-secondary) space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span>
                  <strong className="text-(--text-primary)">Bank balance</strong> — Stale balance
                  could cause overdrafts or confusion
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span>
                  <strong className="text-(--text-primary)">Stock prices</strong> — Users make
                  decisions based on current prices
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span>
                  <strong className="text-(--text-primary)">Inventory count</strong> — Could lead to
                  overselling
                </span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive size={18} className="text-emerald-400" />
              <h3 className="font-semibold text-emerald-400">OK to Persist</h3>
            </div>
            <p className="text-sm text-(--text-secondary) mb-4">Historical or reference data:</p>
            <ul className="text-sm text-(--text-secondary) space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>
                  <strong className="text-(--text-primary)">Transaction history</strong> — Past
                  records don't change
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>
                  <strong className="text-(--text-primary)">User preferences</strong> — Settings
                  rarely change
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>
                  <strong className="text-(--text-primary)">Static content</strong> — Blog posts,
                  documentation
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <BestPractice
            emoji="🏦"
            title="Think about the consequences"
            description="Ask: 'What happens if users see stale data?' If the answer is 'they might make bad decisions' — don't persist."
          />
          <BestPractice
            emoji="🕐"
            title="Show 'last fetched' timestamp"
            description="When showing persisted data, display when it was last fetched. Users need to know if they're seeing data from 5 minutes or 5 days ago."
          />
          <BestPractice
            emoji="📴"
            title="Offline-first is an exception"
            description="If your app needs to work offline (like a notes app), persisting cache is required. But revalidate immediately when back online."
          />
          <BestPractice
            emoji="⏰"
            title="Set appropriate TTL"
            description="If you do persist, set a reasonable time-to-live. Stale cache from 3 months ago is probably useless."
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mb-20">
        <div className="p-8 rounded-2xl bg-linear-to-br from-amber-500/10 to-indigo-500/10 border border-amber-500/20">
          <h2 className="text-xl font-bold text-(--text-primary) mb-4">Quick Reference</h2>
          <div className="space-y-3 text-(--text-secondary)">
            <div className="flex items-start gap-3">
              <Server size={18} className="text-emerald-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-(--text-primary)">SSR</strong> — Use for SEO-critical,
                important content
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Zap size={18} className="text-amber-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-(--text-primary)">Loader</strong> — Trigger fetches on
                navigation, not render
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Layers size={18} className="text-indigo-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-(--text-primary)">Defer</strong> — Don't block render, show
                skeleton first
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Database size={18} className="text-cyan-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-(--text-primary)">Batch</strong> — Group queries when
                possible, separate if heavy
              </span>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw size={18} className="text-emerald-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-(--text-primary)">SWR</strong> — Show stale data, indicate
                background refresh
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-purple-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-(--text-primary)">Spin Delay</strong> — Wait 200ms before
                showing skeleton
              </span>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-(--text-primary)">Errors</strong> — Inline, not toast.
                Include retry. Log to observability.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <Radio size={18} className="text-pink-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-(--text-primary)">WebSocket</strong> — Use for realtime data
                that needs instant updates
              </span>
            </div>
            <div className="flex items-start gap-3">
              <HardDrive size={18} className="text-zinc-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-(--text-primary)">Cache</strong> — Don't persist client
                cache unless app works offline or needs latest data on revisit
              </span>
            </div>
          </div>
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
