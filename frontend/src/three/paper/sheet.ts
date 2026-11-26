import * as THREE from 'three';

/**
 * The hero's cyanotype sheet as a real bent surface, shared by the render lab (tools/paper,
 * which bakes its textures and a still) and the page (which renders it live and animates
 * the roll).
 *
 * The sheet was stored folded in four and rolled, so it doesn't lie flat: the vertical fold
 * is a ridge and the horizontal one a valley, so its panels tilt; the back edge rolls up,
 * hardly at the left and a full turn at the right; the front-left corner is folded over;
 * two strips of masking tape pin the corners. `setRoll(p)` curls the back edge from flat
 * (p = 0) to its full roll (p = 1).
 *
 * Units: mm. Flat coords: x across the sheet, t from the front edge (0) to the back edge (D).
 * World: x right, y up, z toward the bottom of the screen (the camera looks straight down).
 */

export const W = 1000, D = 600;
export const L = -W / 2, R = W / 2;
export const CUT = 34; // back-left corner, cut off with scissors
export const FOLD_T = D / 2;
export const ROLL_MAX = 118; // rolled length at the right end
const RIDGE = 12, VALLEY = 8;

// ---------- seeded randomness ----------
export function mulberry32(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hash(x: number, y: number, s: number) {
  const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return h - Math.floor(h);
}
function vnoise(x: number, y: number, s: number) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
export function fbm(x: number, y: number, s: number, oct = 4) {
  let v = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    v += amp * vnoise(x * f, y * f, s + i * 13);
    f *= 2.03;
    amp *= 0.5;
  }
  return v / (1 - Math.pow(0.5, oct));
}
export const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// ---------- outline ----------
export type P = [number, number];
const rnd = mulberry32(0x5eed1e);
function wobble(a: P, b: P, amp: number, step: number, nick = 0): P[] {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const nx = dy / len, ny = -dx / len;
  const n = Math.max(1, Math.round(len / step));
  const ph = rnd() * 50;
  const out: P[] = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    let o = amp * (fbm(t * len * 0.05 + ph, 0, 3, 3) - 0.5) * 2 * Math.sin(Math.PI * t);
    if (nick && rnd() < nick) o -= 0.6 + rnd() * 1.4;
    out.push(i === n ? b : [a[0] + dx * t + nx * o, a[1] + dy * t + ny * o]);
  }
  return out;
}
export const outline: P[] = [
  [L, 0],
  ...wobble([L, 0], [R, 0], 0.5, 6, 0.01),
  ...wobble([R, 0], [R, D], 1.6, 3, 0.06), // torn off a roll: ragged
  ...wobble([R, D], [L + CUT, D], 0.5, 6, 0.01),
  ...wobble([L + CUT, D], [L, D - CUT * 0.8], 0.3, 4),
  ...wobble([L, D - CUT * 0.8], [L, 0], 0.5, 6, 0.01),
];

// ---------- dog-ear: the front-left corner folded over along A–B ----------
const DOG_A: P = [L + 92, 0], DOG_B: P = [L, 74];
const dogSide = (x: number, t: number) => (DOG_B[0] - DOG_A[0]) * (t - DOG_A[1]) - (DOG_B[1] - DOG_A[1]) * (x - DOG_A[0]);
export const dogIn = (x: number, t: number) => dogSide(x, t) > 0; // the corner's side of A–B
function dogReflect(x: number, t: number): [number, number, number] {
  const dx = DOG_B[0] - DOG_A[0], dy = DOG_B[1] - DOG_A[1];
  const k = ((x - DOG_A[0]) * dx + (t - DOG_A[1]) * dy) / (dx * dx + dy * dy);
  const fx = DOG_A[0] + dx * k, fy = DOG_A[1] + dy * k;
  return [2 * fx - x, 2 * fy - t, Math.hypot(x - fx, t - fy)];
}

// ---------- tape, and how it pins the paper down ----------
const deg = THREE.MathUtils.degToRad;
export const TAPES = [
  { x: L + 22, t: D - 24, a: deg(-42), len: 84 }, // back-left, over the cut
  { x: R - 18, t: 22, a: deg(-50), len: 80 }, // front-right
];
const pin = (x: number, t: number) => {
  let m = 0;
  for (const tp of TAPES) m = Math.max(m, Math.exp(-((x - tp.x) ** 2 + (t - tp.t) ** 2) / (2 * 110 ** 2)));
  return 1 - m;
};

