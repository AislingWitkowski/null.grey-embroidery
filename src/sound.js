/* ================================================================
   EMBROIDERY · sound (milestone 2, Nov 17, 2026). real 3D sound: louder nearer, from the right direction (doc 33).
   every sound has a named slot. if a file named after the slot is in sounds/ (e.g. sounds/mm_wind.mp3), the build packs
   it in and it plays; until then a quiet stand-in made in code plays instead (Aisling supplies the real ones; doc 31
   lists the slots). the engine's last stage is a mute: with captions on and sound off, sounds still run silently so
   their captions come (Seam's cc.js, same rule). nothing starts until you press or click something (browsers).
   ================================================================ */
import { UI, ccSay } from './ui.js';

/* the slots: what each is, whether it loops, and its caption (lowercase, short) */
export const SLOTS = {
  mm_wind:      { loop:true,  what:'the wind over the fields, rising in slow gusts',                cc:'wind over the fields' },
  mm_corn:      { loop:true,  what:'the corn rustling all at once when a gust comes',              cc:'the corn rustles' },
  mm_bulb_hum:  { loop:true,  what:'the canopy’s bare bulbs humming, each from its own bulb',     cc:'the bulbs hum' },
  mm_lamp_buzz: { loop:true,  what:'the street lamp buzzing on its pole',                           cc:'the street lamp buzzes' },
  mm_wires:     { loop:true,  what:'the wires singing a little in the gusts, near the poles',       cc:'the wires sing in the wind' },
  mm_vend_hum:  { loop:true,  what:'the drinks machine’s cold hum, close to it',                    cc:'the drinks machine hums' },
  mm_step_concrete:{ loop:false, what:'a footstep on the platform’s concrete' },
  mm_step_gravel:  { loop:false, what:'a footstep on gravel and ballast' },
  mm_step_road:    { loop:false, what:'a footstep on old asphalt' },
  mm_step_grass:   { loop:false, what:'a footstep through dead grass' },
};
export const S = { ctx:null, master:null, mute:null, files:{}, buf:{}, noise:null, pos:{}, vol:0.9, step:0, lx:null, lz:null, gustOn:false };

function on(){ return UI.heard || UI.cc; }
export function soundSync(){
  if (!on()) { if (S.ctx) S.master.gain.setTargetAtTime(0, S.ctx.currentTime, 0.1); return; }
  if (!S.ctx) build();
  try { S.ctx.resume(); } catch (e) {}
  S.master.gain.setTargetAtTime(S.vol, S.ctx.currentTime, 0.2);
  S.mute.gain.setTargetAtTime(UI.heard ? 1 : 0, S.ctx.currentTime, 0.05);
}
export function soundWake(){ if (on()) soundSync(); }

function noiseBuf(c, sec, kind){
  const n = Math.floor(c.sampleRate*sec), b = c.createBuffer(2, n, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); let last = 0;
    for (let i = 0; i < n; i++) { const w = Math.random()*2 - 1; last = kind === 'brown' ? (last + 0.02*w)/1.02 : w; d[i] = kind === 'brown' ? last*3.5 : w; } }
  return b;
}
function loopSrc(buf){ const s = S.ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; }
function panner(x, y, z, ref, max){
  const p = S.ctx.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = ref || 1; p.maxDistance = max || 30; p.rolloffFactor = 1.4;
  if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z; } else p.setPosition(x, y, z);
  p.connect(S.dry); return p;
}
/* a slot's sound: the file if there is one, else the stand-in made in code; returns a node to connect onward */
function slotSource(k, standIn){
  if (S.buf[k]) { const s = S.ctx.createBufferSource(); s.buffer = S.buf[k]; s.loop = SLOTS[k].loop; s.start(); return s; }
  return standIn();
}

