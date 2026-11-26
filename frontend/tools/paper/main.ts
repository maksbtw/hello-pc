import * as THREE from 'three';
import { buildPaper, DEFAULTS, PAGE_RENDER, type PaperOptions, type PaperTextures } from '../../src/three/paper/sheet';
import { alphaCanvas, backCanvas, bumpCanvas, frontCanvas } from '../../src/three/paper/textures';

/**
 * Paper lab: renders the hero's cyanotype sheet (src/three/paper/sheet.ts) with its
 * procedural textures, and bakes what the page needs to render it live:
 *   - public/hero/paper-front.webp, paper-back.webp, paper-bump.webp, paper-alpha.png
 *   - public/hero/paper-flat.webp: a still of the sheet before it rolls, shown while the
 *     live scene loads (same framing, so the swap is seamless)
 *   - public/hero/paper.webp: a still of it fully rolled, for reduced motion / no WebGL
 *   - src/points/hero-paper.json: image aspect, the sheet's rect and its flat writing area
 * See README.md for the URL options.
 */

const params = new URLSearchParams(location.search);
const num = (k: string, d: number) => Number(params.get(k) ?? d);
const PPM = num('ppm', 3);

const t0 = performance.now();
const canvases = { front: frontCanvas(PPM), back: backCanvas(PPM / 2), bump: bumpCanvas(PPM), alpha: alphaCanvas(PPM) };
const tex = (c: HTMLCanvasElement, srgb: boolean) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};
const textures: PaperTextures = {
  front: tex(canvases.front, true),
  back: tex(canvases.back, true),
  bump: tex(canvases.bump, false),
  alpha: tex(canvases.alpha, false),
};
console.log('textures in', Math.round(performance.now() - t0), 'ms');

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
const look: Partial<PaperOptions> = {
  exposure: num('exp', DEFAULTS.exposure),
  key: num('key', DEFAULTS.key),
  keyPos: [num('kx', DEFAULTS.keyPos[0]), num('ky', DEFAULTS.keyPos[1]), num('kz', DEFAULTS.keyPos[2])],
  env: num('env', DEFAULTS.env),
  shadow: num('shadow', DEFAULTS.shadow),
  soft: num('soft', DEFAULTS.soft),
  ao: num('ao', DEFAULTS.ao),
  bump: num('bump', DEFAULTS.bump),
  tilt: num('tilt', DEFAULTS.tilt),
};
const paper = buildPaper(renderer, textures, look);
const RW = num('rw', 3600), RH = Math.round(RW / paper.meta.aspect);
renderer.setSize(RW, RH, false);

// ---------- view ----------
const out = document.getElementById('out') as HTMLCanvasElement;
out.width = RW;
out.height = RH;
const octx = out.getContext('2d')!;
function show(p: number) {
  paper.setRoll(p);
  paper.render();
  octx.clearRect(0, 0, RW, RH);
  octx.drawImage(renderer.domElement, 0, 0);
  if (params.has('guides')) {
    octx.strokeStyle = 'rgba(255,220,120,.8)';
    octx.lineWidth = 3;
    for (const r of [paper.meta.sheet, paper.meta.content]) octx.strokeRect(r.x * RW, r.y * RH, r.w * RW, r.h * RH);
  }
}
show(num('p', 1));

// ?play animates the roll in the lab, like the page does
if (params.has('play')) {
  const start = performance.now() + 600;
  const tick = (now: number) => {
    const u = Math.min(1, Math.max(0, (now - start) / 1300));
    show(u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
    if (u < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ---------- export ----------
const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};
const scaled = (src: HTMLCanvasElement, w: number) => {
  const c = canvas(w, Math.round((w * src.height) / src.width));
  const g = c.getContext('2d')!;
  g.imageSmoothingQuality = 'high';
  g.drawImage(src, 0, 0, c.width, c.height);
  return c;
};
const blob = (c: HTMLCanvasElement, type: string, q?: number) => new Promise<Blob>((r) => c.toBlob((b) => r(b!), type, q));
async function save(name: string, body: Blob | string) {
  return (await fetch(`/__save?name=${name}`, { method: 'POST', body })).text();
}
/**
 * The page's stills, rendered as the page renders them: from the texture files it loads,
 * with its render settings (PAGE_RENDER), at about its size. So the still shown while the
 * live scene loads matches it 1:1, shadows included.
 */
async function pageStills(ow: number) {
  const loader = new THREE.TextureLoader();
  const v = Date.now();
  const load = (name: string, srgb: boolean) =>
    loader.loadAsync(`/hero/${name}?v=${v}`).then((t) => {
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    });
  const [front, back, bump, alpha] = await Promise.all([
    load('paper-front.webp', true),
    load('paper-back.webp', true),
    load('paper-bump.webp', false),
    load('paper-alpha.png', false),
  ]);
  const page = buildPaper(renderer, { front, back, bump, alpha }, { ...look, ...PAGE_RENDER });
  renderer.setSize(ow, Math.round(ow / page.meta.aspect), false);
  const shot = (p: number) => {
    page.setRoll(p);
    page.render();
    return scaled(renderer.domElement, ow);
  };
  const out = { rolled: shot(1), flat: shot(0), meta: page.meta };
  renderer.setSize(RW, RH, false);
  [front, back, bump, alpha].forEach((t) => t.dispose());
  return out;
}
async function exportAll() {
  const ow = num('ow', 2600), tw = num('tw', 2400);
  const log = [
    await save('paper-front.webp', await blob(scaled(canvases.front, tw), 'image/webp', 0.84)),
    await save('paper-back.webp', await blob(scaled(canvases.back, tw / 2), 'image/webp', 0.84)),
    await save('paper-bump.webp', await blob(scaled(canvases.bump, tw / 2), 'image/webp', 0.82)),
    await save('paper-alpha.png', await blob(scaled(canvases.alpha, tw), 'image/png')),
  ];
  const stills = await pageStills(ow);
  log.push(
    await save('paper.webp', await blob(stills.rolled, 'image/webp', num('q', 0.86))),
    await save('paper-flat.webp', await blob(stills.flat, 'image/webp', num('q', 0.86))),
    await save('hero-paper.json', JSON.stringify(stills.meta, null, 2)),
  );
  show(1);
  console.log(log);
  return log;
}
document.getElementById('save')!.onclick = () => exportAll();
Object.assign(window, { exportAll, show, __ready: true });
