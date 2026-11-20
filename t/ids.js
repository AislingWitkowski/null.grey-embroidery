// every thing in the list (t/things-ids.csv, a copy of nullgrey-lore claude/data/things-both-engines.csv) must still exist
// under the same id in the page's pocket art. A renamed or lost id would lose it from people's saved pockets.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const ids = fs.readFileSync('t/things-ids.csv', 'utf8').split('\n').slice(1).map(l => l.split(',')[0].trim()).filter(Boolean);
(async () => { const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:640, height:360 } });
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed', { timeout:300000 });
  await p.waitForFunction(() => window.EG_SEAM && window.EG_SEAM.look, null, { timeout:180000 });
  const have = new Set(await p.evaluate(() => window.EG_SEAM.look.ids()));
  const lost = ids.filter(i => !have.has(i)), extra = [...have].filter(i => !ids.includes(i));
  console.log('in the list:', ids.length, '| in the page:', have.size, '| MUST FIX, lost from the page:', lost.length ? lost.join(' ') : 'none');
  console.log('new in the page, not in the list yet (add them to the Sheet):', extra.length ? extra.join(' ') : 'none');
  await b.close(); process.exit(lost.length ? 1 : 0); })();
