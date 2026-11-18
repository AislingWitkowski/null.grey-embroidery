/* ================================================================
   EMBROIDERY · MISSING MILE, everything else the Seam version has (Nov 17, evening; Aisling: "we will move all those
   over then we will update them all to embroidery graphics", and "all the little things too … please do a sweep and
   make sure we don't miss anything!"). Each piece stands where Seam has it (Seam's map: x east, y south → here z),
   built the way Seam's last pass built it (f03-3d2 … 3d4, f03-things, f03-details):
   - the four trees, four times of autumn (f03-3d3): a leaning, forking trunk, limbs, twigs; the leaves in loose
     bunches along them; their leaves on the ground round them.
   - the windmill far out in the corn, much too tall, its wheel still, MAPLES & SONS on its vane (f03-paint, f03-3d3).
   - the crossbuck: two real boards crossed on a post, lettered both sides, the 踏切 plate under them (f03-3d4).
   - the mileage sign, MISSING MILE 1, and the same sign again further down; the mailbox with no house (f03-things).
   - the cut pole hanging from its own wires, and the newer pole beside it with the transformer can (f03-3d3, 3d4).
   - old street lamps on three of the road's poles: one lit dim, one burnt out, one weak (f03-3d4).
   - the tunnel mouth where the line goes into the ground east of the platform (f03-paint), the corn on top of it.
   - on the shed: FEED · SEED · BAIT, and the tobacco window (f03-things).
   - the poles' little tags and climbing steps (f03-3d3).
   Pictures with words on them are Seam's own (FPIC, through the bridge), word for word.
   ================================================================ */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { K, mat, box, lathe, plane, wire, cyl, seamTex, rnd } from './kit.js';
import { vn, fbm, frac, clamp, sm, tex, paint } from './paint.js';
import { inkRGB } from './inks.js';
import { F3_SAYS, F3_WALL } from './f03-says.js';

/* Seam's deep reds (hblood, from null.grey-furusatostation's RAMP_SRC) for the leaves only: Embroidery's ink grade keeps its own ramps */
const HBLOOD = ['#120202','#220404','#340606','#470909','#5b0b0b','#700e0d','#851211','#9a1715','#ae1f1a','#c22b22','#d4463a','#e47466'];
const col = (r, t) => { if (r === 'hblood') return HBLOOD[Math.max(0, Math.min(11, Math.round(t*11)))]; const c = inkRGB(r, t); return 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')'; };
const pick = A => A[(Math.random()*A.length) | 0];

/* where the corn must not stand (round the windmill's feet, the trees out in it); and the bank over the tunnel */
export const TUN = { x:40.0, zc:2.0, hw:1.4, spring:2.15, bank:3.4 };   /* (the arch fits the train, real size: 1.8 m wide, its roof 2.45 m over the platform) */
export function cornClear(x, z){
  if (Math.abs(x - 47.6) < 0.9 && Math.abs(z - 20.4) < 0.9) return true;
  if (Math.hypot(x - 45.5, z - 15.5) < 1.1) return true;
  return false;
}
export function onTunnelRoof(x, z){ return x > TUN.x + 0.45 && Math.abs(z - TUN.zc) < TUN.hw + 0.8; }

/* a rod from a to b, tapering r0 → r1, as geometry (to be merged) */
function rodGeo(a, b, r0, r1, seg = 6){
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), len = d.length();
  const g = new THREE.CylinderGeometry(r1, r0, len, seg, 1, true); g.translate(0, len/2, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  g.applyQuaternion(q); g.translate(A.x, A.y, A.z); return g;
}
function meshOf(geos, m, o = {}){
  const me = new THREE.Mesh(mergeGeometries(geos.map(g => g.index ? g.toNonIndexed() : g)), m);
  me.castShadow = o.cast !== false; me.receiveShadow = true; K.scene.add(me); return me;
}
function cvTex(w, h, draw, clampEdge = true){
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h);
  const t = tex(cv, { clampEdge }); return t;
}
/* a Seam picture as a material covering one face exactly (not tiled) */
function picM(name, ppu, fb, o = {}){
  const t = seamTex(name, ppu, fb), m = new THREE.MeshStandardMaterial({ map:t, roughness:o.rough == null ? 0.85 : o.rough, transparent:false, alphaTest:o.cut ? 0.5 : 0, side:o.two ? THREE.DoubleSide : THREE.FrontSide,
    emissive:o.emit ? new THREE.Color(o.emit) : new THREE.Color(0), emissiveMap:o.emit ? t : null, emissiveIntensity:o.emitK || 1 });
  m.userData.m = o.m || [1, 1]; return m;
}

