// click checks: stand somewhere, face something, click the middle of the screen, read the line that comes up
const { chromium } = require('playwright'); const path = require('path');
const C = [
  ['a canopy column', [17.6, 4.13, 90, 0]], ['a bulb (looking up)', [18, 6.6, 0, 1.02]], ['the hanging sign', [16.3, 7.2, 0, 0.6]],
  ['the name board', [27.85, 4.6, 0, 0]], ['the bench, once', [11.7, 6.6, 180, -0.75]], ['the bench, again (sit)', [11.7, 6.6, 180, -0.75]],
  ['the poster', [14.6, 6.6, 180, 0.05]], ['the line map', [18, 6.6, 180, 0.12]], ['the timetable', [20.7, 6.6, 180, 0.05]],
  ['a door', [16.5, 6.6, 180, 0.0]], ['a window', [13.5, 6.6, 180, 0.12]], ['the payphone', [8.65, 11.0, 0, 0.05]],
  ['the bin', [26.2, 6.6, 180, -0.5]], ['the drinks machine (opens its close-up)', [27.43, 6.0, 180, 0]], ['the street lamp', [30.87, 9.5, 0, 0.1]],
  ['a telephone pole', [11.1, 3.4, 0, 0.1]], ['the back wall', [17, 14.4, 0, 0.1]], ['the shed', [27, 10.6, 0, 0.1]], ['nothing (too far)', [33, 6, 90, 0]],
  /* (Nov 17, evening) everything carried over from the Seam version */
  ['the crossbuck', [37.94, 1.9, 180, 0.5]], ['the tunnel mouth', [38.6, 4.2, -90, 0.1]], ['the gold tree', [35.0, 6.2, -90, -0.1]], ['the tree by the west end', [6.2, 6.0, 90, -0.3]],
  ['the mileage sign', [28.5, 10.4, 180, 0.16]], ['the mailbox', [30.6, 20.24, -90, -0.35]], ['the cut pole (looking up)', [30.6, 17.58, -90, 1.0]], ['the newer pole', [31.0, 20.45, -90, 0.1]],
  ['the shed sign', [26.9, 6.3, 180, 0.35]], ['the tobacco window', [25.55, 6.6, 180, -0.1]], ['the jerry can', [26.55, 7.0, 180, -0.9]],
  ['the grass', [20, 16, 0, -0.6]], ['the road', [30, 14, 180, -0.7]], ['the corn', [20, 23.8, 180, -0.5]],
];
(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:640, height:360 } }); let errs = 0;
  p.on('pageerror', e => { errs++; console.log('ERR', String(e.stack).slice(0, 300)); });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed', { waitUntil:'domcontentloaded', timeout:120000 });
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
