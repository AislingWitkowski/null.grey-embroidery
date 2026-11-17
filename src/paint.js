/* ================================================================
   EMBROIDERY · hand-painted textures, made in code (the way Seam paints its walls: noise, ramps, no image files).
   each painter fills a small canvas pixel by pixel from the station's inks; the graphics card then lights it, and
   the ink pass snaps it back onto the ramps. noise helpers are Seam's own (a-head.html: hsh, vn, fbm).
   ================================================================ */
import * as THREE from 'three';
import { inkRGB } from './inks.js';

export function hsh(a, b){ let n = (Math.imul(a|0, 374761393) + Math.imul(b|0, 668265263))|0; n = Math.imul(n ^ (n >>> 13), 1274126177); n = n ^ (n >>> 16); return (n >>> 0)/4294967296; }
export function vn(x, y){ const xi = Math.floor(x), yi = Math.floor(y); let fx = x - xi, fy = y - yi; fx = fx*fx*(3 - 2*fx); fy = fy*fy*(3 - 2*fy); const a = hsh(xi, yi), b = hsh(xi + 1, yi), c = hsh(xi, yi + 1), d = hsh(xi + 1, yi + 1); return a + (b - a)*fx + (c - a)*fy + (a - b - c + d)*fx*fy; }
export function fbm(x, y){ return vn(x, y)*0.55 + vn(x*2.03 + 17.1, y*2.03 - 9.4)*0.3 + vn(x*4.1 - 3.3, y*4.1 + 5.7)*0.15; }
export function frac(v){ return v - Math.floor(v); }
export function clamp(v, a, b){ return v < a ? a : (v > b ? b : v); }
export function sm(a, b, v){ const t = clamp((v - a)/(b - a), 0, 1); return t*t*(3 - 2*t); }

/* fn(x, y) in metres across the texture → [ramp, t] or [ramp, t, alpha] or null (transparent) */
export function paint(w, h, mw, mh, fn, opts = {}){
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const cx = cv.getContext('2d'), im = cx.createImageData(w, h), d = im.data;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const r = fn((i + 0.5)/w*mw, (1 - (j + 0.5)/h)*mh, i, j), o = (j*w + i)*4;
    if (!r) { d[o + 3] = 0; continue; }
    const c = inkRGB(r[0], r[1]); d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = r.length > 2 ? Math.round(r[2]*255) : 255;
  }
  cx.putImageData(im, 0, 0);
  return tex(cv, opts);
}
export function tex(cv, opts = {}){
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;   /* crisp up close: the pixel crunch */
  t.minFilter = THREE.LinearMipmapLinearFilter;   /* and no shimmer far away */
  t.wrapS = t.wrapT = opts.clampEdge ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  t.anisotropy = 2;
  return t;
}

/* ---------------- the station building: stucco over brick in bands, the paint gone; tall shut doors in faded sage over
   grey boards, iron straps; windows blacked out with old newspaper, one pane broken. one 6 m tile = a door bay and a
   window bay (Seam's f3Building, carried over). 3.4 m tall. ---------------- */
