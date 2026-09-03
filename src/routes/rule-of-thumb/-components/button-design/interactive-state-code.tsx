import { ScrollArea } from "@base-ui/react/scroll-area";
import { cx } from "@/stylex";
import { useEffect, useRef, useState } from "react";

import { CodeBlock } from "@/components/code-block";

type CodeState = "idle" | "hover" | "focus" | "pending" | "disabled" | "pressing";

const STATE_INFO: Record<CodeState, { label: string; description: string }> = {
  idle: {
    label: "Idle",
    description: "The default resting state. Clearly clickable with base styling.",
  },
  hover: {
    label: "Hover",
    description: "Provides feedback when cursor is over the button. Signals interactivity.",
  },
  focus: {
    label: "Focus",
    description: "Shows when focused via keyboard navigation. Essential for accessibility.",
  },
  pending: {
    label: "Pending",
    description: "Shows progress while processing. Prevents double-clicks.",
  },
  disabled: {
    label: "Disabled",
    description: "Indicates unavailable action. Muted appearance, no pointer events.",
  },
  pressing: {
    label: "Pressing",
    description: "Visual feedback on click/tap. Scale-down or color shift.",
  },
};

const HIGHLIGHT_RANGES: Record<CodeState, number[]> = {
  idle: [5, 6, 7, 8],
  hover: [10, 11, 12],
  focus: [14, 15, 16],
  pending: [3, 21, 22, 23, 29, 30, 31, 32, 33],
  disabled: [3, 21, 24, 25],
  pressing: [18, 19],
};

const SCROLL_TARGET_LINES: Record<CodeState, number> = {
  idle: 6,
  hover: 11,
  focus: 15,
  pending: 22,
  disabled: 24,
  pressing: 19,
};