export function setSoundFiles(f){ S.files = f || {}; }
function build(){
  const AC = window.AudioContext || window.webkitAudioContext; const c = S.ctx = new AC();
  S.master = c.createGain(); S.master.gain.value = 0;
  S.dry = c.createGain(); S.dry.connect(S.master);
  const comp = c.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4;
  S.mute = c.createGain(); S.mute.gain.value = UI.heard ? 1 : 0;
  S.master.connect(comp); comp.connect(S.mute); S.mute.connect(c.destination);
  S.noise = noiseBuf(c, 4, 'white'); S.brown = noiseBuf(c, 6, 'brown');
  for (const k in S.files) {   /* her files, when they arrive */
    const bin = atob(S.files[k]), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    c.decodeAudioData(u.buffer).then(b => { S.buf[k] = b; }).catch(() => {});
  }
  setTimeout(startLoops, 300);   /* (give the files a moment to decode) */
}

/* ---- the loops ---- */
export const SRC = { bulbs:[], lamp:null, vend:null, poles:[], corn:[] };   /* where things are: the station fills this in */
const G = {};
function startLoops(){
  const c = S.ctx;
  /* wind: brown noise, band-limited, its loudness follows the gusts; not from any one place */
  G.wind = c.createGain(); G.wind.gain.value = 0.0; G.wind.connect(S.dry);
  const w = slotSource('mm_wind', () => { const s = loopSrc(S.brown), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 520; s.connect(f); return f; }); w.connect(G.wind);
  /* the corn: bright noise, only in the gusts, from the nearest edge of corn */
  G.corn = c.createGain(); G.corn.gain.value = 0;
  G.cornP = panner(0, 1.2, 0, 3, 40); G.corn.connect(G.cornP);
  const cr = slotSource('mm_corn', () => { const s = loopSrc(S.noise), f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 0.6; s.connect(f); return f; }); cr.connect(G.corn);
  /* the bulbs: a soft mains hum, one source fanned out to every bulb so each hums from its own place */
  const hum = slotSource('mm_bulb_hum', () => { const o1 = c.createOscillator(), o2 = c.createOscillator(), m = c.createGain(); o1.frequency.value = 120; o2.frequency.value = 240; o2.type = 'triangle';
    const g2 = c.createGain(); g2.gain.value = 0.35; o1.connect(m); o2.connect(g2); g2.connect(m); o1.start(); o2.start(); return m; });
  G.bulbs = SRC.bulbs.map(b => { const g = c.createGain(); g.gain.value = 0.012; hum.connect(g); g.connect(panner(b.x, b.y, b.z, 0.7, 12)); return { g, b }; });
  /* the street lamp: a rougher buzz */
  if (SRC.lamp) { const bz = slotSource('mm_lamp_buzz', () => { const o = c.createOscillator(), f = c.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = 100; f.type = 'lowpass'; f.frequency.value = 700; o.connect(f); o.start(); return f; });
    G.lamp = c.createGain(); G.lamp.gain.value = 0.006; bz.connect(G.lamp); G.lamp.connect(panner(SRC.lamp.x, SRC.lamp.y, SRC.lamp.z, 0.8, 14)); }
  /* the drinks machine's cold hum */
  if (SRC.vend) { const vh = slotSource('mm_vend_hum', () => { const o = c.createOscillator(), o2 = c.createOscillator(), m = c.createGain(); o.frequency.value = 58; o2.frequency.value = 176; o2.type = 'triangle';
      const g2 = c.createGain(); g2.gain.value = 0.25; o.connect(m); o2.connect(g2); g2.connect(m); o.start(); o2.start(); return m; });
    G.vend = c.createGain(); G.vend.gain.value = 0.03; vh.connect(G.vend); G.vend.connect(panner(SRC.vend.x, SRC.vend.y, SRC.vend.z, 0.6, 8)); }
  /* the wires: a thin whistle near the poles, only in the gusts */
  const wr = slotSource('mm_wires', () => { const s = loopSrc(S.noise), f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1450; f.Q.value = 18; s.connect(f); return f; });
  G.wires = SRC.poles.map(p => { const g = c.createGain(); g.gain.value = 0; wr.connect(g); g.connect(panner(p.x, p.y, p.z, 1.5, 18)); return g; });
}

/* ---- footsteps: a short burst shaped by what you're walking on ---- */
const STEP = {
  concrete:{ f:1900, q:1.2, len:0.07, g:0.09 }, gravel:{ f:3600, q:0.5, len:0.16, g:0.07 },
  road:{ f:1100, q:0.9, len:0.08, g:0.08 }, grass:{ f:5200, q:0.4, len:0.2, g:0.035 } };
