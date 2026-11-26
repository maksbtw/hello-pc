import { D, FOLD_T, L, R, W, fbm, hash, mulberry32, outline, smooth } from './sheet';

/**
 * Procedural textures for the cyanotype sheet: exposure blotches, grain, fibres, bleached
 * edges, fold wear, a water stain, handling smudges; the paler back; the paper's tooth; the
 * torn outline. Slow (seconds), so the lab bakes them to images and the page loads those.
 * Canvas top is the sheet's back edge; `ppm` is texture px per mm.
 */

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};
const size = (ppm: number) => [Math.round(W * ppm), Math.round(D * ppm)] as const;

export function alphaCanvas(ppm: number) {
  const [tw, th] = size(ppm);
  const c = canvas(tw, th);
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, tw, th);
  g.fillStyle = '#fff';
  g.beginPath();
  outline.forEach(([x, t], i) => (i ? g.lineTo((x - L) * ppm, (D - t) * ppm) : g.moveTo((x - L) * ppm, (D - t) * ppm)));
  g.closePath();
  g.fill();
  return c;
}

/** short paper fibres, a few light and a few dark */
function fibres(g: CanvasRenderingContext2D, ppm: number, light: string, dark: string) {
  const [tw, th] = size(ppm);
  const r = mulberry32(77);
  g.lineCap = 'round';
  for (let i = 0; i < 9000; i++) {
    const x = r() * tw, y = r() * th;
    const l = (0.8 + r() * 3.2) * ppm, a = r() * Math.PI;
    g.strokeStyle = r() < 0.75 ? light : dark;
    g.lineWidth = (0.35 + r() * 0.5) * (ppm / 3);
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
}

export function frontCanvas(ppm: number) {
  const [tw, th] = size(ppm);
  const c = canvas(tw, th);
  const g = c.getContext('2d')!;
  const img = g.createImageData(tw, th);
  const px = img.data;
  const stain = { x: 230, t: 190, r: 58 };
  for (let py = 0; py < th; py++) {
    const t = D - py / ppm;
    for (let qx = 0; qx < tw; qx++) {
      const x = L + qx / ppm;
      // uneven exposure: slow blotches, a little greener in places
      const b = fbm(x / 210, t / 210, 1);
      const gshift = fbm(x / 340 + 9, t / 340, 2) - 0.5;
      const k = 0.86 + 0.26 * b;
      let r = 30 * k, gg = 93 * k + gshift * 10, bb = 113 * k - gshift * 4;
      // edges bleached where light reached them
      const e = Math.min(x - L, R - x, t, D - t);
      const bleach = Math.exp(-e / 22) * (0.55 + 0.45 * fbm(x / 40, t / 40, 5, 3)) * 0.4;
      r += (78 - r) * bleach;
      gg += (138 - gg) * bleach;
      bb += (150 - bb) * bleach;
      // fold wear: whitened fibres along the creases, worst where they cross
      const broken = smooth(0.35, 0.7, fbm(x / 14, t / 14, 7, 3));
      const fv = Math.exp(-Math.abs(x) / 0.8), fh = Math.exp(-Math.abs(t - FOLD_T) / 0.8);
      const cross = Math.exp(-(x * x + (t - FOLD_T) ** 2) / (2 * 14 * 14));
      const wear = Math.min(1, (fv + fh) * (0.25 + 0.5 * broken) + cross * 0.35 * broken) * 0.55;
      r += (150 - r) * wear;
      gg += (190 - gg) * wear;
      bb += (200 - bb) * wear;
      // an old water stain: a broken tide line with a paler inside
      const sx = x - stain.x, st = t - stain.t;
      const sd = Math.hypot(sx, st), sa = Math.atan2(st, sx);
      const sr = stain.r * (0.86 + 0.28 * fbm(Math.cos(sa) * 1.6 + 4, Math.sin(sa) * 1.6, 9, 3));
      const tide = Math.exp(-(((sd - sr) / 2.4) ** 2)) * 0.07 * (0.4 + 0.6 * fbm(Math.cos(sa) * 5, Math.sin(sa) * 5, 12, 2));
      const inside = sd < sr ? 0.035 * 40 : 0;
      r = r * (1 - tide) + inside;
      gg = gg * (1 - tide) + inside;
      bb = bb * (1 - tide) + inside;
      // handling: faint darker smudges near the corners people hold
      const sm =
        Math.exp(-((x - (R - 70)) ** 2 + (t - 80) ** 2) / (2 * 60 * 60)) * 0.07 +
        Math.exp(-((x - (L + 90)) ** 2 + (t - (D - 110)) ** 2) / (2 * 70 * 70)) * 0.05;
      const smk = 1 - sm * fbm(x / 18, t / 18, 11, 3) * 1.6;
      const n = (hash(qx, py, 3) - 0.5) * 9; // grain
      const o = (py * tw + qx) * 4;
      px[o] = r * smk + n;
      px[o + 1] = gg * smk + n;
      px[o + 2] = bb * smk + n;
      px[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  fibres(g, ppm, 'rgba(190,225,235,0.07)', 'rgba(5,30,40,0.06)');
  return c;
}

export function backCanvas(ppm: number) {
  const [w, h] = size(ppm);
  const c = canvas(w, h);
  const g = c.getContext('2d')!;
  const img = g.createImageData(w, h);
  const px = img.data;
  for (let py = 0; py < h; py++) {
    const t = D - py / ppm;
    for (let qx = 0; qx < w; qx++) {
      const x = L + qx / ppm;
      const b = fbm(x / 180, t / 180, 31);
      const bleed = fbm(x / 90, t / 90, 33, 3); // the print's blue soaking through
      const k = 0.94 + 0.08 * b;
      const n = (hash(qx, py, 8) - 0.5) * 7;
      const crease = Math.exp(-Math.abs(x) / 1.2) + Math.exp(-Math.abs(t - FOLD_T) / 1.2);
      const o = (py * w + qx) * 4;
      px[o] = (204 - bleed * 14) * k + n - crease * 22;
      px[o + 1] = (211 - bleed * 6) * k + n - crease * 18;
      px[o + 2] = (205 + bleed * 2) * k + n - crease * 14;
      px[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c;
}

/** the paper's tooth, plus the creases pressed in */
export function bumpCanvas(ppm: number) {
  const [tw, th] = size(ppm);
  const c = canvas(tw, th);
  const g = c.getContext('2d')!;
  const img = g.createImageData(tw, th);
  const px = img.data;
  const f = 3 / ppm; // keep the tooth the same size in mm at any resolution
  for (let py = 0; py < th; py++) {
    const t = D - py / ppm;
    for (let qx = 0; qx < tw; qx++) {
      const x = L + qx / ppm;
      const tooth = fbm((qx * f) / 2.2, (py * f) / 2.2, 41, 2) * 0.6 + hash(qx, py, 43) * 0.4;
      const crease = Math.exp(-Math.abs(x) / 0.7) + Math.exp(-Math.abs(t - FOLD_T) / 0.7);
      const v = 128 + (tooth - 0.5) * 70 - crease * 60;
      const o = (py * tw + qx) * 4;
      px[o] = px[o + 1] = px[o + 2] = v;
      px[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  fibres(g, ppm, 'rgba(255,255,255,0.18)', 'rgba(0,0,0,0.12)');
  return c;
}
