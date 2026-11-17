const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] }); const p = await b.newPage();
  await p.addInitScript(() => { Object.defineProperty(Navigator.prototype, 'getGamepads', { value(){ throw new DOMException("Failed to execute 'getGamepads' on 'Navigator': Access to the feature \"gamepad\" is disallowed by permissions policy.", 'SecurityError'); } }); });
  let errs = 0; p.on('pageerror', e => { errs++; console.log('ERR', e.message); });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html'));
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  const r = await p.evaluate(() => window.__eg.sim(['KeyW'], 2)); await p.waitForTimeout(3000);
  console.log('errors:', errs, 'walked to', r); await b.close(); })();
