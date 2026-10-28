import { createFileRoute } from "@tanstack/react-router";
import { ruleHead } from "./-components";
import { ProximityPrinciple } from "./-proximity-principle-page";

export const Route = createFileRoute("/rule-of-thumb/proximity-principle")({
  component: ProximityPrinciple,
  head: () => ruleHead("proximity-principle"),
});
