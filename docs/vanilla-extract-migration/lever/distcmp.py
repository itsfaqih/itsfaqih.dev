import os,sys,hashlib,re
a,b=sys.argv[1:3]
def files(r):
    return {os.path.relpath(os.path.join(d,f),r) for d,_,fs in os.walk(r) for f in fs}
A,B=files(a),files(b)
norm=lambda s:re.sub(r'/_astro/([\w.-]+?)\.[\w-]{8}\.(js|css)',r'/_astro/\1.\2',s)
same=diff=0; ds=[]
for f in sorted(A&B):
    x=open(os.path.join(a,f),'rb').read(); y=open(os.path.join(b,f),'rb').read()
    if x==y: same+=1
    else:
        if f.endswith('.html') and norm(x.decode())==norm(y.decode()): same+=1; continue
        diff+=1; ds.append((f,len(x),len(y)))
print('same',same,'diff',diff,'onlyA',len(A-B),'onlyB',len(B-A))
for d in ds[:30]: print(d)
print(sorted(A-B)[:10],sorted(B-A)[:10])
