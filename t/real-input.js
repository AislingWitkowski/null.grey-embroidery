// real mouse and keys, as a person uses the page: drag to look, walk with W, the pocket icon clicked open and shut,
// a thing in the pocket clicked, the sound and cc switches. reports errors and what changed.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:960, height:540 } }); let errs = 0;
  p.on('pageerror', e => { errs++; console.log('ERR', String(e.stack).slice(0, 400)); });
  p.on('console', m => { if (m.type() === 'error') console.log('CON', m.text().slice(0, 200)); });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed', { waitUntil:'domcontentloaded', timeout:120000 });
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  await p.waitForTimeout(2000);
  const st = () => p.evaluate(() => { const P = window.__eg.P; return [P.x, P.z, P.yaw, P.pitch].map(v => +v.toFixed(2)).join(' '); });
  console.log('start', await st());
  await p.mouse.move(480, 270); await p.mouse.down(); await p.mouse.move(380, 330, { steps:8 }); await p.mouse.up();
  console.log('after drag (look left and down)', await st());
  await p.keyboard.down('KeyW'); await p.waitForTimeout(1500); await p.keyboard.up('KeyW');
  console.log('after W 1.5 s', await st());
  /* what's under the pocket icon (bottom left) */
  const under = await p.evaluate(() => { const els = document.elementsFromPoint(40, 505); return els.slice(0, 4).map(e => e.tagName + '#' + e.id + '.' + (e.className && e.className.baseVal === undefined ? e.className : '')).join(' > '); });
  console.log('under the pocket icon:', under);
  await p.mouse.click(40, 505); await p.waitForTimeout(2500);
  console.log('pocket open after click:', await p.evaluate(() => window.EG_SEAM.pocket.isOpen()));
  await p.screenshot({ path:'/tmp/ri-open.png' });
  await p.mouse.click(480, 270); await p.waitForTimeout(1200); await p.screenshot({ path:'/tmp/ri-click.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(1200);
  console.log('pocket open after Escape:', await p.evaluate(() => window.EG_SEAM.pocket.isOpen()));
  await p.keyboard.press('KeyP'); await p.waitForTimeout(1500); console.log('open after P:', await p.evaluate(() => window.EG_SEAM.pocket.isOpen()));
  await p.keyboard.press('KeyP'); await p.waitForTimeout(1500); console.log('open after P again:', await p.evaluate(() => window.EG_SEAM.pocket.isOpen()));
  await p.keyboard.down('KeyW'); await p.waitForTimeout(1000); await p.keyboard.up('KeyW'); console.log('walk after pocket', await st());
  console.log('errors', errs); await b.close(); })();
