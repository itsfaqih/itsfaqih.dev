import { createFileRoute } from "@tanstack/react-router";
import { ButtonDesignPage } from "./-components/button-design/button-design-page";

export const Route = createFileRoute("/rule-of-thumb/button-design")({
  component: ButtonDesignPage,
});
