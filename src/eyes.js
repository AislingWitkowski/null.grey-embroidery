/* (Nov 19, Aisling: "all the doorknobs in missing mile have like eyes on them, all in different forms..but like each
   building will have a different form, some more obvious than others … we dont want this too wild") the eye hardware.
   one form per building. each is drawn once as a height picture (raised = light), and its colour is worked out from
   that height (deep places dark with old patina, high places rubbed bright by hands), so the relief and the colour
   always agree. our own designs, after her references (not copies).
   - STATION (Main Street station, 1911): cast brass, a raised eye with its brow in a ring of rays, on an oval knob;
     backplates with a beaded edge, a small eye at the top, the keyhole below. the padlock on the chain: rusted iron,
     an eye with its brow among leaves and small flowers, a half sun under it. */
import * as THREE from 'three';
const TAU = Math.PI*2;
let SEED = 9; const R = () => (SEED = (SEED*16807) % 2147483647)/2147483647;

function heightCanvas(w, h, draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); return c; }   /* (outside the shape stays clear) */
/* colour from height: low = patina/dark, mid = the metal, high = rubbed bright. pal = [low, mid, high] rgb; noise adds pits */
function colourFrom(hc, pal, o = {}){
  const w = hc.width, h = hc.height, src = hc.getContext('2d').getImageData(0, 0, w, h).data, c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data, [lo, mid, hi] = pal;
  for (let i = 0; i < w*h; i++) { const a = src[i*4 + 3]/255; let t = src[i*4]/255;
    if (a < 0.5) { d[i*4 + 3] = 0; continue; }
    const n = (R() - 0.5)*(o.noise || 0.08), pit = R() < (o.pits || 0) ? -0.25 : 0; t = Math.min(1, Math.max(0, t + n + pit));
    const k = t < 0.5 ? t/0.5 : (t - 0.5)/0.5, A = t < 0.5 ? lo : mid, B = t < 0.5 ? mid : hi;
    for (let j = 0; j < 3; j++) d[i*4 + j] = A[j] + (B[j] - A[j])*k; d[i*4 + 3] = 255; }
  g.putImageData(im, 0, 0); return c; }
function texOf(c, srgb){ const t = new THREE.CanvasTexture(c); t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; }
const grey = v => { const q = Math.round(v*255); return `rgb(${q},${q},${q})`; };

/* an eye in relief, centred at (cx, cy), width ew. brow: arched brow above. raised lids, the white a little lower, the
   iris ring raised, the pupil sunk */
function eyeRelief(g, cx, cy, ew, o = {}){
  const eh = ew*0.42, lid = Math.max(2, ew*0.06);
  const almond = () => { g.beginPath(); g.moveTo(cx - ew/2, cy); g.bezierCurveTo(cx - ew*0.2, cy - eh*1.05, cx + ew*0.2, cy - eh*1.05, cx + ew/2, cy); g.bezierCurveTo(cx + ew*0.2, cy + eh*0.95, cx - ew*0.2, cy + eh*0.95, cx - ew/2, cy); g.closePath(); };
  if (o.brow) { g.strokeStyle = grey(o.top || 0.92); g.lineWidth = lid*1.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - ew*0.55, cy - eh*0.95); g.quadraticCurveTo(cx, cy - eh*2.0, cx + ew*0.58, cy - eh*0.8); g.stroke();
    g.lineWidth = 1; g.strokeStyle = grey(0.6); for (let i = 0; i < 14; i++) { const t = i/13, x = cx - ew*0.5 + ew*1.05*t, y = cy - eh*(0.95 + 0.95*Math.sin(t*Math.PI)) ; g.beginPath(); g.moveTo(x, y - lid*0.5); g.lineTo(x + lid*0.6, y + lid*0.5); g.stroke(); } }   /* (the brow's little hairs, cut in) */
  g.fillStyle = grey(0.55); almond(); g.fill();   /* the white */
  g.strokeStyle = grey(o.top || 0.9); g.lineWidth = lid; g.lineJoin = 'round'; almond(); g.stroke();   /* the lids */
  const ir = eh*0.78; g.fillStyle = grey(0.74); g.beginPath(); g.arc(cx, cy + eh*0.05, ir, 0, TAU); g.fill();
  g.strokeStyle = grey(0.85); g.lineWidth = Math.max(1.5, ir*0.16); g.beginPath(); g.arc(cx, cy + eh*0.05, ir*0.9, 0, TAU); g.stroke();
  g.strokeStyle = grey(0.62); g.lineWidth = 1; for (let i = 0; i < 18; i++) { const a = i/18*TAU; g.beginPath(); g.moveTo(cx + Math.cos(a)*ir*0.45, cy + eh*0.05 + Math.sin(a)*ir*0.45); g.lineTo(cx + Math.cos(a)*ir*0.8, cy + eh*0.05 + Math.sin(a)*ir*0.8); g.stroke(); }   /* the iris's fibres */
  g.fillStyle = grey(0.12); g.beginPath(); g.arc(cx, cy + eh*0.05, ir*0.38, 0, TAU); g.fill();   /* the pupil, sunk */
  g.fillStyle = grey(0.95); g.beginPath(); g.arc(cx - ir*0.15, cy - ir*0.1, ir*0.12, 0, TAU); g.fill();   /* a catch of light, raised */
}
function rays(g, cx, cy, r0, r1, n, v){ for (let i = 0; i < n; i++) { const a = i/n*TAU + (i % 2)*0.02, a1 = a - 0.045, a2 = a + 0.045, L = r1*(i % 2 ? 0.82 : 1);
    g.fillStyle = grey(v); g.beginPath(); g.moveTo(cx + Math.cos(a1)*r0, cy + Math.sin(a1)*r0); g.lineTo(cx + Math.cos(a)*L, cy + Math.sin(a)*L); g.lineTo(cx + Math.cos(a2)*r0, cy + Math.sin(a2)*r0); g.closePath(); g.fill(); } }

