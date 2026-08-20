import { ArrowRightIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Card } from "../components/card";
import { Showcase } from "./story-support";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Card",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Showcase style={{ width: 360 }}>
      <Card>
        <div style={{ display: "grid", gap: 8, padding: 24 }}>
          <strong>Card content</strong>
          <span style={{ color: "var(--muted-foreground)" }}>
            A surface for grouping related content.
          </span>
        </div>
      </Card>
    </Showcase>
  ),
};

export const WithoutHoverEffect: Story = {
  render: () => (
    <Showcase style={{ width: 360 }}>
      <Card hoverEffect={false}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 24 }}>
          <span style={{ flex: 1 }}>Static card surface</span>
          <ArrowRightIcon size={18} />
        </div>
      </Card>
    </Showcase>
  ),
};

export const AsButton: Story = {
  render: () => (
    <Showcase style={{ width: 360 }}>
      <Card as="button" type="button" onClick={() => undefined}>
        <div style={{ padding: 24, textAlign: "left" }}>Card rendered as a button</div>
      </Card>
    </Showcase>
  ),
};
