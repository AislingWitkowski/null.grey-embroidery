// the pocket must open straight away and the page must not freeze while the Embroidery looks are made: node t/pocket-speed.js
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:1280, height:720 } }); let errs = 0; p.on('pageerror', e => { errs++; console.log('ERR', String(e.stack).slice(0,300)); });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed', { timeout:300000 });
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:300000 });
  await p.evaluate(() => { ['passport','quarter','newspaper','smile','f_pit','f_mm_choco','pass','multipass'].forEach(id => { try { window.EG_SEAM.pocket.put(id); } catch (e) {} }); });
  const t0 = Date.now(); await p.evaluate(() => window.EG_SEAM.pocket.open()); const open = Date.now() - t0;
  let worst = 0; for (let i = 0; i < 40; i++) { const a = Date.now(); await p.evaluate(() => 1); worst = Math.max(worst, Date.now() - a); await p.waitForTimeout(250); }
  console.log('opened in ms:', open, '| longest freeze ms (test machine, no graphics card):', worst, '| looks made:', JSON.stringify(await p.evaluate(() => window.EG_SEAM.look.baked())), '| errors:', errs); await b.close(); })();
