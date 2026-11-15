// Design tokens as plain values for code that can't use Tailwind classes or
// CSS variables (three.js materials and lights). Keep in sync with
// tailwind.config.ts and src/index.css.

export const THEME = {
  accentInk: '#7FA592', // PCB green, readable shade (highlights)
  lamp: '#C9DAF2', // cold white lamp light
  lampSoft: '#E6EEF8', // brightest lamp light
  lampFill: '#F2F5FA', // neutral fill light
  sky: '#CFE0FF', // cool back light
  floorBounce: '#1E2A24', // dark green bounce from below (PCB)
} as const;
