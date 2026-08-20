import { ArrowRightIcon, CheckIcon, PlusIcon } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { fn } from "storybook/test";

import { Button } from "../components/button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Button",
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "neutral",
        "brand",
        "destructive",
        "tertiary-neutral",
        "tertiary-brand",
        "tertiary-destructive",
        "secondary-brand",
        "secondary-neutral",
        "secondary-destructive",
      ],
    },
    padding: {
      control: "select",
      options: ["default", "leading", "trailing", "compact"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Brand: Story = {
  args: {
    variant: "brand",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
};

export const WithLeadingIcon: Story = {
  args: {
    variant: "secondary-neutral",
    leadingIcon: <PlusIcon size={16} />,
    children: "Add project",
  },
};

export const WithTrailingIcon: Story = {
  args: {
    variant: "secondary-brand",
    trailingIcon: <ArrowRightIcon size={16} />,
    children: "Continue",
  },
};

export const Pending: Story = {
  args: {
    variant: "brand",
    isPending: true,
    children: "Saving…",
  },
};

export const IconOnly: Story = {
  args: {
    "aria-label": "Mark as complete",
    padding: "compact",
    children: <CheckIcon size={16} />,
  },
};
