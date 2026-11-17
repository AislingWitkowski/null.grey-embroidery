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
