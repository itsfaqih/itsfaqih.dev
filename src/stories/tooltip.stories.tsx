import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Button } from "../components/button";
import { SimpleTooltip } from "../components/tooltip";

const meta = {
  title: "Components/SimpleTooltip",
  component: SimpleTooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    children: <Button variant="secondary-neutral">Trigger</Button>,
    content: "Tooltip content",
  },
} satisfies Meta<typeof SimpleTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SimpleTooltip content="A small explanation for this control">
      <Button variant="secondary-neutral">Hover or focus me</Button>
    </SimpleTooltip>
  ),
};

export const Bottom: Story = {
  render: () => (
    <SimpleTooltip content="The tooltip can open below its trigger" side="bottom">
      <Button variant="tertiary-brand">Bottom tooltip</Button>
    </SimpleTooltip>
  ),
};
