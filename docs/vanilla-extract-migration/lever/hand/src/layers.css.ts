import { globalLayer } from "@vanilla-extract/css";

// site.astro's first <style> declares these in order: base, global, under5 to under1. A class in
// underN loses to one in a lower-numbered layer and to every unlayered class. See STYLING_GUIDELINES.md.
export const under5 = globalLayer("under5");
export const under4 = globalLayer("under4");
export const under3 = globalLayer("under3");
export const under2 = globalLayer("under2");
export const under1 = globalLayer("under1");
