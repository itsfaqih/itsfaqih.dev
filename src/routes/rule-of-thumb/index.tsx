import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { GUIDELINES } from "../../data/guidelines";
import { Backdrop } from "../-components/backdrop";
import { RuleSelect } from "../-components/rule-select";
import { useCutIns } from "../-components/use-cut-ins";
import { pageHead } from "../../seo";

const LEDE =
  "Opinions, guidelines, and patterns I've adopted for building web applications. Many come with demos you can try.";

export const Route = createFileRoute("/rule-of-thumb/")({
  component: RuleOfThumbsIndex,
  head: () =>
    pageHead({
      path: "/rule-of-thumb",
      title: "Rule of Thumb: Guidelines for Building Web Apps",
      description: LEDE,
      type: "website",
    }),
});

const RULES = GUIDELINES.filter((guideline) => !guideline.hidden);

function RuleOfThumbsIndex() {
  const rootRef = useRef<HTMLDivElement>(null);
  useCutIns(rootRef);

  return (
    <div ref={rootRef} className="arc arc-scan">
      <Backdrop />
      <div className="arc-wrap">
        <div className="index-head">
          <div className="tag" data-cut>
            {RULES.length} rules · {new Set(RULES.map((rule) => rule.label)).size} topics
          </div>
          <h1 data-cut>Rule of Thumb</h1>
          <p data-cut>{LEDE}</p>
        </div>
        <div className="index-body">
          <RuleSelect rules={RULES} />
        </div>
      </div>
    </div>
  );
}
