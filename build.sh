#!/bin/bash
# builds dist/missing-mile-station.html: one self-contained page (the engine, three.js and the place, all inline)
set -e
cd "$(dirname "$0")"
npx esbuild src/main.js --bundle --format=iife --minify --target=es2020 --outfile=dist/bundle.js --log-level=warning
python3 - <<'PY'
page = open('tools/page.html').read(); js = open('dist/bundle.js').read().replace('</script', '<\\/script')
open('dist/missing-mile-station.html', 'w').write(page.replace('/*BUNDLE*/', js))
PY
rm dist/bundle.js
ls -la dist/missing-mile-station.html
