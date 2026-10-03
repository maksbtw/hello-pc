// Kontrakt API — ten sam kształt co rekordy Javy w backendzie i mock JSON.
// Step to unia rozróżniana polem "id".

export type Level = 'noob' | 'expert';

export interface MouseStep {
  id: 'mouse';
  component: 'mouse';
  bytes: number[]; // 4
  labels: string[]; // 4
}

export interface SsdStep {
  id: 'ssd';
  component: 'ssd';
  bytes: number[];
  highlight: [number, number];
}

export interface RamStep {
  id: 'ram';
  component: 'ram';
  rows: { address: string; bytes: number[] }[];
  highlight: [number, number];
}

export interface CpuDecodeStep {
  id: 'cpu-decode';
  component: 'cpu';
  instructions: { address: string; bytes: number[]; asm: string }[];
  currentIndex: number;
}

export interface TextEncodeStep {
  id: 'text-encode';
  component: 'cpu';
  chars: { char: string; bytes: number[]; binary: string[] }[];
}

export interface RasterStep {
  id: 'raster';
  component: 'gpu';
  width: number;
  height: number;
  pixels: number[][]; // 0/1
}

export interface DisplayStep {
  id: 'display';
  component: 'monitor';
  width: number;
  height: number;
  sample: { x: number; y: number; rgb: [number, number, number] }[];
}

export type Step =
  | MouseStep
  | SsdStep
  | RamStep
  | CpuDecodeStep
  | TextEncodeStep
  | RasterStep
  | DisplayStep;

export interface SimulationResponse {
  input: string;
  steps: Step[];
}
