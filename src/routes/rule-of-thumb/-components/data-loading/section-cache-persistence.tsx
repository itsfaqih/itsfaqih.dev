import { cx } from "@/stylex";
import {
  DatabaseIcon,
  HardDriveIcon,
  StackIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { BestPractice, SectionHeading, TabbedCodeExample } from "../index";

export function CachePersistenceSection() {
  return (
    <>
{/* ================================================================== */}
      {/* SECTION 7: Cache Persistence */}
      {/* ================================================================== */}
      <div className={cx("mb-20")}>
        <SectionHeading
          title="Cache Persistence"
          description="Not all data should be persisted. Some data must always be fresh."
        />

        <div className={cx("grid sm:grid-cols-2 gap-4 mb-8")}>
          <div className={cx("p-6 rounded-xl border border-negative/30 bg-negative/10")}>
            <div className={cx("flex items-center gap-2 mb-3")}>
              <WarningCircleIcon size={18} className={cx("text-negative-foreground")} />
              <h3 className={cx("font-semibold text-negative-foreground")}>Don't Persist</h3>
            </div>
            <p className={cx("text-sm text-muted-foreground mb-4")}>Data that must always be accurate:</p>
            <ul className={cx("text-sm text-muted-foreground space-y-2")}>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-negative-foreground")}>✗</span>
                <span>
                  <strong className={cx("text-foreground")}>Bank balance</strong> — Stale balance could
                  cause overdrafts or confusion
                </span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-negative-foreground")}>✗</span>
                <span>
                  <strong className={cx("text-foreground")}>Stock prices</strong> — Users make decisions
                  based on current prices
                </span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-negative-foreground")}>✗</span>
                <span>
                  <strong className={cx("text-foreground")}>Inventory count</strong> — Could lead to
                  overselling
                </span>
              </li>
            </ul>
          </div>

          <div className={cx("p-6 rounded-xl border border-positive/30 bg-positive/10")}>
            <div className={cx("flex items-center gap-2 mb-3")}>
              <HardDriveIcon size={18} className={cx("text-positive-foreground")} />
              <h3 className={cx("font-semibold text-positive-foreground")}>OK to Persist</h3>
            </div>
            <p className={cx("text-sm text-muted-foreground mb-4")}>Historical or reference data:</p>
            <ul className={cx("text-sm text-muted-foreground space-y-2")}>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-positive-foreground")}>✓</span>
                <span>
                  <strong className={cx("text-foreground")}>Transaction history</strong> — Past records
                  don't change
                </span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-positive-foreground")}>✓</span>
                <span>
                  <strong className={cx("text-foreground")}>User preferences</strong> — Settings rarely
                  change
                </span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-positive-foreground")}>✓</span>
                <span>
                  <strong className={cx("text-foreground")}>Static content</strong> — Blog posts,
                  documentation
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className={cx("space-y-4")}>
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
        <div className={cx("mt-12")}>
          <h3 className={cx("text-lg font-semibold text-foreground mb-6")}>Persistence Methods</h3>
          <div className={cx("grid gap-4")}>
            {/* LocalStorage */}
            <div className={cx("p-6 rounded-xl border border-border bg-card")}>
              <div className={cx("flex items-center gap-3 mb-4")}>
                <div className={cx("size-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center")}>
                  <HardDriveIcon size={20} className={cx("text-amber-500")} />
                </div>
                <div>
                  <h4 className={cx("font-semibold text-foreground")}>LocalStorage</h4>
                  <span className={cx("text-xs text-muted-foreground")}>~5MB limit</span>
                </div>
              </div>
              <div className={cx("text-sm text-muted-foreground space-y-2")}>
                <p>Simple key-value storage. Best for small, string-based data.</p>
                <ul className={cx("list-disc list-inside space-y-1 mt-2")}>
                  <li>Synchronous API — can block main thread</li>
                  <li>Only stores strings (requires JSON.stringify)</li>
                  <li>Good for: user preferences, tokens, small cache</li>
                </ul>
              </div>
            </div>

            {/* IndexedDB */}
            <div className={cx("p-6 rounded-xl border border-border bg-card")}>
              <div className={cx("flex items-center gap-3 mb-4")}>
                <div className={cx("size-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center")}>
                  <DatabaseIcon size={20} className={cx("text-blue-500")} />
                </div>
                <div>
                  <h4 className={cx("font-semibold text-foreground")}>IndexedDB</h4>
                  <span className={cx("text-xs text-muted-foreground")}>No practical limit</span>
                </div>
              </div>
              <div className={cx("text-sm text-muted-foreground space-y-2")}>
                <p>Full database in the browser. Best for structured, large datasets.</p>
                <ul className={cx("list-disc list-inside space-y-1 mt-2")}>
                  <li>Asynchronous API — doesn't block UI</li>
                  <li>Supports indexes, transactions, and cursors</li>
                  <li>Good for: offline-first apps, large cache, complex queries</li>
                </ul>
              </div>
            </div>

            {/* Embedded Database */}
            <div className={cx("p-6 rounded-xl border border-border bg-card")}>
              <div className={cx("flex items-center gap-3 mb-4")}>
                <div className={cx("size-10 rounded-lg bg-positive/10 dark:bg-positive/20 flex items-center justify-center")}>
                  <StackIcon size={20} className={cx("text-positive-foreground")} />
                </div>
                <div>
                  <h4 className={cx("font-semibold text-foreground")}>Embedded Database</h4>
                  <span className={cx("text-xs text-muted-foreground")}>
                    ElectricSQL, Turso, PGlite, etc.
                  </span>
                </div>
              </div>
              <div className={cx("text-sm text-muted-foreground space-y-2")}>
                <p>Full SQL database running in the browser with sync capabilities.</p>
                <ul className={cx("list-disc list-inside space-y-1 mt-2")}>
                  <li>Real SQL queries (SQLite-based)</li>
                  <li>Automatic sync with remote database</li>
                  <li>Good for: offline-first apps, local-first architecture, complex data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Code examples for persistence */}
        <div className={cx("mt-8")}>
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
    </>
  );
}
