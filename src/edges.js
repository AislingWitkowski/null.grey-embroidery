/* ================================================================
   EMBROIDERY · MISSING MILE, THE EDGES OF TOWN (Nov 20, 2026; Aisling: "ok do all the building on pocket passport and next
   part of missing mile while i rest").
   From her docs (32, 38): the long road from the station IS Main Street, empty country road at first, slowly turning into
   the town; the order she confirmed (Nov 5) starts with **the edges**: the Dairy Queen, the Kmart, the grocery outlet and
   the gas station (a Love's: on the site **Lover's**, her name, decided Nov 5), with her grandmother's late-'80s photo
   pick-up kiosk in a parking lot on the edges by the grocery outlet (doc 39). And: "arriving in Missing Mile proper is
   disorienting … you don't know how you got here, you last remember walking down a long road" (Oct 25).
   So the road doesn't simply run into town: walk on past the second mileage sign and the fog closes over everything;
   when it thins, you're standing on the road at the edge of town. Walk back into the fog either way and you come to near
   the station again (her line). Nobody here (Oct 25: "you rarely meet anyone here"); the lights are on.
   This place sits far south of the station in the same world (z 148 … 204), past where the fog lets you see.
   Stand-ins, hers to change: the grocery's name (RIDGE FOODS), the kiosk's name (PHOTOMAT), the lines when clicked; the
   Kmart's and Dairy Queen's names are left unreadable (their signs' letters dark) until she names them.
   Always autumn, dusk, dingy (doc 32). No blue. Accessible: a ramp with a rail at Lover's door, a cut in the curb at
   the grocery. Every door's knob or handle carries an eye, one form per building (the Nov 19 rule).
   ================================================================ */
import * as THREE from 'three';
import { K, mat, box, plane, cyl, clumps, rnd, wire } from './kit.js';
import { tex, fbm, vn, hsh, clamp, sm, paintCornAtlas, paintGrassAtlas, paintPole } from './paint.js';
import { realCanvas } from './real.js';
import { tag, halo } from './station.js';

export const EDGE = { x0:8.2, x1:55.8, z0:148.6, z1:203.4, back:149.2, end:202.8, arrive:[30.2, 150.6] };
const RD = [27.6, 32.4];   /* the road, wider here: two lanes */
const APRON = [12, RD[0], 155, 172];   /* Lover's concrete */
const LOT = [RD[1], 42, 158, 190];     /* the grocery's lot */
export function edgesInside(x, z){ return x > EDGE.x0 && x < EDGE.x1 && z > EDGE.z0 && z < EDGE.z1; }
export function edgesSurface(x, z){
  if (x > RD[0] && x < RD[1]) return 'road';
  if (x > APRON[0] && x < APRON[1] && z > APRON[2] && z < APRON[3]) return 'concrete';
  if (x > LOT[0] && x < LOT[1] && z > LOT[2] && z < LOT[3]) return 'road';
  return 'grass';
}
/* a line, or a few in turn, when clicked (stand-ins: hers to change) */
const says = (...L) => { let i = 0; return () => L[i++ % L.length]; };

function canvasTex(w, h, draw, o = {}){
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  realCanvas(c, { k:o.k == null ? 0.85 : o.k, wear:o.wear == null ? 1 : o.wear, tile:!!o.tile });
  const t = tex(c, { clampEdge:!o.tile }); if (o.m) t.userData.m = o.m; return t;
}
function noiseFill(g, w, h, base, amp, sc, seed){
  const id = g.getImageData(0, 0, w, h), d = id.data;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const o = (j*w + i)*4, n = (fbm(i*sc + seed, j*sc - seed) - 0.5)*amp + (hsh(i + seed, j)/1 - 0.5)*amp*0.35;
    d[o] = clamp(base[0] + n, 0, 255); d[o + 1] = clamp(base[1] + n*0.95, 0, 255); d[o + 2] = clamp(base[2] + n*0.88, 0, 255); d[o + 3] = 255; }
  g.putImageData(id, 0, 0);
}
/* a light pool laid on the flat ground (additive, steady, it fades with the fog), as the road lamps' (station2) */
function pool(scene, cx, cz, rx, rz, k, col){
  const g = new THREE.PlaneGeometry(rx*2, rz*2).rotateX(-Math.PI/2);
  const m = new THREE.ShaderMaterial({ transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, fog:true, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3,
    uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uK:{ value:k }, uCol:{ value:new THREE.Color(col || 0xffd8a0) } }]),
    vertexShader:'varying vec2 vU; varying float vD; void main(){ vU = uv*2.0 - 1.0; vec4 mv = modelViewMatrix*vec4(position, 1.0); vD = -mv.z; gl_Position = projectionMatrix*mv; }',
    fragmentShader:'uniform vec3 uCol; uniform float uK; uniform float fogNear, fogFar; varying vec2 vU; varying float vD;\n' +
      'void main(){ float r = length(vU); if (r > 1.0) discard; float f = pow(1.0 - r, 1.8); float a = uK*0.2*f*(1.0 - smoothstep(fogNear, fogFar*1.15, vD)); gl_FragColor = vec4(uCol*a, 1.0); }' });
  const me = new THREE.Mesh(g, m); me.position.set(cx, 0.03, cz); me.renderOrder = 1; scene.add(me); return me;
}
function glowMat(t, k = 1.4, size){ const m = new THREE.MeshStandardMaterial({ map:t, emissiveMap:t, emissive:new THREE.Color(1, 1, 1), emissiveIntensity:k, roughness:0.9 }); m.userData.m = size || [1, 1]; return m; }   /* size: the face it covers once, in metres */
function face(w, h, m, x, y, z, ry){ const me = plane(w, h, m, x, y, z, ry, { cast:false }); return me; }

