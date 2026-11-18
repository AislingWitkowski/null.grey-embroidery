/* ================================================================
   EMBROIDERY · THE TRAIN (milestone 2, its last part; Nov 17, 2026, night). Aisling: "making sure the train works is
   important like mechanically".
   The Furusato line's own train, the one the Seam pages run (null.grey-furusatostation f8-train.js: Furusato's train,
   re-dressed from the station's d22-train.js), here at real size and in the round:
   - four cars, 8.7 m long, 0.3 m apart; three doors a side on each (every 3 m), big windows. stainless in an odd warm
     grey-white, ribbed low down; the line's gold stripe under the windows with a seigaiha wave pressed into it, a thin
     vermilion line under it; the line's round crest (ふ in a ring) on each car. a flat cab face at each end: a black
     mask round the windscreen, an amber destination board (各停 ・ ？？), the headlights in a band, a vermilion band.
   - inside: long bench seats in mustard moquette with a small asanoha pattern, a wooden slatted floor, cream walls,
     two lines of tube lamps, hanging straps with pale rings, and the line map over every door.
   - it comes out of the dusk from the west, brakes along the platform, stops just short of the tunnel mouth. the doors
     over the platform open (step-free: the floor is level with the platform). after a while, the departure melody,
     "ドアが閉まります…", the doors close, and it pulls away east into the tunnel, its windows lit, the red tail lamps
     last. first 25–40 s after you arrive, then every 2–3 min (Seam's numbers).
   - (Nov 17, later; Aisling: "it goes to Aldridge yes … weirdly the train runs both ways on one track cause dream
     logic") it runs both ways on the one track, turn and turn about: one comes from the west and goes on east into the
     tunnel, to Aldridge; the next comes out of the tunnel and goes west into the fog, to Furusato. they never meet.
   - getting on: walk in through an open door (Seam's words: "inside, it's cool and very clean…"). no choosing: the
     line map over the doors says where you are and what's next. when the doors close with you on, it pulls out with
     you: east, off the platform into the tunnel's dark; west, past the platform's end into the fog. the ride's lines,
     and the next page opens: the stand-in stop for Aldridge (stop.html, until Aldridge is built) or Furusato (Seam's
     page), as a Seam ride ends. step back out before the doors close and it goes on without you.
   - arriving by train (a Seam page's ride ending here): you open your eyes on the platform beside it; the doors close
     behind you and it goes on into the tunnel.
   The ride's line map, its words and where each stop goes are Seam's own, through the bridge (EG_SEAM.ride).
   ================================================================ */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { K } from './kit.js';
import { tex, vn, clamp, sm } from './paint.js';
import { inkRGB } from './inks.js';
import { P } from './player.js';
import { say } from './ui.js';
import { trainSound, soundAt } from './sound.js';

const col = (r, t) => { const c = inkRGB(r, t); return 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')'; };
export const TR = {
  L:8.7, G:0.3, N:4, DOORS:[1.35, 4.35, 7.35], DHW:0.5, ZC:2.0, HW:0.9, FL:0.02, BOT:-0.15, ROOF:2.25, TOP:2.47,
  dir:1,   /* (Nov 17, Aisling: "the train runs both ways on one track cause dream logic": east to Aldridge, west to Furusato, turn and turn about) */
  STOP:39.6, V0:8.5, BRAKE:36, ACC:0.95, DWELL:24, FIRST:[25000, 40000], EVERY:[120000, 180000], START:-46,
  state:'off', front:-200, v:0, t0:0, next:0, doorK:0, cars:[], solids:[], doorSol:[], boarded:-1, said:{}, chosen:-1, pick:-1, ride:null, sounds:{}, darkU:{ value:40.3 }
};
const rnd = (a, b) => a + Math.random()*(b - a);
const WINS = (() => { const W = [[0.14, 0.62]], D = TR.DOORS; for (let i = 0; i < D.length - 1; i++) { const a = D[i] + TR.DHW + 0.09, b = D[i + 1] - TR.DHW - 0.09, m = (a + b)/2; W.push([a, m - 0.03], [m + 0.03, b]); } W.push([TR.L - 0.62, TR.L - 0.14]); return W; })();
const WY0 = 0.95, WY1 = 1.75, DY1 = 2.0;
/* a car's back end in the world (car 0 is the front, at the east) */
const carX0 = k => TR.front - TR.L - k*(TR.L + TR.G);
export const trainRear = () => carX0(TR.N - 1);

