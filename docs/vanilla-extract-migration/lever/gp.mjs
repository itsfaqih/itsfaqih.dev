import { createRequire } from "node:module";
const R = createRequire("/Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract/node_modules/.pnpm/@stylexjs+shared@0.19.1/node_modules/@stylexjs/shared/package.json");
const { getPriority } = R("./lib/utils/property-priorities.js");
for (const k of [":hover",":active",":focus-visible",":hover:not(:disabled)",":active:not(:disabled)",":focus-visible:not(:disabled)",":disabled",":focus-within",":is(:hover)",":not(:disabled)",":where(.x:hover *)"]) console.log(k, getPriority(k));
