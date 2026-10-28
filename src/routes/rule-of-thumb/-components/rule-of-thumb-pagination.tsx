import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { colorOf, ruleNumber, VISIBLE_GUIDELINES } from "../../../data/guidelines";
import type { Guideline } from "../../../data/guidelines";
import { RuleThumb } from "../../-components/rule-art";
import { useCurrentRule } from "./index";

export function RuleOfThumbPagination() {
  const current = useCurrentRule();
  const currentIndex = current ? VISIBLE_GUIDELINES.indexOf(current) : -1;

  if (currentIndex === -1) return null;

  const prevGuideline = VISIBLE_GUIDELINES[currentIndex - 1];
  const nextGuideline = VISIBLE_GUIDELINES[currentIndex + 1];

  return (
    <nav className="arc rot-pager" aria-label="More rules">
      {prevGuideline ? <PagerCard rule={prevGuideline} direction="Previous" /> : <div />}
      {nextGuideline ? (
        <PagerCard rule={nextGuideline} direction="Next" />
      ) : (
        <Link to="/rule-of-thumb" className="rot-card rot-all">
          <span className="d">That's every rule so far</span>
          <span className="t">Back to all rules →</span>
        </Link>
      )}
    </nav>
  );
}

function PagerCard({ rule, direction }: { rule: Guideline; direction: "Previous" | "Next" }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={rule.href}
      preload="intent"
      className={direction === "Next" ? "rot-card next" : "rot-card"}
      style={{ "--c": colorOf(rule.label) }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <RuleThumb rule={rule} play={hovered} />
      <span className="meta">
        <span className="d">{direction === "Next" ? "Next rule →" : "← Previous rule"}</span>
        <span className="n">
          No.{ruleNumber(rule)} · {rule.label}
        </span>
        <span className="t">{rule.title}</span>
      </span>
    </Link>
  );
}
