import re,sys,glob,os,collections
def q(root):
    c=collections.Counter()
    for f in glob.glob(root+'/**/*.html',recursive=True):
        for m in re.findall(r'@media ?([^{]*)\{',open(f).read()): c[m.strip()]+=1
    return c
a,b=q(sys.argv[1]),q(sys.argv[2])
print('only base:',sorted(set(a)-set(b))); print('only new:',sorted(set(b)-set(a))); print('shared',len(set(a)&set(b)))
