// THE TEXT CHECK (Aisling, Nov 18: "auto check the text boxes always and the font on everything to make sure its not running
// off or overlapping or running off an object or not running into a color that will not be readable")
//   node t/text.js            → checks, prints what's wrong, writes t/text-report.json; exits 1 if anything fails
// What it checks, at computer, tablet and phone sizes (phones count too; true exceptions go in t/text-allow.json, each
// with a reason, so nothing is skipped quietly):
//  1. words on the screen (captions, CC, pocket, close-ups, buttons): off the screen, cut off by their box, overlapping
//     other words, too faint against what's behind them (CC and captions: 4.5:1, the rest 3:1), sitting on busy detail;
//  2. words painted on things (every canvas fillText, Embroidery's and Seam's): running off the picture, overlapping,
//     too faint on their own background;
//  3. words in Seam's pictures (every FPIC <text>): running off the picture, overlapping, too faint.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const VIEWS = [['computer', 1440, 900], ['computer', 1280, 800], ['tablet', 1024, 768], ['tablet', 820, 1180], ['phone', 390, 844], ['phone', 844, 390]];
const ALLOW = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'text-allow.json'), 'utf8')); } catch (e) { return []; } })();
const allowed = f => ALLOW.some(a => (!a.kind || a.kind === f.kind) && (!a.text || (f.text || '').includes(a.text)) && (!a.where || (f.where || '').includes(a.where)) && (!a.size || a.size === f.size));

