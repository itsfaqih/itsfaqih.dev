import { createFileRoute } from "@tanstack/react-router";
import { ruleHead } from "./-components";
import { ButtonDesign } from "./-button-design-page";

export const Route = createFileRoute("/rule-of-thumb/button-design")({
  component: ButtonDesign,
  head: () => ruleHead("button-design"),
});
