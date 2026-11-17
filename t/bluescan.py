# blue check: no blue anywhere (it's Null's). counts clearly blue pixels in each picture, and checks every ink.
import sys, glob, colorsys, re
from PIL import Image
inks = open('src/inks.js').read()
bad = [c for c in re.findall(r"'#([0-9a-f]{6})'", inks) if (lambda r, g, b: b > r + 4 and b > g + 4)(*[int(c[i:i+2], 16) for i in (0, 2, 4)])]
print('inks leaning blue:', bad or 'none')
tot = 0
for f in sorted(glob.glob(sys.argv[1] + '*.png')):
    im = Image.open(f).convert('RGB').resize((240, 135)); n = 0
    for y in range(135):
        for x in range(240):
            if x > 195 and y < 30: continue   # the look buttons
            r, g, b = im.getpixel((x, y)); h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
            if 0.52 < h < 0.75 and s > 0.15 and v > 0.12: n += 1
    tot += n > 3
    if n > 3: print('blue in', f, n)
print('pictures with blue:', tot)