const BRASS = [[46, 36, 22], [128, 96, 52], [222, 186, 118]], IRONR = [[34, 22, 14], [104, 58, 30], [170, 104, 56]];
let STN = null;
export function stationEyes(){
  if (STN) return STN;
  /* the knob's face */
  const kH = heightCanvas(256, 256, (g, w) => { const c = w/2;
    const dm = g.createRadialGradient(c - 20, c - 20, 10, c, c, c); dm.addColorStop(0, grey(0.62)); dm.addColorStop(0.9, grey(0.45)); dm.addColorStop(1, grey(0.3)); g.fillStyle = dm; g.beginPath(); g.arc(c, c, c - 2, 0, TAU); g.fill();
    g.strokeStyle = grey(0.88); g.lineWidth = 9; g.beginPath(); g.arc(c, c, c - 9, 0, TAU); g.stroke();   /* the rim */
    g.strokeStyle = grey(0.3); g.lineWidth = 3; g.beginPath(); g.arc(c, c, c - 17, 0, TAU); g.stroke();
    rays(g, c, c, 58, 104, 30, 0.7);
    eyeRelief(g, c, c + 6, 150, { brow:true }); });
  const kC = colourFrom(kH, BRASS, { noise:0.1, pits:0.004 });
  /* the backplate: 0.05 × 0.2 m */
  const pH = heightCanvas(128, 512, (g, w, h) => { g.fillStyle = grey(0.5); g.beginPath(); g.ellipse(w/2, h/2, w/2 - 2, h/2 - 2, 0, 0, TAU); g.fill();
    g.strokeStyle = grey(0.85); g.lineWidth = 6; g.beginPath(); g.ellipse(w/2, h/2, w/2 - 8, h/2 - 8, 0, 0, TAU); g.stroke();
    g.fillStyle = grey(0.82); for (let i = 0; i < 46; i++) { const a = i/46*TAU; g.beginPath(); g.arc(w/2 + Math.cos(a)*(w/2 - 17), h/2 + Math.sin(a)*(h/2 - 17), 2.6, 0, TAU); g.fill(); }   /* the beaded edge */
    eyeRelief(g, w/2, 96, 62, { brow:false });
    for (const y of [44, h - 44]) { g.fillStyle = grey(0.9); g.beginPath(); g.arc(w/2, y, 8, 0, TAU); g.fill(); g.strokeStyle = grey(0.25); g.lineWidth = 2.5; g.beginPath(); g.moveTo(w/2 - 6, y); g.lineTo(w/2 + 6, y); g.stroke(); }   /* screws */
    g.fillStyle = grey(0.02); g.beginPath(); g.arc(w/2, 350, 11, 0, TAU); g.fill(); g.beginPath(); g.moveTo(w/2 - 6, 352); g.lineTo(w/2 + 6, 352); g.lineTo(w/2 + 9, 392); g.lineTo(w/2 - 9, 392); g.closePath(); g.fill(); });   /* the keyhole */
  const pC = colourFrom(pH, BRASS, { noise:0.12, pits:0.006 });
  /* the padlock's face: an eye with its brow among leaves and flowers, a half sun under it (0.08 × 0.095 m) */
  const lH = heightCanvas(256, 304, (g, w, h) => { g.fillStyle = grey(0.5); g.beginPath(); g.moveTo(20, 60); g.quadraticCurveTo(w/2, 10, w - 20, 60); g.quadraticCurveTo(w + 8, h*0.6, w/2, h - 6); g.quadraticCurveTo(-8, h*0.6, 20, 60); g.fill();
    g.strokeStyle = grey(0.8); g.lineWidth = 8; g.stroke();
    for (let i = 0; i < 900; i++) { g.fillStyle = grey(0.4 + R()*0.15); g.fillRect(14 + R()*(w - 28), 30 + R()*(h - 40), 2, 2); }   /* the stippled ground */
    const leaf = (x, y, a, s) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = grey(0.72); g.beginPath(); g.ellipse(0, 0, s, s*0.38, 0, 0, TAU); g.fill(); g.strokeStyle = grey(0.5); g.lineWidth = 1.2; g.beginPath(); g.moveTo(-s, 0); g.lineTo(s, 0); g.stroke(); g.restore(); };
    const flower = (x, y, s) => { g.fillStyle = grey(0.75); for (let k = 0; k < 5; k++) { const a = k/5*TAU; g.beginPath(); g.arc(x + Math.cos(a)*s, y + Math.sin(a)*s, s*0.62, 0, TAU); g.fill(); } g.fillStyle = grey(0.45); g.beginPath(); g.arc(x, y, s*0.4, 0, TAU); g.fill(); };
    for (const sd of [-1, 1]) { for (let i = 0; i < 5; i++) leaf(w/2 + sd*(92 - i*4), 80 + i*32, sd*(0.6 + i*0.25), 14); flower(w/2 + sd*58, 70, 9); flower(w/2 + sd*86, 196, 10); flower(w/2 + sd*48, 226, 8); }
    eyeRelief(g, w/2, 150, 130, { brow:true, top:0.88 });
    rays(g, w/2, h - 20, 22, 62, 22, 0.72); g.fillStyle = grey(0.5); g.fillRect(14, h - 20, w - 28, 30); g.fillStyle = grey(0.8); g.beginPath(); g.arc(w/2, h - 20, 20, Math.PI, TAU); g.fill(); });
  const lC = colourFrom(lH, IRONR, { noise:0.16, pits:0.02 });
  STN = { knob:{ map:texOf(kC, true), bump:texOf(kH) }, plate:{ map:texOf(pC, true), bump:texOf(pH) }, lock:{ map:texOf(lC, true), bump:texOf(lH) } };
  return STN;
}

