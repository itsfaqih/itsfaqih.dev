import { createFileRoute } from "@tanstack/react-router";
import { TableDesign } from "./-table-design-page";

export const Route = createFileRoute("/rule-of-thumb/table-design")({
  component: TableDesign,
});
