import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/**
 * Retro lab: a generic beige desktop computer (CRT monitor on a desktop case, keyboard in
 * front), rendered for the hero. White keycaps; the space bar is the green "Dalej" key.
 * Exports the render, the Dalej key in its hover/pressed positions, and where the screen
 * and the key land in the image (hero-retro.json), so the page can put live text on the
 * screen and a real link on the key. Units: mm. World: x right, y up, z toward the viewer.
 */

const params = new URLSearchParams(location.search);
await Promise.all([
  document.fonts.load('700 40px "Cabinet Grotesk"'),
  document.fonts.load('800 40px "Cabinet Grotesk"'),
]);

const RW = 2600, RH = 2600;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(RW, RH, false);
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = Number(params.get('exp') ?? 1);

const scene = new THREE.Scene();
const root = new THREE.Group();
scene.add(root);

// ---------- materials ----------
const phys = (o: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(o);
const M = {
  beige: phys({ color: '#d4c4a3', roughness: 0.58, clearcoat: 0.12, clearcoatRoughness: 0.55 }),
  beigeInset: phys({ color: '#cbb998', roughness: 0.62 }),
  beigeDeep: phys({ color: '#a8977a', roughness: 0.7 }),
  seam: new THREE.MeshStandardMaterial({ color: '#7d6f57', roughness: 0.8 }),
  panel: phys({ color: '#18181a', roughness: 0.42, clearcoat: 0.3 }),
  panelLight: phys({ color: '#2b2b2f', roughness: 0.45 }),
  slot: new THREE.MeshStandardMaterial({ color: '#040404', roughness: 1 }),
  glass: phys({ color: '#0f251b', roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.06 }),
  keyWhite: phys({ color: '#efede7', roughness: 0.44, clearcoat: 0.2, clearcoatRoughness: 0.5 }),
  keyGreen: phys({ color: '#2a4536', roughness: 0.4, clearcoat: 0.3, clearcoatRoughness: 0.45 }),
  ledGreen: new THREE.MeshStandardMaterial({ color: '#8de0b0', emissive: '#58d08a', emissiveIntensity: 1.8 }),
  ledWhite: new THREE.MeshStandardMaterial({ color: '#e8f0fb', emissive: '#c9daf2', emissiveIntensity: 1.2 }),
};

const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
  const o = new THREE.Mesh(g, m);
  o.position.set(x, y, z);
  o.castShadow = o.receiveShadow = true;
  return o;
};
/** Rounded box centred at (x, y, z). */
const rbox = (w: number, h: number, d: number, r: number, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = root) => {
  const rad = Math.min(r, w / 2 - 0.01, h / 2 - 0.01, d / 2 - 0.01);
  const o = mesh(rad > 0.05 ? new RoundedBoxGeometry(w, h, d, 3, rad) : new THREE.BoxGeometry(w, h, d), m, x, y, z);
  parent.add(o);
  return o;
};
const roundRect = (w: number, h: number, r: number, cx = 0, cy = 0, path: THREE.Path = new THREE.Shape()) => {
  const x = cx - w / 2, y = cy - h / 2;
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + h - r);
  path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  path.lineTo(x + r, y + h);
  path.quadraticCurveTo(x, y + h, x, y + h - r);
  path.lineTo(x, y + r);
  path.quadraticCurveTo(x, y, x + r, y);
  return path;
};

