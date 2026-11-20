// the pocket in Embroidery: load, put three things in, the icon, open it with P, a picture, close it, walk still works
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:960, height:540 } }); let errs = 0;
  p.on('pageerror', e => { errs++; console.log('ERR', String(e.stack).slice(0, 300)); });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed', { timeout:300000 });
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  console.log('pocket ready:', await p.evaluate(() => { const S = window.EG_SEAM; ['quarter', 'newspaper', 'smile'].forEach(id => S.pocket.put(id)); return S.pocket.art() + ' kinds of thing; holding ' + S.pocket.have().join(', '); }));
  await p.evaluate(() => { window.__eg.pause(true); const P = window.__eg.P; P.x = 20; P.z = 6.2; P.yaw = 1.2; window.__eg.renderOnce(); });
  await p.screenshot({ path:(process.argv[2] || '/tmp/pk') + '-closed.png', timeout:300000 });
  await p.evaluate(() => window.__eg.pause(false));
  await p.keyboard.press('KeyP'); await p.waitForTimeout(4000);
  console.log('open after P:', await p.evaluate(() => window.EG_SEAM.pocket.isOpen()));
  await p.screenshot({ path:(process.argv[2] || '/tmp/pk') + '-open.png', timeout:300000 });
  await p.evaluate(() => window.EG_SEAM.pocket.close()); await p.waitForTimeout(500);
  console.log('closed:', !(await p.evaluate(() => window.EG_SEAM.pocket.isOpen())), '| walk:', await p.evaluate(() => window.__eg.sim(['KeyW'], 1)), '| errors:', errs);
  await b.close(); })();
