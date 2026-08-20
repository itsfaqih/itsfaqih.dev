import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Cursor } from "../components/cursor";
import { Showcase } from "./story-support";

const meta = {
  title: "Components/Cursor",
  component: Cursor,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: {
      control: { type: "range", min: 12, max: 48, step: 2 },
    },
  },
} satisfies Meta<typeof Cursor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 24,
  },
  render: (args) => (
    <Showcase>
      <Cursor {...args} />
    </Showcase>
  ),
};

export const Large: Story = {
  args: {
    size: 42,
  },
  render: (args) => (
    <Showcase>
      <Cursor {...args} />
    </Showcase>
  ),
};
