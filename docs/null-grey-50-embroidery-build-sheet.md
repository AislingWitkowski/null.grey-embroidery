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
