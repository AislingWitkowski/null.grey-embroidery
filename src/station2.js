/* ================================================================
   EMBROIDERY · MISSING MILE, everything else the Seam version has (Nov 17, evening; Aisling: "we will move all those
   over then we will update them all to embroidery graphics", and "all the little things too … please do a sweep and
   make sure we don't miss anything!"). Each piece stands where Seam has it (Seam's map: x east, y south → here z),
   built the way Seam's last pass built it (f03-3d2 … 3d4, f03-things, f03-details):
   - the four trees, four times of autumn (f03-3d3): a leaning, forking trunk, limbs, twigs; the leaves in loose
     bunches along them; their leaves on the ground round them.
   - the windmill far out in the corn, much too tall, its wheel still, GOOCH on its vane (f03-paint, f03-3d3).
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
import { ROOTS } from './roots.js';

/* Seam's deep reds (hblood, from null.grey-furusatostation's RAMP_SRC) for the leaves only: Embroidery's ink grade keeps its own ramps */
const HBLOOD = ['#120202','#220404','#340606','#470909','#5b0b0b','#700e0d','#851211','#9a1715','#ae1f1a','#c22b22','#d4463a','#e47466'];
const col = (r, t) => { if (r === 'hblood') return HBLOOD[Math.max(0, Math.min(11, Math.round(t*11)))]; const c = inkRGB(r, t); return 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')'; };
const pick = A => A[(Math.random()*A.length) | 0];

/* where the corn must not stand (round the windmill's feet, the trees out in it); and the bank over the tunnel */
/* how far the tunnel's mouth is from you (the frame sets it): its dark takes the fog by this */
export const MOUTH_D = { value:10 };
export const TUN = { x:40.0, zc:2.0, hw:1.4, spring:2.15, bank:3.4 };   /* (the arch fits the train, real size: 1.8 m wide, its roof 2.45 m over the platform) */
/* (Nov 18, Aisling: "yes path through corn to windmil") a trodden path from the east field, out through the corn to the
   windmill's feet, wandering a little as paths do, and a small clearing round the windmill to stand in */
export const WM_PATH = [[37.2, 17.2], [39.6, 18.4], [41.8, 18.9], [43.6, 19.8], [45.4, 19.9], [46.7, 20.4]];
export const WM = { x:47.6, z:20.4, clear:2.1 };
export function pathDist(x, z){ let d = 1e9;
  for (let i = 0; i < WM_PATH.length - 1; i++) { const [ax, az] = WM_PATH[i], [bx, bz] = WM_PATH[i + 1], vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax)*vx + (z - az)*vz)/(vx*vx + vz*vz)));
    d = Math.min(d, Math.hypot(x - ax - vx*t, z - az - vz*t)); }
  return d; }
