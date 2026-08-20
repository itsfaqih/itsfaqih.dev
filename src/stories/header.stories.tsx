import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Header } from "../components/header";
import { tanstackRouterParameters } from "./story-support";

const meta = {
  title: "Layout/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    ...tanstackRouterParameters,
    layout: "fullscreen",
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ minHeight: 220 }}>
      <Header />
      <main style={{ padding: "48px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--muted-foreground)" }}>
          The header combines navigation, social links, search, and theme controls.
        </p>
      </main>
    </div>
  ),
};
