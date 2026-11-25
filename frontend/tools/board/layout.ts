/**
 * The hero motherboard as data: a generic (brand-free) ATX board laid out to the
 * ATX 2.2 spec, in millimetres. Origin is the top-left corner of the component side,
 * x to the right (the rear I/O edge is x = 0), y down. 244 x 305 mm (9.6" x 12").
 *
 * Spec numbers used (ATX 2.2, fig. 3, inches -> mm):
 *   board 12.000" x 9.600"; datum hole 0.400" from the rear edge, 0.650" from the bottom;
 *   holes on the 0.400" / 6.500" / 9.350" lines at 0.650", 5.550", 11.750" from the bottom;
 *   expansion slots 0.800" (20.32 mm) apart; rear I/O window 6.25" x 1.75".
 * Socket: a current desktop LGA package, 37.5 x 45 mm, cooler holes on a 78 x 78 mm square.
 */

export type Pt = [number, number];
export type Rect = { x: number; y: number; w: number; h: number };
export type Trace = { pts: Pt[]; w: number; glow?: boolean };
export type Via = { x: number; y: number; r: number; glow?: boolean };
export type Kind =
  | 'shroud' | 'heatsink' | 'choke' | 'cap' | 'audiocap' | 'power' | 'header' | 'socket'
  | 'dimm' | 'pcie' | 'm2' | 'chipset' | 'sata' | 'usbc' | 'chip' | 'qfp' | 'soic' | 'sot'
  | 'crystal' | 'battery' | 'led' | 'button' | 'mlcc' | 'res' | 'cap0201';
export type Part = Rect & { kind: Kind; z: number; o?: Record<string, number | string | boolean> };
export type SilkText = { t: string; x: number; y: number; s: number; rot?: number; align?: CanvasTextAlign };
export type Led = { x: number; y: number; color: 'green' | 'white'; label?: string };

export type Board = {
  W: number;
  H: number;
  parts: Part[];
  traces: Trace[];
  vias: Via[];
  holes: Pt[];
  silkText: SilkText[];
  silkRects: (Rect & { r?: number })[];
  silkLines: Pt[][];
  grooves: Pt[][]; // copper-pour splits (plane outlines, audio isolation)
  bare: Pt[][]; // areas without ground pour (traces sit on bare laminate there)
  leds: Led[];
  pulses: Pt[][]; // long glowing traces the hero animates
  strips: { pts: Pt[]; z: number }[]; // light strips on top of tall parts (z = height, mm)
};

export const W = 244;
export const H = 305;
const IN = 25.4;

// ---------- seeded random ----------
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(1700);
const rr = (a: number, b: number) => a + (b - a) * rnd();
const ri = (a: number, b: number) => Math.floor(rr(a, b + 1));
const pick = <T,>(xs: T[]) => xs[Math.floor(rnd() * xs.length)];

// ---------- occupancy grid (keeps traces off parts and each other) ----------
const RES = 0.2;
const GW = Math.ceil(W / RES);
const GH = Math.ceil(H / RES);
const occ = new Uint8Array(GW * GH);
function markDisc(x: number, y: number, r: number) {
  const cx = Math.round(x / RES), cy = Math.round(y / RES), cr = Math.ceil(r / RES);
  for (let j = -cr; j <= cr; j++)
    for (let i = -cr; i <= cr; i++) {
      if (i * i + j * j > cr * cr) continue;
      const gx = cx + i, gy = cy + j;
      if (gx >= 0 && gy >= 0 && gx < GW && gy < GH) occ[gy * GW + gx] = 1;
    }
}
function markRect(r: Rect, pad = 0) {
  const x0 = Math.max(0, Math.floor((r.x - pad) / RES)), x1 = Math.min(GW - 1, Math.ceil((r.x + r.w + pad) / RES));
  const y0 = Math.max(0, Math.floor((r.y - pad) / RES)), y1 = Math.min(GH - 1, Math.ceil((r.y + r.h + pad) / RES));
  for (let y = y0; y <= y1; y++) occ.fill(1, y * GW + x0, y * GW + x1 + 1);
}
function freeDisc(x: number, y: number, r: number) {
  if (x - r < 1.2 || y - r < 1.2 || x + r > W - 1.2 || y + r > H - 1.2) return false;
  const cx = Math.round(x / RES), cy = Math.round(y / RES), cr = Math.ceil(r / RES);
  for (let j = -cr; j <= cr; j++)
    for (let i = -cr; i <= cr; i++) {
      if (i * i + j * j > cr * cr) continue;
      if (occ[(cy + j) * GW + cx + i]) return false;
    }
  return true;
}
function freeRect(r: Rect, pad = 0) {
  if (r.x - pad < 1.2 || r.y - pad < 1.2 || r.x + r.w + pad > W - 1.2 || r.y + r.h + pad > H - 1.2) return false;
  const x0 = Math.floor((r.x - pad) / RES), x1 = Math.ceil((r.x + r.w + pad) / RES);
  const y0 = Math.floor((r.y - pad) / RES), y1 = Math.ceil((r.y + r.h + pad) / RES);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (occ[y * GW + x]) return false;
  return true;
}
function walk(pts: Pt[], fn: (x: number, y: number) => boolean | void, step = RES) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
    for (let k = i === 0 ? 0 : 1; k <= n; k++) if (fn(ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n) === false) return false;
  }
  return true;
}
const markPath = (pts: Pt[], r: number) => walk(pts, (x, y) => markDisc(x, y, r));

