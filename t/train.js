// the train, mechanically: it comes in and stops, the doors open, you walk in, choose a stop on the line map, the doors
// close, it pulls out with you on it, into the tunnel's dark, and the next page is asked for. then arriving by train.
// node t/train.js [PREFIX]   (pictures: PREFIX0.png …)
const { chromium } = require('playwright'); const path = require('path');
const pre = process.argv[2] || '/tmp/tr_';
const page = 'file://' + path.resolve('dist/missing-mile-station.html');
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:960, height:540 } }); let errs = 0;
  p.on('pageerror', e => { errs++; console.log('ERR', String(e.stack).slice(0, 400)); });
  await p.goto(page + '?fixed');
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  await p.evaluate(() => { window.__eg.pause(true); window.EG_SEAM.ride.go = (pg, at) => { window.__went = [pg, at]; }; window.EG_SEAM.ride.fade = () => {}; });
  let shot = 0; const snap = async (x, z, yaw, pitch, y) => { await p.evaluate(s => { const E = window.__eg, P = E.P; P.x = s[0]; P.z = s[1]; P.yaw = s[2]*Math.PI/180; P.pitch = s[3]; P.y = s[4] == null ? 0 : s[4]; window.__frozen = true; E.renderOnce(); E.renderOnce(); }, [x, z, yaw, pitch, y]); await p.screenshot({ path:pre + (shot++) + '.png' }); };
  /* 1. it comes in: run the clock until it stops */
  const r1 = await p.evaluate(() => { const E = window.__eg, T = E.TR; let now = performance.now(); T.next = now - 1; const log = [];
    E.P.x = 20; E.P.z = 5.5; E.P.y = 0; window.__frozen = true;
    for (let i = 0; i < 60*40; i++) { now += 1000/60; E.trainTick(now, 1/60); if (i % 120 === 0) log.push(T.state + ' ' + T.front.toFixed(1)); if (T.state === 'stopped' && T.doorK > 0.99) break; }
    window.__now = now; return { log:log.join(' | '), state:T.state, front:T.front, doorK:T.doorK }; });
  console.log('comes in:', r1.log); console.log('  →', r1.state, 'front', r1.front.toFixed(2), 'doors', r1.doorK.toFixed(2));
  await snap(17, 6.4, 20, 0.02);       // from the platform, looking along it
  await snap(36.5, 4.6, 120, 0.02);    // its front, from the east end
  /* 2. walk in through an open door (car 1's middle door, over the platform) */
  const x0 = await p.evaluate(() => { const T = window.__eg.TR; return T.front - T.L - 1*(T.L + T.G); });
  const dx = x0 + 4.35;
  const walk = await p.evaluate(dx => { const E = window.__eg; const P = E.P; P.x = dx; P.z = 3.7; P.y = 0; P.yaw = 0; P.pitch = 0;
    const r = E.sim(['KeyW'], 1.0); window.__frozen = true; E.trainTick(window.__now += 16, 0.016); return { at:r, said:document.getElementById('caption').textContent, boarded:E.TR.boarded }; }, dx);
  console.log('walk in:', JSON.stringify(walk));
  await snap(dx - 1.8, 2.1, -90, 0.0, 0.02);   // inside, looking down the car
  await snap(dx, 2.2, 180, 0.75, 0.02);     // looking up at the line map over the door
  /* 3. choose a stop: click the middle of the map */
  const chose = await p.evaluate(dx => { const E = window.__eg, P = E.P; P.x = dx; P.z = 2.2; P.y = 0.02; P.yaw = Math.PI; P.pitch = 0.75; window.__frozen = true; E.renderOnce(); const line = E.tapCenter(); return { line, chosen:E.TR.chosen }; }, dx);
  console.log('choose:', JSON.stringify(chose));
  /* 4. the doors close, it pulls out with you on it, into the dark, the next page */
  const ride = await p.evaluate(() => { const E = window.__eg, T = E.TR, P = E.P; let now = window.__now; const log = [];
    for (let i = 0; i < 60*40; i++) { now += 1000/60; E.trainTick(now, 1/60); if (i % 90 === 0) log.push(T.state + ' P.x ' + P.x.toFixed(1) + (P.riding ? ' riding' : '') + (T.dark ? ' dark' : '')); if (window.__went) break; }
    return { log:log.join(' | '), went:window.__went, said:document.getElementById('caption').textContent }; });
  console.log('ride:', ride.log); console.log('  → next page:', JSON.stringify(ride.went), '| last line:', ride.said);
  /* 5. arriving by train, from a Seam page */
  const p2 = await b.newPage({ viewport:{ width:960, height:540 } });
  p2.on('pageerror', e => { errs++; console.log('ERR2', String(e.stack).slice(0, 400)); });
  await p2.goto(page + '?arrive=train&tok=t' + Date.now());
  await p2.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  await p2.waitForTimeout(600);
  const arr = await p2.evaluate(() => { const E = window.__eg; E.pause(true); E.renderOnce(); return { state:E.TR.state, doorK:E.TR.doorK, P:[E.P.x, E.P.z].map(v => +v.toFixed(2)), said:document.getElementById('caption').textContent }; });
  console.log('arrive by train:', JSON.stringify(arr));
  await p2.screenshot({ path:pre + (shot++) + '.png' });
  console.log('errors:', errs);
  await b.close();
})();
