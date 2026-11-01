import type { CSSProperties, ReactNode } from "react";

export function Showcase({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        minWidth: 280,
        padding: 32,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
