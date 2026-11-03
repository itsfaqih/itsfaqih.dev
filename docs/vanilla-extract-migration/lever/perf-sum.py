import json,sys,random,statistics as st,collections
rows=json.load(open(sys.argv[1]))
random.seed(7)
fatal=[r for r in rows if 'fatal' in r]; errs=[r for r in rows if r.get('errors')]
print('rows',len(rows),'fatal',len(fatal),'with errors',len(errs),collections.Counter(e[:50] for r in errs for e in r['errors']).most_common(4))
M=['transfer','html','htmlDecoded','fcp','lcp','dcl','load','tbt','cls','recalcMs','layoutMs','scriptMs','taskMs','toggleMs','tParseHTML','tParseAuthorStyleSheet','tUpdateLayoutTree','tLayout','tEvaluateScript','tFunctionCall','tPrePaint','tPaint','tLayerize','tCommit']
def boot(a,b,n=2000):
    d=sorted(st.median(random.choices(b,k=len(b)))-st.median(random.choices(a,k=len(a))) for _ in range(n))
    return d[int(.025*n)],d[int(.975*n)]
out=[]
g=collections.defaultdict(list)
for r in rows:
    if 'fatal' in r: continue
    g[(r['sc'],r['route'],r['side'])].append(r)
for sc,route in sorted({k[:2] for k in g}):
    print(f'\n== {sc} {route} n={len(g[(sc,route,"base")])} els={g[(sc,route,"base")][0]["els"]}/{g[(sc,route,"new")][0]["els"]} sheets={g[(sc,route,"base")][0]["sheets"]}/{g[(sc,route,"new")][0]["sheets"]}')
    for m in M:
        v=lambda s:[r[m] for r in g[(sc,route,s)] if r.get(m) is not None]
        B,C,N=v('base'),v('control'),v('new')
        if not B or not N: continue
        lo,hi=boot(B,N); clo,chi=boot(B,C)
        mb,mc,mn=st.median(B),st.median(C),st.median(N)
        sig=(lo>0 or hi<0) and abs(mn-mb)>abs(mc-mb) and (clo<=0<=chi or abs(mn-mb)>2*abs(mc-mb))
        verdict=('new lower' if mn<mb else 'new higher') if sig else 'no measurable difference'
        print(f'{m:12} base {mb:12.2f} [{min(B):.1f},{max(B):.1f}] control {mc:12.2f} new {mn:12.2f} [{min(N):.1f},{max(N):.1f}] delta {mn-mb:+10.2f} ({(mn-mb)/mb*100 if mb else 0:+.1f}%) CI [{lo:+.1f},{hi:+.1f}] ctlCI [{clo:+.1f},{chi:+.1f}] {verdict}')
        out.append(dict(sc=sc,route=route,metric=m,base=mb,control=mc,new=mn,delta=mn-mb,pct=(mn-mb)/mb*100 if mb else 0,lo=lo,hi=hi,clo=clo,chi=chi,verdict=verdict,baseRange=[min(B),max(B)],newRange=[min(N),max(N)]))
if len(sys.argv)>2: json.dump(out,open(sys.argv[2],'w'))
