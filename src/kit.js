/* ================================================================
   EMBROIDERY · the kit: small reusable pieces in the style, so building a place is mostly arranging.
   boxes textured in world metres (so a 6 m wall shows its texture at the right size), solids for walking into,
   round things turned on a lathe, and grass, weeds and corn as real clumps that move in the wind.
   ================================================================ */
import * as THREE from 'three';
import { hsh } from './paint.js';

export const K = { scene:null, solids:[], wind:{ uTime:{ value:0 }, uGust:{ value:0 } }, statics:[] };
export function kitInit(scene){ K.scene = scene; K.solids = []; }

export function mat(map, o = {}){
  const m = new THREE.MeshStandardMaterial({ map, roughness:o.rough == null ? 0.93 : o.rough, metalness:o.metal || 0, color:o.color || 0xffffff,
    transparent:!!o.transparent, alphaTest:o.cut || 0, side:o.two ? THREE.DoubleSide : THREE.FrontSide,
    emissive:o.emit ? new THREE.Color(o.emit) : new THREE.Color(0), emissiveMap:o.emitMap || null, emissiveIntensity:o.emitK == null ? 1 : o.emitK });
  m.userData.m = o.m || (map && map.userData.m) || [1, 1];
  if (map && map.userData.normal && o.nrm !== 0) { m.normalMap = map.userData.normal; m.normalScale = new THREE.Vector2(o.nrm || 1, o.nrm || 1); }
  if (map && map.userData.rough) { m.roughnessMap = map.userData.rough; m.roughness = 1; }
  return m;
}
/* a texture's size in metres (how much world one copy of it covers) */
export function sized(t, mw, mh){ t.userData.m = [mw, mh]; return t; }

/* scale a box's uvs so every face shows its texture at true size */
function worldUV(g, w, h, d, mats){
  const uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) {
    const M = Array.isArray(mats) ? mats[f] : mats, m = (M && M.userData.m) || [1, 1];
    for (let i = 0; i < 4; i++) { const k = f*4 + i; uv.setXY(k, uv.getX(k)*dims[f][0]/m[0], uv.getY(k)*dims[f][1]/m[1]); }
  }
  uv.needsUpdate = true;
}
/* a box from x0..x1, y0..y1, z0..z1. mats: one material or six (+x, -x, +y, -y, +z, -z). solid: you can't walk through it */
export function box(x0, x1, y0, y1, z0, z1, mats, o = {}){
  const w = x1 - x0, h = y1 - y0, d = z1 - z0, g = new THREE.BoxGeometry(w, h, d);
  worldUV(g, w, h, d, mats);
  if (o.flipU) { const uv = g.attributes.uv, dims = [d, d, w, w, w, w];   /* faces whose picture should run the other way (so the station's bays land where Seam has them) */
    for (const f of o.flipU) { const M = Array.isArray(mats) ? mats[f] : mats, mu = dims[f]/((M && M.userData.m) || [1])[0]; for (let i = 0; i < 4; i++) { const k = f*4 + i; uv.setX(k, mu - uv.getX(k)); } } }
  if (o.uvOff) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) + o.uvOff[0], uv.getY(i) + o.uvOff[1]); }
  const me = new THREE.Mesh(g, mats); me.position.set((x0 + x1)/2, (y0 + y1)/2, (z0 + z1)/2);
  me.castShadow = o.cast !== false; me.receiveShadow = true; K.scene.add(me);
  if (o.solid !== false) K.solids.push({ x0, x1, y0, y1, z0, z1 });
  return me;
}
/* a turned thing (a column, a lamp shade): profile [[r, y], ...] */
export function lathe(prof, m, x, y, z, seg = 10, o = {}){
  const g = new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p[0], p[1])), seg);
  const me = new THREE.Mesh(g, m); me.position.set(x, y, z); me.castShadow = o.cast !== false; me.receiveShadow = true; K.scene.add(me); return me;
}
export function plane(w, h, m, x, y, z, ry = 0, o = {}){
  const g = new THREE.PlaneGeometry(w, h); const mm = m.userData.m;
  if (o.world) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i)*w/mm[0], uv.getY(i)*h/mm[1]); }
  const me = new THREE.Mesh(g, m); me.position.set(x, y, z); me.rotation.y = ry; me.castShadow = o.cast !== false; me.receiveShadow = true; K.scene.add(me); return me;
}
/* a wire hanging between two points, sagging */
export function wire(a, b, sag, m, r = 0.01){
  const pts = []; for (let i = 0; i <= 16; i++) { const t = i/16; pts.push(new THREE.Vector3(a[0] + (b[0] - a[0])*t, a[1] + (b[1] - a[1])*t - sag*4*t*(1 - t), a[2] + (b[2] - a[2])*t)); }
  const me = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, r, 3, false), m); me.castShadow = false; K.scene.add(me); return me;
}

