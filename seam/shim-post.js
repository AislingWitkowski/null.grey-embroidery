/* ---- Seam's sound engine is here only for the pocket's own sounds (picking things up, cans, bottles, a bite, a
   wrapper). Embroidery has its own switch and its own world sounds, so Seam's switch is never made, its footsteps and
   tube hum are turned off, and its volume follows Embroidery's switch. ---- */
SND.el = document.createElement('button');   /* (never shown) */
sndStep = function(){};
var _egSndBuild = sndBuild;
sndBuild = function(){ _egSndBuild(); SND.master.gain.value = SND_VOL; };
var _egOneShot = sndOneShot;
sndOneShot = function(k){ var r = _egOneShot.apply(null, arguments); try { if (CC_TEXT[k]) EG_SEAM.cc(k, CC_TEXT[k]); } catch (e) {} return r; };
EG_SEAM.soundOn = function(heard, cc){
  SND.on = !!(heard || cc);
  if (SND.on) { try { if (!SND.ctx) sndBuild(); SND.ctx.resume(); SND.master.gain.setTargetAtTime(heard ? SND_VOL : 0, SND.ctx.currentTime, 0.05); } catch (e) {} }
  else if (SND.ctx) SND.master.gain.setTargetAtTime(0, SND.ctx.currentTime, 0.05);
};
/* ---- (Nov 19) EMBROIDERY'S LOOK FOR EVERYTHING IN THE POCKET. Aisling: "we need to keep stuff but make it look real
   and cool in embriodery". Every thing keeps its id, words and drawing (Seam's, the masters); only how it's drawn
   changes here, and only on Embroidery pages. Seam's own files are untouched.
   - Seam snaps a thing's drawing to the station's inks, pixel by pixel. Here the drawing stays smooth, and the inks
     only grade it (a quarter of each pixel's colour comes from its ink), so the palette holds.
   - Each part takes a material from its ink: silver, gold, brass and metal shine; rusted metal is rough; paper and
     cream get a fine fibre; glowing inks stay lit; everything else is a soft matte. Raised lines catch a light from
     the top left, edges darken a touch, and a barely-there grain sits over it all (real but unreal).
   - Foil (the passport, the pass, the moon water) gets a slow holographic band: silver, lavender, teal-grey, amber,
     with the slight blue lustre Aisling allowed for the holograms (Nov 17).
   - Stamps get real ink: ragged edges, uneven pressure, little gaps where the ink missed. Text stays readable.
   Anything without a drawing yet falls back to Seam's own way, so nothing is ever missing. ---- */
var EG_MAT = {}; RNAMES.forEach(function(n, i){ EG_MAT[i] = /^(silver|gold|metal|brass|hgold|hgilt|phone)$/.test(n) ? 1 : n === 'rustm' ? 4 : /^(paper|pwhite|hcream|bCream|plasterV|mintw)$/.test(n) ? 2 : /^(glowc|glowa|neon|pneon|plumglow|nullblue|hglrose|hglgreen|hglgold)$/.test(n) ? 3 : 0; });
function egNoise(i, j){ var n = Math.sin(i*12.9898 + j*78.233)*43758.5453; return n - Math.floor(n); }
function egBake(M, img, S, A){
  var INK = (A && A.ink) || (A && A.loud ? pkInkL : (A && A.green ? pkInkG : pkInk));
  var w = M.w*S, h = M.h*S, c = document.createElement('canvas'); c.width = w; c.height = h;
  var x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h);
  var id = x.getImageData(0, 0, w, h), d = id.data, L = new Float32Array(w*h), A = new Uint8Array(w*h);
  for (var k = 0; k < w*h; k++) { L[k] = (d[k*4]*0.3 + d[k*4 + 1]*0.59 + d[k*4 + 2]*0.11)/255; A[k] = d[k*4 + 3]; }
  var fm = document.createElement('canvas'); fm.width = w; fm.height = h; var fx = fm.getContext('2d'), fid = fx.createImageData(w, h), fd = fid.data, anyFoil = false;
  for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
    var k = j*w + i; if (A[k] < 8) continue;
    var r = d[k*4], g = d[k*4 + 1], b = d[k*4 + 2], q = INK(r, g, b), ri = q ? q[0] : -1, mt = ri >= 0 ? EG_MAT[ri] : 0;   /* (the inks read from this drawing itself, not Seam's, so a fixed drawing leaves no ghost) */
    if (ri >= 0) { var nR = RN[ri], ix = Math.min(nR - 1, Math.max(0, (q[1]*(nR - 1)) | 0)), ic = RF[ri*FOGN*RMAX + ix];   /* the ink grades it */
      r = r*0.75 + (ic & 255)*0.25; g = g*0.75 + ((ic >> 8) & 255)*0.25; b = b*0.75 + ((ic >> 16) & 255)*0.25; }
    if (mt === 3) { d[k*4] = r; d[k*4 + 1] = g; d[k*4 + 2] = b; continue; }   /* glowing: left lit */
    var lx = i > 0 ? L[k - 1] : L[k], rx = i < w - 1 ? L[k + 1] : L[k], uy = j > 0 ? L[k - w] : L[k], dy = j < h - 1 ? L[k + w] : L[k];
    var relief = ((lx - rx) + (uy - dy))*0.7;   /* raised lines catch the light from the top left */
    var edge = 0; if ((i > 1 && A[k - 2] < 60) || (i < w - 2 && A[k + 2] < 60) || (j > 1 && A[k - 2*w] < 60) || (j < h - 2 && A[k + 2*w] < 60)) edge = 1;
    var shade = 1 + 0.07*(0.5 - (i/w + j/h)/2)*2 - 0.1*edge, add = 0, grain = (egNoise(i, j) - 0.5)*0.035;
    if (mt === 1) { var band = Math.max(0, 1 - Math.abs((i/w)*0.8 + (j/h)*0.6 - 0.55)*4.5); add = 70*relief + 38*band*band + 18*relief*relief*9; shade *= 0.92 + 0.1*L[k]; }
    else if (mt === 4) { add = 30*relief; grain *= 3; }
    else if (mt === 2) { add = 22*relief; grain += (egNoise((i/3) | 0, j) - 0.5)*0.03 + (egNoise(i, (j/5) | 0) - 0.5)*0.02; }   /* paper fibre */
    else { add = 40*relief; }
    var f = shade*(1 + grain);
    d[k*4] = Math.max(0, Math.min(255, r*f + add)); d[k*4 + 1] = Math.max(0, Math.min(255, g*f + add*0.96)); d[k*4 + 2] = Math.max(0, Math.min(255, b*f + add*0.9));
    if (ri === R_SILVER || ri === R_GOLD || ri === R_PLUMGLOW) { fd[k*4 + 3] = A[k]; anyFoil = true; }
  }
  x.putImageData(id, 0, 0); if (anyFoil) fx.putImageData(fid, 0, 0);
  return { c:c, foil:anyFoil ? fm : null };
}
/* ---- (Nov 19, later) EMBROIDERY'S FIXES TO THE DRAWINGS. Aisling: "some things arent connected or are not quite like
   right … the top is a little weird". Seam's pixels hid small faults that the smooth look shows. These change only how
   a thing is drawn in Embroidery; its id and words are Seam's, untouched.
   - Words go on top: a word drawn before a picture that then covered it (Apple on its carton, watermelon, the candy
     names under their fruit) is moved to the end of its own group, so it sits over the picture; where it was covered,
     it gets a faint edge in the opposite tone so it reads.
   - Cans get a real top: the shoulder narrows into a neck, a rolled rim, the lid sunk inside it, the tab lying on the lid.
   - Ink bottles get a neck between the glass and the cap; the cap is ribbed, not a black block.
   - The wind bells' wishes are written down the paper strip, as on a real 風鈴 (they ran off it sideways).
   - The onigiri's tear line stays on the wrapper. ---- */
