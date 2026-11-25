import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Board, Part, Pt } from './layout';
import type { PcbMaps } from './pcb';

/**
 * Builds the board in 3D (mm units): the textured PCB plus every part as real geometry,
 * so a top-down orthographic render gets true shading, reflections and shadows.
 * World: x = board x - W/2, z = board y - H/2, y = height above the board.
 */

let rand = 1;
const rnd = () => ((rand = (rand * 16807) % 2147483647) - 1) / 2147483646;

const mat = {
  plastic: new THREE.MeshPhysicalMaterial({ color: '#121315', roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.35 }),
  plasticGrey: new THREE.MeshPhysicalMaterial({ color: '#34373c', roughness: 0.5 }),
  plasticLight: new THREE.MeshPhysicalMaterial({ color: '#8b9096', roughness: 0.45 }),
  cavity: new THREE.MeshStandardMaterial({ color: '#030303', roughness: 1 }),
  steel: new THREE.MeshPhysicalMaterial({ color: '#a7abb1', metalness: 1, roughness: 0.3 }),
  steelDark: new THREE.MeshPhysicalMaterial({ color: '#7d8188', metalness: 1, roughness: 0.32 }),
  anod: new THREE.MeshPhysicalMaterial({ color: '#2a2d32', metalness: 0.75, roughness: 0.42 }),
  anodLight: new THREE.MeshPhysicalMaterial({ color: '#3c4148', metalness: 0.9, roughness: 0.36 }),
  brushed: new THREE.MeshPhysicalMaterial({ color: '#8d939b', metalness: 1, roughness: 0.34 }),
  choke: new THREE.MeshStandardMaterial({ color: '#29292b', roughness: 0.82 }),
  capAlu: new THREE.MeshPhysicalMaterial({ color: '#a2a6ad', metalness: 0.95, roughness: 0.3 }),
  capTop: new THREE.MeshPhysicalMaterial({ color: '#6c7077', metalness: 0.9, roughness: 0.38 }),
  gold: new THREE.MeshPhysicalMaterial({ color: '#d2a751', metalness: 1, roughness: 0.28 }),
  audioSleeve: new THREE.MeshPhysicalMaterial({ color: '#b48a3a', metalness: 0.55, roughness: 0.35, clearcoat: 0.6 }),
  tin: new THREE.MeshPhysicalMaterial({ color: '#8f9296', metalness: 1, roughness: 0.48 }),
  epoxy: new THREE.MeshStandardMaterial({ color: '#151516', roughness: 0.58 }),
  mlcc: new THREE.MeshStandardMaterial({ color: '#6e5a42', roughness: 0.6 }),
  res: new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.5 }),
  ledLens: new THREE.MeshPhysicalMaterial({ color: '#e6ece8', roughness: 0.35, transmission: 0, clearcoat: 1 }),
  edge: new THREE.MeshStandardMaterial({ color: '#1d221f', roughness: 0.7 }),
};
// Reflections: metals mirror the studio softbox, plastics only a little, the mask barely.
for (const [k, m] of Object.entries(mat) as [string, THREE.MeshStandardMaterial][]) {
  const metal = /steel|anod|brushed|cap|gold|tin|audio/.test(k);
  m.envMapIntensity = metal ? 1 : k === 'ledLens' ? 0.6 : 0.45;
}

type Inst = { x: number; y: number; w: number; d: number; z0: number; h: number };
const inst = new Map<THREE.Material, Inst[]>();
const pushInst = (m: THREE.Material, i: Inst) => {
  if (!inst.has(m)) inst.set(m, []);
  inst.get(m)!.push(i);
};

