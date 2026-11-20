/* ================================================================
   EMBROIDERY · Missing Mile's detail passes (Nov 19, Aisling: "do next few details passes").
   1. the station's back and gables: the wet coming up the wall's foot, a louvred vent high in each gable;
   2. the shed's awning: rafters and a purlin under the tin, a rusted drip edge, round pipe posts with knee braces;
   3. the road's signs: the mileage signs on steel channel posts with bolts; the crossbuck aged.
   ================================================================ */
import * as THREE from 'three';
import { K, mat, box, cyl } from './kit.js';
import { paint, vn, fbm, clamp, sm, hsh, tex } from './paint.js';

/* ---------- 1. the wet at the wall's foot: a soft dark band, its top edge wandering, tide lines, a little green ----------
   (painted with alpha, laid a hair off the wall, so it darkens what's there and hides nothing) */
function paintDamp(mw, seed){
  return paint(Math.round(mw*64), 96, mw, 1.5, (x, y) => {
    const top = 0.78 + 0.22*fbm(x*0.7 + seed, 3.1) + 0.1*vn(x*3.1 + seed, 7) - (hsh(Math.floor(x*0.5 + seed), 9) < 0.15 ? 0.2 : 0);
    if (y > top + 0.04) return null;
    const d = clamp((top - y)/0.3, 0, 1), tide = Math.abs(y - top + 0.02) < 0.012 ? 0.25 : 0, tide2 = Math.abs(y - top*0.6) < 0.008 ? 0.12 : 0;
    const green = fbm(x*2.2 + seed, y*3) > 0.6 && y < 0.3;
    const splash = y < 0.6 ? 0.3*(1 - y/0.6) : 0;   /* rain splashing up off the ground */
    const a = clamp(0.16 + 0.4*d + splash + tide + tide2 + 0.08*(vn(x*14, y*20) - 0.5), 0, 0.78);
    return [green ? 'holive' : 'hblack', green ? 0.25 : 0.18 + 0.1*vn(x*9, y*9), a, 0.5, 0.75];
  }, { nrm:0 });
}
function damp(scene, w, x, z, ry, seed){
  const t = paintDamp(w, seed); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  const m = new THREE.MeshStandardMaterial({ map:t, transparent:true, depthWrite:false, roughness:0.8, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2 });
  const me = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.5), m); me.position.set(x, 0.75 - 0.44, z); me.rotation.y = ry; me.receiveShadow = true; me.renderOrder = 2; scene.add(me); return me;
}
/* a louvred vent high in a gable: a wood frame, five slats tipped down and out, dark behind them */
function vent(scene, x, s, M){
  const wd = mat(null, { color:0x8a7866, rough:0.9 });
  const y = 4.15, z = 10.5, W = 0.62, H = 0.48, xo = x + s*0.03;
  const dk = new THREE.Mesh(new THREE.PlaneGeometry(W, H), M.dark); dk.position.set(x + s*0.004, y, z); dk.rotation.y = s*Math.PI/2; scene.add(dk);
  box(xo - 0.03, xo + 0.03, y - H/2 - 0.05, y - H/2, z - W/2 - 0.05, z + W/2 + 0.05, wd, { solid:false });   /* sill */
  box(xo - 0.03, xo + 0.03, y + H/2, y + H/2 + 0.05, z - W/2 - 0.05, z + W/2 + 0.05, wd, { solid:false });
  for (const zz of [z - W/2 - 0.05, z + W/2]) box(xo - 0.03, xo + 0.03, y - H/2, y + H/2, zz, zz + 0.05, wd, { solid:false });
  for (let i = 0; i < 5; i++) {
    const g = new THREE.BoxGeometry(0.1, 0.014, W); const me = new THREE.Mesh(g, wd);
    me.position.set(xo, y - H/2 + 0.06 + i*0.09, z); me.rotation.z = -s*0.65; me.castShadow = me.receiveShadow = true; scene.add(me);
  }
  if (s < 0) { const br = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.014, W*0.45), wd); br.position.set(xo - 0.01, y - H/2 + 0.06 + 2*0.09 - 0.03, z + 0.12); br.rotation.set(0.25, 0, 0.9); scene.add(br); }   /* one slat cracked and dropped */
}
export function wallDetails(scene, M){
  damp(scene, 16.1, 17, 13.004, 0, 3.1);   /* the back */
  damp(scene, 5.1, 8.996, 10.5, -Math.PI/2, 7.7);   /* the west gable */
  for (const [s, xg] of [[-1, 9], [1, 25]]) vent(scene, xg, s, M);
}

