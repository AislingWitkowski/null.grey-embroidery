// null.grey · a tiny sketch of "the print look" (doc 63). Not the real engine: a first look only.
// Real 3D (three.js), then one screen pass: soft wash, ink line on near things, the fog that sketches,
// paper in the lights, crayon grain, a slight print offset, fine static. Nothing flashes.
import * as THREE from 'three';

const q = new URLSearchParams(location.search);
const ROWS = 600;                                   // drawn rows; scaled up to the window
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(62, 1, 0.1, 80);

// ---------- textures painted in code ----------
function canvasTex(w, h, paint, rep = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint(g, w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);
function blots(g, w, h, n, cols, rmin, rmax, a) {   // wash mottling: soft overlapping blots
  for (let i = 0; i < n; i++) { const x = rnd(0, w), y = rnd(0, h), r = rnd(rmin, rmax); const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const c = cols[i % cols.length]; gr.addColorStop(0, c + a + ')'); gr.addColorStop(1, c + '0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
}
const planks = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#5c4e45'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 8; i++) { g.fillStyle = `rgb(${80 + rnd(-12, 12)},${68 + rnd(-10, 10)},${62 + rnd(-10, 10)})`; g.fillRect(0, i * 32 + 1, w, 30);
    g.strokeStyle = 'rgba(30,24,22,.5)'; g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); }
  blots(g, w, h, 60, ['rgba(40,32,30,', 'rgba(140,120,110,'], 10, 40, .25); }, [2, 2]);
const concrete = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#7c7472'; g.fillRect(0, 0, w, h);
  blots(g, w, h, 120, ['rgba(60,54,54,', 'rgba(150,142,140,', 'rgba(110,96,100,'], 8, 50, .3);
  g.strokeStyle = 'rgba(40,36,36,.35)'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); } }, [3, 8]);
const ground = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#4d453c'; g.fillRect(0, 0, w, h);
  blots(g, w, h, 160, ['rgba(70,64,48,', 'rgba(35,30,28,', 'rgba(100,88,72,', 'rgba(84,76,80,'], 6, 40, .35); }, [10, 10]);
