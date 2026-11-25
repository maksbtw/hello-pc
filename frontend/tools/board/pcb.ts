import type { Board, Part, Pt } from './layout';

/**
 * Paints the bare PCB (copper under solder mask, vias, pads, silkscreen) into texture
 * canvases at S px/mm, plus the glow layer: the same traces and vias, lit.
 * Every layer comes from the same geometry, so they line up exactly.
 */

type Pal = {
  base: string; // laminate under mask (no copper)
  copper: string; // copper under mask (pour + traces)
  pad: string; // exposed tin pads
  gold: string; // exposed gold (ENIG) pads / hole rings
  drill: string;
  silk: string;
  dimple: string; // tented via centre
};

const SMALL = new Set(['mlcc', 'res', 'cap0201', 'led', 'sot']);

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function poly(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
}

function paintLayer(ctx: CanvasRenderingContext2D, b: Board, pal: Pal, withSilk: boolean) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // laminate, then the ground pour over everything except the edge and bare zones
  ctx.fillStyle = pal.base;
  ctx.fillRect(0, 0, b.W, b.H);
  ctx.fillStyle = pal.copper;
  ctx.fillRect(0.7, 0.7, b.W - 1.4, b.H - 1.4);
  ctx.fillStyle = pal.base;
  for (const z of b.bare) {
    poly(ctx, z);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = pal.base;
  ctx.lineWidth = 0.45;
  for (const g of b.grooves) {
    poly(ctx, g);
    ctx.stroke();
  }
  // clearance around every trace and via, then the copper itself
  for (const t of b.traces) {
    ctx.strokeStyle = pal.base;
    ctx.lineWidth = t.w + 0.42;
    poly(ctx, t.pts);
    ctx.stroke();
  }
  for (const v of b.vias) {
    ctx.fillStyle = pal.base;
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.r + 0.22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = pal.copper;
  for (const t of b.traces) {
    ctx.lineWidth = t.w;
    poly(ctx, t.pts);
    ctx.stroke();
  }
  for (const v of b.vias) {
    ctx.fillStyle = pal.copper;
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.dimple;
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.r * 0.42, 0, Math.PI * 2);
    ctx.fill();
  }
  // exposed pads under small parts (a little wider than the part)
  for (const p of b.parts) {
    if (!SMALL.has(p.kind) || p.kind === 'sot') continue;
    ctx.fillStyle = pal.pad;
    const vert = p.h > p.w;
    const e = 0.18;
    if (vert) {
      ctx.fillRect(p.x - e, p.y - e, p.w + 2 * e, p.h * 0.32 + e);
      ctx.fillRect(p.x - e, p.y + p.h * 0.68, p.w + 2 * e, p.h * 0.32 + e);
    } else {
      ctx.fillRect(p.x - e, p.y - e, p.w * 0.32 + e, p.h + 2 * e);
      ctx.fillRect(p.x + p.w * 0.68, p.y - e, p.w * 0.32 + e, p.h + 2 * e);
    }
  }
  // plated mounting holes and cooler holes
  for (const [x, y] of b.holes) {
    ctx.fillStyle = pal.gold;
    ctx.beginPath();
    ctx.arc(x, y, 3.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.drill;
    ctx.beginPath();
    ctx.arc(x, y, 1.98, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!withSilk) return;
  ctx.strokeStyle = pal.silk;
  ctx.fillStyle = pal.silk;
  ctx.lineWidth = 0.16;
  for (const r of b.silkRects) {
    ctx.beginPath();
    ctx.roundRect(r.x, r.y, r.w, r.h, r.r ?? 0);
    ctx.stroke();
  }
  for (const l of b.silkLines) {
    poly(ctx, l);
    ctx.stroke();
  }
  // pin-1 triangles and polarity marks next to chips and caps
  for (const p of b.parts) {
    if (p.kind === 'chip' || p.kind === 'qfp' || p.kind === 'soic') {
      ctx.beginPath();
      ctx.arc(p.x - 0.9, p.y - 0.9, 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
    if (p.kind === 'cap' || p.kind === 'audiocap') {
      const cx = p.x + p.w / 2, cy = p.y + p.h / 2, r = p.w / 2 + 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI * 0.6, Math.PI * 1.4);
      ctx.arc(cx, cy, r - 0.6, Math.PI * 1.4, Math.PI * 0.6, true);
      ctx.fill();
    }
  }
  for (const s of b.silkText) {
    ctx.save();
    ctx.translate(s.x, s.y);
    if (s.rot) ctx.rotate(s.rot);
    ctx.font = `600 ${s.s}px "Arial Narrow", "Roboto Condensed", "Helvetica Neue", Arial, sans-serif`;
    ctx.textAlign = s.align ?? 'left';
    ctx.fillText(s.t, 0, 0);
    ctx.restore();
  }
}

export type PcbMaps = {
  color: HTMLCanvasElement;
  height: HTMLCanvasElement;
  rough: HTMLCanvasElement;
  metal: HTMLCanvasElement;
};

export function paintPcb(b: Board, S: number): PcbMaps {
  const make = (pal: Pal, silk = true, blur = 0) => {
    const c = canvas(Math.round(b.W * S), Math.round(b.H * S));
    const ctx = c.getContext('2d')!;
    ctx.scale(S, S);
    paintLayer(ctx, b, pal, silk);
    if (blur > 0) {
      const d = canvas(c.width, c.height);
      const dc = d.getContext('2d')!;
      dc.filter = `blur(${blur}px)`;
      dc.drawImage(c, 0, 0);
      return d;
    }
    return c;
  };

  const color = make({
    base: '#0a0f0c',
    copper: '#111a15',
    pad: '#b9b7ae',
    gold: '#c8a45c',
    drill: '#030303',
    silk: '#d9dbd4',
    dimple: '#0d1410',
  });
  // Mask isn't perfectly even: a faint mottling, like a real board under a soft light.
  {
    const ctx = color.getContext('2d')!;
    const n = canvas(64, 80);
    const nc = n.getContext('2d')!;
    const img = nc.createImageData(64, 80);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 60;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    nc.putImageData(img, 0, 0);
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.globalCompositeOperation = 'overlay';
    ctx.imageSmoothingQuality = 'high';
    ctx.filter = `blur(${S * 2}px)`;
    ctx.drawImage(n, 0, 0, color.width, color.height);
    ctx.restore();
  }
  const height = make(
    { base: '#3c3c3c', copper: '#9a9a9a', pad: '#b4b4b4', gold: '#b4b4b4', drill: '#000', silk: '#c8c8c8', dimple: '#707070' },
    true,
    S * 0.05,
  );
  const rough = make({
    base: '#707070',
    copper: '#666',
    pad: '#5a5a5a',
    gold: '#4a4a4a',
    drill: '#fff',
    silk: '#d8d8d8',
    dimple: '#888',
  });
  const metal = make({ base: '#000', copper: '#000', pad: '#fff', gold: '#fff', drill: '#000', silk: '#000', dimple: '#000' });
  return { color, height, rough, metal };
}

/**
 * The glow layer: chosen traces and their vias as light, on transparent black, with
 * everything that sits on top of the board (parts) cut out, since they'd block it.
 */
export function paintGlow(b: Board, S: number) {
  const w = Math.round(b.W * S), h = Math.round(b.H * S);
  const core = canvas(w, h);
  const ctx = core.getContext('2d')!;
  ctx.scale(S, S);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgb(176, 236, 204)';
  ctx.fillStyle = 'rgb(176, 236, 204)';
  for (const t of b.traces) {
    if (!t.glow) continue;
    ctx.lineWidth = Math.min(0.42, Math.max(0.16, t.w * 0.9));
    poly(ctx, t.pts);
    ctx.stroke();
  }
  for (const v of b.vias) {
    if (!v.glow) continue;
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.r + 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
  const cut = (c: CanvasRenderingContext2D) => {
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'destination-out';
    c.fillStyle = '#000';
    for (const p of b.parts as Part[]) {
      if (p.kind === 'led') continue;
      c.fillRect(p.x * S, p.y * S, p.w * S, p.h * S);
    }
    c.restore();
  };
  cut(ctx);
  // halo: two blurred copies under the sharp core
  const out = canvas(w, h);
  const oc = out.getContext('2d')!;
  oc.globalCompositeOperation = 'lighter';
  oc.globalAlpha = 1;
  oc.filter = `blur(${S * 1.6}px)`;
  oc.drawImage(core, 0, 0);
  oc.drawImage(core, 0, 0);
  oc.globalAlpha = 0.9;
  oc.filter = `blur(${S * 0.3}px)`;
  oc.drawImage(core, 0, 0);
  oc.filter = 'none';
  oc.globalAlpha = 1;
  oc.drawImage(core, 0, 0);
  cut(oc);
  return out;
}
