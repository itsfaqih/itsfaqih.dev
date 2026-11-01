import { useEffect, type RefObject } from "react";
import { watchCutIns } from "./cut-ins";

/**
 * Plays the cut-ins under the root (watchCutIns). Pass `enabled: false` to hold the entrances
 * until something above them (the home intro) has handed off.
 */
export function useCutIns(rootRef: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;
    return watchCutIns(root);
  }, [rootRef, enabled]);
}
