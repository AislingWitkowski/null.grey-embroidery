/* ROOTS: where things meet the ground (Aisling, Nov 18: "things dont like connect in a natural way to the earth, like
   poles and such, like should they connet by disturning earth, or things to concrete have the slight ring barely able to
   see of concrete mixed?").
   Every place calls rootAll(scene, surfaceAt) once it's built. It finds everything that stands upright in the ground
   (poles, posts, trunks, column feet, legs: anything narrow and tall whose foot is at the ground) and gives it a footing:
   - in earth: dug, darker, damper soil round the foot, a low mound, a few pebbles turned up, the grass thinned;
   - in concrete or asphalt: a faint ring of concrete mixed and poured round it, a little paler, a hairline crack.
   Things can also be rooted by hand: ROOTS.add(x, z, r, kind). Moss patches: ROOTS.moss(x, z, r). */
import * as THREE from 'three';
import { inkRGB } from './inks.js';
import { tex } from './paint.js';

export const ROOTS = { list:[], moss:[], add(x, z, r, kind){ this.list.push({ x, z, r, kind }); }, addMoss(x, z, r){ this.moss.push({ x, z, r }); } };
const rgb = (r, t, a = 1) => { const c = inkRGB(r, t); return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')'; };
function rr(seed){ let s = (seed % 2147483646) + 1; return () => (s = (s*16807) % 2147483647)/2147483647; }

/* three decal pictures side by side: earth, concrete, moss. each is round, fading out at its edge */
function decalAtlas(){
  const W = 256, cv = document.createElement('canvas'); cv.width = W*3; cv.height = W; const c = cv.getContext('2d'), R = rr(77);
  const soft = (x0, col0, col1) => { const g = c.createRadialGradient(x0 + W/2, W/2, W*0.08, x0 + W/2, W/2, W/2); g.addColorStop(0, col0); g.addColorStop(0.55, col1); g.addColorStop(1, 'rgba(0,0,0,0)'); return g; };
  /* earth: the foot's dark damp ring, soil scuffed outward, pebbles */
  c.fillStyle = soft(0, rgb('hwood', 0.07, 1), rgb('hwood', 0.13, 0.8)); c.fillRect(0, 0, W, W);
  for (let i = 0; i < 900; i++) { const a = R()*6.283, d = Math.pow(R(), 0.6)*W*0.46, x = W/2 + Math.cos(a)*d, y = W/2 + Math.sin(a)*d, k = 1 - d/(W*0.5);
    c.fillStyle = R() < 0.5 ? rgb('hwood', 0.08 + R()*0.14, 0.5*k) : rgb('holive', 0.12 + R()*0.1, 0.35*k); c.fillRect(x, y, 2 + R()*3, 1.5 + R()*2); }
  for (let i = 0; i < 26; i++) { const a = R()*6.283, d = W*(0.12 + R()*0.3), x = W/2 + Math.cos(a)*d, y = W/2 + Math.sin(a)*d, s = 2 + R()*4;
    c.fillStyle = rgb('hgrey', 0.32 + R()*0.25, 0.9*(1 - d/(W*0.5))); c.beginPath(); c.ellipse(x, y, s, s*0.7, R()*3, 0, 6.283); c.fill(); }   /* pebbles turned up */
  /* concrete: a faint poured ring, slightly paler than what's round it, with a hairline crack and grit */
  const X1 = W;
  c.save(); c.beginPath(); c.arc(X1 + W/2, W/2, W*0.36, 0, 6.283); c.clip();
  c.fillStyle = rgb('hgrey', 0.6, 0.5); c.fillRect(X1, 0, W, W);
  for (let i = 0; i < 1400; i++) { const x = X1 + R()*W, y = R()*W; c.fillStyle = R() < 0.5 ? rgb('hgrey', 0.35 + R()*0.3, 0.35) : rgb('hcream', 0.5, 0.18); c.fillRect(x, y, 1.5, 1.5); }   /* the mix's grit */
  c.restore();
  c.strokeStyle = rgb('hgrey', 0.3, 0.45); c.lineWidth = 2.2; c.beginPath(); c.arc(X1 + W/2, W/2, W*0.36, 0, 6.283); c.stroke();   /* its edge, where it meets the old surface */
  c.strokeStyle = rgb('hgrey', 0.2, 0.55); c.lineWidth = 1.2; c.beginPath(); let px = X1 + W/2 + W*0.12, py = W/2; c.moveTo(px, py);
  for (let i = 0; i < 9; i++) { px += 6 + R()*5; py += (R() - 0.5)*9; c.lineTo(px, py); } c.stroke();   /* a hairline crack running off */
  const g2 = c.createRadialGradient(X1 + W/2, W/2, W*0.06, X1 + W/2, W/2, W*0.18); g2.addColorStop(0, rgb('hwood', 0.12, 0.45)); g2.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g2; c.fillRect(X1, 0, W, W);   /* grime right at the foot */
  /* moss: soft olive cushions, not a carpet */
  const X2 = W*2;
  for (let i = 0; i < 70; i++) { const a = R()*6.283, d = Math.pow(R(), 0.8)*W*0.36, x = X2 + W/2 + Math.cos(a)*d, y = W/2 + Math.sin(a)*d, s = 6 + R()*16;
    const g = c.createRadialGradient(x, y, 0, x, y, s); g.addColorStop(0, rgb('holive', 0.34 + R()*0.18, 0.8)); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - s, y - s, s*2, s*2); }
  for (let i = 0; i < 500; i++) { const a = R()*6.283, d = Math.pow(R(), 0.8)*W*0.36, x = X2 + W/2 + Math.cos(a)*d, y = W/2 + Math.sin(a)*d; c.fillStyle = rgb('holive', 0.25 + R()*0.3, 0.55); c.fillRect(x, y, 1.5, 1.5); }
  return tex(cv, { clampEdge:true });
}

