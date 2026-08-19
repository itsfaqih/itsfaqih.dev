import { cx } from "@/stylex";
import { BestPractice, SectionHeading, TabbedCodeExample } from "../index";

export function TriggerFetchingSection() {
  return (
    <>
{/* ================================================================== */}
      {/* SECTION 2: Trigger Fetching Early */}
      {/* ================================================================== */}
      <div className={cx("mb-20")}>
        <SectionHeading
          title="Trigger Fetching Early"
          description="Start data fetching as soon as possible — don't wait for components to render."
        />

        <div className={cx("space-y-4 mb-8")}>
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
    </>
  );
}
