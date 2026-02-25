import type { CSSProperties, ReactNode } from "react";

export type LinkMetadata = {
  title: string;
  description: string;
  image: ReactNode;
};

export type PopupContentProps = {
  href: string;
};

export type ExternalLinkProps = {
  href: string;
  children: ReactNode;
};

export type ScrambleTextProps = {
  finalText: string;
  renderedText: string;
};

export type ScrambleTextSegment = {
  final: string;
  rendered: string;
  isWhitespace: boolean;
};

export type TechTag =
  | "react"
  | "typescript"
  | "tailwindcss"
  | "postgresql"
  | "aws"
  | "express"
  | "mongodb"
  | "laravel"
  | "vue"
  | "php"
  | "figma";

export type MissionStatus = "completed" | "in-progress";
export type TechInventoryCategory =
  | "Frontend"
  | "Backend"
  | "DevOps"
  | "Design Tools";
export type TechSlotZone = "inventory" | "hotbar";
export type TechDragSource = { zone: TechSlotZone; index: number };

export type ExperienceItem = {
  title: string;
  subtitle: string;
  date: string;
  status: MissionStatus;
  description: readonly string[];
  tags: readonly TechTag[];
};

export type TechStackItem = {
  name: string;
  icon: string;
  color: string;
  category: TechInventoryCategory;
};

export type TechSlotsState = {
  inventory: Array<TechStackItem | null>;
  hotbar: Array<TechStackItem | null>;
};

export type TechPreviewPayload = {
  name: string;
  usedIn: readonly string[];
};

export type TechSlotStateProps = {
  index: number;
  item: TechStackItem | null;
  isDragOrigin: boolean;
  isDropTarget: boolean;
  isDraggingTechItem: boolean;
};

export type TechSlotBaseProps = TechSlotStateProps & {
  zone: TechSlotZone;
  className: string;
  style?: CSSProperties;
  emptyLabel: ReactNode;
  emptyClassName: string;
};