/* find what stands in the ground: narrow and tall, its foot at the surface */
function findUpright(scene, surfaceAt){
  const out = [], B = new THREE.Box3(), seen = new Set();
  scene.updateMatrixWorld(true);
  scene.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || !o.visible || o.userData.noRoot) return;
    for (let p = o.parent; p; p = p.parent) if (!p.visible || p.userData.noRoot) return;
    B.setFromObject(o); const sx = B.max.x - B.min.x, sz = B.max.z - B.min.z, sy = B.max.y - B.min.y;
    if (sx > 0.5 || sz > 0.5 || sx < 0.02 || sz < 0.02 || sy < 0.6) return;
    const x = (B.min.x + B.max.x)/2, z = (B.min.z + B.max.z)/2, s = surfaceAt(x, z);
    if (!s || B.min.y > s.y + 0.06 || B.min.y < s.y - 1.4 || B.max.y < s.y + 0.5) return;
    const key = Math.round(x*20) + ',' + Math.round(z*20); if (seen.has(key)) return; seen.add(key);
    out.push({ x, z, r:Math.max(sx, sz)/2, kind:s.kind });
  });
  return out;
}

export function rootAll(scene, surfaceAt){
  const all = findUpright(scene, surfaceAt).concat(ROOTS.list.map(r => ({ ...r, kind:r.kind || (surfaceAt(r.x, r.z) || {}).kind || 'earth' })));
  const atlas = decalAtlas(), R = rr(311);
  const decalM = new THREE.MeshStandardMaterial({ map:atlas, transparent:true, depthWrite:false, roughness:0.95, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3 });
  decalM.userData.noDetail = true;
  const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI/2);
  const decals = [...all.map(r => ({ x:r.x, z:r.z, s:r.kind === 'earth' ? r.r*2.4 + 0.7 + R()*0.3 : r.r*2.4 + 0.3 + R()*0.1, k:r.kind === 'earth' ? 0 : 1 })),
    ...ROOTS.moss.map(m => ({ x:m.x, z:m.z, s:m.r*2, k:2 }))];
  if (decals.length) {
    const im = new THREE.InstancedMesh(g, decalM, decals.length), M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const off = new Float32Array(decals.length);
    decals.forEach((d, i) => { const s = surfaceAt(d.x, d.z) || { y:0 }; e.set(0, R()*6.283, 0); q.setFromEuler(e); M4.compose(new THREE.Vector3(d.x, s.y + 0.008, d.z), q, new THREE.Vector3(d.s, 1, d.s)); im.setMatrixAt(i, M4); off[i] = d.k; });
    g.setAttribute('aK', new THREE.InstancedBufferAttribute(off, 1));
    decalM.onBeforeCompile = sh => { sh.vertexShader = 'attribute float aK;\n' + sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n vMapUv = vec2((vMapUv.x + aK)/3.0, vMapUv.y);'); };
    decalM.customProgramCacheKey = () => 'root-decal';
    im.receiveShadow = true; im.renderOrder = 1; im.userData.noRoot = true; scene.add(im);
  }
  /* the earth ones: a low mound of turned soil round the foot */
  const earth = all.filter(r => r.kind === 'earth');
  if (earth.length) {
    const pts = [[0, 0.045], [0.4, 0.04], [0.75, 0.018], [1, 0]].map(p => new THREE.Vector2(p[0], p[1]));
    const mg = new THREE.LatheGeometry(pts, 14);
    const mm = new THREE.MeshStandardMaterial({ color:new THREE.Color().setRGB(...inkRGB('hwood', 0.16).map(v => v/255), THREE.SRGBColorSpace), roughness:1 });
    const im = new THREE.InstancedMesh(mg, mm, earth.length), M4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    earth.forEach((r, i) => { const s = surfaceAt(r.x, r.z) || { y:0 }, w = r.r + 0.16 + R()*0.08; M4.compose(new THREE.Vector3(r.x, s.y - 0.015, r.z), q, new THREE.Vector3(w, 0.7 + R()*0.6, w)); im.setMatrixAt(i, M4); });
    im.receiveShadow = true; im.userData.noRoot = true; scene.add(im);
  }
  return all;
}
