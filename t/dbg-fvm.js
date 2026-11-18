const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport:{ width:960, height:540 } });
  p.on('pageerror', e => console.log('ERR', String(e.message).slice(0, 200)));
  p.on('console', m => console.log('CON', m.text().slice(0, 300)));
  await p.goto('file:///tmp/seamprobe.html'); await p.waitForTimeout(500);
  await p.evaluate(() => { EG_SEAM.where(27.4, 7, 0); EG_SEAM.click('vending'); });
  await p.waitForTimeout(3000);
  console.log(await p.evaluate(() => { const v = document.getElementById('fvm'); return JSON.stringify({ cls:v && v.className, disp:v && getComputedStyle(v).display, canv:!!document.getElementById('fvmv') }); }));
  await b.close(); })();
