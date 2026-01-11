import { useState, useEffect } from "react";

export function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    // SSR safety
    if (typeof window === "undefined") return;

    const result = window.matchMedia(query);
    setValue(result.matches);
    result.addEventListener("change", onChange);
    return () => result.removeEventListener("change", onChange);
  }, [query]);

  return value;
}
