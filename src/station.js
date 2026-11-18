/* ================================================================
   EMBROIDERY · F03 · 本町 · MAIN STREET, MISSING MILE — the station, milestone 1 (Nov 17, 2026).
   the same station as the Seam version (null.grey-furusatostation, mainstreet.html; doc 32): its layout, shapes and
   colours are carried over unchanged (map cells → metres: x east, z south, y up). what changes is how it's drawn —
   real light and shadow, fog, textures, grass and corn in the round. Aisling (Nov 16): "i lkike the way the station
   looks, i mostly want pumped up graphics."
   ================================================================ */
import { ROOTS } from './roots.js';
import { pathDist } from './station2.js';
import * as THREE from 'three';
import { K, kitInit, mat, sized, box, lathe, plane, wire, clumps, rnd, cyl, seamTex } from './kit.js';
import { paint, vn, fbm, frac, clamp, sm, hsh, paintFacade, paintStucco, paintTin, paintBoards, paintFascia, paintIron, paintWood, paintConcrete, paintStrip, paintFace, paintGrassAtlas, paintCornAtlas, paintNameBoard, paintHangSign, paintVendFront, paintLeafAtlas, paintFarTrees } from './paint.js';
import { inkRGB } from './inks.js';
import { F3_SAYS, F3_WALL } from './f03-says.js';
import { SRC } from './sound.js';
import { buildMore, cornClear, onTunnelRoof, groundSay, tickMore, TUN } from './station2.js';

/* (milestone 2) what you can click: a mesh carries the key of its lines in F3_SAYS (the Seam version's, word for word),
   or a function that picks a line from where you clicked it */
export const CLICK = [];
export function tag(me, say, start){ me.userData.say = say; if (start) me.userData.sayI = start; CLICK.push(me); return me; }
/* the station building's walls: which bay you clicked (the same sums as Seam's f03-road lookAction) */
function wallSay(hit){
  const x = hit.point.x, y = hit.point.y, z = hit.point.z;
  if (z > 12.9) return F3_WALL.back[0];
  if (z < 8.1) {
    const bay = ((x - 9) % 3 + 3) % 3, door = bay > 0.95 && bay < 2.05 && Math.floor((x - 9)/3) % 2 === 0 && y < 2.45, win = !door && bay > 1.05 && bay < 1.95 && y > 0.95 && y < 2.25;
    if (x > 9.3 && x < 9.85 && y > 1.5 && y < 1.8) return F3_WALL.plaque[0];
    if (door) return (F3_SAYS.door || F3_WALL.doors)[(Math.random()*2) | 0];   /* (Seam's last pass: the boards, the chain, the padlock) */
    if (win) return (F3_SAYS.window || F3_WALL.window)[0];
    return (F3_SAYS.station || F3_WALL.stucco)[0];
  }
  return (F3_SAYS.station || F3_WALL.stucco)[0];
}

/* ---------------- the ground ---------------- */
const TX0 = -10, TZ0 = -14, TW = 60, TD = 56;   /* (Nov 17, evening: on to z 42, for the second mileage sign and the poles going off) */
const ROAD = [29, 31];
export function groundAt(x, z){
  const g = groundAt0(x, z);
  if (x > TUN.x - 0.1 && Math.abs(z - TUN.zc) < TUN.hw + 0.6) return -0.62;   /* (the track bed, on into the tunnel) */
  if (x > TUN.x + 0.2 && z > -2.8 && z < 6.8 && !(Math.abs(z - TUN.zc) < TUN.hw + 0.6)) {   /* the bank the line goes into, east of the platform */
    const k = sm(TUN.x + 0.22, TUN.x + 0.55, x)*sm(-2.8, -1.2, z)*sm(6.8, 5.2, z); return g + (TUN.bank + 0.02 - g)*k; }
  return g;
}
function groundAt0(x, z){
  if (z < 0.9) return -0.62 + 0.42*sm(0.95, 0.35, z) + 0.1*sm(0.3, -2, z);   /* the bank north of the track, into the corn */
  if (z < 3.05) return -0.62;   /* the track bed */
  if (z < 8) return -0.12;      /* gravel past the platform's ends (the platform is its own box) */
  const road = x > ROAD[0] - 0.2 && x < ROAD[1] + 0.2;
  const ramp = -0.3*sm(8, 10.6, z);   /* (accessible: the road leaves the platform as a long gentle slope, no step) */
  if (road) return ramp;
  let h = -0.3 + 0.22*(fbm(x*0.13 + 4, z*0.13) - 0.5) + 0.06*(vn(x*0.6, z*0.6) - 0.5);
  h = Math.min(h, -0.3 + 0.3) ;
  const dW = Math.abs(x - (ROAD[0] - 1.1)), dE = Math.abs(x - (ROAD[1] + 1.1));
  h -= 0.2*sm(0.7, 0.1, Math.min(dW, dE))*sm(9, 11, z);   /* the ditches either side of the road */
  const nearRoad = sm(1.6, 0.2, Math.min(Math.abs(x - ROAD[0]), Math.abs(x - ROAD[1])));
  h = h*(1 - nearRoad*0.4) + ramp*nearRoad*0.4;
  if (z < 9) h = h*sm(8, 9, z) + (-0.3)*(1 - sm(8, 9, z));   /* meets the building's foot and the platform's back evenly */
  return h;
}
/* where things meet the ground, it's darker (light can't get in): the foot of the building, the shed, the platform's
   back, the poles */
