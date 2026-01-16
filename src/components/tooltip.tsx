import * as React from "react";
import { Tooltip } from "@base-ui/react";
import { cn } from "@/cn";

interface SimpleTooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  className?: string;
}

export function SimpleTooltip({
  children,
  content,
  side = "top",
  sideOffset = 8,
  className,
}: SimpleTooltipProps) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger render={(props) => React.cloneElement(children, props)} />
        <Tooltip.Portal>
          <Tooltip.Positioner side={side} sideOffset={sideOffset}>
            <Tooltip.Popup
              className={cn(
                "z-50 rounded-md bg-zinc-900/90 px-2.5 py-1 text-xs text-white backdrop-blur-md outline-none",
                "data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95",
                className,
              )}
            >
              {content}
              <Tooltip.Arrow className="fill-zinc-900/90" />
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
