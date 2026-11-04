import re,os
def sub(p,f):
    s=open(p).read(); n=f(s)
    assert s!=n,p
    open(p,'w').write(n)
slug='src/pages/blog/[slug].astro'
M={'backLinkTop':'cx(styles.backLink, styles.backLinkTop, marker)','backLink':'cx(styles.backLink, marker)','metaItem':'cx(styles.metaItem, styles.small, styles.muted)','thanks':'cx(styles.small, styles.muted)'}
def f(s):
    s=s.replace('import { post as classes } from "../../blog/post.view";\n','import { styles } from "../../blog/post.css";\n')
    s=s.replace('import Site from "../../layouts/site.astro";\n','import { cx } from "../../cx";\nimport Site from "../../layouts/site.astro";\nimport { marker } from "../../when";\n')
    return re.sub(r'\bclasses\.(\w+)',lambda m:M.get(m[1],'styles.'+m[1]),s)
sub(slug,f)
for n,k in (('prose-p','p'),('prose-h2','h2')):
    sub(f'src/blog/{n}.astro',lambda s:s.replace('import { prose } from "./post.view";','import { proseStyles } from "./post.css";').replace(f'prose.{k}',f'proseStyles.{k}'))
D={'host':'drawerHost','guard':'guard','button':'tocButton','overlay':'overlay','content':'drawer','panel':'drawerPanel','handle':'handle','body':'drawerBody','title':'drawerTitle','scroll':'drawerScroll'}
sub('src/blog/toc-drawer.astro',lambda s:re.sub(r'(?<![-\w/])drawer\.(\w+)',lambda m:'styles.'+D[m[1]],s.replace('import { drawer } from "./post.view";','import { styles } from "./post.css";')))
sub('src/blog/toc-drawer.client.ts',lambda s:s.replace('import { FADE_TRANSITION, SLIDE_TRANSITION } from "./post.view";\nimport { SLIDE_MS } from "./post.css";','import { EASE, SLIDE, SLIDE_MS } from "./post.css";').replace('// Vaul\'s drag rules','const SLIDE_TRANSITION = `transform ${SLIDE} ${EASE}`;\nconst FADE_TRANSITION = `opacity ${SLIDE} ${EASE}`;\n\n// Vaul\'s drag rules',1))
os.remove('src/blog/post.view.ts')
open('src/blog/table-of-contents.view.ts','w').write('''import { cx } from "../cx";
import { styles } from "./table-of-contents.css";

/** The class of a table-of-contents link, which the client swaps as the active entry moves. */
export const tocLink = (active: boolean) => cx(styles.link, active ? styles.active : styles.idle);
''')
T={'list':'cx(styles.list, marker)','ghost':'cx(styles.layer, styles.ghost)','link':'tocLink'}
sub('src/blog/table-of-contents.astro',lambda s:re.sub(r'\btoc\.(\w+)',lambda m:T.get(m[1],'styles.'+m[1]),s.replace('import { toc } from "./table-of-contents.view";','import { cx } from "../cx";\nimport { marker } from "../when";\nimport { styles } from "./table-of-contents.css";\nimport { tocLink } from "./table-of-contents.view";')))
sub('src/blog/table-of-contents.client.ts',lambda s:s.replace('import { toc } from "./table-of-contents.view";','import { tocLink } from "./table-of-contents.view";').replace('toc.link(','tocLink('))
