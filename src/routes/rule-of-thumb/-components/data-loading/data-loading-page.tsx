import { cx } from "@/stylex";
import { PageContainer } from "../../../../components/page-container";
import { RuleOfThumbPagination } from "../rule-of-thumb-pagination";
import { RuleOfThumbHero } from "../index";
import { CachePersistenceSection } from "./section-cache-persistence";
import { DataLoadingSummary } from "./summary-section";
import { DataParsingSection } from "./section-data-parsing";
import { ErrorHandlingSection } from "./section-error-handling";
import { RealtimeSection } from "./section-realtime";
import { SpinDelaySection } from "./section-spin-delay";
import { SSRVsSpaSection } from "./section-ssr-spa";
import { StaleWhileRevalidateSection } from "./section-stale-while-revalidate";
import { TriggerFetchingSection } from "./section-trigger-fetching";

export function DataLoadingPage() {
  return (
    <PageContainer maxWidth="3xl" className="rule-of-thumb-page">
      <RuleOfThumbHero
        title="Data Loading"
        description={
          <>
            Strategies for fast, reliable data fetching.
            <br />
            <span className={cx("text-foreground font-medium")}>Fast first paint, smooth updates.</span>
          </>
        }
        badge={{ text: "Architecture" }}
        markdownUrl="/rule-of-thumb/data-loading.md"
      />
      <SSRVsSpaSection />
      <TriggerFetchingSection />
      <StaleWhileRevalidateSection />
      <SpinDelaySection />
      <ErrorHandlingSection />
      <RealtimeSection />
      <CachePersistenceSection />
      <DataParsingSection />
      <DataLoadingSummary />
      <RuleOfThumbPagination />
    </PageContainer>
  );
}
