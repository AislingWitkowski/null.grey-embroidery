const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:960, height:540 }, deviceScaleFactor:1.5 });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed');
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  await p.evaluate(() => { const E = window.__eg; E.pause(true); E.soundOn(); const P = E.P; P.x = 27.43; P.z = 6.0; P.yaw = Math.PI; P.pitch = 0; P.y = 0; E.renderOnce(); E.tapCenter(); E.renderOnce(); });
  await p.evaluate(() => { document.getElementById('ccline').textContent = '[the drinks machine hums]'; document.getElementById('ccline').style.opacity = '1'; });
  await p.waitForTimeout(1200); await p.screenshot({ path:process.argv[2] || 't/ui.png', timeout:300000 }); await b.close(); })();
