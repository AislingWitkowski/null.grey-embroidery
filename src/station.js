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
import { stationKnob, stationLock, shedDoor, snackBox } from './eyes.js';
import { realCanvas } from './real.js';
import { wallDetails, awningDetails, binDetails, dreamPoster } from './details.js';
import { K, kitInit, mat, sized, box, lathe, plane, wire, clumps, rnd, cyl, seamTex } from './kit.js';
import { paint, vn, fbm, frac, clamp, sm, hsh, paintFacade, paintStucco, paintTin, paintBoards, paintFascia, paintIron, paintWood, paintPole, paintConcrete, paintStrip, paintFace, paintGrassAtlas, paintCornAtlas, paintNameBoard, paintHangSign, paintVendFront, paintLeafAtlas, paintFarTrees } from './paint.js';
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
const TX0 = -10, TZ0 = -14, TW = 66, TD = 56;   /* (Nov 18: on east to x 56, for the corn and trees behind the windmill) */   /* (Nov 17, evening: on to z 42, for the second mileage sign and the poles going off) */
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
/* (Nov 18, late; her photos: the leaf carpets under every tree, the leaves drifted along path edges, the dark prints
   leaves leave on wet asphalt) a litter of leaves painted into the ground: thick under each tree, thinning outward */
const TREES_AT = [[4.6, 6.0, 3.6], [36.8, 6.2, 3.4], [45.5, 15.5, 4], [14.0, 19.0, 4.2], [51.2, 23.4, 3.6], [50.6, 16.6, 4], [52.6, 19.8, 3.4]];
function litter(x, z){ let a = 0; for (const [tx, tz, R] of TREES_AT) { const d = Math.hypot((x - tx)*0.9, z - tz); if (d < R) a = Math.max(a, sm(R, R*0.2, d)); } return a; }
const LEAF_INK = ['hamber', 'hrust', 'hgold', 'hrust', 'hwood', 'hamber'];
function leafSpeck(x, z, dens){   /* a leaf-sized fleck of colour, or null */
  const cx = Math.floor(x*9), cz = Math.floor(z*9), h = frac(Math.sin(cx*127.1 + cz*311.7)*43758.5);
  if (h > dens) return null; const ox = frac(h*13.7)*0.6 + 0.2, oz = frac(h*71.3)*0.6 + 0.2, dx = x*9 - cx - ox, dz = z*9 - cz - oz, a = h*40, rr = 0.24 + 0.14*frac(h*5.1);
  const lx = dx*Math.cos(a) - dz*Math.sin(a), lz = dx*Math.sin(a) + dz*Math.cos(a); if (lx*lx/(rr*rr) + lz*lz/(rr*rr*0.45) > 1) return null;
  return [LEAF_INK[Math.floor(frac(h*91.7)*6)], 0.38 + 0.26*frac(h*37.3) - 0.1*(lx/rr)];
}
function paintGround(){
  return paint(2253, 1911, TW, TD, (u, v) => {
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
    if (pud > 0.69 + 0.025*vn(x*5, z*5)) return r('hgrey', 0.36 + 0.06*sm(0.69, 0.8, pud) + 0.03*vn(x*2, z*2), 0.1, 0.04);   /* (Nov 19) puddles hold the dusk sky, pale and still, not black holes */
    const mud = f + 0.08*vn(x*6, z*6) > 0.6 || (Math.abs(frac(x*0.9) - 0.5) < 0.12 && z > 11), rim = pud > 0.64;
    if (mud || rim) return r('hwood', 0.27 + 0.1*n + 0.06*g + 0.04*fine, 0.3 + 0.3*g + 0.2*fine, rim ? 0.45 : 0.75);   /* (Nov 19: lighter, closer to the grass, so mud reads as earth, not black blotches) */
    return r(n > 0.62 ? 'hsage' : 'hgold', 0.24 + 0.14*g + 0.06*n + 0.05*fine, 0.5 + 0.4*fine, 1);
  }, { nrm:1.2 });
}
/* (Nov 18, late; Aisling: "leaves all floating again") the ground's real surface: the mesh is a grid of groundAt's heights
   every 0.25 m, flat between them, so anything laid on the ground uses this, not groundAt, and lies right on it */
export function groundSurf(x, z){ const S = 0.25, u = (x - TX0)/S, v = (z - TZ0)/S, ix = Math.floor(u), iz = Math.floor(v), fx = u - ix, fz = v - iz;
  const H = (i, j) => groundAt(TX0 + i*S, TZ0 + j*S), ha = H(ix, iz), hb = H(ix, iz + 1), hc = H(ix + 1, iz + 1), hd = H(ix + 1, iz);
  return fx + fz <= 1 ? ha + (hd - ha)*fx + (hb - ha)*fz : hc + (hb - hc)*(1 - fx) + (hd - hc)*(1 - fz); }
