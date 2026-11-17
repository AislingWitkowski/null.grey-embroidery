// pictures of an Embroidery page from fixed spots: node t/shots.js '[[x,z,yawDeg,pitch,look(1-3|4=split)],...]' PREFIX [page]
const { chromium } = require('playwright'); const path = require('path');
const shots = JSON.parse(process.argv[2]); const pre = process.argv[3] || 't/shot';
const page = process.argv[4] || 'dist/missing-mile-station.html';
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport:{ width:+(process.env.VW || 960), height:+(process.env.VH || 540) } });
  p.on('pageerror', e => console.log('ERR', String(e.stack).slice(0, 500)));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('CON', m.text().slice(0, 300)); });
  await p.goto('file://' + path.resolve(page) + '?fixed');
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000, polling:500 });
  await p.waitForTimeout(1500); let i = 0;
  for (const s of shots) {
    await p.evaluate(s => { const E = window.__eg; if (s[4] === 4) E.setSplit(); else E.setLook((s[4] || 1) - 1); const P = E.P; P.x = s[0]; P.z = s[1]; P.yaw = s[2]*Math.PI/180; P.pitch = s[3] || 0; P.y = s.length > 5 ? s[5] : Math.max(E.ground(s[0], s[1]), (s[0] > 9 && s[0] < 32 && s[1] > 3 && s[1] < 8) ? 0 : -9); P.vy = 0; }, s);
    await p.waitForTimeout(+(process.env.WAIT || 2500));
    await p.screenshot({ path:pre + (i++) + '.png' });
  }
  console.log(JSON.stringify(await p.evaluate(() => window.__eg.info())));
  await b.close();
})();
