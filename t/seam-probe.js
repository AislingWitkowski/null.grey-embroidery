// the Seam bridge on its own: load it, put a few things in the pocket, open it, take a picture
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport:{ width:960, height:540 } });
  p.on('pageerror', e => console.log('ERR', String(e.message).slice(0, 200), String(e.stack).split('\n')[1]));
  p.on('console', m => { if (m.type() === 'error') console.log('CON', m.text().slice(0, 200)); });
  await p.goto('file:///tmp/seamprobe.html'); await p.waitForTimeout(800);
  console.log(await p.evaluate(() => JSON.stringify(window.__probe || null)));
  const r = await p.evaluate(() => { const ids = Object.keys(window.__ART || {}); const E = EG_SEAM; ['quarter', 'newspaper', 'smile', 'pass'].forEach(id => { try { E.pocket.put(id); } catch (e) {} });
    let t = 0; (function f(){ E.step(performance.now(), 1/60); t++; if (t < 2000) requestAnimationFrame(f); })(); E.pocket.open(); return { have:E.pocket.have(), open:E.pocket.isOpen() }; });
  console.log(JSON.stringify(r));
  await p.waitForTimeout(3500); await p.screenshot({ path:process.argv[2] || '/tmp/pk.png' });
  await b.close(); })();
