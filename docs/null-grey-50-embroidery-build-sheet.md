# null.grey · 50 · Embroidery build sheet

The build log for **Embroidery**, the 3D engine (plan: doc 33). Code: the private repo **`null.grey-embroidery`**. Its
`CLAUDE.md` says how a round goes. Built page: `dist/missing-mile-station.html` (one self-contained file).

## How it's made (short)
- **three.js** does the 3D (WebGL), bundled into the one page; the scene is drawn at low resolution (216–270 pixels tall).
- **The ink pass** (`src/look.js`): a soft glow off bright things, a filmic roll-off (lights fade instead of clipping),
  grain at 12 frames a second (old film speed, and calmer), then every pixel matched to the station's ramps and dithered
  4×4 with Seam's Bayer pattern. The ramps are copied unchanged from `null.grey-furusatostation/src/a-head.html`, only
  the ones this place uses; none lean blue.
- **Textures are painted in code** (`src/paint.js`), from the same inks, with Seam's noise (hsh, vn, fbm). The station's
  pictures (facade, doors, papered windows, scalloped fascia) are Seam's painting functions carried over.
- **Light:** each canopy bulb is a spot light under its tin shade, and every lamp casts shadows. Nothing in the place
  moves, so shadows are drawn once, which keeps them free per frame. Bulbs and lamps have a soft halo in the fog; the
  street lamp has a faint cone of light falling through the fog.
- **Grass, weeds and corn** are real clumps of crossed cards (thousands, drawn together), split into tiles so only
  what's in view is drawn. They take the ground's light, and bend in the wind: mostly still, a slow gust every so often.
- **You:** walk, run (shift), crouch (c), jump (space); collisions with the ground (slopes, ditches, the track's drop)
  and with solid things. Touch: hold to walk, hold low to step back, drag to look, a second finger tapped to jump, plus
  jump and crouch buttons. Gamepad: sticks, A jump, B crouch, L3 run.
- **Smooth before pretty:** if frames run long, the resolution steps down by itself (to 60%) and back up when there's room.

### Nov 17, 2026 — milestone 1: the walkable test (Missing Mile's station)
**Built:** the station from the Seam version, same layout, shapes and colours: the platform (concrete, the coping, the
worn tactile strip), the track (ballast, sleepers, rails), the five rust-red iron columns with curved wooden brackets,
the beam, the scalloped fascia with its holes, the canopy's boards, five bulbs in tin shades (two of them struggle:
they dim and come back slowly, never a flicker), the hanging sign lit from inside, the station building (stucco over
brick, the shut sage doors with iron straps, the windows papered over, one pane broken) with a real gabled tin roof,
the bench and three bits of blank aged paper where the poster, line map and timetable go, the corner shed and its
awning, the payphone, the bin, the jerry can, the drinks machine with its lit display, the name board ほんまち in its
rusted frame, the street lamp, the telephone poles along the line and down the road with sagging wires, the road
south (old asphalt, a faded double yellow) through the fields with ditches either side, the dead-grass fields, and
corn all round the edges. You can't leave: the corn and the fog hide an invisible stop.
- **Accessible:** the road leaves the platform as a long gentle slope, no step.
- **Three looks to choose from** (keys 1 2 3, or the buttons top right; 4 shows all three side by side, same view):
  - **soft**: Silent Hill 1's colours and softness. Warm grey fog, gentle light, low contrast.
  - **grit**: Silent Hill 3's grit. Darker, thicker fog, harder contrast, more grain, a dirty lens.
  - **glow**: Folklore / Haunting Ground. The lamps bloom in the fog; gothic but neat.
- **Tested:** pictures from the east end, under the canopy, from the field and from the track, in all three looks and
  on an upright phone; walking checks (the wall stops you, the ramp takes you down, you can drop onto the track and
  jump back up, the corn stops you); no page errors; no blue anywhere.
- **Not checked yet:** the real frame rate. The test machine has no graphics card, so speed has to be seen on
  Aisling's Mac and phone (press **f** to show it).