/* the station's doorknob, on its backplate, at (x, y) on a door whose face is at z = zf, facing s (−1 = toward −z) */
export function stationKnob(scene, x, y, zf, s){
  const E = stationEyes(), out = [];
  const brass = (t, o = {}) => new THREE.MeshStandardMaterial({ map:t.map, bumpMap:t.bump, bumpScale:o.b || 1.6, roughness:o.r || 0.42, metalness:0.72, transparent:!!o.cut, alphaTest:o.cut ? 0.5 : 0 });
  const plain = new THREE.MeshStandardMaterial({ color:0x6a5236, roughness:0.45, metalness:0.72 });
  const face = (geo, m, dz) => { const me = new THREE.Mesh(geo, m); if (s < 0) me.rotation.y = Math.PI; me.position.set(x, 0, zf + s*dz); me.castShadow = true; scene.add(me); out.push(me); return me; };
  const pl = face(new THREE.PlaneGeometry(0.05, 0.2), brass(E.plate, { cut:true, b:1.2 }), 0.004); pl.position.y = y - 0.02;   /* the backplate */
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.013, 0.03, 10), plain); neck.rotation.x = Math.PI/2; neck.position.set(x, y + 0.03, zf + s*0.019); scene.add(neck); out.push(neck);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.027, 0.02, 28), plain); body.rotation.x = Math.PI/2; body.position.set(x, y + 0.03, zf + s*0.043); body.castShadow = true; scene.add(body); out.push(body);
  const fc = face(new THREE.CircleGeometry(0.031, 40), brass(E.knob, { b:2.2, r:0.36 }), 0.0535); fc.position.y = y + 0.03;   /* its face, the eye */
  return out;
}
/* the padlock on the chain, hanging at (x, y) on the front doors (face toward −z at z) */
export function stationLock(scene, x, y, z){
  const E = stationEyes(), out = [];
  const rust = new THREE.MeshStandardMaterial({ map:E.lock.map, bumpMap:E.lock.bump, bumpScale:2, roughness:0.85, metalness:0.32, alphaTest:0.5, transparent:true });
  const dark = new THREE.MeshStandardMaterial({ color:0x4a2e1c, roughness:0.9, metalness:0.3 });
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.095), rust); f.rotation.y = Math.PI; f.position.set(x, y, z - 0.013); f.castShadow = true; scene.add(f); out.push(f);
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.024, 20), dark); b.rotation.x = Math.PI/2; b.scale.set(1.1, 1, 1.25); b.position.set(x, y - 0.006, z); scene.add(b); out.push(b);   /* its body behind the face */
  const sh = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.0055, 8, 20, Math.PI), dark); sh.position.set(x, y + 0.04, z); scene.add(sh); out.push(sh);   /* the shackle */
  return out;
}

