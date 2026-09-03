import { cx } from "@/stylex";
import { PageContainer } from "../../components/page-container";
import { RuleOfThumbPagination } from "./-components/rule-of-thumb-pagination";
import { RuleOfThumbHero } from "./-components";
import { AbstractionSection } from "./-proximity-principle-abstraction-section";
import { CorePrinciplesSection } from "./-proximity-principle-core-section";
import { ExtractOnlyWhenReusedSection } from "./-proximity-principle-extract-section";
import { FileOrganizationSection } from "./-proximity-principle-file-organization-section";
import { FileSuffixesSection } from "./-proximity-principle-file-suffixes-section";
import { FrameworkRulesSection } from "./-proximity-principle-framework-rules-section";
import { GlobalCodeSection } from "./-proximity-principle-global-code-section";
import { LowestCommonAncestorSection } from "./-proximity-principle-lowest-common-ancestor-section";
import { QuickReferenceSection } from "./-proximity-principle-quick-reference-section";
import { StateIsolationSection } from "./-proximity-principle-state-section";
import { WhyThisMattersSection } from "./-proximity-principle-why-this-matters-section";

export function ProximityPrinciple() {
  return (
    <PageContainer maxWidth="3xl" className="rule-of-thumb-page">
      <RuleOfThumbHero
        title="The Proximity Principle"
        description={
          <>
            A visual guide to structuring code and files.
            <br />
            <span className={cx("text-foreground font-medium")}>Less jumping, more shipping.</span>
          </>
        }
        badge={{
          text: "Code Writing",
        }}
        markdownUrl="/rule-of-thumb/proximity-principle.md"
      />

      <CorePrinciplesSection />
      <AbstractionSection />
      <StateIsolationSection />
      <FileOrganizationSection />
      <ExtractOnlyWhenReusedSection />
      <LowestCommonAncestorSection />
      <GlobalCodeSection />
      <FrameworkRulesSection />
      <FileSuffixesSection />
      <QuickReferenceSection />
      <WhyThisMattersSection />

      <RuleOfThumbPagination />
    </PageContainer>
  );
}
