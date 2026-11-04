import os,re,sys,hashlib
pat=re.compile(rb'<link rel="modulepreload" href="[^"]+">')
def sig(root):
    out={}
    for d,_,fs in os.walk(root):
        for f in fs:
            p=os.path.join(d,f); b=open(p,'rb').read(); r=os.path.relpath(p,root)
            out[r]=(hashlib.sha1(b).hexdigest(),b)
    return out
a,b=sig(sys.argv[1]),sig(sys.argv[2])
print('files',len(a),len(b),'only',sorted(set(a)^set(b))[:5])
raw=[k for k in a if k in b and a[k][0]!=b[k][0]]
def norm(x):
    links=sorted(pat.findall(x)); it=iter(links)
    return pat.sub(lambda m:next(it),x)
left=[k for k in raw if norm(a[k][1])!=norm(b[k][1])]
print('raw differ',len(raw),'after sorting preload tags',len(left),left[:6])
print('non-html raw',[k for k in raw if not k.endswith('.html')][:6])
