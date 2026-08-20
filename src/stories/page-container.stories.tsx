import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { PageContainer } from "../components/page-container";

const meta = {
  title: "Layout/PageContainer",
  component: PageContainer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    children: null,
  },
} satisfies Meta<typeof PageContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <PageContainer>
      <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Page heading</h1>
      <p style={{ color: "var(--muted-foreground)", marginTop: 12 }}>
        Content stays centered inside the site&apos;s standard reading width.
      </p>
    </PageContainer>
  ),
};

export const Wide: Story = {
  render: () => (
    <PageContainer maxWidth="4xl">
      <div style={{ display: "grid", gap: 12 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Wide layout</h1>
        <div style={{ border: "1px dashed var(--border)", minHeight: 160 }} />
      </div>
    </PageContainer>
  ),
};
