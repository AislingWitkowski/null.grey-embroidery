# null.grey-embroidery (Embroidery, the 3D engine)
## Who and what
This is **null.grey**, Aisling's site: a story-world built as a walkable pixel station. Embroidery is its second engine:
real 3D drawn by the graphics card (WebGL, through three.js), in exactly the same crunchy style as **Seam** (the station
engine in nullgrey-seam / null.grey-furusatostation). Seam stays for rooms and stations; Embroidery is for outdoor and
complex places. The plan is doc 33 (`claude/null-grey-33-embroidery-engine.md`); the build log is doc 50
(`claude/null-grey-50-embroidery-build-sheet.md`), both in nullgrey-lore and the claude.ai project "Null.grey site".

## Working with Aisling
- Plain language, step by step. Blunt, accurate honesty, not overly critical, no flattery.
- **Leave out animal abuse and animal cruelty (Aisling, Nov 21, 2026).** In research, summaries and replies, skip it entirely; it's very difficult and disturbing for her. Only if she very specifically asks for information or opinions on it. The topic can come up (Ukiyo's laws against it, for example), but never details or accounts of the creepy things people do.
- She works on creative and sometimes dark or strange material; that's normal here.
- Her words go in **as she wrote them** (lines, captions, item text). Don't rewrite them.
- If something is a judgment call (taste, lore, layout), do the clear part and ask, or list it for her. Fix plain bugs without asking.
- Things she'll supply herself (scans, sounds, item ideas): don't invent them. Leave a stand-in and note it as pending.

## Rules every change keeps
- **Which engine where (Aisling, Nov 19).** **Seam:** the hub, the main website, and the train rides out and back. **Embroidery:** every station out in the world, by default, unless she says otherwise. Further places may get a new engine (undecided). Everything the player carries keeps **one id, one set of words and one save** (Seam's, the masters); each engine only has its own *look* for it (Embroidery's: `seam/shim-post.js`, "EMBROIDERY'S LOOK"). Never rename an item's id (`node t/ids.js` in null.grey-embroidery checks the things list).
- **No blue.** Blue is reserved for Null: the null glyph and lantern, the null.grey tear, and inside Limbo. Nothing else, including blue-ish teal or lavender drifting blue. **Exceptions (Aisling, Nov 14): blue eyes are allowed; and cyan is OK in Silver Globe Society places (their temples and shrines).** **Exception (Aisling, Nov 16): her own art shown in her galleries can keep its blue** ("anything tat goes in my galleries can break the blue rule"). Her art used elsewhere in the world can be colour-shifted instead. **Exception (Aisling, Nov 17): the holograms on the pocket and passport (their Embroidery look) can have a slight blue lustre** ("the holograms can have a slight blue liuister, breaking the rule..making it weird").
- **Sensory-friendly.** Nothing flashes or strobes. Anything that blinks or changes is soft and slower than 3 times a second.
- **The portal is the home button, on every page (Aisling, Nov 20).** The stepping-disc portal (the dark, purple, animated flame ring; doc 06 §1.10) goes on every page as the way home: the hub, Furusato, every stop, Embroidery's places, the blog, everything new. "that's our home button and its important … we need to push that we always use it." The master is `nullgrey-seam/src/e-portal.js`; pages outside Seam use the standalone copy (`null.grey-embroidery/tools/portal.js`, `transmissions/blog/parts/portal.js` in nullgrey-lore). Never swap it for a plain icon.
- **Accessible, in every place (Aisling, Nov 16).** "we build with accessibility from now on, not a major thing just a small thing each place even if it's strange." Every place gets at least one small way in for wheelchair users and people with canes (a lift, a ramp, a stair-lift…), and it can be strange. Disability exists in Ukiyo: canes and wheelchairs are in the crowds. **Captions (CC) for every sound** (Aisling, Nov 16: "Cc important"). **Exception, on purpose:** some places will be purposely uncomfortable or wrong, "for story reasons not insensitive ones" — they serve Aisling's story or Null's. Those are her call.
- **No way onto active train tracks, and no way to come to harm on purpose (Aisling, Nov 17).** "for safety, can you make it impossible to get on train tracks everywhere..? … suiicide is impossible in null grey i think unless i specify". Where trains run, the track is never walkable. Pushing against it gives **the void line**, her words: *you just can't go here, you feel the call of the void but can't truly follow it.* (`VOID_LINE`; Seam `d1-jobs.js`, Embroidery `src/ui.js`). **Other dangerous places get the same line when she says so** ("there will be parts that feel dangerous in different areas, i will tell you to repeat this line probably"). **Tracks with no trains may be walkable** (she walked tracks a lot growing up): her call, place by place.
- **No real brands or real people's names on things.** Rename them (UMEN, DANCE DANCE DEVOTION, TAIKO MATSURI, MAIN STREET COURIER, Smile Soda …).
  - **Exception, Aisling's rule:** things from before 2002 stay as real as possible, because null.grey's strange event happens in 2002, so the world matched ours until then. Old, unowned names stay real: Mozart, Гематоген, Кис-Кис, Столичные, Алёнка, KISS, konpeito … A trademark that is still owned keeps its shape, colours and era, with its name one step off (Nekko wafers, パチパチ …). People's and characters' faces are never real: they're drawn as our own, and on printed things they're static.