/* ---------- 2. the shed's awning, in the round ---------- */
export function awningDetails(scene, M){
  const rust = mat(null, { color:0x6a3a24, rough:0.75, metal:0.25 });
  for (const x of [25.6, 26.6, 27.6, 28.5]) box(x - 0.04, x + 0.04, 2.5, 2.62, 7.02, 8.0, M.woodD, { solid:false });   /* rafters out from the shed wall */
  box(25.05, 28.95, 2.52, 2.62, 7.45, 7.53, M.woodD, { solid:false });   /* a purlin across them */
  /* the drip edge along the front: bent tin, rusted through in places, a little ragged */
  const g = new THREE.BoxGeometry(4.1, 0.06, 0.018, 40, 1, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const xx = p.getX(i); p.setY(i, p.getY(i) - 0.012*Math.sin(xx*2.1) - (p.getY(i) < 0 ? 0.02*vn(xx*6, 2) : 0)); }
  g.computeVertexNormals(); const de = new THREE.Mesh(g, rust); de.position.set(27, 2.46, 6.975); de.castShadow = de.receiveShadow = true; scene.add(de);
  /* the posts: old pipe, a little rusted, a knee brace up to the beam each side */
  const pipe = mat(null, { color:0x3c302a, rough:0.55, metal:0.55 });
  for (const [x, s] of [[25.075, 1], [28.925, -1]]) {
    cyl(0.04, 0.04, 2.48, pipe, x, 0, 7.025, 12);
    cyl(0.055, 0.055, 0.04, pipe, x, 0, 7.025, 12);   /* its foot plate */
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.62, 8), pipe); br.position.set(x + s*0.22, 2.22, 7.025); br.rotation.z = -s*Math.PI/4; br.castShadow = true; scene.add(br);
  }
}

/* ---------- 3. the road's signs: steel channel posts with holes and bolts; the plates' edges; the crossbuck aged ---------- */
function paintChannel(){
  return paint(48, 512, 0.08, 2.4, (x, y) => {
    const hole = Math.abs(x - 0.04) < 0.006 && ((y*39.4) % 1) < 0.35;   /* a hole every inch, all the way up */
    if (hole) return ['hblack', 0.06, 1, 0, 1];
    const ru = fbm(x*40, y*3) + (y < 0.4 ? 0.25*(1 - y/0.4) : 0);   /* rust worst near the ground */
    return ru > 0.75 ? ['hrust', clamp(0.32 + 0.1*vn(x*80, y*40), 0, 1), 1, 0.55, 0.85] : ['metal', clamp(0.3 + 0.08*vn(x*60, y*30) - 0.06*fbm(x*9, y), 0, 1), 1, 0.7, 0.5];
  }, { nrm:1 });
}
export function signPost(scene, x, z, gy, h){
  const t = paintChannel(); t.userData.m = [0.08, 2.4];
  const m = mat(t, { rough:0.6, metal:0.45 });
  const sh = new THREE.Shape(); [[-0.04, 0], [0.04, 0], [0.04, 0.035], [0.03, 0.035], [0.03, 0.008], [-0.03, 0.008], [-0.03, 0.035], [-0.04, 0.035]].forEach((p, i) => i ? sh.lineTo(p[0], p[1]) : sh.moveTo(p[0], p[1]));
  const g = new THREE.ExtrudeGeometry(sh, { depth:h, bevelEnabled:false }); g.rotateX(-Math.PI/2);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i)/0.08, uv.getY(i)/2.4);
  const me = new THREE.Mesh(g, m); me.position.set(x, gy - 0.1, z + 0.035); me.rotation.y = Math.PI; me.rotation.z = 0.025; me.castShadow = me.receiveShadow = true; scene.add(me);   /* (leaning a touch) */
  return me;
}
export function signBolts(scene, x, y, z){
  const bm = mat(null, { color:0x4a3a30, rough:0.5, metal:0.6 }); const out = [];
  for (const yy of [y + 0.08, y + 0.38]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 8), bm); b.rotation.x = Math.PI/2; b.position.set(x, yy, z - 0.026); scene.add(b); out.push(b); }
  return out;
}
/* the crossbuck's boards, aged: a grime wash over the white, rust bleeding from the bolt, the paint crazed */
export function ageBoard(c, w, h, seed){
  for (let i = 0; i < 900; i++) { const xx = hsh(i, seed)*w, yy = hsh(i, seed + 1)*h; c.fillStyle = `rgba(70,58,46,${0.05 + hsh(i, seed + 2)*0.12})`; c.fillRect(xx, yy, 1 + hsh(i, seed + 3)*3, 1); }
  const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(60,50,40,0.08)'); gr.addColorStop(1, 'rgba(60,50,40,0.32)'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
  const rg = c.createLinearGradient(0, h/2, 0, h); rg.addColorStop(0, 'rgba(120,58,30,0.55)'); rg.addColorStop(1, 'rgba(120,58,30,0)'); c.fillStyle = rg; c.fillRect(w/2 - 7, h/2, 14, h/2);   /* rust run from the centre bolt */
  c.strokeStyle = 'rgba(40,32,26,0.25)'; c.lineWidth = 1; for (let i = 0; i < 40; i++) { const xx = hsh(i, seed + 5)*w, yy = hsh(i, seed + 6)*h; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + (hsh(i, seed + 7) - 0.5)*30, yy + (hsh(i, seed + 8) - 0.5)*10); c.stroke(); }   /* crazed paint */
}

