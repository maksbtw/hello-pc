import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { buildBoard } from './layout';
import { paintGlow, paintPcb } from './pcb';
import { buildScene } from './scene';

const params = new URLSearchParams(location.search);
const S = Number(params.get('s') ?? 12); // px per mm of the final render

const board = buildBoard();
const maps = paintPcb(board, S);
const W = Math.round(board.W * S), H = Math.round(board.H * S);

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = Number(params.get('exp') ?? 1.05);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#050605');
const pmrem = new THREE.PMREMGenerator(renderer);
/** A dark studio: one big softbox up and to the top-left, two strip lights, faint fill. */
function studio() {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), new THREE.MeshBasicMaterial({ color: '#0a0a0b', side: THREE.BackSide })));
  const panel = (w: number, h: number, x: number, y: number, z: number, k: number, color = '#ffffff') => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }),
    );
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    s.add(m);
  };
  panel(42, 30, -26, 48, -22, Number(params.get('box') ?? 2.2), '#fff7ee');
  panel(8, 70, -48, 22, 4, 2.4);
  panel(70, 7, 6, 20, -48, 1.2, '#e8f0ff');
  panel(50, 50, 30, 45, 30, 0.12);
  return pmrem.fromScene(s, 0.02).texture;
}
const envTex = params.get('room') ? pmrem.fromScene(new RoomEnvironment(), 0.03).texture : studio();
const envK = Number(params.get('env') ?? 1);
const boardRoot = buildScene(board, maps);
scene.add(boardRoot);
// Per-material env maps (scene.environment would override each material's intensity).
boardRoot.traverse((o) => {
  const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] | undefined;
  for (const mm of Array.isArray(m) ? m : m ? [m] : []) {
    if (!mm.isMeshStandardMaterial || mm.envMap) continue;
    mm.envMap = envTex;
    mm.envMapIntensity *= envK;
    mm.needsUpdate = true;
  }
});

// Key light from the top-left (a softbox), weak fill from the other side.
const key = new THREE.DirectionalLight('#fff6ec', Number(params.get('key') ?? 2.6));
key.position.set(-110, 380, -150);
key.castShadow = true;
key.shadow.mapSize.set(4096, 4096);
key.shadow.camera.left = -200;
key.shadow.camera.right = 200;
key.shadow.camera.top = 200;
key.shadow.camera.bottom = -200;
key.shadow.camera.near = 10;
key.shadow.camera.far = 900;
key.shadow.bias = -0.0002;
key.shadow.radius = 14;
key.shadow.blurSamples = 24;
scene.add(key);
const fill = new THREE.DirectionalLight('#dfe8ff', 0.5);
fill.position.set(200, 220, 160);
scene.add(fill);
scene.add(new THREE.HemisphereLight('#ffffff', '#202020', Number(params.get('hemi') ?? 0.08)));

// A long lens straight above the centre: the board plane maps to the image with a plain
// scale (so the glow layer lines up exactly), while tall parts show a little of their sides.
const FOV = Number(params.get('fov') ?? 26);
const camH = board.H / 2 / Math.tan(((FOV / 2) * Math.PI) / 180);
const cam = new THREE.PerspectiveCamera(FOV, board.W / board.H, camH * 0.5, camH * 1.5);
cam.position.set(0, camH, 0);
cam.up.set(0, 0, -1);
cam.lookAt(0, 0, 0);

const target = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const composer = new EffectComposer(renderer, target);
composer.setPixelRatio(1);
composer.setSize(W, H);
composer.addPass(new RenderPass(scene, cam));
const ao = new GTAOPass(scene, cam, W, H);
ao.blendIntensity = Number(params.get('ao') ?? 0.9);
ao.updateGtaoMaterial({ radius: 3.5, distanceExponent: 1.5, thickness: 2, scale: 1, samples: 16 });
ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
composer.addPass(ao);
composer.addPass(new OutputPass());
composer.render();

// ---- views ----
const out = document.getElementById('out') as HTMLCanvasElement;
out.width = W;
out.height = H;
const octx = out.getContext('2d')!;
const glow = paintGlow(board, S);
const boardImg = document.createElement('canvas');
boardImg.width = W;
boardImg.height = H;
boardImg.getContext('2d')!.drawImage(renderer.domElement, 0, 0);

