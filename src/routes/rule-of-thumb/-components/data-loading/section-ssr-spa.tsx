import { cx } from "@/stylex";
import { HardDrivesIcon, GlobeIcon } from "@phosphor-icons/react";
import { BestPractice, SectionHeading } from "../index";
import { SectionCard } from "./section-card";

export function SSRVsSpaSection() {
  return (
    <>
{/* ================================================================== */}
      {/* SECTION 1: SSR vs SPA Decision */}
      {/* ================================================================== */}
      <div className={cx("mb-20")}>
        <SectionHeading
          title="SSR vs SPA"
          description="Choose the right rendering strategy based on your requirements."
        />

        <div className={cx("grid sm:grid-cols-2 gap-4 mb-8")}>
          <SectionCard icon={HardDrivesIcon} title="Server-Side Rendering">
            <p>
              <strong className={cx("text-foreground")}>Use when:</strong>
            </p>
            <ul className={cx("list-disc list-inside space-y-1 mt-2")}>
              <li>SEO is critical (crawlers need content)</li>
              <li>First contentful paint matters</li>
              <li>Data is mostly static or cacheable</li>
              <li>Users have slow devices</li>
            </ul>
          </SectionCard>

          <SectionCard icon={GlobeIcon} title="Single Page App">
            <p>
              <strong className={cx("text-foreground")}>Use when:</strong>
            </p>
            <ul className={cx("list-disc list-inside space-y-1 mt-2")}>
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
    </>
  );
}
