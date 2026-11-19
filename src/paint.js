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

/* fn(x, y) in metres across the texture → [ramp, t] or [ramp, t, alpha, height, rough] or null (transparent).
   besides the colour, each painter gives the surface a relief (height: from the brightness unless it says otherwise)
   and, where it says so, how rough or wet it is. the relief becomes a normal map, so bricks, boards, ribs and cracks
   catch the lamps from the side; low roughness (damp, puddles) shines where the light falls. */
export function paint(w, h, mw, mh, fn, opts = {}){
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const cx = cv.getContext('2d'), im = cx.createImageData(w, h), d = im.data;
  const H = new Float32Array(w*h), Rg = new Float32Array(w*h); let anyRough = false;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const r = fn((i + 0.5)/w*mw, (1 - (j + 0.5)/h)*mh, i, j), o = (j*w + i)*4, k = j*w + i;
    if (!r) { d[o + 3] = 0; H[k] = 0; Rg[k] = 1; continue; }
    const c = inkRGB(r[0], r[1]); d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = r.length > 2 && r[2] != null ? Math.round(r[2]*255) : 255;
    H[k] = r.length > 3 && r[3] != null ? r[3] : r[1];
    if (r.length > 4 && r[4] != null) { Rg[k] = r[4]; anyRough = true; } else Rg[k] = 1;
  }
  cx.putImageData(im, 0, 0);
  const t = tex(cv, opts);
  if (opts.nrm !== 0) t.userData.normal = normalFrom(H, w, h, (opts.nrm || 1)*w/mw/64, opts);
  if (anyRough) { const rc = document.createElement('canvas'); rc.width = w; rc.height = h; const rx = rc.getContext('2d'), ri = rx.createImageData(w, h);
    for (let k = 0; k < w*h; k++) { const v = Math.round(clamp(Rg[k], 0, 1)*255); ri.data[k*4] = ri.data[k*4 + 1] = ri.data[k*4 + 2] = v; ri.data[k*4 + 3] = 255; }
    rx.putImageData(ri, 0, 0); const rt = tex(rc, opts); rt.colorSpace = THREE.NoColorSpace; rt.magFilter = THREE.LinearFilter; t.userData.rough = rt; }
  return t;
}
function normalFrom(H, w, h, k, opts){
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'), im = c.createImageData(w, h), d = im.data;
  const at = (i, j) => H[((j + h) % h)*w + ((i + w) % w)];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const dx = (at(i + 1, j) - at(i - 1, j))*k, dy = (at(i, j - 1) - at(i, j + 1))*k, l = Math.hypot(dx, dy, 1), o = (j*w + i)*4;
    d[o] = (-dx/l*0.5 + 0.5)*255; d[o + 1] = (-dy/l*0.5 + 0.5)*255; d[o + 2] = (1/l*0.5 + 0.5)*255; d[o + 3] = 255;
  }
  c.putImageData(im, 0, 0); const t = tex(cv, opts); t.colorSpace = THREE.NoColorSpace; t.magFilter = THREE.LinearFilter; return t;
}
export function tex(cv, opts = {}){
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.LinearFilter;   /* (Nov 17, later) smooth up close now; the crunch comes from the 2-pixel drawing */
  t.minFilter = THREE.LinearMipmapLinearFilter;   /* and no shimmer far away */
  t.wrapS = t.wrapT = opts.clampEdge ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
  t.anisotropy = 8;   /* (Nov 18: sharper at angles) */
  return t;
}

/* ---------------- the station building: stucco over brick in bands, the paint gone; tall shut doors in faded sage over
   grey boards, iron straps; windows blacked out with old newspaper, one pane broken. one 6 m tile = a door bay and a
   window bay (Seam's f3Building, carried over). 3.4 m tall. (Nov 17, later: twice the pixels, hairline cracks in the
   stucco, salt bloom low down, grime run down from the sills and the straps, and a relief for every part.) ---------------- */
