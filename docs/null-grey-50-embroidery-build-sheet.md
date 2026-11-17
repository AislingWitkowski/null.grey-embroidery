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
