# Board lab

Renders the hero motherboard offline. It isn't part of the app build.

- `layout.ts`: the board as data, in mm, laid out to ATX 2.2 (board size, mounting holes,
  slot pitch). It covers parts, traces, vias, silkscreen, LEDs, and which traces glow.
- `pcb.ts`: paints the PCB texture maps (colour, bump, roughness, metal) and the glow layer
  from that same data.
- `scene.ts`: every part as real geometry and materials.
- `main.ts`: lights, a long-lens camera straight above the board, the render, and the export.

## Regenerate

1. Start the `lab` launch config (`tools/vite.config.ts`) and open http://localhost:5180/board/.
2. Open the lab and click **save**, or run `exportAll()` in the console. That writes:
   - `public/hero/board.webp`
   - `public/hero/board-glow.webp`
   - `src/points/hero-board.json`, with the crop, LED positions, pulse paths and light strips.

Optional URL parameters: `s` (px/mm, default 12), `ow` (export width, default 2400),
`q` (WebP quality), and `key` / `env` / `hemi` / `ao` / `fov` / `box` for the lighting and
camera. `view=glow|mix` previews the powered-down state.

`dbg(name, x, y, w, h, outWidth)` saves a crop as `public/hero/_dbg-*.png`. These files are
git-ignored.
