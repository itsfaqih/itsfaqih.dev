import { createFileRoute } from "@tanstack/react-router";
import { ruleHead } from "./-components";
import { TypeScriptCodeWriting } from "./-typescript-code-writing-page";

export const Route = createFileRoute("/rule-of-thumb/typescript-code-writing")({
  component: TypeScriptCodeWriting,
  head: () => ruleHead("typescript-code-writing"),
});
