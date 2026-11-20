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
/* ---- (Nov 20, Aisling: "the 3d things are too cartoon and stark … more konami or horror game or like sh3 … the same
   object design but not seam looks … less cartoon and outlined, more real hazy missing mile") the real pass, over every
   thing in the pocket: the drawing's hard edges softened (a blur mixed in, so words still read), colour muted and the
   blacks lifted like old film, a little of Missing Mile's fog over it, then the wear a real thing carries: soft grime
   gathering in patches and at the edges, fine creases, scuffs, and grain. ---- */
function egVN(x, y){ var xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi; fx = fx*fx*(3 - 2*fx); fy = fy*fy*(3 - 2*fy);
  var a = egNoise(xi, yi), b = egNoise(xi + 1, yi), c = egNoise(xi, yi + 1), e = egNoise(xi + 1, yi + 1); return a + (b - a)*fx + (c - a)*fy + (a - b - c + e)*fx*fy; }
function egPix(d, w, h, S){   /* ("as photo real with pixel slightly") a very fine pixel: each little block leans 22% toward its own average */
  var B = Math.max(2, Math.round(S*1.6)), x, y, i, j, o;
  for (y = 0; y < h; y += B) for (x = 0; x < w; x += B) { var r = 0, g = 0, b = 0, a = 0, c = 0;
    for (j = y; j < Math.min(h, y + B); j++) for (i = x; i < Math.min(w, x + B); i++) { o = (j*w + i)*4; if (d[o + 3] < 8) continue; r += d[o]; g += d[o + 1]; b += d[o + 2]; c++; }
    if (!c) continue; r /= c; g /= c; b /= c;
    for (j = y; j < Math.min(h, y + B); j++) for (i = x; i < Math.min(w, x + B); i++) { o = (j*w + i)*4; if (d[o + 3] < 8) continue; d[o] = d[o]*0.78 + r*0.22; d[o + 1] = d[o + 1]*0.78 + g*0.22; d[o + 2] = d[o + 2]*0.78 + b*0.22; } }
}
function egReal(d, w, h, S, MT){
  /* (Nov 20, later; Aisling: "more realistic closer to the real thing … close to the key is most ideal", with a
     survival-horror key: one strong light from the upper left, a lit side and a side falling to dark, metal shining
     where it's worn and dull in its dips, grime and rust, deep darks.) Each thing gets a shape (its edges round over,
     found from its outline), is lit from the upper left, and its material answers the light: metal shines, paper is
     matte with a fibre, plastic and foil have a soft gloss. Real darks; only a breath of Missing Mile's haze. */
  var n = w*h, k, i, j, R = Math.max(1, Math.round(S*0.9)), src = new Float32Array(n*4), tmp = new Float32Array(n*4), soft = new Float32Array(n*4);
  for (k = 0; k < n*4; k++) src[k] = d[k];
  var pass = function(from, to, dx, dy){ for (j = 0; j < h; j++) for (i = 0; i < w; i++) { var sr = 0, sg = 0, sb = 0, sa = 0, cnt = 0;
      for (var t = -R; t <= R; t++) { var xx = i + t*dx, yy = j + t*dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; var q = (yy*w + xx)*4, al = from[q + 3]; sr += from[q]*al; sg += from[q + 1]*al; sb += from[q + 2]*al; sa += al; cnt++; }
      var o = (j*w + i)*4; if (sa > 0) { to[o] = sr/sa; to[o + 1] = sg/sa; to[o + 2] = sb/sa; } to[o + 3] = sa/cnt; } };
  pass(src, tmp, 1, 0); pass(tmp, soft, 0, 1);
  /* how far each pixel is inside the thing's outline (two-pass chamfer), so its edges can round over */
  var D = new Float32Array(n), BIG = 1e6;
  for (k = 0; k < n; k++) D[k] = src[k*4 + 3] < 60 ? 0 : BIG;
  for (j = 0; j < h; j++) for (i = 0; i < w; i++) { k = j*w + i; if (!D[k]) continue; var m = D[k];
    if (i > 0) m = Math.min(m, D[k - 1] + 1); if (j > 0) m = Math.min(m, D[k - w] + 1); if (i > 0 && j > 0) m = Math.min(m, D[k - w - 1] + 1.414); if (i < w - 1 && j > 0) m = Math.min(m, D[k - w + 1] + 1.414);
    if (i === 0 || j === 0) m = Math.min(m, 1); D[k] = m; }
  for (j = h - 1; j >= 0; j--) for (i = w - 1; i >= 0; i--) { k = j*w + i; if (!D[k]) continue; var m2 = D[k];
    if (i < w - 1) m2 = Math.min(m2, D[k + 1] + 1); if (j < h - 1) m2 = Math.min(m2, D[k + w] + 1); if (i < w - 1 && j < h - 1) m2 = Math.min(m2, D[k + w + 1] + 1.414); if (i > 0 && j < h - 1) m2 = Math.min(m2, D[k + w - 1] + 1.414);
    if (i === w - 1 || j === h - 1) m2 = Math.min(m2, 1); D[k] = m2; }
  /* the materials, smoothed: the inks can flip pixel to pixel on a grey, so each pixel takes a blend of its neighbours' */
  var MW = new Float32Array(n*4), MW2 = new Float32Array(n*4), MS = new Float32Array(n*4), RR = R; R = Math.max(2, Math.round(S*3));
  for (k = 0; k < n; k++) { var mm = MT ? MT[k] : 0; MW[k*4] = mm === 1 ? 255 : 0; MW[k*4 + 1] = mm === 2 ? 255 : 0; MW[k*4 + 2] = mm === 4 ? 255 : 0; MW[k*4 + 3] = src[k*4 + 3]; }
  pass(MW, MW2, 1, 0); pass(MW2, MS, 0, 1); R = RR;
  var bev = 7*S, H = new Float32Array(n);
  for (k = 0; k < n; k++) { var t2 = Math.min(1, D[k]/bev); t2 = Math.sqrt(t2*(2 - t2)); var o2 = k*4, L0 = (src[o2]*0.3 + src[o2 + 1]*0.59 + src[o2 + 2]*0.11)/255; H[k] = t2*bev*0.9 + L0*1.6*S; }   /* rounded edges, plus the drawing's own lines pressed in a little */
  var lx = -0.52, ly = -0.62, lz = 0.59, hx = lx, hy = ly, hz = lz + 1, hl = Math.sqrt(hx*hx + hy*hy + hz*hz); hx /= hl; hy /= hl; hz /= hl;
  var FOG = [138, 128, 118], sx = 1/(18*S), sc = 1/(5*S);
  for (j = 0; j < h; j++) for (i = 0; i < w; i++) { k = j*w + i; var o = k*4; if (src[o + 3] < 6 && soft[o + 3] < 6) { d[o + 3] = 0; continue; }
    var mt = MT ? MT[k] : 0;
    var r = src[o]*0.78 + soft[o]*0.22, g = src[o + 1]*0.78 + soft[o + 1]*0.22, b = src[o + 2]*0.78 + soft[o + 2]*0.22;
    if (mt === 3) { d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = src[o + 3]; continue; }   /* glowing: lit from within */
    var L = r*0.3 + g*0.59 + b*0.11, sat = 0.84; r = L + (r - L)*sat; g = L + (g - L)*sat; b = L + (b - L)*sat;
    var hL = i > 0 ? H[k - 1] : H[k], hR = i < w - 1 ? H[k + 1] : H[k], hU = j > 0 ? H[k - w] : H[k], hD = j < h - 1 ? H[k + w] : H[k];
    var nx = (hL - hR)*0.5, ny = (hU - hD)*0.5, nz = 1, nl = Math.sqrt(nx*nx + ny*ny + 1); nx /= nl; ny /= nl; nz /= nl;
    var diff = Math.max(0, nx*lx + ny*ly + nz*lz), ndh = Math.max(0, nx*hx + ny*hy + nz*hz);
    var fall = 1.06 - 0.18*((i/w)*0.55 + (j/h)*0.45);   /* nearer the light, brighter */
    var gr = egVN(i*sx, j*sx)*0.6 + egVN(i*sx*2.3 + 7, j*sx*2.3)*0.4, grime = Math.max(0, gr - 0.56)*0.35, grain = (egNoise(i*3 + 1, j*7 + 2) - 0.5)*6;   /* (Nov 20 noon: "not so dirty") */
    var shade = (0.58 + 0.56*diff)*fall, sr2 = 1, sg2 = 1, sb2 = 0.94;   /* ("i dont like the blackness": the dark side stays soft) */
    var wm = MS[o]/255, wp = MS[o + 1]/255, wr = MS[o + 2]/255, wq = Math.max(0, 1 - wm - wp - wr);   /* metal, paper, rust, the rest (plastic, card, foil) */
    var rust = Math.max(0, egVN(i*sx*2.2 + 3, j*sx*2.2) - 0.8)*0.6*wm;   /* a little patina on metal, in soft patches */
    r = r*(1 - rust*0.4) + 120*rust*0.4; g = g*(1 - rust*0.4) + 72*rust*0.4; b = b*(1 - rust*0.4) + 44*rust*0.4;
    var crease = wp ? (Math.max(0, 1 - Math.abs(egVN(i*sc*0.6, j*sc*3 + 11) - 0.5)*30)*0.05 + Math.max(0, 1 - Math.abs(egVN(i*sc*3 + 5, j*sc*0.6) - 0.5)*30)*0.035)*wp : 0;
    var spec = wm*(Math.pow(ndh, 22)*1.0 + Math.pow(ndh, 6)*0.22)*(1 - grime*0.6 - rust*0.5) + wr*Math.pow(ndh, 6)*0.12 + wp*(Math.pow(ndh, 8)*0.05 + crease*0.5) + wq*(Math.pow(ndh, 38)*0.45 + Math.pow(ndh, 8)*0.06);
    shade *= 1 - grime*(0.4*wm + 0.5*wr + 0.45*wp + 0.4*wq) - crease*0.25; sb2 = 0.94 - 0.08*wm; grain += wp*(egNoise((i/3) | 0, j) - 0.5)*8;
    r = r*shade + 255*spec*sr2 + grain; g = g*shade + 245*spec*sg2 + grain; b = b*shade + 228*spec*sb2 + grain;
    var hz = 0.14 + 0.08*(1 - diff); r = r*(1 - hz) + FOG[0]*1.25*hz; g = g*(1 - hz) + FOG[1]*1.25*hz; b = b*(1 - hz) + FOG[2]*1.25*hz;   /* Missing Mile's haze, more in the shadow than in the light ("not dirty but haze") */
    d[o] = r < 0 ? 0 : r > 255 ? 255 : r; d[o + 1] = g < 0 ? 0 : g > 255 ? 255 : g; d[o + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    d[o + 3] = src[o + 3]*0.9 + soft[o + 3]*0.1; }
}
function egBake(M, img, S, A){
  var INK = (A && A.ink) || (A && A.loud ? pkInkL : (A && A.green ? pkInkG : pkInk));
  var w = M.w*S, h = M.h*S, c = document.createElement('canvas'); c.width = w; c.height = h;
  var x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h);
  var id = x.getImageData(0, 0, w, h), d = id.data, L = new Float32Array(w*h), A = new Uint8Array(w*h);
  for (var k = 0; k < w*h; k++) { L[k] = (d[k*4]*0.3 + d[k*4 + 1]*0.59 + d[k*4 + 2]*0.11)/255; A[k] = d[k*4 + 3]; }
  var fm = document.createElement('canvas'); fm.width = w; fm.height = h; var fx = fm.getContext('2d'), fid = fx.createImageData(w, h), fd = fid.data, anyFoil = false;
  var MT = new Uint8Array(w*h);
  for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
    var k = j*w + i; if (A[k] < 8) continue;
    var r = d[k*4], g = d[k*4 + 1], b = d[k*4 + 2], q = INK(r, g, b), ri = q ? q[0] : -1, mt = ri >= 0 ? EG_MAT[ri] : 0;   /* (the inks read from this drawing itself, not Seam's, so a fixed drawing leaves no ghost) */
    if (ri >= 0) { var nR = RN[ri], ix = Math.min(nR - 1, Math.max(0, (q[1]*(nR - 1)) | 0)), ic = RF[ri*FOGN*RMAX + ix];   /* the ink grades it */
      r = r*0.75 + (ic & 255)*0.25; g = g*0.75 + ((ic >> 8) & 255)*0.25; b = b*0.75 + ((ic >> 16) & 255)*0.25; }
    MT[k] = mt;
    if (mt === 3) { d[k*4] = r; d[k*4 + 1] = g; d[k*4 + 2] = b; continue; }   /* glowing: left lit */
    var lx = i > 0 ? L[k - 1] : L[k], rx = i < w - 1 ? L[k + 1] : L[k], uy = j > 0 ? L[k - w] : L[k], dy = j < h - 1 ? L[k + w] : L[k];
    var relief = ((lx - rx) + (uy - dy))*0.7;   /* raised lines catch the light from the top left */
    var edge = 0; if ((i > 1 && A[k - 2] < 60) || (i < w - 2 && A[k + 2] < 60) || (j > 1 && A[k - 2*w] < 60) || (j < h - 2 && A[k + 2*w] < 60)) edge = 1;
    var shade = 1 + 0.07*(0.5 - (i/w + j/h)/2)*2 - 0.03*edge, add = 0, grain = (egNoise(i, j) - 0.5)*0.035;
    if (mt === 1) { var band = Math.max(0, 1 - Math.abs((i/w)*0.8 + (j/h)*0.6 - 0.55)*4.5); add = 70*relief + 38*band*band + 18*relief*relief*9; shade *= 0.92 + 0.1*L[k]; }
    else if (mt === 4) { add = 30*relief; grain *= 3; }
    else if (mt === 2) { add = 22*relief; grain += (egNoise((i/3) | 0, j) - 0.5)*0.03 + (egNoise(i, (j/5) | 0) - 0.5)*0.02; }   /* paper fibre */
    else { add = 40*relief; }
    var f = 1; add = 0;   /* (the lighting is egReal's now) */
    d[k*4] = Math.max(0, Math.min(255, r*f + add)); d[k*4 + 1] = Math.max(0, Math.min(255, g*f + add*0.96)); d[k*4 + 2] = Math.max(0, Math.min(255, b*f + add*0.9));
    if (ri === R_SILVER || ri === R_GOLD || ri === R_PLUMGLOW) { fd[k*4 + 3] = A[k]; anyFoil = true; }
  }
  egReal(d, w, h, S, MT); egPix(d, w, h, S);   /* (Nov 20) the real pass: shape, light, material; then a slight pixel */
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
  A.f_mozart = function(){   /* (Nov 20, Aisling: "the mozart thing, yes use his face") red foil, crimped ends, gold scrollwork, a keyboard
     running under him, and Mozart himself (dead since 1791, so his real likeness, her rule): powdered wig with its side
     rolls and queue, red coat, lace at the throat, in profile */
    var s = '<rect x="5" y="3" width="50" height="18" fill="#c4203a"/>'; for (var i = 0; i < 5; i++) s += '<path d="M5 ' + (3 + i*3.6) + ' l-3.4 1.8 l3.4 1.8 M55 ' + (3 + i*3.6) + ' l3.4 1.8 l-3.4 1.8" fill="#b81a32" stroke="#b81a32" stroke-width="0.5"/>';
    s += '<defs><linearGradient id="mzf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8506a"/><stop offset="0.35" stop-color="#c4203a"/><stop offset="0.7" stop-color="#9a1428"/><stop offset="1" stop-color="#c4203a"/></linearGradient></defs><rect x="5" y="3" width="50" height="18" fill="url(#mzf)"/>';
    s += '<path d="M8 6.4 q3 -2 6 0 t6 0 M40 6.4 q3 -2 6 0 t6 0" stroke="#e6c070" stroke-width="0.45" fill="none"/><path d="M10 7.2 q-1.6 1.4 0 2.6 M50 7.2 q1.6 1.4 0 2.6" stroke="#e6c070" stroke-width="0.4" fill="none"/>';
    s += '<rect x="7" y="13.4" width="46" height="4.6" fill="#f6f2ea"/>'; for (var k = 0; k <= 30; k++) s += '<path d="M' + (7 + k*1.533).toFixed(2) + ' 13.4 L' + (7 + k*1.533).toFixed(2) + ' 18" stroke="#8a8680" stroke-width="0.15"/>'; for (var b = 0; b < 30; b++) if ([0, 1, 3, 4, 5].indexOf(b % 7) >= 0) s += '<rect x="' + (7 + b*1.533 + 1.0).toFixed(2) + '" y="13.4" width="0.95" height="2.7" fill="#1e1714"/>';
    /* Mozart: the coat, the lace, the face, the wig */
    s += '<path d="M33 21 Q33 15.6 37.4 14.6 L42.4 14.6 Q46.6 15.6 46.4 21 Z" fill="#b8243a" stroke="#6a1020" stroke-width="0.25"/><path d="M38 14.6 Q39.6 17.4 40 21 L42 21 Q42 17.2 42.6 14.6 Z" fill="#f2ece0"/><path d="M38.6 15.6 q0.8 0.6 1.6 0 M38.8 16.8 q0.8 0.6 1.6 0 M39 18 q0.8 0.6 1.6 0" stroke="#c8c0b0" stroke-width="0.25" fill="none"/>';
    s += '<path d="M38.4 14.8 Q37.6 12.6 38.4 11 L38 10.2 Q37.8 8.8 38.6 7.4 Q40 5.6 42.2 5.8 Q44.6 6.2 44.8 9 Q44.8 11.6 43.4 13 Q42.6 14.6 40.4 14.8 Z" fill="#f2d2b8"/>';
    s += '<path d="M38.4 9.8 L37.4 10.9 L38.3 11.3" fill="#f2d2b8" stroke="#c89a80" stroke-width="0.2"/><circle cx="39.6" cy="8.9" r="0.28" fill="#3a2a22"/><path d="M38.9 8.3 q0.6 -0.4 1.2 -0.1" stroke="#8a6a50" stroke-width="0.2" fill="none"/><path d="M38.6 12.3 q0.6 0.25 1.1 0" stroke="#a85a50" stroke-width="0.25" fill="none"/><path d="M40.8 11.8 q0.6 0.6 1.6 0.4" stroke="#e8b8a0" stroke-width="0.4" fill="none" opacity="0.7"/>';
    s += '<path d="M39.2 6.6 Q40.6 4.4 43.4 4.6 Q46.6 4.8 47 8 Q47.4 10.4 46.6 12.6 Q45.8 12.4 45.6 11 Q45.2 9 44 8.2 Q42 7.2 40 7.4 Z" fill="#f4f0ea" stroke="#c8c2b8" stroke-width="0.2"/>';
    s += '<ellipse cx="45" cy="10.4" rx="1.3" ry="0.9" fill="#ebe6dc" stroke="#c8c2b8" stroke-width="0.2"/><ellipse cx="45" cy="12.2" rx="1.3" ry="0.9" fill="#ebe6dc" stroke="#c8c2b8" stroke-width="0.2"/><path d="M46.6 11 Q48.4 12.4 47.8 14.4" stroke="#ebe6dc" stroke-width="1" fill="none"/><path d="M47.2 11.6 l1.2 -0.6 l-0.2 1.3 Z M47.2 11.6 l1.3 0.7 l-1 0.8 Z" fill="#1e1714"/>';
    s += tx('Mozart', 21, 10.6, 5.8, '#f6f2ea', { f:SER, w:700, st:'#a8802a', sw:0.5 }) + tx('marzipan · pistachio · nougat', 21, 20.2, 1.9, '#f2d890', { f:SER, w:700, it:true });
    s += '<circle cx="10.4" cy="10.4" r="2.6" fill="none" stroke="#e6c070" stroke-width="0.4"/><circle cx="49.6" cy="10.4" r="0" fill="none"/>';
    return s + sh('mz', 5, 3, 50, 18, 0.5);
  };
  for (var k in A) EG_ART[k] = A[k];
})();
/* ---- (Nov 20, night: Aisling asleep, "anything that can improve project") the rest of her item photos, in Embroidery's
   look. Same rules: ids and every word kept; names one step off where still sold; blue shifted off; printed faces static. ---- */
