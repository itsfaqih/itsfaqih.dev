import base64, pathlib
d = pathlib.Path(__file__).parent
V = [("a-print.svg","A · Print"),("b-registration.svg","B · Registration"),("c-f.svg","C · F")]
def uri(s): return "data:image/svg+xml;base64,"+base64.b64encode(s.encode()).decode()
rows=[]
for f,name in V:
    s=(d/f).read_text()
    light=uri(s.replace("@media (prefers-color-scheme:dark){","@media not all{"))
    dark=uri(s.replace("@media (prefers-color-scheme:dark){","@media all{"))
    def block(src,theme):
        return f'''<div class="panel {theme}">
<div class="tabs"><div class="tab"><img src="{src}" width="16" height="16"><span>Faqih · I build interfaces</span></div><div class="tab dim"><span class="g"></span><span>GitHub</span></div></div>
<div class="sizes"><canvas data-src="{src}" data-px="16"></canvas><canvas data-src="{src}" data-px="32"></canvas><img src="{src}" width="64"><img src="{src}" width="180"></div></div>'''
    rows.append(f'<section><h2>{name}</h2><div class="pair">{block(light,"l")}{block(dark,"d")}</div></section>')
html=f'''<!doctype html><meta charset="utf-8"><title>Favicon variants</title>
<style>
body{{margin:0;padding:24px;background:#e9e9ee;font:13px/1.4 system-ui;color:#111117}}
h2{{font:700 15px system-ui;margin:24px 0 10px}}
.pair{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}
.panel{{border-radius:12px;padding:14px;}} .l{{background:#fff}} .d{{background:#1f1f24;color:#e8e8ee}}
.tabs{{display:flex;gap:2px;background:#dfe1e5;padding:6px 6px 0;border-radius:8px 8px 0 0}}
.d .tabs{{background:#2b2b31}}
.tab{{display:flex;align-items:center;gap:8px;padding:7px 12px;background:#fff;border-radius:8px 8px 0 0;font-size:12px}}
.d .tab{{background:#3b3b43}} .tab.dim{{background:transparent;opacity:.7}}
.g{{width:16px;height:16px;border-radius:50%;background:currentColor;opacity:.6}}
.sizes{{display:flex;align-items:flex-end;gap:20px;margin-top:16px}}
canvas{{image-rendering:pixelated;width:96px;height:96px}}
</style>
{"".join(rows)}
<p>Canvases: true 16px and 32px rasters, magnified 6× and 3× with nearest-neighbour.</p>
<script>
document.querySelectorAll('canvas').forEach(c=>{{const px=+c.dataset.px;c.width=c.height=px;const im=new Image();im.onload=()=>c.getContext('2d').drawImage(im,0,0,px,px);im.src=c.dataset.src;}});
</script>'''
(d/"preview.html").write_text(html)