/* ---------------- grass, weeds, corn: clumps of crossed cards, many variants, moving in the wind ----------------
   mostly still, now and then a slow gust (Missing Mile's gusts, doc 32). the cards take the ground's light (their
   normals point up), so a clump sits in its patch of light instead of reading as a flat card. */
function cardGeo(n, h){
  const pos = [], uv = [], nor = [], idx = [];
  for (let k = 0; k < n; k++) {
    const a = k*Math.PI/n, cx = Math.cos(a)*0.5, cz = Math.sin(a)*0.5, b = pos.length/3;
    pos.push(-cx, 0, -cz, cx, 0, cz, cx, h, cz, -cx, h, -cz); uv.push(0, 0, 1, 0, 1, 1, 0, 1); for (let i = 0; i < 4; i++) nor.push(0, 1, 0);
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setIndex(idx); return g;
}
function windMat(map, stiff){
  const m = new THREE.MeshStandardMaterial({ map, alphaTest:0.5, side:THREE.DoubleSide, roughness:1 }); m.userData.noDetail = true;
  m.onBeforeCompile = s => {
    s.uniforms.uTime = K.wind.uTime; s.uniforms.uGust = K.wind.uGust;
    s.vertexShader = 'attribute float aVar; uniform float uTime; uniform float uGust;\n' + s.vertexShader
      .replace('#include <uv_vertex>', '#include <uv_vertex>\n vMapUv.x = vMapUv.x*0.25 + aVar*0.25;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n' +
        ' { vec3 ip = instanceMatrix[3].xyz; float hk = position.y*position.y;\n' +
        '   float sway = sin(uTime*1.1 + ip.x*0.45 + ip.z*0.31)*0.5 + sin(uTime*2.3 + ip.x*1.7)*0.18;\n' +   /* slow: well under three a second */
        '   float push = (0.012 + uGust*0.11)*' + stiff.toFixed(3) + '*hk;\n' +
        '   vec3 wd = inverse(mat3(instanceMatrix))*vec3(0.85, 0.0, 0.5);\n' +
        '   transformed += wd*(push*(0.6 + sway)); }');
  };
  return m;
}
/* items: [[x, y, z, scale, rot, variant], ...] → one instanced field, split into tiles so only what's in view is drawn */
export function clumps(items, map, n, h, stiff, tile = 10){
  const g0 = cardGeo(n, h), mat = windMat(map, stiff), groups = {};
  for (const it of items) { const k = Math.floor(it[0]/tile) + ',' + Math.floor(it[2]/tile); (groups[k] = groups[k] || []).push(it); }
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (const k in groups) {
    const L = groups[k], g = g0.clone(), vars = new Float32Array(L.length);
    const im = new THREE.InstancedMesh(g, mat, L.length);
    L.forEach((it, i) => { e.set(0, it[4], 0); q.setFromEuler(e); M.compose(new THREE.Vector3(it[0], it[1], it[2]), q, new THREE.Vector3(it[3], it[3]*(it[6] || 1), it[3])); im.setMatrixAt(i, M); vars[i] = it[5]; });
    g.setAttribute('aVar', new THREE.InstancedBufferAttribute(vars, 1));
    im.castShadow = false; im.receiveShadow = true; im.computeBoundingSphere(); K.scene.add(im);
  }
}
export function cyl(r0, r1, h, m, x, y, z, seg = 8, o = {}){
  const me = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, h, seg, 1, !!o.open), m); me.position.set(x, y + h/2, z);
  if (o.rx) me.rotation.x = o.rx; if (o.rz) me.rotation.z = o.rz; me.castShadow = o.cast !== false; me.receiveShadow = true; K.scene.add(me); return me;
}
export function rnd(seed){ let s = (seed % 2147483646) + 1; return () => (s = (s*16807) % 2147483647)/2147483647; }
