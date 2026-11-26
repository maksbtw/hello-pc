import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import meta from './hero-paper.json';
import './heroPaper.css';

/**
 * Hero: the cyanotype sheet lying on the cutting mat (src/three/paper/sheet.ts). It arrives
 * flat, then its back edge curls up into a roll at the top right, rendered live in WebGL.
 *
 * Mat and sheet appear in the same frame: the still of the flat sheet is preloaded
 * (index.html) and the hero stays covered only until it is ready. The live scene loads
 * behind it, with the same framing, and takes over seamlessly before the roll starts.
 * Reduced motion (or no WebGL) gets a still of the rolled sheet instead. The scene stops
 * rendering once the roll settles.
 *
 * The scene is built once per page and kept: coming back to the hero reattaches it, already
 * rolled, so the flight back costs one render. It is never built while the camera is flying
 * (that would drop frames); arriving from elsewhere, it is built and rolls once you land.
 *
 * The sheet is fitted into the hero with a margin; `children` go in a layer over its flat
 * writing area (clear of the roll, the folded corner and the tape), turned with it.
 */

const FLAT = '/hero/paper-flat.webp', ROLLED = '/hero/paper.webp';
const TEX = { front: '/hero/paper-front.webp', back: '/hero/paper-back.webp', bump: '/hero/paper-bump.webp', alpha: '/hero/paper-alpha.png' };
const BOX = { x0: 0.035, x1: 0.965, y0: 0.06, y1: 0.95 }; // where the sheet may sit, in % of the hero
const DELAY = 300, DURATION = 1300; // ms: a beat lying flat, then the curl

const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

type Box = { left: number; top: number; width: number; height: number };

// ---------- the scene, kept for the page's lifetime ----------

/** three.js, the sheet module and the textures: fetched once, safe to start mid-flight */
let assets: ReturnType<typeof loadAssets> | null = null;
async function loadAssets() {
  const [THREE, { buildPaper, PAGE_RENDER }] = await Promise.all([import('three'), import('../three/paper/sheet')]);
  const loader = new THREE.TextureLoader();
  const load = (url: string, srgb: boolean) =>
    loader.loadAsync(url).then((t) => {
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      return t;
    });
  const [front, back, bump, alpha] = await Promise.all([load(TEX.front, true), load(TEX.back, true), load(TEX.bump, false), load(TEX.alpha, false)]);
  return { THREE, buildPaper, PAGE_RENDER, tex: { front, back, bump, alpha } };
}

type Scene = {
  canvas: HTMLCanvasElement;
  paper: { setRoll(p: number): void; readonly roll: number; render(): void };
  fit(w: number, h: number): void;
};
let scene: Scene | null = null;

/** the heavy part (geometry, shadows, shader compiles): only once the camera has landed */
async function buildScene(): Promise<Scene> {
  if (scene) return scene;
  const { THREE, buildPaper, PAGE_RENDER, tex } = await (assets ??= loadAssets());
  if (scene) return scene;
  const canvas = document.createElement('canvas');
  canvas.className = 'hpr-img';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const paper = buildPaper(renderer, tex, PAGE_RENDER);
  paper.setRoll(0);
  let size = [0, 0];
  const fit = (w: number, h: number) => {
    if (w === size[0] && h === size[1]) return;
    size = [w, h];
    renderer.setSize(w, h, false);
    paper.render();
  };
  return (scene = { canvas, paper, fit });
}

/** resolves once the workspace camera isn't flying */
function settled(el: Element, signal: { disposed: boolean }) {
  const root = el.closest('.ws-root');
  return new Promise<void>((resolve) => {
    if (!root?.hasAttribute('data-moving')) return resolve();
    const mo = new MutationObserver(() => {
      if (signal.disposed || !root.hasAttribute('data-moving')) {
        mo.disconnect();
        resolve();
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ['data-moving'] });
  });
}

// ---------- the hero ----------

function layout(w: number, h: number) {
  const bw = (BOX.x1 - BOX.x0) * w, bh = (BOX.y1 - BOX.y0) * h;
  const { sheet, aspect } = meta;
  const iw = Math.min(bw / sheet.w, (bh * aspect) / sheet.h), ih = iw / aspect;
  const cx = ((BOX.x0 + BOX.x1) / 2) * w, cy = ((BOX.y0 + BOX.y1) / 2) * h;
  const left = cx - (sheet.x + sheet.w / 2) * iw, top = cy - (sheet.y + sheet.h / 2) * ih;
  const c = meta.content;
  return {
    img: { left, top, width: iw, height: ih } as Box,
    content: { left: left + c.x * iw, top: top + c.y * ih, width: c.w * iw, height: c.h * ih } as Box,
  };
}

export default function HeroPaperRender({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [shown, setShown] = useState(false); // the still is ready: show mat and sheet together
  const [live, setLive] = useState(() => !!scene); // the WebGL scene has taken over from the still
  const [failed, setFailed] = useState(false);
  const useScene = !reduced && !failed;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setSize({ w: el.clientWidth, h: el.clientHeight }); // before the first paint, so a kept scene shows at once
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lay = size ? layout(size.w, size.h) : null;

  // put the scene's canvas in place, sized to the sheet's box, before paint
  useLayoutEffect(() => {
    if (!useScene || !live || !scene || !lay || !slotRef.current) return;
    const { canvas } = scene;
    if (canvas.parentNode !== slotRef.current) slotRef.current.appendChild(canvas);
    const b = lay.img;
    Object.assign(canvas.style, { left: `${b.left}px`, top: `${b.top}px`, width: `${b.width}px`, height: `${b.height}px` });
    scene.fit(b.width, b.height);
  });

  useEffect(() => {
    if (!useScene) return;
    const signal = { disposed: false };
    let raf = 0;
    if (scene) {
      // coming back: the sheet has already rolled
      if (scene.paper.roll < 1) {
        scene.paper.setRoll(1);
        scene.paper.render();
      }
      return;
    }
    assets ??= loadAssets(); // downloads may run while the camera flies in
    (async () => {
      try {
        await settled(ref.current!, signal);
        if (signal.disposed) return;
        const s = await buildScene();
        if (signal.disposed) return;
        setLive(true);
        const start = performance.now() + DELAY;
        const tick = (now: number) => {
          const u = Math.min(1, Math.max(0, (now - start) / DURATION));
          s.paper.setRoll(easeInOut(u));
          s.paper.render();
          if (u < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (err) {
        console.warn('paper: falling back to the still', err);
        if (!signal.disposed) setFailed(true);
      }
    })();
    return () => {
      signal.disposed = true;
      cancelAnimationFrame(raf);
    };
  }, [useScene]);

  const still = useScene ? FLAT : ROLLED;
  return (
    <div ref={ref} className="hero-paper">
      {lay && (
        <>
          {!(useScene && live) && (
            <img
              className="hpr-img"
              src={still}
              alt=""
              draggable={false}
              {...{ fetchpriority: 'high' }}
              onLoad={() => setShown(true)}
              onError={() => setShown(true)}
              style={lay.img}
            />
          )}
          <div ref={slotRef} className="hpr-slot" />
          <div className="hp-content" style={{ ...lay.content, transform: `rotate(${-meta.tilt}deg)` }}>
            {children}
          </div>
        </>
      )}
      {!shown && !(useScene && live) && <div className="hpr-cover" aria-hidden />}
    </div>
  );
}
