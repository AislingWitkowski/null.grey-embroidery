// close-ups and Seam's click actions inside Embroidery: stand there, face it, click, picture
const { chromium } = require('playwright'); const path = require('path');
const C = [['the drinks machine', [27.43, 6.2, 180, -0.05], 'vend'], ['the clippings (its side)', [28.7, 7.6, 90, -0.05], 'clip'], ['the newspaper', [12.3, 6.9, 180, -0.95], 'news'],
           ['the missing poster', [31.0, 23.5, 218, 0.0], 'miss'], ['the dumpster', [15.0, 15.0, 0, -0.2], 'dump'], ['the dumpster again', [15.0, 15.0, 0, -0.2], 'dump2'], ['the pit', [12.665, 6.95, 180, -0.96], 'pit']];
(async () => { const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:960, height:540 } }); let errs = 0;
  p.on('pageerror', e => { errs++; console.log('ERR', String(e.stack).slice(0, 300)); });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed');
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  for (const [name, s, f] of C) {
    const r = await p.evaluate(s => { const E = window.__eg, P = E.P; E.pause(true); P.x = s[0]; P.z = s[1]; P.yaw = s[2]*Math.PI/180; P.pitch = s[3]; P.y = (s[0] > 9 && s[0] < 32 && s[1] > 3 && s[1] < 8) ? 0 : E.ground(s[0], s[1]); P.eye = 1.55;
      document.getElementById('caption').textContent = ''; E.renderOnce(); const line = E.tapCenter(); return { line, cu:window.EG_SEAM.closeUpOpen() }; }, s);
    console.log(name.padEnd(26), r.cu ? '[close-up open]' : '', (r.line || '').slice(0, 90));
    if (r.cu || name.indexOf('dumpster') >= 0) { await p.waitForTimeout(2500); await p.screenshot({ path:(process.argv[2] || '/tmp/cu') + '-' + f + '.png' }); }
    await p.evaluate(() => window.EG_SEAM.closeAll());
  }
  console.log('errors:', errs); await b.close(); })();
