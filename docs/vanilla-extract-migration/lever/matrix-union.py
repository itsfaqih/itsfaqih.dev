import json,os,collections,sys,re
sp=os.environ['SP']
def sigs(f):
    j=json.load(open(f'{sp}/diff/{f}.json')); out=collections.Counter(); tot=collections.Counter()
    for r in j:
        lab=str(r['label']); rt=lab.split(' ')[0]
        tot[rt]+=r.get('mismatched') or 0
        for d in r['diffs']:
            props=sorted({p[0] for k in ('el','b','a') for p in (d.get(k) or [])}) or ['attr']
            for p in props:
                out[(lab,d['path'],p)]+=1
    return out,tot
for group,ctl,new in [('motion',['final-motion-ctl'],['final-motion','final-motion2']),('home-reduce',['final-home-reduce-ctl'],['final-matrix','final-home-reduce2'])]:
    c,ct=sigs(ctl[0]); a,at=sigs(new[0]); b,bt=sigs(new[1])
    if group=='home-reduce':
        a=collections.Counter({k:v for k,v in a.items() if k[0].startswith('/ ')})
    print('==',group,'ctl totals',dict(ct),'\n new1',{k:v for k,v in at.items() if v},'\n new2',dict(bt))
    both=set(a)&set(b)
    rep=[k for k in both if k not in c]
    print(' sigs new1',len(a),'new2',len(b),'both',len(both),'both and not in ctl',len(rep))
    # relax job: same route+path+prop anywhere in ctl
    relax={(k[0].split(' ')[0],k[1],k[2]) for k in c}
    rep2=[k for k in rep if (k[0].split(' ')[0],k[1],k[2]) not in relax]
    print(' also absent from ctl on that route in any job',len(rep2))
    for k in sorted(rep2)[:30]: print('  ',k)