/* runs in the page before anything else: watch every word drawn on a canvas */
const CANVAS_HOOK = () => {
  const L = window.__txtLog = []; const seen = new Set(); let cid = 0; const ids = new WeakMap();
  const lum = (r, g, b) => { const f = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v + 0.055)/1.055, 2.4); }; return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b); };
  const parse = c => { if (typeof c !== 'string') return null; const cv = document.createElement('canvas').getContext('2d'); cv.fillStyle = '#000'; cv.fillStyle = c; const s = cv.fillStyle;
    if (s[0] === '#') return [parseInt(s.substr(1, 2), 16), parseInt(s.substr(3, 2), 16), parseInt(s.substr(5, 2), 16), 1];
    const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  for (const fn of ['fillText', 'strokeText']) {
    const orig = CanvasRenderingContext2D.prototype[fn];
    CanvasRenderingContext2D.prototype[fn] = function(t, x, y, mw){
      try {
        const cvs = this.canvas, txt = String(t); if (!txt.trim() || !cvs || cvs.width < 8) return orig.apply(this, arguments);
        if (!ids.has(cvs)) ids.set(cvs, ++cid); const id = ids.get(cvs);
        const m = this.measureText(txt), T = this.getTransform();
        const asc = m.actualBoundingBoxAscent || 0, desc = m.actualBoundingBoxDescent || 0, l = m.actualBoundingBoxLeft || 0, r = m.actualBoundingBoxRight || m.width;
        const pts = [[x - l, y - asc], [x + r, y - asc], [x - l, y + desc], [x + r, y + desc]].map(([px, py]) => [T.a*px + T.c*py + T.e, T.b*px + T.d*py + T.f]);
        const bx0 = Math.min(...pts.map(p => p[0])), bx1 = Math.max(...pts.map(p => p[0])), by0 = Math.min(...pts.map(p => p[1])), by1 = Math.max(...pts.map(p => p[1]));
        const key = id + '|' + txt + '|' + Math.round(bx0) + '|' + Math.round(by0);
        if (!seen.has(key) && L.length < 6000) { seen.add(key);
          let bg = null;
          try { const X0 = Math.max(0, Math.floor(bx0)), Y0 = Math.max(0, Math.floor(by0)), X1 = Math.min(cvs.width, Math.ceil(bx1)), Y1 = Math.min(cvs.height, Math.ceil(by1));
            if (X1 > X0 && Y1 > Y0 && (X1 - X0)*(Y1 - Y0) < 400000) { const d = this.getImageData(X0, Y0, X1 - X0, Y1 - Y0).data, ls = [];
              for (let i = 0; i < d.length; i += 16) if (d[i + 3] > 40) ls.push(lum(d[i], d[i + 1], d[i + 2])); ls.sort((a, b) => a - b); if (ls.length > 4) bg = ls[ls.length >> 1]; } } catch (e) {}
          const col = parse(fn === 'fillText' ? this.fillStyle : this.strokeStyle);
          L.push({ id, w:cvs.width, h:cvs.height, text:txt.slice(0, 60), box:[bx0, by0, bx1, by1], bg, fg:col ? lum(col[0], col[1], col[2]) : null, fga:(col ? col[3] : 1)*this.globalAlpha, px:Math.abs(by1 - by0) });
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  }
};

/* runs in the page: every word on the screen, where it is, its colour, whether a box cuts it off */
const DOM_SCAN = () => {
  const out = [], vw = innerWidth, vh = innerHeight;
  const vis = el => { for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; } return true; };
  const opac = el => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) o *= +getComputedStyle(e).opacity; return o; };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const byEl = new Map();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) { if (!n.textContent.trim()) continue; const el = n.parentElement; if (!el || el.closest('svg') || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue; if (!vis(el)) continue;
    const r = document.createRange(); r.selectNodeContents(n); const rs = [...r.getClientRects()].filter(q => q.width > 0.5 && q.height > 0.5); if (!rs.length) continue;
    const u = rs.reduce((a, q) => [Math.min(a[0], q.left), Math.min(a[1], q.top), Math.max(a[2], q.right), Math.max(a[3], q.bottom)], [1e9, 1e9, -1e9, -1e9]);
    const prev = byEl.get(el); byEl.set(el, prev ? [Math.min(prev[0], u[0]), Math.min(prev[1], u[1]), Math.max(prev[2], u[2]), Math.max(prev[3], u[3])] : u); }
  for (const [el, u] of byEl) {
    const s = getComputedStyle(el), m = s.color.match(/rgba?\(([^)]+)\)/), c = m ? m[1].split(',').map(Number) : [0, 0, 0];
    let clip = null; for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const as = getComputedStyle(a); if (/(hidden|clip|auto|scroll)/.test(as.overflow + as.overflowX + as.overflowY)) { const ar = a.getBoundingClientRect(); if (u[0] < ar.left - 1 || u[2] > ar.right + 1 || u[1] < ar.top - 1 || u[3] > ar.bottom + 1) { clip = a.id || a.className || a.tagName; break; } } }
    const name = (el.id ? '#' + el.id : el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : '')) + (el.closest('[id]') && el.closest('[id]') !== el ? ' in #' + el.closest('[id]').id : '');
    out.push({ name, text:el.textContent.trim().slice(0, 50), box:u, fg:c.slice(0, 3), fga:(c.length > 3 ? c[3] : 1)*opac(el), fs:parseFloat(s.fontSize), cc:!!el.closest('#caption,#ccline'), clip, el:[...byEl.keys()].indexOf(el) });
  }
  // nest: which items are inside which, so a word inside its own button isn't "overlapping" it
  const els = [...byEl.keys()]; for (const o of out) o.anc = els.map((e, i) => e !== els[o.el] && e.contains(els[o.el]) ? i : -1).filter(i => i >= 0);
  return { out, vw, vh };
};

