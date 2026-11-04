import re,os,glob,brotli,json,sys
SP=os.environ['SP']; B=SP+'/base/dist'; N=SP+'/diff/fix-dist'
rows=[]
for f in sorted(glob.glob(N+'/**/*.html',recursive=True)):
    r=os.path.relpath(f,N)
    if not os.path.exists(B+'/'+r): print('only new',r); continue
    row={'page':r}
    for name,root in (('base',B),('new',N)):
        s=open(root+'/'+r).read()
        st=re.findall(r'<style[^>]*>(.*?)</style>',s,re.S)
        css=''.join(st)
        row[name]=dict(html=len(s.encode()),htmlbr=len(brotli.compress(s.encode(),quality=11)),css=len(css.encode()),cssbr=len(brotli.compress(css.encode(),quality=11)),nstyle=len(st),notid=css.count(':not(#\\#)'),first=st[0][:50] if st else '',pos=s.find('<style'),lab=css.count('lab('),oklab=css.count('oklab('),oklch=css.count('oklch('),keyf=len(re.findall(r'@keyframes',css)),links=len(re.findall(r'<link[^>]*stylesheet',s)),hardinline=len(re.findall(r'<script[^>]*>',s)))
    rows.append(row)
json.dump(rows,open(SP+'/diff/css-audit.json','w'))
for r in rows:
    b,n=r['base'],r['new']
    print(f"{r['page'][:34]:34} html {b['html']:>8}>{n['html']:>7} br {b['htmlbr']:>6}>{n['htmlbr']:>6} css {b['css']:>6}>{n['css']:>6} cssbr {b['cssbr']:>5}>{n['cssbr']:>5} kf {b['keyf']}>{n['keyf']} oklab {b['oklab']}>{n['oklab']} oklch {b['oklch']}>{n['oklch']}")
print('first style new', {r['new']['first'] for r in rows}); print('style count', {(r['base']['nstyle'],r['new']['nstyle']) for r in rows}); print('links', {(r['base']['links'],r['new']['links']) for r in rows})
