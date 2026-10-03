// Warstwa danych modeli 3D. Czyta catalog.json + assembly-manifest.json
// SERWOWANE z public/models/ (fetch w runtime — importu z public/ Vite nie
// wspiera). Daje scenie Explore listę klikalnych części montażu, URL-e modeli,
// warianty oraz pivoty/bounds do fokusu kamery. Ładowanie przez Suspense.
import { useGLTF } from '@react-three/drei';
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

/** Gotowe dane katalogu dla sceny. */
export interface CatalogData {
  parts: Record<string, CatalogPart>;
  assemblyByPart: Map<string, AssemblyAsset>;
  assemblyModelUrls: string[];
}

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
  const [catalog, assembly] = await Promise.all([
    fetch('/models/catalog.json').then(
      (r) => r.json() as Promise<{ parts: Record<string, CatalogPart> }>,
    ),
    fetch('/models/assembly-manifest.json').then(
      (r) => r.json() as Promise<{ assets: Record<string, AssemblyAsset> }>,
    ),
  ]);

  // Klucze w assembly-manifest są po nazwie pliku; indeksujemy po partId.
  const assemblyByPart = new Map<string, AssemblyAsset>();
  for (const asset of Object.values(assembly.assets)) {
    assemblyByPart.set(asset.partId, asset);
  }

  const assemblyModelUrls = ASSEMBLY_PARTS.map((p) => assemblyByPart.get(p)?.file)
    .filter((f): f is string => Boolean(f))
    .map(modelUrl);

  for (const url of assemblyModelUrls) useGLTF.preload(url);

  return { parts: catalog.parts, assemblyByPart, assemblyModelUrls };
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

/** Środek bounding-boxa — target dla OrbitControls / fokusu kamery. */
export function boundsCenter(a: AssemblyAsset): Vec3 {
  const [min, max] = a.bounds_gltf;
  return [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
}

/** Rozmiar bounding-boxa — do dobrania dystansu kamery. */
export function boundsSize(a: AssemblyAsset): Vec3 {
  const [min, max] = a.bounds_gltf;
  return [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
}