// ---------- desktop case ----------
const CASE = { w: 430, h: 104, d: 320, z: -12 };
const caseFront = CASE.z + CASE.d / 2;
rbox(CASE.w, CASE.h, CASE.d, 9, M.beige, 0, CASE.h / 2, CASE.z);
// lid seam + bottom seam on the front
rbox(CASE.w - 6, 1.1, 1, 0.4, M.seam, 0, CASE.h - 13, caseFront + 0.1);
rbox(CASE.w - 6, 1.1, 1, 0.4, M.seam, 0, 9, caseFront + 0.1);
// floppy bay: a raised lip around a panel that sits deeper, so it reads as recessed
{
  const cx = -62, cy = 52, w = 252, h = 58, t = 3.2;
  rbox(w + 2 * t, t, 4.5, 1, M.beige, cx, cy + h / 2 + t / 2, caseFront + 1);
  rbox(w + 2 * t, t, 4.5, 1, M.beige, cx, cy - h / 2 - t / 2, caseFront + 1);
  rbox(t, h, 4.5, 1, M.beige, cx - w / 2 - t / 2, cy, caseFront + 1);
  rbox(t, h, 4.5, 1, M.beige, cx + w / 2 + t / 2, cy, caseFront + 1);
  rbox(w, h, 2, 0.6, M.beigeInset, cx, cy, caseFront + 0.4);
  rbox(152, 4.6, 2, 1.6, M.slot, cx + 18, cy - 6, caseFront + 1.4); // disk slot
  rbox(150, 1.2, 1, 0.5, M.beige, cx + 18, cy - 2.6, caseFront + 1.7); // its upper lip
  rbox(22, 8, 4, 2, M.beigeDeep, cx + 112, cy - 17, caseFront + 2); // eject
  rbox(30, 7, 1.6, 2, M.beigeDeep, cx - 108, cy + 19, caseFront + 1.5); // drive door tab
  rbox(5, 2.4, 1.6, 0.8, M.ledGreen, cx - 112, cy - 18, caseFront + 1.6); // drive LED
}
// control panel: power rocker, two LEDs, a little readout window
{
  const cx = 132, cy = 52;
  rbox(116, 58, 3, 2.5, M.panel, cx, cy, caseFront + 0.8);
  rbox(15, 26, 6, 2.5, M.panelLight, cx + 40, cy, caseFront + 2.6);
  rbox(13, 11, 2, 2, M.panel, cx + 40, cy + 5.5, caseFront + 5.3);
  rbox(44, 15, 1.6, 1.2, M.slot, cx - 22, cy + 10, caseFront + 2.1);
  rbox(5, 2.6, 1.6, 0.8, M.ledGreen, cx - 36, cy - 12, caseFront + 2.3);
  rbox(5, 2.6, 1.6, 0.8, M.ledWhite, cx - 24, cy - 12, caseFront + 2.3);
}

// ---------- CRT monitor ----------
const MON = { y0: CASE.h + 52, w: 352, h: 302, front: 70 };
const monCY = MON.y0 + MON.h / 2;
// tilt-swivel stand
rbox(220, 13, 150, 6, M.beige, 0, CASE.h + 6.5, 18);
rbox(124, 42, 76, 10, M.beige, 0, CASE.h + 13 + 18, 8);
const monFirst = root.children.length;
// bezel with the screen opening (bottom border a little deeper, like real CRTs)
const holeW = 284, holeH = 222, holeCY = monCY + 13;
{
  const shape = roundRect(MON.w, MON.h, 26) as THREE.Shape;
  shape.holes.push(roundRect(holeW, holeH, 22, 0, holeCY - monCY, new THREE.Path()));
  const depth = 22, bevel = 6;
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: 5, bevelSegments: 4, curveSegments: 12 });
  root.add(mesh(g, M.beige, 0, monCY, MON.front - depth - bevel));
  // the sloped inner surround between bezel and glass
  const s2 = roundRect(holeW + 2, holeH + 2, 22) as THREE.Shape;
  s2.holes.push(roundRect(holeW - 18, holeH - 18, 15, 0, 0, new THREE.Path()));
  const g2 = new THREE.ExtrudeGeometry(s2, { depth: 16, bevelEnabled: true, bevelThickness: 3, bevelSize: 2.5, bevelSegments: 3, curveSegments: 12 });
  root.add(mesh(g2, M.beigeInset, 0, holeCY, MON.front - 26));
}
// curved glass
const glassW = holeW - 14, glassH = holeH - 14, glassZ = MON.front - 15;
{
  const g = new THREE.PlaneGeometry(glassW, glassH, 48, 48);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (glassW / 2), y = p.getY(i) / (glassH / 2);
    p.setZ(i, 6 * (1 - x * x * 0.85) * (1 - y * y * 0.85));
  }
  g.computeVertexNormals();
  root.add(mesh(g, M.glass, 0, holeCY, glassZ));
}
// tube housing tapering back
{
  const pts: THREE.Vector3[] = [];
  const ring = (w: number, h: number, cy: number, z: number, r: number) => {
    for (let k = 0; k < 24; k++) {
      const a = (k / 24) * Math.PI * 2;
      const cx = Math.sign(Math.cos(a)) * (w / 2 - r) + Math.cos(a) * r;
      const yy = Math.sign(Math.sin(a)) * (h / 2 - r) + Math.sin(a) * r;
      pts.push(new THREE.Vector3(cx, cy + yy, z));
    }
  };
  ring(MON.w - 14, MON.h - 14, monCY, MON.front - 30, 22);
  ring(MON.w - 22, MON.h - 22, monCY, MON.front - 70, 22);
  ring(230, 196, monCY - 6, MON.front - 300, 30);
  root.add(mesh(new ConvexGeometry(pts), M.beige));
}
// power button + LED on the bezel
rbox(18, 8, 5, 2.4, M.beigeDeep, 138, MON.y0 + 24, MON.front + 1.5);
rbox(4.6, 2.4, 1.6, 0.8, M.ledGreen, 118, MON.y0 + 24, MON.front + 0.6);