export function buildMore(C){
  const { scene, M, T, tag, groundAt, halo, L } = C;
  const R = rnd(9177);
  const barkT = T.woodD.clone(); barkT.repeat.set(3, 1.2); barkT.needsUpdate = true;
  barkT.userData = {}; if (T.woodD.userData.normal) { const n = T.woodD.userData.normal.clone(); n.userData = {}; n.repeat.set(3, 1.2); n.needsUpdate = true; barkT.userData.normal = n; }   /* (a texture's clone turns its userData into plain copies: give it real ones) */
  const bark = mat(barkT, { color:0xb8aaa0 }); bark.userData.m = [1, 1];
  const ironR = mat(T.iron, { color:0x9a6a50 }), greyP = mat(null, { color:0x8a857e }); greyP.userData.m = [1, 1];
  const earth = mat(paint(256, 256, 2, 2, (x, y) => [fbm(x*2, y*2) > 0.55 ? 'hwood' : 'hrust', 0.14 + 0.08*vn(x*12, y*12) + 0.04*vn(x*40, y*40), 1, null, 1], { nrm:1 }));
  const TK = { sway:[] };

  /* ================= the trees: four, four times of autumn (Seam's TREES, its LEAF palettes) ================= */
  const LEAF = [
    { p:[['hgold', 0.5], ['hamber', 0.5], ['hamber', 0.4], ['hrust', 0.5], ['holive', 0.45], ['hgold', 0.4], ['hrust', 0.42], ['hamber', 0.58]], n:86, rb:[0.36, 0.6], ground:260 },   /* the gold one, a little olive left */
    { p:[['hrust', 0.46], ['hrust', 0.36], ['hblood', 0.38], ['hblood', 0.48], ['hamber', 0.44], ['hrust', 0.56], ['hwood', 0.42], ['hamber', 0.36]], n:86, rb:[0.36, 0.6], ground:340 },  /* its height: rust, deep reds, burnt orange */
    { p:[['hrust', 0.38], ['hwood', 0.46], ['hamber', 0.4], ['hrust', 0.46], ['hblood', 0.34], ['hwood', 0.38]], n:40, rb:[0.26, 0.42], ground:600 },   /* late: half bare, browning */
    { p:[['hwood', 0.42], ['hrust', 0.36], ['hamber', 0.34], ['hwood', 0.34]], n:9, rb:[0.16, 0.26], ground:820 },   /* nearly bare */
  ];
  /* each palette's leaves: 16 to an atlas, four shapes (maple, oval, long, round with a wavy edge), each its own colour,
     a darker rib, a dried edge */
  function leafAtlas(L){
    return cvTex(256, 256, (c) => { const lr = rnd(31 + L.n);
      for (let k = 0; k < 16; k++) { const ox = (k % 4)*64 + 32, oy = Math.floor(k/4)*64 + 32, P = L.p[k % L.p.length], sh = k % 4, t = P[1] + (lr() - 0.5)*0.14;
        c.save(); c.translate(ox, oy); c.rotate(lr()*6.28); c.fillStyle = col(P[0], t); c.beginPath();
        if (sh === 0) { for (let i = 0; i <= 10; i++) { const a = i/10*Math.PI*2, r = (i % 2 ? 12 : 27) + lr()*3; c.lineTo(Math.cos(a)*r, Math.sin(a)*r); } }
        else if (sh === 1) c.ellipse(0, 0, 25, 15, 0, 0, Math.PI*2);
        else if (sh === 2) c.ellipse(0, 0, 28, 9, 0, 0, Math.PI*2);
        else for (let i = 0; i <= 24; i++) { const a = i/24*Math.PI*2, r = 20 + 3*Math.sin(a*7); c.lineTo(Math.cos(a)*r, Math.sin(a)*r); }
        c.fill(); c.strokeStyle = col(P[0], t*0.55); c.lineWidth = 3; c.stroke();   /* the dried edge */
        c.strokeStyle = col(P[0], t*0.6); c.lineWidth = 1.6; c.beginPath(); c.moveTo(-24, 0); c.lineTo(22, 0); c.stroke();   /* the rib */
        for (let i = 0; i < 14; i++) { c.fillStyle = col('hwood', 0.18 + lr()*0.12); c.fillRect(-16 + lr()*32, -8 + lr()*16, 2, 2); }
        c.restore(); }
    });
  }
  function leafMat(map){
    const m = new THREE.MeshStandardMaterial({ map, alphaTest:0.5, roughness:0.85, side:THREE.DoubleSide }); m.userData.noDetail = true;
    m.onBeforeCompile = sh => { sh.vertexShader = 'attribute float aVar;\n' + sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n vMapUv = vMapUv*0.25 + vec2(mod(aVar, 4.0), floor(aVar/4.0))*0.25;'); };
    return m;
  }
  function leafField(items, m, flat){
    const g = new THREE.PlaneGeometry(1, 1); if (flat) g.rotateX(-Math.PI/2);
    const im = new THREE.InstancedMesh(g, m, items.length), M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new Float32Array(items.length);
    items.forEach((it, i) => { e.set(it[4], it[5], it[6]); q.setFromEuler(e); M4.compose(new THREE.Vector3(it[0], it[1], it[2]), q, new THREE.Vector3(it[3], it[3], it[3])); im.setMatrixAt(i, M4); v[i] = it[7]; });
    g.setAttribute('aVar', new THREE.InstancedBufferAttribute(v, 1)); im.castShadow = !flat; im.receiveShadow = true; im.computeBoundingSphere(); scene.add(im); return im;
  }
  function tree(tx, tz, ph, seed, say){
    const Rt = rnd(seed*97 + 5), Lf = LEAF[ph], gy = groundAt(tx, tz) - 0.05, H1 = 1.3 + Rt()*0.5, tl = (Rt() - 0.5)*0.16, tlx = tl*Math.cos(seed), tlz = tl*Math.sin(seed);
    const geos = [], sites = [], m = leafMat(leafAtlas(Lf));
    const trunkTop = [tx + tlx*H1, gy + H1, tz + tlz*H1];
    geos.push(rodGeo([tx, gy - 0.1, tz], [tx + tlx*0.2, gy + 0.18, tz + tlz*0.2], 0.3, 0.21, 10), rodGeo([tx + tlx*0.2, gy + 0.18, tz + tlz*0.2], trunkTop, 0.21, 0.15, 10));
    const site = (A, B, f) => sites.push([A[0] + (B[0] - A[0])*f, A[1] + (B[1] - A[1])*f, A[2] + (B[2] - A[2])*f]);
    const limb = (A, len, lx, lz, r0, r1) => { const B = [A[0] + lx*len, A[1] + len, A[2] + lz*len]; geos.push(rodGeo(A, B, r0, r1, r0 > 0.05 ? 8 : 5)); return B; };
    const nL = ph >= 2 ? 4 : 3, a0 = Rt()*6.283;
    for (let i = 0; i < nL; i++) { const ang = a0 + i*6.283/nL + (Rt() - 0.5)*0.6, mm = 0.45 + Rt()*0.3, P0 = [trunkTop[0], trunkTop[1] - 0.15, trunkTop[2]];
      const E = limb(P0, 1.3 + Rt()*0.7, Math.cos(ang)*mm, Math.sin(ang)*mm, 0.12, 0.06);
      if (ph < 2) { site(P0, E, 0.55); site(P0, E, 0.85); }
      const nb = ph >= 2 ? 3 : 2;
      for (let j = 0; j < nb; j++) { const a2 = ang + (j - (nb - 1)/2)*0.9 + (Rt() - 0.5)*0.4, m2 = 0.55 + Rt()*0.45, P1 = [E[0], E[1] - 0.05, E[2]];
        const E2 = limb(P1, 0.8 + Rt()*0.5, Math.cos(a2)*m2, Math.sin(a2)*m2, 0.055, 0.02);
        for (const f of [0.25, 0.5, 0.8, 1.05]) site(P1, E2, f);
        for (let w = 0; w < (ph === 2 ? 1 : 2); w++) { const a3 = a2 + (w - 0.5)*1.1 + (Rt() - 0.5)*0.5, m3 = 0.7 + Rt()*0.6, P2 = [E2[0], E2[1] - 0.03, E2[2]];
          const E3 = limb(P2, 0.45 + Rt()*0.4, Math.cos(a3)*m3, Math.sin(a3)*m3, 0.024, 0.008);   /* its twigs */
          for (const f of [0.35, 0.75, 1.1, 1.4]) site(P2, E3, f); }   /* (and past the twig's end: a shaggy outline) */
      } }
    tag(meshOf(geos, bark), say); K.solids.push({ x0:tx - 0.28, x1:tx + 0.28, y0:gy - 1, y1:gy + H1, z0:tz - 0.28, z1:tz + 0.28 });
    for (let k = sites.length - 1; k > 0; k--) { const s = Math.floor(Rt()*(k + 1)); [sites[k], sites[s]] = [sites[s], sites[k]]; }   /* (which sites get leaves: at random, so no two trees match) */
    const lv = [];
    for (let t = 0; t < Math.min(Lf.n, sites.length); t++) { const S = sites[t], r = Lf.rb[0] + Rt()*(Lf.rb[1] - Lf.rb[0]), cx = S[0] + (Rt() - 0.5)*0.85, cy = S[1] - 0.1 + (Rt() - 0.5)*0.45, cz = S[2] + (Rt() - 0.5)*0.85;
      const n = Math.round(30 + 120*r*r);
      for (let i = 0; i < n; i++) { const u = Rt()*2 - 1, a = Rt()*6.283, d = Math.cbrt(Rt()), s = Math.sqrt(1 - u*u);   /* a loose bunch, thinning at its edge */
        if (d > 0.8 && Rt() < 0.5) continue;
        lv.push([cx + Math.cos(a)*s*d*r, cy + u*d*r*0.75, cz + Math.sin(a)*s*d*r, 0.1 + Rt()*0.07, Rt()*6.3, Rt()*6.3, Rt()*6.3, Math.floor(Rt()*16)]); } }
    if (lv.length) tag(leafField(lv, m, false), say);
    const gl = [];   /* its leaves on the ground round it, thicker near the trunk */
    for (let i = 0; i < Lf.ground; i++) { const a = Rt()*6.283, d = 0.3 + Math.pow(Rt(), 0.7)*3.2, x = tx + Math.cos(a)*d*1.1, z = tz + Math.sin(a)*d;
      if (x > 8.9 && x < 32.1 && z > 2.9 && z < 8.05) continue;   /* (not into the platform) */
      gl.push([x, groundAt(x, z) + 0.006 + Rt()*0.004, z, 0.1 + Rt()*0.06, (Rt() - 0.5)*0.3, Rt()*6.3, (Rt() - 0.5)*0.3, Math.floor(Rt()*16)]); }
    leafField(gl, m, true);
  }
  [[4.6, 6.0, 1, 7, 'tree'], [36.8, 6.2, 0, 19, 'tree'], [45.5, 15.5, 2, 23, 'treeF'], [14.0, 19.0, 3, 37, 'treeF']].forEach(t => tree(t[0], t[1], t[2], t[3], t[4]));

  /* ================= the windmill, far out in the corn: a lattice tower going up and up, a small tank partway, the
     wheel of blades at the top, still; its vane lettered once. (Seam's f3Windmill, in the round) ================= */
  (function windmill(){
    const WX = 47.6, WZ = 20.4, g0 = groundAt(WX, WZ) - 0.1, top = 8.0, geos = [];
    const hw = h => 0.62 - 0.47*clamp((h - 1.6)/(top - 1.6), 0, 1);
    const corner = (sx, sz, h) => [WX + sx*hw(h), g0 + h, WZ + sz*hw(h)];
    const CN = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    for (const [sx, sz] of CN) { geos.push(rodGeo([WX + sx*0.62, g0 - 0.2, WZ + sz*0.62], corner(sx, sz, 1.6), 0.035, 0.035, 5), rodGeo(corner(sx, sz, 1.6), corner(sx, sz, top), 0.035, 0.022, 5)); }
    for (let h = 1.6; h < top - 0.4; h += 0.85) for (let k = 0; k < 4; k++) { const A = CN[k], B = CN[(k + 1) % 4];
      geos.push(rodGeo(corner(A[0], A[1], h), corner(B[0], B[1], h), 0.012, 0.012, 4));   /* its rings */
      geos.push(rodGeo(corner(A[0], A[1], h), corner(B[0], B[1], h + 0.85), 0.01, 0.01, 4), rodGeo(corner(B[0], B[1], h), corner(A[0], A[1], h + 0.85), 0.01, 0.01, 4)); }   /* the braces crossing */
    geos.push(rodGeo([WX, g0 + 1.6, WZ], [WX, g0 + 8.62, WZ], 0.018, 0.018, 4));   /* the pump rod */
    const blk = mat(T.iron, { color:0x4a403a }); tag(meshOf(geos, blk), 'windmill');
    tag(cyl(0.36, 0.36, 0.85, mat(T.tinG, { color:0x8a5a40 }), WX, g0 + 4.1, WZ, 12), 'windmill');   /* the tank */
    box(WX - 0.32, WX + 0.32, g0 + top, g0 + top + 0.07, WZ - 0.32, WZ + 0.32, blk, { solid:false });   /* the platform */
    /* the head: the wheel faces north-west (toward the station and the road), the tail out behind it */
    const head = new THREE.Group(); head.position.set(WX, g0 + 8.62, WZ); head.rotation.y = Math.PI*0.25 + Math.PI/2; scene.add(head);
    const wheelT = cvTex(256, 256, (c) => { c.translate(128, 128);
      for (let i = 0; i < 18; i++) { c.save(); c.rotate(i/18*Math.PI*2); c.fillStyle = col('hcream', 0.5 + 0.08*(i % 3)); c.beginPath(); c.moveTo(-6, 42); c.lineTo(6, 42); c.lineTo(15, 124); c.lineTo(-13, 124); c.closePath(); c.fill(); c.restore(); }
      c.strokeStyle = col('hrust', 0.26); c.lineWidth = 5; for (const r of [82, 122]) { c.beginPath(); c.arc(0, 0, r, 0, Math.PI*2); c.stroke(); }
      c.fillStyle = col('hrust', 0.26); c.beginPath(); c.arc(0, 0, 18, 0, Math.PI*2); c.fill(); });
    const wm = new THREE.MeshStandardMaterial({ map:wheelT, alphaTest:0.5, side:THREE.DoubleSide, roughness:0.9 });
    const wh = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 1.36), wm); wh.castShadow = true; head.add(wh); tag(wh, 'windmill');
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 1.2), blk); arm.position.z = -0.62; head.add(arm);
    const vaneT = cvTex(256, 128, (c) => { c.fillStyle = col('hcream', 0.48); c.beginPath(); c.moveTo(0, 34); c.lineTo(256, 4); c.lineTo(256, 124); c.lineTo(0, 94); c.closePath(); c.fill();
      c.fillStyle = col('hrust', 0.3); c.font = '900 30px Arial Black, Arial, sans-serif'; c.textAlign = 'center'; c.fillText('MAPLES', 132, 62); c.fillText('& SONS', 132, 96);
      for (let i = 0; i < 40; i++) { c.fillStyle = col('hwood', 0.2); c.fillRect(Math.random()*256, 20 + Math.random()*90, 3, 2); } });   /* (its old letters, as Seam's vane has them) */
    const vm = new THREE.MeshStandardMaterial({ map:vaneT, alphaTest:0.5, side:THREE.DoubleSide, roughness:0.9 });
    const vn2 = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.42), vm); vn2.rotation.y = Math.PI/2; vn2.position.z = -1.3; head.add(vn2); tag(vn2, 'windmill');
  })();

  /* ================= the crossbuck: two boards crossed on a post, lettered both sides, a small 踏切 plate ================= */
  (function crossbuck(){
    const PX = 37.94, PZ = 3.34, gy = groundAt(PX, PZ);
    const board = word => { const t = cvTex(480, 64, (c, w, h) => { c.fillStyle = '#e6e2d8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1c1511'; c.lineWidth = 5; c.strokeRect(5, 5, w - 10, h - 10);
        c.fillStyle = '#1c1511'; c.font = '900 36px Arial Black, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(word.split('').join(String.fromCharCode(8202)), w/2, h/2 + 2);
        c.globalAlpha = 0.5; c.strokeStyle = '#8a8378'; c.lineWidth = 2; for (const x of [60, 300, 400]) { c.beginPath(); c.moveTo(x, 6); c.lineTo(x + 6, 58); c.stroke(); }
        c.globalAlpha = 0.18; c.fillStyle = '#6a6058'; c.fillRect(0, 44, w, 20); c.fillStyle = '#8a8378'; c.fillRect(208, 0, 64, 64); });   /* weathered: a grey wash at the bottom, cracks down the paint */
      const m = new THREE.MeshStandardMaterial({ map:t, roughness:0.8 }); m.userData.m = [1.2, 0.16]; return m; };
    tag(lathe([[0, 0], [0.055, 0], [0.05, 0.3], [0.045, 3.0], [0.03, 3.06], [0, 3.06]], mat(T.woodD), PX, gy, PZ, 10), 'xbuck');
    K.solids.push({ x0:PX - 0.06, x1:PX + 0.06, y0:gy, y1:gy + 3, z0:PZ - 0.06, z1:PZ + 0.06 });
    const wd = mat(T.wood);
    [['RAILROAD', 0.7, 0], ['CROSSING', -0.7, 0.024]].forEach(([w, a, dz]) => { const bm = board(w), z = PZ - 0.07 - dz;
      const me = box(PX - 0.6, PX + 0.6, gy + 2.54, gy + 2.7, z - 0.011, z + 0.011, [wd, wd, wd, wd, bm, bm], { solid:false, flipU:[4] });
      me.rotation.z = a; tag(me, 'xbuck'); });   /* (the front faces the track; the lettering reads from both sides) */
    cyl(0.018, 0.018, 0.12, ironR, PX, gy + 2.62, PZ - 0.14, 6, { rx:Math.PI/2 }).position.set(PX, gy + 2.62, PZ - 0.08);   /* the bolt through both */
    const pt = cvTex(208, 88, (c, w, h) => { c.fillStyle = '#e6e2d8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1c1511'; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#1c1511'; c.font = '900 50px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('踏切', w/2, h/2 + 3); });
    const pm = new THREE.MeshStandardMaterial({ map:pt, roughness:0.8 }); pm.userData.m = [0.26, 0.11];
    tag(box(PX - 0.13, PX + 0.13, gy + 1.925, gy + 2.035, PZ - 0.075, PZ - 0.059, [greyP, greyP, greyP, greyP, pm, pm], { solid:false, flipU:[4] }), 'xbuck');
  })();

  /* ================= out along the road: the mileage sign, and further down the same sign again; a mailbox ================= */
  const signF = picM('f3mile', 260, '#46603e', { cut:true, m:[0.92, 0.46] }), signB = picM('f3signBack', 140, '#8a8580', { cut:true, m:[0.92, 0.46] }), edge = mat(null, { color:0x6c6864 });
  [12.2, 34.6].forEach(z => { const gy = groundAt(28.54, z + 0.03);
    tag(box(28.5, 28.58, gy - 0.1, gy + 2.05, z, z + 0.06, mat(T.woodD)), 'mile');
    tag(box(28.04, 28.96, gy + 1.6, gy + 2.06, z - 0.02, z, [edge, edge, edge, edge, signB, signF], { solid:false }), 'mile'); });
  (function mailbox(){
    const gy = groundAt(31.66, 20.24), bm = mat(T.tinG, { color:0x8a8682 });
    tag(box(31.62, 31.7, gy - 0.1, gy + 1.02, 20.2, 20.28, mat(T.woodD)), 'mail');
    box(31.52, 31.8, gy + 1.0, gy + 1.11, 20.0, 20.48, bm, { solid:false });
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.48, 14, 1, false, 0, Math.PI), bm); top.rotation.x = Math.PI/2; top.rotation.y = Math.PI/2; top.position.set(31.66, gy + 1.11, 20.24); top.castShadow = top.receiveShadow = true; scene.add(top); tag(top, 'mail');
    const sm2 = picM('f3mailS', 600, '#7a7672', { cut:true }), fm = picM('f3mailF', 600, '#7a7672', { cut:true });
    tag(plane(0.5, 0.25, sm2, 31.506, gy + 1.125, 20.24, -Math.PI/2, { cast:false }), 'mail'); tag(plane(0.5, 0.25, sm2, 31.814, gy + 1.125, 20.24, Math.PI/2, { cast:false }), 'mail');
    tag(plane(0.3, 0.25, fm, 31.66, gy + 1.125, 19.996, Math.PI, { cast:false }), 'mail');   /* its door, toward the station */
    box(31.81, 31.83, gy + 1.13, gy + 1.36, 20.36, 20.38, mat(null, { color:0x9a2a22 }), { solid:false }); box(31.81, 31.83, gy + 1.29, gy + 1.36, 20.38, 20.46, mat(null, { color:0x9a2a22 }), { solid:false });   /* its little red flag, up */
  })();

  /* ================= the cut pole, after Aisling's photo: hanging from its own wires, cut clean through low down, its
     foot well off the ground; a long crossarm near its top and a brace out to each side, insulators along the arm, a
     short bar near the very top with two more, one on its top; one wire broken loose off the end of the arm. it reads
     as a cross without anyone having meant it to. it sways a little when the wind comes over the corn ================= */
  (function cutPole(){
    const cx = 31.98, cz = 17.58, AZ = 6.43, g = new THREE.Group(), say = 'chopped';
    g.position.set(cx, AZ + 0.12, cz); scene.add(g);   /* (it hangs from the arm, where the wires hold it) */
    const cutT = cvTex(64, 64, (c, w, h) => { c.fillStyle = col('hwood', 0.5); c.fillRect(0, 0, w, h); c.strokeStyle = col('hwood', 0.38); for (let r = 4; r < 32; r += 3) { c.beginPath(); c.arc(32, 32, r, 0, Math.PI*2); c.stroke(); } });   /* the cut: pale raw wood, its rings */
    const prof = [[0, 2.35], [0.1, 2.35], [0.1, 2.5], [0.092, 6.0], [0.082, 7.2], [0.06, 7.26], [0, 7.26]].map(p => [p[0], p[1] - AZ - 0.12]);
    const pole = lathe(prof, mat(barkT, { color:0x9a9088 }), 0, 0, 0, 12); scene.remove(pole); g.add(pole); tag(pole, say);
    const cut = new THREE.Mesh(new THREE.CircleGeometry(0.098, 14), new THREE.MeshStandardMaterial({ map:cutT, roughness:0.9 })); cut.rotation.x = Math.PI/2; cut.position.y = 2.349 - AZ - 0.12; g.add(cut);
    const add = (geo, m) => { const me = new THREE.Mesh(geo, m); me.castShadow = true; me.receiveShadow = true; g.add(me); return me; };
    const wd = mat(T.woodD); const arm = add(new THREE.BoxGeometry(2.3, 0.12, 0.11), wd); arm.position.y = -0.06; tag(arm, say);   /* the long crossarm, across the road */
    for (const s of [-1, 1]) add(rodGeo([s*0.05, -0.74, 0], [s*0.74, -0.12, 0], 0.016, 0.016, 5), ironR);   /* its braces */
    const ins = mat(null, { color:0x6e675e, rough:0.4 });
    const insul = (x, y) => { const me = add(new THREE.CylinderGeometry(0.022, 0.028, 0.09, 6), ins); me.position.set(x, y + 0.045, 0); };
    [-1.04, -0.44, 0.44, 1.04].forEach(o => insul(o, 0));
    const bar = add(new THREE.BoxGeometry(0.4, 0.07, 0.08), wd); bar.position.y = 6.935 - AZ - 0.12; [-0.16, 0.16].forEach(o => insul(o, 6.97 - AZ - 0.12)); insul(0, 7.26 - AZ - 0.12);
    const W = [[-0.86, 4.35, 0.12], [-0.98, 4.9, 0.1], [-1.06, 5.6, 0.06], [-1.08, 6.2, 0.02], [-1.04, AZ + 0.17, 0]].map(p => [p[0], p[1] - AZ - 0.12, p[2]]);   /* the broken wire, curling at its end */
    const wg = []; for (let k = 0; k < W.length - 1; k++) wg.push(rodGeo(W[k], W[k + 1], 0.007, 0.007, 4)); add(mergeGeometries(wg.map(q => q.toNonIndexed())), M.wire);
    TK.sway.push({ o:g, ph:1.3, k:0.012 });
  })();
  /* the newer pole beside it, doing its job: its own crossarm and insulators, the transformer can (Seam: further from the
     cut one, so the cross stands on its own) */
  (function newer(){
    const x = 32.38, z = 20.45, gy = groundAt(x, z);
    tag(cyl(0.1, 0.085, 7.4, M.woodD, x, gy - 0.2, z, 14), 'pole'); K.solids.push({ x0:x - 0.09, x1:x + 0.09, y0:-0.5, y1:7, z0:z - 0.09, z1:z + 0.09 });
    box(x - 0.5, x + 0.5, 6.1, 6.22, z - 0.05, z + 0.05, M.woodD, { solid:false });
    for (const s of [-1, 1]) meshOf([rodGeo([x + s*0.05, 5.55, z], [x + s*0.36, 6.1, z], 0.014, 0.014, 4)], ironR);
    const ins = mat(null, { color:0x6e675e, rough:0.4 }); for (const o of [-0.42, 0.42]) cyl(0.028, 0.022, 0.09, ins, x + o, 6.22, z, 6, { cast:false });
    cyl(0.2, 0.2, 0.62, mat(T.tinG, { color:0x9a948c }), x + 0.05, 4.9, z + 0.34, 10); cyl(0.21, 0.17, 0.06, M.iron, x + 0.05, 5.52, z + 0.34, 10);
    for (const o of [-0.42, 0.42]) wire([31.98 + o*0.95, 6.56, 17.66], [x + o, 6.3, z], 0.1, M.wire, 0.008);   /* (it takes the line over from the cut one) */
  })();

  /* ================= old street lamps on three of the road's poles: one lit, dim and orange; one burnt out; one weak
     but steady (Seam f03-3d4: hx 0.78 m out over the road, the shade at 5.36) ================= */
  const shadeM = mat(T.tinG, { rough:0.6, metal:0.4, two:true });
  [[24.58, 0.7], [31.58, 0], [38.58, 0.32]].forEach(([z, k]) => {
    const px = 31.88, hx = 31.2, hz = 5.36;
    tag(meshOf([rodGeo([px, 5.18, z], [hx, 5.42, z], 0.022, 0.02, 6), rodGeo([px, 4.76, z], [px - 0.36, 5.16, z], 0.012, 0.012, 4)], ironR), 'streetlamp');   /* the arm, a brace under it */
    tag(lathe([[0.02, 0.09], [0.03, 0.07], [0.095, 0.05], [0.17, 0.012], [0.19, -0.004]], shadeM, hx, hz, z, 14, { cast:false }), 'streetlamp');
    const gm = k > 0 ? new THREE.MeshStandardMaterial({ color:0x2a1a08, emissive:new THREE.Color(1.0, 0.66, 0.34), emissiveIntensity:1.5 + 4*k }) : mat(null, { color:0x6a6460, rough:0.4 });
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), gm); b.position.set(hx, hz - 0.045, z); scene.add(b); tag(b, 'streetlamp');
    if (k > 0) { halo(hx, hz - 0.05, z, 0.55*k + 0.2, 0xffb070);
      }   /* (its light on the road: a pool was tried, but the ink grade turned it into a dark patch; a later pass, with the lighting) */
  });

  /* ================= the tunnel mouth: the line goes into the ground east of the platform. an old concrete mouth in a
     bank, the corn standing thick on top; inside, only dark (Seam f03-paint f3Mouth: the arch's ring of stones, the
     face streaked green-black, its coping, a lip of earth). (Nov 17: made big enough for the train to go in) ================= */
  (function tunnel(){
    const X = TUN.x, zc = TUN.zc, hw = TUN.hw, yb = -0.62, ys = yb + TUN.spring, top = TUN.bank, z0 = -1.2, z1 = 5.2;
    const sh = new THREE.Shape(); sh.moveTo(z0 - zc, yb - 0.1); sh.lineTo(z1 - zc, yb - 0.1); sh.lineTo(z1 - zc, top - 0.12); sh.lineTo(z0 - zc, top - 0.12); sh.lineTo(z0 - zc, yb - 0.1);
    const hole = new THREE.Path(); hole.moveTo(-hw, yb - 0.1); hole.lineTo(-hw, ys); hole.absarc(0, ys, hw, Math.PI, 0, true); hole.lineTo(hw, yb - 0.1); hole.lineTo(-hw, yb - 0.1); sh.holes.push(hole);
    const fg = new THREE.ExtrudeGeometry(sh, { depth:0.5, bevelEnabled:false, curveSegments:20 });
    const uv = fg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i)/4, uv.getY(i));
    const faceM = mat(T.face, { color:0xa8a49a });
    const lining = mat(T.face, { color:0x2a2622 });   /* (the arch's own inside: the light doesn't get in) */
    const face = new THREE.Mesh(fg, [faceM, lining]); face.rotation.y = Math.PI/2; face.position.set(X, 0, zc);   /* (turned: its depth runs east, X to X + 0.5) */ face.castShadow = face.receiveShadow = true; scene.add(face);
    tag(face, () => pick(F3_WALL.tunnel));
    /* the ring of stones round the arch, a little proud of the face */
    const rs = new THREE.Shape(); rs.absarc(0, ys, hw + 0.16, Math.PI, 0, true); rs.lineTo(hw, ys); rs.absarc(0, ys, hw, 0, Math.PI, false); rs.lineTo(-hw - 0.16, ys);
    const rg = new THREE.ExtrudeGeometry(rs, { depth:0.06, bevelEnabled:false, curveSegments:20 }); const ruv = rg.attributes.uv; for (let i = 0; i < ruv.count; i++) ruv.setXY(i, ruv.getX(i)/4, ruv.getY(i));
    const ring = new THREE.Mesh(rg, mat(T.face, { color:0x8e8a84 })); ring.rotation.y = Math.PI/2; ring.position.set(X - 0.06, 0, zc); ring.castShadow = true; scene.add(ring);
    for (const s of [-1, 1]) box(X - 0.06, X, yb - 0.1, ys, zc + s*(hw + 0.08) - 0.08, zc + s*(hw + 0.08) + 0.08, mat(T.face, { color:0x8e8a84 }), { solid:false });
    box(X - 0.06, X + 0.56, top - 0.12, top, z0 - 0.05, z1 + 0.05, mat(T.face, { color:0xb8b2a8 }), { solid:false });   /* its coping */
    box(X + 0.3, X + 1.2, top - 0.02, top + 0.1, z0, z1, earth, { solid:false, cast:false });   /* a lip of earth */
    K.solids.push({ x0:X - 0.05, x1:X + 0.55, y0:-1, y1:4, z0:z0, z1:z1 });   /* (you can't walk in) */
    /* inside: only dark, and the roof of earth over it (the corn stands on it) */
    const dark = new THREE.MeshBasicMaterial({ color:0x070504, side:THREE.BackSide });
    dark.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <fog_fragment>', '#ifdef USE_FOG\n float fogF = smoothstep(fogNear, fogFar, vFogDepth)*0.85; gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogF*fogF);\n#endif'); };   /* (the dark inside takes the fog late: the mouth stays dark until you're far off) */
    const inside = new THREE.Mesh(new THREE.BoxGeometry(16, ys + hw - yb + 0.3, hw*2 + 0.6), dark); inside.position.set(X + 0.1 + 8, (ys + hw + yb)/2, zc); scene.add(inside);
    box(X + 0.5, 57, ys + hw + 0.12, top + 0.02, zc - hw - 0.85, zc + hw + 0.85, earth, { solid:false, cast:false });
  })();

  /* ================= on the shed: FEED · SEED · BAIT, and the tobacco window (Seam's own pictures) ================= */
  const g0 = mat(null, { color:0x6a6660 });
  tag(box(26.2, 27.6, 1.85, 2.4, 7.975, 7.995, [g0, g0, g0, g0, g0, picM('f3shedSign', 300, '#e2d6be', { m:[1.4, 0.55] })], { solid:false, cast:false }), 'shedsign');
  tag(box(25.15, 25.95, 1.53, 1.65, 7.975, 7.995, [g0, g0, g0, g0, g0, picM('f3tobacco', 320, '#9a2a22', { m:[0.8, 0.12] })], { solid:false, cast:false }), 'tobacco');
  const winM = new THREE.MeshStandardMaterial({ color:0x1a1410, roughness:0.15, metalness:0.3 });
  tag(box(25.22, 25.88, 0.9, 1.48, 7.985, 7.995, winM, { solid:false, cast:false }), 'tobacco');   /* the little window, shut */
  box(25.18, 25.92, 0.86, 0.9, 7.94, 8.0, M.woodD, { solid:false }); box(25.18, 25.92, 1.48, 1.52, 7.96, 8.0, M.woodD, { solid:false });
  const card = cvTex(64, 48, (c, w, h) => { c.fillStyle = col('paper', 0.75); c.fillRect(0, 0, w, h); c.strokeStyle = col('hwood', 0.2); c.lineWidth = 2.4; c.beginPath(); for (const y of [16, 30]) { c.moveTo(10, y); for (let x = 10; x < 54; x += 4) c.lineTo(x, y + Math.sin(x*0.9)*2.4); } c.stroke(); });   /* a hand-written card behind the glass */
  plane(0.16, 0.12, new THREE.MeshStandardMaterial({ map:card, roughness:0.9 }), 25.55, 1.2, 7.982, Math.PI, { cast:false });

  /* ================= the poles' little tags, and climbing steps on some (f03-3d3) ================= */
  const tagM = picM('f3tag', 900, '#9a958c', { cut:true, two:true }), pegs = [];
  [4, 11, 18, 25, 32, 39].forEach((x, i) => { if (i % 2 === 0) plane(0.08, 0.11, tagM, x + 0.08, 0.955, 0.905, 0, { cast:false });
    if (i === 1 || i === 4) for (let y = 2.4; y < 6.2; y += 0.38) { const s = Math.round(y/0.38) % 2 ? 1 : -1; pegs.push(rodGeo([x + 0.08 + s*0.05, y, 0.9], [x + 0.08 + s*0.05, y, 1.01], 0.011, 0.011, 4)); } });
  [10.5, 24.5, 31.5, 38.5].forEach((z, i) => { if (i !== 1) plane(0.08, 0.11, tagM, 31.875, 1.655, z + 0.08, -Math.PI/2, { cast:false });
    if (i === 2 || i === 3) for (let y = 2.4; y < 6.0; y += 0.38) { const s = Math.round(y/0.38) % 2 ? 1 : -1; pegs.push(rodGeo([31.88, y, z + 0.08 + s*0.05], [31.77, y, z + 0.08 + s*0.05], 0.011, 0.011, 4)); } });
  if (pegs.length) meshOf(pegs, ironR, { cast:false });

  return TK;
}

/* clicking the ground: the road, the grass, the corn, the fields going on (Seam's own lines) */
export function groundSay(hit, ROAD){
  const x = hit.point.x, z = hit.point.z;
  if (x > 8.8 && x < 32.2 && z > 2.9 && z < 8.1) return null;   /* (under the platform) */
  if (z < 0.9 || x < 0.8 || x > 41.2 || z > 24.3) return pick(F3_SAYS.corn);
  if (z > 8 && x > ROAD[0] && x < ROAD[1]) return F3_WALL.road[0];
  if (z < 3.05) return null;
  return F3_SAYS.grass[0];
}
export function tickMore(TK, t, gust){
  if (!TK) return;
  for (const s of TK.sway) { s.o.rotation.z = Math.sin(t*0.5 + s.ph)*s.k*(0.4 + gust) + Math.sin(t*0.23)*s.k*0.3; s.o.rotation.x = Math.sin(t*0.31 + s.ph*2)*s.k*0.4; }
}