export function buildEdges(scene){
  const R = rnd(9020);
  /* ================= the ground: earth and dead grass, the road, Lover's concrete, the grocery's cracked lot ================= */
  const earthT = canvasTex(256, 256, (g, w, h) => { noiseFill(g, w, h, [78, 66, 50], 46, 0.05, 3);
    for (let i = 0; i < 900; i++) { const x = R()*w, y = R()*h; g.fillStyle = R() < 0.5 ? 'rgba(120,96,58,0.5)' : 'rgba(40,32,24,0.5)'; g.fillRect(x, y, 1 + R()*2, 1 + R()*2); } }, { tile:true, m:[4, 4] });
  const earth = mat(earthT, { rough:1 }); earth.userData.m = [4, 4];
  plane(EDGE.x1 - EDGE.x0 + 12, EDGE.z1 - EDGE.z0 + 12, earth, (EDGE.x0 + EDGE.x1)/2, 0, (EDGE.z0 + EDGE.z1)/2, 0, { world:true, cast:false }).rotation.x = -Math.PI/2;
  /* the road: old asphalt patched in places, a faded double yellow, white edge lines worn to dashes */
  const roadT = canvasTex(384, 320, (g, w, h) => { noiseFill(g, w, h, [56, 52, 48], 30, 0.08, 7); const px = w/4.8;
    for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(30,28,26,0.55)'; g.fillRect(R()*w*0.8, R()*h*0.8, 40 + R()*60, 30 + R()*50); }   /* patches */
    g.fillStyle = 'rgba(196,160,72,0.7)'; g.fillRect(2.36*px, 0, 0.08*px, h); g.fillRect(2.36*px + 0.16*px, 0, 0.08*px, h);
    g.fillStyle = 'rgba(200,196,184,0.5)'; for (let y = 0; y < h; y += 14) if (R() < 0.7) { g.fillRect(0.2*px, y, 0.08*px, 8 + R()*6); g.fillRect(4.52*px, y, 0.08*px, 8 + R()*6); }
    g.strokeStyle = 'rgba(20,18,16,0.6)'; g.lineWidth = 1; for (let i = 0; i < 10; i++) { g.beginPath(); let x = R()*w, y = R()*h; g.moveTo(x, y); for (let s = 0; s < 6; s++) { x += (R() - 0.5)*30; y += R()*20; g.lineTo(x, y); } g.stroke(); } }, { tile:true, m:[4.8, 4] });
  const road = mat(roadT, { rough:0.82 }); road.userData.m = [4.8, 4];
  plane(RD[1] - RD[0], EDGE.z1 - EDGE.z0 + 10, road, (RD[0] + RD[1])/2, 0.01, (EDGE.z0 + EDGE.z1)/2, 0, { world:true, cast:false }).rotation.x = -Math.PI/2;
  /* Lover's concrete: slabs, oil stains under where cars stood */
  const concT = canvasTex(256, 256, (g, w, h) => { noiseFill(g, w, h, [128, 122, 112], 26, 0.06, 11);
    g.strokeStyle = 'rgba(60,56,50,0.8)'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
    for (let i = 0; i < 5; i++) { const x = R()*w, y = R()*h, r = 10 + R()*26, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(34,30,26,0.55)'); gr.addColorStop(1, 'rgba(34,30,26,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r*2, r*2); }
    g.strokeStyle = 'rgba(50,46,40,0.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(R()*w, 0); g.lineTo(R()*w, h); g.stroke(); }, { tile:true, m:[3.2, 3.2] });
  const conc = mat(concT, { rough:0.75 }); conc.userData.m = [3.2, 3.2];
  plane(APRON[1] - APRON[0], APRON[3] - APRON[2], conc, (APRON[0] + APRON[1])/2, 0.015, (APRON[2] + APRON[3])/2, 0, { world:true, cast:false }).rotation.x = -Math.PI/2;
  /* the grocery's lot: asphalt cracked into plates, faded stall lines, weeds in the seams */
  const lotT = canvasTex(384, 384, (g, w, h) => { noiseFill(g, w, h, [62, 58, 52], 30, 0.07, 19); const px = w/5.4;
    g.fillStyle = 'rgba(190,184,170,0.45)'; for (const y of [0, 2.7]) g.fillRect(0, y*px, 2.6*px, 0.1*px);
    g.strokeStyle = 'rgba(16,14,12,0.85)'; g.lineWidth = 1.4;
    for (let i = 0; i < 14; i++) { g.beginPath(); let x = R()*w, y = R()*h; g.moveTo(x, y); for (let s = 0; s < 8; s++) { x += (R() - 0.5)*44; y += (R() - 0.5)*44; g.lineTo(x, y); } g.stroke(); }
    g.fillStyle = 'rgba(96,104,60,0.6)'; for (let i = 0; i < 60; i++) g.fillRect(R()*w, R()*h, 2 + R()*3, 1 + R()*2); }, { tile:true, m:[5.4, 5.4] });
  const lot = mat(lotT, { rough:0.85 }); lot.userData.m = [5.4, 5.4];
  plane(LOT[1] - LOT[0], LOT[3] - LOT[2], lot, (LOT[0] + LOT[1])/2, 0.015, (LOT[2] + LOT[3])/2, 0, { world:true, cast:false }).rotation.x = -Math.PI/2;

  /* ================= Lover's: the canopy over the pumps, the store, the heart on its pole ================= */
  const white = mat(null, { color:0xb8b0a4, rough:0.7 }), steel = mat(null, { color:0x8a847c, rough:0.4, metal:0.6 }), dark = mat(null, { color:0x221c18, rough:0.9 });
  steel.envMap = K.env; steel.envMapIntensity = 0.4;
  const CX0 = 19, CX1 = 27, CZ0 = 158.5, CZ1 = 167.5;
  for (const [x, z] of [[19.6, 159.2], [26.4, 159.2], [19.6, 166.8], [26.4, 166.8]]) { cyl(0.2, 0.2, 4.6, white, x, 0, z, 12); K.solids.push({ x0:x - 0.22, x1:x + 0.22, y0:0, y1:4.6, z0:z - 0.22, z1:z + 0.22 }); }
  /* the fascia: cream, a red stripe, the heart and LOVER'S (Love's shape and colours, one step off: her name for it) */
  const fasciaT = canvasTex(1024, 96, (g, w, h) => { g.fillStyle = '#d8ccb4'; g.fillRect(0, 0, w, h); g.fillStyle = '#a8302a'; g.fillRect(0, h - 22, w, 14); g.fillStyle = '#d9a441'; g.fillRect(0, h - 8, w, 4);
    for (const cx of [w*0.25, w*0.75]) { heart(g, cx - 120, 46, 30, '#b8302a'); g.fillStyle = '#a8282a'; g.font = '900 52px "Arial Black", Arial, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText("LOVER'S", cx - 78, 44); } }, { k:0.7, wear:0.7 });   /* (red on cream: the yellow didn't read) */
  const fascia = glowMat(fasciaT, 0.55, [9, 0.7]), fasciaS = glowMat(fasciaT, 0.55, [13.4, 0.4]);
  box(CX0, CX1, 4.6, 5.3, CZ0, CZ1, [fascia, fascia, dark, dark, fascia, fascia], { solid:false });
  /* the underside: a grid of lights, a few dead, one with a moth in it */
  const underT = canvasTex(256, 288, (g, w, h) => { g.fillStyle = '#3a3430'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const dead = (i === 2 && j === 1) || (i === 0 && j === 3), x = 22 + i*58, y = 22 + j*66;
      g.fillStyle = dead ? '#4a443e' : '#fff0d4'; g.fillRect(x, y, 40, 40); if (!dead) { g.fillStyle = 'rgba(255,240,212,0.25)'; g.fillRect(x - 6, y - 6, 52, 52); }
      if (i === 1 && j === 2) { g.fillStyle = 'rgba(60,48,40,0.9)'; g.beginPath(); g.ellipse(x + 26, y + 14, 4, 2.4, 0.6, 0, 6.3); g.fill(); } } }, { k:0.4, wear:0.3 });
  const under = glowMat(underT, 2.2);
  const u = plane(CX1 - CX0, CZ1 - CZ0, under, (CX0 + CX1)/2, 4.59, (CZ0 + CZ1)/2, 0, { cast:false }); u.rotation.x = Math.PI/2;
  pool(scene, (CX0 + CX1)/2, (CZ0 + CZ1)/2, 7.5, 7.5, 1.6, 0xfff0d8);
  for (let i = 0; i < 4; i++) halo(19.9 + i*2.06, 4.4, 163, 1.6, 0xfff0d4);
  tag(u, says('the lights under the canopy hum. one of them has a moth in it, and has had for a long time.', 'they are all on. there is nobody to see by them.'));
  /* the pump islands and their pumps (2002: a little screen, the price rolling slowly, never flashing) */
  const pumpT = canvasTex(160, 360, (g, w, h) => { g.fillStyle = '#c8bcaa'; g.fillRect(0, 0, w, h); g.fillStyle = '#a8302a'; g.fillRect(0, 0, w, 46);
    heart(g, 22, 22, 12, '#e8b84a'); g.fillStyle = '#f2e6cc'; g.font = '900 22px Arial, sans-serif'; g.textBaseline = 'middle'; g.fillText("LOVER'S", 42, 24);
    g.fillStyle = '#1e1a16'; g.fillRect(16, 64, w - 32, 70); g.fillStyle = '#d9a441'; g.font = '700 24px monospace'; g.fillText('1.39⁹', 28, 100);
    g.fillStyle = '#2a2420'; for (let i = 0; i < 3; i++) { g.fillRect(16 + i*44, 152, 38, 34); } g.fillStyle = '#f2e6cc'; g.font = '700 9px Arial, sans-serif';
    ['REG', 'PLUS', 'PREM'].forEach((t, i) => g.fillText(t, 22 + i*44, 172)); g.fillStyle = '#5a524a'; g.fillRect(30, 210, w - 60, 90); g.fillStyle = '#8a8076'; g.fillRect(40, 220, w - 80, 70); }, { k:0.75, wear:0.8 });
  const pumpF = glowMat(pumpT, 0.35, [0.48, 1.74]);
  let pn = 0;
  for (const ix of [21.6, 24.4]) {
    box(ix - 0.5, ix + 0.5, 0, 0.16, 159.6, 166.4, conc);   /* the island's curb */
    for (const pz of [161.2, 164.8]) { pn++;
      const p = box(ix - 0.32, ix + 0.32, 0.16, 1.9, pz - 0.24, pz + 0.24, [pumpF, pumpF, dark, dark, steel, steel]);
      cyl(0.025, 0.025, 1.1, dark, ix + 0.36, 0.5, pz, 6, { rz:0.15 });   /* the hose */
      tag(p, says('pump ' + pn + '. regular, plus, premium. the price is from another year.', 'the nozzle is warm, like someone just put it back.')); }
    cyl(0.14, 0.14, 0.9, mat(null, { color:0xb89a3a, rough:0.6 }), ix, 0.16, 159.85, 10);   /* a bollard at each end */
    cyl(0.14, 0.14, 0.9, mat(null, { color:0xb89a3a, rough:0.6 }), ix, 0.16, 166.15, 10);
  }
  /* the store behind: block walls, a lit window band, the door (an eye etched on its glass where the handle is), a ramp */
  const blockT = canvasTex(256, 256, (g, w, h) => { noiseFill(g, w, h, [150, 140, 126], 22, 0.06, 23); g.strokeStyle = 'rgba(80,74,66,0.7)'; g.lineWidth = 2;
    for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y/32) % 2 ? 0 : 32; x < w; x += 64) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } }
    g.fillStyle = 'rgba(60,50,40,0.35)'; g.fillRect(0, h - 40, w, 40); }, { tile:true, m:[2, 2] });
  const block = mat(blockT, { rough:0.95 }); block.userData.m = [2, 2];
  box(10, 18, 0, 4.2, 156.5, 169.5, block);
  box(9.8, 18.3, 4.2, 4.6, 156.3, 169.7, [fasciaS, fasciaS, dark, dark, fasciaS, fasciaS], { solid:false });
  const shopT = canvasTex(512, 160, (g, w, h) => { g.fillStyle = '#e8d8b0'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#6a5a48'; for (let i = 0; i < 4; i++) { g.fillRect(20 + i*120, 40, 90, 8); g.fillRect(20 + i*120, 82, 90, 8); g.fillRect(20 + i*120, 124, 90, 8); }   /* shelves */
    for (let i = 0; i < 40; i++) { g.fillStyle = ['#a8302a', '#d9a441', '#86bb69', '#c87aa0', '#e8b84a'][i % 5]; g.fillRect(24 + (i % 10)*48, 28 + ((i/10) | 0)*42, 10, 12); }
    g.fillStyle = '#fff4dc'; g.fillRect(w - 70, 10, 60, 140); g.fillStyle = 'rgba(40,30,20,0.5)'; g.fillRect(0, 0, w, 6); }, { k:0.5, wear:0.4 });
  const shopM = glowMat(shopT, 1.0);
  face(5.4, 1.7, shopM, 18.02, 1.95, 160.4, Math.PI/2);   /* the window band, south of the door */
  face(3.2, 1.7, shopM, 18.02, 1.95, 166.6, Math.PI/2);
  pool(scene, 19.6, 163, 3.2, 6.5, 0.9, 0xffe4b8);
  /* the door: glass, lit behind, the etched eye at the handle (Lover's eye: etched glass) */
  const doorT = canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#d8c8a0'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a4440'; g.fillRect(0, 0, w, 10); g.fillRect(0, 0, 10, h); g.fillRect(w - 10, 0, 10, h); g.fillRect(0, h - 14, w, 14);
    g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 2.4; g.beginPath(); g.ellipse(88, 128, 22, 11, 0, 0, 6.3); g.stroke(); g.beginPath(); g.arc(88, 128, 7, 0, 6.3); g.stroke(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(88, 128, 2.6, 0, 6.3); g.fill();
    for (let a = -1.2; a <= 1.2; a += 0.4) { g.beginPath(); g.moveTo(88 + Math.sin(a)*22, 128 - Math.cos(a)*11); g.lineTo(88 + Math.sin(a)*27, 128 - Math.cos(a)*16); g.stroke(); }
    g.fillStyle = '#8a847c'; g.fillRect(100, 116, 6, 26); g.fillStyle = '#a8302a'; g.font = '700 12px Arial'; g.fillText('PUSH', 40, 200); }, { k:0.5, wear:0.6 });
  const door = face(1.1, 2.2, glowMat(doorT, 0.9), 18.03, 1.25, 163.45, Math.PI/2);
  tag(door, says('the door is locked. inside, the lights are on and the coffee is fresh. nobody is behind the counter.', 'an eye is etched into the glass, right where you would push. it is looking at your hand.'));
  /* the ramp to the door, a rail beside it (accessible: the store sits up a step) */
  { const rampM = conc, N = 6; for (let i = 0; i < N; i++) { const z0 = 158.6 + i*0.5; box(18, 19.4, 0, 0.15*(i + 1)/N, z0, z0 + 0.5, rampM); }
    box(18, 19.4, 0, 0.15, 161.6, 165.2, rampM);
    for (const z of [158.7, 160.4, 161.6]) cyl(0.03, 0.03, 0.95, steel, 19.42, 0.15*(Math.min(1, (z - 158.6)/3))/1, z, 6);
    wire([19.42, 0.95, 158.7], [19.42, 1.1, 161.6], 0, steel, 0.025); }
  /* OPEN 24 HRS, in the window: its O is out */
  const openT = canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#120c0a'; g.fillRect(0, 0, w, h); g.font = '700 34px Arial, sans-serif'; g.textBaseline = 'middle'; g.fillStyle = '#4a2a24'; g.fillText('O', 14, 32); g.fillStyle = '#e04a36'; g.fillText('PEN 24 HRS', 40, 32); }, { k:0.3, wear:0.3 });
  const openS = face(1.2, 0.3, glowMat(openT, 2.4), 18.05, 2.5, 166.6, Math.PI/2); halo(18.3, 2.5, 166.6, 0.9, 0xe0583c);
  tag(openS, says('OPEN 24 HRS. the O is out.'));
  /* the heart on its pole, much taller than it needs to be, and the price board under it */
  cyl(0.18, 0.16, 9.2, steel, 26.9, 0, 154.6, 12); K.solids.push({ x0:26.7, x1:27.1, y0:0, y1:9, z0:154.4, z1:154.8 });
  const signT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#d8ccb4'; g.fillRect(0, 0, w, h); heart(g, 128, 116, 98, '#b8302a'); g.fillStyle = '#f0c050'; g.font = '900 46px "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText("LOVER'S", 128, 118); }, { k:0.6, wear:0.6 });
  const sgA = glowMat(signT, 1.6, [1.2, 2]), sgB = glowMat(signT, 1.6, [1.0, 2]); const sign = box(26.4, 27.4, 8.6, 10.6, 154.0, 155.2, [sgA, sgA, dark, dark, sgB, sgB], { solid:false });
  halo(26.9, 9.6, 154.6, 4.4, 0xd8483a);
  const priceT = canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#1a1412'; g.fillRect(0, 0, w, h); g.font = '700 22px Arial'; g.textBaseline = 'middle';
    [['UNLEADED', '1.39⁹'], ['PLUS', '1.49⁹'], ['DIESEL', '1.45⁹']].forEach((r, i) => { g.fillStyle = '#e8dcc0'; g.fillText(r[0], 14, 30 + i*48); g.fillStyle = '#e8a040'; g.fillText(r[1], 168, 30 + i*48); }); }, { k:0.5, wear:0.7 });
  { const pA = glowMat(priceT, 1.1, [1.1, 1.6]), pB = glowMat(priceT, 1.1, [0.9, 1.6]); box(26.45, 27.35, 6.6, 8.2, 154.05, 155.15, [pA, pA, dark, dark, pB, pB], { solid:false }); }
  tag(sign, says("LOVER'S. a red heart, lit, on a pole much taller than it needs to be.", 'it is the brightest thing for miles. you can\'t tell where the miles go.'));

  /* ================= the grocery outlet: a low flat roof, red letters, a cracked lot, the frosted ridge behind ================= */
  const GX0 = 42, GX1 = 58, GZ0 = 168, GZ1 = 188;
  const stuccoT = canvasTex(256, 256, (g, w, h) => { noiseFill(g, w, h, [168, 156, 136], 24, 0.05, 29); g.fillStyle = 'rgba(70,60,48,0.4)'; for (let x = 0; x < w; x += 6) if (R() < 0.3) g.fillRect(x, 0, 2, h*(0.2 + R()*0.5)); }, { tile:true, m:[3, 3] });
  const gst = mat(stuccoT, { rough:0.95 }); gst.userData.m = [3, 3];
  box(GX0, GX1, 0, 5.0, GZ0, GZ1, gst);
  const gFasciaT = canvasTex(1024, 128, (g, w, h) => { g.fillStyle = '#d8ccb4'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a4e44'; g.fillRect(0, h - 10, w, 10);
    g.font = '900 78px "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const T = 'RIDGE FOODS', dead = [2, 8];
    let x = w/2 - g.measureText(T).width/2; g.textAlign = 'left'; for (let i = 0; i < T.length; i++) { g.fillStyle = dead.includes(i) ? '#6a4a40' : '#c8302a'; g.fillText(T[i], x, 62); x += g.measureText(T[i]).width; } }, { k:0.6, wear:0.9 });
  const gf = box(GX0 - 0.3, GX0 + 0.05, 3.7, 5.3, GZ0 + 1, GZ1 - 1, [dark, glowMat(gFasciaT, 0.9, [18, 1.6]), dark, dark, dark, dark], { solid:false });   /* (its lettered face looks west, to the road)*/
  halo(GX0 - 0.6, 4.5, (GZ0 + GZ1)/2, 6, 0xc8402e);
  tag(gf, says('RIDGE FOODS. two of its letters are out.', 'a grocery outlet: everything a little past its date.'));
  const gWinT = canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#e8dcbc'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { const x = i*58; g.fillStyle = i === 3 || i === 7 ? '#2a241e' : '#f4e8c8'; g.fillRect(x + 4, 4, 50, h - 8); g.fillStyle = 'rgba(80,68,52,0.6)'; for (let s = 0; s < 3; s++) g.fillRect(x + 6, 30 + s*30, 46, 5); }
    g.fillStyle = '#c8302a'; g.font = '900 16px Arial'; g.fillText('SALE', 70, 24); g.fillText('2 FOR 1', 300, 24); }, { k:0.5, wear:0.7 });
  face(GZ1 - GZ0 - 6, 2.0, glowMat(gWinT, 1.0), GX0 - 0.02, 1.6, (GZ0 + GZ1)/2 - 1.5, -Math.PI/2);
  pool(scene, GX0 - 3, (GZ0 + GZ1)/2, 4.2, 8.5, 0.7, 0xffe8c0);
  /* the doors: they don't open; an eye stencilled on each, where you'd push (the grocery's eye: stencilled paint) */
  const gDoorT = canvasTex(128, 256, (g, w, h) => { g.fillStyle = '#d8ccae'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a5048'; g.fillRect(0, 0, w, 8); g.fillRect(0, 0, 8, h); g.fillRect(w - 8, 0, 8, h); g.fillRect(0, h - 12, w, 12);
    g.fillStyle = 'rgba(40,30,26,0.85)'; g.beginPath(); g.moveTo(34, 130); g.quadraticCurveTo(64, 104, 94, 130); g.quadraticCurveTo(64, 156, 34, 130); g.fill(); g.fillStyle = '#d8ccae'; g.beginPath(); g.arc(64, 130, 10, 0, 6.3); g.fill(); g.fillStyle = 'rgba(40,30,26,0.85)'; g.beginPath(); g.arc(64, 130, 5, 0, 6.3); g.fill();
    g.fillStyle = '#5a5048'; g.font = '700 11px Arial'; g.fillText('ENTER', 44, 190); }, { k:0.5, wear:0.8 });
  for (const z of [175.4, 176.6]) { const d = face(1.15, 2.3, glowMat(gDoorT, 0.85), GX0 - 0.03, 1.15, z, -Math.PI/2);
    tag(d, says('the doors don\'t open for you. on each one, an eye has been stencilled, right where you would push.', 'past the glass, the aisles go back further than the building does.')); }
  /* the sidewalk, its curb cut down to the lot (accessible), a cart corral, a pay phone's empty post */
  box(GX0 - 2.4, GX0, 0, 0.15, GZ0 + 0.5, 174.6, conc); box(GX0 - 2.4, GX0, 0, 0.15, 177.4, GZ1 - 0.5, conc);
  for (let i = 0; i < 4; i++) { const z0 = 174.6 + i*0.7; box(GX0 - 2.4, GX0, 0, 0.15*i/4 + 0.01, z0, z0 + 0.7, conc, { solid:i > 0 }); }   /* the cut: sloped, no step */
  const cartM = mat(null, { color:0x9a948a, rough:0.45, metal:0.6 }); cartM.envMap = K.env; cartM.envMapIntensity = 0.4;
  for (const z of [181.5, 183.8]) { cyl(0.04, 0.04, 1.0, cartM, 36.5, 0, z, 6); cyl(0.04, 0.04, 1.0, cartM, 39.5, 0, z, 6); wire([36.5, 0.95, z], [39.5, 0.95, z], 0, cartM, 0.035); }
  const carts = []; for (let i = 0; i < 6; i++) { const x = 36.9 + i*0.42; const c = box(x, x + 0.36, 0.1, 0.95, 182.0, 183.3, cartM, { solid:false }); c.material = new THREE.MeshStandardMaterial({ color:0x8a847a, roughness:0.5, metalness:0.6, wireframe:true }); carts.push(c); }
  K.solids.push({ x0:36.5, x1:39.5, y0:0, y1:1, z0:181.5, z1:183.8 });
  tag(carts[0], says('the carts are all here. not one is missing.'));
  /* the ridge behind, frosted along its top, just showing in the fog */
  { const rg = new THREE.Shape(); rg.moveTo(-30, 0); for (let i = 0; i <= 30; i++) rg.lineTo(-30 + i*2, 9 + Math.sin(i*0.5)*2.2 + Math.sin(i*1.3)*1.0); rg.lineTo(30, 0); rg.lineTo(-30, 0);
    const rm = new THREE.Mesh(new THREE.ShapeGeometry(rg), new THREE.MeshStandardMaterial({ color:0x3a3430, roughness:1 })); rm.position.set(70, 0, 178); rm.rotation.y = -Math.PI/2; scene.add(rm); }
  /* her grandmother's photo pick-up kiosk, late '80s, in the lot: a tiny booth, a yellow pyramid roof, a drive-up window */
  const KX = 35.8, KZ = 163.2;
  const kioskT = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#d8ccb4'; g.fillRect(0, 0, w, h); g.fillStyle = '#c89a3a'; g.fillRect(0, 0, w, 22); g.fillStyle = '#2a201a'; g.font = '900 13px Arial'; g.textAlign = 'center'; g.fillText('PHOTOMAT', w/2, 15);
    g.fillStyle = '#f2e2b8'; g.fillRect(24, 40, 80, 50); g.fillStyle = 'rgba(80,60,40,0.7)'; g.fillRect(30, 70, 30, 14); g.fillStyle = '#2a201a'; g.font = '700 9px Arial'; g.fillText('FILM DROP · 1 HR', w/2, 108); g.fillText('写真', w/2, 120); }, { k:0.7, wear:1 });
  const kioskM = glowMat(kioskT, 0.5, [1.6, 2.1]);
  const kb = box(KX - 0.8, KX + 0.8, 0, 2.1, KZ - 0.8, KZ + 0.8, [kioskM, kioskM, dark, dark, kioskM, kioskM]);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.35, 1.0, 4, 1), mat(null, { color:0xc89a3a, rough:0.8 })); roof.position.set(KX, 2.6, KZ); roof.rotation.y = Math.PI/4; roof.castShadow = true; scene.add(roof);
  box(KX - 1.0, KX + 1.0, 0, 0.12, KZ - 1.0, KZ + 1.0, conc);
  pool(scene, KX - 1.2, KZ, 1.6, 1.6, 0.5, 0xffe0a0);
  tag(kb, says('a little photo booth in the lot, the kind you drove up to and left your film in. one hour.', 'in its window, an envelope of prints with a name on it, too faded to read. it has been waiting a long time.'));
  tag(roof, kb.userData.say);

  /* ================= further down, in the fog: a long dark store (only its K lit) and a little ice-cream place
     (its sign lit, its letters burned out). names hers to give ================= */
  box(38, 62, 0, 6.2, 194, 206, gst);
  const kT = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#100a08'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8302a'; g.font = '900 120px "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('K', 64, 70); }, { k:0.3, wear:0.4 });
  const kS = face(3.4, 3.4, glowMat(kT, 2.0), 37.98, 4.6, 196.5, -Math.PI/2); halo(37.6, 4.6, 196.5, 5, 0xd8302a);
  tag(kS, says('only the K is lit. the rest of its name is dark, like it forgot.'));
  box(18, 25, 0, 3.4, 186, 193, block);
  box(17.8, 25.2, 3.4, 4.0, 185.8, 193.2, mat(null, { color:0x7a2a24, rough:0.8 }), { solid:false });
  const dqT = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#100a08'; g.fillRect(0, 0, w, h); g.fillStyle = '#b8302a'; g.beginPath(); g.ellipse(w/2, h/2, w*0.46, h*0.4, 0, 0, 6.3); g.fill(); g.strokeStyle = '#e8d8c0'; g.lineWidth = 4; g.stroke(); }, { k:0.4, wear:0.6 });
  cyl(0.12, 0.12, 5.2, steel, 26.4, 0, 185.4, 10); K.solids.push({ x0:26.25, x1:26.55, y0:0, y1:5, z0:185.25, z1:185.55 });
  const dqM = glowMat(dqT, 1.4, [2.2, 1.1]); const dq = box(25.3, 27.5, 5.0, 6.1, 185.25, 185.55, [dark, dark, dark, dark, dqM, dqM], { solid:false });
  halo(26.4, 5.55, 185.4, 3.2, 0xc8402e);
  tag(dq, says('the sign is lit, but its letters burned out a long time ago. you know what it said anyway.'));
  { const t = mat(null, { color:0x6a5040, rough:0.9 }); box(21, 22.6, 0.72, 0.78, 194.8, 195.6, t); box(21, 22.6, 0.42, 0.46, 194.4, 194.6, t); box(21, 22.6, 0.42, 0.46, 195.8, 196.0, t); }   /* a picnic table */

  /* ================= telephone poles on down the east verge, wires dipping between ================= */
  { const pm = mat(paintPole(), { rough:0.9 }), wm = mat(null, { color:0x120d0b }), Z = [151, 171, 191, 211];
    for (const z of Z) { cyl(0.11, 0.09, 7.6, pm, 33.4, 0, z, 12); box(32.6, 34.2, 6.9, 7.05, z - 0.06, z + 0.06, pm, { solid:false }); K.solids.push({ x0:33.3, x1:33.5, y0:0, y1:7.6, z0:z - 0.1, z1:z + 0.1 }); }
    for (let i = 0; i < Z.length - 1; i++) for (const o of [-0.6, 0.6]) wire([33.4 + o, 7.05, Z[i]], [33.4 + o, 7.05, Z[i + 1]], 0.5, wm, 0.008); }

  /* ================= grass and corn: corn round the edges of it all (the town is cut out of the corn), dead grass on
     the verges and the empty ground ================= */
  const corn = [], grass = [];
  const taken = (x, z) => (x > RD[0] - 0.8 && x < RD[1] + 0.8) || (x > APRON[0] - 0.5 && x < APRON[1] && z > APRON[2] - 0.5 && z < APRON[3] + 0.5) || (x > LOT[0] && x < 59 && z > LOT[2] - 0.5 && z < 207)
    || (x > 9.5 && x < 18.5 && z > 156 && z < 170) || (x > 17 && x < 28 && z > 185 && z < 197) || (x > 26 && x < 28 && z > 153.5 && z < 156);
  for (let x = 2; x < 60; x += 0.42) for (let z = 144; z < 210; z += 0.5) {
    const edge = x < EDGE.x0 + 0.6 || x > EDGE.x1 - 0.4 || z < 154.5 || z > EDGE.z1 - 0.4;
    if (!edge || taken(x, z)) continue; if (R() < 0.08) continue;
    corn.push([x + (R() - 0.5)*0.25, -0.05, z + (R() - 0.5)*0.25, 1.0 + R()*0.3, R()*6.3, Math.floor(R()*4), 2.6, 0, 0]);
  }
  clumps(corn, paintCornAtlas(), 2, 1, 1.1, 8);
  for (let i = 0; i < 5200; i++) { const x = EDGE.x0 + R()*(EDGE.x1 - EDGE.x0), z = 152 + R()*(EDGE.z1 - 152); if (taken(x, z)) continue; if (fbm(x*0.3, z*0.3) < 0.35 && R() < 0.6) continue;
    grass.push([x, -0.02, z, 0.4 + R()*0.45, R()*6.3, Math.floor(R()*4), 0.5 + R()*R()*1.2]); }
  for (let i = 0; i < 160; i++) { const x = LOT[0] + R()*(LOT[1] - LOT[0]), z = LOT[2] + R()*(LOT[3] - LOT[2]); grass.push([x, 0.0, z, 0.14 + R()*0.08, R()*6.3, Math.floor(R()*4), 0.5]); }   /* weeds in the lot's cracks */
  clumps(grass, paintGrassAtlas(), 3, 1, 1.0);
}

