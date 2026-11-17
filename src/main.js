/* ================================================================
   EMBROIDERY · the page. one place, three looks to choose between (milestone 1), or all three side by side.
   ================================================================ */
import * as THREE from 'three';
import { makeLook } from './look.js';
import { buildStation, applyLook, tickLights, L } from './station.js';
import { K } from './kit.js';
import { P, setWorld, initInput, stepPlayer, pressJump, toggleCrouch, simKeys } from './player.js';
import { LOOKS } from './looks.js';

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
function giveMist(root){ root.traverse(o => { const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; for (const m of ms) { if (m.userData.mist) continue; m.userData.mist = true; const prev = m.onBeforeCompile; m.onBeforeCompile = (sh, r) => { sh.uniforms.uMistT = MIST; if (prev) prev(sh, r); }; } }); }

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
  world = buildStation(scene);
  giveMist(scene);
  setWorld(world);
  P.x = 33.2; P.z = 5.6; P.yaw = Math.PI/2 - 0.12; P.y = world.ground(P.x, P.z);   /* off the platform's east end, looking back along it, as in the Seam version */
  P.y = 0;
  initInput(cv);
  const q = new URLSearchParams(location.search);
  if (q.has('look')) cur = clamp0(+q.get('look') - 1);
  if (q.has('split')) split = true;
  setLook(cur);
  renderer.shadowMap.needsUpdate = true;
  document.getElementById('wait').classList.add('gone');
  setTimeout(() => caption('本町 · main street, missing mile. dusk. the lights under the canopy are coming on, one by one. nobody here.', 6500), 600);
  setTimeout(() => caption(matchMedia('(pointer: coarse)').matches ? 'hold to walk · hold low to step back · drag to look' : 'w a s d · drag to look · shift run · c crouch · space jump · 1 2 3 looks · 4 side by side', 7000), 7600);
  requestAnimationFrame(loop);
}
function clamp0(i){ return Math.max(0, Math.min(LOOKS.length - 1, i|0)); }
function setLook(i){
  cur = i; split = false; applyLook(scene, LOOKS[cur]); renderer.shadowMap.needsUpdate = true; resize(); hud();
}
function setSplit(){ split = true; resize(); hud(); }
let CW = 0, CH = 0;
function resize(){
  const V = split ? LOOKS[1] : LOOKS[cur];
  const asp = innerWidth/innerHeight, dpr = Math.min(2, devicePixelRatio || 1);
  let h = Math.round(Math.min(V.res, innerHeight*dpr/2)*resK), w = Math.round(h*asp);   /* each drawn pixel is 2 screen pixels at most: a tiny crunch */
  if (asp < 1) { w = Math.round(Math.min(V.res*0.6, innerWidth*dpr/2)*resK); h = Math.round(w/asp); }
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
  if (!window.__frozen) { stepPlayer(dt); adapt(dt); }
  camera.position.set(P.x, P.y + P.eye + (P.onGround ? Math.sin(t*7)*0.012*(Math.abs(P._spd || 0) > 0.1 ? 1 : 0) : 0), P.z);
  camera.rotation.set(P.pitch, P.yaw, 0);
  K.wind.uTime.value = t; MIST.value = t; K.wind.uGust.value = gust(t);
  tickLights(t); look.tick(dt);
  if (!split) { camera.clearViewOffset(); look.draw(scene, camera, LOOKS[cur], 0, CW, CH, CW); }
  else {
    const w = CW/3;
    for (let i = 0; i < 3; i++) { applyLook(scene, LOOKS[i]); camera.setViewOffset(CW, CH, i*w, 0, w, CH); look.draw(scene, camera, LOOKS[i], i*w, w, CH, CW); }
    camera.clearViewOffset();
  }
  fpsCount(dt);
}
/* the wind: mostly still; now and then a slow gust builds over a few seconds and dies away */
function gust(t){ const a = Math.sin(t*0.071)*0.5 + Math.sin(t*0.043 + 1.3)*0.5; return Math.max(0, a - 0.35)/0.65; }

/* ---------------- captions, the look buttons, touch buttons ---------------- */
let capT = 0;
function caption(s, ms){ const c = document.getElementById('cap'); c.textContent = s; c.classList.add('on'); clearTimeout(capT); capT = setTimeout(() => c.classList.remove('on'), ms); }
function hud(){
  const b = document.getElementById('looks'); b.innerHTML = '';
  LOOKS.forEach((V, i) => { const e = document.createElement('button'); e.textContent = (i + 1) + ' · ' + V.label; if (!split && i === cur) e.className = 'on'; e.onclick = ev => { ev.stopPropagation(); setLook(i); caption(V.say, 4200); }; b.appendChild(e); });
  const s = document.createElement('button'); s.textContent = '4 · side by side'; if (split) s.className = 'on'; s.onclick = ev => { ev.stopPropagation(); setSplit(); caption('soft · grit · glow, left to right', 3500); }; b.appendChild(s);
  document.getElementById('names').style.display = split ? 'flex' : 'none';
}
addEventListener('keydown', e => {
  if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3') { const i = +e.code.slice(5) - 1; setLook(i); caption(LOOKS[i].say, 4200); }
  if (e.code === 'Digit4') { setSplit(); caption('soft · grit · glow, left to right', 3500); }
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
window.__eg = { pause(v){ window.__paused = v; }, renderOnce(){ frame(performance.now()); }, sim(ks, sec){ window.__frozen = true; simKeys(ks); for (let i = 0; i < sec*60; i++) { if (i === 20) simKeys(ks.filter(k => k !== 'Space')); stepPlayer(1/60); } simKeys([]); for (let i = 0; i < 60; i++) stepPlayer(1/60); window.__frozen = false; return [P.x, P.y, P.z].map(v => +v.toFixed(2)); }, ground:(x, z) => world.ground(x, z), P, setLook, setSplit, freeze(v){ window.__frozen = v; }, info(){ return { CW, CH, resK, cur, split }; }, renderer };

setWait('mixing the inks…');
setTimeout(() => { try { start(); } catch (e) { setWait('something went wrong: ' + e.message); console.error(e); } }, 30);
