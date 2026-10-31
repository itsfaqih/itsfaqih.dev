import * as stylex from "@stylexjs/stylex";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { ArrowRightIcon, GearSixIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { button, buttonVariant, type ButtonVariant } from "../components/button";
import { Showcase } from "./story-support";

const meta = {
  title: "Buttons",
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ROWS: { tone: string; variants: ButtonVariant[] }[] = [
  { tone: "Brand", variants: ["primary-brand", "secondary-brand", "tertiary-brand"] },
  {
    tone: "Destructive",
    variants: ["primary-destructive", "secondary-destructive", "tertiary-destructive"],
  },
  { tone: "Neutral", variants: ["primary-neutral", "tertiary-neutral"] },
];

const row = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 } as const;

export const Variants: Story = {
  render: () => (
    <Showcase style={{ display: "grid", gap: 24 }}>
      {ROWS.map(({ tone, variants }) => (
        <div key={tone} style={row}>
          {variants.map((variant) => (
            <button
              key={variant}
              type="button"
              {...stylex.props(button.base, buttonVariant[variant])}
            >
              {variant}
            </button>
          ))}
        </div>
      ))}
    </Showcase>
  ),
};

export const Off: Story = {
  name: "Not available yet",
  render: () => (
    <Showcase style={row}>
      {(["primary-brand", "secondary-brand", "tertiary-neutral"] as const).map((variant) => (
        <button
          key={variant}
          type="button"
          aria-disabled="true"
          title="That URL is taken"
          {...stylex.props(button.base, buttonVariant[variant], button.off)}
        >
          Publish
        </button>
      ))}
    </Showcase>
  ),
};

export const Icons: Story = {
  render: () => (
    <Showcase style={row}>
      <button
        type="button"
        {...stylex.props(button.base, buttonVariant["primary-brand"], button.iconStart)}
      >
        <PlusIcon size={16} weight="bold" aria-hidden="true" />
        New project
      </button>
      <button
        type="button"
        {...stylex.props(button.base, buttonVariant["secondary-brand"], button.iconEnd)}
      >
        Continue
        <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
      </button>
      <button
        type="button"
        {...stylex.props(button.base, buttonVariant["tertiary-destructive"], button.iconStart)}
      >
        <TrashIcon size={16} weight="bold" aria-hidden="true" />
        Delete
      </button>
      <button
        type="button"
        aria-label="Settings"
        title="Settings"
        {...stylex.props(button.base, buttonVariant["primary-neutral"], button.iconOnly)}
      >
        <GearSixIcon size={18} weight="bold" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Settings"
        title="Settings"
        {...stylex.props(
          button.base,
          buttonVariant["tertiary-neutral"],
          button.sm,
          button.iconOnly,
        )}
      >
        <GearSixIcon size={16} weight="bold" aria-hidden="true" />
      </button>
    </Showcase>
  ),
};
