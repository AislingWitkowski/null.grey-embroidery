// walking checks: each case starts somewhere, holds keys for a while, then reports where you ended up
const { chromium } = require('playwright'); const path = require('path');
const cases = [
  ['into the building wall', [17, 6, 0], ['KeyS'], 6000],          // yaw 0 faces north (-z); S walks south into the wall at z 8
  ['through a canopy column', [16.5, 5, Math.PI/2], ['KeyW'], 4000],
  ['down the ramp to the road', [30, 6.5, Math.PI], ['KeyW'], 7000],  // yaw pi faces south
  ['off the edge onto the track', [20, 4, 0], ['KeyW'], 3000],
  ['jump back up onto the platform', [20, 2.4, Math.PI], ['KeyW', 'Space'], 2500],
  ['run out into the field', [30, 12, Math.PI/2], ['KeyW', 'ShiftLeft'], 6000],
  ['walk south to the edge of the corn', [20, 18, Math.PI], ['KeyW'], 8000],
];
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:480, height:270 } });
  p.on('pageerror', e => console.log('ERR', String(e.stack).slice(0, 400)));
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html'));
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  for (const [name, s, keys, ms] of cases) {
    await p.evaluate(s => { const P = window.__eg.P; P.x = s[0]; P.z = s[1]; P.yaw = s[2]; P.pitch = 0; P.vy = 0; P.y = window.__eg.ground(s[0], s[1]); if (s[0] > 9 && s[0] < 32 && s[1] > 3 && s[1] < 8) P.y = 0; }, s);
    const r = await p.evaluate(([k, ms]) => window.__eg.sim(k, ms/1000), [keys, ms]);
    console.log(name.padEnd(36), 'from', s.slice(0, 2).join(','), '→ x,y,z', r.join(', '));
  }
  await b.close();
})();