var EG_CANTOP = function(x0, x1, y){   /* a can's top, its body from x0 to x1, the body starting at y */
  var cx = (x0 + x1)/2, w = x1 - x0, rx = w*0.42, ny = y - 2.2;
  return '<path d="M' + x0 + ' ' + (y + 0.6) + ' C' + x0 + ' ' + (y - 0.8) + ' ' + (cx - rx - 0.4) + ' ' + (ny + 0.9) + ' ' + (cx - rx) + ' ' + ny + ' L' + (cx + rx) + ' ' + ny + ' C' + (cx + rx + 0.4) + ' ' + (ny + 0.9) + ' ' + x1 + ' ' + (y - 0.8) + ' ' + x1 + ' ' + (y + 0.6) + ' Z" fill="#b9b8b4"/>' +
    '<path d="M' + (x0 + 0.6) + ' ' + (y + 0.3) + ' C' + (x0 + 0.6) + ' ' + (y - 0.6) + ' ' + (cx - rx) + ' ' + (ny + 1.2) + ' ' + (cx - rx + 0.6) + ' ' + (ny + 0.5) + '" stroke="#ffffff" stroke-opacity="0.45" stroke-width="0.4" fill="none"/>' +
    '<ellipse cx="' + cx + '" cy="' + ny + '" rx="' + rx + '" ry="' + (w*0.07) + '" fill="#dddcd8" stroke="#8f8e8a" stroke-width="0.3"/>' +
    '<ellipse cx="' + cx + '" cy="' + (ny + 0.15) + '" rx="' + (rx - 1) + '" ry="' + (w*0.07 - 0.45) + '" fill="#b4b3af"/>' +
    '<rect x="' + (cx - 2.6) + '" y="' + (ny - 0.55) + '" width="5.6" height="1.3" rx="0.65" fill="#cfcecb" stroke="#8f8e8a" stroke-width="0.2"/><ellipse cx="' + (cx - 1.4) + '" cy="' + (ny + 0.1) + '" rx="0.7" ry="0.32" fill="#5e5d5a"/><circle cx="' + (cx + 0.9) + '" cy="' + (ny + 0.1) + '" r="0.32" fill="#8f8e8a"/>';
};
var EG_FIX_STR = [
  [/<rect x="3" y="3" width="26" height="4" fill="#b7b4ae"\/>(.*?)<ellipse cx="16" cy="3.6" rx="12.6" ry="1.4" fill="#cfccc6"\/><rect x="11" y="2.4" width="7" height="1.6" rx="0.8" fill="#8c8983"\/>/, function(m, mid){ return '<rect x="3" y="5" width="26" height="2" fill="#a9a6a0"/>' + mid + EG_CANTOP(3, 29, 5.4); }],   /* Seam's cans (pkCan) */
  [/<path d="M4 6 Q4 2 16 2 Q28 2 28 6 Z" fill="#c7c6c3"\/><ellipse cx="16" cy="3" rx="11" ry="1.6" fill="#e5e4e0"\/><rect x="12.4" y="1.8" width="7" height="2" rx="1" fill="#a9a8a5"\/><circle cx="14" cy="2.8" r="0.6" fill="#6c6c6a"\/>/, function(){ return EG_CANTOP(3, 29, 6); }],   /* the drinks machine's and kiosk's cans */
  [/<rect x="5" y="2" width="20" height="4" rx="1" fill="#bdbab3"\/>/, function(){ return EG_CANTOP(4, 26, 5.4); }],   /* the tall can */
  [/<rect x="13" y="4" width="14" height="10" fill="#1e1714"\/>/, function(){ return '<path d="M12 14.4 Q12 12.6 15 12.4 L25 12.4 Q28 12.6 28 14.4 Z" fill="#000000" fill-opacity="0.28"/><rect x="15" y="10" width="10" height="3" fill="#2e2622" opacity="0.85"/>' +
    '<rect x="13" y="3" width="14" height="7.6" rx="1.4" fill="#3a302a"/>' + [0, 1, 2, 3, 4, 5, 6].map(function(i){ return '<rect x="' + (14.2 + i*1.8) + '" y="3.6" width="0.7" height="6.4" fill="#000000" opacity="0.28"/>'; }).join('') + '<rect x="13.6" y="3.4" width="12.8" height="0.9" rx="0.45" fill="#ffffff" opacity="0.18"/>'; }],   /* ink bottles: a neck, and a ribbed cap */
  [/<rect x="34" y="2" width="5" height="4" fill="#1e1714"\/>/, function(){ return '<rect x="33" y="4.6" width="7" height="1.6" rx="0.4" fill="#1e1714"/><rect x="34.2" y="2.6" width="4.6" height="2.6" rx="1" fill="#2e2824"/><rect x="34.6" y="2.9" width="3.6" height="0.6" rx="0.3" fill="#ffffff" opacity="0.2"/>'; }],   /* the disposable camera's shutter button, sitting on its body */
  [/<path d="M2 4 L42 38" stroke="/, function(){ return '<path d="M10.5 11.2 L36 32.8" stroke="'; }]   /* the onigiri's tear line, kept on the wrapper */
];
function egFixSvg(id, svg){
  for (var i = 0; i < EG_FIX_STR.length; i++) svg = svg.replace(EG_FIX_STR[i][0], EG_FIX_STR[i][1]);
  return svg;
}
function egFixDom(id, root){   /* words on top; the wind bells' wishes down their strips */
  var ts = root.querySelectorAll('text');
  for (var i = 0; i < ts.length; i++) {
    var t = ts[i], par = t.parentNode, after = false;
    for (var n = t.nextSibling; n; n = n.nextSibling) if (n.nodeType === 1 && n.tagName !== 'text' && n.tagName !== 'defs') { after = true; break; }
    if (!after) continue;
    par.appendChild(t);
    var f = (t.getAttribute('fill') || (t.style && t.style.fill) || '#000').trim(), m = f.match(/^#([0-9a-f]{6})$/i), lum = 0;
    if (m) { var v = parseInt(m[1], 16); lum = (((v >> 16) & 255)*0.3 + ((v >> 8) & 255)*0.59 + (v & 255)*0.11)/255; }
    var fs = parseFloat((t.style && t.style.fontSize) || t.getAttribute('font-size') || '3') || 3;
    t.setAttribute('stroke', lum > 0.5 ? '#000000' : '#ffffff'); t.setAttribute('stroke-opacity', '0.35'); t.setAttribute('stroke-width', (fs*0.14).toFixed(2)); t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke-linejoin', 'round');
  }
  var T = function(fn){ var a = root.querySelectorAll('text'); for (var k = 0; k < a.length; k++) fn(a[k], a[k].textContent || ''); };
  var gsz = function(t){ return parseFloat((t.style && t.style.fontSize) || t.getAttribute('font-size') || '3') || 3; }, ssz = function(t, v){ t.setAttribute('font-size', v.toFixed(2)); if (t.style) t.style.fontSize = v.toFixed(2) + 'px'; };
  var fit = function(t, maxW){ var len = (t.textContent || '').length, sz = gsz(t), cjk = /[\u3000-\u9fff]/.test(t.textContent || ''), w = len*sz*(cjk ? 1 : 0.58); if (w > maxW) ssz(t, sz*maxW/w); };
  var html = root.outerHTML || '';
  if (/^f_carton_/.test(id)) T(function(t){ if (t.getAttribute('y') === '28') { t.setAttribute('y', '22.8'); fit(t, 22); } });   /* the carton's name above its picture, not on it */
  if (html.indexOf('M3 6 L37 6 Q39 28 37 49 L3 49 Q1 28 3 6 Z') >= 0) T(function(t){ if (t.getAttribute('y') === '43') t.setAttribute('y', '46.6'); if (t.getAttribute('y') === '20') fit(t, 33); });   /* pillow bags: the small name below the picture; the big one inside the bag */
  if (id === 'f_cam_torundesu' || id === 'f_cam_flash') T(function(t){ if (t.getAttribute('y') === '26') { t.setAttribute('x', '30.5'); fit(t, 20); } });   /* the small words kept on the camera */
  if (id === 'f_album') T(function(t, c){ if (c === 'アルバム') fit(t, 24); });
  if (id === 'f_waxbottles') { var g = root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('transform', 'translate(22 15) scale(0.92) translate(-25 -15.5)'); while (root.firstChild) g.appendChild(root.firstChild); root.appendChild(g); }   /* all five bottles inside the picture */
  if (id === 'f_gematogen') T(function(t, c){ if (c === 'ГЕМАТОГЕН') { t.setAttribute('x', '26.5'); fit(t, 30); } });
  if (id === 'f_taffy') { var el = root.querySelectorAll('ellipse'); for (var k = 0; k < el.length; k++) { var cy = el[k].getAttribute('cy'); if (cy === '18') el[k].setAttribute('cy', '20.3'); if (cy === '5') el[k].setAttribute('cy', '4.6'); } }
  if (id === 'f_stolichnye') { var pth = root.querySelectorAll('path'); for (var k = 0; k < pth.length; k++) { var d = pth[k].getAttribute('d') || ''; if (/^M18,30|^M13,20/.test(d)) pth[k].setAttribute('transform', 'translate(20 3) scale(0.84) translate(-20 -3)'); } T(function(t){ fit(t, 14); }); }
  if (id === 'f_shirousagi') T(function(t){ if (+t.getAttribute('y') > 45) t.setAttribute('y', '44'); });
  if (id === 'f_mag_shojo') T(function(t, c){ if (/^ribbon moon/.test(c)) { t.setAttribute('x', '15'); ssz(t, 1.8); } });
  if (/^f_furin/.test(id)) { var all = root.querySelectorAll('text'); for (var k = 1; k < all.length; k++) all[k].parentNode.removeChild(all[k]); }
  if (/^f_furin/.test(id)) { var w = root.querySelector('text'); if (w) { var len = (w.textContent || '').replace(/\s/g, '').length || 1, sz = Math.min(2.8, 33/len);
    w.setAttribute('x', '20'); w.setAttribute('y', '36'); w.setAttribute('writing-mode', 'tb'); w.setAttribute('style', (w.getAttribute('style') || '').replace(/font-size:[^;]*;?/, '') + ';writing-mode:vertical-rl;text-orientation:upright;font-size:' + sz.toFixed(2) + 'px'); w.setAttribute('font-size', sz.toFixed(2)); w.setAttribute('text-anchor', 'start'); w.removeAttribute('stroke'); } }
}
var EG_CLOVER = function(){   /* four heart-shaped leaves joined at the middle, as a real clover's are (Seam's floated apart) */
  var s = ''; for (var i = 0; i < 4; i++) { var big = i === 1, L = big ? 10.5 : 9, W = big ? 6.2 : 5.4;
    s += '<g transform="translate(20 18) rotate(' + (i*90 + 45) + ')"><path d="M0,0 C' + (-W*0.3) + ',' + (-L*0.35) + ' ' + (-W*1.15) + ',' + (-L*0.7) + ' ' + (-W*0.55) + ',' + (-L) + ' C' + (-W*0.2) + ',' + (-L*1.12) + ' 0,' + (-L*0.95) + ' 0,' + (-L*0.82) + ' C0,' + (-L*0.95) + ' ' + (W*0.2) + ',' + (-L*1.12) + ' ' + (W*0.55) + ',' + (-L) + ' C' + (W*1.15) + ',' + (-L*0.7) + ' ' + (W*0.3) + ',' + (-L*0.35) + ' 0,0 Z" fill="' + (i % 2 ? '#6a7040' : '#727846') + '"/><path d="M0,-0.6 L0,' + (-L*0.78) + '" stroke="#959469" stroke-width="0.5"/><path d="M' + (-W*0.32) + ',' + (-L*0.6) + ' Q0,' + (-L*0.72) + ' ' + (W*0.32) + ',' + (-L*0.6) + '" stroke="#a8a878" stroke-width="0.6" fill="none" opacity="0.7"/></g>'; }
  return '<rect width="40" height="40" fill="none"/><path d="M20,19 Q22,30 26,37" stroke="#6e7440" stroke-width="1.2" fill="none" stroke-linecap="round"/>' + s + '<circle cx="20" cy="18" r="1.1" fill="#5e6436"/>';
};
var EG_ART = { f_clover:EG_CLOVER, f_clover_b:function(){ return '<g transform="translate(40 0) scale(-1 1)" opacity="0.8">' + EG_CLOVER() + '</g>'; } };
/* ---- (Nov 20) HAND-MADE EMBROIDERY LOOKS, from Aisling's photos of the real things (described in doc 50, not kept).
   Each keeps its id and every word Seam's drawing has; only the drawing is new. No blue anywhere; faces our own. ---- */
(function(){
  var J = 'Hiragino Sans,Noto Sans JP,Yu Gothic,sans-serif', E = 'Helvetica Neue,Arial,sans-serif', SER = 'Georgia,Times New Roman,serif', R = 'Hiragino Maru Gothic ProN,Arial Rounded MT Bold,sans-serif';
  var tx = function(t, x, y, sz, fill, o){ o = o || {}; return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || 'middle') + '" font-family="' + (o.f || J) + '" font-weight="' + (o.w || 800) + '" font-size="' + sz + '" fill="' + fill + '"' + (o.st ? ' stroke="' + o.st + '" stroke-width="' + (o.sw || sz*0.18) + '" paint-order="stroke" stroke-linejoin="round"' : '') + (o.tf ? ' transform="' + o.tf + '"' : '') + (o.ls ? ' letter-spacing="' + o.ls + '"' : '') + (o.it ? ' font-style="italic"' : '') + '>' + t + '</text>'; };
  var sh = function(id, x, y, w, h, k){ return '<defs><linearGradient id="sh' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.35" stop-color="#fff" stop-opacity="' + (k || 0.35) + '"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="0.7" stop-color="#fff" stop-opacity="' + ((k || 0.35)*0.4) + '"/><stop offset="0.78" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#sh' + id + ')"/>'; };
  var crimpV = function(x, y0, y1, w, col, n){ var s = '', h = (y1 - y0)/n; for (var i = 0; i < n; i++) s += 'L' + (x + (i % 2 ? 0 : w)) + ' ' + (y0 + h*(i + 0.5)).toFixed(2) + ' '; return '<path d="M' + x + ' ' + y0 + ' ' + s + 'L' + x + ' ' + y1 + ' Z" fill="' + col + '"/>'; };
  var crimpH = function(y, x0, x1, h, col, n){ var s = '', w = (x1 - x0)/n; for (var i = 0; i <= n; i++) s += 'L' + (x0 + w*i).toFixed(2) + ' ' + (y + (i % 2 ? h : 0)) + ' '; return '<path d="M' + x0 + ' ' + (y + h/2) + ' ' + s + 'L' + x1 + ' ' + (y + h/2) + ' Z" fill="' + col + '"/>'; };
  var dots = function(x, y, w, h, st, r, col, op){ var s = ''; for (var j = 0; j*st < h; j++) for (var i = 0; i*st < w; i++) s += '<circle cx="' + (x + i*st + (j % 2 ? st/2 : 0)).toFixed(2) + '" cy="' + (y + j*st).toFixed(2) + '" r="' + r + '"/>'; return '<g fill="' + col + '" opacity="' + (op || 0.25) + '">' + s + '</g>'; };
  var rnd = function(n){ var x = Math.sin(n*12.9898)*43758.5453; return x - Math.floor(x); };
  var seed = function(x, y, a){ return '<ellipse cx="' + x + '" cy="' + y + '" rx="0.45" ry="0.8" fill="#1e1714" transform="rotate(' + a + ' ' + x + ' ' + y + ')"/>'; };
  var A = {};

  A.f_taffy = function(){   /* a long stretchy bar: crimped ends, watermelon pink with black seeds, a round badge in the middle */
    var s = crimpV(0.5, 4, 20, 3.5, '#e0505e', 10) + '<path d="M59.5 4 ' + (function(){ var p = ''; for (var i = 0; i < 10; i++) p += 'L' + (i % 2 ? 59.5 : 56) + ' ' + (4 + 1.6*(i + 0.5)) + ' '; return p; })() + 'L59.5 20 Z" fill="#e0505e"/>';
    s += '<rect x="4" y="4" width="52" height="16" fill="#e2566a"/><rect x="4" y="4" width="52" height="2.2" fill="#c43a50"/><rect x="4" y="17.8" width="52" height="2.2" fill="#c43a50"/>';
    for (var i = 0; i < 22; i++) s += seed(6 + rnd(i)*48, 6.5 + rnd(i + 40)*11, rnd(i + 80)*60 - 30);
    s += '<circle cx="30" cy="12" r="6.4" fill="#5a2a48"/><circle cx="30" cy="12" r="5.4" fill="#7a3a5e"/><circle cx="28" cy="10.6" r="1.1" fill="#f2f0ea"/><circle cx="32" cy="10.6" r="1.1" fill="#f2f0ea"/><circle cx="28.2" cy="10.8" r="0.5" fill="#1e1714"/><circle cx="32.2" cy="10.8" r="0.5" fill="#1e1714"/><path d="M26.6 13.2 Q30 17.2 33.4 13.2 Z" fill="#c43a50"/><path d="M27.4 13.4 L32.6 13.4" stroke="#f2f0ea" stroke-width="0.6"/><path d="M27 6.8 l1 -1.6 l1 1.4 l1 -1.8 l1 1.8 l1 -1.4 l1 1.6" stroke="#f0d84a" stroke-width="0.7" fill="none"/>';
    s += '<text y="12.6" font-family="' + E + '" font-weight="900" font-size="4.4" fill="#f2f0ea" stroke="#7a1e30" stroke-width="0.9" paint-order="stroke" stroke-linejoin="round"><tspan x="14.4" text-anchor="middle">Laughing</tspan><tspan x="45.6" text-anchor="middle"> Taffy</tspan></text>' + tx('watermelon · a joke inside', 16, 17.6, 1.9, '#f0d84a', { f:E, w:800, st:'#7a1e30', sw:0.4 });
    return s + sh('tf', 4, 4, 52, 16, 0.4);
  };
  A.f_crescentpie = function(){   /* a round scalloped chocolate cake in a clear wrapper; a crescent moon on it */
    var s = '<rect x="1" y="3" width="38" height="34" rx="1" fill="#e8e4dc" opacity="0.22"/>' + crimpH(1.2, 1, 39, 2.2, '#e8e4dc', 24).replace('fill=', 'opacity="0.35" fill=') + crimpH(36.6, 1, 39, 2.2, '#e8e4dc', 24).replace('fill=', 'opacity="0.35" fill=');
    var sc = ''; for (var i = 0; i < 28; i++) { var a = i/28*Math.PI*2; sc += (i ? 'L' : 'M') + (20 + Math.cos(a)*16.4).toFixed(2) + ' ' + (20 + Math.sin(a)*16.4).toFixed(2) + ' Q' + (20 + Math.cos(a + Math.PI/28)*17.8).toFixed(2) + ' ' + (20 + Math.sin(a + Math.PI/28)*17.8).toFixed(2) + ' ' + (20 + Math.cos(a + Math.PI/14)*16.4).toFixed(2) + ' ' + (20 + Math.sin(a + Math.PI/14)*16.4).toFixed(2) + ' '; }
    s += '<path d="' + sc + 'Z" fill="#3e2418"/><circle cx="20" cy="20" r="14.6" fill="#4a2c1e"/>';
    for (var k = 0; k < 40; k++) s += '<circle cx="' + (8 + rnd(k)*24).toFixed(1) + '" cy="' + (8 + rnd(k + 9)*24).toFixed(1) + '" r="' + (0.3 + rnd(k + 3)*0.5).toFixed(2) + '" fill="#2e1a12" opacity="0.6"/>';
    s += '<path d="M24 8.4 A11 11 0 1 0 31 25 A8.6 8.6 0 1 1 24 8.4 Z" fill="#f0d84a"/><path d="M20.4 21 q1.6 1.2 3 0" stroke="#5e4a20" stroke-width="0.5" fill="none"/><circle cx="21.6" cy="18.6" r="0.5" fill="#5e4a20"/>';
    s += '<path d="M7 27 Q20 33 33 27 L32 30.4 Q20 36 8 30.4 Z" fill="#c8402e"/>' + tx('crescent pie', 20, 31.6, 2.6, '#f2f0ea', { f:SER, w:700, it:true });
    s += tx('三日月パイ', 18, 13.4, 4.2, '#f2ece0', { w:900, st:'#2e1a12', sw:0.7 });
    return s + sh('cp', 1, 3, 38, 34, 0.45);
  };
  A.f_rockcandy = function(){   /* crystals grown on a stick, in a clear bag with a card folded over the top */
    var s = '<rect x="11" y="11" width="2" height="49" rx="0.8" fill="#d8c09a"/><rect x="12.1" y="11" width="0.5" height="49" fill="#b89a6e"/>';
    for (var i = 0; i < 70; i++) { var y = 13 + rnd(i)*31, w = 7.6 - Math.abs(y - 26)*0.14, x = 12 + (rnd(i + 50) - 0.5)*w*2, r = 1.2 + rnd(i + 90)*1.6, c = ['#e8789a', '#f0a0b8', '#f6c8d6', '#d85a80', '#fbe0e8'][i % 5];
      s += '<path d="M' + x.toFixed(2) + ' ' + (y - r).toFixed(2) + ' L' + (x + r*0.9).toFixed(2) + ' ' + (y - r*0.2).toFixed(2) + ' L' + (x + r*0.5).toFixed(2) + ' ' + (y + r).toFixed(2) + ' L' + (x - r*0.6).toFixed(2) + ' ' + (y + r*0.7).toFixed(2) + ' L' + (x - r).toFixed(2) + ' ' + (y - r*0.3).toFixed(2) + ' Z" fill="' + c + '" opacity="0.9"/><path d="M' + x.toFixed(2) + ' ' + (y - r).toFixed(2) + ' L' + (x + r*0.9).toFixed(2) + ' ' + (y - r*0.2).toFixed(2) + '" stroke="#fff" stroke-width="0.3" opacity="0.7"/>'; }
    s += '<rect x="0.8" y="7" width="22.4" height="52.4" fill="#ece8e2" opacity="0.18"/><path d="M0.8 59.4 L23.2 59.4" stroke="#fff" opacity="0.4" stroke-width="0.4"/>';
    s += '<rect x="0.8" y="0.6" width="22.4" height="9.4" fill="#f2c8d4"/><rect x="0.8" y="8.6" width="22.4" height="1.4" fill="#e09ab0"/><circle cx="12" cy="3.2" r="1.3" fill="#2a2024"/><path d="M4 6.6 q8 -2.4 16 0" stroke="#c8406a" stroke-width="0.9" fill="none"/>';
    return s + sh('rc', 0.8, 7, 22.4, 52.4, 0.5);
  };
  A.f_kiskis = function(){   /* a small square toffee in its paper: the cat by the brick chimney */
    var s = '<path d="M5 8 L9 4 L33 4 L29 8 Z" fill="#d8443a"/><path d="M29 8 L33 4 L33 24 L29 28 Z" fill="#9a2420"/><rect x="5" y="8" width="24" height="20" fill="#c8302a"/>';
    s += '<path d="M5 8 l2 -2 M10 8 l1.6 -2.4 M15 8 l1.6 -2.2 M20 8 l1.4 -2.4 M25 8 l1.8 -2" stroke="#7a1a18" stroke-width="0.4"/>';
    s += '<rect x="8" y="10" width="17" height="14" fill="#f2ece0"/>';
    for (var r = 0; r < 6; r++) for (var c = 0; c < 2; c++) s += '<rect x="' + (8.4 + c*2.2 + (r % 2)*1.1) + '" y="' + (10.6 + r*2.2) + '" width="2" height="2" fill="#a82a24" stroke="#5e1410" stroke-width="0.25"/>';
    s += '<path d="M16 22 Q15 16 17.6 15 L18 13 L19.2 14.6 L20.6 14.6 L21.8 13 L22 15.2 Q23.6 16.6 22.8 19 Q24.6 21 22.4 22 Z" fill="#1e1714"/><path d="M22.4 22 q3 0 2.6 -4" stroke="#1e1714" stroke-width="0.9" fill="none"/><circle cx="19.6" cy="16.6" r="0.4" fill="#f0d84a"/><circle cx="21.2" cy="16.6" r="0.4" fill="#f0d84a"/>';
    s += tx('ирис', 12, 26.8, 2.2, '#f2ece0', { f:SER, w:700 }) + tx('КИС-КИС', 21, 26.8, 2.6, '#f2ece0', { f:SER, w:900 });
    return s + sh('kk', 5, 8, 24, 20, 0.25);
  };
  A.f_rubychoc = function(){   /* a long pink box with a window: two pink squares, a star pressed in each */
    var s = '<path d="M3 6 L7 2 L58 2 L54 6 Z" fill="#f4c8d2"/><path d="M54 6 L58 2 L58 16 L54 20 Z" fill="#d898a8"/><rect x="3" y="6" width="51" height="14" fill="#f0b4c4"/>';
    s += '<rect x="36" y="7.6" width="16" height="10.8" rx="1" fill="#6a3040"/>';
    [[37, 8.6], [44.6, 8.6]].forEach(function(p){ s += '<rect x="' + p[0] + '" y="' + p[1] + '" width="6.8" height="8.8" rx="1.4" fill="#d07890"/><rect x="' + (p[0] + 0.7) + '" y="' + (p[1] + 0.7) + '" width="5.4" height="7.4" rx="1" fill="#e08ca2"/>'; for (var i = 0; i < 4; i++) { var a = i*Math.PI/4, cx = p[0] + 3.4, cy = p[1] + 4.4; s += '<path d="M' + (cx - Math.cos(a)*1.8).toFixed(2) + ' ' + (cy - Math.sin(a)*1.8).toFixed(2) + ' L' + (cx + Math.cos(a)*1.8).toFixed(2) + ' ' + (cy + Math.sin(a)*1.8).toFixed(2) + '" stroke="#f6cad6" stroke-width="0.35"/>'; } });
    s += '<rect x="36" y="7.6" width="16" height="10.8" rx="1" fill="none" stroke="#c87088" stroke-width="0.5"/>';
    s += tx('Ruby', 18, 14.4, 7, '#a83a5a', { f:SER, w:700, it:true, st:'#fbe0e8', sw:0.6 }) + tx('ルビー · naturally pink', 18, 18.4, 2.1, '#a83a5a', { f:E, w:700 });
    return s + sh('rb', 3, 6, 51, 14, 0.3);
  };
  A.f_gematogen = function(){   /* a pink flow wrapper: the name in letters of every colour, a sun at its end */
    var s = crimpV(0.5, 4, 20, 3.5, '#f0a0b8', 10) + '<path d="M59.5 4 ' + (function(){ var p = ''; for (var i = 0; i < 10; i++) p += 'L' + (i % 2 ? 59.5 : 56) + ' ' + (4 + 1.6*(i + 0.5)) + ' '; return p; })() + 'L59.5 20 Z" fill="#f0a0b8"/>';
    s += '<rect x="4" y="4" width="52" height="16" fill="#f2a8c0"/><path d="M4 6.2 L56 6.2" stroke="#fbd8e4" stroke-width="0.5"/>';
    for (var i = 0; i < 9; i++) s += '<path d="M' + (6 + rnd(i)*46).toFixed(1) + ' ' + (5 + rnd(i + 7)*14).toFixed(1) + ' l0.4 0.8 l0.9 0.1 l-0.7 0.6 l0.2 0.9 l-0.8 -0.5 l-0.8 0.5 l0.2 -0.9 l-0.7 -0.6 l0.9 -0.1 Z" fill="#fbe8f0" opacity="0.8"/>';
    s += '<circle cx="51" cy="10" r="3.4" fill="#f0b83a"/>'; for (var k = 0; k < 10; k++) { var a = k/10*Math.PI*2; s += '<path d="M' + (51 + Math.cos(a)*3.9).toFixed(2) + ' ' + (10 + Math.sin(a)*3.9).toFixed(2) + ' L' + (51 + Math.cos(a)*5.2).toFixed(2) + ' ' + (10 + Math.sin(a)*5.2).toFixed(2) + '" stroke="#e8603e" stroke-width="0.9" stroke-linecap="round"/>'; }
    var cols = ['#c8402e', '#e8803e', '#86bb69', '#f0b83a', '#a1465a', '#e05aa0', '#6e9a4a', '#e8603e', '#c8402e'], word = 'ГЕМАТОГЕН';
    for (var j = 0; j < word.length; j++) s += tx(word[j], 7.6 + j*4.2, 13.6 + (j % 2 ? -0.4 : 0.4), 5.2, cols[j], { f:E, w:900, st:'#f2f0ea', sw:0.7 });
    s += tx('классическая', 26, 18.4, 2.2, '#a1465a', { f:E, w:700 });
    return s + sh('gm', 4, 4, 52, 16, 0.4);
  };
  A.f_peachgummy = function(){   /* a stand-up bag full of peaches, striped bands top and bottom, a hang hole */
    var s = '<clipPath id="pgc"><rect x="3" y="2" width="34" height="50"/></clipPath><rect x="3" y="2" width="34" height="50" rx="1" fill="#f4c0b0"/><g clip-path="url(#pgc)">';
    [[10, 16, 9], [30, 18, 8], [12, 40, 10], [30, 42, 9], [22, 30, 9]].forEach(function(p, i){ s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + ['#f6c6a8', '#f0a890', '#f4b8a0', '#f6ccb0', '#f2b09a'][i] + '"/><path d="M' + p[0] + ' ' + (p[1] - p[2]*0.8) + ' Q' + (p[0] - p[2]*0.3) + ' ' + p[1] + ' ' + p[0] + ' ' + (p[1] + p[2]*0.8) + '" stroke="#e08878" stroke-width="0.5" fill="none" opacity="0.7"/><circle cx="' + (p[0] + p[2]*0.3) + '" cy="' + (p[1] - p[2]*0.2) + '" r="' + (p[2]*0.5) + '" fill="#e8786a" opacity="0.35"/>'; });
    s += '</g><path d="M24 10 Q31 6 36 11 Q30 13 24 10 Z" fill="#5e8a4a"/><path d="M24 10 L35 10.6" stroke="#3e6a3a" stroke-width="0.3"/>';
    for (var b = 0; b < 2; b++) { var y = b ? 47.4 : 2.4; s += '<rect x="3" y="' + y + '" width="34" height="4.2" fill="#f2ece8"/><rect x="3" y="' + (y + 0.6) + '" width="34" height="0.8" fill="#d8406a"/><rect x="3" y="' + (y + 1.8) + '" width="34" height="0.5" fill="#c8c4c0"/><rect x="3" y="' + (y + 2.8) + '" width="34" height="0.8" fill="#d8406a"/>'; }
    s += '<circle cx="20" cy="7.6" r="1.4" fill="#2a2024"/>';
    s += tx('ピーチグミ', 20, 27, 6.4, '#ffffff', { w:900, st:'#b8203e', sw:1.6 }) + tx('peach gummy candy', 20, 32.4, 2.6, '#ffffff', { f:E, w:900, st:'#a8203e', sw:0.7 });
    return s + sh('pg', 3, 2, 34, 50, 0.3);
  };
  A.f_flowerlolly = function(){   /* a pressed sakura of clear sugar on a stick, in cellophane twisted at its neck */
    var s = '<rect x="18.8" y="32" width="2.4" height="22" rx="1" fill="#e2d2b2"/><rect x="19.6" y="32" width="0.6" height="22" fill="#c4ae86"/>';
    var pet = ''; for (var i = 0; i < 5; i++) { var a = -Math.PI/2 + i*Math.PI*2/5; pet += '<g transform="translate(20 20) rotate(' + (a*180/Math.PI + 90) + ')"><path d="M0 0 C-7 -3 -8 -12 -3 -14.4 L0 -12 L3 -14.4 C8 -12 7 -3 0 0 Z" fill="#e88ab8" opacity="0.82"/><path d="M0 -1.6 L0 -10" stroke="#f6c8e0" stroke-width="0.5"/><path d="M-1.8 -4 L-3.6 -9 M1.8 -4 L3.6 -9" stroke="#f6c8e0" stroke-width="0.35"/></g>'; }
    s += pet; for (var k = 0; k < 90; k++) { var r = rnd(k)*13, a2 = rnd(k + 300)*Math.PI*2; s += '<circle cx="' + (20 + Math.cos(a2)*r).toFixed(2) + '" cy="' + (20 + Math.sin(a2)*r).toFixed(2) + '" r="0.28" fill="#fff" opacity="0.5"/>'; }
    s += '<circle cx="20" cy="20" r="2.2" fill="#d870a4"/><circle cx="20" cy="20" r="1.2" fill="#f2b0d0"/>';
    s += '<path d="M3 4 L37 4 L36 33 Q26 33 22 37 L18 37 Q14 33 4 33 Z" fill="#f0eaf0" opacity="0.2"/><path d="M18 37 L22 37 L22 39 L18 39 Z" fill="#c8a07a"/><path d="M3 4 L37 4" stroke="#fff" stroke-width="0.4" opacity="0.6"/>';
    return s + sh('fl', 3, 4, 34, 33, 0.55);
  };
  A.f_peanuts = function(){   /* the pale orange foam peanuts, dimpled, in a clear bag under a header card */
    var s = '<rect x="2" y="8" width="36" height="21" fill="#ece8e2" opacity="0.2"/>';
    [[10, 15, -15], [26, 14, 20], [16, 23, 8], [30, 23, -25], [7, 24, 40]].forEach(function(p, i){ s += '<g transform="translate(' + p[0] + ' ' + p[1] + ') rotate(' + p[2] + ')"><path d="M-7 0 C-7 -3.4 -3.6 -3.8 -2 -2.2 Q0 -1.2 2 -2.2 C3.6 -3.8 7 -3.4 7 0 C7 3.4 3.6 3.8 2 2.2 Q0 1.2 -2 2.2 C-3.6 3.8 -7 3.4 -7 0 Z" fill="' + (i % 2 ? '#f2b468' : '#f0aa5a') + '"/>'; for (var d = 0; d < 12; d++) s += '<circle cx="' + (-5.6 + (d % 6)*2.2) + '" cy="' + (d < 6 ? -1 : 1) + '" r="0.35" fill="#d88a3e"/>'; s += '<path d="M-6 -1.6 Q-4 -2.8 -2.4 -1.6" stroke="#fbd8a8" stroke-width="0.6" fill="none"/></g>'; });
    s += '<rect x="2" y="0.6" width="36" height="7.8" fill="#f2ece0"/><path d="M2 0.6 L38 0.6 L38 3 L2 3 Z" fill="#c8402e"/><circle cx="20" cy="1.8" r="0.8" fill="#2a2024"/>';
    s += tx('ピーナッツ', 20, 7.4, 3.6, '#c8402e', { w:900 }) + '<rect x="2" y="25.6" width="36" height="3.6" fill="#f2ece0" opacity="0.92"/>' + tx('circus peanuts · banana', 20, 28.4, 2.4, '#a1465a', { f:E, w:800 });
    return s + sh('pn', 2, 8, 36, 21, 0.45);
  };
  A.f_hanakomon = function(){   /* a clear bag of hard candies with flowers through them; a paper label down the middle */
    var s = '<rect x="4" y="3" width="32" height="48" fill="#ece8e2" opacity="0.18"/>', C = [['#f0d84a', '#f2ece0'], ['#e05aa0', '#f9e2e6'], ['#86bb69', '#f2ece0'], ['#e8803e', '#f6d8a8'], ['#c8402e', '#f2ece0'], ['#f6c8d0', '#c8402e'], ['#a1465a', '#f2ece0'], ['#f2ece0', '#e05aa0']];
    for (var i = 0; i < 26; i++) { var x = 8 + (i % 5)*6.4 + (Math.floor(i/5) % 2)*3.2, y = 7.6 + Math.floor(i/5)*8.2, c = C[i % 8]; if (x > 33 || y > 46) continue; s += '<circle cx="' + x + '" cy="' + y + '" r="3.2" fill="' + c[0] + '" opacity="0.92"/>'; for (var k = 0; k < 5; k++) { var a = k/5*Math.PI*2; s += '<circle cx="' + (x + Math.cos(a)*1.3).toFixed(2) + '" cy="' + (y + Math.sin(a)*1.3).toFixed(2) + '" r="0.85" fill="' + c[1] + '"/>'; } s += '<circle cx="' + x + '" cy="' + y + '" r="0.6" fill="#f0b83a"/><circle cx="' + (x - 1.2) + '" cy="' + (y - 1.4) + '" r="0.6" fill="#fff" opacity="0.6"/>'; }
    s += '<rect x="15" y="14" width="10" height="26" fill="#fbf6f2"/><rect x="15" y="30" width="10" height="10" fill="#f4c0d0"/><rect x="15.6" y="14.6" width="8.8" height="24.8" fill="none" stroke="#c8402e" stroke-width="0.3"/>';
    for (var f = 0; f < 6; f++) s += '<circle cx="' + (16.6 + (f % 3)*3.4) + '" cy="' + (33 + Math.floor(f/3)*3.6) + '" r="0.9" fill="#fff"/>';
    s += tx('花', 20, 21.2, 5.2, '#1e1714', { f:'Hiragino Mincho ProN,Yu Mincho,serif', w:700 }) + tx('小紋', 20, 27.2, 4.4, '#1e1714', { f:'Hiragino Mincho ProN,Yu Mincho,serif', w:700 });
    return s + sh('hk', 4, 3, 32, 48, 0.5);
  };
  A.f_ichigomochi = function(){   /* a red stand-up pouch: a gold medal, strawberries, two pink mochi */
    var s = '<path d="M4 6 Q4 2 8 2 L32 2 Q36 2 36 6 L36 50 Q36 52 34 52 L6 52 Q4 52 4 50 Z" fill="#d8302a"/><path d="M4 18 Q20 10 36 22 L36 26 Q20 14 4 22 Z" fill="#e8584a"/><circle cx="20" cy="5" r="1.4" fill="#2a2024"/>';
    for (var i = 0; i < 6; i++) s += '<path d="M' + (8 + i*5) + ' 12 l0.6 -2 l0.6 2" stroke="#f0d84a" stroke-width="0.4" fill="none" opacity="0.7"/>';
    s += '<circle cx="10" cy="11" r="4.2" fill="#c9a067"/><circle cx="10" cy="11" r="3.4" fill="#f0d84a"/><path d="M7.6 14.6 L6.6 18 L8.6 17 L10 18.6 M12.4 14.6 L13.4 18 L11.4 17 L10 18.6" fill="#5e8a4a"/><path d="M8.4 10 l0.8 -1.2 l0.8 0.8 l0.8 -0.8 l0.8 1.2 Z" fill="#c8402e"/>';
    [[28, 36, 4.4], [32, 44, 3.6], [24, 44, 3.4], [33, 30, 3]].forEach(function(p){ s += '<path d="M' + p[0] + ' ' + (p[1] - p[2]) + ' Q' + (p[0] + p[2]*1.1) + ' ' + (p[1] - p[2]) + ' ' + (p[0] + p[2]*0.8) + ' ' + (p[1] + p[2]*0.3) + ' Q' + p[0] + ' ' + (p[1] + p[2]*1.4) + ' ' + (p[0] - p[2]*0.8) + ' ' + (p[1] + p[2]*0.3) + ' Q' + (p[0] - p[2]*1.1) + ' ' + (p[1] - p[2]) + ' ' + p[0] + ' ' + (p[1] - p[2]) + ' Z" fill="#c8202a"/><path d="M' + (p[0] - p[2]*0.7) + ' ' + (p[1] - p[2]) + ' l' + (p[2]*0.7) + ' ' + (-p[2]*0.5) + ' l' + (p[2]*0.7) + ' ' + (p[2]*0.5) + '" fill="#4e7a3a"/>'; for (var d = 0; d < 5; d++) s += '<circle cx="' + (p[0] + (rnd(d + p[0])*1.4 - 0.7)*p[2]) + '" cy="' + (p[1] + (rnd(d + p[1])*1.2 - 0.4)*p[2]) + '" r="0.3" fill="#f0d84a"/>'; });
    s += '<ellipse cx="11" cy="44" rx="5.4" ry="4.2" fill="#f6c8d0"/><ellipse cx="17" cy="45.6" rx="4.6" ry="3.6" fill="#f2b8c4"/><ellipse cx="10" cy="42.6" rx="2" ry="1" fill="#fff" opacity="0.6"/>';
    s += tx('いちごもち', 20, 27.6, 6, '#ffffff', { w:900, st:'#a87a2a', sw:0.9 }) + tx('strawberry mochi', 20, 50.4, 2.6, '#f6e2b0', { f:SER, w:700 });
    return s + sh('im', 4, 2, 32, 50, 0.3);
  };
  A.f_blackgum = function(){   /* a slim stick box, black at the ends and a silver band through the middle */
    var s = '<path d="M8 6 L12 2 L36 2 L32 6 Z" fill="#3a3632"/><path d="M32 6 L36 2 L36 48 L32 52 Z" fill="#141210"/><rect x="8" y="6" width="24" height="46" fill="#1e1c1a"/>';
    s += '<defs><linearGradient id="bgs" x1="0" x2="1"><stop offset="0" stop-color="#8c8a86"/><stop offset="0.45" stop-color="#e4e2de"/><stop offset="1" stop-color="#9a9894"/></linearGradient></defs><rect x="8" y="18" width="24" height="18" fill="url(#bgs)"/><path d="M32 18 L36 14 L36 32 L32 36 Z" fill="#6e6c68"/>';
    s += '<path d="M20 9.6 l1 2.2 l2.4 0.2 l-1.8 1.6 l0.6 2.4 l-2.2 -1.3 l-2.2 1.3 l0.6 -2.4 l-1.8 -1.6 l2.4 -0.2 Z" fill="#c8402e"/>';
    s += tx('まっくろ', 20, 27, 5.2, '#1e1714', { w:900 }) + tx('pitch black', 20, 32.6, 2.8, '#1e1714', { f:E, w:900 }) + tx('licorice', 20, 42, 2.6, '#c8c6c2', { f:E, w:700 }) + tx('stay awake', 20, 47, 2.4, '#e8a090', { f:E, w:800 });
    return s + sh('bk', 8, 6, 24, 46, 0.22);
  };
  var dcam = function(id, body, band, word, sub){   /* a disposable camera: the cardboard wrap over a plastic body, a ridged wind wheel, the flash, the lens barrel */
    var s = '<rect x="2" y="6.4" width="40" height="21.4" rx="2.4" fill="#2a2624"/><rect x="2.6" y="7" width="38.8" height="20.2" rx="2" fill="' + body + '"/><rect x="2.6" y="7" width="38.8" height="6.4" rx="2" fill="' + band + '"/><rect x="2.6" y="11" width="38.8" height="2.4" fill="' + band + '"/>';
    s += '<rect x="32.4" y="3.2" width="7.6" height="3.8" rx="0.6" fill="#2a2624"/>'; for (var i = 0; i < 8; i++) s += '<rect x="' + (32.8 + i*0.9) + '" y="3.4" width="0.4" height="3.4" fill="#4a4440"/>';
    s += '<rect x="5" y="4.2" width="5" height="2.6" rx="0.8" fill="#2a2624"/><rect x="5.4" y="4.4" width="4.2" height="0.6" rx="0.3" fill="#fff" opacity="0.2"/>';
    s += '<circle cx="14" cy="19.6" r="6.6" fill="#1e1a18"/><circle cx="14" cy="19.6" r="5.4" fill="#3a3430"/><circle cx="14" cy="19.6" r="3.8" fill="#141210"/><circle cx="14" cy="19.6" r="2.4" fill="#2a2a32"/><circle cx="12.8" cy="18.4" r="1" fill="#f2f0ea" opacity="0.7"/><circle cx="15.4" cy="20.8" r="0.5" fill="#d8a0b8" opacity="0.5"/>';
    s += '<rect x="29" y="14.8" width="10.4" height="6.6" rx="0.6" fill="#e4e2de" stroke="#6a6662" stroke-width="0.4"/>'; for (var k = 0; k < 6; k++) s += '<path d="M' + (29.6 + k*1.7) + ' 15.2 L' + (29.6 + k*1.7) + ' 21" stroke="#c8c6c2" stroke-width="0.3"/>';
    s += '<rect x="23" y="14.8" width="4.4" height="3.4" rx="0.4" fill="#1e1714"/><rect x="23.4" y="15.2" width="1.4" height="1" fill="#6a6a72" opacity="0.6"/>';
    s += tx(word, 26, 11.6, 4, '#f2f0ea', { f:E, w:900, st:'#3a2a1a', sw:0.4 }) + '<text x="30.5" y="26" text-anchor="middle" font-family="' + E + '" font-weight="800" font-size="2.2" fill="#f2f0ea">' + sub + '</text>';
    return s + sh(id, 2.6, 7, 38.8, 20.2, 0.25);
  };
  A.f_cam_torundesu = function(){ return dcam('ct', '#f0d84a', '#c8402e', 'とるんです', '36 exp. · ISO 400'); };
  A.f_cam_flash = function(){ return dcam('cf', '#3e7a3a', '#86bb69', 'FLASH', 'quick flash · 36 exp.'); };
  A.f_cam_pink = function(){   /* a cheap pink plastic 35mm: a lens with a ring, the window, the rewind knob, strap lugs */
    var s = '<rect x="3" y="8" width="38" height="18" rx="3" fill="#e6a0b4"/><rect x="3" y="8" width="38" height="5" rx="3" fill="#f2c0ce"/><rect x="3" y="22" width="38" height="4" rx="2" fill="#d08aa0"/>';
    s += '<rect x="7" y="4.4" width="7" height="3.6" rx="1" fill="#d08aa0"/><circle cx="10.5" cy="4.8" r="2.2" fill="#c47890"/>'; for (var i = 0; i < 6; i++) s += '<path d="M' + (8.6 + i*0.8) + ' 3 L' + (8.6 + i*0.8) + ' 6.4" stroke="#a85a74" stroke-width="0.3"/>';
    s += '<rect x="31" y="5.6" width="5" height="2.4" rx="0.8" fill="#c47890"/><rect x="1.6" y="12" width="1.6" height="3" rx="0.6" fill="#8a8680"/><rect x="40.8" y="12" width="1.6" height="3" rx="0.6" fill="#8a8680"/>';
    s += '<circle cx="22" cy="17" r="7.6" fill="#c47890"/><circle cx="22" cy="17" r="6.4" fill="#2a2424"/>'; for (var k = 0; k < 24; k++) { var a = k/24*Math.PI*2; s += '<path d="M' + (22 + Math.cos(a)*6.4).toFixed(2) + ' ' + (17 + Math.sin(a)*6.4).toFixed(2) + ' L' + (22 + Math.cos(a)*7.4).toFixed(2) + ' ' + (17 + Math.sin(a)*7.4).toFixed(2) + '" stroke="#a85a74" stroke-width="0.35"/>'; }
    s += '<circle cx="22" cy="17" r="4.4" fill="#1a1818"/><circle cx="22" cy="17" r="2.8" fill="#2e2a36"/><circle cx="20.6" cy="15.6" r="1.2" fill="#f2f0ea" opacity="0.7"/>';
    s += '<rect x="32" y="11" width="6" height="4.2" rx="0.6" fill="#2a2424"/><rect x="32.6" y="11.6" width="2" height="1.4" fill="#6a6a72" opacity="0.6"/>';
    s += tx('35mm', 9, 21, 3, '#fbe8ee', { f:E, w:900 });
    return s + sh('cpk', 3, 8, 38, 18, 0.3);
  };
  var filmbox = function(id, top, mid, low, big, name, sub, bigCol, nameCol, subCol){   /* a small film box, seen a little from the side: its top, its face, its side */
    var s = '<path d="M3 5 L7 1.4 L24.6 1.4 L20.6 5 Z" fill="' + top + '" opacity="0.85"/><path d="M20.6 5 L24.6 1.4 L24.6 31.6 L20.6 35.2 Z" fill="#000" opacity="0.18"/><path d="M20.6 5 L24.6 1.4 L24.6 31.6 L20.6 35.2 Z" fill="' + mid + '" opacity="0.7"/>';
    s += '<rect x="3" y="5" width="17.6" height="30.2" fill="' + mid + '"/><rect x="3" y="5" width="17.6" height="7.6" fill="' + top + '"/><rect x="3" y="27" width="17.6" height="8.2" fill="' + low + '"/><rect x="3" y="26" width="17.6" height="1" fill="#000" opacity="0.15"/>';
    s += '<circle cx="11.8" cy="31" r="2.4" fill="#2a2624"/><circle cx="11.8" cy="31" r="1" fill="#8a8680"/>';
    s += tx(name, 11.8, 10.6, 3.2, nameCol || '#f2f0ea', { f:E, w:900 }) + tx(big, 11.8, 22.4, 7.6, bigCol || '#f2f0ea', { f:E, w:900, st:'#1e1714', sw:0.5 }) + tx(sub, 11.8, 26.2, 1.9, subCol || nameCol || '#f2f0ea', { f:E, w:800 });
    return s + sh(id, 3, 5, 17.6, 30.2, 0.3);
  };
  A.f_film_color = function(){ return filmbox('fc', '#c8402e', '#f0d84a', '#c8402e', '400', 'COLOR', '35mm · 36 exp.', '#ffffff', '#f2f0ea', '#7a1e18'); };
  A.f_film_bw = function(){ return filmbox('fb', '#1e1c1a', '#f2f0ea', '#2a2826', '400', 'MONO', '35mm · 36 exp.', '#1e1714', '#f2f0ea', '#3a3632').replace('</defs>', '</defs>') + '<text x="22.6" y="22" text-anchor="middle" font-family="' + E + '" font-weight="900" font-size="2.6" fill="#f2f0ea" transform="rotate(-90 22.6 22) skewY(0)">MONO</text>'; };
  A.f_film_portrait = function(){ return filmbox('fp', '#e8a040', '#9a6a88', '#7a4a68', '160', 'PORTRAIT', '35mm · 36 exp.', '#ffffff', '#fbe8ee'); };
  A.f_film_instant = function(){   /* a box of instant film: a white print with its picture, the count */
    var s = '<path d="M3 5 L7 1.4 L24.6 1.4 L20.6 5 Z" fill="#e8e4dc"/><path d="M20.6 5 L24.6 1.4 L24.6 31.6 L20.6 35.2 Z" fill="#c8c4bc"/><rect x="3" y="5" width="17.6" height="30.2" fill="#f2efe8"/>';
    s += '<rect x="5" y="7" width="13.6" height="15" fill="#ffffff" stroke="#d8d4cc" stroke-width="0.3"/><rect x="6.2" y="8.2" width="11.2" height="10" fill="#e8a040"/><rect x="6.2" y="14" width="11.2" height="4.2" fill="#86bb69"/><circle cx="14" cy="11" r="1.6" fill="#f6e2a0"/>';
    s += tx('instant', 11.8, 27, 3.6, '#a1465a', { f:E, w:900 }) + tx('10 sheets', 11.8, 31.6, 2.6, '#3a2a2a', { f:E, w:800 });
    return s + sh('fi', 3, 5, 17.6, 30.2, 0.3);
  };
  A.f_mo_disk = function(){   /* a magneto-optical cartridge: grey-white body, a sliding metal shutter over the window, the hub, the label */
    var s = '<rect x="2" y="2" width="32" height="36" rx="1.6" fill="#e4e2dc"/><rect x="2" y="2" width="32" height="36" rx="1.6" fill="none" stroke="#a8a49c" stroke-width="0.5"/>';
    s += '<defs><linearGradient id="mos" x1="0" x2="1"><stop offset="0" stop-color="#9a9894"/><stop offset="0.5" stop-color="#e2e0dc"/><stop offset="1" stop-color="#8c8a86"/></linearGradient></defs><rect x="11" y="2" width="12" height="20" fill="url(#mos)"/><path d="M13 4 L21 4" stroke="#6a6662" stroke-width="0.3"/><path d="M17 4.6 l-1.2 2 l2.4 0 Z" fill="#6a6662"/>';
    s += '<circle cx="17" cy="27" r="4.6" fill="#c8c4bc"/><circle cx="17" cy="27" r="2.6" fill="#8a8680"/><circle cx="17" cy="27" r="1" fill="#3a3632"/>';
    s += '<rect x="23.4" y="4" width="9" height="22" fill="#d0ccc4"/><rect x="24.2" y="5" width="7.4" height="9" fill="#f2f0ea"/>';
    s += '<rect x="3.4" y="33" width="2.4" height="3" fill="#c8402e"/><rect x="30.2" y="33" width="2.4" height="3" fill="#8a8680"/>';
    s += tx('MO', 27.9, 11.6, 4.6, '#1e1714', { f:E, w:900 }) + tx('2.6GB', 27.9, 18.4, 2.6, '#1e1714', { f:E, w:800 }) + tx('rewritable', 27.9, 23.8, 1.9, '#4a4440', { f:E, w:700 });
    return s + sh('mo', 2, 2, 32, 36, 0.2);
  };
  A.f_stickjelly = function(){   /* a clear bag of jelly sticks in five colours, crimped ends, a pink header band */
    var s = crimpH(1, 3, 37, 2.6, '#f2c0cc', 16) + crimpH(50.4, 3, 37, 2.6, '#f2c0cc', 16) + '<rect x="3" y="3.6" width="34" height="47" fill="#ece8e2" opacity="0.2"/>';
    ['#f0b83a', '#86bb69', '#f0a0b8', '#e8603e', '#f6c8a8'].forEach(function(c, i){ s += '<rect x="' + (6 + i*6) + '" y="7" width="4.6" height="40" rx="2" fill="' + c + '" opacity="0.85"/><rect x="' + (6.8 + i*6) + '" y="8" width="1" height="37" rx="0.5" fill="#fff" opacity="0.5"/>'; });
    s += '<rect x="3" y="18" width="34" height="13" fill="#f6d0dc" opacity="0.92"/><rect x="3" y="18" width="34" height="1" fill="#e08aa4"/><rect x="3" y="30" width="34" height="1" fill="#e08aa4"/>';
    s += tx('スティック', 20, 23.8, 4.4, '#c8406a', { w:900, st:'#ffffff', sw:0.6 }) + tx('ゼリー', 20, 29.2, 4.4, '#c8406a', { w:900, st:'#ffffff', sw:0.6 });
    return s + sh('sj', 3, 3.6, 34, 47, 0.5);
  };
  A.f_fortune = function(){   /* a crimped bag of fortune candies: red rays, a lucky cat (our own) with its paw up, today's luck on a slip */
    var s = '<rect x="3" y="4" width="34" height="46" fill="#f0c83a"/>'; for (var i = 0; i < 12; i++) { var a = -Math.PI/2 + (i - 5.5)*0.22; s += '<path d="M20 34 L' + (20 + Math.cos(a)*40).toFixed(1) + ' ' + (34 + Math.sin(a)*40).toFixed(1) + ' L' + (20 + Math.cos(a + 0.1)*40).toFixed(1) + ' ' + (34 + Math.sin(a + 0.1)*40).toFixed(1) + ' Z" fill="#e8503a" opacity="0.55"/>'; }
    s += '<clipPath id="ftc"><rect x="3" y="4" width="34" height="46"/></clipPath>';
    s = '<g clip-path="url(#ftc)">' + s + '</g>' + crimpH(1.4, 3, 37, 2.6, '#c8302a', 16) + crimpH(49.6, 3, 37, 2.6, '#c8302a', 16);
    s += '<path d="M13 44 Q12 32 15 28 L14 23 L17 25.6 L23 25.6 L26 23 L25 28 Q28 32 27 44 Z" fill="#f6f2ea" stroke="#3a2a2a" stroke-width="0.4"/><path d="M25.4 30 Q28.6 26 28 22.4 Q30 23.4 29 27" fill="#f6f2ea" stroke="#3a2a2a" stroke-width="0.4"/><path d="M15 25 L15.6 27 L16.8 26 Z M25 25 L24.4 27 L23.2 26 Z" fill="#f0a0b8"/>';
    s += '<path d="M17.4 28.6 q1 -0.6 2 0 M20.6 28.6 q1 -0.6 2 0" stroke="#1e1714" stroke-width="0.5" fill="none"/><path d="M19.4 30.4 q0.6 0.6 1.2 0" stroke="#1e1714" stroke-width="0.4" fill="none"/><path d="M15.4 33 Q20 35 24.6 33" stroke="#c8402e" stroke-width="1.2" fill="none"/><circle cx="20" cy="34.6" r="1" fill="#f0b83a" stroke="#a8802a" stroke-width="0.3"/><ellipse cx="17" cy="38" rx="2" ry="1.6" fill="#1e1714" opacity="0.8"/><ellipse cx="23.6" cy="40" rx="1.6" ry="1.4" fill="#e8803e" opacity="0.8"/>';
    s += '<rect x="5" y="34" width="7" height="12" fill="#f2ece0" stroke="#c8402e" stroke-width="0.4" transform="rotate(-8 8.5 40)"/>' + tx('小吉', 8.6, 40.4, 2.8, '#c8402e', { w:900, tf:'rotate(-8 8.5 40)' }) + tx('small luck', 8.6, 43, 1.3, '#3a2a2a', { f:E, w:700, tf:'rotate(-8 8.5 40)' }) + tx('inside', 8.6, 44.8, 1.3, '#3a2a2a', { f:E, w:700, tf:'rotate(-8 8.5 40)' });
    s += tx('おみくじ飴', 20, 13.6, 5.6, '#c8302a', { w:900, st:'#fff6d8', sw:0.9 }) + tx('fortune candy', 20, 19, 2.8, '#7a1e18', { f:E, w:900 });
    return s + sh('ft', 3, 4, 34, 46, 0.3);
  };
  for (var k in A) EG_ART[k] = A[k];
})();
function egSvgFor(id, A, w, h){
  var raw = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + A.vb[0] + ' ' + A.vb[1] + '" width="' + w + '" height="' + h + '">' + egFixSvg(id, EG_ART[id] ? EG_ART[id]() : A.svg()) + '</svg>';
  try { var doc = new DOMParser().parseFromString(raw, 'image/svg+xml'); if (!doc.querySelector('parsererror')) { egFixDom(id, doc.documentElement); raw = new XMLSerializer().serializeToString(doc.documentElement); } } catch (e) {}
  return raw;
}
var _egPkMap = pkMap;
pkMap = function(id, done){
  _egPkMap(id, function(){
    var A = PK_ART[id], M = POK.maps[id]; if (!M) { done(); return; }
    var S = Math.max(1, Math.min(3, Math.floor(900/Math.max(M.w, M.h)))), img = new Image();   /* drawn finer than its lifted size, so it stays sharp up close */
    if (A && A.paint) { try { var pc = document.createElement('canvas'); pc.width = M.w*S; pc.height = M.h*S; A.paint(pc.getContext('2d'), pc.width, pc.height); M.eg = egBake(M, pc, S, A); } catch (e) { console.error(e); } done(); return; }   /* (a thing painted straight onto a canvas: the stranger's note) */
    if (!A || typeof A.svg !== 'function') { done(); return; }   /* (nothing to draw it from: Seam's own way) */
    img.onload = function(){ try { M.eg = egBake(M, img, S, A); } catch (e) { console.error(e); } done(); };
    img.onerror = function(){ done(); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(egSvgFor(id, A, M.w*S, M.h*S));
  });
};
var _egPkSprite = pkSprite;
pkSprite = function(id, sc, rot, light, now){
  var M = POK.maps[id], A = PK_ART[id]; if (!M || !M.eg || EG_SEAM.lookOff) return _egPkSprite.apply(null, arguments);
  var cs = Math.cos(rot), sn = Math.sin(rot), hw = M.w*sc/2, hh = M.h*sc/2;
  var W = Math.ceil(Math.abs(hw*cs) + Math.abs(hh*sn))*2 + 2, H = Math.ceil(Math.abs(hw*sn) + Math.abs(hh*cs))*2 + 2;
  var c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
  x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
  x.save(); x.translate(W/2, H/2); x.rotate(rot); x.drawImage(M.eg.c, -hw, -hh, hw*2, hh*2); x.restore();
  if (A.foil && now && M.eg.foil) {   /* the hologram: a slow band of colour sliding across the foil */
    var t = document.createElement('canvas'); t.width = W; t.height = H; var tx = t.getContext('2d'), ph = ((now/1000)*0.11) % 1, gr = tx.createLinearGradient(0, 0, W, H);
    [[0, 'rgba(200,200,205,0)'], [0.2, 'rgba(200,200,205,0.5)'], [0.4, 'rgba(156,143,184,0.6)'], [0.55, 'rgba(140,160,196,0.45)'], [0.7, 'rgba(127,166,160,0.55)'], [0.85, 'rgba(201,168,106,0.55)'], [1, 'rgba(201,168,106,0)']].forEach(function(s){ gr.addColorStop(s[0], s[1]); });
    tx.save(); tx.translate((ph*2 - 1)*W*1.2, (ph*2 - 1)*H*0.6); tx.fillStyle = gr; tx.fillRect(-W, -H, W*3, H*3); tx.restore();
    tx.globalCompositeOperation = 'destination-in'; tx.save(); tx.translate(W/2, H/2); tx.rotate(rot); tx.drawImage(M.eg.foil, -hw, -hh, hw*2, hh*2); tx.restore();
    x.save(); x.globalCompositeOperation = 'screen'; x.globalAlpha = 0.55; x.drawImage(t, 0, 0); x.restore();
  }
  if (light < 0.999) { x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(6,5,5,' + Math.min(1, 1 - light).toFixed(3) + ')'; x.fillRect(0, 0, W, H); x.restore(); }
  else if (light > 1.001) { x.save(); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(255,244,228,' + Math.min(0.5, (light - 1)*0.6).toFixed(3) + ')'; x.fillRect(0, 0, W, H); x.restore(); }
  var dd = x.getImageData(0, 0, W, H).data, mask = new Uint8Array(W*H); for (var q = 0; q < W*H; q++) mask[q] = dd[q*4 + 3] > 120 ? 1 : 0;
  return { c:c, W:W, H:H, mask:mask };
};
/* stamps in real ink (the same drawings: Seam's psptTirStamp and psptFuruStamp; new stamps should be wrapped the same way) */
var EG_STAMPN = 0;
function egInk(g){ var n = ++EG_STAMPN, f = 'egInk' + n;
  return '<defs><filter id="' + f + '" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="' + (n*7 + 3) + '" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="' + (n*5 + 11) + '" result="p"/><feColorMatrix in="p" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.6 0 0 0 1.55" result="pm"/><feComposite in="d" in2="pm" operator="in" result="d2"/>' +
    '<feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="' + (n*3 + 29) + '" result="s"/><feColorMatrix in="s" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -4 0 0 0 3.5" result="sm"/><feComposite in="d2" in2="sm" operator="in"/></filter></defs>' +
    '<g filter="url(#' + f + ')" style="mix-blend-mode:multiply">' + g + '</g>'; }
if (typeof psptTirStamp === 'function') { var _egTir = psptTirStamp; psptTirStamp = function(){ return egInk(_egTir.apply(null, arguments)); }; }
if (typeof psptFuruStamp === 'function') { var _egFuru = psptFuruStamp; psptFuruStamp = function(){ return egInk(_egFuru.apply(null, arguments)); }; }
EG_SEAM.look = { ids:function(){ return Object.keys(PK_ART); }, vb:function(id){ var A = PK_ART[id]; return A ? [A.vb, A.k, A.svg ? A.svg().length : 0] : null; }, words:function(id){ var A = PK_ART[id]; if (!A || !A.svg) return null; var d = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + A.svg() + '</svg>', 'image/svg+xml'); return [].map.call(d.querySelectorAll('text'), function(t){ return t.textContent; }); },
  sheet:function(ids, cell, cb){   /* (tests: a contact sheet of things in their Embroidery look, cell px each, labelled with their ids) */
    var cols = 5, rows = Math.ceil(ids.length/cols), c = document.createElement('canvas'); c.width = cols*cell; c.height = rows*(cell + 16); var x = c.getContext('2d');
    x.fillStyle = '#17141a'; x.fillRect(0, 0, c.width, c.height); var n = 0;
    (function next(){ if (n >= ids.length) { cb(c.toDataURL('image/png')); return; } var id = ids[n], k = n++;
      var go = function(){ var M = POK.maps[id], src = M && (M.eg ? M.eg.c : null); var cx = (k % cols)*cell, cy = ((k/cols) | 0)*(cell + 16);
        if (src) { var sc = Math.min((cell - 8)/src.width, (cell - 8)/src.height); x.imageSmoothingQuality = 'high'; x.drawImage(src, cx + (cell - src.width*sc)/2, cy + (cell - src.height*sc)/2, src.width*sc, src.height*sc); }
        else { x.fillStyle = '#a33'; x.fillText('no look', cx + 8, cy + 20); }
        x.fillStyle = '#d8ccb4'; x.font = '11px monospace'; x.fillText(id, cx + 4, cy + cell + 12); setTimeout(next, 0); };
      if (POK.maps[id] && POK.maps[id].eg) go(); else { try { pkMap(id, go); } catch (e) { go(); } } })();
  }, lift:function(id){ if (POK.lift) { POK.lift = null; POK.ask = null; pkAsk.style.display = 'none'; } POK.folder = null; POK.page = 0; pkLayout(); var it = (POK.items || []).filter(function(i){ return i.id === id; })[0]; if (!it) { POK.folder = pkFolderOf(id); POK.page = 0; pkLayout(); it = (POK.items || []).filter(function(i){ return i.id === id; })[0]; } if (it) pkLift(it); return !!it; }, yes:function(){ var L = POK.lift; if (L && PK_ART[L.it.id].onYes) PK_ART[L.it.id].onYes(L.it, L); }, off:function(v){ EG_SEAM.lookOff = !!v; POK.items.forEach(function(it){ it.S = null; it.Sh = null; }); if (POK.lift) POK.lift.S = null; try { pkLayout(); } catch (e) {} }, baked:function(){ var n = 0, t = 0; for (var k in POK.maps) { t++; if (POK.maps[k].eg) n++; } return [n, t]; } };   /* (tests: how many things have their Embroidery look) */

/* ---- (the bridge, end) hand Embroidery what it needs from inside Seam's closure, then close it ---- */
EG_SEAM.pocket = {
  open:function(){ if (typeof pkOpen === 'function') pkOpen(); },
  close:function(){ if (typeof pkClose === 'function') pkClose(); },
  isOpen:function(){ return !!(typeof POK !== 'undefined' && POK.open); },
  put:function(id){ if (typeof pocketPut === 'function') return pocketPut(id); },
  have:function(){ return typeof PK_HAVE !== 'undefined' ? PK_HAVE.slice() : []; },
  art:function(){ return typeof PK_ART !== 'undefined' ? Object.keys(PK_ART).length : 0; }
};
/* clicking a thing: Seam's own click actions first (close-ups, the dumpster, the pit...); true if one answered */
EG_SEAM.click = function(sayKey){
  var hit = false;
  try { hubBoxAction({ box:{ say:sayKey } }, function(d, fn){ hit = true; fn(); return true; }); } catch (e) { console.error(e); }
  return hit;
};
EG_SEAM.where = function(x, z, a){ me.x = x; me.y = z; me.a = a; };
EG_SEAM.closeUpOpen = function(){ return !!((typeof F3C !== 'undefined' && F3C.open) || (typeof FVM !== 'undefined' && FVM.open)); };
EG_SEAM.closeAll = function(){ try { if (typeof F3C !== 'undefined' && F3C.open) f3Close(); } catch (e) {} try { if (typeof FVM !== 'undefined' && FVM.open) fvmClose(); } catch (e) {} };
EG_SEAM.pic = function(name){ return FPIC[name] || null; };
EG_SEAM.liftFirst = function(){ try { var it = (POK.items || []).filter(function(i){ return !i.deep; })[0]; if (it) { pkLift(it); return it.id; } } catch (e) {} return null; };   /* (tests: lift the first thing, as a click on it would) */
EG_SEAM.picNames = function(){ return Object.keys(FPIC); };   /* (for the text check, t/text.js) */
/* (the train) going between pages, as every Seam page does (shared/hy2-journey.js), and the ride's line map and words */
EG_SEAM.ride = { stops:RIDE_STOPS, pages:F_STOP_PAGES, say:RIDE_SAY, map:RIDE_MAP, svg:RIDE_MAP_SVG, warn:F_WARN, here:RIDE_HERE,
  arrived:(typeof ngArrivedHere !== 'undefined' ? ngArrivedHere : null), go:function(page, at){ keys = {}; ngGoTo(page, at); }, fade:function(on){ ngFade(on); }, leaving:function(){ return NGJ.leaving; } };
EG_SEAM.step = function(now, dt){ try { if (POK.open) pkFrame(now); seamStep(now, dt); }   /* (as Seam's d2-frame: while the pocket is open, it's what's drawn) */ catch (e) { if (!EG_SEAM.err) { EG_SEAM.err = e; console.error(e); } } };
})();
