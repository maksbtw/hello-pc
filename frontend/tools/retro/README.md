# Retro lab

Renders the retro computer hero offline: a generic beige desktop case, a CRT monitor and a
keyboard. All keycaps are white except the 7u space bar, which is the green Dalej key. This
lab isn't part of the app build.

## Regenerate

1. Start the `lab` launch config (`tools/vite.config.ts`) and open http://localhost:5180/retro/.
2. Click **save**, or run `exportAll()` in the console. That writes:
   - `public/hero/retro.webp`, the whole render with alpha.
   - `public/hero/retro-key-hover.webp` and `retro-key-down.webp`, the Dalej key pressed
     1.4 mm and 3.8 mm.
   - `src/points/hero-retro.json`, which holds the image aspect ratio plus the screen
     opening and the key rect, normalised to the image.

## Options

URL parameters:

- `el`: camera elevation in degrees, default 30.
- `fov`: default 20.
- `zoom`: default 0.93.
- `tilt`: monitor tilt in degrees, default 6.
- `kz`: gap between the keyboard and the case, default 30.
- `exp`, `key`, `shadow`: lighting.
- `ow`: export width, default 1800.
- `guides`: outlines the screen and key rects.

## Debugging

`dbg(name, state, x, y, w, h, outWidth)` saves a crop as `public/hero/_dbg-*.png`. These
files are git-ignored.
