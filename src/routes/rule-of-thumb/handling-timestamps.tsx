import { createFileRoute } from "@tanstack/react-router";
import { ruleHead } from "./-components";
import { HandlingTimestamps } from "./-handling-timestamps-page";

export const Route = createFileRoute("/rule-of-thumb/handling-timestamps")({
  component: HandlingTimestamps,
  head: () => ruleHead("handling-timestamps"),
});