function contact(x, z){
  const dB = Math.max(Math.max(9 - x, x - 25, 0), Math.max(8 - z, z - 13, 0)), dS = Math.max(Math.max(25 - x, x - 28.9, 0), Math.max(8 - z, z - 9.6, 0));
  const dP = z > 8 && x > 9 && x < 32 ? z - 8 : 9;
  let o = 0.45*sm(0.9, 0, Math.min(dB, dS)) + 0.3*sm(0.6, 0, dP);
  for (const zp of [10.58, 24.58]) { const d = Math.hypot(x - 31.98, z - zp); o += 0.35*sm(0.5, 0.05, d); }
  o += 0.35*sm(0.5, 0.05, Math.hypot(x - 32.38, z - 20.45));   /* (the cut pole never touches the ground; the newer one beside it does) */
  if (Math.abs(z - TUN.zc) < TUN.hw + 0.6) o = Math.max(o, 0.95*sm(TUN.x - 0.6, TUN.x + 1.6, x));   /* (the track bed going into the tunnel: into the dark) */
  return Math.min(o > 0.6 ? o : 0.6, o);
}
function paintGround(){
  return paint(2048, 1911, TW, TD, (u, v) => {
    const x = TX0 + u, z = TZ0 + (TD - v);
    const n = vn(x*3, z*3), f = fbm(x*0.5, z*0.5), g = vn(x*14, z*14), fine = vn(x*60, z*60), c = contact(x, z);
    const r = (ramp, t, ht, ro) => [ramp, clamp(t*(1 - c), 0, 1), 1, ht, ro];
    if (z < 0.9) return r(f > 0.5 ? 'hwood' : 'hsage', 0.2 + 0.12*n - 0.1*sm(0.9, -1, z) + 0.04*fine, 0.4 + 0.3*g, 1);   /* under the corn */
    if (z < 3.05) {   /* ballast: stones, the dark between them, rust stain under the rails */
      const st = vn(x*22, z*22), st2 = vn(x*44 + 5, z*44), rust = Math.abs(z - 1.55) < 0.12 || Math.abs(z - 2.45) < 0.12;
      const stone = Math.max(st, st2*0.9);
      return r(rust && stone > 0.45 ? 'hrust' : 'hgrey', (stone > 0.55 ? 0.42 : 0.2) + 0.12*g + 0.05*fine - (rust ? 0.08 : 0), stone, stone > 0.55 ? 0.75 : 1);
    }
    if (z < 8) {   /* gravel, dead grass coming through */
      const gv = vn(x*40, z*40);
      if (f > 0.58) return r('hgold', 0.25 + 0.15*g + 0.04*fine, 0.5 + 0.3*fine, 1);
      return r('hgrey', 0.3 + 0.18*vn(x*25, z*25) - 0.06*n + 0.06*(gv - 0.5), gv, 0.95);
    }
    if (x > ROAD[0] && x < ROAD[1]) {   /* the road: old asphalt, patched, a faded double yellow; damp, a little sheen */
      const cc = x - 30, line = Math.abs(Math.abs(cc) - 0.06) < 0.035 && fbm(x*2, z*0.8) < 0.68 && z > 9;
      const crack = Math.abs(frac(x*0.9 + fbm(x, z*0.6)*1.4) - 0.5) < 0.01 && fbm(x*0.5 + 3, z*0.5) > 0.55;
      if (line) return r('hamber', 0.42 - 0.12*vn(x*40, z*6), 0.6, 0.7);
      const patch = fbm(x*0.9 + 7, z*0.4) > 0.63, edge = Math.min(x - ROAD[0], ROAD[1] - x) < 0.12 && vn(x*10, z*10) > 0.4;
      if (edge) return r('hgold', 0.3, 0.6, 1);
      const wet = sm(0.6, 0.7, fbm(x*0.7 + 2, z*0.5));
      return r('sstone', (patch ? 0.24 : 0.34) + 0.1*vn(x*30, z*30) + 0.05*(fine - 0.5) - 0.06*f - (crack ? 0.12 : 0) - 0.04*wet, 0.5 + 0.2*fine - (crack ? 0.4 : 0), 0.72 - 0.45*wet);
    }
    /* the fields: mud, dead grass, the odd puddle (puddles are smooth and shine) */
    { const pd = pathDist(x, z), wd = Math.hypot(x - 47.6, z - 20.4); if (pd < 0.62 || wd < 1.9) { const e = pd < 0.62 ? sm(0.62, 0.2, pd) : sm(1.9, 1.2, wd);   /* (Nov 18) the trodden path to the windmill: packed earth, two worn ruts, a few stones */
      if (e > 0.25) { const rut = pd < 0.62 && Math.abs(pd - 0.22) < 0.07; return r('hwood', 0.2 + 0.08*vn(x*12, z*12) + 0.05*fine - (rut ? 0.05 : 0) + (vn(x*40, z*40) > 0.86 ? 0.15 : 0), 0.4 + 0.3*fine, 0.85); } } }
    const pud = fbm(x*0.35 + 11, z*0.35);
    if (pud > 0.69) return r('hnight', 0.2 + 0.14*vn(x*4, z*4), 0.1, 0.08 + 0.2*sm(0.69, 0.75, pud)*0);
    const mud = f > 0.55 || (Math.abs(frac(x*0.9) - 0.5) < 0.12 && z > 11), rim = pud > 0.64;
    if (mud || rim) return r('hwood', 0.22 + 0.12*n + 0.06*g + 0.04*fine, 0.3 + 0.3*g + 0.2*fine, rim ? 0.45 : 0.75);
    return r(n > 0.62 ? 'hsage' : 'hgold', 0.24 + 0.14*g + 0.06*n + 0.05*fine, 0.5 + 0.4*fine, 1);
  }, { nrm:1.2 });
}
function groundMesh(){
  const g = new THREE.PlaneGeometry(TW, TD, TW*4, TD*4); g.rotateX(-Math.PI/2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) + TX0 + TW/2, z = p.getZ(i) + TZ0 + TD/2; p.setXYZ(i, x, groundAt(x, z), z); }
  g.computeVertexNormals();
  const t = paintGround(); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  const me = new THREE.Mesh(g, mat(t)); me.receiveShadow = true; K.scene.add(me); tag(me, hit => groundSay(hit, ROAD));
}

/* ---------------- the sky: dusk, overcast. plum overhead, the last warm light low in the west. its horizon is the
   fog's own colour, so the fog fades into it (no wall of colour). ---------------- */
function sky(){
  const m = new THREE.ShaderMaterial({ side:THREE.BackSide, depthWrite:false, fog:false,
    uniforms:{ uHor:{ value:new THREE.Color() }, uTop:{ value:new THREE.Color() }, uWest:{ value:new THREE.Color() } },
    vertexShader:'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position, 1.0); gl_Position.z = gl_Position.w; }',
    fragmentShader:'uniform vec3 uHor, uTop, uWest; varying vec3 vD;\n' +
      'float hs(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)))*43758.5453); }\n' +
      'float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f); return mix(mix(hs(i), hs(i + vec2(1, 0)), f.x), mix(hs(i + vec2(0, 1)), hs(i + vec2(1, 1)), f.x), f.y); }\n' +
      'float cl(vec2 p){ return vn(p)*0.55 + vn(p*2.3 + 7.0)*0.3 + vn(p*5.1 + 3.0)*0.15; }\n' +
      'void main(){ float h = clamp(vD.y, 0.0, 1.0); vec3 c = mix(uHor, uTop, smoothstep(0.02, 0.6, h)); float w = max(-vD.x, 0.0)*(1.0 - smoothstep(0.0, 0.25, h)); c = mix(c, uWest, w*0.6);\n' +
      /* (Nov 18, Aisling: "setting sun and smudge of moon") the sun going down in the west, low, behind the fog and the cloud: a soft disc you can just make out, its glow spreading along the horizon; and high in the south-east a smudge of moon, pale, half lost in cloud */
      '  vec2 cp = vD.xz/(vD.y + 0.35)*2.2; float cloud = cl(cp);\n' +
      '  vec3 S = normalize(vec3(-0.95, 0.21, 0.28)); float d = max(dot(vD, S), 0.0);\n' +
      '  float veil = 0.55 + 0.45*smoothstep(0.75, 0.3, cloud);\n' +
      '  c += uWest*vec3(1.15, 0.78, 0.55)*(pow(d, 6.0)*0.28 + pow(d, 40.0)*0.35)*veil;\n' +
      '  c = mix(c, vec3(1.0, 0.74, 0.52)*max(uWest*1.9, vec3(0.5)), smoothstep(0.9989, 0.9995, d)*0.62*veil);\n' +
      '  vec3 Mo = normalize(vec3(0.5, 0.5, 0.7)); float m = max(dot(vD, Mo), 0.0), md = smoothstep(0.99845, 0.99905, m), mg = pow(m, 220.0);\n' +
      '  float smud = 0.35 + 0.65*smoothstep(0.85, 0.35, cl(cp*1.6 + 11.0));\n' +
      '  c = mix(c, vec3(0.66, 0.62, 0.57), (md*0.5 + mg*0.2)*smud);\n' +
      '  gl_FragColor = vec4(c, 1.0); }' });
  const me = new THREE.Mesh(new THREE.SphereGeometry(60, 24, 12), m); me.frustumCulled = false; me.renderOrder = -1; K.scene.add(me); return m;
}

/* ---------------- light: the canopy's bare bulbs under tin shades, the awning's bulb, the drinks machine's display,
   the street lamp where the road leaves the platform (Seam's F3L, same places). bulbs are spot lights pointing down
   (the shade stops light going up), and every one casts shadows; nothing here moves, so the shadows are drawn once.
   two of the bulbs struggle: they dim and come back slowly, never a flicker. ---------------- */
export const L = { bulbs:[], halos:[], hemi:null, west:null, lamp:null, vend:null, shaft:null, skyM:null, fog:null };
export function halo(x, y, z, s, col){
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'), gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(cv);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:t, color:col, blending:THREE.AdditiveBlending, depthWrite:false, transparent:true, fog:true }));
  sp.position.set(x, y, z); sp.scale.set(s, s, 1); K.scene.add(sp); L.halos.push(sp); return sp;
}
function spot(x, y, z, angle, dist, col, mapSize){
  const s = new THREE.SpotLight(col, 1, dist, angle, 0.75, 2); s.position.set(x, y, z); s.target.position.set(x, y - 3, z);
  s.castShadow = true; s.shadow.mapSize.set(mapSize, mapSize); s.shadow.bias = -0.0015; s.shadow.normalBias = 0.02; s.shadow.camera.near = 0.08; s.shadow.radius = 3;
  K.scene.add(s); K.scene.add(s.target); return s;
}

