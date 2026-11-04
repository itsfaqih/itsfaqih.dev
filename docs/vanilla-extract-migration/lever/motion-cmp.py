import json,sys,collections,os
D=os.environ['SP']+'/diff/'
ctl=json.load(open(D+sys.argv[1])); new=json.load(open(D+sys.argv[2]))
def scene(l): return l
def sig(q):
    t=q['type']
    if t in('frame','canvas'): return (t,q.get('label','').split(':')[0] if False else '',q.get('where',''))
    if t=='page':
        return (t,q.get('where',''),tuple(sorted(p[1] for p in q.get('props',[]))[:4]))
    if t=='anim-count': return (t,str(q.get('onlyBase'))[:60],str(q.get('onlyNew'))[:60])
    return (t,q.get('where',''))
cc=collections.defaultdict(set)
for r in ctl:
    for q in r.get('diffs',[]): cc[q['type']].add(r['label'])
print('ctl by kind',{k:len(v) for k,v in cc.items()})
kinds=collections.Counter(); byscene=collections.defaultdict(collections.Counter)
cl={r['label']:r for r in ctl}
for r in new:
    for q in r.get('diffs',[]):
        kinds[q['type']]+=1; byscene[r['label']][q['type']]+=1
print('new by kind',kinds)
# kinds not in control for a label
for r in new:
    ctlk=collections.Counter(q['type'] for q in cl.get(r['label'],{}).get('diffs',[]))
    ks=collections.Counter(q['type'] for q in r.get('diffs',[]))
    only={k:v for k,v in ks.items() if k not in ctlk}
    if only:
        print(r['label'][:32],only, {k:v for k,v in ctlk.items()})
