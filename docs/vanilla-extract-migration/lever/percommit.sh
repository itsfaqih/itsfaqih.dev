#!/bin/bash
SP="$1"; MAIN="$2"; WT="$SP/wt-steps"
git -C "$MAIN" worktree add -q --detach "$WT" HEAD || exit 9
ln -s "$MAIN/node_modules" "$WT/node_modules"
for c in $(git -C "$MAIN" rev-list --reverse 5c62ad0..HEAD); do
  git -C "$WT" checkout -q "$c" 2>/dev/null
  rm -rf "$WT/dist" "$WT/.astro"
  (cd "$WT" && vp exec astro build >"$SP/step.log" 2>&1); b=$?
  (cd "$WT" && vp run typecheck >"$SP/step-tc.log" 2>&1); t=$?
  if [ $b = 0 ]; then d=$(diff -rq "$WT/dist" "$SP/diff/final-dist" 2>/dev/null | grep -v '\.pdf' | wc -l | tr -d ' '); else d=NA; fi
  echo "$(git -C "$WT" log -1 --format='%h %s' | cut -c1-58) build=$b typecheck=$t diffFiles=$d"
done
cd "$MAIN"; git worktree remove --force "$WT"; git worktree prune
