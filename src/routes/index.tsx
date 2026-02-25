import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "./index/-home-page";

export const Route = createFileRoute("/")({
  component: HomePage,
});
