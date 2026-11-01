import type { Meta, StoryObj } from "@storybook/react-vite";

import { Header } from "../components/header";

const meta = {
  title: "Layout/Header",
  component: Header,
  tags: ["autodocs"],
  args: { path: "/" },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ minHeight: 220 }}>
      <Header {...args} />
      <main style={{ padding: "120px 24px 48px", textAlign: "center" }}>
        <p style={{ color: "var(--muted-foreground)" }}>
          The header combines navigation, social links, search, and theme controls.
        </p>
      </main>
    </div>
  ),
};