// ---------- how the sheet lies ----------
function relief(x: number, t: number) {
  const ridge = RIDGE * Math.exp(-Math.abs(x) / 210); // vertical fold: a mountain
  const valley = VALLEY * (1 - Math.exp(-Math.abs(t - FOLD_T) / 190)); // horizontal fold: a valley
  const wave = 2.2 * (fbm(x / 240 + 3, t / 240, 21, 3) - 0.5);
  return ridge + valley + wave;
}
let reliefMin = Infinity;
for (let x = L; x <= R; x += 10) for (let t = 0; t <= D; t += 10) reliefMin = Math.min(reliefMin, relief(x, t));
export const height = (x: number, t: number) => (relief(x, t) - reliefMin) * pin(x, t) + 0.15;

/** rolled length at x: hardly any at the left, a full turn at the right */
export const rollLen = (x: number) => ROLL_MAX * Math.pow(smooth(-0.15, 1.0, (x - L) / W), 1.35);
const rollR = (x: number) => 8 + 15 * smooth(0.1, 1, (x - L) / W);

/** Position of flat point (x, t) with the roll at progress p, into `out`. */
function dogPlace(x: number, t: number, out: THREE.Vector3) {
  const [rx, rt, dist] = dogReflect(x, t);
  if (dist < 4.5) {
    // right at the fold (wider than a grid cell's diagonal): sit on the line, so the crease is clean
    const fx = (x + rx) / 2, ft = (t + rt) / 2;
    return out.set(fx, height(fx, ft) + 0.3, D / 2 - ft);
  }
  const dd = dist - 4.5;
  return out.set(rx, height(rx, rt) + 0.3 + dd * 0.03 + dd * dd * 0.0016, D / 2 - rt);
}
/** roll start and its base height, per x, at progress p */
function rollAt(x: number, p: number) {
  const len = rollLen(x) * p;
  const ts = D - len;
  // it lifts as a wide, gentle curve first and winds tighter as more of it rolls
  const r0 = rollR(x) * (1 + 2.4 * (1 - p) * (1 - p));
  return { ts, r0, base: height(x, ts) };
}
function rollPlace(x: number, t: number, ra: { ts: number; r0: number; base: number }, out: THREE.Vector3) {
  const d = t - ra.ts;
  const th = d / ra.r0;
  const r = ra.r0 * (1 - 0.045 * th); // a loose spiral: the radius tightens as it winds
  return out.set(x, ra.base + r * (1 - Math.cos(th)), D / 2 - ra.ts - r * Math.sin(th));
}
export function place(x: number, t: number, p: number, out: THREE.Vector3) {
  if (dogIn(x, t)) return dogPlace(x, t, out);
  const ra = rollAt(x, p);
  if (t > ra.ts) return rollPlace(x, t, ra, out);
  return out.set(x, height(x, t), D / 2 - t);
}

// ---------- the sheet mesh, with an animatable roll ----------
class SheetGeometry {
  geo: THREE.BufferGeometry;
  private nx: number;
  private nt: number;
  private flatH: Float32Array;
  private rollFrom: number; // first grid row the roll can reach

  constructor(nx: number, nt: number) {
    this.nx = nx;
    this.nt = nt;
    const n = (nx + 1) * (nt + 1);
    const pos = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    this.flatH = new Float32Array(n);
    const v = new THREE.Vector3();
    let i = 0;
    for (let j = 0; j <= nt; j++)
      for (let k = 0; k <= nx; k++) {
        const x = L + (W * k) / nx, t = (D * j) / nt;
        if (dogIn(x, t)) dogPlace(x, t, v);
        else v.set(x, (this.flatH[i] = height(x, t)), D / 2 - t);
        pos.set([v.x, v.y, v.z], i * 3);
        uv.set([k / nx, j / nt], i * 2);
        i++;
      }
    const idx = new Uint32Array(nx * nt * 6);
    let q = 0;
    for (let j = 0; j < nt; j++)
      for (let k = 0; k < nx; k++) {
        const a = j * (nx + 1) + k, b = a + 1, c = a + nx + 1, d = c + 1;
        idx.set([a, b, d, a, d, c], q); // counter-clockwise seen from above
        q += 6;
      }
    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    this.geo.setIndex(new THREE.BufferAttribute(idx, 1));
    this.rollFrom = Math.max(0, Math.floor(((D - ROLL_MAX - 2) / D) * nt));
    this.geo.computeVertexNormals();
  }