export function paintFacade(){
  return paint(1536, 870, 6, 3.4, (x, h) => {
    const bay = x % 3, isDoor = x < 3, win = !isDoor && bay > 1.05 && bay < 1.95 && h > 0.95 && h < 2.25;
    const door = isDoor && bay > 0.95 && bay < 2.05 && h < 2.45;
    if (h < 0.14) { const above = Math.max(holeField(x, 0.3), holeField(x, 0.6)) > 0.6, cr = above && vn(x*70, h*70) > 0.62;   /* (crumbs fallen from the holes above) */
      if (cr) return [vn(x*31, h*29) > 0.5 ? 'hrust' : 'hplas', 0.42 + 0.2*vn(x*90, h*90), 1, 0.85]; return ['hgrey', 0.24 + 0.08*vn(x*20, h*30) - 0.06*vn(x*90, h*90), 1, 0.5 + 0.3*vn(x*40, h*40)]; }
    if (door) {
      const dx = bay - 1.5, f = Math.abs(dx) > 0.5 || h > 2.37;
      if (f) return ['hwood', 0.22 + 0.06*vn(x*20, h*6), 1, 0.9];
      if (Math.abs(dx) < 0.012) return ['hblack', 0.2, 1, 0.0];
      if ((Math.abs(h - 0.45) < 0.03 || Math.abs(h - 1.95) < 0.03) && Math.abs(dx) > 0.2) { const bolt = frac(dx*8) < 0.12; return ['hblack', 0.5 + (vn(x*40, h*40) > 0.6 ? 0.2 : 0) + (bolt ? 0.15 : 0), 1, bolt ? 1 : 0.85, 0.55]; }
      const bd = frac(dx*10 + 0.5), joint = bd < 0.06, gr = vn(x*60, h*3) + 0.3*vn(x*200, h*8), wet = 1 - sm(0, 0.6, h);
      /* (Nov 19, the texture pass) the paint is sage, flaking off in ragged patches, more toward the boards' edges and low
         down where the wet gets at it; under it the wood is weathered silver-grey with its grain (it used to be blotches) */
      const be = Math.min(frac(dx*10 + 0.5), 1 - frac(dx*10 + 0.5)), lose = 0.62 - 0.22*sm(0.2, 0, be) - 0.18*sm(1.0, 0.1, h) + 0.08*vn(x*2, h*0.7);
      const paintLeft = fbm(x*9 + 3, h*4) + 0.18*vn(x*60, h*30) < lose + 0.12, below = Math.min(Math.abs(h - 0.45), Math.abs(h - 1.95));
      const flakeEdge = Math.abs(fbm(x*9 + 3, h*4) + 0.18*vn(x*60, h*30) - lose - 0.12) < 0.012;
      const rustRun = h < 1.95 && h > 0.45 && below < 0.5*vn(x*30, 3) && vn(x*30, 3) > 0.6 && Math.abs(dx) > 0.2;   /* rust run down from the straps */
      const t = clamp((joint ? 0.15 : 0.42 + 0.14*gr) - 0.14*wet - (rustRun ? 0.06 : 0), 0, 1);
      if (flakeEdge && !joint) return ['hcream', 0.44, 1, 0.75, 0.9];   /* (the lifted rim of the paint, catching light) */
      if (!paintLeft && !joint && !rustRun) return ['hgrey', clamp(0.3 + 0.18*gr - 0.12*wet, 0, 1), 1, 0.4 + 0.35*gr, 0.95];   /* bare weathered wood */
      return [rustRun ? 'hrust' : 'hsage', t + (paintLeft ? 0.04 : 0), 1, joint ? 0.1 : 0.62 + 0.2*gr, 0.8];
    }
    if (win) {
      if (Math.abs(bay - 1.5) > 0.4 || h < 1.03 || h > 2.17) return ['hwood', 0.3, 1, 0.95];
      if (Math.abs(bay - 1.5) < 0.015 || Math.abs(h - 1.6) < 0.012) return ['hwood', 0.22, 1, 0.85];
      const pane = (bay > 1.5 ? 1 : 0) + (h > 1.6 ? 2 : 0);
      if (pane === 1) { const cr = Math.abs(frac((bay - 1.1)*3 + h*2) - 0.5) < 0.04; return cr ? ['hcream', 0.45, 1, 0.5, 0.2] : ['hblack', 0.05, 1, 0.2, 0.15]; }   /* the broken pane */
      const line = frac(h*30) < 0.35 && frac((bay - 1.1)*16) > 0.15;
      return ['hcream', clamp(0.42 + (line ? -0.1 : 0) - 0.14*fbm(x*6, h*6) + (hsh(Math.floor((bay - 1.1)*16), Math.floor(h*8)) > 0.85 ? -0.12 : 0), 0, 1), 1, 0.4 + 0.1*vn(x*30, h*30), 0.3];   /* newspaper behind glass */
    }
    /* grime run down from the window sill */
    const drip = !isDoor && bay > 1.0 && bay < 2.0 && h < 0.95 && vn(x*24, 7) > 0.45 ? (0.95 - h)*0.0 + sm(0.95, 0.3, h)*0.1*vn(x*24, 7) : 0;
    const st = stucco(x, h); st[1] = clamp(st[1] - drip, 0, 1); return st;
  });
}
/* (Nov 17, graphics pass; Aisling: the holes "look too..umm smooth … not very natural") where the stucco has fallen
   away: the outline is chipped and ragged at three sizes; the stucco stands proud with a broken pale lip (its own
   thickness showing) and casts a little shadow onto the brick under it; the brick behind is laid in courses, each brick
   its own colour, edges worn round, a few cracked, a few gone (a dark hole); the mortar is sunk back and grey. */
