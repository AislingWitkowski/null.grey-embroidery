// click checks: stand somewhere, face something, click the middle of the screen, read the line that comes up
const { chromium } = require('playwright'); const path = require('path');
const C = [
  ['a canopy column', [17.6, 4.13, 90, 0]], ['a bulb (looking up)', [18, 6.6, 0, 1.02]], ['the hanging sign', [16.3, 7.2, 0, 0.6]],
  ['the name board', [27.85, 4.6, 0, 0]], ['the bench, once', [11.7, 6.6, 180, -0.75]], ['the bench, again (sit)', [11.7, 6.6, 180, -0.75]],
  ['the poster', [14.6, 6.6, 180, 0.05]], ['the line map', [18, 6.6, 180, 0.12]], ['the timetable', [20.7, 6.6, 180, 0.05]],
  ['a door', [16.5, 6.6, 180, 0.0]], ['a window', [13.5, 6.6, 180, 0.12]], ['the payphone', [8.65, 11.0, 0, 0.05]],
  ['the bin', [26.2, 6.6, 180, -0.5]], ['the drinks machine (opens its close-up)', [27.43, 6.0, 180, 0]], ['the street lamp', [30.87, 9.5, 0, 0.1]],
  ['a telephone pole', [11.1, 3.4, 0, 0.1]], ['the back wall', [17, 14.4, 0, 0.1]], ['the shed', [27, 10.6, 0, 0.1]], ['nothing (too far)', [33, 6, 90, 0]],
];
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:640, height:360 } }); let errs = 0;
  p.on('pageerror', e => { errs++; console.log('ERR', String(e.stack).slice(0, 300)); });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed');
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  await p.evaluate(() => { window.__eg.pause(true); window.__eg.soundOn(); });
  for (const [name, s] of C) {
    const line = await p.evaluate(s => { const E = window.__eg, P = E.P; P.x = s[0]; P.z = s[1]; P.yaw = s[2]*Math.PI/180; P.pitch = s[3]; P.y = (s[0] > 9 && s[0] < 32 && s[1] > 3 && s[1] < 8) ? 0 : E.ground(s[0], s[1]); P.sit = false; P.eye = 1.55;
      window.EG_SEAM.closeAll(); document.getElementById('caption').textContent = ''; E.renderOnce(); return E.tapCenter(); }, s);
    console.log(name.padEnd(26), '→', line ? line.slice(0, 90) : '(nothing)');
  }
  await p.evaluate(() => { window.__eg.pause(false); });
  await p.waitForTimeout(3000);
  console.log('cc line:', await p.evaluate(() => document.getElementById('ccline').textContent), '| errors:', errs);
  await b.close();
})();
