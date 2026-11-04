#!/bin/bash
SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
export SP
cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
L=$SP/lever; B=$SP/base/dist; O=$SP/diff/a2-state; rm -rf $O; mkdir -p $O
G="python3 $HOME/.agents/tools/gate-slot.py -- timeout 590"
for s in "quiz data-loading" "quiz handling-timestamps" "quiz button-design" "quiz dialog-design" "quiz proximity-principle" "quiz typescript-code-writing" "quiz table-design" "quiz null-vs-undefined" "palette full /" "palette full /blog" "palette full /cv" "palette full /rule-of-thumb/button-design"; do
  k=$(echo "$s" | tr ' /' '--')
  extra=""; [ "$s" = "palette full /" ] && extra="except=palette full /b,palette full /c,palette full /r"
  $G vp node $L/motion2.mjs $B $B $O/ctl-$k.json conc=1 motion=reduce "only=$s" ${extra:+"$extra"} >/dev/null 2>&1; echo "state ctl $k $?"
done
echo DONE
