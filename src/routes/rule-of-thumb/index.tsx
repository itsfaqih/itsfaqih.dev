import * as stylex from "@stylexjs/stylex";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { TOPICS, VISIBLE_GUIDELINES as RULES } from "../../data/guidelines";
import { Backdrop } from "../-components/backdrop";
import { heroType } from "../-components/hero-type";
import { RuleSelect } from "../-components/rule-select";
import { useCutIns } from "../-components/use-cut-ins";
import { pageHead } from "../../seo";
import { veil } from "../-components/section";

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

function RuleOfThumbsIndex() {
  const rootRef = useRef<HTMLDivElement>(null);
  useCutIns(rootRef);

  return (
    <div ref={rootRef} className="arc arc-scan">
      <Backdrop />
      <div className="arc-wrap">
        <div {...stylex.props(styles.head)}>
          <div {...stylex.props(veil.dense, veil.fit, heroType.tag)} data-cut>
            {RULES.length} rules · {TOPICS.length} topics
          </div>
          <h1 data-cut {...stylex.props(veil.soft, veil.fit, heroType.title, styles.title)}>
            Rule of Thumb
          </h1>
          <p data-cut {...stylex.props(veil.soft, veil.fit, styles.lede)}>
            {LEDE}
          </p>
        </div>
        <div {...stylex.props(styles.body)}>
          <RuleSelect rules={RULES} />
        </div>
      </div>
    </div>
  );
}

const styles = stylex.create({
  head: {
    paddingTop: "48px",
    paddingBottom: "32px",
  },
  title: {
    marginBottom: "14px",
  },
  lede: {
    maxWidth: "34em",
    fontSize: "18px",
  },
  body: {
    paddingBottom: "96px",
  },
});
