/* ================================================================
   EMBROIDERY · the page. one place, three looks to choose between (milestone 1), or all three side by side.
   ================================================================ */
import * as THREE from 'three';
import { makeLook } from './look.js';
import { buildStation, applyLook, tickLights, L, CLICK } from './station.js';
import { F3_SAYS, F3_WALL } from './f03-says.js';
import { UI, initUI, say, tickUI, ccSay } from './ui.js';
import { soundSync, soundWake, soundTick, setSoundFiles } from './sound.js';
import { SOUND_FILES } from './sound-files.js';
import { K } from './kit.js';
import { P, setWorld, initInput, stepPlayer, pressJump, toggleCrouch, simKeys, TAP } from './player.js';
import { LOOKS } from './looks.js';
import { paintDetail } from './paint.js';

/* the mist (Nov 17, later): the fog isn't one even wall. it drifts, very slowly (well under a breath a second), thicker
   in some places than others and pooling low near the ground, the way Silent Hill's does */
const MIST = { value:0 };
THREE.ShaderChunk.fog_pars_vertex += '\n#ifdef USE_FOG\n varying vec3 vFogW;\n#endif\n';
THREE.ShaderChunk.fog_vertex += '\n#ifdef USE_FOG\n vFogW = (inverse(viewMatrix)*mvPosition).xyz;\n#endif\n';
THREE.ShaderChunk.fog_pars_fragment += '\n#ifdef USE_FOG\n varying vec3 vFogW; uniform float uMistT;\n' +
  ' float mh(vec3 p){ p = fract(p*0.3183 + 0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x + p.y + p.z)); }\n' +
  ' float mn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.0 - 2.0*f); return mix(mix(mix(mh(i), mh(i + vec3(1,0,0)), f.x), mix(mh(i + vec3(0,1,0)), mh(i + vec3(1,1,0)), f.x), f.y), mix(mix(mh(i + vec3(0,0,1)), mh(i + vec3(1,0,1)), f.x), mix(mh(i + vec3(0,1,1)), mh(i + vec3(1,1,1)), f.x), f.y), f.z); }\n#endif\n';
THREE.ShaderChunk.fog_fragment = '#ifdef USE_FOG\n' +
  ' float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);\n' +
  ' vec3 mp = vFogW*vec3(0.2, 0.45, 0.2) + vec3(uMistT*0.045, 0.0, uMistT*0.018);\n' +
  ' float m = mn(mp)*0.62 + mn(mp*2.3 + 7.1)*0.38;\n' +
  ' float low = 1.0 - smoothstep(-0.5, 2.0, vFogW.y);\n' +
  ' float far = smoothstep(1.2, 7.0, vFogDepth);\n' +
  ' fogFactor = clamp(fogFactor + (m - 0.5)*0.55*far*(1.0 - fogFactor) + low*0.16*far, 0.0, 1.0);\n' +
  ' gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);\n#endif\n';
const DETAIL = { value:null }, DETK = { value:1 };
function giveMist(root){ root.traverse(o => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) {
  if (m.userData.mist) continue; m.userData.mist = true; const prev = m.onBeforeCompile, det = m.isMeshStandardMaterial && !m.userData.noDetail;
  m.onBeforeCompile = (sh, r) => { sh.uniforms.uMistT = MIST; if (det) addDetail(sh); if (prev) prev(sh, r); };
  const prevKey = prev ? prev.toString() : ''; m.customProgramCacheKey = () => 'eg|' + (det ? 'd' : '') + '|' + prevKey;   /* (so materials with different extras never share a program) */
} }); }
/* the close-up grain, from three sides at the surface's true place in the world, at two sizes */
function addDetail(sh){
  sh.uniforms.uDetail = DETAIL; sh.uniforms.uDetK = DETK;
  sh.vertexShader = 'varying vec3 vEgW; varying vec3 vEgN;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n' +
    ' { vec4 w = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\n w = instanceMatrix*w;\n#endif\n vEgW = (modelMatrix*w).xyz; vEgN = normalize(mat3(modelMatrix)*objectNormal); }');
  sh.fragmentShader = 'uniform sampler2D uDetail; uniform float uDetK; varying vec3 vEgW; varying vec3 vEgN;\n' +
    'float egTri(float s){ vec3 b = pow(abs(normalize(vEgN)), vec3(4.0)); b /= b.x + b.y + b.z; return texture2D(uDetail, vEgW.zy*s).r*b.x + texture2D(uDetail, vEgW.xz*s).r*b.y + texture2D(uDetail, vEgW.xy*s).r*b.z; }\n' +
    sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n { float d1 = egTri(1.6), d2 = egTri(0.23); diffuseColor.rgb *= mix(1.0, (0.7 + 0.6*d1)*(0.82 + 0.36*d2), uDetK); }')
    .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = clamp(roughnessFactor*mix(1.0, 0.8 + 0.4*egTri(1.6), uDetK), 0.04, 1.0);');
}

