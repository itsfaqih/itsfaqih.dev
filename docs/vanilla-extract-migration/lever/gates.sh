#!/bin/bash
SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
export SP
cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
G="python3 $HOME/.agents/tools/gate-slot.py --"
R=$SP/gates; rm -rf $R; mkdir -p $R
git rev-parse --short HEAD; git status --short | head -5
rm -rf dist
$G vp exec astro build > $R/build.log 2>&1; echo "build $?"; tail -1 $R/build.log | cut -c1-100
$G vp run typecheck > $R/tc.log 2>&1; echo "typecheck $?"
$G vp test run --project unit > $R/unit.log 2>&1; echo "unit $?"; grep -E "Tests " $R/unit.log | cut -c1-100
$G vp test run --project visual > $R/visual.log 2>&1; echo "visual $?"; grep -E "Tests |FAIL" $R/visual.log | sed 's/\x1b\[[0-9;]*m//g' | cut -c1-110 | sort -u | head -12
mkdir -p $R/diff; cp -R tests/visual/__diff__/. $R/diff/ 2>/dev/null
$G vp test run --project behavior > $R/behavior.log 2>&1; echo "behavior $?"; grep -E "Tests |FAIL" $R/behavior.log | sed 's/\x1b\[[0-9;]*m//g' | cut -c1-110 | sort -u | head -6
$G vp lint > $R/lint.log 2>&1; echo "lint $?"; tail -1 $R/lint.log | cut -c1-100
echo "baselines changed vs 8d887ea: $(git diff --name-only 8d887ea HEAD -- tests/visual/__screenshots__ tests/visual/__behavior__ | wc -l)"
git status --short | head -5
python3 $SP/lever/distcmp.py $SP/diff/fix-dist dist 2>&1 | tail -6 | cut -c1-140
$G vp node $SP/lever/cvcheck.mjs $SP/base/dist $SP/diff/fix-dist > $R/cvcheck.log 2>&1; echo "cvcheck $?"
echo DONE
