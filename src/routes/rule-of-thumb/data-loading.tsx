import { createFileRoute } from "@tanstack/react-router";
import { DataLoading } from "./-data-loading-page";

export const Route = createFileRoute("/rule-of-thumb/data-loading")({
  component: DataLoading,
});
