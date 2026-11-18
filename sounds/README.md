# Embroidery's sound slots (Missing Mile's station)
Drop a file named after its slot here (e.g. `mm_wind.mp3`) and run `bash build.sh`: it's packed into the page and plays
in place of the stand-in made in code. Loops should loop cleanly. Every slot has a caption for CC (src/sound.js, `SLOTS`).
The same list is in doc 31 (the sound slots doc).

| slot | plays | what | stand-in now |
|---|---|---|---|
| `mm_wind` | loop | the wind over the fields, rising in slow gusts (not from one place) | soft low noise, louder in gusts |
| `mm_corn` | loop | the corn rustling when a gust comes, from the nearest edge of corn | bright noise, only in gusts |
| `mm_bulb_hum` | loop | the canopy's bare bulbs humming, each from its own bulb (the two weak ones dim with their light) | a soft 120 Hz hum |
| `mm_lamp_buzz` | loop | the street lamp buzzing on its pole | a low filtered buzz |
| `mm_wires` | loop | the wires singing a little in the gusts, near the poles | a thin whistle, only in gusts |
| `mm_vend_hum` | loop | the drinks machine's cold hum, close to it | a low compressor hum |
| `mm_step_concrete` | once | a footstep on the platform's concrete | a short tap |
| `mm_step_gravel` | once | a footstep on gravel and ballast | a crunch |
| `mm_step_road` | once | a footstep on old asphalt | a dull tap |
| `mm_step_grass` | once | a footstep through dead grass | a swish |

**The train (Nov 17, night).** The same slot names as the Seam pages' train (doc 31), so one file can serve both: put it in each repo's `sounds/`. `train_ride` is new.

| slot | plays | what | stand-in |
|---|---|---|---|
| `train_arrive` | once | the train coming in out of the dusk and braking to a stop (8–10 s) | a very quiet low rumble, a sigh of brakes |
| `train_doors_open` | once | the doors opening: a soft chime and the air of the doors (2–3 s) | two soft sine tones |
| `train_doors_close` | once | the doors closing (2–3 s) | two soft sine tones |
| `train_depart` | once | the train pulling away into the tunnel (8–10 s) | a very quiet low rumble |
| `train_melody` | once | the departure melody (5–8 s) | the soft chime of 故郷 (Seam's, note for note) |
| `train_ride` | loop | inside the carriage while it moves: the wheels, the joints in the rail | a low rumble that follows the speed |