const bark = canvasTex(64, 256, (g, w, h) => { g.fillStyle = '#cfc8c0'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(40,34,34,${rnd(.4, .85)})`; g.fillRect(rnd(0, w), rnd(0, h), rnd(6, 22), rnd(1.5, 4)); }
  blots(g, w, h, 20, ['rgba(160,150,150,'], 6, 20, .3); }, [1, 2]);
const boards = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#6b5f58'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 10; i++) { g.fillStyle = `rgb(${96 + rnd(-14, 10)},${86 + rnd(-12, 8)},${84 + rnd(-10, 10)})`; g.fillRect(i * 25.6 + 1, 0, 24, h); }
  blots(g, w, h, 70, ['rgba(40,32,34,', 'rgba(150,130,128,'], 10, 50, .28); }, [1, 1]);

// ---------- light: overcast dusk, one warm lamp ----------
scene.add(new THREE.HemisphereLight(0x8c8090, 0x2e2729, 0.85));
const west = new THREE.DirectionalLight(0xb09080, 0.25); west.position.set(-20, 8, -10); scene.add(west);
const lamp = new THREE.PointLight(0xf1c79a, 18, 12, 1.7); lamp.position.set(1.4, 3.1, -2); lamp.castShadow = true;
lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.radius = 6; lamp.shadow.bias = -0.002; scene.add(lamp);

const M = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.9, metalness: 0 }, o));
const add = (geo, mat, x, y, z, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; scene.add(m); return m; };

// ground and platform
const g0 = add(new THREE.PlaneGeometry(120, 120), M({ map: ground }), 0, 0, 0, false); g0.rotation.x = -Math.PI / 2;
add(new THREE.BoxGeometry(4, 0.9, 40), M({ map: concrete }), 0, 0.45, -8);
add(new THREE.BoxGeometry(0.25, 0.06, 40), M({ color: 0xa79c94 }), 1.9, 0.92, -8);         // pale platform edge
// track (seen, never walked): rails and sleepers
for (let z = -30; z < 14; z += 0.7) add(new THREE.BoxGeometry(2.6, 0.12, 0.28), M({ map: planks }), 4.2, 0.08, z, false);
for (const x of [3.5, 4.9]) add(new THREE.BoxGeometry(0.08, 0.14, 46), M({ color: 0x4a4142, metalness: 0.6, roughness: 0.5 }), x, 0.2, -8, false);

// bench, with one small red (a ribbon)
const bench = new THREE.Group(); scene.add(bench); bench.position.set(-0.6, 0.9, -3.2);
const bm = M({ map: planks });
[[0, 0.45, 0, 1.8, 0.07, 0.45], [0, 0.85, -0.2, 1.8, 0.35, 0.06]].forEach(([x, y, z, w, h, d]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bm); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; bench.add(m); });
[-0.8, 0.8].forEach(x => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.4), M({ color: 0x2e2829, metalness: .5, roughness: .6 })); m.position.set(x, 0.22, 0); m.castShadow = true; bench.add(m); });
const rib = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.012), M({ color: 0x9a1f24, roughness: .6 })); rib.position.set(0.55, 0.72, -0.17); rib.rotation.z = 0.25; bench.add(rib);

// the lamp post
add(new THREE.CylinderGeometry(0.05, 0.07, 3.2, 8), M({ color: 0x2f2a2b, metalness: .4 }), 1.4, 2.5, -2);
add(new THREE.BoxGeometry(0.5, 0.05, 0.05), M({ color: 0x2f2a2b }), 1.4, 3.35, -2);
add(new THREE.SphereGeometry(0.12, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffe2b8 }), 1.4, 3.15, -2, false);

const haloTex = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,226,190,.55)'); r.addColorStop(.35, 'rgba(240,196,150,.18)'); r.addColorStop(1, 'rgba(240,196,150,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return c; })());
const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); halo.position.set(1.4, 3.15, -2); halo.scale.set(2.6, 2.6, 1); scene.add(halo);
const pool = new THREE.Mesh(new THREE.CircleGeometry(2.2, 32), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .5 }));
pool.rotation.x = -Math.PI / 2; pool.position.set(1.2, 0.93, -2); scene.add(pool);

// the shed, with a silver stitch across its wall (the leak, doc 63 §2.8)
const shed = add(new THREE.BoxGeometry(2.6, 2.4, 2.2), M({ map: boards }), -1.6, 2.1, -9.5);
const roof = add(new THREE.BoxGeometry(3.0, 0.1, 2.6), M({ color: 0x5a5156, metalness: .5, roughness: .55 }), -1.6, 3.36, -9.5); roof.rotation.x = 0.08;
add(new THREE.BoxGeometry(0.8, 1.7, 0.04), M({ color: 0x2a2224 }), -1.0, 1.75, -8.38);    // door
const stitch = M({ color: 0xcfd0d8, metalness: 0.9, roughness: 0.25, emissive: 0x30333c });
for (let i = 0; i < 11; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.26, 0.015), stitch);
  s.position.set(-2.6 + i * 0.14, 2.2 + Math.sin(i * 0.7) * 0.08, -8.38); s.rotation.z = (i % 2 ? 0.7 : -0.7); scene.add(s); }

// birches (bare, leaning a little)
function birch(x, z, h, lean) {
  const t = new THREE.Group(); t.position.set(x, 0, z); t.rotation.z = lean; scene.add(t);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.13, h, 7), M({ map: bark })); trunk.position.y = h / 2; trunk.castShadow = true; t.add(trunk);
  for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.03, rnd(0.8, 1.8), 4), M({ color: 0x3a3233 }));
    const y = rnd(h * 0.45, h * 0.95), a = rnd(0, 6.28); b.position.set(Math.cos(a) * 0.3, y, Math.sin(a) * 0.3); b.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); t.add(b); }
}
[[-3.4, -1, 6, .05], [-4.6, -5, 7, -.06], [-3.8, -12, 6.5, .03], [-6, -16, 7.5, -.04], [-5.2, 3, 5.5, .07], [-7.5, -8, 8, 0]].forEach(a => birch(...a));

// dead grass tufts
const blades = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = 128; c.height = 128; const g = c.getContext('2d');
  for (let i = 0; i < 60; i++) { const x = rnd(4, 124), h = rnd(50, 125), b = rnd(-14, 14); g.strokeStyle = `rgba(${96 + rnd(-18, 18)},${92 + rnd(-16, 16)},${82 + rnd(-12, 12)},1)`; g.lineWidth = rnd(1, 2.4);
    g.beginPath(); g.moveTo(x, 128); g.quadraticCurveTo(x + b * .3, 128 - h * .6, x + b, 128 - h); g.stroke(); } return c; })());
blades.colorSpace = THREE.SRGBColorSpace;
const tuft = new THREE.PlaneGeometry(0.9, 0.7); const tm = M({ map: blades, alphaTest: 0.5, side: THREE.DoubleSide });
for (let i = 0; i < 700; i++) { const x = rnd(-16, -2.1), z = rnd(-34, 12); for (let k = 0; k < 2; k++) { const m = new THREE.Mesh(tuft, tm); m.position.set(x, 0.33, z); m.rotation.y = rnd(0, 3) + k * 1.57; m.scale.setScalar(rnd(.7, 1.3)); scene.add(m); } }

// a pylon far off, sinking into the fog
const py = new THREE.Group(); py.position.set(-16, 0, -34); scene.add(py); const pm = M({ color: 0x2a2526, metalness: .3 });
[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 16, 4), pm); l.position.set(a * 0.9, 8, b * 0.9); l.rotation.set(b * -0.06, 0, a * 0.06); py.add(l); });
[11, 14].forEach(y => { const c = new THREE.Mesh(new THREE.BoxGeometry(5, 0.12, 0.12), pm); c.position.y = y; py.add(c); });

// a figure at the far end of the platform: puppet-like, still, with strings going up into the fog
const fig = new THREE.Group(); fig.position.set(0.2, 0.9, -19); scene.add(fig);
const cloak = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.55, 10, 1, true), M({ color: 0x3a3236, side: THREE.DoubleSide })); cloak.position.y = 0.78; cloak.castShadow = true; fig.add(cloak);
const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), M({ color: 0xd9cfc4, roughness: .5 })); head.position.y = 1.7; fig.add(head);
const strM = new THREE.LineBasicMaterial({ color: 0xb9b6be, transparent: true, opacity: 0.55 });
[[-0.25, 1.3], [0.25, 1.3], [0, 1.85]].forEach(([x, y]) => fig.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, 0), new THREE.Vector3(x * 0.4, 14, 0)]), strM)));

// the sky: graded wash (bokashi); the top band a faded dusky blue (the leak is near)
const sky = new THREE.Mesh(new THREE.SphereGeometry(70, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false,
  uniforms: { leak: { value: q.has('noleak') ? 0 : 0.55 } },
  vertexShader: 'varying vec3 p; void main(){ p=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `uniform float leak; varying vec3 p;
    void main(){ float h=clamp(p.y,0.,1.);
      vec3 hor=vec3(.56,.50,.49), mid=vec3(.42,.34,.38), top=mix(vec3(.30,.25,.30), vec3(.36,.43,.55), leak);
      vec3 c=mix(hor,mid,smoothstep(.02,.25,h)); c=mix(c,top,smoothstep(.22,.6,h));
      gl_FragColor=vec4(pow(c,vec3(2.2)),1.); }` }));
scene.add(sky);

// slow falling ash
const ashN = 900, ashG = new THREE.BufferGeometry(), ashP = new Float32Array(ashN * 3);
for (let i = 0; i < ashN; i++) { ashP[i * 3] = rnd(-12, 12); ashP[i * 3 + 1] = rnd(0, 10); ashP[i * 3 + 2] = rnd(-28, 8); }
ashG.setAttribute('position', new THREE.BufferAttribute(ashP, 3));
scene.add(new THREE.Points(ashG, new THREE.PointsMaterial({ color: 0x3b3436, size: 0.035 })));

// ---------- the print pass ----------
const rt = new THREE.WebGLRenderTarget(1, 1, { depthTexture: new THREE.DepthTexture(1, 1), samples: 0 });
rt.texture.minFilter = rt.texture.magFilter = THREE.LinearFilter;
const post = new THREE.ShaderMaterial({
  uniforms: { tC: { value: rt.texture }, tD: { value: rt.depthTexture }, px: { value: new THREE.Vector2() }, t: { value: 0 },
    near: { value: cam.near }, far: { value: cam.far }, pencil: { value: q.has('nopencil') ? 0 : 1 } },
  vertexShader: 'varying vec2 v; void main(){ v=uv; gl_Position=vec4(position.xy,0.,1.); }',
  fragmentShader: `
  uniform sampler2D tC, tD; uniform vec2 px; uniform float t, near, far, pencil; varying vec2 v;
  float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
  float lin(float d){ float z=d*2.-1.; return 2.*near*far/(far+near-z*(far-near)); }
  float Z(vec2 u){ return lin(texture2D(tD,u).r); }
  float L(vec3 c){ return dot(c, vec3(.299,.587,.114)); }
  vec3 C(vec2 u){ return texture2D(tC,u).rgb; }
  void main(){
    float rawd = texture2D(tD,v).r; float isSky = step(.9999, rawd);
    float z = mix(Z(v), 0., isSky);
    // a slight print offset: the colour plate sits a pixel off the line
    vec2 reg = px * vec2(0.9, -0.6);
    vec3 col = C(v + reg);
    // soft wash: light settles into a few soft steps (never hard cel bands)
    float l = L(col), steps = 6.;
    float lq = (floor(l*steps) + smoothstep(.25,.75,fract(l*steps))) / steps;
    col *= mix(1., lq/max(l,1e-3), .55);
    // pigment pools a little darker where one value meets the next
    float e = 0.; for (int i=0;i<4;i++){ vec2 o = vec2(i==0?1.:i==1?-1.:0., i==2?1.:i==3?-1.:0.)*px*2.; e += abs(L(C(v+o))-l); }
    col *= 1. - clamp(e*.9, 0., .22);
    // the ink line: wobbly, broken, only on near things
    vec2 w = (vec2(vn(v*90.+1.), vn(v*90.+7.))-.5)*px*1.5;
    float zc = Z(v+w), dz = 0.;
    dz += abs(Z(v+w+vec2(px.x,0))-zc) + abs(Z(v+w-vec2(px.x,0))-zc) + abs(Z(v+w+vec2(0,px.y))-zc) + abs(Z(v+w-vec2(0,px.y))-zc);
    float line = smoothstep(.06*zc, .16*zc, dz) * smoothstep(.35, .7, vn(v*60.));     // broken
    float nearLine = 1. - smoothstep(4., 9., z);
    // the fog that sketches: past a few metres colour drains to a pencil version, then the fog takes it
    vec3 paper = pow(vec3(.86,.82,.76), vec3(2.2));
    vec3 penPaper = pow(vec3(.50,.45,.45), vec3(2.2));                       // pencil sits in the fog's own grey
    float s = smoothstep(3.5, 11., z) * pencil * (1.-isSky);
    float hatch = step(.55, fract((v.x+v.y)*180.)) * (1.-smoothstep(.15,.55,l));
    vec3 pen = penPaper * (.8 + .25*smoothstep(.05,.6,l)) * (1. - hatch*.12 - line*.4);
    vec3 c2 = mix(col, mix(vec3(L(col)), pen, .7), s);
    c2 = mix(c2, pow(vec3(.10,.08,.09),vec3(2.2)), line * nearLine * .75);                 // ink on near things
    float fog = pow(smoothstep(5., 25., z), .8);
    fog = mix(fog, .72, isSky);                                            // the sky is mostly fog too, its wash showing faintly
    vec3 fogc = mix(vec3(.40,.36,.37), vec3(.50,.45,.45), v.y);             // warm grey-mauve: brain fog
    // paper in the lights; crayon grain where it's lit
    float fib = vn(v*vec2(700.,240.))*.5 + vn(v*1400.)*.5;
    c2 = mix(c2, paper, smoothstep(.55, .95, L(c2)) * .55);
    c2 *= .94 + .1*fib;
    float cray = step(.72, vn(vec2(v.x*500., v.y*90.) + v.x*40.)) * smoothstep(.35,.8,L(c2));
    c2 -= cray*.05;
    // film grain and a fine static (changes slowly, ~12 times a second; never flashes)
    float tt = floor(t*12.);
    c2 = max(c2, 0.); c2 = pow(c2, vec3(1./2.2));
    c2 = mix(c2, fogc, fog);
    c2 += (h21(v*vec2(913.,577.)+tt) - .5) * .028;                           // film grain, ~12 times a second
    c2 = mix(c2, fogc*.8, smoothstep(.45, 1.1, length(v-.5)*1.3) * .25);     // soft vignette
    c2 = mix(vec3(.16,.14,.15), vec3(1.), c2);                               // darks a soft grey, never black
    gl_FragColor = vec4(clamp(c2,0.,1.), 1.);
  }` });
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post); const postScene = new THREE.Scene(); postScene.add(quad);
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// ---------- walking: drag to look; WASD/arrows or hold to walk ----------
const views = [[0, 1.65, 2.5, 0, -0.04], [-0.3, 1.65, -5.5, 0.35, 0.02], [0.6, 1.6, -11, -0.1, 0.0]];
let [px0, py0, pz0, yaw, pitch] = views[+(q.get('v') || 0)] || views[0];
cam.position.set(px0, py0, pz0);
const keys = {}; addEventListener('keydown', e => keys[e.key.toLowerCase()] = 1); addEventListener('keyup', e => keys[e.key.toLowerCase()] = 0);
let drag = null, hold = false;
addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY]; hold = true; });
addEventListener('pointerup', () => { drag = null; hold = false; });
addEventListener('pointermove', e => { if (!drag) return; yaw -= (e.clientX - drag[0]) * 0.004; pitch = Math.max(-1, Math.min(1, pitch - (e.clientY - drag[1]) * 0.003)); drag = [e.clientX, e.clientY]; hold = false; });

function size() { const h = Math.min(ROWS, innerHeight), w = Math.round(h * innerWidth / innerHeight);
  renderer.setPixelRatio(1); renderer.setSize(w, h, false); renderer.domElement.style.cssText = 'width:100vw;height:100vh;display:block;image-rendering:auto';
  rt.setSize(w, h); post.uniforms.px.value.set(1 / w, 1 / h); cam.aspect = w / h; cam.updateProjectionMatrix(); }
addEventListener('resize', size); size();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const f = (keys.w || keys.arrowup || hold ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0);
  yaw += ((keys.a || keys.arrowleft ? 1 : 0) - (keys.d || keys.arrowright ? 1 : 0)) * dt * 1.4;
  cam.position.x -= Math.sin(yaw) * f * dt * 1.6; cam.position.z -= Math.cos(yaw) * f * dt * 1.6;
  cam.position.x = Math.max(-1.7, Math.min(1.6, cam.position.x)); cam.position.z = Math.max(-26, Math.min(8, cam.position.z));   // stay on the platform
  cam.rotation.set(pitch, yaw, 0, 'YXZ');
  for (let i = 0; i < ashN; i++) { ashP[i * 3 + 1] -= dt * 0.25; ashP[i * 3] += Math.sin(now * 0.0003 + i) * dt * 0.05; if (ashP[i * 3 + 1] < 0) ashP[i * 3 + 1] = 10; }
  ashG.attributes.position.needsUpdate = true;
  post.uniforms.t.value = now / 1000;
  renderer.setRenderTarget(rt); renderer.render(scene, cam);
  renderer.setRenderTarget(null); renderer.render(postScene, postCam);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
