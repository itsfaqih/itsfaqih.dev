// astro:prefetch is a virtual module only Astro's bundler serves. Unit tests import the rule pages
// for their lessons and never render the tiles that prefetch.
export function prefetch(_href: string) {}