/* ---------- 6. the corner: the tobacco window's glass gone dusty (no hard shine), the bin with eyes sat in its own grime ---------- */
export function dustyGlass(){
  const t = paint(256, 224, 0.66, 0.58, (x, y) => {
    const wipe = Math.abs((x - 0.33)*1.1 + (y - 0.3)*0.6) < 0.09 && vn(x*30, y*30) > 0.3;   /* a hand wiped across it once */
    const dust = clamp(0.35 + 0.4*fbm(x*9, y*7) + (y < 0.12 ? 0.3 : 0) - (wipe ? 0.45 : 0), 0, 1);
    const crack = Math.abs(y - 0.42 - 0.3*(x - 0.5) - 0.02*Math.sin(x*60)) < 0.004 && x > 0.38 && x < 0.62;
    const fly = Math.hypot(x - 0.12, y - 0.06) < 0.008;
    return [crack ? 'hgrey' : (fly ? 'hblack' : 'hblack'), crack ? 0.55 : (fly ? 0.02 : 0.1 + 0.16*dust), 1, crack ? 0.6 : 0.5, 0.3 + 0.6*dust];
  }, { nrm:0 });
  t.userData.m = [0.66, 0.58];
  const m = new THREE.MeshStandardMaterial({ map:t, roughnessMap:t.userData.rough, roughness:1, metalness:0.05 }); m.userData.m = [0.66, 0.58]; return m;
}
export function binDetails(scene){
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d');
  const g = c.createRadialGradient(64, 64, 18, 64, 64, 64); g.addColorStop(0, 'rgba(20,14,10,0.55)'); g.addColorStop(1, 'rgba(20,14,10,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(30,22,16,${0.1 + hsh(i, 61)*0.25})`; c.beginPath(); c.arc(30 + hsh(i, 62)*68, 30 + hsh(i, 63)*68, 1 + hsh(i, 64)*3, 0, Math.PI*2); c.fill(); }
  const t = tex(cv, { clampEdge:true }); const pm = new THREE.MeshStandardMaterial({ map:t, transparent:true, depthWrite:false, roughness:0.9, polygonOffset:true, polygonOffsetFactor:-2 });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.95), pm); pl.rotation.x = -Math.PI/2; pl.position.set(26.2, 0.004, 7.72); pl.renderOrder = 2; pl.receiveShadow = true; scene.add(pl);   /* old wet and ash round its foot */
  const lip = mat(null, { color:0x7c7972, rough:0.95 });
  for (const [x0, x1, z0, z1] of [[25.97, 26.43, 7.53, 7.56], [25.97, 26.0, 7.53, 7.95], [26.4, 26.43, 7.53, 7.95]]) box(x0, x1, 0.84, 0.872, z0, z1, lip, { solid:false });   /* the hood's rim, a little proud */
  const paper = mat(null, { color:0xd8ccb4, rough:0.9 }), filt = mat(null, { color:0xb07a40, rough:0.9 });
  for (const [x, z, a] of [[26.08, 7.62, 0.4], [26.3, 7.7, 2.1], [26.15, 7.86, 1.2]]) {   /* butts stubbed out on the hood */
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.026, 6), paper); b.rotation.set(Math.PI/2, 0, a); b.position.set(x, 0.88, z); scene.add(b);
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.0047, 0.0047, 0.012, 6), filt); f.rotation.set(Math.PI/2, 0, a); f.position.set(x + Math.sin(a)*0.018, 0.88, z + Math.cos(a)*0.018); scene.add(f); }
}

/* ---------- (Nov 20) a second missing poster, on the road's first pole: the faceless woman. Aisling: use its wording
   (from a poster she sent). The words are kept; only the phone number is made up (555), as the one on the poster could
   be a real line. A photocopy on cheap paper: toner gone grey, the face left blank but for her smile, wet and curling. ---------- */