// tilt the head back on its swivel so the screen faces the (raised) camera
const TILT = (Number(params.get('tilt') ?? 6) * Math.PI) / 180;
const pivot = new THREE.Group();
pivot.position.set(0, CASE.h + 40, 0);
root.add(pivot);
pivot.updateMatrixWorld(true);
for (const o of root.children.slice(monFirst, -1)) pivot.attach(o);
pivot.rotation.x = -TILT;
pivot.updateMatrixWorld(true);
/** A point given in the untilted monitor frame, in world space. */
const onMonitor = (v: THREE.Vector3) => pivot.localToWorld(v.sub(pivot.position));

// ---------- keyboard ----------
const U = 19.05;
const DALEJ_D = 1.35; // key depth in u
const KB = { w: 418, d: 143, z0: caseFront + Number(params.get('kz') ?? 30), back: 32, front: 16 };
const surfaceY = (z: number) => KB.back - ((KB.back - KB.front) * (z - KB.z0)) / KB.d;
const slope = Math.atan((KB.back - KB.front) / KB.d);
{
  const s = new THREE.Shape();
  // inset by the bevel so the bevelled outline lands exactly on the deck plane
  const b = 5;
  s.moveTo(b, b);
  s.lineTo(KB.d - b, b);
  s.lineTo(KB.d - b, KB.front - b);
  s.lineTo(b, KB.back - b);
  s.lineTo(b, b);
  const g = new THREE.ExtrudeGeometry(s, { depth: KB.w - 12, bevelEnabled: true, bevelThickness: 6, bevelSize: 5, bevelSegments: 4 });
  const body = mesh(g, M.beige);
  body.rotation.y = -Math.PI / 2;
  body.position.set((KB.w - 12) / 2, 0, KB.z0);
  root.add(body);
}