/* runs in the page: every <text> in every Seam picture */
const SVG_SCAN = async () => {
  const res = [], S = window.EG_SEAM, F = {}; for (const n of (S && S.picNames ? S.picNames() : [])) F[n] = S.pic(n); const holder = document.createElement('div');
  holder.style.cssText = 'position:fixed;left:0;top:0;width:800px;height:800px;opacity:0;pointer-events:none;z-index:-1'; document.body.appendChild(holder);
  const lum = (r, g, b) => { const f = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v + 0.055)/1.055, 2.4); }; return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b); };
  const parse = c => { const x = document.createElement('canvas').getContext('2d'); x.fillStyle = '#000'; x.fillStyle = c; const s = x.fillStyle; if (s[0] === '#') return [parseInt(s.substr(1, 2), 16), parseInt(s.substr(3, 2), 16), parseInt(s.substr(5, 2), 16)]; const m = s.match(/rgba?\(([^)]+)\)/); return m ? m[1].split(',').map(Number) : null; };
  for (const k of Object.keys(F)) { const P = F[k]; if (!P || typeof P.svg !== 'function') continue; let inner; try { inner = P.svg(); } catch (e) { continue; } if (!inner || inner.indexOf('<text') < 0) continue;
    const W = 600, H = Math.round(600*P.vbh/P.vbw);
    holder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + P.vbw + ' ' + P.vbh + '" width="' + W + '" height="' + H + '">' + inner + '</svg>';
    const sv = holder.querySelector('svg'); if (!sv) continue; const R = sv.getBoundingClientRect(); const texts = [...sv.querySelectorAll('text')];
    const items = texts.map(t => { const q = t.getBoundingClientRect(); return { t, box:[q.left - R.left, q.top - R.top, q.right - R.left, q.bottom - R.top], text:t.textContent.slice(0, 40), fill:t.getAttribute('fill') || getComputedStyle(t).fill, op:+(t.getAttribute('opacity') || 1) }; }).filter(i => i.box[2] - i.box[0] > 0.5);
    // the picture without its words, to read what's behind each one
    const bare = inner.replace(/<text[\s\S]*?<\/text>/g, '');
    let pix = null; try { const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + P.vbw + ' ' + P.vbh + '" width="' + W + '" height="' + H + '">' + bare + '</svg>');
      await img.decode(); const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(img, 0, 0); pix = g.getImageData(0, 0, W, H).data; } catch (e) {}
    for (const it of items) { let bg = null;
      if (pix) { const ls = []; for (let y = Math.max(0, it.box[1] | 0); y < Math.min(H, it.box[3]); y += 2) for (let x = Math.max(0, it.box[0] | 0); x < Math.min(W, it.box[2]); x += 2) { const o = (y*W + x)*4; if (pix[o + 3] > 40) ls.push(lum(pix[o], pix[o + 1], pix[o + 2])); } ls.sort((a, b) => a - b); if (ls.length > 4) bg = ls[ls.length >> 1]; }
      const c = /^url|none/.test(it.fill) ? null : parse(it.fill);
      res.push({ pic:k, W, H, text:it.text, box:it.box, bg, fg:c ? lum(c[0], c[1], c[2]) : null, op:it.op, px:(it.box[3] - it.box[1]) }); } }
  holder.remove(); return res;
};

const ratio = (a, b) => (Math.max(a, b) + 0.05)/(Math.min(a, b) + 0.05);
const inter = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]))*Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
const area = a => Math.max(0, a[2] - a[0])*Math.max(0, a[3] - a[1]);
const lumOf = c => { const f = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v + 0.055)/1.055, 2.4); }; return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2]); };