const cv = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas:cv, antialias:false, alpha:false, powerPreference:'high-performance', preserveDrawingBuffer:true });
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.autoUpdate = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(66, 16/9, 0.05, 80);
THREE.Texture.DEFAULT_ANISOTROPY = 4;
camera.rotation.order = 'YXZ';

function setWait(t){ const w = document.getElementById('wait'); if (w) w.querySelector('span').textContent = t; }

const FIXED = new URLSearchParams(location.search).has('fixed');   /* (tests: no resolution stepping) */
let look, world, cur = 0, split = false, resK = 1, frames = [], lastT = performance.now(), T0 = performance.now();
function start(){
  look = makeLook(renderer);
  DETAIL.value = paintDetail();
  world = buildStation(scene);
  giveMist(scene);
  setWorld(world);
  P.x = 33.2; P.z = 5.6; P.yaw = Math.PI/2 - 0.12; P.y = world.ground(P.x, P.z);   /* off the platform's east end, looking back along it, as in the Seam version */
  P.y = 0;
  initInput(cv);
  initUI(); setSoundFiles(SOUND_FILES);
  /* Seam's pocket (milestone 2): its captions are ours, its sounds follow our switch, its sounds get CC */
  const SEAM = window.EG_SEAM || null;
  if (SEAM) { SEAM.say = (t, ms) => say(t, ms || 4200); SEAM.cc = (k, t) => ccSay(k, t, 3000); }
  UI.onChange = () => { soundSync(); if (SEAM && SEAM.soundOn) SEAM.soundOn(UI.heard, UI.cc); };
  ['pointerdown', 'keydown', 'touchstart'].forEach(t => addEventListener(t, () => { if (SEAM && SEAM.soundOn && (UI.heard || UI.cc)) SEAM.soundOn(UI.heard, UI.cc); }, { once:true }));
  ['pointerdown', 'keydown', 'touchstart'].forEach(t => addEventListener(t, soundWake, { once:true }));
  TAP.fn = reach;
  const q = new URLSearchParams(location.search);
  if (q.has('look')) cur = clamp0(+q.get('look') - 1);
  if (q.has('split')) split = true;
  setLook(cur);
  renderer.shadowMap.needsUpdate = true;
  document.getElementById('wait').classList.add('gone');
  setTimeout(() => say('本町 · main street, missing mile. dusk. the lights under the canopy are coming on, one by one. nobody here.', 6500), 600);
  setTimeout(() => say(matchMedia('(pointer: coarse)').matches ? 'hold to walk · hold low to step back · drag to look' : 'w a s d · drag to look · shift run · c crouch · space jump · 1 2 3 4 looks · 5 side by side', 7000), 7600);
  requestAnimationFrame(loop);
}
function clamp0(i){ return Math.max(0, Math.min(LOOKS.length - 1, i|0)); }
function setLook(i){
  cur = i; split = false; applyLook(scene, LOOKS[cur]); renderer.shadowMap.needsUpdate = true; resize(); hud();
}
function setSplit(){ split = true; resize(); hud(); }
let CW = 0, CH = 0;
function resize(){
  const V = split ? LOOKS[2] : LOOKS[cur];
  const asp = innerWidth/innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
  let h = Math.round(Math.min(V.res, innerHeight*dpr/1.25)*resK), w = Math.round(h*asp);   /* each drawn pixel is 1.25 screen pixels at most: only a hint of crunch (Nov 17, later: "turn it up close to ps3") */
  if (asp < 1) { w = Math.round(Math.min(V.res*0.6, innerWidth*dpr/1.25)*resK); h = Math.round(w/asp); }
  CW = split ? Math.floor(w/3)*3 : w; CH = h;
  renderer.setSize(CW, CH, false);
  camera.aspect = CW/CH; camera.fov = asp < 1 ? Math.min(100, 2*Math.atan(Math.tan(33*Math.PI/180)/asp)*180/Math.PI*0.8) : 66;
  if (L.motes) L.motes.uniforms.uPx.value = CH/300; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

/* the frame: smooth before pretty. if frames run long, the resolution steps down (and back up when there's room) */
function adapt(dt){
  if (FIXED) return;
  frames.push(dt); if (frames.length < 40) return;
  frames.sort((a, b) => a - b); const med = frames[20]; frames = [];
  if (med > 1/45 && resK > 0.45) { resK = Math.max(0.45, resK - 0.1); resize(); }
  else if (med < 1/58 && resK < 1) { resK = Math.min(1, resK + 0.05); resize(); }
}
function loop(now){
  if (window.__paused) { requestAnimationFrame(loop); return; }   /* (tests: frames only on request) */
  frame(now);
  requestAnimationFrame(loop);
}
function frame(now){
  const dt = Math.min(0.05, (now - lastT)/1000); lastT = now; const t = (now - T0)/1000;
  const SEAM = window.EG_SEAM;
  if (SEAM && SEAM.step) SEAM.step(now, dt);
  if (SEAM && SEAM.where) SEAM.where(P.x, P.z, P.yaw);
  const pkOpen = !!(SEAM && ((SEAM.pocket && SEAM.pocket.isOpen()) || (SEAM.closeUpOpen && SEAM.closeUpOpen())));   /* (the pocket or a close-up: the world waits behind it) */ if (document.body.classList.contains('pk-open') !== pkOpen) document.body.classList.toggle('pk-open', pkOpen);
  if (pkOpen) { tickUI(now); return; }   /* the pocket is open: it's what's drawn (as in Seam); the world waits */
  if (!window.__frozen) { stepPlayer(dt); adapt(dt); }
  camera.position.set(P.x, P.y + P.eye + (P.onGround ? Math.sin(t*7)*0.012*(Math.abs(P._spd || 0) > 0.1 ? 1 : 0) : 0), P.z);
  camera.rotation.set(P.pitch, P.yaw, 0);
  K.wind.uTime.value = t; MIST.value = t; K.wind.uGust.value = gust(t);
  tickLights(t); look.tick(dt); tickUI(now);
  try { soundTick(camera, P, t, K.wind.uGust.value, L.bulbs.slice(0, 5).map(b => b.intensity/(b.userData.base || 1)), surfaceAt(P.x, P.z, P.y)); } catch (e) {}
  if (!split) { camera.clearViewOffset(); look.draw(scene, camera, LOOKS[cur], 0, CW, CH, CW); }
  else {
    const w = CW/3;
    for (let i = 0; i < 3; i++) { const V = LOOKS[i + 1]; applyLook(scene, V); camera.setViewOffset(CW, CH, i*w, 0, w, CH); look.draw(scene, camera, V, i*w, w, CH, CW); }
    camera.clearViewOffset();
  }
  fpsCount(dt);
}
/* what you're standing on, for footsteps */
function surfaceAt(x, z, y){
  if (x > 9 && x < 32 && z > 3 && z < 8 && y > -0.05) return 'concrete';
  if (z < 8) return 'gravel';
  if (x > 28.8 && x < 31.2) return 'road';
  return 'grass';
}
/* the wind: mostly still; now and then a slow gust builds over a few seconds and dies away */
function gust(t){ const a = Math.sin(t*0.071)*0.5 + Math.sin(t*0.043 + 1.3)*0.5; return Math.max(0, a - 0.35)/0.65; }

/* ---------------- captions, the look buttons, touch buttons ---------------- */
/* reaching for things (a click or a tap): the first thing under your finger, if it's within reach (Seam's 3.6 m; the
   bench 2.6 m), says its next line, word for word from the Seam version. the bench, clicked again, sits you down. */
const RAY = new THREE.Raycaster(), V2 = new THREE.Vector2();
function reach(cx, cy){
  const r = cv.getBoundingClientRect(); V2.set((cx - r.left)/r.width*2 - 1, -((cy - r.top)/r.height*2 - 1));
  RAY.setFromCamera(V2, camera); RAY.far = 6;
  const hit = RAY.intersectObjects(CLICK, false)[0]; if (!hit) return;
  const o = hit.object, k = o.userData.say, near = k === 'bench' ? 2.6 : 3.6; if (hit.distance > near) return;
  if (typeof k === 'function') { const w = k(hit); if (w) say(w, 4600); return; }
  /* Seam's own click actions first (the close-ups, the dumpster, the pit...), as Missing Mile's Seam version does */
  const SEAM = window.EG_SEAM;
  if (SEAM && SEAM.click) { SEAM.where(P.x, P.z, P.yaw); if (SEAM.click(k)) { if (k === 'pit' && L.pit) { L.pit.visible = false; } return; } }
  const Ls = F3_SAYS[k]; if (!Ls) return;
  const sib = CLICK.filter(c => c.userData.say === k && c.position.distanceTo(o.position) < 0.6);   /* (a thing made of several parts shares its count) */
  const i = o.userData.sayI || 0;
  if (k === 'bench' && i >= 1) { say(F3_WALL.sit[0], 5200); P.sit = true; sib.forEach(c => c.userData.sayI = 0); return; }
  say(Ls[i % Ls.length], 4200); sib.forEach(c => c.userData.sayI = i + 1);
}
function hud(){
  const b = document.getElementById('looks'); b.innerHTML = '';
  LOOKS.forEach((V, i) => { const e = document.createElement('button'); e.textContent = (i + 1) + ' · ' + V.label; if (!split && i === cur) e.className = 'on'; e.onclick = ev => { ev.stopPropagation(); setLook(i); say(V.say, 4200); }; b.appendChild(e); });
  const s = document.createElement('button'); s.textContent = '5 · side by side'; if (split) s.className = 'on'; s.onclick = ev => { ev.stopPropagation(); setSplit(); say('soft · grit · glow, left to right', 3500); }; b.appendChild(s);
  document.getElementById('names').style.display = split ? 'flex' : 'none';
}
addEventListener('keydown', e => {
  if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code)) { const i = +e.code.slice(5) - 1; setLook(i); say(LOOKS[i].say, 4200); }
  if (e.code === 'Digit5') { setSplit(); say('soft · grit · glow, left to right', 3500); }
  if (e.code === 'KeyF') document.getElementById('fps').classList.toggle('on');
});
if (matchMedia('(pointer: coarse)').matches) {
  document.getElementById('tbtn').style.display = 'flex';
  document.getElementById('bj').addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); pressJump(); });
  document.getElementById('bc').addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); toggleCrouch(); });
}
let fAcc = 0, fN = 0;
function fpsCount(dt){ fAcc += dt; fN++; if (fAcc > 0.5) { document.getElementById('fps').textContent = Math.round(fN/fAcc) + ' fps · ' + CW + '×' + CH; fAcc = 0; fN = 0; } }

/* test hooks: pictures from fixed spots (t/shots.js) */
window.__eg = { tapCenter(){ const r = cv.getBoundingClientRect(); reach(r.left + r.width/2, r.top + r.height/2); return document.getElementById('caption').textContent; }, soundOn(){ UI.heard = true; UI.cc = true; soundSync(); }, pause(v){ window.__paused = v; }, renderOnce(){ frame(performance.now()); }, sim(ks, sec){ window.__frozen = true; simKeys(ks); for (let i = 0; i < sec*60; i++) { if (i === 20) simKeys(ks.filter(k => k !== 'Space')); stepPlayer(1/60); } simKeys([]); for (let i = 0; i < 60; i++) stepPlayer(1/60); window.__frozen = false; return [P.x, P.y, P.z].map(v => +v.toFixed(2)); }, ground:(x, z) => world.ground(x, z), P, setLook, setSplit, freeze(v){ window.__frozen = v; }, info(){ return { CW, CH, resK, cur, split }; }, renderer };

setWait('mixing the inks…');
setTimeout(() => { try { start(); } catch (e) { setWait('something went wrong: ' + e.message); console.error(e); } }, 30);
