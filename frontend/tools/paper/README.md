# Paper lab

Renders the hero's cyanotype sheet as a real bent surface: folded in four (a ridge and a
valley), the back edge rolled up (hardly at the left, a full turn at the right), the
front-left corner turned over, two strips of masking tape. Textures are procedural and
seeded, so every render is identical. Not part of the app build.

## Regenerate

The sheet itself (shape, roll, scene) lives in `src/three/paper/sheet.ts`, shared with the
page, which renders it live and animates the roll. The procedural textures are in
`src/three/paper/textures.ts`; they're slow, so this lab bakes them.

1. Start the `lab` launch config and open http://localhost:5180/paper/ (`?play` animates
   the roll, `?p=0.5` shows it part way).
2. Click **save** (or `exportAll()` in the console). Writes to `public/hero/`:
   - `paper-front.webp`, `paper-back.webp`, `paper-bump.webp`, `paper-alpha.png`: the
     textures the page loads.
   - `paper-flat.webp`: a still before the roll, shown while the live scene loads.
   - `paper.webp`: a still fully rolled, for reduced motion and no WebGL.
   - Both stills are rendered as the page renders: from the texture files above, with
     `PAGE_RENDER` (sheet.ts), so the still and the live scene match 1:1, shadows included.
     Change the page's render settings there, never in the page, then re-save.
   - and `src/points/hero-paper.json`: image aspect, the sheet's rect and its flat writing
     area, normalised to the image; tilt.

## Options (URL parameters)

- `exp` exposure (1.5) · `key` key light (2.1) · `kx`/`ky`/`kz` key position · `env` (0.8)
- `shadow` cast shadow opacity (0.5) · `soft` its blur (10) · `ao` contact shadow (0.28)
- `bump` paper tooth (1.2) · `ppm` texture px per mm (3) · `tilt` degrees (-0.7)
- `rw` render width (3600) · `ow` still width (2600) · `tw` texture width (2400) · `q` webp quality (0.86)
- `guides` outlines the sheet and writing area rects
