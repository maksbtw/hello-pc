// Warstwa danych modeli 3D. Czyta catalog.json + assembly-manifest.json
// SERWOWANE z public/models/ (fetch w runtime — importu z public/ Vite nie
// wspiera). Daje scenie Explore listę klikalnych części montażu, URL-e modeli,
// warianty oraz pivoty/bounds do fokusu kamery. Ładowanie przez Suspense.
import { useGLTF } from '@react-three/drei';
import { parts } from '../data/parts';
import type { PartName } from '../data/parts';

type Vec3 = [number, number, number];

/** Wariant części do inspektora (CPU desktop/mobile/server, RAM DDR4/DDR5…). */
export interface Variant {
  id: string;
  label: string;
  model: string; // nazwa pliku .glb
  illustration?: string;
  panel?: string;
  refreshRateHz?: number;
}

/** Wpis części w catalog.json. */
export interface CatalogPart {
  partId: string;
  assemblyModel?: string; // Monitor go nie ma (peryferyjny)
  note?: string;
  variants: Variant[];
}

/** Wpis części złożonego PC w assembly-manifest.json. */
export interface AssemblyAsset {
  file: string;
  root: string; // nazwa głównego node'a w .glb (Case, CPU, …)
  inspection_pivot: Vec3;
  triangles: number;
  draw_calls: number;
  bounds_gltf: [Vec3, Vec3]; // [min, max]
  partId: string;
  usage: string;
}

/** Wpis wariantu w supplementary-manifest.json (wspólne pola z assembly). */
interface InspectAsset {
  file: string;
  inspection_pivot: Vec3;
  bounds_gltf: [Vec3, Vec3];
}

/** Pivot + bounds modelu do inspekcji (wycentrowanie i kadrowanie). */
export interface InspectInfo {
  pivot: Vec3;
  bounds: [Vec3, Vec3];
}

/** Wariant części z WŁASNYM modelem 3D (do rzędu inspekcji). */
export interface VariantModel {
  id: string;
  label: string;
  file: string;
  pivot: Vec3;
  bounds: [Vec3, Vec3];
}

/** Gotowe dane katalogu dla sceny. */
export interface CatalogData {
  parts: Record<string, CatalogPart>;
  assemblyByPart: Map<string, AssemblyAsset>;
  assemblyModelUrls: string[];
  inspectByFile: Map<string, InspectInfo>; // pivot/bounds po nazwie pliku
}

// Układ rzędu wariantów: wzdłuż Z (kamera patrzy wzdłuż -X, więc Z = poziom ekranu).
const ROW_GAP = 0.05;
const ROW_Y = 0.2;

/** 8 klikalnych części złożonego PC — kolejność „od zewnątrz do środka". */
export const ASSEMBLY_PARTS: PartName[] = [
  'Case',
  'Motherboard',
  'PSU',
  'GPU',
  'CPU',
  'Cooler',
  'RAM',
  'SSD',
];

/** Nazwa pliku → ścieżka serwowana z public/. */
export const modelUrl = (file: string): string => `/models/${file}`;

async function fetchCatalog(): Promise<CatalogData> {
  const [catalog, assembly, supplementary] = await Promise.all([
    fetch('/models/catalog.json').then(
      (r) => r.json() as Promise<{ parts: Record<string, CatalogPart> }>,
    ),
    fetch('/models/assembly-manifest.json').then(
      (r) => r.json() as Promise<{ assets: Record<string, AssemblyAsset> }>,
    ),
    fetch('/models/supplementary-manifest.json').then(
      (r) => r.json() as Promise<{ assets: Record<string, InspectAsset> }>,
    ),
  ]);

  // Klucze w assembly-manifest są po nazwie pliku; indeksujemy po partId.
  const assemblyByPart = new Map<string, AssemblyAsset>();
  for (const asset of Object.values(assembly.assets)) {
    assemblyByPart.set(asset.partId, asset);
  }

  // Pivot/bounds po nazwie pliku — z obu manifestów (montaż + warianty).
  const inspectByFile = new Map<string, InspectInfo>();
  for (const a of Object.values(assembly.assets)) {
    inspectByFile.set(a.file, { pivot: a.inspection_pivot, bounds: a.bounds_gltf });
  }
  for (const a of Object.values(supplementary.assets)) {
    inspectByFile.set(a.file, { pivot: a.inspection_pivot, bounds: a.bounds_gltf });
  }

  const assemblyModelUrls = ASSEMBLY_PARTS.map((p) => assemblyByPart.get(p)?.file)
    .filter((f): f is string => Boolean(f))
    .map(modelUrl);

  for (const url of assemblyModelUrls) useGLTF.preload(url);

  return { parts: catalog.parts, assemblyByPart, assemblyModelUrls, inspectByFile };
}