export function dreamPoster(scene, x, y, z, ry){
  const W = 600, H = 800, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#e4e0d6'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(40,36,32,${0.04 + hsh(i, 3)*0.12})`; g.fillRect(hsh(i, 1)*W, hsh(i, 2)*H, 1 + hsh(i, 4)*2, 1 + hsh(i, 5)*2); }   /* toner speckle */
  const T = (t, yy, px, w = 700, f = 'Helvetica Neue, Arial, sans-serif') => { g.font = `${w} ${px}px ${f}`; g.textAlign = 'center'; g.fillText(t, W/2, yy); };
  g.fillStyle = '#2a2826'; T('HAVE YOU SEEN ME IN YOUR DREAMS?', 58, 25, 600);
  g.fillStyle = '#1e1c1a'; T('MISSING', 150, 104, 900, 'Arial Black, Helvetica Neue, Arial, sans-serif');
  g.fillStyle = '#1e1c1a'; g.fillRect(150, 182, 300, 300); g.fillStyle = '#d8d4ca'; g.fillRect(156, 188, 288, 288);
  g.fillStyle = '#2a2826'; g.beginPath(); g.moveTo(200, 476); g.quadraticCurveTo(190, 300, 236, 236); g.quadraticCurveTo(300, 190, 364, 236); g.quadraticCurveTo(410, 300, 400, 476); g.closePath(); g.fill();   /* her hair */
  g.fillStyle = '#ece8e0'; g.beginPath(); g.ellipse(300, 330, 62, 80, 0, 0, Math.PI*2); g.fill();   /* where the face should be */
  g.strokeStyle = '#2a2826'; g.lineWidth = 3; g.beginPath(); g.moveTo(268, 372); g.quadraticCurveTo(300, 394, 332, 372); g.stroke(); g.fillStyle = '#f6f4ee'; g.beginPath(); g.moveTo(272, 374); g.quadraticCurveTo(300, 390, 328, 374); g.quadraticCurveTo(300, 382, 272, 374); g.fill();   /* only her smile */
  g.fillStyle = '#3a3634'; g.beginPath(); g.moveTo(206, 476); g.quadraticCurveTo(300, 420, 394, 476); g.closePath(); g.fill();
  for (let i = 0; i < 900; i++) { const px = 156 + hsh(i, 7)*288, py = 188 + hsh(i, 8)*288; g.fillStyle = `rgba(20,18,16,${hsh(i, 9)*0.25})`; g.fillRect(px, py, 2, 2); }
  g.fillStyle = '#2a2826'; T('???????????', 530, 26, 600); T('Last seen October 31st 2002.', 570, 28, 500);
  const para = ['The Department of Dream Analysis is', 'investigating the disappearance of the', 'faceless woman that stalks you in', 'your dreams. If you have any sightings', 'to report please call:'];
  para.forEach((l, i) => T(l, 612 + i*28, 24, 500));
  T('(555) 637-4921', 782, 32, 700);
  const rg = g.createLinearGradient(0, 0, W, H); rg.addColorStop(0, 'rgba(90,80,60,0.1)'); rg.addColorStop(0.6, 'rgba(90,80,60,0)'); rg.addColorStop(1, 'rgba(70,60,44,0.28)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);   /* damp, yellowed toward one corner */
  for (let j = 0; j < 7; j++) { g.strokeStyle = `rgba(80,70,56,${0.12 + hsh(j, 11)*0.12})`; g.lineWidth = 2 + hsh(j, 12)*3; g.beginPath(); const sx = 40 + j*80; g.moveTo(sx, 0); g.lineTo(sx + 4, 60 + hsh(j, 13)*140); g.stroke(); }   /* rain run */
  g.fillStyle = '#9a9690'; [[24, 18], [576, 18]].forEach(([a, b]) => { g.fillRect(a - 6, b - 1.5, 12, 3); });   /* staples */
  const t = tex(c, { clampEdge:true }); t.userData.m = [1, 1];
  const geo = new THREE.PlaneGeometry(0.33, 0.44, 6, 6), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const yy = p.getY(i); if (yy < -0.12) p.setZ(i, (yy + 0.12)*(yy + 0.12)*1.6); }   /* its bottom curling off the pole */
  geo.computeVertexNormals();
  const me = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map:t, roughness:0.95, side:THREE.DoubleSide })); me.position.set(x, y, z); me.rotation.y = ry; me.receiveShadow = true; scene.add(me);
  return me;
}