- **Wren is protected (Aisling, Nov 14).** He's a child: he can't appear in most places at all — only through his drawings, maps and rocks, wren birds, things like that. References to motherhood and pregnancy are fine, but nothing too personal or identifying.
- **Captions and signs:** all lowercase in captions. Japanese first, English under it (or `日本語 · english` on one line).
- **Don't commit third-party reference photos.** Describe them in the docs instead. Her own scans and photos are fine.
- **The hidden key phrase is never written in any file.** Only its salted fingerprint is.
- **Look boards, always (Aisling, Nov 26).** *"we should make it a … project rule to build these always for future builds or update them as we go.. to help us build"*. Every place, and every board she sends, gets a **look board** in `null.grey-moodboards` (`<place>/vibe-boards/` or the board's folder): one section per idea with its pins, what it looks like, where it goes and how to build it (Seam / Embroidery), plus questions for her. Make it as HTML (`/home/claude/scripts/vibe.py`), a PDF for her phone (`vibepdf.py`) and the spec (`boards.json`, which is also the small version for Claude to read). **Read the place's look boards before building it, and update them as decisions land.**

## Embroidery's own rules (doc 33)
- **Not a copy of anything (Aisling, Nov 18: "we DO NOT want to copy silent hill").** The reference games are for how smooth it runs and how light and fog feel, never for their look, places or things. The fog colour, the inks, the ash, the places and the story are null.grey's own.
- **Not the clichés (Aisling, Nov 25).** Liminal spaces, the Russian doomer/zoomer look and the cyber/Lain look are in her DNA, but their current clichés are overdone and would date the game. Build from Ohio and her own memory first; those aesthetics stay a light seasoning. Example: Aldridge's pool (1989 Shire) must in no way resemble the typical liminal-pool game (doc 33, Nov 25).
- **Real but unreal (Aisling, Nov 18):** as real as it can get ("like its a real place"), with a fine static of single screen pixels over it, barely there (`fine` in `src/looks.js`): "hyper real, but barely noticeable … real but unreal".
- **The realism rule, for every object (Aisling, Nov 20).** Things are real like the key in a survival-horror inventory: real shape and material, lit from the upper left, Missing Mile's haze, a very slight pixel ("photo real with pixel slightly"), the dark side a soft grey, never black ("i dont like the blackness"). Same object design and words as Seam, never cartoon or outlined. **Her own photos and scans stay exactly as they are** ("anything that is photo we can just keep the same because that IS real"), and what's drawn is matched to them. **How worn a thing is depends on where it comes from** ("some objects will be dirty, hazy dreamy weird and maybe dark depending where they come from..but furu items are cleaner cause what they are"): Furusato's shop goods are new; Missing Mile's things are weathered; other places as fits them. (`egReal`/`egWear` in `seam/shim-post.js`; `realCanvas(cv, {wear})` in `src/real.js`.) **Printed faces** are a glitched photo, not a censor ("more like a glitched photo..where the names stay clear"); where a face isn't needed, the thing can show something else (the cartons show their fruit).
- **Smooth before pretty.** Choppiness is the one thing Aisling notices. If a detail costs frames, it goes.
- **Priority:** 1. lighting · 2. mood and atmosphere · 3. shapes and fun · 4. detail (least). Fog and effects fake what detail can't.
- **Mostly overcast and dark** (Ukiyo's weather). Very few sunny places.
- **First person only.** Small, locked-down places; edges hidden by corn, fences, ditches, fog, with an invisible stop.
- **Smooth, close to real, a tiny crunch (Aisling, Nov 17):** Seam is the pixel world; Embroidery goes as close as it can
  to the smoothness of a PS3 game while running smooth (not their look: see above). Up to about 1080p, each drawn pixel at most 1.25 screen pixels (Nov 17, later: "turn it up close to ps3"). The
  station's inks (`src/inks.js`, copied from `null.grey-furusatostation/src/a-head.html` RAMP_SRC; the master lives
  there) still grade every pixel's colour, mixed with the smooth picture (each look's `ink` amount), with a trace of
  Seam's 4×4 dither. Keep the colours, fog, ash and snow (the flakes are small, thin, darker ash).