function holeField(x, h){ return fbm(x*0.9, h*1.3) + 0.11*(fbm(x*5.2 + 4, h*6.1) - 0.5) + 0.05*(vn(x*23, h*27) - 0.5) + 0.025*(vn(x*70, h*80) - 0.5); }
function brick(x, h, f){
  const row = Math.floor(h*12), off = (row & 1)*0.5, bxw = x*4 + off, col = Math.floor(bxw), bx = frac(bxw), by = frac(h*12);
  const b = hsh(col, row), b2 = hsh(col + 31, row - 7), b3 = hsh(col - 5, row + 13);
  const shade = sm(0.66, 0.705, f);   /* the lip's shadow, falling just inside the edge */
  const mortar = bx < 0.05 || by < 0.11;
  if (mortar) { const eroded = vn(x*40, h*40) > 0.6; return ['hgrey', clamp(0.3 - (eroded ? 0.08 : 0) - 0.12*(1 - shade) + 0.06*vn(x*90, h*90), 0, 1), 1, eroded ? 0.0 : 0.08, 0.95]; }
  if (b2 > 0.955 && h > 0.25) return ['hblack', 0.12 + 0.1*vn(x*60, h*60), 1, -0.25, 1];   /* a brick gone: only the dark behind */
  const ex = Math.min(bx - 0.05, 1 - bx)/0.95*4, ey = Math.min(by - 0.11, 1 - by)/0.89*12, edge = sm(0, 0.35, Math.min(ex*0.25, ey*0.083)*4);   /* worn round at its edges */
  const crack = b3 > 0.82 && Math.abs((bx - 0.5) - (by - 0.5)*(b3 > 0.91 ? 1.2 : -0.9) + 0.06*(vn(x*80, h*80) - 0.5)) < 0.025;
  const ramp = b > 0.9 ? 'hwood' : (b < 0.07 ? 'hplum' : 'hrust');   /* a few burnt dark, a few gone purplish, most red-brown */
  let v = 0.4 + 0.18*b + 0.1*b2 - 0.06 + 0.07*vn(x*30, h*30) + 0.05*(vn(x*120, h*120) - 0.5) - 0.14*(1 - shade) - 0.07*(1 - edge);
  if (crack) v -= 0.2;
  return [ramp, clamp(v, 0, 1), 1, 0.3 + 0.12*edge + 0.06*vn(x*50, h*50) - (crack ? 0.2 : 0), 0.9];
}
function stucco(x, h){
  const band = (h > 1.2 && h < 1.32) || (h > 2.6 && h < 2.72), f = holeField(x, h), bare = f > 0.66 && h < 2.5;
  if (bare) return brick(x, h, f);
  const lip = f > 0.645 && h < 2.5;   /* the broken edge: the stucco's own thickness, paler and crumbly */
  if (lip) { const t = (f - 0.645)/0.015; return ['hplas', clamp(0.62 + 0.12*vn(x*80, h*80) - 0.1*t + 0.06*(vn(x*200, h*200) - 0.5), 0, 1), 1, 1.15 - 0.2*t + 0.1*vn(x*90, h*90), 1]; }
  const crack = Math.abs(frac(x*1.3 + fbm(x*1.5, h*2.2)*1.6) - 0.5) < 0.006 && fbm(x*0.6 + 9, h*0.7) > 0.58;
  const near = sm(0.55, 0.645, f);   /* hairline cracks and lifting gather round the holes */
  const salt = (1 - sm(0.05, 0.7, h))*sm(0.5, 0.75, fbm(x*2.5 + 3, h*4));   /* salt bloom where the damp rises */
  const streak = vn(x*7, 1)*sm(3.4, 1.6, h)*0.12;
  const crazed = near > 0.3 && Math.abs(frac(x*9 + fbm(x*7, h*7)*3) - 0.5) < 0.012*near;
  let v = (band ? 0.62 : 0.8) - 0.22*(1 - sm(0.1, 0.9, h))*vn(x*3, h*2) - 0.12*fbm(x*1.6, h*0.9) - streak + 0.05*(vn(x*60, h*60) - 0.5) + 0.04*(vn(x*140, h*140) - 0.5) - 0.05*near;
  if (crack || crazed) v -= 0.2; v += salt*0.08;
  return [band ? 'hgrey' : 'hcream', clamp(v, 0, 1), 1, 0.8 + 0.12*vn(x*50, h*50) + 0.08*vn(x*150, h*150) - (crack || crazed ? 0.4 : 0) + (band ? 0.15 : 0)];
}
export function paintStucco(){ return paint(896, 762, 4, 3.4, (x, h) => stucco(x + 13.7, h)); }