function legendTexture(wTop: number, dTop: number, lines: string[], o: { green?: boolean; small?: boolean }) {
  const px = 26;
  const c = document.createElement('canvas');
  c.width = Math.round(wTop * px);
  c.height = Math.round(dTop * px);
  const g = c.getContext('2d')!;
  if (o.green) {
    // "Dalej" + a drawn down-arrow, centred
    g.fillStyle = '#eef5f0';
    g.strokeStyle = '#eef5f0';
    const fs = dTop * px * 0.6;
    g.font = `700 ${fs}px "Cabinet Grotesk"`;
    g.textBaseline = 'middle';
    const tw = g.measureText('Dalej').width;
    const aw = fs * 0.62, gap = fs * 0.32;
    const x0 = (c.width - tw - gap - aw) / 2, cy = c.height / 2 + fs * 0.04;
    g.fillText('Dalej', x0, cy);
    const ax = x0 + tw + gap + aw / 2;
    g.lineWidth = fs * 0.1;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(ax, cy - aw * 0.55);
    g.lineTo(ax, cy + aw * 0.5);
    g.moveTo(ax - aw * 0.42, cy + aw * 0.08);
    g.lineTo(ax, cy + aw * 0.5);
    g.lineTo(ax + aw * 0.42, cy + aw * 0.08);
    g.stroke();
  } else {
    g.fillStyle = '#56544e';
    const fs = (o.small ? 2.4 : 3.6) * px;
    g.font = `500 ${fs}px "Helvetica Neue", Arial, sans-serif`;
    g.textBaseline = 'top';
    lines.forEach((t, i) => g.fillText(t, 1.6 * px, 1.4 * px + i * fs * 1.05));
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** A sculpted keycap: tapered toward the top, legend decal on the top face. */
function keycap(wu: number, du: number, h: number, mat: THREE.Material, legend: string[], o: { green?: boolean; small?: boolean } = {}) {
  const w = wu * U - 1.3, d = du * U - 1.3;
  const g = new RoundedBoxGeometry(w, h, d, 3, 1.5);
  g.translate(0, h / 2, 0);
  const sx = (w - 5.4) / w, sz = (d - 4.6) / d;
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = p.getY(i) / h;
    p.setX(i, p.getX(i) * (1 + (sx - 1) * t));
    p.setZ(i, p.getZ(i) * (1 + (sz - 1) * t) - 0.7 * t);
  }
  g.computeVertexNormals();
  const grp = new THREE.Group();
  grp.add(mesh(g, mat));
  if (legend.length || o.green) {
    const wTop = w - 5.4 - 1.2, dTop = d - 4.6 - 1.2;
    const lm = new THREE.MeshStandardMaterial({
      map: legendTexture(wTop, dTop, legend, o),
      transparent: true,
      roughness: 0.45,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(wTop, dTop), lm);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(0, h + 0.03, -0.7);
    grp.add(plane);
  }
  return grp;
}

const ROWS: [string, number][][] = [
  [['`', 1], ['1', 1], ['2', 1], ['3', 1], ['4', 1], ['5', 1], ['6', 1], ['7', 1], ['8', 1], ['9', 1], ['0', 1], ['-', 1], ['=', 1], ['Backspace', 2]],
  [['Tab', 1.5], ['Q', 1], ['W', 1], ['E', 1], ['R', 1], ['T', 1], ['Y', 1], ['U', 1], ['I', 1], ['O', 1], ['P', 1], ['[', 1], [']', 1], ['\\', 1.5]],
  [['Caps Lock', 1.75], ['A', 1], ['S', 1], ['D', 1], ['F', 1], ['G', 1], ['H', 1], ['J', 1], ['K', 1], ['L', 1], [';', 1], ["'", 1], ['Enter', 2.25]],
  [['Shift', 2.25], ['Z', 1], ['X', 1], ['C', 1], ['V', 1], ['B', 1], ['N', 1], ['M', 1], [',', 1], ['.', 1], ['/', 1], ['Shift', 2.75]],
  [['Ctrl', 1.5], ['', 1], ['Alt', 1.5], ['DALEJ', 7], ['Alt', 1.5], ['', 1], ['Ctrl', 1.5]],
];
const ROW_H = [11.5, 10, 9.5, 10, 11];
const ROW_TILT = [10, 5, 0, -4, -7].map((a) => (a * Math.PI) / 180);
const left = -(19.5 * U) / 2;
const rowZ = (r: number) => KB.z0 + 21 + r * U;
// key well: darker plate under the keys, raised rim around it, both on the deck slope
{
  const wl = left - 6, wr = left + 19.5 * U + 6;
  const zf = rowZ(0) - U / 2 - 5, zb = rowZ(4) + (DALEJ_D - 0.5) * U + 5;
  const deck = new THREE.Group();
  const zc = (zf + zb) / 2;
  deck.position.set(0, surfaceY(zc), zc);
  deck.rotation.x = slope;
  root.add(deck);
  const wW = wr - wl, wD = zb - zf, cx = (wl + wr) / 2, rim = 5;
  rbox(wW, 1.2, wD, 0.5, M.beigeInset, cx, 0.2, 0, deck);
  rbox(wW + 2 * rim, 3.4, rim, 1.4, M.beige, cx, 1.4, -wD / 2 - rim / 2, deck);
  rbox(wW + 2 * rim, 3.4, rim, 1.4, M.beige, cx, 1.4, wD / 2 + rim / 2, deck);
  rbox(rim, 3.4, wD, 1.4, M.beige, wl - rim / 2, 1.4, 0, deck);
  rbox(rim, 3.4, wD, 1.4, M.beige, wr + rim / 2, 1.4, 0, deck);
}

let dalej: THREE.Group | null = null;
const place = (cap: THREE.Group, x: number, zc: number, tilt: number) => {
  cap.position.set(x, surfaceY(zc) - 2.5, zc);
  cap.rotation.x = tilt + slope;
  root.add(cap);
};
ROWS.forEach((row, r) => {
  let x = left;
  for (const [label, wu] of row) {
    if (!label) {
      x += wu * U;
      continue;
    }
    const isDalej = label === 'DALEJ';
    const small = label.length > 1 && !/^[0-9]$/.test(label);
    const cap = keycap(wu, isDalej ? DALEJ_D : 1, isDalej ? 11.5 : ROW_H[r], isDalej ? M.keyGreen : M.keyWhite, isDalej ? [] : [label], { green: isDalej, small });
    place(cap, x + (wu * U) / 2, rowZ(r) + (isDalej ? ((DALEJ_D - 1) * U) / 2 : 0), ROW_TILT[r]);
    if (isDalej) dalej = cap;
    x += wu * U;
  }
});
// numpad
{
  const nx = left + 15.5 * U;
  const pad: [string, number, number, number, number][] = [
    ['Num', 0, 0, 1, 1], ['/', 1, 0, 1, 1], ['*', 2, 0, 1, 1], ['-', 3, 0, 1, 1],
    ['7', 0, 1, 1, 1], ['8', 1, 1, 1, 1], ['9', 2, 1, 1, 1], ['+', 3, 1, 1, 2],
    ['4', 0, 2, 1, 1], ['5', 1, 2, 1, 1], ['6', 2, 2, 1, 1],
    ['1', 0, 3, 1, 1], ['2', 1, 3, 1, 1], ['3', 2, 3, 1, 1], ['Enter', 3, 3, 1, 2],
    ['0', 0, 4, 2, 1], ['.', 2, 4, 1, 1],
  ];
  for (const [label, c, r, wu, du] of pad) {
    const zc = rowZ(r) + ((du - 1) * U) / 2;
    const rr = Math.min(4, r + du - 1);
    const tilt = (ROW_TILT[r] + ROW_TILT[rr]) / 2;
    const cap = keycap(wu, du, (ROW_H[r] + ROW_H[rr]) / 2, M.keyWhite, [label], { small: label.length > 1 });
    place(cap, nx + c * U + (wu * U) / 2, zc, tilt);
  }
}
const dalejCap = dalej as unknown as THREE.Group;
const dalejRest = dalejCap.position.clone();

// ---------- floor (shadow catcher) + lights ----------
const floor = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), new THREE.ShadowMaterial({ opacity: Number(params.get('shadow') ?? 0.55) }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const pmrem = new THREE.PMREMGenerator(renderer);
function studio() {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100), new THREE.MeshBasicMaterial({ color: '#0b0b0c', side: THREE.BackSide })));
  const panel = (w: number, h: number, x: number, y: number, z: number, k: number, color = '#ffffff') => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    s.add(m);
  };
  panel(50, 30, -30, 40, 30, 2.2, '#fff6ea'); // key softbox, front-left above
  panel(10, 60, 48, 20, 0, 1.4, '#e6eeff'); // right strip
  panel(70, 10, 0, 30, -48, 1.6); // back rim
  panel(60, 30, 0, -10, 48, 0.25); // faint floor bounce
  return pmrem.fromScene(s, 0.02).texture;
}
const env = studio();
scene.traverse((o) => {
  const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
  if (m && m.isMeshStandardMaterial && !m.envMap) {
    m.envMap = env;
    m.envMapIntensity = m === M.glass ? 1.4 : 0.42;
  }
});