function show(view: string) {
  octx.globalCompositeOperation = 'source-over';
  octx.globalAlpha = 1;
  octx.fillStyle = '#09090b';
  octx.fillRect(0, 0, W, H);
  if (view === 'board' || view === 'mix') {
    octx.globalAlpha = view === 'mix' ? 0.12 : 1;
    octx.drawImage(boardImg, 0, 0);
  }
  if (view === 'glow' || view === 'mix') {
    octx.globalAlpha = 1;
    octx.globalCompositeOperation = 'lighter';
    octx.drawImage(glow, 0, 0);
  }
}
show(params.get('view') ?? 'board');
document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((b) => (b.onclick = () => show(b.dataset.view!)));

// ---- export into public/hero ----
async function save(name: string, blob: Blob | string) {
  const r = await fetch(`/__save?name=${name}`, { method: 'POST', body: blob });
  return r.text();
}
const toBlob = (c: HTMLCanvasElement, type: string, q: number) =>
  new Promise<Blob>((res) => c.toBlob((b) => res(b!), type, q));
function scaled(src: HTMLCanvasElement, w: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = Math.round((src.height * w) / src.width);
  const g = c.getContext('2d')!;
  g.imageSmoothingQuality = 'high';
  g.drawImage(src, 0, 0, c.width, c.height);
  return c;
}
/** The part of the board the hero shows (mm); exported images are cropped to it. */
const CROP = { x: 0, y: 0, w: board.W, h: board.H }; // the hero scrolls the whole board
function cropped(src: HTMLCanvasElement, w: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = Math.round((CROP.h * w) / CROP.w);
  const g = c.getContext('2d')!;
  g.imageSmoothingQuality = 'high';
  g.drawImage(src, CROP.x * S, CROP.y * S, CROP.w * S, CROP.h * S, 0, 0, c.width, c.height);
  return c;
}
async function exportAll() {
  const ow = Number(params.get('ow') ?? 2400);
  const q = Number(params.get('q') ?? 0.74);
  const log: string[] = [];
  log.push(await save('board.webp', await toBlob(cropped(boardImg, ow), 'image/webp', q)));
  log.push(await save('board-glow.webp', await toBlob(cropped(glow, ow), 'image/webp', 0.8)));
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const inCrop = ([x, y]: number[]) => x >= CROP.x && x <= CROP.x + CROP.w && y >= CROP.y && y <= CROP.y + CROP.h;
  const meta = {
    crop: CROP,
    leds: board.leds.filter((l) => inCrop([l.x, l.y])).map((l) => ({ x: r2(l.x), y: r2(l.y), color: l.color })),
    pulses: board.pulses.map((p) => p.map(([x, y]) => [r2(x), r2(y)])),
    // strips sit on top of tall parts: project them through the camera into board space
    strips: board.strips.map((st) =>
      st.pts.map(([x, y]) => {
        const v = new THREE.Vector3(x - board.W / 2, st.z, y - board.H / 2).project(cam);
        return [r2(((v.x + 1) / 2) * board.W), r2(((1 - v.y) / 2) * board.H)];
      }),
    ),
  };
  log.push(await save('hero-board.json', JSON.stringify(meta)));
  return log;
}
document.getElementById('save')!.onclick = () => exportAll().then((l) => console.log(l));
/** Saves a crop (board mm) of the current view as a debug PNG next to the outputs. */
async function dbg(name: string, x: number, y: number, w: number, h: number, outW: number) {
  const c = document.createElement('canvas');
  c.width = outW;
  c.height = Math.round((h * outW) / w);
  const g = c.getContext('2d')!;
  g.imageSmoothingQuality = 'high';
  g.drawImage(out, x * S, y * S, w * S, h * S, 0, 0, c.width, c.height);
  return save(`_dbg-${name}.png`, await toBlob(c, 'image/png', 1));
}
Object.assign(window, { exportAll, board, dbg, show, __ready: true });
