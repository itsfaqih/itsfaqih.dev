import { createFileRoute } from "@tanstack/react-router";
import { GuidelinePagination } from "./-components/guideline-pagination";
import { GlassyCard } from "../../components/glassy-card";
import { useState } from "react";
import {
  ClockIcon,
  DatabaseIcon,
  GlobeIcon,
  HardDrivesIcon,
  DesktopIcon,
  CalendarBlankIcon,
  ArrowRightIcon,
  CheckIcon,
  XIcon,
} from "@phosphor-icons/react";

import { BestPractice, CodeExample, GuidelineHero, SectionHeading } from "./-components";
import { PageContainer } from "../../components/page-container";

export const Route = createFileRoute("/my-views/handling-timestamps")({
  component: HandlingTimestamps,
});

// ============================================================================
// Interactive Demo: Timezone Display
// ============================================================================

function TimezoneDemo() {
  const [utcTime] = useState(() => new Date().toISOString());
  const [userTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);

  const formatLocal = (isoString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "long",
      timeZone: userTimezone,
    }).format(new Date(isoString));
  };

  const formatUTC = (isoString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "long",
      timeZone: "UTC",
    }).format(new Date(isoString));
  };

  return (
    <GlassyCard className="rounded-2xl overflow-hidden">
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-(--text-secondary) mb-2">
            Stored in Database (UTC)
          </h3>
          <div className="p-4 rounded-lg bg-(--bg-primary)/50 backdrop-blur-sm border border-(--border-color) font-mono text-sm">
            <span className="text-emerald-400">{utcTime}</span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <ArrowRightIcon size={20} className="text-(--text-secondary)" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-(--text-secondary) mb-2">Displayed as UTC</h3>
            <div className="p-4 rounded-lg bg-(--bg-primary)/50 backdrop-blur-sm border border-(--border-color)">
              <p className="text-(--text-primary)">{formatUTC(utcTime)}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-(--text-secondary) mb-2">
              Your Local Time ({userTimezone})
            </h3>
            <div className="p-4 rounded-lg bg-zinc-500/10 border border-(--border-color)">
              <p className="text-(--text-primary)">{formatLocal(utcTime)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-(--border-color) p-4 text-sm text-(--text-secondary)">
        ✓ Same UTC timestamp, displayed in user's local timezone
      </div>
    </GlassyCard>
  );
}

// ============================================================================
// Interactive Demo: Filter Conversion
// ============================================================================