/* - SHED (the feed, seed and bait shed): a plain plank door with a cheap iron knob, and an eye somebody scratched into
     its paint round the knob, long after: lids cut over and over, a ring for the iris, a jab for the pupil, rough lashes.
     the scratches show the pale wood under the paint and catch the light a little. (Aisling, Nov 19: "scratched in later
     is ok!") */
export function shedDoor(scene, x, z0, z1, h){
  const W = z1 - z0, cw = 320, ch = Math.round(cw*h/W), C = document.createElement('canvas'), B = document.createElement('canvas'); C.width = B.width = cw; C.height = B.height = ch;
  const g = C.getContext('2d'), b = B.getContext('2d'); SEED = 31;
  b.fillStyle = grey(0.5); b.fillRect(0, 0, cw, ch);
  const nP = 5, pw = cw/nP;
  for (let i = 0; i < nP; i++) { const x0 = i*pw, tone = 96 + R()*22;
    g.fillStyle = `rgb(${tone*0.78},${tone*0.84},${tone*0.66})`; g.fillRect(x0, 0, pw, ch);   /* sage-grey paint, each plank its own */
    for (let k = 0; k < 220; k++) { const yy = R()*ch, L = 20 + R()*120; g.fillStyle = `rgba(${R() < 0.5 ? '60,52,40' : '200,196,170'},${0.05 + R()*0.08})`; g.fillRect(x0 + R()*pw, yy, 1, L); }   /* its grain under the paint */
    for (let k = 0; k < 14; k++) { const px = x0 + R()*pw, py = R() < 0.6 ? ch*(0.7 + R()*0.3) : R()*ch, rw = 4 + R()*18, rh = 10 + R()*50;   /* paint flaking to bare grey wood, more low */
      g.fillStyle = `rgb(${88 + R()*20},${80 + R()*16},${66 + R()*12})`; g.beginPath(); g.ellipse(px, py, rw, rh, R()*0.3, 0, TAU); g.fill(); b.fillStyle = grey(0.42); b.beginPath(); b.ellipse(px, py, rw, rh, 0, 0, TAU); b.fill(); }
    g.fillStyle = 'rgba(28,22,16,0.85)'; g.fillRect(x0, 0, 3, ch); b.fillStyle = grey(0.1); b.fillRect(x0, 0, 3, ch); }   /* the gaps between planks */
  for (const yy of [ch*0.12, ch*0.86]) { g.fillStyle = 'rgb(84,88,70)'; g.fillRect(0, yy - 14, cw, 28); b.fillStyle = grey(0.75); b.fillRect(0, yy - 14, cw, 28); for (let i = 0; i < nP; i++) for (const d of [-7, 7]) { g.fillStyle = '#2a2018'; g.beginPath(); g.arc(i*pw + pw/2, yy + d, 2.5, 0, TAU); g.fill(); } }   /* the ledges, nailed */
  const grime = g.createLinearGradient(0, ch*0.6, 0, ch); grime.addColorStop(0, 'rgba(50,40,28,0)'); grime.addColorStop(1, 'rgba(50,40,28,0.45)'); g.fillStyle = grime; g.fillRect(0, 0, cw, ch);
  /* the scratched eye, round where the knob is (knob at 0.78 across, 1.0 m up) */
  const kx = cw*0.78, ky = ch*(1 - 1.0/h), ew = cw*0.42, eh = ew*0.36;
  const scratch = (pts, n = 3) => { for (let r = 0; r < n; r++) { const j = () => (R() - 0.5)*5; g.strokeStyle = `rgba(${R() < 0.4 ? '190,176,146' : '150,136,108'},${0.22 + R()*0.3})`; g.lineWidth = 0.6 + R()*1.1;   /* (rough, gone over again and again, not neat) */ b.strokeStyle = grey(0.15); b.lineWidth = 2;
      for (const c of [g, b]) { c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px + j(), py + j()) : c.moveTo(px + j(), py + j())); c.stroke(); } } };
  const lidPts = up => { const a = []; for (let i = 0; i <= 16; i++) { const t = i/16, xx = kx - ew/2 + ew*t; a.push([xx, ky + (up ? -1 : 1)*eh*Math.sin(t*Math.PI)*(up ? 1 : 0.85)]); } return a; };
  scratch(lidPts(true), 6); scratch(lidPts(false), 5);
  for (let k = 0; k < 4; k++) { const a = []; const t0 = R()*0.3, t1 = 0.6 + R()*0.4; for (let i = 0; i <= 8; i++) { const t = t0 + (t1 - t0)*i/8, xx = kx - ew/2 + ew*t; a.push([xx, ky - eh*Math.sin(t*Math.PI)*(0.9 + R()*0.25)]); } scratch(a, 1); }   /* stray strokes where the knife slipped */
  g.fillStyle = 'rgba(40,30,20,0.8)'; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(kx + (R() - 0.5)*10, ky - eh*0.55 + (R() - 0.5)*8, 1.5 + R()*2, 0, TAU); g.fill(); }   /* the pupil: jabbed in above the knob */
  { const a = []; for (let i = 0; i <= 20; i++) { const t = i/20*TAU; a.push([kx + Math.cos(t)*eh*0.82, ky + Math.sin(t)*eh*0.82]); } scratch(a, 3); }   /* the iris, cut round the knob */
  for (let i = 0; i < 9; i++) { const t = 0.1 + i/8*0.8, xx = kx - ew/2 + ew*t, yy = ky - eh*Math.sin(t*Math.PI); scratch([[xx, yy - 2], [xx + (t - 0.5)*14, yy - 14 - R()*8]], 2); }   /* lashes, rough */
  const map = new THREE.CanvasTexture(C); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8; const bump = new THREE.CanvasTexture(B);
  const m = new THREE.MeshStandardMaterial({ map, bumpMap:bump, bumpScale:1.4, roughness:0.85 });
  const out = [], door = new THREE.Mesh(new THREE.PlaneGeometry(W, h), m); door.rotation.y = Math.PI/2; door.position.set(x + 0.012, h/2, (z0 + z1)/2); door.receiveShadow = true; scene.add(door); out.push(door);
  const iron = new THREE.MeshStandardMaterial({ color:0x2e2620, roughness:0.6, metalness:0.6 }), fr = new THREE.MeshStandardMaterial({ color:0x3a3024, roughness:0.9 });
  const kz = z1 - W*0.78;   /* (seen from +x the picture runs from z1 to z0) */
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.028, 14, 10), iron); knob.scale.set(0.8, 1, 1); knob.position.set(x + 0.06, 1.0, kz); knob.castShadow = true; scene.add(knob); out.push(knob);
  const nk = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.04, 8), iron); nk.rotation.z = Math.PI/2; nk.position.set(x + 0.03, 1.0, kz); scene.add(nk); out.push(nk);
  const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 16), iron); rose.rotation.z = Math.PI/2; rose.position.set(x + 0.015, 1.0, kz); scene.add(rose); out.push(rose);
  for (const [a, bb, c, d] of [[z0 - 0.05, z0, 0, h + 0.05], [z1, z1 + 0.05, 0, h + 0.05], [z0 - 0.05, z1 + 0.05, h, h + 0.06]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.03, d - c, bb - a), fr); f.position.set(x + 0.015, (c + d)/2, (a + bb)/2); f.castShadow = true; scene.add(f); out.push(f); }   /* its frame */
  return { meshes:out, uv:door.material.map };
}

