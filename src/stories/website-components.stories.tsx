import type { Meta, StoryObj } from "@storybook/tanstack-react";

import { Counter } from "../content/blog/counter";
import { TableOfContents } from "../routes/blog/-components/table-of-contents";
import { Showcase } from "./story-support";

const meta = {
  title: "Website Components",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const TableOfContentsStory: Story = {
  name: "Table of contents",
  render: () => (
    <Showcase style={{ display: "grid", gap: 32, gridTemplateColumns: "180px 1fr", width: 680 }}>
      <TableOfContents />
      <article>
        <h2 id="overview">Overview</h2>
        <p style={{ color: "var(--muted-foreground)", margin: "8px 0 32px" }}>
          A page outline is discovered from the headings in the current document.
        </p>
        <h3 id="details">Details</h3>
        <p style={{ color: "var(--muted-foreground)", marginTop: 8 }}>
          Selecting a heading updates the active item.
        </p>
      </article>
    </Showcase>
  ),
};

export const CounterStory: Story = {
  name: "Blog counter",
  render: () => (
    <Showcase>
      <Counter />
    </Showcase>
  ),
};