const key = new THREE.DirectionalLight('#fff4e6', Number(params.get('key') ?? 2.4));
key.position.set(-760, 720, 420);
key.castShadow = true;
key.shadow.mapSize.set(4096, 4096);
Object.assign(key.shadow.camera, { left: -600, right: 600, top: 600, bottom: -600, near: 100, far: 2500 });
key.shadow.camera.updateProjectionMatrix();
key.shadow.radius = 18;
key.shadow.blurSamples = 25;
key.shadow.bias = -0.0003;
scene.add(key);
const fill = new THREE.DirectionalLight('#e4ecff', 0.45);
fill.position.set(600, 300, 500);
scene.add(fill);
const rim = new THREE.DirectionalLight('#ffffff', 1.1);
rim.position.set(200, 500, -700);
scene.add(rim);
scene.add(new THREE.HemisphereLight('#ffffff', '#3a3530', 0.2));

// ---------- camera: a slightly raised, long-lens product view ----------
const FOV = Number(params.get('fov') ?? 20);
const EL = (Number(params.get('el') ?? 30) * Math.PI) / 180;
const bbox = new THREE.Box3().setFromObject(root);
const target = bbox.getCenter(new THREE.Vector3());
target.y += Number(params.get('ty') ?? 0);
const radius = bbox.getSize(new THREE.Vector3()).length() / 2;
const dist = (radius / Math.sin(((FOV / 2) * Math.PI) / 180)) * Number(params.get('zoom') ?? 0.93);
const cam = new THREE.PerspectiveCamera(FOV, RW / RH, 100, 8000);
cam.position.set(target.x, target.y + Math.sin(EL) * dist, target.z + Math.cos(EL) * dist);
cam.lookAt(target);
cam.updateMatrixWorld();

