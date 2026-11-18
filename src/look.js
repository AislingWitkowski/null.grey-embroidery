/* ================================================================
   EMBROIDERY · the look. the scene is lit and fogged by the graphics card at a low resolution, then every pixel goes
   through the station's ink pass: a soft glow off bright things, a filmic roll-off, back into picture values, a touch
   of grain, then matched to its ramp and dithered 4×4 between two steps (Seam's Bayer pattern). the result is drawn
   at low resolution and scaled up with crisp pixels.
   ================================================================ */
import * as THREE from 'three';
import { buildInkTables } from './inks.js';

const VS = 'precision highp float;\nin vec3 position; out vec2 vT; void main(){ vT = position.xy*0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const BRIGHT = 'precision highp float;\nin vec2 vT; uniform sampler2D uS; uniform vec2 uPx; uniform float uThr; out vec4 o;\n' +
  'void main(){ vec3 c = vec3(0.0); for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) { vec3 s = texture(uS, vT + vec2(float(i), float(j))*uPx).rgb; c += max(s - uThr, 0.0); } o = vec4(c/9.0, 1.0); }';
const BLUR = 'precision highp float;\nin vec2 vT; uniform sampler2D uS; uniform vec2 uD; out vec4 o;\n' +
  'void main(){ vec3 c = texture(uS, vT).rgb*0.2270; c += (texture(uS, vT + uD).rgb + texture(uS, vT - uD).rgb)*0.1946; c += (texture(uS, vT + uD*2.0).rgb + texture(uS, vT - uD*2.0).rgb)*0.1216; c += (texture(uS, vT + uD*3.0).rgb + texture(uS, vT - uD*3.0).rgb)*0.0541; c += (texture(uS, vT + uD*4.0).rgb + texture(uS, vT - uD*4.0).rgb)*0.0162; o = vec4(c, 1.0); }';
const INK = 'precision highp float; precision highp int;\nin vec2 vT; uniform sampler2D uS; uniform sampler2D uG; uniform sampler2D uLUT; uniform sampler2D uRF; uniform sampler2D uM;\n' +
  'uniform float uMist; uniform float uGlow, uSeed, uGrain, uExp, uCon, uVig, uGrime, uDith, uInk; uniform vec3 uWarm; uniform vec2 uOff; uniform vec2 uFull; out vec4 o;\n' +
  'const float B[16] = float[16](0.0,8.0,2.0,10.0,12.0,4.0,14.0,6.0,3.0,11.0,1.0,9.0,15.0,7.0,13.0,5.0);\n' +
  'float hs(vec2 p){ vec3 q = fract(vec3(p.xyx)*0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y)*q.z); }\n' +
  'float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f); return mix(mix(hs(i), hs(i + vec2(1,0)), f.x), mix(hs(i + vec2(0,1)), hs(i + vec2(1,1)), f.x), f.y); }\n' +
  'void main(){\n' +
  '  vec2 px = floor(gl_FragCoord.xy) + uOff;\n' +
  '  vec3 c = texture(uS, vT).rgb*uWarm + texture(uG, vT).rgb*uGlow;\n' +
  '  { vec3 m = texture(uM, vT).rgb*uWarm; float lm = dot(m, vec3(0.3, 0.59, 0.11)); c = mix(c, m, uMist*(0.55 + 0.45*clamp(lm*1.6, 0.0, 1.0))) + m*uMist*0.18; }\n' +   /* (Nov 18) a mist filter: the picture breathes into a soft copy of itself, the lights most, so edges stay but it's dreamier */

  '  c = vec3(1.0) - exp(-c*uExp);\n' +   /* a filmic shoulder: lights roll off softly instead of clipping */
  '  c = pow(clamp(c, 0.0, 1.0), vec3(1.0/2.2));\n' +
  '  c = clamp((c - 0.42)*uCon + 0.42, 0.0, 1.0);\n' +
  '  vec2 sp = px/uFull - 0.5; c *= 1.0 - uVig*dot(sp, sp)*1.6;\n' +   /* the corners sink a little */
  '  if (uGrime > 0.0) { float g = vn(px*0.09 + 3.0)*0.6 + vn(px*0.31)*0.4; c *= 1.0 - uGrime*smoothstep(0.55, 0.9, g); }\n' +   /* a dirty lens */
  '  c += (hs(px + uSeed) - 0.5)*(uGrain/255.0);\n' +
  '  ivec3 q = ivec3(clamp(c, 0.0, 0.999)*64.0); int idx = (q.r << 12) | (q.g << 6) | q.b;\n' +
  '  vec4 L = texelFetch(uLUT, ivec2(idx & 511, idx >> 9), 0);\n' +
  '  float ri = floor(L.r*255.0 + 0.5), pos = floor(L.g*255.0 + 0.5) + L.b, n = floor(L.a*255.0 + 0.5);\n' +
  '  ivec2 bp = ivec2(mod(px, 4.0)); float b = mix(0.5, (B[bp.y*4 + bp.x] + 0.5)/16.0, uDith); float k = min(floor(pos + b), n - 1.0);\n' +
  '  vec4 snap = texelFetch(uRF, ivec2(int(k), int(ri)), 0);\n' +
  '  float p0 = clamp(floor(pos), 0.0, n - 1.0), p1 = min(p0 + 1.0, n - 1.0);\n' +
  '  vec4 smoothInk = mix(texelFetch(uRF, ivec2(int(p0), int(ri)), 0), texelFetch(uRF, ivec2(int(p1), int(ri)), 0), clamp(pos - p0, 0.0, 1.0));\n' +
  '  o = mix(smoothInk, snap, uInk);\n' +   /* (Nov 18: the ink amount was never applied; now each look's ink is how much of the snapped, dithered ink shows over the smooth ink grade) */

  '}';

