#!/usr/bin/env python3
# Copies Missing Mile's click lines (F3_SAYS) word for word from the Seam version into src/f03-says.js.
# The master lives in null.grey-furusatostation/src/f03/ (f03-road.js, plus later lines added in f03-3d3, f03-3d4,
# f03-details). Run again whenever they change:  python3 tools/copy-says.py ../null.grey-furusatostation
import re, sys, os
root = sys.argv[1] if len(sys.argv) > 1 else '../null.grey-furusatostation'
f03 = os.path.join(root, 'src', 'f03')
road = open(os.path.join(f03, 'f03-road.js')).read()
i = road.index('var F3_SAYS = {'); j = road.index('\n};', i) + 3
obj = road[i:j].replace('var F3_SAYS', 'export const F3_SAYS', 1)
extra = []
for fn in ['f03-3d2.js', 'f03-3d3.js', 'f03-3d4.js', 'f03-details.js']:
    for m in re.finditer(r"F3_SAYS\.(\w+) = (?:F3_SAYS\.\w+ \|\| )?(\[.*?\]);", open(os.path.join(f03, fn)).read()):
        extra.append("F3_SAYS.%s = %s;   /* (from %s) */" % (m.group(1), m.group(2), fn))
# the lines for the building's walls (from f03-road.js lookAction), kept word for word too
walls = {}
STR = r"'(?:[^'\\]|\\.)*'"
for key, pat in [('back', r"say\(\['the back of the station[^\]]*\]"), ('doors', r"say\(\['the doors are locked[^\]]*\]"),
                 ('window', r"say\((?='the window is dark)" + STR), ('plaque', r"say\((?='a small plaque)" + STR),
                 ('stucco', r"say\((?='stucco over brick)" + STR), ('road', r"say\((?='the road goes on into the dusk)" + STR),
                 ('sit', r"say\((?='you sit on the bench)" + STR),
                 ('windmill', r"say\(\['far out in the corn, an old windmill[^\]]*\]"), ('tunnel', r"say\(\['the line goes into the ground[^\]]*\]"),
                 ('fields', r"say\(\['the fields go on[^\]]*\]")]:
    m = re.search(pat, road); walls[key] = m.group(0)[4:] if m else None
out = ['/* copy of Missing Mile\'s click lines from null.grey-furusatostation/src/f03/ (the master lives there; Aisling\'s',
       '   and the Seam version\'s words, unchanged). made by tools/copy-says.py: run it again when they change. */', obj] + extra
out.append('export const F3_WALL = {')
for k, v in walls.items():
    if v is None: continue
    out.append('  %s: %s,' % (k, v if v.startswith('[') else '[' + v + ']'))
out.append('};')
open(os.path.join(os.path.dirname(__file__), '..', 'src', 'f03-says.js'), 'w').write('\n'.join(out) + '\n')
print('lines:', len(re.findall(r"^\s+\w+:\[", obj, re.M)), '+', len(extra), 'extra +', sum(1 for v in walls.values() if v), 'wall lines')