function groundMesh(){
  const g = new THREE.PlaneGeometry(TW, TD, TW*4, TD*4); g.rotateX(-Math.PI/2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) + TX0 + TW/2, z = p.getZ(i) + TZ0 + TD/2; p.setXYZ(i, x, groundAt(x, z), z); }
  g.computeVertexNormals();
  const t = paintGround(); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  const gm = mat(t);
  /* (Nov 19, the texture pass) the ground up close: the big painted picture is too coarse at your feet, so a fine detail
     picture tiles over it at true size: asphalt's stones and tar on the road, crumbs of earth, grit and bits of twig
     everywhere else. it fades out with distance (so no repeating pattern far off) */
  const GD = paint(512, 512, 2, 2, (x, y) => { const st = vn(x*40, y*40), st2 = vn(x*90 + 7, y*90), cr = vn(x*14, y*14), tw = Math.abs(frac(x*3 + 0.3*vn(x*2, y*6)) - 0.5) < 0.01 && vn(x*1.5, y*3) > 0.7;
      return ['hgrey', clamp(0.5 + 0.22*(st - 0.5) + 0.16*(st2 - 0.5) + (st2 > 0.8 ? 0.12 : 0) - (tw ? 0.25 : 0), 0, 1), 1, 0.5 + 0.3*st + 0.2*st2 - (tw ? 0.3 : 0) + 0.1*cr]; }, { nrm:2.5 });
  const GE = paint(512, 512, 2, 2, (x, y) => { const cl = vn(x*22, y*22), cr2 = vn(x*70, y*70), pb = vn(x*55 + 3, y*55) > 0.83, tw = Math.abs(frac(x*2.2 + y*0.4 + 0.4*vn(x*2, y*3)) - 0.5) < 0.012 && vn(x*1.2 + 9, y*2) > 0.72;
      return ['hgrey', clamp(0.5 + 0.24*(cl - 0.5) + 0.12*(cr2 - 0.5) + (pb ? 0.14 : 0) - (tw ? 0.22 : 0), 0, 1), 1, 0.5 + 0.35*cl + 0.15*cr2 + (pb ? 0.3 : 0)]; }, { nrm:2.2 });
  for (const tt of [GD, GE, GD.userData.normal, GE.userData.normal]) { tt.wrapS = tt.wrapT = THREE.RepeatWrapping; tt.needsUpdate = true; }
  gm.userData.noDetail = true;
  gm.onBeforeCompile = sh => { sh.uniforms.uGD = { value:GD }; sh.uniforms.uGE = { value:GE }; sh.uniforms.uGDn = { value:GD.userData.normal }; sh.uniforms.uGEn = { value:GE.userData.normal }; sh.uniforms.uRoad = { value:new THREE.Vector2(ROAD[0], ROAD[1]) };
    sh.vertexShader = 'varying vec3 vGW;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vGW = (modelMatrix*vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = 'uniform sampler2D uGD, uGE, uGDn, uGEn; uniform vec2 uRoad; varying vec3 vGW;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', '#include <map_fragment>\n float gRd = smoothstep(uRoad.x - 0.15, uRoad.x + 0.1, vGW.x)*smoothstep(uRoad.y + 0.15, uRoad.y - 0.1, vGW.x)*step(8.6, vGW.z), gFar = 1.0 - smoothstep(6.0, 22.0, length(vGW - cameraPosition));\n' +
        ' vec2 gUV = vGW.xz*0.5; float gD = mix(texture2D(uGE, gUV).r, texture2D(uGD, gUV*1.3).r, gRd), gD2 = mix(texture2D(uGE, gUV*0.21).r, texture2D(uGD, gUV*0.27).r, gRd);\n' +
        ' diffuseColor.rgb *= mix(1.0, (0.62 + 0.76*gD)*(0.85 + 0.3*gD2), gFar*0.85);')
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n { vec3 dn = mix(texture2D(uGEn, gUV).xyz, texture2D(uGDn, gUV*1.3).xyz, gRd)*2.0 - 1.0; normal = normalize(normal + vec3(dn.x, 0.0, -dn.y)*0.6*gFar); }')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = clamp(roughnessFactor*(0.85 + 0.3*gD), 0.05, 1.0);'); };
  gm.customProgramCacheKey = () => 'ground-detail';
  const me = new THREE.Mesh(g, gm); me.receiveShadow = true; K.scene.add(me); tag(me, hit => groundSay(hit, ROAD));
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
    facade: mat(T.facade), stucco: mat(T.stucco), tin: mat(T.tin, { rough:0.7, metal:0.3 }), tinG: mat(T.tinG, { rough:0.7, metal:0.3 }), boards: mat(T.boards, { emit:0x18120c }),   /* (Nov 19: the ceiling holds a little of the bulbs' warmth, not a void) */
   
    fascia: mat(T.fascia, { cut:0.5, two:true }), iron: mat(T.iron, { rough:0.6, metal:0.2 }), wood: mat(T.wood), woodD: mat(T.woodD), conc: mat(T.conc, { rough:0.85 }), pole: mat(paintPole(), { rough:0.9 }),
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
  /* (Nov 19, detail pass: each sleeper its own age, a few sunk or skewed; spikes by the plates; loose stones of ballast) */
  { const c = new THREE.Color(); for (let i = 0; i < 90; i++) { const k = 0.72 + 0.4*hsh(i, 11), sunk = hsh(i, 12) < 0.12 ? 0.025 : 0, sk = (hsh(i, 13) - 0.5)*(hsh(i, 14) < 0.2 ? 0.12 : 0.03);
      m4.makeRotationY(sk); m4.setPosition(-6 + i*0.6, -0.58 - sunk, 2.0 + (hsh(i, 3) - 0.5)*0.04); sl.setMatrixAt(i, m4); c.setRGB(k, k*0.96, k*0.9); sl.setColorAt(i, c); }
    sl.instanceMatrix.needsUpdate = true; if (sl.instanceColor) sl.instanceColor.needsUpdate = true; }
  const spk = new THREE.InstancedMesh(new THREE.BoxGeometry(0.018, 0.03, 0.018), new THREE.MeshStandardMaterial({ color:0x3a2a22, roughness:0.6, metalness:0.4 }), 360);
  for (let i = 0; i < 90; i++) for (let k = 0; k < 4; k++) { const z = (k < 2 ? 1.55 : 2.45) + (k % 2 ? 0.085 : -0.085); m4.makeTranslation(-6 + i*0.6 + (k % 2 ? 0.05 : -0.05), -0.512, z); spk.setMatrixAt(i*4 + k, m4); }
  scene.add(spk);
  { const N = 4200, st = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.026, 0), new THREE.MeshStandardMaterial({ color:0x625c56, roughness:0.95 }), N), c = new THREE.Color(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    for (let i = 0; i < N; i++) { const x = -2 + hsh(i, 21)*44, z = 1.05 + hsh(i, 22)*1.9, sz = 0.5 + hsh(i, 23)*0.9;
      e.set(hsh(i, 24)*6, hsh(i, 25)*6, hsh(i, 26)*6); q.setFromEuler(e); v.set(x, -0.6 + (hsh(i, 27) - 0.5)*0.02, z); sc.set(sz, sz*(0.6 + hsh(i, 28)*0.4), sz); m4.compose(v, q, sc); st.setMatrixAt(i, m4);
      const k = 0.45 + hsh(i, 29)*0.45, r = Math.abs(z - 1.55) < 0.12 || Math.abs(z - 2.45) < 0.12 ? 1.12 : 1; c.setRGB(k*r, k, k/r); st.setColorAt(i, c); }   /* (rust-stained near the rails) */
    st.receiveShadow = true; scene.add(st); }
  /* the rails in their real shape (foot, web, head), on tie plates */
  const rs = new THREE.Shape(); [[-0.065, 0], [0.065, 0], [0.065, 0.012], [0.012, 0.03], [0.009, 0.11], [0.032, 0.12], [0.032, 0.15], [-0.032, 0.15], [-0.032, 0.12], [-0.009, 0.11], [-0.012, 0.03], [-0.065, 0.012]].forEach((p, i) => i ? rs.lineTo(p[0], p[1]) : rs.moveTo(p[0], p[1]));
  const railG = new THREE.ExtrudeGeometry(rs, { depth:54, bevelEnabled:false, steps:216 }); railG.rotateY(Math.PI/2);
  { const p = railG.attributes.position, col = new Float32Array(p.count*3);   /* (Nov 19, detail pass: the head worn bright by the wheels, the web and foot rusted, patchy along the line) */
    for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i), r = vn(x*1.3, 4)*0.5 + vn(x*7, 9)*0.25;
      const c = y > 0.135 ? [0.78, 0.76, 0.74] : (y > 0.118 ? [0.5, 0.42, 0.38] : [0.52 + 0.12*r, 0.3 + 0.06*r, 0.2 + 0.03*r]);
      col[i*3] = c[0]; col[i*3 + 1] = c[1]; col[i*3 + 2] = c[2]; }
    railG.setAttribute('color', new THREE.BufferAttribute(col, 3)); M.rail.vertexColors = true; M.rail.color.set(0xb0aaa4); M.rail.roughness = 0.55; }
  for (const z of [1.55, 2.45]) { const me = new THREE.Mesh(railG, M.rail); me.position.set(-6, -0.535, z); me.castShadow = me.receiveShadow = true; scene.add(me); }
  const tp = new THREE.InstancedMesh(new THREE.BoxGeometry(0.17, 0.016, 0.24), M.iron, 180);
  for (let i = 0; i < 90; i++) for (let k = 0; k < 2; k++) { m4.makeTranslation(-6 + i*0.6, -0.528, k ? 2.45 : 1.55); tp.setMatrixAt(i*2 + k, m4); }
  tp.receiveShadow = true; scene.add(tp);

  /* ---- telephone poles along the line, wires between, sagging ---- */
  const PX = [4, 11, 18, 25, 32, 39], LZ = 0.8;   /* (Nov 17, night: back from the track to 0.8, so the real-size train clears them) */
  PX.forEach((x, i) => {
    tag(cyl(0.11, 0.09, 7.7, M.pole, x + 0.08, -0.5, LZ, 16), 'pole'); SRC.poles.push({ x:x + 0.08, y:6.7, z:LZ }); K.solids.push({ x0:x, x1:x + 0.16, y0:-0.5, y1:7.2, z0:LZ - 0.08, z1:LZ + 0.08 }); box(x - 0.6, x + 0.76, 6.62, 6.74, LZ - 0.05, LZ + 0.05, M.woodD, { solid:false });
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
      for (const kx of [x + 0.44, x + 0.66]) for (const me of stationKnob(scene, kx, 1.0, zf, s)) tag(me, wallSay);   /* (Nov 19: the station's eye knobs, cast brass; src/eyes.js) */
      if (s < 0) {   /* the chain across, and its lock */
        wire([x + 0.25, 1.15, 7.975], [x + 0.85, 1.15, 7.975], 0.12, M.iron, 0.012);
        for (const me of stationLock(scene, x + 0.55, 1.0, 7.97)) tag(me, wallSay);   /* (its padlock: rusted iron, an eye among leaves and flowers) */
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
  wallDetails(scene, M);   /* (Nov 19, detail pass: the wet at the walls' foot, a vent in each gable; src/details.js) */
  box(24.2, 24.55, 2.0, 2.4, 7.9, 8.0, M.iron, { solid:false }); box(24.35, 24.4, 2.4, 3.15, 7.95, 7.99, M.iron, { solid:false, cast:false });   /* junction box, conduit up into the canopy */
  /* the canopy's rafters, from the beam back to the wall */
  for (const x of [10.5, 13.5, 16.5, 19.5, 22.5, 9.05, 24.95]) box(x - 0.05, x + 0.05, 2.98, 3.15, 4.21, 8, M.woodD, { solid:false });

  /* on the wall: the bench, the poster, the line map, the timetable (Seam's own pictures, below) */
  /* (Nov 19, the texture pass) the bench is slats now, with gaps, not one board: three on the seat, two on the back */
  K.solids.push({ x0:11.4, x1:12.76, y0:0, y1:0.43, z0:7.57, z1:7.95 });
  const benchW = M.wood.clone(); benchW.map = M.wood.map.clone(); benchW.map.center.set(0.5, 0.5); benchW.map.rotation = Math.PI/2; benchW.map.needsUpdate = true; if (M.wood.normalMap) { benchW.normalMap = M.wood.normalMap.clone(); benchW.normalMap.center.set(0.5, 0.5); benchW.normalMap.rotation = Math.PI/2; benchW.normalMap.needsUpdate = true; } benchW.userData = { ...M.wood.userData, m:[1, 0.25] };   /* (grain along the slats) */
  for (const [z0, z1] of [[7.57, 7.68], [7.695, 7.805], [7.82, 7.93]]) tag(box(11.4, 12.76, 0.38, 0.43, z0, z1, benchW, { solid:false }), 'bench');
  box(11.42, 12.74, 0.34, 0.38, 7.6, 7.9, M.woodD, { solid:false });   /* the rail under the slats */ box(11.45, 11.55, 0, 0.38, 7.6, 7.92, M.woodD, { solid:false }); box(12.61, 12.71, 0, 0.38, 7.6, 7.92, M.woodD, { solid:false });
  for (const [y0, y1] of [[0.52, 0.64], [0.68, 0.8]]) tag(box(11.4, 12.76, y0, y1, 7.9, 7.95, benchW, { solid:false }), 'bench');
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
  const hs = paintHangSign(); const hsM = new THREE.MeshStandardMaterial({ map:hs, emissiveMap:hs, emissive:new THREE.Color(1, 0.86, 0.62), emissiveIntensity:1.1, roughness:0.8 }); hsM.userData.m = [2.2, 0.48];   /* (Nov 19: one picture over the whole face) */
  tag(box(15.2, 17.4, 2.18, 2.66, 5.9, 5.96, [M.dark, M.dark, M.dark, M.dark, hsM, hsM], { solid:false, cast:false }), 'sign');
  for (const x of [15.5, 17.1]) box(x, x + 0.02, 2.66, C, 5.92, 5.94, M.wire, { solid:false, cast:false });

  /* ---- the corner: the shed, its awning, the phone, the bin, the jerry can, the drinks machine ---- */
  tag(box(25, 28.9, -0.3, 2.62, 8, 9.6, M.tinG), () => F3_WALL.back[1]);
  for (const me of shedDoor(scene, 28.9, 8.45, 9.25, 2.0).meshes) tag(me, () => F3_WALL.back[1]);   /* (Nov 19) the shed's door on its east side, its eye scratched in (src/eyes.js) */
  snackBox(scene, 11.18, 0, 7.42, 0.7);   /* (Nov 19) an empty box of caramel corn, crushed, by the bench's west end */
  box(24.95, 29.05, 2.62, 2.7, 7, 9.7, [M.tinG, M.tinG, M.tin, M.tinG, M.tinG, M.tinG], { solid:false });
  box(25, 29, 2.48, 2.62, 6.98, 7.02, M.tin, { solid:false });
  for (const x of [25.05, 28.9]) K.solids.push({ x0:x, x1:x + 0.05, y0:0, y1:2.62, z0:7.0, z1:7.05 });
  awningDetails(scene, M);   /* (Nov 19, detail pass: rafters, a purlin, the drip edge, pipe posts with braces; src/details.js) */
  /* (Nov 18, Aisling: "we need a pay phone … i dont think its a booth this time … i think its more the little box … we didnt
     have boxes in ohio … obviously not blue so maybe like silver is better choice? i like havign graffitit but not a crzy
     amount") an Ohio payphone of the 90s: a brushed steel shroud on the station's west gable, open at the front, its lit
     header (電話 · PHONE, warm, no blue), inside the black phone with its chrome face (keypad, coin slot, coin return, the
     card of instructions), the handset on its hook, the armoured cord hanging; a little marker and a sticker on the steel */
  { const cvT = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    /* (Nov 18, night; Aisling: "look at the phone textures again and try to upgrade those") every steel surface is painted
       at its true shape and twice the detail, each with a bump picture and a roughness picture beside its colour: fine
       brushing, dents, scratches, rust blooming round the screws and running down under them, grime gathering low,
       fingerprints round the keys, the key numbers worn on the ones used most, a stained instruction card. */
    const RR = rnd(712);
    const trio = (w, h, f) => { const mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }, C = mk(), Bm = mk(), Rg = mk();
      const g = C.getContext('2d'), b = Bm.getContext('2d'), r = Rg.getContext('2d'); b.fillStyle = '#808080'; b.fillRect(0, 0, w, h); r.fillStyle = '#5a5a5a'; r.fillRect(0, 0, w, h);
      f(g, b, r, w, h); realCanvas(C, { k:0.8 }); const T = c => {   /* (Nov 20: the phone's metal and face, the real pass) */ const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };
      const t = T(C); t.colorSpace = THREE.SRGBColorSpace; return { map:t, bump:T(Bm), rough:T(Rg) }; };
    const brushed = (g, b, r, w, h, base, k = 1) => { g.fillStyle = base; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 5200*k; i++) { const y = RR()*h, l = (0.04 + RR()*0.3)*w, x = RR()*w, a = 0.06 + RR()*0.1;   /* the brushing: thousands of fine strokes one way */
        g.fillStyle = RR() < 0.5 ? `rgba(255,250,240,${a})` : `rgba(28,24,22,${a})`; g.fillRect(x, y, l, 1 + (RR() < 0.15 ? 1 : 0));
        if (RR() < 0.3) { b.fillStyle = `rgba(${RR() < 0.5 ? 150 : 110},128,128,0.25)`; b.fillRect(x, y, l, 1); } }
      for (let i = 0; i < 4*k; i++) { const x = RR()*w, y = RR()*h, rr = 10 + RR()*30, gd = b.createRadialGradient(x, y, 0, x, y, rr); gd.addColorStop(0, 'rgba(60,60,60,0.6)'); gd.addColorStop(1, 'rgba(128,128,128,0)'); b.fillStyle = gd; b.fillRect(x - rr, y - rr, rr*2, rr*2);   /* dents */
        const gl = g.createRadialGradient(x - rr*0.3, y - rr*0.3, 0, x, y, rr); gl.addColorStop(0, 'rgba(255,250,240,0.06)'); gl.addColorStop(0.6, 'rgba(20,16,14,0.07)'); gl.addColorStop(1, 'rgba(20,16,14,0)'); g.fillStyle = gl; g.fillRect(x - rr, y - rr, rr*2, rr*2); }
      for (let i = 0; i < 46*k; i++) { const x = RR()*w, y = RR()*h, dx = (RR() - 0.5)*w*0.3, dy = (RR() - 0.5)*h*0.04;   /* scratches, cut through to brighter metal */
        g.strokeStyle = `rgba(230,226,218,${0.12 + RR()*0.2})`; g.lineWidth = 0.7 + RR()*0.8; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + dx/2 + (RR() - 0.5)*8, y + dy/2, x + dx, y + dy); g.stroke();
        b.strokeStyle = 'rgba(70,70,70,0.7)'; b.lineWidth = 1; b.beginPath(); b.moveTo(x, y); b.quadraticCurveTo(x + dx/2, y + dy/2, x + dx, y + dy); b.stroke();
        r.strokeStyle = 'rgba(30,30,30,0.6)'; r.lineWidth = 1.2; r.beginPath(); r.moveTo(x, y); r.lineTo(x + dx, y + dy); r.stroke(); }
      for (let i = 0; i < 140*k; i++) { const x = RR()*w, y = h*(0.55 + RR()*0.45), rr = 3 + RR()*14; g.fillStyle = `rgba(${70 + RR()*30},${48 + RR()*20},34,${0.04 + RR()*0.08})`; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); r.fillStyle = 'rgba(200,200,200,0.12)'; r.beginPath(); r.arc(x, y, rr, 0, 7); r.fill(); }   /* grime, rougher */
      for (let i = 0; i < 18*k; i++) { const x = RR()*w, y0 = RR()*h*0.5, L = h*(0.2 + RR()*0.5), wd = 3 + RR()*10, sg = g.createLinearGradient(0, y0, 0, y0 + L); sg.addColorStop(0, 'rgba(50,40,32,0)'); sg.addColorStop(0.3, `rgba(50,40,32,${0.08 + RR()*0.1})`); sg.addColorStop(1, 'rgba(50,40,32,0)'); g.fillStyle = sg; g.fillRect(x, y0, wd, L); r.fillStyle = 'rgba(200,200,200,0.15)'; r.fillRect(x, y0, wd, L); }   /* water stains run down it */
      for (let i = 0; i < 10*k; i++) { const x = RR()*w, y = RR()*h, rr = 30 + RR()*80, rg = r.createRadialGradient(x, y, 0, x, y, rr); rg.addColorStop(0, 'rgba(160,160,160,0.25)'); rg.addColorStop(1, 'rgba(160,160,160,0)'); r.fillStyle = rg; r.fillRect(x - rr, y - rr, rr*2, rr*2); }   /* (the sheen patchy: dull where hands and weather have been) */
      const gr = g.createLinearGradient(0, h*0.6, 0, h); gr.addColorStop(0, 'rgba(60,40,30,0)'); gr.addColorStop(1, 'rgba(58,38,28,0.42)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); };
    const screw = (g, b, r, x, y, s) => { const gd = g.createRadialGradient(x - s*0.3, y - s*0.3, 0, x, y, s); gd.addColorStop(0, '#d8d4cc'); gd.addColorStop(1, '#5e5a54'); g.fillStyle = gd; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill();
      g.strokeStyle = '#2a2624'; g.lineWidth = s*0.25; g.beginPath(); g.moveTo(x - s*0.6, y); g.lineTo(x + s*0.6, y); g.moveTo(x, y - s*0.6); g.lineTo(x, y + s*0.6); g.stroke();   /* a tamper-proof head */
      b.fillStyle = '#c8c8c8'; b.beginPath(); b.arc(x, y, s, 0, 7); b.fill();
      for (let k = 0; k < 3; k++) { const rl = s*(4 + RR()*14); const rg = g.createLinearGradient(x, y, x, y + rl); rg.addColorStop(0, 'rgba(120,58,30,0.55)'); rg.addColorStop(1, 'rgba(120,58,30,0)'); g.fillStyle = rg; g.fillRect(x - s*0.5 + (RR() - 0.5)*s*0.8, y, s*(0.3 + RR()*0.5), rl); }   /* the rust running down under it */
      const rb = g.createRadialGradient(x, y, s*0.8, x, y, s*2); rb.addColorStop(0, 'rgba(130,64,32,0.5)'); rb.addColorStop(1, 'rgba(130,64,32,0)'); g.fillStyle = rb; g.fillRect(x - s*2, y - s*2, s*4, s*4); r.fillStyle = 'rgba(230,230,230,0.5)'; r.beginPath(); r.arc(x, y, s*1.8, 0, 7); r.fill(); };
    /* the shroud's sides: 0.34 m deep by 1.0 m tall */
    const SIDE = trio(348, 1024, (g, b, r, w, h) => { brushed(g, b, r, w, h, '#625b52', 1.2);
      for (let y = 60; y < h; y += 150) screw(g, b, r, w - 14, y, 6);   /* screws along its front edge */
      g.strokeStyle = 'rgba(26,20,18,0.82)'; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(70, 600); g.bezierCurveTo(115, 510, 160, 660, 200, 570); g.lineTo(232, 640); g.moveTo(172, 548); g.lineTo(186, 690); g.stroke();   /* a marker tag, not anyone's in particular */
      g.strokeStyle = 'rgba(26,20,18,0.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(200, 575); g.lineTo(203, 612); g.stroke();   /* (its drip) */
      g.strokeStyle = 'rgba(236,230,220,0.75)'; g.lineWidth = 2; g.beginPath(); g.moveTo(96, 770); g.lineTo(140, 756); g.lineTo(132, 786); g.lineTo(186, 772); g.stroke(); b.strokeStyle = '#404040'; b.lineWidth = 2; b.beginPath(); b.moveTo(96, 770); b.lineTo(140, 756); b.lineTo(132, 786); b.lineTo(186, 772); b.stroke();   /* a white scratch-tag, cut into it */
      g.save(); g.translate(200, 300); g.rotate(-0.12); g.fillStyle = '#e6d9bc'; g.beginPath(); g.moveTo(-56, -28); g.lineTo(56, -28); g.lineTo(56, 18); g.lineTo(40, 28); g.lineTo(-56, 28); g.closePath(); g.fill();   /* a sticker, one corner peeled */
      g.fillStyle = 'rgba(120,90,60,0.25)'; g.fillRect(-56, 10, 112, 18); g.fillStyle = '#d2c4a4'; g.beginPath(); g.moveTo(56, 18); g.lineTo(40, 28); g.lineTo(52, 32); g.closePath(); g.fill();
      g.fillStyle = '#922820'; g.font = '700 26px "Hiragino Sans","Noto Sans CJK JP",sans-serif'; g.textAlign = 'center'; g.fillText('迷子', 0, -2); g.font = '700 15px "Helvetica Neue",Arial,sans-serif'; g.fillText('lost cat', 0, 19); g.restore();
      b.save(); b.translate(200, 300); b.rotate(-0.12); b.fillStyle = '#909090'; b.fillRect(-56, -28, 112, 56); b.restore();
      g.fillStyle = 'rgba(190,180,160,0.35)'; g.fillRect(40, 860, 70, 44); g.fillStyle = 'rgba(70,60,50,0.25)'; for (let k = 0; k < 30; k++) g.fillRect(40 + RR()*70, 860 + RR()*44, 2 + RR()*5, 1 + RR()*3);   /* the glue of a sticker long torn off */ });
    const IN = trio(256, 512, (g, b, r, w, h) => brushed(g, b, r, w, h, '#665f56', 1.6));   /* the inside of the shroud */
    for (const t of [IN.map, IN.bump, IN.rough]) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    /* the header: 0.62 m by 0.12 m, lit from behind */
    const head = (() => { const c = document.createElement('canvas'); c.width = 1024; c.height = 198; const g = c.getContext('2d'), w = c.width, h = c.height;
      const gb = g.createLinearGradient(0, 0, w, 0); gb.addColorStop(0, '#d9ccb2'); gb.addColorStop(0.45, '#f2e9d6'); gb.addColorStop(0.62, '#efe4cc'); gb.addColorStop(0.75, '#a89a82'); gb.addColorStop(0.82, '#c4b79e'); gb.addColorStop(1, '#e6dcc6'); g.fillStyle = gb; g.fillRect(0, 0, w, h);   /* (the tube behind it going at one end: a dimmer patch) */
      for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(70,50,36,${0.05 + RR()*0.1})`; g.beginPath(); g.arc(RR()*w, RR()*h, 2 + RR()*10, 0, 7); g.fill(); }   /* dead flies and dust inside the lens */
      g.fillStyle = 'rgba(80,56,40,0.35)'; g.fillRect(0, h - 22, w, 22); g.fillRect(0, 0, w, 8);
      g.fillStyle = '#35261a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 82px "Hiragino Sans","Noto Sans CJK JP","Yu Gothic",sans-serif'; g.fillText('電話', w*0.3, h/2 - 2);
      g.font = '800 88px "Helvetica Neue",Arial,sans-serif'; g.fillText('PHONE', w*0.66, h/2);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; })();
    /* the phone's face: 0.29 m wide by 0.76 m tall, drawn in millimetres */
    const FACE = trio(464, 1216, (g, b, r, w, h) => { const S = w/290; g.scale(S, S); b.scale(S, S); r.scale(S, S); const W2 = 290;
      g.fillStyle = '#191615'; g.fillRect(0, 0, W2, 760); r.fillStyle = '#9a9a9a'; r.fillRect(0, 0, W2, 760);   /* the black painted housing */
      for (const [x, y] of [[10, 10], [280, 10], [10, 750], [280, 750], [10, 370], [280, 370]]) screw(g, b, r, x, y, 3.2);
      const cg = g.createLinearGradient(0, 0, W2, 0); cg.addColorStop(0, '#85827c'); cg.addColorStop(0.35, '#cfccc4'); cg.addColorStop(0.55, '#e0ddd6'); cg.addColorStop(1, '#827f79'); g.fillStyle = cg; g.fillRect(20, 22, 250, 336);   /* the chrome face */
      r.fillStyle = '#303030'; r.fillRect(20, 22, 250, 336); b.fillStyle = '#a0a0a0'; b.fillRect(20, 22, 250, 336);
      for (let i = 0; i < 900; i++) { g.fillStyle = RR() < 0.5 ? 'rgba(255,255,250,0.05)' : 'rgba(30,26,24,0.05)'; g.fillRect(20 + RR()*240, 22 + RR()*336, 4 + RR()*40, 0.4); }
      g.fillStyle = '#93331f'; g.fillRect(32, 34, 92, 56); g.fillStyle = '#efe6d2'; g.font = '800 13px "Helvetica Neue",Arial,sans-serif'; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText('1 LIFT', 40, 52); g.fillText('2 LISTEN', 40, 68); g.fillText('3 COINS', 40, 84);   /* the steps, in an old orange-red */
      g.fillStyle = '#9d9a94'; g.fillRect(180, 34, 70, 26); g.fillStyle = '#141211'; g.fillRect(196, 44, 38, 5); b.fillStyle = '#d0d0d0'; b.fillRect(180, 34, 70, 26); b.fillStyle = '#202020'; b.fillRect(196, 44, 38, 5);   /* the coin slot, raised */
      g.fillStyle = '#bcb8b0'; g.fillRect(196, 66, 40, 18); b.fillStyle = '#c0c0c0'; b.fillRect(196, 66, 40, 18); g.fillStyle = '#3a3430'; g.font = '700 7px Arial,sans-serif'; g.fillText('COIN RELEASE', 194, 94);
      g.fillStyle = '#ebe2cc'; g.fillRect(30, 104, 230, 74); g.fillStyle = 'rgba(140,110,70,0.25)'; g.beginPath(); g.ellipse(220, 160, 40, 18, 0.3, 0, 7); g.fill(); g.fillStyle = 'rgba(140,110,70,0.18)'; g.fillRect(30, 104, 230, 6);   /* the instruction card, stained */
      g.fillStyle = '#35261a'; g.font = '700 15px "Helvetica Neue",Arial,sans-serif'; g.fillText('LOCAL CALLS  25¢', 40, 126); g.font = '700 13px "Hiragino Sans","Noto Sans CJK JP",sans-serif'; g.fillText('市内通話  ·  dial 0 for operator', 40, 148); g.fillStyle = '#93331f'; g.fillRect(30, 164, 230, 5); r.fillStyle = '#c0c0c0'; r.fillRect(30, 104, 230, 74);
      const worn = { '5':0.55, '0':0.5, '1':0.35, '9':0.3 };
      for (let rr = 0; rr < 4; rr++) for (let c = 0; c < 3; c++) { const x = 92 + c*40, y = 192 + rr*40, ch = '123456789*0#'[rr*3 + c];   /* the keypad: raised steel keys, the most-used ones worn */
        const kg = g.createLinearGradient(x, y, x + 32, y + 32); kg.addColorStop(0, '#f0eee8'); kg.addColorStop(1, '#7c7974'); g.fillStyle = kg; g.fillRect(x, y, 32, 32); g.fillStyle = 'rgba(20,16,14,0.5)'; g.fillRect(x, y + 32, 32, 2.5); g.fillRect(x + 32, y, 2.5, 34);
        b.fillStyle = '#e8e8e8'; b.fillRect(x, y, 32, 32); b.fillStyle = '#404040'; b.fillRect(x - 1.5, y - 1.5, 35, 1.5); b.fillRect(x - 1.5, y, 1.5, 33);
        g.globalAlpha = 1 - (worn[ch] || 0); g.fillStyle = '#26211e'; g.font = '800 19px "Helvetica Neue",Arial,sans-serif'; g.textAlign = 'center'; g.fillText(ch, x + 16, y + 23); g.globalAlpha = 1; g.textAlign = 'left';
        r.fillStyle = '#202020'; r.fillRect(x, y, 32, 32); }
      for (let i = 0; i < 26; i++) { const x = 90 + RR()*120, y = 190 + RR()*160; g.fillStyle = 'rgba(60,46,36,0.07)'; g.beginPath(); g.ellipse(x, y, 5 + RR()*4, 7 + RR()*4, RR()*3, 0, 7); g.fill(); r.fillStyle = 'rgba(180,180,180,0.2)'; r.beginPath(); r.ellipse(x, y, 7, 9, 0, 0, 7); r.fill(); }   /* fingerprints round the keys */
      const bg = g.createLinearGradient(0, 400, 0, 650); bg.addColorStop(0, '#cbc8c2'); bg.addColorStop(1, '#77746f'); g.fillStyle = bg; g.fillRect(32, 400, 160, 250); b.fillStyle = '#a8a8a8'; b.fillRect(32, 400, 160, 250); b.fillStyle = '#505050'; b.fillRect(32, 400, 160, 3); b.fillRect(32, 400, 3, 250);   /* the coin box's chrome door */
      for (let i = 0; i < 300; i++) { g.fillStyle = RR() < 0.5 ? 'rgba(255,255,250,0.05)' : 'rgba(30,26,24,0.06)'; g.fillRect(32 + RR()*150, 400 + RR()*250, 3 + RR()*30, 0.4); }
      g.fillStyle = '#2a2624'; g.beginPath(); g.arc(112, 470, 10, 0, 7); g.fill(); g.fillStyle = '#8c8882'; g.fillRect(108, 462, 8, 16); b.fillStyle = '#303030'; b.beginPath(); b.arc(112, 470, 10, 0, 7); b.fill();   /* its lock */
      g.fillStyle = '#b4b0a8'; g.fillRect(212, 410, 50, 150); g.fillStyle = '#141211'; g.fillRect(220, 440, 34, 80); g.fillStyle = 'rgba(120,64,34,0.4)'; g.fillRect(220, 512, 34, 8); b.fillStyle = '#d0d0d0'; b.fillRect(212, 410, 50, 150); b.fillStyle = '#202020'; b.fillRect(220, 440, 34, 80);   /* the coin return, its flap gone dark */
      g.fillStyle = 'rgba(234,228,216,0.78)'; g.font = 'italic 700 26px "Marker Felt","Comic Sans MS",cursive'; g.fillText('hello?', 52, 600);   /* (someone wrote on the coin box: a little graffiti) */
      const gr = g.createLinearGradient(0, 560, 0, 760); gr.addColorStop(0, 'rgba(58,38,28,0)'); gr.addColorStop(1, 'rgba(58,38,28,0.4)'); g.fillStyle = gr; g.fillRect(0, 0, W2, 760); });
    const side = SIDE.map, face = FACE.map;
    const st = new THREE.MeshStandardMaterial({ map:side, bumpMap:SIDE.bump, bumpScale:1.2, roughnessMap:SIDE.rough, roughness:0.85, metalness:0.38, color:0xe6d6c2, emissive:new THREE.Color(0.012, 0.01, 0.008) }), stIn = new THREE.MeshStandardMaterial({ map:IN.map, bumpMap:IN.bump, bumpScale:0.8, roughnessMap:IN.rough, color:0xdcccb8, roughness:0.85, metalness:0.36, emissive:new THREE.Color(0.012, 0.01, 0.008) });   /* (Nov 18: darker, more metal; at night: its own brushing, bumps and grime) */
    const hd = new THREE.MeshStandardMaterial({ map:head, emissiveMap:head, emissive:new THREE.Color(1, 0.88, 0.7), emissiveIntensity:0.55, roughness:0.4 });
    const fc = new THREE.MeshStandardMaterial({ map:face, bumpMap:FACE.bump, bumpScale:1.4, roughnessMap:FACE.rough, roughness:0.75, metalness:0.45 }), blk = mat(null, { color:0x141211, rough:0.35 });
    const W = 9.0, B0 = 0.62, B1 = 1.62, D = 0.34, Z0 = 9.52, Z1 = 10.18;   /* on the west gable (x 9), facing west */
    st.userData.m = [D, B1 - B0]; side.wrapS = side.wrapT = THREE.ClampToEdgeWrapping;
    tag(box(W - 0.02, W, B0, B1, Z0, Z1, stIn, { solid:false }), 'phone');   /* its back plate */
    for (const z of [Z0, Z1 - 0.012]) tag(box(W - D, W, B0, B1, z, z + 0.012, z === Z0 ? [stIn, stIn, stIn, stIn, stIn, st] : [stIn, stIn, stIn, stIn, st, stIn], { solid:false }), 'phone');   /* the sides, brushed steel (the tags and sticker on the outside only: Nov 18, night, they showed through mirrored inside) */
    for (const z of [Z0, Z1]) { const rg = new THREE.CylinderGeometry(0.012, 0.012, B1 - B0, 8); const r = new THREE.Mesh(rg, stIn); r.position.set(W - D, (B0 + B1)/2, z + (z === Z0 ? 0.006 : -0.006)); scene.add(r); }   /* their rolled front edges */
    tag(box(W - D, W, B1 - 0.15, B1, Z0, Z1, [hd, stIn, stIn, stIn, stIn, stIn], { solid:false }), 'phone');   /* the canopy with its lit header */
    { const hp = new THREE.Mesh(new THREE.PlaneGeometry(Z1 - Z0 - 0.04, 0.12), hd); hp.rotation.y = -Math.PI/2; hp.position.set(W - D - 0.002, B1 - 0.075, (Z0 + Z1)/2); scene.add(hp); tag(hp, 'phone'); }
    tag(box(W - D, W, B0, B0 + 0.03, Z0, Z1, stIn, { solid:false }), 'phone');   /* the shelf at the bottom */
    { const pm = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.76, 0.29), [blk, fc, blk, blk, blk, blk]); pm.position.set(W - 0.085, B0 + 0.44, (Z0 + Z1)/2);   /* (Nov 18: a little bigger in its shell) */ pm.castShadow = pm.receiveShadow = true; scene.add(pm); tag(pm, 'phone'); }   /* the phone */
    /* the handset on its hook, and its armoured cord hanging in a loop */
    const hz = (Z0 + Z1)/2 - 0.085, hx = W - 0.17;
    { const hs = new THREE.Group(); const bar = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.15, 4, 8), blk); hs.add(bar);
      for (const e of [-1, 1]) { const cup = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 8), blk); cup.scale.set(0.8, 0.75, 1); cup.position.y = e*0.1; cup.position.x = -0.012; hs.add(cup); }
      hs.position.set(hx, B0 + 0.42, hz); hs.traverse(o => { if (o.isMesh) { o.castShadow = true; tag(o, 'phone'); } }); scene.add(hs);
      box(hx - 0.02, hx + 0.05, B0 + 0.52, B0 + 0.56, hz - 0.04, hz + 0.04, new THREE.MeshStandardMaterial({ color:0xd0ccc4, roughness:0.2, metalness:0.9 }), { solid:false }); }   /* the hook */
    { const pts = [[hx, B0 + 0.3, hz], [hx - 0.05, B0 + 0.12, hz - 0.02], [hx - 0.06, B0 - 0.08, hz + 0.03], [hx - 0.02, B0 + 0.05, hz + 0.08], [W - 0.06, B0 + 0.22, hz + 0.1]].map(p => new THREE.Vector3(...p));
      const cord = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.008, 6), new THREE.MeshStandardMaterial({ color:0xb8b4ac, roughness:0.3, metalness:0.85 })); cord.castShadow = true; scene.add(cord); tag(cord, 'phone'); }
    /* (Nov 18) the phone book, beat up, in its black binder, hanging on a steel cable off the shroud's side; swollen with
       damp, its pages fanned and yellow. (it'll open later: Aisling's) */
    { const bk = new THREE.Group(), cover = mat(null, { color:0x1e1a18, rough:0.7 }), pages = new THREE.MeshStandardMaterial({ map:(() => { const c = document.createElement('canvas'); c.width = 128; c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#9c8e70'; g.fillRect(0, 0, 128, 256);   /* (Nov 18, night) old pages edge-on: swollen, grimy, the edges darker */
        for (let y = 0; y < 256; y += 2) { g.fillStyle = `rgba(${60 + RR()*40},${50 + RR()*30},36,${0.15 + RR()*0.3})`; g.fillRect(0, y, 128, 1); } for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(70,52,34,0.2)'; g.beginPath(); g.arc(RR()*128, RR()*256, 2 + RR()*7, 0, 7); g.fill(); }
        const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })(), roughness:0.95 });
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.23), cover); bk.add(c1);
      const pg = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.285, 0.215), pages); pg.position.set(-0.016, 0, 0.012); pg.rotation.z = 0.04; bk.add(pg);
      const sw = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.2), pages); sw.position.set(-0.012, -0.152, 0.01); sw.rotation.x = 0.15; bk.add(sw);   /* a swollen corner */
      bk.position.set(W - 0.2, B0 - 0.22, Z1 + 0.14); bk.rotation.set(0.05, 0.3, -0.08); bk.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); scene.add(bk); L.phonebook = bk;
      const cab = [[W - 0.05, B0 + 0.1, Z1 + 0.01], [W - 0.1, B0 - 0.02, Z1 + 0.1], [W - 0.17, B0 - 0.07, Z1 + 0.14]].map(p => new THREE.Vector3(...p));
      const cm = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cab), 16, 0.006, 6), new THREE.MeshStandardMaterial({ color:0x8a8680, roughness:0.35, metalness:0.7 })); scene.add(cm); }
    K.solids.push({ x0:W - D, x1:W, y0:-1, y1:B1, z0:Z0, z1:Z1 });
    ROOTS.add(W - 0.2, (Z0 + Z1)/2, 0.01, 'earth'); }
  { const bb = new THREE.MeshStandardMaterial({ map:seamTex('f3binBody', 400, '#7e7b74'), roughness:0.95 }), hf = new THREE.MeshStandardMaterial({ map:seamTex('f3binHoodF', 500, '#86837c'), roughness:0.95 }), hs = new THREE.MeshStandardMaterial({ map:seamTex('f3binHoodS', 300, '#86837c'), roughness:0.95 }), bt = mat(T.conc, { color:0x9a968e });
    bb.userData.m = [0.36, 0.6]; hf.userData.m = [0.42, 0.26]; hs.userData.m = [0.4, 0.26];   /* (Seam's bin with eyes: grey concrete gone grimy, a hood over it, its two eyes) */
    tag(box(26.02, 26.38, 0, 0.6, 7.59, 7.95, [bb, bb, bt, bt, bb, bb]), 'bin'); tag(box(25.99, 26.41, 0.6, 0.86, 7.55, 7.95, [hs, hs, bt, bt, hs, hf], { solid:false }), 'bin');  binDetails(scene); }
  { const jf = new THREE.MeshStandardMaterial({ map:seamTex('f3jcF', 600, '#b8847a'), roughness:0.7, alphaTest:0.4 }), js = new THREE.MeshStandardMaterial({ map:seamTex('f3jcS', 600, '#b8847a'), roughness:0.7, alphaTest:0.4 }), jt = mat(null, { color:0xb8847a });
    jf.userData.m = [0.26, 0.36]; js.userData.m = [0.18, 0.36];   /* (Seam's faded pink kerosene can, 灯油 moulded faint on its side) */
    tag(box(26.42, 26.68, 0, 0.36, 7.77, 7.95, [js, js, jt, jt, jf, jf]), 'jerry');
    /* (Nov 19, the texture pass) in the round on top: a grip handle with the gap under it, a ribbed grey cap on its
       spout, a moulded rim round its shoulders; the plastic faded and a little shiny */
    const pk = mat(null, { color:0xb8847a, rough:0.55 }), gy = mat(null, { color:0x77736c, rough:0.6 });
    box(26.44, 26.66, 0.36, 0.375, 7.79, 7.93, pk, { solid:false });   /* the shoulder rim */
    for (const x of [26.47, 26.6]) box(x, x + 0.03, 0.375, 0.46, 7.84, 7.88, pk, { solid:false }); box(26.47, 26.63, 0.44, 0.47, 7.84, 7.88, pk, { solid:false });   /* the grip handle */
    tag(cyl(0.022, 0.02, 0.05, gy, 26.475, 0.36, 7.81, 12), 'jerry'); for (let k = 0; k < 4; k++) cyl(0.024, 0.024, 0.004, gy, 26.475, 0.365 + k*0.011, 7.81, 12, { cast:false }); }
  const vf = paintVendFront(); sized(vf, 1.02, 1.86); vf.wrapS = vf.wrapT = THREE.ClampToEdgeWrapping;
  const vfM = new THREE.MeshStandardMaterial({ map:vf, emissiveMap:vf, emissive:new THREE.Color(0.9, 0.82, 0.7), emissiveIntensity:0.32, roughness:0.5 });
  const vs = mat(null, { color:0xd8d2c8 });
  /* (milestone 2) the old red machine, Seam's own picture of it (f3vm2: Drink Smile, the cream wave, four cans: chocolate
     creme, lemon cola, ultra violet, cherry cheer), its sides f3vmSide2 */
  const vmT = seamTex('f3vm2', 420, '#8e2a22'), vsT = seamTex('f3vmSide2', 300, '#8e2a22');
  const vmF = new THREE.MeshStandardMaterial({ map:vmT, emissiveMap:vmT, emissive:new THREE.Color(0.9, 0.82, 0.7), emissiveIntensity:0.3, roughness:0.55 });
  const vmS = new THREE.MeshStandardMaterial({ map:vsT, roughness:0.6 });
  const vcT = seamTex('f3vmClip2', 420, '#8e2a22'), vmC = new THREE.MeshStandardMaterial({ map:vcT, roughness:0.75 });   /* (Nov 17: the east side carries the clippings, as in Seam) */
  vmF.userData.m = [1.02, 1.86]; vmS.userData.m = [0.75, 1.86]; vmC.userData.m = [0.75, 1.86];   /* (one picture per face, not tiled) */
  tag(box(26.92, 27.94, 0, 1.86, 7.2, 7.95, [vmC, vmS, vs, vs, vmS, vmF]), 'vending'); SRC.vend = { x:27.43, y:1.2, z:7.15 };
  /* (Nov 18, Aisling: "i feel we could do better on machine", with an old red machine for reference) the machine in the round over
     its picture: chrome trim round its edges, a bezel and glass over the lit header and over the label strip, real buttons,
     the coin insert and the change slot standing out, the chrome delivery bay with its flap, a kick plate. the picture
     (Seam's, with every word on it) stays under all of it. px, py are the picture's own coordinates (85 × 182). */
  { const X = px => 27.94 - px/85*1.02, Y = py => 1.86*(1 - py/182), Z0 = 7.2;
    const chrome = new THREE.MeshStandardMaterial({ color:0xb8b4ac, roughness:0.38, metalness:0.7 }), dark = mat(null, { color:0x1c1614 });
    const glass = new THREE.MeshStandardMaterial({ color:0xffffff, roughness:0.55, metalness:0, transparent:true, opacity:0.08, depthWrite:false });   /* (Nov 18: a softer glass, so the machine's own lamp doesn't flare off it) */
    const P = (px0, py0, px1, py1, d, m, z = 0) => box(X(px1), X(px0), Y(py1), Y(py0), Z0 - d - z, Z0 - z, m, { solid:false });
    const frame = (px0, py0, px1, py1, w, d) => { P(px0 - w, py0 - w, px1 + w, py0, d, chrome); P(px0 - w, py1, px1 + w, py1 + w, d, chrome); P(px0 - w, py0, px0, py1, d, chrome); P(px1, py0, px1 + w, py1, d, chrome); };
    frame(0.5, 0.5, 84.5, 181.5, 0.9, 0.012);   /* the chrome edging all round (Nov 18, late: flat to the face) */
    /* (Nov 18, late; Aisling: "soda machine looks really weird") the bezels and glass over the header and the label strip
       floated in front of the picture and didn't line up with it: gone. the picture carries them, as in Seam */
    /* (Nov 19, Aisling: "buttons and such odd, all neon gone") the 3D buttons, coin slot and bay sat a little off the
       picture's own: gone; the picture has them. instead the header and the label strip glow, as a lit machine's do */
    { const glowM = new THREE.MeshBasicMaterial({ map:vmT, transparent:true, opacity:0.55, blending:THREE.AdditiveBlending, depthWrite:false, fog:true });
      const lit = (px0, py0, px1, py1) => { const g = new THREE.PlaneGeometry(X(px0) - X(px1), Y(py0) - Y(py1)), uv = g.attributes.uv;
        for (let i = 0; i < uv.count; i++) uv.setXY(i, 1 - (px0 + (1 - uv.getX(i))*(px1 - px0))/85, 1 - (py0 + (1 - uv.getY(i))*(py1 - py0))/182);
        g.rotateY(Math.PI); g.translate((X(px0) + X(px1))/2, (Y(py0) + Y(py1))/2, Z0 - 0.002); const me = new THREE.Mesh(g, glowM); me.renderOrder = 2; scene.add(me); };
      lit(5, 6, 80, 30); lit(5, 34, 80, 63); }
    box(26.9, 27.96, 1.86, 1.9, 7.18, 7.97, chrome, { solid:false });   /* its top */
  }
  L.vend = new THREE.PointLight(0xffe2c0, 1, 3.2, 2); L.vend.position.set(27.43, 1.3, 6.35);   /* (Nov 18, late: further out, so it lights the ground in front, not a hot spot on its own glass) */ scene.add(L.vend);
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
    /* (Nov 18, Aisling: "the pit or seed missing again") it was a flat picture lying on the seat, seen edge-on from standing: now a
       small stone in the round, her scan wrapped over it, grooved, sitting up on the boards with a little shadow */
    const pg = new THREE.SphereGeometry(1, 20, 14), pp = pg.attributes.position;
    for (let i = 0; i < pp.count; i++) { const x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i), gr = 1 + 0.07*Math.sin(Math.atan2(z, x)*9 + y*6)*Math.sqrt(Math.max(0, 1 - y*y)) + 0.05*Math.sin(x*13 + z*11); pp.setXYZ(i, x*gr, y*(y > 0 ? 1.15 : 1)*gr, z*gr); }
    pg.computeVertexNormals(); pg.scale(0.04, 0.034, 0.03);   /* (Nov 18: fuller, a plump stone, not a disc) */
    pm.transparent = false; pm.alphaTest = 0; pm.color.set(0xd8c0a8);
    const pit = new THREE.Mesh(pg, pm); pit.position.set(12.66, 0.456, 7.73); pit.rotation.set(0.15, 0.6, 0.1); pit.castShadow = true; pit.receiveShadow = true; scene.add(pit); tag(pit, 'pit'); L.pit = pit; }
  const dF = seamTex('f3dumpF', 260, '#30261d'), dS = seamTex('f3dumpS', 260, '#30261d');
  /* (Nov 19, the texture pass) the dumpster's sides and lid in steel, painted: old brown-black paint over pressed ribs,
     scraped and dented, rust blooming at the welds and running down from the lid's lip, a lighter band where the lid has
     rubbed, grime low. (its front stays Seam's picture, NO DUMPING · ゴミ捨て禁止) */
  const dSide = paint(440, 640, 1.1, 1.6, (x, y) => { const rib = frac(x*4.5), rb = sm(0.0, 0.08, rib)*sm(0.24, 0.16, rib), top = y > 1.48, lip = Math.abs(y - 1.46) < 0.02;
      const rust = fbm(x*5, y*3) + 0.3*sm(1.3, 1.6, y)*vn(x*20, 1) + 0.25*sm(0.4, 0, y) > 0.86, run = vn(x*28, 2) > 0.72 && y > 1.6 - 1.2*vn(x*28, 5), scrape = Math.abs(frac(x*1.3 + y*0.2 + vn(x, y)*0.8) - 0.5) < 0.006 && vn(x*3 + 7, y*3) > 0.6;
      if (lip) return ['hblack', 0.36, 1, 1, 0.6];
      if (scrape) return ['metal', 0.42, 1, 0.3, 0.5];
      if (rust || (run && !top)) return ['hrust', clamp(0.24 + 0.14*vn(x*40, y*40), 0, 1), 1, 0.4 + 0.3*vn(x*60, y*60), 0.95];
      return [vn(x*2, y*2) > 0.5 ? 'hwood' : 'hrust', clamp(0.27 + 0.08*vn(x*30, y*30) + 0.08*rb - 0.06*sm(0.5, 0, y), 0, 1), 1, 0.5 + 0.4*rb, 0.72 - 0.2*rb]; }, { nrm:1.6 });
  const dmF = new THREE.MeshStandardMaterial({ map:dF, roughness:0.8, bumpMap:dSide.userData.normal ? null : null, color:new THREE.Color(1.6, 1.5, 1.4) }), dmS = mat(dSide, { rough:0.8, metal:0.2 }); dmF.userData.m = [1.9, 1.6]; dmS.userData.m = [1.1, 1.6];
  tag(box(14.1, 16.0, -0.3, 1.3, 13.12, 14.22, [dmS, dmS, mat(T.iron, { color:0x6a5040 }), dmS, dmF, dmS]), 'dump');
  /* (Nov 19) in the round: the lid, a little open and overhanging with a rolled lip; pressed ribs down the sides and
     front; the lifting pockets on the sides; squat feet; a rust-dark band along its foot */
  { const st = mat(dSide, { rough:0.75, metal:0.25 }), dk = mat(null, { color:0x241a14, rough:0.9 });
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.05, 1.18), st); lid.position.set(15.05, 1.36, 13.67); lid.rotation.x = -0.07; lid.castShadow = lid.receiveShadow = true; scene.add(lid); tag(lid, 'dump');
    box(14.06, 16.04, 1.27, 1.33, 14.2, 14.27, st, { solid:false });   /* the front lip */
    for (const x of [14.3, 15.8]) box(x - 0.04, x + 0.04, 0.02, 1.2, 14.22, 14.26, st, { solid:false, cast:false });   /* ribs on the front */
    for (const xs of [14.06, 15.98]) { for (const z of [13.42, 13.92]) box(xs, xs + 0.06, 0.02, 1.2, z - 0.04, z + 0.04, st, { solid:false, cast:false });
      box(xs - (xs < 15 ? 0.1 : -0.06), xs + (xs < 15 ? 0.0 : 0.16), 0.75, 0.95, 13.3, 14.04, dk, { solid:false }); }   /* side ribs, the lifting pockets */
    for (const [x, z] of [[14.25, 13.25], [15.85, 13.25], [14.25, 14.1], [15.85, 14.1]]) box(x - 0.08, x + 0.08, -0.3, 0.04, z - 0.07, z + 0.07, dk, { solid:false }); }
  { const skT = seamTex('f3sky', 600, null); const sk = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.2325), new THREE.MeshStandardMaterial({ map:skT, transparent:true, alphaTest:0.4, roughness:0.85 }));
    sk.position.set(16.004, 0.716, 13.67); sk.rotation.y = Math.PI/2; sk.receiveShadow = true; scene.add(sk); tag(sk, 'dump'); }   /* (Nov 17) "sky", the Columbus tag, on the dumpster's east side: Seam's own picture of it */
  const msT = seamTex('f3miss', 900, '#dcd4c4');
  const ms = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.48), new THREE.MeshStandardMaterial({ map:msT, roughness:0.95 })); ms.position.set(31.86, 1.24, 24.58); ms.rotation.y = -Math.PI/2; ms.receiveShadow = true; scene.add(ms); tag(ms, 'missing');
  dreamPoster(scene, 31.865, 1.12, 10.58, -Math.PI/2);   /* (Nov 20) the faceless woman, on the road's first pole (src/details.js); no click line yet: hers to give */

  /* ---- the street lamp where the road leaves the platform: the one real lamp out here ---- */
  tag(cyl(0.075, 0.06, 4.6, M.pole, 30.87, -0.3, 8.15, 14), 'lamp'); SRC.lamp = { x:30.36, y:3.95, z:8.15 }; K.solids.push({ x0:30.79, x1:30.95, y0:-0.3, y1:4.3, z0:8.07, z1:8.23 });
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
  PY.forEach((z, i) => { if (z !== 17.5) tag(cyl(0.11, 0.09, 7.5, M.pole, 31.98, -0.5, z + 0.08, 16), 'pole'); if (z !== 17.5) { SRC.poles.push({ x:31.98, y:6.4, z:z + 0.08 }); K.solids.push({ x0:31.9, x1:32.06, y0:-0.5, y1:7, z0:z, z1:z + 0.16 }); box(31.4, 32.56, 6.4, 6.52, z + 0.03, z + 0.13, M.woodD, { solid:false }); }
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
    for (let i = 0; i < 1500; i++) { const x = ROAD[0] - 0.6 + LR()*3.2, z = 9 + LR()*14, de = Math.min(Math.abs(x - ROAD[0]), Math.abs(ROAD[1] - x)); if (LR() < 0.18 + 0.7*sm(0.8, 0.05, de)) put(x, z, groundSurf(x, z)); }   /* (Nov 18, late: drifted along the road's edges, a few out on it) */
    for (let i = 0; i < 700; i++) { const x = 8.5 + LR()*21, z = 13.05 + LR()*1.2; put(x, z, groundSurf(x, z)); }
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

  TKM = buildMore({ scene, M, T, tag, groundAt, groundSurf, halo, L });   /* (Nov 17, evening) everything else the Seam version has */

  /* ---- grass, weeds and corn ---- */
  const R = rnd(4242), grass = [], corn = [];
  const inB = (x, z) => (x > 8.6 && x < 25.4 && z > 7.7 && z < 13.4) || (x > 24.8 && x < 29.2 && z > 7.6 && z < 9.9) || (x > ROAD[0] - 0.15 && x < ROAD[1] + 0.15 && z > 7.9);
  for (let i = 0; i < 11000; i++) {   /* the fields */
    const x = 1 + R()*40, z = 8.2 + R()*15.6; if (inB(x, z)) continue;
    const verge = Math.abs(x - ROAD[0]) < 1.7 || Math.abs(x - ROAD[1]) < 1.7;
    if (!verge && fbm(x*0.35, z*0.35) < 0.36 && R() < 0.7) continue;   /* bare patches */
    if (verge && R() < 0.35) continue;
    if (pathDist(x, z) < 0.5) continue;   /* (the path to the windmill) */
    { const lt = litter(x, z); if (lt > 0.15 && R() < 0.35 + 0.6*lt) continue; }   /* (Nov 18, late: under the trees the ground is mostly fallen leaves, grass thin, as in her photos) */
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
  for (let x = 41.4; x < 55; x += 0.42) for (let z = 0.55; z < (x > 47 ? 30 : 24.4); z += 0.5) if (x < 48 || z > 9) cornAt(x, z);   /* (and on behind the windmill) */           /* east */
  clumps(corn, paintCornAtlas(), 2, 1, 1.1, 8);   /* (Nov 18: less stiff) */

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
