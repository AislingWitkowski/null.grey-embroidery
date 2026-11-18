#!/bin/bash
# builds dist/missing-mile-station.html: one self-contained page (the engine, three.js and the place, all inline)
set -e
cd "$(dirname "$0")"
python3 - <<'PY'
# her sound files (sounds/<slot>.mp3), packed into the page; none yet means the stand-ins play
import base64, glob, os, json
f = {os.path.splitext(os.path.basename(p))[0]: base64.b64encode(open(p, 'rb').read()).decode() for p in sorted(glob.glob('sounds/*.mp3'))}
open('src/sound-files.js', 'w').write('/* made by build.sh from sounds/ */\nexport const SOUND_FILES = ' + json.dumps(f) + ';\n')
print('sound files packed:', len(f))
PY
# Seam's shared pocket, copied as it is from null.grey-furusatostation when it's next to this repo (else the last copy)
if [ -d ../null.grey-furusatostation/src ]; then python3 tools/seam-shared.py ../null.grey-furusatostation; fi
npx esbuild src/main.js --bundle --format=iife --minify --target=es2020 --outfile=dist/bundle.js --log-level=warning
python3 - <<'PY'
page = open('tools/page.html').read(); js = open('dist/bundle.js').read().replace('</script', '<\\/script')
seam = open('src/seam-shared.txt', encoding='utf8').read().replace('</script', '<\\/script')
open('dist/missing-mile-station.html', 'w').write(page.replace('/*SEAM*/', seam).replace('/*BUNDLE*/', js))
PY
rm dist/bundle.js
ls -la dist/missing-mile-station.html