/* corrugated tin: real ribs in the relief, rust bleeding down from the nail lines, the odd lighter patched sheet; the
   clean metal is a little shiny, the rust is not */
export function paintTin(rusty){
  return paint(192, 384, 1, 2, (x, y) => {
    const rib = Math.sin(x*2*Math.PI*10)*0.5 + 0.5, sheet = Math.floor(y/1.0), nail = Math.abs(frac(y) - 0.08) < 0.012 && frac(x*10) < 0.15;
    const run = sm(0.4, 0, frac(y) - 0.08)*vn(x*12, sheet)*(frac(y) > 0.08 ? 1 : 0);
    const rust = fbm(x*3 + sheet*7, y*1.2) + (rusty ? 0.18 : 0) + 0.3*run > 0.7;
    if (nail) return ['hblack', 0.4, 1, rib + 0.3, 0.6];
    if (rust) return ['hrust', clamp(0.32 + 0.16*rib + 0.08*vn(x*30, y*30) + 0.05*vn(x*120, y*120), 0, 1), 1, rib*0.9 + 0.08*vn(x*60, y*60), 0.95];
    return ['hgrey', clamp(0.36 + 0.2*rib - 0.08*fbm(x*5, y*3) + (hsh(sheet, 3) > 0.7 ? 0.06 : 0), 0, 1), 1, rib, 0.5 + 0.2*fbm(x*4, y*4)];
  }, { nrm:1.6 });
}
/* the canopy's ceiling: boards running across, weathered dark, black between */
export function paintBoards(){
  /* (Nov 19, the texture pass) the canopy's board ceiling, painted long ago a pale cream and peeling back to grey wood
     in flakes, the joints dark, water stains spreading from the joints, soot over each bulb's place */
  return paint(256, 1024, 0.5, 2, (x, y) => {
    const b = frac(y*7), joint = b < 0.07, k = Math.floor(y*7), gr = vn(x*30, y*4 + k) + 0.4*vn(x*120, y*20 + k);
    if (joint) return ['hblack', 0.22, 1, 0];
    const peel = fbm(x*5 + k*3, y*9) + 0.25*vn(x*40, y*60) > 0.78, stain = sm(0.25, 0.0, Math.min(b, 1 - b))*sm(0.45, 0.7, fbm(x*3, y*2 + 7));
    if (peel) return ['hwood', clamp(0.26 + 0.1*gr, 0, 1), 1, 0.45 + 0.2*gr, 0.95];
    return ['hcream', clamp(0.5 + 0.05*gr - 0.18*stain - 0.06*fbm(x*4, y*1.5), 0, 1), 1, 0.7 + 0.1*gr + 0.2*sm(0.07, 0.15, b)*sm(1, 0.9, b), 0.9];
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
export function paintIron(){ return paint(128, 256, 0.5, 1, (x, y) => { const fl = fbm(x*8, y*5); return fl > 0.64 ? ['metal', 0.22 + 0.08*vn(x*40, y*40), 1, 0.3, 0.45] : ['hrust', clamp(0.36 + 0.1*vn(x*20, y*6) - 0.08*fbm(x*3, y*2) + 0.04*vn(x*90, y*90), 0, 1), 1, 0.7 + (fl > 0.6 ? 0.3 : 0) + 0.1*vn(x*90, y*90), 0.75]; }, { nrm:1.2 }); }
/* weathered grey wood, grain running along y */
export function paintWood(dark){ return paint(96, 384, 0.25, 1, (x, y) => { const g = vn(x*90, y*3) + 0.5*vn(x*300, y*6), split = Math.abs(frac(x*7 + vn(x, y*2)*0.3) - 0.5) < 0.02 && vn(x*5, y*0.7) > 0.6, knot = vn(x*30 + 3, y*30) > 0.85;
  return ['hwood', clamp((dark ? 0.24 : 0.36) + 0.12*g + 0.08*vn(x*20, y*20) - (knot ? 0.12 : 0) - (split ? 0.15 : 0), 0, 1), 1, 0.5 + 0.35*g - (split ? 0.5 : 0) - (knot ? 0.2 : 0)]; }, { nrm:1.4 }); }
/* the platform: concrete slabs, cracks, damp patches, the worn tactile strip near the edge (painted on its own mesh) */
export function paintConcrete(){
  /* (Nov 19, the texture pass) old platform concrete, twice the detail: poured slabs 1.5 m square, each its own grey;
     a broom finish across each; the joints sunk and dark with grit, their edges chipped; fine aggregate; a few hairline
     cracks wandering across; old oil and water stains, darker where it's damp (those shine under the bulbs); the middle
     worn paler and smoother by feet; grime gathering toward the building. (the station's neutral grey ink) */
  return paint(2760, 600, 23, 5, (x, y) => {
    const ix = Math.floor(x/1.5), iy = Math.floor(y/1.5), sx = frac(x/1.5), sy = frac(y/1.5), ed = Math.min(sx, 1 - sx, sy, 1 - sy)*1.5;
    const chip = vn(x*14, y*14), joint = ed < 0.008 + 0.012*sm(0.55, 0.85, chip);
    const tone = (hsh(ix, iy*7 + 3) - 0.5)*0.06, brush = 0.025*Math.sin((x*2.2 + hsh(ix, iy)*3)*40 + vn(x*3, y*3)*4)*sm(0.4, 0.9, vn(x*0.8 + ix, y*0.8));
    const crack = Math.abs(frac(x*0.55 + fbm(x*1.6, y*1.6)*1.1) - 0.5) < 0.004 + 0.003*vn(x*30, y*30) && fbm(x*0.7 + 9, y*0.7) > 0.58;
    const dmp = fbm(x*0.45 + 4, y*0.6), wet = sm(0.6, 0.72, dmp), oil = sm(0.7, 0.78, fbm(x*0.9 + 21, y*0.9 + 5));
    const agg = vn(x*170, y*170), pit = vn(x*95, y*95) > 0.86, fleck = vn(x*240, y*240) > 0.88;
    const worn = sm(1.2, 2.4, y)*sm(4.7, 3.6, y), grime = sm(3.8, 5.0, y)*0.08 + sm(0.6, 0.0, y)*0.05;
    if (joint) return ['pwhite', 0.08 + 0.05*chip, 1, 0.05, 0.75];
    if (crack) return ['pwhite', 0.14, 1, 0.2, 0.7];
    let t = 0.37 + tone + brush*(1 - worn*0.7) + 0.05*worn + 0.07*vn(x*30, y*30) - 0.08*fbm(x*1.5, y*1.5) + 0.05*(agg - 0.5) - grime - 0.06*wet - 0.07*oil;
    if (pit) t -= 0.1; if (fleck) t += 0.07;
    return ['pwhite', clamp(t, 0, 1), 1, 0.6 + 0.15*agg + 0.05*brush*10 - (pit ? 0.25 : 0), clamp(0.92 - 0.55*wet - 0.25*oil - 0.12*worn, 0.2, 1)];
  }, { nrm:1.3 });
}
export function paintStrip(){ return paint(64, 32, 1, 0.5, (x, y) => { const dot = frac(x*10) < 0.5 && frac(y*10) < 0.5; return ['hamber', clamp(0.42 + (dot ? 0.06 : -0.04) - 0.18*fbm(x*4, y*8), 0, 1)]; }); }
/* the platform's face, down to the track: old concrete, stained dark green-black where water runs */
export function paintFace(){ return paint(512, 128, 4, 1, (x, y) => { const st = fbm(x*2, y*0.5) > 0.58, sp = vn(x*90, y*90) > 0.8; return [st ? 'hsage' : 'hgrey', clamp(0.34 + 0.08*vn(x*20, y*20) - (st ? 0.1 : 0) - 0.12*sm(0.8, 0, y) - (sp ? 0.08 : 0), 0, 1), 1, 0.6 + 0.2*vn(x*40, y*40) - (sp ? 0.3 : 0), st ? 0.55 : 0.9]; }); }

/* grass, weeds: four clumps side by side (each 1 m × 1 m), dead gold, a little sage still. painted thick and dense,
   blades 2–3 pixels wide with a fuller base, so a clump keeps its body far away instead of breaking into specks */
function strokeAtlas(W, H, nv, draw, k = 1, thin = 1){
  /* (Nov 17, later) drawn k times finer for the smooth look; strokes `thin` times as wide, so blades stay blades */
  const cv = document.createElement('canvas'); cv.width = W*k; cv.height = H*k; const c = cv.getContext('2d'); c.scale(k, k);
  const lw = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'lineWidth');
  Object.defineProperty(c, 'lineWidth', { get(){ return lw.get.call(c); }, set(v){ lw.set.call(c, v*thin); } });
  for (let v = 0; v < nv; v++) { let s = 17 + v*31; const rnd = () => (s = (s*16807) % 2147483647)/2147483647; c.save(); c.beginPath(); c.rect(v*W/nv, 0, W/nv, H); c.clip(); draw(c, v*W/nv, rnd, v); c.restore(); }
  const t = tex(cv, { clampEdge:true }); t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; return t;
}
const rgb = (r, t) => 'rgb(' + inkRGB(r, t).map(Math.round).join(',') + ')';
export function paintGrassAtlas(){
  return strokeAtlas(512, 128, 4, (c, ox, rnd, v) => {
    const n = 130 + v*24;
    for (let i = 0; i < n; i++) {
      const back = i < n*0.45;   /* the ones behind are darker: depth inside the clump */
      const bx = ox + 18 + rnd()*92, hgt = (back ? 40 : 20) + rnd()*rnd()*96 - (v === 3 ? 16 : 0), lean = (rnd() - 0.5)*46, green = rnd() < 0.2;
      const ramp = green ? 'hsage' : (rnd() < 0.6 ? 'hgold' : 'hcream'), t = (back ? 0.28 : 0.45) + rnd()*0.3;
      c.strokeStyle = rgb(ramp, t); c.lineWidth = 2 + (rnd() < 0.4 ? 1 : 0);
      { const g = c.createLinearGradient(bx, 128, bx + lean, 128 - hgt); g.addColorStop(0, rgb(ramp, t*0.7)); g.addColorStop(0.6, rgb(ramp, t)); g.addColorStop(1, rgb(ramp === 'hsage' ? 'hgold' : ramp, Math.min(1, t + 0.08))); c.strokeStyle = g; }   /* (Nov 18) darker at its foot, paler and drier to the tip */
      c.beginPath(); c.moveTo(bx, 128); c.quadraticCurveTo(bx + lean*0.25, 128 - hgt*0.6, bx + lean, 128 - hgt); c.stroke();
      if (!green && rnd() < 0.2) { c.fillStyle = rgb('hcream', 0.62); c.fillRect(bx + lean - 2, 128 - hgt - 8, 4, 9); }   /* a seed head */
    }
    c.fillStyle = rgb('hwood', 0.3); for (let i = 0; i < 40; i++) c.fillRect(ox + 26 + rnd()*76, 116 + rnd()*12, 1.5, 12);   /* the thatch at its foot */
  }, 3, 0.45);
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
      { c.strokeStyle = rgb(ramp, (back ? 0.2 : 0.3)); c.lineWidth = 1.2; for (let y = top + 40; y < 370; y += 34 + rnd()*10) { c.beginPath(); c.moveTo(x0 - 3, y); c.lineTo(x0 + 3, y); c.stroke(); } }   /* the stalk's joints */
      for (let l = 0; l < 11; l++) {
        const ly = top + 24 + l*((350 - top)/11) + rnd()*10, dir = (l % 2 ? 1 : -1), len = 26 + rnd()*30, lr = rnd() < 0.3 ? 'hsage' : (rnd() < 0.2 ? 'hcream' : ramp);
        const t = (back ? 0.3 : 0.45) + rnd()*0.22;
        const ey = ly + 14 + rnd()*20, leaf = () => { c.beginPath(); c.moveTo(x0, ly - 3); c.quadraticCurveTo(x0 + dir*len*0.6, ly - 22, x0 + dir*len, ey); c.quadraticCurveTo(x0 + dir*len*0.55, ly - 10, x0, ly + 4); };
        /* (Nov 18, Aisling: "the corn and everything will get a better like texture … not just like a color … just slightly") each
           leaf shaded from its stalk out, a paler midrib along it, its tip dried brown, a few spots */
        leaf(); const lg = c.createLinearGradient(x0, ly, x0 + dir*len, ey); lg.addColorStop(0, rgb(lr, t*0.82)); lg.addColorStop(0.5, rgb(lr, t)); lg.addColorStop(0.85, rgb(lr, t*0.95)); lg.addColorStop(1, rgb('hwood', 0.3 + rnd()*0.1)); c.fillStyle = lg; c.fill();
        c.save(); leaf(); c.clip();
        c.strokeStyle = rgb(lr, Math.min(1, t + 0.14)); c.globalAlpha = 0.55; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x0, ly); c.quadraticCurveTo(x0 + dir*len*0.58, ly - 15, x0 + dir*len, ey); c.stroke();
        for (let k = 0; k < 5; k++) { c.fillStyle = rgb('hwood', 0.22 + rnd()*0.1); c.globalAlpha = 0.4; c.fillRect(x0 + dir*len*(0.2 + rnd()*0.7), ly - 12 + rnd()*20, 1.2, 1.2); }
        c.restore(); c.globalAlpha = 1;
      }
      c.strokeStyle = rgb('hgold', 0.66); c.lineWidth = 2;   /* the tassel */
      for (let q = 0; q < 5; q++) { c.beginPath(); c.moveTo(x0, top); c.lineTo(x0 + (q - 2)*6, top - 14 - rnd()*10); c.stroke(); }
      if (rnd() < 0.8) { c.fillStyle = rgb('hcream', 0.52); c.fillRect(x0 + 2, top + 110 + rnd()*60, 6, 22); }   /* an ear, the husk gone pale */
    }
  }, 2, 0.6);
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
  /* (Nov 19, the texture pass) four times sharper, and the whole board (it used to cover only its left part): a lit
     white enamel sign in a grey frame, ほんまち large, 本町 · MAIN STREET · F03 under it, the line's band along the
     foot; a little grime gathered at the frame and a few dead insects inside, lit from behind. (same words as Seam's) */
  const W = 1100, H = 240, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
  const col = (r, t) => 'rgb(' + inkRGB(r, t).map(Math.round).join(',') + ')';
  c.fillStyle = col('hgrey', 0.36); c.fillRect(0, 0, W, H); c.fillStyle = col('glowc', 0.86); c.fillRect(12, 12, W - 24, H - 24);
  const g = c.createRadialGradient(W/2, H/2, 40, W/2, H/2, W*0.6); g.addColorStop(0, 'rgba(255,250,235,0.0)'); g.addColorStop(1, 'rgba(90,70,50,0.22)'); c.fillStyle = g; c.fillRect(12, 12, W - 24, H - 24);
  c.fillStyle = col('hamber', 0.5); c.fillRect(12, H - 46, W - 24, 10);   /* the line's band */
  c.fillStyle = col('hblack', 0.14); c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = '900 104px "Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans CJK JP",sans-serif'; c.fillText('ほんまち', W/2, 92);
  c.font = '700 38px "Hiragino Sans","Noto Sans CJK JP","Helvetica Neue",Arial,sans-serif'; c.fillText('本町 · MAIN STREET · F03', W/2, 166);
  for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(40,30,20,' + (0.25 + Math.random()*0.3) + ')'; c.beginPath(); c.ellipse(30 + Math.random()*(W - 60), 20 + Math.random()*30, 2 + Math.random()*3, 1.5, Math.random()*3, 0, 7); c.fill(); }   /* dead insects caught inside */
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

