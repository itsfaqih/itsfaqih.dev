#!/bin/bash
SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
W=/Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
cd $W
G="python3 $HOME/.agents/tools/gate-slot.py --"
L=$SP/lever; D=$SP/diff; B=$SP/base/dist; N=$D/fix-dist; O=$D/f3
$G timeout 590 vp node $L/perf.mjs $B $N $O/perf-full.json rounds=10 2>&1 | tail -1 | cut -c1-160; echo perf=$?
$G timeout 590 vp node $L/perf.mjs $B $N $O/perf-trace.json rounds=5 trace=1 2>&1 | tail -1 | cut -c1-160; echo trace=$?
$G timeout 590 vp node $L/toggle8.mjs $B $N $O/toggle8.json 8 2>&1 | tail -3 | cut -c1-200; echo toggle=$?
git worktree add -f $SP/wt-base 8d887ea >/dev/null 2>&1; (cd $SP/wt-base && vp install --frozen-lockfile 2>&1 | tail -1 | cut -c1-120)
sed -i '' "s#diff/buildtime.tsv#diff/f3/buildtime.tsv#" $L/buildtime.sh
bash $L/buildtime.sh 2>&1 | tail -14 | cut -c1-160; echo buildtime=$?
cd $W && git worktree remove --force $SP/wt-base; git worktree prune
echo DONE
