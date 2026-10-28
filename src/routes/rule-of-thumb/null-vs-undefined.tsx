import { createFileRoute } from "@tanstack/react-router";
import { NullVsUndefined } from "./-null-vs-undefined-page";

export const Route = createFileRoute("/rule-of-thumb/null-vs-undefined")({
  component: NullVsUndefined,
});