export function buildScene(b: Board, maps: PcbMaps) {
  rand = 4242;
  inst.clear();
  const root = new THREE.Group();
  const X = (x: number) => x - b.W / 2;
  const Z = (y: number) => y - b.H / 2;

  /** An axis-aligned (optionally rounded) block from board rect + height range. */
  const blk = (x: number, y: number, w: number, d: number, z0: number, h: number, m: THREE.Material, r = 0.15) => {
    const rad = Math.min(r, w / 2 - 0.001, d / 2 - 0.001, h / 2 - 0.001);
    const g = rad > 0.02 ? new RoundedBoxGeometry(w, h, d, 2, rad) : new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(X(x + w / 2), z0 + h / 2, Z(y + d / 2));
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  };
  const cyl = (cx: number, cy: number, r: number, z0: number, h: number, m: THREE.Material, seg = 40) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m);
    mesh.position.set(X(cx), z0 + h / 2, Z(cy));
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  };
  /** A bevelled prism from a board-space outline. */
  const prism = (pts: Pt[], z0: number, h: number, m: THREE.Material, bevel = 0.6) => {
    const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.01, h - 2 * bevel),
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel * 0.7,
      bevelSegments: 2,
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(-b.W / 2, z0 + h - bevel, -b.H / 2);
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
    return mesh;
  };
  const chamferRect = (x: number, y: number, w: number, d: number, c: number, corners = [1, 1, 1, 1]): Pt[] => {
    const [a, bb, cc, dd] = corners.map((k) => k * c);
    return [
      [x + a, y], [x + w - bb, y], [x + w, y + bb], [x + w, y + d - cc], [x + w - cc, y + d],
      [x + dd, y + d], [x, y + d - dd], [x, y + a],
    ];
  };

  // ---- the PCB ----
  const tex = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 8;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    return t;
  };
  const pcbMat = new THREE.MeshPhysicalMaterial({
    map: tex(maps.color, true),
    roughnessMap: tex(maps.rough, false),
    metalnessMap: tex(maps.metal, false),
    bumpMap: tex(maps.height, false),
    bumpScale: 1.6,
    roughness: 1,
    metalness: 1,
    clearcoat: 0.5,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.12,
  });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(b.W, b.H), pcbMat);
  top.rotation.x = -Math.PI / 2;
  top.receiveShadow = true;
  root.add(top);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(b.W, 1.6, b.H), mat.edge);
  edge.position.y = -0.81;
  root.add(edge);

  // ---- parts ----
  for (const p of b.parts) build(p);

  function chipMarking(w: number, d: number) {
    const c = document.createElement('canvas');
    const px = 40;
    c.width = Math.round(w * px);
    c.height = Math.round(d * px);
    const g = c.getContext('2d')!;
    g.fillStyle = '#161617';
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = '#404043';
    const lines = Math.max(1, Math.min(3, Math.floor(d / 1.6)));
    const fs = Math.min(d / (lines + 1.6), w / 6) * px;
    g.font = `500 ${fs}px "Azeret Mono", Menlo, monospace`;
    g.textAlign = 'center';
    const code = () =>
      Array.from({ length: Math.max(3, Math.floor(w / 1.1)) }, () => '0123456789ABCDEFGHJKLMNPRSTUVWXYZ'[Math.floor(rnd() * 33)]).join('');
    for (let i = 0; i < lines; i++) g.fillText(code(), c.width / 2, ((i + 1.2) * c.height) / (lines + 0.8));
    g.beginPath();
    g.arc(px * 0.7, px * 0.7, px * 0.28, 0, Math.PI * 2);
    g.fillStyle = '#0c0c0d';
    g.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.6, envMapIntensity: 0.3 });
  }

  function chip(p: Part, h: number) {
    const m = chipMarking(p.w, p.h);
    const g = new RoundedBoxGeometry(p.w, h, p.h, 1, 0.08);
    // only the top face (+y) gets the marking
    const mesh = new THREE.Mesh(g, [mat.epoxy, mat.epoxy, m, mat.epoxy, mat.epoxy, mat.epoxy]);
    // RoundedBoxGeometry has no groups; fall back to the marked material for all faces
    if (!g.groups.length) mesh.material = m;
    mesh.position.set(X(p.x + p.w / 2), 0.05 + h / 2, Z(p.y + p.h / 2));
    mesh.castShadow = mesh.receiveShadow = true;
    root.add(mesh);
    // exposed pad edge on QFNs
    for (let i = 0; i < Math.floor(p.w / 0.5) - 1; i++) {
      const o = 0.5 + i * 0.5;
      pushInst(mat.tin, { x: p.x + o - 0.12, y: p.y - 0.12, w: 0.24, d: 0.22, z0: 0.02, h: 0.06 });
      pushInst(mat.tin, { x: p.x + o - 0.12, y: p.y + p.h - 0.1, w: 0.24, d: 0.22, z0: 0.02, h: 0.06 });
      pushInst(mat.tin, { x: p.x - 0.12, y: p.y + o - 0.12, w: 0.22, d: 0.24, z0: 0.02, h: 0.06 });
      pushInst(mat.tin, { x: p.x + p.w - 0.1, y: p.y + o - 0.12, w: 0.22, d: 0.24, z0: 0.02, h: 0.06 });
    }
  }

  function heatsinkFins(p: Part, dir: 'x' | 'y', tone: THREE.Material) {
    const baseH = p.z * 0.42;
    blk(p.x, p.y, p.w, p.h, 0, baseH, mat.anod, 0.6);
    const pitch = 2.1, t = 1.05;
    if (dir === 'x') {
      for (let y = p.y + 1; y + t < p.y + p.h - 0.5; y += pitch) blk(p.x + 0.4, y, p.w - 0.8, t, baseH - 0.2, p.z - baseH, tone, 0.25);
    } else {
      for (let x = p.x + 1; x + t < p.x + p.w - 0.5; x += pitch) blk(x, p.y + 0.4, t, p.h - 0.8, baseH - 0.2, p.z - baseH, tone, 0.25);
    }
    // solid sculpted cap over part of the fins, the way modern VRM sinks are styled
    if (dir === 'x') {
      prism(chamferRect(p.x - 0.2, p.y + p.h * 0.18, p.w + 0.4, p.h * 0.5, 3, [0, 1, 1, 0]), p.z - 0.2, 2.6, mat.anodLight, 0.5);
      blk(p.x + p.w - 3.5, p.y + p.h * 0.2, 1.4, p.h * 0.46, p.z + 2.3, 0.4, mat.brushed, 0.2);
    } else {
      prism(chamferRect(p.x + p.w * 0.12, p.y - 0.2, p.w * 0.64, p.h + 0.4, 3, [0, 1, 1, 0]), p.z - 0.2, 2.6, mat.anodLight, 0.5);
      blk(p.x + p.w * 0.16, p.y + p.h - 3.4, p.w * 0.56, 1.2, p.z + 2.3, 0.4, mat.brushed, 0.2);
    }
  }

  function pins(x0: number, y0: number, cols: number, rows: number, pitch: number, z0: number, h: number, m: THREE.Material, size = 0.64) {
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        const cx = x0 + pitch / 2 + i * pitch, cy = y0 + pitch / 2 + j * pitch;
        pushInst(m, { x: cx - size / 2, y: cy - size / 2, w: size, d: size, z0, h });
      }
  }

  function build(p: Part) {
    const o = p.o ?? {};
    switch (p.kind) {
      case 'shroud': {
        const outline = chamferRect(p.x, p.y, p.w, p.h, 12, [0.3, 0.4, 1, 0]);
        prism(outline, 0, p.z, mat.plastic, 1);
        // sculpted metal panel + vents on top
        prism(chamferRect(p.x + 4, p.y + 8, p.w - 9, p.h - 34, 6, [0, 1, 1, 0]), p.z - 0.3, 1.4, mat.anodLight, 0.4);
        for (let i = 0; i < 9; i++) blk(p.x + 7, p.y + p.h - 22 + i * 1.6, p.w - 16, 0.6, p.z + 0.4, 0.3, mat.cavity, 0.1);
        blk(p.x + p.w - 3.6, p.y + 10, 1, p.h - 40, p.z + 1, 0.4, mat.brushed, 0.2);
        // engraved ribs across the top panel
        for (let i = 0; i < 14; i++) blk(p.x + 7, p.y + 14 + i * 2.2, p.w - 19, 0.5, p.z + 1.05, 0.12, mat.anod, 0.05);
        blk(p.x + 7, p.y + 50, p.w - 19, 0.9, p.z + 1.05, 0.15, mat.brushed, 0.1);
        // rear connectors poking out at the edge
        for (let y = p.y + 4; y < p.y + p.h - 10; y += 12) blk(-1.5, y, 2, 8, 2, 10, mat.steelDark, 0.3);
        break;
      }
      case 'heatsink':
        heatsinkFins(p, o.fins as 'x' | 'y', mat.anod);
        break;
      case 'choke': {
        blk(p.x, p.y, p.w, p.h, 0, p.z, mat.choke, o.small ? 0.5 : 0.9);
        pushInst(mat.tin, { x: p.x + 0.4, y: p.y - 0.35, w: p.w - 0.8, d: 0.5, z0: 0, h: 0.15 });
        pushInst(mat.tin, { x: p.x + 0.4, y: p.y + p.h - 0.15, w: p.w - 0.8, d: 0.5, z0: 0, h: 0.15 });
        break;
      }
      case 'cap':
      case 'audiocap': {
        const r = p.w / 2, cx = p.x + r, cy = p.y + r;
        const sleeve = p.kind === 'audiocap' ? mat.audioSleeve : o.big ? mat.plastic : mat.capAlu;
        cyl(cx, cy, r, 0, p.z, sleeve);
        cyl(cx, cy, r * 0.93, p.z, 0.15, p.kind === 'audiocap' || o.big ? mat.capAlu : mat.capTop);
        // vent score: a cross on top
        blk(cx - r * 0.7, cy - 0.12, r * 1.4, 0.24, p.z + 0.12, 0.05, mat.cavity, 0);
        blk(cx - 0.12, cy - r * 0.7, 0.24, r * 1.4, p.z + 0.12, 0.05, mat.cavity, 0);
        cyl(cx, cy, r + 0.35, 0, 0.6, mat.plastic);
        break;
      }
      case 'power': {
        const cols = Number(o.cols), rows = Number(o.rows), pitch = 4.2;
        blk(p.x, p.y, p.w, p.h, 0, p.z, mat.plastic, 0.4);
        const ox = p.x + (p.w - cols * pitch) / 2, oy = p.y + (p.h - rows * pitch) / 2;
        for (let i = 0; i < cols; i++)
          for (let j = 0; j < rows; j++) {
            const round = (i + j) % 3 === 0;
            blk(ox + i * pitch + 0.55, oy + j * pitch + 0.55, pitch - 1.1, pitch - 1.1, p.z - 0.05, 0.1, mat.cavity, round ? 1.2 : 0.2);
          }
        // latch ridge
        if (o.latch) blk(p.x - 1.6, p.y + p.h / 2 - 3, 1.8, 6, 2, p.z - 3, mat.plastic, 0.3);
        else blk(p.x + p.w / 2 - 3, p.y + p.h - 0.2, 6, 1.6, 2, p.z - 3, mat.plastic, 0.3);
        break;
      }
      case 'header': {
        const pitch = Number(o.pitch ?? 2.54);
        const horiz = !!o.horiz;
        const cols = horiz ? Number(o.cols) : Number(o.cols);
        const rows = horiz ? Number(o.rows) : Number(o.rows);
        if (o.shroud) {
          blk(p.x, p.y, p.w, p.h, 0, p.z, mat.plastic, 0.3);
          blk(p.x + 0.9, p.y + 0.9, p.w - 1.8, p.h - 1.8, p.z - 0.04, 0.08, mat.cavity, 0.2);
          pins(p.x + (p.w - cols * pitch) / 2, p.y + (p.h - rows * pitch) / 2, cols, rows, pitch, p.z - 3, 3, mat.gold, 0.5);
        } else if (o.fan) {
          blk(p.x, p.y, p.w, p.h, 0, 2.4, mat.plastic, 0.2);
          if (horiz) blk(p.x, p.y + p.h - 0.8, p.w, 0.8, 0, p.z, mat.plastic, 0.2);
          else blk(p.x + p.w - 0.8, p.y, 0.8, p.h, 0, p.z, mat.plastic, 0.2);
          pins(p.x + (p.w - (horiz ? cols : 1) * 2.54) / 2, p.y + (p.h - (horiz ? 1 : rows) * 2.54) / 2, horiz ? cols : 1, horiz ? 1 : rows, 2.54, 0, p.z - 0.6, mat.tin);
        } else {
          blk(p.x, p.y, p.w, p.h, 0, 2.5, mat.plastic, 0.2);
          pins(p.x, p.y, Math.round(p.w / pitch), Math.round(p.h / pitch), pitch, 0, p.z, mat.gold);
        }
        break;
      }
      case 'socket': {
        const SX = p.x + p.w / 2, SY = p.y + p.h / 2;
        blk(p.x + 2, p.y + 2, p.w - 4, p.h - 4, 0, 3, mat.plasticGrey, 0.5);
        // ILM load frame: steel with a window, then the black pick-and-place cap
        const fx = p.x + 1, fy = p.y + 4, fw = p.w - 2, fh = p.h - 8;
        const wx = SX - 22.5, wy = SY - 26, ww = 45, wh = 52;
        blk(fx, fy, fw, wy - fy, 3, 1.4, mat.steel, 0.4);
        blk(fx, wy + wh, fw, fy + fh - wy - wh, 3, 1.4, mat.steel, 0.4);
        blk(fx, wy, wx - fx, wh, 3, 1.4, mat.steel, 0.4);
        blk(wx + ww, wy, fx + fw - wx - ww, wh, 3, 1.4, mat.steel, 0.4);
        blk(wx - 1.5, wy - 1.5, ww + 3, wh + 3, 3.6, 0.7, mat.steelDark, 0.6);
        blk(wx + 1.2, wy + 1.2, ww - 2.4, wh - 2.4, 3, 4.6, mat.plastic, 1.2);
        blk(SX - 7, wy + wh - 4, 14, 3, 7.4, 0.8, mat.plastic, 0.4); // grip tab
        // hinge end + 4 screws
        blk(p.x + 8, p.y, p.w - 16, 4.5, 0, 4.4, mat.steel, 0.6);
        for (const [dx, dy] of [[-24, -31], [24, -31], [-24, 31], [24, 31]]) {
          cyl(SX + dx, SY + dy, 1.9, 0, 4.9, mat.steelDark);
          blk(SX + dx - 0.8, SY + dy - 0.2, 1.6, 0.4, 4.9, 0.05, mat.cavity, 0);
        }
        // lever
        const lever = cyl(p.x + p.w + 1.3, SY, 0.85, 3.5, 66, mat.steel, 16);
        lever.rotation.x = Math.PI / 2;
        lever.position.set(X(p.x + p.w + 1.3), 4.3, Z(SY + 1));
        blk(p.x + p.w - 3, p.y + p.h - 4, 5.2, 1.7, 3.5, 1.7, mat.steel, 0.5);
        break;
      }
      case 'dimm': {
        const body = o.grey ? mat.plasticGrey : mat.plastic;
        blk(p.x, p.y + 4, p.w, p.h - 8, 0, p.z, body, 0.4);
        const gx = p.x + p.w / 2 - 0.95;
        blk(gx, p.y + 6, 1.9, p.h * 0.42, p.z - 0.05, 0.1, mat.cavity, 0.1);
        blk(gx, p.y + 7.5 + p.h * 0.42, 1.9, p.h - 13.5 - p.h * 0.42, p.z - 0.05, 0.1, mat.cavity, 0.1);
        // latch at the top end, fixed retainer at the bottom
        blk(p.x - 0.4, p.y, p.w + 0.8, 7, 0, p.z + 3.2, mat.plasticLight, 0.6);
        blk(p.x + 1.2, p.y + 1.2, p.w - 2.4, 2.5, p.z + 3.1, 0.2, mat.plasticGrey, 0.3);
        blk(p.x - 0.2, p.y + p.h - 6, p.w + 0.4, 6, 0, p.z + 1.6, body, 0.5);
        break;
      }
      case 'pcie': {
        if (o.latch) {
          blk(p.x, p.y, p.w, p.h, 0, p.z, mat.plasticLight, 0.5);
          break;
        }
        const groove = (y: number) => {
          const key = p.x + 11.65;
          blk(p.x + 1.2, y - 0.95, key - p.x - 1.2, 1.9, p.z - 0.05, 0.1, mat.cavity, 0.1);
          blk(key + 1.6, y - 0.95, p.x + p.w - key - 2.8, 1.9, p.z - 0.05, 0.1, mat.cavity, 0.1);
        };
        const cy = p.y + p.h / 2;
        if (o.armor) {
          blk(p.x - 0.6, p.y, p.w + 1.2, p.h, 0, p.z, mat.steel, 0.6);
          blk(p.x + 0.6, cy - 1.8, p.w - 1.2, 3.6, p.z - 0.1, 0.3, mat.plastic, 0.4);
          groove(cy);
          for (let x = p.x + 6; x < p.x + p.w - 4; x += 14) blk(x, p.y + 0.5, 2.2, 0.8, p.z - 0.05, 0.1, mat.cavity, 0.1);
        } else {
          blk(p.x, p.y, p.w, p.h, 0, p.z, mat.plastic, 0.5);
          groove(cy);
        }
        break;
      }
      case 'm2': {
        prism(chamferRect(p.x, p.y, p.w, p.h, 4, [1, 0, 1, 0]), 0, p.z, mat.anod, 0.7);
        prism(chamferRect(p.x + 3, p.y + 3.5, p.w - 22, p.h - 7, 3, [1, 0, 1, 0]), p.z - 0.2, 1.2, mat.anodLight, 0.35);
        for (let i = 0; i < 5; i++) blk(p.x + p.w - 17 + i * 2, p.y + 4, 0.7, p.h - 8, p.z, 0.25, mat.cavity, 0.1);
        cyl(p.x + p.w - 4, p.y + p.h / 2, 1.8, p.z - 0.2, 1, mat.steel);
        blk(p.x + p.w - 4.9, p.y + p.h / 2 - 0.15, 1.8, 0.3, p.z + 0.75, 0.05, mat.cavity, 0);
        blk(p.x + p.w - 4.15, p.y + p.h / 2 - 0.9, 0.3, 1.8, p.z + 0.75, 0.05, mat.cavity, 0);
        cyl(p.x + 4, p.y + p.h / 2, 1.8, p.z - 0.2, 1, mat.steel);
        break;
      }
      case 'chipset': {
        prism(chamferRect(p.x, p.y, p.w, p.h, 8, [1, 0, 1, 0]), 0, p.z, mat.anod, 0.8);
        prism(chamferRect(p.x + 5, p.y + 6, p.w - 10, p.h - 22, 5, [1, 0, 1, 0]), p.z - 0.2, 1.4, mat.anodLight, 0.4);
        for (let i = 0; i < 6; i++) blk(p.x + 6 + i * 1.8, p.y + p.h - 12, 0.8, 8, p.z, 0.25, mat.cavity, 0.1);
        blk(p.x + p.w - 8, p.y + 9, 1.2, p.h - 28, p.z + 1.1, 0.3, mat.brushed, 0.2);
        break;
      }
      case 'sata': {
        blk(p.x, p.y, p.w, p.h, 0, p.z, mat.plastic, 0.4);
        blk(p.x + 1, p.y + 1.2, p.w - 2.5, p.h - 2.4, p.z - 0.05, 0.1, mat.plasticGrey, 0.3);
        blk(p.x + 2, p.y + p.h / 2 - 0.3, p.w - 2, 0.6, p.z - 0.04, 0.1, mat.cavity, 0.1);
        break;
      }
      case 'usbc':
        blk(p.x, p.y, p.w, p.h, 0, p.z, mat.steel, 1.2);
        blk(p.x + 1.4, p.y + 1.4, p.w - 2.8, p.h - 2.8, p.z - 0.04, 0.08, mat.steelDark, 0.8);
        break;
      case 'chip':
        chip(p, p.z);
        break;
      case 'qfp': {
        const inset = 1.2;
        chip({ ...p, x: p.x + inset, y: p.y + inset, w: p.w - 2 * inset, h: p.h - 2 * inset }, p.z);
        const n = Number(o.leads), span = p.w - 2 * inset - 1.2, step = span / (n - 1);
        for (let i = 0; i < n; i++) {
          const t = p.x + inset + 0.6 + i * step;
          pushInst(mat.tin, { x: t - 0.1, y: p.y, w: 0.2, d: inset + 0.1, z0: 0.05, h: 0.15 });
          pushInst(mat.tin, { x: t - 0.1, y: p.y + p.h - inset - 0.1, w: 0.2, d: inset + 0.1, z0: 0.05, h: 0.15 });
          const u = p.y + inset + 0.6 + i * step;
          pushInst(mat.tin, { x: p.x, y: u - 0.1, w: inset + 0.1, d: 0.2, z0: 0.05, h: 0.15 });
          pushInst(mat.tin, { x: p.x + p.w - inset - 0.1, y: u - 0.1, w: inset + 0.1, d: 0.2, z0: 0.05, h: 0.15 });
        }
        break;
      }
      case 'soic': {
        const inset = 0.9;
        chip({ ...p, y: p.y + inset, h: p.h - 2 * inset }, p.z);
        for (let i = 0; i < 4; i++) {
          const t = p.x + 0.6 + (i * (p.w - 1.2)) / 3;
          pushInst(mat.tin, { x: t - 0.2, y: p.y, w: 0.4, d: inset + 0.1, z0: 0.05, h: 0.2 });
          pushInst(mat.tin, { x: t - 0.2, y: p.y + p.h - inset - 0.1, w: 0.4, d: inset + 0.1, z0: 0.05, h: 0.2 });
        }
        break;
      }
      case 'sot': {
        const v = !!o.vertical;
        const bw = v ? 1.3 : 2.9, bd = v ? 2.9 : 1.3;
        blk(p.x + (p.w - bw) / 2, p.y + (p.h - bd) / 2, bw, bd, 0.05, p.z, mat.epoxy, 0.1);
        break;
      }
      case 'crystal':
        blk(p.x, p.y, p.w, p.h, 0, p.z, mat.steel, 0.6);
        blk(p.x + 0.4, p.y + 0.4, p.w - 0.8, p.h - 0.8, p.z - 0.02, 0.06, mat.steelDark, 0.4);
        break;
      case 'battery': {
        const cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        cyl(cx, cy, p.w / 2, 0, 1.8, mat.plastic, 64);
        cyl(cx, cy, 10, 1.6, 3.2, mat.steel, 64);
        cyl(cx, cy, 8.6, 4.75, 0.08, mat.steelDark, 64);
        blk(cx - 2, p.y - 1.5, 4, 8, 3.6, 1.6, mat.steel, 0.4);
        break;
      }
      case 'led':
        pushInst(mat.tin, { x: p.x - 0.1, y: p.y - 0.05, w: p.w + 0.2, d: p.h + 0.1, z0: 0, h: 0.15 });
        blk(p.x + 0.2, p.y, p.w - 0.4, p.h, 0.1, p.z, mat.ledLens, 0.1);
        break;
      case 'button':
        blk(p.x, p.y, p.w, p.h, 0, 2.6, mat.plastic, 0.4);
        if (o.round) {
          cyl(p.x + p.w / 2, p.y + p.h / 2, 3.4, 2.4, 0.9, mat.plasticLight);
          cyl(p.x + p.w / 2, p.y + p.h / 2, 2.8, 2.6, p.z - 2.6, mat.plasticGrey);
        } else blk(p.x + 1.4, p.y + 1.4, p.w - 2.8, p.h - 2.8, 2.4, p.z - 2.4, mat.plasticGrey, 0.6);
        break;
      case 'mlcc':
      case 'res':
      case 'cap0201': {
        const body = p.kind === 'res' ? mat.res : mat.mlcc;
        const vert = p.h > p.w;
        const e = 0.24;
        if (vert) {
          pushInst(body, { x: p.x, y: p.y + p.h * e, w: p.w, d: p.h * (1 - 2 * e), z0: 0.05, h: p.z });
          pushInst(mat.tin, { x: p.x, y: p.y, w: p.w, d: p.h * e, z0: 0.05, h: p.z });
          pushInst(mat.tin, { x: p.x, y: p.y + p.h * (1 - e), w: p.w, d: p.h * e, z0: 0.05, h: p.z });
        } else {
          pushInst(body, { x: p.x + p.w * e, y: p.y, w: p.w * (1 - 2 * e), d: p.h, z0: 0.05, h: p.z });
          pushInst(mat.tin, { x: p.x, y: p.y, w: p.w * e, d: p.h, z0: 0.05, h: p.z });
          pushInst(mat.tin, { x: p.x + p.w * (1 - e), y: p.y, w: p.w * e, d: p.h, z0: 0.05, h: p.z });
        }
        break;
      }
    }
  }

  // ---- instanced tiny parts ----
  const unit = new THREE.BoxGeometry(1, 1, 1);
  const m4 = new THREE.Matrix4();
  for (const [m, list] of inst) {
    const im = new THREE.InstancedMesh(unit, m, list.length);
    list.forEach((i, k) => {
      m4.makeScale(i.w, i.h, i.d);
      m4.setPosition(X(i.x + i.w / 2), i.z0 + i.h / 2, Z(i.y + i.d / 2));
      im.setMatrixAt(k, m4);
    });
    im.castShadow = im.receiveShadow = true;
    root.add(im);
  }
  return root;
}
