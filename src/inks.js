/* ================================================================
   EMBROIDERY · the inks.
   the station's own ramps, copied unchanged from null.grey-furusatostation/src/a-head.html (RAMP_SRC; the master lives
   there — copy over when it changes), only the ones Missing Mile's station uses. every pixel Embroidery draws is put
   back onto these: the same ramps, the same 4×4 Bayer dither as Seam and the train ride (f9e-car-gl.js, CAR_INK), so a
   lamp here and a lamp at the hub land on the same colours. checked in Seam: nothing leans blue.
   ================================================================ */
export const RAMP_SRC = {
  hcream: ['#231a11','#2f2418','#3c2f1f','#483a27','#56452f','#635138','#705d41','#7d694a','#8b7555','#988260','#a58f6b','#b29c77','#bea984','#cbb691','#d6c39f','#e2d0ad'],
  hgrey: ['#130d0a','#221b18','#312a25','#403833','#4f4740','#5d554e','#6c635b','#7b7269','#8a8076','#948a7e','#9e9386','#a89d8f'],
  hrust: ['#130d0a','#241510','#351e16','#46261b','#572f21','#673727','#783f2d','#894832','#9a5038','#a35e46','#ab6d55','#b47b63'],
  hwood: ['#160d08','#1e120b','#26170e','#2f1d12','#382316','#422a1a','#4c311f','#563824','#61402a','#6c4830','#775137','#82593e'],
  hsage: ['#1e1e16','#2a2a1f','#363728','#424431','#4f513b','#5c5e45','#696b50','#76785b','#838566','#909272','#9d9f7e','#aaab8b','#b6b798','#c2c3a6'],
  holive: ['#130d0a','#1e1a11','#2a2718','#35341e','#414125','#4c4d2c','#575a33','#636739','#6e7440','#818454','#959469'],
  hgold: ['#271c0f','#372714','#47331a','#584020','#694d27','#7a5a2f','#8b6838','#9c7642','#ac844d','#bb9259','#c9a067','#d6ae76','#e2bc86'],
  hplum: ['#130d0a','#1c1413','#261b1c','#2f2225','#392a2e','#423137','#4b3840','#553f49','#5e4652','#745d64','#8a7475'],
  hblack: ['#120d0b','#181210','#1e1714','#251c18','#2c211c','#332620'],
  hamber: ['#1a0f06','#33210d','#4c3315','#64451c','#7d5823','#966a2a','#af7c32','#c78e39','#e0a040','#e3a84d','#e6b05a','#e9b866'],
  glowa: ['#2a1a08','#40290d','#583a13','#704c1a','#895f22','#a1732c','#b98838','#cf9e48','#e2b45c','#f0c872'],
  glowc: ['#3a2f22','#54463a','#6e5e4e','#877764','#a0907b','#b8a992','#cfc1a9','#e2d6bf','#f0e6d2'],
  hnight: ['#1e1615','#261c1a','#2e221f','#372924','#40302a','#4a3730','#543f36','#5e473d','#694f44'],
  hplas: ['#241b15','#30251c','#3c2e23','#48382b','#554334','#624e3d','#6f5a47','#7c6651','#89725c','#967e67','#a38b73','#af977f','#bba38b','#c7af98','#d2bba5','#ddc8b3'],
  metal: ['#111010','#181716','#21201f','#2b2a29','#363433','#423f3e','#4e4b4a','#5b5856','#696563','#777371','#86817e','#948f8c'],
  pwhite: ['#121211','#212120','#30302f','#3f3f3d','#4e4e4c','#5d5d5b','#6c6c6a','#7b7b79','#8b8a87','#9a9996','#a9a8a5','#b8b7b4','#c7c6c3','#d6d5d1','#e5e4e0','#f4f3ef'],
  paper: ['#252119','#332e25','#443d32','#564d40','#685e4e','#7b705d','#8e826d','#a1957e','#b3a790','#c4b8a2','#d4c9b4','#e2d8c6'],
  sstone: ['#131110','#1b1816','#23201d','#2c2724','#352f2b','#3e3833','#48413b','#524a43','#5d544c','#685e55','#73685e','#7f7368']
};

