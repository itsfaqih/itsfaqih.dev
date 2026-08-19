import { createFileRoute } from "@tanstack/react-router";
import { DataLoadingPage } from "./-components/data-loading/data-loading-page";

export const Route = createFileRoute("/rule-of-thumb/data-loading")({
  component: DataLoadingPage,
});
