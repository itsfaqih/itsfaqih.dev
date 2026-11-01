import * as stylex from "@stylexjs/stylex";
import { useRef } from "react";
import { TOPICS, VISIBLE_GUIDELINES as RULES } from "../data/guidelines";
import { Backdrop } from "../sections/backdrop";
import { heroType } from "../sections/hero-type";
import { RuleSelect } from "../sections/rule-select";
import { useCutIns } from "../sections/use-cut-ins";
import { veil } from "../sections/section";
import { loadIn } from "../components/load-in";
import { arcade } from "../components/arcade";

export const RULE_INDEX_LEDE =
  "Rules I follow when building web apps. Many have demos you can try.";

/** The rule index. Zooming back out of a rule lands it at rest (see head-script.ts). */
export function RuleIndex() {
  const rootRef = useRef<HTMLDivElement>(null);
  useCutIns(rootRef);

  return (
    <div ref={rootRef} className={`arc ${stylex.props(arcade.root, arcade.scan).className}`}>
      <Backdrop tide />
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
              {RULE_INDEX_LEDE}
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