export function paintFacade(){
  return paint(384, 224, 6, 3.4, (x, h) => {
    const bay = x % 3, isDoor = x < 3, win = !isDoor && bay > 1.05 && bay < 1.95 && h > 0.95 && h < 2.25;
    const door = isDoor && bay > 0.95 && bay < 2.05 && h < 2.45;
    if (h < 0.14) return ['hgrey', 0.24 + 0.08*vn(x*20, h*30)];
    if (door) {
      const dx = bay - 1.5, f = Math.abs(dx) > 0.5 || h > 2.37;
      if (f) return ['hwood', 0.22 + 0.06*vn(x*20, h*6)];
      if (Math.abs(dx) < 0.012) return ['hblack', 0.2];
      if ((Math.abs(h - 0.45) < 0.03 || Math.abs(h - 1.95) < 0.03) && Math.abs(dx) > 0.2) return ['hblack', 0.5 + (vn(x*40, h*40) > 0.6 ? 0.2 : 0)];
      const joint = frac(dx*10 + 0.5) < 0.06, gr = vn(x*60, h*3), wet = 1 - sm(0, 0.6, h);
      const paintLeft = fbm(x*3, h*1.5) > 0.56;
      return [paintLeft ? 'hsage' : 'hwood', clamp((joint ? 0.15 : 0.42 + 0.14*gr) - 0.14*wet, 0, 1)];
    }
    if (win) {
      if (Math.abs(bay - 1.5) > 0.4 || h < 1.03 || h > 2.17) return ['hwood', 0.3];
      if (Math.abs(bay - 1.5) < 0.015 || Math.abs(h - 1.6) < 0.012) return ['hwood', 0.22];
      const pane = (bay > 1.5 ? 1 : 0) + (h > 1.6 ? 2 : 0);
      if (pane === 1) { const cr = Math.abs(frac((bay - 1.1)*3 + h*2) - 0.5) < 0.04; return cr ? ['hcream', 0.45] : ['hblack', 0.05]; }   /* the broken pane */
      const line = frac(h*30) < 0.35 && frac((bay - 1.1)*16) > 0.15;
      return ['hcream', clamp(0.42 + (line ? -0.1 : 0) - 0.14*fbm(x*6, h*6) + (hsh(Math.floor((bay - 1.1)*16), Math.floor(h*8)) > 0.85 ? -0.12 : 0), 0, 1)];   /* newspaper, gone brown */
    }
    return stucco(x, h);
  });
}
function stucco(x, h){
  const band = (h > 1.2 && h < 1.32) || (h > 2.6 && h < 2.72), bare = fbm(x*0.9, h*1.3) > 0.66 && h < 2.5;
  if (bare) { const bx = frac(x*4 + (Math.floor(h*12) & 1)*0.5), by = frac(h*12); return ['hrust', (bx < 0.06 || by < 0.12) ? 0.3 : 0.5 + 0.1*vn(x*10, h*10)]; }
  const streak = vn(x*7, 1)*sm(3.4, 1.6, h)*0.12;   /* damp running down from the eaves */
  const v = (band ? 0.62 : 0.8) - 0.22*(1 - sm(0.1, 0.9, h))*vn(x*3, h*2) - 0.12*fbm(x*1.6, h*0.9) - streak + 0.04*(vn(x*40, h*40) - 0.5);
  return [band ? 'hgrey' : 'hcream', clamp(v, 0, 1)];
}
export function paintStucco(){ return paint(256, 224, 4, 3.4, (x, h) => stucco(x + 13.7, h)); }

/* corrugated tin: ribs, rust bleeding down from the nail lines, the odd lighter patched sheet */
export function paintTin(rusty){
  return paint(128, 256, 1, 2, (x, y) => {
    const rib = Math.sin(x*2*Math.PI*10)*0.5 + 0.5, sheet = Math.floor(y/1.0), nail = Math.abs(frac(y) - 0.08) < 0.012 && frac(x*10) < 0.15;
    const rust = fbm(x*3 + sheet*7, y*1.2) + (rusty ? 0.18 : 0) + 0.25*sm(0.4, 0, frac(y))*vn(x*12, sheet) > 0.7;
    if (nail) return ['hblack', 0.4];
    if (rust) return ['hrust', clamp(0.32 + 0.16*rib + 0.08*vn(x*30, y*30), 0, 1)];
    return ['hgrey', clamp(0.36 + 0.2*rib - 0.08*fbm(x*5, y*3) + (hsh(sheet, 3) > 0.7 ? 0.06 : 0), 0, 1)];
  });
}
/* the canopy's ceiling: boards running across, weathered dark, black between */
export function paintBoards(){
  return paint(64, 256, 0.5, 2, (x, y) => {
    const b = frac(y*7), joint = b < 0.08, k = Math.floor(y*7);
    return joint ? ['hblack', 0.3] : ['hwood', clamp(0.3 + 0.12*hsh(k, 9) + 0.1*vn(x*30, y*4 + k) - 0.08*fbm(x*4, y), 0, 1)];
  });
}
/* the scalloped fascia: tall boards, each with a fully rounded tongue and a hole through it, hairline gaps, grey and
   peeling (Seam's f3Fascia, Oct 29 version). 0.43 m tall; one tile is four boards. */
