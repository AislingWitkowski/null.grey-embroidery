#!/usr/bin/env python3
# Builds src/seam-shared.txt: Seam's shared pocket (and what it needs), copied as it is from null.grey-furusatostation,
# after seam/shim-pre.js and before seam/shim-post.js. The page runs it as a classic script beside Embroidery's own.
# Run: python3 tools/seam-shared.py ../null.grey-furusatostation
import sys, os
root = sys.argv[1] if len(sys.argv) > 1 else '../null.grey-furusatostation'
here = os.path.join(os.path.dirname(__file__), '..')
def rd(p): return open(os.path.join(root, p), encoding='utf8').read()
head = rd('src/f03/a-head-f03.html'); head = head[head.index('<script>') + 8:]
FILES = open(os.path.join(here, 'seam', 'files.txt')).read().split()
# head opens Seam's one big closure; the shim goes just inside it, so Seam's files see it as their own
i = head.index('(function(){') + len('(function(){')
snd = rd('src/f8-sound.js'); drk = '\n'.join(l for l in snd.split('\n') if l.startswith('var DRK_'))   # the pocket's food and drink kinds, word for word
def stmt(path, start):
    # one top-level statement, word for word: from the line starting with `start` until its brackets close and it ends in ;
    L = rd(path).split('\n'); i = next(k for k, l in enumerate(L) if l.startswith(start)); out = []; depth = 0
    for l in L[i:]:
        out.append(l); depth += l.count('{') + l.count('[') + l.count('(') - l.count('}') - l.count(']') - l.count(')')
        e = l.rstrip().split('/*')[0].rstrip()
        if depth <= 0 and (e.endswith(';') or e.endswith('}')): break
    return '\n'.join(out)
fig = '\n'.join([stmt('src/c8-objects.js', 'var FIGTALK'), stmt('src/c8-objects.js', 'var PASS_STATE'), stmt('src/c8-objects.js', 'try { var _fg'),   # the waiting passenger and the pass (the newspaper's hint reads them)
                  stmt('src/shared/cc.js', 'var CC_TEXT')])   # what each recorded sound says, written (for CC)
parts = [head[:i], open(os.path.join(here, 'seam', 'shim-pre.js')).read(), '/* ---- from src/f8-sound.js: the pocket\'s food and drink kinds ---- */\n' + drk, '/* ---- from src/c8-objects.js ---- */\n' + fig, '/* ---- from src/f03/a-head-f03.html (the inks and helpers) ---- */\n' + head[i:]]
for f in FILES: parts.append('/* ---- copied from null.grey-furusatostation/%s ---- */\n' % f + rd(f))
parts.append(open(os.path.join(here, 'seam', 'shim-post.js')).read())
js = '\n;\n'.join(parts)
open(os.path.join(here, 'src', 'seam-shared.txt'), 'w', encoding='utf8').write(js)
print('seam shared:', len(FILES), 'files,', len(js)//1024, 'KB')
