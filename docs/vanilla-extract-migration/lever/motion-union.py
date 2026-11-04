import json,os,re,collections,sys
D=os.environ['SP']+'/diff/'
def norm(v):
    v=str(v)
    v=re.sub(r'127\.0\.0\.1:\d+','',v)
    v=re.sub(r'\s*,\s*',',',v); v=re.sub(r'\s+',' ',v)
    v=re.sub(r'(^|[\s,(])0\.',r'\1.',v).replace('"',"'").lower().strip()
    return v
NOISE_NAME=re.compile(r'^(animation-name|animationName)$')
def sigs(path):
    out=set(); total=0
    J=json.load(open(D+path))
    for r in J:
        total+=r.get('anims',0) or 0
        for q in r.get('diffs',[]):
            t=q['type']; w=q.get('where','')
            ps=q.get('props')
            if ps:
                for p in ps:
                    name=p[1] if isinstance(p,(list,tuple)) and len(p)>1 else str(p)
                    a,b=(p[2],p[3]) if isinstance(p,(list,tuple)) and len(p)>3 else ('','')
                    if NOISE_NAME.match(str(name)): continue
                    if norm(a)==norm(b): continue
                    out.add((r['label'],t,re.sub(r'\d+','#',str(w))[:90],str(name)))
            else:
                out.add((r['label'],t,re.sub(r'\d+','#',str(w))[:90],norm(json.dumps({k:v for k,v in q.items() if k not in('type','where','label','a','b','base','new')}))[:60] if t.startswith('anim-count') else ''))
    return out,J
ctlfiles=sys.argv[1].split(','); newfiles=sys.argv[2].split(',')
U=set()
for f in ctlfiles:
    s,_=sigs(f); U|=s; print(f,len(s))
per=[]
for f in newfiles:
    s,_=sigs(f); per.append(s); print(f,len(s),'outside control union',len(s-U))
both=per[0]
for s in per[1:]: both=both&s
all_=set().union(*per)
print('outside union in ALL new runs',len(both-U),'in any',len(all_-U))
C=collections.Counter((x[1],x[3]) for x in all_-U)
print(C.most_common(30))
for x in sorted(both-U)[:40]: print('ALL',x)
print('---any')
for x in sorted(all_-U): print(x[0][:34],'|',x[1],'|',x[2][:48],'|',x[3][:80])