export function makeLook(renderer){
  const T = buildInkTables();
  const lut = new THREE.DataTexture(T.lut, 512, 512, THREE.RGBAFormat); lut.needsUpdate = true;
  const rf = new THREE.DataTexture(T.rf, 16, T.NR, THREE.RGBAFormat); rf.needsUpdate = true;
  for (const t of [lut, rf]) { t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.flipY = false; }
  const quadG = new THREE.BufferGeometry(); quadG.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mk = (fs, u) => { const m = new THREE.RawShaderMaterial({ vertexShader:VS, fragmentShader:fs, uniforms:u, glslVersion:THREE.GLSL3, depthTest:false, depthWrite:false }); const s = new THREE.Scene(); const me = new THREE.Mesh(quadG, m); me.frustumCulled = false; s.add(me); return { s, m }; };
  const bright = mk(BRIGHT, { uS:{ value:null }, uPx:{ value:new THREE.Vector2() }, uThr:{ value:0.6 } });
  const blur = mk(BLUR, { uS:{ value:null }, uD:{ value:new THREE.Vector2() } });
  const inkP = mk(INK, { uS:{ value:null }, uG:{ value:null }, uLUT:{ value:lut }, uRF:{ value:rf }, uGlow:{ value:1 }, uSeed:{ value:0 }, uGrain:{ value:8 }, uExp:{ value:1 }, uCon:{ value:1 }, uVig:{ value:0.3 }, uGrime:{ value:0 }, uDith:{ value:1 }, uInk:{ value:1 }, uM:{ value:null }, uMist:{ value:0 }, uWarm:{ value:new THREE.Vector3(1, 1, 1) }, uOff:{ value:new THREE.Vector2() }, uFull:{ value:new THREE.Vector2(1, 1) } });
  const rts = {};
  function rtFor(w, h, aa){
    const k = w + 'x' + h + 'x' + (aa || 0); if (rts[k]) return rts[k];
    const o = { HDR:THREE.HalfFloatType };
    const scene = new THREE.WebGLRenderTarget(w, h, { type:o.HDR, depthBuffer:true, samples:aa || 0 });   /* (aa: edges smoothed, for the looks that ask) */
    scene.texture.minFilter = scene.texture.magFilter = THREE.NearestFilter;
    const dv = h > 400 ? 3 : 1, hw = Math.max(1, w >> dv), hh = Math.max(1, h >> dv);   /* the glow is worked out small and spread smooth (at the higher resolution, an eighth: no gaps between samples) */
    const a = new THREE.WebGLRenderTarget(hw, hh, { type:o.HDR, depthBuffer:false }), b = new THREE.WebGLRenderTarget(hw, hh, { type:o.HDR, depthBuffer:false }), m = new THREE.WebGLRenderTarget(hw, hh, { type:o.HDR, depthBuffer:false });
    for (const t of [a, b, m]) t.texture.minFilter = t.texture.magFilter = THREE.LinearFilter;
    return (rts[k] = { scene, a, b, m, w, h, hw, hh });
  }
  let seed = 0, grainT = 0;
  /* draw one view: the world through `camera`, with look settings V, into the canvas's strip [x0, x0 + w) */
  function draw(scene, camera, V, x0, w, h, fullW){
    const R = rtFor(w, h, V.aa);
    renderer.setRenderTarget(R.scene); renderer.setViewport(0, 0, w, h); renderer.render(scene, camera);
    bright.m.uniforms.uS.value = R.scene.texture; bright.m.uniforms.uPx.value.set(R.w/R.hw/w*0.5, R.h/R.hh/h*0.5); bright.m.uniforms.uThr.value = V.glowThr;
    renderer.setRenderTarget(R.a); renderer.render(bright.s, cam);
    const sp = (V.glowWide || 1)*(h > 400 ? Math.max(0.5, h/1200) : 1);
    for (let pass = 0; pass < 2; pass++) {
      blur.m.uniforms.uS.value = R.a.texture; blur.m.uniforms.uD.value.set(sp/R.hw, 0); renderer.setRenderTarget(R.b); renderer.render(blur.s, cam);
      blur.m.uniforms.uS.value = R.b.texture; blur.m.uniforms.uD.value.set(0, sp/R.hh); renderer.setRenderTarget(R.a); renderer.render(blur.s, cam);
    }
    if (V.mist) {   /* the mist: the whole picture, small and spread wide */
      bright.m.uniforms.uThr.value = 0.0; renderer.setRenderTarget(R.m); renderer.render(bright.s, cam);
      for (let pass = 0; pass < 3; pass++) { const d = sp*(1.5 + pass);
        blur.m.uniforms.uS.value = R.m.texture; blur.m.uniforms.uD.value.set(d/R.hw, 0); renderer.setRenderTarget(R.b); renderer.render(blur.s, cam);
        blur.m.uniforms.uS.value = R.b.texture; blur.m.uniforms.uD.value.set(0, d/R.hh); renderer.setRenderTarget(R.m); renderer.render(blur.s, cam); } }
    const U = inkP.m.uniforms; U.uM.value = R.m.texture; U.uMist.value = V.mist || 0;
    U.uS.value = R.scene.texture; U.uG.value = R.a.texture; U.uGlow.value = V.glow; U.uSeed.value = seed; U.uGrain.value = V.grain;
    U.uExp.value = V.exposure; U.uCon.value = V.contrast; U.uVig.value = V.vignette; U.uGrime.value = V.grime || 0; U.uDith.value = V.dither == null ? 1 : V.dither; U.uInk.value = V.ink == null ? 1 : V.ink;
    U.uWarm.value.set(V.warm[0], V.warm[1], V.warm[2]); U.uOff.value.set(x0, 0); U.uFull.value.set(fullW, h);
    renderer.setRenderTarget(null); renderer.setViewport(x0, 0, w, h); renderer.setScissor(x0, 0, w, h); renderer.setScissorTest(true);
    renderer.render(inkP.s, cam); renderer.setScissorTest(false);
  }
  /* the grain moves at 12 frames a second, the speed of old film (and calmer than every frame) */
  function tick(dt){ grainT += dt; if (grainT > 1/12) { grainT = 0; seed = (seed + 37.13) % 997; } }
  return { draw, tick };
}