export function paintFascia(){
  const bw = 0.16, H = 0.43;
  return paint(128, 88, bw*4, H, (x, h) => {
    const k = Math.floor(x/bw), u = frac(x/bw), cxp = (u - 0.5)*bw;
    if (u < 0.04 || u > 0.96) return null;   /* hairline gaps */
    const tongue = 0.1; const rr = bw*0.46;
    if (h < tongue) { const dy = tongue - h; if (cxp*cxp + dy*dy > rr*rr && dy > 0) { if (dy > rr*0.98 || Math.abs(cxp) > Math.sqrt(Math.max(0, rr*rr - dy*dy))) return null; } }
    const hy = h - tongue + 0.005; if (cxp*cxp + hy*hy < 0.018*0.018) return null;   /* the hole */
    const peel = fbm(x*9, h*14 + k) > 0.6;
    return peel ? ['hwood', clamp(0.24 + 0.1*vn(x*80, h*20), 0, 1)] : ['hgrey', clamp(0.58 + 0.08*vn(k, 4) - 0.14*sm(0.12, 0, h) + 0.06*vn(x*100, h*30) - 0.06, 0, 1)];
  });
}
/* old rust-red iron paint, flaking to dark metal */
export function paintIron(){ return paint(64, 128, 0.5, 1, (x, y) => fbm(x*8, y*5) > 0.64 ? ['metal', 0.22 + 0.08*vn(x*40, y*40)] : ['hrust', clamp(0.36 + 0.1*vn(x*20, y*6) - 0.08*fbm(x*3, y*2), 0, 1)]); }
/* weathered grey wood, grain running along y */
export function paintWood(dark){ return paint(64, 256, 0.25, 1, (x, y) => ['hwood', clamp((dark ? 0.24 : 0.36) + 0.14*vn(x*90, y*3) + 0.08*vn(x*20, y*20) - (vn(x*30 + 3, y*30) > 0.85 ? 0.12 : 0), 0, 1)]); }
/* the platform: concrete slabs, cracks, damp patches, the worn tactile strip near the edge (painted on its own mesh) */
export function paintConcrete(){
  return paint(920, 200, 23, 5, (x, y) => {
    const sx = frac(x/1.5), sy = frac(y/1.5), seam = sx < 0.012 || sy < 0.012;
    const crack = Math.abs(frac(x*0.7 + fbm(x*2, y*2)*0.9) - 0.5) < 0.012 && fbm(x*0.8, y*0.8) > 0.55;
    const damp = fbm(x*0.45 + 4, y*0.6) > 0.66;
    if (seam || crack) return ['hgrey', 0.18];
    const worn = sm(1.4, 2.6, y)*sm(4.6, 3.4, y)*0.06;   /* the middle, worn paler by feet */
    return ['hgrey', clamp(0.5 + worn + 0.1*vn(x*30, y*30) - 0.1*fbm(x*1.5, y*1.5) + (vn(x*60, y*60) > 0.9 ? 0.08 : 0) - (damp ? 0.035 : 0), 0, 1)];
  });
}
export function paintStrip(){ return paint(64, 32, 1, 0.5, (x, y) => { const dot = frac(x*10) < 0.5 && frac(y*10) < 0.5; return ['hamber', clamp(0.42 + (dot ? 0.06 : -0.04) - 0.18*fbm(x*4, y*8), 0, 1)]; }); }
/* the platform's face, down to the track: old concrete, stained dark green-black where water runs */
export function paintFace(){ return paint(256, 64, 4, 1, (x, y) => { const st = fbm(x*2, y*0.5) > 0.58; return [st ? 'hsage' : 'hgrey', clamp(0.34 + 0.08*vn(x*20, y*20) - (st ? 0.1 : 0) - 0.12*sm(0.8, 0, y), 0, 1)]; }); }

/* grass, weeds: four clumps side by side (each 1 m × 1 m), dead gold, a little sage still. painted thick and dense,
   blades 2–3 pixels wide with a fuller base, so a clump keeps its body far away instead of breaking into specks */
