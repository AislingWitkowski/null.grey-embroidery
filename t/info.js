// how heavy the picture is from a few spots: draw calls and triangles (the test machine has no graphics card, so no frame times)
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport:{ width:640, height:360 } });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed');
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  for (const s of [[33.2, 5.6, 82], [30, 14, 180], [20, 16, 117], [34, 5, -80], [17, 6.4, 20, 1]]) console.log(JSON.stringify(s), await p.evaluate(s => { const E = window.__eg; E.pause(true); if (s[3]) { const T = E.TR; T.state = "stopped"; T.front = T.STOP; T.t0 = 1e15; E.trainTick(performance.now(), 0); } E.P.x = s[0]; E.P.z = s[1]; E.P.yaw = s[2]*Math.PI/180; E.renderer.info.autoReset = false; E.renderer.info.reset(); E.renderOnce(); const r = E.renderer.info.render; return 'calls ' + r.calls + ' · triangles ' + r.triangles; }, s));
  await b.close(); })();