/* ---------------- build ---------------- */
/* what a thing standing here stands in (for its footing, roots.js): the platform's concrete, the road's asphalt, or earth */
export function surfaceAt(x, z){
  if (x > 8.9 && x < 32.1 && z > 7.85 && z < 8.05) return null;   /* (door frames and the wall's foot: not standing in the platform) */
  if (x > 8.9 && x < 32.1 && z > 3.1 && z < 8.05) return { y:0, kind:'concrete' };
  if (x > 8.6 && x < 29.2 && z > 7.7 && z < 13.4) return null;   /* (inside the buildings) */
  if (x > ROAD[0] - 0.05 && x < ROAD[1] + 0.05 && z > 7.9) return { y:groundAt(x, z), kind:'concrete' };
  return { y:groundAt(x, z), kind:'earth' };
}
export function buildStation(scene){
  kitInit(scene);
  const T = {
    facade: sized(paintFacade(), 6, 3.4), stucco: sized(paintStucco(), 4, 3.4), tin: sized(paintTin(true), 1, 2), tinG: sized(paintTin(false), 1, 2),
    boards: sized(paintBoards(), 0.5, 2), fascia: sized(paintFascia(), 0.64, 0.43), iron: sized(paintIron(), 0.5, 1),
    wood: sized(paintWood(false), 0.25, 1), woodD: sized(paintWood(true), 0.25, 1), conc: sized(paintConcrete(), 23, 5), strip: sized(paintStrip(), 1, 0.5), face: sized(paintFace(), 4, 1),
  };
  const M = {
    facade: mat(T.facade), stucco: mat(T.stucco), tin: mat(T.tin, { rough:0.7, metal:0.3 }), tinG: mat(T.tinG, { rough:0.7, metal:0.3 }), boards: mat(T.boards),
    fascia: mat(T.fascia, { cut:0.5, two:true }), iron: mat(T.iron, { rough:0.6, metal:0.2 }), wood: mat(T.wood), woodD: mat(T.woodD), conc: mat(T.conc, { rough:0.85 }),
    strip: mat(T.strip), face: mat(T.face), dark: mat(null, { color:0x1b1411 }), wire: mat(null, { color:0x120d0b }),
    rail: new THREE.MeshStandardMaterial({ color:0x4e4844, roughness:0.45, metalness:0.6 }),
    glass: new THREE.MeshStandardMaterial({ color:0x2a1a08, emissive:new THREE.Color(1.0, 0.72, 0.38), emissiveIntensity:6 }),
  };
  M.dark.userData.m = [1, 1];
  groundMesh();
  L.skyM = sky();

  /* ---- the platform: concrete, the coping along the edge, the worn tactile strip ---- */
  box(9, 32, -0.62, 0, 3, 8, [M.face, M.face, M.conc, M.conc, M.face, M.face], { uvOff:[0, 0] });
  box(9, 32, -0.08, 0.012, 2.92, 3.28, mat(T.conc, { color:0xc8c0b8 }), { solid:false });   /* the coping, its lip over the track */
  plane(23, 0.3, M.strip, 20.5, 0.006, 3.62, 0, { world:true, cast:false }).rotation.x = -Math.PI/2;

  /* ---- the track: ballast (painted in the ground), sleepers, two rails ---- */
  const sl = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.1, 1.7), M.woodD, 90), m4 = new THREE.Matrix4();
  for (let i = 0; i < 90; i++) { m4.makeTranslation(-6 + i*0.6, -0.58, 2.0 + (hsh(i, 3) - 0.5)*0.04); sl.setMatrixAt(i, m4); }
  sl.receiveShadow = true; sl.castShadow = true; scene.add(sl);
  /* the rails in their real shape (foot, web, head), on tie plates */
  const rs = new THREE.Shape(); [[-0.065, 0], [0.065, 0], [0.065, 0.012], [0.012, 0.03], [0.009, 0.11], [0.032, 0.12], [0.032, 0.15], [-0.032, 0.15], [-0.032, 0.12], [-0.009, 0.11], [-0.012, 0.03], [-0.065, 0.012]].forEach((p, i) => i ? rs.lineTo(p[0], p[1]) : rs.moveTo(p[0], p[1]));
  const railG = new THREE.ExtrudeGeometry(rs, { depth:54, bevelEnabled:false }); railG.rotateY(Math.PI/2);
  for (const z of [1.55, 2.45]) { const me = new THREE.Mesh(railG, M.rail); me.position.set(-6, -0.535, z); me.castShadow = me.receiveShadow = true; scene.add(me); }
  const tp = new THREE.InstancedMesh(new THREE.BoxGeometry(0.17, 0.016, 0.24), M.iron, 180);
  for (let i = 0; i < 90; i++) for (let k = 0; k < 2; k++) { m4.makeTranslation(-6 + i*0.6, -0.528, k ? 2.45 : 1.55); tp.setMatrixAt(i*2 + k, m4); }
  tp.receiveShadow = true; scene.add(tp);

  /* ---- telephone poles along the line, wires between, sagging ---- */
  const PX = [4, 11, 18, 25, 32, 39], LZ = 0.8;   /* (Nov 17, night: back from the track to 0.8, so the real-size train clears them) */
  PX.forEach((x, i) => {
    tag(cyl(0.11, 0.09, 7.7, M.woodD, x + 0.08, -0.5, LZ, 14), 'pole'); SRC.poles.push({ x:x + 0.08, y:6.7, z:LZ }); K.solids.push({ x0:x, x1:x + 0.16, y0:-0.5, y1:7.2, z0:LZ - 0.08, z1:LZ + 0.08 }); box(x - 0.6, x + 0.76, 6.62, 6.74, LZ - 0.05, LZ + 0.05, M.woodD, { solid:false });
    if (i < PX.length - 1) [6.78, 6.78].forEach((y, k) => wire([x - 0.45 + k*1.05, y, LZ], [PX[i + 1] - 0.45 + k*1.05, y, LZ], 0.35, M.wire));
  });

  /* ---- the station building: stucco over brick, shut doors, papered windows; a real gabled tin roof ---- */
  box(8.92, 25.08, -0.42, 0.02, 7.95, 13.08, mat(T.face), { solid:false });
  tag(box(9, 25, 0, 3.4, 8, 13, [M.stucco, M.stucco, M.dark, M.dark, M.facade, M.facade], { flipU:[5] }), wallSay);
  K.solids.push({ x0:9, x1:25, y0:-1, y1:3.4, z0:8, z1:13 });
  (function roof(){
    const ridgeY = 5.05, eaveY = 3.32, z0 = 7.78, z1 = 13.22, zr = 10.5, run = zr - z0, rise = ridgeY - eaveY, ln = Math.hypot(run, rise), ang = Math.atan2(rise, run);
    for (const s of [-1, 1]) {
      const g = new THREE.BoxGeometry(16.6, 0.06, ln); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i)*16.6, uv.getY(i)*ln/2);
      const me = new THREE.Mesh(g, M.tin); me.position.set(17, (ridgeY + eaveY)/2, zr + s*run/2); me.rotation.x = s*ang; me.castShadow = me.receiveShadow = true; scene.add(me); tag(me, 'station');
    }
    for (const x of [9, 25]) {   /* the gables */
      const sh = new THREE.Shape(); sh.moveTo(-2.5, 0); sh.lineTo(2.5, 0); sh.lineTo(0, rise + 0.08); sh.lineTo(-2.5, 0);
      const g = new THREE.ShapeGeometry(sh); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i)/4, uv.getY(i)/3.4 + 0.2);
      const me = new THREE.Mesh(g, mat(T.stucco, { two:true })); me.position.set(x + (x < 10 ? -0.002 : 0.002), 3.4, 10.5); me.rotation.y = Math.PI/2; me.castShadow = me.receiveShadow = true; scene.add(me);
    }
    box(8.8, 25.2, ridgeY - 0.04, ridgeY + 0.08, zr - 0.09, zr + 0.09, M.iron, { solid:false });   /* the ridge cap */
  })();
  /* (Nov 17, later) the building in the round: frames round the doors, sills and lintels at the windows, a stone step
     at each back door, a chain and padlock across the front doors, the roof's eaves boards and barge boards, a rusted
     gutter and downpipes, an old junction box with its conduit */
  const doorsX = [9.95, 15.95, 21.95], winsX = [13.05, 19.05];
  for (const [zf, s] of [[8, -1], [13, 1]]) {
    const z0 = s < 0 ? zf - 0.06 : zf, z1 = s < 0 ? zf : zf + 0.06;
    for (const x of doorsX) {
      box(x - 0.09, x, 0, 2.55, z0, z1, M.woodD, { solid:false }); box(x + 1.1, x + 1.19, 0, 2.55, z0, z1, M.woodD, { solid:false });
      box(x - 0.12, x + 1.22, 2.45, 2.6, s < 0 ? zf - 0.09 : zf, s < 0 ? zf : zf + 0.09, M.woodD, { solid:false });
      if (s > 0) box(x - 0.2, x + 1.3, -0.42, -0.02, 13, 13.4, mat(T.face, { color:0xb8b0a8 }));   /* the step */
      if (s < 0) {   /* the chain across, and its lock */
        wire([x + 0.25, 1.15, 7.975], [x + 0.85, 1.15, 7.975], 0.12, M.iron, 0.012);
        box(x + 0.52, x + 0.6, 0.92, 1.02, 7.95, 7.985, M.iron, { solid:false, cast:false });
      }
    }
    for (const x of winsX) {
      box(x - 0.06, x + 0.96, 0.9, 0.97, s < 0 ? zf - 0.1 : zf, s < 0 ? zf : zf + 0.1, mat(T.face, { color:0xd0c8c0 }), { solid:false });   /* the sill */
      box(x - 0.05, x + 0.95, 2.25, 2.34, z0, z1, M.woodD, { solid:false });
      box(x - 0.05, x + 0.01, 0.97, 2.25, z0, z1, M.woodD, { solid:false }); box(x + 0.89, x + 0.95, 0.97, 2.25, z0, z1, M.woodD, { solid:false });
    }
  }
  box(8.8, 25.2, 3.18, 3.36, 13.18, 13.24, M.woodD, { solid:false });   /* the eaves board at the back */
  const gut = cyl(0.07, 0.07, 16.4, M.iron, 17, 3.18, 13.3, 8, { open:true, rz:Math.PI/2 }); gut.position.y = 3.18;
  for (const x of [9.15, 24.85]) { cyl(0.045, 0.045, 3.6, M.iron, x, -0.35, 13.3, 8); box(x - 0.06, x + 0.06, -0.33, -0.25, 13.25, 13.55, M.iron, { solid:false }); }   /* downpipes, a shoe at the foot */
  for (const [x, s] of [[9, -1], [25, 1]]) {   /* barge boards up the gables */
    for (const zs of [-1, 1]) { const g = new THREE.BoxGeometry(0.04, 0.16, Math.hypot(2.72, 1.73)); const me = new THREE.Mesh(g, M.woodD);
      me.position.set(x + s*0.21, (3.32 + 5.05)/2 - 0.02, 10.5 + zs*1.36); me.rotation.x = zs*Math.atan2(1.73, 2.72); me.castShadow = me.receiveShadow = true; scene.add(me); }
  }
  box(24.2, 24.55, 2.0, 2.4, 7.9, 8.0, M.iron, { solid:false }); box(24.35, 24.4, 2.4, 3.15, 7.95, 7.99, M.iron, { solid:false, cast:false });   /* junction box, conduit up into the canopy */
  /* the canopy's rafters, from the beam back to the wall */
  for (const x of [10.5, 13.5, 16.5, 19.5, 22.5, 9.05, 24.95]) box(x - 0.05, x + 0.05, 2.98, 3.15, 4.21, 8, M.woodD, { solid:false });

  /* on the wall: the bench, the poster, the line map, the timetable (Seam's own pictures, below) */
  tag(box(11.4, 12.76, 0.38, 0.43, 7.57, 7.95, M.wood), 'bench'); box(11.45, 11.55, 0, 0.38, 7.6, 7.92, M.woodD, { solid:false }); box(12.61, 12.71, 0, 0.38, 7.6, 7.92, M.woodD, { solid:false });
  tag(box(11.4, 12.76, 0.5, 0.81, 7.9, 7.95, M.wood, { solid:false }), 'bench');
  for (const x of [11.44, 12.64]) tag(box(x, x + 0.08, 0.43, 0.84, 7.86, 7.95, M.woodD, { solid:false }), 'bench');   /* (Nov 17, Aisling: the back was floating; two posts hold it to the seat) */
  [[14.6, 1.48, 0.7, 0.95, 'poster', 'f3poster'], [18, 1.65, 1.6, 0.6, 'linemap', 'f3linemap'], [20.7, 1.48, 0.8, 0.95, 'time', 'f3time']].forEach(p => {   /* (Nov 17, evening: Seam's own pictures of them, word for word) */
    const pm = new THREE.MeshStandardMaterial({ map:seamTex(p[5], 520, '#d8ccb0'), roughness:0.95 }); pm.userData.m = [1, 1]; tag(plane(p[2], p[3], pm, p[0], p[1], 7.985, Math.PI, { cast:false }), p[4]); });

  /* ---- the canopy: five rust-red iron columns, curved wooden brackets, the beam, the scalloped fascia, the roof ---- */
  const C = 3.15;
  [10.5, 13.5, 16.5, 19.5, 22.5].forEach(x => {
    tag(lathe([[0, 0], [0.13, 0], [0.13, 0.06], [0.1, 0.1], [0.075, 0.24], [0.058, 0.32], [0.058, 2.74], [0.075, 2.8], [0.1, 2.88], [0.11, 2.92], [0, 2.92]], M.iron, x, 0, 4.13, 12), 'column');
    K.solids.push({ x0:x - 0.1, x1:x + 0.1, y0:0, y1:C, z0:4.03, z1:4.23 });
    for (const s of [-1, 1]) {   /* the brackets, out both ways along the beam */
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0, 0.78); sh.lineTo(0.68, 0.78); sh.lineTo(0.68, 0.7); sh.absellipse(0.68, 0, 0.6, 0.7, Math.PI/2, Math.PI, false); sh.lineTo(0.08, 0); sh.lineTo(0, 0);
      const g = new THREE.ExtrudeGeometry(sh, { depth:0.07, bevelEnabled:false, curveSegments:10 }); g.translate(0, 0, -0.035);
      const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i)*4, uv.getY(i));
      const me = new THREE.Mesh(g, M.wood); me.position.set(x, 2.15, 4.13); me.scale.x = s; me.castShadow = me.receiveShadow = true; scene.add(me);
    }
  });
  box(9, 25, 2.93, C, 4.05, 4.21, M.woodD, { solid:false });   /* the beam */
  box(8.9, 25.1, C, C + 0.1, 3.9, 8.0, [M.woodD, M.woodD, M.tinG, M.boards, M.woodD, M.woodD], { solid:false });
  plane(16.2, 0.43, M.fascia, 17, C - 0.215, 3.89, 0, { world:true });
  for (const x of [8.89, 25.11]) plane(4.1, 0.43, M.fascia, x, C - 0.215, 5.95, Math.PI/2, { world:true });
  /* the bulbs: a tin shade, a bulb hot inside it, its flex up to the canopy */
  const shadeM = mat(T.tinG, { rough:0.6, metal:0.4, two:true });
  [12, 15, 18, 21, 24].forEach((x, i) => {
    tag(lathe([[0.012, 0.13], [0.04, 0.12], [0.08, 0.08], [0.15, 0.01], [0.16, 0]], shadeM, x, 2.66, 5.9, 12, { cast:false }), 'bulb', i === 1 || i === 3 ? 1 : 0);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 6), M.glass); b.position.set(x, 2.69, 5.9); scene.add(b); tag(b, 'bulb', i === 1 || i === 3 ? 1 : 0); SRC.bulbs.push({ x, y:2.66, z:5.9 });
    box(x - 0.006, x + 0.006, 2.79, C, 5.894, 5.906, M.wire, { solid:false, cast:false });
    const s = spot(x, 2.66, 5.9, 1.25, 9, 0xffb878, 2048); s.userData = { x, weak:i === 1 || i === 3, ph:i*1.7 };
    L.bulbs.push(s); halo(x, 2.67, 5.9, 0.42, 0xffc890);
  });
  /* the hanging sign, lit from inside, on two rods */
  const hs = paintHangSign(); const hsM = new THREE.MeshStandardMaterial({ map:hs, emissiveMap:hs, emissive:new THREE.Color(1, 0.86, 0.62), emissiveIntensity:1.1, roughness:0.8 });
  tag(box(15.2, 17.4, 2.18, 2.66, 5.9, 5.96, [M.dark, M.dark, M.dark, M.dark, hsM, hsM], { solid:false, cast:false }), 'sign');
  for (const x of [15.5, 17.1]) box(x, x + 0.02, 2.66, C, 5.92, 5.94, M.wire, { solid:false, cast:false });

  /* ---- the corner: the shed, its awning, the phone, the bin, the jerry can, the drinks machine ---- */
  tag(box(25, 28.9, -0.3, 2.62, 8, 9.6, M.tinG), () => F3_WALL.back[1]);
  box(24.95, 29.05, 2.62, 2.7, 7, 9.7, [M.tinG, M.tinG, M.tin, M.tinG, M.tinG, M.tinG], { solid:false });
  box(25, 29, 2.48, 2.62, 6.98, 7.02, M.tin, { solid:false });
  for (const x of [25.05, 28.9]) box(x, x + 0.05, 0, 2.62, 7.0, 7.05, M.iron);
  { const pf = new THREE.MeshStandardMaterial({ map:seamTex('f3phone', 300, '#5a504a'), roughness:0.5 }), ps = new THREE.MeshStandardMaterial({ map:seamTex('f3phoneSide', 200, '#8b8a87'), roughness:0.6 }), pk = mat(null, { color:0x5a504a });
    pf.userData.m = [0.6, 2.05]; ps.userData.m = [0.65, 2.05];
    tag(box(8.32, 8.97, -0.3, 1.75, 9.55, 10.15, [pk, pf, pk, pk, ps, ps]), 'phone'); }   /* the payphone, at the station's west end (Seam's second pass moved it there: it hid the tobacco window) */   /* the payphone (its close-up: milestone 2) */
  { const bb = new THREE.MeshStandardMaterial({ map:seamTex('f3binBody', 400, '#7e7b74'), roughness:0.95 }), hf = new THREE.MeshStandardMaterial({ map:seamTex('f3binHoodF', 500, '#86837c'), roughness:0.95 }), hs = new THREE.MeshStandardMaterial({ map:seamTex('f3binHoodS', 300, '#86837c'), roughness:0.95 }), bt = mat(T.conc, { color:0x9a968e });
    bb.userData.m = [0.36, 0.6]; hf.userData.m = [0.42, 0.26]; hs.userData.m = [0.4, 0.26];   /* (Seam's bin with eyes: grey concrete gone grimy, a hood over it, its two eyes) */
    tag(box(26.02, 26.38, 0, 0.6, 7.59, 7.95, [bb, bb, bt, bt, bb, bb]), 'bin'); tag(box(25.99, 26.41, 0.6, 0.86, 7.55, 7.95, [hs, hs, bt, bt, hs, hf], { solid:false }), 'bin'); }
  { const jf = new THREE.MeshStandardMaterial({ map:seamTex('f3jcF', 600, '#b8847a'), roughness:0.7, alphaTest:0.4 }), js = new THREE.MeshStandardMaterial({ map:seamTex('f3jcS', 600, '#b8847a'), roughness:0.7, alphaTest:0.4 }), jt = mat(null, { color:0xb8847a });
    jf.userData.m = [0.26, 0.36]; js.userData.m = [0.18, 0.36];   /* (Seam's faded pink kerosene can, 灯油 moulded faint on its side) */
    tag(box(26.42, 26.68, 0, 0.36, 7.77, 7.95, [js, js, jt, jt, jf, jf]), 'jerry'); }
  const vf = paintVendFront(); sized(vf, 1.02, 1.86); vf.wrapS = vf.wrapT = THREE.ClampToEdgeWrapping;
  const vfM = new THREE.MeshStandardMaterial({ map:vf, emissiveMap:vf, emissive:new THREE.Color(0.9, 0.82, 0.7), emissiveIntensity:0.32, roughness:0.5 });
  const vs = mat(null, { color:0xd8d2c8 });
  /* (milestone 2) the old red machine, Seam's own picture of it (f3vm2: Drink Smile, the cream wave, four cans: chocolate
     creme, lemon cola, ultra violet, cherry cheer), its sides f3vmSide2 */
  const vmT = seamTex('f3vm2', 420, '#8e2a22'), vsT = seamTex('f3vmSide2', 300, '#8e2a22');
  const vmF = new THREE.MeshStandardMaterial({ map:vmT, emissiveMap:vmT, emissive:new THREE.Color(0.9, 0.82, 0.7), emissiveIntensity:0.22, roughness:0.55 });
  const vmS = new THREE.MeshStandardMaterial({ map:vsT, roughness:0.6 });
  const vcT = seamTex('f3vmClip2', 420, '#8e2a22'), vmC = new THREE.MeshStandardMaterial({ map:vcT, roughness:0.75 });   /* (Nov 17: the east side carries the clippings, as in Seam) */
  vmF.userData.m = [1.02, 1.86]; vmS.userData.m = [0.75, 1.86]; vmC.userData.m = [0.75, 1.86];   /* (one picture per face, not tiled) */
  tag(box(26.92, 27.94, 0, 1.86, 7.2, 7.95, [vmC, vmS, vs, vs, vmS, vmF]), 'vending'); SRC.vend = { x:27.43, y:1.2, z:7.15 };
  L.vend = new THREE.PointLight(0xffe2c0, 1, 3.2, 2); L.vend.position.set(27.43, 1.3, 6.9); scene.add(L.vend);
  const ab = spot(26.6, 2.42, 7.4, 1.2, 6, 0xffb070, 1024); ab.userData = { weak:false, ph:4 }; L.bulbs.push(ab);
  lathe([[0.01, 0.1], [0.06, 0.07], [0.12, 0.0]], shadeM, 26.6, 2.42, 7.4, 10, { cast:false });
  const ab2 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), M.glass); ab2.position.set(26.6, 2.44, 7.4); scene.add(ab2); halo(26.6, 2.44, 7.4, 0.45, 0xffc890);

  /* ---- the name board by the track, in its rusted frame ---- */
  const nb = paintNameBoard(); const nbM = mat(nb, { rough:0.5, emit:0x8a8278, emitMap:nb, emitK:0.35 });   /* white enamel holds the last of the light */ nbM.userData.m = [1.7, 0.95];
  tag(box(27.0, 28.7, 0.8, 1.75, 3.55, 3.6, [M.iron, M.iron, M.iron, M.iron, nbM, nbM], { solid:false }), 'name');
  for (const x of [27.0, 28.63]) tag(box(x, x + 0.07, 0, 1.75, 3.54, 3.61, M.iron), 'name');

  /* ---- (milestone 2) Seam's details round 1 (f03-details): the newspaper left on the bench, the pit beside it, the
     dumpster out back, the missing poster on the road's pole; their pictures are Seam's own and their clicks run Seam's
     own actions (the close-ups, searching the dumpster, pocketing the pit) ---- */
  const nwT = seamTex('f3newsTop', 900, '#dccb9e');
  const nwM = new THREE.MeshStandardMaterial({ map:nwT, roughness:0.9 }); nwM.userData.m = [0.55, 0.32];
  tag(box(12.0, 12.55, 0.43, 0.445, 7.6, 7.92, [mat(null, { color:0xd8ccb0 }), mat(null, { color:0xd8ccb0 }), nwM, mat(null, { color:0xd8ccb0 }), mat(null, { color:0xd8ccb0 }), mat(null, { color:0xd8ccb0 })], { solid:false, cast:false }), 'news');
  let pitGot = false; try { pitGot = localStorage.getItem('nullgrey.f3.pit') === '1'; } catch (e) {}
  if (!pitGot) { const pt = seamTex('f3pit', 1400, '#8a5a36'); const pm = new THREE.MeshStandardMaterial({ map:pt, transparent:true, alphaTest:0.4, roughness:0.8 });
    const pit = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.09), pm); pit.rotation.x = -Math.PI/2; pit.position.set(12.665, 0.432, 7.735); scene.add(pit); tag(pit, 'pit'); L.pit = pit; }
  const dF = seamTex('f3dumpF', 260, '#30261d'), dS = seamTex('f3dumpS', 260, '#30261d');
  const dmF = new THREE.MeshStandardMaterial({ map:dF, roughness:0.8 }), dmS = new THREE.MeshStandardMaterial({ map:dS, roughness:0.8 }); dmF.userData.m = [1.9, 1.6]; dmS.userData.m = [1.1, 1.6];
  tag(box(14.1, 16.0, -0.3, 1.3, 13.12, 14.22, [dmS, dmS, mat(T.iron, { color:0x6a5040 }), dmS, dmF, dmS]), 'dump');
  { const skT = seamTex('f3sky', 600, null); const sk = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.2325), new THREE.MeshStandardMaterial({ map:skT, transparent:true, alphaTest:0.4, roughness:0.85 }));
    sk.position.set(16.004, 0.716, 13.67); sk.rotation.y = Math.PI/2; sk.receiveShadow = true; scene.add(sk); tag(sk, 'dump'); }   /* (Nov 17) "sky", the Columbus tag, on the dumpster's east side: Seam's own picture of it */
  const msT = seamTex('f3miss', 900, '#dcd4c4');
  const ms = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.48), new THREE.MeshStandardMaterial({ map:msT, roughness:0.95 })); ms.position.set(31.86, 1.24, 24.58); ms.rotation.y = -Math.PI/2; ms.receiveShadow = true; scene.add(ms); tag(ms, 'missing');

  /* ---- the street lamp where the road leaves the platform: the one real lamp out here ---- */
  tag(cyl(0.075, 0.06, 4.6, M.woodD, 30.87, -0.3, 8.15, 12), 'lamp'); SRC.lamp = { x:30.36, y:3.95, z:8.15 }; K.solids.push({ x0:30.79, x1:30.95, y0:-0.3, y1:4.3, z0:8.07, z1:8.23 });
  box(30.25, 30.88, 4.12, 4.2, 8.13, 8.17, M.iron, { solid:false });
  tag(lathe([[0.012, 0.16], [0.05, 0.15], [0.12, 0.07], [0.21, 0.0]], shadeM, 30.36, 3.96, 8.15, 12, { cast:false }), 'lamp');
  const lb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), M.glass); lb.position.set(30.36, 3.99, 8.15); scene.add(lb);
  L.lamp = spot(30.36, 3.95, 8.15, 0.95, 16, 0xffbe80, 2048); L.lamp.userData = { weak:false, ph:0 };
  halo(30.36, 3.99, 8.15, 0.7, 0xffc890);
  /* its light falling through the fog: a faint cone */
  const cg = new THREE.ConeGeometry(2.6, 3.9, 20, 1, true); cg.translate(0, -1.95, 0);
  const cm = new THREE.ShaderMaterial({ transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide, uniforms:{ uK:{ value:0.05 }, uC:{ value:new THREE.Color(1.0, 0.72, 0.42) } },
    vertexShader:'varying float vH; varying vec3 vN, vV; void main(){ vH = -position.y/3.9; vec4 w = modelViewMatrix*vec4(position, 1.0); vV = normalize(-w.xyz); vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*w; }',
    fragmentShader:'uniform float uK; uniform vec3 uC; varying float vH; varying vec3 vN, vV; void main(){ float e = abs(dot(normalize(vN), normalize(vV))); float a = uK*pow(1.0 - vH, 1.6)*e*e; gl_FragColor = vec4(uC*a, 1.0); }' });
  L.shaft = new THREE.Mesh(cg, cm); L.shaft.position.set(30.36, 3.95, 8.15); scene.add(L.shaft);
  /* poles down the road, wires going off into the dusk */
  const PY = [10.5, 17.5, 24.5, 31.5, 38.5];   /* (17.5 is the cut pole: station2 hangs it from the wires) */
  PY.forEach((z, i) => { if (z !== 17.5) tag(cyl(0.11, 0.09, 7.5, M.woodD, 31.98, -0.5, z + 0.08, 14), 'pole'); if (z !== 17.5) { SRC.poles.push({ x:31.98, y:6.4, z:z + 0.08 }); K.solids.push({ x0:31.9, x1:32.06, y0:-0.5, y1:7, z0:z, z1:z + 0.16 }); box(31.4, 32.56, 6.4, 6.52, z + 0.03, z + 0.13, M.woodD, { solid:false }); }
    wire([30.88, 4.15, 8.15], [31.98, 6.5, 10.58], 0.2, M.wire, 0.008);
    if (i < PY.length - 1) for (const k of [-0.4, 0.4]) wire([31.98 + k, 6.56, z + 0.08], [31.98 + k, 6.56, PY[i + 1] + 0.08], 0.45, M.wire); });

  /* ---- (Nov 17, from Aisling's reference pictures) the wires get busier, the way country and Japanese town poles are:
     glass insulators on the crossarms, a transformer can on two poles, more lines at different sags, service drops
     to the shed and the building, a guy wire with its yellow-and-black striped guard ---- */
  const insM = mat(null, { color:0x6e675e, rough:0.4 });
  const insul = (x, y, z) => cyl(0.03, 0.025, 0.09, insM, x, y, z, 6, { cast:false });
  PX.forEach(x => { for (const k of [-0.5, -0.2, 0.36, 0.66]) insul(x + 0.08 + k, 6.74, LZ); });
  PY.forEach(z => { if (z !== 17.5) for (const k of [-0.5, -0.2, 0.2, 0.5]) insul(31.98 + k, 6.52, z + 0.08); });
  const can = (x, y, z) => { cyl(0.2, 0.2, 0.62, mat(T.tinG, { color:0x9a948c }), x, y, z, 10); cyl(0.21, 0.17, 0.06, M.iron, x, y + 0.62, z, 10); box(x - 0.04, x + 0.04, y + 0.1, y + 0.5, z - 0.24, z - 0.2, M.iron, { solid:false }); };
  can(18.08, 5.5, LZ - 0.26);   /* (the road's can is on the newer pole by the cut one now: station2) */
  for (let i = 0; i < PX.length - 1; i++) for (const [dx, y, sg] of [[-0.12, 6.78, 0.5], [0.66, 6.78, 0.3], [0.2, 6.3, 0.7], [0.08, 5.6, 0.9]]) wire([PX[i] + dx, y, LZ], [PX[i + 1] + dx, y, LZ], sg, M.wire, 0.009);
  for (let i = 0; i < PY.length - 1; i++) for (const [dx, y, sg] of [[-0.2, 6.56, 0.6], [0.2, 6.56, 0.38], [0, 5.9, 0.8]]) wire([31.98 + dx, y, PY[i] + 0.08], [31.98 + dx, y, PY[i + 1] + 0.08], sg, M.wire, 0.009);
  wire([31.98, 5.9, 10.58], [28.9, 2.4, 9.0], 0.3, M.wire, 0.008);   /* the service drop to the shed */
  wire([31.98, 6.3, 10.58], [25.0, 3.0, 13.1], 0.5, M.wire, 0.008);  /* and to the building's back */
  wire([32.08, 6.4, LZ], [31.98, 6.4, 10.58], 0.6, M.wire, 0.009);  /* across the line to the road's poles */
  wire([25.08, 6.0, LZ], [31.98, 5.8, 10.58], 0.8, M.wire, 0.008);
  wire([31.98, 5.3, 10.5], [31.98, -0.3, 8.62], 0, M.wire, 0.008);   /* the guy wire on the first pole (where Seam has it: the line ends there), and its guard */
  const strT = sized(paint(16, 64, 0.1, 2, (x, y) => [frac(y*3.5) < 0.5 ? 'hamber' : 'hblack', frac(y*3.5) < 0.5 ? 0.5 - 0.15*fbm(x*30, y*6) : 0.15, 1, 0.5, 0.6]), 0.1, 2);
  const gd = cyl(0.04, 0.04, 2.1, mat(strT), 0, 0, 0, 8); const ga = Math.atan2(1.88, 5.6); gd.rotation.x = ga; gd.position.set(31.98, -0.3 + Math.cos(ga)*1.05, 8.62 + Math.sin(ga)*1.05);
  box(28.9, 28.96, 1.3, 1.62, 8.4, 8.75, mat(T.tinG, { color:0xb8b0a4 }), { solid:false });   /* an electric meter box on the shed's side */

  /* ---- fallen leaves, blown in: more against walls and in corners, a scatter on the platform and the road ---- */
  (function leaves(){
    const LR = rnd(777), L = [];
    const put = (x, z, y) => L.push([x, y + 0.004 + LR()*0.004, z, 0.1 + LR()*0.07, LR()*6.3, Math.floor(LR()*4)]);
    for (let i = 0; i < 1400; i++) { const x = 9.2 + LR()*22.6, z = 3.3 + LR()*4.6, near = sm(5.5, 7.95, z) + (x > 24 && x < 29 ? 0.5 : 0); if (LR() < 0.25 + 0.6*near) put(x, z, 0); }   /* on the platform, drifted toward the building */
    for (let i = 0; i < 900; i++) { const x = ROAD[0] - 0.6 + LR()*3.2, z = 9 + LR()*14; if (LR() < 0.6) put(x, z, groundAt(x, z)); }
    for (let i = 0; i < 700; i++) { const x = 8.5 + LR()*21, z = 13.05 + LR()*1.2; put(x, z, groundAt(x, z)); }
    const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI/2);
    const lm = new THREE.MeshStandardMaterial({ map:paintLeafAtlas(), alphaTest:0.5, roughness:0.85, side:THREE.DoubleSide }); lm.userData.noDetail = true;
    lm.onBeforeCompile = sh => { sh.vertexShader = 'attribute float aVar;\n' + sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n vMapUv.x = vMapUv.x*0.25 + aVar*0.25;'); };
    const im = new THREE.InstancedMesh(g, lm, L.length), M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), vars = new Float32Array(L.length);
    L.forEach((it, i) => { e.set((LR() - 0.5)*0.3, it[4], (LR() - 0.5)*0.3); q.setFromEuler(e); M4.compose(new THREE.Vector3(it[0], it[1], it[2]), q, new THREE.Vector3(it[3], 1, it[3])); im.setMatrixAt(i, M4); vars[i] = it[5]; });
    g.setAttribute('aVar', new THREE.InstancedBufferAttribute(vars, 1)); im.receiveShadow = true; im.computeBoundingSphere(); scene.add(im);
  })();

  /* ---- far away, past the corn: tree shapes standing in the fog, layer behind layer (not lit, just darker than the
     fog, so they read as depth, as in Folklore and Aisling's other pictures) ---- */
  (function far(){
    const FR = rnd(31), ft = paintFarTrees(), ring = [];
    for (let i = 0; i < 70; i++) { const a = FR()*Math.PI*2, r = 24 + FR()*16, x = 21 + Math.cos(a)*r*1.1, z = 11 + Math.sin(a)*r; ring.push([x, z, 0.7 + FR()*0.6, Math.floor(FR()*4), r]); }
    L.farM = [];
    for (const layer of [0, 1]) {
      const m = new THREE.ShaderMaterial({ transparent:false, fog:false, side:THREE.DoubleSide, uniforms:{ uMap:{ value:ft }, uC:{ value:new THREE.Color() }, uF:{ value:new THREE.Color() } },
        vertexShader:'attribute float aVar; varying vec2 vU; varying float vD; void main(){ vU = vec2(uv.x*0.25 + aVar*0.25, uv.y); vec4 w = instanceMatrix*vec4(position, 1.0); vec3 c = w.xyz; vec3 cam = cameraPosition; vec2 d = normalize(cam.xz - instanceMatrix[3].xz); vec3 p = instanceMatrix[3].xyz + vec3(-d.y, 0.0, d.x)*position.x*length(instanceMatrix[0].xyz) + vec3(0.0, position.y*length(instanceMatrix[1].xyz), 0.0); vD = length(cam.xz - instanceMatrix[3].xz); gl_Position = projectionMatrix*viewMatrix*vec4(p, 1.0); }',
        fragmentShader:'uniform sampler2D uMap; uniform vec3 uC, uF; varying vec2 vU; varying float vD; void main(){ if (vD < 15.0 || texture2D(uMap, vU).a < 0.5) discard; float k = smoothstep(15.0, 46.0, vD); gl_FragColor = vec4(mix(uC, uF, 0.25 + 0.6*k), 1.0); }' });
      const items = ring.filter(it => (it[4] > 32) === !!layer);
      const g = new THREE.PlaneGeometry(6, 9); g.translate(0, 4.5, 0);
      const im = new THREE.InstancedMesh(g, m, items.length), M4 = new THREE.Matrix4(), vars = new Float32Array(items.length);
      items.forEach((it, i) => { M4.makeScale(it[2], it[2]*(0.9 + 0.3*FR()), 1); M4.setPosition(it[0], -0.6, it[1]); im.setMatrixAt(i, M4); vars[i] = it[3]; });
      g.setAttribute('aVar', new THREE.InstancedBufferAttribute(vars, 1)); im.frustumCulled = false; im.renderOrder = -0.5; scene.add(im); L.farM.push(m);
    }
  })();

  /* ---- flakes of ash (Nov 17, later; Aisling: "thinner smaller a tad darker, more like small ash...falkier", then
     "very slow drifty not much very few"): only a few, hanging and drifting very slowly. small,
     thin, ragged grey flakes drifting down through the fog around you. each tumbles slowly as it falls, so it goes from a
     sliver to a flake and back (a slow turn, never a flash); a little warmer near the lamps. they live in a box that
     travels with you, so some are always close and the far ones fade into the fog ---- */
  (function flakes(){
    const MR = rnd(99), N = 580,   /* (Nov 18: "a teeny bit more ash like 1%") */ pos = new Float32Array(N*3), ph = new Float32Array(N*3);
    for (let i = 0; i < N; i++) { pos[i*3] = MR()*24; pos[i*3 + 1] = MR()*8; pos[i*3 + 2] = MR()*24; ph[i*3] = MR()*100; ph[i*3 + 1] = 0.007 + MR()*MR()*0.022; ph[i*3 + 2] = MR(); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aPh', new THREE.BufferAttribute(ph, 3));
    const m = new THREE.ShaderMaterial({ transparent:true, depthWrite:false, fog:false,
      uniforms:{ uT:K.wind.uTime, uGust:K.wind.uGust, uPx:{ value:1 }, uC:{ value:new THREE.Color() }, uFogF:{ value:18 }, uL:{ value:[new THREE.Vector3(30.36, 3.9, 8.15), new THREE.Vector3(18, 2.6, 5.9), new THREE.Vector3(24, 2.6, 5.9), new THREE.Vector3(12, 2.6, 5.9), new THREE.Vector3(15, 2.6, 5.9), new THREE.Vector3(21, 2.6, 5.9)] } },
      vertexShader:'attribute vec3 aPh; uniform float uT, uGust, uPx, uFogF; uniform vec3 uL[6]; varying float vA, vG, vRot, vFlat, vSeed;\n' +
        'void main(){ float t = uT + aPh.x*13.0; vec3 p = position;\n' +
        ' p.y -= t*(0.045 + aPh.y*1.6); p.x += sin(t*0.16 + aPh.x)*0.6 + t*(0.02 + uGust*0.08); p.z += cos(t*0.12 + aPh.x*1.7)*0.55 + t*0.01;\n' +
        ' p = mod(p - cameraPosition + vec3(12.0, 3.5, 12.0), vec3(24.0, 8.0, 24.0)) + cameraPosition - vec3(12.0, 3.5, 12.0);\n' +
        ' vec4 mv = viewMatrix*vec4(p, 1.0); float d = -mv.z;\n' +
        ' vA = smoothstep(0.2, 1.0, d)*(1.0 - smoothstep(uFogF*0.45, uFogF*0.9, d));\n' +
        ' float g = 0.0; for (int i = 0; i < 6; i++) { vec3 q = p - uL[i]; g += 1.0/(1.0 + dot(q, q)*0.5); } vG = g;\n' +
        ' float tb = t*(0.22 + aPh.z*0.3) + aPh.z*6.28; vRot = aPh.z*6.28 + t*0.12*(aPh.z - 0.5); vFlat = 0.18 + 0.82*abs(cos(tb)); vSeed = aPh.z*97.0;\n' +   /* the tumble: slow */
        ' gl_PointSize = clamp(aPh.y*projectionMatrix[1][1]*0.5*uPx*300.0/max(d, 0.3), 1.0, 16.0); gl_Position = projectionMatrix*mv; }',
      fragmentShader:'uniform vec3 uC; varying float vA, vG, vRot, vFlat, vSeed;\n' +
        'float h1(float x){ return fract(sin(x)*43758.5453); }\n' +
        'void main(){ vec2 q = gl_PointCoord - 0.5; float c = cos(vRot), s = sin(vRot); q = vec2(c*q.x - s*q.y, s*q.x + c*q.y);\n' +
        ' q.y /= vFlat; float an = atan(q.y, q.x); float rag = 0.32 + 0.1*sin(an*3.0 + vSeed) + 0.06*sin(an*7.0 + vSeed*1.7);\n' +   /* a ragged edge, its own for each flake */
        ' float r = length(q*vec2(1.0, 1.6)); float a = 1.0 - smoothstep(rag - 0.08, rag, r); if (a <= 0.01) discard;\n' +
        ' vec3 col = uC*0.62 + vec3(0.06, 0.05, 0.045) + vec3(1.0, 0.72, 0.42)*vG*0.32; gl_FragColor = vec4(col, a*vA*0.9); }' });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 5; scene.add(pts); L.motes = m;
  })();

  /* ---- light everywhere else: overcast dusk, almost gone. a dim sky, a faint warmth from the west ---- */
  L.hemi = new THREE.HemisphereLight(0x9a8a84, 0x4e4036, 1);   /* (the ground colour: light bouncing up off the platform and the fields, so ceilings aren't a void) */ scene.add(L.hemi);
  L.west = new THREE.DirectionalLight(0xc89a70, 0.2); L.west.position.set(-30, 8, 4); scene.add(L.west);

  TKM = buildMore({ scene, M, T, tag, groundAt, halo, L });   /* (Nov 17, evening) everything else the Seam version has */

  /* ---- grass, weeds and corn ---- */
  const R = rnd(4242), grass = [], corn = [];
  const inB = (x, z) => (x > 8.6 && x < 25.4 && z > 7.7 && z < 13.4) || (x > 24.8 && x < 29.2 && z > 7.6 && z < 9.9) || (x > ROAD[0] - 0.15 && x < ROAD[1] + 0.15 && z > 7.9);
  for (let i = 0; i < 11000; i++) {   /* the fields */
    const x = 1 + R()*40, z = 8.2 + R()*15.6; if (inB(x, z)) continue;
    const verge = Math.abs(x - ROAD[0]) < 1.7 || Math.abs(x - ROAD[1]) < 1.7;
    if (!verge && fbm(x*0.35, z*0.35) < 0.36 && R() < 0.7) continue;   /* bare patches */
    if (verge && R() < 0.35) continue;
    if (pathDist(x, z) < 0.5) continue;   /* (the path to the windmill) */
    grass.push([x, groundAt(x, z) - 0.02, z, (verge ? 0.55 : 0.36) + R()*0.4, R()*6.3, Math.floor(R()*4), (verge ? 1.0 : 0.8)*(0.5 + R()*R()*1.3)]);   /* heights all different: no hay bales */
  }
  for (let i = 0; i < 700; i++) {   /* the gravel past the platform's ends, along the track */
    const x = 1 + R()*40, z = 3.1 + R()*4.8; if (x > 8.9 && x < 32.1) continue; if (R() < 0.5 && fbm(x*0.5, z*0.5) < 0.5) continue;
    grass.push([x, -0.13, z, 0.35 + R()*0.5, R()*6.3, Math.floor(R()*4)]);
  }
  for (let i = 0; i < 240; i++) { const x = -2 + R()*44, z = 0.85 + R()*0.18; grass.push([x, groundAt(x, z), z, 0.5 + R()*0.5, R()*6.3, Math.floor(R()*4)]); }
  /* (Nov 18, Aisling: "no grass on concrete that is that long, like moss and a little ok, but there wouldnt be huge tufts")
     through the platform's cracks (Seam's spots): only small weeds, low, and moss round them and along the damp back edge */
  [[9.05, 3.2], [9.2, 7.55], [32.5, 3.3], [32.3, 7.6], [24.7, 7.62], [31.0, 7.7]].forEach(p => { grass.push([p[0], 0, p[1], 0.13 + R()*0.06, R()*6, Math.floor(R()*4), 0.5]); ROOTS.addMoss(p[0], p[1], 0.22 + R()*0.1); });
  for (let i = 0; i < 26; i++) { const x = 9.3 + R()*22.4; ROOTS.addMoss(x, 7.86 + R()*0.1, 0.12 + R()*0.16); }   /* moss in the shade where the platform meets the building */
  for (let i = 0; i < 10; i++) { const x = 9.3 + R()*22.4; ROOTS.addMoss(x, 3.18 + R()*0.06, 0.08 + R()*0.1); }   /* and a little at the coping */
  /* (Nov 18) round anything narrow standing in the earth (poles, posts, trunks) the ground is trodden and bare, so its
     footing shows: no tall grass right up against it, only a few short tufts a little way off */
  { const feet = K.solids.filter(o => o.x1 - o.x0 < 0.7 && o.z1 - o.z0 < 0.7);
    for (let i = grass.length - 1; i >= 0; i--) { const g = grass[i];
      for (const o of feet) { const cx = (o.x0 + o.x1)/2, cz = (o.z0 + o.z1)/2, r = Math.max(o.x1 - o.x0, o.z1 - o.z0)/2, d = Math.hypot(g[0] - cx, g[2] - cz);
        if (d < r + 0.35) { grass.splice(i, 1); break; } if (d < r + 0.8) { g[3] *= 0.6; if (g[6]) g[6] *= 0.6; } } } }
  clumps(grass, paintGrassAtlas(), 3, 1, 1.0);   /* (atlas: 4 clumps) */
  const cornAt = (x, z) => { if (R() < 0.08 || cornClear(x, z)) return; const cx = x + (R() - 0.5)*0.25, cz = z + (R() - 0.5)*0.25;
    let lx = 0, lz = 0; { const pd = pathDist(cx, cz); if (pd < 1.4) { const e = 0.03, gx = pathDist(cx + e, cz) - pathDist(cx - e, cz), gz = pathDist(cx, cz + e) - pathDist(cx, cz - e), gl = Math.hypot(gx, gz) || 1, k = (1 - pd/1.4)*0.32 + R()*0.06;
      lz = -gx/gl*k; lx = gz/gl*k; } }   /* (Nov 18) at the path's edge the corn leans out of the way, as trodden corn does */
    corn.push([cx, onTunnelRoof(x, z) ? TUN.bank - 0.02 : groundAt(x, z) - 0.05, cz, 1.0 + R()*0.3, R()*6.3, Math.floor(R()*4), 2.6, lx, lz]); };
  for (let x = -8; x < 48; x += 0.36) for (let z = -9; z < 0.55; z += 0.42) cornAt(x, z);              /* across the track */
  for (let x = -8; x < 48; x += 0.42) for (let z = 24.4; z < 37; z += 0.5) if (x < ROAD[0] - 0.6 || x > ROAD[1] + 1.6) cornAt(x, z);   /* (clear round the pole with the missing poster) */   /* the corn the road runs into */
  for (let x = -8; x < 0.6; x += 0.42) for (let z = 0.55; z < 24.4; z += 0.5) cornAt(x, z);           /* west */
  for (let x = 41.4; x < 48; x += 0.42) for (let z = 0.55; z < 24.4; z += 0.5) cornAt(x, z);           /* east */
  clumps(corn, paintCornAtlas(), 2, 1, 0.55, 8);

  return { bounds:{ x0:1.2, x1:40.8, z0:0.95, z1:24.0 }, solids:K.solids, ground:groundAt, surfaceAt };
}