// ---------- geometry helpers ----------
function offsetPath(pts: Pt[], d: number): Pt[] {
  const nrm = (a: Pt, b: Pt): Pt => {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  };
  return pts.map((p, i) => {
    let n1 = i > 0 ? nrm(pts[i - 1], p) : null;
    let n2 = i < pts.length - 1 ? nrm(p, pts[i + 1]) : null;
    n1 = n1 ?? n2!;
    n2 = n2 ?? n1;
    const mx = n1[0] + n2[0], my = n1[1] + n2[1], ml = Math.hypot(mx, my) || 1;
    const ux = mx / ml, uy = my / ml;
    const s = d / Math.max(0.35, ux * n1[0] + uy * n1[1]);
    return [p[0] + ux * s, p[1] + uy * s] as Pt;
  });
}
/** A 45-degree trapezoid meander (length-matching serpentine) from a to b (axis-aligned). */
function meander(a: Pt, b: Pt, amp: number, flat: number, side = 1): Pt[] {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len;
  const vx = -uy * side, vy = ux * side;
  const per = 2 * flat + 2 * amp;
  const n = Math.floor((len - flat) / per);
  const start = (len - n * per) / 2;
  const out: Pt[] = [a];
  const at = (u: number, v: number): Pt => [a[0] + ux * u + vx * v, a[1] + uy * u + vy * v];
  for (let k = 0; k < n; k++) {
    const u0 = start + k * per;
    out.push(at(u0, 0), at(u0 + amp, amp), at(u0 + amp + flat, amp), at(u0 + 2 * amp + flat, 0));
  }
  out.push(b);
  return out;
}

