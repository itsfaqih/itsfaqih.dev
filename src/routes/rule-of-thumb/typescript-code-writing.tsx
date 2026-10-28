import { createFileRoute } from "@tanstack/react-router";
import { TypeScriptCodeWriting } from "./-typescript-code-writing-page";

export const Route = createFileRoute("/rule-of-thumb/typescript-code-writing")({
  component: TypeScriptCodeWriting,
});
