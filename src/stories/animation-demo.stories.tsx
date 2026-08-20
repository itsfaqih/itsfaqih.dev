import type { Meta, StoryObj } from "@storybook/tanstack-react";

import {
  AnimatedCursor,
  AnimationControls,
  AnimationDemo,
  AnimationStage,
} from "../components/animation-demo";
import { Showcase } from "./story-support";

const meta = {
  title: "Components/AnimationDemo",
  component: AnimationDemo,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    duration: 1800,
    masterAnimationName: "story-demo-move",
    children: null,
  },
} satisfies Meta<typeof AnimationDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

function DemoContent({ withCursor = false }: { withCursor?: boolean }) {
  return (
    <>
      <style>{`
        @keyframes story-demo-move {
          from { transform: translate(24px, 24px); }
          to { transform: translate(260px, 160px); }
        }
        @keyframes story-demo-ripple {
          from { transform: scale(0); opacity: .35; }
          to { transform: scale(1); opacity: 0; }
        }
      `}</style>
      <AnimationStage>
        <div
          style={{
            animationName: "story-demo-move",
            animationDuration: "1800ms",
            animationIterationCount: 1,
            animationFillMode: "forwards",
            animationPlayState: "paused",
            background: "var(--brand)",
            borderRadius: 999,
            height: 28,
            width: 28,
          }}
        />
        {withCursor && (
          <AnimatedCursor
            moveAnimationName="story-demo-move"
            rippleAnimationName="story-demo-ripple"
            transform="translate(24px, 24px)"
          />
        )}
      </AnimationStage>
      <AnimationControls title="Animation controls">
        <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
          Play, pause, seek, or replay the CSS animation.
        </span>
      </AnimationControls>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <Showcase style={{ width: 520 }}>
      <AnimationDemo duration={1800} masterAnimationName="story-demo-move">
        <DemoContent />
      </AnimationDemo>
    </Showcase>
  ),
};

export const WithAnimatedCursor: Story = {
  render: () => (
    <Showcase style={{ width: 520 }}>
      <AnimationDemo duration={1800} masterAnimationName="story-demo-move">
        <DemoContent withCursor />
      </AnimationDemo>
    </Showcase>
  ),
};