function footstep(kind){
  const c = S.ctx, k = 'mm_step_' + kind, T = c.currentTime;
  if (S.buf[k]) { const s = c.createBufferSource(), g = c.createGain(); s.buffer = S.buf[k]; s.playbackRate.value = 0.94 + Math.random()*0.12; g.gain.value = 0.5; s.connect(g); g.connect(S.dry); s.start(); return; }
  const P = STEP[kind], s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = S.noise; f.type = 'bandpass'; f.frequency.value = P.f*(0.9 + Math.random()*0.2); f.Q.value = P.q;
  g.gain.setValueAtTime(0, T); g.gain.linearRampToValueAtTime(P.g, T + 0.008); g.gain.exponentialRampToValueAtTime(0.0005, T + P.len);
  s.connect(f); f.connect(g); g.connect(S.dry); s.start(T, Math.random()*3, P.len + 0.05);
}

/* ---- each frame ---- */
export function soundTick(cam, P, t, gust, bulbK, surface){
  if (!S.ctx || !G.wind) return;
  const c = S.ctx, T = c.currentTime, L = c.listener;
  const fx = -Math.sin(P.yaw)*Math.cos(P.pitch), fy = Math.sin(P.pitch), fz = -Math.cos(P.yaw)*Math.cos(P.pitch);
  if (L.positionX) { L.positionX.value = cam.position.x; L.positionY.value = cam.position.y; L.positionZ.value = cam.position.z; L.forwardX.value = fx; L.forwardY.value = fy; L.forwardZ.value = fz; L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0; }
  else { L.setPosition(cam.position.x, cam.position.y, cam.position.z); L.setOrientation(fx, fy, fz, 0, 1, 0); }
  G.wind.gain.setTargetAtTime(0.05 + gust*0.22, T, 0.6);
  /* the corn: from the nearest edge of it (north of the track, the far field, the sides) */
  const cx = Math.min(Math.max(P.x, 0.6), 41.4), cz = Math.min(Math.max(P.z, 0.55), 24.4);
  const ex = [[P.x, 0.4], [P.x, 24.6], [0.4, P.z], [41.6, P.z]].reduce((a, q) => Math.hypot(q[0] - cx, q[1] - cz) < Math.hypot(a[0] - cx, a[1] - cz) ? q : a);
  if (G.cornP.positionX) { G.cornP.positionX.value = ex[0]; G.cornP.positionZ.value = ex[1]; }
  G.corn.gain.setTargetAtTime(0.004 + gust*0.05, T, 0.5);
  G.bulbs.forEach((B, i) => B.g.gain.setTargetAtTime(0.012*(bulbK[i] == null ? 1 : bulbK[i]), T, 0.2));
  G.wires.forEach(g => g.gain.setTargetAtTime(gust > 0.35 ? 0.006*(gust - 0.35) : 0, T, 0.8));
  /* captions for what's around you (once as you come near, then now and then) */
  if (UI.cc) {
    if (gust > 0.55 && !S.gustOn) { S.gustOn = true; ccSay('gust', 'a gust: the corn rustles, the wires sing', 20000); } else if (gust < 0.3) S.gustOn = false;
    const near = (q, r) => q && Math.hypot(P.x - q.x, P.z - q.z) < r;
    if (SRC.bulbs.some(b => near(b, 2.6))) ccSay('bulbs', SLOTS.mm_bulb_hum.cc, 30000);
    else if (near(SRC.lamp, 3.5)) ccSay('lamp', SLOTS.mm_lamp_buzz.cc, 30000);
    else if (near(SRC.vend, 2)) ccSay('vend', SLOTS.mm_vend_hum.cc, 30000);
    else ccSay('wind', SLOTS.mm_wind.cc, 45000);
  }
  /* footsteps every 0.62 m (Seam's spacing) */
  if (S.lx != null) { const mv = Math.hypot(P.x - S.lx, P.z - S.lz); if (mv > 0 && mv < 0.5 && P.onGround) { S.step += mv; if (S.step > 0.62*(P.running ? 1.35 : 1)) { S.step = 0; footstep(surface); } } }
  S.lx = P.x; S.lz = P.z;
}