function strokeAtlas(W, H, nv, draw){
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  for (let v = 0; v < nv; v++) { let s = 17 + v*31; const rnd = () => (s = (s*16807) % 2147483647)/2147483647; c.save(); c.beginPath(); c.rect(v*W/nv, 0, W/nv, H); c.clip(); draw(c, v*W/nv, rnd, v); c.restore(); }
  const t = tex(cv, { clampEdge:true }); t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; return t;
}
const rgb = (r, t) => 'rgb(' + inkRGB(r, t).map(Math.round).join(',') + ')';
export function paintGrassAtlas(){
  return strokeAtlas(512, 128, 4, (c, ox, rnd, v) => {
    const n = 70 + v*14;
    for (let i = 0; i < n; i++) {
      const back = i < n*0.45;   /* the ones behind are darker: depth inside the clump */
      const bx = ox + 18 + rnd()*92, hgt = (back ? 40 : 20) + rnd()*rnd()*96 - (v === 3 ? 16 : 0), lean = (rnd() - 0.5)*46, green = rnd() < 0.2;
      const ramp = green ? 'hsage' : (rnd() < 0.6 ? 'hgold' : 'hcream'), t = (back ? 0.28 : 0.45) + rnd()*0.3;
      c.strokeStyle = rgb(ramp, t); c.lineWidth = 2 + (rnd() < 0.4 ? 1 : 0);
      c.beginPath(); c.moveTo(bx, 128); c.quadraticCurveTo(bx + lean*0.25, 128 - hgt*0.6, bx + lean, 128 - hgt); c.stroke();
      if (!green && rnd() < 0.2) { c.fillStyle = rgb('hcream', 0.62); c.fillRect(bx + lean - 2, 128 - hgt - 8, 4, 9); }   /* a seed head */
    }
    c.fillStyle = rgb('hwood', 0.3); for (let i = 0; i < 40; i++) c.fillRect(ox + 26 + rnd()*76, 116 + rnd()*12, 3, 12);   /* the thatch at its foot */
  });
}
/* corn: a wall of stalks and long hanging leaves, tassels on top, mostly gone gold, some still olive. 4 variants,
   each 1 × 3 m, three or four stalks to a card, leaves wide (they're what you see of corn) */
export function paintCornAtlas(){
  return strokeAtlas(512, 384, 4, (c, ox, rnd, v) => {
    const ns = 3 + (v & 1);
    for (let st = 0; st < ns; st++) {
      const x0 = ox + 18 + st*(92/ns) + rnd()*10, top = 30 + rnd()*60, green = rnd() < 0.3, ramp = green ? 'holive' : 'hgold', back = st % 2 === 0;
      c.strokeStyle = rgb(ramp, (back ? 0.3 : 0.42) + rnd()*0.12); c.lineWidth = 4;
      c.beginPath(); c.moveTo(x0, 384); c.lineTo(x0 + (rnd() - 0.5)*8, top); c.stroke();
      for (let l = 0; l < 11; l++) {
        const ly = top + 24 + l*((350 - top)/11) + rnd()*10, dir = (l % 2 ? 1 : -1), len = 26 + rnd()*30, lr = rnd() < 0.3 ? 'hsage' : (rnd() < 0.2 ? 'hcream' : ramp);
        const t = (back ? 0.3 : 0.45) + rnd()*0.22;
        c.fillStyle = rgb(lr, t); c.beginPath(); c.moveTo(x0, ly - 3); c.quadraticCurveTo(x0 + dir*len*0.6, ly - 22, x0 + dir*len, ly + 14 + rnd()*20);
        c.quadraticCurveTo(x0 + dir*len*0.55, ly - 10, x0, ly + 4); c.fill();
      }
      c.strokeStyle = rgb('hgold', 0.66); c.lineWidth = 2;   /* the tassel */
      for (let q = 0; q < 5; q++) { c.beginPath(); c.moveTo(x0, top); c.lineTo(x0 + (q - 2)*6, top - 14 - rnd()*10); c.stroke(); }
      if (rnd() < 0.8) { c.fillStyle = rgb('hcream', 0.52); c.fillRect(x0 + 2, top + 110 + rnd()*60, 6, 22); }   /* an ear, the husk gone pale */
    }
  });
}

