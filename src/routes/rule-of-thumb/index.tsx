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
import { loadIn } from "../../components/load-in";
import { arcade } from "../../components/arcade";

const LEDE = "Rules I follow when building web apps. Many have demos you can try.";

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
    <div ref={rootRef} className={`arc ${stylex.props(arcade.root, arcade.scan).className}`}>
      <Backdrop />
      <div {...stylex.props(arcade.wrap)}>
        <div {...stylex.props(styles.head)}>
          <div {...stylex.props(loadIn.veil, veil.dense, veil.fit, heroType.tag)} data-cut>
            <span {...stylex.props(loadIn.piece, loadIn.words)} data-cut>
              {RULES.length} rules · {TOPICS.length} topics
            </span>
          </div>
          <h1
            data-cut
            {...stylex.props(loadIn.veil, veil.soft, veil.fit, heroType.title, styles.title)}
          >
            <span {...stylex.props(loadIn.piece, loadIn.words)} data-cut>
              Rule of Thumb
            </span>
          </h1>
          <p data-cut {...stylex.props(loadIn.veil, veil.soft, veil.fit, styles.lede)}>
            <span {...stylex.props(loadIn.piece, loadIn.words)} data-cut>
              {LEDE}
            </span>
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
