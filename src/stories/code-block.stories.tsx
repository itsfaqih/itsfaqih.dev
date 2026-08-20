import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { CodeBlock } from "../components/code-block";
import { Showcase } from "./story-support";

const exampleCode = `function greet(name: string) {
  return \`Hello, \${name}!\`;
}`;

const meta = {
  title: "Components/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    code: exampleCode,
    lang: "tsx",
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypeScript: Story = {
  render: (args) => (
    <Showcase style={{ width: 560 }}>
      <CodeBlock {...args} />
    </Showcase>
  ),
};

export const JSON: Story = {
  args: {
    lang: "json",
    code: `{"name":"Faqih","role":"Frontend Engineer"}`,
  },
  render: (args) => (
    <Showcase style={{ width: 560 }}>
      <CodeBlock {...args} />
    </Showcase>
  ),
};
