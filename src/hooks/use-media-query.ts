import { useSyncExternalStore } from "react";

const getServerSnapshot = () => false;

function getSnapshot(query: string) {
  return typeof window !== "undefined" && window.matchMedia(query).matches;
}

function subscribe(query: string, onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const mediaQuery = window.matchMedia(query);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => getSnapshot(query),
    getServerSnapshot,
  );
}
