# A tiny sketch of the print look (Nov 28, 2026, about 3 am)
Aisling: *"if you were to make a very teeny teeny tiny like space in the null grey style you are describing … in true like 3-d … could you show me"*.

Not the engine and not the look test (doc 63 §5): a quick standalone three.js page to show the idea. A dusk platform: one lamp, a bench with one small red ribbon, a shed with a silver stitch across it (the leak), bare birches, dead grass, a pylon, and a puppet-like figure at the far end with strings going up into the fog.

- `null-grey-print-look-sketch.html`: one self-contained file (three.js inside). Drag to look; hold, or W A S D / arrows, to walk. `?v=1` and `?v=2` start at other spots; `?nopencil&noleak` turns off the fog sketching and the blue sky.
- `scene.js`: the source (`npx esbuild scene.js --bundle --minify --format=iife`).
- Pictures: `shot-v0/v1/v2.png`; `shot-v0-plain.png` is without the fog sketching; `sketch-four-views.png` all four.

What it shows: the fog that sketches (things go to a pencil outline in the fog's own grey, then the fog takes them), a soft wash on the light, a broken ink line on near things, paper in the lights, grain, darks a soft grey. What it doesn't: the detail of the real target (modelled things, her photos as textures, proper glow and shadows); the shapes here are plain boxes and cones.
