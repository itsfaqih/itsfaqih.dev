set -u
cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
D=$SP/diff; B=$SP/base/dist; N=$D/final-dist
ALL=/,/404,/blog,/blog/hello-world,/cv,/rule-of-thumb
vp node $SP/lever/site-diff.mjs $B $N $D/force-one-final.json force=one-hover,one-active,one-focus-visible widths=1440 themes=dark motion=reduce pointer=fine step=350 conc=3 2>&1 | tail -2 | cut -c1-200
vp node $SP/lever/site-diff.mjs $B $N $D/final-matrix.json widths=1440,961,959,641,639,480,390 themes=dark,light motion=reduce pointer=fine,coarse conc=4 2>&1 | tail -2 | cut -c1-200
vp node $SP/lever/site-diff.mjs $B $N $D/final-motion.json widths=1440,959,390 themes=dark,light motion=full pointer=fine,coarse conc=4 2>&1 | tail -2 | cut -c1-200
vp node $SP/lever/firstpaint.mjs $B $N 2>&1 | tail -12 | cut -c1-200
vp node $SP/lever/cvcheck.mjs $B $N 2>&1 | tail -12 | cut -c1-200
vp node $SP/lever/pseudo.mjs $B $N $D/pseudo-final.json 2>&1 | tail -3 | cut -c1-200
vp node $SP/lever/motion.mjs $B $N $D/motion-final.json 2>&1 | tail -3 | cut -c1-200
