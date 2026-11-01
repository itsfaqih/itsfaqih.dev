import * as stylex from "@stylexjs/stylex";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { animateDots, styles } from "./backdrop-dots";

export function Backdrop({ tide = false }: { tide?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const liven = useCallback((element: HTMLDivElement) => animateDots(element, tide), [tide]);

  if (!mounted) return null;
  return createPortal(
    <div ref={liven} {...stylex.props(styles.root)} aria-hidden="true">
      <i {...stylex.props(styles.layer, styles.grid)} />
      <canvas {...stylex.props(styles.layer)} />
    </div>,
    document.body,
  );
}