## How a round goes
0. **Before building a place** (Aisling, Nov 17: "it would be helpful if you read all my like, umm things i like in my
   documents and such each place we build, also like all the coduments and such..its helps build each place"): read the
   docs about that place and its lore (doc 00 lists them; e.g. doc 32 for the Furusato line's stops, doc 38 for every
   stop, doc 24 for Limbo), and the things she loves: doc 33's look loves and references, doc 50's reference notes,
   doc 13's watch-list. Build from those.
   **Every place gets its own notebook questions (Aisling, Nov 25: "please remind as we build to have specific questions, always optional").** When the player leaves a place, the notebook asks three gentle questions: two from the shared pool, one that place's own (doc 48, "Three questions after each place"). Only about what they saw and felt: no decisions, no judging. Always optional. Write the place's own questions with the place and list them for Aisling to change.
1. Pull first in every repo you'll touch.
2. Make the change. Build: `npm install` once, then `bash build.sh` → `dist/missing-mile-station.html` (one self-contained page).
3. Test with pictures: `node t/shots.js '[[x,z,yawDeg,pitch,look],...]' /tmp/p_` (look 1 = Missing Mile's own (soft + 2% grit + 2% glow, a hair darker), 2–4 = soft, grit, glow, 5 = side by side; x east,
   z south, as Seam's map cells). `node t/walk.js` checks walking and collisions. `python3 t/bluescan.py /tmp/p_` checks for blue.
   **`node t/text.js` every round (Aisling, Nov 18):** every word on screen (captions, CC, pocket, close-ups, buttons) and
   every word painted on things (canvas pictures, Seam's FPIC pictures), at computer, tablet and phone sizes: off the
   screen, cut off, overlapping, too faint (captions and CC 4.5:1), runs off its picture. It must end with no MUST FIX.
   True exceptions go in `t/text-allow.json`, each with its reason. **Phones:** as much as can possibly work on a phone
   does (Aisling: "we will do as much as possible everything we can in phones"); only what truly can't goes on a
   short "computer or tablet only" list she sees. **CC for every sound, minimal** (only what a deaf player needs to
   know), with room kept for it: the caption and the CC line stack (`#subs`), never on top of each other.
4. Log it in doc 50 (nullgrey-lore `claude/`, copy in `docs/`, and the project).
5. Commit and push every repo you touched (plain-language messages, with the session's attribution lines).
6. Send Aisling the built page and pictures. Always send `dist/missing-mile-station.html` itself, on its own, so she can open it straight in a browser (Aisling, Nov 18), as well as any zip of the linked pages.

## Layout
- `src/inks.js` the ramps and the ink tables · `src/look.js` the ink pass (glow, film roll-off, grain, ramps, dither)
- `src/paint.js` textures painted in code · `src/kit.js` reusable pieces (boxes in world metres, lathe, wires, grass/corn with wind)
- `src/player.js` walking, running, crouching, jumping, collisions; keys, mouse, touch, gamepad
- `src/station.js` F03 Missing Mile's station · `src/station2.js` everything else the Seam version has (trees, windmill, crossbuck, mileage signs, mailbox, cut pole, road lamps, tunnel, shed sign, tobacco window, pole tags; ground clicks) · `src/train.js` the Furusato line's train: it comes and goes, its doors, getting on, choosing a stop on its line map, riding into the tunnel and on to the next page, arriving by train (`node t/train.js` runs all of it; `t/train-shots.js` takes pictures of it in any state) · `src/looks.js` the looks · `src/main.js` the page
- `src/ui.js` captions and the sound/CC switches (Seam's look) · `src/sound.js` 3D sound and its slots (`sounds/`)
- `src/f03-says.js` the click lines, copied word for word by `tools/copy-says.py` from the Seam version
- **The bridge to Seam (`seam/`, `tools/seam-shared.py`):** Seam's own pocket (and its pictures, food and drink, sounds)
  runs in the page as it is, copied at build time from `../null.grey-furusatostation` (the masters stay there; the last
  copy is `src/seam-shared.txt`). `seam/files.txt` lists the files; `seam/shim-pre.js` / `shim-post.js` stand in for
  Seam's engine and hand Embroidery `EG_SEAM` (pocket open/close/put, step, sound; `EG_SEAM.ride`: the line map, the ride's words, where each stop goes, and going to another page, all Seam's own). Same saved pocket as every Seam page. The page says it is `f03` (Seam's `f03/f03-0-page.js`), so arriving by train works as on Seam's Missing Mile.
