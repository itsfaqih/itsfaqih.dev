import type { Meta, StoryObj } from "@storybook/tanstack-react";
import type { ReactNode } from "react";

import { ButtonDesignThumbnail } from "../components/thumbnails/button-design-thumbnail";
import { DataLoadingThumbnail } from "../components/thumbnails/data-loading-thumbnail";
import { DialogDesignThumbnail } from "../components/thumbnails/dialog-design-thumbnail";
import { HandlingTimestampsThumbnail } from "../components/thumbnails/handling-timestamps-thumbnail";
import { NullVsUndefinedThumbnail } from "../components/thumbnails/null-vs-undefined-thumbnail";
import { ProximityPrincipleThumbnail } from "../components/thumbnails/proximity-principle-thumbnail";
import { TableDesignThumbnail } from "../components/thumbnails/table-design-thumbnail";
import { TypeScriptGuidelinesThumbnail } from "../components/thumbnails/typescript-guidelines-thumbnail";
import { TableDesignGridLines } from "../components/thumbnails/table-design-grid-lines";
import { TableDesignIllustration } from "../components/thumbnails/table-design-illustration";
import { Showcase } from "./story-support";

const meta = {
  title: "Components/Thumbnails",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function ThumbnailFrame({ children }: { children: ReactNode }) {
  return (
    <Showcase style={{ height: 220, padding: 0, position: "relative", width: 360 }}>
      {children}
    </Showcase>
  );
}

export const ButtonDesign: Story = {
  render: () => (
    <ThumbnailFrame>
      <ButtonDesignThumbnail />
    </ThumbnailFrame>
  ),
};

export const DataLoading: Story = {
  render: () => (
    <ThumbnailFrame>
      <DataLoadingThumbnail />
    </ThumbnailFrame>
  ),
};

export const DialogDesign: Story = {
  render: () => (
    <ThumbnailFrame>
      <DialogDesignThumbnail />
    </ThumbnailFrame>
  ),
};

export const HandlingTimestamps: Story = {
  render: () => (
    <ThumbnailFrame>
      <HandlingTimestampsThumbnail />
    </ThumbnailFrame>
  ),
};

export const NullVsUndefined: Story = {
  render: () => (
    <ThumbnailFrame>
      <NullVsUndefinedThumbnail />
    </ThumbnailFrame>
  ),
};

export const ProximityPrinciple: Story = {
  render: () => (
    <ThumbnailFrame>
      <ProximityPrincipleThumbnail />
    </ThumbnailFrame>
  ),
};

export const TableDesign: Story = {
  render: () => (
    <ThumbnailFrame>
      <TableDesignThumbnail />
    </ThumbnailFrame>
  ),
};

export const TypeScriptGuidelines: Story = {
  render: () => (
    <ThumbnailFrame>
      <TypeScriptGuidelinesThumbnail />
    </ThumbnailFrame>
  ),
};

export const TableDesignGrid: Story = {
  render: () => (
    <ThumbnailFrame>
      <svg viewBox="0 0 160 100" style={{ width: "100%", height: "100%" }}>
        <TableDesignGridLines />
      </svg>
    </ThumbnailFrame>
  ),
};

export const TableIllustration: Story = {
  render: () => (
    <ThumbnailFrame>
      <svg viewBox="0 0 160 100" style={{ width: "100%", height: "100%" }}>
        <TableDesignIllustration />
      </svg>
    </ThumbnailFrame>
  ),
};
