import json,sys,collections
d=json.load(open(sys.argv[1]))
rs=d['results'] if isinstance(d,dict) and 'results' in d else d
print('type',type(rs).__name__,'n',len(rs))
x=rs[0] if isinstance(rs,list) else list(rs.values())[0]
print({k:(type(v).__name__, (len(v) if hasattr(v,'__len__') else v)) for k,v in x.items()})
withd=[r for r in rs if any(r.get(k) for k in ('diffs',))]
print('with diffs',len(withd))
kinds=collections.Counter()
ex={}
for r in withd:
    for q in r['diffs']:
        k=q.get('type') or q.get('kind') or ','.join(sorted(q.keys()))
        kinds[k]+=1; ex.setdefault(k,(r.get('label') or r.get('scene'),q))
for k,v in kinds.most_common(): print(v,k,json.dumps(ex[k])[:400])
