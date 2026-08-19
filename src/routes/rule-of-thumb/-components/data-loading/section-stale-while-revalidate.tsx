import { cx } from "@/stylex";
import { BestPractice, CodeExample, SectionHeading } from "../index";
import { SWRDemo } from "./swr-demo";

export function StaleWhileRevalidateSection() {
  return (
    <>
{/* ================================================================== */}
      {/* SECTION 3: Stale-While-Revalidate */}
      {/* ================================================================== */}
      <div className={cx("mb-20")}>
        <SectionHeading
          title="Stale-While-Revalidate"
          description="Show cached data immediately, fetch fresh data in the background."
        />

        <SWRDemo />

        <div className={cx("mt-8 space-y-4")}>
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

        <div className={cx("mt-8")}>
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
      <div className={cx("flex items-center gap-2")}>
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
    </>
  );
}
