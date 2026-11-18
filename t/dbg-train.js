const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] }); const p = await b.newPage();
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed', { waitUntil:'domcontentloaded', timeout:120000 });
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  console.log(await p.evaluate(() => { const E = window.__eg, T = E.TR; E.pause(true); T.state = 'stopped'; T.front = T.STOP; T.t0 = performance.now() - 5000; E.trainTick(performance.now(), 0.016);
    const x = T.front - T.L - 1*(T.L + T.G) + 4.35;
    return JSON.stringify(T.solids.filter(s => s.x0 - 0.3 < x && s.x1 + 0.3 > x && s.z1 > 2.5).map(s => [s.x0.toFixed(2), s.x1.toFixed(2), s.y0, s.y1, s.z0.toFixed(2), s.z1.toFixed(2), s.door])) + ' doorK ' + T.doorK + ' x ' + x; }));
  await b.close(); })();
