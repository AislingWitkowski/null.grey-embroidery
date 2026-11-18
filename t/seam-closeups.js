const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport:{ width:960, height:540 } });
  p.on('pageerror', e => console.log('ERR', String(e.message).slice(0, 200), String(e.stack).split('\n')[1]));
  await p.goto('file:///tmp/seamprobe.html'); await p.waitForTimeout(800);
  await p.evaluate(() => { const E = EG_SEAM; (function f(){ E.step(performance.now(), 1/60); requestAnimationFrame(f); })(); });
  for (const [k, x] of [['missing', 31], ['news', 12], ['vending', 27.4], ['vending', 28.2], ['dump', 15], ['pit', 12.6]]) {
    const r = await p.evaluate(([k, x]) => { EG_SEAM.where(x, 7, 0); const said = []; EG_SEAM.say = t => said.push(t); const h = EG_SEAM.click(k); return { h, said, cu:EG_SEAM.closeUpOpen() }; }, [k, x]);
    console.log(k, x, JSON.stringify(r).slice(0, 220));
    await p.waitForTimeout(2500); await p.screenshot({ path:'/tmp/cu-' + k + x + '.png' });
    await p.evaluate(() => EG_SEAM.closeAll());
    await p.evaluate(() => { const c = document.getElementById('f3close'); if (c) c.classList.remove('open'); const v = document.getElementById('fvm'); if (v) v.classList.remove('open'); });
  }
  await b.close(); })();
