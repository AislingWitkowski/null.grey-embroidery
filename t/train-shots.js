// pictures of the train in given states: node t/train-shots.js '[[state, front, doorK, x, z, yawDeg, pitch], ...]' PREFIX
const { chromium } = require('playwright'); const path = require('path');
const S = JSON.parse(process.argv[2]), pre = process.argv[3] || '/tmp/ts_';
(async () => { const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport:{ width:960, height:540 } });
  p.on('pageerror', e => console.log('ERR', String(e.stack).slice(0, 300)));
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed', { waitUntil:'domcontentloaded', timeout:120000 });
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  let i = 0; for (const s of S) { await p.evaluate(s => { const E = window.__eg, T = E.TR, P = E.P; E.pause(true); window.__frozen = true; T.state = s[0]; T.front = s[1]; T.doorK = s[2]; T.v = s[0] === "stopped" ? 0 : 5; T.t0 = 1e15; T.dir = s[7] || 1;
      E.trainTick(performance.now(), 0); T.state = s[0]; T.front = s[1]; T.doorK = s[2]; E.trainTick(performance.now(), 0);
      P.x = s[3]; P.z = s[4]; P.yaw = s[5]*Math.PI/180; P.pitch = s[6]; P.y = (P.x > 9 && P.x < 32 && P.z > 3 && P.z < 8) ? 0 : E.ground(P.x, P.z); E.renderOnce(); E.renderOnce(); }, s);
    await p.screenshot({ path:pre + (i++) + '.png' }); }
  await b.close(); })();
