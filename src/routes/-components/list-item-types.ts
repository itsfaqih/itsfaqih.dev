import type { TechTag } from "./tech-tag";

export type ListItemProps = {
  title: string;
  subtitle?: string;
  date?: string;
  tags?: TechTag[];
  href?: string;
  isExternal?: boolean;
  description?: string;
};

export type ProjectListItem = ListItemProps & {
  id: string;
};
