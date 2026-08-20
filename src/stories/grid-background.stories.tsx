import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { GridBackground } from "../components/grid-background";
import { Showcase } from "./story-support";

const meta = {
  title: "Components/GridBackground",
  component: GridBackground,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof GridBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Showcase style={{ height: 520, overflow: "hidden", padding: 0, position: "relative" }}>
      <GridBackground />
      <div style={{ position: "relative", zIndex: 1, padding: 48 }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700 }}>Grid background</h1>
        <p style={{ color: "var(--muted-foreground)", marginTop: 8 }}>
          The animated architectural grid used behind the homepage.
        </p>
      </div>
    </Showcase>
  ),
};
