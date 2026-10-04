import type {
  SimulationResponse,
  Step,
  SsdStep,
  RamStep,
  CpuDecodeStep,
  TextEncodeStep,
  RasterStep,
  DisplayStep,
  MouseStep,
} from '../types/api';

/**
 * Symulacja liczona w całości na froncie — nie ma zależności od backendu.
 * Każdy krok dostaje dane wyprowadzone wprost z wpisanego tekstu (ASCII/UTF-8).
 * (Widoki i tak liczą większość rzeczy z `text` w store; to jest spójny kontrakt.)
 */

export interface SimulationResult {
  data: SimulationResponse;
  usedFallback: boolean;
}

const enc = new TextEncoder();
const hex4 = (n: number) => '0x' + n.toString(16).toUpperCase().padStart(4, '0');
const bin8 = (n: number) => n.toString(2).padStart(8, '0');

/** Buduje pełną, poprawną odpowiedź symulacji z samego tekstu. */
export function buildSimulation(text: string): SimulationResponse {
  const input = text || 'Hello';
  const chars = [...input];
  const bytes = Array.from(enc.encode(input));

  const mouse: MouseStep = {
    id: 'mouse',
    component: 'mouse',
    bytes: [0, 0, 0, 0],
    labels: ['dx', 'dy', 'buttons', 'wheel'],
  };

  const ssd: SsdStep = {
    id: 'ssd',
    component: 'ssd',
    bytes,
    highlight: [0, bytes.length],
  };

  const rows: RamStep['rows'] = [];
  for (let i = 0; i < bytes.length; i += 4) {
    rows.push({ address: hex4(i), bytes: bytes.slice(i, i + 4) });
  }
  const ram: RamStep = { id: 'ram', component: 'ram', rows, highlight: [0, bytes.length] };

  const cpu: CpuDecodeStep = {
    id: 'cpu-decode',
    component: 'cpu',
    instructions: chars.map((ch, i) => ({
      address: hex4(i * 4),
      bytes: [184, enc.encode(ch)[0] ?? 0, 0, 0],
      asm: `MOV AX, '${ch}'`,
    })),
    currentIndex: 0,
  };

  const textEncode: TextEncodeStep = {
    id: 'text-encode',
    component: 'cpu',
    chars: chars.map((ch) => {
      const b = Array.from(enc.encode(ch));
      return { char: ch, bytes: b, binary: b.map(bin8) };
    }),
  };

  // Raster/Display widoki rysują własny obraz z tekstu (canvas) — tu tylko
  // poprawny, minimalny kształt zgodny z typami.
  const raster: RasterStep = { id: 'raster', component: 'gpu', width: 0, height: 0, pixels: [] };
  const display: DisplayStep = {
    id: 'display',
    component: 'monitor',
    width: 0,
    height: 0,
    sample: [],
  };

  const steps: Step[] = [mouse, ssd, ram, cpu, textEncode, raster, display];
  return { input, steps };
}

/** Zachowany podpis async dla wygody wywołań — liczymy lokalnie, bez sieci. */
export async function postSimulation(text: string): Promise<SimulationResult> {
  return { data: buildSimulation(text), usedFallback: false };
}

/**
 * Pyta lokalny model (/api/ask) o wybrany komponent. Rzuca przy błędzie —
 * UI pokazuje komunikat (nie ma sensownego mocka dla swobodnego pytania).
 */
export async function postAsk(question: string): Promise<string> {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = (await res.json()) as { message?: string };
  if (!body.message) throw new Error('Pusta odpowiedź');
  return body.message;
}

export async function getHealth(): Promise<boolean> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return false;
    const body = (await res.json()) as { status?: string };
    return body.status === 'ok';
  } catch {
    return false;
  }
}
