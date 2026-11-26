import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useEnterToFly } from '../workspace/FlyLink';

/**
 * A link printed on the drawing sheet: the word and a down arrow in the sheet's white ink,
 * in a double-ruled box like a title-block cell. Hover or keyboard focus and a pencil
 * loops it; press (or Enter) and the box gets hatched in, as if redrawn, then we fly.
 */

const W = 190, H = 62; // box, px
const PAD = 36; // room around the box for the pencil loop

function mulberry32(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A hand-drawn loop: an ellipse that wanders a little and overshoots where it started. */
function penLoop(cx: number, cy: number, rx: number, ry: number) {
  const rnd = mulberry32(42);
  const start = -2.6, sweep = Math.PI * 2 + 0.55;
  const n = 26;
  const ph = rnd() * 6;
  const p: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = start + sweep * t;
    // drifts outward as it goes round, so the overshoot doesn't land on the start
    const k = 1 + 0.035 * Math.sin(a * 2 + ph) + 0.07 * t + (rnd() - 0.5) * 0.012;
    p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  // Catmull-Rom through the points, as cubic Béziers
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

export default function PaperLink({ to, label, className = '' }: { to: string; label: string; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const pressed = useEnterToFly(ref, to);
  const loop = useMemo(() => penLoop(PAD + W / 2, PAD + H / 2, W / 2 + 28, H / 2 + 21), []);
  const x = PAD, y = PAD;

  // hatching: 45° lines clipped to the inner box
  const hatch = useMemo(() => {
    const out: string[] = [];
    for (let i = -H; i < W; i += 7) out.push(`M${x + i},${y + H} L${x + i + H},${y}`);
    return out.join(' ');
  }, [x, y]);

  return (
    <Link
      ref={ref}
      to={to}
      className={`paper-link ${className}`}
      data-pressed={pressed ? '' : undefined}
      aria-keyshortcuts="Enter"
      style={{ width: W + PAD * 2, height: H + PAD * 2 }}
    >
      <svg width={W + PAD * 2} height={H + PAD * 2} aria-hidden>
        <defs>
          <clipPath id="pl-inner">
            <rect x={x + 5} y={y + 5} width={W - 10} height={H - 10} />
          </clipPath>
        </defs>
        <g className="pl-print">
          <rect x={x} y={y} width={W} height={H} strokeWidth="1.6" />
          <rect x={x + 5} y={y + 5} width={W - 10} height={H - 10} strokeWidth="0.8" />
          <path className="pl-hatch" d={hatch} clipPath="url(#pl-inner)" strokeWidth="1" />
          {/* down arrow, ruled */}
          <path d={`M${x + W - 40},${y + 18} V${y + H - 18} M${x + W - 48},${y + H - 26} L${x + W - 40},${y + H - 18} L${x + W - 32},${y + H - 26}`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <line x1={x + W - 62} y1={y + 12} x2={x + W - 62} y2={y + H - 12} strokeWidth="0.8" />
        </g>
        <text className="pl-word" x={x + 24} y={y + H / 2 + 7}>
          {label.toUpperCase()}
        </text>
        <path className="pl-loop" d={loop} pathLength={1} />
      </svg>
      <span className="sr-only">{label}</span>
    </Link>
  );
}