/* ---------------- pictures, painted in code ---------------- */
function cv(w, h, draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
function steel(){   /* stainless, an odd warm grey-white; faint streaks, a little grime low down */
  return tex(cv(256, 256, (c, w, h) => { c.fillStyle = '#d2ccc1'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { c.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '255,250,240' : '90,80,70') + ',' + (0.03 + Math.random()*0.04) + ')'; c.fillRect(Math.random()*w, 0, 1 + Math.random()*3, h); }
    const g = c.createLinearGradient(0, h*0.6, 0, h); g.addColorStop(0, 'rgba(70,58,48,0)'); g.addColorStop(1, 'rgba(70,58,48,0.18)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }));
}
function ribbed(){   /* the old stainless cars' ribs, low down */
  return tex(cv(256, 128, (c, w, h) => { c.fillStyle = '#c9c3b8'; c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 8) { c.fillStyle = 'rgba(255,250,240,0.22)'; c.fillRect(x, 0, 2, h); c.fillStyle = 'rgba(60,50,42,0.22)'; c.fillRect(x + 5, 0, 2, h); }
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(60,48,40,0)'); g.addColorStop(1, 'rgba(60,48,40,0.35)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }));
}
function stripe(){   /* the line's gold, a seigaiha wave pressed into it */
  return tex(cv(256, 64, (c, w, h) => { c.fillStyle = '#c9a067'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(120,84,40,0.45)'; c.lineWidth = 2;
    for (let row = 0; row < 3; row++) for (let x = -32; x < w + 32; x += 32) { const ox = x + (row % 2)*16, oy = 18 + row*16; for (const r of [14, 9, 4]) { c.beginPath(); c.arc(ox, oy, r, Math.PI, 0); c.stroke(); } } }));
}
function crest(){   /* the line's crest: ふ in a ring */
  return tex(cv(128, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#c9a067'; c.lineWidth = 9; c.beginPath(); c.arc(64, 64, 52, 0, Math.PI*2); c.stroke();
    c.fillStyle = '#c9a067'; c.font = '900 70px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ふ', 64, 68); }), { clampEdge:true });
}
function cream(){ return tex(cv(64, 64, (c, w, h) => { c.fillStyle = '#e6ddc9'; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(120,100,80,0.04)'; c.fillRect(Math.random()*w, Math.random()*h, 6, 6); } })); }
function slats(){   /* the old japanese trains' wooden slatted floor */
  return tex(cv(128, 128, (c, w, h) => { for (let y = 0; y < h; y += 16) { c.fillStyle = col('hwood', 0.42 + Math.random()*0.08); c.fillRect(0, y, w, 13); c.fillStyle = col('hwood', 0.12); c.fillRect(0, y + 13, w, 3);
    for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(40,24,12,0.18)'; c.fillRect(Math.random()*w, y + Math.random()*12, 20 + Math.random()*40, 1); } } }));
}
function moquette(){   /* mustard moquette, a small asanoha (hemp-leaf) pattern */
  return tex(cv(128, 128, (c, w, h) => { c.fillStyle = '#b08a32'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(90,62,20,0.5)'; c.lineWidth = 1.2;
    for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 28) { const ox = x + (y/32 % 2)*14; for (let a = 0; a < 6; a++) { c.beginPath(); c.moveTo(ox, y); c.lineTo(ox + Math.cos(a*Math.PI/3)*14, y + Math.sin(a*Math.PI/3)*14); c.stroke(); } }
    for (let i = 0; i < 400; i++) { c.fillStyle = 'rgba(255,230,160,' + Math.random()*0.08 + ')'; c.fillRect(Math.random()*w, Math.random()*h, 1, 1); } }));
}
function doorPic(){   /* a door leaf: steel, its tall window, the stripe carried across */
  return tex(cv(100, 400, (c, w, h) => { c.fillStyle = '#d2ccc1'; c.fillRect(0, 0, w, h);
    const y = v => h*(1 - (v - TR.FL)/(DY1 - TR.FL));
    c.fillStyle = '#c9a067'; c.fillRect(0, y(0.92), w, y(0.8) - y(0.92)); c.fillStyle = '#9a3826'; c.fillRect(0, y(0.79), w, y(0.76) - y(0.79));
    c.fillStyle = '#1d1714'; c.beginPath(); c.roundRect(14, y(1.78), w - 28, y(1.0) - y(1.78), 8); c.fill();
    c.fillStyle = 'rgba(255,240,220,0.08)'; c.fillRect(16, y(1.76), 10, y(1.02) - y(1.76));
    c.strokeStyle = '#6e675e'; c.lineWidth = 3; c.strokeRect(1, 1, w - 2, h - 2); }), { clampEdge:true });
}
function cabPic(tail){   /* the flat cab face: the black mask round the windscreen, the amber board, the vermilion band, the crest, the lamps' band */
  return tex(cv(360, 520, (c, w, h) => { const y = v => h*(1 - (v - TR.BOT)/(TR.TOP - TR.BOT));
    c.fillStyle = '#d2ccc1'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#141110'; c.beginPath(); c.roundRect(16, y(2.12), w - 32, y(1.02) - y(2.12), 14); c.fill();   /* the mask */
    c.fillStyle = '#231c18'; c.fillRect(34, y(1.86), w - 68, y(1.12) - y(1.86));   /* the windscreen, dark */
    c.fillStyle = 'rgba(255,240,220,0.06)'; c.beginPath(); c.moveTo(40, y(1.84)); c.lineTo(120, y(1.84)); c.lineTo(60, y(1.14)); c.lineTo(40, y(1.14)); c.fill();
    c.fillStyle = '#0c0a09'; c.fillRect(60, y(2.08), w - 120, y(1.9) - y(2.08));   /* the destination board, amber dots */
    c.fillStyle = '#e8a43c'; c.font = '900 24px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('各停 ・ ？？', w/2, y(1.99) - 2);
    c.font = '700 11px sans-serif'; c.fillText('LOCAL ??', w/2, y(1.92));
    c.fillStyle = '#a63a26'; c.fillRect(0, y(0.86), w, y(0.7) - y(0.86));   /* the vermilion lacquer band, like an old shrine car */
    c.fillStyle = '#c9a067'; c.fillRect(0, y(0.92), w, y(0.87) - y(0.92));
    c.strokeStyle = '#c9a067'; c.lineWidth = 5; c.beginPath(); c.arc(w/2, y(0.48), 22, 0, Math.PI*2); c.stroke(); c.fillStyle = '#c9a067'; c.font = '900 26px sans-serif'; c.fillText('ふ', w/2, y(0.48) + 2);
    c.fillStyle = '#1a1512'; c.fillRect(30, y(0.56), 80, y(0.36) - y(0.56)); c.fillRect(w - 110, y(0.56), 80, y(0.36) - y(0.56));   /* the lamps' band */
    c.fillStyle = 'rgba(40,30,24,0.4)'; c.fillRect(0, y(0.05), w, h - y(0.05)); }), { clampEdge:true });
}
function mapPic(){
  const R = window.EG_SEAM && EG_SEAM.ride, c = document.createElement('canvas'); c.width = 1400; c.height = 380; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (!R) return t;
  const img = new Image(); img.onload = () => { c.getContext('2d').drawImage(img, 0, 0); t.needsUpdate = true; };
  try { img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 380" width="1400" height="380">' + R.svg + '</svg>'); } catch (e) {}
  return t;
}

/* ---------------- geometry helpers: boxes with true-size pictures, merged per material ---------------- */
function bgeo(x0, x1, y0, y1, z0, z1, m){
  const w = x1 - x0, h = y1 - y0, d = z1 - z0, g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  if (m) for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f*4 + i; uv.setXY(k, uv.getX(i + f*4)*dims[f][0]/m[0], uv.getY(i + f*4)*dims[f][1]/m[1]); }
  g.translate((x0 + x1)/2, (y0 + y1)/2, (z0 + z1)/2); return g.toNonIndexed();
}
function rod(a, b, r, seg = 6){
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), len = d.length(), g = new THREE.CylinderGeometry(r, r, len, seg, 1, true);
  g.translate(0, len/2, 0); g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())); g.translate(A.x, A.y, A.z); return g.toNonIndexed();
}
/* intervals along the car that are solid, given the holes */
function solidRuns(holes){ const H = holes.slice().sort((a, b) => a[0] - b[0]), out = []; let x = 0; for (const [a, b] of H) { if (a > x + 0.001) out.push([x, a]); x = Math.max(x, b); } if (x < TR.L - 0.001) out.push([x, TR.L]); return out; }

/* ---------------- building it ---------------- */
let TAG = null;
export function buildTrain(scene, tag, haloFn){
  TAG = tag;
  const outsideDark = m => {   /* the outside of the train goes dark as it goes into the tunnel (inside, the lamps stay lit) */
    m.onBeforeCompile = sh => { sh.uniforms.uTunX = TR.darkU;
      sh.fragmentShader = 'uniform float uTunX;\n' + sh.fragmentShader.replace('#include <fog_fragment>', '#ifdef USE_FOG\n gl_FragColor.rgb *= 1.0 - 0.96*smoothstep(uTunX, uTunX + 2.5, vFogW.x);\n#endif\n#include <fog_fragment>'); };
    m.customProgramCacheKey = () => 'tr-out'; return m; };
  const std = (map, o = {}) => outsideDark(new THREE.MeshStandardMaterial({ map, roughness:o.r == null ? 0.5 : o.r, metalness:o.m || 0, color:o.c || 0xffffff, transparent:!!o.cut, alphaTest:o.cut ? 0.5 : 0 }));
  const lit = (map, o = {}) => { const m = new THREE.MeshStandardMaterial({ map, roughness:o.r == null ? 0.8 : o.r, color:o.c || 0xffffff, emissive:new THREE.Color(o.e || 0xffffff), emissiveMap:map, emissiveIntensity:o.k == null ? 0.42 : o.k }); m.userData.noDetail = true; return m; };   /* inside: lit by its own lamps */
  const MT = {
    steel:std(steel(), { r:0.42, m:0.35 }), rib:std(ribbed(), { r:0.45, m:0.35 }), stripe:std(stripe(), { r:0.5 }), verm:std(null, { c:0x9a3826, r:0.6 }),
    roof:std(null, { c:0x7e7872, r:0.7 }), under:std(null, { c:0x221d1a, r:0.9 }), door:std(doorPic(), { r:0.45, m:0.3 }), crest:std(crest(), { cut:true }),
    cab:std(cabPic(false), { r:0.5 }), wheel:std(null, { c:0x2c2622, r:0.5, m:0.6 }),
    cream:lit(cream(), { c:0xffffff, k:0.32 }), floor:lit(slats(), { k:0.3 }), seat:lit(moquette(), { k:0.36 }), dark:lit(null, { c:0x3a322c, e:0x3a322c, k:0.2 }),
    pole:new THREE.MeshStandardMaterial({ color:0xc8c2b6, roughness:0.3, metalness:0.7, emissive:new THREE.Color(0x3a3630) }),
    ring:new THREE.MeshStandardMaterial({ color:0xe8e0cc, roughness:0.6, emissive:new THREE.Color(0x4a443a) }),
    tube:new THREE.MeshStandardMaterial({ color:0xfff2dc, emissive:new THREE.Color(1.0, 0.95, 0.85), emissiveIntensity:2.4 }),
    head:new THREE.MeshStandardMaterial({ color:0xfff0d8, emissive:new THREE.Color(1.0, 0.9, 0.72), emissiveIntensity:5 }),
    tail:new THREE.MeshStandardMaterial({ color:0x6a1810, emissive:new THREE.Color(0.9, 0.12, 0.06), emissiveIntensity:1.1 }),   /* (kept low: brighter, the film roll-off turns it cream) */
    map:new THREE.MeshStandardMaterial({ map:mapPic(), roughness:0.8, emissive:new THREE.Color(0xffffff), emissiveIntensity:0.3 }),
  };
  MT.map.emissiveMap = MT.map.map; MT.cream.userData.noDetail = true;
  const L = TR.L, HW = TR.HW, ZC = 0;   /* (car-local: x along the car, z across it from the track's centre) */
  const sk = 0.012, inn = 0.06;   /* the skin, outside and in */
  for (let k = 0; k < TR.N; k++) {
    const G = new THREE.Group(), B = {}, add = (m, g) => (B[m] = B[m] || []).push(g);
    /* the floor and the body below it, the roof */
    add('under', bgeo(0, L, TR.BOT, TR.FL - 0.06, -HW + 0.02, HW - 0.02));
    add('floor', bgeo(0.02, L - 0.02, TR.FL - 0.06, TR.FL, -HW + inn, HW - inn, [1, 1]));
    add('cream', bgeo(0.02, L - 0.02, TR.ROOF - 0.04, TR.ROOF, -HW + inn, HW - inn, [1, 1]));   /* the ceiling */
    { const rg = new THREE.CylinderGeometry(HW + 0.01, HW + 0.01, L, 16, 1, false, 0, Math.PI); rg.rotateZ(Math.PI/2); rg.rotateX(-Math.PI/2); rg.scale(1, 0.24, 1); rg.translate(L/2, TR.ROOF, 0); add('roof', rg.toNonIndexed()); }
    /* the sides: outside skin and inside skin, with the doorways and windows open */
    for (const s of [-1, 1]) {
      const zo = [s*HW - (s > 0 ? sk : 0), s*HW + (s > 0 ? 0 : sk)].sort((a, b) => a - b), zi = [s*(HW - inn), s*(HW - inn + 0.012)].sort((a, b) => a - b);
      const doors = TR.DOORS.map(d => [d - TR.DHW, d + TR.DHW]);
      const rows = [[TR.BOT, -0.0, []], [0, 0.76, doors], [0.76, 0.79, doors], [0.79, 0.92, doors], [0.92, WY0, doors], [WY0, WY1, doors.concat(WINS)], [WY1, DY1, doors], [DY1, TR.ROOF, []]];
      for (const [y0, y1, holes] of rows) for (const [a, b] of solidRuns(holes)) {
        const mo = y1 <= 0.0 ? 'rib' : (y0 >= 0.76 && y1 <= 0.79 ? 'verm' : (y0 >= 0.79 && y1 <= 0.92 ? 'stripe' : (y1 <= 0.76 ? 'rib' : 'steel')));
        add(mo, bgeo(a, b, y0, y1, zo[0] - (mo === 'stripe' ? (s > 0 ? 0 : 0.006) : 0), zo[1] + (mo === 'stripe' ? (s > 0 ? 0.006 : 0) : 0), mo === 'stripe' ? [0.5, 0.13] : (mo === 'rib' ? [1, 0.5] : [1, 1])));
        if (y0 >= 0 && y1 <= TR.ROOF) add('cream', bgeo(a, b, Math.max(y0, TR.FL), y1, zi[0], zi[1], [1, 1]));
      }
      for (const [a, b] of WINS) { add('dark', bgeo(a, b, WY0 - 0.02, WY0, Math.min(zo[0], zi[0]), Math.max(zo[1], zi[1]))); }   /* the sills */
      for (const d of TR.DOORS) { add('dark', bgeo(d - TR.DHW, d + TR.DHW, TR.FL - 0.005, TR.FL, Math.min(zo[0], zi[0]), Math.max(zo[1], zi[1]))); }   /* the door tracks */
      /* the crest, on each car, low between the first two doors */
      const cg = new THREE.PlaneGeometry(0.34, 0.34); if (s < 0) cg.rotateY(Math.PI); cg.translate(2.85, 0.45, s*(HW + 0.004)); add('crest', cg.toNonIndexed());
      /* inside: the long bench seats between the doors, against the wall */
      const runs = [[0.18, TR.DOORS[0] - TR.DHW - 0.12], [TR.DOORS[0] + TR.DHW + 0.12, TR.DOORS[1] - TR.DHW - 0.12], [TR.DOORS[1] + TR.DHW + 0.12, TR.DOORS[2] - TR.DHW - 0.12], [TR.DOORS[2] + TR.DHW + 0.12, L - 0.18]];
      const wz = s*(HW - inn), dz = -s*0.44;
      for (const [a, b] of runs) { if (b - a < 0.3) continue;
        add('seat', bgeo(a, b, 0.4, 0.48, Math.min(wz, wz + dz), Math.max(wz, wz + dz), [0.4, 0.4]));
        add('seat', bgeo(a, b, 0.48, 0.95, Math.min(wz, wz - s*0.09), Math.max(wz, wz - s*0.09), [0.4, 0.4]));
        add('dark', bgeo(a + 0.02, b - 0.02, TR.FL, 0.4, Math.min(wz, wz + dz*0.85), Math.max(wz, wz + dz*0.85)));
        TR.solids.push({ car:k, lx0:a, lx1:b, y0:TR.FL, y1:0.5, z0:TR.ZC + Math.min(wz, wz + dz), z1:TR.ZC + Math.max(wz, wz + dz), seat:true, x0:0, x1:0 }); }
      /* the walls, as solids (not the doorways) */
      for (const [a, b] of solidRuns(TR.DOORS.map(d => [d - TR.DHW, d + TR.DHW]))) TR.solids.push({ car:k, lx0:a, lx1:b, y0:TR.BOT, y1:TR.ROOF, z0:TR.ZC + Math.min(zo[0], zi[0]), z1:TR.ZC + Math.max(zo[1], zi[1]), x0:0, x1:0 });
      /* the poles by the doors, the rails and straps along the aisle */
      const pg = []; for (const d of TR.DOORS) for (const o of [-TR.DHW - 0.08, TR.DHW + 0.08]) pg.push(rod([d + o, TR.FL, s*(HW - inn - 0.45)], [d + o, TR.ROOF, s*(HW - inn - 0.45)], 0.018));
      pg.push(rod([0.2, 1.92, s*0.42], [L - 0.2, 1.92, s*0.42], 0.014)); for (const g of pg) add('pole', g);
      for (let x = 0.5; x < L - 0.3; x += 0.42) { if (TR.DOORS.some(d => Math.abs(x - d) < 0.15)) continue; add('ring', bgeo(x - 0.012, x + 0.012, 1.7, 1.92, s*0.42 - 0.004, s*0.42 + 0.004)); const tg = new THREE.TorusGeometry(0.05, 0.009, 4, 12); tg.translate(x, 1.65, s*0.42); add('ring', tg.toNonIndexed()); }
      /* the tube lamps in their long covers */
      for (let x = 0.3; x < L - 1.0; x += 1.38) add('tube', bgeo(x, x + 1.2, TR.ROOF - 0.07, TR.ROOF - 0.04, s*0.36 - 0.05, s*0.36 + 0.05));
      /* the line map over every door, inside */
      for (const d of TR.DOORS) { const mg = new THREE.PlaneGeometry(0.9, 0.244); if (s > 0) mg.rotateY(Math.PI); mg.translate(d, DY1 + 0.125, s*(HW - inn - 0.004)); add('map', mg.toNonIndexed()); }
    }
    /* the ends: a cab face at the front of the first car and the back of the last; between cars, plain ends */
    for (const e of [0, 1]) {
      const x0 = e ? L - 0.05 : 0, x1 = e ? L : 0.05, cab = (k === 0 && e === 1) || (k === TR.N - 1 && e === 0);
      if (cab) { const fg = new THREE.PlaneGeometry(2*HW, TR.TOP - TR.BOT); fg.rotateY(e ? Math.PI/2 : -Math.PI/2); fg.translate(e ? L + 0.002 : -0.002, (TR.TOP + TR.BOT)/2, 0); add('cab', fg.toNonIndexed()); }
      add(cab ? 'steel' : 'steel', bgeo(x0, x1, TR.BOT, TR.ROOF + 0.05, -HW, HW, [1, 1]));
      add('cream', bgeo(e ? x0 - 0.012 : x1, e ? x0 : x1 + 0.012, TR.FL, TR.ROOF, -HW + inn, HW - inn, [1, 1]));
      TR.solids.push({ car:k, lx0:e ? L - 0.07 : 0, lx1:e ? L : 0.07, y0:TR.BOT, y1:TR.ROOF, z0:TR.ZC - HW, z1:TR.ZC + HW, x0:0, x1:0 });
      if (cab) {   /* the lamps: white at whichever end leads, red at the end that follows (it runs both ways) */
        const lgs = []; for (const z of [-0.62, 0.62]) { const lg = new THREE.CircleGeometry(0.075, 14); lg.rotateY(e ? Math.PI/2 : -Math.PI/2); lg.translate(e ? L + 0.006 : -0.006, 0.46, z); lgs.push(lg.toNonIndexed()); }
        const lm = new THREE.Mesh(mergeGeometries(lgs), MT.head); G.add(lm); (TR.lamps = TR.lamps || {})[e ? 'east' : 'west'] = lm; TR.MT = MT;
      }
    }
    /* the floor, as a solid you stand on (in the tunnel too) */
    TR.solids.push({ car:k, lx0:0, lx1:L, y0:TR.BOT, y1:TR.FL, z0:TR.ZC - HW, z1:TR.ZC + HW, floor:true, x0:0, x1:0 });
    /* the bogies: wheels and frames under each end */
    const wg = []; for (const bx of [1.4, L - 1.4]) { for (const dx of [-0.55, 0.55]) for (const z of [-0.45, 0.45]) { const w = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 12); w.rotateX(Math.PI/2); w.translate(bx + dx, -0.205, z); wg.push(w.toNonIndexed()); }
      wg.push(bgeo(bx - 0.85, bx + 0.85, -0.3, -0.16, -0.55, 0.55)); }
    for (const g of wg) add('wheel', g);
    for (const m in B) { const me = new THREE.Mesh(mergeGeometries(B[m]), MT[m]); me.castShadow = m !== 'tube' && m !== 'map' && m !== 'head' && m !== 'tail'; me.receiveShadow = true; me.userData.kind = m; G.add(me);
      if (m === 'map') TAG(me, hit => mapClick(hit)); if (m === 'seat') TAG(me, () => sit()); }
    /* the doors: two leaves each, sliding apart into the wall; only the platform side opens */
    G.userData.leaves = [];
    for (const s of [-1, 1]) for (const d of TR.DOORS) for (const side of [-1, 1]) {
      if (s < 0) {   /* (the far side's doors never open: part of the car itself) */
        const g = bgeo(0, TR.DHW, TR.FL, DY1, -0.012, 0.012); g.translate(side > 0 ? d : d - TR.DHW, 0, 0); g.translate(0, 0, s*(HW - 0.03));
        const me = new THREE.Mesh(g, MT.door); me.castShadow = true; G.add(me);
        TR.solids.push({ car:k, lx0:side < 0 ? d - TR.DHW : d, lx1:side < 0 ? d : d + TR.DHW, y0:TR.FL, y1:DY1, z0:TR.ZC + s*(HW - 0.03) - 0.02, z1:TR.ZC + s*(HW - 0.03) + 0.02, x0:0, x1:0 });
        continue; }
      const lf = new THREE.Mesh(bgeo(0, TR.DHW, TR.FL, DY1, -0.012, 0.012), MT.door); lf.castShadow = true; lf.receiveShadow = true;
      lf.position.set(side < 0 ? d - TR.DHW : d, 0, s*(HW - 0.03)); if (side > 0) { lf.scale.x = -1; lf.position.x = d + TR.DHW; }
      G.add(lf); G.userData.leaves.push({ lf, s, d, side, x:lf.position.x });
      const ds = { car:k, lx0:side < 0 ? d - TR.DHW : d, lx1:side < 0 ? d : d + TR.DHW, y0:TR.FL, y1:DY1, z0:TR.ZC + s*(HW - 0.03) - 0.02, z1:TR.ZC + s*(HW - 0.03) + 0.02, x0:0, x1:0, door:s > 0 };
      TR.solids.push(ds); }
    G.position.set(-500, 0, TR.ZC); scene.add(G); TR.cars.push(G);
  }
  /* the headlights in the fog: two halos and a faint cone ahead; the tail lamps' red glow */
  TR.halo = []; for (const z of [-0.62, 0.62]) { const h = haloFn(-500, 0.46, TR.ZC + z, 0.9, 0xfff0d8); TR.halo.push(h); }
  TR.tailHalo = []; for (const z of [-0.62, 0.62]) { const h = haloFn(-500, 0.46, TR.ZC + z, 0.5, 0xff4020); TR.tailHalo.push(h); }
  const cg = new THREE.ConeGeometry(1.4, 9, 18, 1, true); cg.translate(0, -4.5, 0); cg.rotateZ(Math.PI/2);
  TR.beam = new THREE.Mesh(cg, new THREE.ShaderMaterial({ transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide, uniforms:{ uK:{ value:0.06 }, uC:{ value:new THREE.Color(1.0, 0.92, 0.78) } },
    vertexShader:'varying float vH; varying vec3 vN, vV; void main(){ vH = position.x/9.0; vec4 w = modelViewMatrix*vec4(position, 1.0); vV = normalize(-w.xyz); vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*w; }',
    fragmentShader:'uniform float uK; uniform vec3 uC; varying float vH; varying vec3 vN, vV; void main(){ float e = abs(dot(normalize(vN), normalize(vV))); float a = uK*pow(clamp(1.0 - vH, 0.0, 1.0), 1.8)*e*e; gl_FragColor = vec4(uC*a, 1.0); }' }));
  TR.beam.position.set(-500, 0.46, TR.ZC); scene.add(TR.beam);
  for (const s of TR.solids) K.solids.push(s);
  place();
}

/* ---------------- moving it ---------------- */
function place(){
  for (let k = 0; k < TR.N; k++) { TR.cars[k].position.x = carX0(k); TR.cars[k].visible = TR.state !== 'off'; }
  for (const s of TR.solids) { const x0 = carX0(s.car); s.x0 = x0 + s.lx0; s.x1 = x0 + s.lx1;
    if (s.door !== undefined) { const open = s.door && TR.doorK > 0.25; s.y0 = open ? 99 : TR.FL; s.y1 = open ? 99.5 : 2.0; } }
  for (const G of TR.cars) for (const D of G.userData.leaves) { const o = D.s > 0 ? TR.doorK*TR.DHW*0.98 : 0; D.lf.position.x = D.x + D.side*o; }
  const on = TR.state !== 'off', east = TR.dir > 0, lead = east ? TR.front + 0.15 : trainRear() - 0.15, tail = east ? trainRear() - 0.12 : TR.front + 0.12;
  if (TR.lamps) { TR.lamps.east.material = east ? TR.MT.head : TR.MT.tail; TR.lamps.west.material = east ? TR.MT.tail : TR.MT.head; }
  TR.halo.forEach(h => { h.position.x = lead; h.visible = on; h.material.opacity = TR.state === 'stopped' ? 0.45 : 0.95; });
  TR.tailHalo.forEach(h => { h.position.x = tail; h.visible = on; });
  TR.beam.position.x = east ? TR.front + 0.1 : trainRear() - 0.1; TR.beam.rotation.y = east ? 0 : Math.PI; TR.beam.visible = on && TR.state !== 'stopped';
  TR.darkU.value = TUNX;
}
const TUNX = 40.3;
function doorsOverPlatform(){ return true; }
/* is someone standing inside car k? */
function inCar(){
  for (let k = 0; k < TR.N; k++) { const x0 = carX0(k); if (P.x > x0 + 0.1 && P.x < x0 + TR.L - 0.1 && P.z > TR.ZC - TR.HW + 0.05 && P.z < TR.ZC + TR.HW - 0.05 && P.y > TR.FL - 0.1 && P.y < 1) return k; }
  return -1;
}
const RS = () => (window.EG_SEAM && EG_SEAM.ride) || null;
function rideSay(t, ms){ say(t, ms || 4200); }
function sit(){ const R = RS(); if (inCar() < 0) return null; P.sit = true; if (R && !TR.said.sit) { TR.said.sit = 1; return R.say.sit; } return R ? R.say.sit : null; }
/* the next stop: east, Aldridge; west, Furusato (Seam's own line map and pages) */
const nextStop = () => TR.dir > 0 ? 3 : 1;
function nextLine(){ const R = RS(), N = R && R.stops[TR.pick >= 0 ? TR.pick : nextStop()]; return N ? 'つぎは ' + N[0] + ' · next, ' + N[1] + '.' : null; }
/* (Nov 17, later; Aisling: "make it open after Aldridge they can pick any spot but this one goes to Aldridge first for
   test purposes"; how the line opens up for good is for later, with the story's puzzles.) until you've been to Aldridge,
   the train takes you there (or west, home to Furusato); after, you can pick any stop on the map. it remembers Aldridge
   in the same list of stops you've been to as the Seam pages (nullgrey.furusato.stops) */
function stopsSeen(){ try { return JSON.parse(localStorage.getItem('nullgrey.furusato.stops') || '[]'); } catch (e) { return []; } }
const aldridgeSeen = () => stopsSeen().indexOf('aldridge') >= 0;
function markAldridge(){ try { const L = stopsSeen(); if (L.indexOf('aldridge') < 0) { L.push('aldridge'); localStorage.setItem('nullgrey.furusato.stops', JSON.stringify(L)); } } catch (e) {} }
function mapClick(hit){
  const R = RS(); if (!R || !hit.uv) return null;
  if (inCar() < 0) return null;   /* (you read it from inside) */
  const px = hit.uv.x*R.map.W, n = R.stops.length;
  let best = -1, bd = 60; for (let i = 0; i < n; i++) { const x = R.map.x0 + i*(R.map.x1 - R.map.x0)/(n - 1), d = Math.abs(px - x); if (d < bd) { bd = d; best = i; } }
  if (best === R.here) return R.say.here;
  if (best === 0) return R.say.first;
  if (best < 0 || !aldridgeSeen() || R.stops[best][3]) return nextLine();   /* (not open yet, or the secret last stop: it goes where it goes) */
  TR.pick = best; const N = R.stops[best]; return 'つぎは ' + N[0] + ' · next, ' + N[1] + '.';
}

export function trainArrive(){   /* a Seam page's ride ended here: you open your eyes beside it */
  const R = RS(); if (!(R && R.arrived && R.arrived.at === 'train')) return false;
  TR.state = 'stopped'; TR.dir = 1; TR.front = TR.STOP; TR.v = 0; TR.doorK = 1; TR.t0 = performance.now() - Math.max(0, TR.DWELL - 6)*1000; TR.arrivedNow = true;   /* (its clock starts on the first frame: see trainTick) */
  P.x = 20.6; P.z = 4.6; P.yaw = -0.4; P.y = 0;
  place();
  setTimeout(() => say('本町 · main street. you step off. the doors close behind you, and the train goes on without you, into the corn.', 4800), 600);   /* (Seam's own line, f9i-arrive-train.js, word for word) */
  return true;
}

export function trainTick(now, dt){
  TR.lastNow = now;
  const R = RS(), cx = () => TR.dir > 0 ? TR.front - 4 : trainRear() + 4;
  if (TR.arrivedNow) { TR.arrivedHold = (TR.arrivedHold == null ? 45 : TR.arrivedHold) - 1; if (TR.arrivedHold <= 0) TR.arrivedNow = false; TR.t0 = now - Math.max(0, TR.DWELL - 8)*1000; }   /* (you've just stepped off: it waits a few seconds, then the doors close behind you; held over the first frames, which can be slow while the page warms up) */
  if (TR.state === 'off') {
    if (!TR.next) TR.next = now + rnd(TR.FIRST[0], TR.FIRST[1]);
    else if (now > TR.next) { TR.state = 'coming'; TR.front = TR.dir > 0 ? TR.START : TR.STOP + 46;   /* (east: out of the dusk; west: out of the tunnel's dark) */ TR.v = TR.V0; TR.doorK = 0; TR.said = {}; TR.chosen = -1; TR.melody = false; TR.warned = false; TR.played = false; TR.closing = false; TR.boarded = -1; TR.pick = -1;
      TR.sounds.arrive = trainSound('train_arrive', { x:TR.front, y:1, z:TR.ZC }); }
  } else if (TR.state === 'coming') {
    const rem = Math.abs(TR.STOP - TR.front);
    TR.v = rem > TR.BRAKE ? TR.V0 : Math.max(0.06, Math.sqrt(TR.V0*TR.V0*rem/TR.BRAKE));
    TR.front = TR.dir > 0 ? Math.min(TR.STOP, TR.front + TR.v*dt) : Math.max(TR.STOP, TR.front - TR.v*dt);
    if (Math.abs(TR.STOP - TR.front) < 0.002) { TR.front = TR.STOP; TR.v = 0; TR.state = 'stopped'; TR.t0 = now; }
  } else if (TR.state === 'stopped') {
    const k = inCar();
    if (k >= 0 && TR.boarded < 0) { TR.boarded = k; if (R && !TR.said.board) { TR.said.board = 1; rideSay(R.say.board, 5200); } }
    if (k < 0 && TR.boarded >= 0) { TR.boarded = -1; if (R && !TR.closing) rideSay(R.say.off, 3600); }
    const e = (now - TR.t0)/1000, D = TR.DWELL;
    const was = TR.doorK;
    TR.doorK = e < 2.6 + D ? sm(1.2, 2.5, e) : 1 - sm(D + 2.8, D + 4.0, e);
    if (was < 0.05 && TR.doorK >= 0.05) trainSound('train_doors_open', { x:cx(), y:1.2, z:TR.ZC });
    if (!TR.played && e > D - 5.2) { TR.played = true; trainSound('train_melody', { x:20, y:2.5, z:5.9 }); }
    if (!TR.warned && e > D + 0.6) { TR.warned = true; if (R && P.z < 9) say(R.warn, 4200, 'v-train'); }
    if (!TR.closing && e > D + 2.8) { TR.closing = true; trainSound('train_doors_close', { x:cx(), y:1.2, z:TR.ZC }); if (R && inCar() >= 0) rideSay(R.say.close, 2600);
      if (P.z > TR.ZC + TR.HW - 0.35 && P.z < TR.ZC + TR.HW + 0.4 && inCar() < 0) P.z = TR.ZC + TR.HW + 0.45; }   /* (standing in a doorway as they close: you step back onto the platform) */
    if (e > D + 5.4) { TR.state = 'leaving'; TR.v = 0; TR.doorK = 0; TR.closing = false;
      TR.riding = inCar() >= 0; TR.chosen = TR.pick >= 0 ? TR.pick : nextStop();
      if (TR.riding) { P.riding = true; TR.rideT0 = now; TR.sounds.ride = trainSound('train_ride', { x:P.x, y:0.3, z:P.z }); }
      TR.sounds.depart = trainSound('train_depart', { x:cx(), y:1, z:TR.ZC }); }
  } else if (TR.state === 'leaving') {
    TR.v = Math.min(11, TR.v + TR.ACC*dt); const dx = TR.dir*TR.v*dt; TR.front += dx;
    if (TR.riding) {
      if (!TR.dark) P.x += dx; else TR.front -= dx;   /* (in the dark the world stops: only the ride goes on) */
      const t = (now - TR.rideT0)/1000;
      if (TR.sounds.ride && TR.sounds.ride.g) TR.sounds.ride.g.gain.setTargetAtTime(Math.min(0.25, 0.04 + TR.v*0.03), TR.sounds.ride.g.context.currentTime, 0.3);
      if (!TR.dark && (TR.dir > 0 ? P.x > 42.6 : P.x < 1.5)) { TR.dark = now; if (R) R.fade(true); }   /* east: into the tunnel's dark; west: into the fog past the corn */
      const td = TR.dark ? (now - TR.dark)/1000 : -1;
      if (R && !TR.said.alone && (t > 3.2 || td > 1.0)) { TR.said.alone = 1; rideSay(Math.random() < 0.1 ? R.say.aloneCut : R.say.alone, 4200); }
      if (R && !TR.said.next && td > 5.0) { TR.said.next = 1; const N = R.stops[TR.chosen]; rideSay('つぎは ' + N[0] + ' · next, ' + N[1] + '.', 3600); }
      if (td > 9.0 && !TR.gone) { TR.gone = true;   /* the next page: the stop you chose (Seam's own ride ending, f9g-car-run.js) */
        const dest = R && R.pages[TR.chosen];
        if (TR.chosen === 3) markAldridge();   /* (the stand-in stop keeps nothing, so the ride remembers it; Aldridge's own page will) */
        if (dest) R.go(dest, dest === 'stop' ? 'f:' + TR.chosen + ':f03' : 'train');
      }
    } else if (TR.dir > 0 ? trainRear() > 62 : TR.front < -25) { TR.state = 'off'; TR.next = now + rnd(TR.EVERY[0], TR.EVERY[1]); TR.front = -200; TR.dir = -TR.dir; }   /* (the next one comes the other way) */
  }
  if ((TR.state === 'coming' || TR.state === 'leaving') && !TR.riding && P.y < 1.6 && P.x > trainRear() - 0.6 && P.x < TR.front + 0.6 && P.z > TR.ZC - TR.HW - 0.35 && P.z < TR.ZC + TR.HW + 0.3) {
    P.z = TR.ZC + TR.HW + 0.36; if (P.x < 9 || P.x > 32) P.y = Math.max(P.y, -0.12); }   /* (out of its way, onto the platform's edge) */
  for (const k in TR.sounds) { const H = TR.sounds[k]; if (H) soundAt(H, k === 'ride' ? P.x : cx(), 1, TR.ZC); }
  place();
}

/* is this spot on the train's floor (where you may stand on the track's side of the edge)? only while it stands with its
   doors open, or while you're on it (while it stands; once it moves you're riding) */
export function onTrainFloor(x, z){
  if (TR.state !== 'stopped') return false;   /* (its doors' own solids keep you from walking through the wall) */
  return x > trainRear() + 0.05 && x < TR.front - 0.05 && z > TR.ZC - TR.HW + 0.05;
}
