// the edges of town (Nov 20): the fog crossing both ways (the real frame loop, a held key), and walking about the edges
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:480, height:270 } }); let errs = 0;
  p.on('pageerror', e => { errs++; console.log('ERR', String(e.stack).slice(0, 400)); });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html'), { waitUntil:'domcontentloaded', timeout:300000 });
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:300000 });
  const at = () => p.evaluate(() => { const P = window.__eg.P; return [P.x, P.z].map(v => +v.toFixed(2)); });
  const cap = () => p.evaluate(() => document.getElementById('caption').textContent);
  const put = (x, z, yaw) => p.evaluate(([x, z, yaw]) => { const P = window.__eg.P; P.x = x; P.z = z; P.yaw = yaw; P.pitch = 0; P.vy = 0; P.y = window.__eg.ground(x, z); }, [x, z, yaw]);
  const hold = async (key, ms) => { await p.keyboard.down(key); await p.waitForTimeout(ms); await p.keyboard.up(key); };
  /* 1. south down the road from the station, into the fog */
  await put(30, 23.7, Math.PI); await p.waitForTimeout(8000);   /* (the test machine draws a few frames a second: start on the crossing) */
  console.log('down the road, into the fog      →', JSON.stringify(await at()), '|', await cap());
  /* 2. walking about the edges */
  const cases = [
    ['into a canopy column at Lover\'s', [22, 159.2, Math.PI/2], ['KeyW'], 3000],        // west, toward the column at 19.6
    ['into the grocery\'s wall', [38, 179, -Math.PI/2], ['KeyW'], 5000],                    // east, toward x 42
    ['up the curb cut, step-free', [36, 175.9, -Math.PI/2], ['KeyW'], 3000],
    ['out into the corn (west)', [14, 180, Math.PI/2], ['KeyW'], 5000],                       // stops at x 8.2
    ['out into the corn (east, by the K)', [36, 200, -Math.PI/2], ['KeyW'], 6000],
  ];
  for (const [name, s, keys, ms] of cases) {
    await put(s[0], s[1], s[2]);
    const r = await p.evaluate(([k, ms]) => window.__eg.sim(k, ms/1000), [keys, ms]);
    console.log(name.padEnd(36), 'from', s.slice(0, 2).join(','), '→ x,y,z', r.join(', '));
  }
  /* 3. back north into the fog: back to the station */
  await put(30.2, 149.0, 0); await p.waitForTimeout(8000);
  console.log('back north into the fog         →', JSON.stringify(await at()), '|', await cap());
  /* 4. the clicks: each thing says its line */
  for (const [x, z, yaw, pitch, name] of [[23.0, 164.8, Math.PI/2, -0.3, 'a pump'], [19.2, 163.4, Math.PI/2, -0.05, 'Lover\'s door'], [40.6, 175.9, -Math.PI/2, -0.05, 'the grocery\'s door'], [33.8, 163.2, -Math.PI/2, -0.1, 'the photo kiosk'], [33.0, 23.6, Math.atan2(-(35.2 - 33.0), -(31.2 - 23.6)), 0.38, 'hell is real, from the field\'s edge']]) {
    await put(x, z, yaw); await p.evaluate(pt => { window.__eg.P.pitch = pt; }, pitch); await p.waitForTimeout(400);
    console.log(('click: ' + name).padEnd(36), '→', await p.evaluate(() => window.__eg.tapCenter()));
  }
  console.log('errors:', errs); await b.close();
})();
