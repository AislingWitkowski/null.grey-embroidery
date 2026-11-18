// real clicks only: open a close-up (the machine's side, the clippings), then try to get out the way a person would:
// click it, click outside it, press Escape. same for the pocket: its icon, click outside, Escape.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:960, height:540 } }); let errs = 0;
  p.on('pageerror', e => { errs++; console.log('ERR', String(e.stack).slice(0, 300)); });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed', { waitUntil:'domcontentloaded', timeout:120000 });
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  const open = () => p.evaluate(() => window.EG_SEAM.closeUpOpen());
  const pk = () => p.evaluate(() => window.EG_SEAM.pocket.isOpen());
  const top = (x, y) => p.evaluate(([x, y]) => document.elementsFromPoint(x, y).slice(0, 3).map(e => e.tagName + '#' + e.id + '.' + (typeof e.className === 'string' ? e.className : '')).join(' > '), [x, y]);
  for (const [name, s] of [['clippings', [28.6, 7.55, 90, -0.1]], ['newspaper', [12.3, 6.9, 180, -0.75]], ['machine', [27.43, 6.0, 180, 0]]]) {
    await p.evaluate(s => { const E = window.__eg, P = E.P; P.x = s[0]; P.z = s[1]; P.yaw = s[2]*Math.PI/180; P.pitch = s[3]; P.y = 0; window.__frozen = true; E.renderOnce(); }, s);
    await p.mouse.click(480, 270); await p.waitForTimeout(1500);
    console.log(name, 'opened:', await open(), '| on top at the middle:', await top(480, 270));
    await p.screenshot({ path:'/tmp/rc-' + name + '.png' });
    await p.mouse.click(480, 270); await p.waitForTimeout(1200); console.log('  after clicking it:', await open());
    if (await open()) { await p.mouse.click(480, 270); await p.waitForTimeout(1200); console.log('  after clicking it again:', await open()); }
    if (await open()) { await p.mouse.click(30, 30); await p.waitForTimeout(1200); console.log('  after clicking outside:', await open()); }
    if (await open()) { const r = await p.evaluate(() => { const b = document.querySelector('#fvm.open #fvm-btns button, #f3close.open #f3c-btns button'); if (!b) return null; const q = b.getBoundingClientRect(); return [q.x + q.width/2, q.y + q.height/2]; }); if (r) { console.log('  step-back button, on top there:', await top(r[0], r[1])); await p.mouse.click(r[0], r[1]); await p.waitForTimeout(1200); console.log('  after its step-back button:', await open()); } }
    if (await open()) { await p.keyboard.press('Escape'); await p.waitForTimeout(1200); console.log('  after Escape:', await open()); }
    if (await open()) await p.evaluate(() => window.EG_SEAM.closeAll());
    await p.evaluate(() => { window.__frozen = false; });
  }
  console.log('pocket icon at', await top(40, 505));
  await p.mouse.click(40, 505); await p.waitForTimeout(2000); console.log('pocket open by icon:', await pk(), '| on top:', await top(40, 505), '/', await top(480, 270));
  await p.mouse.click(40, 505); await p.waitForTimeout(1500); console.log('  after clicking icon again:', await pk());
  if (await pk()) { await p.mouse.click(900, 60); await p.waitForTimeout(1500); console.log('  after clicking outside:', await pk()); }
  if (await pk()) { const r = await p.evaluate(() => { const b = document.getElementById('pk-back'); const q = b.getBoundingClientRect(); return [q.x + q.width/2, q.y + q.height/2, getComputedStyle(b).display]; }); console.log('  pk-back at', r, 'on top:', await top(r[0], r[1])); await p.mouse.click(r[0], r[1]); await p.waitForTimeout(1500); console.log('  after pk-back:', await pk()); }
  await p.screenshot({ path:'/tmp/rc-after.png' });
  console.log('errors', errs); await b.close(); })();
