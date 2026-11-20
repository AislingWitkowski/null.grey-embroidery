// contact sheets of every pocket thing in its Embroidery look (20 a sheet), to look them over: node t/sheets.js /tmp/sh_
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const OUT = process.argv[2] || '/tmp/sh_', CELL = +(process.argv[3] || 300);
(async () => { const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:640, height:360 } }); let errs = 0; p.on('pageerror', e => { errs++; console.log('ERR', String(e).slice(0, 200)); });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed', { timeout:300000 });
  await p.waitForFunction(() => window.EG_SEAM && window.EG_SEAM.look, null, { timeout:180000 }); await p.waitForTimeout(3000);
  const ids = process.argv[4] ? process.argv[4].split(',') : await p.evaluate(() => window.EG_SEAM.look.ids());
  for (let i = +(process.env.FROM || 0); i < ids.length; i += 20) {
    const url = await p.evaluate(([chunk, cell]) => new Promise(r => window.EG_SEAM.look.sheet(chunk, cell, r)), [ids.slice(i, i + 20), CELL]);
    fs.writeFileSync(OUT + String(i/20).padStart(2, '0') + '.png', Buffer.from(url.split(',')[1], 'base64'));
  }
  console.log(ids.length, 'things,', Math.ceil(ids.length/20), 'sheets | errors:', errs); await b.close(); })();
