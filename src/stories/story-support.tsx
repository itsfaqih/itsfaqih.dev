import { createRootRoute } from "@tanstack/react-router";
import type { CSSProperties, ReactNode } from "react";

export const StoryRootRoute = createRootRoute({
  component: () => null,
});

export const tanstackRouterParameters = {
  tanstack: {
    router: {
      route: StoryRootRoute,
    },
  },
} as const;

export function Showcase({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        minWidth: 280,
        padding: 32,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