(async () => {
  const b = await chromium.launch({ args:['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport:{ width:1280, height:800 } }); let errs = 0; p.on('pageerror', e => { errs++; console.log('ERR', String(e).slice(0, 200)); });
  await p.addInitScript(CANVAS_HOOK);
  await p.goto('file://' + path.resolve('dist/missing-mile-station.html') + '?fixed', { waitUntil:'domcontentloaded', timeout:120000 });
  await p.waitForFunction(() => document.getElementById('wait').classList.contains('gone'), null, { timeout:180000 });
  await p.evaluate(() => { const S = window.EG_SEAM; ['quarter', 'newspaper', 'smile', 'f_pit', 'f_mm_choco'].forEach(id => { try { S.pocket.put(id); } catch (e) {} }); });
  const F = []; const add = f => F.push(f);
  const LONG = 'someone left a newspaper on the bench, folded open. LOST & NEVER FOUND. you don\'t pick it up. it isn\'t yours, and it feels like it was left for someone.';
  const STATES = [
    ['walking', async () => {}],
    ['caption + cc', async () => { await p.evaluate(L => { const c = document.getElementById('caption'), l = document.getElementById('ccline'); c.textContent = L; c.className = ''; l.textContent = '[a gust: the corn rustles, the wires sing]'; l.style.opacity = '1'; }, LONG); }],
    ['train voice', async () => { await p.evaluate(() => { const c = document.getElementById('caption'); c.textContent = 'ドアが閉まります。ご注意ください · the doors are closing. please be careful.'; c.className = 'v-train'; }); }],
    ['pocket', async () => { await p.evaluate(() => window.EG_SEAM.pocket.open && window.EG_SEAM.pocket.open()); await p.keyboard.press('KeyP'); await p.waitForTimeout(2500); }],
    ['pocket, a thing lifted', async () => { await p.keyboard.press('KeyP'); await p.waitForTimeout(2500); await p.evaluate(() => window.EG_SEAM.liftFirst()); await p.waitForTimeout(2500); }],
    ['the clippings', async () => { await p.evaluate(() => { window.EG_SEAM.where(28.6, 7.5, 0); window.EG_SEAM.click('vending'); }); await p.waitForTimeout(1200); }],
    ['one clipping', async () => { await p.evaluate(() => { window.EG_SEAM.where(28.6, 7.5, 0); window.EG_SEAM.click('vending'); try { f3Focus(1); } catch (e) {} }); await p.waitForTimeout(1200); }],
    ['the newspaper', async () => { await p.evaluate(() => window.EG_SEAM.click('news')); await p.waitForTimeout(1200); }],
    ['the missing poster', async () => { await p.evaluate(() => { window.EG_SEAM.click('missing'); window.EG_SEAM.click('missing'); }); await p.waitForTimeout(1200); }],
    ['the drinks machine', async () => { await p.evaluate(() => { window.EG_SEAM.where(27.4, 6.0, 0); window.EG_SEAM.click('vending'); }); await p.waitForTimeout(2000); }],
  ];
  const reset = async () => { await p.evaluate(() => { try { window.EG_SEAM.closeAll(); } catch (e) {} try { window.EG_SEAM.pocket.close(); } catch (e) {} const c = document.getElementById('caption'); if (c) { c.className = 'off'; c.textContent = ''; } const l = document.getElementById('ccline'); if (l) l.style.opacity = '0';
    window.__eg.pause(true); const P = window.__eg.P; P.x = 20; P.z = 6.2; P.yaw = 1.2; P.pitch = 0; window.__eg.renderOnce(); }); await p.waitForTimeout(300); };

  for (const [size, w, h] of VIEWS) {
    await p.setViewportSize({ width:w, height:h }); await p.waitForTimeout(500);
    for (const [st, go] of STATES) {
      await reset(); await go(); await p.evaluate(() => window.__eg.renderOnce()); await p.waitForTimeout(400);
      const where = st + ' @ ' + size + ' ' + w + '×' + h;
      const { out } = await p.evaluate(DOM_SCAN);
      // what's behind the words: the same view with every word made invisible
      await p.addStyleTag({ content:'*{color:transparent!important;text-shadow:none!important;-webkit-text-stroke:0!important} .__shown{}' });
      const shot = await p.screenshot(); await p.evaluate(() => { const s = [...document.querySelectorAll('style')].pop(); if (s && s.textContent.includes('.__shown')) s.remove(); });
      const img = await bgSampler(shot, w, h);
      for (const o of out) {
        const [x0, y0, x1, y1] = o.box, label = `"${o.text}" (${o.name})`;
        if (x0 < -1 || y0 < -1 || x1 > w + 1 || y1 > h + 1) add({ kind:'off screen', size, where, text:o.text, what:label + ' runs off the screen' });
        if (o.clip) add({ kind:'cut off', size, where, text:o.text, what:label + ' is cut off by its box (' + o.clip + ')' });
        const B = img(o.box);
        if (B) { const fgL = lumOf(o.fg.map((v, i) => v*o.fga + B.rgb[i]*(1 - o.fga))), cr = ratio(fgL, B.lum), need = o.cc ? 4.5 : 3;
          if (cr < need) add({ kind:'faint', size, where, text:o.text, what:label + ` is hard to read: contrast ${cr.toFixed(1)}:1 (needs ${need}:1)` });
          if (B.busy > 0.11 && !o.cc) add({ kind:'busy', size, where, text:o.text, what:label + ' sits on busy detail (other words or a picture behind it)', note:true });
          if (B.busy > 0.11 && o.cc) add({ kind:'busy', size, where, text:o.text, what:label + ' (a caption) sits on busy detail' }); }
      }
      for (let i = 0; i < out.length; i++) for (let j = i + 1; j < out.length; j++) { const A = out[i], C = out[j]; if (A.anc.includes(C.el) || C.anc.includes(A.el)) continue;
        const I = inter(A.box, C.box); if (I > 6 && I > 0.08*Math.min(area(A.box), area(C.box))) add({ kind:'overlap', size, where, text:A.text + ' / ' + C.text, what:`"${A.text}" (${A.name}) overlaps "${C.text}" (${C.name})` }); }
    }
  }
  // words painted on things
  const cl = await p.evaluate(() => window.__txtLog || []);
  const byC = {}; for (const r of cl) (byC[r.id] = byC[r.id] || []).push(r);
  for (const id in byC) { const L = byC[id], single = L.filter(r => r.text.trim().length <= 1).length > L.length*0.6;   /* (a picture written letter by letter, by hand: its letters touch on purpose) */
    if (single) { const faint = L.filter(r => r.bg != null && r.fg != null && ratio(r.fg*r.fga + r.bg*(1 - r.fga), r.bg) < 2.2).length;
      if (false && faint > L.length*0.2) add({ kind:'faint handwriting', size:'any', where:'canvas ' + L[0].w + '×' + L[0].h, text:L.map(r => r.text).join('').slice(0, 40), what:`handwriting "${L.map(r => r.text).join('').slice(0, 40)}…": ${faint} of ${L.length} letters faint on their picture`, note:true });
      continue; }
    for (const r of L) { const [x0, y0, x1, y1] = r.box;
      if (x0 < -1.5 || y0 < -1.5 || x1 > r.w + 1.5 || y1 > r.h + 1.5) add({ kind:'runs off a picture', size:'any', where:'canvas ' + r.w + '×' + r.h, text:r.text, what:`"${r.text}" runs off its picture (${r.w}×${r.h})` });
      if (r.bg != null && r.fg != null && r.px >= 4) { const fgL = r.fg*r.fga + r.bg*(1 - r.fga), cr = ratio(fgL, r.bg); if (cr < 2.2) add({ kind:'faint on a picture', size:'any', where:'canvas ' + r.w + '×' + r.h, text:r.text, what:`"${r.text}" is faint on its picture: ${cr.toFixed(1)}:1` }); } }
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const A = L[i], C = L[j]; if (A.text === C.text) continue; const I = inter(A.box, C.box);
      if (I > 4 && I > 0.25*Math.min(area(A.box), area(C.box))) add({ kind:'overlap on a picture', size:'any', where:'canvas ' + A.w + '×' + A.h, text:A.text + ' / ' + C.text, what:`"${A.text}" overlaps "${C.text}" on a picture` }); } }
  // words in Seam's pictures
  const sv = await p.evaluate(SVG_SCAN);
  const byP = {}; for (const r of sv) (byP[r.pic] = byP[r.pic] || []).push(r);
  for (const k in byP) { const L = byP[k];
    for (const r of L) { const [x0, y0, x1, y1] = r.box;
      if (x0 < -1 || y0 < -1 || x1 > r.W + 1 || y1 > r.H + 1) add({ kind:'runs off a picture', size:'any', where:'Seam picture ' + k, text:r.text, what:`"${r.text}" runs off the picture ${k}` });
      if (r.bg != null && r.fg != null && r.px > 3) { const fgL = r.fg*r.op + r.bg*(1 - r.op), cr = ratio(fgL, r.bg); if (cr < 2.2) add({ kind:'faint on a picture', size:'any', where:'Seam picture ' + k, text:r.text, what:`"${r.text}" is faint in ${k}: ${cr.toFixed(1)}:1` }); } }
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const A = L[i], C = L[j]; const I = inter(A.box, C.box);
      if (I > 4 && I > 0.2*Math.min(area(A.box), area(C.box))) add({ kind:'overlap on a picture', size:'any', where:'Seam picture ' + k, text:A.text + ' / ' + C.text, what:`"${A.text}" overlaps "${C.text}" in ${k}` }); } }

  // report: the same problem at several sizes is one line, with its sizes listed
  const uniq = new Map(); for (const f of F) { const key = f.kind + '|' + f.what.replace(/contrast [\d.]+:1/, '') + '|' + (f.where || '').replace(/ @ .*/, ''); const u = uniq.get(key); if (u) { if (!u.sizes.includes(f.size)) u.sizes.push(f.size); } else uniq.set(key, { ...f, sizes:[f.size] }); }
  const all = [...uniq.values()], fails = all.filter(f => !f.note && !allowed(f)), notes = all.filter(f => f.note && !allowed(f)), ok = all.filter(f => allowed(f));
  fs.writeFileSync(path.join(__dirname, 'text-report.json'), JSON.stringify({ fails, notes, allowed:ok }, null, 1));
  const show = (t, L) => { if (!L.length) return; console.log('\n' + t + ' (' + L.length + ')'); for (const f of L) console.log(' - [' + f.kind + '] ' + f.what + '  · ' + (f.where || '').replace(/ @ .*/, '') + ' · ' + f.sizes.join(', ')); };
  show('MUST FIX', fails); show('to look at', notes); console.log('\nallowed on purpose: ' + ok.length + ' · page errors: ' + errs + ' · words checked: ' + cl.length + ' painted, ' + sv.length + ' in Seam pictures');
  await b.close(); process.exit(fails.length || errs ? 1 : 0);
})();

/* what's behind a box in a screenshot: its middle colour, and how busy it is (spread of brightness) */
async function bgSampler(buf, w, h){
  let PNG; try { PNG = require('pngjs').PNG; } catch (e) { return () => null; }
  const im = PNG.sync.read(buf), W = im.width, H = im.height, sx = W/w, sy = H/h, d = im.data;
  return box => { const ls = [], cs = []; const X0 = Math.max(0, Math.floor(box[0]*sx)), X1 = Math.min(W, Math.ceil(box[2]*sx)), Y0 = Math.max(0, Math.floor(box[1]*sy)), Y1 = Math.min(H, Math.ceil(box[3]*sy));
    for (let y = Y0; y < Y1; y += 1) for (let x = X0; x < X1; x += 1) { const o = (y*W + x)*4; const c = [d[o], d[o + 1], d[o + 2]]; const L = lumOf(c); ls.push(L); cs.push([L, c]); }
    if (ls.length < 4) return null; cs.sort((a, b) => a[0] - b[0]); ls.sort((a, b) => a - b); const mid = cs[cs.length >> 1];
    const q = (k) => ls[Math.min(ls.length - 1, Math.floor(ls.length*k))]; return { lum:mid[0], rgb:mid[1], busy:Math.sqrt(q(0.9)) - Math.sqrt(q(0.1)) }; };
}
