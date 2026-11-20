// the pocket's Embroidery look: pictures of the pocket, a lifted thing, the passport open with stamps, and Seam's look to compare
const { chromium } = require('playwright'); const path = require('path');
const OUT = process.argv[2] || '/tmp/pl_';
(async () => { const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:1280, height:720 } }); let errs = 0;
  p.on('pageerror', e => { errs++; console.log('ERR', String(e.stack).slice(0, 300)); });
  await p.addInitScript(() => { try { localStorage.setItem('nullgrey.stamps', JSON.stringify(['tir', 'furusato'])); } catch (e) {} });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed');
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  await p.evaluate(() => { const S = window.EG_SEAM; ['passport', 'quarter', 'newspaper', 'smile', 'f_pit', 'f_mm_choco', 'pass', 'multipass', 'f_gc_mice_tin', 'f_mag_shojo', 'f_cam_torundesu', 'f_mozart', 'f_carton_momo'].forEach(id => { try { S.pocket.put(id); } catch (e) {} }); });
  await p.evaluate(() => window.EG_SEAM.pocket.open()); await p.waitForTimeout(6000);
  console.log('baked:', await p.evaluate(() => window.EG_SEAM.look.baked()));
  await p.screenshot({ path:OUT + 'open.png', timeout:300000 });
  for (const id of process.argv.slice(3).length ? process.argv.slice(3) : ['passport', 'smile', 'newspaper']) {
    console.log(id, await p.evaluate(i => window.EG_SEAM.look.lift(i), id)); await p.waitForTimeout(2500);
    await p.screenshot({ path:OUT + 'lift-' + id + '.png', timeout:300000 });
    if (id === 'passport') { await p.evaluate(() => window.EG_SEAM.look.yes()); await p.waitForTimeout(2500); await p.screenshot({ path:OUT + 'passport-open.png', timeout:300000 });
      await p.evaluate(() => window.EG_SEAM.look.off(true)); await p.waitForTimeout(800); await p.screenshot({ path:OUT + 'passport-open-seam.png', timeout:300000 }); await p.evaluate(() => window.EG_SEAM.look.off(false)); }
    await p.evaluate(() => { try { pkCx; } catch (e) {} }); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    await p.evaluate(() => { if (!window.EG_SEAM.pocket.isOpen()) window.EG_SEAM.pocket.open(); }); await p.waitForTimeout(800);
  }
  await p.evaluate(() => window.EG_SEAM.look.off(true)); await p.waitForTimeout(1500); await p.screenshot({ path:OUT + 'open-seam.png', timeout:300000 });
  console.log('errors:', errs); await b.close(); })();
