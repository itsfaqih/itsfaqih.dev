#!/bin/bash
SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
G="python3 $HOME/.agents/tools/gate-slot.py --"
L=$SP/lever; D=$SP/diff; B=$SP/base/dist; N=$D/fix-dist; O=$D/m2; mkdir -p $O
SCENES=("quiz data-loading" "quiz handling-timestamps" "quiz button-design" "quiz dialog-design" "quiz proximity-principle" "quiz typescript-code-writing" "quiz table-design" "quiz null-vs-undefined" "palette full")
for s in "${SCENES[@]}"; do
  k=${s// /-}
  $G timeout 590 vp node $L/motion2.mjs $B $N $O/state-$k.json conc=1 motion=reduce "only=$s" > $O/state-$k.log 2>&1; echo "state $k $? $(tail -1 $O/state-$k.log | cut -c1-90)"
  $G timeout 590 vp node $L/motion2.mjs $B $N $O/full-$k.json conc=2 "only=$s" > $O/full-$k.log 2>&1; echo "full $k $? $(tail -1 $O/full-$k.log | cut -c1-90)"
  $G timeout 590 vp node $L/motion2.mjs $B $B $O/ctl-$k.json conc=2 "only=$s" > $O/ctl-$k.log 2>&1; echo "ctl $k $? $(tail -1 $O/ctl-$k.log | cut -c1-90)"
done
echo DONE
