import { createFileRoute } from "@tanstack/react-router";
import { ProximityPrinciple } from "./-proximity-principle-page";

export const Route = createFileRoute("/rule-of-thumb/proximity-principle")({
  component: ProximityPrinciple,
});
