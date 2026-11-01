import { vi } from "vite-plus/test";

// jsdom ships no matchMedia. Every query answers false, as on a touch screen with no motion or
// color-scheme preference.
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
}));