/* (Nov 5, doc 39: "the Hell Is Real sign along Main Street in the corn") on the road from the station, before the fog:
   a black board, white letters, standing in the corn east of the road, turned toward you as you walk south */
export function hellIsReal(scene){
  const t = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
    g.fillStyle = '#16100e'; g.fillRect(0, 0, 512, 256); g.fillStyle = '#ece4d6'; g.font = '900 92px "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HELL IS', 256, 84); g.fillText('REAL', 256, 180);
    realCanvas(c, { k:0.9, wear:1 }); return tex(c, { clampEdge:true }); })();
  const pm = mat(paintPole(), { rough:0.9 }), back = mat(null, { color:0x2a2420, rough:0.95 });
  const G = new THREE.Group(); G.position.set(35.2, 0, 31.2); G.rotation.y = -2.56; scene.add(G);   /* (its face turned to you, coming down the road) */
  const board = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 0.08), [back, back, back, back, mat(t, { rough:0.8 }), back]); board.position.set(0, 4.6, 0); board.castShadow = true; G.add(board);
  for (const x of [-1.2, 1.2]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 5.6, 10), pm); p.position.set(x, 2.6, -0.08); G.add(p); }
  board.userData.reach = 11;   /* (it stands out in the corn: read from the road) */
  tag(board, says('HELL IS REAL. white letters on black, out in the corn, turned toward the road.', 'nobody put it here for you. it feels like they did.'));
}

/* a heart, drawn (Lover's) */
function heart(g, cx, cy, s, col){ g.fillStyle = col; g.beginPath(); g.moveTo(cx, cy + s*0.7);
  g.bezierCurveTo(cx - s*1.1, cy - s*0.05, cx - s*0.55, cy - s*0.85, cx, cy - s*0.35); g.bezierCurveTo(cx + s*0.55, cy - s*0.85, cx + s*1.1, cy - s*0.05, cx, cy + s*0.7); g.fill(); }
