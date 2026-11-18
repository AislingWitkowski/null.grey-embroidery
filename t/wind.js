// the trees in the wind: the same view, calm and in a full gust; counts how many pixels changed
const { chromium } = require('playwright'); const path = require('path'); const { PNG } = (() => { try { return require('pngjs'); } catch (e) { return {}; } })();
(async () => { const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:960, height:540 } }); let errs = 0; p.on('pageerror', e => { errs++; console.log('ERR', String(e).slice(0, 300)); });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed', { waitUntil:'domcontentloaded', timeout:120000 });
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  await p.evaluate(() => { const E = window.__eg; E.pause(true); E.setLook(0); const P = E.P; P.x = 4.9; P.z = 7.3; P.yaw = 10*Math.PI/180; P.pitch = 0.85; });
  const shot = async (g, f) => { await p.evaluate(g => { window.__gust = g; window.__eg.renderOnce(); }, g); await p.screenshot({ path:f }); };
  await shot(0, '/tmp/wind_0.png'); await shot(1, '/tmp/wind_1.png');
  console.log('errors', errs); await b.close(); })();
