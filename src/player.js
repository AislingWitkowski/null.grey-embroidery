/* ================================================================
   EMBROIDERY · you. first person only, always: you never see yourself.
   walking, running, crouching, jumping; collisions with the ground (hills, slopes, ditches, steps) and with solid
   boxes. keys, mouse, touch (like Seam: hold to walk, hold low to step back, drag to look) and a gamepad.
   ================================================================ */
import { clamp } from './paint.js';

export const P = {
  x:0, y:0, z:0, yaw:0, pitch:0, vy:0, onGround:true,
  eyeStand:1.55, eyeCrouch:1.0, eye:1.55, r:0.26, step:0.4,
  walk:1.7, run:3.6, crouchSpeed:0.9, jumpV:4.1, g:12,
  crouch:false, running:false
};
/* the world gives us: ground(x, z) → height of the earth; solids: [{x0,x1,z0,z1,y0,y1}]; bounds {x0,x1,z0,z1} */
let W = { ground:() => 0, solids:[], bounds:null };
export function setWorld(w){ W = w; }

/* the highest thing you could be standing on here, at most `reach` above your feet */
function standHeight(x, z, feet, reach){
  let h = W.ground(x, z);
  for (const b of W.solids) {
    if (b.y1 > feet + reach) continue;
    const cx = clamp(x, b.x0, b.x1), cz = clamp(z, b.z0, b.z1), dx = x - cx, dz = z - cz;
    if (dx*dx + dz*dz < P.r*P.r*0.5 && b.y1 > h) h = b.y1;
  }
  return h;
}
function blocked(b, feet, top){ return b.y1 > feet + P.step && b.y0 < top; }
function pushOut(nx, nz, feet){
  const top = feet + P.eye + 0.15;
  for (let it = 0; it < 3; it++) for (const b of W.solids) {
    if (!blocked(b, feet, top)) continue;
    const cx = clamp(nx, b.x0, b.x1), cz = clamp(nz, b.z0, b.z1); let dx = nx - cx, dz = nz - cz; const d2 = dx*dx + dz*dz;
    if (d2 >= P.r*P.r) continue;
    if (d2 < 1e-9) {   /* inside: out by the nearest side */
      const l = nx - b.x0, r = b.x1 - nx, f = nz - b.z0, k = b.z1 - nz, m = Math.min(l, r, f, k);
      if (m === l) nx = b.x0 - P.r; else if (m === r) nx = b.x1 + P.r; else if (m === f) nz = b.z0 - P.r; else nz = b.z1 + P.r;
    } else { const d = Math.sqrt(d2); nx = cx + dx/d*P.r; nz = cz + dz/d*P.r; }
  }
  return [nx, nz];
}

/* ---------------- input ---------------- */
const keys = {};
const touch = { id:null, sx:0, sy:0, lx:0, ly:0, t0:0, look:false, low:false, walking:false };
let jumpReq = false, mouseDown = false, mx = 0, my = 0, md = null;
export const TAP = { fn:null };   /* (milestone 2) a quick press that didn't drag is a click: reaching for things, as in Seam */
export function initInput(el){
  addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'Space') { jumpReq = true; e.preventDefault(); } if (e.code === 'KeyC' || e.code === 'ControlLeft') P.crouch = !P.crouch; });
  addEventListener('keyup', e => { keys[e.code] = false; });
  el.addEventListener('mousedown', e => { mouseDown = true; mx = e.clientX; my = e.clientY; md = { x:e.clientX, y:e.clientY, t:performance.now() }; });
  addEventListener('mouseup', e => { mouseDown = false;
    if (md && Math.hypot(e.clientX - md.x, e.clientY - md.y) < 8 && performance.now() - md.t < 400 && TAP.fn) TAP.fn(e.clientX, e.clientY); md = null; });
  addEventListener('mousemove', e => {
    if (document.pointerLockElement === el) { look(e.movementX, e.movementY, 0.0024); return; }
    if (!mouseDown) return; look(e.clientX - mx, e.clientY - my, 0.0042); mx = e.clientX; my = e.clientY;
  });
  el.addEventListener('dblclick', () => { if (el.requestPointerLock) el.requestPointerLock(); });
  /* touch: hold to walk, hold low to step back, drag to look (Seam's way). a second finger tapped = jump */
  el.addEventListener('touchstart', e => {
    e.preventDefault();
    if (touch.id !== null && e.touches.length > 1) { jumpReq = true; return; }
    const t = e.changedTouches[0]; touch.id = t.identifier; touch.sx = touch.lx = t.clientX; touch.sy = touch.ly = t.clientY; touch.t0 = performance.now(); touch.look = false;
    touch.low = t.clientY > innerHeight*0.8;
  }, { passive:false });
  el.addEventListener('touchmove', e => { e.preventDefault(); for (const t of e.changedTouches) { if (t.identifier !== touch.id) continue;
    if (!touch.look && Math.hypot(t.clientX - touch.sx, t.clientY - touch.sy) > 10) touch.look = true;
    if (touch.look) look(t.clientX - touch.lx, t.clientY - touch.ly, 0.006);
    touch.lx = t.clientX; touch.ly = t.clientY; } }, { passive:false });
  const end = e => { for (const t of e.changedTouches) if (t.identifier === touch.id) { if (!touch.look && performance.now() - touch.t0 < 220 && TAP.fn) TAP.fn(t.clientX, t.clientY); touch.id = null; } };
  el.addEventListener('touchend', end); el.addEventListener('touchcancel', end);
}
export function pressJump(){ jumpReq = true; }
export function simKeys(ks){ for (const k in keys) keys[k] = false; for (const k of ks) { keys[k] = true; if (k === 'Space') jumpReq = true; } }   /* (tests) */
export function toggleCrouch(){ P.crouch = !P.crouch; }
function look(dx, dy, k){ P.yaw -= dx*k; P.pitch = clamp(P.pitch - dy*k, -1.35, 1.35); }

