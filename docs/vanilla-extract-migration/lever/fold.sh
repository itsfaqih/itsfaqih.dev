#!/bin/bash
set -euo pipefail
OLD=$(git rev-parse HEAD)
git add docs/vanilla-extract-migration-trail.tsv
git commit -q -m "docs(styles): record the decision trail of the migration"
TIP=$(git rev-parse HEAD)
if ! GIT_SEQUENCE_EDITOR="python3 /private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad/lever/seq.py" git rebase -q -i 6fa1ee5 >/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad/rebase.log 2>&1; then
  git rebase --abort; echo REBASE_ABORTED; cut -c1-160 /private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad/rebase.log | tail -5; exit 3
fi
echo tree-diff-vs-tip=$(git diff $TIP HEAD --stat | wc -l)
git log --oneline -7 | cut -c1-76