export function InteractiveStateCode() {
  const [activeState, setActiveState] = useState<CodeState>("idle");
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  // The complete code as a single string for the code renderer
  const code = `// Complete button with all states
<button
  disabled={isPending || isDisabled}
  className={cn(
    // Base styles (Idle)
    "px-6 py-3 rounded-xl font-medium text-white",
    "flex items-center justify-center gap-2",
    "transition-all duration-200",
    
    // Hover state (Glassy overlay)
    "hover:bg-muted",
    "hover:shadow-lg",
    
    // Focus state (keyboard navigation)
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-ring focus-visible:ring-offset-2",
    
    // Pressing state (active)
    "active:scale-95",
    
    // Pending & Disabled conditional styles
    isPending
      ? "cursor-wait"
      : isDisabled
        ? "cursor-not-allowed opacity-60"
        : "cursor-default"
  )}
>
  {isPending ? (
    <>
      <CircleNotchIcon className={cx("animate-spin")} size={18} />
      Processing...
    </>
  ) : (
    "Submit"
  )}
</button>`;

  const TAB_BASE = "interactive-state-code-tab";
  const TAB_ACTIVE = "interactive-state-code-tab-active";
  const LABEL_COLOR = "text-foreground";

  useEffect(() => {
    const targetLine = SCROLL_TARGET_LINES[activeState];
    let frameId = 0;
    let attempts = 0;

    const scrollToHighlightedLine = () => {
      attempts += 1;
      const viewport = scrollViewportRef.current;
      const codeBlock = codeContainerRef.current?.querySelector<HTMLElement>(".code-block");
      const line = codeBlock?.shadowRoot?.querySelector<HTMLElement>(`[data-line="${targetLine}"]`);

      if (viewport && line) {
        const viewportRect = viewport.getBoundingClientRect();
        const lineRect = line.getBoundingClientRect();
        const lineTop = viewport.scrollTop + lineRect.top - viewportRect.top;
        const centeredTop = lineTop - (viewport.clientHeight - lineRect.height) / 2;
        const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

        viewport.scrollTo({
          top: Math.min(Math.max(0, centeredTop), maxScrollTop),
          behavior,
        });
        return;
      }

      if (attempts < 30) {
        frameId = requestAnimationFrame(scrollToHighlightedLine);
      }
    };

    frameId = requestAnimationFrame(scrollToHighlightedLine);
    return () => cancelAnimationFrame(frameId);
  }, [activeState]);

  return (
    <div data-rule-of-thumb-card="true" className={cx("rounded-2xl squircle border border-border bg-card")}>
      {/* State selector tabs */}
      <div className={cx("p-4 border-b border-border bg-background")}>
        <div
          className={cx("flex flex-wrap gap-2")}
          role="group"
          aria-label="Button state examples"
        >
          {(Object.keys(STATE_INFO) as CodeState[]).map((state) => {
            const info = STATE_INFO[state];
            const isActive = activeState === state;
            return (
              <button
                key={state}
                type="button"
                onClick={() => setActiveState(state)}
                aria-pressed={isActive}
                className={cx(
                  "text-sm font-medium",
                  TAB_BASE,
                  isActive ? TAB_ACTIVE : "",
                )}
              >
                {info.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className={cx("px-4 py-3 border-b border-border bg-background")}>
        <p className={cx("text-sm text-muted-foreground")}>
          <span className={cx(`font-medium ${LABEL_COLOR}`)}>
            {STATE_INFO[activeState].label}:
          </span>{" "}
          {STATE_INFO[activeState].description}
        </p>
      </div>

      {/* Code block with syntax highlighting and line highlighting */}
      <div className={cx("interactive-state-code-block text-sm")}>
        <ScrollArea.Root className={cx("interactive-state-code-scroll-area")}>
          <ScrollArea.Viewport
            ref={scrollViewportRef}
            className={cx("interactive-state-code-scroll-viewport")}
          >
            <ScrollArea.Content
              ref={codeContainerRef}
              className={cx("interactive-state-code-scroll-content")}
            >
              <CodeBlock
                code={code}
                lang="tsx"
                highlightLines={HIGHLIGHT_RANGES[activeState]}
                highlightBackground="light-dark(#dbeafe, color-mix(in srgb, #60a5fa 30%, var(--diffs-bg)))"
                highlightBorder="light-dark(#60a5fa, #60a5fa)"
              />
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar className={cx("interactive-state-code-scrollbar")}>
            <ScrollArea.Thumb className={cx("interactive-state-code-scroll-thumb")} />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>

      {/* Tips for the active state */}
      <div className={cx("px-4 py-3 border-t border-border bg-background text-sm")}>
        {activeState === "idle" && (
          <p className={cx("text-muted-foreground")}>
            <strong className={cx("text-foreground")}>💡 Tip:</strong> Base styles define the button's
            default appearance. Keep these consistent across your design system.
          </p>
        )}
        {activeState === "hover" && (
          <p className={cx("text-muted-foreground")}>
            <strong className={cx("text-foreground")}>💡 Tip:</strong> Combine subtle effects (color,
            shadow, transform) for a polished hover. Avoid jarring changes.
          </p>
        )}
        {activeState === "pending" && (
          <p className={cx("text-muted-foreground")}>
            <strong className={cx("text-foreground")}>💡 Tip:</strong> Always disable during pending to
            prevent double-submissions. Update the label to show progress.
          </p>
        )}
        {activeState === "focus" && (
          <p className={cx("text-muted-foreground")}>
            <strong className={cx("text-foreground")}>💡 Tip:</strong> Use focus-visible instead of focus
            to only show the ring on keyboard navigation, not mouse clicks.
          </p>
        )}
        {activeState === "disabled" && (
          <p className={cx("text-muted-foreground")}>
            <strong className={cx("text-foreground")}>💡 Tip:</strong> Use reduced opacity and
            cursor-not-allowed. Consider adding a tooltip explaining why it's disabled.
          </p>
        )}
        {activeState === "pressing" && (
          <p className={cx("text-muted-foreground")}>
            <strong className={cx("text-foreground")}>💡 Tip:</strong> Use short durations (100-150ms) for
            snappy feedback. Scale-down
          </p>
        )}
      </div>
    </div>
  );
}