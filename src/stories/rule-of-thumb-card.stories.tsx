import type { Meta, StoryObj } from "@storybook/tanstack-react";

import type { RuleOfThumb } from "../components/rule-of-thumb-card";
import { RuleOfThumbCard } from "../components/rule-of-thumb-card";
import { tanstackRouterParameters } from "./story-support";

const buttonRule: RuleOfThumb = {
  id: "button-design",
  label: "Interface design",
  title: "Button design",
  description: "Build buttons that communicate hierarchy and state.",
  href: "/rule-of-thumb/button-design",
};

const comingSoonRule: RuleOfThumb = {
  id: "future-guideline",
  label: "Coming soon",
  title: "A future guideline",
  description: "A placeholder for the next addition to the library.",
  href: "/rule-of-thumb/future-guideline",
  comingSoon: true,
};

const meta = {
  title: "Components/RuleOfThumbCard",
  component: RuleOfThumbCard,
  tags: ["autodocs"],
  parameters: {
    ...tanstackRouterParameters,
    layout: "centered",
  },
} satisfies Meta<typeof RuleOfThumbCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Linked: Story = {
  args: {
    ruleOfThumb: buttonRule,
  },
};

export const ComingSoon: Story = {
  args: {
    ruleOfThumb: comingSoonRule,
  },
};
