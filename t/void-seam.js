const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  for (const [page, x, y] of [['/home/claude/null.grey-furusatostation/mainstreet-test.html', 20, 3.5], ['/home/claude/null.grey-furusatostation/furusato-test.html', 20, 3.5], ['/home/claude/nullgrey-seam/test5.html', 20, 3.5]]) {
    const p = await b.newPage(); let err = 0; p.on('pageerror', e => { err++; console.log('ERR', String(e).slice(0, 200)); });
    await p.goto('file://' + page, { waitUntil:'domcontentloaded', timeout:120000 }); await p.waitForTimeout(8000);
    const r = await p.evaluate(([x, y]) => window.__eval ? window.__eval(`(function(x, y){ try { var row = -1; for (var cy = 0; cy < MH; cy++) if (cellAt(Math.floor(x), cy) === 't') row = cy; me.x = x; me.y = row + 1.6; for (var i = 0; i < 20; i++) moveBy(0, -0.1); return { trackRow:row, y:me.y.toFixed(2), cap:(document.getElementById('caption') || {}).textContent }; } catch (e) { return String(e); } })(` + x + ',' + y + ')') : 'no __eval', [x, y]);
    console.log(page.split('/').pop(), JSON.stringify(r), 'errors', err); await p.close(); }
  await b.close(); })();
