/* ================================================================
   EMBROIDERY · the real pass for pictures in the world (Nov 20, Aisling: "the 3d things are too cartoon and stark …
   more konami or horror game or like sh3 … less cartoon and outlined, more real hazy missing mile"; then "close ups of
   so machine and mailbox and signs and newspaper and phone need same treatment and the train").
   The same pass the pocket's things get (seam/shim-post.js, egReal): the drawing's hard edges softened, colour muted,
   blacks lifted, a little of the fog over it; then wear: soft grime in patches, creases, worn edges, scuffs, grain.
   (Nov 20 afternoon, the realism rule for every object: the look is the same everywhere, blacks lifted, a haze that
   gathers in the dark, a slight pixel; how worn a thing is depends on where it comes from: o.wear, 0 new … 1 weathered.
   Missing Mile is weathered, so 1 is the default here.)
   tile: for pictures that repeat (the train's steel): no patches or edges, which would show seams; only the grade and grain.
   ================================================================ */
function h2(a, b){ let n = (Math.imul(a|0, 374761393) + Math.imul(b|0, 668265263))|0; n = Math.imul(n ^ (n >>> 13), 1274126177); n = n ^ (n >>> 16); return (n >>> 0)/4294967296; }
function vn(x, y){ const xi = Math.floor(x), yi = Math.floor(y); let fx = x - xi, fy = y - yi; fx = fx*fx*(3 - 2*fx); fy = fy*fy*(3 - 2*fy); const a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1); return a + (b - a)*fx + (c - a)*fy + (a - b - c + d)*fx*fy; }
export function realCanvas(cv, o = {}){ const T0 = performance.now(); try { return realCanvas0(cv, o); } finally { window.__realMs = (window.__realMs || 0) + performance.now() - T0; window.__realN = (window.__realN || 0) + 1; } }
function realCanvas0(cv, o){
  const w = cv.width, h = cv.height; if (w < 8 || h < 8 || w*h > 4200000) return cv;
  const g = cv.getContext('2d'); let im; try { im = g.getImageData(0, 0, w, h); } catch (e) { return cv; }
  const d = im.data, n = w*h, tile = !!o.tile, k = o.k == null ? 1 : o.k, W = o.wear == null ? 1 : o.wear, sc = Math.max(w, h)/512;
  const R = Math.max(1, Math.round((o.blur == null ? 1.2 : o.blur)*sc)), src = new Float32Array(d), tmp = new Float32Array(n*4), soft = new Float32Array(n*4);
  const pass = (from, to, dx, dy) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { let sr = 0, sg = 0, sb = 0, sa = 0, cnt = 0;
      for (let t = -R; t <= R; t++) { let xx = i + t*dx, yy = j + t*dy; if (tile) { xx = (xx + w) % w; yy = (yy + h) % h; } else if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const q = (yy*w + xx)*4, al = from[q + 3] + 1; sr += from[q]*al; sg += from[q + 1]*al; sb += from[q + 2]*al; sa += al; cnt++; }
      const p = (j*w + i)*4; to[p] = sr/sa; to[p + 1] = sg/sa; to[p + 2] = sb/sa; to[p + 3] = sa/cnt - 1; } };
  pass(src, tmp, 1, 0); pass(tmp, soft, 0, 1);
  const FOG = [138, 128, 118], gs = 1/(90*sc), cs = 1/(26*sc), ew = 6*sc;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const p = (j*w + i)*4; if (src[p + 3] < 4 && soft[p + 3] < 4) continue;
    let r = src[p]*0.66 + soft[p]*0.34, gg = src[p + 1]*0.66 + soft[p + 1]*0.34, b = src[p + 2]*0.66 + soft[p + 2]*0.34;
    const L = r*0.3 + gg*0.59 + b*0.11, sat = 1 - 0.3*k; r = L + (r - L)*sat; gg = L + (gg - L)*sat; b = L + (b - L)*sat;
    r = 28*k + r*(1 - 0.24*k); gg = 26*k + gg*(1 - 0.25*k); b = 23*k + b*(1 - 0.28*k);   /* (Nov 20 afternoon: "i dont like the blackness": blacks lifted further) */
    let dark = 1, lite = 0;
    if (!tile) {
      const gr = vn(i*gs, j*gs)*0.6 + vn(i*gs*2.3 + 7, j*gs*2.3)*0.4, grime = Math.max(0, gr - (0.62 - 0.12*W))*0.6*W*k;   /* wear: Missing Mile's things are weathered (1); cleaner places pass less */
      const crease = W*(Math.max(0, 1 - Math.abs(vn(i*cs*0.5, j*cs*2.4 + 11) - 0.5)*44)*0.07 + Math.max(0, 1 - Math.abs(vn(i*cs*2.4 + 5, j*cs*0.5) - 0.5)*44)*0.05)*k;
      const ed = Math.min(i, j, w - 1 - i, h - 1 - j), ea = ed < ew ? (1 - ed/ew)*0.7*W*k*(0.6 + 0.8*vn(i*0.05, j*0.05)) : 0;
      const scuff = h2((i/(3*sc)) | 0, (j/(3*sc)) | 0) > 0.988 ? 0.16*k : 0;
      dark = 1 - grime*0.5 - ea*0.18 - crease*0.5; lite = crease*30 + scuff*60 + ea*12;
    }
    const grain = (h2(i*3 + 1, j*7 + 2) - 0.5)*(6 + 6*W)*k;
    r = r*dark + lite*0.95 + grain; gg = gg*dark + lite*0.9 + grain; b = b*dark + lite*0.82 + grain;
    const hz = (0.12 + 0.1*Math.max(0, 1 - (r*0.3 + gg*0.59 + b*0.11)/120))*k; r = r*(1 - hz) + FOG[0]*hz; gg = gg*(1 - hz) + FOG[1]*hz; b = b*(1 - hz) + FOG[2]*hz;
    d[p] = r; d[p + 1] = gg; d[p + 2] = b; d[p + 3] = src[p + 3]*0.88 + soft[p + 3]*0.12; }
  if (!tile) {   /* a slight pixel: each little block leans 18% toward its own average ("photo real with pixel slightly") */
    const B = Math.max(2, Math.round(2*sc));
    for (let y = 0; y < h; y += B) for (let x = 0; x < w; x += B) { let r = 0, gg = 0, b = 0, c = 0; const y1 = Math.min(h, y + B), x1 = Math.min(w, x + B);
      for (let j = y; j < y1; j++) for (let i = x; i < x1; i++) { const p = (j*w + i)*4; r += d[p]; gg += d[p + 1]; b += d[p + 2]; c++; }
      r /= c; gg /= c; b /= c;
      for (let j = y; j < y1; j++) for (let i = x; i < x1; i++) { const p = (j*w + i)*4; d[p] = d[p]*0.82 + r*0.18; d[p + 1] = d[p + 1]*0.82 + gg*0.18; d[p + 2] = d[p + 2]*0.82 + b*0.18; } }
  }
  g.putImageData(im, 0, 0); return cv;
}
/* the close-ups (Seam's drawings, shown flat over the world): smooth, not pixels; muted and hazed; a grime and grain
   film over them. CSS only, on Embroidery pages; the pictures and their words are Seam's, untouched */
