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
function egBake(M, img, S){
  var w = M.w*S, h = M.h*S, c = document.createElement('canvas'); c.width = w; c.height = h;
  var x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h);
  var id = x.getImageData(0, 0, w, h), d = id.data, L = new Float32Array(w*h), A = new Uint8Array(w*h);
  for (var k = 0; k < w*h; k++) { L[k] = (d[k*4]*0.3 + d[k*4 + 1]*0.59 + d[k*4 + 2]*0.11)/255; A[k] = d[k*4 + 3]; }
  var fm = document.createElement('canvas'); fm.width = w; fm.height = h; var fx = fm.getContext('2d'), fid = fx.createImageData(w, h), fd = fid.data, anyFoil = false;
  for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
    var k = j*w + i; if (A[k] < 8) continue;
    var mk = ((j/S) | 0)*M.w + ((i/S) | 0), ri = M.RI[mk], mt = ri >= 0 ? EG_MAT[ri] : 0;
    var r = d[k*4], g = d[k*4 + 1], b = d[k*4 + 2];
    if (ri >= 0) { var nR = RN[ri], ix = Math.min(nR - 1, Math.max(0, (M.V[mk]*(nR - 1)) | 0)), ic = RF[ri*FOGN*RMAX + ix];   /* the ink grades it */
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
var _egPkMap = pkMap;
pkMap = function(id, done){
  _egPkMap(id, function(){
    var A = PK_ART[id], M = POK.maps[id]; if (!M) { done(); return; }
    var S = Math.max(1, Math.min(3, Math.floor(900/Math.max(M.w, M.h)))), img = new Image();   /* drawn finer than its lifted size, so it stays sharp up close */
    if (A && A.paint) { try { var pc = document.createElement('canvas'); pc.width = M.w*S; pc.height = M.h*S; A.paint(pc.getContext('2d'), pc.width, pc.height); M.eg = egBake(M, pc, S); } catch (e) { console.error(e); } done(); return; }   /* (a thing painted straight onto a canvas: the stranger's note) */
    if (!A || typeof A.svg !== 'function') { done(); return; }   /* (nothing to draw it from: Seam's own way) */
    img.onload = function(){ try { M.eg = egBake(M, img, S); } catch (e) { console.error(e); } done(); };
    img.onerror = function(){ done(); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + A.vb[0] + ' ' + A.vb[1] + '" width="' + M.w*S + '" height="' + M.h*S + '">' + A.svg() + '</svg>');
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
EG_SEAM.look = { ids:function(){ return Object.keys(PK_ART); }, lift:function(id){ if (POK.lift) { POK.lift = null; POK.ask = null; pkAsk.style.display = 'none'; } POK.folder = null; POK.page = 0; pkLayout(); var it = (POK.items || []).filter(function(i){ return i.id === id; })[0]; if (!it) { POK.folder = pkFolderOf(id); POK.page = 0; pkLayout(); it = (POK.items || []).filter(function(i){ return i.id === id; })[0]; } if (it) pkLift(it); return !!it; }, yes:function(){ var L = POK.lift; if (L && PK_ART[L.it.id].onYes) PK_ART[L.it.id].onYes(L.it, L); }, off:function(v){ EG_SEAM.lookOff = !!v; POK.items.forEach(function(it){ it.S = null; it.Sh = null; }); if (POK.lift) POK.lift.S = null; try { pkLayout(); } catch (e) {} }, baked:function(){ var n = 0, t = 0; for (var k in POK.maps) { t++; if (POK.maps[k].eg) n++; } return [n, t]; } };   /* (tests: how many things have their Embroidery look) */

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
