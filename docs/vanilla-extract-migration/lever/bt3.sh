#!/bin/bash
export SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
W=/Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
cd $W
git worktree add -f $SP/wt-base 8d887ea >/dev/null 2>&1; (cd $SP/wt-base && vp install --frozen-lockfile 2>&1 | tail -1 | cut -c1-120)
bash $SP/lever/buildtime.sh 2>&1 | tail -14 | cut -c1-160; echo buildtime=$?
cd $W && git worktree remove --force $SP/wt-base; git worktree prune
L=$SP/lever; D=$SP/diff; B=$SP/base/dist; N=$D/fix-dist; O=$D/m4; mkdir -p $O
G="python3 $HOME/.agents/tools/gate-slot.py -- timeout 590"
for i in 1 2 3; do
  $G vp node $L/motion2.mjs $B $N $O/rows-new-$i.json conc=1 "only=home rows" >/dev/null 2>&1; echo "rows new $i $?"
  $G vp node $L/motion2.mjs $B $B $O/rows-ctl-$i.json conc=1 "only=home rows" >/dev/null 2>&1; echo "rows ctl $i $?"
done
for i in 1 2 3; do
  for k in "$N:new" "$B:ctl"; do
    $G vp node $L/site-diff.mjs $B ${k%%:*} $O/fm-${k##*:}-$i.json routes=/rule-of-thumb/table-design,/rule-of-thumb/button-design widths=390 themes=light motion=full pointer=fine,coarse conc=1 >/dev/null 2>&1; echo "fm ${k##*:} $i $?"
  done
done
echo DONE