export function realCloseups(){
  const noise = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.28 0 0 0 0 0.24 0 0 0 0 0.2 0 0 0 0.55 0"/></filter><rect width="300" height="300" filter="url(#n)"/></svg>');
  const grime = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="7"/><feColorMatrix values="0 0 0 0 0.24 0 0 0 0 0.2 0 0 0 0 0.16 0 0 0 1.3 -0.55"/></filter><rect width="600" height="600" filter="url(#g)"/></svg>');
  const css = `#fvmv,#pkv{image-rendering:auto!important}
#fvmv{filter:saturate(.72) contrast(.88) brightness(.95) sepia(.1) blur(.3px)}
#f3c-pic svg{filter:saturate(.7) contrast(.86) brightness(.95) sepia(.12) blur(.35px)}
#f3c-pic,#fvm{isolation:isolate}
#fvm::after{content:"";position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:min(100%,calc(74vh*16/9));aspect-ratio:16/9;pointer-events:none;background:url("data:image/svg+xml,${grime}"),url("data:image/svg+xml,${noise}");background-size:cover,180px;mix-blend-mode:multiply;opacity:.4}
#fvm::before{content:"";position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);width:min(100%,calc(74vh*16/9));aspect-ratio:16/9;pointer-events:none;z-index:1;background:radial-gradient(ellipse at 22% 18%,rgba(255,248,236,.10),rgba(255,248,236,0) 55%),linear-gradient(135deg,rgba(138,128,118,0) 45%,rgba(138,128,118,.16))}`;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
}
