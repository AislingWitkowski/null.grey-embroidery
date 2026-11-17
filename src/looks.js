/* ================================================================
   EMBROIDERY · three looks for the same station, to pick from (milestone 1, Nov 17). same inks, same place, same
   lamps; what changes is the light, the fog, the glow and the grain. all mostly overcast and dark (Ukiyo's weather:
   "most places are overcast and darker"). colours are picture values (0–1), before the ink pass.
   (Nov 17, later: Aisling — Embroidery goes smooth, close to PS3 Silent Hill 3 / Folklore with only a tiny crunch;
   Seam stays the pixel world. res is now the most rows drawn (about 720p), each drawn pixel at most 2 screen pixels;
   ink is how much of the station's ink snap and dither stays mixed in — the rest is the smooth picture.)
   - soft:  Silent Hill 1's colours and softness. warm grey fog, gentle light, low contrast.
   - grit:  Silent Hill 3's grit. darker, heavier fog, harder contrast, more grain, a dirty lens.
   - glow:  Folklore / Haunting Ground. lamps that bloom in the fog, gothic but neat.
   ================================================================ */
export const LOOKS = [
  { label:'soft', say:'soft · silent hill 1’s colours and softness',
    res:1080, ink:0.3, fog:[0.43, 0.38, 0.36], fogNear:3, fogFar:18, skyTop:[0.27, 0.22, 0.23], skyWest:[0.55, 0.42, 0.33],
    hemi:0.85, west:0.25, bulb:7, lamp:26, vend:0.9, halo:0.55, shaft:0.05, shadowSoft:5,
    exposure:1.25, glow:0.7, glowThr:0.5, glowWide:1.2, grain:7, contrast:0.9, vignette:0.25, warm:[1.04, 1.0, 0.95], grime:0, dither:1 },
  { label:'grit', say:'grit · silent hill 3’s grit, darker and dirtier',
    res:1000, ink:0.36, fog:[0.27, 0.23, 0.22], fogNear:2.2, fogFar:15, skyTop:[0.13, 0.1, 0.1], skyWest:[0.33, 0.23, 0.18],
    hemi:0.45, west:0.12, bulb:8, lamp:30, vend:1.0, halo:0.35, shaft:0.035, shadowSoft:2,
    exposure:1.15, glow:0.45, glowThr:0.65, glowWide:1, grain:18, contrast:1.18, vignette:0.55, warm:[1.05, 0.98, 0.92], grime:0.18, dither:1 },
  { label:'glow', say:'glow · folklore and haunting ground, the lamps bloom',
    res:1080, ink:0.25, fog:[0.36, 0.3, 0.31], fogNear:3.5, fogFar:19, skyTop:[0.2, 0.15, 0.17], skyWest:[0.5, 0.36, 0.3],
    hemi:0.65, west:0.18, bulb:9, lamp:32, vend:1.2, halo:0.9, shaft:0.08, shadowSoft:4,
    exposure:1.2, glow:1.7, glowThr:0.38, glowWide:2.2, grain:8, contrast:1.02, vignette:0.38, warm:[1.06, 0.98, 0.94], grime:0, dither:1 },
];
