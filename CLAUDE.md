# null.grey-embroidery (Embroidery, the 3D engine)
## Who and what
This is **null.grey**, Aisling's site: a story-world built as a walkable pixel station. Embroidery is its second engine:
real 3D drawn by the graphics card (WebGL, through three.js), in exactly the same crunchy style as **Seam** (the station
engine in nullgrey-seam / null.grey-furusatostation). Seam stays for rooms and stations; Embroidery is for outdoor and
complex places. The plan is doc 33 (`claude/null-grey-33-embroidery-engine.md`); the build log is doc 50
(`claude/null-grey-50-embroidery-build-sheet.md`), both in nullgrey-lore and the claude.ai project "Null.grey site".

## Working with Aisling
- Plain language, step by step. Blunt, accurate honesty, not overly critical, no flattery.
- She works on creative and sometimes dark or strange material; that's normal here.
- Her words go in **as she wrote them** (lines, captions, item text). Don't rewrite them.
- If something is a judgment call (taste, lore, layout), do the clear part and ask, or list it for her. Fix plain bugs without asking.
- Things she'll supply herself (scans, sounds, item ideas): don't invent them. Leave a stand-in and note it as pending.

## Rules every change keeps
- **No blue.** Blue is reserved for Null: the null glyph and lantern, the null.grey tear, and inside Limbo. Nothing else, including blue-ish teal or lavender drifting blue. **Exceptions (Aisling, Nov 14): blue eyes are allowed; and cyan is OK in Silver Globe Society places (their temples and shrines).** **Exception (Aisling, Nov 16): her own art shown in her galleries can keep its blue** ("anything tat goes in my galleries can break the blue rule"). Her art used elsewhere in the world can be colour-shifted instead.
- **Sensory-friendly.** Nothing flashes or strobes. Anything that blinks or changes is soft and slower than 3 times a second.
- **Accessible, in every place (Aisling, Nov 16).** "we build with accessibility from now on, not a major thing just a small thing each place even if it's strange." Every place gets at least one small way in for wheelchair users and people with canes (a lift, a ramp, a stair-lift…), and it can be strange. Disability exists in Ukiyo: canes and wheelchairs are in the crowds. **Captions (CC) for every sound** (Aisling, Nov 16: "Cc important"). **Exception, on purpose:** some places will be purposely uncomfortable or wrong, "for story reasons not insensitive ones" — they serve Aisling's story or Null's. Those are her call.
- **No real brands or real people's names on things.** Rename them (UMEN, DANCE DANCE DEVOTION, TAIKO MATSURI, MAIN STREET COURIER, Smile Soda …).
  - **Exception, Aisling's rule:** things from before 2002 stay as real as possible, because null.grey's strange event happens in 2002, so the world matched ours until then. Old, unowned names stay real: Mozart, Гематоген, Кис-Кис, Столичные, Алёнка, KISS, konpeito … A trademark that is still owned keeps its shape, colours and era, with its name one step off (Nekko wafers, パチパチ …). People's and characters' faces are never real: they're drawn as our own, and on printed things they're static.
- **Wren is protected (Aisling, Nov 14).** He's a child: he can't appear in most places at all — only through his drawings, maps and rocks, wren birds, things like that. References to motherhood and pregnancy are fine, but nothing too personal or identifying.
- **Captions and signs:** all lowercase in captions. Japanese first, English under it (or `日本語 · english` on one line).
- **Don't commit third-party reference photos.** Describe them in the docs instead. Her own scans and photos are fine.
- **The hidden key phrase is never written in any file.** Only its salted fingerprint is.

## Embroidery's own rules (doc 33)
- **Smooth before pretty.** Choppiness is the one thing Aisling notices. If a detail costs frames, it goes.
- **Priority:** 1. lighting · 2. mood and atmosphere · 3. shapes and fun · 4. detail (least). Fog and effects fake what detail can't.
- **Mostly overcast and dark** (Ukiyo's weather). Very few sunny places.
- **First person only.** Small, locked-down places; edges hidden by corn, fences, ditches, fog, with an invisible stop.
- **Smooth, close to real, a tiny crunch (Aisling, Nov 17):** Seam is the pixel world; Embroidery goes as close as it can
  to PS3 Silent Hill 3 / Folklore while running smooth. Up to about 1080p, each drawn pixel at most 1.25 screen pixels (Nov 17, later: "turn it up close to ps3"). The
  station's inks (`src/inks.js`, copied from `null.grey-furusatostation/src/a-head.html` RAMP_SRC; the master lives
  there) still grade every pixel's colour, mixed with the smooth picture (each look's `ink` amount), with a trace of
  Seam's 4×4 dither. Keep the colours, fog, ash and snow (the flakes are small, thin, darker ash).

## How a round goes
0. **Before building a place** (Aisling, Nov 17: "it would be helpful if you read all my like, umm things i like in my
   documents and such each place we build, also like all the coduments and such..its helps build each place"): read the
   docs about that place and its lore (doc 00 lists them; e.g. doc 32 for the Furusato line's stops, doc 38 for every
   stop, doc 24 for Limbo), and the things she loves: doc 33's look loves and references, doc 50's reference notes,
   doc 13's watch-list. Build from those.
1. Pull first in every repo you'll touch.
2. Make the change. Build: `npm install` once, then `bash build.sh` → `dist/missing-mile-station.html` (one self-contained page).
3. Test with pictures: `node t/shots.js '[[x,z,yawDeg,pitch,look],...]' /tmp/p_` (look 1 = Missing Mile's own (soft + 2% grit + 2% glow, a hair darker), 2–4 = soft, grit, glow, 5 = side by side; x east,
   z south, as Seam's map cells). `node t/walk.js` checks walking and collisions. `python3 t/bluescan.py /tmp/p_` checks for blue.
4. Log it in doc 50 (nullgrey-lore `claude/`, copy in `docs/`, and the project).
5. Commit and push every repo you touched (plain-language messages, with the session's attribution lines).
6. Send Aisling the built page and pictures.

## Layout
- `src/inks.js` the ramps and the ink tables · `src/look.js` the ink pass (glow, film roll-off, grain, ramps, dither)
- `src/paint.js` textures painted in code · `src/kit.js` reusable pieces (boxes in world metres, lathe, wires, grass/corn with wind)
- `src/player.js` walking, running, crouching, jumping, collisions; keys, mouse, touch, gamepad
- `src/station.js` F03 Missing Mile's station · `src/looks.js` the three looks · `src/main.js` the page
