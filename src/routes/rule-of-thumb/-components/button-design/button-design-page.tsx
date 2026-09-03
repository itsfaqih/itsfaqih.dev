import { cx } from "@/stylex";
import { PageContainer } from "../../../../components/page-container";
import { RuleOfThumbPagination } from "../rule-of-thumb-pagination";
import { RuleOfThumbHero } from "../index";
import { InteractiveButtonDemo } from "./interactive-button-demo";
import { InteractiveDisabledDemo } from "./interactive-disabled-demo";
import { InteractiveStateCode } from "./interactive-state-code";
import { EssentialButtonStates } from "./essential-button-states";
import { ButtonVariantsSection } from "./button-variants-section";
import { ButtonBestPractices } from "./button-best-practices";
import { WhyButtonStatesMatter } from "./why-button-states-matter";

export function ButtonDesignPage() {
  return (
    <PageContainer maxWidth="3xl" className="rule-of-thumb-page">
      <RuleOfThumbHero
        title="Button Design"
        description={
          <>
            The details that make buttons feel tangible and responsive.
            <br />
            <span className={cx("text-foreground font-medium")}>Don't settle for browser defaults.</span>
          </>
        }
        badge={{ text: "UX Design" }}
        markdownUrl="/rule-of-thumb/button-design.md"
      />

      <div className={cx("mb-16")}>
        <InteractiveButtonDemo />
      </div>

      <EssentialButtonStates />

      <div className={cx("mb-20")}>
        <h2 className={cx("text-2xl font-bold text-foreground text-center mb-8")}>Disabled State UX</h2>
        <InteractiveDisabledDemo />
      </div>

      <div className={cx("mb-20")}>
        <h2 className={cx("text-2xl font-bold text-foreground text-center mb-4")}>
          Button States Implementation
        </h2>
        <p className={cx("text-muted-foreground text-center mb-8 max-w-2xl mx-auto")}>
          Click on each state to see which parts of the code handle it. A complete button should
          handle all five states in a single, unified component.
        </p>
        <InteractiveStateCode />
      </div>

      <ButtonVariantsSection />
      <ButtonBestPractices />
      <WhyButtonStatesMatter />
      <RuleOfThumbPagination />
    </PageContainer>
  );
}