**Aisling to decide:** which look (or a mix: e.g. grit's darkness with glow's lamps).
**Pending, hers:** her words for anything new (no lines were invented; the one caption on arrival is the Seam version's).
**Next (milestone 2, doc 33):** the shared layer: the pocket, captions on clicks, the close-ups (drinks machine,
payphone, posters), sounds with captions, travel by train to and from the Seam pages. Then the kit (trees in four
autumn phases, the windmill, mailbox, mileage signs, crossing) and the rest of Missing Mile.
**Repo:** this session couldn't create GitHub repos, so Aisling made the empty private repo `null.grey-embroidery`
and the work was pushed there (it sat on the branch `backup/embroidery-m1` in nullgrey-lore meanwhile; that branch is
now just an old copy, which Aisling can delete on GitHub).

### Nov 17, 2026 — fix: gamepads forbidden
Aisling opened the page and got *"Uncaught SecurityError: Failed to execute 'getGamepads' on 'Navigator': Access to
the feature "gamepad" is disallowed by permissions policy."* Inside a preview or an embedded frame the browser can
forbid gamepads outright, and asking for them throws an error instead of returning nothing; that stopped the page.
Now the error is caught once and gamepads are just off on that page. Checked with `t/gamepad-blocked.js` (the page
loaded with gamepads forbidden: no errors, walking works).

### Nov 17, 2026 — more detail, more real (Folklore), from Aisling's reference pictures
Aisling: *"the vibe is yes, everythign good, but can we get a bit more details? … a little more realistic looking? whle keeping crunch more like um folklore for ps3? but the vibes and colors and drawdistance and style iks great"*. Same look, same fog and colours; what changed is how much is there and how it catches the light.
- **Surfaces catch the light:** every painted texture now has a relief (normal maps made from the painting), so bricks, boards, tin ribs, cracks and ballast catch the lamps from the side. Damp concrete, wet asphalt and puddles are smooth and shine where light falls. Textures have twice the pixels, with hairline cracks and salt bloom in the stucco, rust running down from nails and door straps, grain and splits in the wood.
- **More shapes:** frames round the doors, sills and lintels at the windows, a stone step at each back door, a chain and padlock across the front doors, eaves and barge boards, a rusted gutter and two downpipes, rafters under the canopy, a junction box with its conduit, real rail profiles on tie plates, the platform coping's lip over the track.
- **From her pictures:** busier wires (glass insulators, a transformer can on two poles, more lines at different sags, service drops to the shed and the building, a guy wire with a yellow-and-black striped guard, a meter box on the shed); fallen leaves blown against the walls and along the road; tree shapes standing in the far fog, layer behind layer; dust and ash drifting slowly down through the air, glowing faintly near the lamps.
- **Atmosphere:** the fog drifts very slowly and pools low near the ground; the ground darkens where things stand on it.
- **A notch sharper:** soft 270, grit 240, glow 300 pixels tall (from 240, 216, 270). Bulb shadows are finer. The page still steps its resolution down by itself if frames run long.
- **Her reference pictures** (described, not kept): a snowy Hokkaido-style back street in sepia under a grey sky (poles, tangled wires, striped pole guards, wall meter boxes, snow banks); Folklore's purple-grey forest (ferns, barked trees, fog in layers); Rule of Rose (a wainscoted corridor lit from windows, a plank walkway with crates under one bare bulb, a dirt path with fallen leaves, a bench and a broken fence); Silent Hill 3's tiled washroom; a tangled-wire overcast street in anime; a night alley with a blooming street lamp; a foggy gatehouse with lamp posts and firs (Syberia-like). Then Bloodborne: glowing translucent ghosts trailing wisps, the Doll, Amelia, a veiled bride among candles and cobwebs, a great eyed flesh-mass, and Silent Hill 1's rooftop with flakes hanging in purple fog. Their light and mood are the point, not their colours (no blue: the inks stay).
- **For later (not built):** the ghostly glowing figures and creatures belong with the "later" list in doc 33 (light combat, creatures); real trees with bark (Missing Mile's four trees) come with the kit (milestone 3).
- **Checked:** pictures in all three looks, before and after; walking checks; no blue; no errors with gamepads forbidden.

### Nov 17, 2026 — Bloodborne: for the surreal places
Aisling, on her Bloodborne pictures: *"so mostly like colors and weirdness of bloodborne..and like vibes and like atmosphere not one to one..bu like lightiing feel and effectgs from blood borne some of detaiuls and such because theey have diffferent like umm types of places...but limbo and such leans in this direction more and the more surreal stuff leans this way more than missing mile"*
- So: Bloodborne's **colours, weirdness, lighting feel and effects** (glowing translucent figures trailing wisps, candlelit gloom, cobwebs, the great eyed flesh) are a direction for **Limbo and the more surreal places**, not one-to-one, and much less for Missing Mile. Missing Mile stays the country station in Silent Hill / Folklore fog.
- (No blue still applies outside Null's places; inside Limbo blue is allowed, doc 24.)
- Aisling, straight after: *"but our colors are more dull i know this"* — our inks stay duller than Bloodborne's; take its feel, not its saturation.

### Nov 17, 2026 — smooth: close to PS3, a tiny crunch
Aisling asked for Embroidery to lose most of the pixel and go as close to real as it can while running smooth (her words are in doc 33). Colours, fog, ash and atmosphere stay.
- **Resolution:** drawn at up to about 720 rows (soft 660, grit 600, glow 720), each drawn pixel at most 2 screen pixels: that 2-pixel step is the tiny crunch. On a Mac with a Retina screen that's the full 720. If frames run long, it now steps down as far as 45%.
- **The inks:** they now grade the colour instead of replacing it. Each pixel takes its ink's colour at the smooth picture's own brightness (no banding, no dot pattern), and only a trace of the snapped, dithered ink stays mixed in (soft 35%, grit 42%, glow 30% of the grade). Film grain stays.
- **Textures** are smooth up close (filtered, not blocky), sharper at angles, and the building's are finer again. Grass and corn are drawn three and two times finer, with more, thinner blades.
- **Glow** is worked out at an eighth of the size and spread smooth (the first try at high resolution left a grid of dots round the bulbs; fixed). Dust motes are soft and round and sized to the screen. The street lamp's shadows are finer. Telephone and lamp poles are round now.
- **Tests:** the test machine has no graphics card, so pictures are now taken as still frames (`pause`/`renderOnce` hooks) at Retina size. Real speed still has to be seen on her Mac and phone (press **f**).
- **Checked:** pictures in all three looks at four spots; no blue; walking checks; no errors with gamepads forbidden.

### Nov 17, 2026 — smoother, real flakes, close-up grain
Aisling: *"ok runs smooth we can go smoother, and more like, flake like with snow, more realistic? better textures?"* (It runs smooth on her machine.)
- **Smoother:** up to 900 / 840 / 960 rows (soft / grit / glow), each drawn pixel at most 1.5 screen pixels (was 2). On a Retina Mac that's about 960p. Less of the ink snap stays mixed in (soft 30%, grit 36%, glow 25%). Still steps down by itself if frames run long.
- **Flakes:** the dust became pale flakes drifting down through the fog around you (2,600 of them, in a box that travels with you, so some are always close and the far ones fade into the fog). Each its own size, falling slowly, swaying, pushed a little by the gusts, turning so it catches the light now and then (a slow swell, never a flash), warmer and brighter near the lamps. *Missing Mile is autumn in doc 32; whether these read as early snow or ash is Aisling's call.*
- **Better textures:** every solid surface now gets a shared close-up grain (grit, scuffs, small stains, hairline scratches) laid on from three sides at its true place in the world, at two sizes, so walls, ground, wood and metal have texture up close without bigger pictures; it also roughens or smooths the shine a little. Grass, corn and leaves don't take it.
- **Checked:** pictures in all three looks; no blue; no errors with gamepads forbidden.
- **Still rough, honestly:** the grass and corn still read as painted cards up close; real-looking plants and trees come with the kit (milestone 3).

### Nov 17, 2026 — the flakes become a little ash; up toward PS3
Aisling: *"thinner smaller a tad darker, more like small ash...falkier...go ahead turn it up close to ps3?"* then *"oh and very slow drifty not much very few"*.
- **The flakes are ash now:** only a few (about 520 round you), small and thin, a little darker than the fog, each with its own ragged edge. They drift very slowly and tumble slowly, so each goes from a sliver to a flake and back (never a flash). A little warmer near the lamps.
- **Closer to PS3:** up to about 1080 rows (soft and glow; grit 1000), each drawn pixel at most 1.25 screen pixels: only a hint of crunch.
- Aisling: *"but this place looks great"*.
- **New working rule** (Aisling): *"it would be helpful if you read all my like, umm things i like in my documents and such each place we build, also like all the coduments and such..its helps build each place"*. So before each place: its own docs and lore, plus her look loves and reference notes (docs 33, 50, 13). Written into the repo's CLAUDE.md as step 0.

### Nov 17, 2026 — Missing Mile's own look
Aisling: *"ok so i like soft..but can we add like 2% grit and like 2% glow and make it just like 1% darker? is this possible by darker like pump the contrast like a slight bit??"*
- **Built:** a fourth look, **missing mile**: every setting is 96% soft, 2% grit, 2% glow, then contrast up 4% and exposure down 1% (a hair darker). It's the default and key **1**; soft, grit and glow are keys 2–4, side by side is 5. The difference from soft is small on purpose (a touch darker, a touch more glow round the lamps).
- Aisling, earlier: *"ok so this is like the "baase level" correct this is before all the details and such"*. Yes: still to come are the Seam version's things and clickables, milestone 2's shared layer, and the kit's trees and better plants.
- Then Aisling: *"ok i think maybe like 3% more of same things?"* So now: 90% soft, 5% grit, 5% glow, contrast up 7%, exposure down 3%.

### Nov 17, 2026 — the platform greyed
Aisling: *"the pavement is a little too umm "italy" on the landing of the station like too orange, otherwise yes this is perfect! the mix is good"*.
- The platform's concrete is painted in the station's neutral grey ink now (was the warm grey), so it reads as plain grey concrete and only the bulbs warm it. Nothing else changed.
- Aisling asked: *"will thinhgs be more 3-d and more build and more actual shadows and such? when we build more?"* Yes: the kit (milestone 3) brings real 3D trees, plants, fences and props, and every new thing casts shadows from the lamps. A soft corner-darkening (ambient occlusion) can be added if frames allow.
- **For the detail passes** (Aisling: *"the like holes ont he building with the breick..they look too..umm smooth and stuff not very natural and stuff we need work on making all that look real in the detail poasses!"*): the patches where the stucco has fallen off show smooth, rounded outlines. To do: ragged, chipped edges; the stucco standing proud of the brick with a broken lip and its own shadow; bricks of different colours, some cracked or missing; mortar sunk back; crumbs at the foot of the wall. Same care for every worn surface in the detail passes.

### Nov 17, 2026 — milestone 1 done: the look is locked
Aisling, asked honestly if the look is there: *"yep both look good, we could push it even a tad more if need be both phone and mac look good"*. Tested by her on her **Mac and phone: both run smooth**, with room to spare.
- **Locked:** the look (Missing Mile's mix), the fog, the ash, the lighting, the smooth near-PS3 drawing.
- **Headroom:** there's room for more cost, so next rounds can add ambient occlusion (corners darkening), better plants and real 3D props without dropping frames. Check the frame rate again after each.
- **Weakest parts now** (Claude's honest read, Aisling agreed the look is right): grass and corn as cards; boxy buildings; textures that look "made in code" up close (the stucco holes first); the canopy ceiling close to black; little that moves.
- **Next:** milestone 2 (the shared layer: pocket, captions on clicks, close-ups, sounds, the train) and the kit (milestone 3).

### Nov 17, 2026 — milestone 2, part 1: clicking, captions, sound and CC
Aisling: *"ok go ahead"* (milestone 2 first).
- **Before building:** read Missing Mile's lines and sound plan in the Seam version (f03-road.js, doc 31, cc.js).
- **Clicking things:** a quick click or tap that doesn't drag reaches for the first thing under it, within Seam's reach (3.6 m; the bench 2.6 m), and it says its next line. **Every line is the Seam version's, word for word**, copied by `tools/copy-says.py` from null.grey-furusatostation (the master stays there; run it again if they change). Working: the columns, the bulbs, the hanging sign, the name board, the bench (click again to sit: you sit, the view lowers, moving stands you up), the poster, line map and timetable, the doors, windows, plaque and stucco by where you click, the back of the station, the shed, the payphone, the bin with eyes, the jerry can, the drinks machine, the street lamp, the telephone poles. Checked one by one (`t/clicks.js`).
- **Captions** look exactly like Seam's (the same quiet line at the bottom).
- **Sound and CC switches**, top right like Seam (音 · sound, 字幕 · cc), remembered in the same places in the browser, so a choice made in Seam holds here and the other way round. With CC on and sound off, sounds still run silently so their captions come.
- **3D sound:** louder nearer and from the right direction. Ten new sound slots (doc 31, and `sounds/README.md` in the repo): wind in gusts, the corn rustling from its nearest edge, the bulbs humming each from its own bulb (the weak ones dim with their light), the street lamp's buzz, the wires singing in gusts near the poles, the drinks machine's hum, footsteps on concrete, gravel, asphalt and grass. **All are quiet stand-ins made in code until Aisling supplies files**; dropping a file named after its slot into `sounds/` replaces the stand-in.
- **CC lines** for them (e.g. *[the bulbs hum]*, *[a gust: the corn rustles, the wires sing]*), short and lowercase, each at most every so often.
- The look buttons moved to the top left (the switches took the top right, as in Seam).
- **Still to come in milestone 2:** the pocket (the same one as Seam's, carried between pages), the close-ups (the drinks machine with its four flavours, the payphone, the missing poster), the train in and out to the Seam pages.

### Nov 17, 2026 (evening) — milestone 2, part 2: the pocket
Aisling: *"Go!"* (from bed; she'll check on her Mac later).
- **Seam's own pocket runs in Embroidery, as it is.** Not rebuilt: at build time `tools/seam-shared.py` copies Seam's pocket files from null.grey-furusatostation (the pocket, all 142 kinds of thing and their pictures, the folders, food and drink, its sounds) into the page, with a small bridge (`seam/`) standing in for the parts of Seam's engine they expect. The masters stay in Seam; rebuilding Embroidery picks up any change.
- **The same pocket everywhere:** it reads and writes the same saved pocket as every Seam page, so what you carry in Seam is in your pocket here. (Pages opened from the same site share it; a file opened on its own has its own.)
- Open it with the pocket in the bottom-left corner, or **P**, as in Seam. While it's open, the world waits (nothing is drawn behind it, as in Seam), you can't walk, and the switches and look buttons step aside.
- Its sounds (picking things up, cans, bottles, a bite, a wrapper) are Seam's own and follow Embroidery's sound switch; each gets its CC line from Seam's caption list.
- **Checked:** opens with P, shows its things, closes, walking works after; clicks still work; no errors (`t/pocket.js`, `t/seam-probe.js`).
- **Still to come in milestone 2:** the close-ups (the drinks machine and its four flavours, the payphone, the missing poster) and the train in and out.

### Nov 17, 2026 (evening) — milestone 2, part 3: the close-ups and Seam's own click actions
Aisling: *"Ok go to next?"*
- **Before building:** read Missing Mile's Seam passes (f03-3d … 3d4, f03-details, f03-vend2) for what the station has that Embroidery didn't yet.
- **Seam's close-ups run in Embroidery, as they are** (the same bridge as the pocket; `seam/files.txt`, `seam/vars.txt` list what's copied):
  - **the drinks machine**: the old red Drink Smile machine, its own close-up: chocolate creme, lemon cola, ultra violet, cherry cheer, three of each a visit, the coins, the display counting down, the can dropping, the flap, into your pocket; Platform 1's heavy button sounds.
  - **the clippings** taped to the machine's side (click it from the side): the four yellowed clippings, each on its own when clicked.
  - **the newspaper** left on the bench: LOST & NEVER FOUND, close.
  - **the missing poster** on the road's pole: HAVE YOU SEEN ME?, close.
  - **the dumpster** out back: NO DUMPING · ゴミ捨て禁止; click again to search it.
  - **the pit** on the bench by the newspaper (Aisling's scan): click it and it goes in your pocket; it's gone from the bench after.
- **How:** clicking a thing asks Seam's own click actions first (its `hubBoxAction` chain, the same code the Seam page runs), then falls back to its line. Seam's world-building calls are stood in for (Embroidery draws the world), so its files run without changes. Its pictures (`FPIC`) are Seam's own drawings: Embroidery uses them as textures for the red machine's front and sides, the newspaper, the pit, the dumpster and the missing poster.
- **Caught up with Seam's passes:** the payphone moved to the station's west end (Seam's second pass; it had hidden the tobacco window); the machine is the old red one; the corn cleared round the poster's pole; the walkable edge pushed a little further down the road so the poster can be reached.
- While a close-up or the pocket is open, the world waits behind it.
- **Checked:** every close-up opens and closes; the dumpster's search; the pit goes to the pocket; all clicks still answer (`t/closeups.js`, `t/clicks.js`, `t/seam-closeups.js`); the pocket; no errors.
- **Still not carried over from the Seam version** (for the kit / the rest of Missing Mile): the four trees, the windmill and its words, the crossing and crossbuck, the mileage signs, the mailbox, the cut pole, the tunnel and its lights, the shed's sign and tobacco window, the station's other pictures (the name board and hanging sign are redrawn, not Seam's), and the train.
- **Next in milestone 2:** the train in and out.

### Nov 17, 2026 (evening, later) — the sweep: everything else from the Seam version, moved over
Aisling: *"Ok we will move all those over then we will update them all to embroodygraphics :)"*, then *"Oh aww nd all the little things too like the seed in the bench please do a sweep and make sure we don't miss anything!"*
- **How the sweep was done:** every clickable thing in the Seam version (every `say` in `src/f03/`) and every Seam picture (`fpic`) was listed and checked against Embroidery. What was missing is now in `src/station2.js`, each in its Seam place, built the way Seam's last pass built it. This is the **moving-over** pass; the **Embroidery-graphics** pass on each of them comes next.
- **New in the world:**
  - **the four trees**, four times of autumn: the gold one by the crossbuck, the rust-and-red one off the platform's west end, the half-bare one out in the east field, the nearly bare one behind the station. Each has a leaning, forking trunk, limbs and twigs, leaves in loose bunches (maple, oval, long, wavy-edged; each its own colour, a darker rib, a dried edge), and its fallen leaves on the ground round it, more under the barer trees.
  - **the windmill** far out in the corn, much too tall: the lattice tower, the tank partway up, the still wheel, MAPLES & SONS on its vane. The corn is cleared round its feet.
  - **the crossbuck**: two real boards, RAILROAD and CROSSING, lettered both sides, on a taller post, with the 踏切 plate under them.
  - **the mileage sign**, MISSING MILE 1, and the same sign again further down the road (Seam's own picture, bullet holes and all).
  - **the mailbox** with no house, R.R. 2, its red flag up.
  - **the cut pole** hanging from its own wires, its foot well off the ground: the long crossarm, the braces, the insulators, the short bar at the top, the broken wire curling off the end. It sways a little. The **newer pole** stands beside it, with the transformer can.
  - **old street lamps on three of the road's poles**: one lit, dim and orange; one burnt out; one weak. (They glow but don't light the road yet: a real light costs every surface. A light pool was tried, but the ink grade turned it into a dark patch. This is for the lighting pass.)
  - **the tunnel mouth** east of the platform, where the line goes into the ground: the concrete face, the ring of stones round the arch, the coping, a lip of earth, the corn standing on top. Inside, only dark. **Made big enough for the train to go in** (Seam's is low, about 2 m; this one is about 2.6 m over the track bed). Aisling can say if it should be lower.
  - **on the shed**: FEED · SEED · BAIT, and the tobacco window (its sign, the shut window, the hand-written card behind the glass).
  - **the poles' little tags**, and climbing steps on some.
  - The **guy wire** is on the first road pole now, where Seam has it (it was on the pole that's now the cut one).
  - The ground goes further south (to z 42) and the corn to z 37, so the second mileage sign and the poles going off have something under them.
- **Seam's own pictures on things that were plain:** the poster, the line map and the timetable on the wall; the payphone (PUBLIC TELEPHONE · 公衆電話, the green phone); the bin with eyes (body and hood); the pink jerry can.
- **Clicks, as in Seam's last pass:** the doors, the windows and the station walls use the newer lines (the boards and the chain; the newspaper over the glass); the lamp where the road begins says its own line again (`lamp`, not `streetlamp`). Clicking the ground says the road, the grass or the corn. `tools/copy-says.py` now also copies f03-3d2's lines and the tunnel, windmill and fields lines.
- **Checked:** pictures from ten spots; every new thing clicks and says its Seam line (`t/clicks.js`); walking and collisions (`t/walk.js`); close-ups and the pocket (`t/closeups.js`); no errors; no blue. How heavy it is (`t/info.js`): about +30k triangles and up to +50 draw calls from the busiest spots. That should be fine, but Aisling should check smoothness on the Mac.
- **For the Embroidery-graphics pass (next):** the trees don't move in the wind yet; their leaves are flat cards, not yet lit through. The windmill's wheel and vane are cut-out pictures. The tunnel's inside shows its box shape faintly. The road lamps' light. The name board and hanging sign are still Embroidery's redraws (same words as Seam's).
- **Still pending from Aisling:** her sound files.

### Nov 17, 2026 (night) — notes from Aisling, for later
- **Next: the train** (Aisling: making sure it works mechanically is important).
- **The mailbox: "label it 2019"** (Aisling, for later). Whether that's the number on the box or a year: to ask when it's done.
- **MAPLES & SONS** (on the shed's FEED · SEED · BAIT sign and the windmill's vane) was **Claude's made-up name**, from the first Seam build (Oct 25), not Aisling's. She's wondering about a better lore name; it can change later. Doc 38 already links the bait sign to her uncle's or great-uncle's bait shop in Harriman (Uncle's Bait Shop). **Pending, Aisling:** the name. (Later: *"There name is Gooch I think but I can double check"*: the uncle's family is probably **Gooch**, the same as great-grandma Gooch. She'll double-check before it goes on the sign.)

### Nov 17, 2026 (night) — milestone 2, the last part: the train
Aisling: *"I feel making sure the train works is important like mechanically"*, then *"yes go on train"*.
- **Before building:** read Seam's train for the Furusato line (`f8-train.js`, the station's `d22-train.js` under it), its ride (`f9d-ride.js`, `f9g-car-run.js`, `f9c-ride-map.js`, `f9i-arrive-train.js`), doc 21's ride flow, doc 32's Missing Mile notes (the tunnel, the train going on into it), doc 31's train sound slots.
- **The train, real size and in the round** (`src/train.js`): the Furusato line's own train, as Seam dresses it.
  - Four cars, 8.7 m long, three doors a side on each, big windows.
  - The outside: stainless in an odd warm grey-white, ribbed low down; the gold stripe with a seigaiha wave pressed into it, the thin vermilion line under it; the crest (ふ in a ring) on each car.
  - A flat cab face at each end: the black mask round the windscreen, the amber board **各停 ・ ？？ / LOCAL ??**, the vermilion band, the crest, the lamps.
  - Inside: mustard moquette bench seats with a small asanoha pattern, a wooden slatted floor, cream walls, two lines of tube lamps, poles, hanging straps with pale rings, and **Seam's own line map over every door**.
  - It's 1.8 m wide, and **its floor is level with the platform: step-free**, no gap to speak of.
- **How it runs** (Seam's numbers):
  - It comes out of the dusk from the west, headlights first in the fog, a faint beam ahead of it. It brakes along the platform and stops just short of the tunnel mouth.
  - The doors over the platform open (seven of them; the ones past the platform's ends stay shut).
  - After about 24 s: the departure melody (故郷), Seam's warning in the train's own rust caption (*ドアが閉まります。ご注意ください · the doors are closing. please be careful.*), the doors close, and it pulls away east into the tunnel. Its windows stay lit as it goes in, the outside goes dark, the red tail lamps last.
  - First 25–40 s after you arrive, then every 2–3 min. Standing on the track as it comes, it moves you onto the platform's edge.
- **Getting on and riding** (Seam's ride, its words and its line map, through the bridge: `EG_SEAM.ride`):
  - Walk in through an open door: *"inside, it's cool and very clean…"*. **The train waits for you** while you're on, as Seam's ride does.
  - Click the line map over a door and choose your stop. ふるさと goes to Furusato's page; the others go to the stand-in stop (`stop.html`), exactly as a Seam ride ends. Main street says *いまここ · that's here*, F 01 *the train doesn't go back that way*, and the secret last stop can't be chosen.
  - Choose, and the doors close behind you. It pulls out with you standing in it: the platform slides by, then the tunnel. In the dark the world goes; the ride goes on (*i'm the only one on this car... alone again.*, then *つぎは … · next, …*), and the next page opens.
  - Step back off before choosing: *you step back out onto the platform.*, and it goes on without you.
  - Click a seat to sit (*you sit. the seat is soft…*).
- **Arriving by train** (a Seam page's ride ending here): you open your eyes on the platform beside it, with Seam's line (*本町 · main street. you step off. the doors close behind you, and the train goes on without you, into the corn.*). The doors close and it goes into the tunnel.
  - The page now says it is **F03** (Seam's `f03-0-page.js`), so it reads arrivals and records the stop in your list the same way Seam's Missing Mile does.
- **Sounds, all with captions:** the train's slots have the same names as the Seam train's (doc 31): `train_arrive`, `train_doors_open`, `train_doors_close`, `train_depart`, `train_melody`. A new one, `train_ride`, is the wheels under the floor while you ride. They come from the train itself and move with it. Stand-ins until Aisling's files come.
- **Changed for it:**
  - The tunnel mouth is bigger (arch 2.8 m wide, about 3.5 m over the track bed), so the real-size train fits. The bank is higher, and the dark inside goes back further.
  - The telephone poles along the line moved 0.3 m back from the track, so the train clears them.
  - The grass along the track's north edge no longer grows where the train runs.
  - Captions now sit above the dark of a page change, so you can read the ride's lines in it.
- **Checked:**
  - `node t/train.js` runs the whole loop with no errors: it comes in and stops (doors 0.99 open); you walk in through a door (step-free, *inside…*); choosing aldridge place on the map (*ドアが閉まります · the doors close behind you.*); it leaves with you riding, into the dark (*つぎは オールドリッジ・プレイス · next, aldridge place.*); the stand-in stop is asked for (`stop`, `f:3:f03`). Opening the page as a ride's end puts you beside the standing train.
  - Pictures: it coming in through the fog, the cab ends, inside, the map, it going into the tunnel.
  - Walking, clicks, close-ups and the pocket unchanged; no blue. Its cost while it stands: about 170 draw calls from the platform. Nothing when it isn't there.
- **To try it on the Mac:** the four pages have to sit **in one folder** so they can find each other: `missing-mile-station.html`, `furusato.html`, `mainstreet.html`, `stop.html`. Sent as `missing-mile-train-test.zip`.
- **Aisling's call, pending:**
  - **Which Missing Mile the line stops at while both exist.** Seam's pages still send you to Seam's Missing Mile (`mainstreet.html`). Riding *out* of Embroidery's works now; for riding *in*, the Seam pages need one small switch.
  - Whether the **tunnel's bigger mouth** is OK (Seam's is low).
  - The train sounds (her files).
- **Not yet (for the graphics pass):**
  - The train's windows have no glass, and its light doesn't fall on the platform yet (a pool of light was tried earlier and the ink grade spoiled it).
  - No passengers: *nobody here*.
  - Seam's hanging cards over the aisle (中吊り) aren't in.
  - The ride is a short stretch of the platform and the tunnel, then dark. Seam's ride from Furusato has the long country stretch (`f9j`); that comes when Embroidery has more of the line to show.

### Nov 17, 2026 (night, later) — the train runs both ways; Aldridge first
Aisling: *"it goes to Aldridge yes.. and I think drop the place on Aldridge place and I think weirdly the train runs both ways on one track cause dream logic"*, then *"make it open after Aldridge they can pick any spot but this one goes to Aldridge first for test purposes"*.
- **Both ways on one track, turn and turn about.**
  - **East:** a train comes out of the dusk from the west, stops, and goes on east into the tunnel, to **Aldridge**.
  - **West:** the next comes out of the tunnel's dark, stops, and goes west past the platform's end into the fog, to **Furusato**.
  - They never meet. The lamps follow the direction: white at whichever end leads, red at the end that follows; the beam in the fog goes ahead.
- **No choosing at first.** The line map over the doors says where you are and what's next (*つぎは オールドリッジ · next, aldridge.* or *つぎは ふるさと · next, furusato.*). The doors close on time. If you're on, it takes you:
  - east into the tunnel's dark, then the stand-in stop for Aldridge (`stop.html`, until Aldridge is built);
  - west into the fog, then Furusato's page (Seam), arriving by train.
- **After you've been to Aldridge, the map lets you pick any stop.** Aldridge goes into the same list of stops you've been to as the Seam pages (`nullgrey.furusato.stops`), because the stand-in stop page keeps nothing.
- **F 04's name is Aldridge everywhere** (doc 32).
- **Checked** (`node t/train.js`, no errors):
  - east: it comes in, you walk on, the map says *next, aldridge*, the doors close, you ride into the dark, and the stand-in stop is asked for (`f:3:f03`);
  - Aldridge is remembered and the map then lets you pick;
  - west: out of the tunnel, you on, into the fog, and Furusato's page is asked for (`train`);
  - arriving by train still puts you beside it.
- **Later, with the story's puzzles:** whether the line opens stop by stop (doc 48).

### Nov 17, 2026 (night, late) — the track can't be walked onto, and the void line
Aisling: *"for safety, can you make it impossible to get on train tracks everywhere..? "you just can't go here, you feel the call of the void but can't truly follow it." suiicide is impossible in null grey i think unless i specify"*; then *"there will be areas where you can walk tracks, because i did this a lot growin up and as a early adult..but not where there are active trains.."* and *"there will be parts that feel dangerous in different areas, i will tell you to repeat this line probably..."*
- **Missing Mile (Embroidery):** you could step off the platform onto the track before. Now an invisible stop holds you at the platform's edge, and along the gravel past its ends. Pushing against it gives **her line, word for word** (at most every 20 s).
  - The only way past the edge is onto **the train's own floor**, through its open doors while it stands. Once it moves, you're riding.
  - If you somehow stand on the track side, stepping back toward the platform is always allowed, so you can't get stuck.
- The line is **`VOID_LINE`** (`src/ui.js`), for any other dangerous place, when she says so.
- **Checked:** `t/walk.js` (off the edge: stopped at z 3.12); `t/train.js` (getting on, both ways, no errors); clicks unchanged.

### Nov 17, 2026 (night, later still) — a "more PS3" look to compare; the tunnel readable; a report to look into
Aisling: *"i think we can punp up the graphic one biut more? towards ps3.. but keeping slight 1% crunch?"*, then *"some buttons are broke, the seed is missing, cant see anything ont he buildin cant see the newspaper on the um smile soda machjine and the tunnel is a little dakr cant see what its made of?"* and *"the buttons like moving about and pocket and the buttons and such are like kind of broken going in and out are broke, and like when you look down in view it moves a little odd"*.
- **A second look to compare, key 6: "missing mile · more ps3".** The same colours, fog and light.
  - Each drawn pixel is one screen pixel (it was up to 1.25).
  - Edges are smoothed (4× multisampling).
  - Much less of the ink snap and dither (ink 0.12, dither 0.55), so only a trace of crunch.
  - A little less grain.
  - **Pending, Aisling:** which one to keep as Missing Mile's look.
- **The tunnel, easier to see:**
  - the face, ring, piers and coping are paler concrete and hold a little of the dusk;
  - the inside stays dark however deep it goes. Fog used to make the far inside pale; now the inside takes its fog from how far away the mouth is;
  - a dark floor covers the ground and track past the first metre;
  - the earth roof no longer shows inside.
- **Her report, checked:**
  - In Chrome (the test browser) everything worked: walking, drag to look, the pocket icon and the P key, Escape, every close-up (the machine, the clippings, the newspaper, the poster), every click (`t/real-input.js`, `t/closeups.js`, `t/clicks.js`).
  - **So it's probably her browser** (Safari? WebKit can't be fetched here to test). **Asked:** which browser and machine, and which buttons.
  - **The seed (the pit on the bench):** once picked up, it stays gone for good (Seam's rule, `nullgrey.f3.pit`), so if she picked it up in an earlier test it's in her pocket. To confirm.
- **Pending:**
  - the browser question;
  - the look pick;
  - "looking down moves a little odd" (what she sees).

### Nov 17, 2026 (night) — decided for going forward: one list of things, two looks each
Aisling: *"we probably need like a database or spread sheet of what it is, how it appears in seam and we will updatye its appearaance in embroidery too (small items like .. pocket items and stuff that carries over only, maybe a seperate one fro trains … just stuff the player would see to keep things straight) the umm like uh words about it would stay the. same, so we wil have to keep both appearances so they can move both back and forth between seam and embroidery … this is a very important system, must remain consistent, always work and the items must have correct appearance in each engine … we need to build going forwards with thgis in mind"*. And: *"the people on like um the missing poster and stuff are still statric … all the crowds also will be updated to reflect the new engine as well, still the same rules and appearances, but in new engine … they will resembe the shapes of tghe models ion the reference games i gave tyou and the images i gave...so they will be rebuilt but same rules as before"*.
- **The rule from now on:**
  - every thing the player carries or sees on both engines (pocket items, food and drink, trains, signs that travel) has **one id and one set of words** (Seam's, the master);
  - it has **two looks: its Seam look and its Embroidery look**, kept side by side;
  - moving between pages, any number of times, it stays the same thing.
- **What's already true:**
  - the pocket in Embroidery is Seam's own (same saved pocket, same ids, same words, same pocket pictures);
  - the Embroidery drinks machine sells Seam's cans by Seam's ids;
  - the train is the Furusato line's own, redrawn in the round.
- **To build (a later round):**
  - **the list, as a spreadsheet:** id · name · words (from Seam) · where it's seen · Seam look · Embroidery look · status. One list for small things and pocket items, a separate one for trains, only what the player sees;
  - **in Embroidery's code, one file of 3D looks keyed by the same ids**, so a thing that turns up in the world (a can in the tray, a thing on a bench) is drawn from that one place.
- **People:**
  - pictures of people (the missing poster) stay static;
  - crowds and figures get rebuilt in Embroidery under **the same rules** (faces never real, drawn as our own; no NPC ever totally solid). Their shapes are after the reference games' models (Silent Hill 3, Folklore, Rule of Rose) and her images.
  - None in Missing Mile yet.
