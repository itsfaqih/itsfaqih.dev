import {
  ArrowCounterClockwiseIcon,
  CaretRightIcon,
  CheckIcon,
  HouseIcon,
} from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { createRef } from "react";

import { CommandPalette, CommandPaletteTrigger } from "../components/command-palette";
import { CommandPaletteView } from "../components/command-palette-view";
import type { CommandPaletteModel } from "../components/command-palette-model";
import { Showcase, tanstackRouterParameters } from "./story-support";

const inputRef = createRef<HTMLInputElement>();
const listRef = createRef<HTMLDivElement>();

const model: CommandPaletteModel = {
  isOpen: true,
  setIsOpen: () => undefined,
  navigationLevel: "root",
  inputValue: "",
  setInputValue: () => undefined,
  handleKeyDown: () => undefined,
  inputRef,
  listRef,
  listboxId: "storybook-command-list",
  activeDescendant: "cmd-option-home",
  groups: [
    {
      label: "Pages",
      items: [
        {
          id: "home",
          label: "Home",
          description: "Go to homepage",
          icon: <HouseIcon size={18} />,
          category: "navigation",
          action: () => undefined,
        },
      ],
    },
    {
      label: "Actions",
      items: [
        {
          id: "copy-email",
          label: "Copy Email",
          description: "Copy itsfaqih@gmail.com to clipboard",
          icon: <CheckIcon size={18} />,
          category: "action",
          action: () => undefined,
        },
      ],
    },
  ],
  flatItems: [],
  selectedIndex: 0,
  setHighlightedIndex: () => undefined,
  goBack: () => undefined,
  copied: false,
};

const meta = {
  title: "Components/CommandPalette",
  component: CommandPaletteView,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: model,
} satisfies Meta<typeof CommandPaletteView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Trigger: Story = {
  render: () => (
    <Showcase>
      <CommandPaletteTrigger />
    </Showcase>
  ),
};

export const View: Story = {
  render: () => (
    <Showcase style={{ minWidth: 520, padding: 0 }}>
      <CommandPaletteView {...model} />
    </Showcase>
  ),
};

export const InteractivePalette: Story = {
  parameters: {
    ...tanstackRouterParameters,
  },
  render: () => (
    <Showcase style={{ minHeight: 180 }}>
      <p style={{ color: "var(--muted-foreground)", marginBottom: 16 }}>
        Press the button to open the real command palette.
      </p>
      <CommandPalette />
      <CommandPaletteTrigger />
    </Showcase>
  ),
};

export const KeyboardNavigation: Story = {
  render: () => (
    <Showcase style={{ minWidth: 520, padding: 0 }}>
      <CommandPaletteView
        {...model}
        activeDescendant="cmd-option-copy-email"
        selectedIndex={1}
        flatItems={model.groups.flatMap((group) => group.items)}
      />
      <div style={{ display: "flex", gap: 8, padding: 16, color: "var(--muted-foreground)" }}>
        <ArrowCounterClockwiseIcon size={16} />
        <span>Arrow keys move the highlighted command</span>
        <CaretRightIcon size={16} />
      </div>
    </Showcase>
  ),
};
