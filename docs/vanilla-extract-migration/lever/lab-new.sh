#!/bin/bash
set -e
W=/Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
N=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad/lab/new
rm -rf $N; mkdir -p $N
cd $W
rsync -a --exclude node_modules --exclude dist --exclude .git --exclude .audit --exclude .astro --exclude tests/visual/__screenshots__ --exclude tests/visual/__behavior__ ./ $N/
ln -s $W/node_modules $N/node_modules
cd $N
vp node /private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad/lever/lab-page.mjs $N new /private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad/lever/raw.json /private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad/lever/overlap.json /private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad/lever/rename.json
python3 ~/.agents/tools/gate-slot.py -- vp exec astro build > /private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad/lab/new-build.txt 2>&1 || true
tail -3 /private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad/lab/new-build.txt | cut -c1-200
cp dist/lab.html /private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad/lab/out/new.html
