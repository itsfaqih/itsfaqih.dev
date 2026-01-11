import React, { useState, useCallback, RefObject, useEffect, useRef } from "react";
import { MousePointer, TextCursor, Loader2 } from "lucide-react";

export interface CursorPosition {
  x: number | string;
  y: number | string;
}

export interface MoveToOptions {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  // If true, we don't automatically update the cursor type based on the element
  preventTypeChange?: boolean;
}

export type FakeCursorType = "default" | "text" | "wait";

export interface UseFakeCursorReturn {
  /** The connection to the visual component. Pass this to <FakeCursor /> */
  cursorProps: {
    visible: boolean;
    x: number | string;
    y: number | string;
    pressing: boolean;
    type: FakeCursorType;
  };
  RenderCursor: () => React.ReactNode;
  /** Immediately move cursor to a specific coordinate (relative to container) */
  setPosition: (pos: CursorPosition) => void;
  /** Move cursor to a target DOM element with optional offset */
  moveTo: (
    elementRef: RefObject<HTMLElement | null> | HTMLElement,
    options?: MoveToOptions,
  ) => void;
  /** Trigger a click animation */
  click: () => void;
  /** Press down (hold) */
  pressDown: () => void;
  /** Release press */
  pressUp: () => void;
  /** Show the cursor */
  show: () => void;
  /** Hide the cursor */
  hide: () => void;
  /** Set cursor type manually */
  setType: (type: FakeCursorType) => void;
}

export function useFakeCursor(containerRef: RefObject<HTMLElement | null>): UseFakeCursorReturn {
  const [position, setPos] = useState<CursorPosition>({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [type, setType] = useState<FakeCursorType>("default");

  const click = useCallback(() => {
    setPressing(true);
    setTimeout(() => setPressing(false), 100);
  }, []);

  const pressDown = useCallback(() => setPressing(true), []);
  const pressUp = useCallback(() => setPressing(false), []);

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);

  const moveTo = useCallback(
    (target: RefObject<HTMLElement | null> | HTMLElement, options: MoveToOptions = {}) => {
      const element = "current" in target ? target.current : target;
      const container = containerRef.current;

      if (!element || !container) return;

      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Calculate position relative to container
      let targetX = elementRect.left - containerRect.left;
      let targetY = elementRect.top - containerRect.top;

      // Apply offsets (using CSS-like logic)
      // Default to center if no options provided?
      // "pass the element ref and the relative position (like css top, left, right, bottom)"

      // If no options overlap, default to center of element
      if (
        options.top === undefined &&
        options.bottom === undefined &&
        options.left === undefined &&
        options.right === undefined
      ) {
        targetX += elementRect.width / 2;
        targetY += elementRect.height / 2;
      } else {
        if (options.left !== undefined) {
          targetX += options.left;
        } else if (options.right !== undefined) {
          targetX += elementRect.width - options.right;
        } else {
          // If only top/bottom specified, default X to center?
          targetX += elementRect.width / 2;
        }

        if (options.top !== undefined) {
          targetY += options.top;
        } else if (options.bottom !== undefined) {
          targetY += elementRect.height - options.bottom;
        } else {
          // If only left/right specified, default Y to center?
          targetY += elementRect.height / 2;
        }
      }

      setPos({ x: targetX, y: targetY });

      // Auto-detect type
      if (!options.preventTypeChange) {
        const isInput = element.tagName === "INPUT" || element.tagName === "TEXTAREA";
        const hasTextCursorAttr = element.getAttribute("data-fake-cursor-text-cursor") !== null;

        if (isInput || hasTextCursorAttr) {
          setType("text");
        } else {
          setType("default");
        }
      }
    },
    [containerRef],
  );

  const cursorProps = {
    visible,
    x: position.x,
    y: position.y,
    pressing,
    type,
  };

  const RenderCursor = useCallback(() => <FakeCursor {...cursorProps} />, [cursorProps]);

  return {
    cursorProps,
    RenderCursor,
    setPosition: setPos,
    moveTo,
    click,
    pressDown,
    pressUp,
    show,
    hide,
    setType,
  };
}

function Ripple({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timeout = setTimeout(onComplete, 750);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <span
      className="absolute -top-10 -left-10 size-20 rounded-full border border-black/80 dark:border-white/80 bg-black/50 dark:bg-white/50 animate-ripple"
      style={{
        animationDuration: "750ms",
      }}
    />
  );
}

export function FakeCursor({
  visible,
  x,
  y,
  pressing,
  type = "default",
}: {
  visible: boolean;
  x: number | string;
  y: number | string;
  pressing: boolean;
  type: FakeCursorType;
}) {
  const [ripples, setRipples] = useState<{ id: number }[]>([]);
  const prevPressing = useRef(pressing);

  // Trigger ripple when pressing transitions from true to false
  useEffect(() => {
    if (prevPressing.current && !pressing && type !== "text") {
      setRipples((prev) => [...prev, { id: Date.now() }]);
    }
    prevPressing.current = pressing;
  }, [pressing, type]);

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <div
      className={`absolute pointer-events-none z-50 ${visible ? `opacity-100` : `opacity-0`}`}
      style={{
        top: y,
        left: x,
        // Separate transitions:
        // Position changes (y, x) should be slow/smooth (500ms)
        // Transform changes (scale) should be fast/snappy (100ms)
        transitionProperty: "top, left, transform, opacity",
        transitionDuration: "500ms, 500ms, 100ms, 500ms",
        transitionTimingFunction: "ease-in-out",
        transform:
          type === "text"
            ? "translate(-50%, -50%) scale(1)"
            : `${pressing ? `scale(0.8)` : `scale(1)`} rotate(24deg)`,
        transformOrigin: "top left",
      }}
    >
      {type === "text" ? (
        <TextCursor className="text-black drop-shadow-md" size={24} strokeWidth={1} />
      ) : type === "wait" ? (
        <div className="relative">
          <MousePointer
            className="text-black drop-shadow-md opacity-0"
            fill="white"
            size={24}
            strokeWidth={1}
          />
          <div className="absolute -top-0.5 -left-0.5">
            <Loader2
              className="animate-spin text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
              size={28}
            />
          </div>
        </div>
      ) : (
        <MousePointer
          className="text-black drop-shadow-md"
          fill="white"
          size={24}
          strokeWidth={1}
        />
      )}

      {/* Ripples */}
      {ripples.map((ripple) => (
        <Ripple key={ripple.id} onComplete={() => removeRipple(ripple.id)} />
      ))}
    </div>
  );
}
