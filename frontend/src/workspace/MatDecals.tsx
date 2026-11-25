import { useMemo, type ReactNode } from 'react';
import { POINTS } from './points';
import { cellStyle } from './geometry';

/**
 * PROTOTYPE — the "working surface" idea.
 *
 * Instead of one giant photo of a cutting mat, the table is a cheap tiling CSS grid
 * (see workspace.css) plus this layer of scattered "mess": pencil shavings, a coffee
 * ring, scalpel cuts, graphite dust, a scrap of paper. Each cell's mess is generated
 * from a seed derived from its grid coordinates, so every working point looks unique
 * but stays identical across reloads and visitors — nothing is stored or downloaded.
 *
 * Quality is deliberately rough: this is here to show the concept on the real page.
 * Later the decals become real PNG/WebP sprites and the colors become design tokens.
 */

// --- Deterministic RNG: mulberry32 seeded from the cell's (x, y). ---
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngForCell(x: number, y: number) {
  const seed = (Math.imul(x | 0, 73856093) ^ Math.imul(y | 0, 19349663) ^ 0x9e3779b9) >>> 0;
  return mulberry32(seed);
}

type DecalKind =
  | 'shaving'
  | 'coffee'
  | 'cut'
  | 'dust'
  | 'paper'
  | 'smudge'
  | 'eraser';

type Decal = {
  kind: DecalKind;
  leftPct: number;
  topPct: number;
  rot: number;
  scale: number;
  opacity: number;
};

// Rough weighting: cuts/dust are common on a used mat, paper scraps rare.
const KINDS: DecalKind[] = [
  'cut',
  'cut',
  'dust',
  'dust',
  'shaving',
  'smudge',
  'eraser',
  'coffee',
  'paper',
];

function decalsForCell(x: number, y: number): Decal[] {
  const rnd = rngForCell(x, y);
  const count = 2 + Math.floor(rnd() * 5); // 2..6
  const out: Decal[] = [];
  for (let i = 0; i < count; i++) {
    const kind = KINDS[Math.floor(rnd() * KINDS.length)];
    out.push({
      kind,
      leftPct: 6 + rnd() * 88,
      topPct: 6 + rnd() * 88,
      rot: rnd() * 360,
      scale: 0.7 + rnd() * 1.1,
      opacity: 0.5 + rnd() * 0.5,
    });
  }
  return out;
}

// --- The little SVGs. One per kind; wrapper handles position/rotation/scale. ---
function DecalShape({ kind }: { kind: DecalKind }) {
  switch (kind) {
    case 'shaving':
      return (
        <svg viewBox="0 0 60 40" width={64} height={43}>
          <path d="M5 20 C12 3 48 3 55 20 C48 32 12 32 5 20 Z" fill="#c9924f" />
          <path d="M5 20 C13 11 47 11 55 20" fill="none" stroke="#6f4620" strokeWidth="1.2" />
          <path d="M5 20 C12 3 48 3 55 20" fill="none" stroke="#e3b87d" strokeWidth="1" />
          <circle cx="55" cy="20" r="2.2" fill="#2d2d33" />
        </svg>
      );
    case 'coffee':
      return (
        <svg viewBox="0 0 90 90" width={96} height={96}>
          <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(74,45,20,0.38)" strokeWidth="3" />
          <circle cx="45" cy="45" r="31" fill="none" stroke="rgba(74,45,20,0.12)" strokeWidth="7" />
        </svg>
      );
    case 'cut':
      return (
        <svg viewBox="0 0 120 8" width={120} height={8}>
          <line x1="2" y1="4" x2="118" y2="3" stroke="rgba(235,245,240,0.28)" strokeWidth="1" />
          <line x1="2" y1="5" x2="118" y2="5" stroke="rgba(0,0,0,0.22)" strokeWidth="1" />
        </svg>
      );
    case 'dust': {
      // Scatter of graphite flecks (fixed layout — the wrapper rotates the whole cluster).
      const flecks = [
        [8, 10, 1.4],
        [22, 6, 1],
        [16, 20, 1.8],
        [30, 16, 1.1],
        [12, 28, 1],
        [26, 30, 1.5],
        [38, 24, 0.9],
      ];
      return (
        <svg viewBox="0 0 48 40" width={48} height={40}>
          {flecks.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="rgba(35,35,40,0.5)" />
          ))}
        </svg>
      );
    }
    case 'paper':
      return (
        <svg viewBox="0 0 80 58" width={80} height={58}>
          <rect x="2" y="2" width="76" height="54" rx="1" fill="#efe9db" stroke="rgba(0,0,0,0.18)" />
          <line x1="10" y1="16" x2="60" y2="16" stroke="rgba(60,60,70,0.4)" strokeWidth="1.5" />
          <line x1="10" y1="26" x2="54" y2="26" stroke="rgba(60,60,70,0.3)" strokeWidth="1.5" />
          <line x1="10" y1="36" x2="66" y2="36" stroke="rgba(60,60,70,0.25)" strokeWidth="1.5" />
        </svg>
      );
    case 'smudge':
      return (
        <svg viewBox="0 0 100 50" width={100} height={50}>
          <ellipse cx="50" cy="25" rx="46" ry="18" fill="rgba(30,30,36,0.16)" />
          <ellipse cx="42" cy="22" rx="30" ry="11" fill="rgba(30,30,36,0.12)" />
        </svg>
      );
    case 'eraser': {
      const bits = [
        [6, 12, 10, 4],
        [20, 8, 12, 5],
        [14, 22, 9, 4],
        [30, 18, 11, 4],
      ];
      return (
        <svg viewBox="0 0 48 34" width={48} height={34}>
          {bits.map(([x, y, w, h], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width={w}
              height={h}
              rx={h / 2}
              fill="rgba(225,220,205,0.75)"
              transform={`rotate(${i * 37} ${x + w / 2} ${y + h / 2})`}
            />
          ))}
        </svg>
      );
    }
    default:
      return null;
  }
}

function CellMess({ x, y }: { x: number; y: number }) {
  const decals = useMemo(() => decalsForCell(x, y), [x, y]);
  return (
    <div className="ws-mess" style={cellStyle([x, y])} aria-hidden>
      {decals.map((d, i) => (
        <span
          key={i}
          className="ws-decal"
          style={{
            left: `${d.leftPct}%`,
            top: `${d.topPct}%`,
            opacity: d.opacity,
            transform: `translate(-50%, -50%) rotate(${d.rot}deg) scale(${d.scale})`,
          }}
        >
          <DecalShape kind={d.kind} />
        </span>
      ))}
    </div>
  );
}

/** Decal layer: fills every cell in the bounding box of the points (plus a margin). */
export default function MatDecals(): ReactNode {
  const cells = useMemo(() => {
    const xs = POINTS.map((p) => p.pos[0]);
    const ys = POINTS.map((p) => p.pos[1]);
    const minX = Math.min(...xs) - 1;
    const maxX = Math.max(...xs) + 1;
    const minY = Math.min(...ys) - 1;
    const maxY = Math.max(...ys) + 1;
    const list: { x: number; y: number }[] = [];
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) list.push({ x, y });
    return list;
  }, []);

  return (
    <div className="ws-mess-layer" aria-hidden>
      {cells.map(({ x, y }) => (
        <CellMess key={`${x},${y}`} x={x} y={y} />
      ))}
    </div>
  );
}