/* fallen leaves: four shapes (a lobed one, an oval, a long one, a curled scrap) in autumn's colours, each 0.12 m */
export function paintLeafAtlas(){
  return strokeAtlas(256, 64, 4, (c, ox, rnd, v) => {
    const cx = ox + 32, cy = 32, ramps = ['hrust', 'hgold', 'hamber', 'hwood'];
    c.fillStyle = rgb(ramps[v], 0.4 + rnd()*0.2); c.beginPath();
    if (v === 0) { for (let i = 0; i <= 10; i++) { const a = i/10*Math.PI*2, r = (i % 2 ? 12 : 26) + rnd()*3; c.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r); } }
    else if (v === 1) c.ellipse(cx, cy, 24, 15, 0.4, 0, Math.PI*2);
    else if (v === 2) c.ellipse(cx, cy, 28, 9, -0.6, 0, Math.PI*2);
    else { c.moveTo(cx - 20, cy); c.quadraticCurveTo(cx, cy - 26, cx + 20, cy - 4); c.quadraticCurveTo(cx + 4, cy + 18, cx - 20, cy); }
    c.fill();
    c.strokeStyle = rgb(ramps[v], 0.22); c.lineWidth = 2; c.beginPath(); c.moveTo(cx - 22, cy + 6); c.lineTo(cx + 20, cy - 6); c.stroke();   /* the stem and middle vein */
    for (let i = 0; i < 30; i++) { c.fillStyle = rgb('hwood', 0.2 + rnd()*0.15); c.fillRect(cx - 20 + rnd()*40, cy - 12 + rnd()*24, 2, 2); }   /* spots of rot */
  }, 2, 0.6);
}
/* far trees as dark shapes in the fog: a bare one, two firs, a round one (4 variants, each 6 × 9 m) */
export function paintFarTrees(){
  return strokeAtlas(512, 192, 4, (c, ox, rnd, v) => {
    c.fillStyle = c.strokeStyle = '#fff';
    const x0 = ox + 64;
    if (v === 0 || v === 3) {   /* bare: a trunk, limbs forking up and out */
      const br = (x, y, a, l, w, d) => { if (d > 6 || l < 4) return; const x2 = x + Math.cos(a)*l, y2 = y - Math.sin(a)*l; c.lineWidth = w; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke();
        br(x2, y2, a + 0.3 + rnd()*0.4, l*0.72, w*0.68, d + 1); br(x2, y2, a - 0.3 - rnd()*0.4, l*0.7, w*0.66, d + 1); if (rnd() < 0.4) br(x2, y2, a + (rnd() - 0.5)*0.3, l*0.6, w*0.6, d + 1); };
      br(x0, 192, Math.PI/2 + (rnd() - 0.5)*0.1, 60, 9, 0);
      if (v === 3) for (let i = 0; i < 70; i++) { c.beginPath(); c.arc(x0 + (rnd() - 0.5)*90, 50 + rnd()*70, 6 + rnd()*10, 0, Math.PI*2); c.fill(); }   /* a few leaves left */
    } else {   /* a fir: layered drooping tiers */
      c.fillRect(x0 - 3, 120, 6, 72);
      for (let k = 0; k < 9; k++) { const y = 20 + k*17, hw = 6 + k*6.5 + rnd()*5; c.beginPath(); c.moveTo(x0, y - 14); c.lineTo(x0 + hw, y + 10 + rnd()*6); c.lineTo(x0 - hw, y + 10 + rnd()*6); c.fill(); }
    }
  });
}