// ---------- the board ----------
export function buildBoard(): Board {
  const parts: Part[] = [];
  const traces: Trace[] = [];
  const vias: Via[] = [];
  const silkText: SilkText[] = [];
  const silkRects: (Rect & { r?: number })[] = [];
  const silkLines: Pt[][] = [];
  const grooves: Pt[][] = [];
  const bare: Pt[][] = [];
  const leds: Led[] = [];
  const pulses: Pt[][] = [];
  const strips: { pts: Pt[]; z: number }[] = [];

  const add = (kind: Kind, x: number, y: number, w: number, h: number, z: number, o?: Part['o'], keep = 0.5) => {
    const p: Part = { kind, x, y, w, h, z, o };
    parts.push(p);
    if (keep >= 0) markRect(p, keep);
    return p;
  };
  const label = (t: string, x: number, y: number, s = 1.5, rot = 0, align: CanvasTextAlign = 'left') =>
    silkText.push({ t, x, y, s, rot, align });
  const outline = (r: Rect, pad = 0.6, rad = 0.3) =>
    silkRects.push({ x: r.x - pad, y: r.y - pad, w: r.w + 2 * pad, h: r.h + 2 * pad, r: rad });
  const trace = (pts: Pt[], w: number, glow = false) => {
    traces.push({ pts, w, glow });
    markPath(pts, w / 2 + 0.18);
  };
  const via = (x: number, y: number, r = 0.32, glow = false) => {
    vias.push({ x, y, r, glow });
    markDisc(x, y, r + 0.15);
  };
  const bus = (center: Pt[], n: number, pitch: number, w: number, glowEvery = 0, endVias = true) => {
    const out: Pt[][] = [];
    for (let i = 0; i < n; i++) {
      const pts = offsetPath(center, (i - (n - 1) / 2) * pitch);
      const g = glowEvery > 0 && i % glowEvery === 0;
      trace(pts, w, g);
      if (endVias) {
        const e = pts[pts.length - 1];
        vias.push({ x: e[0], y: e[1], r: 0.28, glow: g });
      }
      out.push(pts);
    }
    return out;
  };

  // --- mounting holes (ATX 2.2 fig. 3) ---
  const fromBottom = (yIn: number) => H - yIn * IN;
  const holes: Pt[] = [
    [0.4 * IN, fromBottom(0.65)], [0.4 * IN, fromBottom(3.75)], [1.2 * IN, fromBottom(11.75)],
    [6.5 * IN, fromBottom(0.65)], [6.5 * IN, fromBottom(5.55)], [6.5 * IN, fromBottom(11.75)],
    [9.35 * IN, fromBottom(0.65)], [9.35 * IN, fromBottom(5.55)], [9.35 * IN, fromBottom(11.75)],
  ];
  for (const [x, y] of holes) {
    markDisc(x, y, 4.6);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
      vias.push({ x: x + Math.cos(a) * 4.1, y: y + Math.sin(a) * 4.1, r: 0.3 });
    }
  }

  // --- rear I/O shroud + VRM heatsinks ---
  add('shroud', -1.5, 6, 35, 156, 30);
  add('heatsink', 34, 36, 14, 88, 24, { fins: 'x', tone: 0 });
  add('heatsink', 44, 14, 92, 17.5, 24, { fins: 'y', tone: 0 });
  // the brushed accent bars on these (see scene.ts) double as diffused light strips
  strips.push({ pts: [[30.4, 17], [30.4, 131]], z: 31.4 });
  strips.push({ pts: [[45.2, 54.4], [45.2, 93.3]], z: 26.7 });
  strips.push({ pts: [[59.5, 28.7], [109.4, 28.7]], z: 26.7 });

  // --- CPU power: EPS 8-pin x2, chokes, caps ---
  for (const x of [40, 63]) {
    const p = add('power', x, 2.4, 20.8, 9.6, 12.5, { cols: 4, rows: 2 });
    outline(p, 0.5);
  }
  label('CPU_PWR1', 40, 15.2, 1.3);
  label('CPU_PWR2', 63, 15.2, 1.3);
  for (let i = 0; i < 6; i++) add('choke', 66 + i * 11.2, 32.4, 9.6, 9.6, 6.5);
  for (let i = 0; i < 7; i++) add('choke', 48.8, 47 + i * 10.4, 9.6, 9.6, 6.5);
  for (let i = 0; i < 6; i++) add('cap', 60.6, 54 + i * 9.6, 5, 5, 7);
  for (const x of [88, 96.4]) add('cap', x, 3, 7.6, 7.6, 10.5, { big: true });

  // --- CPU socket (current desktop LGA size): ILM frame, cap, lever, cooler holes on 78 mm ---
  const SX = 100, SY = 80;
  add('socket', SX - 28, SY - 35, 56, 70, 6, {}, 0.8);
  markRect({ x: 127, y: 46, w: 5, h: 70 }, 0.4); // lever
  for (const [dx, dy] of [[-39, -39], [39, -39], [-39, 39], [39, 39]]) {
    holes.push([SX + dx, SY + dy]);
    markDisc(SX + dx, SY + dy, 3.4);
  }
  silkRects.push({ x: SX - 31, y: SY - 38, w: 62, h: 76, r: 1 });
  label('CPU_SOCKET', SX - 30, SY + 41.2, 1.4);
  // MLCC rows hugging the socket frame
  for (let y = 48; y < 112; y += 1.25) add('mlcc', 66.6, y, 1, 0.5, 0.5, {}, 0.1);
  for (let y = 48.6; y < 112; y += 1.25) add('mlcc', 68.8, y, 1, 0.5, 0.5, {}, 0.1);
  for (let x = 74; x < 126; x += 1.3) add('mlcc', x, 43.2, 0.5, 1, 0.5, {}, 0.1);

  // --- DIMM slots (DDR5, 4x) ---
  const dimmX = [152, 161, 172, 181];
  const dimmNames = ['DIMM_A1', 'DIMM_A2', 'DIMM_B1', 'DIMM_B2'];
  dimmX.forEach((cx, i) => {
    add('dimm', cx - 3.3, 12, 6.6, 145, 9, { grey: i % 2 === 1 }, 0.4);
    label(dimmNames[i], cx + 0.6, 178, 1.25, -Math.PI / 2);
  });
  label('DDR5', 145.5, 9.5, 1.6, 0, 'right');

  // --- 24-pin, front USB, right-edge headers, debug LEDs, power button ---
  const atx = add('power', 229, 95, 10.4, 53, 12.5, { cols: 2, rows: 12, latch: true });
  outline(atx, 0.5);
  label('ATX_PWR', 227.5, 121, 1.3, -Math.PI / 2, 'center');
  add('usbc', 228.5, 158, 11, 8, 6.5);
  label('USB_E1', 226.5, 162, 1.2, -Math.PI / 2, 'center');
  add('header', 230.5, 172, 9, 22, 8.8, { cols: 2, rows: 10, shroud: true, pitch: 2 });
  label('USB3_1', 228.5, 183, 1.2, -Math.PI / 2, 'center');
  add('header', 233.5, 26, 2.6, 10.2, 7, { cols: 1, rows: 4, fan: true });
  label('SYS_FAN1', 231.6, 31, 1.15, -Math.PI / 2, 'center');
  add('header', 233.5, 42, 2.6, 7.6, 7, { cols: 1, rows: 3, fan: true });
  label('ARGB1', 231.6, 46, 1.15, -Math.PI / 2, 'center');
  add('header', 233.5, 56, 2.6, 7.6, 7, { cols: 1, rows: 3, fan: true });
  label('LED2', 231.6, 60, 1.15, -Math.PI / 2, 'center');
  add('button', 204, 8, 9, 9, 5, { round: true });
  label('PWR', 208.5, 20.4, 1.3, 0, 'center');
  add('button', 217, 9, 7, 7, 4.5, {});
  label('RST', 220.5, 19.2, 1.2, 0, 'center');
  leds.push({ x: 208.5, y: 12.5, color: 'white', label: 'power' });
  ['CPU', 'DRAM', 'VGA', 'BOOT'].forEach((t, i) => {
    const y = 72 + i * 5;
    add('led', 223, y, 1.6, 0.8, 0.6, {}, 0.3);
    label(t, 221.4, y + 0.75, 1.2, 0, 'right');
    leds.push({ x: 223.8, y: y + 0.4, color: i === 3 ? 'green' : 'white', label: t });
  });
  add('led', 223, 98, 1.6, 0.8, 0.6, {}, 0.3);
  label('STBY', 221.4, 98.75, 1.2, 0, 'right');
  leds.push({ x: 223.8, y: 98.4, color: 'green', label: 'standby' });
  // memory VRM: two small chokes + power stages
  for (const y of [30, 40]) add('choke', 192, y, 6.5, 6.5, 4.5, { small: true });
  for (const y of [31, 41]) add('chip', 201.5, y, 4, 4.6, 0.9);

  // --- M.2 + PCIe slots (slot pitch 20.32 mm, x16 = 89 mm) ---
  const slotY = (k: number) => 171 + k * 0.8 * IN; // k = 0 is the top expansion position
  add('m2', 54, 133, 84, 22.5, 7.5, { label: 'M.2_1' });
  const pcie = (k: number, len: number, armor: boolean, name: string) => {
    const y = slotY(k);
    const w = armor ? 9.6 : 7.6;
    add('pcie', 57, y - w / 2, len, w, 11, { armor, x16: len > 50 }, 0.5);
    if (len > 50) add('pcie', 146, y - 3.2, 4.5, 6.4, 12, { latch: true }, 0.3);
    label(name, 57, y - w / 2 - 1.6, 1.3);
  };
  pcie(0, 89, true, 'PCIEX16_1');
  pcie(1, 25, false, 'PCIEX1_1');
  pcie(3, 89, true, 'PCIEX16_2');
  pcie(5, 89, false, 'PCIEX16_3');
  add('m2', 62, 198, 84, 24, 7.5, { label: 'M.2_2' });
  add('m2', 62, 239, 84, 23, 7.5, { label: 'M.2_3' });

  // --- chipset, SATA, battery, Super I/O, BIOS, clock ---
  add('chipset', 176, 204, 48, 58, 9.5);
  for (const y of [206, 224, 242]) {
    const p = add('sata', 230.5, y, 13, 15.5, 12);
    outline(p, 0.4);
  }
  label('SATA_12', 228.5, 214, 1.15, -Math.PI / 2, 'center');
  label('SATA_34', 228.5, 232, 1.15, -Math.PI / 2, 'center');
  label('SATA_56', 228.5, 250, 1.15, -Math.PI / 2, 'center');
  add('battery', 194.5, 267, 21, 21, 5.4);
  label('BAT', 205, 291, 1.3, 0, 'center');
  add('qfp', 155, 238, 14, 14, 1.5, { leads: 32 });
  label('SIO', 155, 255.4, 1.2);
  add('soic', 150.5, 278.5, 5.3, 5.3, 1.6);
  label('BIOS', 150.5, 286.4, 1.2);
  add('chip', 192, 189, 5, 5, 0.9);
  add('crystal', 200, 190, 6.5, 3.2, 1.2);

  // --- bottom-edge headers ---
  const hdr = (x: number, y: number, cols: number, rows: number, name: string, o: Part['o'] = {}) => {
    const p = add('header', x, y, rows * 2.54, cols * 2.54, 7, { cols: rows, rows: cols, ...o, horiz: true });
    label(name, x, y + cols * 2.54 + 2.3, 1.2);
    return p;
  };
  hdr(14, 291.5, 2, 5, 'F_AUDIO');
  hdr(34, 292.8, 1, 3, 'ARGB2', { fan: true });
  hdr(60, 291.5, 2, 7, 'COM');
  hdr(99, 291.5, 2, 5, 'USB2_12');
  hdr(117, 291.5, 2, 5, 'USB2_34');
  hdr(138, 292.8, 1, 4, 'SYS_FAN2', { fan: true });
  hdr(176, 292.8, 1, 2, 'CLR_CMOS');
  hdr(219, 291.5, 2, 5, 'F_PANEL');
  add('header', 92, 3.2, 10.2, 2.6, 7, { cols: 4, rows: 1, fan: true, horiz: true });
  label('CPU_FAN', 92, 0.2 + 1.3, 1.1);
  add('header', 105, 3.2, 10.2, 2.6, 7, { cols: 4, rows: 1, fan: true, horiz: true });
  label('CPU_OPT', 105, 0.2 + 1.3, 1.1);

  // --- audio corner: codec, gold audio caps, isolation split ---
  add('chip', 21, 249, 7, 7, 0.9, { dot: true });
  label('CODEC', 21, 259.2, 1.1);
  const acaps: Pt[] = [[7, 230], [15, 230], [35, 233], [7, 266], [35, 266], [42, 250], [7, 248]];
  for (const [x, y] of acaps) add('audiocap', x, y, 6.3, 6.3, 7.5);
  add('soic', 30, 222, 5, 4, 1.5);
  grooves.push([[0.8, 219.5], [43, 219.5], [50.5, 227], [50.5, 281], [45, 286.5], [45, 304.2]]);
  silkLines.push([[0.8, 218.6], [43.4, 218.6], [51.4, 226.6], [51.4, 281.4], [45.9, 286.9], [45.9, 304.2]]);
  label('AUDIO', 3, 284, 1.2);

  // --- LAN corner, USB redrivers behind the I/O ---
  add('chip', 38, 177, 8, 8, 0.9, { dot: true });
  add('crystal', 26, 180, 6.5, 3.2, 1.2);
  add('chip', 38, 192, 4, 4, 0.9);
  add('chip', 40, 140, 5, 5, 0.9);
  add('chip', 40, 128, 4, 4, 0.9);

  // ======= routing =======
  // DDR5: six groups from the socket edge to slot A, each with a length-matching meander.
  const ddr: Pt[][] = [];
  for (let k = 0; k < 6; k++) {
    const y0 = 52 + k * 11.4;
    const side = k === 0 ? 1 : k === 5 ? -1 : k % 2 ? 1 : -1;
    const amp = 2.2 + (k % 3) * 0.5;
    const yT = y0 + (k - 2.5) * 1.3;
    const c: Pt[] = [
      [126, y0],
      ...meander([132, y0], [140.6, y0], amp, 0.9, side).slice(0, -1),
      [140.6, y0],
      [141.2 + Math.abs(yT - y0), yT],
      [150.5, yT],
    ];
    ddr.push(...bus(c, 7, 0.42, 0.15, k === 1 || k === 4 ? 3 : 0, false));
  }
  pulses.push(ddr[7 + 3], ddr[28 + 3]);
  bare.push([[129, 46], [149, 46], [149, 118], [129, 118]]);
  // Between the slots: channel-B fly-by traces and via columns.
  for (const gx of [156.55, 176.55]) for (let y = 20; y < 152; y += 1.1) if (rnd() > 0.18) via(gx, y, 0.26);
  {
    const v = bus([[166.5, 16], [166.5, 154]], 6, 0.5, 0.16, 0, false);
    v.forEach((pts, i) => {
      const g = i === 1 || i === 4;
      traces.find((t) => t.pts === pts)!.glow = g;
      via(pts[0][0], pts[0][1], 0.26, g);
      via(pts[1][0], pts[1][1], 0.26, g);
    });
    pulses.push(v[1], v[4]);
  }

  // PCIe x16: 16 differential pairs from the socket down to the via field above M.2_1,
  // with an AC-coupling capacitor pair on each lane.
  for (let i = 0; i < 16; i++) {
    const x0 = 77 + i * 2.35;
    const x1 = 100 + (x0 - 100) * 0.86;
    for (const s of [-0.21, 0.21]) {
      const pts: Pt[] = [[x0 + s, 112], [x0 + s, 118.5], [x1 + s, 118.5 + Math.abs(x1 - x0)], [x1 + s, 130]];
      trace(pts, 0.17, i % 5 === 2);
      via(x1 + s * 1.9, 131, 0.27, i % 5 === 2);
    }
    add('cap0201', x1 - 0.55, 124.4, 0.3, 0.6, 0.3, {}, -1);
    add('cap0201', x1 + 0.25, 124.4, 0.3, 0.6, 0.3, {}, -1);
  }

  // DMI: socket -> chipset, the longest visible run on the board.
  const dmiC: Pt[] = [[121, 112], [121, 125.5], [125, 129.5], [139.6, 129.5], [143, 133], [143, 158], [151, 166], [151, 190], [166, 205], [180, 205]];
  const dmi = bus(dmiC, 16, 0.42, 0.16, 4, false);
  pulses.push(dmi[0], dmi[8]);

  // Chipset fan-out: SATA, USB 3 header, M.2/slot lanes, bottom headers, front panel.
  for (const y of [209, 213, 227, 231, 245, 249]) {
    bus([[222, y], [231, y]], 2, 0.4, 0.17, y === 227 ? 1 : 0, false);
  }
  bus([[212, 205], [212, 199], [218.5, 192.5], [230.5, 192.5]], 8, 0.42, 0.16, 0, false);
  const cs1 = bus([[178, 224.6], [100, 224.6], [96, 220.6]], 8, 0.4, 0.16, 7, true);
  const cs2 = bus([[178, 265.2], [92, 265.2], [88, 261.2]], 8, 0.4, 0.16, 0, true);
  const usb2 = bus([[190, 262], [190, 277], [185.5, 281.5], [134, 281.5], [129, 286.5], [129, 291]], 6, 0.45, 0.17, 5, false);
  bus([[220.5, 262], [220.5, 291]], 6, 0.45, 0.17, 0, false);
  pulses.push(cs1[7], usb2[0]);

  // 24-pin rails: wide copper heading to the memory VRM and down past the DIMMs.
  const rails: Pt[][] = [
    [[229, 101], [214, 101], [204, 91], [204, 47], [206, 45]],
    [[229, 108], [212, 108], [196, 92], [196, 50]],
    [[229, 118], [210, 118], [196, 132], [196, 175], [184, 187], [184, 196]],
    [[229, 128], [214, 128], [204, 138], [204, 178], [192, 190], [192, 196]],
  ];
  rails.forEach((r, i) => trace(r, i < 2 ? 1.6 : 1.1, i === 2));
  pulses.push(rails[2]);
  for (const [x, y] of [[204, 47], [196, 50], [184, 196], [192, 196]] as Pt[])
    for (let k = 0; k < 3; k++) via(x + (k - 1) * 0.9, y + 1.4, 0.3);

  // Audio: codec -> rear jacks and the front-audio header, wider analog traces.
  bus([[25.5, 249], [25.5, 205], [21, 200.5], [21, 163]], 5, 0.65, 0.26, 0, false);
  bus([[24.5, 256], [24.5, 284], [20.5, 288], [20.5, 291.5]], 5, 0.6, 0.26, 0, false);
  bus([[28, 252.5], [33, 252.5], [37, 248.5], [37, 240]], 3, 0.6, 0.24, 0, true);
  // LAN -> magnetics behind the I/O shroud.
  bus([[42, 177], [42, 170], [36, 164], [30, 164]], 8, 0.45, 0.16, 0, false);

  // Power planes under the VRM: outlines of the Vcore and 12 V pours.
  grooves.push([[44, 33], [61, 33], [65, 37], [65, 43], [70.5, 43], [70.5, 117], [63, 124.5], [44, 124.5]]);
  grooves.push([[62, 31.5], [137, 31.5], [137, 44.6], [72, 44.6]]);
  grooves.push([[36, 1.6], [86.5, 1.6], [86.5, 13.4], [36, 13.4]]);
  grooves.push([[188, 25], [212, 25], [212, 52], [188, 52]]);

  // ======= small parts =======
  const passive = (x: number, y: number, vertical: boolean, big = false) => {
    const l = big ? 1.6 : 1.0, s = big ? 0.8 : 0.5;
    const r: Rect = vertical ? { x, y, w: s, h: l } : { x, y, w: l, h: s };
    if (!freeRect(r, 0.25)) return null;
    return add(rnd() < 0.62 ? 'mlcc' : 'res', r.x, r.y, r.w, r.h, big ? 0.8 : 0.5, { vertical }, 0.2);
  };
  // Tidy rows around chips (how real boards look), then scattered singles.
  const rowsAround = (r: Rect, depth: number, density: number) => {
    for (let d = 0; d < depth; d++) {
      const off = 1.1 + d * 1.5;
      for (let x = r.x - 1; x < r.x + r.w + 1; x += 1.4) {
        if (rnd() < density) passive(x, r.y - off - 1, false);
        if (rnd() < density) passive(x, r.y + r.h + off, false);
      }
      for (let y = r.y - 1; y < r.y + r.h + 1; y += 1.4) {
        if (rnd() < density) passive(r.x - off - 0.5, y, true);
        if (rnd() < density) passive(r.x + r.w + off, y, true);
      }
    }
  };
  for (const p of parts.slice()) {
    if (p.kind === 'chip' || p.kind === 'qfp' || p.kind === 'soic' || p.kind === 'crystal') rowsAround(p, 2, 0.75);
    if (p.kind === 'header' || p.kind === 'usbc' || p.kind === 'sata') rowsAround(p, 1, 0.3);
    if (p.kind === 'chipset' || p.kind === 'm2' || p.kind === 'power') rowsAround(p, 1, 0.22);
  }
  // SOT-23 transistors and a few small chips in open areas
  for (let n = 0, tries = 0; n < 70 && tries < 4000; tries++) {
    const x = rr(4, 240), y = rr(4, 300);
    const vert = rnd() < 0.5;
    const r: Rect = vert ? { x, y, w: 1.4, h: 3 } : { x, y, w: 3, h: 1.4 };
    if (!freeRect(r, 0.8)) continue;
    add('sot', r.x, r.y, r.w, r.h, 1.1, { vertical: vert }, 0.3);
    n++;
  }
  for (let n = 0, tries = 0; n < 22 && tries < 3000; tries++) {
    const s = pick([3, 3, 4, 5]);
    const r: Rect = { x: rr(4, 238), y: rr(4, 298), w: s, h: s };
    if (!freeRect(r, 2.5)) continue;
    add('chip', r.x, r.y, r.w, r.h, 0.85, { dot: rnd() < 0.6 }, 0.5);
    rowsAround(r, 1, 0.6);
    n++;
  }
  for (let n = 0, tries = 0; n < 520 && tries < 30000; tries++) {
    const big = rnd() < 0.25;
    if (passive(rr(3, 240), rr(3, 301), rnd() < 0.5, big)) n++;
  }

  // ======= free routing: short 45-degree traces between small parts =======
  const DIRS: Pt[] = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]].map(
    ([x, y]) => [x / Math.hypot(x, y), y / Math.hypot(x, y)] as Pt,
  );
  const route = (sx: number, sy: number, d0: number, w: number) => {
    const pts: Pt[] = [[sx, sy]];
    let d = d0, x = sx, y = sy, total = 0;
    const segs = ri(1, 4);
    for (let s = 0; s < segs; s++) {
      const len = s === 0 ? rr(1.5, 9) : rr(2, 22);
      const [dx, dy] = DIRS[d];
      let ok = 0;
      const n = Math.ceil(len / RES);
      for (let k = 1; k <= n; k++) {
        const px = x + dx * k * RES, py = y + dy * k * RES;
        if (!freeDisc(px, py, w / 2 + 0.22)) break;
        ok = k;
      }
      if (ok < 4) break;
      const back = Math.min(ok, 2);
      x += dx * (ok - back) * RES;
      y += dy * (ok - back) * RES;
      total += (ok - back) * RES;
      pts.push([x, y]);
      d = (d + pick([1, -1, 1, -1, 2, -2]) + 8) % 8;
    }
    if (total < 3 || pts.length < 2) return false;
    const glow = rnd() < 0.07;
    trace(pts, w, glow);
    const e = pts[pts.length - 1];
    via(e[0], e[1], 0.3, glow);
    return true;
  };
  // start from the ends of small parts and the edges of chips
  for (const p of parts.slice()) {
    const small = p.kind === 'mlcc' || p.kind === 'res' || p.kind === 'sot';
    const chip = p.kind === 'chip' || p.kind === 'qfp' || p.kind === 'soic' || p.kind === 'header' || p.kind === 'crystal';
    if (!small && !chip) continue;
    const tries = small ? (rnd() < 0.45 ? 1 : 0) : ri(3, 9);
    for (let t = 0; t < tries; t++) {
      const side = ri(0, 3);
      const sx = side === 0 ? p.x - 0.4 : side === 1 ? p.x + p.w + 0.4 : rr(p.x, p.x + p.w);
      const sy = side === 2 ? p.y - 0.4 : side === 3 ? p.y + p.h + 0.4 : rr(p.y, p.y + p.h);
      const d0 = side === 0 ? 4 : side === 1 ? 0 : side === 2 ? 6 : 2;
      route(sx, sy, d0, pick([0.16, 0.18, 0.2, 0.25, 0.3, 0.4]));
    }
  }
  for (let n = 0, tries = 0; n < 260 && tries < 8000; tries++) {
    const x = rr(3, 241), y = rr(3, 302);
    if (!freeDisc(x, y, 0.8)) continue;
    if (route(x, y, ri(0, 7), pick([0.16, 0.2, 0.25]))) {
      vias.push({ x, y, r: 0.3 });
      n++;
    }
  }

  // ======= ground stitching =======
  for (let x = 3; x < W - 3; x += 2.3) {
    if (freeDisc(x, 1.9, 0.5)) via(x, 1.9, 0.28);
    if (freeDisc(x, H - 1.9, 0.5)) via(x, H - 1.9, 0.28);
  }
  for (let y = 3; y < H - 3; y += 2.3) if (freeDisc(W - 1.9, y, 0.5)) via(W - 1.9, y, 0.28);
  for (let n = 0, tries = 0; n < 650 && tries < 20000; tries++) {
    const x = rr(2, 242), y = rr(2, 303);
    if (freeDisc(x, y, 0.75)) {
      via(x, y, pick([0.26, 0.3, 0.3, 0.38]));
      n++;
    }
  }

  // designators next to small parts (sparse; real boards drop many)
  for (const p of parts) {
    if ((p.kind === 'mlcc' || p.kind === 'res') && rnd() < 0.07) {
      const t = (p.kind === 'res' ? 'R' : 'C') + ri(100, 9999);
      label(t, p.x + p.w + 0.4, p.y + p.h, 0.75);
    }
    if (p.kind === 'chip' || p.kind === 'soic' || p.kind === 'sot') {
      if (rnd() < 0.5) label('U' + ri(1, 199), p.x, p.y - 0.5, 0.85);
      outline(p, 0.45, 0.2);
    }
  }
  label('REV 1.02', 150, 300.5, 1.2);

  return { W, H, parts, traces, vias, holes, silkText, silkRects, silkLines, grooves, bare, leds, pulses, strips };
}
