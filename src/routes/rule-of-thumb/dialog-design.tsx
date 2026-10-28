import { createFileRoute } from "@tanstack/react-router";
import { DialogDesign } from "./-dialog-design-page";

export const Route = createFileRoute("/rule-of-thumb/dialog-design")({
  component: DialogDesign,
});
