const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] }); const p = await b.newPage();
  p.on('pageerror', e => console.log('ERR', String(e).slice(0, 300)));
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed');
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000, polling:500 });
  console.log(await p.evaluate(() => ['f3time','f3linemap','f3poster','f3phone','f3phoneSide','f3binBody','f3jcF','f3tag','f3shedSign','f3mile','f3mailS','f3mailF'].map(n => { const P = EG_SEAM.pic(n); if (!P) return n + ':none'; let s; try { s = P.svg(); } catch (e) { return n + ':ERR ' + e.message; } return n + ':' + s.length + ' vb ' + P.vbw + 'x' + P.vbh; }).join('\n')));
  await b.close(); })();
