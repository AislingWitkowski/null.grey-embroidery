// the pocket at a given window size: open, with things in it, then a thing lifted (clicked), for looking at its text
// node t/pkshots.js W H PREFIX
const { chromium } = require('playwright'); const path = require('path');
const W = +process.argv[2] || 1280, H = +process.argv[3] || 800, pre = process.argv[4] || '/tmp/pks';
(async () => { const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:W, height:H } }); let errs = 0;
  p.on('pageerror', e => { errs++; console.log('ERR', String(e.stack).slice(0, 300)); });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed', { waitUntil:'domcontentloaded', timeout:120000 });
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  await p.evaluate(() => { const S = window.EG_SEAM; ['quarter', 'newspaper', 'smile', 'f_pit', 'f_mm_choco'].forEach(id => { try { S.pocket.put(id); } catch (e) {} }); window.__eg.pause(true); const P = window.__eg.P; P.x = 20; P.z = 6.2; P.yaw = 1.2; window.__eg.renderOnce(); });
  await p.evaluate(() => window.__eg.pause(false)); await p.keyboard.press('KeyP'); await p.waitForTimeout(3000);
  await p.screenshot({ path:pre + '-open.png' });
  await p.evaluate(() => window.EG_SEAM.liftFirst()); await p.waitForTimeout(2500);
  await p.screenshot({ path:pre + '-lift.png' });
  console.log('errors', errs); await b.close(); })();