/* (Nov 19, Aisling: "a abandoned off brand empty cracker jack box discarded somewher on the station") an empty box of
   caramel corn and peanuts, crushed and thrown down. a pre-2002 trademark, so its shape, stripes and era stay and the
   name is one step off (CRACKER JAKE, a stand-in: hers to rename); its blue is warmed to plum (no blue); no mascot face. */
export function snackBox(scene, x, y, z, ry){
  const mk = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const face = mk(192, 384, (g, w, h) => { g.fillStyle = '#e8dcc2'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) if (i % 2 === 0) { g.fillStyle = '#a42a22'; g.fillRect(i*w/9, 0, w/9, h); }   /* the red and white stripes */
    g.fillStyle = '#e8dcc2'; g.fillRect(14, 70, w - 28, 150); g.strokeStyle = '#4a2438'; g.lineWidth = 5; g.strokeRect(14, 70, w - 28, 150);
    g.fillStyle = '#a42a22'; g.textAlign = 'center'; g.font = '900 34px "Cooper Black","Georgia",serif'; g.fillText('CRACKER', w/2, 116); g.fillText('JAKE', w/2, 156);
    g.fillStyle = '#4a2438'; g.font = '700 13px "Helvetica Neue",Arial,sans-serif'; g.fillText('CARAMEL CORN', w/2, 182); g.fillText('& PEANUTS', w/2, 198);
    g.fillStyle = '#4a2438'; g.beginPath(); for (let k = 0; k < 10; k++) { const a = k/10*TAU - Math.PI/2, r = k % 2 ? 9 : 20; g.lineTo(w/2 + Math.cos(a)*r, 290 + Math.sin(a)*r); } g.fill();
    g.fillStyle = '#4a2438'; g.fillRect(30, 312, w - 60, 34);   /* a plum band so the words read */
    g.fillStyle = '#e8dcc2'; g.font = '800 11px Arial,sans-serif'; g.fillText('A PRIZE', w/2, 326); g.fillText('IN EVERY BOX', w/2, 340);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(60,44,30,${0.04 + Math.random()*0.12})`; g.fillRect(Math.random()*w, Math.random()*h, 1 + Math.random()*5, 1 + Math.random()*3); }   /* dirt, damp */
    const st = g.createRadialGradient(w*0.3, h*0.8, 4, w*0.3, h*0.8, 90); st.addColorStop(0, 'rgba(70,50,30,0.35)'); st.addColorStop(1, 'rgba(70,50,30,0)'); g.fillStyle = st; g.fillRect(0, 0, w, h); });
  const side = mk(64, 384, (g, w, h) => { g.fillStyle = '#a42a22'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8dcc2'; g.fillRect(0, 0, w, 40); for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(60,44,30,${0.06 + Math.random()*0.1})`; g.fillRect(Math.random()*w, Math.random()*h, 2, 2); } });
  const cb = new THREE.MeshStandardMaterial({ color:0x8a7458, roughness:0.95 }), fm = new THREE.MeshStandardMaterial({ map:face, roughness:0.85 }), sm = new THREE.MeshStandardMaterial({ map:side, roughness:0.85 });
  const geo = new THREE.BoxGeometry(0.068, 0.125, 0.03, 2, 4, 2), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const yy = p.getY(i), k = Math.max(0, yy/0.065); p.setZ(i, p.getZ(i)*(1 - 0.7*k) + Math.sin(yy*40)*0.002); p.setX(i, p.getX(i)*(1 - 0.12*k)); }   /* crushed at its top end */
  geo.computeVertexNormals();
  const me = new THREE.Mesh(geo, [sm, sm, cb, cb, fm, sm]); me.rotateY(ry); me.rotateX(-Math.PI/2 + 0.04); me.position.set(x, y + 0.016, z);   /* (lying face up) */ me.castShadow = true; me.receiveShadow = true; scene.add(me);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.04), cb); fl.rotation.set(-Math.PI/2 + 0.5, ry, 0); fl.position.set(x + Math.cos(ry)*0.075, y + 0.012, z - Math.sin(ry)*0.075); scene.add(fl);   /* its torn-open flap */
  return me;
}
