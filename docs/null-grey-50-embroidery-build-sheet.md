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

### Nov 17, 2026 (night, last) — the pocket and passport's Embroidery look; the transition
Aisling: *"does pocket get a new look? dopes passport get a new look? i think we could? like a real neat pretty holographic look on runes and such? leathery look on the outside and such? magical, but the same like base? and all the stuff gets a new sheen.. i really want the magical transition, but obsious get the transition and missing mile workling first?"*, then *"yeah i just mean it gets more real"* and *"i think the holograms can have a slight blue liuister, breaking the rule..making it weird"*.
- **The pocket and the passport get an Embroidery look**, on the same base: the same layout, art and words.
  - The passport's outside is real leather: grained, worn at the edges, catching the light.
  - The foil and runes are holographic and shift as you move. **A slight blue lustre is allowed in them**, breaking the blue rule on purpose ("making it weird"; added to every repo's CLAUDE.md as an exception).
  - Everything in the pocket gets a sheen fitting what it's made of.
  - Built together with the list of things (one id, two looks).
- **The transition:** crossing from a Seam page into Embroidery, **it gets more real**. The pixels resolve into the smooth world as you arrive, and the other way as you leave.
- **Order:**
  1. her bugs (waiting on which browser and which buttons);
  2. Missing Mile's graphics pass and the look pick;
  3. the transition;
  4. the pocket and passport look, with the list.

### Nov 17 (late night) — her bug list: stuck close-ups, the newspaper, the bench, スマイル, the sky tag, the tunnel's glow
Aisling: *"it was lik,e i couldnt move in and out of poicket, when i went into the newspaper on the side of the um soda machien i couldnt get out, and i cant see the newpaper and the train track glows a little too much in the tunnel and the seed isnt on bench and some object from orgianl place still missing and the sky tag not there and so on"*; *"oh an dthe bench is not connected and the japanese on smile machine runs into white looks odd"*.
- **Stuck in close-ups (fixed).** The 3D canvas sat over Seam's close-ups, so a mouse or finger never reached them; only Escape worked. Now the clippings, the bench newspaper and the drinks machine take their own clicks (`tools/page.html`): their step-back buttons work, and clicking outside the clippings closes them. Tested with real clicks (`t/real-closeups.js`). The pocket closes with its own back button (also tested). Clicking inside the clippings still picks one clipping to look at alone, as in Seam.
- **The clippings ("the newspaper on the side of the machine") are now on the machine.** Seam puts them on the machine's east side, and that face had been given the plain red side. Seam's own clippings picture was painted on the old grey machine, so it's now on red paint in both engines (`f3vmClip2`, doc 32).
- **The newspaper and the pit on the bench are both there.** The pit is shared with Seam's save: if it was picked up on the Seam page it stays gone here too, and it's in the pocket.
- **The bench back is connected:** two posts hold it to the seat.
- **スマイル** no longer runs into the cream wave. It's moved up into the red above the wave's end, in Seam's picture, so both engines match.
- **The "sky" tag.** The hub's rule says it goes twice in the hub and once in every other place, and Missing Mile had none in either engine. It's now on the **dumpster's east side**, low, in white paint marker: the same tag strokes as the hub's, as one shared picture (`f3sky`). Where it sits is a stand-in choice; she can move it.
- **The track glowing in the tunnel:** the first metre inside the arch took the outside light. A shade now runs from clear at the arch to full dark, so the track goes into the dark.
- **"Some object still missing":** every clickable thing on Seam's Missing Mile is now in Embroidery (checked name by name). If she means something that isn't clickable, she should say which.
- Checks: walking, clicks, the train both ways, 0 errors, no blue.
- **Still open:** which browser she uses; what "looking down moves a little odd" means; whether the sky tag's spot is right.

### Nov 18 (just after midnight) — the graphics pass, part 1: the stucco holes, the trees, the road lamps
Aisling: *"ok great lets go forwards?"* (step 2: Missing Mile's graphics pass).
- **The holes in the stucco** (her note: *"they look too..umm smooth and stuff not very natural"*):
  - the outline is chipped and ragged at three sizes;
  - the stucco stands proud with a broken pale lip, its own thickness showing, and throws a little shadow onto the brick under it;
  - fine cracks gather round each hole;
  - the brick behind is laid in courses: each brick its own colour (mostly red-brown, a few burnt dark, a few gone purplish), worn round at its edges; a few are cracked and a few are gone, leaving only dark; the mortar is grey and sunk back;
  - crumbs lie at the wall's foot under the holes.
  - The front wall's texture has 1.5× the pixels to hold it. It shows on the station's front, back and gables.
- **The trees in the wind:** the same wind as the grass (the same gusts, from the same side). The crown leans and comes back, more the higher up it is, and the branches bend with it, so the leaves stay on them. Each leaf trembles a little on its own, slowly (well under three times a second). Checked calm against a full gust: the crown moves as one.
- **Light through the leaves:** the leaves glow a little in the dusk, most when you look up at them against the sky. Underneath, they used to be near-black silhouettes; now their gold and rust show (Folklore's backlit canopies).
- **The road lamps light the road:** the lit lamp and the weak one each lay a soft warm pool on the ground under them, following every dip of the road and verge, falling off softly and fading with the fog. It's steady (no flicker). The earlier attempt went dark under the ink grade; this one is added on top of the ground's own colour, so it stays warm. It costs one small mesh per lamp, not a real light.
- **Checked:** walking, clicks, the train both ways, 0 errors, no blue; draw calls about as before (75–171 from the busiest spots).
- **Still in the graphics pass:** glass in the windows, the windmill's wheel and vane in the round, the tunnel inside, the hanging sign and name board as Seam's own pictures, the train's windows and its light on the platform, the grass and corn up close.
- **Pending, Aisling:** the look pick (1 · missing mile or 6 · more ps3); which browser she uses; what "looking down moves a little odd" means; whether the sky tag's spot is right.

### Nov 18 (night) — the train fits together, the pocket's words, the leaves, dreamier; a text check every round
Aisling: *"the leaves are ok, but htey are a little tto outlines and cartoonish, and they float a little too much and the train is like not fitting together? there are ;ole weird white gaps? and all the pocket text and the object text is all overlapping each other? … everything looks a little too crisp … a little more dreamy...but not blurry? … can we add something to embriodery to auto check the text boxes always and the font on everything to make sure its not running off or overlapping or running off an object or not running into a color that will not be realdable? also remember to add cc for everything … those closed captions need space as well, for like deaf people … just what they need to know though... very minaimal"*. Then on phones: *"this is not made for phones really and less priority for phones, but not impossible … ipads more so or tablet"*, and *"we will do as muscjh as possible everything we can in phones i want as much as we can possibly do, but some might have to be computer or tablet"*.
- **The train fits together:**
  - every window and doorway has a dark rubber frame from the outer skin to the inner one (you saw light through the wall's slit before);
  - between cars there's a gangway now (folded dark bellows and a coupler), so they read as one train;
  - the side panels overlap a hair, so no hairlines between them;
  - the thin pale line on each car's end (the inside wall's edge showing through the end plate) is gone.
- **The pocket's words:** Seam's pocket is laid out for Seam's 16:9 stage, and in Embroidery it was stretched over the whole window, so its words landed on its rune border. Embroidery now gives it Seam's own stage (16:9, centred; the full width on a tall phone), so everything sits where Seam puts it. Round it is plain dark, as in Seam. On a tall phone its close and deeper buttons sit just under it, so the words never run into them.
- **Captions and CC:** they now stack. A long caption pushes the CC line up and never covers it. The CC line is a little brighter on a darker band, so it reads easily. Room for them is part of the text check.
- **The leaves:** no hard outline. Each leaf is shaded from the middle out, a little browner at its edge, with a faint rib and a few soft blemishes. The maples have rounded, pointed lobes rather than a star. The bunches sit on their twigs (they used to float out past the twig ends and away from the branches).
- **Dreamier, not blurry:**
  - **A bug, found and fixed:** the setting that mixes the smooth picture with the station's ink was never applied. Every pixel was snapped hard to the ink steps, which was a big part of the crispness. Now each look's ink amount works as described (Missing Mile: 30% snapped ink over a smooth ink grade).
  - **A mist filter**, like one on a camera lens: the picture breathes a little into a soft copy of itself, the lights most. Edges stay; it just feels softer and more like a dream. (Missing Mile's look only; `mist` in `src/looks.js`.)
- **The text check, `node t/text.js`, every round from now on** (in CLAUDE.md):
  - **words on the screen:** captions, CC, the pocket (open, and with a thing lifted), the close-ups (clippings, one clipping, newspaper, missing poster, drinks machine), the buttons, at six window sizes (two computers, two tablets, a phone upright and sideways). It checks for words off the screen, cut off by their box, overlapping, or too faint against what's behind them (captions and CC 4.5:1, the rest 3:1);
  - **words painted on things** (every canvas picture, Embroidery's and Seam's) and **in Seam's pictures:** running off the picture, overlapping, too faint on it.
  - **First run, found and fixed:**
    - the CC line slightly too faint;
    - the train caption over the CC line on a phone;
    - the pocket's caption over its close and deeper buttons on a phone;
    - **FEED · SEED · BAIT** running off the shed sign (made a little smaller, in Seam's picture, so both engines match);
    - the train cab's ふ crest too faint (a dark roundel under it now);
    - the sound/CC switches and look buttons too see-through over busy scenery.
  - **Allowed on purpose** (`t/text-allow.json`, each with its reason): 灯油 on the jerry can, moulded faint into the plastic as in Seam.
  - **Phones:** as much as can possibly work on a phone does; phone sizes are checked as strictly as the others. Anything that truly can't work goes on a short "computer or tablet only" list for Aisling to see. None so far.
- **Checked:** walking, clicks, the train both ways, real clicks on the close-ups and the pocket, 0 errors, no blue; draw calls about as before (82–179).
- **Pending, Aisling:** the look pick (1 or 6); which browser; what "looking down moves a little odd" means; the sky tag's spot.

### Nov 18 (morning) — things rooted in the ground; no long grass on concrete; leaves rebuilt from her photos
Aisling: *"things dont like connect in a natural way to the earth, like poles and such, like should they connet by disturning earth, or things to concrete have the slight ring barely able to see of concrete mixed? also no grass on concrete that is that long, like moss and a little ok, but there wouldnt be huge tufts? … leaves are looking very strange … they are almost right but they dont look natural at all.. the colors are fine and the markings on them... shapes are almost there...and i dont mind the sparseness.. but still floaty.."*
- **Her photos** (her own, described here and not kept): maple canopies from below against a clear sky, orange and gold with some red, each leaf with five pointed lobes and fine teeth, red veins spreading from where the stalk joins, brown speckles, winged seed bunches hanging; a suburban sidewalk under a big tree with red leaves scattered on the grass and concrete, low sun through the branches; a yellowing maple at a wood's edge over a leaf-covered field; a big sycamore going brown and gold over a gravel path; a kite caught high in a green tree under a white sky.
- **Footings, everywhere** (`src/roots.js`, for every place built from now on): after a place is built, everything that stands upright in the ground (poles, posts, trunks, the iron columns, the windmill's legs) is found by itself and given a footing:
  - **in earth:** dug, darker, damper soil round the foot, a low mound, a few pebbles turned up; the grass is trodden away round it (only a few short tufts a little way off);
  - **in concrete or asphalt:** a faint ring of concrete mixed and poured round it, a little paler, with a hairline crack: barely visible, as asked.
  - The trees also have roots flaring out into the ground, so the trunk no longer goes in like a pipe.
- **On the platform:** the six weeds through its cracks are small and low now, each with moss round it, and there's a little moss in the damp shade where the platform meets the building and along the coping. No tall tufts on concrete.
- **The leaves, rebuilt from her photos:** each leaf is a real maple leaf on its own stalk, hanging from a thin twiglet. The twiglets grow in sprays off every branch, and the leaves fan out from them, drooping a little and turned toward the sky. Five pointed lobes with small teeth, veins spreading from the stalk (a little redder than the leaf), brown speckles, a dried patch on some. The colours are the same as before. The canopies are fuller; the half-bare and nearly-bare trees keep their gaps.
- **The null.grey crack:** not at Missing Mile. The seam crack runs through the station (doc 22): it starts on the arrival street's top step, runs down through the hub and every platform, and ends at the tear in the hub's side nook. Missing Mile is a stop, so it has none. (The grey pearl, doc 38, later makes it glow where it's thinnest.)
- **Pending, Aisling:** whether Missing Mile should have a trace of the seam (her call); the look pick (1 or 6); which browser; what "looking down moves a little odd" means; the sky tag's spot.

### Nov 18 (late morning) — real but unreal: a fine static; more real; moodier; a little more ash
Aisling: *"since the nature of null grey.. its like there but not there...maybe we should add a little crunch back in..is there a way to keep everything we have exactly and even add in a little more realism..but also add like a little pixel like..maybe...like such tiny static poixel on top that its weird ...like a tiny grain almost..likea photo but its soo small? so its like hyper real, but barely noticeable? like dissaciation? real but unreal?"*; then *"we can even up the quality of everytihng? go even more into the real. (??) like its a real place but have that be the thing and go even moodier on lighting slightly and fod and a teeny bit more ash like 1%?"* and **"we DO NOT want to copy silent hill"**.
- **The fine static:** every screen pixel gets its own tiny, steady difference in brightness, warm-tinted, never blue, barely there (`fine` in `src/looks.js`, the ink pass in `src/look.js`). It doesn't flicker: it fades from one pattern to the next over about four seconds (well inside the sensory rule). Plus a touch more of the station's ink (the crunch).
- **More real:** one drawn pixel per screen pixel, edges smoothed (2× multisampling), up to 1200 rows (on a big screen); sharper textures at angles; softer, finer shadows from the bulbs (drawn once, so no cost per frame).
- **Moodier:** a little darker, a little more contrast and glow, so the lamps' pools stand out more against the dusk; the fog a little closer and thicker.
- **Ash:** about a tenth more flakes (580 from 520), same size and drift.
- **Not a copy:** written into the engine's rules (CLAUDE.md). The reference games are for how smooth it runs and how light and fog feel, never their look, places or things. Fog colour, inks, ash, places and story are null.grey's own.
- **Her questions:**
  - **Sun or moon:** neither. Missing Mile is always dusk under cloud, with only a warm glow low in the west. *Pending, Aisling:* a moon, a setting sun, or a pale smudge of one through the cloud?
  - **The windmill:** far out in the east field, south-east of the station, past where you can walk; its vane still says MAPLES & SONS. *Pending, Aisling:* Gooch (once she's double-checked), and whether to open a path through the corn to it.
  - **Walking everywhere:** not yet, on purpose: the corn and fog bound the place (the platform, round the station, the near fields, the road to the corn).
- **Speed:** the sharper picture costs more on the graphics card. The page still steps its resolution down by itself if frames run long. Aisling to check smoothness on her Mac and phone.

### Nov 18 (midday) — the trees grow together; a setting sun and a moon; Gooch's windmill and the path to it; corn detail; the train reshaped
Aisling: *"setting sun and smudge of moon...? windmill will be gooch? and yes path through corn to windmil, corn needs to bend sort of naturally too … the corn and everything will get a better like texture … just slightly … this is the pewrfect crunch i feel … tree shapes a little umm... janky? sliced choppy … the disconnection is a little odd … i like them a little janky weiord tim burton distortion..spikey so leave a little … move onto the train open up the world"*. With a screenshot of the cut-looking limbs and a photo of her own street's trees (a big trunk forking into long curving limbs).
- **The look:** her words, "this is the perfect crunch". Missing Mile's look stays as it is.
- **Trees:** each limb is one curving, tapering branch in several segments. It starts inside its parent, so it grows out of it; it bends outward then up or sags, with a rounded knuckle at each joint and a closed spike at the tip. The trunk is thicker and rounds into its fork. Still spiky and a little strange, but no sliced ends or gaps.
- **The sky:** the sun is going down in the west, low behind the fog and cloud: a warm glow along the horizon and a veiled disc. High in the south-east there's a pale smudge of moon, half lost in the cloud. No blue.
- **The windmill is Gooch's:** its vane reads GOOCH. Its click line now says *on its vane, old letters: GOOCH.* in both engines (Seam `f03-3d3.js`, `f03-road.js`; copied by `copy-says.py`). **Still MAPLES & SONS:** the shed's FEED · SEED · BAIT sign. *Pending, Aisling:* should that be Gooch too?
- **The path to the windmill:** a trodden path from the east field, wandering out through the corn to the windmill's feet, with a small clearing round it. Packed earth with two worn ruts, no grass on it. You can walk it and stand right under the windmill; its legs are solid. Off the path, the corn still stops you.
  - **The corn bends:** at the path's edges it leans out of the way, as trodden corn does; and as you walk through, the stalks near you are pushed aside and come back slowly behind you (all the corn and grass do this).
- **Corn and grass detail (slight):** each corn leaf is shaded from its stalk out, with a paler midrib, a dried brown tip and a few spots; the stalks have joints. Grass blades are darker at the foot and paler, drier, toward the tip.
- **The train, reshaped** (Aisling: *"the train is a little boxy and still seam"*):
  - a real carriage roof: the sides carry up into rounded shoulders, then a long low arch, with a rain gutter along each side and three vent humps on top;
  - the skirt under the body curves in below the floor, as real carriage sides do;
  - rounded vertical corners where the sides meet the ends;
  - the cab face sculpted: a brow over the windscreen, a heavy bumper beam with an anticlimber, the coupler and its hoses, hoods over the lamps;
  - underneath: the bogies' side frames, axle boxes and springs, and the underframe's boxes and a tank between the bogies.
  - **Still to do on it:** rounded window corners, glass, its light falling on the platform.
- **Also pending:** the item close-ups (the drinks machine, buying) in the Embroidery look; textures in general (later); opening up the world further (next).
- **Checked:** walking (including the path both ways and the windmill's legs), clicks, the train both ways, the text check, no blue.

### Nov 18 (afternoon) — smooth trees, the look-down float, the pit, livelier corn, a new machine front, a silver payphone, the LED board
Aisling: *"trees a little too bumpy still … it gets weiurd when you walk forward and look downwards..its like you float upwards? … the pit or seed missing again and the corn seems stiff? but the building texture looks good...doors arent there but i think we arent theere yet … train better, much better shapes … getting a lot of ummm...errors? also is there like a better font we could use on the train signs? … for the choosing the stops, i still want readable … the cans in the machine look a little big and isk fat? … i feel we could do better on machine? also i just realized we need a pay phone … i dont think its a booth this time...but do what you think is best..i think its more the litlle box here.. we didnt have boxes in ohio … obviously not blue so maybe like silver is better choice? i like havign graffitit but not a crzy amount...keep the japanese on the soda machine for sure.... and keep all the japanese and stuff.."* With screenshots (the bumpy limbs; the console's warnings) and reference pictures (described, not kept): US payphones of the 90s, brushed-steel wall shrouds with a lit "Phone" header, chrome faces with keypads, coin slots and returns, armoured cords, some with marker graffiti; one on a post at a roadside; and an old red soda machine with a lit header, a chrome strip of small flavour labels, a wood-grain door and a chrome delivery bay.
- **The errors:** the console filled with "toNonIndexed(): BufferGeometry is already non-indexed" warnings (harmless, but a flood). Fixed: a piece already in the right form is just handed back quietly.
- **Trees, smooth:** each limb is one continuous tube along a smoothed curve, tapering by its real length, with no knuckle balls. Side branches start buried in their parent along the parent's own line, so nothing pokes out. A side branch is always thinner than what it grows from, and the main limb carries on past each fork as a leader thinning to a spike, so joints read as forks, not elbows. The trunk is one smooth tube that flares at its foot. The barer trees keep their last leaves out at the twig ends, not clinging at the joints. Still spiky and a little strange.
- **Looking down while walking:** the view used to turn on the spot at eye height, which felt like floating. Now it turns on a neck: looking down tips the head forward and a little lower, as yours does. A soft shadow under you follows the ground, so you stand on it.
- **The pit (seed):** it was a flat picture lying on the seat, seen edge-on from standing height, so it read as missing. Now it's a small grooved stone in the round with her scan over it, sitting up on the bench boards with a little shadow. (Still shared with Seam's save: if it's been picked up, it's in the pocket.)
- **Corn less stiff:** each plant rocks a little on its own all the time and its leaves flutter higher up; more in a gust. It bends further as you pass.
- **The drinks machine** (in both engines, Seam's picture `f3vm2`, which the buying close-up also uses):
  - the fat round cans are gone. The selection strip is now a chrome panel with a flat label card for each flavour behind its little window: the Japanese name over the English, a band of the flavour's colour, a 120 price tag under each;
  - the delivery bay is chrome, with its flap in the middle;
  - **every Japanese word stays** (スマイル, つめた～い, 故障の時は, the flavour names).
  - In Embroidery it's in the round over that picture: chrome edging all round, a bezel and glass over the lit header and over the label strip, real buttons, the coin insert and change return standing out, the delivery bay's frame and flap, a chrome line over the kick plate, a chrome top.
  - The close-up's buttons and slots are moved to match (`f03-vend2.js`).
- **The payphone** (Embroidery): the flat green box is gone; an Ohio payphone of the 90s is on the station's west gable instead:
  - a brushed-steel shroud, open at the front, with rolled edges and a canopy with a lit header, **電話 · PHONE** in warm cream (no blue; a dead patch where its tube is going);
  - inside: the black phone with its chrome face (the steps 1 LIFT · 2 LISTEN · 3 COINS in an old orange-red, the coin slot and coin release, an instruction card *LOCAL CALLS 25¢ · 市内通話 · dial 0 for operator*, the keypad, the coin box with its lock, the coin return);
  - the handset on its hook and the armoured steel cord hanging in a loop;
  - a little graffiti, not much: a black marker tag and a white scratch-tag on the side, a 迷子 · lost cat sticker, *hello?* written on the coin box;
  - no brand anywhere.
  - **Pending, Aisling:** its click line is still Seam's *"a green payphone in its little glass box…"*. The phone isn't green or glass now: her words to change, or keep as a strangeness?
  - Seam's own Main Street still has the old green phone picture; it can follow when she likes this one.
- **The train's lettering:** the destination board on each cab is now amber LED dots, glowing on their own panel: **各停 ？？ / LOCAL ??**, written in Hiragino Sans (the face of JR's signs) with Avenir/Helvetica for the English, then turned into dots, as real local trains of the time had them. The crest's ふ is in the same face. The brow moved up so it doesn't cover the board. The line map you choose stops on is Seam's drawing, already in Hiragino Sans and Helvetica Neue (rail fonts, readable), so it's unchanged.
- **Not yet (she knows):** the station's doors, textures in general.

### Nov 18 (afternoon, later) — trees grown from her photos; the machine's spark; a darker phone and its phone book; still leaves; doorknobs; trees behind the windmill; a rounder sign font
Aisling: *"bright light weird spark on the machine? the trees are just a little too unnatural still? can we put corn and trees behind the umm windmill? can we make the phone a little darker more metal like, and a beat up connected phone book … the leaves on the ground are like bobbing up and down … the pit or seed is still flat but i can see it now. maybe the phone unit a little bigger … things are just looking a tad flat still … when you walk and look down it feels a little awkward like you float upwards a little … no doornobs on doors … trees are just really really important...i need them correct.. like i like a slight tim burton thing, but i need them really good … i like the amount of leaves on trees and i think we got the leaves correct … what about the text on the train signs? something less generic but readable??"* Then her own tree photos (described, not kept; some have her family in them): a walnut by a gravel path, forking into long crooked limbs with nuts hanging; looking up into a tall autumn canopy, slender trunks running high into gold and green; a woodland edge in low sun with a maple's gold crown; a big maple's limbs fanning out over a leaf-strewn meadow; park trees with one trunk forking into two or three, and a fallen limb curled on the grass; misty tall trunks over hydrangeas; a country road under tall roadside trees; bare backyard trees at dusk, a fine net of twigs against the sky; a field's edge with a dead white snag and young saplings; **a big bare tree in fog: one tall trunk forking at about head height into two or three leaders, fine branches all the way up, a mulch ring at its foot**; pines in the rain.
- **The trees, grown from her photos:** one tall trunk, straight a long way and flaring at its foot, forking at about head height into two or three leaders. Each leader keeps going up and forks again and again (five or six times), thinner each time; side branches leave at an angle and curve up, the long thin ones sag a little, the odd one has a crook. The ends are a fine net of twigs, and the leaves live out on that net (the crown's shell), not along the big limbs. A little crooked and spiky still. The fork has no notch, the trunk no cut end.
- **Trees and corn behind the windmill:** three more trees (half-bare, nearly bare, and a full one) and the corn runs on east behind it.
- **The machine's spark:** the glass over its header and label strip was too shiny and caught its own lamp. Now a soft glass; the chrome is a little duller.
- **The payphone:** darker steel, more metal; the phone unit is a little bigger in its shell. **A beat-up phone book** hangs beside it on a steel cable: a black binder, pages swollen and fanned with damp. *Pending, Aisling:* what's inside, and opening it.
- **Fallen leaves** on the ground lie still (the ground ones had picked up the wind meant for the tree's own leaves).
- **The pit** is plumper (a stone, not a disc).
- **Looking down:** the head tips a little further forward, and the view is a little narrower (62° from 66°), so there's less stretching at the bottom of the screen when you look down. *Aisling to say if it still feels like floating.*
- **Doorknobs:** old dulled brass knobs and plates on the station's doors.
- **The train's signs:** the destination board and the line map you choose stops on are now in a **rounded gothic** (Hiragino Maru Gothic, the face of old Japanese railway signs and line maps), with **Futura** for the English. Readable, less generic. The line map is Seam's (`f9c-ride-map.js`), so Furusato's and Main Street's rides change too.
- **Cost:** the trees are now the heaviest thing (up to about 420k triangles in one view). Aisling to check smoothness on her Mac.

### Nov 18 (evening) — the train's lettering, settled
Aisling: *"for led I want closest to Japan and modern and almost like futuristic? And for all the stop maps I want 2 [DIN]? … Can that work for the Japanese and Soviet let[ters] though if not just keep it for the like English ok?"* (She'd asked whether Garamond would work and what Berlin uses: Berlin's BVG uses FF Transit, a Frutiger-based signage face by MetaDesign; serifs like Garamond break up on LED dots and aren't used for rail wayfinding.)
- **The LED destination board:** a modern JR-style board. Fine square amber dots on a faint dark grid; **各停 ？？** in a heavy gothic, then a slow fade (about a second) to **LOCAL ??** in a narrow DIN, and back, each holding about 3 s. Nothing flashes.
- **The stop maps:** the English is in **DIN** (`F_DIN`, `f5c-things.js`: DIN Alternate is built into Macs and iPhones; Bahnschrift on Windows). That covers the ride's line map (`f9c-ride-map.js`, so Furusato's and Main Street's rides too) and Main Street's wall line map (`f3linemap`). **Japanese keeps its rounded gothic; Cyrillic keeps its own face** (the Mac's DIN has no Cyrillic). The hub's maps are unchanged.
- Checked: the train both ways, the text check (nothing runs off), no errors.

### Nov 18 (night) — run while Wren went to bed: the things list, saplings and a snag
Aisling: *"is there anything you can run without me right now while I put wren b to bed … what is a big thing we can run"*.
- **The things list, both engines** (a Sheet: "null.grey · things in both engines", https://claude.ai/artifact/D734KEtYZAaXa9RMea7W4G). Sheet **Things**: every pocket item (317 rows): id, Japanese and English names, the pocket's words as written, its action and what happens after, sound tier, whether it's used up, where you find it, how Seam draws it, and three Embroidery columns (look in the pocket, look in the world, status) to fill as we go. Sheet **Trains**: the trains. The same data is saved as CSVs in `claude/data/` (`things-both-engines.csv`, `trains-both-engines.csv`).
- **From her field photo:** four young saplings out in the fields (thin, leafy, small leaves on short twigs) and one **dead white snag**: bleached barkless wood, two crooked broken limbs, no leaves. Same tree builder (`tree()` in `station2.js` now takes `{sc}` for size and `{snag:true}`). All are solid, out of the walk paths.
- Checked: walking, clicks, the train, the text check (no must-fix), no blue, no errors.
- **For Aisling:** look at the snag and saplings (east field, towards the windmill); the Embroidery columns in the Sheet are blank until each thing gets its 3D look.

### Nov 18 (night, later) — the older trees, more natural; the payphone's surfaces
Aisling: *"the tree near tunnel looks pretty good but the other older trees maybe can we make them a little more natural shaped still they are close it's mostly the trunk and branch shape I like creepy but they are still a little too low res looking? I guess just a small upgrade? … look at the phone textures again and try to upgrade those as well?"*
- **Trees** (all of them, from the same builder; the full one by the tunnel keeps its look):
  - **the trunk** bows a little along its height and tapers properly, about half as thick at the fork as at its foot, so the leaders grow out of it instead of a notch. Its foot spreads into four or five buttresses, and its roots arch out of them down into the earth (they were straight cones);
  - **uneven sides:** every thick limb and trunk is slightly knobbly, changing slowly along its length, so nothing is a pipe. Rounder too (more sides on every branch and twig);
  - **branches** each have one steady bend and much less jitter: arcs, not noodles. Thin twigs curve too (they were straight sticks);
  - **the barer trees** now get the full fine net of twigs (it's what shows on them);
  - **the leaf twigs** are short and a little crooked (on the barer trees they were long straight sticks);
  - **real bark**, painted: furrowed plates running up, broken across now and then, deep dark grooves, a few small pale lichen patches; it wraps without a seam.
  - Still a little crooked and spiky. Cost: about 15% more triangles in the heaviest view (about 487k). Aisling to check smoothness.
- **The payphone's surfaces**, each painted at its true shape and twice the detail, with a bump and a roughness picture:
  - **the steel:** fine brushing, dents, scratches cut to brighter metal, rusty tamper-proof screws with rust running down under them, water stains, grime gathering low, the sheen dull in patches. Darker and less mirror-like, so the metal shows;
  - **the phone's face:** raised steel keys, with the numbers worn on the ones used most (5, 0, 1, 9); fingerprints round the keypad; the steps card; a raised coin slot and coin release; a stained instruction card (the same words); the coin box's chrome door with its lock; the coin return gone dark; *hello?* still written on it;
  - **the header:** crisper, with dust and dead flies inside the lens and its dimmer patch;
  - **the side:** the same marker tag (now with a drip), the scratch-tag cut into the steel, the 迷子 · lost cat sticker with a peeled corner, the glue of a sticker long torn off.
  - **Fixed:** the tag and sticker also showed, mirrored, on the inside of the shroud. They're on the outside only now.
  - **The phone book's pages:** old and grimy edge-on (they were plain white).
- Checked: walking, clicks, the train, the text check (no must-fix), no blue, no errors.

### Nov 18 (late night) — trees from her new photos, the leaf litter and road, the metal reflects, the train's glass and light
Aisling: *"closer on trees, closer on te metal...closer on all let push all those things again and push the train too ....i got some more images of trees … these are i think the shapes we are aiming for, so i tihnk really pay attention to the geometry making them connect well and matching these outlines shapes … not having the canopy read as "blobs" … we have a good balance with leaves now, we just need bark texture and trunk and tree branch shapes and flow and connections correct … this will help with leaves on ground and just the atmophere nad maybe roah textures too? this shows some nice barks? i already like the leaf colors we have the more darker ones are already good"*
- **Her photos** (described, not kept): an autumn avenue of tall maples over a path between apartment blocks, trunks whitewashed at the foot, leaves carpeting the ground; slim park trees with straight grey trunks forking high, gold leaves against the sky; a park path under gold and orange maples; a row of tall trees in rust and gold over a leaf-covered lawn; **an old tree with a twisted, deeply ridged trunk forking into thick crooked limbs, last leaves hanging** (the bark reference); thin trees in fog by a road, leaf-strewn ground; young orange maples by water, several thin stems from one foot; a big maple's dark trunk and long arching limbs under red and orange; a sunlit park path deep in leaves; a birch in low sun and mist; a gold maple in a courtyard; a misty park avenue of dark, bare, arching trees.
- **Trees** (the leaves and their colours unchanged, as she asked):
  - **bark**, from the twisted tree: ridges that wander, split and merge as they run up (interlacing), grey-brown on their faces, near-black deep furrows between, broken across now and then, a little lichen, darker wet streaks; the ridges twist slowly up the trunk;
  - **forks connect:** each branch swells slightly into a collar where it grows out of its parent; the hidden start of every branch now tapers inside its parent, so nothing pokes through the far side (that was the chevron-shaped seam on the trunks); the leaders grow straight up out of the trunk's middle and are thinner than it where they leave, so the fork is clean;
  - **shape:** a narrow V at the fork with the leaders rising steeply and longer before they spread (the vase of her avenue trees); long side branches dip in their middle and turn up at the tip (her big maple).
- **The ground under the trees:** a leaf litter painted into the ground, thick under each tree and thinning outward, dark damp earth between; the grass is thin there (in her photos the ground under a tree is mostly leaves); more fallen leaves round each tree.
- **The road:** leaves drifted along both edges with a few out on it, and the dark prints old leaves leave on wet asphalt.
- **Metal reflects:** metal had nothing to reflect, so it looked flat. Now every metal surface (the payphone's steel, the machine's chrome, the train's stainless) reflects a soft picture of the dusk round it (dark ground, the fog, the warm west, a few lamp glows). The payphone's steel is tinted a touch warmer.
- **The drinks machine's hot spot** (its own little light sat almost on its glass): moved out, so it lights the ground in front instead.
- **The train:**
  - real stainless: a welded seam and a row of rivets every metre, brushing along the car, faint ripples, rain streaks running down, scrapes, grime low; the seams and ribs stand out a little in the light; road dirt on the ribs;
  - glass in every window: faintly tinted, catching the lamps and reflecting the dusk;
  - its windows' light falls on the platform: a soft warm pool along the edge under each window and door, only on the platform's concrete, steady.
- Checked: walking, clicks, the train both ways, the text check, no blue, no errors.
- Cost: the heaviest view is about 520k triangles (from about 487k). Aisling to check smoothness on her Mac.

### Nov 18–19 (midnight) — the trunk goes all the way up; roots; leaves lie on the ground; the drinks machine cleaned up
Aisling: *"spda machine looks really weird?? ok so trees are ok but the bump in the middle of every tree is weird.. if we could get rid of that? and maybe try but close have that go all the way up and sprout and i think we got it?maybe all up and out a little more?lewave all floating again not flat or stil on ground? … the roots of trees not correct? really weird"*
- **Trees:** the trunk no longer stops at a fork with its end showing as a spike between the limbs. It carries on all the way up as the main stem, thinning, and the big limbs sprout off it at different heights, rising up and out further.
- **Roots:** the separate root pieces (they read as stacked plates) and the dark mound round the foot are gone. The trunk's own foot now spreads smoothly into low root lobes running down into the earth, on dug earth.
- **Ground leaves:** they were placed at the ground's exact height, but the ground mesh is flat between its points every 25 cm, so in dips they floated. Now they use the mesh's real surface (`groundSurf`, station.js), lie nearly flat, and the painted leaf litter under them is subtler.
- **The drinks machine:** the 3D bezels and glass over its header and label strip floated in front of the picture and didn't line up with it: gone (only a slim chrome edge sits flat on it now). The dark vertical bar through *Smile* was Seam's painted rust streak, an even 2.4-wide line: redrawn as thin, wavering rust in Seam's picture (`f3vm2`, f03-3d2.js), so Seam's machine changes too (doc 32).
- Checked: walking, clicks, the train both ways, the text check, no blue, no errors.

### Nov 19 (after midnight) — trees paused; leaves tilted; the drinks machine lit again
Aisling: *"ok trees are close, for now...lets pause those … the soda machine still...weird? buttons and such odd, all neon gone … can the leaves all be turned to slightly differnt angles? just all different anglkes more natural? just slightly?"*
- **Trees paused** (her call), to come back to later. Last small change: every leaf now tips a little its own way (a few degrees forward or sideways), so the canopy reads less even.
- **The drinks machine:** the 3D buttons, coin slot, change return, bay frame and kick-plate line sat a little off the picture's own and read as odd lumps: removed; the picture (Seam's, with every word) carries them. **The glow is back:** the header and the label strip are lit from inside again (a soft added glow on the picture's own lit parts), as the machine looked before.
- Checked: clicks, the train, the text check, no blue, no errors.

### Nov 19 (night) — the texture pass, part 1: doors, platform, ceiling, the hanging sign, the dumpster
Aisling: *"ok go with first texture pass? go as deep as you feel we can?"* (Trees are paused, her call.)
- **The station's doors:** they were sage blotches like camouflage. Now each is vertical boards: sage paint flaking off in ragged patches (more at the boards' edges and low down where the wet gets at it), the lifted rim of the paint catching light, weathered silver-grey wood with its grain underneath, rust running from the straps.
- **The platform's concrete**, twice the detail: poured slabs 1.5 m square, each its own grey; a broom finish across each; sunk, gritty joints with chipped edges; fine aggregate and pits; hairline cracks; old oil and water stains (darker, and they shine under the bulbs); the middle worn paler by feet; grime toward the building.
- **The canopy's ceiling** was a black void. It's now its boards painted long ago a pale cream, peeling to grey wood in flakes, water stains spreading from the joints, and it holds a little of the bulbs' warmth.
- **The hanging station sign (a bug fixed):** its picture covered only the left part of the board, stretched and blurred, with ほんまち cut off at the top, so most of it looked blank. Now one picture covers the whole face, drawn four times sharper: lit white enamel in a grey frame, **ほんまち** large, **本町 · MAIN STREET · F03** under it (the same words), the line's amber band along its foot, a few dead insects caught inside.
- **The dumpster** was a flat dark box. Its sides and lid are painted steel now (brown-black paint, pressed ribs, scrapes, rust at the welds and running from the lid's lip), and it's in the round: a lid a little open with a rolled lip, ribs at the front's edges and down the sides, the lifting pockets, squat feet. Its front is still Seam's picture (NO DUMPING · ゴミ捨て禁止), lit a little brighter so it reads.
- Checked: walking, clicks, the train, the text check, no blue, no errors.
- **Next in the texture pass:** the shed and its awning, the bench, the bin with eyes and the jerry can, the station's back and gables, the road's poles and signs.

### Nov 19 (morning) — the texture pass, part 2: the ground up close, the road, poles, wood, the bench, puddles, the jerry can
Aisling: *"ok do next texture, you can do several texture passes and ill look you can do about an hour of work"*.
- **The ground up close:** the big painted ground picture is too coarse at your feet (about 34 pixels a metre), so a fine detail picture now tiles over it at true size: on the road, asphalt's stones and tar; everywhere else, crumbs of earth, pebbles and bits of twig. It has its own small relief and fades out with distance, so there's no repeating pattern far off.
- **The blurry painted leaves are gone** from the road, the verges and under the trees (the ground picture couldn't hold them, so they read as soft squares and dark blotches). The real 3D fallen leaves do that job.
- **Puddles** in the fields were near-black holes; they're pale now, holding the dusk sky. The field's mud is a little lighter, closer to the grass, so it reads as earth.
- **Telephone poles and the lamp post** have their own picture, painted at their true size (they used the general wood picture stretched over 7.7 m, so they looked plain): creosote-dark at the foot fading up to weathered grey-brown, long checks split down them, the grain running up, clusters of old staples and torn paper corners at eye height, nail heads, a little moss low on one side.
- **All the old wood** (the bench's legs, frames, fascia brackets, beams, the canopy's rafters) has a better grain: long grain lines with darker latewood wavering round a knot, checks, nail holes with rust stains under them, grime low.
- **The bench** is real slats now, with gaps (three on the seat, two on the back, a rail under the seat), and its grain runs along the slats.
- **The jerry can** has a grip handle with the gap under it, a ribbed grey cap on its spout, and a moulded rim round its shoulders.
- **Honest note:** the field near the back of the station still has some darker patches with hard edges. They're the field's painted mud and furrows, and were there before; up close the new detail makes them read as wet earth. A finer field picture would fix them properly; it costs memory, so it's for later if she notices.
- Checked: walking, clicks, the train, the text check (no must-fix), no blue, no errors.

### Nov 19 (midday) — every doorknob in Missing Mile is an eye; the station's first
Aisling: *"i made a decision that all the doorknobs in missing mile have like eyes on them, all in different forms..but like each building will have a different form, some more obvioujs than others, some are older so maybe carved, some are like ornate, some are etced, some are carved, some are like if its a glass doorknob its a glass eye maybe with a glass bulb...so the doors of this buiklding for example would have the same eye lol, we donmt want this too wild...some might even be like carved after the fact by people?"* and *"again dont like copy, but these are inspo! i think this fits missing mile"*.
- **The rule (for every building in Missing Mile, from now on):** every doorknob carries an eye. **One form per building**, the same on all its doors; each building a different form; some obvious, some subtle; never too wild. Forms to draw from: carved (old wood or iron), ornate cast brass, etched, stamped tin, a glass knob with a glass eye inside, and eyes **carved in after the fact by people**. Our own designs, never a copy of a reference.
- **Her references** (described, not kept), two batches: a board of stamped tin eye charms (milagros) in silver and gold; a copper eye pendant with ribbed lashes; an antique brass knob with an eye in rays over a chain; a white plaster relief of orbits with gold dots; bronze eye knobs, polished at the rims; an eye ring on red velvet; a silver feather brooch around a lilac glass eye; a rusted grille with a brass-lidded brown glass eye and a glass tear; a rusted iron padlock with a raised eye and brow among flowers and leaves, a half sun under it; an old red door with a painted eye round its peephole; brass knobs on oval plates with a lashed eye; a round window of googly eyes; carved Victorian doorbell plates with glass eyes; a pen-and-ink stitched eye; a black Halloween doorbell with a glowing eye; a verdigris face knocker; a gate latch with googly eyes; an eye behind a keyhole; a gravestone with the eye in a triangle among rays, a snake coiled over its top and a branch of leaves; a cast silver eye knob; painted wooden eye knobs with lilac irises on old white doors; a mossy stone relief of an eye with its brow in a star of rays; an ornate brass handle with the eye in a triangle in rays; a soft etching of a lashed eye; a carved trefoil eye in a round black frame; an openwork silver doorbell plate with a green glass eye; a gold coin with an eye under rays.
- **Why it fits (Claude, from the lore; her call):** Missing Mile smashes the government's cameras (doc 39), yet every door here watches you back. Ukiyo's eyeball lamps are there so people feel watched (doc 39); the Silver Globe and the snake handlers (doc 39) are close by. *(Suggestion only: whether the eyes mean anything to the people who live here is hers.)*
- **Built: the station's form** (Main Street station, 1911, `src/eyes.js`):
  - **its doorknobs:** cast brass, an oval knob with a raised eye and its brow in a ring of rays; the lids, the iris ring and its fibres stand up, the pupil is sunk; rubbed bright where hands go, dark old patina in the hollows;
  - **their backplates:** oval brass with a beaded edge, a small eye at the top, two screws, the keyhole below;
  - **the padlock on the front doors' chain:** rusted iron, an eye with its brow among leaves and small five-petalled flowers on a stippled ground, a half sun under it (after her padlock reference, our own);
  - the relief and the colour are made from one height picture, so they always agree; clicking a knob or the padlock says the door's line as before.
- **Pending, Aisling:** the other buildings' forms as they're built (the shed is next door: stamped tin or a scratched-in eye would suit it); whether the eyes mean anything in the lore.
- Checked: walking, clicks, the train, the text check (no must-fix), no blue, no errors.

### Nov 19, 2026 — the shed's eye, the tin, a snack box
Aisling: "the people of mising mile...almost see..almost? and scratched in later is ok!"
- **The shed (MAPLES & SONS) door:** a plank door, sage-grey paint flaking, with an eye **scratched in later by people** round the knob: rough lines gone over again and again, stray slips, the pupil jabbed in above the knob. The knob is a plain iron one sitting in the eye. Every door on the shed would carry the same eye (it has one).
- **Corrugated tin (shed and walls):** rust now runs down from the nails and the laps in streaks, instead of round blotches.
- **A discarded snack box** by the bench (x 11.2, z 7.4): an off-brand caramel-corn box, "CRACKER JAKE", red and cream stripes, crushed flat and empty, torn flap. Stand-in name: hers to change. It isn't clickable yet; **its line is pending** (Aisling's words, if she wants one).
- Still for later: the station door knobs' eye form is the brass one from the last round; other buildings get their own forms as they're built.

### Nov 19 (afternoon) — six detail passes: walls, awning, signs, track, name board, the corner
Aisling: *"Ok do next few details passes and I'll check next time I'm on Big Mac puter"*, then *"You can run the next three passes you want past that if you want"*. New pieces live in `src/details.js`.
1. **The station's back and gables:** the wet comes up the walls' foot, a dark band with a wandering top edge, tide lines, rain splash and a little green near the ground. A louvred wooden vent sits high in each gable, five slats tipped down, one cracked and dropped on the west side.
2. **The shed's awning:** four rafters and a purlin under the tin, a bent, rusted drip edge along the front, and the posts are old round pipe now with foot plates and knee braces up to the beam.
3. **The road's signs:** both MISSING MILE 1 signs stand on galvanised steel channel posts (holes all the way up, rust low down, leaning a touch) with two bolts through the plate. The crossbuck's boards are aged: grime, crazed paint, rust running from the centre bolt.
4. **The track:** the rails' heads are worn bright by wheels; their webs and feet are rusted, patchy along the line. Each sleeper is its own age, a few sunk or skewed. There are spikes by every tie plate and about 4,200 loose ballast stones in the round, rust-stained near the rails.
5. **The name board ほんまち:** redrawn four times sharper, the same words in the same places. The enamel is chipped to black iron with rust round each chip (most near the edges), rust runs from its four bolts, and dirt runs down from the top.
6. **The corner:** the tobacco window's glass is dusty now, wiped once by a hand, with a crack and a dead fly, and no more hard white shine. The bin with eyes has a proud rim on its hood, three cigarette butts stubbed out on top, and old wet and ash round its foot.
- **The text check:** it failed once on a caption caught halfway through its half-second fade (the heavier scene made the first window size slower). The check now waits for the fade before measuring. Not a real readability problem.
- Checked: walking, clicks, the train both ways, the text check (no must-fix), no blue, no errors.
- Cost: about 4,700 more small pieces drawn as two instanced batches (stones and spikes), so only a couple more draw calls. Aisling to check smoothness on the Mac.

### Nov 19 (night) — the engine map; every pocket thing gets its Embroidery look (step 1); 175 missing things found and brought over
Aisling: *"so remember seam at the hub and such and the rides out and ride back but the stations onward will be embroidery and maybe further places might be a new engined but undecided, embriodery in the world unless i say otherwise"*, and on the pocket: *"we need to keep stuff but make it look real and cool in embriodery!!!"*, *"the stamps are also the same just more real ink i think or stamp effect??"*
- **The engine map, written into every repo's CLAUDE.md:** Seam = the hub, the main website, the train rides out and back. Embroidery = every station out in the world, unless she says otherwise. Further places: maybe a new engine (undecided). Everything you carry keeps one id, one set of words and one save (Seam's); each engine only has its own look for it.
- **Step 1, an automatic Embroidery look for every thing in the pocket** (`seam/shim-post.js`, "EMBROIDERY'S LOOK"; Seam's own files untouched):
  - Seam snaps each drawing to the station's inks pixel by pixel. In Embroidery the drawing stays smooth, drawn up to three times finer, and the inks only grade it (a quarter of each pixel's colour), so the palette holds.
  - Each part takes a material from its ink: silver, gold, brass and metal shine (a soft sheen band, raised lines catch the light); rusted metal is rough; paper and cream get a fine fibre; glowing inks stay lit; the rest is a soft matte. Light from the top left, edges a touch darker, a barely-there grain over it.
  - Foil (the passport, the pass, the moon water) gets a slow holographic band: silver, lavender, teal-grey, amber, with the slight blue lustre she allowed for holograms (Nov 17).
  - **Stamps in real ink:** the stamps on the passport's ОТМЕТКИ page get ragged edges, uneven pressure and little gaps where the ink missed. Text kept readable (doc 17: heavy ink, clean text).
  - Anything that can't be drawn this way falls back to Seam's look, so nothing is ever missing.
- **Found and fixed: 175 things were missing from Embroidery's pocket.** Furusato's kiosk sweets and drinks, magazines, cameras and film, the gacha capsules and album, stickers, keys, the photo strips, the kid's note and Mr. Eleven's job papers. Embroidery only copied part of Seam's pocket files, so anyone carrying those into Missing Mile would have had them vanish from view there. The bridge now copies the same shared files as Seam's Missing Mile (`seam/files.txt`), in Seam's order. All 317 things in the list are there.
- **A guard so ids never get lost:** `node t/ids.js` checks every id in the things list (`t/things-ids.csv`, a copy of `claude/data/things-both-engines.csv`) against the page, and lists anything new that the Sheet doesn't have yet.
- **The Sheet** ("things in both engines") and its CSV: the "Embroidery look in the pocket" column now says automatic look for all 317.
- **Pending, Aisling:** step 2 (the pocket and passport themselves: real leather outside, holographic runes); step 3 (hand-made looks, item by item, most-seen first). **The field notebook** (doc 48) is an Embroidery item: waiting on photos of the inside of her own field notes.
- Checked: walking, clicks, close-ups, the pocket, the train both ways, the text check (no must-fix), no blue, ids 317/317, no errors.

### Nov 19–20 (late night) — every pocket thing looked over; the faults the smooth look showed, fixed
Aisling: *"please go over all the items things are slightly um off, they look ok but some things arent connected or are not quite like right, umm off..like there is ok in lkong but like example the top is a little weird...would it be helpful to see all the real items?"* (with a screenshot of the chocolate creme can).
- **How:** `node t/sheets.js /tmp/sh_` lays every thing out big, 20 to a sheet, in its Embroidery look. All 317 were looked at.
- **Why things looked off:** Seam's pixels hid small faults in the drawings; drawn smooth they show. All fixed in Embroidery's look only (`seam/shim-post.js`, "EMBROIDERY'S FIXES"); ids and words untouched.
- **Fixed:**
  - **Cans** (every can: the drinks machine's, the kiosk's, the hub's, the tall chūhai can): the lid floated over a flat band. Now the shoulder narrows into a neck, a rolled rim, the lid sunk inside it, the tab lying on the lid.
  - **Ghosts:** a faint second copy of moved words showed, because the inks were read from Seam's unfixed drawing. The inks are now read from the fixed drawing itself.
  - **Words covered by pictures** (Apple, water melon, Rich Cherry, momo milk, lychee candy, plum milk candy, marshmallows, bubs, milk candy …): words go on top, small names move clear of the picture, long names fit their packet.
  - **Ink bottles:** a neck joins the glass to the cap, and the cap is ribbed (it was a black block floating on top).
  - **Wind bells:** the wishes run down the paper strip, as on a real 風鈴 (they ran off it sideways).
  - **Disposable cameras:** the shutter button sits on the body; the small words stay on the camera.
  - **The four-leaf clover:** four heart-shaped leaves joined at the middle (they floated apart).
  - **Smaller:** the onigiri's tear line stays on the wrapper; Столичные's word under its towers; Гематоген's name clear of its sun; Laughing Taffy's dots clear of its words; the wax bottles all inside the picture; アルバム inside its label; ribbon moon clear of the bow.
- **Looked fine:** the gacha capsules, plushies, coins and receipt, papers, tickets, magazines, the passport and pass, the pit, the keys.
- **Seam:** the same faults are there in Seam's drawings but mostly hidden by its pixels. The masters were left as they are; they can be fixed there too if Aisling wants.
- **Her real items:** photos would help most for the hand-made looks (step 3), item by item: the cans, the ink bottles, the wind bells, the cameras, the snacks she has. Not needed for these fixes.
- Checked: ids 317/317, the pocket, the text check (no must-fix), no errors.

### Nov 20 (after midnight) — the first hand-made looks, from Aisling's photos
Aisling sent 66 photos of real things (*"here is first batch … the cameras are to help update the cameras but htats all for now"*). Described here, not kept:
- **Sweets:** a watermelon taffy bar, crimped ends, black seeds; scalloped marshmallow cakes in clear wrappers with a crescent moon; pink and blue rock candy on sticks in bags with header cards; КИС-КИС square toffees (a cat by a brick chimney); a long pink ruby-chocolate box with a window; Алёнка's folded triangle; Гематоген's pink wrapper with letters of every colour and a sun; a Japanese fortune-candy bag with a lucky cat; a Kasugai-style peach gummy bag (striped bands, peaches); a clear bag of flower hard candies with a paper label (花小紋); いちごもち stand-up pouches; a foam-cone wrapper; a black-and-silver gum box; candy cigarettes; strawberry KISS bars; gold chocolate coins in a net; acid-sugar and sour-candy pouches; lolly packs with stickers; an OUCH gum tin; striped gum and its sticks; cherry-cola bubble gum; popping-candy packets; an atomic fire-ball box; a chocolate wafer roll; old TV gum and balloon gum wrappers; jelly fruit slices; a Mozart piano bar; circus peanuts; pressed sakura lollies in cellophane.
- **Drinks:** a winter berry cocktail can; a dark coffee can with a man on a round badge; strawberry milk bottle and cartons; peach water; an ion drink bottle; an ultra-violet soda can; lemon cola cans (silver, swirls, halftone); a cherry soda can.
- **Other:** a halftone illustration of six drink cartons (someone's art: feel only); a gothic & lolita magazine; a manga face-mask packet; a station kiosk, its magazine rack and its fridge; a toy shelf; a camera-shop pegboard wall of film and disposable cameras; a film vending machine; an MO disk; a 100 yen coin; three missing posters (one with a faceless woman, Oct 31 2002, the Department of Dream Analysis); an old windmill with its tank and lettered vane; the cut pole.
- **Built (Embroidery's look only; ids and every word kept):** Laughing Taffy, crescent pie, rock candy, КИС-КИС, Ruby, Гематоген, peach gummy, flower lolly, circus peanuts, 花小紋, いちごもち, まっくろ, おみくじ飴, stick jelly, both disposable cameras, the pink 35mm, the four film boxes, the MO disk. Each drawn after its photo: real wrappers (crimped ends, clear cellophane with a shine, header cards, hang holes, boxes seen a little from the side), our own names and faces.
- **Rules held:** blue shifted off (blue raspberry, the ion drink, acid sugar's zombie, blue gum, blue fruit slice); brands still sold keep their shape with names one step off; real living people and characters stay static or our own (the singers on the lolly packs, the magazine's people, the face-mask's manga, the coffee man, the girl on the drop tin).
- **Next from these photos (not yet):** Алёнка, the cartons (halftone), the cans' printed sides (lemon cola, cherry cheer, ultra violet, berry chūhai, chief coffee), KISS, the deir coins in their net, OUCHIE's tin, stripe gum, bubbly cola, popping candy, hot ball, Nekko, TV gum, fruit slices, wax bottles, peach water, strawberry milk, ばらの肌, the gothic magazine; the windmill and the missing poster in the world.
- **Pending, Aisling:**
  - **Mozart:** he's long dead, so his real likeness is allowed (her Nov 18 rule). Change the bar's plain profile to his face, or keep it?
  - **The faceless-woman missing poster:** any of its wording for null.grey, or the look only?
  - **New items** (wafer bars, biscuit sticks, koala cookies, fruit chews): only if she wants them; names and words hers.
- Checked: ids 317/317, the pocket, no errors.

### Nov 20 (night) — Mozart's face; the faceless woman's poster
Aisling: *"the mozart thing, yes use his face :) 2.0 yeah like use the wording? 3.) nah i think we made our own?"*
- **Mozart bar** (Embroidery's look): red foil, crimped ends, gold scrollwork, a keyboard under him, and Mozart himself in profile (powdered wig with its side rolls and black-bowed queue, red coat, lace at the throat). He died in 1791, so his real likeness is allowed (her Nov 18 rule). Words unchanged. *Seam's pixel version still has the plain profile: it can follow if she wants.*
- **A second missing poster**, on the road's first pole (by the station, x 31.9, z 10.6, facing the road): a photocopy on cheap paper, the faceless woman with only her smile. **Its wording is the poster she sent**, word for word, except the phone number: **(555) 637-4921** in place of the original 888 number, which could be a real line. Wet, yellowed, its bottom curling off the pole. **Not clickable yet: its click line is hers to give.**
- **New items:** none (her call: "we made our own").
- Checked: walking, clicks, the text check (no must-fix), no errors.

### Nov 20 (night, while Aisling slept) — the rest of her item photos; Gooch's windmill rebuilt
Aisling: *"ok please do a huge job now anytihng that can improve project in any way or many things because im going to sleep"*.
- **29 more hand-made looks** (Embroidery's look; ids and every word kept), from her photos:
  - **cans**, real cylinders now (dark at both edges, a highlight, the rolled top): lemon cola (silver, a yellow swirl in halftone dots, a lemon slice), cherry cheer (deep red, an oval badge, frost), ultra violet (plum with a violet lightning streak: never blue), 係長 coffee (the round badge, our own man, static as printed faces are), the berry chūhai (a glass of berries on ice, snowflakes, the gold ribbon, お酒).
  - **the six little cartons** (gable top with its seam, a printed side, halftone dots, striped straws), faces static: Apple, 南国バナナ, Rich Cherry, コーヒー牛乳, momo milk, water melon; and **strawberry milk**.
  - **bottles:** peach water and sigh water as clear plastic, ridged low down, ribbed caps.
  - **sweets:** KISS (white, pink diagonal stripes, a strawberry), the deir coins in an orange net under a card, OUCHIE!'s tin, STRIPE GUM's box with five striped sticks, Bubbly Cherry Cola, パチパチ's sachet, ATOMIC HOT BALL's box with its cloud window, Nekko's paper roll, TV GUM's old worn pack with two dogs, the fruit slices' tub, the wax bottles, the sakura marshmallows (a gold ribbon, flower-shaped mallows), 魔鬼酸 ACID SUGAR (our own green sour monster), QUEENS candy cigarettes (the top flipped open), Алёнка's folded twist (headscarf; face static).
- **Gooch's windmill, after her windmill photo:** a big riveted, rusted tank now sits inside the tower about a third of the way up, on its own beams (it was a small drum high up); the wheel is in the round (eighteen curved galvanised blades, two rings, spokes, the hub and gearbox), still; the vane is a weathered bent sheet with GOOCH stencilled and half worn off, rust running from its rivets. Seen from the clearing the wheel is side-on: it faces the station.
- **Still from her photos, for later:** the gothic magazine, ばらの肌's foil packet, the foam cones, the corn sticks, the drop tin; the kiosk, fridge, pegboard and film vending machine in 3D when a kiosk is built.
- **Seam's own drawings** still have the old pictures (her rule: Seam is the pixel world). If she'd like any of these looks carried back into Seam's pixels too (Mozart's face especially), that's a small job.

### Nov 20 (night, later) — real and hazy, not cartoon: a realism pass on everything
Aisling: *"I think the 3d things are too cartoon and stark in style now in embroidery … they need to be more Konami or horror game or like sh3 more the style we have here … the same object design but not seam looks? A little less cartoon and outlined more real hazy missing mile"*, then *"Also close ups of so machine and mailbox and signs and newspaper and phone need same treatment and the train"*.
- **The rule from now on:** in Embroidery, drawn things never look like clean vector art. Same designs and words, but real worn objects in the fog.
- **One realism pass, used everywhere** (`src/real.js`'s `realCanvas`; the pocket's `egReal` in `seam/shim-post.js`):
  - the drawing's hard edges softened (a soft copy mixed in, so words still read), no dark outlines;
  - colour muted, blacks lifted, highlights pulled down, a little warm (old film);
  - a little of Missing Mile's fog over everything;
  - wear: soft grime gathering in patches, fine creases, worn edges, scuffs, grain.
- **Where:** every thing in the pocket (all 317); the pictures in the world (the mailbox, the mileage signs, the newspaper on the bench, the drinks machine's front and sides, the posters, the dumpster, the crossbuck, the pole tags, the windmill's vane); the payphone's metal and face; the train (its steel, ribs, stripe, doors, cab; repeating textures get only the grade and grain, so no seams show). The ride's line map is left sharp, because it's read.
- **The close-ups** (newspaper, clippings, missing poster, the drinks machine): Seam's drawings, shown smooth (not pixels), muted and hazed, with grime and grain laid inside each picture so it stops at the paper's edge.
- **Cost:** about 1.8 s more loading on the test machine (no graphics card); far less on her Mac.

### Nov 20 (morning) — the pocket slow; things lit like a real object (the key)
Aisling: *"ok pocket no longer working at all … oh its just real slow"*, then *"so im thinking also with the objects more realistic closer to the real thing, but also more this style? but still missing mile? … like close to the key is most ideal"*. Her references (described, not kept): a survival-horror inventory key, photographic, worn brass bow and steel blade lit hard from the upper left, rust and grime in its dips, a brown leather tag with gold numbers, on black; a creased handwritten note on grey paper, lit softly, dark at its edges; a heart-shaped box opened on a dresser; an orange transistor radio lying on a grimy tiled floor, seen from above.
- **The slowness, fixed:** opening the pocket used to make all 317 Embroidery looks at once, which froze the page for a long time. Now the pocket opens with each thing in its plain look, and the Embroidery look is made one thing at a time in the background (the things you can see first), each swapping in when ready. `node t/pocket-speed.js` checks it. On the test machine (no graphics card) the pocket still takes about 6 s to open and has one 2.5 s pause, but that is Seam's own pocket starting up, the same with the new look switched off; on her Mac it was fine before.
- **The key look (replaces the hazy one for pocket things):** every thing now has a shape. Its edges round over (found from its outline), it's lit by one light from the upper left (a lit side, a side falling to dark, brighter nearer the light), and its material answers: metal shines with a hard highlight and a little patina in soft patches, dull where grime sits; paper is matte with a fibre and soft folds; plastic, card and foil have a soft gloss. Real darks now (no grey wash); only a breath of Missing Mile's haze. Materials are blended between neighbours, so a grey can't flicker between metal and plastic.
- **The world pictures and close-ups** keep the hazy realism pass from last night (`src/real.js`), since the 3D world lights them itself. *For Aisling:* say if the close-ups should go the key way too.

### Nov 20 (late morning) — the portal, the home button, comes to Embroidery
Aisling: *"do you remekmber my portal? the one that is on the bottom of all pages? … thats our home button and its important and i just realized i dont think embroidery is using it either.. we need to push that we always use it"*. She was right: Embroidery had no way home.
- **Added:** the stepping-disc portal (the master is Seam's `e-portal.js`), bottom right, the same size and place as in Seam. It shrinks on phones the way Seam's does, and steps aside while the pocket is open. Clicking it goes home (`/`). The code is `tools/portal.js`, a standalone copy of Seam's that also holds still for people who ask for reduced motion; `build.sh` puts it in the page.
- **Rule added to every repo's CLAUDE.md:** the portal is the home button on every page, Seam's and Embroidery's alike, and it's never swapped for a plain icon.
- `t/text.js`: no MUST FIX.

### Nov 20 (noon) — her photos stay as they are; made things less dirty, hazier, a slight pixel
- Aisling: "i want real like key but not dirty but haze? i dont like the blackness? but i like the realness and 3d ness...likke aas pholto real with pixel slightly?"
- Aisling: "anything that is photo we can just keep the same because that IS real and i want those kept i like those as is but anything ccreated i want to match those?"
- **Photos kept as they are.** A thing whose drawing holds a real photo or scan is left alone by the Embroidery look: no lighting, haze or pixel. Today that is `f_pit`, `f_coin100`, `f_coin100_b`, `f_key`, `f_key_b` (`egIsPhoto`, `EG_SEAM.look.photos()`). Any new photo or scan she adds is kept the same way, by itself.
- **Made things:** much less grime, rust and creases; the dark side stays a soft grey instead of black; Missing Mile's haze, more in shadow; a very fine pixel (`egPix`).
- **Honest gap:** next to her photos, the made things are cleaner but still read as drawn, not photographed. The most real way is the pit's way: her own photo or scan of the real object. The photos she sent on Nov 19–20 are of the real objects, so they could be used directly for those things. **For her to decide:** use her photos as the things' own pictures (cut out, like the pit)?
