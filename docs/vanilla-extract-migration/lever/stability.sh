#!/bin/bash
SP="$1"; MAIN="$2"; WB="$SP/wt-base"; OUT="$SP/stab"; rm -rf "$OUT"; mkdir -p "$OUT"
git -C "$MAIN" worktree add -q --detach "$WB" 8d887ea || exit 9
(cd "$WB" && vp install --frozen-lockfile >"$OUT/install.log" 2>&1); echo install=$?
for i in 1 2 3; do
  rm -rf "$WB/dist" "$WB/.astro"
  (cd "$WB" && vp exec astro build >"$OUT/base$i.log" 2>&1); echo base$i=$?
  mkdir "$OUT/base$i"; (cd "$WB/dist" && find . -name '*.html' | cpio -pdm "$OUT/base$i" 2>/dev/null)
done
cd "$MAIN"; git worktree remove --force "$WB"; git worktree prune
for i in 1 2 3; do
  rm -rf dist .astro
  vp exec astro build >"$OUT/new$i.log" 2>&1; echo new$i=$?
  mkdir "$OUT/new$i"; (cd dist && find . -name '*.html' | cpio -pdm "$OUT/new$i" 2>/dev/null)
done