/* the name board by the track: white enamel, ほんまち large, the line's green band, its rusted frame */
export function paintNameBoard(){
  const cv = document.createElement('canvas'); cv.width = 220; cv.height = 124; const c = cv.getContext('2d');
  const col = (r, t) => 'rgb(' + inkRGB(r, t).map(Math.round).join(',') + ')';
  c.fillStyle = col('hrust', 0.45); c.fillRect(0, 0, 220, 124);
  c.fillStyle = col('pwhite', 0.85); c.fillRect(6, 6, 208, 112);
  c.fillStyle = col('holive', 0.55); c.fillRect(6, 76, 208, 14);
  c.fillStyle = col('hblack', 0.1); c.textAlign = 'center';
  c.font = '900 34px "Hiragino Sans","Noto Sans CJK JP","Yu Gothic",sans-serif'; c.fillText('ほんまち', 110, 50);
  c.font = '800 11px "Hiragino Sans","Noto Sans CJK JP",sans-serif'; c.fillText('本町 · MAIN STREET', 110, 68);
  c.fillStyle = col('pwhite', 0.9); c.font = '700 9px sans-serif'; c.textAlign = 'left'; c.fillText('← ふるさと', 12, 87); c.textAlign = 'right'; c.fillText('オールドリッジ →', 208, 87);
  c.fillStyle = col('hblack', 0.2); c.font = '600 8px sans-serif'; c.textAlign = 'center'; c.fillText('missing mile', 110, 108);
  const im = c.getImageData(0, 0, 220, 124), d = im.data;   /* grime and rust bleeding from the frame, dirt in the lower half */
  for (let j = 0; j < 124; j++) for (let i = 0; i < 220; i++) { const o = (j*220 + i)*4, g = fbm(i*0.06, j*0.06)*0.5 + (j/124)*0.3 + (i > 190 && j < 30 ? 0.3 : 0), k = 1 - 0.35*sm(0.45, 0.95, g); d[o] *= k; d[o + 1] *= k*0.97; d[o + 2] *= k*0.95; }
  c.putImageData(im, 0, 0);
  return tex(cv, { clampEdge:true });
}
/* the hanging sign under the canopy: a lit box, ほんまち large, MAIN STREET under it */
export function paintHangSign(){
  const cv = document.createElement('canvas'); cv.width = 220; cv.height = 48; const c = cv.getContext('2d');
  const col = (r, t) => 'rgb(' + inkRGB(r, t).map(Math.round).join(',') + ')';
  c.fillStyle = col('hgrey', 0.4); c.fillRect(0, 0, 220, 48); c.fillStyle = col('glowc', 0.85); c.fillRect(2, 2, 216, 44);
  c.fillStyle = col('hblack', 0.15); c.textAlign = 'center'; c.font = '900 20px "Hiragino Sans","Noto Sans CJK JP",sans-serif'; c.fillText('ほんまち', 110, 24);
  c.font = '800 8px sans-serif'; c.fillText('本町 · MAIN STREET · F03', 110, 39);
  return tex(cv, { clampEdge:true });
}
/* the drinks machine's front: off-white, its lit display of four bottles (flavours come in milestone 2, with the close-up) */
export function paintVendFront(){
  return paint(96, 176, 1.02, 1.86, (x, y) => {
    if (y > 1.05 && y < 1.6 && x > 0.08 && x < 0.94) { const slot = Math.floor((x - 0.08)/0.215), u = frac((x - 0.08)/0.215);
      if (u > 0.3 && u < 0.7 && y > 1.12 && y < 1.5) return [['hrust', 'hamber', 'holive', 'hplum'][slot], 0.55 + 0.2*sm(1.12, 1.5, y)];
      return ['glowc', 0.75 - 0.15*fbm(x*8, y*8)]; }
    if (y > 0.92 && y < 1.0 && x > 0.08 && x < 0.94) return ['hamber', 0.4 + 0.2*(frac(x*30) < 0.5 ? 1 : 0)];   /* the buttons */
    if (y > 0.2 && y < 0.42 && x > 0.2 && x < 0.82) return ['hblack', 0.15];   /* the slot you take it from */
    if (x > 0.84 && y > 0.6 && y < 0.85) return ['hgrey', 0.35];
    return ['pwhite', clamp(0.72 - 0.25*sm(0.6, 0, y)*fbm(x*6, y*6) - 0.15*fbm(x*3 + 5, y*2), 0, 1)];
  });
}