/* the close-up grain every surface shares (Nov 17, later): fine grit, scuffs, small stains and hairline scratches,
   in grey, tiling. it's laid over each surface from three sides at its true place in the world, at two sizes, so
   walls, ground and wood all get grain up close without bigger pictures */
export function paintDetail(){
  const W = 512, cv = document.createElement('canvas'); cv.width = cv.height = W; const c = cv.getContext('2d'), im = c.createImageData(W, W), d = im.data;
  const tile = (f, x, y, p) => { const a = f(x, y), b = f(x - p, y), e = f(x, y - p), g = f(x - p, y - p), u = x/p, v = y/p; return a*(1 - u)*(1 - v) + b*u*(1 - v) + e*(1 - u)*v + g*u*v; };
  for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
    const x = i/W*8, y = j/W*8;
    let v = 0.5 + 0.28*(tile(fbm, x*2, y*2, 16) - 0.5) + 0.18*(tile(vn, x*16, y*16, 128) - 0.5) + 0.1*(hsh(i, j) - 0.5);
    if (tile(vn, x*6 + 3, y*6, 48) > 0.78) v -= 0.12;   /* small stains */
    const sc = Math.abs(frac(x*1.7 + y*0.4 + vn(x*0.5, y*0.5)*2) - 0.5); if (sc < 0.006 && vn(x*2, y*2) > 0.6) v += 0.08;   /* scratches */
    const o = (j*W + i)*4; d[o] = d[o + 1] = d[o + 2] = Math.round(clamp(v, 0, 1)*255); d[o + 3] = 255;
  }
  c.putImageData(im, 0, 0); const t = tex(cv); t.colorSpace = THREE.NoColorSpace; return t;
}
