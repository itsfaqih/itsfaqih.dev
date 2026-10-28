import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { CommandPalette } from "../components/command-palette";
import { Showcase, tanstackRouterParameters } from "./story-support";

const meta = {
  title: "Components/CommandPalette",
  component: CommandPalette,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InteractivePalette: Story = {
  parameters: {
    ...tanstackRouterParameters,
  },
  render: () => (
    <Showcase style={{ minHeight: 180 }}>
      <p style={{ color: "var(--muted-foreground)", marginBottom: 16 }}>
        Press ⌘K to open the real command palette.
      </p>
      <CommandPalette />
    </Showcase>
  ),
};