  setRoll(p: number) {
    const { nx, nt } = this;
    const pos = this.geo.attributes.position as THREE.BufferAttribute;
    const a = pos.array as Float32Array;
    const v = new THREE.Vector3();
    for (let k = 0; k <= nx; k++) {
      const x = L + (W * k) / nx;
      const ra = rollAt(x, p);
      for (let j = this.rollFrom; j <= nt; j++) {
        const t = (D * j) / nt, i = j * (nx + 1) + k;
        if (dogIn(x, t)) continue;
        if (t > ra.ts) rollPlace(x, t, ra, v);
        else v.set(x, this.flatH[i], D / 2 - t);
        a[i * 3] = v.x;
        a[i * 3 + 1] = v.y;
        a[i * 3 + 2] = v.z;
      }
    }
    pos.needsUpdate = true;
    this.geo.computeVertexNormals();
  }
}

// ---------- small procedural bits (cheap enough to make at runtime) ----------
const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};
const canvasTex = (c: HTMLCanvasElement, srgb: boolean) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

function tapeAlpha(len: number, wid: number) {
  const s = 6; // px per mm
  const c = canvas(Math.round(len * s), Math.round(wid * s));
  const g = c.getContext('2d')!;
  const r = mulberry32(Math.round(len * 13));
  // torn ends: little zigzags down each end
  const tear = (x0: number, dir: number) => {
    const pts: P[] = [];
    for (let y = 0; y <= c.height; y += 5) pts.push([x0 + dir * (r() * 2.2 + (y % 10 ? 1.2 : 0)) * s * 0.5, y]);
    return pts;
  };
  const left = tear(2 * s, 1), right = tear(c.width - 2 * s, -1);
  g.fillStyle = '#fff';
  g.beginPath();
  right.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  [...left].reverse().forEach(([x, y]) => g.lineTo(x, y));
  g.closePath();
  g.fill();
  return c;
}
function tapeColour(len: number, wid: number) {
  const s = 6;
  const c = canvas(Math.round(len * s), Math.round(wid * s));
  const g = c.getContext('2d')!;
  g.fillStyle = '#d8c9a2';
  g.fillRect(0, 0, c.width, c.height);
  // crepe: fine lines across the strip
  const r = mulberry32(5);
  for (let x = 0; x < c.width; x += 2) {
    g.fillStyle = `rgba(${r() < 0.5 ? '255,250,235' : '120,100,70'},${0.05 + r() * 0.06})`;
    g.fillRect(x, 0, 1 + r() * 2, c.height);
  }
  return c;
}
function tapeMesh(tp: (typeof TAPES)[number]) {
  const wid = 24, n = 48, m = 10;
  const pos = new Float32Array((n + 1) * (m + 1) * 3), uv = new Float32Array((n + 1) * (m + 1) * 2);
  const ca = Math.cos(tp.a), sa = Math.sin(tp.a);
  // over the paper (taped corners are pinned flat), then down onto the mat
  const y = (x: number, t: number) =>
    x > L + 1 && x < R - 1 && t > 1 && t < D - 1 && !(x - L + (D - t) < CUT * 0.9) ? height(x, t) + 0.35 : 0.2;
  let i = 0;
  for (let j = 0; j <= m; j++)
    for (let k = 0; k <= n; k++) {
      const lx = (k / n - 0.5) * tp.len, lw = (j / m - 0.5) * wid;
      const x = tp.x + lx * ca - lw * sa, t = tp.t + lx * sa + lw * ca;
      const crinkle = 0.12 * Math.sin(lx * 0.9 + j) * Math.sin(lw * 0.4);
      pos.set([x, y(x, t) + crinkle, D / 2 - t], i * 3);
      uv.set([k / n, j / m], i * 2);
      i++;
    }
  const idx: number[] = [];
  for (let j = 0; j < m; j++)
    for (let k = 0; k < n; k++) {
      const a = j * (n + 1) + k, b = a + 1, c = a + n + 1, d = c + 1;
      idx.push(a, b, d, a, d, c);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(
    g,
    new THREE.MeshStandardMaterial({
      map: canvasTex(tapeColour(tp.len, wid), true),
      alphaMap: canvasTex(tapeAlpha(tp.len, wid), false),
      alphaTest: 0.5,
      transparent: true,
      opacity: 0.8,
      roughness: 0.75,
      side: THREE.DoubleSide,
    }),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Soft contact shadow round what lies on the mat. Two of them, for the flat sheet and for
 * the rolled one; the roll cross-fades between them.
 */
function contactShadow(rollP: number, opacity: number) {
  const m = 40, fall = 16;
  const cw = W + 2 * m, ch = D + 2 * m;
  const mask = new Float32Array(cw * ch);
  for (let py = 0; py < ch; py++)
    for (let qx = 0; qx < cw; qx++) {
      const x = qx - m + L, t = D - (py - m);
      const on = x > L && x < R && t > 0 && t < D - rollLen(x) * rollP && !dogIn(x, t) && !(x - L + (D - t) < CUT * 0.9);
      mask[py * cw + qx] = on ? 1 : 0;
    }
  // three box blurs ≈ a gaussian
  const r = Math.round(fall * 0.45), tmp = new Float32Array(cw * ch);
  const blur = (src: Float32Array, dst: Float32Array, horiz: boolean) => {
    const n = horiz ? cw : ch, lines = horiz ? ch : cw;
    for (let l = 0; l < lines; l++) {
      let acc = 0;
      const at = (i: number) => (horiz ? l * cw + i : i * cw + l);
      for (let i = -r; i <= r; i++) acc += src[at(Math.min(n - 1, Math.max(0, i)))];
      for (let i = 0; i < n; i++) {
        dst[at(i)] = acc / (2 * r + 1);
        acc += src[at(Math.min(n - 1, i + r + 1))] - src[at(Math.max(0, i - r))];
      }
    }
  };
  for (let k = 0; k < 3; k++) {
    blur(mask, tmp, true);
    blur(tmp, mask, false);
  }
  const c = canvas(cw, ch);
  const g = c.getContext('2d')!;
  const img = g.createImageData(cw, ch);
  for (let i = 0; i < cw * ch; i++) {
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = Math.min(1, mask[i] * 1.6) * 255;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const mat = new THREE.MeshBasicMaterial({ color: '#000', alphaMap: canvasTex(c, false), transparent: true, opacity, depthWrite: false });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(cw, ch), mat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0.02;
  return plane;
}

// ---------- the whole scene ----------
export type PaperTextures = { front: THREE.Texture; bump: THREE.Texture; back: THREE.Texture; alpha: THREE.Texture };
export type PaperOptions = {
  exposure: number;
  key: number;
  keyPos: [number, number, number];
  env: number;
  shadow: number;
  soft: number;
  ao: number;
  bump: number;
  tilt: number; // degrees
  fov: number;
  grid: [number, number];
  shadowMap: number;
};
export const DEFAULTS: PaperOptions = {
  exposure: 1.5,
  key: 2.1,
  keyPos: [-900, 820, -520], // low and raking: shows the folds and the paper's tooth
  env: 0.8,
  shadow: 0.5,
  soft: 10,
  ao: 0.28,
  bump: 1.2,
  tilt: -0.7,
  fov: 14,
  grid: [500, 300],
  shadowMap: 4096,
};
/**
 * What the page renders with (lighter than the lab's defaults). The lab bakes the page's
 * stills with exactly these, from the same texture files, so still and live match 1:1:
 * the shadow's blur is in shadow-map texels, so a different map size means a different shadow.
 */
export const PAGE_RENDER: Partial<PaperOptions> = { grid: [360, 216], shadowMap: 2048 };
const MARGIN = 46; // room round the sheet for its shadow

export type Rect = { x: number; y: number; w: number; h: number };

export function buildPaper(renderer: THREE.WebGLRenderer, tex: PaperTextures, opts: Partial<PaperOptions> = {}) {
  const o = { ...DEFAULTS, ...opts };
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = o.exposure;

  const scene = new THREE.Scene();
  const sheet = new THREE.Group();
  sheet.rotation.y = deg(o.tilt);
  scene.add(sheet);

  const geom = new SheetGeometry(o.grid[0], o.grid[1]);
  const front = new THREE.Mesh(
    geom.geo,
    new THREE.MeshStandardMaterial({
      map: tex.front,
      bumpMap: tex.bump,
      bumpScale: o.bump,
      alphaMap: tex.alpha,
      alphaTest: 0.5,
      roughness: 0.93,
      side: THREE.FrontSide,
      shadowSide: THREE.DoubleSide,
    }),
  );
  front.castShadow = true;
  front.receiveShadow = true;
  const back = new THREE.Mesh(
    geom.geo,
    new THREE.MeshStandardMaterial({ map: tex.back, alphaMap: tex.alpha, alphaTest: 0.5, roughness: 0.9, side: THREE.BackSide }),
  );
  back.receiveShadow = true;
  sheet.add(front, back, ...TAPES.map(tapeMesh));
  const aoFlat = contactShadow(0, o.ao), aoRolled = contactShadow(1, o.ao);
  sheet.add(aoFlat, aoRolled);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.ShadowMaterial({ opacity: o.shadow }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // a soft studio, and one key from the top left that casts the shadows
  const pmrem = new THREE.PMREMGenerator(renderer);
  {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), new THREE.MeshBasicMaterial({ color: '#1a1c1d', side: THREE.BackSide })));
    const panel = (w: number, h: number, x: number, y: number, z: number, k: number, color: string) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      s.add(m);
    };
    panel(70, 70, -20, 48, -20, 1.6, '#fff6ea'); // big overhead softbox, a bit left
    panel(40, 20, 40, 30, 30, 0.6, '#e6eeff');
    scene.environment = pmrem.fromScene(s, 0.04).texture;
    scene.environmentIntensity = o.env;
    pmrem.dispose();
  }
  const key = new THREE.DirectionalLight('#fff3e2', o.key);
  key.position.set(...o.keyPos);
  key.castShadow = true;
  key.shadow.mapSize.set(o.shadowMap, o.shadowMap);
  Object.assign(key.shadow.camera, { left: -720, right: 720, top: 720, bottom: -720, near: 100, far: 3000 });
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.radius = o.soft;
  key.shadow.blurSamples = 25;
  key.shadow.bias = -0.0004;
  scene.add(key);

  // camera: straight down, long lens, framed on the fully rolled sheet. Framed from a fixed
  // sample of the surface, not the mesh, so the lab and the page frame it identically.
  sheet.updateMatrixWorld(true);
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  for (let j = 0; j <= 120; j++)
    for (let k = 0; k <= 200; k++) box.expandByPoint(place(L + (W * k) / 200, (D * j) / 120, 1, v).applyMatrix4(sheet.matrixWorld));
  const bw = box.max.x - box.min.x + 2 * MARGIN, bd = box.max.z - box.min.z + 2 * MARGIN;
  const aspect = bw / bd;
  const camera = new THREE.PerspectiveCamera(o.fov, aspect, 100, 20000);
  const cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2;
  camera.position.set(cx, bd / 2 / Math.tan(deg(o.fov / 2)), cz);
  camera.up.set(0, 0, -1);
  camera.lookAt(cx, 0, cz);
  camera.updateMatrixWorld();

  // where things land in the image, normalised
  const toImg = (p: THREE.Vector3) => {
    const q = p.clone().project(camera);
    return { x: (q.x + 1) / 2, y: (1 - q.y) / 2 };
  };
  const rectOf = (ps: { x: number; y: number }[]): Rect => {
    const xs = ps.map((p) => p.x), ys = ps.map((p) => p.y);
    const r = (n: number) => +n.toFixed(5);
    return { x: r(Math.min(...xs)), y: r(Math.min(...ys)), w: r(Math.max(...xs) - Math.min(...xs)), h: r(Math.max(...ys) - Math.min(...ys)) };
  };
  const corners: { x: number; y: number }[] = [];
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners.push(toImg(new THREE.Vector3(x, y, z)));
  // flat writing area: clear of the edges, the roll, the dog-ear and the tape
  const wa = { x0: L + 60, x1: R - 70, t0: 40, t1: D - ROLL_MAX - 40 };
  const flatPt = (x: number, t: number) => toImg(new THREE.Vector3(x, 0, D / 2 - t).applyMatrix4(sheet.matrixWorld));
  const meta = {
    aspect: +aspect.toFixed(5),
    sheet: rectOf(corners),
    content: rectOf([flatPt(wa.x0, wa.t0), flatPt(wa.x1, wa.t0), flatPt(wa.x0, wa.t1), flatPt(wa.x1, wa.t1)]),
    tilt: o.tilt,
  };

  let rollP = 1;
  const setRoll = (p: number) => {
    rollP = Math.min(1, Math.max(0, p));
    geom.setRoll(rollP);
    aoFlat.material.opacity = o.ao * (1 - rollP);
    aoRolled.material.opacity = o.ao * rollP;
  };
  setRoll(1);

  return {
    scene,
    camera,
    meta,
    setRoll,
    get roll() {
      return rollP;
    },
    render: () => renderer.render(scene, camera),
  };
}