function FilterDemo() {
  const [inputDate, setInputDate] = useState("2026-01-01");
  const [inputTime, setInputTime] = useState("07:00");
  const [userTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);

  const getUTCEquivalent = () => {
    const localDate = new Date(`${inputDate}T${inputTime}:00`);
    return localDate.toISOString();
  };

  const getWithOffset = () => {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const mins = Math.abs(offset % 60);
    const sign = offset <= 0 ? "+" : "-";
    return `${inputDate}T${inputTime}:00${sign}${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  return (
    <GlassyCard className="rounded-2xl overflow-hidden">
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-(--text-secondary) mb-3">
            User inputs filter date ({userTimezone})
          </h3>
          <div className="flex gap-3">
            <input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="px-4 py-2 rounded-lg bg-(--bg-primary)/50 backdrop-blur-sm border border-(--border-color) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
            />
            <input
              type="time"
              value={inputTime}
              onChange={(e) => setInputTime(e.target.value)}
              className="px-4 py-2 rounded-lg bg-(--bg-primary)/50 backdrop-blur-sm border border-(--border-color) text-(--text-primary) focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-(--border-color)" />
          <span className="text-xs text-(--text-secondary)">sent to backend as</span>
          <div className="flex-1 h-px bg-(--border-color)" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-(--text-secondary) mb-2">Option 1: UTC</h3>
            <div className="p-4 rounded-lg bg-zinc-500/10 border border-(--border-color) font-mono text-xs">
              <span className="text-(--text-primary)">{getUTCEquivalent()}</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-(--text-secondary) mb-2">
              Option 2: With Offset
            </h3>
            <div className="p-4 rounded-lg bg-zinc-500/10 border border-(--border-color) font-mono text-xs">
              <span className="text-(--text-primary)">{getWithOffset()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-(--border-color) p-4 text-sm text-(--text-secondary)">
        ✓ Both formats include timezone info — backend knows the exact moment
      </div>
    </GlassyCard>
  );
}

// ============================================================================
// Code Example Component with Syntax Highlighting
// ============================================================================

// ============================================================================
// Flow Step Component
// ============================================================================

function FlowStep({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-zinc-500/10 dark:bg-zinc-500/20 flex items-center justify-center shrink-0">
        <Icon size={20} className="text-(--text-primary)" />
      </div>
      <div>
        <h3 className="font-semibold text-(--text-primary)">{title}</h3>
        <p className="text-sm text-(--text-secondary) mt-1">{description}</p>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

function HandlingTimestamps() {
  return (
    <PageContainer maxWidth="3xl">
      {/* Hero Section */}
      <GuidelineHero
        title="Handling Timestamps"
        description={
          <>
            The timezone problem, solved simply.
            <br />
            <span className="text-(--text-primary) font-medium">Store UTC, display local.</span>
          </>
        }
        badge={{
          icon: ClockIcon,
          text: "Backend Pattern",
        }}
        markdownUrl="/my-views/handling-timestamps.md"
      />

      {/* ================================================================== */}
      {/* SECTION 1: The Flow */}
      {/* ================================================================== */}
      <div className="mb-20">
        <SectionHeading
          title="The Timestamp Flow"
          description="A simple, consistent approach that works across all timezones."
        />

        <div className="space-y-6 mb-8">
          <FlowStep
            icon={DatabaseIcon}
            title="Store as UTC in Database"
            description="Always store timestamps in UTC (Coordinated Universal Time). No timezone offset, no ambiguity."
          />
          <div className="ml-5 border-l-2 border-dashed border-(--border-color) h-6" />
          <FlowStep
            icon={HardDrivesIcon}
            title="Return UTC from Backend"
            description="API responses should return timestamps in ISO 8601 format with UTC timezone (e.g., 2026-01-10T06:00:00.000Z)."
          />
          <div className="ml-5 border-l-2 border-dashed border-(--border-color) h-6" />
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
      <div className="mb-20">
        <SectionHeading
          title="Displaying Timestamps"
          description="Store one UTC value, display it in the user's local timezone."
        />

        <TimezoneDemo />

        <div className="mt-8">
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
      <div className="mb-20">
        <SectionHeading
          title="Filtering by Date"
          description="When users input a date filter, they think in their local timezone. Convert to UTC before querying."
        />

        <FilterDemo />

        <div className="mt-8 p-6 rounded-xl bg-(--bg-secondary) border border-(--border-color)">
          <h3 className="font-semibold text-(--text-primary) mb-3 flex items-center gap-2">
            <CalendarBlankIcon size={18} />
            Example: Indonesia (UTC+7)
          </h3>
          <div className="space-y-3 text-sm text-(--text-secondary)">
            <p>
              User in Jakarta selects:{" "}
              <strong className="text-(--text-primary)">January 1, 2026 at 07:00 AM</strong>
            </p>
            <p>
              This equals in UTC:{" "}
              <strong className="text-(--text-primary)">January 1, 2026 at 00:00</strong> (midnight)
            </p>
            <p>The backend query should use the UTC value to find records from that moment.</p>
          </div>
        </div>

        <div className="mt-8">
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

        <div className="mt-8 space-y-4">
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
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-(--text-primary) mb-8">Do's and Don'ts</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-4">
              <CheckIcon size={18} className="text-emerald-400" />
              <h3 className="font-semibold text-emerald-400">Do</h3>
            </div>
            <ul className="space-y-3 text-sm text-(--text-secondary)">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Store all timestamps as UTC in the database</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Return ISO 8601 strings from API (with Z suffix)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Let the frontend handle timezone conversion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Convert user date inputs to UTC before API calls</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Use Intl.DateTimeFormat or date libraries for display</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-2 mb-4">
              <XIcon size={18} className="text-red-400" />
              <h3 className="font-semibold text-red-400">Don't</h3>
            </div>
            <ul className="space-y-3 text-sm text-(--text-secondary)">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✗</span>
                <span>Store timestamps with timezone offsets in DB</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✗</span>
                <span>Convert to user's timezone on the backend</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✗</span>
                <span>Send dates without timezone info</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✗</span>
                <span>Assume server timezone = user timezone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✗</span>
                <span>Use string manipulation for date math</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-20">
        <div className="p-8 rounded-2xl bg-(--bg-secondary) border border-(--border-color)">
          <h2 className="text-xl font-bold text-(--text-primary) mb-4">Quick Reference</h2>
          <div className="space-y-3 text-(--text-secondary)">
            <div className="flex items-start gap-3">
              <DatabaseIcon size={18} className="text-(--text-primary) mt-0.5 shrink-0" />
              <span>
                <strong className="text-(--text-primary)">Database</strong> — Always store as UTC
              </span>
            </div>
            <div className="flex items-start gap-3">
              <HardDrivesIcon size={18} className="text-(--text-primary) mt-0.5 shrink-0" />
              <span>
                <strong className="text-(--text-primary)">API</strong> — Return ISO 8601 with Z
                suffix
              </span>
            </div>
            <div className="flex items-start gap-3">
              <DesktopIcon size={18} className="text-(--text-primary) mt-0.5 shrink-0" />
              <span>
                <strong className="text-(--text-primary)">Frontend</strong> — new Date() +
                Intl.DateTimeFormat
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CalendarBlankIcon size={18} className="text-(--text-primary) mt-0.5 shrink-0" />
              <span>
                <strong className="text-(--text-primary)">Filter</strong> — Convert local input to
                UTC before query
              </span>
            </div>
            <div className="flex items-start gap-3">
              <GlobeIcon size={18} className="text-(--text-primary) mt-0.5 shrink-0" />
              <span>
                <strong className="text-(--text-primary)">Rule</strong> — One source of truth (UTC),
                display locally
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <GuidelinePagination />
    </PageContainer>
  );
}