const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(RW, RH, { samples: 4, type: THREE.HalfFloatType }));
composer.setPixelRatio(1);
composer.setSize(RW, RH);
composer.addPass(new RenderPass(scene, cam));
const ao = new GTAOPass(scene, cam, RW, RH);
ao.blendIntensity = 0.8;
ao.updateGtaoMaterial({ radius: 14, distanceExponent: 1.5, thickness: 6, scale: 1, samples: 16 });
composer.addPass(ao);
composer.addPass(new OutputPass());

// ---------- projection helpers ----------
const toPx = (v: THREE.Vector3) => {
  const p = v.clone().project(cam);
  return { x: ((p.x + 1) / 2) * RW, y: ((1 - p.y) / 2) * RH };
};
function screenRect(obj: THREE.Object3D) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  obj.updateMatrixWorld(true);
  obj.traverse((o) => {
    const g = (o as THREE.Mesh).geometry as THREE.BufferGeometry | undefined;
    if (!g || o instanceof THREE.InstancedMesh || o === floor) return;
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i += 1) {
      v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
      const s = toPx(v);
      x0 = Math.min(x0, s.x);
      y0 = Math.min(y0, s.y);
      x1 = Math.max(x1, s.x);
      y1 = Math.max(y1, s.y);
    }
  });
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

// crop: everything + room for the shadow
const all = screenRect(root);
const padX = all.w * 0.03, padTop = all.h * 0.015, padBottom = all.h * 0.035;
const CROP = {
  x: Math.max(0, Math.floor(all.x - padX)),
  y: Math.max(0, Math.floor(all.y - padTop)),
  w: 0,
  h: 0,
};
CROP.w = Math.min(RW - CROP.x, Math.ceil(all.w + 2 * padX));
CROP.h = Math.min(RH - CROP.y, Math.ceil(all.h + padTop + padBottom));

// ---------- render states ----------
const PRESS = [0, 1.4, 3.8]; // mm the Dalej key travels: up, hover, pressed
const shots: HTMLCanvasElement[] = [];
for (const depth of PRESS) {
  dalejCap.position.copy(dalejRest).add(new THREE.Vector3(0, -depth, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), dalejCap.rotation.x));
  composer.render();
  const c = document.createElement('canvas');
  c.width = CROP.w;
  c.height = CROP.h;
  c.getContext('2d')!.drawImage(renderer.domElement, CROP.x, CROP.y, CROP.w, CROP.h, 0, 0, CROP.w, CROP.h);
  shots.push(c);
}
dalejCap.position.copy(dalejRest);

