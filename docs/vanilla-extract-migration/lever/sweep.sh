#!/bin/bash
set -e
SP="$(cd "$(dirname "$0")/.." && pwd)"
export SP
cd "$SP/../.."
git reset -q
git checkout -- src scripts tests astro.config.ts vitest.config.ts
git clean -fdq src scripts tests
vp node $SP/lever/codemod.mjs $SP/lever/overlap.json $SP/lever/rename.json
rm -f src/theme.stylex.ts src/rules/rule-landing.stylex.ts src/rules/table-design.stylex.ts
cp -R $SP/lever/hand/ .
python3 $SP/lever/patches.py
[ -f $SP/lever/global.py ] && python3 $SP/lever/global.py
vp node $SP/lever/prune.mjs > $SP/lever/pruned.txt
python3 $SP/lever/comments.py
git ls-files -m -o --exclude-standard src scripts astro.config.ts vitest.config.ts | grep -E "\.(ts|tsx|astro|css|mdx)$" > $SP/lever/changed.txt; git diff --name-only --diff-filter=D > /dev/null
grep -vFxf <(git ls-files -d) $SP/lever/changed.txt | tr "\n" "\0" | xargs -0 vp check --fix > $SP/lever/format.txt 2>&1 || true
tail -5 $SP/lever/format.txt | cut -c1-200