/* ---------------- a look's lights and fog ---------------- */
export function applyLook(scene, V){
  const S = THREE.SRGBColorSpace, fc = new THREE.Color().setRGB(V.fog[0], V.fog[1], V.fog[2], S);
  if (!scene.fog) scene.fog = new THREE.Fog(fc, V.fogNear, V.fogFar); scene.fog.color.copy(fc); scene.fog.near = V.fogNear; scene.fog.far = V.fogFar;
  L.skyM.uniforms.uHor.value.copy(fc); L.skyM.uniforms.uTop.value.setRGB(V.skyTop[0], V.skyTop[1], V.skyTop[2], S); L.skyM.uniforms.uWest.value.setRGB(V.skyWest[0], V.skyWest[1], V.skyWest[2], S);
  L.hemi.intensity = V.hemi; L.west.intensity = V.west;
  if (L.motes) { L.motes.uniforms.uC.value.copy(fc); L.motes.uniforms.uFogF.value = V.fogFar; }
  if (L.farM) L.farM.forEach(m => { m.uniforms.uC.value.copy(fc).multiplyScalar(0.62); m.uniforms.uF.value.copy(fc); });   /* the nearer layer a little darker */
  L.lamp.intensity = V.lamp; L.vend.intensity = V.vend;
  for (const b of L.bulbs) if (b !== L.lamp) b.userData.base = V.bulb;
  for (const h of L.halos) h.material.opacity = V.halo;
  L.shaft.material.uniforms.uK.value = V.shaft;
  for (const b of L.bulbs) { b.shadow.radius = V.shadowSoft; }
  L.lamp.shadow.radius = V.shadowSoft;
}
/* the struggling bulbs: a slow dim and back, two to five seconds, never faster than a breath */
let TKM = null;
export function tickLights(t){
  tickMore(TKM, t, K.wind.uGust.value);
  for (const b of L.bulbs) {
    if (b === L.lamp) continue; let k = 1;
    if (b.userData.weak) { const s = Math.sin(t*0.9 + b.userData.ph)*0.5 + Math.sin(t*0.37 + b.userData.ph*2)*0.5; k = 0.62 + 0.38*clamp(s*0.5 + 0.6, 0, 1); }
    b.intensity = (b.userData.base || 1)*k;
  }
}
