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
  ['path to the windmill, leg 1', [37.2, 17.2, -2.0344], ['KeyW'], 2150],   // should end near 39.6,18.4
  ['path to the windmill, leg 2', [39.6, 18.4, -1.7943], ['KeyW'], 1855],   // should end near 41.8,18.9
  ['path to the windmill, leg 3', [41.8, 18.9, -2.0344], ['KeyW'], 1687],   // should end near 43.6,19.8
  ['path to the windmill, leg 4', [43.6, 19.8, -1.6263], ['KeyW'], 1543],   // should end near 45.4,19.9
  ['path to the windmill, leg 5', [45.4, 19.9, -1.9380], ['KeyW'], 1260],   // should end near 46.7,20.4
  ['into the corn off the path (east)', [39, 14, -1.5708], ['KeyW'], 4000],   // should stop at x 40.8
  ['into the windmill\'s leg', [46.7, 19.78, -1.5708], ['KeyW'], 3000],   // should stop at the windmill's legs or the clearing's edge
];
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:480, height:270 } });
  p.on('pageerror', e => console.log('ERR', String(e.stack).slice(0, 400)));
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html'), { waitUntil:'domcontentloaded', timeout:120000 });
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  for (const [name, s, keys, ms] of cases) {
    await p.evaluate(s => { const P = window.__eg.P; P.x = s[0]; P.z = s[1]; P.yaw = s[2]; P.pitch = 0; P.vy = 0; P.y = window.__eg.ground(s[0], s[1]); if (s[0] > 9 && s[0] < 32 && s[1] > 3 && s[1] < 8) P.y = 0; }, s);
    const r = await p.evaluate(([k, ms]) => window.__eg.sim(k, ms/1000), [keys, ms]);
    console.log(name.padEnd(36), 'from', s.slice(0, 2).join(','), '→ x,y,z', r.join(', '));
  }
  await b.close();
})();
