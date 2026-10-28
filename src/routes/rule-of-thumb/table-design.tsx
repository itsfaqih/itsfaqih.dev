import { createFileRoute } from "@tanstack/react-router";
import { ruleHead } from "./-components";
import { TableDesign } from "./-table-design-page";

export const Route = createFileRoute("/rule-of-thumb/table-design")({
  component: TableDesign,
  head: () => ruleHead("table-design"),
});