export function onWindmillWay(x, z){ return pathDist(x, z) < 0.55 || Math.hypot(x - WM.x, z - WM.z) < WM.clear - 0.25; }
export function cornClear(x, z){
  if (pathDist(x, z) < 0.62 || Math.hypot(x - WM.x, z - WM.z) < WM.clear) return true;
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
  const bark = mat(barkT, { color:0xe6d8cc });   /* (Nov 18: lighter, so its bark shows instead of a black cut-out) */ bark.userData.m = [1, 1];
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
  /* (Nov 18, from Aisling's own photos of maples: "almost right but they dont look natural at all") each leaf as it grows:
     its own stalk (the petiole) reaching to the bottom of its picture, so the leaf hangs from its twig; five pointed lobes
     with small teeth; veins spreading out from where the stalk joins, a little redder than the leaf; brown speckles and
     a dried edge here and there. 16 to an atlas, each its own colour from the tree's palette */
  function leafAtlas(L){
    return cvTex(512, 512, (c) => { const lr = rnd(31 + L.n);
      for (let k = 0; k < 16; k++) { const ox = (k % 4)*128, oy = Math.floor(k/4)*128, P = L.p[k % L.p.length], t = P[1] + (lr() - 0.5)*0.14;
        const cx = ox + 64, cy = oy + 52, R0 = 40 + lr()*6, deep = 0.42 + lr()*0.16, sk = (lr() - 0.5)*0.25;
        const lobes = [[-Math.PI/2 + sk, 1], [-Math.PI/2 - 0.95 + sk, 0.88], [-Math.PI/2 + 0.95 + sk, 0.88], [-Math.PI/2 - 1.85, 0.5], [-Math.PI/2 + 1.85, 0.5]];
        const rAt = a => { let m = 0; for (const [la, ll] of lobes) { let d = Math.abs(Math.atan2(Math.sin(a - la), Math.cos(a - la))); m = Math.max(m, ll*Math.pow(Math.max(0, 1 - d/0.62), 1.35)); }
          const tooth = 0.05*Math.pow(Math.abs(Math.sin(a*14)), 6); return R0*(deep + (1 - deep)*m + tooth*m); };
        c.beginPath(); for (let i = 0; i <= 160; i++) { const a = i/160*Math.PI*2 - Math.PI/2, r = rAt(a); c.lineTo(cx + Math.cos(a)*r, cy + Math.sin(a)*r*0.95); } c.closePath();
        const g = c.createRadialGradient(cx, cy + 8, 3, cx, cy, R0); g.addColorStop(0, col(P[0], Math.min(1, t + 0.05))); g.addColorStop(0.75, col(P[0], t)); g.addColorStop(1, col(P[0], t*0.9));
        c.fillStyle = g; c.fill();
        c.save(); c.clip();
        if (lr() < 0.55) { const ex = cx + (lr() - 0.5)*60, ey = cy - 10 - lr()*25, er = 12 + lr()*16, eg = c.createRadialGradient(ex, ey, 0, ex, ey, er); eg.addColorStop(0, col('hwood', 0.3)); eg.addColorStop(1, 'rgba(0,0,0,0)'); c.globalAlpha = 0.5; c.fillStyle = eg; c.fillRect(ex - er, ey - er, er*2, er*2); c.globalAlpha = 1; }   /* a dried patch */
        for (let i = 0; i < 40; i++) { c.fillStyle = col('hwood', 0.14 + lr()*0.12); c.globalAlpha = 0.35 + lr()*0.4; const sx = cx + (lr() - 0.5)*70, sy = cy + (lr() - 0.5)*70, ss = 0.8 + lr()*1.8; c.fillRect(sx, sy, ss, ss); }   /* the speckles */
        c.globalAlpha = 0.55; c.strokeStyle = col(P[0] === 'hgold' || P[0] === 'holive' ? 'hrust' : P[0], t*0.7); c.lineWidth = 1.3;
        const bx = cx, by = cy + 12;   /* where the stalk joins: the veins spread out from here */
        for (const [la, ll] of lobes) { const r = rAt(la)*0.93; c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx + Math.cos(la)*r*0.45, by + Math.sin(la)*r*0.45 - 2, cx + Math.cos(la)*r, cy + Math.sin(la)*r*0.95); c.stroke();
          c.lineWidth = 0.7; for (const f of [0.35, 0.6]) for (const sd of [-1, 1]) { const px = bx + (Math.cos(la)*r)*f, py = by + (Math.sin(la)*r*0.95 - 12)*f, a2 = la + sd*0.7; c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.cos(a2)*r*0.28, py + Math.sin(a2)*r*0.28); c.stroke(); } c.lineWidth = 1.3; }
        c.restore(); c.globalAlpha = 1;
        c.strokeStyle = col(P[0] === 'hgold' || P[0] === 'holive' ? 'hrust' : 'hwood', 0.32); c.lineWidth = 2.2; c.beginPath(); c.moveTo(bx, by - 2); c.quadraticCurveTo(bx + (lr() - 0.5)*10, oy + 110, bx + (lr() - 0.5)*4, oy + 127); c.stroke();   /* the stalk, down to the picture's edge */
      }
    });
  }

  /* (Nov 17, graphics pass) the trees in the wind, the same wind as the grass (the same gusts, the same way): the crown
     leans and comes back, more the higher it is, the branches bending with it so the leaves stay on them; each leaf
     trembles a little on its own, slowly (well under three times a second). and light comes through the leaves: they
     glow a little in the dusk, most when you look up at them against the sky (Folklore's backlit canopies) */
  const SWAY = 'vec4 mvPosition; { vec4 wp = modelMatrix*vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\n wp = modelMatrix*instanceMatrix*vec4(transformed, 1.0);\n#endif\n' +
    ' float hk = clamp((wp.y - 0.9)/3.2, 0.0, 1.0); hk *= hk;\n' +
    ' float lean = (0.016 + uGust*0.07)*(0.65 + 0.35*sin(uTime*0.55 + wp.x*0.3 + wp.z*0.21)) + 0.012*sin(uTime*0.37 + wp.z*0.4);\n' +
    ' vec3 egSw = vec3(0.85, 0.0, 0.5)*lean*hk; egSw.y = -0.25*lean*hk;\n';
  const swayVert = (sh, leaf) => { sh.uniforms.uTime = K.wind.uTime; sh.uniforms.uGust = K.wind.uGust;
    sh.vertexShader = (leaf ? '' : 'uniform float uTime; uniform float uGust;\n') + sh.vertexShader.replace('#include <project_vertex>', SWAY +
      (leaf ? ' float fl = sin(uTime*(1.6 + mod(aVar, 5.0)*0.12) + aVar*1.7 + wp.x*2.3 + wp.z*1.9)*(0.006 + uGust*0.018);\n egSw += vec3(fl, fl*0.6, fl*0.8);\n' : '') +
      ' mvPosition = viewMatrix*(wp + vec4(egSw, 0.0)); gl_Position = projectionMatrix*mvPosition; }'); };
  bark.onBeforeCompile = sh => swayVert(sh, false); bark.customProgramCacheKey = () => 'tree-bark';
  function leafMat(map, still){
    const m = new THREE.MeshStandardMaterial({ map, alphaTest:0.5, roughness:0.85, side:THREE.DoubleSide }); m.userData.noDetail = true;
    m.onBeforeCompile = sh => {
      sh.vertexShader = 'attribute float aVar; uniform float uTime; uniform float uGust;\n' + sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n vMapUv = vMapUv*0.25 + vec2(mod(aVar, 4.0), floor(aVar/4.0))*0.25;');
      if (!still) swayVert(sh, true);
      sh.fragmentShader = sh.fragmentShader.replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\n' +
        ' { vec3 d = normalize(-vViewPosition), up = normalize((viewMatrix*vec4(0.0, 1.0, 0.0, 0.0)).xyz); float back = clamp(-dot(d, up)*1.4 + 0.15, 0.0, 1.0);\n' +
        '   reflectedLight.indirectDiffuse += diffuseColor.rgb*vec3(1.0, 0.86, 0.66)*(0.1 + 0.42*back*back); }');   /* (thin leaves: the dusk comes through them) */
    };
    m.customProgramCacheKey = () => still ? 'tree-leaf-still' : 'tree-leaf';
    return m;
  }
  function leafField(items, m, flat){
    const g = new THREE.PlaneGeometry(1, 1); g.translate(0, 0.5, 0);   /* (its stalk's end at the twig) */ if (flat) g.rotateX(-Math.PI/2);
    const im = new THREE.InstancedMesh(g, m, items.length), M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new Float32Array(items.length);
    items.forEach((it, i) => { if (it[8]) q.copy(it[8]); else { e.set(it[4], it[5], it[6]); q.setFromEuler(e); } M4.compose(new THREE.Vector3(it[0], it[1], it[2]), q, new THREE.Vector3(it[3], it[3], it[3])); im.setMatrixAt(i, M4); v[i] = it[7]; });
    g.setAttribute('aVar', new THREE.InstancedBufferAttribute(v, 1)); im.castShadow = !flat; im.receiveShadow = true; im.computeBoundingSphere(); scene.add(im); return im;
  }
  function tree(tx, tz, ph, seed, say){
    const Rt = rnd(seed*97 + 5), Lf = LEAF[ph], gy = groundAt(tx, tz) - 0.05, tl = (Rt() - 0.5)*0.16, tlx = tl*Math.cos(seed), tlz = tl*Math.sin(seed);
    const geos = [], sites = [], m = leafMat(leafAtlas(Lf));

    
    const site = (A, B, f) => sites.push([A[0] + (B[0] - A[0])*f, A[1] + (B[1] - A[1])*f, A[2] + (B[2] - A[2])*f]);
    /* (Nov 18, Aisling: the limbs looked "sliced choppy … the disconnection is a little odd"; keep them "a little janky
       weird tim burton distortion..spikey") each limb is now one curving, tapering branch in a few segments: it starts
       inside its parent (so it grows out of it), bends as it goes (outward first, then up or sagging), each joint rounded
       with a knuckle, and the tip closed to a spike. */
    const knuckle = (P, r) => { const g = new THREE.SphereGeometry(r, 8, 6); g.translate(P[0], P[1], P[2]); geos.push(g); };
    /* (Nov 18, later; Aisling: "trees a little too bumpy still") each limb is one smooth tube now: its path bends as before,
       smoothed into a curve, and its thickness tapers all along it to a spike. no balls at the joints. */
    const tube = (pts, r0, r1, rs, capStart) => { const n = pts.length, pos = [], idx = [], uv = []; let N = null, run = 0;
      const V = pts.map(p => new THREE.Vector3(...p)), acc = [0]; for (let i = 1; i < n; i++) acc.push(acc[i - 1] + V[i].distanceTo(V[i - 1])); const tot = acc[n - 1] || 1;
      for (let i = 0; i < n; i++) { const T = (i < n - 1 ? V[i + 1].clone().sub(V[i]) : V[i].clone().sub(V[i - 1])).normalize();
        if (!N) { N = new THREE.Vector3(0, 1, 0).cross(T); if (N.lengthSq() < 1e-6) N.set(1, 0, 0); N.normalize(); } else { N.sub(T.clone().multiplyScalar(N.dot(T))).normalize(); }
        const Bn = new THREE.Vector3().crossVectors(T, N), f = acc[i]/tot, r = (r0 + (r1 - r0)*Math.pow(f, 0.85))*(i === 0 && capStart ? 0.35 : 1);
        if (i) run += V[i].distanceTo(V[i - 1]); for (let k = 0; k < rs; k++) { const a = k/rs*Math.PI*2, w = 1 + 0.06*Math.sin(a*3 + i*0.7); uv.push(k/rs, run*1.2); pos.push(V[i].x + (N.x*Math.cos(a) + Bn.x*Math.sin(a))*r*w, V[i].y + (N.y*Math.cos(a) + Bn.y*Math.sin(a))*r*w, V[i].z + (N.z*Math.cos(a) + Bn.z*Math.sin(a))*r*w); } }
      for (let i = 0; i < n - 1; i++) for (let k = 0; k < rs; k++) { const a = i*rs + k, b = i*rs + (k + 1)%rs, c = a + rs, d = b + rs; idx.push(a, c, b, b, c, d); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; };
    let lastDir = null;
    const limb = (A, len, lx, lz, r0, r1, into) => {
      const seg = len > 0.7 ? 4 : 3, bend = (Rt() - 0.35)*0.9, twist = (Rt() - 0.5)*0.8;
      let P = [A[0], A[1], A[2]], dx = lx, dy = 1, dz = lz; const bd = into || [lx, 1, lz], bl = Math.hypot(...bd) || 1, back = r0*3; const pts = [[P[0] - bd[0]/bl*back, P[1] - bd[1]/bl*back, P[2] - bd[2]/bl*back], P];   /* (starting buried in its parent, along the parent's own line, so it can't poke out the far side) */
      for (let k = 0; k < seg; k++) { const L = len/seg*(k === 0 ? 1.08 : 1); P = [P[0] + dx*L, P[1] + dy*L, P[2] + dz*L]; pts.push(P);
        const c = Math.cos(twist*0.4), sn = Math.sin(twist*0.4); [dx, dz] = [dx*c - dz*sn, dx*sn + dz*c]; dy += bend*0.35 - 0.06*k; dx *= 1.04; dz *= 1.04; }
      const tip = [P[0] + dx*0.08, P[1] + dy*0.08, P[2] + dz*0.08]; pts.push(tip);
      /* smooth the bends into a curve */
      const cv = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), sm = cv.getPoints(seg*5).map(v => [v.x, v.y, v.z]);
      if (r1 >= 0.015) { const a = sm[sm.length - 2], b = sm[sm.length - 1], d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], dl = Math.hypot(...d) || 1, k = Math.max(r1*6, 0.3)/dl;   /* (the limb carries on past its fork as a leader, thinning to a spike) */ sm.push([b[0] + d[0]*k, b[1] + d[1]*k, b[2] + d[2]*k]); }   /* (a short taper closes the end, so no flat cut shows where the next limb bends away) */
      geos.push(tube(sm, r0, 0.002, r0 > 0.05 ? 10 : 6, true)); { const a = pts[pts.length - 2], b = pts[pts.length - 1]; lastDir = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]; }   /* (only the twigs end in a point; a limb ends as thick as what grows from it) */
      return P; };
    /* (Nov 18, from Aisling's own tree photos: "the trees just arent quite there") grown the way hers grow: one tall trunk,
       straight a long way, that forks at about head height into two or three leaders; each leader keeps going up, forking
       again and again (five or six times), thinner each time, the side branches leaving at an angle and curving up, the
       longest ones sagging a little under their own weight, until the ends are a fine net of twigs. the leaves live out
       on that net (the crown's shell), not along the big limbs. still a little crooked and spiky. */
    const V3 = (x, y, z) => new THREE.Vector3(x, y, z), up = V3(0, 1, 0);
    const turn = (d, ang, around) => d.clone().applyAxisAngle(around, ang);
    const perp = d => { const p = V3(1, 0, 0).cross(d); if (p.lengthSq() < 1e-4) p.set(0, 0, 1); return p.normalize(); };
    const grow = (P, dir, len, r0, depth, maxD, buried) => {
      /* the branch's own path: a few bends, a crook now and then, drooping more the longer and thinner it is */
      const n = Math.max(3, Math.round(len*4)), pts = [], d = dir.clone().normalize();
      const start = buried ? P.clone().sub(d.clone().multiplyScalar(r0*2.5)) : P.clone(); pts.push(start.toArray()); let Q = P.clone(); pts.push(Q.toArray());
      const sag = (depth >= 2 ? 0.05 : 0.0)*(len/1.6), crook = Rt() < 0.3 ? (Rt() - 0.5)*0.9 : 0;
      for (let i = 1; i <= n; i++) { const f = i/n; d.add(V3((Rt() - 0.5)*0.22, -sag + (depth <= 1 ? 0.03 : 0), (Rt() - 0.5)*0.22)); if (i === Math.round(n/2) && crook) d.applyAxisAngle(perp(d), crook); d.normalize(); Q = Q.clone().add(d.clone().multiplyScalar(len/n)); pts.push(Q.toArray()); }
      const r1 = r0*(depth >= maxD ? 0.15 : 0.55);
      const cv = new THREE.CatmullRomCurve3(pts.map(p => V3(...p))), sm = cv.getPoints(r0 > 0.03 ? n*3 : n + 1).map(v => [v.x, v.y, v.z]);   /* (thin twigs: fewer rings, they're too small to show bends) */
      geos.push(tube(sm, r0, r1 < 0.006 ? 0.0015 : r1, r0 > 0.08 ? 12 : (r0 > 0.03 ? 8 : (r0 > 0.012 ? 5 : 3)), buried));
      if (depth >= maxD - 1) for (const f of [0.45, 0.75, 1.0]) { const s = cv.getPoint(f); sites.push([s.x, s.y, s.z]); }   /* the outer net: where the leaves go */
      if (depth >= maxD) return;
      /* its children: one carries on (the leader), one to three leave at the side along its outer half */
      const end = cv.getPoint(1), endDir = cv.getTangent(1).normalize();
      const lead = turn(endDir, (Rt() - 0.5)*0.35, perp(endDir)).lerp(up, depth < 2 ? 0.25 : 0.05).normalize();
      grow(end, lead, len*(0.72 + Rt()*0.12), r1, depth + 1, maxD, true);
      const ns = depth === 0 ? 0 : 1 + Math.floor(Rt()*(depth < 3 ? 2.4 : 2));
      for (let k = 0; k < ns; k++) { const f = 0.45 + Rt()*0.5, at = cv.getPoint(f), t = cv.getTangent(f).normalize(), spin = Rt()*6.283;
        const out = turn(turn(t, 0.55 + Rt()*0.45, perp(t)), spin, t).lerp(up, 0.2).normalize();
        grow(at, out, len*(0.5 + Rt()*0.25), r1*(0.75 + Rt()*0.15), depth + 1, maxD, true); }
    };
    /* the trunk, straight a long way, flaring at its foot; then it forks into two or three leaders */
    const TH = 2.1 + Rt()*1.0, maxD = ph >= 3 ? 5 : 6;
    { const tp = []; for (let i = 0; i <= 14; i++) { const f = i/12; tp.push([tx + tlx*TH*f + Math.sin(f*3 + seed)*0.04, gy - 0.1 + (TH + 0.1)*f, tz + tlz*TH*f + Math.cos(f*2.6 + seed)*0.04]); }   /* (on a little past the fork, closing inside the leaders: no cut end) */
      const tg = tube(tp, 0.3, 0.06, 16), q = tg.attributes.position;
      for (let i = 0; i < q.count; i++) { const y = q.getY(i) - gy, fl = 1 + 0.5*Math.max(0, 1 - y/0.6)**2; q.setX(i, tx + (q.getX(i) - tx)*fl); q.setZ(i, tz + (q.getZ(i) - tz)*fl); }
      tg.computeVertexNormals(); geos.push(tg); }
    const top = V3(tx + tlx*TH, gy + TH - 0.1, tz + tlz*TH), nLead = 2 + (Rt() < 0.5 ? 1 : 0), a0 = Rt()*6.283;
    for (let i = 0; i < nLead; i++) { const ang = a0 + i*6.283/nLead + (Rt() - 0.5)*0.5, lean = 0.28 + Rt()*0.22;
      grow(top.clone().add(V3(0, -0.35 - i*0.2, 0)), V3(Math.cos(ang)*lean*0.8, 1, Math.sin(ang)*lean*0.8), 1.7 + Rt()*0.6, 0.15 - i*0.012, 1, maxD, true); }   /* (starting well down inside the trunk, so the fork has no notch) */
    const H1 = TH;
    ROOTS.add(tx, tz, 0.3, 'earth');   /* (its foot in the earth: roots.js) */
    for (let k = 0; k < 5; k++) { const a = Rt()*6.283 + k*1.25, L = 0.75 + Rt()*0.4;   /* (Nov 18) its roots flaring into the ground, so it doesn't stand like a pipe */
      geos.push(rodGeo([tx + Math.cos(a)*0.12, gy + 0.14, tz + Math.sin(a)*0.12], [tx + Math.cos(a)*L, gy - 0.04, tz + Math.sin(a)*L], 0.11, 0.03, 8)); }
    tag(meshOf(geos, bark), say); K.solids.push({ x0:tx - 0.28, x1:tx + 0.28, y0:gy - 1, y1:gy + H1, z0:tz - 0.28, z1:tz + 0.28 });
    for (let k = sites.length - 1; k > 0; k--) { const s = Math.floor(Rt()*(k + 1)); [sites[k], sites[s]] = [sites[s], sites[k]]; }   /* (which sites get leaves: at random, so no two trees match) */
    /* (Nov 18) the leaves grow on twiglets: from each site a few thin shoots, and the leaves hang off them in fans,
       each on its own stalk, spreading out and facing the sky a little, as on her maples */
    const lv = [], UP = new THREE.Vector3(0, 1, 0), tw = [];
    const leafAt = (N, dir, sz) => { const y = dir.clone().normalize(); let x = new THREE.Vector3().crossVectors(UP, y); if (x.lengthSq() < 1e-4) x.set(1, 0, 0); x.normalize();
      const z = new THREE.Vector3().crossVectors(x, y).normalize(); const M = new THREE.Matrix4().makeBasis(x, y, z), qq = new THREE.Quaternion().setFromRotationMatrix(M);
      qq.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (Rt() - 0.5)*1.1));
      lv.push([N[0], N[1], N[2], sz, 0, 0, 0, Math.floor(Rt()*16), qq]); };
    const nUse = Math.min(sites.length, Math.round(sites.length*Math.min(1, Lf.n/86)));
    for (let t = 0; t < nUse; t++) { const S = sites[t], nt = ph >= 3 ? 1 : (ph === 2 ? 1 : 2);
      for (let w = 0; w < nt; w++) { const a = Rt()*6.283, len = (ph >= 2 ? 0.4 : 0.25) + Rt()*0.4, d = new THREE.Vector3(Math.cos(a), -0.1 + Rt()*0.8, Math.sin(a)).normalize();
        const B = [S[0] + d.x*len, S[1] + d.y*len, S[2] + d.z*len]; tw.push(rodGeo(S, B, 0.009, 0.004, 3));
        for (const f of (ph >= 2 ? [1.0] : [0.35, 0.68, 1.0])) {   /* (the barer trees keep their last leaves out at the twig ends, not clinging at the joints) */ const N = [S[0] + d.x*len*f, S[1] + d.y*len*f, S[2] + d.z*len*f], nl = f === 1 ? 4 + Math.floor(Rt()*3) : 2 + Math.floor(Rt()*2);
          for (let l = 0; l < nl; l++) { const sp = (l - (nl - 1)/2)*0.75 + (Rt() - 0.5)*0.4, ca = Math.cos(sp), sa = Math.sin(sp);
            const dir = new THREE.Vector3(d.x*ca - d.z*sa, d.y*0.4 - 0.25 + Rt()*0.35, d.x*sa + d.z*ca);   /* fanning out from the shoot, drooping a little */
            if (Rt() < (ph >= 2 ? 0.25 : 0.06)) continue;   /* (gaps: some already fallen) */
            leafAt(N, dir, 0.14 + Rt()*0.09); } } } }
    if (tw.length) tag(meshOf(tw, bark, { cast:false }), say);
    if (lv.length) tag(leafField(lv, m, false), say);
    const gl = [];   /* its leaves on the ground round it, thicker near the trunk */
    for (let i = 0; i < Lf.ground; i++) { const a = Rt()*6.283, d = 0.3 + Math.pow(Rt(), 0.7)*3.2, x = tx + Math.cos(a)*d*1.1, z = tz + Math.sin(a)*d;
      if (x > 8.9 && x < 32.1 && z > 2.9 && z < 8.05) continue;   /* (not into the platform) */
      gl.push([x, groundAt(x, z) + 0.006 + Rt()*0.004, z, 0.1 + Rt()*0.06, (Rt() - 0.5)*0.3, Rt()*6.3, (Rt() - 0.5)*0.3, Math.floor(Rt()*16)]); }
    leafField(gl, leafMat(m.map, true), true);   /* (Nov 18, Aisling: the leaves on the ground were bobbing up and down: they lie still) */
  }
  [[4.6, 6.0, 1, 7, 'tree'], [36.8, 6.2, 0, 19, 'tree'], [45.5, 15.5, 2, 23, 'treeF'], [14.0, 19.0, 3, 37, 'treeF'], [51.2, 23.4, 2, 41, 'treeF'], [50.6, 16.6, 3, 43, 'treeF'], [52.6, 19.8, 1, 47, 'treeF']]   /* (Nov 18: three behind the windmill, in the corn) */.forEach(t => tree(t[0], t[1], t[2], t[3], t[4]));

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
    for (const [sx, sz] of CN) { ROOTS.add(WX + sx*0.62, WZ + sz*0.62, 0.06, 'earth'); K.solids.push({ x0:WX + sx*0.62 - 0.08, x1:WX + sx*0.62 + 0.08, y0:g0 - 1, y1:g0 + 8, z0:WZ + sz*0.62 - 0.08, z1:WZ + sz*0.62 + 0.08 }); }   /* (its legs are solid: you can walk in under it, not through them) */
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
      c.fillStyle = col('hrust', 0.3); c.font = '900 30px Arial Black, Arial, sans-serif'; c.textAlign = 'center'; c.font = '900 40px Arial Black, Arial, sans-serif'; c.fillText('GOOCH', 132, 80);   /* (Nov 18, Aisling: "windmill will be gooch") */
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
  /* (Nov 17, graphics pass) its light on the road: a pool laid on the ground itself (following every dip of it), added
     on top of what's there, warm, strongest under the lamp and falling off softly; it fades with the fog like everything
     else. (a real light would cost every surface in view; this costs one small mesh.) the light runs slow and steady:
     no flicker */
  function lampPool(cx, cz, R, k){
    const N = 28, pos = [], idx = [];
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) { const x = cx - R + 2*R*i/N, z = cz - R + 2*R*j/N; pos.push(x, groundAt(x, z) + 0.025, z); }
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const a = j*(N + 1) + i, b = a + 1, c = a + N + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    const m = new THREE.ShaderMaterial({ transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, fog:true,
      polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2,
      uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uC:{ value:new THREE.Vector3(cx, 5.3, cz) }, uR:{ value:R }, uK:{ value:k }, uCol:{ value:new THREE.Color(1.0, 0.62, 0.3) } }]),
      vertexShader:'varying vec3 vW; varying float vD; void main(){ vec4 w = modelMatrix*vec4(position, 1.0); vW = w.xyz; vec4 mv = viewMatrix*w; vD = -mv.z; gl_Position = projectionMatrix*mv; }',
      fragmentShader:'uniform vec3 uC, uCol; uniform float uR, uK; uniform float fogNear, fogFar; varying vec3 vW; varying float vD;\n' +
        'void main(){ float r = length(vW.xz - uC.xz)/uR; if (r > 1.0) discard; float f = pow(1.0 - r, 2.2)*(0.55 + 0.45/(1.0 + r*r*6.0));\n' +
        ' float a = uK*0.16*f*(1.0 - smoothstep(fogNear, fogFar*1.1, vD)); gl_FragColor = vec4(uCol*a, 1.0); }' });
    const me = new THREE.Mesh(g, m); me.renderOrder = 1; scene.add(me); return me;
  }
  const shadeM = mat(T.tinG, { rough:0.6, metal:0.4, two:true });
  [[24.58, 0.7], [31.58, 0], [38.58, 0.32]].forEach(([z, k]) => {
    const px = 31.88, hx = 31.2, hz = 5.36;
    tag(meshOf([rodGeo([px, 5.18, z], [hx, 5.42, z], 0.022, 0.02, 6), rodGeo([px, 4.76, z], [px - 0.36, 5.16, z], 0.012, 0.012, 4)], ironR), 'streetlamp');   /* the arm, a brace under it */
    tag(lathe([[0.02, 0.09], [0.03, 0.07], [0.095, 0.05], [0.17, 0.012], [0.19, -0.004]], shadeM, hx, hz, z, 14, { cast:false }), 'streetlamp');
    const gm = k > 0 ? new THREE.MeshStandardMaterial({ color:0x2a1a08, emissive:new THREE.Color(1.0, 0.66, 0.34), emissiveIntensity:1.5 + 4*k }) : mat(null, { color:0x6a6460, rough:0.4 });
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), gm); b.position.set(hx, hz - 0.045, z); scene.add(b); tag(b, 'streetlamp');
    if (k > 0) { halo(hx, hz - 0.05, z, 0.55*k + 0.2, 0xffb070); lampPool(hx, z, 3.4 + 2.2*k, k); }
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
    const faceM = mat(T.face, { color:0xd8d2c8, emit:0x2a2622, emitMap:T.face, emitK:1 });   /* (Nov 17, night: Aisling, "the tunnel is a little dakr cant see what its made of": paler concrete, holding a little of the dusk) */
    const lining = mat(T.face, { color:0x2a2622 });   /* (the arch's own inside: the light doesn't get in) */
    const face = new THREE.Mesh(fg, [faceM, lining]); face.rotation.y = Math.PI/2; face.position.set(X, 0, zc);   /* (turned: its depth runs east, X to X + 0.5) */ face.castShadow = face.receiveShadow = true; scene.add(face);
    tag(face, () => pick(F3_WALL.tunnel));
    /* the ring of stones round the arch, a little proud of the face */
    const rs = new THREE.Shape(); rs.absarc(0, ys, hw + 0.16, Math.PI, 0, true); rs.lineTo(hw, ys); rs.absarc(0, ys, hw, 0, Math.PI, false); rs.lineTo(-hw - 0.16, ys);
    const rg = new THREE.ExtrudeGeometry(rs, { depth:0.06, bevelEnabled:false, curveSegments:20 }); const ruv = rg.attributes.uv; for (let i = 0; i < ruv.count; i++) ruv.setXY(i, ruv.getX(i)/4, ruv.getY(i));
    const ring = new THREE.Mesh(rg, mat(T.face, { color:0xb8b2a8, emit:0x221e1a, emitMap:T.face, emitK:1 })); ring.rotation.y = Math.PI/2; ring.position.set(X - 0.06, 0, zc); ring.castShadow = true; scene.add(ring);
    for (const s of [-1, 1]) box(X - 0.06, X, yb - 0.1, ys, zc + s*(hw + 0.08) - 0.08, zc + s*(hw + 0.08) + 0.08, mat(T.face, { color:0xb8b2a8, emit:0x221e1a, emitMap:T.face, emitK:1 }), { solid:false });
    box(X - 0.06, X + 0.56, top - 0.12, top, z0 - 0.05, z1 + 0.05, mat(T.face, { color:0xe0dad0, emit:0x2a2622, emitMap:T.face, emitK:1 }), { solid:false });   /* its coping */
    box(X + 0.3, X + 1.2, top - 0.02, top + 0.1, z0, z1, earth, { solid:false, cast:false });   /* a lip of earth */
    K.solids.push({ x0:X - 0.05, x1:X + 0.55, y0:-1, y1:4, z0:z0, z1:z1 });   /* (you can't walk in) */
    /* inside: only dark, and the roof of earth over it (the corn stands on it) */
    /* inside: only dark. fog brightens what's far off, so inside the tunnel the fog is taken from how far the MOUTH is,
       not each point: deeper in, it only gets darker (and from far off, the mouth fades into the fog with the face) */
    const darkM = side => { const m = new THREE.MeshBasicMaterial({ color:0x070504, side });
      m.onBeforeCompile = sh => { sh.uniforms.uMouthD = MOUTH_D; sh.fragmentShader = 'uniform float uMouthD;\n' + sh.fragmentShader.replace('#include <fog_fragment>', '#ifdef USE_FOG\n gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, smoothstep(fogNear, fogFar, uMouthD));\n#endif'); };
      m.customProgramCacheKey = () => 'tun-dark' + side; return m; };
    const dark = darkM(THREE.BackSide);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, hw*2 + 0.6), darkM(THREE.FrontSide)); floor.rotation.x = -Math.PI/2; floor.scale.x = 14.6/16; floor.position.set(X + 1.4 + 7.3, -0.36, zc); scene.add(floor);   /* (over the ground and the track going in, past the first metre or so) */
    /* (Nov 17, Aisling: the track glowed just inside the mouth) the first stretch in, before the dark floor: a shade over
       the bed and rails, clear at the arch and full dark where the floor starts, so the track goes into the dark, not into light */
    { const gc = document.createElement('canvas'); gc.width = 64; gc.height = 4; const gg = gc.getContext('2d'), gr = gg.createLinearGradient(0, 0, 64, 0);
      gr.addColorStop(0, '#000'); gr.addColorStop(0.15, '#262626'); gr.addColorStop(1, '#fff'); gg.fillStyle = gr; gg.fillRect(0, 0, 64, 4);
      const gm = darkM(THREE.FrontSide); gm.transparent = true; gm.depthWrite = false; gm.alphaMap = new THREE.CanvasTexture(gc); gm.customProgramCacheKey = () => 'tun-shade';
      const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.15, hw*2 + 0.6), gm); sh.rotation.x = -Math.PI/2; sh.position.set(X + 0.45 + 0.575, -0.37, zc); sh.renderOrder = 2; scene.add(sh); }
    const inside = new THREE.Mesh(new THREE.BoxGeometry(16, ys + hw - yb + 0.3, hw*2 + 0.6), dark); inside.position.set(X + 0.1 + 8, (ys + hw + yb)/2, zc); scene.add(inside);
    box(X + 0.5, 57, ys + hw + 0.2, top + 0.02, zc - hw - 0.85, zc + hw + 0.85, earth, { solid:false, cast:false });
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