/* the gamepad, if the page is allowed one. inside a preview or an embedded frame the browser can forbid it outright
   (a permissions error, not just an empty list); then gamepads are simply off and nothing else changes */
let padsOk = true;
function pads(){
  if (!padsOk || !navigator.getGamepads) return null;
  try { return [...navigator.getGamepads()].find(g => g && g.connected) || null; } catch (e) { padsOk = false; return null; }
}

/* ---------------- each frame ---------------- */
export function stepPlayer(dt){
  if (window.EG_SEAM && EG_SEAM.pocket && EG_SEAM.pocket.isOpen()) return;   /* (no walking with your hand in your pocket) */
  let fwd = 0, side = 0;
  if (keys.KeyW || keys.ArrowUp) fwd += 1; if (keys.KeyS || keys.ArrowDown) fwd -= 1;
  if (keys.KeyA) side -= 1; if (keys.KeyD) side += 1;
  if (keys.ArrowLeft) P.yaw += dt*1.9; if (keys.ArrowRight) P.yaw -= dt*1.9;
  P.running = !!(keys.ShiftLeft || keys.ShiftRight);
  if (touch.id !== null && !touch.look && performance.now() - touch.t0 > 160) fwd = touch.low ? -1 : 1;
  /* gamepad: left stick walks, right stick looks, A jumps, B crouches, left stick pressed (or LT) runs */
  const gp = pads();
  if (gp) {
    const dz = v => Math.abs(v) < 0.15 ? 0 : v;
    side += dz(gp.axes[0]); fwd -= dz(gp.axes[1]);
    look(dz(gp.axes[2] || 0)*dt*420, dz(gp.axes[3] || 0)*dt*300, 0.006);
    if (gp.buttons[0] && gp.buttons[0].pressed && !P._gA) jumpReq = true; P._gA = gp.buttons[0] && gp.buttons[0].pressed;
    if (gp.buttons[1] && gp.buttons[1].pressed && !P._gB) P.crouch = !P.crouch; P._gB = gp.buttons[1] && gp.buttons[1].pressed;
    if ((gp.buttons[10] && gp.buttons[10].pressed) || (gp.buttons[6] && gp.buttons[6].value > 0.5)) P.running = true;
  }
  const len = Math.hypot(fwd, side); if (len > 1) { fwd /= len; side /= len; }
  if (P.sit && (len > 0.1 || jumpReq)) P.sit = false;   /* (the bench: moving stands you up) */
  P._spd = len;
  const sp = P.crouch ? P.crouchSpeed : (P.running ? P.run : P.walk);
  const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), rx = Math.cos(P.yaw), rz = -Math.sin(P.yaw);
  let nx = P.x + (fx*fwd + rx*side)*sp*dt, nz = P.z + (fz*fwd + rz*side)*sp*dt;
  /* standing up needs room overhead */
  const want = P.sit ? 1.12 : (P.crouch ? P.eyeCrouch : P.eyeStand); P.eye += clamp(want - P.eye, -dt*3, dt*3);
  [nx, nz] = pushOut(nx, nz, P.y);
  if (W.bounds) { nx = clamp(nx, W.bounds.x0, W.bounds.x1); nz = clamp(nz, W.bounds.z0, W.bounds.z1); }
  /* a step up only if it's low enough; a drop is fine (you fall) */
  const gh = standHeight(nx, nz, P.y, P.step);
  if (gh - P.y <= P.step || !P.onGround) { P.x = nx; P.z = nz; }
  const g2 = standHeight(P.x, P.z, P.y, P.onGround ? P.step : 0.05);
  if (jumpReq && P.onGround) { P.vy = P.crouch ? P.jumpV*0.7 : P.jumpV; P.onGround = false; }
  jumpReq = false;
  P.vy -= P.g*dt; P.y += P.vy*dt;
  if (P.y <= g2) {
    if (P.onGround && g2 < P.y + 0.0001 && P.vy < 0 && P.y - g2 < P.step) P.y = g2;   /* walking down a slope: stay on it */
    P.y = Math.max(P.y, g2); if (P.vy < 0) P.vy = 0; P.onGround = true;
  } else if (P.onGround && P.y - g2 < 0.25 && P.vy <= 0) { P.y = g2; P.vy = 0; }   /* small dips: keep your feet down */
  else P.onGround = false;
}
