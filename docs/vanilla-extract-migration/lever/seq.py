import sys
p=sys.argv[1]; L=open(p).read().splitlines()
fix=[i for i,l in enumerate(L) if l.startswith('pick') and 'type the css-order grouping' in l]
tst=[i for i,l in enumerate(L) if l.startswith('pick') and 'fail when two classes depend' in l]
assert len(fix)==1 and len(tst)==1
l=L.pop(fix[0]).replace('pick','fixup',1); L.insert(tst[0]+1,l)
open(p,'w').write('\n'.join(L)+'\n')