// key area over all states (+ a few px)
const keyUp = screenRect(dalejCap);
dalejCap.position.y -= PRESS[2];
const keyDown = screenRect(dalejCap);
dalejCap.position.copy(dalejRest);
const KEY = (() => {
  const x0 = Math.min(keyUp.x, keyDown.x) - 10, y0 = Math.min(keyUp.y, keyDown.y) - 10;
  const x1 = Math.max(keyUp.x + keyUp.w, keyDown.x + keyDown.w) + 10;
  const y1 = Math.max(keyUp.y + keyUp.h, keyDown.y + keyDown.h) + 10;
  return { x: Math.floor(x0 - CROP.x), y: Math.floor(y0 - CROP.y), w: Math.ceil(x1 - x0), h: Math.ceil(y1 - y0) };
})();
// the screen: the visible opening (inside the inner surround, at its front face), crop space
const OPEN = { w: holeW - 18, h: holeH - 18, z: MON.front - 7 };
const scr = (() => {
  const pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) =>
    toPx(onMonitor(new THREE.Vector3((sx * OPEN.w) / 2, holeCY + (sy * OPEN.h) / 2, OPEN.z))),
  );
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  return { x: x0 - CROP.x, y: y0 - CROP.y, w: Math.max(...xs) - x0, h: Math.max(...ys) - y0 };
})();

// ---------- view + export ----------
const out = document.getElementById('out') as HTMLCanvasElement;
out.width = CROP.w;
out.height = CROP.h;
const octx = out.getContext('2d')!;
function show(i: number) {
  octx.clearRect(0, 0, CROP.w, CROP.h);
  octx.drawImage(shots[i], 0, 0);
  octx.strokeStyle = 'rgba(127,214,164,.6)';
  octx.lineWidth = 2;
  if (params.has('guides')) {
    octx.strokeRect(scr.x, scr.y, scr.w, scr.h);
    octx.strokeRect(KEY.x, KEY.y, KEY.w, KEY.h);
  }
}
show(0);
document.querySelectorAll<HTMLButtonElement>('[data-state]').forEach((b) => (b.onclick = () => show(Number(b.dataset.state))));

const toBlob = (c: HTMLCanvasElement, q: number) => new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/webp', q));
async function save(name: string, body: Blob | string) {
  return (await fetch(`/__save?name=${name}`, { method: 'POST', body })).text();
}
function scaled(src: HTMLCanvasElement, sx: number, sy: number, sw: number, sh: number, k: number) {
  const c = document.createElement('canvas');
  c.width = Math.round(sw * k);
  c.height = Math.round(sh * k);
  const g = c.getContext('2d')!;
  g.imageSmoothingQuality = 'high';
  g.drawImage(src, sx, sy, sw, sh, 0, 0, c.width, c.height);
  return c;
}
async function exportAll() {
  const ow = Number(params.get('ow') ?? 1800);
  const k = ow / CROP.w;
  const log = [
    await save('retro.webp', await toBlob(scaled(shots[0], 0, 0, CROP.w, CROP.h, k), 0.82)),
    await save('retro-key-hover.webp', await toBlob(scaled(shots[1], KEY.x, KEY.y, KEY.w, KEY.h, k), 0.86)),
    await save('retro-key-down.webp', await toBlob(scaled(shots[2], KEY.x, KEY.y, KEY.w, KEY.h, k), 0.86)),
  ];
  const n = (r: { x: number; y: number; w: number; h: number }) => ({
    x: +(r.x / CROP.w).toFixed(5),
    y: +(r.y / CROP.h).toFixed(5),
    w: +(r.w / CROP.w).toFixed(5),
    h: +(r.h / CROP.h).toFixed(5),
  });
  const meta = { aspect: +(CROP.w / CROP.h).toFixed(5), screen: n(scr), key: n(KEY) };
  log.push(await save('hero-retro.json', JSON.stringify(meta)));
  return log;
}
document.getElementById('save')!.onclick = () => exportAll().then((l) => console.log(l));

async function dbg(name: string, i = 0, x = 0, y = 0, w = CROP.w, h = CROP.h, outW = 1400) {
  return save(`_dbg-${name}.png`, await new Promise<Blob>((res) => scaled(shots[i], x, y, w, h, outW / w).toBlob((b) => res(b!), 'image/png')));
}
Object.assign(window, { exportAll, dbg, show, CROP, KEY, scr, __ready: true });