// Prosty cache z Suspense: useCatalog() rzuca promisem póki dane się ładują.
let cache: CatalogData | null = null;
let pending: Promise<CatalogData> | null = null;

export function useCatalog(): CatalogData {
  if (cache) return cache;
  if (!pending) {
    pending = fetchCatalog().then((d) => {
      cache = d;
      return d;
    });
  }
  throw pending;
}

export function getVariants(data: CatalogData, part: PartName): Variant[] {
  return data.parts[part]?.variants ?? [];
}

/**
 * Warianty części z WŁASNYM modelem 3D (dedup po pliku). id/label bierzemy z
 * parts.ts.types (kuratorowana treść), dopasowując po id — to godzi różnice w
 * nazewnictwie między catalog.json a parts.ts (np. dysk sata ↔ sata-ssd).
 */
export function getVariantModels(data: CatalogData, part: PartName): VariantModel[] {
  const cat = data.parts[part];
  if (!cat) return [];
  const types = parts[part]?.types ?? [];
  const out: VariantModel[] = [];
  const seen = new Set<string>();
  for (const v of cat.variants) {
    if (seen.has(v.model)) continue;
    const info = data.inspectByFile.get(v.model);
    if (!info) continue;
    seen.add(v.model);
    const type = types.find(
      (t) => t.id === v.id || t.id.startsWith(`${v.id}-`) || v.id.startsWith(`${t.id}-`),
    );
    out.push({
      id: type?.id ?? v.id,
      label: type?.name ?? v.label,
      file: v.model,
      pivot: info.pivot,
      bounds: info.bounds,
    });
  }
  return out;
}

/** Nie-suspendujący dostęp do cache katalogu (dla DOM poza Canvas, np. panelu). */
export function getCachedCatalog(): CatalogData | null {
  return cache;
}

export const centerOf = (b: [Vec3, Vec3]): Vec3 => [
  (b[0][0] + b[1][0]) / 2,
  (b[0][1] + b[1][1]) / 2,
  (b[0][2] + b[1][2]) / 2,
];

export const sizeOf = (b: [Vec3, Vec3]): Vec3 => [
  b[1][0] - b[0][0],
  b[1][1] - b[0][1],
  b[1][2] - b[0][2],
];

/** Środek bounding-boxa — target dla OrbitControls / fokusu kamery. */
export function boundsCenter(a: AssemblyAsset): Vec3 {
  return centerOf(a.bounds_gltf);
}

/** Rozmiar bounding-boxa — do dobrania dystansu kamery. */
export function boundsSize(a: AssemblyAsset): Vec3 {
  return sizeOf(a.bounds_gltf);
}

/** Układ rzędu wariantów wzdłuż Z. null = część ma <2 modeli wariantów. */
export interface RowLayout {
  models: VariantModel[];
  positionsZ: number[]; // pozycja Z środka każdego wariantu
  rowDepth: number; // rozpiętość rzędu wzdłuż Z
  maxHeight: number; // najwyższy model (Y) — do kadrowania
  y: number; // wysokość rzędu
}

export function variantRowLayout(data: CatalogData, part: PartName): RowLayout | null {
  const models = getVariantModels(data, part);
  if (models.length < 2) return null;
  const foot = models.map((m) => {
    const s = sizeOf(m.bounds);
    return Math.max(s[0], s[2]); // obrys w płaszczyźnie podłogi
  });
  const spacing = Math.max(...foot) + ROW_GAP;
  const n = models.length;
  const positionsZ = models.map((_, i) => (i - (n - 1) / 2) * spacing);
  const rowDepth = (n - 1) * spacing + Math.max(...foot);
  const maxHeight = Math.max(...models.map((m) => sizeOf(m.bounds)[1]));
  return { models, positionsZ, rowDepth, maxHeight, y: ROW_Y };
}
