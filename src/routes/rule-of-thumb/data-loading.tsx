import { createFileRoute } from "@tanstack/react-router";
import { RuleOfThumbPagination } from "./-components/rule-of-thumb-pagination";
import { useState, useEffect } from "react";
import {
  HardDrivesIcon,
  GlobeIcon,
  LightningIcon,
  DatabaseIcon,
  ArrowsClockwiseIcon,
  WarningCircleIcon,
  ClockIcon,
  StackIcon,
  BroadcastIcon,
  HardDriveIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { PageContainer } from "../../components/page-container";
import {
  BestPractice,
  CodeExample,
  RuleOfThumbHero,
  SectionHeading,
  TabbedCodeExample,
} from "./-components";
import { Button } from "../../components/button";

export const Route = createFileRoute("/rule-of-thumb/data-loading")({
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
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Dashboard Stats</h3>
          <div className="flex items-center gap-2">
            {isRefetching && (
              <ArrowsClockwiseIcon size={14} className="text-muted-foreground animate-spin" />
            )}
            <span className="text-xs text-muted-foreground">Updated {lastUpdated}</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-background border border-border">
          <p className="text-2xl font-bold text-foreground tabular-nums">{data}</p>
        </div>
      </div>

      <div className="border-t border-border p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {isRefetching ? "Fetching fresh data..." : "Showing cached data"}
        </span>
        <Button
          onClick={simulateRefetch}
          disabled={isRefetching}
          className="h-9 px-4 text-sm gap-2"
        >
          <ArrowsClockwiseIcon size={14} className={isRefetching ? "animate-spin" : ""} />
          Revalidate
        </Button>
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
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-6">
        <div className="min-h-[120px] flex items-center justify-center">
          {isLoading && showSkeleton ? (
            <div className="w-full space-y-3">
              <div className="h-6 w-3/4 bg-border rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-border rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-border rounded animate-pulse" />
            </div>
          ) : isLoading ? (
            <></>
          ) : (
            <div className="w-full">
              <h3 className="text-xl font-bold text-foreground mb-2">Data Loaded!</h3>
              <p className="text-muted-foreground">This content was fetched from the server.</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border p-4 space-y-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={useSpinDelay}
            onChange={(e) => setUseSpinDelay(e.target.checked)}
            className="rounded"
          />
          Use spin delay (200ms threshold)
        </label>

        <div className="flex gap-2">
          <Button onClick={() => simulateLoad(true)} disabled={isLoading}>
            Fast Load (100ms)
          </Button>
          <Button onClick={() => simulateLoad(false)} disabled={isLoading}>
            Slow Load (1.5s)
          </Button>
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
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-6">
        {state === "loading" && (
          <div className="flex items-center justify-center py-8">
            <ArrowsClockwiseIcon size={24} className="text-muted-foreground animate-spin" />
          </div>
        )}

        {state === "success" && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">User Profile</h3>
            <div className="p-4 rounded-lg bg-background border border-border">
              <p className="text-foreground">Alice Johnson</p>
              <p className="text-sm text-muted-foreground">alice@example.com</p>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
            <WarningCircleIcon size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-medium mb-1">Failed to load profile</p>
            <p className="text-sm text-red-400/70 mb-4">Network error. Please try again.</p>
            <button
              onClick={retry}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowsClockwiseIcon size={14} />
              Retry
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">✓ Error shown inline, not as toast</span>
        <button
          onClick={simulateError}
          disabled={state === "loading"}
          className="px-4 py-2 rounded-lg bg-background border border-border text-sm text-foreground hover:bg-border disabled:opacity-50 transition-colors"
        >
          Simulate Error
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Interactive Demo: Data Parsing with Zod .catch()
// ============================================================================

function DataParsingDemo() {
  const [highlightedJson, setHighlightedJson] = useState<string>("");
  const [highlightedSchema, setHighlightedSchema] = useState<string>("");
  const [highlightedResult, setHighlightedResult] = useState<string>("");

  const rawJson = `{
  "id": 1,
  "name": "Alice"
}`;

  const zodSchema = `z.object({
  id: z.number(),
  name: z.string(),
  // Fallback to "Unknown" if missing
  city: z.string().catch("Unknown")
})`;

  const parsedResult = `{
  "id": 1,
  "name": "Alice",
  "city": "Unknown"
}`;

  // Highlight all code blocks with Shiki
  useEffect(() => {
    import("shiki").then(({ codeToHtml }) => {
      // JSON input
      codeToHtml(rawJson, {
        lang: "json",
        themes: { light: "github-light", dark: "github-dark" },
      }).then(setHighlightedJson);

      // TypeScript schema
      codeToHtml(zodSchema, {
        lang: "typescript",
        themes: { light: "github-light", dark: "github-dark" },
      }).then(setHighlightedSchema);

      // JSON result
      codeToHtml(parsedResult, {
        lang: "json",
        themes: { light: "github-light", dark: "github-dark" },
      }).then(setHighlightedResult);
    });
  }, [rawJson, zodSchema, parsedResult]);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden mb-8">
      <div className="p-6">
        <h3 className="font-semibold text-foreground mb-6">Safe Parsing with Fallbacks</h3>

        <div className="space-y-6">
          {/* Step 1: Raw Data */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-5 rounded flex items-center justify-center bg-slate-500/10 text-slate-500 font-mono text-xs">
                1
              </span>
              Input: Raw API response or database query result
            </div>
            <div className="relative">
              <div
                className="p-4 rounded-lg bg-background border border-border text-xs overflow-x-auto [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0"
                dangerouslySetInnerHTML={{ __html: highlightedJson || `<pre>${rawJson}</pre>` }}
              />
              <div className="absolute top-3 right-3">
                <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-medium text-red-500">
                  Missing "city"
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Schema */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-5 rounded flex items-center justify-center bg-slate-500/10 text-slate-500 font-mono text-xs">
                2
              </span>
              Process: Zod (or any) Schema
            </div>
            <div
              className="p-4 rounded-lg bg-background border border-border text-xs overflow-x-auto [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0"
              dangerouslySetInnerHTML={{ __html: highlightedSchema || `<pre>${zodSchema}</pre>` }}
            />
          </div>

          {/* Step 3: Result */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-5 rounded flex items-center justify-center bg-slate-500/10 text-slate-500 font-mono text-xs">
                3
              </span>
              Output: Safe Data
            </div>
            <div className="relative">
              <div
                className="p-4 rounded-lg bg-background border border-border text-xs overflow-x-auto [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0"
                dangerouslySetInnerHTML={{
                  __html: highlightedResult || `<pre>${parsedResult}</pre>`,
                }}
              />
              <div className="absolute top-3 right-3">
                <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-medium text-emerald-500">
                  Fallback Applied
                </div>
              </div>
            </div>
          </div>
        </div>
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
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
  color?: string; // Optional or removed completely. Since I removed usage, I can remove it from type or make it optional unused. Best to remove it.
}) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="size-10 rounded-lg bg-zinc-500/10 dark:bg-zinc-500/20 flex items-center justify-center">
          <Icon size={20} className="text-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="text-sm text-muted-foreground space-y-2">{children}</div>
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
      <RuleOfThumbHero
        title="Data Loading"
        description={
          <>
            Strategies for fast, reliable data fetching.
            <br />
            <span className="text-foreground font-medium">Fast first paint, smooth updates.</span>
          </>
        }
        badge={{
          text: "Architecture",
        }}
        markdownUrl="/rule-of-thumb/data-loading.md"
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
          <SectionCard icon={HardDrivesIcon} title="Server-Side Rendering" color="">
            <p>
              <strong className="text-foreground">Use when:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>SEO is critical (crawlers need content)</li>
              <li>First contentful paint matters</li>
              <li>Data is mostly static or cacheable</li>
              <li>Users have slow devices</li>
            </ul>
          </SectionCard>

          <SectionCard icon={GlobeIcon} title="Single Page App" color="">
            <p>
              <strong className="text-foreground">Use when:</strong>
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
            title="Stale-While-Revalidate Pattern"
            code={`import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

const statsSchema = z.object({
  totalUsers: z.number(),
  activeUsers: z.number(),
  revenue: z.number().catch(0),
});

async function fetchStats() {
  const res = await fetch('/api/stats');
  
  if (!res.ok) {
    throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
  }
  
  const json = await res.json();
  
  return statsSchema.parse(json);
}

function Dashboard() {
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1>Stats</h1>
        {/* Show spinner when revalidating */}
        {isFetching && <Spinner size="sm" />}
      </div>
      
      {/* Show stale data while revalidating */}
      {data && <StatsDisplay data={data} />}
      
      {error && <ErrorState onRetry={refetch} />}
    </div>
  );
}`}
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
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-lg bg-zinc-500/10 dark:bg-zinc-500/20 flex items-center justify-center">
                <BroadcastIcon size={20} className="text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">WebSocket</h3>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">Use when:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Updates need to be instant ({"<"}1 second)</li>
                <li>High frequency updates (chat, live scores)</li>
                <li>Bi-directional communication needed</li>
                <li>Many small messages over time</li>
              </ul>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-lg bg-zinc-500/10 dark:bg-zinc-500/20 flex items-center justify-center">
                <ArrowsClockwiseIcon size={20} className="text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Interval HTTP</h3>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">Use when:</strong>
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
          description="Not all data should be persisted. Some data must always be fresh."
        />

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-2 mb-3">
              <WarningCircleIcon size={18} className="text-red-400" />
              <h3 className="font-semibold text-red-400">Don't Persist</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Data that must always be accurate:</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span>
                  <strong className="text-foreground">Bank balance</strong> — Stale balance could
                  cause overdrafts or confusion
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span>
                  <strong className="text-foreground">Stock prices</strong> — Users make decisions
                  based on current prices
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span>
                  <strong className="text-foreground">Inventory count</strong> — Could lead to
                  overselling
                </span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-3">
              <HardDriveIcon size={18} className="text-emerald-400" />
              <h3 className="font-semibold text-emerald-400">OK to Persist</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Historical or reference data:</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>
                  <strong className="text-foreground">Transaction history</strong> — Past records
                  don't change
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>
                  <strong className="text-foreground">User preferences</strong> — Settings rarely
                  change
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>
                  <strong className="text-foreground">Static content</strong> — Blog posts,
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

        {/* Persistence Methods */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-foreground mb-6">Persistence Methods</h3>
          <div className="grid gap-4">
            {/* LocalStorage */}
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                  <HardDriveIcon size={20} className="text-amber-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">LocalStorage</h4>
                  <span className="text-xs text-muted-foreground">~5MB limit</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Simple key-value storage. Best for small, string-based data.</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Synchronous API — can block main thread</li>
                  <li>Only stores strings (requires JSON.stringify)</li>
                  <li>Good for: user preferences, tokens, small cache</li>
                </ul>
              </div>
            </div>

            {/* IndexedDB */}
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <DatabaseIcon size={20} className="text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">IndexedDB</h4>
                  <span className="text-xs text-muted-foreground">No practical limit</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Full database in the browser. Best for structured, large datasets.</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Asynchronous API — doesn't block UI</li>
                  <li>Supports indexes, transactions, and cursors</li>
                  <li>Good for: offline-first apps, large cache, complex queries</li>
                </ul>
              </div>
            </div>

            {/* Embedded Database */}
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                  <StackIcon size={20} className="text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Embedded Database</h4>
                  <span className="text-xs text-muted-foreground">
                    ElectricSQL, Turso, PGlite, etc.
                  </span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Full SQL database running in the browser with sync capabilities.</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Real SQL queries (SQLite-based)</li>
                  <li>Automatic sync with remote database</li>
                  <li>Good for: offline-first apps, local-first architecture, complex data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Code examples for persistence */}
        <div className="mt-8">
          <TabbedCodeExample
            title="Persistence Implementation"
            tabs={[
              {
                label: "LocalStorage",
                code: `import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { gcTime: 1000 * 60 * 60 * 24 }, // 24 hours
  },
});

// Simple localStorage persister
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'app-cache',
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});`,
              },
              {
                label: "IndexedDB",
                code: `import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get, set, del } from 'idb-keyval';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { gcTime: 1000 * 60 * 60 * 24 * 7 }, // 7 days
  },
});

// IndexedDB persister using idb-keyval
const persister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => await get(key),
    setItem: async (key, value) => await set(key, value),
    removeItem: async (key) => await del(key),
  },
  key: 'app-cache',
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
});`,
              },
              {
                label: "ElectricSQL",
                code: `import { electrify } from 'electric-sql/browser';
import { schema } from './generated/client';

// Initialize ElectricSQL with SQLite
const electric = await electrify(
  await ElectricDatabase.init('my-app.db'),
  schema,
  { url: 'https://api.electric-sql.com' }
);

// Sync specific tables
await electric.sync.table('users');
await electric.sync.table('posts');

// Use like a normal database - auto syncs!
const users = await electric.db.users.findMany();

// Changes sync bidirectionally
await electric.db.users.create({
  data: { name: 'Alice', email: 'alice@example.com' }
});`,
              },
              {
                label: "Turso (libSQL)",
                code: `import { createClient } from '@libsql/client/web';

// Connect to Turso embedded replica
const client = createClient({
  url: 'file:local.db',
  syncUrl: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Sync with remote on startup
await client.sync();

// Query locally - instant response
const users = await client.execute('SELECT * FROM users');

// Mutations sync automatically
await client.execute({
  sql: 'INSERT INTO users (name, email) VALUES (?, ?)',
  args: ['Alice', 'alice@example.com']
});

// Periodic sync for real-time updates
setInterval(() => client.sync(), 30000);`,
              },
            ]}
            description="Choose the right persistence method based on your data size and complexity. LocalStorage for simple needs, IndexedDB for larger cache, embedded databases for full offline-first experiences."
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 8: Parsing Data from External Source */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="Parsing Data from External Source"
          description="Always validate and parse data from APIs or databases to catch issues early."
        />

        <DataParsingDemo />

        <div className="mt-8 grid sm:grid-cols-2 gap-4 mb-8">
          <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-2 mb-3">
              <WarningCircleIcon size={18} className="text-red-400" />
              <h3 className="font-semibold text-red-400">Without Parsing</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">What can go wrong:</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span>
                  <strong className="text-foreground">Runtime crashes</strong> — Accessing{" "}
                  <code className="text-xs bg-background px-1 rounded">
                    user.name.toUpperCase()
                  </code>{" "}
                  when name is undefined
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span>
                  <strong className="text-foreground">Type mismatches</strong> — Expecting number,
                  getting string like{" "}
                  <code className="text-xs bg-background px-1 rounded">"42"</code>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✗</span>
                <span>
                  <strong className="text-foreground">Silent failures</strong> — Missing fields that
                  cause subtle bugs later
                </span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheckIcon size={18} className="text-emerald-400" />
              <h3 className="font-semibold text-emerald-400">With Parsing</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Benefits:</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>
                  <strong className="text-foreground">Early error detection</strong> — Catch invalid
                  data at the boundary
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>
                  <strong className="text-foreground">Type safety</strong> — TypeScript knows the
                  exact shape after parsing
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>
                  <strong className="text-foreground">Graceful handling</strong> — Use fallbacks or
                  show meaningful errors
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <BestPractice
            emoji="🛡️"
            title="Parse at the boundary"
            description="Validate data as soon as it enters your application — right after fetch() or database query. Don't let invalid data propagate."
          />
          <BestPractice
            emoji="🔄"
            title="Use fallback values"
            description="For optional fields, provide sensible defaults. role: 'User' is better than role: undefined crashing your UI."
          />
          <BestPractice
            emoji="📝"
            title="Show meaningful errors"
            description="When parsing fails, display a user-friendly message. Log the technical details to your observability tools."
          />
          <BestPractice
            emoji="🎯"
            title="Keep schemas in sync"
            description="When your API changes, update your validation schemas. Zod/Yup schemas are living documentation of your data contracts."
          />
        </div>

        <div className="mt-8">
          <TabbedCodeExample
            title="Data Validation with Zod"
            tabs={[
              {
                label: "Basic Parsing",
                code: `import { z } from 'zod';

// Define the expected shape
const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['Admin', 'User', 'Editor']).default('User'),
  avatar: z.string().url().optional(),
});

type User = z.infer<typeof UserSchema>;

// Parse API response
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(\`/api/users/\${id}\`);
  const data = await response.json();
  
  // Parse and validate - throws if invalid
  return UserSchema.parse(data);
}`,
              },
              {
                label: "Safe Parsing",
                code: `import { z } from 'zod';

const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['Admin', 'User', 'Editor']).default('User'),
});

async function fetchUser(id: string) {
  const response = await fetch(\`/api/users/\${id}\`);
  const data = await response.json();
  
  // safeParse doesn't throw - returns success/error
  const result = UserSchema.safeParse(data);
  
  if (!result.success) {
    // Handle validation errors gracefully
    console.error('Validation failed:', result.error.issues);
    
    // Report to observability
    captureException(result.error, { context: 'fetchUser' });
    
    // Return null or throw custom error
    return null;
  }
  
  // TypeScript knows result.data is User
  return result.data;
}`,
              },
              {
                label: "With TanStack Query",
                code: `import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

const UsersSchema = z.array(z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
}));

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      const data = await res.json();
      
      // Parse in queryFn - errors trigger error state
      return UsersSchema.parse(data);
    },
  });
}

function UserList() {
  const { data: users, error, isLoading } = useUsers();
  
  if (error instanceof z.ZodError) {
    // Specific handling for validation errors
    return <div>Invalid data received from server</div>;
  }
  
  if (error) return <ErrorState error={error} />;
  if (isLoading) return <Skeleton />;
  
  // users is typed correctly as User[]
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}`,
              },
            ]}
            description="Zod provides runtime validation with TypeScript type inference. Parse external data to catch issues early."
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mb-20">
        <div className="p-8 rounded-2xl bg-card border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Reference</h2>
          <div className="space-y-3 text-muted-foreground">
            <div className="flex items-start gap-3">
              <HardDrivesIcon size={18} className="text-foreground mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">SSR</strong> — Use for SEO-critical, important
                content
              </span>
            </div>
            <div className="flex items-start gap-3">
              <LightningIcon size={18} className="text-foreground mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">Loader</strong> — Trigger fetches on navigation,
                not render
              </span>
            </div>
            <div className="flex items-start gap-3">
              <StackIcon size={18} className="text-foreground mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">Defer</strong> — Don't block render, show
                skeleton first
              </span>
            </div>
            <div className="flex items-start gap-3">
              <DatabaseIcon size={18} className="text-cyan-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">Batch</strong> — Group queries when possible,
                separate if heavy
              </span>
            </div>
            <div className="flex items-start gap-3">
              <ArrowsClockwiseIcon size={18} className="text-emerald-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">SWR</strong> — Show stale data, indicate
                background refresh
              </span>
            </div>
            <div className="flex items-start gap-3">
              <ClockIcon size={18} className="text-foreground mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">Spin Delay</strong> — Wait 200ms before showing
                skeleton
              </span>
            </div>
            <div className="flex items-start gap-3">
              <WarningCircleIcon size={18} className="text-red-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">Errors</strong> — Inline, not toast. Include
                retry. Log to observability.
              </span>
            </div>
            <div className="flex items-start gap-3">
              <BroadcastIcon size={18} className="text-pink-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">WebSocket</strong> — Use for realtime data that
                needs instant updates
              </span>
            </div>
            <div className="flex items-start gap-3">
              <HardDriveIcon size={18} className="text-zinc-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">Cache</strong> — Don't persist client cache
                unless app works offline or needs latest data on revisit
              </span>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheckIcon size={18} className="text-emerald-400 mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">Parse</strong> — Validate external data with
                Zod. Use fallbacks or show meaningful errors.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <RuleOfThumbPagination />
    </PageContainer>
  );
}