(function(){
  var J = 'Hiragino Sans,Noto Sans JP,Yu Gothic,sans-serif', E = 'Helvetica Neue,Arial,sans-serif', SER = 'Georgia,Times New Roman,serif', BLK = 'Arial Black,Helvetica Neue,Arial,sans-serif', RND = 'Arial Rounded MT Bold,Hiragino Maru Gothic ProN,sans-serif';
  var tx = function(t, x, y, sz, fill, o){ o = o || {}; return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || 'middle') + '" font-family="' + (o.f || J) + '" font-weight="' + (o.w || 800) + '" font-size="' + sz + '" fill="' + fill + '"' + (o.st ? ' stroke="' + o.st + '" stroke-width="' + (o.sw || sz*0.18) + '" paint-order="stroke" stroke-linejoin="round"' : '') + (o.tf ? ' transform="' + o.tf + '"' : '') + (o.it ? ' font-style="italic"' : '') + '>' + t + '</text>'; };
  var rnd = function(n){ var x = Math.sin(n*12.9898)*43758.5453; return x - Math.floor(x); };
  var sh = function(id, x, y, w, h, k){ return '<defs><linearGradient id="sh' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.35" stop-color="#fff" stop-opacity="' + (k || 0.35) + '"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/><stop offset="0.7" stop-color="#fff" stop-opacity="' + ((k || 0.35)*0.4) + '"/><stop offset="0.78" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="url(#sh' + id + ')"/>'; };
  var dots = function(x, y, w, h, st, r, col, op){ var s = ''; for (var j = 0; j*st < h; j++) for (var i = 0; i*st < w; i++) s += '<circle cx="' + (x + i*st + (j % 2 ? st/2 : 0)).toFixed(2) + '" cy="' + (y + j*st).toFixed(2) + '" r="' + r + '"/>'; return '<g fill="' + col + '" opacity="' + (op || 0.25) + '">' + s + '</g>'; };
  var crimpV = function(x, y0, y1, w, col, n){ var s = '', h = (y1 - y0)/n; for (var i = 0; i < n; i++) s += 'L' + (x + (i % 2 ? 0 : w)) + ' ' + (y0 + h*(i + 0.5)).toFixed(2) + ' '; return '<path d="M' + x + ' ' + y0 + ' ' + s + 'L' + x + ' ' + y1 + ' Z" fill="' + col + '"/>'; };
  var crimpH = function(y, x0, x1, h, col, n){ var s = '', w = (x1 - x0)/n; for (var i = 0; i <= n; i++) s += 'L' + (x0 + w*i).toFixed(2) + ' ' + (y + (i % 2 ? h : 0)) + ' '; return '<path d="M' + x0 + ' ' + (y + h/2) + ' ' + s + 'L' + x1 + ' ' + (y + h/2) + ' Z" fill="' + col + '"/>'; };
  var stat = function(cx, cy, rx, ry, id){   /* a printed face: grey static, as the rule says */
    var s = '<clipPath id="st' + id + '"><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/></clipPath><ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#8a8680"/><g clip-path="url(#st' + id + ')">';
    for (var i = 0; i < 26; i++) s += '<rect x="' + (cx - rx + rnd(i + id.length)*rx*2).toFixed(2) + '" y="' + (cy - ry + i*ry*2/26).toFixed(2) + '" width="' + (0.6 + rnd(i*3)*rx*0.6).toFixed(2) + '" height="' + (ry*0.05).toFixed(2) + '" fill="' + (i % 2 ? '#e8e6e2' : '#3a3836') + '"/>';
    return s + '</g>';
  };
  var A = {};
  /* ---- cans, 32 × 56: a real cylinder (dark at both edges, a highlight a quarter in), the printed sleeve, the top ---- */
  var can = function(id, body, art){
    return '<defs><linearGradient id="cy' + id + '" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0.45"/><stop offset="0.18" stop-color="#fff" stop-opacity="0.32"/><stop offset="0.3" stop-color="#fff" stop-opacity="0.05"/><stop offset="0.75" stop-color="#000" stop-opacity="0.08"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/></linearGradient><clipPath id="cc' + id + '"><rect x="3" y="6" width="26" height="45"/></clipPath></defs>' +
      '<rect x="3" y="6" width="26" height="45" fill="' + body + '"/><g clip-path="url(#cc' + id + ')">' + art + '</g>' +
      '<path d="M3 51 L29 51 L28 54 Q16 56 4 54 Z" fill="#a9a8a5"/><path d="M3 51.6 L29 51.6" stroke="#fff" stroke-opacity="0.5" stroke-width="0.4"/><rect x="3" y="6" width="26" height="45" fill="url(#cy' + id + ')"/>' + EG_CANTOP(3, 29, 6);
  };
  A.f_mm_lemon = function(){   /* silver, a yellow swirl rising through it in halftone dots, a lemon slice */
    var a = '<path d="M3 46 C10 40 8 28 18 22 C24 18 26 12 29 6 L29 18 C24 24 22 30 14 36 C10 40 8 46 6 51 L3 51 Z" fill="#f0d84a"/><path d="M6 51 C9 44 12 38 18 33 C24 28 26 24 29 20 L29 26 C26 30 22 34 18 38 C14 42 12 46 11 51 Z" fill="#f2f0ea" opacity="0.8"/>' + dots(3, 8, 26, 42, 1.4, 0.32, '#f2f0ea', 0.45);
    a += '<g transform="translate(22 40)"><path d="M-6 0 A6 6 0 0 1 6 0 Z" fill="#f0c83a"/><path d="M-5 0 A5 5 0 0 1 5 0 Z" fill="#f8ec9a"/>'; for (var i = 1; i < 6; i++) { var t = Math.PI*i/6; a += '<path d="M0 0 L' + (-Math.cos(t)*4.8).toFixed(2) + ' ' + (-Math.sin(t)*4.8).toFixed(2) + '" stroke="#e8c840" stroke-width="0.4"/>'; } a += '</g>';
    a += tx('LEMON', 16, 17.4, 5.4, '#c8202a', { f:BLK, w:900, st:'#1e1714', sw:0.5, tf:'rotate(-8 16 17)' }) + tx('COLA', 15, 24, 5.4, '#c8202a', { f:BLK, w:900, st:'#1e1714', sw:0.5, tf:'rotate(-8 15 24)' }) + tx('レモンコーラ', 16, 48.4, 2.6, '#1e1714', { w:900 });
    return can('ml', '#c4c2bd', a);
  };
  A.f_mm_cherry = function(){   /* deep red, an oval badge with the name, the fizz drawn as frost */
    var a = ''; for (var i = 0; i < 30; i++) a += '<circle cx="' + (4 + rnd(i)*24).toFixed(1) + '" cy="' + (8 + rnd(i + 30)*42).toFixed(1) + '" r="' + (0.3 + rnd(i + 60)*0.5).toFixed(2) + '" fill="#f6c8d0" opacity="0.5"/>';
    a += '<path d="M3 22 Q8 16 16 18 Q24 20 29 15 L29 38 Q22 42 16 40 Q8 38 3 42 Z" fill="#8a0e22" opacity="0.6"/>';
    a += '<ellipse cx="16" cy="29" rx="12" ry="7.4" fill="#c8202a" stroke="#f2ece0" stroke-width="0.7"/><ellipse cx="16" cy="29" rx="10.6" ry="6.2" fill="none" stroke="#f2ece0" stroke-width="0.25"/>';
    a += tx('Cherry', 16, 28.6, 5.2, '#f2ece0', { f:SER, w:700, it:true }) + tx('CHEER', 16, 33, 2.8, '#f2ece0', { f:E, w:900 }) + tx('since forever', 16, 46.6, 2.2, '#f2ece0', { f:E, w:700 });
    a += '<circle cx="11" cy="15" r="2.2" fill="#9a1424"/><circle cx="14" cy="16" r="2.2" fill="#b8243a"/><path d="M11 13 Q13 9 16 9 M14 14 Q15 10 16 9" stroke="#5e7a3e" stroke-width="0.5" fill="none"/>';
    return can('mh', '#b0182c', a);
  };
  A.f_mm_uviolet = function(){   /* deep plum, a dark lightning-streak of violet, the name stacked hard and slanted (never blue) */
    var a = '<path d="M3 6 L29 6 L29 51 L3 51 Z" fill="#4a2a44"/><path d="M8 6 L20 6 L12 26 L22 26 L6 51 L10 30 L2 30 Z" fill="#7a3a6e" opacity="0.8"/><path d="M10 6 L17 6 L11 24 L19 24 L8 46 L11 28 L5 28 Z" fill="#a85a90" opacity="0.6"/>';
    for (var i = 0; i < 14; i++) a += '<path d="M' + (4 + rnd(i)*24).toFixed(1) + ' ' + (8 + rnd(i + 9)*40).toFixed(1) + ' l0.5 1 l1 0.1 l-0.8 0.6 l0.3 1 l-1 -0.6 l-1 0.6 l0.3 -1 l-0.8 -0.6 l1 -0.1 Z" fill="#f2e6f0" opacity="0.7"/>';
    a += tx('ULTRA', 18, 30, 4.8, '#f2e6f0', { f:BLK, w:900, st:'#2a1428', sw:0.6, tf:'rotate(-14 18 30)' }) + tx('VIOLET', 18, 36, 4.4, '#e8a0d0', { f:BLK, w:900, st:'#2a1428', sw:0.6, tf:'rotate(-14 18 36)' }) + tx('flavour: ?', 16, 47.4, 2.4, '#f2e6f0', { f:E, w:800 });
    return can('mu', '#4a2a44', a);
  };
  A.f_chiefcoffee = function(){   /* a short dark coffee can: the badge, a man in it (our own, static as printed faces are), the name big */
    var a = '<rect x="3" y="6" width="26" height="45" fill="#3a2a22"/><circle cx="16" cy="22" r="8.4" fill="#f2ece0"/><circle cx="16" cy="22" r="7.4" fill="#3a2a22"/>' + stat(16, 21, 3.6, 4.2, 'cfc') + '<path d="M9.4 28 Q16 23 22.6 28 L22.6 29.4 L9.4 29.4 Z" fill="#1e1714"/><path d="M15.2 25 L16 28 L16.8 25 Z" fill="#c8402e"/>';
    a += tx('係長', 16, 39.4, 7, '#f2ece0', { w:900 }) + '<rect x="5" y="41.6" width="22" height="3.2" fill="#c9a067"/>' + tx('section chief', 16, 43.9, 2.2, '#1e1714', { f:SER, w:700 }) + tx('MILK COFFEE', 16, 48.4, 2.2, '#f2ece0', { f:E, w:900 });
    return can('cf', '#3a2a22', a);
  };
  A.f_chuhai_berry = function(){   /* a tall winter cocktail can: a glass of berries on ice, snowflakes, the gold ribbon */
    var s = '<defs><linearGradient id="cyb" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0.45"/><stop offset="0.18" stop-color="#fff" stop-opacity="0.3"/><stop offset="0.3" stop-color="#fff" stop-opacity="0.04"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/></linearGradient></defs>';
    s += '<rect x="4" y="5.4" width="22" height="51" fill="#7a2048"/><path d="M4 5.4 L13 5.4 L4 16 Z" fill="#c9a067"/>';
    for (var i = 0; i < 10; i++) { var x = 6 + rnd(i)*18, y = 9 + rnd(i + 5)*40, r = 0.8 + rnd(i + 9)*0.8; s += '<path d="M' + (x - r) + ' ' + y + ' L' + (x + r) + ' ' + y + ' M' + x + ' ' + (y - r) + ' L' + x + ' ' + (y + r) + ' M' + (x - r*0.7) + ' ' + (y - r*0.7) + ' L' + (x + r*0.7) + ' ' + (y + r*0.7) + ' M' + (x - r*0.7) + ' ' + (y + r*0.7) + ' L' + (x + r*0.7) + ' ' + (y - r*0.7) + '" stroke="#f6d8e4" stroke-width="0.25" opacity="0.7"/>'; }
    s += '<path d="M8 12 L22 12 L20.4 26 L9.6 26 Z" fill="#e8a0b8" opacity="0.6"/><rect x="10" y="13" width="4" height="4" fill="#f6f2f4" opacity="0.6"/><rect x="15" y="14" width="3.6" height="3.6" fill="#f6f2f4" opacity="0.5"/>';
    [[11, 20, '#b8243a'], [14, 22, '#c8402e'], [17, 19, '#5a1a30'], [19.6, 13, '#c8202a']].forEach(function(b){ s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="1.6" fill="' + b[2] + '"/>'; });
    s += '<path d="M5 30 Q15 26 25 30 L24.4 34.6 Q15 31 5.6 34.6 Z" fill="#c9a067"/>' + tx('COCKTAIL', 15, 33.2, 2.6, '#5a1a30', { f:SER, w:800 });
    s += tx('ベリー', 15, 40.4, 4.4, '#f2ece0', { w:900, st:'#5a1a30', sw:0.4 }) + tx('berry chūhai · 3%', 15, 45, 2.1, '#f2ece0', { f:E, w:700 }) + '<circle cx="21" cy="51" r="3" fill="#f0c890"/>' + tx('お酒', 21, 52, 2.2, '#7a2048', { w:900 });
    s += '<path d="M4 56.4 L26 56.4 L25 59 Q15 60 5 59 Z" fill="#a9a8a5"/><rect x="4" y="5.4" width="22" height="51" fill="url(#cyb)"/>' + EG_CANTOP(4, 26, 5.4);
    return s;
  };
  /* ---- the little drink cartons, 32 × 60: a gable top with its seam, a side, halftone print, a striped straw ---- */
  var carton = function(id, body, side, top, straw, art){
    var s = '<rect x="20" y="0" width="2" height="12" fill="' + straw + '"/>'; for (var i = 0; i < 6; i++) s += '<rect x="20" y="' + (i*2) + '" width="2" height="0.9" fill="#f2f0ea" opacity="0.7"/>';
    s += '<path d="M3 14 L15 6 L27 14 Z" fill="' + top + '"/><path d="M27 14 L15 6 L19 4.4 L30 12 Z" fill="' + top + '" opacity="0.7"/><path d="M3 14 L27 14" stroke="#000" stroke-opacity="0.25" stroke-width="0.4"/><path d="M14.4 6.4 L14.4 4 L15.6 4 L15.6 6.4" fill="' + top + '"/>';
    s += '<path d="M27 14 L30 12 L30 56 L27 58 Z" fill="' + side + '"/>'; for (var k = 0; k < 8; k++) s += '<rect x="27.6" y="' + (18 + k*4.6) + '" width="1.8" height="2.4" fill="#f2f0ea" opacity="0.5" transform="skewY(-34)" transform-origin="28.5 ' + (19 + k*4.6) + '"/>';
    s += '<clipPath id="ck' + id + '"><rect x="3" y="14" width="24" height="44"/></clipPath><rect x="3" y="14" width="24" height="44" fill="' + body + '"/><g clip-path="url(#ck' + id + ')">' + dots(3, 15, 24, 43, 1.2, 0.28, '#fff', 0.3) + art + '</g>';
    return s + '<rect x="3" y="57" width="24" height="1" fill="#000" opacity="0.2"/>' + sh('ck' + id, 3, 14, 24, 44, 0.25);
  };
  var hair = function(x, y, col){ return '<path d="M' + (x - 6) + ' ' + (y + 6) + ' Q' + (x - 7.4) + ' ' + (y - 4) + ' ' + x + ' ' + (y - 6) + ' Q' + (x + 7.4) + ' ' + (y - 4) + ' ' + (x + 6) + ' ' + (y + 6) + ' Z" fill="' + col + '"/>'; };
  A.f_carton_apple = function(){ return carton('ap', '#e86a5a', '#c8502e', '#f0a090', '#f0d84a', hair(13, 34, '#c8402e') + stat(13, 34, 4.2, 5, 'ap') + '<path d="M6 46 Q13 40 20 46 L20 52 L6 52 Z" fill="#f2ece0"/>' + [[22, 44], [25, 48], [21, 50]].map(function(p){ return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.2" fill="#86bb69"/>'; }).join('') + tx('Apple', 15, 22.6, 6, '#f2ece0', { f:RND, w:900, st:'#a8302a', sw:0.6 }) + tx('apple milk', 15, 55.4, 2.6, '#f2ece0', { f:E, w:800 })); };
  A.f_carton_banana = function(){ return carton('bn', '#f2a6b8', '#d8889a', '#f6c0cc', '#f0d84a', '<path d="M6 28 Q15 36 25 26 Q24 31 15 33 Q8 33 6 28 Z" fill="#f6e2a0" stroke="#c9a067" stroke-width="0.4"/><circle cx="12" cy="31" r="0.4" fill="#8a6a3a"/><circle cx="18" cy="31" r="0.4" fill="#8a6a3a"/>' + '<rect x="7" y="37" width="16" height="15" fill="#f6e2c0"/>' + hair(15, 45, '#e8803e') + stat(15, 45, 3.6, 4.4, 'bn') + tx('南国バナナ', 15, 23, 4.6, '#c8402e', { w:900 }) + tx('banana milk', 15, 56, 2.6, '#a1465a', { f:E, w:800 })); };
  A.f_carton_cherry = function(){ return carton('ch', '#e8a070', '#c8804e', '#86bb69', '#e05aa0', '<path d="M3 14 Q8 22 6 30 M27 14 Q22 24 25 30" stroke="#5e8a4a" stroke-width="1.6" fill="none"/>' + '<path d="M8 50 Q15 36 22 50 Z" fill="#c8402e"/><path d="M9 50 l2 -6 M12 50 l1 -8 M15 50 l0 -9 M18 50 l-1 -8 M21 50 l-2 -6" stroke="#f2ece0" stroke-width="0.5"/>' + '<path d="M9 34 Q9 26 15 25 Q21 26 21 34 L19 38 L11 38 Z" fill="#1e1714"/>' + stat(15, 34, 3.6, 4.4, 'ch') + '<circle cx="23" cy="40" r="1.4" fill="#c8202a"/><circle cx="24.6" cy="41" r="1.4" fill="#b8243a"/>' + tx('Rich Cherry', 15, 21.6, 4.2, '#f2ece0', { f:RND, w:900, st:'#7a3a2a', sw:0.5 }) + tx('cherry juice', 15, 56, 2.6, '#f2ece0', { f:E, w:800 })); };
  A.f_carton_coffee = function(){ return carton('cf', '#6ea062', '#4e8042', '#86bb69', '#f0d84a', [[6, 22, 5], [22, 26, 4], [8, 50, 4], [24, 52, 5], [12, 40, 3]].map(function(p){ return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="' + p[2] + '" ry="' + (p[2]*0.7) + '" fill="#c8402e"/><ellipse cx="' + (p[0] + 0.6) + '" cy="' + (p[1] - 0.4) + '" rx="' + (p[2]*0.5) + '" ry="' + (p[2]*0.3) + '" fill="#f2ece0"/>'; }).join('') + '<rect x="3" y="30" width="24" height="9" fill="#f2c8b0"/>' + stat(15, 34.4, 9, 3.6, 'cf') + '<rect x="9" y="33" width="4" height="2.4" rx="0.8" fill="none" stroke="#c8402e" stroke-width="0.4"/><rect x="17" y="33" width="4" height="2.4" rx="0.8" fill="none" stroke="#c8402e" stroke-width="0.4"/>' + tx('コーヒー牛乳', 15, 45, 3.2, '#c8402e', { w:900, st:'#f2ece0', sw:0.5 }) + tx('coffee milk', 15, 56, 2.6, '#f2ece0', { f:E, w:800 })); };
  A.f_carton_momo = function(){ return carton('mm', '#9a5a7a', '#7a3a5a', '#c87aa0', '#e05aa0', '<path d="M15 44 C4 36 7 26 15 31 C23 26 26 36 15 44 Z" fill="#f2ece0"/>' + hair(15, 34, '#f0c8a8') + stat(15, 34, 3, 3.6, 'mm') + '<circle cx="21" cy="30" r="0.8" fill="#e05aa0"/><circle cx="15" cy="51" r="3.6" fill="#f0a890"/>' + [0, 1, 2].map(function(k){ return '<path d="M' + (12 + k*2) + ' 48 L' + (12 + k*2) + ' 54" stroke="#e8786a" stroke-width="0.3"/>'; }).join('') + '<rect x="4" y="15.6" width="22" height="3.4" fill="#1e1714"/>' + tx('momo milk', 15, 25.6, 4.6, '#f2ece0', { f:RND, w:900 }) + tx('100% momo', 15, 18.4, 2.2, '#f2ece0', { f:E, w:800 })); };
  A.f_carton_melon = function(){ return carton('ml', '#f0d84a', '#d0b830', '#f6e890', '#c8402e', '<path d="M7 44 L15 24 L23 44 Z" fill="#e8504a"/><path d="M7 44 L23 44 L22 46 L8 46 Z" fill="#3e7a3a"/><path d="M7.6 43 L22.4 43" stroke="#a8d088" stroke-width="0.8"/>' + [[13, 36], [17, 36], [15, 31], [12, 40], [18, 40]].map(function(d){ return '<ellipse cx="' + d[0] + '" cy="' + d[1] + '" rx="0.5" ry="0.9" fill="#1e1714"/>'; }).join('') + '<path d="M4 50 L8 46 L12 50 L8 54 Z" fill="#f2ece0"/>' + '<path d="M6 20 l2 3 l3 -1 l-1 3 l3 2 l-3 1 l1 3 l-3 -1 l-2 3 l-1 -3 l-3 1 l1 -3 l-3 -2 l3 -1 l-1 -3 l3 1 Z" fill="#f2ece0" opacity="0.6"/>' + tx('water melon', 15, 22.4, 4.4, '#a1465a', { f:SER, w:900, it:true, st:'#f2ece0', sw:0.5 }) + tx('watermelon', 17, 56, 2.6, '#a1465a', { f:E, w:800 })); };
  /* ---- bottles ---- */
  var pet = function(id, liquid, cap, label, art){   /* a clear plastic bottle: ridges low down, the label wrapped round, a ribbed cap */
    var s = '<path d="M11 4 L19 4 L19 12 Q26 16 26 24 L26 64 Q26 68 23 68 L7 68 Q4 68 4 64 L4 24 Q4 16 11 12 Z" fill="' + liquid + '" opacity="0.5"/><path d="M11 4 L19 4 L19 12 Q26 16 26 24 L26 64 Q26 68 23 68 L7 68 Q4 68 4 64 L4 24 Q4 16 11 12 Z" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="0.4"/>';
    for (var r = 0; r < 3; r++) s += '<path d="M4.4 ' + (55 + r*4) + ' Q15 ' + (57 + r*4) + ' 25.6 ' + (55 + r*4) + '" stroke="#fff" stroke-opacity="0.35" stroke-width="0.5" fill="none"/>';
    s += '<rect x="10.5" y="0" width="9" height="5" rx="1" fill="' + cap + '"/>'; for (var i = 0; i < 6; i++) s += '<rect x="' + (11 + i*1.5) + '" y="0.6" width="0.5" height="3.8" fill="#000" opacity="0.15"/>';
    s += '<rect x="10.8" y="5" width="8.4" height="1.2" fill="' + cap + '" opacity="0.8"/><rect x="4" y="30" width="22" height="22" fill="' + label + '"/>' + art;
    return s + '<path d="M7 18 L7 64" stroke="#fff" stroke-width="1.2" opacity="0.35"/>' + sh('pb' + id, 4, 12, 22, 56, 0.3);
  };
  A.f_peachwater = function(){ return pet('pw', '#f6ece4', '#f2f0ea', 'none', '<circle cx="15" cy="37" r="6.4" fill="#f4b8a4"/><circle cx="13" cy="35" r="3" fill="#f8d4c4" opacity="0.8"/><path d="M15 30.6 Q13.4 37 15 43.4" stroke="#e08878" stroke-width="0.5" fill="none"/><circle cx="19" cy="33" r="0.7" fill="#fff" opacity="0.8"/><circle cx="11" cy="40" r="0.5" fill="#fff" opacity="0.8"/>' + tx('もものみず', 15, 48.4, 3.6, '#1e1714', { w:900 }) + tx('peach water', 15, 52, 2.2, '#1e1714', { f:E, w:600 }) + tx('clear · 透明', 15, 61, 1.8, '#8a8076', { f:E, w:700 })); };
  A.f_sighwater = function(){ return pet('sw', '#f0eee8', '#f2f0ea', '#e8e2d8', '<path d="M4 44 Q12 40 26 46 L26 52 L4 52 Z" fill="#f2f0ea"/>' + tx('はぁ…', 15, 35, 2.6, '#8a5a5a', { w:800 }) + tx('ためいき', 15, 41.6, 4.4, '#1e1714', { w:900 }) + tx('sigh water', 15, 48, 2.4, '#8a5a5a', { f:E, w:800 }) + tx('ion supply', 15, 51.4, 1.6, '#8a8076', { f:E, w:700 })); };
  A.f_strawmilk = function(){ return carton('sm', '#f6c8d0', '#e0a0b0', '#f2b0c0', '#e05aa0', '<rect x="3" y="26" width="24" height="12" fill="#e05a7a"/>' + [[9, 46], [20, 47]].map(function(p){ return '<path d="M' + p[0] + ' ' + (p[1] - 3) + ' Q' + (p[0] + 3.4) + ' ' + (p[1] - 3) + ' ' + (p[0] + 2.4) + ' ' + p[1] + ' Q' + p[0] + ' ' + (p[1] + 4) + ' ' + (p[0] - 2.4) + ' ' + p[1] + ' Q' + (p[0] - 3.4) + ' ' + (p[1] - 3) + ' ' + p[0] + ' ' + (p[1] - 3) + ' Z" fill="#d8302a"/><path d="M' + (p[0] - 2) + ' ' + (p[1] - 3) + ' l2 -1.6 l2 1.6" fill="#5e8a4a"/>'; }).join('') + tx('いちごミルク', 15, 33.6, 3.6, '#f2f0ea', { w:900 }) + tx('strawberry milk', 15, 22, 2.6, '#c8406a', { f:E, w:800 }) + tx('200ml', 15, 56, 2, '#a1465a', { f:E, w:700 })); };
  /* ---- sweets ---- */
  A.f_kissbar = function(){   /* white with pink diagonal stripes, crimped ends, a strawberry, the name big */
    var s = crimpV(0.5, 4, 20, 3.5, '#f6f2ee', 10) + '<path d="M59.5 4 ' + (function(){ var p = ''; for (var i = 0; i < 10; i++) p += 'L' + (i % 2 ? 59.5 : 56) + ' ' + (4 + 1.6*(i + 0.5)) + ' '; return p; })() + 'L59.5 20 Z" fill="#f6f2ee"/>';
    s += '<clipPath id="ksc"><rect x="4" y="4" width="52" height="16"/></clipPath><rect x="4" y="4" width="52" height="16" fill="#f6f2ee"/><g clip-path="url(#ksc)">'; for (var i = 0; i < 18; i++) s += '<path d="M' + (i*4 - 6) + ' 24 L' + (i*4 + 4) + ' 0" stroke="#f0a0b8" stroke-width="1.2"/>'; s += '</g>';
    s += '<rect x="4" y="15.6" width="52" height="4.4" fill="#e86a90"/>';
    s += '<path d="M15 6.6 Q19.6 6.6 19 10.6 Q18 14.6 15 15 Q12 14.6 11 10.6 Q10.4 6.6 15 6.6 Z" fill="#e05a8a"/><path d="M12.4 6.8 l2.6 -2 l2.6 2" fill="#6e9a4a"/>'; for (var d = 0; d < 6; d++) s += '<circle cx="' + (12.6 + (d % 3)*2.4) + '" cy="' + (9 + Math.floor(d/3)*2.4) + '" r="0.35" fill="#fbe0ea"/>';
    s += tx('KISS', 34, 14.4, 9, '#8a3a7a', { f:BLK, w:900, st:'#f6f2ee', sw:0.9, it:true }) + tx('strawberry', 46, 18.8, 2.2, '#f6f2ee', { f:E, w:800 });
    return s + sh('ks', 4, 4, 52, 16, 0.45);
  };
  A.f_deircoin = function(){   /* gold foil coins in an orange net bag, gathered at the top under a little card */
    var s = '';
    [[12, 36], [22, 38], [30, 34], [16, 46], [26, 46], [20, 28], [11, 26], [29, 25]].forEach(function(p, i){ s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6" fill="#c9a03a"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="5.2" fill="#e8c460"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.2" fill="none" stroke="#a8802a" stroke-width="0.4"/><path d="M' + (p[0] - 3) + ' ' + (p[1] - 2) + ' q2 -2 4 -1" stroke="#fff6c8" stroke-width="0.6" fill="none" opacity="0.8"/>' + (i < 3 ? tx('д', p[0], p[1] + 2, 5, '#8a6a20', { f:SER, w:900 }) : ''); });
    s += '<path d="M20 12 Q4 18 4 36 Q4 52 20 53 Q36 52 36 36 Q36 18 20 12 Z" fill="none"/>'; for (var i = 0; i < 14; i++) s += '<path d="M' + (4 + i*2.4) + ' 52 Q' + (6 + i*1.4) + ' 30 20 13" stroke="#e8803e" stroke-width="0.35" fill="none"/><path d="M' + (36 - i*2.4) + ' 52 Q' + (34 - i*1.4) + ' 30 20 13" stroke="#e8803e" stroke-width="0.35" fill="none"/>';
    s += '<rect x="17" y="10" width="6" height="4" rx="1" fill="#e8803e"/>';
    s += '<path d="M10 1 L30 1 L30 9 L22 9 L20 11 L18 9 L10 9 Z" fill="#c8302a"/><circle cx="20" cy="3" r="0.8" fill="#2a2024"/>' + tx('デイル金貨', 20, 6.8, 3.2, '#f6e2a0', { w:900 }) + tx('deir coins', 20, 8.6, 1.5, '#f6e2a0', { f:E, w:700 });
    s += '<rect x="9" y="49" width="22" height="4.4" rx="1" fill="#f2ece0" opacity="0.92"/>' + tx('milk choco', 15, 52.2, 1.8, '#7a4a2a', { f:E, w:700 }) + tx('6 coins', 26, 52.2, 1.8, '#7a4a2a', { f:E, w:700 });
    return s;
  };
  A.f_ouchgum = function(){   /* a tall tin, its lid with a hinge, three stripes of flavour, bandage-spotted gum inside the labels */
    var s = '<rect x="4" y="6" width="24" height="32" rx="2" fill="#c8c4bc"/><rect x="4" y="2" width="24" height="6" rx="1.6" fill="#e8c0d0"/><rect x="4" y="6.6" width="24" height="1" fill="#000" opacity="0.2"/><rect x="12" y="2" width="8" height="6" fill="#f0d84a" opacity="0.6"/>';
    [['#a86a9a', 5], ['#86bb69', 13], ['#f0b83a', 21]].forEach(function(c){ s += '<rect x="' + c[1] + '" y="15" width="6.4" height="21" rx="1" fill="' + c[0] + '"/>'; for (var k = 0; k < 6; k++) s += '<circle cx="' + (c[1] + 2 + (k % 2)*2.4) + '" cy="' + (19 + Math.floor(k/2)*5) + '" r="0.7" fill="#f2f0ea"/>'; });
    s += tx('OUCHIE!', 16, 13.6, 5.4, '#f0d84a', { f:BLK, w:900, st:'#a1465a', sw:0.7 });
    return s + sh('og', 4, 2, 24, 36, 0.4);
  };
  A.f_stripegum = function(){   /* a magenta box, diagonal stripes of every flavour, five sticks laid in front */
    var s = '<rect x="4" y="2" width="36" height="13" fill="#c83a8a"/><clipPath id="sgc"><rect x="4" y="2" width="36" height="13"/></clipPath><g clip-path="url(#sgc)">'; ['#f0d84a', '#e8603e', '#f0a0b8', '#f2f0ea', '#a86a9a'].forEach(function(c, i){ s += '<path d="M' + (4 + i*8) + ' 15 L' + (12 + i*8) + ' 2 L' + (14 + i*8) + ' 2 L' + (6 + i*8) + ' 15 Z" fill="' + c + '" opacity="0.75"/>'; }); s += '</g>';
    s += '<rect x="9" y="5.4" width="26" height="6" fill="#f6f2ee"/>' + tx('STRIPE GUM', 22, 10, 4, '#c8302a', { f:BLK, w:900 });
    ['#a86a9a', '#e8803e', '#f0a0b8', '#f0d84a', '#f6c8a8'].forEach(function(c, i){ var x = 5 + i*7; s += '<rect x="' + x + '" y="17" width="5.6" height="12" fill="#f6f2ee"/><clipPath id="sk' + i + '"><rect x="' + x + '" y="17" width="5.6" height="12"/></clipPath><g clip-path="url(#sk' + i + ')">'; for (var k = 0; k < 6; k++) s += '<path d="M' + (x - 2) + ' ' + (19 + k*2.4) + ' Q' + (x + 3) + ' ' + (17 + k*2.4) + ' ' + (x + 8) + ' ' + (15 + k*2.4) + '" stroke="' + c + '" stroke-width="1.1" fill="none"/>'; s += '</g>'; });
    return s + sh('sg', 4, 2, 36, 13, 0.35);
  };
  A.f_bubblycola = function(){   /* a soft white gum pack: the name in fat red letters, pink bubbles rising */
    var s = '<rect x="2" y="3" width="40" height="20" rx="1.4" fill="#f6f2ee"/><rect x="2" y="18" width="40" height="5" rx="1" fill="#ece6e0"/>';
    for (var i = 0; i < 12; i++) s += '<circle cx="' + (6 + rnd(i)*32).toFixed(1) + '" cy="' + (5 + rnd(i + 4)*12).toFixed(1) + '" r="' + (0.6 + rnd(i + 8)*1.4).toFixed(2) + '" fill="#f0a0b8" opacity="0.8"/>';
    s += tx('Bubbly', 18, 12.6, 8, '#d8202a', { f:BLK, w:900, st:'#5a1a30', sw:0.7 }) + tx('Cherry Cola', 26, 18, 5, '#d8202a', { f:SER, w:900, it:true });
    return s + sh('bc', 2, 3, 40, 20, 0.4);
  };
  A.f_pachipachi = function(){   /* a little foil sachet, black with stars, the popping words loud */
    var s = crimpH(1.4, 4, 36, 2.6, '#2a2026', 14) + crimpH(49.6, 4, 36, 2.6, '#2a2026', 14) + '<rect x="4" y="3" width="32" height="48" fill="#2a2026"/>';
    for (var i = 0; i < 9; i++) { var x = 8 + rnd(i)*24, y = 24 + rnd(i + 3)*22, r = 1.2 + rnd(i + 6)*1.8; s += '<path d="M' + x + ' ' + (y - r) + ' L' + (x + r*0.3) + ' ' + (y - r*0.3) + ' L' + (x + r) + ' ' + y + ' L' + (x + r*0.3) + ' ' + (y + r*0.3) + ' L' + x + ' ' + (y + r) + ' L' + (x - r*0.3) + ' ' + (y + r*0.3) + ' L' + (x - r) + ' ' + y + ' L' + (x - r*0.3) + ' ' + (y - r*0.3) + ' Z" fill="' + ['#f0d84a', '#f0a0b8', '#86bb69'][i % 3] + '"/>'; }
    s += '<ellipse cx="20" cy="36" rx="9" ry="6" fill="#f0a0b8"/>'; for (var k = 0; k < 20; k++) s += '<circle cx="' + (13 + rnd(k + 20)*14).toFixed(1) + '" cy="' + (32 + rnd(k + 40)*8).toFixed(1) + '" r="0.5" fill="#fbe0ea"/>';
    s += tx('パチパチ', 20, 13.6, 6.4, '#f0a0b8', { w:900, st:'#fff', sw:0.4 }) + tx('popping candy', 20, 19.4, 2.8, '#f2f0ea', { f:E, w:900 });
    return s + sh('pp', 4, 3, 32, 48, 0.4);
  };
  A.f_hotball = function(){   /* a yellow box, a window cut like a cloud showing the red balls inside */
    var s = '<path d="M4 4 L7 1.6 L30 1.6 L27 4 Z" fill="#c8302a"/><path d="M27 4 L30 1.6 L30 36 L27 38.4 Z" fill="#c8a020"/><rect x="4" y="4" width="23" height="34.4" fill="#f0d030"/>';
    s += '<path d="M8 25 Q6 18 11 17 Q12 13 16 14 Q20 12 22 16 Q26 16 24 22 Q26 26 22 27 L9 27 Z" fill="#f6f2ee" stroke="#c8302a" stroke-width="0.5"/><path d="M10 25 Q9 19 12.6 18.6 Q14 15.6 16.4 16.4 Q19.6 15 20.6 18 Q23.6 18.6 22 22.6 Q23 25 21 25 Z" fill="#5a1a14"/>';
    [[13, 21], [17, 20], [19.4, 23], [15, 23.6]].forEach(function(b){ s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="2.2" fill="#d8201a"/><circle cx="' + (b[0] - 0.7) + '" cy="' + (b[1] - 0.7) + '" r="0.6" fill="#fff" opacity="0.6"/>'; });
    s += '<path d="M10 27 L12 31 L19 31 L21 27 Z" fill="#f6f2ee" stroke="#c8302a" stroke-width="0.4"/>';
    s += tx('ATOMIC', 15.5, 9, 4.2, '#c8302a', { f:BLK, w:900 }) + tx('HOT BALL', 15.5, 13.2, 3.8, '#c8302a', { f:BLK, w:900 }) + tx('red hot', 15.5, 35.4, 2.8, '#c8302a', { f:E, w:900, it:true });
    return s + sh('hb', 4, 4, 23, 34.4, 0.3);
  };
  A.f_wafermouse = function(){   /* a paper roll of chocolate wafers: brown paper, a red label, the ends twisted white */
    var s = '<defs><linearGradient id="nkr" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0.4"/><stop offset="0.25" stop-color="#fff" stop-opacity="0.2"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></linearGradient></defs>';
    s += '<rect x="12" y="2" width="16" height="50" rx="2" fill="#5e3a26"/><path d="M12 2 Q20 0 28 2 L28 6 L12 6 Z" fill="#f2ece0"/><path d="M12 48 L28 48 L28 52 Q20 54 12 52 Z" fill="#f2ece0"/>';
    s += '<rect x="12.6" y="14" width="14.8" height="10" rx="2.4" fill="#c8302a" stroke="#f2ece0" stroke-width="0.5"/>' + tx('Nekko', 20, 21, 4.4, '#f2ece0', { f:SER, w:900 });
    s += '<path d="M18 34 Q16.4 30 18.4 28.6 L18.4 27 L19.6 28.2 L20.6 28.2 L21.6 27 L21.6 28.6 Q23.6 30 22 34 Z" fill="#f2ece0"/><path d="M22 33 q2.6 -0.4 2 -3" stroke="#f2ece0" stroke-width="0.6" fill="none"/>' + tx('since 1847', 20, 42, 2.6, '#f2ece0', { f:SER, w:700, it:true });
    return s + '<rect x="12" y="2" width="16" height="50" rx="2" fill="url(#nkr)"/>';
  };
  A.f_tvgum = function(){   /* an old pink stick-gum pack, two dogs running across it, worn and torn at one end */
    var s = '<rect x="3" y="8" width="34" height="38" fill="#f2b8c4"/><path d="M37 8 L37 46 L34 46 L35.4 40 L33.4 34 L35.6 28 L33.6 20 L35.4 14 L34 8 Z" fill="#c8a080"/><rect x="3" y="8" width="34" height="2" fill="#e090a4"/><rect x="3" y="44" width="34" height="2" fill="#e090a4"/>';
    s += '<rect x="5" y="12" width="9" height="6" rx="1" fill="#1e1714"/>';
    s += '<path d="M10 33 Q9 26 14 26 L16.6 23.4 L17.4 26 Q20.6 27.4 19.4 33 L18 38 L16.6 33 L13 33 L11.6 38 Z" fill="#c8c4bc" stroke="#5a5450" stroke-width="0.35"/><circle cx="16.4" cy="27.6" r="0.5" fill="#1e1714"/>';
    s += '<path d="M21 33 Q20 26 25 26 L27.6 23.4 L28.4 26 Q31.6 27.4 30.4 33 L29 38 L27.6 33 L24 33 L22.6 38 Z" fill="#e8c060" stroke="#8a6a20" stroke-width="0.35"/><circle cx="27.4" cy="27.6" r="0.5" fill="#1e1714"/>';
    for (var i = 0; i < 22; i++) s += '<rect x="' + (4 + rnd(i)*31).toFixed(1) + '" y="' + (9 + rnd(i + 7)*36).toFixed(1) + '" width="' + (0.6 + rnd(i + 3)*2).toFixed(1) + '" height="0.5" fill="#fff" opacity="0.5"/>';
    s += tx('TV GUM', 26, 17.4, 5, '#c8302a', { f:BLK, w:900 }) + tx('テレビガム', 20, 41, 4.6, '#c8302a', { w:900 }) + tx('5 sticks · strawberry', 20, 21.6, 2.2, '#8a3a4a', { f:E, w:700 });
    return s + sh('tv', 3, 8, 34, 38, 0.35);
  };
  A.f_fruitslices = function(){   /* a round clear tub of sugared fruit slices in a ring, a square label on the lid */
    var s = '<circle cx="20" cy="20" r="18.4" fill="#ece8e2" opacity="0.25"/><circle cx="20" cy="20" r="18.4" fill="none" stroke="#fff" stroke-opacity="0.6" stroke-width="0.5"/>';
    ['#c8302a', '#f0d84a', '#5e3a5a', '#e8803e', '#86bb69', '#c8302a', '#f0d84a', '#e8a0b8', '#e8803e', '#86bb69'].forEach(function(c, i){ var a = i/10*Math.PI*2; s += '<g transform="translate(' + (20 + Math.cos(a)*11.4).toFixed(2) + ' ' + (20 + Math.sin(a)*11.4).toFixed(2) + ') rotate(' + (a*180/Math.PI + 90) + ')"><path d="M-5.4 0 A5.4 5.4 0 0 1 5.4 0 Z" fill="' + c + '"/><path d="M-4.4 0 A4.4 4.4 0 0 1 4.4 0" stroke="#f6f2ee" stroke-width="0.6" fill="none"/>'; for (var k = 0; k < 8; k++) s += '<circle cx="' + ((rnd(i*9 + k) - 0.5)*8).toFixed(2) + '" cy="' + (-rnd(i*7 + k)*4).toFixed(2) + '" r="0.25" fill="#fff" opacity="0.8"/>'; s += '</g>'; });
    s += '<rect x="13" y="13" width="14" height="14" fill="#c8302a"/><path d="M20 15 l1.6 3.4 l3.6 0.6 l-2.6 2.6 l0.6 3.6 l-3.2 -1.8 l-3.2 1.8 l0.6 -3.6 l-2.6 -2.6 l3.6 -0.6 Z" fill="#f0d84a" opacity="0.5"/>' + tx('fruit', 20, 19.6, 3.4, '#f6f2ee', { f:SER, w:700 }) + tx('slices', 20, 24, 3.4, '#f6f2ee', { f:SER, w:700 });
    return s + '<circle cx="20" cy="20" r="18.4" fill="#fff" opacity="0.06"/><path d="M8 10 Q14 4 22 4" stroke="#fff" stroke-width="1.4" opacity="0.5" fill="none"/>';
  };
  A.f_waxbottles = function(){   /* little wax bottles in a row, coloured juice behind the wax, caps of soft wax */
    var s = ''; ['#c8402e', '#e8a040', '#f0d84a', '#86bb69', '#e6a6b3'].forEach(function(c, i){ var x = 5 + i*7.6; s += '<path d="M' + x + ' 28 L' + x + ' 14 Q' + x + ' 10.6 ' + (x + 2) + ' 9.6 L' + (x + 2) + ' 5 L' + (x + 4) + ' 5 L' + (x + 4) + ' 9.6 Q' + (x + 6) + ' 10.6 ' + (x + 6) + ' 14 L' + (x + 6) + ' 28 Z" fill="#f2ece4" opacity="0.6"/><path d="M' + (x + 0.6) + ' 27.4 L' + (x + 0.6) + ' 15 Q' + (x + 0.6) + ' 12 ' + (x + 2.4) + ' 11 L' + (x + 3.6) + ' 11 Q' + (x + 5.4) + ' 12 ' + (x + 5.4) + ' 15 L' + (x + 5.4) + ' 27.4 Z" fill="' + c + '" opacity="0.85"/><rect x="' + (x + 1.8) + '" y="3.4" width="2.4" height="2.4" rx="0.6" fill="' + c + '"/><path d="M' + (x + 1.2) + ' 14 L' + (x + 1.2) + ' 26" stroke="#fff" stroke-width="0.5" opacity="0.6"/>'; });
    return s;
  };
  A.f_sakuramallow = function(){   /* a soft pink bag of flower-shaped marshmallows, a gold ribbon, sakura falling */
    var s = crimpH(1.4, 3, 37, 2.6, '#f2b8c8', 16) + crimpH(49.6, 3, 37, 2.6, '#f2b8c8', 16) + '<rect x="3" y="3" width="34" height="47" fill="#f2b8c8"/>';
    for (var i = 0; i < 9; i++) { var x = 6 + rnd(i)*28, y = 6 + rnd(i + 9)*20; for (var k = 0; k < 5; k++) { var a = k/5*Math.PI*2 - Math.PI/2; s += '<circle cx="' + (x + Math.cos(a)*1).toFixed(2) + '" cy="' + (y + Math.sin(a)*1).toFixed(2) + '" r="0.8" fill="#f8e2ea" opacity="0.7"/>'; } }
    s += '<path d="M5 18 Q20 14 35 18 L34 23 Q20 19 6 23 Z" fill="#d8b060"/><path d="M5 18 L3 20.6 L5.6 21 Z M35 18 L37 20.6 L34.4 21 Z" fill="#b89040"/>';
    [[12, 40], [20, 43], [28, 39], [16, 35], [25, 34]].forEach(function(p){ for (var k = 0; k < 5; k++) { var a = k/5*Math.PI*2 - Math.PI/2; s += '<circle cx="' + (p[0] + Math.cos(a)*2).toFixed(2) + '" cy="' + (p[1] + Math.sin(a)*2).toFixed(2) + '" r="1.8" fill="#fbf2f4"/>'; } s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="0.6" fill="#f2c0cc"/>'; });
    s += tx('さくらマシュマロ', 20, 21.6, 3.4, '#8a3a4a', { w:900 }) + tx('marshmallows', 20, 30, 4, '#d8b060', { f:SER, w:700, it:true, st:'#8a3a4a', sw:0.3 });
    return s + sh('sm', 3, 3, 34, 47, 0.45);
  };
  A.f_devilsour = function(){   /* a black sachet, a grinning sour monster (our own; green, never blue), lightning and drips */
    var s = '<path d="M4 4 Q4 2 6 2 L34 2 Q36 2 36 4 L36 50 Q36 52 34 52 L6 52 Q4 52 4 50 Z" fill="#1e1a1c"/><circle cx="20" cy="5" r="1.4" fill="#4a4448"/>';
    for (var i = 0; i < 8; i++) s += '<path d="M' + (6 + i*4) + ' 2 l0 ' + (2 + rnd(i)*4).toFixed(1) + '" stroke="#86bb69" stroke-width="0.8" stroke-linecap="round" opacity="0.7"/>';
    s += '<path d="M7 24 l2 -3 l-1 3 l2 -1" stroke="#f0d84a" stroke-width="0.6" fill="none"/><path d="M31 22 l-2 -3 l1 3 l-2 -1" stroke="#f0d84a" stroke-width="0.6" fill="none"/>';
    s += '<path d="M9 44 Q8 28 20 26 Q32 28 31 44 Z" fill="#6e9a4a"/><path d="M12 30 Q14 27 17 29 M23 29 Q26 27 28 30" stroke="#3e6a2a" stroke-width="0.6" fill="none"/><circle cx="15" cy="34" r="3" fill="#f2f0ea"/><circle cx="25" cy="34" r="2.4" fill="#f2f0ea"/><circle cx="15.6" cy="34.4" r="1.2" fill="#1e1714"/><circle cx="24.6" cy="34.4" r="1" fill="#1e1714"/><path d="M12 40 l2 1.6 l2 -1.6 l2 1.6 l2 -1.6 l2 1.6 l2 -1.6 l2 1.6 l2 -1.6" stroke="#f2f0ea" stroke-width="0.7" fill="#a83a4a"/>';
    s += tx('魔鬼酸', 20, 15, 7, '#e8a0d0', { w:900, st:'#5a1a3a', sw:0.7 }) + tx('ACID SUGAR', 20, 21.4, 3.6, '#e05aa0', { f:BLK, w:900 });
    return s + sh('ds', 4, 2, 32, 50, 0.35);
  };
  A.f_cocoacig = function(){   /* a candy-cigarette pack, the top flipped open, three white sticks with brown tips */
    var s = '<rect x="7" y="12" width="26" height="40" fill="#f6f2ee"/><rect x="7" y="12" width="26" height="12" fill="#a83a5a"/><path d="M7 12 L33 12 L31 8 L9 8 Z" fill="#c8506a"/>';
    [[12, 0], [16.6, 2], [21, -1]].forEach(function(c){ s += '<rect x="' + c[0] + '" y="' + (1 + c[1]) + '" width="3.4" height="13" rx="0.6" fill="#f6f2ee" stroke="#d8d4cc" stroke-width="0.3"/><rect x="' + c[0] + '" y="' + (1 + c[1]) + '" width="3.4" height="2.2" rx="0.6" fill="#8a5a3a"/>'; });
    s += '<rect x="7" y="12" width="26" height="1" fill="#000" opacity="0.2"/><rect x="26" y="10.6" width="4" height="2" fill="#f0b83a"/>';
    s += '<path d="M14 30 l2 -3 l2 3 l2 -3 l2 3 l2 -3 l2 3" stroke="#c9a067" stroke-width="0.8" fill="none"/>' + tx('QUEENS', 20, 37, 5.4, '#a83a5a', { f:SER, w:900 }) + tx('ココアシガレット', 20, 43, 2.8, '#1e1714', { w:900 }) + tx('CANDY', 20, 48.4, 3, '#1e1714', { f:E, w:900 });
    return s + sh('cc', 7, 8, 26, 44, 0.35);
  };
  A.f_alyonka = function(){   /* a chocolate in a folded paper twist: cream and gold, a headscarf (static where the face is, as printed faces are), the name in a curl */
    var s = '<path d="M20 2 L37 20 L20 38 L3 20 Z" fill="#e8d890"/><path d="M20 2 L37 20 L20 20 Z" fill="#d8c070" opacity="0.6"/><path d="M3 20 L20 38 L20 20 Z" fill="#c8b060" opacity="0.4"/>';
    s += '<path d="M20 2 L28 10 L12 10 Z" fill="#3a2a1e"/>'; for (var i = 0; i < 6; i++) s += '<path d="M' + (14 + i*2) + ' 9 L' + (17 + i*2) + ' 5" stroke="#c9a067" stroke-width="0.25"/>';
    s += '<path d="M12 22 Q11 10 20 10 Q29 10 28 22 Q27 26 25 27 L15 27 Q13 26 12 22 Z" fill="#c8402e"/><path d="M13 14 q3 2 6 0 M21 13 q3 2 5 -1 M14 20 q2 1 4 0" stroke="#6e9a4a" stroke-width="0.8" fill="none"/><circle cx="16" cy="16" r="1" fill="#f0d84a"/><circle cx="24" cy="18" r="1" fill="#f0d84a"/>';
    s += stat(20, 20, 4.8, 5.6, 'al');
    s += '<ellipse cx="20" cy="31" rx="5" ry="1.8" fill="#c8302a"/>' + tx('Алёнка', 20, 35.2, 3.8, '#7a4a2a', { f:SER, w:700, it:true });
    return s;
  };
  for (var k in A) EG_ART[k] = A[k];
})();
function egSvgFor(id, A, w, h){
  var raw = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + A.vb[0] + ' ' + A.vb[1] + '" width="' + w + '" height="' + h + '">' + egFixSvg(id, EG_ART[id] ? EG_ART[id]() : A.svg()) + '</svg>';
  try { var doc = new DOMParser().parseFromString(raw, 'image/svg+xml'); if (!doc.querySelector('parsererror')) { egFixDom(id, doc.documentElement); raw = new XMLSerializer().serializeToString(doc.documentElement); } } catch (e) {}
  return raw;
}
/* (Nov 20, Aisling: "anything that is photo we can just keep the same because that IS real and i want those kept i like
   those as is but anything ccreated i want to match those") a thing drawn from a real photo or scan (its drawing holds a
   picture: the pit, her scans, edited art) is left exactly as it is: no grading, no lighting, no haze, no pixel. */
var EG_PHOTO = {};
function egIsPhoto(id){ if (id in EG_PHOTO) return EG_PHOTO[id]; var A = PK_ART[id], v = false; try { v = !!(A && !A.paint && typeof A.svg === 'function' && /<image\b/.test(A.svg())); } catch (e) {} return (EG_PHOTO[id] = v); }
var _egPkMap = pkMap;
/* (Nov 20, Aisling: "pocket no longer working at all … oh its just real slow") the Embroidery look used to be made for
   every thing at once when the pocket opened, which froze the page. Now Seam's map is made as before (the pocket opens
   straight away, each thing in its plain look) and the Embroidery look is made one thing at a time in the background,
   the things you can see first; each swaps in when it's ready. */
var EG_Q = [], EG_QBUSY = false;
function egBakeOne(id, done){
  var A = PK_ART[id], M = POK.maps[id]; if (!M || M.eg || M.egBusy) { done(); return; } M.egBusy = true;
  var S = Math.max(1, Math.min(2, Math.floor(440/Math.max(M.w, M.h)))), fin = function(){ M.egBusy = false; POK.items && POK.items.forEach(function(it){ if (it.id === id) { it.S = null; it.Sh = null; } }); if (POK.lift && POK.lift.it && POK.lift.it.id === id) POK.lift.S = null; done(); };
  if (A && A.paint) { try { var pc = document.createElement('canvas'); pc.width = M.w*S; pc.height = M.h*S; A.paint(pc.getContext('2d'), pc.width, pc.height); M.eg = egBake(M, pc, S, A); } catch (e) { console.error(e); } fin(); return; }
  if (!A || typeof A.svg !== 'function') { fin(); return; }
  var img = new Image(); img.onload = function(){ try { M.eg = egBake(M, img, S, A); } catch (e) { console.error(e); } fin(); }; img.onerror = fin;
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(egSvgFor(id, A, M.w*S, M.h*S));
}
function egQueue(id, first){ if (EG_SEAM.noBake || egIsPhoto(id)) return;   /* her photos stay as they are */ var M = POK.maps[id]; if (!M || M.eg || EG_Q.indexOf(id) >= 0) return; if (first) EG_Q.unshift(id); else EG_Q.push(id); egRun(); }
function egRun(){ if (EG_QBUSY || !EG_Q.length) return; EG_QBUSY = true; var id = EG_Q.shift(); setTimeout(function(){ egBakeOne(id, function(){ EG_QBUSY = false; setTimeout(egRun, 40); }); }, 0); }
pkMap = function(id, done){ _egPkMap(id, function(){ done(); egQueue(id); }); };
var _egPkSprite = pkSprite;
pkSprite = function(id, sc, rot, light, now){
  var M = POK.maps[id], A = PK_ART[id]; if (M && !M.eg && !EG_SEAM.lookOff) egQueue(id, true);
  if (!M || !M.eg || EG_SEAM.lookOff) return _egPkSprite.apply(null, arguments);
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
/* (Nov 20) the close-ups' grime and grain, laid inside each picture so it stops at the paper's edge */
if (typeof f3Open === 'function') { var _egF3Open = f3Open; f3Open = function(svg, vb){ var r = _egF3Open.apply(null, arguments);
  try { var sv = document.querySelector('#f3c-pic svg'); if (sv && vb) { var W = vb[0], H = vb[1], ns = 'http://www.w3.org/2000/svg', g = document.createElementNS(ns, 'g');
    g.innerHTML = '<defs><filter id="egGr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="' + (6/Math.max(W, H)).toFixed(4) + '" numOctaves="4" seed="7"/><feColorMatrix values="0 0 0 0 0.24 0 0 0 0 0.2 0 0 0 0 0.16 0 0 0 1.3 -0.55"/></filter><filter id="egGn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="' + (900/Math.max(W, H)).toFixed(3) + '" numOctaves="1"/><feColorMatrix values="0 0 0 0 0.28 0 0 0 0 0.24 0 0 0 0 0.2 0 0 0 0.5 0"/></filter></defs>' +
      '<rect width="' + W + '" height="' + H + '" filter="url(#egGr)" style="mix-blend-mode:multiply" opacity="0.6"/><rect width="' + W + '" height="' + H + '" filter="url(#egGn)" style="mix-blend-mode:multiply" opacity="0.5"/>';
    sv.appendChild(g); } } catch (e) {} return r; }; }
EG_SEAM.look = { ids:function(){ return Object.keys(PK_ART); }, photos:function(){ return Object.keys(PK_ART).filter(function(id){ return egIsPhoto(id); }); }, vb:function(id){ var A = PK_ART[id]; return A ? [A.vb, A.k, A.svg ? A.svg().length : 0] : null; }, words:function(id){ var A = PK_ART[id]; if (!A || !A.svg) return null; var d = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + A.svg() + '</svg>', 'image/svg+xml'); return [].map.call(d.querySelectorAll('text'), function(t){ return t.textContent; }); },
  sheet:function(ids, cell, cb){   /* (tests: a contact sheet of things in their Embroidery look, cell px each, labelled with their ids) */
    var cols = 5, rows = Math.ceil(ids.length/cols), c = document.createElement('canvas'); c.width = cols*cell; c.height = rows*(cell + 16); var x = c.getContext('2d');
    x.fillStyle = '#17141a'; x.fillRect(0, 0, c.width, c.height); var n = 0;
    (function next(){ if (n >= ids.length) { cb(c.toDataURL('image/png')); return; } var id = ids[n], k = n++;
      var go = function(){ var M = POK.maps[id], src = M && (M.eg ? M.eg.c : null); var cx = (k % cols)*cell, cy = ((k/cols) | 0)*(cell + 16);
        if (src) { var sc = Math.min((cell - 8)/src.width, (cell - 8)/src.height); x.imageSmoothingQuality = 'high'; x.drawImage(src, cx + (cell - src.width*sc)/2, cy + (cell - src.height*sc)/2, src.width*sc, src.height*sc); }
        else { x.fillStyle = '#a33'; x.fillText('no look', cx + 8, cy + 20); }
        x.fillStyle = '#d8ccb4'; x.font = '11px monospace'; x.fillText(id, cx + 4, cy + cell + 12); setTimeout(next, 0); };
      if (POK.maps[id] && POK.maps[id].eg) go(); else { try { pkMap(id, function(){ egBakeOne(id, go); }); } catch (e) { go(); } } })();
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
