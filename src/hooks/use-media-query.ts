import { useSyncExternalStore } from "react";
import { watchMedia } from "./media-query";

const getServerSnapshot = () => false;

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => watchMedia(query, onStoreChange),
    () => matchMedia(query).matches,
    getServerSnapshot,
  );
}
