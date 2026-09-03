import { cx } from "@/stylex";
import { createFileRoute } from "@tanstack/react-router";
import { RuleOfThumbPagination } from "./-components/rule-of-thumb-pagination";
import { FilterDemo } from "./-handling-timestamps-filter-demo";
import { FlowStep } from "./-handling-timestamps-flow-step";
import { TimezoneDemo } from "./-handling-timestamps-timezone-demo";
import {
  DatabaseIcon,
  GlobeIcon,
  HardDrivesIcon,
  DesktopIcon,
  CalendarBlankIcon,
  CheckIcon,
  XIcon,
} from "@phosphor-icons/react";

import { BestPractice, CodeExample, RuleOfThumbHero, SectionHeading } from "./-components";
import { PageContainer } from "../../components/page-container";

export const Route = createFileRoute("/rule-of-thumb/handling-timestamps")({
  component: HandlingTimestamps,
});



// ============================================================================
// Flow Step Component
// ============================================================================



// ============================================================================
// Main Page Component
// ============================================================================

function HandlingTimestamps() {
  return (
    <PageContainer maxWidth="3xl" className="rule-of-thumb-page">
      {/* Hero Section */}
      <RuleOfThumbHero
        title="Handling Timestamps"
        description={
          <>
            The timezone problem, solved simply.
            <br />
            <span className={cx("text-foreground font-medium")}>Store UTC, display local.</span>
          </>
        }
        badge={{
          text: "Best Practices",
        }}
        markdownUrl="/rule-of-thumb/handling-timestamps.md"
      />

      {/* ================================================================== */}
      {/* SECTION 1: The Flow */}
      {/* ================================================================== */}
      <div className={cx("mb-20")}>
        <SectionHeading
          title="The Timestamp Flow"
          description="A simple, consistent approach that works across all timezones."
        />

        <div className={cx("space-y-6 mb-8")}>
          <FlowStep
            icon={DatabaseIcon}
            title="Store as UTC in Database"
            description="Always store timestamps in UTC (Coordinated Universal Time). No timezone offset, no ambiguity."
          />
          <div className={cx("ml-5 border-l-2 border-dashed border-border h-6")} />
          <FlowStep
            icon={HardDrivesIcon}
            title="Return UTC from Backend"
            description="API responses should return timestamps in ISO 8601 format with UTC timezone (e.g., 2026-01-10T06:00:00.000Z)."
          />
          <div className={cx("ml-5 border-l-2 border-dashed border-border h-6")} />
          <FlowStep
            icon={DesktopIcon}
            title="Display in Local Timezone"
            description="The frontend converts UTC to the user's local timezone for display. Users see times that make sense to them."
          />
        </div>

        <BestPractice
          emoji="🌍"
          title="Why UTC?"
          description="UTC is the global standard. It has no daylight saving time, no political changes. A timestamp in UTC means the same thing everywhere in the world."
        />
      </div>

      {/* ================================================================== */}
      {/* SECTION 2: Live Demo - Display */}
      {/* ================================================================== */}
      <div className={cx("mb-20")}>
        <SectionHeading
          title="Displaying Timestamps"
          description="Store one UTC value, display it in the user's local timezone."
        />

        <TimezoneDemo />

        <div className={cx("mt-8")}>
          <CodeExample
            title="Frontend Display"
            code={`// API returns UTC timestamp
const apiResponse = {
  createdAt: "2026-01-10T06:00:00.000Z"
};

// Option 1: Native Intl.DateTimeFormat
function formatTimestamp(isoString: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    // Browser automatically uses user's timezone
  }).format(new Date(isoString));
}

// Option 2: Using date-fns
import { format } from 'date-fns';
const formatted = format(
  new Date(apiResponse.createdAt), 
  'MMM d, yyyy h:mm a'
);

// Option 3: Using dayjs
import dayjs from 'dayjs';
const formatted = dayjs(apiResponse.createdAt)
  .format('MMM D, YYYY h:mm A');`}
            description="new Date() automatically converts UTC to local timezone."
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 3: Filtering */}
      {/* ================================================================== */}
      <div className={cx("mb-20")}>
        <SectionHeading
          title="Filtering by Date"
          description="When users input a date filter, they think in their local timezone. Convert to UTC before querying."
        />

        <FilterDemo />

        <div data-rule-of-thumb-card="true" className={cx("mt-8 p-6 rounded-xl bg-card border border-border")}>
          <h3 className={cx("font-semibold text-foreground mb-3 flex items-center gap-2")}>
            <CalendarBlankIcon size={18} />
            Example: Indonesia (UTC+7)
          </h3>
          <div className={cx("space-y-3 text-sm text-muted-foreground")}>
            <p>
              User in Jakarta selects:{" "}
              <strong className={cx("text-foreground")}>January 1, 2026 at 07:00 AM</strong>
            </p>
            <p>
              This equals in UTC:{" "}
              <strong className={cx("text-foreground")}>January 1, 2026 at 00:00</strong> (midnight)
            </p>
            <p>The backend query should use the UTC value to find records from that moment.</p>
          </div>
        </div>

        <div className={cx("mt-8")}>
          <CodeExample
            title="Converting User Input"
            code={`// User selects date in their local timezone
const userDate = "2026-01-01";
const userTime = "07:00";

// Option 1: Convert to UTC
const localDate = new Date(\`\${userDate}T\${userTime}:00\`);
const utcString = localDate.toISOString();
// Result: "2026-01-01T00:00:00.000Z" (for UTC+7)

// Option 2: Keep local time with offset
const withOffset = \`\${userDate}T\${userTime}:00+07:00\`;
// Result: "2026-01-01T07:00:00+07:00"

// Both represent the same moment in time!
// Send either to backend
fetch('/api/records', {
  params: { startDate: utcString } // or withOffset
});`}
            description="Both formats work — the key is including timezone information."
          />
        </div>

        <div className={cx("mt-8 space-y-4")}>
          <BestPractice
            emoji="⚠️"
            title="Common mistake"
            description="Sending '2026-01-01T07:00:00' without timezone info. The backend might interpret it as UTC, giving wrong results for non-UTC users."
          />
          <BestPractice
            emoji="✅"
            title="Always include timezone information"
            description="Either convert to UTC (with Z suffix: '2026-01-01T00:00:00.000Z') or send with offset ('+07:00'). Both work — the key is the backend knows exactly what moment in time you mean."
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* SECTION 4: Do's and Don'ts */}
      {/* ================================================================== */}
      <div className={cx("mb-20")}>
        <h2 className={cx("text-2xl font-bold text-foreground mb-8")}>Do's and Don'ts</h2>

        <div className={cx("grid sm:grid-cols-2 gap-4")}>
          <div data-rule-of-thumb-card="true" className={cx("p-6 rounded-xl border border-positive/30 bg-positive/10")}>
            <div className={cx("flex items-center gap-2 mb-4")}>
              <CheckIcon size={18} className={cx("text-positive-foreground")} />
              <h3 className={cx("font-semibold text-positive-foreground")}>Do</h3>
            </div>
            <ul className={cx("space-y-3 text-sm text-muted-foreground")}>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-positive-foreground mt-0.5")}>✓</span>
                <span>Store all timestamps as UTC in the database</span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-positive-foreground mt-0.5")}>✓</span>
                <span>Return ISO 8601 strings from API (with Z suffix)</span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-positive-foreground mt-0.5")}>✓</span>
                <span>Let the frontend handle timezone conversion</span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-positive-foreground mt-0.5")}>✓</span>
                <span>Convert user date inputs to UTC before API calls</span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-positive-foreground mt-0.5")}>✓</span>
                <span>Use Intl.DateTimeFormat or date libraries for display</span>
              </li>
            </ul>
          </div>

          <div data-rule-of-thumb-card="true" className={cx("p-6 rounded-xl border border-negative/30 bg-negative/10")}>
            <div className={cx("flex items-center gap-2 mb-4")}>
              <XIcon size={18} className={cx("text-negative-foreground")} />
              <h3 className={cx("font-semibold text-negative-foreground")}>Don't</h3>
            </div>
            <ul className={cx("space-y-3 text-sm text-muted-foreground")}>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-negative-foreground mt-0.5")}>✗</span>
                <span>Store timestamps with timezone offsets in DB</span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-negative-foreground mt-0.5")}>✗</span>
                <span>Convert to user's timezone on the backend</span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-negative-foreground mt-0.5")}>✗</span>
                <span>Send dates without timezone info</span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-negative-foreground mt-0.5")}>✗</span>
                <span>Assume server timezone = user timezone</span>
              </li>
              <li className={cx("flex items-start gap-2")}>
                <span className={cx("text-negative-foreground mt-0.5")}>✗</span>
                <span>Use string manipulation for date math</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className={cx("mb-20")}>
        <div data-rule-of-thumb-card="true" className={cx("p-8 rounded-2xl bg-card border border-border")}>
          <h2 className={cx("text-xl font-bold text-foreground mb-4")}>Quick Reference</h2>
          <div className={cx("space-y-3 text-muted-foreground")}>
            <div className={cx("flex items-start gap-3")}>
              <DatabaseIcon size={18} className={cx("text-foreground mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>Database</strong> — Always store as UTC
              </span>
            </div>
            <div className={cx("flex items-start gap-3")}>
              <HardDrivesIcon size={18} className={cx("text-foreground mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>API</strong> — Return ISO 8601 with Z suffix
              </span>
            </div>
            <div className={cx("flex items-start gap-3")}>
              <DesktopIcon size={18} className={cx("text-foreground mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>Frontend</strong> — new Date() +
                Intl.DateTimeFormat
              </span>
            </div>
            <div className={cx("flex items-start gap-3")}>
              <CalendarBlankIcon size={18} className={cx("text-foreground mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>Filter</strong> — Convert local input to UTC
                before query
              </span>
            </div>
            <div className={cx("flex items-start gap-3")}>
              <GlobeIcon size={18} className={cx("text-foreground mt-0.5 shrink-0")} />
              <span>
                <strong className={cx("text-foreground")}>Rule</strong> — One source of truth (UTC),
                display locally
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
