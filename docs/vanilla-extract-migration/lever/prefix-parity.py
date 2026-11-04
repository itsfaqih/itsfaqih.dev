import os,re,sys,collections as C
def blocks(root):
    out=C.Counter(); miss=C.Counter()
    for d,_,fs in os.walk(root):
        for f in fs:
            if not f.endswith('.html'): continue
            s=open(os.path.join(d,f),errors='ignore').read()
            for css in re.findall(r'<style[^>]*>(.*?)</style>',s,re.S):
                for sel,b in re.findall(r'([^{}]*)\{([^{}]*)\}',css):
                    props=set(re.findall(r'(?:^|;)\s*(-?[a-zA-Z][\w-]*)\s*:',b))
                    for p in props:
                        if p.startswith('-webkit-') and p[8:] in props: out[p[8:]]+=1
                    for p in ('user-select','box-decoration-break','text-decoration-color','mask','mask-image','mask-composite','mask-size','mask-position','mask-repeat','backdrop-filter','line-clamp','appearance','background-clip','text-size-adjust','hyphens','tab-size'):
                        if p in props and '-webkit-'+p not in props:
                            miss[p]+=1
                            if len(sys.argv)>2: print(f,p,sel[:70])
    return out,miss
for r in sys.argv[1:2]:
    a,m=blocks(r); print('paired',dict(a)); print('unprefixed',dict(m))
