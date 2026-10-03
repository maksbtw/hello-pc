// Warstwa danych modeli 3D. Typuje catalog.json + assembly-manifest.json
// (z public/models/) i daje scenie Explore gotowe wejścia: listę klikalnych
// części montażu, URL-e modeli, warianty oraz pivoty/bounds do fokusu kamery.
import { useGLTF } from '@react-three/drei';
import type { PartName } from '../data/parts';

import catalogJson from '../../public/models/catalog.json';
import assemblyJson from '../../public/models/assembly-manifest.json';

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

// Rzut przez unknown: import JSON wnioskuje number[], a my chcemy krotki Vec3.
const catalog = catalogJson as unknown as { parts: Record<string, CatalogPart> };
const assembly = assemblyJson as unknown as { assets: Record<string, AssemblyAsset> };

// Klucze w assembly-manifest są po nazwie pliku; indeksujemy po partId.
const assemblyByPart = new Map<string, AssemblyAsset>();
for (const asset of Object.values(assembly.assets)) {
  assemblyByPart.set(asset.partId, asset);
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

export function getAssembly(part: PartName): AssemblyAsset | undefined {
  return assemblyByPart.get(part);
}

export function getCatalogPart(part: PartName): CatalogPart | undefined {
  return catalog.parts[part];
}

export function getVariants(part: PartName): Variant[] {
  return catalog.parts[part]?.variants ?? [];
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

/** URL-e 8 modeli montażowych (render sceny + preload). */
export const assemblyModelUrls: string[] = ASSEMBLY_PARTS.map(
  (p) => assemblyByPart.get(p)?.file,
)
  .filter((f): f is string => Boolean(f))
  .map(modelUrl);

/** Wczesne wczytanie modeli montażu, zanim scena się zamontuje. */
export function preloadAssembly(): void {
  for (const url of assemblyModelUrls) useGLTF.preload(url);
}