function hx(s){ return [parseInt(s.substr(1, 2), 16), parseInt(s.substr(3, 2), 16), parseInt(s.substr(5, 2), 16)]; }

/* two little tables for the graphics card (the same scheme as the train ride's carInkTables):
   lut: every colour (64 levels a channel) → which ramp, which step, how far toward the next step, the ramp's length;
   rf:  each ramp's colours, one row per ramp. */
export function buildInkTables(names){
  names = names || Object.keys(RAMP_SRC);
  const C = names.map(k => RAMP_SRC[k].map(hx));
  const lut = new Uint8Array(512*512*4);
  for (let r = 0; r < 64; r++) for (let g = 0; g < 64; g++) for (let b = 0; b < 64; b++) {
    const R = r*4 + 2, G = g*4 + 2, B = b*4 + 2;
    let bd = 1e12, bi = 0, bk = 0;
    for (let i = 0; i < C.length; i++) { const cs = C[i];
      for (let k = 0; k < cs.length; k++) { const q = cs[k], dr = R - q[0], dg = G - q[1], db = B - q[2], dY = dr*0.3 + dg*0.59 + db*0.11;
        const d = dY*dY + ((dr - dY)*(dr - dY) + (db - dY)*(db - dY))*0.55;   /* brightness first, but colour counts too */
        if (d < bd) { bd = d; bi = i; bk = k; } } }
    const cs2 = C[bi]; let pos = bk, best = bd;
    for (const s of [-1, 1]) { const k2 = bk + s; if (k2 < 0 || k2 >= cs2.length) continue;
      const a = cs2[bk], e = cs2[k2], ux = e[0] - a[0], uy = e[1] - a[1], uz = e[2] - a[2], L2 = ux*ux*0.3 + uy*uy*0.59 + uz*uz*0.11; if (L2 <= 0) continue;
      let t = ((R - a[0])*ux*0.3 + (G - a[1])*uy*0.59 + (B - a[2])*uz*0.11)/L2; if (t <= 0) continue; t = Math.min(1, t);
      const px = a[0] + ux*t - R, py = a[1] + uy*t - G, pz = a[2] + uz*t - B, d2 = px*px*0.3 + py*py*0.59 + pz*pz*0.11;
      if (d2 < best) { best = d2; pos = s > 0 ? bk + t : bk - t; } }
    const o = ((r << 12) | (g << 6) | b)*4, fl = Math.floor(pos);
    lut[o] = bi; lut[o + 1] = fl; lut[o + 2] = Math.min(255, Math.round((pos - fl)*255)); lut[o + 3] = cs2.length;
  }
  const NR = C.length, rf = new Uint8Array(16*NR*4);
  for (let ri = 0; ri < NR; ri++) for (let j = 0; j < 16; j++) { const c = C[ri][Math.min(j, C[ri].length - 1)], o = (ri*16 + j)*4; rf[o] = c[0]; rf[o + 1] = c[1]; rf[o + 2] = c[2]; rf[o + 3] = 255; }
  return { lut, rf, NR };
}
/* a colour from a ramp, for painting (t 0..1 along it) */
export function ink(name, t){ const r = RAMP_SRC[name], i = Math.max(0, Math.min(r.length - 1, Math.round(t*(r.length - 1)))); return r[i]; }
export function inkRGB(name, t){ const r = RAMP_SRC[name], f = Math.max(0, Math.min(1, t))*(r.length - 1), i = Math.floor(f), j = Math.min(r.length - 1, i + 1), u = f - i, a = hx(r[i]), b = hx(r[j]); return [a[0] + (b[0] - a[0])*u, a[1] + (b[1] - a[1])*u, a[2] + (b[2] - a[2])*u]; }
